/*
This Decison Service Lambda calculates the potential savings on electricity

In this demo this lambda is directly called after a Parallel Step, where the output is an
array of valid Decision Service Payloads

This file does not contain a lot of the auto-generated code out of corticon.js for readability sake.
*/

const decisionService = require('./decisionServiceBundle');

// This lambda expects an array of valid corticon rules objects, see step function for more details
exports.handler = async (event, context) => {
    let result;
    let body;
    
    // TODO: flexible deep merge
    /**
    for (let obj in event) {
        if (!result) {
            body = obj;
        } else {
           // body.
        }
    }
    **/

    // We need to prepare the payload in a specific manner as this Lambda function is executed after the parallel
    // state.  The output of that state are in an a 2 elements array (1 element per action).
    // In that parallel state we did 2 things at once:
    // 1) computed the rebate: the results are in event[0]
    // 2) got various metrics from the REST Solar price service: these are in event[1]
    //
    // So we simply merge these into a single object for consumption by the savings decision service.
    body = event[1]; // take the whole object
    body.Objects.push(event[0].Objects[2]); // we only take the object that contains the rebate data

    const data = body["additional-data"];

    // This is where you specify various configuration attributes
    // Note: Errors are always logged no matter what configuration you specify
    // logLevel: 0: only error gets logged (default), 1: debugging info gets logged
    // logIsOn: when false, do not log. True by default, you can override dynamically to log data only for certain calls (for example by checking for a specific payload)
    // logFunction: Used to implement your own logger.  When defined this function is called with a string message to log.

    const configuration = { logLevel: 0 };
    //const configuration = { logLevel: 1, logIsOn: isLogOnForThisPayload(body), logFunction: myLogger};

    // This is how we invoke the Corticon rules
    result = decisionService.execute(body, configuration);
    
    result["additional-data"] = data;
    
    return result;
}