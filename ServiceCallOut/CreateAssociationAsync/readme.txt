This sample shows how an SCO can augment the payload and specifically how to add associated entities (creating associations)
from the result of an async call.

In the "Update Product" sample we showed how to update or add attributes to an entity.
In this sample, we will do the same and in addition we will add an association to related entities.
specifically, for each SKU, we add an association to the list of all providers necessary to fulfill the order.
Then the rulesheet will use that data for computing the total cost.
