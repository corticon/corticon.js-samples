'use strict';

/**
 * MarkLogicQueryLibrary.js - Consolidated utility library for the ADC Query Callout.
 *
 * Combines all helper modules into a single file for simpler deployment.
 * The user only needs to include 3 files in their Corticon rule project:
 *
 *   1. MarkLogicServiceCallout.js   - SCO entry point (Corticon registration)
 *   2. MarkLogicQueryConnector.js   - Query orchestration (load/resolve/execute)
 *   3. MarkLogicQueryLibrary.js     - This file (all utility functions)
 *
 * Exposed sub-modules:
 *   - DebugLogger
 *   - Validators
 *   - QueryRegistry
 *   - PlaceholderResolver
 *   - SqlRewriter
 *   - OpticExecutor
 *
 * @module MarkLogicQueryLibrary
 */

// ============================================================================
// OpticExecutor - requires the MarkLogic Optic API
// Guarded so the library can be loaded under Node.js for unit testing
// (OpticExecutor functions will throw at runtime if op is not available)
// ============================================================================

// Indirect require hides module paths from Corticon Studio's browserify bundler,
// which does static analysis on require() calls and would fail with
// MODULE_NOT_FOUND.  At runtime inside MarkLogic the module resolves normally.
//
// The Optic module path varies by MarkLogic version:
//   ML 10.x:  /MarkLogic/optic
//   ML 11+:   /MarkLogic/optic  or  /MarkLogic/optic.mjs  or global 'op'
// We try each known path and fall back to xdmp.sql in executeOptic if all fail.
var op = null;
(function loadOptic() {
    var _req = require;
    var paths = ['/MarkLogic/optic', '/MarkLogic/optic.mjs'];
    for (var i = 0; i < paths.length; i++) {
        try {
            op = _req(paths[i]);
            if (op) return;
        } catch (ignore) { /* try next path */ }
    }
    // Some ML11+ environments expose 'op' as a global built-in
    if (typeof op === 'undefined' || op === null) {
        try {
            if (typeof globalThis !== 'undefined' && globalThis.op) {
                op = globalThis.op;
            }
        } catch (ignore) { /* not available */ }
    }
    // op stays null — executeOptic will fall back to xdmp.sql
})();

// ============================================================================
// DebugLogger
// ============================================================================

/** @typedef {'debug'|'info'|'warning'|'error'} LogLevel */

/**
 * @typedef {Object} DebugBlock
 * @property {string}   traceId
 * @property {string}   queryName
 * @property {string}   queryDocUri
 * @property {string}   preparedSQL
 * @property {Array}    bindingSummary
 * @property {Object}   timings
 * @property {number}   rowCount
 */

/**
 * Creates a logger instance bound to a traceId.
 * @param {string}  traceId     - Correlation identifier for this callout invocation.
 * @param {boolean} debugEnabled - Whether verbose/debug logging is active.
 * @returns {Object} Logger API.
 */
function createLogger(traceId, debugEnabled) {
    var PREFIX = 'ADC-QueryCallout';
    var timings = {};
    var debugBlock = {
        traceId: traceId,
        queryName: null,
        queryDocUri: null,
        preparedSQL: null,
        bindingSummary: [],
        timings: {},
        rowCount: 0
    };

    /**
     * Logs a message at the specified level via xdmp.log.
     * @param {LogLevel} level   - Log level.
     * @param {string}   message - Human-readable message.
     * @param {Object}   [data]  - Optional structured data (safe subset).
     */
    function log(level, message, data) {
        var entry = {
            prefix: PREFIX,
            traceId: traceId,
            level: level,
            message: message
        };
        if (data !== undefined && data !== null) {
            entry.data = sanitizeData(data, debugEnabled);
        }

        var text;
        try {
            text = JSON.stringify(entry);
        } catch (jsonErr) {
            text = PREFIX + ' [' + traceId + '] ' + level + ': ' + message + ' (JSON serialization failed: ' + jsonErr.message + ')';
        }

        // Guard: xdmp.log is only available inside MarkLogic server-side JS
        if (typeof xdmp !== 'undefined' && xdmp && typeof xdmp.log === 'function') {
            switch (level) {
                case 'error':
                    xdmp.log(text, 'error');
                    break;
                case 'warning':
                    xdmp.log(text, 'warning');
                    break;
                case 'debug':
                    if (debugEnabled) {
                        xdmp.log(text, 'debug');
                    }
                    break;
                default:
                    xdmp.log(text, 'info');
                    break;
            }
        }
    }

    /**
     * Sanitizes data for logging. Strips sensitive values; for arrays logs
     * length and optionally first 2 samples when debug is enabled.
     * @param {*}       data         - Raw data.
     * @param {boolean} showSamples  - Whether to include sample values.
     * @returns {*} Sanitized copy.
     */
    function sanitizeData(data, showSamples) {
        if (data === null || data === undefined) {
            return data;
        }
        if (Array.isArray(data)) {
            var result = { _type: 'array', length: data.length };
            if (showSamples && data.length > 0) {
                result.samples = data.slice(0, 2);
            }
            return result;
        }
        if (typeof data === 'object') {
            var safe = {};
            var keys = Object.keys(data);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var val = data[key];
                if (Array.isArray(val)) {
                    safe[key] = { _type: 'array', length: val.length };
                    if (showSamples && val.length > 0) {
                        safe[key].samples = val.slice(0, 2);
                    }
                } else {
                    safe[key] = val;
                }
            }
            return safe;
        }
        return data;
    }

    /**
     * Records a timing start point.
     * @param {string} label - Timing label (e.g., 'loadQuery', 'execute').
     */
    function startTimer(label) {
        timings[label] = { start: Date.now(), end: null, durationMs: null };
    }

    /**
     * Records a timing end point and calculates duration.
     * @param {string} label - Timing label.
     * @returns {number} Duration in milliseconds.
     */
    function endTimer(label) {
        if (timings[label]) {
            timings[label].end = Date.now();
            timings[label].durationMs = timings[label].end - timings[label].start;
            return timings[label].durationMs;
        }
        return -1;
    }

    /**
     * Returns the accumulated timings object.
     * @returns {Object} Map of label -> durationMs.
     */
    function getTimings() {
        var result = {};
        var keys = Object.keys(timings);
        for (var i = 0; i < keys.length; i++) {
            var t = timings[keys[i]];
            result[keys[i]] = t.durationMs !== null ? t.durationMs : -1;
        }
        return result;
    }

    /**
     * Updates the debug block with data from callout execution.
     * @param {Object} updates - Partial DebugBlock fields to merge.
     */
    function updateDebugBlock(updates) {
        if (updates) {
            var keys = Object.keys(updates);
            for (var i = 0; i < keys.length; i++) {
                debugBlock[keys[i]] = updates[keys[i]];
            }
        }
    }

    /**
     * Returns the current debug block.
     * @returns {DebugBlock}
     */
    function getDebugBlock() {
        debugBlock.timings = getTimings();
        return debugBlock;
    }

    /**
     * Writes the debug block into the payload at the specified path.
     * @param {Object} payload   - The Corticon payload object.
     * @param {string} debugPath - Dot-separated path (e.g., "Debug.QueryCallout").
     */
    function attachDebugBlock(payload, debugPath) {
        if (!payload || !debugPath) {
            return;
        }
        debugBlock.timings = getTimings();
        var parts = debugPath.split('.');
        var current = payload;
        for (var i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] === undefined || current[parts[i]] === null) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = debugBlock;
    }

    return {
        log: log,
        startTimer: startTimer,
        endTimer: endTimer,
        getTimings: getTimings,
        updateDebugBlock: updateDebugBlock,
        getDebugBlock: getDebugBlock,
        attachDebugBlock: attachDebugBlock
    };
}

