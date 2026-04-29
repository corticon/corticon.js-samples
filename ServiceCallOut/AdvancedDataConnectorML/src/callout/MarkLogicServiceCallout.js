const MarkLogicQueryConnector = require('./MarkLogicQueryConnector');

const MarkLogicServiceCallout = {
    func: 'executeQueryCallout',
    type: 'ServiceCallout',
    description: {'en_US': 'Executes a parameterized SQL query against MarkLogic TDE views and enriches the Corticon payload with the results.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'AdvancedDataConnectorML'}
};

/**
 * Main function invoked by the Corticon.js ruleflow.
 *
 * Auto-detects the runtime environment:
 * - MarkLogic SJS (typeof xdmp !== 'undefined') → synchronous production path
 * - Node.js / Corticon Studio                   → async proxy path via HTTP to MarkLogic
 *
 * @param {Object} corticonDataManager      - Corticon data manager instance.
 * @param {Object} serviceCalloutProperties - Runtime properties configured in Corticon.js Studio.
 */
function executeQueryCallout(corticonDataManager, serviceCalloutProperties) {
    if (typeof xdmp !== 'undefined') {
        return executeQueryCalloutML(corticonDataManager, serviceCalloutProperties);
    }
    return executeQueryCalloutProxy(corticonDataManager, serviceCalloutProperties);
}

/**
 * Production path — runs inside MarkLogic's SJS engine (synchronous).
 * This is the original executeQueryCallout body, unchanged.
 *
 * @param {Object} corticonDataManager      - Corticon data manager instance.
 * @param {Object} serviceCalloutProperties - Runtime properties configured in Corticon.js Studio.
 */
function executeQueryCalloutML(corticonDataManager, serviceCalloutProperties) {
    // declareUpdate() must be called before any xdmp.documentInsert() (or other
    // update API).  It must be called before ANY read operations in the same
    // transaction — placing it here as the first statement satisfies that.
    // The guard keeps this safe in the Node.js test environment where declareUpdate
    // is not defined.  Read-only (SELECT-only) ruleflows are unaffected: update
    // transactions can still perform reads.
    if (typeof declareUpdate === 'function') { declareUpdate(); }

    var logger = corticonDataManager.getLogger();

    logger.logDebug('*** MarkLogicServiceCallout.js -> Function executeQueryCallout - Starting ADC query callout');

    try {
        // --- Resolve queryName from working memory (QueryConfig entity) ---
        // The rule author sets QueryConfig.queryName in a rulesheet before the SCO fires.
        // Falls back to serviceCalloutProperties if no QueryConfig entity is found.
        var mergedProps = resolveQueryConfig(corticonDataManager, serviceCalloutProperties, logger);

        // Execute the full query set (single-step or multi-step).
        // The writeResultsFn callback is invoked after each step to write
        // results into Corticon working memory, so the next step in the
        // sequence can reference them via SQL placeholders.
        // This mirrors the Java ADC's SEQUENCE-driven execution loop.
        var summary = MarkLogicQueryConnector.executeQuerySet(
            corticonDataManager,
            mergedProps,
            logger,
            writeStepResults     // callback for writing each step's results to WM
        );

        logger.logDebug('*** ADC [' + (summary.config ? summary.config.traceId : '?') + '] SCO finished in ' +
            (summary.totalMs || '?') + 'ms - ' + summary.stepsExecuted + ' step(s), ' + summary.totalRows + ' row(s)');

    } catch (error) {
        logger.logDebug('*** MarkLogicServiceCallout.js -> Function executeQueryCallout - Error in query set execution');
        logger.logError('*** MarkLogicServiceCallout.js -> Error in executeQueryCallout: ' + error.message);
        throw error;
    }
}

// =============================================================================
// Studio Proxy Path — async Node.js HTTP proxy to MarkLogic
// =============================================================================

/**
 * Loads the MarkLogicStudioConfig.js credentials file via indirect require
 * (defeats Corticon's browserify-based bundler AST analysis). Returns null
 * if not found. The module path is built from an array — detective cannot
 * resolve array element access, same pattern as MarkLogicQueryLibrary.js
 * lines 38-57 for the Optic API require.
 *
 * Tries two paths because the bundled decisionservicerules.js runs from
 * the dist/ subdirectory, while MarkLogicStudioConfig.js is copied to
 * the parent DecisionServices/DSx_nnn/ directory by Corticon Studio.
 */
function loadStudioConfig() {
    var _req = require;
    var paths = [
        './' + 'MarkLogicStudioConfig',   // same directory (unbundled / Node.js direct)
        '../' + 'MarkLogicStudioConfig'    // parent directory (bundle runs from dist/)
    ];
    for (var i = 0; i < paths.length; i++) {
        try {
            var cfg = _req(paths[i]);
            if (cfg) { return cfg; }
        } catch (e) { /* try next path */ }
    }
    return null;
}

/**
 * Serializes a Corticon entity to a plain JSON-safe object.
 * Strips __metadata, dataMgr, and other non-primitive properties that would
 * cause circular reference errors in JSON.stringify.
 * Recurses into nested objects and arrays (associations added by prior SCO
 * calls via addAssociationsToEntity) so that multi-level placeholder paths
 * like {Products.beltRoutingRequirements.routingCode} survive serialization.
 * Depth-limited to prevent infinite recursion from circular references.
 */
function sanitizeForJson(entity, depth) {
    if (depth === undefined) { depth = 0; }
    if (depth > 6 || entity === null || typeof entity !== 'object') { return entity; }

    if (Array.isArray(entity)) {
        var arr = [];
        for (var ai = 0; ai < entity.length; ai++) {
            arr.push(sanitizeForJson(entity[ai], depth + 1));
        }
        return arr;
    }

    var clean = {};
    var keys = Object.keys(entity);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === '__metadata' || key === 'dataMgr') { continue; }
        var val = entity[key];
        var t = typeof val;
        if (val === null || t === 'string' || t === 'number' || t === 'boolean') {
            clean[key] = val;
        } else if (Array.isArray(val)) {
            clean[key] = sanitizeForJson(val, depth + 1);
        } else if (t === 'object') {
            var prim = val.valueOf();
            var pt = typeof prim;
            if (prim !== val && (pt === 'string' || pt === 'number' || pt === 'boolean')) {
                clean[key] = prim;
            } else {
                clean[key] = sanitizeForJson(val, depth + 1);
            }
        }
    }
    return clean;
}

/**
 * Snapshots the Corticon working memory into a plain JSON object keyed by
 * entity type name. Each entity is sanitized for safe serialization.
 */
function buildWmSnapshot(corticonDataManager) {
    var snapshot = {};
    var rawTypes = (typeof corticonDataManager.getEntityTypes === 'function')
        ? corticonDataManager.getEntityTypes()
        : [];
    var types = rawTypes && typeof rawTypes[Symbol.iterator] === 'function'
        ? Array.from(rawTypes)
        : [];
    for (var i = 0; i < types.length; i++) {
        var typeName = types[i];
        var rawEntities = corticonDataManager.getEntitiesByType(typeName);
        var entities = rawEntities && typeof rawEntities[Symbol.iterator] === 'function'
            ? Array.from(rawEntities)
            : [];
        if (entities.length > 0) {
            snapshot[typeName] = [];
            for (var j = 0; j < entities.length; j++) {
                snapshot[typeName].push(sanitizeForJson(entities[j]));
            }
        }
    }
    return snapshot;
}

