This sample shows how an SCO can augment the payload data processed by the rules.
Specifically, it shows how to update attributes of various data types from the Product entity.

In this example, for a given product SKU the SCO will augment each product entity with the 
product's price, available quantity and expiration date.

Then, if the product is available in sufficient quantity, a rulesheet will compute the order
total cost.

It's important to note that you can use JavaScript Strings and JavaScript Numbers when dealing 
with Corticon.js Strings or Corticon.js Integer respectively.  However, when dealing with 
Corticon.js Decimal, Date and DateTime attributes you need to use helper functions from the
corticonDataManager (for example for doing decimal operations you would access the helper 
with corticonDataManager.getOperator().decimal). The example shows how to work with Decimals 
(product's price attribute), DateTimes (expiration date attribute) and with simple integer 
(available quantity attribute).




