/*
	This SCO gets data using graphQL from URL specified in this file

	The modeler simply references a user friendly query name in the Query entity and specifies the values for each of the query parameters (if needed)
	Thus the modeler has the full power of the rule language to specify query names and parameters based on various conditions in rule execution.
	You can see an example of this in PrepareQuery.ers.
	The query names are defined as a string enum (See QueryName enum in the vocab.ecore file)

	Internally, it works this way:
	1) The queries and all associated metadata are defined in the Queries.js.
	2) The modeler friendly query names are referenced in the module.exports file and points to the query metadata.
	3) The query metadata contains the actual query as well as:
		o  Where to find the data of interest in the GraphQL result (pathToData)
		o  If adding results to root, the data type of entity to add (entityType)
		o  If adding results to a relationship, the external name of the relationship to which we will be adding the sub-payload (roleName)

	So, in brief: the user friendly query name maps to metadata in Queries.js.
	From that metadata, the GraphQL connector can process the query generically.
*/

const graphQLConnector = require('./GraphQLConnector');

const graphQLSCO = {
    func: 'getCountriesFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function gets a set of countries from the end point https://countries.trevorblades.com/graphql.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'getCountries'}
};

async function getCountriesFct(corticonDataManager, serviceCalloutProperties) {
	const logger = corticonDataManager.getLogger();
	logger.logDebug(`SCO getCountriesFct V1.0`);

	// This url (as well as authentication token) could be passed as a configuration property (do not add to runtime properties as these get bundled in the decision service)
	// See this sample on how to use configuration properties: https://github.com/corticon/corticon.js-samples/tree/master/ServiceCallOut/AccessConfigurationProperties
	const url = 'https://countries.trevorblades.com/graphql';
	const queryMetadata = graphQLConnector.getQueryMetadata(corticonDataManager, logger);
	logger.logDebug(`*** SCO: Got query metadata: ${JSON.stringify(queryMetadata, 2)}`);
	const countriesList = await graphQLConnector.getData(url, queryMetadata.query, queryMetadata.pathToData, logger);
	logger.logDebug(`*** SCO: Got countries: ${JSON.stringify(countriesList, 2)}`);
	let countries;
	// When we get by continent we need to get one more level down
	if ( queryMetadata.pathToData2 !== undefined && queryMetadata.pathToData2 !== null )
		countries = countriesList[queryMetadata.pathToData2];
	else
		countries = countriesList;

	logger.logDebug(`*** SCO: Got countries: ${JSON.stringify(countries, 2)}`);

	// If there is an entity, let's add to it, otherwise we just add all the countries to the top level of the payload
	const nameEntityToAppendResultsTo = getNameEntityToAppendResultsTo(serviceCalloutProperties);
	const entity = getEntityToAppendTo(nameEntityToAppendResultsTo, corticonDataManager, logger);
	if ( entity !== null )	{
		logger.logDebug(`*** SCO: Adding to ${nameEntityToAppendResultsTo} entity using external name: ${queryMetadata.roleName}`);
		corticonDataManager.addAssociationsToEntity(entity, queryMetadata.roleName, countries); // second parameter is the attribute name as it appears in the payload
	}
	else {
		logger.logDebug(`*** SCO: Adding to top level based on entity type: ${queryMetadata.entityType}`);
    	corticonDataManager.addEntitiesAndAssociations(queryMetadata.entityType, countries);
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
function getEntityToAppendTo(entityToAppendCountryTo, corticonDataManager, logger) {
	logger.logDebug(`*** Searching for ${entityToAppendCountryTo} entities and returning first one`);
	if ( entityToAppendCountryTo === undefined || entityToAppendCountryTo === null ) {
		logger.logDebug(`*** nothing to search for`);
		return null;
	}

	let entityToReturn = null; // default to not finding
	const entitiesSet = corticonDataManager.getEntitiesByType(entityToAppendCountryTo);
	for (const entity of entitiesSet) {
		logger.logDebug(`*** one entity ${entity.id}`);
		entityToReturn = entity;
		break;
	}

	if ( entityToReturn === null )
		logger.logDebug(`*** didn't find any ${entityToAppendCountryTo} `);

	return entityToReturn;
}

exports.getCountriesFct = getCountriesFct;