/**
 * Performs an HTTP(S) request returning a Promise.
 * Supports digest and basic auth. No npm dependencies — uses Node.js built-in
 * http/https and crypto modules.
 *
 * @param {Object} config  - Studio config (host, port, user, password, authType, ssl, evalPath).
 * @param {Object} payload - Request body (will be JSON.stringified).
 * @returns {Promise<Object>} Parsed JSON response.
 */
function httpPost(config, payload) {
    // Indirect require defeats Corticon's Java bundler static analysis.
    // Direct require('http') / require('https') / require('crypto') would cause
    // the bundler to attempt to include Node.js built-ins, corrupting the bundle.
    var _req = require;
    var httpModule = config.ssl ? _req('https') : _req('http');
    var bodyStr = JSON.stringify(payload);

    function doRequest(extraHeaders) {
        return new Promise(function (resolve, reject) {
            var headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr)
            };
            if (extraHeaders) {
                for (var h in extraHeaders) {
                    if (extraHeaders.hasOwnProperty(h)) { headers[h] = extraHeaders[h]; }
                }
            }
            var opts = {
                hostname: config.host,
                port: config.port,
                path: config.evalPath,
                method: 'POST',
                headers: headers
            };
            var req = httpModule.request(opts, function (res) {
                var chunks = [];
                res.on('data', function (chunk) { chunks.push(chunk); });
                res.on('end', function () {
                    var raw = Buffer.concat(chunks).toString('utf8');
                    resolve({ statusCode: res.statusCode, headers: res.headers, body: raw });
                });
            });
            req.on('error', function (err) { reject(err); });
            req.write(bodyStr);
            req.end();
        });
    }

    if (config.authType === 'basic') {
        var cred = Buffer.from(config.user + ':' + config.password).toString('base64');
        return doRequest({ 'Authorization': 'Basic ' + cred }).then(function (res) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                return JSON.parse(res.body);
            }
            throw new Error('MarkLogic HTTP ' + res.statusCode + ': ' + res.body);
        });
    }

    // Digest auth: send initial request without auth, handle 401 challenge
    return doRequest().then(function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            return JSON.parse(res.body);
        }
        if (res.statusCode !== 401 || !res.headers['www-authenticate']) {
            throw new Error('MarkLogic HTTP ' + res.statusCode + ': ' + res.body);
        }

        // Parse digest challenge
        var challenge = res.headers['www-authenticate'];
        var _req2 = require;
        var crypto = _req2('crypto');
        var realm = (challenge.match(/realm="([^"]*)"/) || [])[1] || '';
        var nonce = (challenge.match(/nonce="([^"]*)"/) || [])[1] || '';
        var qop   = (challenge.match(/qop="([^"]*)"/)   || [])[1] || 'auth';
        var opaque = (challenge.match(/opaque="([^"]*)"/) || [])[1] || '';

        function md5(str) { return crypto.createHash('md5').update(str).digest('hex'); }

        var nc = '00000001';
        var cnonce = crypto.randomBytes(8).toString('hex');
        var ha1 = md5(config.user + ':' + realm + ':' + config.password);
        var ha2 = md5('POST:' + config.evalPath);
        var response = md5(ha1 + ':' + nonce + ':' + nc + ':' + cnonce + ':' + qop + ':' + ha2);

        var authHeader = 'Digest username="' + config.user + '"' +
            ', realm="' + realm + '"' +
            ', nonce="' + nonce + '"' +
            ', uri="' + config.evalPath + '"' +
            ', qop=' + qop +
            ', nc=' + nc +
            ', cnonce="' + cnonce + '"' +
            ', response="' + response + '"' +
            (opaque ? ', opaque="' + opaque + '"' : '');

        return doRequest({ 'Authorization': authHeader });
    }).then(function (res) {
        // Second response (after digest auth) or pass-through from first (basic)
        if (res && res.statusCode !== undefined) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                return JSON.parse(res.body);
            }
            throw new Error('MarkLogic HTTP ' + res.statusCode + ' (after digest auth): ' + res.body);
        }
        return res; // already parsed JSON from basic auth path
    });
}

/**
 * Studio proxy path — runs in Node.js (Corticon Studio test facility).
 * HTTP-POSTs the query config and WM snapshot to MarkLogic, receives step
 * results, and writes them into Corticon working memory using writeStepResults.
 *
 * Returns a Promise (Corticon supports Promise-returning SCOs).
 * Uses ES5 Promise chains — no async/await — because Corticon 2.4's
 * uglifyify bundler transform does not support ES2017+ syntax and will
 * silently corrupt the bundle output.
 *
 * @param {Object} corticonDataManager      - Corticon data manager instance.
 * @param {Object} serviceCalloutProperties - Runtime SCO properties.
 * @returns {Promise<void>}
 */
