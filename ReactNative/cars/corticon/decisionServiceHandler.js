import React from 'react';

const decisionService = require('./decisionServiceBundle');
const multipleNodeTest = require('./decisionServiceBundle_Multiple_Node_Test');

const entityDefaults = {
  "Applicant": {
    "Age": null,
    "DamageWaiver": "limited",
    "Gender": null,
    "Premium": null,
    "YearsDriving": 0,
  },
};

// AWS step functions invokes lambda that execude Decision Service
const awsDS = {
  name: "AWS Step Function",
  toString: () => { return this.awsDS.name },
  callDS: (corticonPayload, options) => {
    let httpRequest = new XMLHttpRequest();
    // AWS lambda function. Created by Thierry
    let url = "https://77pucwt9j3.execute-api.us-east-2.amazonaws.com/prod/CarRental";

    console.log(JSON.stringify(corticonPayload));
    fetch(url, {
      method: 'POST',
      headers: {
      },
      body: JSON.stringify(corticonPayload),
    }).then((response) => response.json())
      .then((json) => options.responseHandler(json))
      .catch((error) => {console.log(JSON.stringify(error, {}, 2))});
  }
}

// local Decision Service 
const clientDS = {
  name: "Client (offline)",
  toString: () => { return this.clientDS.name },
  callDS: (corticonPayload, options) => {
    //Enable for detailed console logging!
    // configuration = { logLevel: 1, logIsOn: true, logFunction: function(logData){console.log(logData);return;}};

    let result;
    try {
      // call the Decision Service
      result = decisionService.execute(corticonPayload, options.configuration);
    } catch (e){
      console.log('ARGS ERROR');
    }
    options.responseHandler(result);

    let multipleNodeResult = multipleNodeTest.execute(corticonPayload, options.configuration);
    let msg = multipleNodeResult.Objects.find(function(object) { return object.__metadata["#type"] === "Message" });
    
    if (msg) {
      //alert(msg["Text"]);
      console.log(msg["Text"]);
    }

  }
}

// Helper function to add required metadata and populate defaults
function payload(entities) {
  const payload = { "__metadataRoot": {"#locale": ""} };
  const entityCount = {};

  payload["Objects"] = entities.map(entity => {
    let [entityName, entityObject] = Object.entries(entity)[0];

    // maintain a count of each type of entity for id purposes
    if (!entityCount[entityName]++) { entityCount[entityName] = 1; }

    // id can be any request unique identifier
    entityObject["__metadata"] = {
      "#type": entityName,
      "#id": `${entityName}_id_${entityCount[entityName]}`
    }

    // shallow merge object into defaults
    return {...entityDefaults[entityName], ...entityObject};
  })
  
  return payload;
};

function runDecisionService(entities, configuration={}, backend='client', responseHandler) {

  // This is where you specify various configuration attributes
  // Note: Errors are always logged no matter what configuration you specify
  // logLevel: 0: only error gets logged (default), 1: debugging info gets logged
  // logIsOn: when false, do not log. True by default, you can override dynamically to log data only for certain calls (for example by checking for a specific payload)
  // logPerfData: when true, will log performance data
  // logRulesStatements: when true, will write rule statements to the log

  if (backend == 'client') {
    clientDS.callDS(payload(entities), {configuration: configuration, responseHandler: responseHandler});
  } else if (backend == 'aws') {
    awsDS.callDS(payload(entities), {configuration: configuration, responseHandler: responseHandler});
  } else {
    alert('Not a valid backend service');
  }
};

export { runDecisionService };
