'use strict';

/**
 * MarkLogicQueryConnector.js - Query processing logic for the ADC Query Callout.
 *
 * This file handles:
 * - Loading query definition documents from MarkLogic (queryName + steps format)
 * - Executing query steps sequentially (like Java ADC SEQUENCE)
 * - For each step: infer bindings, resolve placeholders, rewrite SQL, execute, write results to WM
 * - Later steps can reference results written by earlier steps
 * - Deferred nested writes: when a later step targets entities produced by an
 *   earlier step (via foreignKey/parentKey), the producing step's WM write is
 *   deferred so the consuming step can merge its rows as nested associations
 *   and flush the entire hierarchy in one addAssociationsToEntity call
 *
 * @module MarkLogicQueryConnector
 */

var Lib                 = require('./MarkLogicQueryLibrary');
var QueryRegistry       = Lib.QueryRegistry;
var PlaceholderResolver = Lib.PlaceholderResolver;
var SqlRewriter         = Lib.SqlRewriter;
var OpticExecutor       = Lib.OpticExecutor;
var DebugLogger         = Lib.DebugLogger;
var Validators          = Lib.Validators;
var BindingInferrer     = Lib.BindingInferrer;

// ============================================================================
// parseQueryDef - extract queryName and steps from the loaded document
// ============================================================================

/**
 * Parses a raw query definition document and extracts the canonical fields.
 *
 * Expected format:
 *   { queryName: "...", steps: [ { sequenceNo, statement, ... }, ... ] }
 *
 * @param {Object} raw     - Raw parsed query definition document.
 * @param {string} traceId - Trace identifier for error context.
 * @returns {Object} Parsed { queryName, steps, _uri }
 * @throws {Error} If the document does not have the required queryName + steps structure.
 */
function parseQueryDef(raw, traceId) {
    if (!raw || !raw.queryName) {
        throw new Error('[' + traceId + '] Query definition must have a "queryName" field');
    }
    if (!raw.steps || !Array.isArray(raw.steps) || raw.steps.length === 0) {
        throw new Error('[' + traceId + '] Query definition "' + raw.queryName + '" must have a non-empty "steps" array');
    }
    return {
        queryName: raw.queryName,
        steps: raw.steps,
        _uri: raw._uri || null
    };
}

// ============================================================================
// prepareStep - prepare a single step for execution
// ============================================================================

/**
 * Prepares a single query step: infers bindings, validates SQL, resolves
 * placeholders, rewrites SQL, and derives Corticon integration fields.
 *
 * @param {Object} step           - A single step from the steps array.
 * @param {Object} payload        - Current Corticon working memory snapshot.
 * @param {Object} config         - Normalized SCO config.
 * @param {Object} debugLog       - Debug logger instance.
 * @param {Object} corticonLogger - Corticon logger.
 * @param {number} stepIndex      - 0-based step index (for logging).
 * @returns {Object|null} Prepared step metadata, or null if step should be skipped.
 */