function executeQueryCalloutProxy(corticonDataManager, serviceCalloutProperties) {
    var logger = corticonDataManager.getLogger();
    var startMs = Date.now();

    logger.logDebug('*** ADC [PROXY] Running in Node.js — routing to Studio proxy');

    // Load credentials
    var studioConfig = loadStudioConfig();
    if (!studioConfig) {
        var msg = '*** ADC [PROXY] MarkLogicStudioConfig.js not found. ' +
            'Ensure MarkLogicStudioConfig.js is listed in the Corticon.js Extensions ' +
            'for this project. Copy MarkLogicStudioConfig.template.js to ' +
            'MarkLogicStudioConfig.js and fill in your MarkLogic credentials.';
        logger.logError(msg);
        return Promise.reject(new Error(msg));
    }

    logger.logDebug('*** ADC [PROXY] Config: host=' + studioConfig.host +
        ', port=' + studioConfig.port + ', authType=' + (studioConfig.authType || 'digest'));

    // Resolve query config (pure JS — works in Node.js)
    var mergedProps = resolveQueryConfig(corticonDataManager, serviceCalloutProperties, logger);
    var queryName   = mergedProps.queryName   || null;
    var ruleProject = mergedProps.ruleProject || null;
    var queryUri    = mergedProps.queryUri    || null;
    var debug       = mergedProps.debug       || false;
    var traceId     = mergedProps.traceId     || ('proxy-' + Date.now());

    logger.logDebug('*** ADC [PROXY] queryName=' + queryName + ', ruleProject=' + ruleProject);

    // Snapshot working memory
    var wmSnapshot = buildWmSnapshot(corticonDataManager);
    var typeCount = Object.keys(wmSnapshot).length;
    var entityCount = 0;
    for (var t in wmSnapshot) {
        if (wmSnapshot.hasOwnProperty(t)) { entityCount += wmSnapshot[t].length; }
    }
    logger.logDebug('*** ADC [PROXY] WM snapshot: ' + typeCount + ' entity types, ' + entityCount + ' total entities');

    // Build request payload
    var requestPayload = {
        queryName:   queryName,
        ruleProject: ruleProject,
        queryUri:    queryUri,
        debug:       debug,
        traceId:     traceId,
        wmSnapshot:  wmSnapshot
    };

    var bodySize = JSON.stringify(requestPayload).length;
    var url = (studioConfig.ssl ? 'https' : 'http') + '://' + studioConfig.host +
        ':' + studioConfig.port + studioConfig.evalPath;
    logger.logDebug('*** ADC [PROXY] POST ' + url + ' (' + bodySize + ' bytes)');

    // Execute HTTP request and process response via Promise chain
    return httpPost(studioConfig, requestPayload).then(function (response) {
        var httpMs = Date.now() - startMs;
        logger.logDebug('*** ADC [PROXY] HTTP 200 — response in ' + httpMs + 'ms');

        // Check for server-side error
        if (response.error) {
            var serverErr = '*** ADC [PROXY] MarkLogic server error: ' + (response.message || 'unknown');
            logger.logError(serverErr);
            throw new Error(serverErr);
        }

        // Echo server-side debug log entries to Studio console
        if (response.debugLog && response.debugLog.entries) {
            var entries = response.debugLog.entries;
            for (var di = 0; di < entries.length; di++) {
                var entry = entries[di];
                if (entry.level === 'error') {
                    logger.logError('*** ADC [PROXY-ML] ' + entry.msg);
                } else {
                    logger.logDebug('*** ADC [PROXY-ML] ' + entry.msg);
                }
            }
        }

        // Write each step's results into Corticon working memory
        var steps = response.steps || [];
        var writtenCache = {};
        var totalRows = 0;

        for (var si = 0; si < steps.length; si++) {
            var step = steps[si];
            var rows = step.rows || [];
            var stepMeta = step.stepMeta || {};
            totalRows += rows.length;

            logger.logDebug('*** ADC [PROXY] Step ' + (si + 1) + ': ' + rows.length + ' row(s)');

            // Strip null values from rows. In production, Optic omits NULL columns
            // entirely (key absent). After JSON round-trip, NULLs become explicit
            // JS null. Corticon's addAssociationsToEntity passes these through to
            // entity attributes, and Studio's Java TestJSONImport then tries
            // new BigDecimal("null") for Decimal-typed attributes → crash.
            // IMPORTANT: call writeStepResults even for 0-row results — NOT skipping it.
            // If we skip it, the writtenCache entry for this step is never seeded (even
            // as an empty array). A downstream step using foreignKey+parentKey then finds
            // NO entry in the cache and fires a misleading "QUERY DEFINITION ERROR" when
            // the real problem is this step returned 0 rows (e.g. because a binding like
            // {Products.bOMComponents.x} resolved to nothing due to a prior SCO failure).
            var cleanRows = [];
            for (var cr = 0; cr < rows.length; cr++) {
                cleanRows.push(stripNullsDeep(rows[cr]));
            }
            writeStepResults(cleanRows, stepMeta, corticonDataManager, logger, writtenCache);
        }

        var totalMs = Date.now() - startMs;
        logger.logDebug('*** ADC [PROXY] Finished in ' + totalMs + 'ms — ' +
            steps.length + ' step(s), ' + totalRows + ' row(s)');

        // Log summary if available
        if (response.summary) {
            logger.logDebug('*** ADC [PROXY] Server-side: ' + response.summary.stepsExecuted +
                ' step(s), ' + response.summary.totalRows + ' row(s), ' + response.summary.totalMs + 'ms');
        }
    }).catch(function (httpErr) {
        var errMsg = '*** ADC [PROXY] HTTP failed (URL: ' + url + '): ' + httpErr.message +
            '. Check MarkLogic at ' + studioConfig.host + ':' + studioConfig.port +
            ' and StudioProxyService.sjs deployment.';
        logger.logError(errMsg);
        throw new Error(errMsg);
    });
}

/**
 * Resolves queryName (and optionally ruleProject) from working memory (QueryConfig entity)
 * with fallback to serviceCalloutProperties. Merges any QueryConfig attributes into the
 * properties object so downstream code (buildConfig) works unchanged.
 *
 * Resolution priority for each property:
 *   1. QueryConfig entity in working memory (set by rule author in a rulesheet)
 *   2. SCO Runtime Properties pane in Corticon Studio (static, embedded in bundle)
 *
 * Supported SCO Runtime Properties:
 *   - queryName    {string}  Query definition ID, e.g. "product-lookup"
 *   - ruleProject  {string}  Rule project folder name; together with queryName resolves
 *                            to /queries/{ruleProject}/{queryName}.json in MarkLogic.
 *                            Omit to use the legacy flat layout /queries/{queryName}.json.
 *   - queryUri     {string}  Direct document URI — bypasses queryName/ruleProject entirely.
 *   - debug        {boolean} Enable verbose debug logging.
 *
 * @param {Object} corticonDataManager      - Corticon data manager instance.
 * @param {Object} serviceCalloutProperties - Runtime SCO properties.
 * @param {Object} logger                   - Corticon logger.
 * @returns {Object} Merged properties with queryName and ruleProject resolved.
 */
function resolveQueryConfig(corticonDataManager, serviceCalloutProperties, logger) {
    var props = {};
    // Copy existing SCO properties as baseline
    if (serviceCalloutProperties) {
        for (var key in serviceCalloutProperties) {
            if (serviceCalloutProperties.hasOwnProperty(key)) {
                props[key] = serviceCalloutProperties[key];
            }
        }
    }

    // Look for a QueryConfig entity in working memory (set by rule author)
    var queryConfigEntity = findEntity('QueryConfig', corticonDataManager, logger);
    if (queryConfigEntity && queryConfigEntity.queryName) {
        logger.logDebug('*** MarkLogicServiceCallout.js -> resolveQueryConfig - [WM] Using QueryConfig.queryName from working memory: "' + queryConfigEntity.queryName + '"');
        props.queryName = queryConfigEntity.queryName;

        // Also pick up optional overrides from the QueryConfig entity
        if (queryConfigEntity.queryUri)      { props.queryUri     = queryConfigEntity.queryUri; }
        if (queryConfigEntity.ruleProject)   { props.ruleProject  = queryConfigEntity.ruleProject; }
        if (queryConfigEntity.debug != null) { props.debug        = queryConfigEntity.debug; }
    } else if (props.queryName) {
        // No QueryConfig entity in WM — fall back to SCO Runtime Properties (set in Studio Properties pane)
        var resolvedUri = props.ruleProject
            ? '/queries/' + props.ruleProject + '/' + props.queryName + '.json'
            : '/queries/' + props.queryName + '.json';
        logger.logDebug('*** MarkLogicServiceCallout.js -> resolveQueryConfig - [SCO] No QueryConfig entity in working memory; using SCO Runtime Properties: queryName="' + props.queryName + '"' + (props.ruleProject ? ', ruleProject="' + props.ruleProject + '"' : ' (no ruleProject; using legacy flat URI)') + ' → ' + resolvedUri);
    } else if (props.queryUri) {
        logger.logDebug('*** MarkLogicServiceCallout.js -> resolveQueryConfig - [SCO] No QueryConfig entity in working memory; using direct queryUri from SCO Runtime Properties: "' + props.queryUri + '"');
    } else {
        logger.logDebug('*** MarkLogicServiceCallout.js -> resolveQueryConfig - No queryName found in working memory (QueryConfig entity) or SCO Runtime Properties. ' +
            'Set either QueryConfig.queryName (and optionally QueryConfig.ruleProject) in a rulesheet, ' +
            'or add "queryName" and "ruleProject" properties in the Runtime Properties pane.');
    }

    return props;
}

