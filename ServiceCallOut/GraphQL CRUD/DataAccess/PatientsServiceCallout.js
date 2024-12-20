/*
	This SCO does CRUD operations using graphQL using a URL specified in this file

	The modeler simply references a user friendly query name in the Query entity and specifies 
	the values for each of the query parameters (when needed). Thus the modeler has the full power 
	of the rule language to specify query names and parameters based on various conditions in rule execution.
	You can see an example of this in the various PrepareQuery*.ers files in the SubFlows folder.
	The query names are defined as a string enum (See QueryName enum in the vocab.ecore file)

	In essence, GraphQL mutations are implemented by creating mutation strings in Queries.js that are 
	parameterized with entity data. The SCO logic retrieves these parameterized mutations from various entities 
	in the decision service memory, and the generic	GraphQLConnector.js sends them to the GraphQL server. 
	

	Internally, it works this way:
	1) The queries and all associated metadata are defined in the Queries.js file.
	2) The modeler friendly query names are referenced in the module.exports file and they point to the query metadata.
	3) The query metadata contains the actual query as well as:
		o  Where to find the data of interest in the GraphQL result (pathToData)
		o  If adding results to root, the data type of entity to add (entityType)
		o  If adding results to a relationship, the external name of the relationship to which we will be adding the sub-payload (roleName)
		o  When creating or updating, the data is passed as JSON with an entity resolver.
	
	So, in brief: the user friendly query name maps to metadata in Queries.js.
	From that metadata, the GraphQL connector can process the query generically.
	
	Note: For testing using file url with a browser use a simple local proxy to avoid CORS issues 
	(testing with a local html file to invoke the generated decision service for browser) 
	I used: https://www.npmjs.com/package/local-cors-proxy 
	I started it with the command: lcp --port 8777 --proxyUrl http://localhost:5433/
	(http://localhost:5433/ is where PostGraphile the GraphQL front-end runs on my test system)

	Nested mutations: they are not available out of the box.
	https://stackoverflow.com/questions/75041422/configure-postgraphile-to-support-succinct-nested-mutations
*/

// Include the generic graphQL connector.
const graphQLConnector = require('./GraphQLConnector');

// This url (as well as authentication token) could be passed as a configuration property (do not add to runtime properties as these get bundled in the decision service)
// See this sample on how to use configuration properties: https://github.com/corticon/corticon.js-samples/tree/master/ServiceCallOut/AccessConfigurationProperties
//const url = 'http://localhost:5433/graphql';  // direct access to PostGraphile
const url = 'http://localhost:8777/proxy/graphql';  // access to PostGraphile via proxy for testing with file url in local browser.

const graphQLSCO = {
    func: 'getAllPatientsFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function gets a all patients from the DB.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'getAllPatients'}
};

const graphQLSCO2 = {
    func: 'createPatientFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function creates a new patient in DB based on a patientId and an in memory patient.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'createPatient'}
};

const graphQLSCO3 = {
    func: 'updateAllPatientsFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function updates all patients from the decision service memory to the DB.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'updateAllPatients'}
};

const graphQLSCO4 = {
    func: 'deletePatientFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function deletes a patient from DB based on patientId.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'deletePatient'}
};

async function createPatientFct(corticonDataManager, serviceCalloutProperties) {
	const logger = corticonDataManager.getLogger();
	logger.logDebug(`SCO createPatientFct V1.0`);

	function entityResolver(params) {
    	// param0 is id of the entity to find 
    	const patientId = params[0];
    	const newPatient = getNewPatient(patientId, corticonDataManager, logger);
    	const dob = corticonDataManager.getOperator().dateTime.outputToJson(newPatient.dob);
		const newEntityAsJson = `{patientid: \"${patientId}\", patientname: \"${newPatient.patientname}\", gender: \"${newPatient.gender}\", dob: \"${dob}\", region: \"${newPatient.region}\"}`;
		logger.logDebug(`*** SCO createPatientFct: entityResolver result: ${JSON.stringify(newEntityAsJson, 2)}`);
		return newEntityAsJson;
	}

	// The entity resolver is responsible for accessing the necessary data (the attributes) to create a new patient
	// As long as it return an object literal containing all the data, the query can be executed independently from
	// where the data comes from. In this example, we get the data from a temporary Patient entity available in the 
	// patientToAdd 1 to 1 relationship.
	const queryMetadata = graphQLConnector.getQueryMetadataWrite(corticonDataManager, logger, entityResolver);
	const newPatient = await graphQLConnector.getData(url, queryMetadata.query, queryMetadata.pathToData, logger);
	// We get something like this: {"createPatient":{"patient":{"patientid":"99"}}}  - Where the content of createPatient is defined in the mutation query.
	// And here is an example of when we get an error:
	// {"errors":[{"message":"duplicate key value violates unique constraint \"patient_pkey\"","locations":[{"line":1,"column":12}],"path":["createPatient"]}],"data":{"createPatient":null}} 	

	logger.logDebug(`*** SCO: result of new patient creation in the GraphQL DB: ${JSON.stringify(newPatient, 2)}`);
	
	// We store the result in the entity, if it exists in the payload, to allow user to inspect
	// In real life, you will want to do error handling and decide if you can proceed as is or if you need
	// to interrupt the decision service execution.  This is use case dependent and can't be generalized completely. 	
	const resultsTrace = getResultsEntity(corticonDataManager, logger);
	if ( resultsTrace !== null )
		resultsTrace.createResponse = JSON.stringify(newPatient);		
}