// ============================================================================
// Validators
// ============================================================================

/** Forbidden SQL keywords that indicate mutation operations. */
var FORBIDDEN_KEYWORDS = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'TRUNCATE', 'MERGE', 'REPLACE', 'GRANT', 'REVOKE', 'EXEC',
    'EXECUTE', 'CALL'
];

/** Maximum sane value for maxRows to prevent unbounded queries. */
var ABSOLUTE_MAX_ROWS = 100000;

/**
 * Validates that a SQL statement is a SELECT-only query.
 * Throws an error if the statement contains mutation keywords.
 *
 * @param {string} sql - The SQL statement to validate.
 * @param {string} traceId - Trace identifier for error context.
 * @throws {Error} If the SQL contains forbidden keywords.
 */
function validateSelectOnly(sql, traceId) {
    if (!sql || typeof sql !== 'string') {
        throw new Error('[' + traceId + '] SQL statement is empty or not a string');
    }

    var normalized = sql.toUpperCase().replace(/\s+/g, ' ').trim();

    if (!normalized.match(/^\s*SELECT\b/)) {
        throw new Error(
            '[' + traceId + '] SQL statement must begin with SELECT. ' +
            'Got: "' + sql.substring(0, 50) + '..."'
        );
    }

    for (var i = 0; i < FORBIDDEN_KEYWORDS.length; i++) {
        var keyword = FORBIDDEN_KEYWORDS[i];
        var pattern = new RegExp('\\b' + keyword + '\\b', 'i');
        if (pattern.test(normalized)) {
            throw new Error(
                '[' + traceId + '] SQL contains forbidden keyword "' + keyword + '". ' +
                'Only SELECT statements are allowed.'
            );
        }
    }
}

/**
 * Validates a write step definition (document-write steps — insert/update/upsert).
 * Throws if required fields are absent or statementType is unrecognised.
 *
 * @param {Object} step    - Step definition object from the query definition JSON.
 * @param {string} traceId - Trace identifier for error context.
 * @throws {Error} If required write-step fields are missing or invalid.
 */
function validateWriteStep(step, traceId) {
    var WRITE_TYPES = ['insert', 'update', 'upsert'];
    var st = (step.statementType || '').toLowerCase();
    if (WRITE_TYPES.indexOf(st) === -1) {
        throw new Error(
            '[' + traceId + '] Invalid statementType "' + step.statementType + '" for write step. ' +
            'Must be one of: insert, update, upsert.'
        );
    }
    if (!step.addToExistingEntity || typeof step.addToExistingEntity !== 'string' || !step.addToExistingEntity.trim()) {
        throw new Error(
            '[' + traceId + '] Write step (statementType: "' + st + '") is missing required field "addToExistingEntity". ' +
            'Set it to the Corticon entity type to locate in working memory (e.g. "Product").'
        );
    }
    if (!step.documentUriTemplate || typeof step.documentUriTemplate !== 'string' || !step.documentUriTemplate.trim()) {
        throw new Error(
            '[' + traceId + '] Write step (statementType: "' + st + '") is missing required field "documentUriTemplate". ' +
            'Example: "/data/Paris/RoutingOutput/{matNr}.json"'
        );
    }
}

/**
 * Validates that the SQL references only allowed views/tables.
 * Parses FROM and JOIN clauses to extract table names and checks against the allowlist.
 *
 * @param {string}   sql          - The SQL statement.
 * @param {string[]} allowedViews - Array of allowed view/table names.
 * @param {string}   traceId      - Trace identifier for error context.
 * @throws {Error} If a referenced view is not in the allowlist.
 */
function validateAllowedViews(sql, allowedViews, traceId) {
    if (!allowedViews || !Array.isArray(allowedViews) || allowedViews.length === 0) {
        return; // No allowlist configured; skip validation
    }

    var normalized = sql.toUpperCase().replace(/\s+/g, ' ').trim();
    var allowedUpper = allowedViews.map(function (v) { return v.toUpperCase(); });

    // Extract table references from FROM and JOIN clauses (SELECT steps only)
    var fromPattern        = /\bFROM\s+([A-Za-z_][A-Za-z0-9_.]*)/gi;
    var joinPattern        = /\bJOIN\s+([A-Za-z_][A-Za-z0-9_.]*)/gi;
    var tables = [];
    var match;

    while ((match = fromPattern.exec(sql)) !== null) {
        tables.push(match[1].toUpperCase());
    }
    while ((match = joinPattern.exec(sql)) !== null) {
        tables.push(match[1].toUpperCase());
    }

    for (var i = 0; i < tables.length; i++) {
        var table = tables[i];
        // Handle schema.table notation - check both full name and table-only
        var tableParts = table.split('.');
        var tableOnly = tableParts[tableParts.length - 1];

        var found = false;
        for (var j = 0; j < allowedUpper.length; j++) {
            if (allowedUpper[j] === table || allowedUpper[j] === tableOnly) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error(
                '[' + traceId + '] SQL references view "' + tables[i] +
                '" which is not in the allowed views list: [' + allowedViews.join(', ') + ']'
            );
        }
    }
}

/**
 * Validates and normalizes maxRows.
 *
 * @param {number|undefined} maxRows  - Requested max rows.
 * @param {string}           traceId  - Trace identifier.
 * @returns {number} Validated maxRows value.
 */
function validateMaxRows(maxRows, traceId) {
    if (maxRows === undefined || maxRows === null) {
        return ABSOLUTE_MAX_ROWS;
    }
    if (typeof maxRows !== 'number' || maxRows < 1) {
        throw new Error(
            '[' + traceId + '] maxRows must be a positive number. Got: ' + maxRows
        );
    }
    if (maxRows > ABSOLUTE_MAX_ROWS) {
        return ABSOLUTE_MAX_ROWS;
    }
    return maxRows;
}

/**
 * Validates that all binding param names from metadata are present as @param
 * placeholders in the prepared SQL, and vice versa.
 *
 * @param {string}   preparedSQL    - The rewritten SQL with @param placeholders.
 * @param {Object[]} bindingsMeta   - Array of binding metadata objects.
 * @param {string}   traceId        - Trace identifier.
 * @throws {Error} If there is a mismatch between SQL params and binding metadata.
 */
