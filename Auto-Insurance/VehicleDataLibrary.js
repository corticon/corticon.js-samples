'use strict';

/**
 * VehicleDataLibrary.js
 * ---------------------------------------------------------------------------
 * Pure-JavaScript helpers for VehicleDataServiceCallout.
 *
 * No filesystem, no network, no environment-specific globals.  Safe to
 * load anywhere JavaScript runs (browser, Node, FaaS, Deno, Bun).
 * ---------------------------------------------------------------------------
 */

function normKey(s)  { return (s == null ? '' : String(s)).trim().toUpperCase(); }
function toInt(v)    { if (v == null || v === '') return null; var n = Number(v); return isNaN(n) ? null : Math.trunc(n); }
function isEmpty(v)  { return v === undefined || v === null || v === ''; }

/**
 * Filename-safe normalisation: upper-case and collapse every run of
 * non-alphanumeric characters to a single `_`.  Used so that
 *   make='Ford', model='F-150'  ->  'FORD_F_150'
 * matches the file basename `FORD_F_150.json`.
 */
function fileSafe(s) { return normKey(s).replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }

/**
 * Assign `value` to `entity[attr]` only when the target is currently empty.
 *
 * Defensive: Corticon entity setters throw "Attribute not defined" when the
 * attribute is missing from the project vocabulary.  We swallow that error
 * silently so the SCO degrades gracefully against partial vocabularies.
 */
function assignIfEmpty(entity, attr, value) {
    if (value === undefined || value === null) return false;
    try {
        if (!isEmpty(entity[attr])) return false;
        entity[attr] = value;
        return true;
    } catch (e) {
        var msg = e && e.message ? e.message : String(e);
        if (msg.indexOf('Attribute not defined') !== -1) return false;
        throw e;
    }
}

/**
 * Build an index from high_theft_vehicles.json.
 * @param   {Object} htDoc - Parsed high-theft document, shape:
 *                           { vehicles: [{ make, model, highTheftModelYears: [year, ...] }] }
 * @returns {Object} Map: "MAKE|MODEL" -> Set<modelYear>.
 */
function buildHighTheftIndex(htDoc) {
    var idx = Object.create(null);
    if (!htDoc || !Array.isArray(htDoc.vehicles)) return idx;
    for (var i = 0; i < htDoc.vehicles.length; i++) {
        var v = htDoc.vehicles[i];
        var key = normKey(v.make) + '|' + normKey(v.model);
        var yrs = Array.isArray(v.highTheftModelYears) ? v.highTheftModelYears : [];
        var bucket = idx[key] || (idx[key] = new Set());
        for (var j = 0; j < yrs.length; j++) bucket.add(Number(yrs[j]));
    }
    return idx;
}

/**
 * Extract the attribute bucket for a specific model year from a vehicleFacts doc.
 * Falls back to `years.default` / `years.any` if the exact year is missing,
 * and to a flat `attributes` block if no per-year structure exists.
 */
function pickYearFacts(factsDoc, modelYear) {
    if (!factsDoc) return null;
    if (factsDoc.years && typeof factsDoc.years === 'object') {
        if (modelYear != null && factsDoc.years[String(modelYear)]) return factsDoc.years[String(modelYear)];
        if (factsDoc.years.default) return factsDoc.years.default;
        if (factsDoc.years.any)     return factsDoc.years.any;
    }
    if (factsDoc.attributes && typeof factsDoc.attributes === 'object') return factsDoc.attributes;
    return null;
}

module.exports = {
    normKey:             normKey,
    fileSafe:            fileSafe,
    toInt:               toInt,
    isEmpty:             isEmpty,
    assignIfEmpty:       assignIfEmpty,
    buildHighTheftIndex: buildHighTheftIndex,
    pickYearFacts:       pickYearFacts
};
