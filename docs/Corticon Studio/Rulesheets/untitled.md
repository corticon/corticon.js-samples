# Collections

A Collection is a set of instances of the same entity. Each instance is called an element of the Collection. For example, in the input of this Ruletest, there are two elements in the Cargo collection:

![](<../../../.gitbook/assets/image (114).png>)

Corticon provides Collection operators that enable you to model rules that apply to a Collection. For example, you can use a Collection operator to find the highest or lowest value, or calculate the total or average value for an attribute, across all elements in a Collection.&#x20;

Collections have another useful feature. When data is structured in a parent-child hierarchy (for example when one FlightPlan entity—the parent—has an association with many Cargo child entities), Corticon automatically recognizes that each set of children is a separate Collection. In this image, there are two Cargo collections:

![](<../../../.gitbook/assets/image (107).png>)

So when you define a rule to calculate the sum of cargo weights for example, the rule will calculate the total weight for each Cargo Collection separately. For FlightPlan \[1] in this image, the rule will calculate a total of 300,000, while for FlightPlan \[2], it will calculate a total of 400,000.

### The role of Aliases and Scope in Collections

Aliases and Scope play a role in Collections too. They determine which entity instances are added to a Collection.&#x20;

You can define an Alias for a top-level or branch-level entity in the Scope pane of a Rulesheet’s Advanced View. For example, in this image the Cargo branch (the child entity) under FlightPlan (the parent entity) is assigned the Alias load:

![](<../../../.gitbook/assets/image (29).png>)

In this case, load represents Cargo instances that are associated with a FlightPlan. If there are multiple FlightPlans, there will be a load Collection (containing a set of Cargo elements) for each FlightPlan. Cargo instances that are not associated with a FlightPlan do not get added to a load Collection.&#x20;

Any rule that uses the term load applies only to instances of Cargo that are associated with a FlightPlan. Further, if you define a rule, for example to calculate the average value of cargo weight for each FlightPlan (denoted by load.weight instead of FlightPlan.cargo.weight), the rule will calculate an average value for each load Collection.&#x20;

On the other hand, if Cargo is at the top-level, and an Alias shipment is defined for it, such as in the image below, the shipment Collection will contain all instances of Cargo regardless of association. Any rule that uses the term shipment will apply to all instances of Cargo, irrespective of association.

![](<../../../.gitbook/assets/image (37).png>)

Note that you must define an Alias for an entity if you want to use that entity in a Collection-based rule.

### Define rules that apply to Collections

To define rules that apply to Collections, perform the following tasks:&#x20;

1.  &#x20;Define the Scope of the rules—identify parent-child relationships between entities (if any) that you want to use in the rule and drag and drop those entities and their attributes from the Rule Vocabulary view to the Scope pane in the Rulesheet’s Advanced View. Drag and drop the parent entity first and then the child entity (that appears as a branch under the parent entity). Then, drag and drop attributes. This should create a hierarchy as shown here:&#x20;

    <img src="../../../.gitbook/assets/image (119).png" alt="" data-size="original">
2.  Define Aliases—define an Alias for each entity in the hierarchy for which you want to define a Collection operator-based rule. In this example, we want to calculate the sum of cargo weights for each FlightPlan, so we assign an Alias named load to the Cargo branch under FlightPlan:

    <img src="../../../.gitbook/assets/image (89).png" alt="" data-size="original">
3. Use a Collection operator in a rule—you can see the entire list of Collection operators by expanding the Entity/Association Operators > Collection folder in the Rule Operators view.&#x20;

![](<../../../.gitbook/assets/image (49).png>)

### Example: How to use the sum operator

The sum operator is used at the end of a condition or action expression. It enables you to calculate the total of values of one attribute across all elements of the Collection.

![](<../../../.gitbook/assets/image (124).png>)

Observe that in this example, an attribute, totalWeight, has been added to the FlightPlan entity. The purpose of the totalWeight attribute is to hold the value of the sum of all cargo weights assigned to the flight plan.

The rule has just one action expression, FlightPlan.totalWeight=load.weight->sum. Notice that load is the Alias for the cargo association in FlightPlan. The ->sum operator can be dragged and dropped from the Rule Operator view or entered manually.&#x20;

So, what does this rule do? The rule calculates the sum of the weight attributes for all elements in the load Collection for each FlightPlan and assigns the total to the totalWeight attribute for the FlightPlan.&#x20;

![](<../../../.gitbook/assets/image (72).png>)

As you can see, in the results of the Ruletest, the totalWeight attribute of each FlightPlan displays the sum of the weight attributes of only those Cargo instances associated with it. The top-level Cargo entity instances are not included in any of these calculations.

### Example: How to use the exists operator

The exists operator enables you to check if a certain value for a specified attribute exists within a Collection.

![](<../../../.gitbook/assets/image (110).png>)

The syntax for the exists operator is as follows:

```
<AliasName> ->exists(Alias.attribute<ComparisonOperator>value).
```

In this example, there is one rule with a single condition expression. The rule checks if any of the elements in a load Collection holds the value “overweight” for the attribute named container. If the condition expression is true, a Violation rule message is generated.&#x20;

If the condition expression is false, an Info rule message is generated. Observe that in the Scope pane, load has been defined as the Alias for the Cargo association in FlightPlan. So the condition expression is `load->exists(load.container=‘overweight’).`

When this rule is executed against test data in the Ruletest, Corticon detects the “overweight” value in the first cargo instance and the Violation rule message is generated.

![](<../../../.gitbook/assets/image (84).png>)

{% embed url="https://www.youtube.com/watch?v=QvUfiDy6424" %}

### Example: How to use the forAll operator

The forAll operator enables you to check if an attribute has a specific value, across all the elements of a Collection.

![](<../../../.gitbook/assets/image (34).png>)

The syntax of the forAll operator is:

```
<Alias> -> forAll (Alias.attribute<ComparisonOperator>value).

```

In this example, there is one rule with a single condition expression. The rule checks if the manifest number for each cargo container assigned to a flight plan matches the flight plan number. If the condition expression is true, an Info rule message is generated.

If the condition expression is false, a Violation rule message is generated. Again, in the Scope pane, load has been defined as the Alias for the Cargo association in FlightPlan. Additionally, since FlightPlan will also be used in the expression, plan has been defined as the Alias for FlightPlan.&#x20;

So the expression is `load->forAll(load.manifestNumber=plan.flightNumber).`&#x20;

But you will find that this is an invalid expression. Why? The flightNumber is an integer and the manifestNumber is not really a “number”, it is a String. For the purposes of this example, change the flightNumber data type to String.

![](<../../../.gitbook/assets/image (28).png>)

In the Input data in the Ruletest, there are two FlightPlan instances. In the first instance, all the associated cargo instances have the same manifest number as the flight number. In the second FlightPlan instance one of the cargo instances has a different manifest number. The rule messages indicate that one Info message and one Violation message is generated.