function validateBindingConsistency(preparedSQL, bindingsMeta, traceId) {
    // Extract all @paramName tokens from prepared SQL
    var paramPattern = /@([A-Za-z_][A-Za-z0-9_]*)/g;
    var sqlParams = {};
    var match;
    while ((match = paramPattern.exec(preparedSQL)) !== null) {
        sqlParams[match[1]] = true;
    }
    var sqlParamNames = Object.keys(sqlParams);

    // Collect param names from binding metadata
    var metaParamNames = {};
    for (var i = 0; i < bindingsMeta.length; i++) {
        metaParamNames[bindingsMeta[i].param] = true;
    }

    // Check: every SQL param must exist in metadata
    for (var j = 0; j < sqlParamNames.length; j++) {
        if (!metaParamNames[sqlParamNames[j]]) {
            throw new Error(
                '[' + traceId + '] SQL contains parameter @' + sqlParamNames[j] +
                ' which has no matching binding metadata entry.'
            );
        }
    }

    // Check: every metadata param must exist in SQL
    var metaKeys = Object.keys(metaParamNames);
    for (var k = 0; k < metaKeys.length; k++) {
        if (!sqlParams[metaKeys[k]]) {
            throw new Error(
                '[' + traceId + '] Binding metadata defines parameter "' + metaKeys[k] +
                '" which is not referenced in the prepared SQL.'
            );
        }
    }
}

/**
 * Validates a query definition document structure.
 *
 * @param {Object} queryDef - The parsed query definition object.
 * @param {string} traceId  - Trace identifier.
 * @throws {Error} If required fields are missing.
 */
function validateQueryDefinition(queryDef, traceId) {
    if (!queryDef) {
        throw new Error('[' + traceId + '] Query definition is null or undefined');
    }
    if (!queryDef.queryName) {
        throw new Error('[' + traceId + '] Query definition must have a "queryName"');
    }
    if (!queryDef.steps || !Array.isArray(queryDef.steps) || queryDef.steps.length === 0) {
        throw new Error('[' + traceId + '] Query definition must have a non-empty "steps" array');
    }
    for (var s = 0; s < queryDef.steps.length; s++) {
        var step = queryDef.steps[s];
        if (!step.statement || typeof step.statement !== 'string') {
            throw new Error('[' + traceId + '] Step ' + (s + 1) + ' must have a "statement" string');
        }
        validateStepBindings(step.bindings, s, traceId);
    }
}

/**
 * Validates bindings array structure for a single step.
 * Bindings are optional - if absent, they will be auto-inferred from SQL placeholders.
 *
 * @param {Object[]} bindings  - Bindings array (may be null/undefined).
 * @param {number}   stepIndex - Step index for error messages.
 * @param {string}   traceId   - Trace identifier.
 */
function validateStepBindings(bindings, stepIndex, traceId) {
    if (bindings && Array.isArray(bindings)) {
        for (var i = 0; i < bindings.length; i++) {
            var b = bindings[i];
            if (!b.placeholder) {
                throw new Error('[' + traceId + '] Step ' + (stepIndex + 1) + ' binding at index ' + i + ' missing "placeholder"');
            }
        }
    }
}

// ============================================================================
// QueryRegistry
// ============================================================================

/** Default URI prefix for query definition documents. */
var QUERY_URI_PREFIX = '/queries/';
var QUERY_URI_SUFFIX = '.json';

/**
 * Resolves a query definition URI from either a direct URI or a query ID.
 *
 * Supports three lookup modes (in priority order):
 *   1. options.queryUri        — use the URI directly (highest priority)
 *   2. options.ruleProject     — build /queries/{ruleProject}/{queryName}.json
 *   3. options.queryName only  — build legacy /queries/{queryName}.json
 *
 * @param {Object} options
 * @param {string} [options.queryUri]    - Direct document URI (bypasses all construction).
 * @param {string} [options.queryName]   - Query name.
 * @param {string} [options.ruleProject] - Rule project name; when supplied together with
 *                                         queryName the URI is built as
 *                                         /queries/{ruleProject}/{queryName}.json.
 * @param {string} traceId              - Trace identifier for error context.
 * @returns {string} The resolved document URI.
 * @throws {Error} If neither queryUri nor queryName is provided.
 */
function resolveUri(options, traceId) {
    if (options.queryUri) {
        return options.queryUri;
    }
    if (options.queryName) {
        if (options.ruleProject) {
            // New layout: /queries/{ruleProject}/{queryName}.json
            return QUERY_URI_PREFIX + options.ruleProject + '/' + options.queryName + QUERY_URI_SUFFIX;
        }
        // Legacy layout: /queries/{queryName}.json
        return QUERY_URI_PREFIX + options.queryName + QUERY_URI_SUFFIX;
    }
    throw new Error(
        '[' + traceId + '] Must provide either config.queryUri or config.queryName ' +
        'to locate the query definition document.'
    );
}

/**
 * Loads a query definition document from MarkLogic.
 *
 * @param {Object}  options
 * @param {string}  [options.queryName]   - Query identifier.
 * @param {string}  [options.queryUri]  - Direct document URI.
 * @param {string}  traceId             - Trace identifier for error context.
 * @returns {Object} The parsed query definition object, with an added _uri property.
 * @throws {Error} If the document is not found or is not valid JSON.
 */
/**
 * Searches the QueryDefs collection for a document whose queryName field
 * matches the given name. Used as a fallback when the URI-based lookup fails
 * (e.g. ruleProject is not set and the legacy flat URI no longer exists).
 *
 * @param {string} queryName - The queryName field value to search for.
 * @param {string} traceId   - Trace identifier for error messages.
 * @returns {Object|null} The document node, or null if not found.
 */
function findQueryDocByName(queryName, traceId) {
    try {
        var results = cts.search(
            cts.andQuery([
                cts.collectionQuery('QueryDefs'),
                cts.jsonPropertyValueQuery('queryName', queryName)
            ]),
            ['unfiltered'],
            1  // limit to first match
        );
        var iter = results;
        if (fn.exists(iter)) {
            var first = iter.toArray()[0];
            return first || null;
        }
        return null;
    } catch (e) {
        // cts not available (unit test context) or search failed — return null
        return null;
    }
}

function getQueryDefinition(options, traceId) {
    var uri = resolveUri(options, traceId);

    var doc = cts.doc(uri);

    // If the direct URI lookup misses and we only have queryName (no explicit ruleProject
    // or queryUri), search MarkLogic by queryName field value across the QueryDefs
    // collection. This is the backward-compatible fallback for documents that have been
    // migrated to the /queries/{ruleProject}/{queryName}.json layout.
    if (!doc && options.queryName && !options.queryUri && !options.ruleProject) {
        doc = findQueryDocByName(options.queryName, traceId);
        if (doc) {
            // Update uri variable for error messages and _uri attachment below
            uri = fn.documentUri(doc) || uri;
        }
    }

    if (!doc) {
        throw new Error(
            '[' + traceId + '] Query definition document not found at URI: ' + uri +
            '. Ensure the document exists in the MarkLogic database.'
        );
    }

    var queryDef;
    try {
        queryDef = doc.toObject();
    } catch (e) {
        throw new Error(
            '[' + traceId + '] Failed to parse query definition document at URI: ' + uri +
            '. Error: ' + e.message
        );
    }

    if (!queryDef) {
        throw new Error(
            '[' + traceId + '] Query definition document at URI: ' + uri +
            ' is empty or null.'
        );
    }

    // Attach the source URI for debug/logging purposes
    queryDef._uri = uri;

    return queryDef;
}