/**
 * Callback invoked by executeQuerySet after each step to write results
 * into Corticon working memory. Supports the following placement modes:
 *
 *   1. addAsTopLevelEntity — Creates result rows as new top-level entities of
 *      this Corticon vocabulary type via addEntitiesAndAssociations.
 *
 *   2. addToExistingEntity (standard, no foreignKey) — Attaches result rows as
 *      children under roleName to an existing top-level PARENT entity in WM via
 *      addAssociationsToEntity. When addToExistingEntity type is not found
 *      directly, attempts inference from SQL binding placeholders.
 *
 *   3. addToExistingEntity (deferred nested write, any depth) — Supports
 *      arbitrary N-level entity hierarchies in a single WM write.
 *
 *      When the look-ahead in executeQuerySet detects that step N+1 will
 *      consume step N's output via foreignKey/parentKey, step N is flagged
 *      deferWrite=true.  This applies recursively: step N-1 may itself be
 *      consumed by step N, making step N both a consumer (merging children
 *      into its cached rows) AND a producer (also deferWrite=true, updating
 *      the cache with enriched rows and not yet writing to WM).
 *
 *      Only the leaf step (the deepest consumer, deferWrite=false) triggers
 *      the actual WM write.  It walks the writtenCache ancestry chain up to
 *      the WM-anchored grandparent and flushes the entire enriched tree in
 *      ONE addAssociationsToEntity call.
 *
 *      KEY INSIGHT — Corticon.js entity management limitations:
 *      - Entities created by addAssociationsToEntity are NOT retrievable as
 *        live refs: getEntitiesByType only returns top-level entities, and
 *        getAssociationsForEntity returns plain JSON copies (not live refs
 *        usable as parents in subsequent addAssociationsToEntity calls).
 *      - The single combined payload call registers all associations in the
 *        same data layer as the top-level anchor entity, so they survive
 *        removeDataLayer() cleanup in branch containers.
 *
 *      writtenCache structure:
 *        "ParentType.roleName"         → current rows[] (flat or already-enriched)
 *        "__anc__.ParentType.roleName" → { parentCacheKey } (ancestry for walk-up)
 *
 *   4. Cross-SCO live-entity fallback — When foreignKey+parentKey are set but
 *      no writtenCache entry exists (parent was written by a different SCO call),
 *      falls back to getAllEntitiesOfType + FK matching.
 *
 * @param {Object[]} rows                - Result rows from the step.
 * @param {Object}   stepMeta            - Prepared step metadata.
 * @param {Object}   corticonDataManager - Corticon data manager.
 * @param {Object}   logger              - Corticon logger.
 * @param {Object}   [writtenCache]      - Accumulated step-results cache from executeQuerySet.
 */
