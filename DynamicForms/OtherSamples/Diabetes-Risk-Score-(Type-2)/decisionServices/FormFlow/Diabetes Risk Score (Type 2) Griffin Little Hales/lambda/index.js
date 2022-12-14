/*
This is a sample for invoking Corticon decision service rules from AWS Lambda functions.
 */
const decisionService = require('./decisionServiceBundle');

// The standard Lambda entry point, augmented with the context variable to access request ID.
exports.handler = async (event, context) => {
    let result;
    let httpCode;
    let callFromGatewayApi = false;
    try {
        let body;
        if ( typeof event.body === 'string' )  // Call through Gateway API
        {
            body = JSON.parse(event.body);
            body = body;
            callFromGatewayApi = true;
        }
        else
            body = event;

        // This is where you specify various configuration attributes
        // Note: Errors are always logged no matter what configuration you specify
        // logLevel: 0: only error gets logged (default), 1: debugging info gets logged
        // logIsOn: when false, do not log. True by default, you can override dynamically to log data only for certain calls (for example by checking for a specific payload)
        // logPerfData: when true, will log performance data
        // logFunction: Used to implement your own logger.  When defined this function is called with a string message to log.

        const configuration = { logLevel: 0 };
        //const configuration = { logLevel: 1, logIsOn: isLogOnForThisPayload(body), logFunction: myLogger};
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
		
        // This is how we invoke the Corticon rules
        result = decisionService.execute(body, configuration);

        /*
        // Here is how you can check if there were any errors executing the rules.
        // (if you needed to do some additional processing before sending the response back to the client)
		if(result.corticon.status === 'error') {
			// you can access a description of the error like this:
			result.corticon.description
		}
        */

        // You can augment the payload as you see fit your needs.
        // Here we just add the request id to make it easy searching Cloudwatch logs for this specific invocation.
        result['awsRequestId'] = context.awsRequestId;

        // This method is intended for a POST request.  The resource describing the result of the action is transmitted in the message body.  See https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
        httpCode = 200;

        if ( callFromGatewayApi )
            result = JSON.stringify(result);
    }
    catch ( e ) {
        result = e + " - event: " + JSON.stringify(event);
        httpCode = 500;
    }

    if ( callFromGatewayApi )
        return {
            statusCode: httpCode,
            body: result
        };
    else
        return result;
};

/*
Here is a sample custom logger.  Adapt to your own need.
 */
/*
Here is a sample custom logger.  Adapt to your own need.
logLevel:
    1: log error
    2: log debug data
 */
function myLogger(msg, logLevel) {
    if ( logLevel === 0 )
        console.error(`**CUSTOM ERROR LOGGER: ${msg}`);
    else
        console.info(`**CUSTOM DEBUG LOGGER: ${msg}`);
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
