const graphQLSCO = {
    func: 'getCountriesFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function gets a set of countries from the end point https://countries.trevorblades.com/graphql.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'getCountries'}
};

async function getCountriesFct(corticonDataManager, serviceCalloutProperties) {
	const logger = corticonDataManager.getLogger();
	logger.logError(`*** in getCountriesFct V3`);

	// Query parameters: which continent are we querying?
	let continentCode;
	if ( serviceCalloutProperties['continentCode'] !== undefined && serviceCalloutProperties['continentCode'] !== null )
		continentCode = serviceCalloutProperties['continentCode'];
	else
		continentCode = 'NA';
	
	// And where do we append the result.
	// If you pass a valid entity as a run time prop then the SCO will add the data to the entity using an association.  
	// If you do not pass one then it adds to root.
	let entityToAppendCountryTo;
	if ( serviceCalloutProperties['entityToAppendTo'] !== undefined && serviceCalloutProperties['entityToAppendTo'] !== null )
		entityToAppendCountryTo = serviceCalloutProperties['entityToAppendTo'];
	else
		entityToAppendCountryTo = null; // will append to root
	
	// This url could be passed as a configuration property (with authentication token too)
	const url = 'https://countries.trevorblades.com/graphql';
	const graphQLQuery = {
			  query: `{
				continent(code: "${continentCode}") {
					countries {
						awsRegion
						name
						code
						phone
						currency
						languages {
						  code
						  name
						}
					}
				}
			}`
	    };

//	logger.logDebug(`*** Ready to add countries from continent ${continentCode} to entity ${entityToAppendCountryTo}`);
	logger.logError(`*** Ready to add countries from continent ${continentCode} to entity ${entityToAppendCountryTo}`);


	let countries;
	if ( queryCountriesWithGraphQL ) {
		const graphQLResult = await getDataUsingGraphQL( graphQLQuery, url, logger );
		countries = graphQLResult.continent.countries;
	}
	else
		countries = exampleCountries.countries;
			
	const entity = getEntityToAppendTo(entityToAppendCountryTo, corticonDataManager, logger);
	
	// If there is an entity, let's add to it, otherwise we just add all the countries to the top level of the payload 
	if ( entity !== null )	{	
		logger.logError(`*** Adding to ${entityToAppendCountryTo} entity`);
		corticonDataManager.addAssociationsToEntity(entity, "countries", countries); // second parameter is the attribute name as it appears in the payload
	}
	else {	
		logger.logError(`*** Adding to top level`);
    	corticonDataManager.addEntitiesAndAssociations('Countries', countries);
	}
	
	logger.logDebug(`*** ${countries.length} countries added to decision service data`);
}

/*
	Generic function to find the entity to append to 
*/
function getEntityToAppendTo(entityToAppendCountryTo, corticonDataManager, logger) {
	logger.logError(`*** Searching for ${entityToAppendCountryTo} entities and returning first one`);
	if ( entityToAppendCountryTo === undefined || entityToAppendCountryTo === null ) {
		logger.logError(`*** nothing to search for`);		
		return null;
	}
		
	let entityToReturn = null; // default to not finding
	const entitiesSet = corticonDataManager.getEntitiesByType(entityToAppendCountryTo);
	for (const entity of entitiesSet) {
		logger.logError(`*** one entity ${entity.id}`);		
    	entityToReturn = entity;
    	break;
	}

//	const entities = [...entitiesSet];
//	logger.logError(`*** entities : ${entities.length}`);
	
	// This loop could be customized to search for a specific entity based on any attribute from the entity
	// Here we simply return the first one.
	/*for (const entity of entities) {
		logger.logError(`*** one entity ${entity.id}`);		
    	entityToReturn = entity;
    	break;
	}
	*/
	
	if ( entityToReturn === null )
		logger.logDebug(`*** didn't find any ${entityToAppendCountryTo} `);
		
	return entityToReturn;
}

/*
	Generic function to get data from server using fetch API querying with a GraphQL query 
*/
async function getDataUsingGraphQL( graphQLQuery, url, logger ) {
	logger.logError(`***** getDataUsingGraphQL at URL: ${url} for query: ${JSON.stringify(graphQLQuery)}`);
	const results = await fetch(url, {
				    method: 'POST',
				    headers: {
				      "Content-Type": "application/json"
				    },
				    body: JSON.stringify(graphQLQuery)
				  });
  
  const graphQL = await results.json();

  return graphQL.data;
}

const queryCountriesWithGraphQL = true; // when false we use the exampleCountries below; when true we query the data source for countries
const exampleCountries = 
	{ "countries": [
        {
          "name": "Andorra",
          "code": "AD",
          "currency": "EUR",
          "awsRegion": "eu-south-1",
          "languages": [
            {
              "code": "ca",
              "name": "Catalan"
            }
          ]
        },
        {
          "name": "Albania",
          "code": "AL",
          "currency": "ALL",
          "awsRegion": "eu-south-1",
          "languages": [
            {
              "code": "sq",
              "name": "Albanian"
            }
          ]
        },
        {
          "name": "Austria",
          "code": "AT",
          "currency": "EUR",
          "awsRegion": "eu-south-1",
          "languages": [
            {
              "code": "de",
              "name": "German"
            }
          ]
        }
	]
};

exports.getCountriesFct = getCountriesFct;
