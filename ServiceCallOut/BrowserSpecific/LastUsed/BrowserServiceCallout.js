const getLastUsed = {
    func: 'getLastUsedFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function reads the last time it was used from local storage and set it in the Hello entity.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'getLastUsed'}
};

// A utility function to detect if we are in browser.
const isBrowserFct = new Function('try {return this===window;}catch(e){ return false;}');

function getLastUsedFct(corticonDataManager) {
	const logger = corticonDataManager.getLogger();
	const dateTimeOperators = corticonDataManager.getOperator().dateTime;	
	
	// If not in browser assume it's tester and just simulate data randomly
	const isBrowser = isBrowserFct();
	if ( !isBrowser ) {
	    const entities = corticonDataManager.getEntitiesByType('Hello');
	    entities.forEach(entity => {
			const now = dateTimeOperators.now();
			const rand = Math.floor(Math.random() * 2); // 0 or 1
			let lastUsed;
			if ( rand === 0 )
				lastUsed = dateTimeOperators.addDays(now, -10);
			else 
				lastUsed = dateTimeOperators.addDays(now, -2);
				
		    entity.lastUsed = dateTimeOperators.constructDateTime(lastUsed);
	    });
		return;
	}
		
	const lastUsed = window.localStorage.getItem('DecisionServiceLastUsed');	    
    if ( lastUsed !== null  ) {
	    const entities = corticonDataManager.getEntitiesByType('Hello');
	    entities.forEach(entity => {
	    	entity.lastUsed = dateTimeOperators.constructDateTime(lastUsed);
	    });
    }
    else {
    	logger.logError('getLastUsed: no item found in local storage');    	
    }    
}

exports.getLastUsedFct = getLastUsedFct;

const setLastUsed = {
    func: 'setLastUsedFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This writes to local storage the last time the decision service was used..'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'setLastUsed'}
};

function setLastUsedFct(corticonDataManager) {
	const logger = corticonDataManager.getLogger();
	
	// If not in browser just do nothing
	const isBrowser = isBrowserFct();
	if ( !isBrowser ) {
		logger.logError('setLastUsed is a browser specific SCO');
		return;
	}
	
	// Leverage the data time operators to get current date time and store it as JSON
	// This  simplifies the getLastUsed as the JSON format can be used directly to create
	// a DateTime. 
	const dateTimeOperators = corticonDataManager.getOperator().dateTime;	
	const now = dateTimeOperators.now();
	const nowTxt = dateTimeOperators.outputToJson(now);
	window.localStorage.setItem('DecisionServiceLastUsed', nowTxt);
}

exports.setLastUsedFct = setLastUsedFct;
