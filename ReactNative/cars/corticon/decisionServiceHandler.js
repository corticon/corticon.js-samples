import React from 'react';

const decisionService = require('./decisionServiceBundle');

//TODO: move me to json file
const entityDefaults = {
  "Applicant": {
    "Age": null,
    "DamageWaiver": "limited",
    "Gender": null,
    "Premium": null,
    "YearsDriving": 0,
  },
};

// TODO: AWS/Azure DS
const azureDS = {
  name: "Azure",
  toString: () => { return this.azureDS.name },
  callDS: (corticonPayload, options) => {
    let httpRequest = new XMLHttpRequest();
    let azureUrl = "https://carsdecisionservice.azurewebsites.net/api/rentalinsurance?code=RY8cZxulCemeWzOar7PsLOKk2J2TSPQF54tHoXdFAMY2wQUeP3F5bQ==";

    // // asynchronous request
    // httpRequest.onreadystatechange = () => {
    //   options.responseHandler();
      
    // }
    // httpRequest.open('POST', azureUrl, true);
    // httpRequest.setRequestHeader('Content-Type', 'application/json');
    // httpRequest.send(corticonPayload); 
    console.log(JSON.stringify(corticonPayload));
    fetch(azureUrl, {
      method: 'POST',
      headers: {
      },
      body: JSON.stringify(corticonPayload),
    }).then((response) => response.json())
      .then((json) => console.log(JSON.stringify(json, {}, 2)))
      .catch((error) => {console.log(JSON.stringify(error, {}, 2))});

    // fetch('https://reactnative.dev/movies.json')
    // .then((response) => response.json())
    // .then((json) => console.log(json.movies))
    // .catch((error) => console.error(error))
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
      result = decisionService.execute(corticonPayload, options.configuration);
    } catch (e){
      console.log('ARGS ERROR');
    }
    options.responseHandler(result);
  }
}

// Helper function to add required metatdata and populate defaults
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
  } else if (backend == 'azure') {
    azureDS.callDS(payload(entities), {configuration: configuration, responseHandler: responseHandler});
  } else {
    alert('Not a valid backend service');
  }
};

export { runDecisionService };