// ============================================================================
// PlaceholderResolver
// ============================================================================

/**
 * @typedef {Object} BindingMeta
 * @property {string}  placeholder  - Placeholder name (e.g., "Product.Id").
 * @property {string}  param        - SQL parameter name (e.g., "productIds").
 * @property {string}  type         - XSD type hint (e.g., "xs:string").
 * @property {string}  cardinality  - "one" or "many".
 * @property {boolean} required     - Whether the value is required.
 */

/**
 * Resolves all bindings from the payload, producing a map of
 * param name -> resolved value (scalar or array).
 *
 * @param {BindingMeta[]} bindingsMeta      - Array of binding metadata from the query definition.
 * @param {Object}        payload           - The Corticon working memory / payload object.
 * @param {string}        traceId           - Trace identifier for error context.
 * @returns {Object} Map of { paramName: valueOrArray }.
 * @throws {Error} If a required binding cannot be resolved.
 */
function resolveBindings(bindingsMeta, payload, traceId) {
    var result = {};

    for (var i = 0; i < bindingsMeta.length; i++) {
        var meta = bindingsMeta[i];
        var placeholderPath = meta.placeholder; // e.g., "Product.Id"

        var resolved = resolvePath(payload, placeholderPath);

        // Normalize to array for "many" cardinality
        if (meta.cardinality === 'many') {
            if (resolved === undefined || resolved === null) {
                // Return empty array — shouldShortCircuit will detect the empty
                // IN-clause and gracefully skip the step rather than hard-failing.
                // This handles cascading dependencies (e.g. Step 2 references
                // entities that Step 1 was supposed to produce but didn't).
                result[meta.param] = [];
            } else if (Array.isArray(resolved)) {
                // Filter out null/undefined values
                var filtered = [];
                for (var j = 0; j < resolved.length; j++) {
                    if (resolved[j] !== null && resolved[j] !== undefined) {
                        filtered.push(resolved[j]);
                    }
                }
                result[meta.param] = filtered;
            } else {
                // Single value wrapped as array
                result[meta.param] = [resolved];
            }
        } else {
            // cardinality "one"
            if ((resolved === undefined || resolved === null) && meta.required) {
                throw new Error(
                    '[' + traceId + '] Required placeholder {' + meta.placeholder +
                    '} (param: ' + meta.param + ') not found in payload. Path: ' + placeholderPath
                );
            }
            // If resolved is an array, take first element for "one"
            if (Array.isArray(resolved)) {
                result[meta.param] = resolved.length > 0 ? resolved[0] : null;
            } else {
                result[meta.param] = resolved !== undefined ? resolved : null;
            }
        }
    }

    return result;
}

/**
 * Resolves a dot-separated path against a payload object.
 *
 * Handles entity arrays transparently:
 * - If "Product" is an array of objects and path is "Product.Id",
 *   returns an array of all Id values from the Product entities.
 * - Supports deeply nested paths (e.g., "Order.LineItem.Sku").
 *
 * @param {Object} obj  - The root payload object.
 * @param {string} path - Dot-separated path (e.g., "Product.Id").
 * @returns {*} The resolved value: scalar, array, or undefined.
 */
function resolvePath(obj, path) {
    if (!obj || !path) {
        return undefined;
    }

    var parts = path.split('.');
    return resolvePathRecursive(obj, parts, 0);
}

/**
 * Recursively resolves path parts, handling arrays at any level.
 *
 * @param {*}        current  - Current object/value in traversal.
 * @param {string[]} parts    - Path segments.
 * @param {number}   index    - Current index into parts.
 * @returns {*} Resolved value.
 */
function resolvePathRecursive(current, parts, index) {
    if (current === null || current === undefined) {
        return undefined;
    }

    if (index >= parts.length) {
        return current;
    }

    var key = parts[index];

    if (Array.isArray(current)) {
        // Traverse into each element of the array, collecting results
        var collected = [];
        for (var i = 0; i < current.length; i++) {
            var sub = resolvePathRecursive(current[i], parts, index);
            if (sub !== undefined) {
                if (Array.isArray(sub)) {
                    // Flatten nested arrays
                    for (var j = 0; j < sub.length; j++) {
                        collected.push(sub[j]);
                    }
                } else {
                    collected.push(sub);
                }
            }
        }
        return collected.length > 0 ? collected : undefined;
    }

    // Use bracket notation rather than hasOwnProperty so that Corticon entity
    // objects whose attributes are defined via getter descriptors (not plain own
    // properties) are still resolved correctly.
    if (typeof current === 'object') {
        var val = current[key];
        if (val !== undefined) {
            return resolvePathRecursive(val, parts, index + 1);
        }
        // Case-insensitive fallback: handles mismatches between database column
        // casing (e.g. "ID") and Corticon vocabulary attribute casing (e.g. "id").
        // Only scans own keys of plain JS objects (SQL result row objects);
        // Corticon entity objects are already handled by the bracket access above.
        var keyLower = key.toLowerCase();
        try {
            var objKeys = Object.keys(current);
            for (var oki = 0; oki < objKeys.length; oki++) {
                if (objKeys[oki].toLowerCase() === keyLower) {
                    return resolvePathRecursive(current[objKeys[oki]], parts, index + 1);
                }
            }
        } catch (e) { /* Object.keys not available on this object type */ }
    }

    return undefined;
}

/**
 * Generates a summary of resolved bindings suitable for debug logging.
 * Does not include actual values to protect sensitive data.
 *
 * @param {BindingMeta[]} bindingsMeta - Binding metadata.
 * @param {Object}        bindValues   - Resolved bind values.
 * @returns {Array} Array of { param, cardinality, length|value_type }.
 */
function getBindingSummary(bindingsMeta, bindValues) {
    var summary = [];
    for (var i = 0; i < bindingsMeta.length; i++) {
        var meta = bindingsMeta[i];
        var val = bindValues[meta.param];
        var entry = {
            param: meta.param,
            placeholder: meta.placeholder,
            cardinality: meta.cardinality,
            type: meta.type
        };
        if (Array.isArray(val)) {
            entry.valueCount = val.length;
        } else {
            entry.valueType = val === null ? 'null' : typeof val;
        }
        summary.push(entry);
    }
    return summary;
}

// ============================================================================
// SqlRewriter
// ============================================================================

/**
 * Rewrites a SQL statement by replacing all curly-brace placeholders
 * with @paramName references from the binding metadata.
 *
 * @param {string}   statement     - Original SQL with {Placeholder} tokens.
 * @param {Object[]} bindingsMeta  - Array of binding metadata objects.
 * @param {string}   traceId       - Trace identifier for error context.
 * @returns {string} The rewritten SQL with @param placeholders.
 * @throws {Error} If a placeholder in SQL has no matching binding metadata,
 *                 or if a binding metadata entry has no matching placeholder in SQL.
 */