function writeStepResults(rows, stepMeta, corticonDataManager, logger, writtenCache) {
    var qn = stepMeta.queryName ? ' [' + stepMeta.queryName + ']' : '';
    var stepLabel = 'Step ' + (stepMeta.stepIndex + 1) + ' (seq ' + stepMeta.sequenceNo + ')' + qn;

    // Write steps (insert/update/upsert) are handled entirely inside executeStep
    // via xdmp.documentInsert — they produce no result rows and have no Corticon
    // entity-mapping fields.  Skip all WM write logic entirely.
    var WRITE_TYPES = ['insert', 'update', 'upsert'];
    if (WRITE_TYPES.indexOf(stepMeta.statementType) !== -1) {
        logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel + ' - Write step: no WM write needed');
        return;
    }

    var addToExistingEntity  = stepMeta.addToExistingEntity  || null;
    var roleName             = stepMeta.roleName             || 'results';
    var addAsTopLevelEntity  = stepMeta.addAsTopLevelEntity  || null;
    var foreignKey           = stepMeta.foreignKey           || null;
    var parentKey            = stepMeta.parentKey            || null;
    var deferWrite           = stepMeta.deferWrite           || false;

    try {
        var entity = null;
        var rowsWrittenToCache = false;

        if (addToExistingEntity) {
            // Direct WM lookup — works for top-level entities and for the deferred
            // "entity found in WM directly" branch (standard path, no foreignKey).
            entity = findEntity(addToExistingEntity, corticonDataManager, logger);

            // Fallback: infer parent from SQL binding placeholders when no foreignKey.
            if (entity === null && !foreignKey && stepMeta.bindings && stepMeta.bindings.length > 0) {
                var inferred = inferParentEntity(stepMeta.bindings, addToExistingEntity, corticonDataManager, logger, stepLabel);
                if (inferred.entity !== null) {
                    entity = inferred.entity;
                    logger.logError(
                        '*** QUERY DEFINITION WARNING *** ' + stepLabel +
                        ' - addToExistingEntity is set to "' + addToExistingEntity +
                        '" but no entity of that type was found directly in working memory. ' +
                        'The correct parent entity type was inferred from SQL binding placeholders: "' +
                        inferred.inferredType + '". ' +
                        'Please update your query definition JSON to set ' +
                        '"addToExistingEntity": "' + inferred.inferredType + '".'
                    );
                }
            }
        }

        if (entity !== null) {
            // ── Path A: entity found in WM directly ─────────────────────────────────
            if (!roleName) {
                logger.logError('*** MarkLogicServiceCallout.js -> ' + stepLabel + ' - addToExistingEntity is set but roleName is missing; cannot attach results without a role name');
                return;
            }

            if (deferWrite) {
                // Producing step — a deeper step will consume these rows.
                // Store in cache but do not write to WM yet.
                logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                    ' - DEFERRED (level 1 producer): storing ' + rows.length + ' row(s) in cache under "' +
                    addToExistingEntity + '.' + roleName + '"');
                // writtenCache["Entity.role"] = rows[] (flat at this point)
                // No __anc__ entry needed here: the WM anchor IS this entity.
                rowsWrittenToCache = true;
            } else {
                // Leaf step with a direct WM entity — standard addAssociationsToEntity.
                logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel + ' - Attaching ' + rows.length + ' row(s) to existing entity, role: ' + roleName);
                for (var ri = 0; ri < rows.length; ri++) {
                    corticonDataManager.addAssociationsToEntity(entity, roleName, normalizeSingletons(rows[ri]));
                }
                rowsWrittenToCache = true;
            }

        } else if (addToExistingEntity && foreignKey && parentKey) {
            // ── Path B: FK-based nested write (any depth) ────────────────────────────
            // The target entity type (addToExistingEntity) was produced by a previous
            // step whose write was deferred.  Find its cache entry.
            var targetLower = addToExistingEntity.toLowerCase();
            var matchedCacheKey = null;

            if (writtenCache) {
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
            }

            if (matchedCacheKey) {
                var parentRows = (writtenCache && writtenCache[matchedCacheKey]) || [];

                if (parentRows.length > 0) {
                    // Group child rows by foreignKey value
                    var childrenByFK = {};
                    for (var gi = 0; gi < rows.length; gi++) {
                        var fkVal = getCaseInsensitiveValue(rows[gi], foreignKey);
                        if (fkVal !== null && fkVal !== undefined) {
                            var fkKey = String(fkVal);
                            if (!childrenByFK[fkKey]) { childrenByFK[fkKey] = []; }
                            childrenByFK[fkKey].push(rows[gi]);
                        }
                    }

                    // Merge child rows into parent rows by parentKey → foreignKey
                    var enrichedRows = mergeChildrenIntoRows(parentRows, roleName, childrenByFK, parentKey, logger, stepLabel);

                    if (deferWrite) {
                        // ── Intermediate producer+consumer: update cache with enriched rows,
                        //    record ancestry so the leaf step can walk up to the WM anchor.
                        logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                            ' - DEFERRED (intermediate): merged ' + rows.length +
                            ' child row(s) into ' + parentRows.length +
                            ' "' + matchedCacheKey + '" row(s); updated cache, not yet writing to WM');

                        // Update cache entry to enriched rows (replaces flat rows)
                        writtenCache[matchedCacheKey] = enrichedRows;

                        // Record ancestry: this step's own cache key → parent's cache key,
                        // so the leaf step can walk the chain.
                        var thisCacheKey = addToExistingEntity + '.' + roleName;
                        writtenCache[thisCacheKey] = enrichedRows; // rows at this level (= enriched parent rows for the next step to target)
                        var ancKey = '__anc__.' + thisCacheKey;
                        writtenCache[ancKey] = { parentCacheKey: matchedCacheKey };

                        rowsWrittenToCache = true;

                    } else {
                        // ── Leaf step: walk up the ancestry chain to find the WM-anchored
                        //    grandparent, then flush the fully-enriched tree in ONE call.
                        logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                            ' - LEAF: merged ' + rows.length +
                            ' child row(s) into ' + parentRows.length +
                            ' "' + matchedCacheKey + '" row(s); walking ancestry to WM anchor');

                        // Update the matched cache key with enriched rows before walk-up
                        writtenCache[matchedCacheKey] = enrichedRows;

                        // Walk up the ancestry chain to find the WM-anchored entity
                        var anchor = findWmAnchor(matchedCacheKey, writtenCache, corticonDataManager, logger);

                        if (anchor.entity) {
                            logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                                ' - Flushing full nested hierarchy via single addAssociationsToEntity on "' +
                                anchor.wmType + '" (role "' + anchor.wmRole + '") with ' +
                                anchor.rows.length + ' enriched root row(s)');
                            corticonDataManager.addAssociationsToEntity(
                                anchor.entity, anchor.wmRole, normalizeSingletons(anchor.rows)
                            );
                            rowsWrittenToCache = true;
                        } else {
                            logger.logError('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                                ' - Could not resolve WM anchor entity walking up from "' +
                                matchedCacheKey + '". Rows not written.');
                        }
                    }
                } else {
                    // Parent step ran but returned 0 rows (cache entry exists as empty array).
                    // This is a normal data condition — e.g. a SQL binding in the prior step
                    // resolved to nothing because an upstream association was empty.
                    // Nothing to attach; silently skip rather than logging a spurious error.
                    logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                        ' - Prior step returned 0 rows for "' + matchedCacheKey +
                        '"; nothing to attach for role "' + roleName + '". Rows not written.');
                }
            } else {
                // ── Cross-SCO live-entity fallback ───────────────────────────────────
                // No writtenCache entry found. Parent entities were written by a
                // different SCO call.  After the inner wrapper exits,
                // removeAssociationLayer() removes inner-scope links but the parent
                // entities themselves survive (promoted to the outer data layer) and
                // ARE returned by getEntitiesByType.
                var liveParents = getAllEntitiesOfType(addToExistingEntity, corticonDataManager, logger);

                if (liveParents.length > 0) {
                    var liveChildByFK = {};
                    for (var lfi = 0; lfi < rows.length; lfi++) {
                        var lfkVal = getCaseInsensitiveValue(rows[lfi], foreignKey);
                        if (lfkVal !== null && lfkVal !== undefined) {
                            var lfkKey = String(lfkVal);
                            if (!liveChildByFK[lfkKey]) { liveChildByFK[lfkKey] = []; }
                            liveChildByFK[lfkKey].push(rows[lfi]);
                        }
                    }

                    logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                        ' - Cross-SCO live-entity write: attaching ' + rows.length +
                        ' child row(s) to ' + liveParents.length +
                        ' live "' + addToExistingEntity + '" entity ref(s) via FK "' +
                        foreignKey + '" / parentKey "' + parentKey + '"');

                    for (var lpi = 0; lpi < liveParents.length; lpi++) {
                        var liveParent = liveParents[lpi];
                        var lpkVal = null;
                        try { lpkVal = liveParent[parentKey]; } catch (lpkErr) { /* ignore */ }
                        if (lpkVal === null || lpkVal === undefined) {
                            try { lpkVal = getCaseInsensitiveValue(liveParent, parentKey); } catch (lpkErr2) { /* ignore */ }
                        }

                        if (lpkVal !== null && lpkVal !== undefined) {
                            var liveMatched = liveChildByFK[String(lpkVal)] || [];
                            logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                                ' - Live parent ' + parentKey + '=' + lpkVal +
                                ' matched ' + liveMatched.length + ' child row(s)');
                            if (liveMatched.length > 0) {
                                corticonDataManager.addAssociationsToEntity(
                                    liveParent, roleName, normalizeSingletons(liveMatched)
                                );
                                rowsWrittenToCache = true;
                            }
                        } else {
                            logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                                ' - Live parent entity at index ' + lpi +
                                ' has no readable "' + parentKey + '" attribute; skipping');
                        }
                    }

                    if (!rowsWrittenToCache) {
                        logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                            ' - Cross-SCO live-entity write: no FK matches found; rows not written.');
                    }
                } else {
                    // Check whether a prior step DID run for this type but returned 0 rows
                    // (cache entry exists as empty array) vs the step was never called at all.
                    var priorStepRanWithZeroRows = false;
                    if (writtenCache) {
                        var allCacheKeys = Object.keys(writtenCache);
                        for (var pck = 0; pck < allCacheKeys.length; pck++) {
                            if (allCacheKeys[pck].indexOf('__') === 0) { continue; }
                            var dotP = allCacheKeys[pck].lastIndexOf('.');
                            if (dotP === -1) { continue; }
                            if (allCacheKeys[pck].substring(dotP + 1).toLowerCase() === targetLower) {
                                priorStepRanWithZeroRows = (writtenCache[allCacheKeys[pck]].length === 0);
                                break;
                            }
                        }
                    }
                    var cacheKeyList = writtenCache
                        ? Object.keys(writtenCache).filter(function(k){return k.indexOf('__') < 0;}).join(', ')
                        : '';

                    if (priorStepRanWithZeroRows) {
                        logger.logDebug(
                            '*** ADC [' + stepLabel + '] Prior step returned 0 rows for "' + addToExistingEntity +
                            '" — nothing to attach for role "' + roleName + '". Rows not written.' +
                            (cacheKeyList ? ' (Cache keys: [' + cacheKeyList + '])' : '')
                        );
                    } else {
                        logger.logError(
                            '*** QUERY DEFINITION ERROR *** ' + stepLabel +
                            ' - addToExistingEntity is "' + addToExistingEntity +
                            '" but no prior step wrote entities under a matching roleName, and ' +
                            'no live entities of type "' + addToExistingEntity + '" were found in ' +
                            'working memory. Rows not written.' +
                            '\n  POSSIBLE CAUSES:' +
                            '\n  1. A prior step in this query also failed to write rows (cascade). ' +
                            'Check for earlier QUERY DEFINITION ERROR messages in this log run belonging to the same query.' +
                            (cacheKeyList
                                ? ' Cache entries written by prior steps: [' + cacheKeyList + '].'
                                : ' No entries at all were written to the cache by any prior step in this SCO call.') +
                            '\n  2. The prior step that was supposed to produce "' + addToExistingEntity + '" rows may have ' +
                            'addToExistingEntity set to "' + addToExistingEntity + '" itself (wrong) \u2014 it should be set to ' +
                            'the PARENT entity type that owns "' + addToExistingEntity + '" rows, with roleName: "' + (roleName !== 'results' ? roleName : addToExistingEntity) + '".' +
                            '\n  3. If this step runs inside a branch wrapper, move it OUTSIDE the branch.'
                        );
                    }
                }
            }

        } else if (addAsTopLevelEntity) {
            // ── Path C: create new top-level entities ───────────────────────────────
            logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel + ' - Creating ' + rows.length + ' top-level entity(ies) of type: ' + addAsTopLevelEntity);
            for (var ri = 0; ri < rows.length; ri++) {
                corticonDataManager.addEntitiesAndAssociations(addAsTopLevelEntity, normalizeSingletons(rows[ri]));
            }

        } else if (addToExistingEntity) {
            logger.logError(
                '*** QUERY DEFINITION ERROR *** ' + stepLabel +
                ' - addToExistingEntity is "' + addToExistingEntity +
                '" but the entity was not found in working memory. ' +
                'Rows not written. ' +
                '\n  COMMON CAUSE: addToExistingEntity must be the PARENT entity type that ' +
                'already exists in WM BEFORE this step runs — not the type returned by this query. ' +
                'For example, if this step returns "' + addToExistingEntity + '" rows that belong to a ' +
                '"Products" entity, set addToExistingEntity: "Products" and roleName: "' +
                (roleName !== 'results' ? roleName : '<the association role on Products>') + '". ' +
                '\n  If "' + addToExistingEntity + '" entities ARE produced by an earlier step in this ' +
                'query (multi-step FK join), add "foreignKey" and "parentKey" to this step to ' +
                'enable writtenCache matching — the earlier step sets ' +
                'addToExistingEntity to ITS parent and roleName: "' + addToExistingEntity + '".'
            );
            // If this step is a deferred producer (a downstream FK step will look it up),
            // seed the cache with an empty array so the consumer step gets the
            // "prior step returned 0 rows" logDebug instead of a second misleading
            // QUERY DEFINITION ERROR from the cross-SCO live-entity fallback.
            if (deferWrite && writtenCache && roleName) {
                var deferCacheKey = addToExistingEntity + '.' + roleName;
                if (!writtenCache[deferCacheKey]) { writtenCache[deferCacheKey] = []; }
            }
        } else {
            logger.logError('*** MarkLogicServiceCallout.js -> ' + stepLabel + ' - No addToExistingEntity or addAsTopLevelEntity configured in the query definition; results not written');
        }

        // Populate the row cache so extractPayload can inject associations as navigable
        // placeholders in subsequent steps (e.g. {RoutingOperations.operationSetupDetails.X}).
        // For deferred/intermediate steps this has already been set above; for standard
        // (non-deferred) and top-level writes we set it here.
        // IMPORTANT: seed the cache entry even for 0-row results (rows.length may be 0).
        // A downstream FK step looks this entry up; if it is absent entirely the step
        // falls through to the cross-SCO live-entity path and fires a misleading
        // QUERY DEFINITION ERROR.  An empty array entry is the correct signal that the
        // prior step ran but returned no data (data dependency, not a config error).
        if (rowsWrittenToCache && writtenCache && addToExistingEntity && roleName) {
            var cacheKey = addToExistingEntity + '.' + roleName;
            // Only initialise if not already set by Path B intermediate logic above
            if (!writtenCache[cacheKey]) {
                writtenCache[cacheKey] = [];
                for (var ci = 0; ci < rows.length; ci++) {
                    writtenCache[cacheKey].push(rows[ci]);
                }
            }
            logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel + ' - Cache entry "' + cacheKey + '" finalised (' + writtenCache[cacheKey].length + ' row(s))');
        }
    } catch (error) {
        logger.logError('*** MarkLogicServiceCallout.js -> ' + stepLabel + ' - Failed to write results to working memory: ' + error.message);
        throw new Error('[' + stepLabel + '] Failed to write results to Corticon working memory: ' + error.message);
    }
}

