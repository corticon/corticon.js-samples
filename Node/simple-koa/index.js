const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const decisionService = require('rental-insurance'); 

const app = module.exports = new Koa();

app.use(bodyParser())
	.use(router.routes())
	.use(router.allowedMethods());

router.post('/', async ctx => {
	const body = ctx.request.body;
	const configuration = { logLevel: 1, logFunction: corticonLogEntry => console.log(corticonLogEntry) }; //Verbose logging, probably don't use in production
	const result = decisionService.execute(body, configuration);	
	ctx.status = 200;
	ctx.body = result;
});

if (!module.parent) app.listen(3000);

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