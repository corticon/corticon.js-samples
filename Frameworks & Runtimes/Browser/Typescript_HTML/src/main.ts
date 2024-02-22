
const payload = [{
	"YearsDriving": 1,
	"DamageWaiver": "Full",
	"Gender": "male",
	"Age": 20
}];
	
const configuration = {
	logLevel: 1,
	logFunction: (corticonLogEntry: any) => {console.log(corticonLogEntry)}
};

var result: Object;

async function processResult(e) {
	console.log('page is fully loaded');
	result = await (window as any).corticonEngine.execute(payload,configuration);
	(document as any).getElementById('result').append(JSON.stringify(result));
};
	
(window as any).onload = processResult;