function prepareStep(step, payload, config, debugLog, corticonLogger, stepIndex) {
    var stepLabel = 'Step ' + (stepIndex + 1) + ' (seq ' + (step.sequenceNo != null ? step.sequenceNo : '?') + ')';

    // --- Enable check (skip if false or null; omitted/undefined defaults to enabled) ---
    if (step.enable === false || step.enable === null) {
        corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Disabled, skipping');
        debugLog.log('info', stepLabel + ' disabled, skipping');
        return null;
    }

    var statementType = (step.statementType || 'select').toLowerCase();
    var WRITE_TYPES = ['insert', 'update', 'upsert'];
    var isWriteStep = WRITE_TYPES.indexOf(statementType) !== -1;

    // ── WRITE STEP (insert / update / upsert) ──────────────────────────────────
    if (isWriteStep) {
        try {
            corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Preparing write step (' + statementType + ')');
            Validators.validateWriteStep(step, config.traceId);
            var writeCollections = Array.isArray(step.collections) ? step.collections : [];
            corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel +
                ' - Write step config: addToExistingEntity: ' + step.addToExistingEntity.trim() +
                (step.roleName ? ', roleName: ' + step.roleName.trim() : '') +
                ', uriTemplate: ' + step.documentUriTemplate.trim() +
                ', collections: [' + writeCollections.join(', ') + ']');
            debugLog.log('info', stepLabel + ' write step config', {
                statementType:       statementType,
                addToExistingEntity: step.addToExistingEntity.trim(),
                roleName:            step.roleName ? step.roleName.trim() : null,
                documentUriTemplate: step.documentUriTemplate.trim(),
                collections:         writeCollections
            });
            return {
                stepIndex:            stepIndex,
                sequenceNo:           step.sequenceNo != null ? step.sequenceNo : (stepIndex + 1),
                queryName:            config.queryName || null,
                statementType:        statementType,
                addToExistingEntity:  step.addToExistingEntity.trim(),
                roleName:             step.roleName ? step.roleName.trim() : null,
                documentUriTemplate:  step.documentUriTemplate.trim(),
                collections:          Array.isArray(step.collections) ? step.collections : [],
                // SELECT-only fields — not applicable for write steps
                preparedSQL:          null,
                bindings:             [],
                bindValues:           {},
                maxRows:              null,
                qualifier:            null,
                addAsTopLevelEntity:  null,
                foreignKey:           null,
                parentKey:            null
            };
        } catch (error) {
            corticonLogger.logError('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Prepare failed: ' + error.message);
            throw new Error('[' + config.traceId + '] ' + stepLabel + ' - Prepare failed: ' + error.message);
        }
    }

    // ── SELECT STEP ────────────────────────────────────────────────────────────
    // --- Validate statement ---
    if (!step.statement || typeof step.statement !== 'string') {
        throw new Error('[' + config.traceId + '] ' + stepLabel + ' - missing "statement"');
    }

    try {
        corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Preparing');

        // --- Auto-infer or merge bindings ---
        var inferredBindings = BindingInferrer.inferBindings(step.statement, config.traceId);
        var bindings;
        if (!step.bindings || !Array.isArray(step.bindings) || step.bindings.length === 0) {
            bindings = inferredBindings;
            debugLog.log('info', stepLabel + ' auto-inferred ' + inferredBindings.length + ' binding(s)');
        } else {
            bindings = BindingInferrer.mergeBindings(step.bindings, inferredBindings);
            debugLog.log('info', stepLabel + ' merged user bindings with inferred defaults');
        }

        // --- Validate SQL ---
        Validators.validateSelectOnly(step.statement, config.traceId);
        if (step.allowedViews && step.allowedViews.length > 0) {
            Validators.validateAllowedViews(step.statement, step.allowedViews, config.traceId);
        }

        // --- Resolve bind values from WM payload ---
        var bindValues = PlaceholderResolver.resolveBindings(bindings, payload, config.traceId);
        corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Resolved ' + bindings.length + ' placeholder(s)');

        // --- Short-circuit if no usable bindings in WM ---
        if (shouldShortCircuit(bindings, bindValues, config.traceId, debugLog)) {
            corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Short-circuit: no usable binding values in working memory; step skipped');
            debugLog.log('info', stepLabel + ' short-circuit: no usable binding values in working memory');
            return null;
        }

        // --- Rewrite SQL ---
        var preparedSQL = SqlRewriter.rewrite(step.statement, bindings, config.traceId);
        Validators.validateBindingConsistency(preparedSQL, bindings, config.traceId);
        corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - SQL: ' + normalizeSql(preparedSQL).substring(0, 200));

        // --- maxRows ---
        var rawMaxRows = step.maxRows || null;
        var maxRows = Validators.validateMaxRows(rawMaxRows, config.traceId);

        // --- Qualifier (auto-derive from SQL if not specified) ---
        var qualifier = step.qualifier || BindingInferrer.inferQualifier(step.statement) || null;

        // --- Corticon integration fields ---
        var addAsTopLevelEntity  = step.addAsTopLevelEntity  || null;
        var addToExistingEntity  = step.addToExistingEntity  || null;
        var roleName             = step.roleName             || 'results';
        var foreignKey           = step.foreignKey           || null;
        var parentKey            = step.parentKey            || null;

        return {
            stepIndex: stepIndex,
            sequenceNo: step.sequenceNo != null ? step.sequenceNo : (stepIndex + 1),
            queryName: config.queryName || null,
            statementType: 'select',
            preparedSQL: preparedSQL,
            bindings: bindings,
            bindValues: bindValues,
            maxRows: maxRows,
            qualifier: qualifier,
            addAsTopLevelEntity: addAsTopLevelEntity,
            addToExistingEntity: addToExistingEntity,
            roleName: roleName,
            foreignKey: foreignKey,
            parentKey: parentKey
        };
    } catch (error) {
        corticonLogger.logError('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Prepare failed: ' + error.message);
        throw new Error('[' + config.traceId + '] ' + stepLabel + ' - Prepare failed: ' + error.message);
    }
}

// ============================================================================
// executeStep - execute a prepared step via Optic
// ============================================================================

/**
 * Executes a single prepared step.
 *
 * @param {Object} prepared       - Prepared step metadata from prepareStep().
 * @param {Object} payload        - Current working memory snapshot (for write-step entity lookup).
 * @param {Object} config         - Normalized SCO config.
 * @param {Object} debugLog       - Debug logger.
 * @param {Object} corticonLogger - Corticon logger.
 * @returns {Object|Array} execResult object (write steps) or array of row objects (select steps).
 */