function rewriteSql(statement, bindingsMeta, traceId) {
    if (!statement || typeof statement !== 'string') {
        throw new Error('[' + traceId + '] SQL statement is empty or not a string');
    }
    if (!bindingsMeta || !Array.isArray(bindingsMeta)) {
        throw new Error('[' + traceId + '] Bindings metadata must be an array');
    }

    // Build a map of placeholder -> param name from binding metadata
    var placeholderToParam = {};
    for (var i = 0; i < bindingsMeta.length; i++) {
        var meta = bindingsMeta[i];
        placeholderToParam[meta.placeholder] = meta.param;
    }

    // Find all {Placeholder} tokens in the statement
    var placeholderPattern = /\{([^}]+)\}/g;
    var foundPlaceholders = {};
    var match;

    // First pass: validate all placeholders exist in metadata
    var tempSql = statement;
    while ((match = placeholderPattern.exec(statement)) !== null) {
        var placeholder = match[1].trim();
        foundPlaceholders[placeholder] = true;

        if (!placeholderToParam[placeholder]) {
            throw new Error(
                '[' + traceId + '] SQL contains placeholder {' + placeholder +
                '} which has no matching entry in the binding metadata. ' +
                'Available bindings: [' +
                bindingsMeta.map(function (b) { return b.placeholder; }).join(', ') + ']'
            );
        }
    }

    // Validate all metadata entries have matching placeholders in SQL
    for (var j = 0; j < bindingsMeta.length; j++) {
        var metaPlaceholder = bindingsMeta[j].placeholder;
        if (!foundPlaceholders[metaPlaceholder]) {
            throw new Error(
                '[' + traceId + '] Binding metadata defines placeholder "' +
                metaPlaceholder + '" (param: ' + bindingsMeta[j].param +
                ') which is not referenced in the SQL statement.'
            );
        }
    }

    // Second pass: perform the replacement
    var rewritten = statement.replace(placeholderPattern, function (fullMatch, innerText) {
        var trimmed = innerText.trim();
        var paramName = placeholderToParam[trimmed];
        return '@' + paramName;
    });

    return rewritten;
}

/**
 * Extracts all curly-brace placeholder names from a SQL statement.
 * Useful for validation and debugging.
 *
 * @param {string} statement - SQL statement with {Placeholder} tokens.
 * @returns {string[]} Array of placeholder names found in the statement.
 */
function extractPlaceholders(statement) {
    if (!statement) {
        return [];
    }
    var pattern = /\{([^}]+)\}/g;
    var placeholders = [];
    var match;
    while ((match = pattern.exec(statement)) !== null) {
        var trimmed = match[1].trim();
        if (placeholders.indexOf(trimmed) === -1) {
            placeholders.push(trimmed);
        }
    }
    return placeholders;
}

/**
 * Extracts all @paramName references from a prepared SQL statement.
 * Useful for consistency validation.
 *
 * @param {string} preparedSQL - Rewritten SQL with @param placeholders.
 * @returns {string[]} Array of unique param names found.
 */
function extractParamNames(preparedSQL) {
    if (!preparedSQL) {
        return [];
    }
    var pattern = /@([A-Za-z_][A-Za-z0-9_]*)/g;
    var params = [];
    var match;
    while ((match = pattern.exec(preparedSQL)) !== null) {
        if (params.indexOf(match[1]) === -1) {
            params.push(match[1]);
        }
    }
    return params;
}

// ============================================================================
// OpticExecutor
// ============================================================================

/**
 * @typedef {Object} ExecutionResult
 * @property {Object[]} rows      - Array of result row objects.
 * @property {number}   rowCount  - Number of rows returned.
 * @property {boolean}  truncated - Whether rows were truncated by maxRows.
 */

/**
 * Executes a parameterized SQL query using op.fromSQL.
 *
 * @param {string}  preparedSQL - Rewritten SQL with @param placeholders.
 * @param {string}  qualifier   - TDE view qualifier / schema hint for fromSQL.
 * @param {Object}  bindValues  - Map of param name -> value or array.
 * @param {number}  maxRows     - Maximum number of rows to return.
 * @param {string}  traceId     - Trace identifier for error context.
 * @returns {ExecutionResult} The query results.
 * @throws {Error} If the Optic query fails.
 */
