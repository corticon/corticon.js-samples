'use strict';

/**
 * tools/buildVehicleFactsIndex.js
 * ----------------------------------------------------------------------------
 * Regenerates `data/vehicleFacts.json` by merging every JSON file in
 * `data/vehicleFacts/` into a single map keyed by file basename (e.g.
 * `ACURA_CL` from `ACURA_CL.json`).
 *
 * Run from the sample folder:
 *
 *     node tools/buildVehicleFactsIndex.js
 *
 * Used by VehicleDataServiceCallout.js as a single `require()` so the
 * decision-service bundle picks up one inlined JSON object instead of
 * thousands of separate require sites.
 * ----------------------------------------------------------------------------
 */

const fs   = require('fs');
const path = require('path');

const HERE   = __dirname;
const SRC    = path.resolve(HERE, '..', 'data', 'vehicleFacts');
const OUT    = path.resolve(HERE, '..', 'data', 'vehicleFacts.json');

if (!fs.existsSync(SRC)) {
    console.error('source folder not found: ' + SRC);
    process.exit(1);
}

const files = fs.readdirSync(SRC).filter(function (f) { return f.endsWith('.json'); }).sort();
const idx   = Object.create(null);
let bytes   = 0;

for (const f of files) {
    const full = path.join(SRC, f);
    const key  = f.replace(/\.json$/i, '');
    const raw  = fs.readFileSync(full, 'utf8');
    bytes += raw.length;
    try {
        idx[key] = JSON.parse(raw);
    } catch (e) {
        console.error('skip ' + f + ': ' + e.message);
    }
}

fs.writeFileSync(OUT, JSON.stringify(idx));
const outBytes = fs.statSync(OUT).size;
console.log('merged ' + Object.keys(idx).length + ' files (' +
    (bytes / 1024 / 1024).toFixed(2) + ' MB raw) -> ' +
    path.relative(process.cwd(), OUT) +
    ' (' + (outBytes / 1024 / 1024).toFixed(2) + ' MB)');