async function updateAllPatientsFct(corticonDataManager, serviceCalloutProperties) {
	const logger = corticonDataManager.getLogger();
	logger.logDebug(`SCO updateAllPatientsFct V1.0`);

	const entitiesSet = corticonDataManager.getEntitiesByType("Patient");
	let updCount = 0;
	for (const entity of entitiesSet) {
		logger.logDebug(`*** update patient id ${entity.patientid} `);

		if ( entity.patientid !== '' ) {
			// note: this function uses the entity variable defined at outer scope - so it's necessary to keep this fct definition within the loop	
			function entityResolver(params) {
		    	// No param are needed from the modeler - we simply retrieve the needed data from the current entity in the loop
		    	const updPatient = entity;
		    	const dob = corticonDataManager.getOperator().dateTime.outputToJson(updPatient.dob);
				const entityToUpdAsJson = `{patientname: \"${updPatient.patientname}\", gender: \"${updPatient.gender}\", dob: \"${dob}\", region: \"${updPatient.region}\"}`;
				return  [updPatient.patientid, entityToUpdAsJson];
			}
	
			// The entity resolver is responsible for accessing the necessary data (the attributes) to create a new patient
			// As long as it return an object literal containing all the data, the query can be executed independently from
			// where the data comes from. In this example, we get the data from the Patient entities in memory
			const queryMetadata = graphQLConnector.getQueryMetadataWrite(corticonDataManager, logger, entityResolver);
			const updatedPatientResult = await graphQLConnector.getData(url, queryMetadata.query, queryMetadata.pathToData, logger);		
			logger.logDebug(`*** SCO updateAllPatientsFct: updated patient: ${JSON.stringify(updatedPatientResult, 2)}`);
			
			updCount++;
		}
	}

	// We store how many updates we did in the entity, if it exists in the payload, to allow user to inspect
	// In real life, you will want to do error handling and decide if you can proceed as is or if you need
	// to interrupt the decision service execution.  This is use case dependent and can't be generalized completely. 	
	const resultsTrace = getResultsEntity(corticonDataManager, logger);
	if ( resultsTrace !== null ) {
		resultsTrace.updatePatientCount = updCount;	
	}
}

async function deletePatientFct(corticonDataManager, serviceCalloutProperties) {
	const logger = corticonDataManager.getLogger();
	logger.logDebug(`SCO deletePatientFct V1.0`);

	const queryMetadata = graphQLConnector.getQueryMetadata(corticonDataManager, logger);
	const delPatientResponse = await graphQLConnector.getData(url, queryMetadata.query, queryMetadata.pathToData, logger);
	/*
		We get something like:
		{"deletePatientByPatientid":{"deletedPatientId":"WyJwYXRpZW50cyIsIjk5Il0="}}
		
		You can use the code below to extract the decoded part 

		function decodeBase64ToJson(encodedString) {
		    // Decode the Base64 string
		    const decodedString = atob(encodedString);
		    
		    // Parse the decoded string as JSON
		    const decodedData = JSON.parse(decodedString);
		    
		    return decodedData;
		}
	
		if ( delPatientResponse['deletePatientByPatientid'] !== undefined && delPatientResponse['deletePatientByPatientid'] !== null ) { 
			const encodedPart = delPatientResponse['deletePatientByPatientid']['deletedPatientId'];
			// we get, decoded, the following json: [\"patients\",\"99\"]
			const deletedPatient = decodeBase64ToJson(encodedPart);
		}
	*/
	
	// We store the result in the entity, if it exists in the payload, to allow user to inspect
	// In real life, you will want to do error handling and decide if you can proceed as is or if you need
	// to interrupt the decision service execution.  This is use case dependent and can't be generalized completely. 	
	const resultsTrace = getResultsEntity(corticonDataManager, logger);
	if ( resultsTrace !== null ) {
		let trace = JSON.stringify(delPatientResponse);
		if ( delPatientResponse !== undefined && delPatientResponse['deletePatientByPatientid'] !== undefined && delPatientResponse['deletePatientByPatientid'] !== null ) { 
			const encoded = delPatientResponse['deletePatientByPatientid']['deletedPatientId'];
			const decodedString = atob(encoded);
			trace += " - Decoded deleted patientid: " + decodedString; 
		}
		resultsTrace.deleteResponse = trace;
	}		
}