function executeOptic(preparedSQL, qualifier, bindValues, maxRows, traceId) {
    var currentUser = xdmp.getCurrentUser();
    xdmp.log('[' + traceId + '] executeOptic - user: ' + currentUser +
        ', optic loaded: ' + (op !== null) +
        ', SQL: ' + preparedSQL, 'info');

    try {
        // Fallback: when the Optic module is not available (op is null),
        // substitute bind params inline and execute via xdmp.sql instead.
        if (!op) {
            var resolved = preparedSQL;
            if (bindValues) {
                var bKeys = Object.keys(bindValues);
                for (var k = 0; k < bKeys.length; k++) {
                    var val = bindValues[bKeys[k]];
                    var replacement;
                    if (Array.isArray(val)) {
                        replacement = val.map(function (x) {
                            return typeof x === 'string' ? "'" + x.replace(/'/g, "''") + "'" : x;
                        }).join(',');
                    } else {
                        replacement = typeof val === 'string'
                            ? "'" + val.replace(/'/g, "''") + "'"
                            : val;
                    }
                    resolved = resolved.replace(new RegExp('@' + bKeys[k], 'g'), replacement);
                }
            }
            if (maxRows && maxRows > 0) {
                resolved += ' LIMIT ' + maxRows;
            }

            try {
                // Use 'array' format: xdmp.sql only accepts 'array' or 'map'.
                // 'array' returns a Sequence where the first item is a JS array of
                // fully-qualified column names (e.g. "Paris.RoutingOperations.plant")
                // and each subsequent item is a JS array of row values.
                // This avoids the map:map opaque-object problem of 'map' format.
                var xRows = xdmp.sql(resolved, 'array');
            } catch (sqlErr) {
                if (sqlErr.message && sqlErr.message.indexOf('privilege') !== -1) {
                    throw new Error(
                        '[' + traceId + '] xdmp.sql execution failed for user "' + currentUser + '": ' +
                        sqlErr.message + '. ' +
                        'FIX: Grant the xdmp-sql execute privilege to the role(s) of user "' + currentUser + '". ' +
                        'Run in Query Console as admin: ' +
                        'sec:privilege-add-roles("http://marklogic.com/xdmp/privileges/xdmp-sql", "execute", ("YOUR-ROLE"))'
                    );
                }
                throw sqlErr;
            }

            var xRowsArr = xRows.toArray();
            // First element is the header row (column names); rest are data rows.
            var headers = xRowsArr.length > 0 ? xRowsArr[0] : [];
            var rows = [];
            for (var r = 1; r < xRowsArr.length; r++) {
                var row = {};
                var dataRow = xRowsArr[r];
                for (var c = 0; c < headers.length; c++) {
                    // Strip schema/table qualifier — "Paris.RoutingOperations.plant" → "plant"
                    var colName = String(headers[c]).split('.').pop();
                    // Coerce MarkLogic null Node objects to JS null.
                    // xdmp.sql returns SQL NULLs as MarkLogic Node objects
                    // (typeof === 'object', not strict JS null) that serialize
                    // to {} in JSON — which breaks Corticon Studio's parser.
                    var cellVal = dataRow[c];
                    if (cellVal === null || cellVal === undefined) {
                        row[colName] = null;
                    } else if (typeof cellVal === 'object' && !Array.isArray(cellVal)) {
                        // Check for MarkLogic null nodes: empty objects or
                        // objects with a valueOf() that returns null
                        try {
                            var primitive = cellVal.valueOf();
                            if (primitive === null || primitive === undefined) {
                                row[colName] = null;
                            } else if (typeof primitive !== 'object') {
                                row[colName] = primitive;
                            } else {
                                var objKeys = Object.keys(cellVal);
                                row[colName] = objKeys.length === 0 ? null : cellVal;
                            }
                        } catch (e) {
                            row[colName] = cellVal;
                        }
                    } else {
                        row[colName] = cellVal;
                    }
                }
                rows.push(row);
            }
            return {
                rows: rows,
                rowCount: rows.length,
                truncated: (maxRows > 0 && rows.length >= maxRows)
            };
        }

        // Primary path: Optic API
        try {
            var plan = op.fromSQL(preparedSQL, qualifier);
        } catch (opticErr) {
            if (opticErr.message && opticErr.message.indexOf('privilege') !== -1) {
                throw new Error(
                    '[' + traceId + '] Optic API execution failed for user "' + currentUser + '": ' +
                    opticErr.message + '. ' +
                    'FIX: Grant the required Optic execute privileges to the role(s) of user "' + currentUser + '". ' +
                    'See https://docs.marklogic.com/guide/app-dev/OpticAPI for details.'
                );
            }
            throw opticErr;
        }

        if (maxRows && maxRows > 0) {
            plan = plan.limit(maxRows);
        }

        // Build the bindings map for result()
        var opBindings = buildOpticBindings(bindValues);

        var resultSequence = plan.result(null, opBindings);

        // Convert the Sequence to a JS array
        var resultRows = [];
        if (resultSequence) {
            resultRows = resultSequence.toArray();
        }

        var truncated = (maxRows && maxRows > 0 && resultRows.length >= maxRows);

        return {
            rows: resultRows,
            rowCount: resultRows.length,
            truncated: truncated
        };
    } catch (error) {
        throw new Error(
            '[' + traceId + '] Optic query execution failed. ' +
            'SQL: "' + preparedSQL.substring(0, 200) + '..." ' +
            'Error: ' + error.message
        );
    }
}

/**
 * Resolves a URI template for a single entity by substituting {attr} placeholders
 * with attribute values from the entity object.  If no placeholder is present or
 * the template ends with '/', a server-generated UUID is appended.
 *
 * @param {string} template - URI template, e.g. "/data/Paris/RoutingOutput/{matNr}.json"
 * @param {Object} entity   - Plain JS object (entity attributes).
 * @returns {string} Resolved URI.
 */
function resolveDocumentUri(template, entity) {
    var uri = template;

    // Replace every {attr} token with the entity's attribute value
    uri = uri.replace(/\{([^}]+)\}/g, function (match, attr) {
        var val = entity[attr];
        if (val === null || val === undefined) { return match; } // leave unresolved — will be caught below
        return String(val);
    });

    // If any placeholder remained unresolved (still contains '{'), or
    // if the template contained no placeholder at all, or if the result
    // ends with '/', append a UUID.
    var hasUnresolved = /\{[^}]+\}/.test(uri);
    var endsWithSlash = uri.charAt(uri.length - 1) === '/';
    var hadNoPlaceholder = !/\{[^}]+\}/.test(template);

    if (hasUnresolved || endsWithSlash || hadNoPlaceholder) {
        // Generate a UUID using available MarkLogic APIs or a fallback.
        // NOTE: fn.generateId() is intentionally NOT used — it requires a context item and
        // throws XDMP-MISSINGCONTEXT when called in a plain SJS evaluation context.
        var uuid;
        if (typeof sem !== 'undefined' && sem && typeof sem.uuidString === 'function') {
            uuid = sem.uuidString();
        } else if (typeof xdmp !== 'undefined' && xdmp && typeof xdmp.random === 'function') {
            uuid = String(xdmp.random()).replace(/\./g, '') + String(xdmp.random()).replace(/\./g, '');
        } else {
            // Node.js test environment fallback
            uuid = Date.now().toString(36) + Math.random().toString(36).substring(2);
        }
        if (hasUnresolved) {
            // Strip leftover {attr} tokens and append uuid
            uri = uri.replace(/\{[^}]+\}/g, '') + uuid;
        } else if (endsWithSlash || hadNoPlaceholder) {
            uri = uri.replace(/\/$/, '') + '/' + uuid + '.json';
        }
    }

    return uri;
}

/**
 * Writes Corticon entity objects to MarkLogic JSON documents using xdmp.documentInsert.
 *
 * Supports three modes driven by statementType:
 *   "insert" — create new document; throw if URI already exists
 *   "update" — read-then-merge into existing document; throw if URI absent
 *   "upsert" — read-then-merge if URI exists, create if not (default, no error)
 *
 * For "update" and "upsert" against an existing document, the entity attributes are
 * shallow-merged OVER the existing document (top-level keys only).  Fields present in
 * the MarkLogic document but absent from the Corticon entity are preserved.  Permissions
 * and collections from the existing document are carried forward unless the step
 * definition explicitly provides them.
 *
 * @param {Object[]} entities - Array of plain JS entity attribute objects to write.
 * @param {Object}   stepMeta - Prepared step metadata (statementType, documentUriTemplate, collections, traceId).
 * @param {string}   traceId  - Trace identifier for error context.
 * @returns {{ documentsWritten: number, uris: string[] }} Result summary.
 * @throws {Error} If a document operation fails (existence conflict, privilege error, etc.).
 */
/**
 * Returns a plain, serializable copy of a Corticon entity snapshot.
 *
 * Corticon attaches internal bookkeeping properties (__metadata, dataMgr, etc.)
 * to every entity object in the working memory snapshot.  These properties hold
 * circular references into the WM graph and will cause a stack overflow if passed
 * directly to xdmp.documentInsert().  This function produces a safe copy that
 * contains only own enumerable properties whose values are JSON primitives
 * (string, number, boolean, null).  Object/array-valued properties (associations,
 * Corticon internals) are omitted.
 *
 * @param {Object} entity - Raw Corticon entity from the WM snapshot.
 * @returns {Object} Clean, serializable attribute map.
 */
function sanitizeEntity(entity) {
    var clean = {};
    var keys = Object.keys(entity);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        // Skip known Corticon internal properties
        if (key === '__metadata' || key === 'dataMgr') { continue; }
        var val = entity[key];
        var t = typeof val;
        // Only copy JSON-primitive values; skip objects/arrays (may be circular)
        if (val === null || t === 'string' || t === 'number' || t === 'boolean') {
            clean[key] = val;
        } else if (t === 'object' && !Array.isArray(val)) {
            // Unwrap boxed primitives (new Number(), new String(), new Boolean())
            // and Corticon Decimal/wrapper types that implement valueOf()
            var prim = val.valueOf();
            var pt = typeof prim;
            if (prim !== val && (pt === 'string' || pt === 'number' || pt === 'boolean')) {
                clean[key] = prim;
            }
        }
    }
    return clean;
}