function executeStep(prepared, payload, config, debugLog, corticonLogger) {
    var stepLabel = 'Step ' + (prepared.stepIndex + 1) + ' (seq ' + prepared.sequenceNo + ')';
    var WRITE_TYPES = ['insert', 'update', 'upsert'];
    var isWriteStep = WRITE_TYPES.indexOf(prepared.statementType) !== -1;

    // === WRITE STEP — document insert/update/upsert ===
    if (isWriteStep) {
        corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Executing document write (' +
            prepared.statementType + ') addToExistingEntity: ' + prepared.addToExistingEntity +
            (prepared.roleName ? ', roleName: ' + prepared.roleName : ''));
        debugLog.startTimer('execute_step_' + prepared.stepIndex);

        // Collect entity objects from payload
        var entitiesToWrite = collectEntities(prepared, payload, config.traceId, debugLog, stepLabel);

        if (entitiesToWrite.length === 0) {
            var skipMs = debugLog.endTimer('execute_step_' + prepared.stepIndex);
            corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel +
                ' - No entities found in working memory for "' + prepared.addToExistingEntity +
                (prepared.roleName ? '.' + prepared.roleName : '') + '"; write step skipped');
            debugLog.log('info', stepLabel + ' write skipped: no entities in WM');
            return { rows: [], rowCount: 0, documentsWritten: 0, uris: [], isWrite: true, skipped: true };
        }

        corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Collected ' +
            entitiesToWrite.length + ' entity/entities (' + prepared.addToExistingEntity +
            (prepared.roleName ? '.' + prepared.roleName : '') + ') for ' + prepared.statementType);
        debugLog.log('info', stepLabel + ' writing ' + entitiesToWrite.length + ' entity/entities via ' +
            prepared.statementType + ' | addToExistingEntity: ' + prepared.addToExistingEntity +
            (prepared.roleName ? ', roleName: ' + prepared.roleName : '') +
            ' | uriTemplate: ' + prepared.documentUriTemplate);

        var writeResult;
        try {
            writeResult = OpticExecutor.executeDocumentWrite(entitiesToWrite, prepared, config.traceId);
        } catch (error) {
            debugLog.endTimer('execute_step_' + prepared.stepIndex);
            corticonLogger.logError('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Document write error: ' + error.message);
            throw error;
        }
        var writeMs = debugLog.endTimer('execute_step_' + prepared.stepIndex);

        corticonLogger.logDebug('*** ADC [' + config.traceId + '] ' + stepLabel + ' - Write: ' + writeMs + 'ms | ' +
            writeResult.documentsWritten + ' document(s) written');
        debugLog.log('info', stepLabel + ' Write: ' + writeMs + 'ms | ' +
            writeResult.documentsWritten + ' document(s) written', { uris: writeResult.uris });

        return {
            rows: [],
            rowCount: 0,
            documentsWritten: writeResult.documentsWritten,
            uris: writeResult.uris,
            isWrite: true
        };
    }

    // === SELECT STEP ===
    var debugSQL = buildDebugSQL(prepared.preparedSQL, prepared.bindValues);
    corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - SQL with values: ' + debugSQL);
    debugLog.log('info', stepLabel + ' SQL with values', { sql: debugSQL });

    // === Execute via Optic ===
    corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Executing via Optic API');
    debugLog.startTimer('execute_step_' + prepared.stepIndex);
    var execResult;
    try {
        execResult = OpticExecutor.execute(
            prepared.preparedSQL,
            prepared.qualifier,
            prepared.bindValues,
            prepared.maxRows,
            config.traceId
        );
    } catch (error) {
        debugLog.endTimer('execute_step_' + prepared.stepIndex);
        corticonLogger.logError('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Execute error: ' + error.message);
        throw error;
    }
    var sqlMs = debugLog.endTimer('execute_step_' + prepared.stepIndex);

    // Guard against unexpected null/malformed result from Optic
    if (!execResult || !Array.isArray(execResult.rows)) {
        corticonLogger.logError('*** MarkLogicQueryConnector.js -> ' + stepLabel + ' - Optic returned unexpected result format');
        return [];
    }

    corticonLogger.logDebug('*** ADC [' + config.traceId + '] ' + stepLabel + ' - SQL: ' + sqlMs + 'ms | ' + execResult.rowCount + ' row(s)');
    debugLog.log('info', stepLabel + ' SQL: ' + sqlMs + 'ms | ' + execResult.rowCount + ' row(s)');

    return execResult.rows;
}

// ============================================================================
// executeQuerySet - main entry point for multi-step execution
// ============================================================================

