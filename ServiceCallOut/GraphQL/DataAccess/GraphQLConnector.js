const queries = require('./Queries');

async function getData (url, graphQLQuery, pathToData, logger) {
    const graphQLResult = await getDataUsingGraphQL( graphQLQuery, url, logger );
    if ( graphQLResult !== null ) {
	    const results = graphQLResult[pathToData];
	    return results;
    }
    else
    	throw new Error ("GQL Connector: Bad data returned by GraphQL - check log");
}

function getQueryMetadata(corticonDataManager, logger) {
    const queryEntity = getQueryEntity(corticonDataManager, logger); // The entity containing all the data to use in the query
    const params = getQueryParams(queryEntity, logger); // the list of parameter values to use for substitution in the query
    const queryMetadataResolverFct = getQueryMetadataResolverFct(queryEntity, logger); // the function to call to invoke param substitution

    // do params substitution in the query and retrieve other metadata about that query
    const queryMetadata = queryMetadataResolverFct(params);
    return queryMetadata;
}

function getQueryEntity(corticonDataManager, logger) {
    logger.logError(`*** GQL Connector: Searching for Query entity`);

    let queryEntity = null; // default to not finding
    const entitiesSet = corticonDataManager.getEntitiesByType('Query');
    for (const entity of entitiesSet) {
        logger.logError(`*** GQL Connector: Found one query`);
        queryEntity = entity;
        break;
    }

    if ( queryEntity === null ) {
        logger.logError(`*** GQL Connector: didn't find any Query`);
        throw new Error ('Payload does not have a Query entity');
    }
    else
        return queryEntity;
}

function getQueryParams(queryEntity, logger) {
    logger.logError(`*** Extracting parameters from Query entity `);

    const params = [];

    //todo: null/undefined checks + iterate through all param attributes
    params[0] = queryEntity.parameter1;
    params[1] = queryEntity.parameter2;

    logger.logError(`*** GQL Connector: params added ${params[0]}`);
    return params;
}

function getQueryMetadataResolverFct(queryEntity, logger) {
    //todo: null/undefined checks
    const name = queryEntity.name;
    logger.logError(`*** GQL Connector: Extracting query name from Query entity.  Found: ${name}`);

    const queryResolverFct = queries[name];
    if ( queryResolverFct === undefined || queryResolverFct === null )
        throw new Error (`*** GQL Connector: missing query resolver fct for "${name}"` );

    if ( typeof queryResolverFct !== 'function' )
        throw new Error (`*** GQL Connector: query resolver for "${name}" is not a function` );

    logger.logDebug(`*** GQL Connector: query resolver for ${name} found`);

    return queryResolverFct;
}

/*
	Generic function to get data from server using fetch API querying with a GraphQL query
*/
async function getDataUsingGraphQL( graphQLQuery, url, logger ) {
    const results = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(graphQLQuery)
    });

	const text = await results.text(); // Parse it as text as sometimes we may get invalid json

	try {
    	const graphQL = JSON.parse(text);
	    logger.logDebug(`***** GQL Connector: getDataUsingGraphQL got response:\n ${JSON.stringify(graphQL)}`);
	    return graphQL.data;
    }
    catch ( e ) {
    	logger.logError(`***** GQL Connector: getDataUsingGraphQL Bad data returned by GraphQL ${text}`);
    	return null;
    }
}

module.exports = { getData, getQueryMetadata };