function executeDocumentWrite(entities, stepMeta, traceId) {
    var currentUser = (typeof xdmp !== 'undefined' && xdmp && typeof xdmp.getCurrentUser === 'function')
        ? xdmp.getCurrentUser() : 'unknown';

    var statementType = (stepMeta.statementType || 'upsert').toLowerCase();
    var uriTemplate   = stepMeta.documentUriTemplate;
    var collections   = stepMeta.collections || [];

    if (typeof xdmp !== 'undefined' && xdmp && typeof xdmp.log === 'function') {
        xdmp.log(
            '[' + traceId + '] executeDocumentWrite - user: ' + currentUser +
            ', op: ' + statementType +
            ', entities: ' + entities.length +
            ', uriTemplate: ' + uriTemplate,
            'info'
        );
    }

    var uris = [];
    var documentsWritten = 0;

    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];

        try {
            var uri = resolveDocumentUri(uriTemplate, entity);
            var docExists = false;
            var existingContent = null;
            var existingPerms = null;
            var existingColls = null;

            // --- existence check and read (for update/upsert) ---
            if (typeof fn !== 'undefined' && fn && typeof fn.exists === 'function') {
                docExists = fn.exists(fn.doc(uri));
            }

            if (statementType === 'insert') {
                if (docExists) {
                    throw new Error(
                        '[' + traceId + '] Insert failed: document already exists at "' + uri + '". ' +
                        'Use statementType "upsert" to create-or-update.'
                    );
                }
            } else if (statementType === 'update') {
                if (!docExists) {
                    throw new Error(
                        '[' + traceId + '] Update failed: no document exists at "' + uri + '". ' +
                        'Use statementType "upsert" to create-or-update.'
                    );
                }
            }
            // upsert: no error either way

            // --- read existing doc for merge (update / upsert when exists) ---
            // sanitizeEntity strips Corticon internals (__metadata, dataMgr) and
            // any object/array values that may contain circular WM references.
            var safeEntity = sanitizeEntity(entity);
            var contentToWrite = safeEntity;
            if (docExists && (statementType === 'update' || statementType === 'upsert')) {
                existingContent  = fn.head(fn.doc(uri)).toObject();
                existingPerms    = xdmp.documentGetPermissions(uri);
                existingColls    = xdmp.documentGetCollections(uri).toArray
                    ? xdmp.documentGetCollections(uri).toArray()
                    : Array.from(xdmp.documentGetCollections(uri));

                // Shallow merge: overlay sanitized Corticon attributes over existing doc
                contentToWrite = {};
                var eKeys = Object.keys(existingContent);
                for (var ek = 0; ek < eKeys.length; ek++) {
                    contentToWrite[eKeys[ek]] = existingContent[eKeys[ek]];
                }
                var safeKeys = Object.keys(safeEntity);
                for (var nk = 0; nk < safeKeys.length; nk++) {
                    contentToWrite[safeKeys[nk]] = safeEntity[safeKeys[nk]];
                }
            }

            // --- resolve permissions and collections ---
            var permsToUse;
            if (existingPerms) {
                permsToUse = existingPerms;
            } else {
                permsToUse = (typeof xdmp !== 'undefined' && xdmp && typeof xdmp.defaultPermissions === 'function')
                    ? xdmp.defaultPermissions()
                    : [];
            }

            var collsToUse = (collections && collections.length > 0)
                ? collections
                : (existingColls || []);

            // --- before-write diagnostic log ("SQL with values" equivalent for writes) ---
            if (typeof xdmp !== 'undefined' && xdmp && typeof xdmp.log === 'function') {
                var actionDesc;
                if (statementType === 'insert') {
                    actionDesc = 'create (new)';
                } else if (statementType === 'update') {
                    actionDesc = 'merge-update (existing)';
                } else {
                    actionDesc = docExists ? 'merge-update (existing)' : 'create (new)';
                }
                var fieldNames = Object.keys(contentToWrite);
                xdmp.log(
                    '[' + traceId + '] executeDocumentWrite [' + (i + 1) + '/' + entities.length + ']' +
                    ' URI: ' + uri +
                    ' | action: ' + actionDesc +
                    ' | collections: [' + collsToUse.join(', ') + ']' +
                    ' | fields (' + fieldNames.length + '): ' + fieldNames.join(', '),
                    'info'
                );
            }

            // --- write ---
            xdmp.documentInsert(uri, contentToWrite, permsToUse, collsToUse);

            uris.push(uri);
            documentsWritten++;

            if (typeof xdmp !== 'undefined' && xdmp && typeof xdmp.log === 'function') {
                xdmp.log(
                    '[' + traceId + '] executeDocumentWrite - wrote: ' + uri +
                    ' (' + statementType + ')',
                    'info'
                );
            }
        } catch (writeErr) {
            if (writeErr.message && writeErr.message.indexOf('[' + traceId + ']') === 0) {
                throw writeErr; // re-throw our own structured errors
            }
            if (writeErr.message && writeErr.message.indexOf('privilege') !== -1) {
                throw new Error(
                    '[' + traceId + '] documentInsert failed for user "' + currentUser + '": ' +
                    writeErr.message + '. ' +
                    'FIX: Grant the xdmp-update execute privilege to the role(s) of user "' + currentUser + '".'
                );
            }
            throw new Error(
                '[' + traceId + '] Write failed for URI "' + uri + '": ' + writeErr.message
            );
        }
    }

    if (typeof xdmp !== 'undefined' && xdmp && typeof xdmp.log === 'function') {
        xdmp.log(
            '[' + traceId + '] executeDocumentWrite - completed: ' + documentsWritten + ' document(s) written',
            'info'
        );
    }

    return { documentsWritten: documentsWritten, uris: uris };
}

/**
 * Builds Optic-compatible bindings from the resolved bind values map.
 *
 * @param {Object} bindValues - Map of param name -> scalar or array.
 * @returns {Object} Optic-compatible bindings object.
 */
function buildOpticBindings(bindValues) {
    if (!bindValues) {
        return {};
    }

    var opBindings = {};
    var keys = Object.keys(bindValues);

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = bindValues[key];

        if (Array.isArray(val)) {
            // For IN clauses, MarkLogic Optic accepts array values
            // passed as Sequence via xdmp.arrayValues or as JS arrays
            opBindings[key] = val;
        } else {
            opBindings[key] = val;
        }
    }

    return opBindings;
}

// ============================================================================
// BindingInferrer - auto-derives binding metadata from SQL placeholders
// ============================================================================

/**
 * Converts a dot-separated placeholder name to a camelCase param name.
 * Examples:
 *   "Product.Id"       → "productId"
 *   "Part.Number"      → "partNumber"
 *   "Order.LineItem.Sku" → "orderLineItemSku"
 *   "status"           → "status"
 *
 * @param {string} placeholder - Dot-separated placeholder name.
 * @returns {string} camelCase param name safe for use as @param in SQL.
 */