/**
 * Merges child rows (already grouped by foreignKey value) into parent rows by
 * matching each parent row's parentKey value against the child grouping.
 * Returns a new array of enriched parent rows; the originals are not mutated.
 *
 * @param {Object[]} parentRows    - Cached parent rows (may already be partially enriched).
 * @param {string}   roleName      - Association role name to add children under.
 * @param {Object}   childrenByFK  - Map of String(fkValue) → child row array.
 * @param {string}   parentKey     - Attribute name on a parent row to match against fkValue.
 * @param {Object}   logger        - Corticon logger.
 * @param {string}   stepLabel     - Step label for log messages.
 * @returns {Object[]} Enriched parent rows.
 */
function mergeChildrenIntoRows(parentRows, roleName, childrenByFK, parentKey, logger, stepLabel) {
    var enriched = [];
    for (var i = 0; i < parentRows.length; i++) {
        var parentRow = parentRows[i];
        var pkVal = getCaseInsensitiveValue(parentRow, parentKey);
        // Shallow-copy the parent row object
        var copy = {};
        var keys = Object.keys(parentRow);
        for (var k = 0; k < keys.length; k++) { copy[keys[k]] = parentRow[keys[k]]; }
        if (pkVal !== null && pkVal !== undefined) {
            var matched = childrenByFK[String(pkVal)] || [];
            if (matched.length > 0) {
                copy[roleName] = matched;
                logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel +
                    ' - parent ' + parentKey + '=' + pkVal + ' matched ' + matched.length + ' child row(s)');
            }
        }
        enriched.push(copy);
    }
    return enriched;
}

