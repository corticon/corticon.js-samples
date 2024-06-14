
/*
This module defines the two queries available to modelers: see module.exports at bottom of the file.

Query can be tried at https://lucasconstantino.github.io/graphiql-online/
https://countries.trevorblades.com/graphql

query {
  continent(code: "OC") {
     countries {
    	name
    	code
        currency
        awsRegion
        languages {
          code
          name
        }
  	  }
   }
}
*/
function getCountriesByContinentMetadata(params) {
	const countriesByContinent = {
			  query: `{
				continent(code: "${params[0]}") {
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

    return { "query": countriesByContinent, // The GraphQL query with all the parameters resolved.
        "pathToData": 'continent',    		// The name of the attribute where to find the list of countries
        "pathToData2": 'countries',    		// The name of the attribute where to find countries array under pathToData - this is our JSON sub-payload in the GraphQL results.
        'entityType': 'Countries',    		// The Corticon vocabulary datatype of the entity we will be adding sub-payload to the root of the payload (only used when adding to root)
        'roleName': 'countries' 			// The Corticon vocabulary external name of the relationship to which we will be adding the sub-payload (only used when adding to a specific entity) - in our case the role name is "countriesOfInterest" but the external name is "countries" - see the properties of the relationship in vocab.ecore
    };
}


/*
Query can be tried at https://lucasconstantino.github.io/graphiql-online/
https://countries.trevorblades.com/graphql

We intentionally return more attributes than the ones mapped into the vocabulary to show that more data
can be inserted into the payload; of course no rules can accessed these additional attributes but this
data will be output in the results.  And it can be used by other services.

query {
  country(code: "CH") {
	awsRegion
    name
    code
    phone
	currency
    native
    capital
    emoji
    continent {
      code
    }
    languages {
      code
      name
    }
  }
}

*/
function getCountryByCodeMetadata(params) {
	const countriesByCode = {
			  query: `{
				country(code: "${params[0]}") {
					awsRegion
				    name
				    code
				    phone
					currency
                    native
				    capital
                    emoji
                    continent {
                      code
                    }
				    languages {
				      code
				      name
				    }
			    }
			}`
	    };

    return { "query": countriesByCode, // The GraphQL query with all the parameters resolved.
        "pathToData": 'country',     // The name of the attribute where to find the JSON sub-payload in the GraphQL results.
        'entityType': 'Countries',     // The Corticon vocabulary datatype of the entity we will be adding sub-payload to the root of the payload (only used when adding to root)
        'roleName': 'countries' 	   // The Corticon vocabulary external name of the relationship to which we will be adding the sub-payload (only used when adding to a specific entity)
    };
}

module.exports = { "Get Countries by Continent": getCountriesByContinentMetadata, "Get Country by Code": getCountryByCodeMetadata };
