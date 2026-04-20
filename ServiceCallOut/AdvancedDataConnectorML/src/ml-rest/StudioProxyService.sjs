'use strict';
/**
 * StudioProxyService.sjs — MarkLogic REST extension for Corticon Studio proxy.
 *
 * Deployed to the modules database at:
 *   /ext/Advanced%20Data%20Connector/ml-rest/StudioProxyService.sjs
 *
 * Accepts POST requests from the Corticon Studio proxy (Node.js side) containing
 * a query configuration and working-memory snapshot. Executes the full ADC query
 * pipeline via MarkLogicQueryConnector.executeQuerySet() and returns the step
 * results as JSON so the proxy can write them into Corticon working memory.
 *
 * Request body (JSON):
 *   { queryName, ruleProject, queryUri, debug, traceId, wmSnapshot }
 *
 * Response body (JSON):
 *   { steps: [{ rows, stepMeta }], summary: {...}, debugLog: {...} }
 */

var MarkLogicQueryConnector = require('/ext/Advanced Data Connector/ml-rest/MarkLogicQueryConnector');

/**
 * Case-insensitive property lookup (mirrors MarkLogicServiceCallout.js getCaseInsensitiveValue).
 */
function getCaseInsensitiveValue(obj, key) {
    if (!obj || !key) { return undefined; }
    var val = obj[key];
    if (val !== undefined) { return val; }
    var keyLower = key.toLowerCase();
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() === keyLower) { return obj[keys[i]]; }
    }
    return undefined;
}

/**
 * POST handler — MarkLogic REST extension convention.
 * Called by the MarkLogic REST API when a POST request hits this extension URI.
 *
 * @param {Object} context - MarkLogic REST extension context.
 * @param {Object} params  - Extension parameters (unused).
 * @param {*}      input   - Request body (document node).
 */
function post(context, params, input) {
    // Parse incoming request body
    var body;
    try {
        body = input.toObject();
    } catch (e) {
        returnEarlyError(context, 400, 'Invalid JSON request body: ' + e.message);
        return;
    }

    // REST POST handlers run in query (read-only) transactions. Write steps
    // (insert/update/upsert) call xdmp.documentInsert() which needs an update
    // transaction.  xdmp.invokeFunction runs the pipeline in a separate update
    // transaction. Requires xdmp-invoke privilege on the user's role.
    var result = fn.head(xdmp.invokeFunction(
        function () { return executeProxyRequest(body); },
        { update: 'true', commit: 'auto' }
    ));

    if (result && result.error) {
        context.outputStatus = [500, 'Internal Server Error'];
    }
    context.outputTypes = ['application/json'];
    return result;
}

/**
 * Core proxy logic — executes the ADC query pipeline.
 */
