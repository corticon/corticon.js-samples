# AdvancedDataConnectorML — Corticon.js Service Callout for MarkLogic SQL/TDE Queries

> **Who should read this?**
> **Rule authors** setting up or using the connector in a Corticon rule project — you need this document. It covers installation, configuration, writing query definition JSON files, step fields, debug options, and security prerequisites. You do not need to read the source code.
> If you are a **developer** who needs to understand the internal implementation, extend the code, or trace a bug — read [src/callout/ARCHITECTURE.md](src/callout/ARCHITECTURE.md) instead (or in addition).

A Corticon.js Service Callout (SCO) framework that implements an ADC-like (Advanced Data Connector) pattern for dynamic, parameterized data retrieval from MarkLogic TDE views using SQL. Query definitions are stored as JSON documents in MarkLogic and resolved at runtime.

## Architecture Overview

> For a complete technical reference — including the dual-environment design, Studio proxy internals, write step mechanics, N-level deferred nesting, and all design decisions — see [src/callout/ARCHITECTURE.md](src/callout/ARCHITECTURE.md).

```
┌──────────────────────────────────────────────────────────────────────┐
│  Corticon.js Ruleflow                                                │
│                                                                      │
│  ┌──────────┐    ┌──────────────────────────────┐    ┌─────────────┐ │
│  │  Rules    │───▶│  MarkLogicServiceCallout.js  │───▶│  Rules      │ │
│  │ (before)  │    │  (SCO entry point)           │    │  (after)    │ │
│  └──────────┘    └──────────────────────────────┘    └─────────────┘ │
│                           │                                          │
└───────────────────────────│──────────────────────────────────────────┘
                            │ delegates to
                            ▼
              ┌──────────────────────────────┐
              │ MarkLogicQueryConnector.js   │
              │ (query orchestration)        │
              └──────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
   ┌──────────────┐ ┌─────────────┐ ┌────────────────┐
   │QueryRegistry │ │Placeholder  │ │ SqlRewriter     │
   │(load JSON    │ │Resolver     │ │ ({X} → @param)  │
   │ query doc)   │ │(payload→val)│ │                 │
   └──────────────┘ └─────────────┘ └────────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
                   ┌────────────────┐
                   │ OpticExecutor  │
                   │ op.fromSQL()   │
                   │ + bindings     │
                   └────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ writeStepResults│
                   │ (results → WM) │
                   └────────────────┘
```

## Project Structure

### Deployment files

**Production deployment — 3 files** (bundled into the Corticon decision service and deployed to MarkLogic):

```
src/callout/
├── MarkLogicServiceCallout.js    ← SCO entry point (Corticon registration)
├── MarkLogicQueryConnector.js    ← Query orchestration (load/resolve/execute)
└── MarkLogicQueryLibrary.js      ← All utility modules consolidated in one file
```

**Studio testing — 4 files** (all 3 above plus one additional file required for Studio to connect to MarkLogic over HTTP):

```
src/callout/
├── MarkLogicServiceCallout.js    ← SCO entry point (Corticon registration)
├── MarkLogicQueryConnector.js    ← Query orchestration (load/resolve/execute)
├── MarkLogicQueryLibrary.js      ← All utility modules consolidated in one file
└── MarkLogicStudioConfig.js      ← YOUR credentials file (not committed to git)
```

> **`MarkLogicStudioConfig.js` is required for Studio testing.** When running a rule test inside Corticon Studio, the SCO executes in Node.js (not inside MarkLogic). It needs a live HTTP connection to a MarkLogic server to load query definitions and run SQL. `MarkLogicStudioConfig.js` supplies the host, port, username, password, and auth type for that connection. You create this file by copying `MarkLogicStudioConfig.template.js` and filling in your own credentials. It must be added to the Corticon Extensions list in Studio (as a dependency file, not as an SCO).
>
> **Including it in a production bundle is harmless.** The SCO checks `typeof xdmp !== 'undefined'` at startup and takes the production path inside MarkLogic — the proxy code and the config file are never entered or loaded at runtime. The indirect `require` pattern used to load the config also means that if the file is *absent* from the Extensions list, the bundle still compiles cleanly for production. In short: include it if you want Studio testing to work; leave it out if you have a production-only deployment — either way, production execution is unaffected.
>
> The one hard rule: **never commit `MarkLogicStudioConfig.js` to version control** — it contains credentials. It is already listed in `.gitignore`.