/**
 * Executes a complete query set: loads the query definition, normalizes it,
 * then iterates through each step sequentially. For each step:
 *   1. Snapshot current working memory (so step N+1 sees step N's results)
 *   2. Prepare step (infer bindings, resolve placeholders, rewrite SQL)
 *   3. Execute step via Optic
 *   4. Write results to Corticon working memory
 *
 * This mirrors the Java ADC's sequential SEQUENCE execution and the sample
 * SCO's pattern of returning metadata + results per query function.
 *
 * @param {Object} corticonDataManager      - Corticon data manager instance.
 * @param {Object} serviceCalloutProperties - SCO properties from Corticon Studio.
 * @param {Object} corticonLogger           - Corticon logger instance.
 * @param {Function} writeResultsFn         - Callback to write results to WM:
 *                                            writeResultsFn(results, stepMeta, corticonDataManager, logger)
 * @returns {Object} Summary { queryName, stepsExecuted, totalRows, debugLogger, config }
 */
function executeQuerySet(corticonDataManager, serviceCalloutProperties, corticonLogger, writeResultsFn) {
    var config = buildConfig(serviceCalloutProperties);
    var debugLog = DebugLogger.createLogger(config.traceId, config.debug);

    debugLog.log('info', 'Start query set callout', { queryName: config.queryName, queryUri: config.queryUri });
    corticonLogger.logDebug('*** ADC [' + config.traceId + '] START queryName: ' + (config.queryName || config.queryUri));
    debugLog.startTimer('total');

    try {
        // === Load query definition ===
        debugLog.startTimer('loadQuery');
        var rawDef = QueryRegistry.getQueryDefinition({
            queryName: config.queryName,
            queryUri: config.queryUri
        }, config.traceId);
        debugLog.endTimer('loadQuery');

        // === Parse and validate query definition ===
        var querySet = parseQueryDef(rawDef, config.traceId);
        corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> executeQuerySet - Loaded query set: "' + querySet.queryName + '" with ' + querySet.steps.length + ' step(s)');
        debugLog.log('info', 'Loaded query set', { queryName: querySet.queryName, stepCount: querySet.steps.length });
        debugLog.updateDebugBlock({ queryName: querySet.queryName, queryDocUri: querySet._uri, stepCount: querySet.steps.length });

        var totalRows = 0;
        var stepsExecuted = 0;

        // Tracks associations written by each step, keyed by "ParentType.roleName".
        // Injected into subsequent steps' payload snapshots so paths like
        // {Products.routingOperations.ID} resolve correctly against freshly-added
        // associations (Corticon entity objects don't expose associations as plain
        // bracket-accessible properties — they require getAssociationsForEntity).
        var writtenCache = {};

        // === Sort steps by sequenceNo before execution ===
        var sortedSteps = querySet.steps.slice().sort(function (a, b) {
            var seqA = a.sequenceNo != null ? a.sequenceNo : Infinity;
            var seqB = b.sequenceNo != null ? b.sequenceNo : Infinity;
            return seqA - seqB;
        });

        // === Look-ahead: identify producing steps whose write must be deferred ===
        // When a later step uses foreignKey + parentKey to target entities
        // produced by an earlier step, the earlier step must DEFER its write
        // to Corticon working memory.  Entities created via
        // addAssociationsToEntity are not retrievable as live refs (neither
        // getEntitiesByType nor getAssociationsForEntity returns usable refs).
        // By deferring, the consuming step can merge its child rows INTO the
        // producing step's cached rows as nested association payloads and
        // write everything via a single addAssociationsToEntity call on the
        // grandparent — Corticon handles nested associations correctly.
        var deferWrite = {};
        for (var la = 0; la < sortedSteps.length; la++) {
            var laStep = sortedSteps[la];
            // Skip disabled consuming steps — they will never run, so no deferral is needed
            if (laStep.enable === false || laStep.enable === null) { continue; }
            if (laStep.foreignKey && laStep.parentKey && laStep.addToExistingEntity) {
                var laTarget = laStep.addToExistingEntity.toLowerCase();
                for (var lp = 0; lp < la; lp++) {
                    // Skip disabled producing steps — they will never write, so no deferral applies
                    if (sortedSteps[lp].enable === false || sortedSteps[lp].enable === null) { continue; }
                    var lpRole = sortedSteps[lp].roleName;
                    if (lpRole && lpRole.toLowerCase() === laTarget) {
                        deferWrite[lp] = true;
                        debugLog.log('info', 'Look-ahead: step ' + (lp + 1) +
                            ' (roleName "' + lpRole + '") will DEFER its write because step ' +
                            (la + 1) + ' targets it with foreignKey "' + laStep.foreignKey +
                            '" / parentKey "' + laStep.parentKey + '"');
                        break;
                    }
                }
            }
        }

        // === Execute each step sequentially ===
        for (var i = 0; i < sortedSteps.length; i++) {
            var step = sortedSteps[i];

            // Snapshot current working memory for placeholder resolution;
            // writtenCache enriches it with associations added by previous steps.
            var payload = extractPayload(corticonDataManager, corticonLogger, writtenCache);

            // Prepare step
            var prepared = prepareStep(step, payload, config, debugLog, corticonLogger, i);
            if (prepared === null) {
                // Step disabled or short-circuited — no SQL executed.
                // Still call writeResultsFn with 0 rows so the writtenCache entry is
                // seeded as an empty array.  Without this, a downstream FK step that
                // looks for this step's type in the cache finds NO entry and fires a
                // misleading QUERY DEFINITION ERROR when the real issue is just that
                // this step's SQL bindings couldn't resolve (normal data condition when
                // the parent entity is out of scope, e.g. in a different branch).
                if (writeResultsFn) {
                    // Build a minimal prepared-like object from the raw step definition
                    // so writeResultsFn can seed the cache under the correct key.
                    var skippedPrepared = {
                        stepIndex:           i,
                        sequenceNo:          step.sequenceNo || (i + 1),
                        queryName:           config.queryName || null,
                        statementType:       step.statementType || 'select',
                        addToExistingEntity: step.addToExistingEntity || null,
                        addAsTopLevelEntity: step.addAsTopLevelEntity || null,
                        roleName:            step.roleName || 'results',
                        foreignKey:          step.foreignKey || null,
                        parentKey:           step.parentKey || null,
                        deferWrite:          !!deferWrite[i]
                    };
                    writeResultsFn([], skippedPrepared, corticonDataManager, corticonLogger, writtenCache);
                }
                continue;
            }

            // Augment with deferred-write flag from look-ahead
            if (deferWrite[i]) {
                prepared.deferWrite = true;
            }

            // Execute step
            var stepStartMs = Date.now();
            var stepResult = executeStep(prepared, payload, config, debugLog, corticonLogger);

            // For write steps, stepResult is { rows:[], rowCount:0, documentsWritten:N, uris:[], isWrite:true }
            // For select steps, stepResult is an array of row objects.
            var rows;
            var isWriteStep = prepared.isWrite || (stepResult && stepResult.isWrite);
            if (isWriteStep) {
                rows = [];
                var docsWritten = stepResult && stepResult.documentsWritten !== undefined ? stepResult.documentsWritten : 0;
                corticonLogger.logDebug('*** ADC [' + config.traceId + '] Step ' + (i + 1) +
                    ' (seq ' + prepared.sequenceNo + ') - Document write completed: ' + docsWritten + ' document(s)');
            } else {
                rows = Array.isArray(stepResult) ? stepResult : [];
            }
            totalRows += rows.length;
            stepsExecuted++;

            // Write results to Corticon working memory so next step can reference them.
            // Write steps produce no rows — skip writeResultsFn entirely for them.
            // IMPORTANT: call writeResultsFn even for 0-row results — NOT skipping it.
            // If we skip it, the writtenCache entry for this step is never seeded (even
            // as an empty array). A downstream step that uses foreignKey+parentKey to
            // look up this step's type in the cache then finds NO entry at all, and
            // fires a misleading "QUERY DEFINITION ERROR" when the real problem is that
            // this step returned 0 rows (e.g. due to an empty SQL binding from a failed
            // prior SCO call — a data dependency cascade, not a config error).
            var writeMs = 0;
            if (!isWriteStep && writeResultsFn) {
                var writeStart = Date.now();
                writeResultsFn(rows, prepared, corticonDataManager, corticonLogger, writtenCache);
                writeMs = Date.now() - writeStart;
            }

            var stepTotalMs = Date.now() - stepStartMs;
            var stepTimingMsg = 'Step ' + (i + 1) + ' (seq ' + prepared.sequenceNo +
                ') - Write: ' + writeMs + 'ms | Step total: ' + stepTotalMs + 'ms | ' + rows.length + ' row(s)';
            corticonLogger.logDebug('*** ADC [' + config.traceId + '] ' + stepTimingMsg);
            debugLog.log('info', stepTimingMsg);

            debugLog.updateDebugBlock({
                ['step_' + (i + 1) + '_seq']: prepared.sequenceNo,
                ['step_' + (i + 1) + '_rows']: rows.length,
                ['step_' + (i + 1) + '_ms']: stepTotalMs
            });
        }

        // === Finalize ===
        if (config.debug) {
            var finalPayload = extractPayload(corticonDataManager, corticonLogger);
            debugLog.attachDebugBlock(finalPayload, config.debugPath);
        }

        var totalMs = debugLog.endTimer('total');
        var allTimings = debugLog.getTimings();
        var loadMs = allTimings.loadQuery !== undefined ? allTimings.loadQuery : -1;

        var completedMsg = 'COMPLETED in ' + totalMs + 'ms (load: ' + loadMs + 'ms, ' +
            stepsExecuted + ' step(s), ' + totalRows + ' row(s))';
        corticonLogger.logDebug('*** ADC [' + config.traceId + '] ' + completedMsg);
        debugLog.log('info', completedMsg);

        return {
            queryName: querySet.queryName,
            stepsExecuted: stepsExecuted,
            totalRows: totalRows,
            totalMs: totalMs,
            debugLogger: debugLog,
            config: config
        };

    } catch (error) {
        var errorMs = debugLog.endTimer('total');
        var failedMsg = 'FAILED after ' + errorMs + 'ms: ' + error.message;
        debugLog.log('error', failedMsg);
        corticonLogger.logError('*** ADC [' + config.traceId + '] ' + failedMsg);
        throw error;
    }
}

