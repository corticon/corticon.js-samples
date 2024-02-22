const express = require('express');
const decisionService = require('rental-insurance'); 

const app = express();
const port = 3000;

app.use(express.json());

app.post('/', (req, res) => {
	const configuration = { logLevel: 1, logFunction: corticonLogEntry => console.log(corticonLogEntry) }; //Verbose logging, probably don't use in production
    const result = decisionService.execute(req.body, configuration);
    res.status(200).json(result);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));


/* A sample payload to POST to this endpoint as JSON:
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
		"__metadata": {
			"#type": "Applicant",
			"#id": "Applicant_id_1"
			}
		}
	]   
}
*/