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
    
    body = event[1];
    body.Objects.push(event[0].Objects[2]);

    let data = body.data;

    // This is where you specify various configuration attributes
    // Note: Errors are always logged no matter what configuration you specify
    // logLevel: 0: only error gets logged (default), 1: debugging info gets logged
    // logIsOn: when false, do not log. True by default, you can override dynamically to log data only for certain calls (for example by checking for a specific payload)
    // logFunction: Used to implement your own logger.  When defined this function is called with a string message to log.

    const configuration = { logLevel: 0 };
    //const configuration = { logLevel: 1, logIsOn: isLogOnForThisPayload(body), logFunction: myLogger};

    // This is how we invoke the Corticon rules
    result = decisionService.execute(body, configuration);
    
    result.data = body.data;
    
    //TODO: temp data
    result.data = {
        "requireLoan": false
    }
    
    return result;
}