/**
 * Builds a normalized config object from serviceCalloutProperties.
 *
 * @param {Object} props - Raw service callout properties.
 * @returns {Object} Normalized config.
 */
function buildConfig(props) {
    props = props || {};

    // Fail early if neither query identifier is provided
    if (!props.queryName && !props.queryUri) {
        throw new Error(
            'Service callout properties must include either "queryName" or "queryUri" ' +
            'to identify the query definition document.'
        );
    }

    return {
        queryName: props.queryName || null,
        queryUri: props.queryUri || null,
        ruleProject: props.ruleProject || null,
        debug: props.debug === true || props.debug === 'true',
        traceId: props.traceId || generateTraceId(),
        debugPath: props.debugPath || 'Debug.QueryCallout'
    };
}

/**
 * Generates a simple trace ID for request correlation.
 * @returns {string}
 */
function generateTraceId() {
    return 'adc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
}

/**
 * Extracts the payload object from the Corticon data manager.
 *
 * Corticon entity objects returned by getEntitiesByType() expose scalar attributes
 * but NOT dynamically-added associations (those require getAssociationsForEntity).
 * The writtenCache parameter carries associations written by previous steps;
 * they are injected into the snapshot as overlay objects so paths like
 * {Products.routingOperations.ID} can be resolved in subsequent steps.
 *
 * @param {Object} corticonDataManager - Corticon data manager.
 * @param {Object} corticonLogger      - Corticon logger.
 * @param {Object} [writtenCache]      - Optional map of "ParentType.roleName" → rows[]
 *                                       accumulated from previous steps.
 * @returns {Object} Payload object with entity arrays keyed by type name.
 */
