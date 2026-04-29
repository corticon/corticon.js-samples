# Advanced Data Connector for MarkLogic — Architecture Reference

> **Who should read this?**
> **Developers and LLMs** working on the connector source code. Read this document if you need to understand how the implementation works, why specific design decisions were made, how to extend or debug the code, or how to reproduce the implementation from scratch. It is written to be understandable by non-programmers but is intentionally detailed.
> If you are a **rule author** who just needs to configure and use the connector — read [README.md](../../README.md) instead. You do not need this document.

> **Version context:** Corticon.js 2.4+ · MarkLogic 10/11 · Engine/xdmp.sql + Optic API
>
> For deployment instructions, prerequisite setup, and usage examples, see [README.md](../../README.md).

---

## Table of Contents

1. [What This Connector Does](#1-what-this-connector-does)
2. [Source Files and How They Relate](#2-source-files-and-how-they-relate)
3. [Dual-Environment Design (MarkLogic vs Studio)](#3-dual-environment-design-marklogic-vs-studio)
4. [File 1 — MarkLogicServiceCallout.js (Entry Point)](#4-file-1--marklogicservicecalloutjs-entry-point)
5. [File 2 — MarkLogicQueryConnector.js (Orchestrator)](#5-file-2--marklogicqueryconnectorjs-orchestrator)
6. [File 3 — MarkLogicQueryLibrary.js (Utility Library)](#6-file-3--marklogicquerylibraryjs-utility-library)
7. [Server-Side Extension — StudioProxyService.sjs](#7-server-side-extension--studioproxyservicesjs)
8. [Query Definition JSON Format](#8-query-definition-json-format)
9. [Document Write Steps (insert / update / upsert)](#9-document-write-steps-insert--update--upsert)
10. [End-to-End Execution Flow](#10-end-to-end-execution-flow)
11. [Advanced Write Modes (How Results Land in Corticon)](#11-advanced-write-modes-how-results-land-in-corticon)
12. [Configuration Reference](#12-configuration-reference)
13. [MarkLogic Security Prerequisites](#13-marklogic-security-prerequisites)
14. [Logging and Debugging](#14-logging-and-debugging)
15. [Key Design Decisions and Constraints](#15-key-design-decisions-and-constraints)

---

## 1. What This Connector Does

**Plain-language summary:**  
When a Corticon.js decision service needs data from a MarkLogic database, it cannot directly run a SQL query. This connector — called the *Advanced Data Connector for MarkLogic* (ADC ML) — acts as a bridge. The business rules tell it *which* query to run (by name), and the connector fetches the right query definition from MarkLogic, substitutes live working-memory values into the SQL, runs the query, and writes the results back into the Corticon decision service's memory so that subsequent rules can use the data.

**Key capabilities:**
- Run one or more SQL SELECT queries in sequence as part of a Corticon rule execution
- Substitute values from Corticon's working memory (entities in the rules model) into the SQL parameters automatically
- Write query results back into Corticon's working memory as new entities or as children of existing entities — supporting arbitrary-depth hierarchies like `Orders → OrderLines → Items → ItemComponents → …`
- Support **N-level deep** nested entity hierarchies in a single atomic WM write (required to work around Corticon's data-layer scoping behaviour inside branch containers)
- Safely handle MarkLogic null values, singleton-array conventions, and case-mismatched column names
- Validate that all SQL is SELECT-only (no data mutations allowed)

---

## 2. Source Files and How They Relate

```
┌──────────────────────────────────────────────────────────────┐
│  Corticon.js Runtime (Decision Service Bundle)               │
│                                                              │
│   Rules fire → SCO called → results written back to rules    │
└────────────────────────┬─────────────────────────────────────┘
                         │  calls
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  MarkLogicServiceCallout.js          ← FILE 1                │
│  ─────────────────────────────────────────────────────────   │
│  • Registered with Corticon as a named SCO                   │
│  • Auto-detects runtime: MarkLogic SJS or Node.js (Studio)   │
│  • Resolves which query to run (from WM entity or props)     │
│  • Owns the writeStepResults() callback                      │
│  • Handles all write modes (top-level, attach, deferred,     │
│    cross-SCO fallback)                                       │
│  • Studio proxy: HTTP-POSTs WM snapshot to MarkLogic and     │
│    writes responses back to Corticon WM                      │
└────────────────────────┬─────────────────────────────────────┘
                         │  delegates to (production path)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  MarkLogicQueryConnector.js          ← FILE 2                │
│  ─────────────────────────────────────────────────────────   │
│  • Loads query definition document from MarkLogic            │
│  • Sorts steps by sequenceNo                                 │
│  • Look-ahead: detects which steps need deferred writes      │
│  • For each step: snapshots WM, prepares SQL, executes,      │
│    calls writeStepResults callback                           │
│  • Handles document write steps (insert/update/upsert)       │
│    via collectEntities + OpticExecutor.executeDocumentWrite  │
└────────────────────────┬─────────────────────────────────────┘
                         │  uses all sub-modules from
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  MarkLogicQueryLibrary.js            ← FILE 3                │
│  ─────────────────────────────────────────────────────────   │
│  Sub-modules (all in one file for easy bundling):            │
│    DebugLogger       – structured xdmp.log logging           │
│    Validators        – SELECT-only guard, allowedViews, etc. │
│    QueryRegistry     – URI resolution + cts.doc() load       │
│    PlaceholderResolver – dot-path resolver on WM snapshot    │
│    SqlRewriter       – {Placeholder} → @param rewriting      │
│    OpticExecutor     – Optic API / xdmp.sql execution        │
│    BindingInferrer   – auto-derives binding metadata from SQL │
└──────────────────────────────────────────────────────────────┘
```

**Dependency direction:** File 1 → File 2 → File 3. File 3 has no dependencies on the other two.

### Additional files (not bundled into the decision service)

| File | Purpose | Bundled? |
|---|---|---|
| `MarkLogicStudioConfig.template.js` | Template for Studio credentials. Copy to `MarkLogicStudioConfig.js` and fill in. | No (excluded from Corticon Extensions) |
| `src/ml-rest/StudioProxyService.sjs` | MarkLogic REST resource extension. Receives HTTP requests from the Studio proxy and executes the full ADC pipeline server-side. | No (deployed separately to MarkLogic) |
| `scripts/deploy-studio-proxy.ps1` | PowerShell script that deploys `StudioProxyService.sjs` and the library files to the MarkLogic modules database. | No |

---

## 3. Dual-Environment Design (MarkLogic vs Studio)

`executeQueryCallout` is the single Corticon entry-point function. Every time it is called it checks its runtime environment at the very top:

```js
if (typeof xdmp !== 'undefined') {
    return executeQueryCalloutML(...);   // MarkLogic SJS — synchronous production path
}
return executeQueryCalloutProxy(...);    // Node.js / Corticon Studio — async HTTP proxy
```

### Production path — `executeQueryCalloutML`

Runs synchronously inside MarkLogic's SJS engine. The full ADC pipeline (`executeQuerySet`) executes in the same JS context as the request. `declareUpdate()` is called first (guarded by `typeof declareUpdate === 'function'`) so that write steps (`xdmp.documentInsert`) are allowed without triggering a transaction-mode conflict.

### Studio proxy path — `executeQueryCalloutProxy`

Runs inside Node.js when the rule author tests a decision service in Corticon Studio. Studio does not provide MarkLogic APIs (`xdmp`, `cts`, `op`), so the proxy path:

1. Loads `MarkLogicStudioConfig.js` (credentials file) via indirect `require` so Corticon's bundler cannot trace the path.
2. Takes a snapshot of Corticon working memory (`buildWmSnapshot`), serializing all entity objects to plain JSON-safe form.
3. HTTP-POSTs the query config + WM snapshot to `StudioProxyService.sjs` on the configured MarkLogic app server.
4. Receives step results from MarkLogic as JSON.
5. Calls `writeStepResults` locally (in Node.js) to write those results into Corticon WM — using the same callback as the production path.

This design means the entire WM write logic, including the N-level deferred hierarchy, is exercised identically in both environments.

**Why not run the full pipeline in Node.js?**  
The MarkLogic APIs (`cts.doc`, `op.fromSQL`, `xdmp.documentInsert`) are not available in Node.js. A real MarkLogic connection is required to load query definitions and execute SQL queries, so the proxy delegates to MarkLogic for all data work.

### `MarkLogicStudioConfig.js` — credentials file

Created by copying `MarkLogicStudioConfig.template.js`. Contains:

| Field | Default | Description |
|---|---|---|
| `host` | `'localhost'` | MarkLogic hostname or IP |
| `port` | `8004` | REST app server port |
| `user` | — | MarkLogic user |
| `password` | — | MarkLogic password |
| `authType` | `'digest'` | `'digest'` or `'basic'` |
| `ssl` | `false` | Set to `true` for HTTPS |
| `evalPath` | `'/v1/resources/StudioProxyService'` | REST extension URL path |

> **When to add to Corticon Extensions:** `MarkLogicStudioConfig.js` must be added to the Corticon Extensions list (as a dependency file) when you want to test the decision service inside Corticon Studio — the Node.js proxy loads it via `require` at test time. For a production-only deployment where Studio testing is not needed, it can be omitted: the indirect `require` pattern (`var paths = ['./' + 'MarkLogicStudioConfig']; _req(paths[0])`) defeats browserify's static analysis, so the bundle compiles cleanly even when the file is absent. Including it in a production bundle is harmless — the `typeof xdmp` check routes to the production path inside MarkLogic and the proxy code is never entered, so the config file is never loaded at runtime. The one hard rule: **never commit `MarkLogicStudioConfig.js` to version control** — it contains credentials. It is excluded by `.gitignore`.

### Digest authentication in the proxy

When `authType` is `'digest'` (the MarkLogic default), the proxy implements the full RFC 2069 digest challenge-response flow without any npm dependencies — using only Node.js built-in `http`/`https` and `crypto` modules:

1. Send the initial request without authorization.
2. Parse the `www-authenticate` header from the 401 response (`realm`, `nonce`, `qop`, `opaque`).
3. Compute `HA1 = MD5(user:realm:password)`, `HA2 = MD5(POST:uri)`, `response = MD5(HA1:nonce:nc:cnonce:qop:HA2)`.
4. Resend the request with the `Authorization: Digest ...` header.

### Null-stripping in the proxy response

Optic API row objects inside MarkLogic have MarkLogic-specific null Nodes that serialize as explicit `null` after JSON round-trip. Corticon's Java test runner calls `new BigDecimal("null")` for Decimal-typed attributes — which throws. The proxy strips all null values from rows before calling `writeStepResults`, mirroring MarkLogic's production behaviour where null columns are simply absent from the row object.

---

## 4. File 1 — MarkLogicServiceCallout.js (Entry Point)

### Role
This is the only file that Corticon.js "knows about". It registers a named Service Callout (`AdvancedDataConnectorML`) and exposes the function `executeQueryCallout`, which Corticon calls every time the SCO node fires in a ruleflow.

### Registration block
```js
const MarkLogicServiceCallout = {
    func: 'executeQueryCallout',
    type: 'ServiceCallout',
    extensionType: 'SERVICE_CALLOUT',
    name: { en_US: 'AdvancedDataConnectorML' }
};
```
Corticon Studio uses `name` to identify the SCO in its UI. `func` must match the JavaScript function name exported below.

---

### Function: `executeQueryCallout(corticonDataManager, serviceCalloutProperties)`

This is the single entry point. It does two things:

1. **Resolve which query to run** — calls `resolveQueryConfig()` to combine working-memory preferences with static runtime properties.
2. **Run the query set** — delegates to `MarkLogicQueryConnector.executeQuerySet()`, passing `writeStepResults` as the callback that writes each step's results back to Corticon.

---

### Function: `resolveQueryConfig(corticonDataManager, serviceCalloutProperties, logger)`

**Purpose:** Determines the `queryName` (and optional `ruleProject`) to use for this invocation.

**Priority order (highest wins):**

| Priority | Source | How it's set |
|---|---|---|
| 1 | `QueryConfig` entity in working memory | Rule author sets `QueryConfig.queryName` in a rulesheet before the SCO fires |
| 2 | SCO Runtime Properties pane in Corticon Studio | Static key-value pairs embedded in the compiled bundle |

The `QueryConfig` entity may also carry `queryUri`, `ruleProject`, and `debug` — all of which override the runtime properties equivalents.

**Why two sources?**  
Static properties are set at design time and never change. When rules need to select *which* query to run based on data (e.g. different query for different product types), the rule author sets `QueryConfig.queryName` dynamically in a rulesheet. The fallback to static properties means the SCO still works for simple, single-purpose deployments.

---

### Function: `writeStepResults(rows, stepMeta, corticonDataManager, logger, writtenCache)`

This is the most complex function in the codebase. It is a **callback** called by the Connector after each step executes. It decides *how* to put the query results into Corticon's working memory.

There are four write paths, selected based on step metadata:

#### Path 1 — `addAsTopLevelEntity`
Creates each result row as a new top-level entity of the given Corticon vocabulary type. Uses `corticonDataManager.addEntitiesAndAssociations()`.  
**Use when:** The query returns entirely new data not related to any existing entity.

#### Path 2 — Standard `addToExistingEntity`
Attaches rows as children under `roleName` to an existing parent entity in working memory. Uses `corticonDataManager.addAssociationsToEntity()` once per row.  
**Use when:** The query enriches an existing top-level entity with details (e.g. add `processClasses` to `Product`).

#### Path 3 — Deferred nested write (arbitrary depth)

Supports any number of nesting levels in a single atomic WM write. No query definition changes are needed — the same `foreignKey`/`parentKey` fields that worked for 2-level nesting drive N-level nesting automatically.

**The problem:** Entities added by `addAssociationsToEntity` are not retrievable as live references via `getEntitiesByType`. A second call to attach grandchildren to them would fail silently. This limitation applies at every level.

**The N-level solution:**

Every step that has `foreignKey`+`parentKey` is either:
- An **intermediate producer+consumer** (`deferWrite=true`): merges its child rows into the already-cached parent rows, updates the cache with the enriched rows, records an ancestry link (`__anc__` metadata entry), and does NOT write to WM yet.
- The **leaf step** (`deferWrite=false`): merges its child rows into the cached parent rows, then calls `findWmAnchor()` to walk the `__anc__` chain up to the top-level WM entity, and flushes the entire enriched tree in exactly **one** `addAssociationsToEntity` call.

**`writtenCache` structure:**
```
"ParentType.roleName"          → rows[] (flat initially; enriched by later steps in-place)
"__anc__.ChildType.childRole"  → { parentCacheKey: "ParentType.roleName" }
```

**Example — 4 levels:**
```
Step 1 (deferWrite): Orders    → orderLines        [cache: "Orders.orderLines" = flat rows]
Step 2 (deferWrite): orderLines → items            [cache: merge items into orderLines rows;
                                                    __anc__.orderLines.items → Orders.orderLines]
Step 3 (leaf):       items → itemComponents        [merge itemComponents into items rows;
                                                    walk __anc__: items.itemComponents
                                                     → orderLines.items
                                                     → Orders.orderLines (WM anchor);
                                                    single addAssociationsToEntity flush]
```

This single-call approach is mandatory — multiple calls would overwrite each other's nested links in Corticon's bidirectional back-reference index.

#### Path 4 — Cross-SCO live-entity fallback
Used when the parent entities were created by a *different* SCO invocation (not the current one) and therefore have no `writtenCache` entry. Falls back to `getAllEntitiesOfType()` to find all live entities of the parent type, reads their `parentKey` attribute, FK-matches child rows, and attaches them via individual `addAssociationsToEntity` calls.  
**When triggered:** Cache key lookup yields no match AND `foreignKey` + `parentKey` are set.

---

### Helper functions in MarkLogicServiceCallout.js

| Function | Purpose |
|---|---|
| `findEntity(type, ...)` | Returns the first entity of a Corticon vocabulary type from working memory. Handles domain-qualified names (e.g. `Makeability.Product` → tries `Product` if not found). |
| `findEntityByType(type, ...)` | Low-level entity lookup via `getEntitiesByType`. Handles Corticon's Set API (no bracket indexing). |
| `getAllEntitiesOfType(type, ...)` | Returns ALL entities of a type as a plain array. Used for cross-SCO FK matching. |
| `inferParentEntity(bindings, ...)` | When `addToExistingEntity` is not found in WM, extracts entity type names from SQL binding placeholders (e.g. `{Products.className}` → `"Products"`) and tries each one. Logs a warning asking the rule author to correct the query definition. |
| `mergeChildrenIntoRows(parentRows, roleName, childrenByFK, parentKey, ...)` | Merges grouped child rows into parent rows by FK matching. Returns a new array of enriched parent rows without mutating the originals. Used by both intermediate and leaf deferred steps. |
| `findWmAnchor(startCacheKey, writtenCache, ...)` | Walks the `__anc__` metadata chain in `writtenCache` upward from a given key until it finds an owner type that is a live top-level WM entity. Returns `{ entity, wmType, wmRole, rows }` ready for the flush call. Bounded by a depth guard of 20 to handle circular references safely. |
| `normalizeSingletons(value)` | Recursively unboxes single-element arrays to plain objects, converts empty objects to `null`. Required by Corticon's JSON association convention and to handle MarkLogic null Node objects. |
| `getCaseInsensitiveValue(obj, key)` | Case-insensitive attribute accessor. Bridges database column naming (e.g. `"ID"`) vs Corticon vocabulary naming (e.g. `"id"`). |

---

## 5. File 2 — MarkLogicQueryConnector.js (Orchestrator)

### Role
Owns the entire lifecycle of a query set execution: load → parse → look-ahead → execute steps in sequence → call back to File 1 after each step.

---

### Function: `executeQuerySet(corticonDataManager, serviceCalloutProperties, logger, writeResultsFn)`

The main workhorse. Steps:

1. **Build config** from `serviceCalloutProperties` (calls `buildConfig`).
2. **Load query definition** from MarkLogic via `QueryRegistry.getQueryDefinition`.
3. **Parse and validate** the document structure (calls `parseQueryDef`).
4. **Sort steps** by `sequenceNo` ascending.
5. **Look-ahead scan:** Iterates the sorted steps. For each step that has `foreignKey` + `parentKey` + `addToExistingEntity`, finds the earlier step whose `roleName` matches `addToExistingEntity`. Marks that earlier step as `deferWrite=true` in a local map. Disabled steps (`enable: false / null`) are skipped in both roles.
6. **Execute each step sequentially:**
   - Snapshot current working memory (`extractPayload`) enriched with `writtenCache` overlays.
   - Prepare the step (`prepareStep`): infer/merge bindings, validate SQL, resolve placeholders, rewrite SQL.
   - Skip (continue) if `prepareStep` returns `null` (disabled or short-circuited).
   - Execute via Optic (`executeStep`).
   - If rows returned and callback exists, call `writeResultsFn(rows, stepMeta, ...)`.
7. **Finalize:** attach debug block to payload if `debug=true`, return summary object.

---

### Function: `prepareStep(step, payload, config, debugLog, logger, stepIndex)`

Prepares a single step for execution. Returns `null` (skip) if:
- `step.enable === false` or `step.enable === null` (explicitly disabled)
- Short-circuit: any binding resolved to an empty array (would generate invalid SQL), or all bindings resolved to null/empty (nothing in WM for this execution).

Otherwise returns a metadata object containing: `preparedSQL`, `bindings`, `bindValues`, `maxRows`, `qualifier`, `addAsTopLevelEntity`, `addToExistingEntity`, `roleName`, `foreignKey`, `parentKey`.

**Important — skipped step cache seeding:** When `prepareStep` returns `null` (disabled or short-circuited), `executeQuerySet` still calls `writeResultsFn` with an empty rows array and a minimal stub of the step's metadata. This seeds the `writtenCache` with an empty entry under the step's role key. Without this, a downstream step that uses `foreignKey`+`parentKey` to target this step's output would find no cache entry at all and raise a misleading `QUERY DEFINITION ERROR` — when the real situation is simply that the step produced no rows (a normal data condition, not a configuration error).

---

### Function: `extractPayload(corticonDataManager, logger, writtenCache)`

Takes a snapshot of all Corticon working memory entities as plain JS objects. This snapshot is used to resolve SQL placeholders for the current and subsequent steps.

**Important:** Corticon entity objects expose scalar attributes via bracket access, but NOT associations. The `writtenCache` parameter injects associations written by previous steps via `Object.defineProperty` overlays (using `Object.create` inheritance so the live entity object is not mutated). This enables paths like `{Products.routingOperations.ID}` to resolve correctly in Step 2 using data that Step 1 wrote.

---

### Function: `executeStep(prepared, config, debugLog, logger)`

Calls `OpticExecutor.execute` with the prepared SQL, qualifier, bind values, and maxRows. Logs timing. Returns an array of row objects.

---

### Helper functions in MarkLogicQueryConnector.js

| Function | Purpose |
|---|---|
| `buildConfig(props)` | Normalises raw SCO properties into a typed config object. Throws if neither `queryName` nor `queryUri` is present. Auto-generates a `traceId` if not provided. |
| `parseQueryDef(raw, traceId)` | Validates the loaded document has `queryName` and a non-empty `steps` array. |
| `shouldShortCircuit(bindingsMeta, bindValues, ...)` | Returns `true` (skip the step) in three conditions: (1) any `many` binding resolved to an empty array — an empty `IN (...)` clause is invalid SQL; (2) ALL bindings resolved to null/empty — no WM values present for any parameter; (3) mixed scalar bindings: at least one `one` binding resolved successfully AND at least one resolved to null — `field = NULL` never matches any row, so the query would always return 0 rows. |
| `buildDebugSQL(preparedSQL, bindValues)` | Inlines bind values into the SQL for human-readable log output (not used for actual execution). |
| `normalizeSql(sql)` | Collapses newlines and extra whitespace for cleaner log lines. |
| `generateTraceId()` | Creates a short correlation ID: `"adc-{timestamp}-{random}"`. |

---

## 6. File 3 — MarkLogicQueryLibrary.js (Utility Library)

### Role
A single-file bundle of all utility sub-modules. Packaged as one file to minimise the number of files a rule author must include in a Corticon rule project.

---

### Sub-module: DebugLogger

Creates a logger instance bound to a `traceId`. Writes structured JSON entries via `xdmp.log` (MarkLogic's server-side log API).

Key methods:

| Method | Purpose |
|---|---|
| `log(level, message, data)` | Writes a log entry at the given level (`debug`, `info`, `warning`, `error`). Debug entries suppressed unless `debugEnabled=true`. |
| `startTimer(label)` / `endTimer(label)` | Bracket a code section to measure elapsed milliseconds. |
| `updateDebugBlock(updates)` / `getDebugBlock()` | Accumulate execution metadata (query name, step counts, row counts, timings) for a diagnostic payload block. |
| `attachDebugBlock(payload, debugPath)` | Writes the debug block into the Corticon payload at a dot-path location (default: `"Debug.QueryCallout"`). |

Sensitive data (arrays) is sanitised before logging: only length + first 2 samples are recorded.

---

### Sub-module: Validators

Enforces query safety at step-preparation time.

| Function | What it checks |
|---|---|
| `validateSelectOnly(sql)` | SQL must start with `SELECT`. Rejects any statement containing `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `TRUNCATE`, `MERGE`, `REPLACE`, `GRANT`, `REVOKE`, `EXEC`, `EXECUTE`, `CALL`. |
| `validateAllowedViews(sql, allowedViews)` | Parses `FROM` and `JOIN` clauses, extracts table/view names, verifies each is in the step's `allowedViews` list. |
| `validateMaxRows(maxRows)` | Ensures `maxRows` is a positive integer ≤ 100,000 (hard cap). Defaults to 100,000 if not set. |
| `validateBindingConsistency(preparedSQL, bindingsMeta)` | Cross-checks that every `@param` in the rewritten SQL has a matching binding entry, and vice versa. |
| `validateQueryDefinition(queryDef)` | Structural validation of the loaded query definition document. |

---

### Sub-module: QueryRegistry

Loads query definition documents from MarkLogic.

#### URI resolution priority

1. `options.queryUri` — use directly (highest priority, bypasses all construction)
2. `options.ruleProject` + `options.queryName` → `/queries/{ruleProject}/{queryName}.json`
3. `options.queryName` only → `/queries/{queryName}.json` (legacy flat layout)

#### Fallback: `findQueryDocByName`
If the URI-based `cts.doc(uri)` lookup returns nothing, and no explicit `ruleProject` or `queryUri` was provided, performs a `cts.search` across the `QueryDefs` collection filtered by the `queryName` field value. This supports documents that have been migrated to a new URI layout without requiring query definition updates.

---

### Sub-module: PlaceholderResolver

Resolves `{Dot.Path}` placeholders against a working memory snapshot.

#### `resolveBindings(bindingsMeta, payload, traceId)`
For each binding, calls `resolvePath` and normalises the result:
- `cardinality: "many"` → result is an array (filtered of nulls). Empty array is allowed unless `required: true`.
- `cardinality: "one"` → scalar. If an array was returned, takes the first element.

#### `resolvePath(obj, path)` / `resolvePathRecursive`
Traverses a dot-separated path on the payload object, crossing arrays transparently. Example:
- Payload: `{ Products: [ {Id:1, ...}, {Id:2, ...} ] }`
- Path: `"Products.Id"` → `[1, 2]`

Array elements are flattened when nested arrays occur. Case-insensitive fallback via `Object.keys` scan handles column name / attribute name mismatches.

---

### Sub-module: SqlRewriter

Rewrites `{Placeholder}` tokens in SQL to `@paramName` for the Optic API.

#### `rewriteSql(statement, bindingsMeta, traceId)`
- Builds a map: `placeholder → param` from binding metadata.
- Validates that every `{Placeholder}` in the SQL has a binding entry, and every binding entry has a matching placeholder — throws with a helpful message if not.
- Performs the global replacement.

Example:
```
Input:  SELECT * FROM Products WHERE Id IN ({Product.Id})
Output: SELECT * FROM Products WHERE Id IN (@productId)
```

---

### Sub-module: OpticExecutor

Executes the prepared SQL against MarkLogic.

#### Primary path — Optic API (`op.fromSQL`)
Attempts to load the Optic module from `/MarkLogic/optic` (ML 10/11) or `globalThis.op` (some ML 11+ environments). Builds `op.fromSQL(preparedSQL, qualifier).limit(maxRows).result(null, opBindings)`. Converts the result Sequence to a JS array of row objects.

#### Fallback path — `xdmp.sql`
Used when the Optic module is not available. Substitutes bind values inline (with proper SQL escaping for strings), appends a `LIMIT` clause, and calls `xdmp.sql(sql, 'array')`.  
The `'array'` format returns a Sequence where the first item is a header row of column names and subsequent items are value arrays. The executor:
1. Strips the schema/table qualifier from column names (`"Schema.View.column"` → `"column"`).
2. Coerces MarkLogic null Node objects (which are typed objects, not JS `null`) to JS `null` — preventing Corticon's JSON parser from seeing unexpected `{}` values.

#### Privilege error handling
Both paths detect `"privilege"` in the error message and rethrow with actionable guidance: the name of the required privilege and a Query Console `sec:privilege-add-roles` command to fix it.

---

### Sub-module: BindingInferrer

Eliminates the need for rule authors to manually write binding metadata in most cases.

#### `inferBindings(sql, traceId)`
Scans the SQL for `{Placeholder}` tokens and auto-generates a binding entry for each:
- `placeholder` — the raw name from `{...}`
- `param` — a camelCase version: `"Products.Id"` → `"productsId"` 
- `cardinality` — `"many"` if the placeholder appears inside `IN (...)`, `"one"` otherwise
- `type` — defaults to `"xs:string"`
- `required` — defaults to `false` (step is skipped gracefully if the value is missing)

#### `mergeBindings(userBindings, inferredBindings)`
When a query definition provides a `bindings` array, merges it with the inferred defaults. User-provided fields win; inferred fields fill gaps. Bindings not mentioned by the user are appended from inference. This lets rule authors override just `type` or `required` without re-specifying everything.

#### `inferQualifier(sql)`
Extracts the first table name from the `FROM` clause to use as the Optic view qualifier.

---

## 7. Server-Side Extension — StudioProxyService.sjs

### Role
`StudioProxyService.sjs` is a MarkLogic REST resource extension that acts as the server-side counterpart to the Studio proxy path. It is **not** part of the Corticon decision service bundle — it runs on MarkLogic and is called over HTTP from the Node.js proxy path in `MarkLogicServiceCallout.js`.

**Deployed to:** MarkLogic modules database at path `/ext/Advanced Data Connector/ml-rest/StudioProxyService.sjs`  
**Called via:** `POST /v1/resources/StudioProxyService`  
**Deploy using:** `scripts/deploy-studio-proxy.ps1`

### Request / response contract

**Request body (JSON):**
```json
{
  "queryName":   "my-query",
  "ruleProject": "MyProject",
  "queryUri":    null,
  "debug":       false,
  "traceId":     "proxy-...",
  "wmSnapshot":  { "EntityType": [ { "attr1": "val1", ... }, ... ] }
}
```

**Response body (JSON):**
```json
{
  "steps": [
    {
      "rows":     [ { "ColumnA": "val", ... }, ... ],
      "stepMeta": { "stepIndex": 0, "sequenceNo": 1, "addToExistingEntity": "...", ... }
    }
  ],
  "summary":  { "stepsExecuted": 1, "totalRows": 5, "totalMs": 23 },
  "debugLog": { "entries": [ { "level": "debug", "msg": "..." } ] },
  "error":    null
}
```

### Transaction handling

MarkLogic REST POST handlers run inside a read-only (query) transaction. Any write step that calls `xdmp.documentInsert` requires an update transaction. `StudioProxyService.sjs` uses `xdmp.invokeFunction` with `{ update: 'true', commit: 'auto' }` to wrap the full pipeline execution in a separate update transaction, allowing SELECT and write steps to coexist. The MarkLogic user running the service must have the `xdmp-invoke` execute privilege for this to succeed (see Section 13).

### Mock `corticonDataManager`

Because `StudioProxyService.sjs` does not have a real Corticon data manager, it creates a lightweight mock from the `wmSnapshot`:

```js
var mockCDM = {
    getEntityTypes:     function () { return Object.keys(wmSnapshot); },
    getEntitiesByType:  function (typeName) { return wmSnapshot[typeName] || []; }
};
```

This satisfies `extractPayload()` inside `executeQuerySet`, which calls exactly these two methods.

### Optic qualifier stripping

Optic API result rows use fully qualified column names: `"Schema.View.ColumnName"`. After `JSON.parse(JSON.stringify(rows))`, the extension strips the qualifier prefix, keeping only the bare column name: `"ColumnName"`. This matches what the production path returns so `writeStepResults` behaves identically in both environments.

### `writtenCache` population in the collector

The `collectorCallback` inside `StudioProxyService.sjs` mirrors the cache-seeding logic of `writeStepResults` in `MarkLogicServiceCallout.js`. After each step it updates `writtenCache` so that `extractPayload` (called by the next step) can overlay the freshly-written associations onto the WM snapshot — enabling multi-step placeholder resolution (e.g. `{ChildType.columnName}` after Step 1 results have been cached) without requiring a real Corticon entity API.

---

## 8. Query Definition JSON Format

Query definitions are JSON documents stored inside MarkLogic (typically in the `QueryDefs` collection) and loaded at runtime. They are NOT bundled with the JavaScript source files.

### Minimal single-step example
```json
{
  "queryName": "parts-by-status",
  "steps": [
    {
      "sequenceNo": 1,
      "statement": "SELECT PartNumber, Description, Status FROM Parts WHERE PartNumber IN ({Part.Number}) AND Status = {Part.Status}",
      "enable": true,
      "addToExistingEntity": "Root",
      "roleName": "envelope",
      "maxRows": 1000
    }
  ]
}
```

### Two-step nested hierarchy example
```json
{
  "queryName": "product-with-routing",
  "steps": [
    {
      "sequenceNo": 1,
      "statement": "SELECT Id, OperationName, Plant FROM RoutingOperations WHERE ProductId IN ({Products.Id})",
      "enable": true,
      "addToExistingEntity": "Products",
      "roleName": "routingOperations",
      "maxRows": 5000
    },
    {
      "sequenceNo": 2,
      "statement": "SELECT SetupId, OpId, CycleTime FROM OperationSetupDetails WHERE OpId IN ({routingOperations.Id})",
      "enable": true,
      "addToExistingEntity": "routingOperations",
      "roleName": "operationSetupDetails",
      "foreignKey": "OpId",
      "parentKey": "Id",
      "maxRows": 5000
    }
  ]
}
```
In this example, Step 1's write is automatically **deferred** (detected by the look-ahead in the Connector) because Step 2 targets `routingOperations` via `foreignKey`/`parentKey`. The final write to Corticon working memory happens once, in Step 2, with the full nested hierarchy.

### Step field reference

All step fields are at the top level of the step object.

| Field | Type | Required | Applies to | Description |
|---|---|---|---|---|
| `sequenceNo` | integer | Yes | Both | Execution order. Steps run in ascending order. |
| `statementType` | string | No | Both | `"select"` (default), `"insert"`, `"update"`, or `"upsert"`. |
| `statement` | string | SELECT only | SELECT | SQL SELECT. Use `{Entity.attribute}` for WM values. |
| `enable` | boolean \| null | No | Both | `false` or `null` disables the step. Omit or set `true` to enable. |
| `addAsTopLevelEntity` | string \| null | Conditional | SELECT | Corticon vocabulary type. Creates result rows as new top-level entities. Mutually exclusive with `addToExistingEntity`. |
| `addToExistingEntity` | string \| null | Conditional | Both | Corticon vocabulary type. For SELECT: attaches results under `roleName` to existing entity. For write steps: the entity type to read from WM. |
| `roleName` | string | Conditional | Both | For SELECT: association role name on parent (e.g. `"routingOperations"`). For write steps with `addToExistingEntity`: the nested role to collect. |
| `foreignKey` | string | No | SELECT | Column in THIS step's results referencing the parent entity's key. Required for 2nd-level (and deeper) nesting. |
| `parentKey` | string | No | SELECT | Attribute name on the PARENT entity that `foreignKey` references. Required with `foreignKey`. |
| `documentUriTemplate` | string | Write only | Write | URI template with `{attributeName}` placeholders. Resolved per entity. E.g. `"/data/{orderId}.json"`. |
| `collections` | string[] | No | Write | MarkLogic collections to assign to written documents. |
| `maxRows` | integer | No | SELECT | Cap on returned rows. Defaults to / hard-capped at 100,000. |
| `allowedViews` | string[] | No | SELECT | Allowlist of view names permitted in the SQL. |
| `qualifier` | string | No | SELECT | Optic view qualifier. Auto-derived from `FROM` if omitted. |
| `bindings` | array | No | SELECT | Manual binding metadata. Auto-inferred from SQL when omitted. Override `type`, `cardinality`, or `required`. |

### Binding entry format (inside `bindings` array)

| Field | Type | Default | Description |
|---|---|---|---|
| `placeholder` | string | — | Exact dot-path used in the SQL, e.g. `"Products.Id"` |
| `param` | string | auto-camelCase | The `@param` name generated for the SQL rewrite |
| `type` | string | `"xs:string"` | XSD type hint for Optic |
| `cardinality` | string | auto-detected | `"one"` (scalar) or `"many"` (IN clause) |
| `required` | boolean | `false` | Throw an error if the value is missing, instead of skipping the step |

---

## 9. Document Write Steps (insert / update / upsert)

SELECT steps read data from MarkLogic and write it into Corticon working memory. **Write steps** do the opposite: they take entity data already in Corticon working memory and persist it as JSON documents in MarkLogic.

### Write step fields (in the query definition JSON)

| Field | Type | Required | Description |
|---|---|---|---|
| `statementType` | string | Yes | `"insert"`, `"update"`, or `"upsert"` |
| `addToExistingEntity` | string | Yes | Top-level entity type in WM to read from (e.g. `"Order"`) |
| `roleName` | string | No | If set, reads the named association under the entity, not the entity itself |
| `documentUriTemplate` | string | Yes | URI template with `{attributeName}` placeholders, e.g. `"/data/{orderId}.json"` |
| `collections` | string[] | No | MarkLogic collections to assign to the written documents |

There is no `statement` field — write steps perform no SQL query.

### How write steps execute

1. **`prepareStep`** in `MarkLogicQueryConnector.js` detects `statementType` is a write type, validates the step via `Validators.validateWriteStep`, and returns a prepared object with `preparedSQL: null`.
2. **`executeStep`** calls `collectEntities(prepared, payload, ...)` to traverse the WM snapshot and gather the entity objects.
3. **`collectEntities`** traversal logic:
   - `addToExistingEntity` only → collects all instances of that root type from the snapshot
   - `addToExistingEntity` + `roleName` → collects the `roleName` association from every root instance
4. **`OpticExecutor.executeDocumentWrite`** iterates the collected entities, resolves `{attributeName}` placeholders in the `documentUriTemplate` (flat attribute names on the entity), and calls `xdmp.documentInsert(uri, entity, permissions, collections)` for each.
5. Write steps do **not** call `writeStepResults` — they produce no result rows and have no Corticon WM write.

### Transaction requirement

`xdmp.documentInsert` is an update API. The SCO calls `declareUpdate()` at the very start of `executeQueryCalloutML` (before any MarkLogic API call) to ensure the transaction is in update mode throughout the entire query set execution — even if write steps are mixed with SELECT steps in the same query definition.

> **Note on `declareUpdate()` placement:** MarkLogic locks a transaction to query-only mode the moment any read API (including `xdmp.log`) is called. `declareUpdate()` must be the absolute first statement executed, before any `require()` or log call. This is why `StudioProxyService.sjs` emits `declareUpdate()` as the very first line of the eval code it submits when `logLevel > 0` — otherwise the Corticon runtime's `xdmp.log` call in its debug path would lock the transaction to read-only before the SCO's own `declareUpdate()` fires.

### URI template placeholders

Placeholders are the **flat attribute name** on the collected entity — not a dotted vocabulary path. For example, if the entity has an attribute `orderId`, the template is `"/data/{orderId}.json"`. The connector resolves placeholders case-insensitively.

### Conflicting update protection

Writing two entities that resolve to the same URI template within the same query set raises a MarkLogic "Conflicting updates" error. Use composite URI templates (e.g. `{orderId}-{lineNumber}.json`) when multiple entities may share one identifier value.

---

## 10. End-to-End Execution Flow

Below is the complete sequence of events for a single SCO invocation — both the production path (inside MarkLogic) and the Studio proxy path (Node.js → HTTP → MarkLogic).

### Production path (inside MarkLogic SJS)

```
Corticon Runtime
    │
    ├─ 1. Calls executeQueryCallout(corticonDataManager, serviceCalloutProperties)
    │       └─ typeof xdmp !== 'undefined' → executeQueryCalloutML()
    │            └─ declareUpdate() [guarded — first line, before any xdmp.* call]
    │
    ├─ 2. resolveQueryConfig() — finds QueryConfig entity in WM, or uses static props
    │       → produces merged props with queryName / ruleProject / queryUri
    │
    ├─ 3. MarkLogicQueryConnector.executeQuerySet() starts
    │       ├─ buildConfig() → normalised config + traceId
    │       ├─ QueryRegistry.getQueryDefinition() → cts.doc(uri).toObject()
    │       ├─ parseQueryDef() → validates structure
    │       │
    │       ├─ Sort steps by sequenceNo
    │       │
    │       ├─ Look-ahead scan
    │       │     For each SELECT step with foreignKey+parentKey+addToExistingEntity:
    │       │       Find earlier step whose roleName matches addToExistingEntity
    │       │       Mark that earlier step deferWrite=true
    │       │
    │       └─ For each step (sorted):
    │             │
    │             ├─ extractPayload() — snapshot WM entities + inject writtenCache overlays
    │             │
    │             ├─ prepareStep()
    │             │     ├─ Check enable flag — return null if disabled
    │             │     │
    │             │     ├─ WRITE STEP (insert/update/upsert):
    │             │     │     validateWriteStep() → return write-mode prepared object
    │             │     │
    │             │     └─ SELECT STEP:
    │             │           ├─ BindingInferrer.inferBindings() or mergeBindings()
    │             │           ├─ Validators.validateSelectOnly()
    │             │           ├─ PlaceholderResolver.resolveBindings() — values from WM snapshot
    │             │           ├─ shouldShortCircuit() — skip if empty IN, all-null, or mixed-null
    │             │           ├─ SqlRewriter.rewrite() — {Placeholder} → @param
    │             │           └─ return prepared step metadata
    │             │
    │             ├─ executeStep()
    │             │     ├─ WRITE STEP:
    │             │     │     collectEntities() — gather objects from WM snapshot
    │             │     │     OpticExecutor.executeDocumentWrite() → xdmp.documentInsert × N
    │             │     │
    │             │     └─ SELECT STEP:
    │             │           OpticExecutor.execute()
    │             │             ├─ op.fromSQL(sql, qualifier).result(null, bindings)  [primary]
    │             │             └─ xdmp.sql(inlined sql, 'array')                     [fallback]
    │             │
    │             └─ writeStepResults(rows, stepMeta, corticonDataManager, logger, writtenCache)
    │                   [WRITE STEPS: early return — no WM write needed]
    │                   [SELECT STEPS:]
    │                   ├─ Path A: addAsTopLevelEntity     → addEntitiesAndAssociations()
    │                   ├─ Path B: addToExistingEntity (standard) → addAssociationsToEntity() × N
    │                   ├─ Path B2: deferWrite=true (top-level producer) → store in writtenCache
    │                   ├─ Path C: foreignKey+parentKey+deferWrite=true (intermediate)
    │                   │           → merge children into cached parent rows
    │                   │           → update cache with enriched rows
    │                   │           → record __anc__ ancestry link
    │                   │           → do NOT write to WM
    │                   ├─ Path D: foreignKey+parentKey+deferWrite=false (leaf)
    │                   │           → merge children into cached parent rows
    │                   │           → findWmAnchor() walks __anc__ chain to live WM entity
    │                   │           → single addAssociationsToEntity flush of full tree
    │                   └─ Path E: cross-SCO fallback → getAllEntitiesOfType(), FK match, attach
    │
    └─ 4. Returns summary { queryName, stepsExecuted, totalRows, totalMs }
```

### Studio proxy path (Node.js → HTTP → MarkLogic)

```
Corticon Studio (Node.js)
    │
    ├─ 1. Calls executeQueryCallout(...)
    │       └─ typeof xdmp === 'undefined' → executeQueryCalloutProxy()
    │
    ├─ 2. loadStudioConfig() — indirect require of MarkLogicStudioConfig.js
    │
    ├─ 3. resolveQueryConfig() — same logic as production path
    │
    ├─ 4. buildWmSnapshot(corticonDataManager) — serialize all WM entities
    │       → sanitizeForJson() strips __metadata, dataMgr, circular refs
    │
    ├─ 5. httpPost(studioConfig, { queryName, ruleProject, wmSnapshot, ... })
    │       ├─ authType='digest' → RFC 2069 challenge-response
    │       └─ authType='basic'  → Base64 header
    │
    ├─ 6. POST /v1/resources/StudioProxyService (MarkLogic)
    │       ├─ StudioProxyService.sjs receives request
    │       ├─ xdmp.invokeFunction(..., { update: 'true' })
    │       │     ├─ executeQuerySet(mockCDM, props, logger, collectorCallback)
    │       │     │     [same pipeline as production path]
    │       │     └─ collectorCallback accumulates step rows + stepMeta
    │       └─ returns { steps: [...], summary: {...}, debugLog: {...} }
    │
    ├─ 7. Proxy receives response
    │       ├─ Echo server debug log entries to Studio console
    │       └─ For each step in response.steps:
    │             stripNullsDeep(rows) → remove explicit nulls (Decimal crash guard)
    │             writeStepResults(cleanRows, stepMeta, corticonDataManager, ...)
    │             [same WM write logic as production path]
    │
    └─ 8. Returns Promise<void> — Corticon awaits resolution
```

---

## 11. Advanced Write Modes (How Results Land in Corticon)

### Why these write modes exist

Corticon's working memory (WM) API has several constraints that require different approaches depending on relationship depth and execution context:

1. `getEntitiesByType` only returns **top-level** entities, not entities added via `addAssociationsToEntity`.
2. `addAssociationsToEntity` called **multiple times** on the same parent against the same role discards links built by prior calls — a single combined payload call is required.
3. Associations created **inside a branch container** reside in an inner data layer. When the branch wrapper calls `removeDataLayer()`, only first-level associations (owned by outer-scope entities) survive.

The write-mode selection logic in `writeStepResults` navigates all of these constraints automatically, supporting an **arbitrary number of nesting levels** with no limit and no changes to query definitions.

### Mode selection logic

```
Has addAsTopLevelEntity?
  YES → addEntitiesAndAssociations() per row                         [Path A]

Has addToExistingEntity + entity found in WM directly?
  NOT deferWrite → addAssociationsToEntity() per row (standard)      [Path B]
  deferWrite=true → store rows in writtenCache (top-level producer)  [Path B2]

Has addToExistingEntity + NOT found in WM + foreignKey + parentKey?
  writtenCache has entry for this role name?
    YES + deferWrite=true → intermediate: merge children into cached rows,
                            update cache, record __anc__ ancestry, skip WM   [Path C]
    YES + deferWrite=false → leaf: merge children into cached rows,
                             walk __anc__ chain via findWmAnchor(),
                             single addAssociationsToEntity flush             [Path D]
    NO → cross-SCO fallback: getAllEntitiesOfType + FK match + attach        [Path E]

None of the above → log error, rows not written
```

### `writtenCache` data structure

```
"ParentType.roleName"            rows[]   ← flat initially; enriched in-place by later steps
"__anc__.ChildType.childRole"    { parentCacheKey: "ParentType.roleName" }
```

The `__anc__` entries form a singly-linked ancestry chain. `findWmAnchor()` follows them from the deepest level upward until it finds an owner type that is a live WM entity (top-level). The rows at that cache key are the fully-enriched tree to flush.

### N-level example: Orders → OrderLines → Items → ItemComponents

| Step | deferWrite | Action |
|---|---|---|
| Step 1 produces `orderLines` under `Orders` | `true` | Cache `"Orders.orderLines"` = flat rows; no WM write |
| Step 2 produces `items` under `orderLines` | `true` | Merge items into cached orderLines rows; update `"Orders.orderLines"` + set `"orderLines.items"` + `__anc__` link; no WM write |
| Step 3 produces `itemComponents` under `items` | `false` | Merge into cached items rows; `findWmAnchor` walks: `items.itemComponents` → `orderLines.items` → `Orders.orderLines` → `Orders` entity found in WM → single flush |

All four levels land in WM in one `addAssociationsToEntity` call.

---

## 12. Configuration Reference

### SCO Runtime Properties (set in Corticon Studio Properties pane)

| Property | Type | Required | Description |
|---|---|---|---|
| `queryName` | string | Conditional | Query document name. Resolved to a URI using `ruleProject` if provided. Lowest-priority fallback — overridden by `QueryConfig` entity in WM. |
| `ruleProject` | string | No | Rule project folder. When set, URI is `/queries/{ruleProject}/{queryName}.json`. |
| `queryUri` | string | Conditional | Direct document URI. Bypasses `queryName`/`ruleProject` entirely. |
| `debug` | boolean | No | Set to `true` to enable verbose debug logging and attach a `Debug.QueryCallout` block to the payload. |
| `traceId` | string | No | Custom correlation ID. Auto-generated as `adc-{timestamp}-{random}` if not provided. |
| `debugPath` | string | No | Dot-path in payload where debug block is written. Default: `"Debug.QueryCallout"`. |

### QueryConfig entity (set by rules in a rulesheet before the SCO fires)

| Attribute | Type | Description |
|---|---|---|
| `queryName` | string | Overrides `queryName` runtime property. |
| `ruleProject` | string | Overrides `ruleProject` runtime property. |
| `queryUri` | string | Overrides `queryUri` runtime property. |
| `debug` | boolean | Overrides `debug` runtime property. |

---

## 13. MarkLogic Security Prerequisites

### Required execute privileges

The MarkLogic role assigned to the Corticon user must have the following execute privileges:

| Privilege URI | Required by | When required |
|---|---|---|
| `http://marklogic.com/xdmp/privileges/xdmp-sql` | `xdmp.sql()` fallback | When Optic module is not available |
| `http://marklogic.com/xdmp/privileges/xdmp-eval` | Corticon.js runtime | Corticon bundles JS into an eval-based runner |
| `http://marklogic.com/xdmp/privileges/xdmp-invoke` | `StudioProxyService.sjs` | Required for `xdmp.invokeFunction` used to run write steps in update transactions |
| Optic API privileges | `op.fromSQL()` | Consult MarkLogic Optic API Security docs for your version |

The `rest-reader` and `rest-writer` built-in roles also need to be granted depending on whether the service performs reads only (`rest-reader`) or also write steps (`rest-writer`).

### Granting a privilege via Query Console

```xquery
xquery version "1.0-ml";
import module namespace sec = "http://marklogic.com/xdmp/security"
  at "/MarkLogic/security.xqy";

sec:privilege-add-roles(
  "http://marklogic.com/xdmp/privileges/xdmp-invoke",
  "execute",
  ("your-corticon-role")
)
```

Run this in Query Console against the **Security** database. Repeat for each privilege URI as needed.

### SQL-injection prevention

All Corticon WM values are passed as named bind parameters to the Optic API (`plan.result(null, opBindings)`) — they are never concatenated into the SQL string. The `xdmp.sql` fallback uses apostrophe-escaping (`'` → `''`) before inline substitution. Neither path is vulnerable to SQL injection from working-memory attribute values.

### SELECT-only guard

`Validators.validateSelectOnly` rejects any SQL that does not begin with `SELECT` or that contains any of the following keywords: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `TRUNCATE`, `MERGE`, `REPLACE`, `GRANT`, `REVOKE`, `EXEC`, `EXECUTE`, `CALL`. This check runs at step-preparation time, before the query reaches MarkLogic. Note: document write steps (`statementType: "insert"/"update"/"upsert"`) follow a completely separate code path and do not pass through SQL validation.

### Allowed-views gating

Optional step-level field `allowedViews: ["ViewA", "ViewB"]`. When present, every table/view referenced in the SQL's `FROM` and `JOIN` clauses is checked against the list. An unknown view causes an error before execution. This lets an operations team lock each query definition to only the views it is supposed to touch.

### MaxRows hard cap

`Validators.validateMaxRows` enforces a ceiling of 100,000 rows regardless of what `maxRows` is set to in the query definition. This prevents unbounded queries from consuming excessive MarkLogic memory.

### Privilege error surfacing

Both `op.fromSQL` and `xdmp.sql` exception paths detect MarkLogic privilege errors and rethrow with a concrete remediation instruction — the exact `sec:privilege-add-roles` Query Console command — so missing privileges are immediately actionable rather than opaque stack traces.

---

## 14. Logging and Debugging

### Log format
All entries logged via `xdmp.log` are structured JSON:
```json
{
  "prefix": "ADC-QueryCallout",
  "traceId": "adc-1748521234567-x9f02a",
  "level": "info",
  "message": "Step 1 (seq 1) SQL: 12ms | 47 row(s)",
  "data": { ... }
}
```

### Log levels
| Level | When used |
|---|---|
| `debug` | Verbose step-by-step trace. Only written when `debug=true`. |
| `info` | Normal execution milestones (step timings, row counts). Always written to `xdmp.log`. |
| `warning` | Non-fatal issues that may need attention. |
| `error` | Query definition configuration problems and runtime errors. |

### Debug payload block
When `debug=true`, a structured block is attached to the Corticon payload at the `debugPath` location:
```json
{
  "traceId": "adc-...",
  "queryName": "product-with-routing",
  "queryDocUri": "/queries/myproject/product-with-routing.json",
  "stepCount": 2,
  "step_1_seq": 1,
  "step_1_rows": 12,
  "step_1_ms": 8,
  "step_2_seq": 2,
  "step_2_rows": 47,
  "step_2_ms": 14,
  "timings": { "loadQuery": 3, "total": 28 }
}
```
This block is **not** visible in Corticon Studio's built-in tester — the tester only displays attributes that are part of the vocabulary. It is visible in the JSON response when the decision service is invoked externally as a REST request (e.g. via `/corticon/execute`), making it useful for diagnosing slow or empty queries in integration testing and production without reading MarkLogic server logs directly.

### Corticon Studio logger
The connector also writes key milestones to `corticonDataManager.getLogger()` (`logDebug` / `logError`), which are written to the Corticon Studio log file. This does not require debug mode to be on.

---

## 15. Key Design Decisions and Constraints

### Why one library file instead of separate modules?
Corticon Studio bundles SCO files using browserify. Keeping all utilities in `MarkLogicQueryLibrary.js` means the rule author only needs to add three files to a rule project — and there are no relative `require()` paths that could fail during bundling.

### Why indirect `require` for the Optic module?
`var _req = require; op = _req('/MarkLogic/optic')` hides the path from Corticon Studio's static `require` analysis. If the path were written as a string literal in `require(...)`, Studio would try to resolve it during bundling and fail with `MODULE_NOT_FOUND`. At MarkLogic runtime, the indirect call resolves correctly.

### Why `Object.create` overlays in `extractPayload`?
Corticon entity objects expose scalar attributes through getter descriptors (defined on the Proxy target), not as plain own properties. They do NOT expose associations — those require `getAssociationsForEntity`, which returns plain JSON copies (not live references). The overlay approach uses `Object.defineProperty` to attach `writtenCache` rows to a non-mutating wrapper, so path resolution (e.g. `{Products.routingOperations.Id}`) works in subsequent steps without corrupting the live WM objects.

### Why a single `addAssociationsToEntity` call for nested writes?
Multiple sequential calls to `addAssociationsToEntity` on the same parent entity cause Corticon's bidirectional back-reference index to discard associations built by prior calls. The N-level deferred mechanism avoids this entirely: intermediate steps build up a fully-enriched JSON tree in `writtenCache` (plain JS objects, never touching WM), and the leaf step passes the complete tree to Corticon in exactly one `addAssociationsToEntity` call from the top-level WM anchor. Corticon processes nested association JSON recursively, so any depth is handled correctly.

### Why `writtenCache` uses `__anc__` metadata entries?
For N-level chains, a consuming step that is itself a producer (intermediate step) needs to know which cache entry owns it, so that when the leaf step fires it can walk upward to the live WM entity. The `__anc__.<childKey>` entries form a singly-linked ancestry list. `findWmAnchor()` follows these links, at each level checking whether the owner type is findable via `getEntitiesByType`. The first hit is the flush target. The depth guard (20 hops) prevents infinite loops if a query definition accidentally creates circular role-name references.

### Why `normalizeSingletons`?
Corticon's JSON association convention requires that a 1:many association with exactly one child be represented as a plain object `{}`, not as a single-element array `[{}]`. Arrays with two or more elements must remain arrays. `normalizeSingletons` recursively enforces this at every nesting level. It also converts empty objects (MarkLogic null Node objects that serialise as `{}`) to JS `null`, preventing Corticon Studio's `#ref_id` JSON parsing error.

### The branch container limitation (understanding scope)

> **Known Corticon bug — outstanding with Engineering.** The behaviour described below is a defect in Corticon.js, not an intentional design constraint of this connector. The workarounds listed at the end of this section are required until the bug is resolved.

When a Corticon ruleflow places an SCO inside a **Branch Container**, the compiled bundle wraps execution in `addDataLayer() → fire SCOs → removeDataLayer()`. The data layer teardown promotes first-level associations (those owned by outer-scope entities like `Products`) but removes second-level associations (owned by inner-scope entities like `RoutingOperations` that were created inside the branch). To write multi-level hierarchies that survive to rule execution, either:
- Place the SCO **outside** the branch container in the ruleflow, **or**
- Use the deferred nested write (Modes C+D) so the entire hierarchy is written as a single `addAssociationsToEntity` payload anchored to a top-level outer-scope entity — which is owned by the outer layer and therefore promoted correctly.