### Full project layout

```
AdvancedDataConnectorML/
├── README.md
├── src/
│   ├── callout/
│   │   ├── MarkLogicServiceCallout.js    ← SCO entry point (Corticon registration)
│   │   ├── MarkLogicQueryConnector.js    ← Query orchestration (load/resolve/execute)
│   │   └── MarkLogicQueryLibrary.js      ← All utility modules in one file
│   └── test/
│       ├── PlaceholderResolver.test.js   ← Pure JS tests (Node-compatible)
│       ├── SqlRewriter.test.js           ← Pure JS tests (Node-compatible)
│       └── Validators.test.js            ← Pure JS tests (Node-compatible)
└── examples/
    ├── query-definitions/
    │   ├── product-lookup.json           ← Multi-value IN clause example
    │   ├── parts-by-status.json          ← Multi-placeholder example
    │   └── single-product.json           ← Single value / object result
    ├── payload-input.json                ← Example payload before callout
    └── payload-output.json               ← Example payload after callout
```

## Deployment

### Step 1: Add Service Callout Files to Corticon Extensions

The JavaScript files are **not** deployed directly to MarkLogic. Instead, they are added to the Corticon.js project and bundled into the decision service.

In Corticon.js Studio:

1. Right-click your project → **Properties** → **Corticon Extensions**
2. Add the 3 core files from `src/callout/`:
   - `MarkLogicServiceCallout.js` — SCO entry point (detected by Studio)
   - `MarkLogicQueryConnector.js` — dependent JS file (query orchestration)
   - `MarkLogicQueryLibrary.js` — dependent JS file (utility functions)
3. **Also add `MarkLogicStudioConfig.js` as a 4th dependency file.** This is required for testing in Corticon Studio (the Studio proxy uses it to connect to MarkLogic over HTTP). It is safe to include in a production bundle — the production code path never loads it. Do not add it to the SCO registration, only as a dependency. See the *Studio Proxy* section and the *Deployment files* note above for full details.

All 4 files must be present in the Extensions list if you intend to test in Corticon Studio. For a production-only bundle without Studio testing, the 3 core files are sufficient.

> **Browserify note:** Corticon Studio uses browserify to bundle JS files. Browserify walks
> `require()` calls statically and would fail on the MarkLogic server-side module
> `/MarkLogic/optic` (which only exists at runtime inside MarkLogic). To prevent this,
> `MarkLogicQueryLibrary.js` uses an indirect require (`var _req = require; _req('/MarkLogic/optic')`)
> that browserify cannot trace. **Do not change this back to a direct `require()` call** or
> the decision service bundle compilation will fail.

### Step 2: Deploy the Decision Service

When you compile and deploy the decision service from Corticon.js Studio, the JavaScript files in the Extensions list are automatically bundled into the decision service package. The decision service is then deployed to the MarkLogic JavaScript engine where it executes.

### Step 3: Load Query Definition Documents into MarkLogic

Query definitions are JSON documents stored in the MarkLogic **content database**. The preferred URI structure is `/queries/{ruleProjectName}/{queryName}.json` — this keeps query definitions organised by rule project and is the recommended layout. A legacy flat path `/queries/{queryName}.json` (without a project folder) is also supported for backwards compatibility, but the project-scoped layout should be used for new deployments.

```bash
# Example: load a query definition using the MarkLogic REST API
# Preferred URI layout: /queries/{ruleProjectName}/{queryName}.json
curl -X PUT --digest -u admin:admin \
  -H "Content-Type: application/json" \
  -d @examples/query-definitions/product-lookup.json \
  "http://localhost:8000/v1/documents?uri=/queries/MyRuleProject/product-lookup.json"
```

### Step 4: Ensure TDE Views Exist

The SQL queries execute against TDE (Template Driven Extraction) views. Ensure your TDE templates are deployed and the views are accessible. Verify with:

```sql
-- In MarkLogic Query Console (SQL mode)
SELECT * FROM Products LIMIT 5
```

### Step 5: Grant Required MarkLogic Privileges

The MarkLogic user that executes the decision service needs the following execute privileges:

| Privilege URI | Required By | Notes |
|---|---|---|
| `http://marklogic.com/xdmp/privileges/xdmp-sql` | `xdmp.sql` fallback path | Used when the Optic module is not available |
| `http://marklogic.com/xdmp/privileges/xdmp-eval` | Corticon.js runtime | Required by the JS engine for eval-based execution |
| `http://marklogic.com/xdmp/privileges/xdmp-invoke` | `StudioProxyService.sjs` | Required when write steps run via `xdmp.invokeFunction` (update transaction wrapper) |

Also assign the `rest-reader` role for SELECT-only query sets, and add `rest-writer` if the query set contains write steps (insert/update/upsert).

The Optic API path (`op.fromSQL`) uses its own privilege model — consult the [MarkLogic Optic API Security](https://docs.marklogic.com/guide/app-dev/OpticAPI) documentation for your version.

To grant a privilege to a role via Query Console (run against the **Security** database):

```xquery
xquery version "1.0-ml";
import module namespace sec = "http://marklogic.com/xdmp/security" at "/MarkLogic/security.xqy";

sec:privilege-add-roles(
    "http://marklogic.com/xdmp/privileges/xdmp-invoke",
    "execute",
    ("your-corticon-role")
)
```

> **Optic module loading:** The SCO tries multiple module paths (`/MarkLogic/optic`,
> `/MarkLogic/optic.mjs`, and the `globalThis.op` built-in) to support MarkLogic 10.x
> and 11+. If none resolve, the `xdmp.sql` fallback is used automatically. Check
> `op.fromSQL` availability in Query Console to verify which path your version supports.

## Configuring the Service Callout in Corticon.js Studio

### Step 1: Add the SCO block to your Ruleflow

Once the files are added to Corticon Extensions (Deployment Step 1), Corticon Studio **automatically detects** `AdvancedDataConnectorML` as an available Service Callout — no manual registration is required.

In your ruleflow:

1. Drag a **Service Callout** block into the ruleflow at the desired position (between your pre-query rulesheets and your post-query business rules).
2. Open the block's **Properties** panel.
3. In the **Service Name** field, click the dropdown and select **`MarkLogicServiceCallout.js.AdvancedDataConnectorML`**.
4. The **Function** is resolved automatically — do not modify it.

### Step 2: Configure which query to run

The query is identified by a `queryName` and a `ruleProject` (the MarkLogic URI is built as `/queries/{ruleProject}/{queryName}.json`). There are two ways to supply these — use whichever fits your use case:

---

**Option A — Runtime Properties (static, set once in Studio)**

In the Service Callout block's **Runtime Properties** tab, add key-value pairs directly:

| Property | Example value | Description |
|---|---|---|
| `queryName` | `product-lookup` | Name of the query definition document |
| `ruleProject` | `MyRuleProject` | **Recommended** — scopes the URI to `/queries/{ruleProject}/{queryName}.json` |
| `debug` | `true` | Optional — enables verbose logging and the debug payload block |

Use this option when the same query always runs for this SCO node, regardless of the data in working memory. These values are compiled into the decision service bundle.

---

**Option B — `QueryConfig` entity (dynamic, set by rules at runtime)**

Add a `QueryConfig` entity to your Corticon vocabulary and populate it in a rulesheet that runs *before* the SCO step. The SCO reads from this entity at runtime and it takes **priority over Runtime Properties**, allowing rules to select different queries based on data conditions.

Add a `QueryConfig` entity to your vocabulary with these attributes:

| Attribute     | Type    | Required | Description |
|---------------|---------|----------|-------------|
| `queryName`   | String  | Yes*     | Query definition name. Combined with `ruleProject` to build `/queries/{ruleProject}/{queryName}.json`. |
| `ruleProject` | String  | No       | Rule project name. **Recommended** — acts as the folder in the MarkLogic URI. |
| `queryUri`    | String  | Yes*     | OR a fully explicit URI (e.g., `"/queries/MyRuleProject/product-lookup.json"`). Bypasses `queryName`/`ruleProject` entirely. |
| `debug`       | Boolean | No       | `true` to enable debug logging and the debug payload block. |

*One of `queryName` or `queryUri` is required.

Result placement (`addAsTopLevelEntity`, `addToExistingEntity`, `roleName`) is configured per step in the query definition document — not on the `QueryConfig` entity.

---

### Step 3: Set the QueryConfig in a Rulesheet (Option B only)

In a rulesheet that executes **before** the SCO step in the ruleflow:

```
Rulesheet (PrepareQuery.ers):
  QueryConfig.queryName   = "product-lookup"
  QueryConfig.ruleProject = "MyRuleProject"
  QueryConfig.debug       = true
```

### Step 4: Example Ruleflow

```
Ruleflow:
  1. PrepareQuery.ers          ← rulesheet sets QueryConfig (Option B), or skip if using Runtime Properties (Option A)
  2. AdvancedDataConnectorML   ← SCO reads query config, executes query set, writes results to WM
  3. BusinessRules.ers         ← rules process the enriched working memory
```

## Query Definition Schema

Query definitions are JSON documents stored in the MarkLogic content database. The **preferred URI pattern** is `/queries/{ruleProjectName}/{queryName}.json`. Set both `ruleProject` and `queryName` in the `QueryConfig` entity (or in the SCO Runtime Properties) to use this layout. A flat `/queries/{queryName}.json` path is also supported as a legacy fallback.

A query definition is a **query set** — one or more SQL steps that execute sequentially. Each step's results are written to Corticon working memory before the next step runs, so **later steps can reference earlier results** in their SQL placeholders. This mirrors the Java ADC's `SEQUENCE`-based execution.

### Structure

```json
{
    "queryName": "retrieve-parts-and-details",
    "steps": [
        { "sequenceNo": 1, "statement": "SELECT ...", ... },
        { "sequenceNo": 2, "statement": "SELECT ...", ... }
    ]
}
```

- **`queryName`** (required) — Unique identifier for the query set
- **`steps`** (required) — Array of query steps, sorted and executed by `sequenceNo`

### Minimal Single-Step Example

```json
{
    "queryName": "product-lookup",
    "steps": [
        {
            "sequenceNo": 1,
            "statement": "SELECT * FROM Products WHERE ID IN ({Product.Id})",
            "addAsTopLevelEntity": null,
            "addToExistingEntity": "Root",
            "roleName": "enrichedProducts"
        }
    ]
}
```

Note: `addAsTopLevelEntity` and `addToExistingEntity` are mutually exclusive. Set one and leave the other `null`. When using `addToExistingEntity`, `roleName` is required.

The framework auto-infers from the SQL: `qualifier` (from `FROM Products`), bindings (`{Product.Id}` → param `productId`, cardinality `many`), type (`xs:string`), required (`true`).

### Multi-Step Chaining Example

Step 2 references results written to working memory by Step 1:

```json
{
    "queryName": "parts-with-details",
    "steps": [
        {
            "sequenceNo": 1,
            "statement": "SELECT PartId, PartNumber, Status FROM Parts WHERE PartNumber IN ({Part.Number})",
            "addAsTopLevelEntity": "Part",
            "addToExistingEntity": null,
            "roleName": null,
            "maxRows": 1000
        },
        {
            "sequenceNo": 2,
            "statement": "SELECT * FROM PartDetails WHERE PartId IN ({parts.PartId})",
            "addAsTopLevelEntity": null,
            "addToExistingEntity": "Part",
            "roleName": "partDetails",
            "maxRows": 5000
        }
    ]
}
```

In Step 2, `{parts.PartId}` resolves from the `parts` entities that Step 1 added to working memory.

### Step Fields Reference

All step fields are flat. Only `statement` is required per step.

| Field          | Type     | Required | Derived? | Description |
|----------------|----------|----------|----------|-------------|
| `sequenceNo`   | number   | No       | No  | Execution order (steps are sorted ascending by this value before running) |
| `statement`    | string   | Yes      | No  | SQL SELECT with `{Placeholder}` tokens |
| `enable`       | boolean\|null | No  | No  | Set to `false` or `null` to skip this step entirely at runtime — no SQL is executed and no results are written. Omit the field or set `true` to enable (default). Disabled steps still seed the internal cache so downstream steps with `foreignKey`/`parentKey` do not produce false errors. |
| `addAsTopLevelEntity`  | string   | No       | No  | Corticon vocabulary type — creates result rows as new top-level entities of this type |
| `addToExistingEntity`  | string   | No       | No  | Corticon vocabulary type — finds an existing entity of this type in WM and attaches results under `roleName` |
| `roleName`     | string   | No       | No  | Corticon role name for the association |
| `maxRows`      | number   | No       | No  | Max rows returned (default: 100000) |
| `qualifier`    | string   | No       | Yes | TDE view qualifier (auto-derived from `FROM` table) |
| `bindings`     | array    | No       | Yes | Placeholder-to-param mapping (auto-inferred) |
| `allowedViews` | string[] | No       | No  | View allowlist for security (advanced) |

### Auto-Inference Rules

| What             | How it's derived |
|------------------|------------------|
| `qualifier`      | First table name from `FROM` clause |
| `placeholder`    | Parsed from `{...}` tokens in the SQL |
| `param`          | camelCase of the placeholder path (`Product.Id` → `productId`) |
| `cardinality`    | `many` if inside `IN (...)`, otherwise `one` |
| `type`           | Defaults to `xs:string` |
| `required`       | Defaults to `true` |

### Mapping to Java ADC Columns

| Query Definition field | Java ADC Column |
|---|---|
| `queryName` | `READ_ID` / `ID` |
| step sequence | `SEQUENCE` |
| `statement` | `SQL` |
| `addAsTopLevelEntity` | `PRIMARY_ENTITY` |
| `addToExistingEntity` | `PARENT_ENTITY` |
| `roleName` | `PARENT_ROLENAME` |
| `enable` | `ENABLE` |

### Overriding Inferred Bindings (Advanced)

To override a specific binding field per step (e.g., change the type), provide a partial `bindings` array in that step:

```json
{
    "statement": "SELECT * FROM Products WHERE ID IN ({Product.Id})",
    "bindings": [{ "placeholder": "Product.Id", "type": "xs:integer", "required": false }]
}
```

## End-to-End Example

### Input Payload (Corticon Working Memory)

```json
{
    "Product": [
        { "Id": "P1", "Name": "Widget A" },
        { "Id": "P2", "Name": "Widget B" }
    ]
}
```

### Query Definition (`/queries/MyRuleProject/product-lookup.json`)

```json
{
    "queryName": "product-lookup",
    "steps": [
        {
            "sequenceNo": 1,
            "statement": "SELECT * FROM Products WHERE ID IN ({Product.Id})",
            "addAsTopLevelEntity": null,
            "addToExistingEntity": "Root",
            "roleName": "products",
            "maxRows": 5000
        }
    ]
}
```

### Processing Steps

1. **Load query doc**: `cts.doc("/queries/MyRuleProject/product-lookup.json").toObject()`
2. **Resolve placeholders**: `Product.Id` → extracts `["P1", "P2"]` from working memory `Product[*].Id`
3. **Rewrite SQL**: `SELECT * FROM Products WHERE ID IN ({Product.Id})` → `SELECT * FROM Products WHERE ID IN (@productId)`
4. **Execute**: `op.fromSQL(preparedSQL, "Products").result(null, { productId: ["P1", "P2"] })`
5. **Write results**: `addAssociationsToEntity(rootEntity, "products", rows)` — attaches result rows to the existing `Root` entity under the `products` role

### Output (Working Memory after SCO)

The `Root` entity now has a `products` association containing the enriched product rows from MarkLogic.

## Studio Proxy — Testing in Corticon Studio

When you test a rule project that uses this SCO inside **Corticon Studio**, the SCO runs in Node.js, not inside MarkLogic. The Studio proxy transparently routes query execution to a live MarkLogic instance via HTTP.

### Setup

1. Copy the credentials template:
   ```
   src/callout/MarkLogicStudioConfig.template.js  →  src/callout/MarkLogicStudioConfig.js
   ```
2. Fill in your MarkLogic connection details (`host`, `port`, `user`, `password`, `authType`, `ssl`).
3. Deploy `StudioProxyService.sjs` to MarkLogic:
   ```powershell
   .\scripts\deploy-studio-proxy.ps1
   ```
4. **`MarkLogicStudioConfig.js` must already be in the Corticon Extensions list** — added as a plain dependency file, the same way as `MarkLogicQueryConnector.js` and `MarkLogicQueryLibrary.js`. It should **not** be the file Studio identifies as the Service Callout entry point (that is `MarkLogicServiceCallout.js`). If you followed Deployment Step 1, this is already done.
5. Do **not** commit `MarkLogicStudioConfig.js` to version control — it contains credentials and is already listed in `.gitignore`.

### How it works

The proxy snapshots the Corticon working memory, HTTP-POSTs it to `StudioProxyService.sjs` on MarkLogic, and writes the returned step results back into Corticon WM using the same `writeStepResults` callback as the production path. Server-side debug entries echoed from MarkLogic are written to the Corticon Studio log file. For full details, see [src/callout/ARCHITECTURE.md](src/callout/ARCHITECTURE.md), Section 3.

### Write steps in Studio

Write steps (`statementType: "insert"/"update"/"upsert"`) are fully supported in Studio mode. `StudioProxyService.sjs` wraps the pipeline in `xdmp.invokeFunction` with an update transaction on the MarkLogic side, so documents are written during test runs exactly as they would be in production.

---



Set `debug = "true"` in the Service Callout properties. This will:

1. **Attach a debug block** to the payload at `Debug.QueryCallout` (configurable via `debugPath`). This block is **not** visible in Corticon Studio's built-in tester — it only appears in the JSON response when the decision service is invoked externally as a REST request (e.g. via `/corticon/execute`):

```json
{
    "Debug": {
        "QueryCallout": {
            "traceId": "adc-1708775400000-x7k2m1",
            "queryName": "product-lookup",
            "queryDocUri": "/queries/MyRuleProject/product-lookup.json",
            "preparedSQL": "SELECT * FROM Products WHERE ID IN (@productIds)",
            "bindingSummary": [
                { "param": "productIds", "cardinality": "many", "valueCount": 2 }
            ],
            "timings": {
                "total": 45, "loadQuery": 3, "resolvePlaceholders": 1,
                "rewriteSQL": 0, "execute": 38, "writePayload": 1
            },
            "rowCount": 2
        }
    }
}
```

2. **Emit structured logs** via `xdmp.log` with the traceId for server-side correlation.

## Running Unit Tests

The pure-logic modules (PlaceholderResolver, SqlRewriter, Validators) have environment-independent tests that run under Node.js:

```bash
cd AdvancedDataConnectorML
node src/test/PlaceholderResolver.test.js
node src/test/SqlRewriter.test.js
node src/test/Validators.test.js
```

## Security & Governance

- **SELECT-only**: All SQL statements are validated to begin with `SELECT` and contain no mutation keywords (`INSERT`, `UPDATE`, `DELETE`, `DROP`, etc.).
- **No string concatenation**: Values are **never** concatenated into SQL strings. All values are bound via `@param` placeholders and passed through the Optic bindings API.
- **View allowlist**: Optional `allowedViews` array in the query definition restricts which tables/views can be referenced.
- **Binding consistency**: The framework validates that every `@param` in the SQL matches a binding metadata entry, and vice versa.
- **MaxRows safeguard**: Absolute cap of 100,000 rows to prevent unbounded queries.

## Error Handling

All errors include the `traceId` and specific context:

| Error Condition                          | Message Pattern                                          |
|------------------------------------------|----------------------------------------------------------|
| Query doc not found                      | `Query definition document not found at URI: ...`        |
| Required placeholder missing in payload  | `Required placeholder {X} ... resolved to empty/null`    |
| Empty array for required IN clause       | Short-circuits to empty result (or throws if configured) |
| SQL contains non-SELECT keywords         | `SQL contains forbidden keyword "UPDATE"`                |
| View not in allowlist                    | `SQL references view "X" not in allowed views`           |
| Binding mismatch (SQL vs metadata)       | `SQL contains parameter @x with no matching binding`     |
| Optic execution failure                  | `Optic query execution failed. SQL: "..." Error: ...`   |

## Comparison with Existing (older) MarkLogicSCO

| Feature                          | MarkLogicSCO (CTS)         | AdvancedDataConnectorML (SQL/TDE) |
|----------------------------------|----------------------------|-----------------------------------|
| Query mechanism                  | CTS range queries          | SQL over TDE views (Optic)        |
| Query definition storage         | Hardcoded in JS functions  | JSON documents in MarkLogic       |
| Parameterization                 | Direct JS function args    | ADC-like `{placeholder}` syntax   |
| SQL injection protection         | N/A (CTS API)              | `@param` bindings (no concat)     |
| Debug/trace support              | Basic console.log          | Structured traceId logging        |
| Result placement                 | Fixed patterns             | Configurable per step via Corticon WM API |
| Multi-value support              | Array args to CTS          | IN clause with array bindings     |