function extractPayload(corticonDataManager, corticonLogger, writtenCache) {
    var payload = {};

    try {
        if (!corticonDataManager || typeof corticonDataManager.getEntitiesByType !== 'function') {
            corticonLogger.logError('*** MarkLogicQueryConnector.js -> extractPayload - corticonDataManager is missing or invalid');
            return payload;
        }

        // Corticon.js returns Sets (not Arrays) — spread into Arrays for indexing
        var rawTypes = (typeof corticonDataManager.getEntityTypes === 'function')
            ? corticonDataManager.getEntityTypes()
            : [];
        var allTypes = rawTypes && typeof rawTypes[Symbol.iterator] === 'function'
            ? [].concat(Array.from(rawTypes))
            : [];

        if (allTypes && allTypes.length > 0) {
            for (var i = 0; i < allTypes.length; i++) {
                var typeName = allTypes[i];
                try {
                    var rawEntities = corticonDataManager.getEntitiesByType(typeName);
                    var entities = rawEntities && typeof rawEntities[Symbol.iterator] === 'function'
                        ? Array.from(rawEntities)
                        : [];
                    if (entities.length > 0) {
                        payload[typeName] = [];
                        for (var j = 0; j < entities.length; j++) {
                            payload[typeName].push(entities[j]);
                        }
                    }
                } catch (typeErr) {
                    corticonLogger.logError(
                        '*** MarkLogicQueryConnector.js -> extractPayload - Error reading entities for type "' +
                        typeName + '": ' + typeErr.message
                    );
                }
            }
        } else {
            corticonLogger.logDebug('*** MarkLogicQueryConnector.js -> extractPayload - No entity types found in working memory (may be first step)');
        }
    } catch (e) {
        corticonLogger.logError(
            '*** MarkLogicQueryConnector.js -> extractPayload - Could not enumerate entity types: ' +
            e.message + '. Returning empty payload snapshot.'
        );
    }

    // Inject written-step associations into the snapshot.
    // Without this, a path like {Products.routingOperations.ID} cannot traverse
    // associations that were added in a previous step, because Corticon entity
    // objects only expose scalar attributes — not associations — via bracket access.
    //
    // Strategy: for each "ParentType.roleName" entry in the cache, create a
    // lightweight overlay (Object.create(entity)) for each parent entity so that
    // entity[roleName] returns the cached rows without mutating the live WM object.
    if (writtenCache) {
        var cacheKeys = Object.keys(writtenCache);
        for (var ci = 0; ci < cacheKeys.length; ci++) {
            var cacheKey = cacheKeys[ci]; // e.g. "Products.routingOperations"
            var dotIdx   = cacheKey.lastIndexOf('.');
            if (dotIdx === -1) continue;
            var parentType = cacheKey.substring(0, dotIdx); // "Products"
            var roleName   = cacheKey.substring(dotIdx + 1); // "routingOperations"
            var cachedRows = writtenCache[cacheKey];
            if (!cachedRows || !cachedRows.length) continue;
            if (!payload[parentType] || !payload[parentType].length) continue;

            for (var ei = 0; ei < payload[parentType].length; ei++) {
                var baseEntity = payload[parentType][ei];
                // Always create an overlay with the cached raw SQL rows.
                // Corticon entity objects expose scalar attributes via bracket
                // access, but NOT associations (those require
                // getAssociationsForEntity which returns plain JSON, not live
                // refs). The raw SQL row objects are plain JS objects with
                // bracketed keys that the case-insensitive path resolver can
                // handle, enabling paths like {Products.routingOperations.ID}.
                // NOTE: Object.defineProperty bypasses the Proxy set trap.
                var overlay = Object.create(baseEntity);
                Object.defineProperty(overlay, roleName, {
                    value: cachedRows,
                    enumerable: true,
                    configurable: true,
                    writable: true
                });
                payload[parentType][ei] = overlay;
            }
        }
    }

    return payload;
}

