Introduction:
============

This sample contains two SCO that show how to extract from the payload and show how to augment 
the payload (in-memory data) processed by the decision service (the rules).

We have additional samples that show similar concepts:
1) The sample at https://github.com/corticon/corticon.js-samples/tree/master/ServiceCallOut/UpdateEntityAttributes
is showing how to update specific individual attributes of any entities in the payload. 

2) The sample at https://github.com/corticon/corticon.js-samples/tree/master/ServiceCallOut/CreateAssociation
is showing how to create a new entity and add an associated entity into the payload. 

But there are times when you want to insert a whole dataset into the in-memory data. By whole dataset, we mean
a set of entities and their associated children entities.  For example you could get a JSON representation of a 
shopping cart and all its associated items for a specific user from a REST call and you want to insert the whole 
dataset to the in-memory payload. Conversely, you may want to extract a whole dataset from the in-memory data and 
save (write) that dataset to a data backend server.  Using the techniques shown in the two samples above would be 
cumbersome.  This service callout (SCO) demonstrates both how to insert or extract parts of the in-memory data 
using just one API call.  

Specifically, the SCO implements two separate services (See file readWriteEntitiesAndChildrenServiceCallout.js): 

The first one: addCustomersWithShoppingCarts shows how to add customers entities with their associated 
shopping cart and items to the in-memory payload using the API addEntitiesAndAssociations. 

The second one: getShoppingCart shows how to extract for each customers the shopping cart and all 
its associated items using the API getAssociationsForEntity.

For additional information on these two APIs check the doc at 
https://docs.progress.com/bundle/corticon-js-extensions/page/Use-APIs-to-update-entities-and-associations.html


Details:
=======

This example is generic and does not actually read or write the data to a specific backend as these 
require backend specific calls.  The advantage is that the example can be run anywhere without any 
dependencies and can also be executed in Corticon studio tester as is.
In the read case, we get hardcoded data from readWriteEntitiesAndChildrenServiceCallout.js
and the write case, we write the extracted JSON data to the customer attribute "shoppingCartAsJson". 

The vocabulary in this project consists of three main entities: Customers, Items, and ShoppingCarts. 
Customers can have multiple ShoppingCarts, each containing multiple Items (a three levels hierarchy 
of 1 to n relationships).
The vocabulary models the interactions between customers, their shopping carts, and the items 
within those carts.  

The ruleflow has 3 steps:
1) Invoke the addCustomersWithShoppingCarts SCO to populate the in-memory payload with a set of customers,
 their shopping cart and the associated Items.
2) Run a rulesheet to calculate total amounts for items within those carts. 
3) Invoke the getShoppingCart SCO to retrieve, for each customer, the shopping cart as JSON and store it 
in an attribute for inspection in tester.  In practice, that SCO would write the JSON to a specific backend.  	 
