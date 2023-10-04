/*
	This SCO shows how to make a REST call from a Corticon decision service using data from the payload and augment the payload 
	with information returned from the REST service.
	Specifically, it takes medical procedure codes and return the associated reimbursement rates.
	
	Important note when SCO runs in browser:
	---------------------------------------
	When running a decision service that uses a REST SCO within a browser, one may face cross-origin browser restrictions. 
	For security reasons, browsers restrict cross-origin HTTP requests initiated from scripts. For example, XMLHttpRequest and the Fetch API 
	follow the same-origin policy. This means that a web application using those APIs can only request resources from the same origin the application 
	was loaded from unless the response from other origins includes the right CORS headers.
	
	To invoke a REST service that is running on a different host than the decision service, one needs to use cors.
	 
	Here are some good read on cors:
		_ https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
		_ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
*/

const fetchURL = {
    func: 'fetchFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function is a REST sample. It takes medical procedure codes and return the associated reimbursement rates using the fetch API.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'fetchURL'}
};

let logger;
async function fetchFct(corticonDataManager) {
	logger = corticonDataManager.getLogger();
    logger.logDebug("In fetch SCO");
    
    // Note: forEach in JS always calls the function synchronously so we need to call the function from a for loop instead.
    // Also, the getEntitiesByType returns a proxy which does not have a length property; to work around that we simply 
    // create our own array of entities to process and then use a for loop on the resulting array.
	try {
	    const entities = corticonDataManager.getEntitiesByType('Hello');
	    const theEntities = [];
    	entities.forEach( entity => theEntities.push(entity) );
		logger.logDebug(`*** ${theEntities.length} to process`);
	    for ( let i=0; i<theEntities.length; i++ ) {
	    	const entity = theEntities[i];
			await processOneEntity(entity);
	    }	    
	}
	catch ( e ) {
		logger.logError(`*** Error in SCO: ${e}`);
	}
}

async function processOneEntity(entity) {
	logger.logDebug(`*** call to get data from Http server for procedure: ${entity.procedureCode}`);
	const response = await makeHttpRequest(entity.procedureCode);
	if ( response.results !== undefined && response.results !== null ) {
		entity.rate = response.results.rate;
		entity.message = "Updated rate with value from REST request";
	}
	else 
		entity.message = "Could not find this procedure code";
}
	    
exports.fetchFct = fetchFct;

async function makeHttpRequest (procedureCode) {
    try {
		const url = `https://nzokcwpj4dxn62zwjna3kpsv4u0joidx.lambda-url.us-east-2.on.aws/?procedureCode=${procedureCode}`;

		// Here is the doc on the fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch		
        const response = await fetch ( url, { mode: "cors" });

        logger.logDebug("** fetch done returning response");
        const data = await response.json(); // parses JSON response into native JavaScript objects
        logger.logDebug('data: '+JSON.stringify(data));
        return data;
    }
    catch ( e ) {
        logger.logError( "ERROR: "+e);
        return "ERROR " + e;
    }
}
