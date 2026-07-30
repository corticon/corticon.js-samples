# Auto-Insurance Service Callout (local JSON)

A self-contained Corticon.js Service Callout sample that enriches
`Vehicle` entities from JSON reference data **bundled into the decision
service**. No database, no REST endpoint, no filesystem at runtime —
everything is resolved through `require(...)` at bundle time.

The bundled decision service runs anywhere JavaScript runs: browsers,
Node, Cloudflare Workers, Vercel/Netlify Edge, AWS Lambda, Deno, Bun.

Modeled after the standard ServiceCallOut samples — see
[../ServiceCallOut/HelloWorld](../ServiceCallOut/HelloWorld) and
[../ServiceCallOut/CallToSeparateLibrary](../ServiceCallOut/CallToSeparateLibrary)
for the minimal pattern.

## Files

| File | Purpose |
| ---- | ------- |
| [VehicleDataServiceCallout.js](VehicleDataServiceCallout.js) | SCO entry point. Descriptor name: `GetVehicleDataLocal`, function: `getVehicleDataFct`. |
| [VehicleDataLibrary.js](VehicleDataLibrary.js) | Pure-JS helpers (normalisation, high-theft index builder, year-facts picker). |
| [data/high_theft_vehicles.json](data/high_theft_vehicles.json) | Master list of high-theft (make, model, model-year) entries. |
| [data/vehicleFacts.json](data/vehicleFacts.json) | Merged `{ "MAKE_MODEL": <factsDoc> }` map — what the SCO actually consumes. |
| [data/vehicleFacts/](data/vehicleFacts/) | 1310 raw per-(make, model) JSON files; source of truth. |
| [data/car data.csv](data/car%20data.csv), [data/hightheft.csv](data/hightheft.csv), [data/make model pairs.csv](data/make%20model%20pairs.csv) | Original tabular sources (kept for reference, not consumed at runtime). |
| [tools/buildVehicleFactsIndex.js](tools/buildVehicleFactsIndex.js) | Regenerator: merges `data/vehicleFacts/*.json` into `data/vehicleFacts.json`. |

## Vocabulary contract

The SCO expects (and is tolerant of partial vocabularies):

- **Vehicle** entity, attributes:
  - read: `make` (string), `model` (string), `modelYear` (number/string)
  - written when empty: `isHighTheft`, `isHighPerformance`, `enginePowerKW`,
    `topSpeedMPH`, `vehicleSymbol`, `bodyStyle`, `grossVehicleWeightRating`,
    `safetyFeatureCount`, `hasTrackingDevice`, `adaptiveCruiseControl`,
    `electronicStabilityControl`, `daytimeRunningLight`, `adaptiveHeadlights`,
    `backupCamera`, `blindSpotWarning`, `crashImminentBraking`,
    `dynamicBrakeSupport`, `forwardCollisionWarning`, `laneDepartureWarning`,
    `laneKeepingAssistance`, `parkAssist`, `rearCrossTrafficAlert`,
    `tractionControl`
- **AntiTheftDevice** entity (optional), attached via the `antiTheftDevice`
  association on Vehicle when the year-facts doc lists devices.

Existing non-empty attribute values are **never** overwritten. Attributes
or associations that are missing from the project vocabulary are skipped
silently.

## Wiring it into a Corticon.js project (Studio)

1. In Corticon Studio, declare the project's Service Callouts source
   folder as this folder (or copy `VehicleDataServiceCallout.js` and
   `VehicleDataLibrary.js` plus the `data/` tree into your existing
   Service Callouts folder).
2. The Service Name dropdown for a Service Callout activity will pick up
   `GetVehicleDataLocal` automatically (Corticon Studio scans the
   `const VehicleDataServiceCallout = { ... }` descriptor at the top of
   the SCO source file).
3. In your ruleflow, drop in a Service Callout activity, set:
   - **Class**: `VehicleDataServiceCallout.js`
   - **Service**: `GetVehicleDataLocal`
4. Generate the decision service. The bundled `decisionServiceBundle.js`
   will contain `high_theft_vehicles.json` and `vehicleFacts.json` inlined
   as JS object literals.

## Regenerating the merged index

If you edit, add, or remove files in `data/vehicleFacts/`, rebuild the
merged index before regenerating the decision service:

```bash
node tools/buildVehicleFactsIndex.js
```

This re-reads every `*.json` under `data/vehicleFacts/` and writes a
fresh `data/vehicleFacts.json` (single line, ~2.9 MB).

## Quick smoke test (Node)

```js
const sco = require('./VehicleDataServiceCallout');

const cdm = {
    getEntitiesByType: (t) => t === 'Vehicle' ? [
        { make: 'Acura', model: 'ILX',   modelYear: 2021 },
        { make: 'Honda', model: 'Civic', modelYear: 2018 }
    ] : [],
    createEntity: () => ({}),
    addAssociationsToEntity: () => {},
    getLogger: () => ({
        logDebug: console.log,
        logError: console.error
    })
};

sco.getVehicleDataFct(cdm, {});
```

The vehicles array will be mutated in place; printed log shows how many
were enriched and how many year-facts hits / anti-theft devices were
attached.

## Rebuilding from upstream

If you need a fresh copy of the reference-data tree, the source is the
sibling Corticon-on-MarkLogic repo:

```
https://github.com/corticon/corticon-on-marklogic/tree/main/Auto%20Insurance/v2/referenceDataTables/
```

Copy `high_theft_vehicles.json` and the `vehicleFacts/*.json` set into
`data/`, then rerun `node tools/buildVehicleFactsIndex.js`.
