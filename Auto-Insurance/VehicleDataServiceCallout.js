'use strict';

/**
 * VehicleDataServiceCallout.js
 * ---------------------------------------------------------------------------
 * Corticon.js Service Callout (SCO) sample.
 *
 * Enriches every `Vehicle` entity in working memory with reference data
 * read from JSON files that sit next to this source file.  Everything is
 * resolved with plain `require(...)` at bundle time, so the resulting
 * decision-service bundle has zero runtime I/O - it runs in a browser,
 * Node, or any FaaS runtime without a database, REST endpoint, or file
 * system.
 *
 * The pattern follows the standard ServiceCallOut samples (see
 * `../ServiceCallOut/HelloWorld` and `../ServiceCallOut/CallToSeparateLibrary`
 * for the minimal shape).  The SCO descriptor must be declared with `const`
 * at the top of the module so Corticon Studio can detect it.
 *
 * Service Callout metadata
 * ------------------------
 * Name           : GetVehicleDataLocal
 * Function       : getVehicleDataFct
 * Extension type : SERVICE_CALLOUT
 *
 * Reference data layout (relative to this file)
 * ---------------------------------------------
 *   data/high_theft_vehicles.json        - master list of high-theft (make, model, years)
 *   data/vehicleFacts.json               - merged map { "MAKE_MODEL": <factsDoc>, ... }
 *   data/vehicleFacts/<MAKE>_<MODEL>.json - raw per-make/model facts (one file each)
 *
 * The SCO consumes the merged `vehicleFacts.json` so the bundle picks up
 * one require() instead of 1300+.  The raw per-vehicle files are kept for
 * inspection and for users who want to host them on a static server.
 * Regenerate the merged index with `node tools/buildVehicleFactsIndex.js`.
 *
 * Vocabulary contract
 * -------------------
 * Reads:    Vehicle.make, Vehicle.model, Vehicle.modelYear
 * Writes:   Any attribute in VEHICLE_SCALAR_ATTRIBUTES below, plus
 *           AntiTheftDevice associations (only when a Vehicle entity
 *           actually has those attributes / associations declared in the
 *           project vocabulary; missing attributes are skipped silently).
 * Never overwrites: existing non-empty attribute values.
 * ---------------------------------------------------------------------------
 */

var Lib              = require('./VehicleDataLibrary');
var highTheftDoc     = require('./data/high_theft_vehicles.json');
var vehicleFactsById = require('./data/vehicleFacts.json');

// ---------------------------------------------------------------------------
// Exported descriptor consumed by Corticon Studio.
// MUST be `const` at top level - Studio scans the AST for this exact shape.
// ---------------------------------------------------------------------------
const VehicleDataServiceCallout = {
    func: 'getVehicleDataFct',
    type: 'ServiceCallout',
    description: { 'en_US': 'Enriches Vehicle entities from local JSON reference data bundled into the decision service.' },
    extensionType: 'SERVICE_CALLOUT',
    name: { 'en_US': 'GetVehicleDataLocal' }
};

// ---------------------------------------------------------------------------
// Vocabulary attributes the SCO is allowed to populate on a Vehicle.
// Names match the AutoUnderwritingAndRating vocabulary; attributes that
// are not declared in a particular project's vocabulary are skipped
// silently inside Lib.assignIfEmpty().
// ---------------------------------------------------------------------------
var VEHICLE_SCALAR_ATTRIBUTES = [
    'isHighTheft', 'isHighPerformance',
    'enginePowerKW', 'topSpeedMPH',
    'vehicleSymbol', 'bodyStyle', 'grossVehicleWeightRating',
    'safetyFeatureCount', 'hasTrackingDevice',
    'adaptiveCruiseControl', 'electronicStabilityControl',
    'daytimeRunningLight', 'adaptiveHeadlights', 'backupCamera',
    'blindSpotWarning', 'crashImminentBraking', 'dynamicBrakeSupport',
    'forwardCollisionWarning', 'laneDepartureWarning', 'laneKeepingAssistance',
    'parkAssist', 'rearCrossTrafficAlert', 'tractionControl'
];

var DEFAULT_FALSE_FLAGS = ['isHighTheft', 'isHighPerformance', 'hasTrackingDevice'];

// ---------------------------------------------------------------------------
// Build the high-theft index once, when the bundle is loaded, and cache it.
// (Indexes are cheap; data is static; computing once amortises across calls.)
// ---------------------------------------------------------------------------
var HIGH_THEFT_INDEX = Lib.buildHighTheftIndex(highTheftDoc);

