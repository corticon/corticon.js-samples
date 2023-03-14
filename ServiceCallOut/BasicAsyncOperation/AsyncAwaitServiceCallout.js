const asyncAwait = {
    func: 'asyncAwaitFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function get some data using an asynchronous call.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'asyncAwait'}
};

async function asyncAwaitFct(corticonDataManager) {
	const logger = corticonDataManager.getLogger();
    
    // Update the message attribute before doing async call - it works before the async call  
	try {
	    const entities = corticonDataManager.getEntitiesByType('Hello');
	    entities.forEach(entity => {
	    	entity.message = `About to get some data asynchronously...` ;
	    });
	}
	catch ( e ) {
		logger.logError(`*** Error 1 in SCO: ${e}`);
	}  

	try {
    	logger.logError(`*** call to getSomeDataAsynchronously`);
		const data = await getSomeDataAsynchronously(logger);
//		const data = "The data from the asynchronous call";

    	logger.logError(`*** Got data: ${data}`);
	    const entities = corticonDataManager.getEntitiesByType('Hello');
	    entities.forEach(entity => {
    		logger.logError(`  *** Working on entity.message ${entity.message}`);
    		logger.logError(`  *** Writing attribute with: ${data}`);
			try {
		    	entity.message = `Got this data: ${data}` ;
		    }
			catch ( e ) {
				logger.logError(`*** Error updating with data : ${e}`);
				entity.message = `Could not update with data. Error: ${e}`;
			}
	    });
	}
	catch ( e ) {
		logger.logError(`*** Error in SCO: ${e}`);
	}  
}

exports.asyncAwaitFct = asyncAwaitFct;

async function getSomeDataAsynchronously (logger) {
/*
Immediate call but still async
	return new Promise(resolve => {
	    	logger.logError(`*** about to resolve promise`);
	      	resolve(' The data from the asynchronous call.');
	  });
*/
	return new Promise(resolve => {
	    setTimeout(() => {
	    	logger.logError(`*** about to resolve promise`);
	      	resolve(' The data from the asynchronous call.');
	    }, 50);
	  });
}