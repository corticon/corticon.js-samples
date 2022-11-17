/*
This is a sample for invoking Corticon decision service rules from Azure functions.
 */
const decisionService = require('./decisionServiceBundle');

module.exports = async function (context, req) {
    if (req.body) {
        try {
            context.log('Executing rule.');
            const payload = req.body;

            // This is where you specify various configuration attributes
            // Note: Errors are always logged no matter what configuration you specify
            // logLevel: 0: only error gets logged (default), 1: debugging info gets logged
            // logIsOn: when false, do not log. True by default, you can override dynamically to log data only for certain calls (for example by checking for a specific payload)
            // logPerfData: when true, will log performance data
            // logFunction: Used to implement your own logger.  When defined this function is called with a string message to log.
            /*
            // Configuration Properties for Rule Messages
            const configuration = {
                logLevel: 0,
                ruleMessages: {
                    logRuleMessages: true, // If true the rule messages will be logged to console
                    appendToPayload: false,// If true append the rule messages to the output payload
                    executionProperties: {
                        restrictInfoRuleMessages: true, // If true Restricts Info Rule Messages
                        restrictWarningRuleMessages: true, // If true Restricts Warning Rule Messages
                        restrictViolationRuleMessages: true, // If true Restricts Violation Rule Messages
                        restrictResponseToRuleMessagesOnly: true // If true the response returned has only rule messages
                    }
                }
            };
            */
            const configuration = { logLevel: 0, logFunction: context.log  };
            const result = decisionService.execute(payload, configuration);

            /*
            // Here is how you can check if there were any errors executing the rules.
            // (if you needed to do some additional processing before sending the response back to the client)
            if ( result.status !== 'success' ) {
                // you can access a description of the error like this:
                result.description
            }
            */

            context.log('Done executing rule. ');
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: result
            };
        }
        catch ( e ) {
            const theError = "ERROR: " + e;
            context.res = {
                body: theError
            };
        }
    }
    else {
        context.res = {
            status: 400,
            body: "Error: No payload passed in."
        };
    }
};

/*
Here is a sample custom logger.  Adapt to your own need.
logLevel:
    1: log error
    2: log debug data

See https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#writing-trace-output-to-the-console
for details on how to use Context object to trace output.
 */
function myLogger(msg, logLevel) {
    if ( logLevel === 0 )
        context.log.error(`**CUSTOM ERROR LOGGER: ${msg}`);
    else
        context.log(`${msg}`);
}

/*
 This is a sample of the function where you can override dynamically when to log data.
 It is useful for tracing only certain calls (for example by checking for a specific payload)
 This function is optional.  When you pass a simple configuration without the logIsOn property you don't need
 to define this function.
 */
function isLogOnForThisPayload(payload) {
    let flag;
    try {
        if ( payload.Objects[0]['int1'] === 1 )
            flag = true;
        else
            flag = false;
    }
    catch ( e ) {
        console.log (`Error in isLogOnForThisPayload: ${e}\n`);
        flag = true;
    }

    console.log(`isLogOnForThisPayload: ${flag}\n`);
    return flag;
}