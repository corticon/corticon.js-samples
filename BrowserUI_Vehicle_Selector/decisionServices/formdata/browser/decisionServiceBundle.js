(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={"ruleMessages": [
    {"js_validations0": {
        "severity": "Info",
        "text": ""
    }},
    {"js_validations1": {
        "severity": "Info",
        "text": ""
    }},
    {"js_validations2": {
        "severity": "Info",
        "text": ""
    }},
    {"js_validations3": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs0": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs1": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs2": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs3": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs4": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs5": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs6": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs7": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs8": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs9": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs10": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs11": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs12": {
        "severity": "Info",
        "text": ""
    }},
    {"js_default32costs13": {
        "severity": "Info",
        "text": ""
    }},
    {"js_Surcharges0": {
        "severity": "Warning",
        "text": ""
    }},
    {"js_Surcharges1": {
        "severity": "Warning",
        "text": ""
    }},
    {"js_Surcharges2": {
        "severity": "Warning",
        "text": ""
    }}
]}
},{}],2:[function(require,module,exports){
"use strict";var _jsEngine=require("@corticon/js-engine"),_decisionservicerules=require("./decisionservicerules"),metadata=_interopRequireWildcard(require("./vocab.json")),ruleMessages=_interopRequireWildcard(require("./_ruleMessages.json"));function _getRequireWildcardCache(e){if("function"!=typeof WeakMap)return null;var i=new WeakMap,n=new WeakMap;return(_getRequireWildcardCache=function(e){return e?n:i})(e)}function _interopRequireWildcard(e,i){if(!i&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var n=_getRequireWildcardCache(i);if(n&&n.has(e))return n.get(e);var r={},t=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var c in e)if("default"!==c&&Object.prototype.hasOwnProperty.call(e,c)){var o=t?Object.getOwnPropertyDescriptor(e,c):null;o&&(o.get||o.set)?Object.defineProperty(r,c,o):r[c]=e[c]}return r.default=e,n&&n.set(e,r),r}void 0!==window.corticonEngine&&null!==window.corticonEngine||(window.corticonEngine={}),void 0!==window.corticonEngines&&null!==window.corticonEngines||(window.corticonEngines=[]);const decisionServiceFct=function(e,i){return new _jsEngine.CorticonEngine(metadata,ruleMessages,new _decisionservicerules.DecisionServiceRules).executeDecisionService(e,i)};window.corticonEngine.execute=decisionServiceFct,window.corticonEngines.push({execute:decisionServiceFct});

},{"./_ruleMessages.json":1,"./decisionservicerules":3,"./vocab.json":4,"@corticon/js-engine":5}],3:[function(require,module,exports){

},{"@corticon/js-engine":5}],4:[function(require,module,exports){
module.exports={
    "topLevelEntities": {},
    "entities": [
        {
            "associations": [
                {
                    "targetEntity": "data",
                    "roleName": "data",
                    "reverseRoleName": "application",
                    "navigability": "Bidirectional",
                    "mandatory": true,
                    "cardinality": "1"
                },
                {
                    "targetEntity": "Driver",
                    "roleName": "driver",
                    "reverseRoleName": "application",
                    "navigability": "Bidirectional",
                    "mandatory": false,
                    "cardinality": "*"
                },
                {
                    "targetEntity": "OfferedPolicy",
                    "roleName": "offeredPolicy",
                    "reverseRoleName": "application",
                    "navigability": "Bidirectional",
                    "mandatory": false,
                    "cardinality": "*"
                },
                {
                    "targetEntity": "PolicyDecision",
                    "roleName": "policyDecision",
                    "reverseRoleName": "application",
                    "navigability": "Bidirectional",
                    "mandatory": false,
                    "cardinality": "1"
                },
                {
                    "targetEntity": "Vehicle",
                    "roleName": "vehicle",
                    "reverseRoleName": "application",
                    "navigability": "Bidirectional",
                    "mandatory": false,
                    "cardinality": "*"
                }
            ],
            "transientAttributesDefinition": [],
            "associationsDefinition": [
                "data",
                "driver",
                "offeredPolicy",
                "policyDecision",
                "vehicle"
            ],
            "name": "Application",
            "attributesDefinition": [
                "applicantCount",
                "driverCount",
                "paymentPlan",
                "requestedBodilyInjLimitPerAccident",
                "requestedBodilyInjLimitPerPerson",
                "requestedCollisionDeductible",
                "requestedCompDeductible",
                "requestedDeductible",
                "requestedPropertyDamageLimit",
                "vehicleCount"
            ],
            "attributes": [
                {
                    "dataType": "Integer",
                    "name": "applicantCount",
                    "type": "Base",
                    "mandatory": false
                },
                {
                    "dataType": "Integer",
                    "name": "driverCount",
                    "type": "Base",
                    "mandatory": false
                },
                {
                    "dataType": "String",
                    "name": "paymentPlan",
                    "type": "Base",
                    "mandatory": false
                },
                {
        },
}