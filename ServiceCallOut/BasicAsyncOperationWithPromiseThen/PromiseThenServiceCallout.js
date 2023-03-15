const promiseThen = {
    func: 'promiseThenFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function get some data using an asynchronous call and use promise and then construct to wait for the data.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'promiseThen'}
};

/*
This hangs studio tester but it does not in browser bundle.
But in browser, we still cannot get the attribute to be updated - we get same error as async/await
This was expected anyway as call stack of the whole call has to complete before JS can call the promise resolver
*/
function promiseThenFct(corticonDataManager) {
	const logger = corticonDataManager.getLogger();

	logger.logError(`*** Update the message attribute before doing async call `);
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

		/*
		const data = "The data from the asynchronous call";
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
*/
		getSomeDataAsynchronously(logger).then( (data) => {
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
		});
	}
	catch ( e ) {
		logger.logError(`*** Error in SCO: ${e}`);
	}
}

exports.promiseThenFct = promiseThenFct;

function getSomeDataAsynchronously (logger) {
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