// Get a patient from the in memory list based on patient id
function getNewPatient(patientId, corticonDataManager, logger) {
	let entityToReturn = null; // default to not finding
	logger.logDebug(`*** getNewPatient for id ${patientId} `);
	const entitiesSet = corticonDataManager.getEntitiesByType("Patient");
	for (const entity of entitiesSet) {
		logger.logDebug(`*** getNewPatient processing id ${entity.patientid} `);
		if ( entity.patientid === patientId ) {
			return entity;
		}
	}

	if ( entityToReturn === null )
		logger.logError(`*** didn't find entity to create with id ${patientId} `);

	return entityToReturn;
}

async function getAllPatientsFct(corticonDataManager, serviceCalloutProperties) {
	const logger = corticonDataManager.getLogger();
	logger.logDebug(`SCO getAllPatientsFct V1.0`);

	const queryMetadata = graphQLConnector.getQueryMetadata(corticonDataManager, logger);
	const patientsList = await graphQLConnector.getData(url, queryMetadata.query, queryMetadata.pathToData, logger);
	logger.logDebug(`*** SCO: Got patients: ${JSON.stringify(patientsList, 2)}`);
	
	let patients;
	// When we get patients under "nodes" attribute we need to get one more level down
	if ( queryMetadata.pathToData2 !== undefined && queryMetadata.pathToData2 !== null )
		patients = patientsList[queryMetadata.pathToData2];
	else
		patients = patientsList;

	logger.logDebug(`*** SCO: Got patients: ${JSON.stringify(patients, 2)}`);

	// If there is an entity, let's add to it, otherwise we just add all the patients to the top level of the payload
	const nameEntityToAppendResultsTo = getNameEntityToAppendResultsTo(serviceCalloutProperties);
	const entity = getEntityToAppendTo(nameEntityToAppendResultsTo, corticonDataManager, logger);
	if ( entity !== null )	{
		logger.logDebug(`*** SCO: Adding to ${nameEntityToAppendResultsTo} entity using external name: ${queryMetadata.roleName}`);
		corticonDataManager.addAssociationsToEntity(entity, queryMetadata.roleName, patients); // second parameter is the attribute name as it appears in the payload
	}
	else {
		logger.logDebug(`*** SCO: Adding to top level based on entity type: ${queryMetadata.entityType}`);
    	corticonDataManager.addEntitiesAndAssociations(queryMetadata.entityType, patients);
	}

	// We store the count of patients retrieved in the entity, if it exists in the payload, to allow user to inspect
	// In real life, you will want to do error handling and decide if you can proceed as is or if you need
	// to interrupt the decision service execution.  This is use case dependent and can't be generalized completely. 	
	const resultsTrace = getResultsEntity(corticonDataManager, logger);
	if ( resultsTrace !== null ) {
		resultsTrace.getPatientCount = patients.length;	
	}
}


function getNameEntityToAppendResultsTo(serviceCalloutProperties) {
	// Where do we append the result.
	// If you pass a valid entity as a run time prop then the SCO will add the data to the entity using an association.
	// If you do not pass one then it adds to root.
	if (serviceCalloutProperties['entityToAppendTo'] !== undefined && serviceCalloutProperties['entityToAppendTo'] !== null)
		return serviceCalloutProperties['entityToAppendTo'];
	else
		return null; // will append to root
}

/*
	Generic function to find the entity to append to
*/
function getEntityToAppendTo(entityToAppendTo, corticonDataManager, logger) {
	logger.logDebug(`*** Searching for ${entityToAppendTo} entities and returning first one`);
	if ( entityToAppendTo === undefined || entityToAppendTo === null ) {
		logger.logDebug(`*** nothing to search for`);
		return null;
	}

	let entityToReturn = null; // default to not finding
	const entitiesSet = corticonDataManager.getEntitiesByType(entityToAppendTo);
	for (const entity of entitiesSet) {
		logger.logDebug(`*** one entity ${entity.id}`);
		entityToReturn = entity;
		break;
	}

	if ( entityToReturn === null )
		logger.logDebug(`*** didn't find any entities of type ${entityToAppendTo} `);

	return entityToReturn;
}

/*
	Generic function to get at Results entity (To trace what's happening within the SCO)
*/
function getResultsEntity(corticonDataManager, logger) {
	const entitiesSet = corticonDataManager.getEntitiesByType("Results");
	for (const entity of entitiesSet) {
		return entity;
	}

	logger.logError(`*** getResultsEntity: didn't find Results entity`);

	return null;
}

exports.getAllPatientsFct = getAllPatientsFct;
exports.createPatientFct = createPatientFct;
exports.updateAllPatientsFct = updateAllPatientsFct;
exports.deletePatientFct = deletePatientFct;
