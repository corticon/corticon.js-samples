/*
	This Corticon.js Service Callout (SCO) is an example on how a Corticon Decision service
	can access MarkLogic, read a specific file to extract some useful content to enrich the
	payload with.
	It fullfills the use case where we cannot pass all the data in the input payload to the 
	decision service, typically because that would be too much data for all the possible rule cases.
	In this situation, we need to 
	  1) access additional data from a data source
	  2) enrich the in memory payload with the additional data
	  3) proceed with rule processing.  See the rule flow "Calculate Daily Insurance With SCO.erf" file.  
	
	In this specific example, for a driver insurance program, we augment the payload with
	the risk level of where the user has been driving for the day.  This data point is used 
	in the rules to assess how much premium to add based on the risk.
	
	Note on error handling: errors are logged using the error logger and they are passed back within 
	the zone driven risk. This simplifies troubleshooting as the error immediately shows in the returned
	payload.  This is fine for a sample but in a production SCO, you would want to throw exceptions
	for unexpected errors.  In this case the decision service will terminate and return an error status
	and error message in the result payload (using the standard Corticon error reporting for a failed decision
	service). 
	
	To use this SCO the following configuration needs to be specified:
	
	const configuration = { logLevel: 0,
							logFunction: console.log, 
							"serviceCallout": { 
								"ctsApi": cts, 
								"uriAdditionalData": "/thierry/additionalDriverData" 
							 } 
						   };

	Notes: 
	1) the ctsApi property refers to the cts API available on MarkLogic server side JavaScript environment.
	See https://docs.marklogic.com/js/cts for more information.  This SCO will use cts.doc to read the
	additional data file.
	This property wouldn't apply is this SCO were run in another environment.
	In the future, we may expand this SCO to read the additional data from other data sources.
	 
	2) uriAdditionalData is the parameter to specify the base file name of the file to read to get at 
	the zone driven risk. The final filename will be computed by appending the driver id and .json
	Note that an input payload may contain just one driver or an array of drivers.  This SCO supports
	both types of payload.
	So in other words, for an input payload with a driver id=111, the SCO expects the file
	additionalDriverData111.json to exist and to contain the zone driven risk data.
	Replace "/thierry/additionalDriverData" with your own value.
		
*/

const getZoneDrivenRiskLevel = {
    func: 'getZoneDrivenRiskLevelFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function shows how to augment the in payload with the zone driven risk level by reading a JSON document in MarkLogic.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'getZoneDrivenRiskLevel'}
};

let logger;

function getZoneDrivenRiskLevelFct(corticonDataManager) {
	logger = corticonDataManager.getLogger();	
    logger.logDebug('** Start SCO getZoneDrivenRiskLevelFct');
    	
	// Set the zoneDriven attribute from the additional data file in MarkLogic
	const driverEntities = corticonDataManager.getEntitiesByType('Driver');
    driverEntities.forEach(driver => {
    	const driverId = getDriverId ( driver );
		const zoneRisk = getZoneRiskFromMarkLogic ( corticonDataManager, driverId );
    	driver['riskZoneDriven'] = zoneRisk;
    });        
}

/* Extract drive id from the input payload driver(s) */
function getDriverId ( driver ) {
    	const driverId = driver['id'];
		if ( driverId === undefined || driverId === null )
			return "";
		else
			return driverId;		
}

/* Extract te zone risk from the additional data file for a specific driver */
function getZoneRiskFromMarkLogic ( corticonDataManager, driverId ) {
    let zoneRisk;

    const configurationProperties = corticonDataManager.getConfiguration();
	const cts = getMarkLogicCtsApi ( configurationProperties );	
	if ( typeof cts === "string" ) { 
		zoneRisk = cts; // we got an error; just pass it back in the zoneRisk as we will see it directly in the payload when testing
	}
	else {
		let theMLDoc = getUriAdditionalDataFile (configurationProperties);
		if ( theMLDoc === null ) {
			zoneRisk = "Missing configuration for UriAdditionalData";
		}
		else {
			theMLDoc += driverId + ".json";
	    	logger.logDebug('Reading additional data file: ' + theMLDoc);
		    const additionalData = cts.doc(theMLDoc);
		  	if ( additionalData !== undefined && additionalData !== null ) {
		    	zoneRisk = getZoneRiskFromJson(additionalData.toObject());
		  	}
		  	else {
		    	logger.logError('Missing additional data file: ' + theMLDoc);
	    		zoneRisk = "missing additional data file for this driver id: "+driverId;
		  	}
	  	}
    }
 
 	return zoneRisk;
}

function getZoneRiskFromJson ( additionalData ) {
	try {
		return additionalData[0]["zoneDriven"];  // For now just return first one, for multiple drivers we could return the whole array
	}
	catch ( e ) {
		return "missing zoneDriven in additional data";
	}
}

function getUriAdditionalDataFile (configurationProperties) {
	let result;
	if ( configurationProperties["uriAdditionalData"] === undefined ) {
    	logger.logError('Missing configuration for UriAdditionalData. '+ JSON.stringify(configurationProperties) );
    	result = null;
    }
    else {
		result = configurationProperties["uriAdditionalData"];
	}
	
	return result;
}

function getMarkLogicCtsApi ( configurationProperties ) {       
    const propsString = JSON.stringify(configurationProperties);
 	logger.logDebug(propsString); // Just output all properties in one string.

    let result = "Couldn't get cts API";
    if ( configurationProperties === undefined ) {
    	logger.logError('Missing service callout configuration. ' + propsString );
    	result = "missing service callout configuration. " + propsString;
    }
    else {	    	 
    	if ( configurationProperties["ctsApi"] === undefined ) {
	    	logger.logError('Missing configuration for cts api. '+ propsString );
	    	result = "missing cts API. " + propsString;
	    }
	    else {
			result = configurationProperties["ctsApi"];
		}
	}
	
	return result;
}

exports.getZoneDrivenRiskLevelFct = getZoneDrivenRiskLevelFct;