/**
 * Walks the writtenCache ancestry chain (via __anc__ metadata entries) upward
 * from a given cache key until it finds a cache entry whose owner type is a
 * live top-level WM entity.  Returns the anchor entity, its WM role name, and
 * the fully-enriched rows to pass to addAssociationsToEntity.
 *
 * writtenCache ancestry is recorded by intermediate deferred steps as:
 *   "__anc__.ChildType.childRole" → { parentCacheKey: "ParentType.parentRole" }
 *
 * The WM anchor is the first ancestor resolved via findEntity() — i.e. a
 * type that IS a live top-level entity (written by addAsTopLevelEntity or
 * already present in WM when the SCO fired).
 *
 * @param {string} startCacheKey      - Cache key to start walking from.
 * @param {Object} writtenCache       - The full written cache.
 * @param {Object} corticonDataManager - Corticon data manager.
 * @param {Object} logger              - Corticon logger.
 * @returns {{ entity: Object|null, wmType: string, wmRole: string, rows: Object[] }}
 */
function findWmAnchor(startCacheKey, writtenCache, corticonDataManager, logger) {
    var currentKey = startCacheKey;
    var MAX_DEPTH = 20; // guard against circular references
    var depth = 0;

    while (depth++ < MAX_DEPTH) {
        // Derive the owner type from the cache key (everything before the last dot)
        var dotPos = currentKey.lastIndexOf('.');
        if (dotPos === -1) { break; }
        var ownerType = currentKey.substring(0, dotPos);
        var ownerRole = currentKey.substring(dotPos + 1);

        // Try to find this owner type as a live WM entity
        var entity = findEntity(ownerType, corticonDataManager, logger);
        if (entity) {
            // Found the WM anchor — the rows to write are the current cache entry's rows
            return {
                entity: entity,
                wmType: ownerType,
                wmRole: ownerRole,
                rows: writtenCache[currentKey] || []
            };
        }

        // Walk up via __anc__ metadata
        var ancKey = '__anc__.' + currentKey;
        var ancMeta = writtenCache[ancKey];
        if (!ancMeta || !ancMeta.parentCacheKey) {
            // No ancestry recorded — owner type may be findable under a different spelling
            // (e.g. domain-qualified). Try the role name alone as the owner type.
            logger.logDebug('*** findWmAnchor: no ancestry for "' + currentKey +
                '"; stopping walk at ownerType="' + ownerType + '"');
            break;
        }

        logger.logDebug('*** findWmAnchor: "' + currentKey + '" → parent "' + ancMeta.parentCacheKey + '"');
        currentKey = ancMeta.parentCacheKey;
    }

    return { entity: null, wmType: null, wmRole: null, rows: [] };
}

/**
 * Infers the parent entity from SQL binding placeholders when the direct
 * addToExistingEntity lookup fails.
 *
 * Binding placeholders like {Products.className} encode the source entity type
 * as the first segment of the dot-path ("Products"). This function extracts
 * those entity types and tries to find one in working memory.
 *
 * @param {Object[]} bindings            - Binding metadata array (each has a .placeholder field).
 * @param {string}   addToExistingEntity - Original addToExistingEntity value (for logging).
 * @param {Object}   corticonDataManager - Corticon data manager instance.
 * @param {Object}   logger              - Corticon logger.
 * @param {string}   stepLabel           - Step label for log messages.
 * @returns {{entity: Object|null, inferredType: string|null}} The inferred parent entity and its type name.
 */
function inferParentEntity(bindings, addToExistingEntity, corticonDataManager, logger, stepLabel) {
    // Extract unique entity type names from binding placeholders
    // e.g., {Products.className} → "Products", {Products.plant} → "Products"
    var candidateTypes = [];
    var seen = {};

    for (var i = 0; i < bindings.length; i++) {
        var placeholder = bindings[i].placeholder;
        if (!placeholder || placeholder.indexOf('.') === -1) {
            continue;
        }
        var entityType = placeholder.substring(0, placeholder.indexOf('.'));
        if (!seen[entityType]) {
            seen[entityType] = true;
            candidateTypes.push(entityType);
        }
    }

    if (candidateTypes.length === 0) {
        return { entity: null, inferredType: null };
    }

    logger.logDebug('*** MarkLogicServiceCallout.js -> ' + stepLabel + ' - addToExistingEntity "' + addToExistingEntity +
        '" not found in WM; inferring parent entity from SQL binding placeholders. Candidate types: [' + candidateTypes.join(', ') + ']');

    for (var j = 0; j < candidateTypes.length; j++) {
        var entity = findEntity(candidateTypes[j], corticonDataManager, logger);
        if (entity !== null) {
            return { entity: entity, inferredType: candidateTypes[j] };
        }
    }

    return { entity: null, inferredType: null };
}

/**
 * Returns ALL entities of the specified type (and optionally its simple/unqualified name)
 * as a plain array.  Unlike findEntity / findEntityByType, this retrieves EVERY match,
 * not just the first one.  Used for cross-SCO FK matching where we must iterate over
 * all parent entities (e.g. all RoutingOperations) to attach their children.
 *
 * @param {string} typeName            - Corticon vocabulary type name (qualified or simple).
 * @param {Object} corticonDataManager - Corticon data manager instance.
 * @param {Object} logger              - Corticon logger.
 * @returns {Object[]} Array of matching entity refs (may be empty).
 */
function getAllEntitiesOfType(typeName, corticonDataManager, logger) {
    var results = [];

    function collect(name) {
        try {
            var iter = corticonDataManager.getEntitiesByType(name);
            if (!iter) { return; }
            if (typeof iter.values === 'function') {
                var it = iter.values();
                var next;
                while (!(next = it.next()).done) { results.push(next.value); }
            } else if (iter.length) {
                for (var i = 0; i < iter.length; i++) { results.push(iter[i]); }
            }
        } catch (e) {
            logger.logDebug('*** getAllEntitiesOfType: error collecting type "' + name + '": ' + e.message);
        }
    }

    collect(typeName);
    // Also try the simple (unqualified) name, e.g. "RoutingOperations" for "Routing.RoutingOperations"
    if (results.length === 0 && typeName.indexOf('.') !== -1) {
        collect(typeName.substring(typeName.lastIndexOf('.') + 1));
    }
    return results;
}

