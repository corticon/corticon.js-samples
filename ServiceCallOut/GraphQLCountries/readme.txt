1) Introduction
===============

This SCO demonstrates how to use GraphQL to query a data subset and insert the result in just one call either to the root of the payload 
or into a specific entity.

The new data is, of course, available for rule processing.

2) What GraphQL Data
====================
The queries are done against the public end point 'https://countries.trevorblades.com/graphql'

You can try querying using the online tool:
https://lucasconstantino.github.io/graphiql-online/

with the following query:
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


3) Configuring the SCO
======================

You can configure which continent to query the countries of by defining the runtime property continentCode
For examples, NA, EU, SA, AS, OC.

You can configure which entity to append to by defining the runtime property entityToAppendTo
If you pass a valid entity as a run time prop then the SCO will add the data to the entity using an association.  
For now the attribute name of the association (the external role name) is fixed to "countries".  
If you do not pass one then it adds to root and assumes the data type is "Countries".
 