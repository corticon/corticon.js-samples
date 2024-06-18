1) Introduction
===============

This SCO demonstrates how to use GraphQL to query a data subset and insert the result in working memory to augment
the current payload in just one call.
The data subset is either added to the root of the payload or into a specific entity.

The new data is, of course, available for rule processing.  So in effect, we are augmenting the initial input payload
with additional data.  The advantage is that we can pass a smaller payload to begin with and augment it based on rules
specific needs.


2) What GraphQL Data Is Retrieved
=================================
The queries are done against the public end point 'https://countries.trevorblades.com/graphql'

You can try querying this end point using the online tool:
https://lucasconstantino.github.io/graphiql-online/

For example, with the following query, we get the countries from Oceania:
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

3) Setting up Queries
=====================

As an integrator, you can add queries by following these steps:

   1) Add the name of the query to be used by the modeler to the QueryName enumeration (See vocab.ecore). 
      This is the user friendly query name and it can contain spaces for better readability.

   2) Use the user friendly query name in the module exports in DataAccess/Queries.js to point to the query metadata function 

   3) Define the query metadata function in DataAccess/Queries.js


4) Querying and Passing parameters
==================================

The query name and its parameters can be either:

   1) passed as part of the input payload
   
   2) specified by the rules at decision service execution time


Case 1 is implemented by an integrator.  See GetOneCountrySimplest.erf for an example.

Case 2  is implemented by the rule modeler.  See GetOneCountry.erf for an example.
As a modeler, you specify the query and its parameters (if any) before calling the service callout in a ruleflow.
To do so, you simply assign attributes to the Query entity (as you would for any other rules)

The currently available queries are defined in the vocabulary as an enumeration (See QueryName in vocab.ecore)

The two queries are:

	1) query by continent code: it takes one parameter which is the value of the continent code.
	For example, to query South America countries, you would assign:  
	Query.name 			with 	'Get Countries by Continent'
	Query.parameter1 	with	'SA'	
	
	Other continents: NA, EU, SA, AS, OC.
	

	2) query by country code: it takes one parameter which is the value of the continent code.
	For example, to query South America countries, you would assign:  
	Query.name 			with 	'Get Country by Code'
	Query.parameter1 	with	'FR'


5) Configuring the SCO - Where are the retrieved countries appended to? 
======================================================================

There are 2 choices: either the countries are appended:
   1) as children of an entity 
   2) or to the root of the data.

For 1): You can configure which entity to append to by defining the runtime property entityToAppendTo
If you pass a valid entity as a run time prop then the SCO will add the data to the entity using an association.  
The attribute name of the association (the external role name) is specified in the metadata of the query (See roleName attribute in Queries.js)  

For 2): If you do not define a runtime property then the SCO adds the countries to root. 
The data type of the entity to add to root is specified in the metadata of the query (See entityType attribute in Queries.js)  

 