/**
 * Recursively removes null-valued keys from an object or array.
 * In production, Optic omits NULL columns (key absent). After JSON round-trip
 * in the proxy path, NULLs become explicit JS null. Corticon's Java-side
 * TestJSONImport calls new BigDecimal(value) without null-checking, causing
 * NumberFormatException: "Character n" when value is the string "null".
 *
 * Also strips the STRING "null" (4 chars). MarkLogic Optic null nodes can
 * serialize through JSON.stringify as the string "null" instead of JS null
 * when the null node type is not a standard JS null. The string "null" passes
 * isString() checks in Corticon's convertDecimalAttribute and then fails in
 * the Decimal constructor with "[DecimalError] Invalid argument: null".
 */
function stripNullsDeep(obj) {
    if (obj === null || obj === undefined) { return obj; }
    if (Array.isArray(obj)) {
        var arr = [];
        for (var i = 0; i < obj.length; i++) {
            arr.push(stripNullsDeep(obj[i]));
        }
        return arr;
    }
    if (typeof obj === 'object') {
        var clean = {};
        var keys = Object.keys(obj);
        for (var k = 0; k < keys.length; k++) {
            var val = obj[keys[k]];
            // Strip JS null AND the string "null" (MarkLogic Optic null node
            // serialization artifact). Also strip empty string for decimal safety.
            if (val !== null && val !== 'null') {
                clean[keys[k]] = stripNullsDeep(val);
            }
        }
        return clean;
    }
    return obj;
}

/**
 * Recursively normalizes singleton arrays in a payload object to match
 * the Corticon JS runtime's expected JSON format.
 *
 * Corticon's JSON driver applies a singleton shorthand convention for
 * 1:many associations: when exactly one element exists, it must be a
 * plain object {}, not a single-element array [{}]. This convention is
 * enforced strictly for associations nested inside array elements.
 * Corticon Studio's test export is the authoritative reference.
 *
 * Rules applied at every level of nesting:
 *   - Array with 2+ elements: kept as-is (recurse into each element)
 *   - Array with exactly 1 element that is an object: unwrapped to plain object
 *   - Empty objects (zero own keys): converted to null (handles MarkLogic
 *     null Node objects that pass through xdmp.sql as non-JS-null objects)
 *   - Scalars / empty arrays / non-object arrays: untouched
 *
 * @param {*} value - Any value (object, array, scalar).
 * @returns {*} The normalized value.
 */
function normalizeSingletons(value) {
    if (value === null || value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        if (value.length === 1 && value[0] !== null && typeof value[0] === 'object' && !Array.isArray(value[0])) {
            // Single-element array of object -> unwrap to plain object, then recurse
            return normalizeSingletons(value[0]);
        }
        // Multi-element array -> recurse into each element
        var normalized = [];
        for (var i = 0; i < value.length; i++) {
            normalized.push(normalizeSingletons(value[i]));
        }
        return normalized;
    }

    if (typeof value === 'object') {
        var keys = Object.keys(value);
        // Empty object -> null. MarkLogic's xdmp.sql can return null-like
        // Node objects for SQL NULLs that are not strict JS null (i.e.,
        // value === null is false, but typeof value === 'object' is true
        // and Object.keys(value) is empty). These must become null to
        // avoid Corticon Studio's "#ref_id" parsing error.
        if (keys.length === 0) {
            return null;
        }
        var result = {};
        for (var k = 0; k < keys.length; k++) {
            var normalized_val = normalizeSingletons(value[keys[k]]);
            // Strip null values from objects. In the proxy path, nulls reach
            // addAssociationsToEntity and get set as entity attributes.
            // Studio's Java TestJSONImport then tries new BigDecimal("null")
            // for Decimal-typed attributes → NumberFormatException crash.
            // In production on MarkLogic, NULL columns are simply absent.
            if (normalized_val !== null && normalized_val !== undefined) {
                result[keys[k]] = normalized_val;
            }
        }
        return result;
    }

    // Scalar - return as-is
    return value;
}

/**
 * Returns the value of an attribute from a plain JS object with case-insensitive key matching.
 * Tries an exact match first; falls back to a case-insensitive scan.
 * Used to bridge database column name casing (e.g. "ID") vs Corticon vocabulary casing (e.g. "id").
 *
 * @param {Object} obj - Plain JS object (e.g. a SQL result row).
 * @param {string} key - Attribute name to retrieve.
 * @returns {*} The attribute value, or undefined if not found.
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
 * Finds the first entity of the specified Corticon vocabulary type in working memory.
 *
 * @param {string} vocabularyType      - The Corticon vocabulary type name to search for.
 * @param {Object} corticonDataManager - Corticon data manager instance.
 * @param {Object} logger              - Logger instance.
 * @returns {Object|null} The first entity of that type, or null if not found.
 */
function findEntity(vocabularyType, corticonDataManager, logger) {
    try {
        if (!vocabularyType) {
            logger.logDebug('*** MarkLogicServiceCallout.js -> Function findEntity - vocabulary type is undefined or null, skipping lookup');
            return null;
        }
        logger.logDebug('*** MarkLogicServiceCallout.js -> Function findEntity - searching for entities of type: ' + vocabularyType);

        var result = findEntityByType(vocabularyType, corticonDataManager, logger);

        // If not found and the type contains a domain prefix (e.g. "Makeability.Makeability_ByGeometry"),
        // retry with just the simple entity name (the part after the last dot).
        // Corticon.js registers entities by their simple name, not the domain-qualified name.
        if (result === null && vocabularyType.indexOf('.') !== -1) {
            var simpleName = vocabularyType.substring(vocabularyType.lastIndexOf('.') + 1);
            logger.logDebug('*** MarkLogicServiceCallout.js -> Function findEntity - domain-qualified name "' + vocabularyType + '" not found; retrying with simple name: "' + simpleName + '"');
            result = findEntityByType(simpleName, corticonDataManager, logger);
        }

        return result;
    } catch (error) {
        logger.logError('*** MarkLogicServiceCallout.js -> Function findEntity - Error: ' + error.message);
        throw error;
    }
}

/**
 * Looks up the first entity of the given type name in working memory.
 *
 * @param {string} typeName            - Entity type name to search for.
 * @param {Object} corticonDataManager - Corticon data manager instance.
 * @param {Object} logger              - Logger instance.
 * @returns {Object|null} The first entity of that type, or null if not found.
 */
function findEntityByType(typeName, corticonDataManager, logger) {
    var entities = corticonDataManager.getEntitiesByType(typeName);
    if (!entities) {
        logger.logDebug('*** MarkLogicServiceCallout.js -> Function findEntityByType - No entities of type ' + typeName + ' found');
        return null;
    }

    // Corticon.js returns a Set (not Array) — .length is undefined on Sets
    var count = entities.size !== undefined ? entities.size : entities.length;
    if (!count || count === 0) {
        logger.logDebug('*** MarkLogicServiceCallout.js -> Function findEntityByType - No entities of type ' + typeName + ' found');
        return null;
    }

    // Sets don't support bracket indexing; use iterator
    if (typeof entities.values === 'function') {
        var first = entities.values().next();
        return first.done ? null : first.value;
    }
    return entities[0] || null;
}

exports.executeQueryCallout = executeQueryCallout;