function executeProxyRequest(body) {

    var queryName   = body.queryName   || null;
    var ruleProject = body.ruleProject || null;
    var queryUri    = body.queryUri    || null;
    var debug       = body.debug       || false;
    var traceId     = body.traceId     || ('proxy-' + sem.uuidString());
    var wmSnapshot  = body.wmSnapshot  || {};

    xdmp.log('StudioProxy [' + traceId + '] request: queryName=' + queryName +
        ', ruleProject=' + ruleProject +
        ', wmSnapshot entities=' + Object.keys(wmSnapshot).length, 'info');

    // -----------------------------------------------------------------------
    // Mock corticonDataManager — lightweight CDM created from the WM snapshot.
    // Only implements getEntityTypes() and getEntitiesByType() which are the two
    // methods called by extractPayload() inside executeQuerySet.
    // -----------------------------------------------------------------------
    var mockCDM = {
        getEntityTypes: function () {
            return Object.keys(wmSnapshot);
        },
        getEntitiesByType: function (typeName) {
            return wmSnapshot[typeName] || [];
        }
    };

    // -----------------------------------------------------------------------
    // corticonLogger — wraps xdmp.log() with the same interface
    // -----------------------------------------------------------------------
    var serverLogEntries = [];
    var corticonLogger = {
        logDebug: function (msg) {
            xdmp.log('[' + traceId + '] ' + msg, 'debug');
            if (debug) { serverLogEntries.push({ level: 'debug', msg: msg }); }
        },
        logError: function (msg) {
            xdmp.log('[' + traceId + '] ' + msg, 'error');
            serverLogEntries.push({ level: 'error', msg: msg });
        }
    };

    // -----------------------------------------------------------------------
    // Collector callback — invoked by executeQuerySet after each non-write step.
    // -----------------------------------------------------------------------
    var collectedSteps = [];

    function collectorCallback(rows, prepared, cdm, logger, writtenCache) {
        var addToExisting  = prepared.addToExistingEntity  || null;
        var roleName       = prepared.roleName             || 'results';
        var addAsTopLevel  = prepared.addAsTopLevelEntity   || null;
        var foreignKey     = prepared.foreignKey            || null;
        var parentKey      = prepared.parentKey             || null;
        var deferWrite     = prepared.deferWrite            || false;

        var stepMeta = {
            stepIndex:           prepared.stepIndex,
            sequenceNo:          prepared.sequenceNo,
            queryName:           prepared.queryName          || null,
            statementType:       prepared.statementType     || 'select',
            addToExistingEntity: addToExisting,
            addAsTopLevelEntity: addAsTopLevel,
            roleName:            roleName,
            foreignKey:          foreignKey,
            parentKey:           parentKey,
            deferWrite:          deferWrite
        };

        // Deep-copy rows to plain JS objects. Optic API rows are MarkLogic
        // json:object instances (from resultSequence.toArray()) — they don't
        // deep-serialize when nested inside a REST extension response object.
        // JSON round-trip forces them into plain JS objects with primitive values.
        // Also strip Optic qualifier prefixes from column names:
        //   "Paris.Makeability_ByGeometry.ID" → "ID"
        // The Optic API includes schema.view qualifiers; Corticon vocabulary
        // attributes use bare column names.
        var rawRows = JSON.parse(JSON.stringify(rows));
        var plainRows = [];
        for (var ri = 0; ri < rawRows.length; ri++) {
            var rawRow = rawRows[ri];
            var cleanRow = {};
            var rKeys = Object.keys(rawRow);
            for (var rk = 0; rk < rKeys.length; rk++) {
                var fullKey = rKeys[rk];
                var lastDot = fullKey.lastIndexOf('.');
                var bareKey = lastDot !== -1 ? fullKey.substring(lastDot + 1) : fullKey;
                // Omit null values. In production, Optic omits NULL columns from
                // row objects (the key is absent). After JSON round-trip, NULLs
                // become explicit JS null. Also strip the string "null" (4 chars):
                // MarkLogic Optic null nodes can serialize as string "null" via
                // JSON.stringify instead of JS null when the node type is a
                // MarkLogic-specific null node. The string "null" passes isString()
                // in Corticon's convertDecimalAttribute and then fails in the
                // Decimal constructor: "[DecimalError] Invalid argument: null".
                var rawVal = rawRow[fullKey];
                if (rawVal !== null && rawVal !== 'null') {
                    cleanRow[bareKey] = rawVal;
                }
            }
            plainRows.push(cleanRow);
        }
        collectedSteps.push({ rows: plainRows, stepMeta: stepMeta });

        // --- writtenCache population (mirrors writeStepResults cache logic) ---
        // IMPORTANT: use plainRows (bare keys) not rows (Optic-qualified keys)
        // so that extractPayload overlays and resolvePathRecursive can traverse
        // paths like {Products.routingOperations.id} with case-insensitive
        // matching against bare column names.
        var WRITE_TYPES = ['insert', 'update', 'upsert'];
        if (WRITE_TYPES.indexOf(stepMeta.statementType) !== -1) { return; }

        if (addToExisting && foreignKey && parentKey) {
            var targetLower = addToExisting.toLowerCase();
            var matchedCacheKey = null;
            var cacheKeys = Object.keys(writtenCache);
            for (var ck = 0; ck < cacheKeys.length; ck++) {
                if (cacheKeys[ck].indexOf('__') === 0) { continue; }
                var dotPos = cacheKeys[ck].lastIndexOf('.');
                if (dotPos === -1) { continue; }
                if (cacheKeys[ck].substring(dotPos + 1).toLowerCase() === targetLower) {
                    matchedCacheKey = cacheKeys[ck];
                    break;
                }
            }

            if (matchedCacheKey) {
                var parentRows = writtenCache[matchedCacheKey] || [];
                if (parentRows.length > 0) {
                    var childrenByFK = {};
                    for (var gi = 0; gi < plainRows.length; gi++) {
                        var fkVal = getCaseInsensitiveValue(plainRows[gi], foreignKey);
                        if (fkVal !== null && fkVal !== undefined) {
                            var fkKey = String(fkVal);
                            if (!childrenByFK[fkKey]) { childrenByFK[fkKey] = []; }
                            childrenByFK[fkKey].push(plainRows[gi]);
                        }
                    }
                    var enriched = [];
                    for (var pi = 0; pi < parentRows.length; pi++) {
                        var pRow = parentRows[pi];
                        var copy = {};
                        var pKeys = Object.keys(pRow);
                        for (var pk = 0; pk < pKeys.length; pk++) { copy[pKeys[pk]] = pRow[pKeys[pk]]; }
                        var pkVal = getCaseInsensitiveValue(pRow, parentKey);
                        if (pkVal !== null && pkVal !== undefined) {
                            var matched = childrenByFK[String(pkVal)] || [];
                            if (matched.length > 0) { copy[roleName] = matched; }
                        }
                        enriched.push(copy);
                    }
                    writtenCache[matchedCacheKey] = enriched;

                    if (deferWrite) {
                        var thisCacheKey = addToExisting + '.' + roleName;
                        writtenCache[thisCacheKey] = enriched;
                        writtenCache['__anc__.' + thisCacheKey] = { parentCacheKey: matchedCacheKey };
                    }
                }
            }
        }

        if (addToExisting && roleName && plainRows.length > 0) {
            var finalKey = addToExisting + '.' + roleName;
            if (!writtenCache[finalKey]) {
                writtenCache[finalKey] = [];
                for (var ci = 0; ci < plainRows.length; ci++) {
                    writtenCache[finalKey].push(plainRows[ci]);
                }
            }
        }
    }

    // -----------------------------------------------------------------------
    // Build merged properties (same shape as resolveQueryConfig output)
    // -----------------------------------------------------------------------
    var mergedProps = {};
    if (queryName)   { mergedProps.queryName   = queryName; }
    if (ruleProject) { mergedProps.ruleProject = ruleProject; }
    if (queryUri)    { mergedProps.queryUri    = queryUri; }
    if (debug)       { mergedProps.debug       = debug; }
    mergedProps.traceId = traceId;

    if (!mergedProps.queryUri && mergedProps.queryName) {
        mergedProps.queryUri = mergedProps.ruleProject
            ? '/queries/' + mergedProps.ruleProject + '/' + mergedProps.queryName + '.json'
            : '/queries/' + mergedProps.queryName + '.json';
    }

    // -----------------------------------------------------------------------
    // Execute the full query pipeline
    // -----------------------------------------------------------------------
    var result;
    try {
        var summary = MarkLogicQueryConnector.executeQuerySet(
            mockCDM,
            mergedProps,
            corticonLogger,
            collectorCallback
        );

        var debugLogOutput = null;
        if (debug && summary.debugLogger) {
            debugLogOutput = {
                timings: summary.debugLogger.getTimings(),
                entries: serverLogEntries
            };
        }

        result = {
            error: false,
            traceId: traceId,
            steps: collectedSteps,
            summary: {
                queryName:     summary.queryName,
                stepsExecuted: summary.stepsExecuted,
                totalRows:     summary.totalRows,
                totalMs:       summary.totalMs
            },
            debugLog: debugLogOutput
        };

        xdmp.log('StudioProxy [' + traceId + '] response: ' + summary.stepsExecuted +
            ' step(s), ' + summary.totalRows + ' row(s), ' + summary.totalMs + 'ms', 'info');

    } catch (error) {
        xdmp.log('StudioProxy [' + traceId + '] ERROR: ' + error.message, 'error');
        result = {
            error: true,
            traceId: traceId,
            message: error.message,
            debugLog: debug ? { entries: serverLogEntries } : null
        };
    }

    return result;
}

function returnEarlyError(context, code, message) {
    context.outputTypes = ['application/json'];
    context.outputStatus = [code, message];
}

exports.POST = post;
