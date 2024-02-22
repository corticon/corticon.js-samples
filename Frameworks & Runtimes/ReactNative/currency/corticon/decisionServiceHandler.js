const decisionService = require('./decisionServiceBundle');
//const acceptedEntities = decisionService

//TODO: move me to json file
const entityDefaults = {
  "Currency": {
    "atTime": null,
    "result": null,
    "previousRate": 1,
    "rate": 1,
    "name": "",
    "percentDiff": null
  },
};

function payload(entities) {
  const payload = { "__metadataRoot": {"#locale": ""} };
  const entityCount = {};

  payload["Objects"] = entities.map(entity => {
    for (let [entityName, entityObject] of Object.entries(entity)) {
      if (!entityCount[entityName]++) { entityCount[entityName] = 1; }

      // shallow merge provided object into defaults
      entityObject["__metadata"] = {
        "#type": entityName,
        "#id": `${entityName}_id_${entityCount[entityName]}`
      }
      return {...entityDefaults[entityName], ...entityObject};
    }
  })
  
  return payload;
};

function runDecisionService(payload) {

  // This is where you specify various configuration attributes
  // Note: Errors are always logged no matter what configuration you specify
  // logLevel: 0: only error gets logged (default), 1: debugging info gets logged
  // logIsOn: when false, do not log. True by default, you can override dynamically to log data only for certain calls (for example by checking for a specific payload)
  // logPerfData: when true, will log performance data
  // logRulesStatements: when true, will write rule statements to the log
  // logFunction: Used to implement your own logger.  When defined this function is called with a string message to log and an error level.
  const configuration = { logLevel: 0 };
  //const configuration = { logLevel: 1, logIsOn: isLogOnForThisPayload(body), logFunction: myLogger};

  // Here we invoke the rules
  const result = decisionService.execute(payload, configuration);
  alert(JSON.stringify(result, null, 2));    
  if (result.status != 'success') {
    // handle error
  }
  return result;
};


export { payload, runDecisionService };