/**
 * Checks if the step should short-circuit (be skipped) because there is
 * nothing useful to execute.
 *
 * Three conditions trigger a skip:
 *
 *   1. ANY "many" binding resolved to an empty array.
 *      An empty IN-clause would produce invalid SQL, so skip immediately.
 *
 *   2. ALL bindings (across both cardinalities) resolved to null or empty.
 *      This means no values came from working memory for any parameter,
 *      which typically means the relevant entities are not present in this
 *      execution.  Rather than running a query that will return nothing
 *      (because every parameter is NULL / empty), we skip gracefully.
 *      A step with zero bindings (parameterless query) is NOT affected.
 *
 *   3. MIXED resolution: at least one "one" binding has a non-null value
 *      AND at least one "one" binding resolved to null.
 *      SQL equality with NULL ("field = NULL") never matches any row; the
 *      binding is null because the referenced entity is absent from working
 *      memory (e.g. a DISC attribute binding when the product is a BELT).
 *      Skipping avoids a guaranteed-empty database round-trip.
 *
 * @param {Object[]} bindingsMeta - Binding metadata.
 * @param {Object}   bindValues   - Resolved bind values.
 * @param {string}   traceId      - Trace identifier.
 * @param {Object}   debugLog     - Debug logger.
 * @returns {boolean} True if the step should be skipped.
 */
function shouldShortCircuit(bindingsMeta, bindValues, traceId, debugLog) {
    if (!bindingsMeta || !Array.isArray(bindingsMeta) || bindingsMeta.length === 0) {
        // Parameterless step — always run it.
        return false;
    }

    var allEmpty     = true;   // tracks whether every binding resolved to nothing
    var hasResolved  = false;  // at least one "one" binding has a non-null value
    var hasNullSingle = false; // at least one "one" binding resolved to null
    var nullParam    = null;   // name of first null "one" binding (for logging)

    for (var i = 0; i < bindingsMeta.length; i++) {
        var meta = bindingsMeta[i];
        var val = bindValues[meta.param];

        if (meta.cardinality === 'many') {
            if (Array.isArray(val) && val.length === 0) {
                // Condition 1: empty IN-clause — skip immediately.
                debugLog.log('info', 'Short-circuit: empty array for IN-clause binding', {
                    param: meta.param, placeholder: meta.placeholder
                });
                return true;
            }
            // Non-empty array counts as "has a value".
            if (Array.isArray(val) && val.length > 0) {
                allEmpty = false;
            }
        } else {
            // cardinality "one"
            if (val !== null && val !== undefined) {
                allEmpty = false;
                hasResolved = true;
            } else {
                hasNullSingle = true;
                if (nullParam === null) { nullParam = meta.param; }
            }
        }
    }

    // Condition 2: every binding came back empty/null.
    if (allEmpty) {
        debugLog.log('info', 'Short-circuit: all bindings resolved to null/empty - no working memory values found for any placeholder', {
            bindingCount: bindingsMeta.length
        });
        return true;
    }

    // Condition 3: mixed resolution — some "one" bindings resolved, at least one
    // is null.  In a WHERE clause, "field = NULL" (SQL equality with NULL) never
    // matches any row.  If an entity attribute is absent (null) the dependent
    // entity is not in working memory for this execution branch, so the query
    // will always return 0 rows.  Skip it immediately.
    if (hasResolved && hasNullSingle) {
        debugLog.log('info', 'Short-circuit: binding "' + nullParam + '" resolved to null - referenced entity absent from working memory; step skipped', {
            bindingCount: bindingsMeta.length
        });
        return true;
    }

    return false;
}

/**
 * Collapses newlines and extra whitespace in a SQL string into single spaces
 * for cleaner log output.
 *
 * @param {string} sql - Raw SQL string (may contain newlines and extra whitespace).
 * @returns {string} SQL with whitespace normalized to single spaces.
 */