// ---------------------------------------------------------------------------
// Entry point - synchronous.  Corticon.js calls this with the data manager
// and the SCO Runtime Properties pane object.
// ---------------------------------------------------------------------------
function getVehicleDataFct(corticonDataManager, serviceCalloutProperties) {
    var props    = resolveConfig(serviceCalloutProperties);
    var logger   = getLogger(corticonDataManager);
    var tag      = '*** ' + props.logPrefix + ' ->';
    var vehicles = collectVehicles(corticonDataManager);

    if (vehicles.length === 0) {
        logger.logDebug(tag + ' no Vehicle entities in working memory; nothing to do.');
        return;
    }

    var touched = 0, devicesCreated = 0, factsHits = 0;

    for (var i = 0; i < vehicles.length; i++) {
        var v = vehicles[i];
        if (!v || !v.make || !v.model) continue;

        var year = Lib.toInt(v.modelYear);
        var key  = Lib.fileSafe(v.make) + '_' + Lib.fileSafe(v.model);

        // 1. High-theft applicability
        var yrs       = HIGH_THEFT_INDEX[Lib.normKey(v.make) + '|' + Lib.normKey(v.model)];
        var highTheft = false;
        if (yrs && yrs.size > 0) highTheft = year == null ? true : yrs.has(year);
        Lib.assignIfEmpty(v, 'isHighTheft', highTheft);

        // 2. Per-(make,model,year) facts
        var factsDoc  = vehicleFactsById[key] || null;
        var yearFacts = Lib.pickYearFacts(factsDoc, year);
        if (yearFacts) {
            factsHits++;
            for (var a = 0; a < VEHICLE_SCALAR_ATTRIBUTES.length; a++) {
                var attr = VEHICLE_SCALAR_ATTRIBUTES[a];
                if (Object.prototype.hasOwnProperty.call(yearFacts, attr)) {
                    Lib.assignIfEmpty(v, attr, yearFacts[attr]);
                }
            }
            if (Array.isArray(yearFacts.antiTheftDevice)) {
                devicesCreated += attachAntiTheftDevices(corticonDataManager, v, yearFacts.antiTheftDevice, logger, tag);
            }
        }

        // 3. Safe defaults for boolean flags
        for (var f = 0; f < DEFAULT_FALSE_FLAGS.length; f++) {
            var flag = DEFAULT_FALSE_FLAGS[f];
            if (Lib.isEmpty(v[flag])) v[flag] = false;
        }

        touched++;
    }

    logger.logDebug(tag + ' enriched ' + touched + '/' + vehicles.length +
        ' vehicles; factsHits=' + factsHits + '; antiTheftDevices=' + devicesCreated);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveConfig(serviceCalloutProperties) {
    var props = { logPrefix: 'VehicleDataServiceCallout' };
    if (serviceCalloutProperties) {
        var keys = Object.keys(serviceCalloutProperties);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (serviceCalloutProperties[k] != null && serviceCalloutProperties[k] !== '') {
                props[k] = serviceCalloutProperties[k];
            }
        }
    }
    return props;
}

function collectVehicles(corticonDataManager) {
    var set = corticonDataManager.getEntitiesByType('Vehicle');
    if (set && typeof set[Symbol.iterator] === 'function') return Array.from(set);
    if (Array.isArray(set)) return set;
    return [];
}

function attachAntiTheftDevices(corticonDataManager, vehicleEntity, devices, logger, tag) {
    if (!Array.isArray(devices) || devices.length === 0) return 0;
    if (typeof corticonDataManager.createEntity !== 'function' ||
        typeof corticonDataManager.addAssociationsToEntity !== 'function') {
        return 0;
    }
    var created = [];
    for (var i = 0; i < devices.length; i++) {
        var d = devices[i];
        if (!d || typeof d !== 'object') continue;
        var e;
        try { e = corticonDataManager.createEntity('AntiTheftDevice'); }
        catch (_eCreate) { return created.length; } // entity not in vocabulary
        var keys = Object.keys(d);
        for (var k = 0; k < keys.length; k++) {
            var kk = keys[k];
            if (d[kk] !== undefined && d[kk] !== null) {
                try { e[kk] = d[kk]; } catch (_eAttr) { /* attribute not in vocabulary */ }
            }
        }
        created.push(e);
    }
    if (created.length > 0) {
        try { corticonDataManager.addAssociationsToEntity(vehicleEntity, 'antiTheftDevice', created); }
        catch (_eAssoc) { /* association not in vocabulary */ }
    }
    return created.length;
}

function getLogger(corticonDataManager) {
    if (corticonDataManager && typeof corticonDataManager.getLogger === 'function') {
        var l = corticonDataManager.getLogger();
        if (l && typeof l.logDebug === 'function') return l;
    }
    return {
        logDebug: function (m) { try { console.log(m); } catch (_e) {} },
        logError: function (m) { try { console.error(m); } catch (_e) {} }
    };
}

exports.getVehicleDataFct = getVehicleDataFct;
