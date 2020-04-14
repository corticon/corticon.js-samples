/*
This is a sample for invoking Corticon decision service rules from Azure Functions

A sample payload to POST to this endpoint as JSON:
{
	"__metadataRoot": {
		"#locale": ""
	},
	"Objects": [
		{
		"Age": 22,
		"Gender": "male",
		"YearsDriving": 2,
		"DamageWaiver": "Full",
		"Premium": null,
		"__metadata": {
			"#type": "Applicant",
			"#id": "Applicant_id_1"
			}
		}
	]   
}

 */
const decisionService = require('../node_modules/rental-insurance/decisionServiceBundle');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
	const configuration = { logLevel: 0 };

    if (req.body) {
		//Here be validation!
		const dsResult = decisionService.execute(req.body, configuration);
        context.res = {
            status: 200, /* Defaults to 200 */
            body: JSON.stringify(dsResult)
        };
    }
    else {
		//Here be dragons!
        context.res = {
            status: 400,
            body: "Please pass a Corticon DS payload on the query string or in the request body"
        };
    }
};