function normalizeSql(sql) {
    if (!sql) { return ''; }
    return sql.replace(/\s+/g, ' ').trim();
}

/**
 * Builds a human-readable SQL string by substituting @paramName placeholders
 * in the prepared SQL with their actual resolved values. Arrays are shown as
 * comma-separated lists. This is for logging/debugging only — it is NOT
 * sent to the Optic API (which uses proper parameterized bindings).
 *
 * @param {string} preparedSQL - SQL with @paramName placeholders.
 * @param {Object} bindValues  - Map of param name → resolved value.
 * @returns {string} SQL with values inlined for readability.
 */
// ============================================================================
// collectEntities - resolve entities from payload snapshot for a write step
// ============================================================================

/**
 * Traverses the payload snapshot to collect the entity objects a write step
 * should persist.
 *
 * Resolution logic (mirrors the conceptual model from the plan):
 *   - addToExistingEntity + no roleName → all instances of that root type
 *   - addToExistingEntity + roleName    → all roleName associations collected
 *     from every root instance
 *
 * @param {Object} prepared   - Prepared write step metadata.
 * @param {Object} payload    - WM snapshot (entity arrays keyed by type name,
 *                              case-insensitive lookup attempted).
 * @param {string} traceId    - Trace identifier.
 * @param {Object} debugLog   - Debug logger.
 * @param {string} stepLabel  - Human-readable step label for log messages.
 * @returns {Object[]} Flat array of plain JS entity attribute objects.
 */
function collectEntities(prepared, payload, traceId, debugLog, stepLabel) {
    var addToExistingEntity = prepared.addToExistingEntity;
    var roleName            = prepared.roleName;

    // Case-insensitive key lookup helper
    function findInPayload(typeName) {
        if (!payload) { return null; }
        if (payload[typeName]) { return payload[typeName]; }
        var lower = typeName.toLowerCase();
        var keys = Object.keys(payload);
        for (var k = 0; k < keys.length; k++) {
            if (keys[k].toLowerCase() === lower) { return payload[keys[k]]; }
        }
        return null;
    }

    var rootEntities = findInPayload(addToExistingEntity);
    if (!rootEntities || rootEntities.length === 0) {
        debugLog.log('info', stepLabel + ' - No entities of type "' + addToExistingEntity + '" in WM snapshot');
        return [];
    }

    debugLog.log('info', stepLabel + ' - Found ' + rootEntities.length + ' "' + addToExistingEntity + '" entity/entities in WM');

    if (!roleName) {
        // Write the root entities themselves
        debugLog.log('info', stepLabel + ' - No roleName: writing root "' + addToExistingEntity + '" entity/entities directly');
        return rootEntities.slice();
    }

    // Navigate to the named association on each root entity
    var results = [];
    for (var i = 0; i < rootEntities.length; i++) {
        var root = rootEntities[i];
        var assoc = root[roleName];
        if (assoc === null || assoc === undefined) {
            // Try case-insensitive match on the entity's own keys
            var rootKeys = Object.keys(root);
            var lowerRole = roleName.toLowerCase();
            for (var rk = 0; rk < rootKeys.length; rk++) {
                if (rootKeys[rk].toLowerCase() === lowerRole) {
                    assoc = root[rootKeys[rk]];
                    break;
                }
            }
        }
        if (Array.isArray(assoc)) {
            for (var j = 0; j < assoc.length; j++) { results.push(assoc[j]); }
        } else if (assoc !== null && assoc !== undefined) {
            results.push(assoc);
        }
    }
    debugLog.log('info', stepLabel + ' - Collected ' + results.length + ' "' + roleName +
        '" association(s) from ' + rootEntities.length + ' root "' + addToExistingEntity + '" entity/entities');
    return results;
}

function buildDebugSQL(preparedSQL, bindValues) {
    if (!preparedSQL) { return ''; }
    if (!bindValues) { return normalizeSql(preparedSQL); }

    var result = normalizeSql(preparedSQL);
    for (var param in bindValues) {
        if (bindValues.hasOwnProperty(param)) {
            var val = bindValues[param];
            var display;
            if (Array.isArray(val)) {
                display = val.map(function (v) { return typeof v === 'string' ? "'" + v + "'" : String(v); }).join(', ');
            } else if (val === null || val === undefined) {
                display = 'NULL';
            } else if (typeof val === 'string') {
                display = "'" + val + "'";
            } else {
                display = String(val);
            }
            // Replace all occurrences of @paramName (word-boundary safe)
            var pattern = new RegExp('@' + param + '\\b', 'g');
            result = result.replace(pattern, display);
        }
    }
    return result;
}

module.exports = {
    executeQuerySet: executeQuerySet,
    parseQueryDef: parseQueryDef,
    prepareStep: prepareStep
};
