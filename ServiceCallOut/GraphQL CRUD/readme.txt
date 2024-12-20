Introduction
------------

This project demonstrates CRUD operations for Corticon.js decision services using GraphQL.

The project simulates patient-related operations in a healthcare setting, but mostly focused on
creating, updating, and retrieving patient information.
 
It contains two main decision services
1) patientsApproval.erf: has an example of DB READ, CREATE and UPDATE.
2) CleanupDBContent.erf: has an example of DB DELETE and is used also to reset the DB content to a known 
state before re-running patientsApproval

For simplicity, the service patientsApproval only runs one rule: it computes the type of insurance based on age.
This is done so that we change some attributes of the patient in order to verify the update operation.

Note: It is not a sample on how to do healthcare operations. 
 
Open the rule flow in Corticon studio to study the steps.

Tech Stack:
----------
The project was tested using PostGraphile as a GraphQL front-end to a PostgreSQL DB.
For more info check https://www.graphile.org/postgraphile/
PostGraphile will give you two endpoints:
 _ GraphQL endpoint served at http://localhost:5433/graphql
 _ GraphiQL endpoint served at http://localhost:5433/graphiql

The first endpoint is for making GraphQL operations from the Corticon decision service. 
The second endpoint is a web browser app to give you access to your database through 
GraphiQL - a visual GraphQL explorer (more info at https://github.com/graphql/graphiql).


CRUD Operations
---------------
The GraphQL CRUD operations are implemented in a Service CallOut (SCO).
All the SCO files are in the folder "DataAccess".
 
The SCO leverages a generic GraphQL connector (See file GraphQLConnector.js) for standard operations.
You don't need to modify this file for your own project.

The two files of interest are PatientsServiceCallout.js and Queries.js

The file PatientsServiceCallout.js implements the 4 service callouts:
1) getAllPatients
2) createPatient
3) updateAllPatients
4) deletePatient

The file Queries.js defines the specific GraphQL queries associated with any of these 4 operations.  
It also defines the query names and parameters the modeler will use to specify a desired GraphQL operation.

The file GraphQLConnector.js provides a generic getData function that executes the final GraphQL query (or mutation) 
against the server. It accepts the fully formed graphQLQuery object and sends a POST request to the GraphQL endpoint 
using fetch. It parses the JSON response and returns the data portion of the GraphQL response to the caller.

The critical point is that GraphQLConnector.js does not differentiate between a query and a mutation; it simply sends 
the string it is given. The logic in Queries.js determines if it's a query or a mutation.

How does the query gets populated with data when creating or updating a record?
This is another critical point: GraphQLConnector.js is generic and does not know how to get at the data needed for
creating or updating a record. This is achieved, in the function graphQLConnector.getQueryMetadataWrite, with a
function called entity resolver.  The entity resolver returns the input data for the mutation as a structured 
JSON object literal.  The entity resolver is use case specific and is specified in the PatientsServiceCallout.js
file. In this sample, we get the data from various entities in the decision service memory but the data could come
from anywhere, for example from a REST call to another service.

In summary, GraphQL mutations in this SCO are implemented by creating mutation strings in Queries.js that are parameterized 
with entity data. The SCO logic computes these parameters, retrieves the finalized mutations, and the generic 
GraphQLConnector.js sends them to the GraphQL server. 


Testing from browser:
--------------------
For testing with a browser, use a local proxy to avoid CORS issues. 
I used: https://www.npmjs.com/package/local-cors-proxy 

You can quickly install it using: npm install -g local-cors-proxy

I started it with the command: lcp --port 8777 --proxyUrl http://localhost:5433/
(http://localhost:5433/ is where PostGraphile, the GraphQL front-end, runs on my test system)

The URL used by the decision services is defined in DataAccess/PatientsServiceCallout.js
as either:
	const url = 'http://localhost:5433/graphql';  // direct access to PostGraphile
or
	const url = 'http://localhost:8777/proxy/graphql'; // access to PostGraphile via proxy 
	
