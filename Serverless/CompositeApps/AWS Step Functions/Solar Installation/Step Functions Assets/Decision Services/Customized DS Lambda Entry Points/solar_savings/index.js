/*
This Decison Service Lambda calculates the potential savings on electricity

In this demo this lambda is directly called after a Parallel Step, where the output is an
array of valid Decision Service Payloads.  The payload to the decision service will be created from
this array.
*/

const decisionService = require('./decisionServiceBundle');

exports.handler = async (event, context) => {
    // We need to prepare the payload in a specific manner as this Lambda function is executed after the parallel
    // state.  The output of that state are in an a 2 elements array (1 element per action).
    // In that parallel state we did 2 things at once:
    // 1) computed the rebate: the results are in event[0]
    // 2) got various metrics from the REST Solar price service: these are in event[1]
    //
    // So we simply merge these into a single object for consumption by the savings decision service.
    const body = event[1]; // take the whole object
    body.Objects.push(event[0].Objects[2]); // we only take the object that contains the rebate data

    // Execute Corticon rules
    const configuration = { logLevel: 0 };
    return decisionService.execute(body, configuration);
};