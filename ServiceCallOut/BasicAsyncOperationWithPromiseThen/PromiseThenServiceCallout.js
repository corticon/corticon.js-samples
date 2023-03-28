const promiseThen = {
    func: 'promiseThenFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function get some data using an asynchronous call and use promise and then construct to wait for the data.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'promiseThen'}
};

/*
Corticon.js does not support this pattern.  When you need to do asynchronous operations use the await
pattern as illustrated in https://github.com/corticon/corticon.js-samples/tree/master/ServiceCallOut/BasicAsyncOperation

This sample is provided as an illustration of what NOT to do.
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

			// Here there is no callback to Corticon to continue executing the rest of the rules.
			// That's why we do not support this asynchronous programming pattern.
		});
	}
	catch ( e ) {
		logger.logError(`*** Error in SCO: ${e}`);
	}
}

exports.promiseThenFct = promiseThenFct;

function getSomeDataAsynchronously (logger) {
	return new Promise(resolve => {
	    setTimeout(() => {
	    	logger.logError(`*** about to resolve promise`);
	      	resolve(' The data from the asynchronous call.');
	    }, 50);
	  });
}