function placeholderToParamName(placeholder) {
    var parts = placeholder.split('.');
    var result = '';
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        if (part.length === 0) continue;
        if (i === 0) {
            // First segment: lowercase first char
            result += part.charAt(0).toLowerCase() + part.substring(1);
        } else {
            // Subsequent segments: uppercase first char (camelCase join)
            result += part.charAt(0).toUpperCase() + part.substring(1);
        }
    }
    return result;
}

/**
 * Determines whether a placeholder appears inside an IN (...) clause in the SQL.
 *
 * @param {string} sql         - The SQL statement.
 * @param {string} placeholder - The placeholder name (without braces).
 * @returns {boolean} True if the placeholder is used inside an IN clause.
 */
function isInClausePlaceholder(sql, placeholder) {
    // Escape special regex chars in the placeholder name
    var escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match: IN followed by optional whitespace, open paren, optional whitespace,
    // then the {Placeholder} token (with optional whitespace inside braces)
    var pattern = new RegExp('\\bIN\\s*\\(\\s*\\{\\s*' + escaped + '\\s*\\}', 'i');
    return pattern.test(sql);
}

/**
 * Infers the TDE view qualifier from the SQL statement by extracting
 * the first table name from the FROM clause.
 *
 * Examples:
 *   "SELECT * FROM Products WHERE ..."            → "Products"
 *   "SELECT * FROM myschema.Products WHERE ..."   → "myschema.Products"
 *   "SELECT * FROM Parts JOIN Orders ON ..."      → "Parts"
 *
 * @param {string} sql - SQL statement.
 * @returns {string|null} The inferred qualifier, or null if not found.
 */
function inferQualifier(sql) {
    if (!sql || typeof sql !== 'string') {
        return null;
    }
    var match = sql.match(/\bFROM\s+([A-Za-z_][A-Za-z0-9_.]*)/i);
    return match ? match[1] : null;
}

/**
 * Infers binding metadata from a SQL statement by parsing {Placeholder} tokens.
 *
 * For each placeholder found:
 * - `placeholder` is the raw name from `{...}`
 * - `param` is a camelCase version of the name (safe for @param)
 * - `cardinality` is "many" if inside IN(...), otherwise "one"
 * - `type` defaults to "xs:string"
 * - `required` defaults to false (auto-inferred placeholders are optional;
 *   if the value is missing in working memory the step is skipped gracefully
 *   rather than throwing. Set required: true explicitly in the query
 *   definition's bindings array when a value MUST be present.)
 *
 * @param {string} sql     - SQL statement with {Placeholder} tokens.
 * @param {string} traceId - Trace identifier for error context.
 * @returns {Object[]} Array of inferred binding metadata objects.
 */
function inferBindings(sql, traceId) {
    if (!sql || typeof sql !== 'string') {
        return [];
    }

    var placeholders = extractPlaceholders(sql);

    // Check for duplicate param names that could result from different placeholders
    var paramNameMap = {};
    var bindings = [];

    for (var i = 0; i < placeholders.length; i++) {
        var ph = placeholders[i];
        var paramName = placeholderToParamName(ph);
        var cardinality = isInClausePlaceholder(sql, ph) ? 'many' : 'one';

        // Handle potential param name collision
        if (paramNameMap[paramName] !== undefined) {
            // Append numeric suffix
            var suffix = 2;
            while (paramNameMap[paramName + suffix] !== undefined) {
                suffix++;
            }
            paramName = paramName + suffix;
        }
        paramNameMap[paramName] = true;

        bindings.push({
            placeholder: ph,
            param: paramName,
            type: 'xs:string',
            cardinality: cardinality,
            // IN clause placeholders are required: an empty IN() is invalid SQL.
            // Equality/scalar placeholders remain optional — a null binding triggers
            // the short-circuit path rather than an error.
            required: cardinality === 'many'
        });
    }

    return bindings;
}

/**
 * Merges user-provided (partial) bindings with inferred bindings.
 * User-provided fields take precedence; inferred values fill in gaps.
 *
 * This allows users to override specific fields (e.g., type, cardinality)
 * while still benefiting from auto-inference for everything else.
 *
 * @param {Object[]} userBindings     - Partial binding metadata from query def (may be sparse).
 * @param {Object[]} inferredBindings - Fully populated inferred bindings.
 * @returns {Object[]} Merged binding metadata array.
 */
function mergeBindings(userBindings, inferredBindings) {
    if (!userBindings || !Array.isArray(userBindings) || userBindings.length === 0) {
        return inferredBindings;
    }

    // Index inferred bindings by placeholder
    var inferredByPh = {};
    for (var i = 0; i < inferredBindings.length; i++) {
        inferredByPh[inferredBindings[i].placeholder] = inferredBindings[i];
    }

    // For each user binding, merge with inferred defaults
    var merged = [];
    var usedPlaceholders = {};

    for (var j = 0; j < userBindings.length; j++) {
        var user = userBindings[j];
        var ph = user.placeholder;
        if (!ph) continue;

        usedPlaceholders[ph] = true;
        var inferred = inferredByPh[ph] || {};

        merged.push({
            placeholder: ph,
            param: user.param || inferred.param || placeholderToParamName(ph),
            type: user.type || inferred.type || 'xs:string',
            cardinality: user.cardinality || inferred.cardinality || 'one',
            required: user.required !== undefined ? user.required : (inferred.required !== undefined ? inferred.required : false)
        });
    }

    // Add any inferred bindings that the user didn't mention at all
    for (var k = 0; k < inferredBindings.length; k++) {
        if (!usedPlaceholders[inferredBindings[k].placeholder]) {
            merged.push(inferredBindings[k]);
        }
    }

    return merged;
}

// ============================================================================
// Module exports - namespaced by sub-module for clear usage
// ============================================================================

module.exports = {

    DebugLogger: {
        createLogger: createLogger
    },

    Validators: {
        validateSelectOnly: validateSelectOnly,
        validateWriteStep: validateWriteStep,
        validateAllowedViews: validateAllowedViews,
        validateMaxRows: validateMaxRows,
        validateBindingConsistency: validateBindingConsistency,
        validateQueryDefinition: validateQueryDefinition,
        ABSOLUTE_MAX_ROWS: ABSOLUTE_MAX_ROWS
    },

    QueryRegistry: {
        getQueryDefinition: getQueryDefinition,
        resolveUri: resolveUri,
        QUERY_URI_PREFIX: QUERY_URI_PREFIX,
        QUERY_URI_SUFFIX: QUERY_URI_SUFFIX
    },

    PlaceholderResolver: {
        resolveBindings: resolveBindings,
        resolvePath: resolvePath,
        getBindingSummary: getBindingSummary
    },

    SqlRewriter: {
        rewrite: rewriteSql,
        extractPlaceholders: extractPlaceholders,
        extractParamNames: extractParamNames
    },

    OpticExecutor: {
        execute: executeOptic,
        executeDocumentWrite: executeDocumentWrite,
        resolveDocumentUri: resolveDocumentUri
    },

    BindingInferrer: {
        inferBindings: inferBindings,
        mergeBindings: mergeBindings,
        placeholderToParamName: placeholderToParamName,
        isInClausePlaceholder: isInClausePlaceholder,
        inferQualifier: inferQualifier
    }
};
