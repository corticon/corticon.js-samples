const accessConfiguration = {
    func: 'accessConfigurationFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function shows how to access properties from the decision service configuration.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'accessConfiguration'}
};

let logger;

/*
	For example, for the following configuration:
	
	const configuration = { logLevel: 0, "serviceCallout": { "prop1": "abc", "prop2": 12 } };
	
	corticonDataManager.getConfiguration() will return the object literal: { "prop1": "abc", "prop2": 12 }
*/
function accessConfigurationFct(corticonDataManager) {
	logger = corticonDataManager.getLogger();	
    logger.logDebug('Start SCO accessConfigurationFct');
    
    // This is how you access the list of properties
    const configurationProperties = corticonDataManager.getConfiguration();
    
    // Just output all properties in one string.
    let propsString = JSON.stringify(configurationProperties);
 	logger.logDebug(propsString);
	
	// Set the message attribute to the list of properties
	const helloEntities = corticonDataManager.getEntitiesByType('Hello');
    helloEntities.forEach(hello => {
    	hello['message'] = propsString;
    });        
}

exports.accessConfigurationFct = accessConfigurationFct;
