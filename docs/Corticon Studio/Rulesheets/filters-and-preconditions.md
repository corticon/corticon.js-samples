# Filters and Preconditions

### What is a Filter?

A Filter is an expression that filters out data in an incoming request message. Filters only apply to rules that share the same Scope—only data that survives the Filter is evaluated by those rules. Filters do not apply to rules that have a different Scope. Filters are evaluated before rules in a Rulesheet.&#x20;

You specify a Filter in the Advanced View of a Rulesheet. Here is an example of a simple Filter:

![](<../../../.gitbook/assets/image (31).png>)

The Rulesheet solves the problem that was introduced in the beginning of this lesson. The expression in the Conditions area compares the maxCargoWeight of each Aircraft with the sum of cargo weight (denoted by the Alias load) of each FlightPlan. Note the Filters section to the left of the Rulesheet (under the Scope pane). The Filter expression checks if the value of Aircraft.isAircraftReady is True for each instance of Aircraft in input data.&#x20;

Imagine input data containing multiple Aircraft instances and multiple FlightPlan instances, each with a set of Cargo children. Some Aircraft instances have the isAircraftReady attribute set to False and some have it set to True. Only those Aircraft instances that have the attribute to True survive the Filter and are processed by the rule.

### How is a Filter useful?

A Filter is useful in many ways:&#x20;

* It reduces repetition and is easier to maintain. For example, in this Rulesheet we define the expression Cargo.needsRefrigeration=T over several columns:

![](<../../../.gitbook/assets/image (99).png>)

If we used a Filter instead, we could define Cargo.needsRefrigeration=T as a Filter expression just once and it would apply to all the rules in this Rulesheet (since in this case the rules share the same Scope).

* You can make a Filter a Precondition. When you do this, if no data survives the Filter, the Rulesheet stops executing, and the flow of execution skips to the next Rulesheet in the Ruleflow. This improves performance because the Decision Service does not spend time processing rules that it does not need to process.
* You can use Filters to partition elements of a Collection into sub-collections. For example, suppose you have a FlightPlan with a Collection of Cargo instances and each Cargo instance has a different type of container. You could create Filters to partition the elements in the FlightPlan’s Cargo Collection by container type and define rules to determine how many instances of each type of container are assigned to the FlightPlan.

### How to define a Filter

To define a Filter, open the Rulesheet’s Advanced View and define the Filter in the Filters pane. You can drag and drop entities and attributes from the Rule Vocabulary to cells in the Filters pane or enter the expression manually. When you define a Filter, the Filter is also displayed in the Scope pane.

![](<../../../.gitbook/assets/image (80).png>)

You can define multiple Filters (each in a separate row) that have the same Scope. In this case, input data must survive all the Filters (sequentially top-to-bottom) for any rule with the same Scope to process it.

### How to limit a Filter

Note that when you define a Filter at the branch or ‘child’ level (for example FlightPlan.cargo.weight<100000), the Filter is displayed in two places in the Scope pane—at the parent level (under FlightPlan) as well as under the branch/child level (FlightPlan.cargo).&#x20;

By default, if no child entity survives the Filter, the parent entity is filtered out as well. Any rule that processes an attribute of the parent entity or any other child branches of the parent entity will not fire since the parent entity has been filtered out.&#x20;

This type of behavior is called a Full Filter. A Full Filter is desirable in most cases. However, in some situations you may want to limit the Filter so that rules that process other branches of the parent entity or attributes of the parent entity will still fire.&#x20;

To limit the Filter, expand the Filters node under the parent entity (in this case FlightPlan) in the Scope pane, right-click the Filter and select Disable.

![](<../../../.gitbook/assets/image (24).png>)

This disables the Filter at the parent level (it gets greyed out as shown here) but still keeps it enabled at the child level.&#x20;

![](<../../../.gitbook/assets/image (61).png>)

Because the Filter is enabled at the child level for the load entity, any rule that uses the load entity will only process those elements of load that survive the Filter. Any other rules that process attributes of the parent entity (FlightPlan) or other branches of the parent entity (plane, pilot) will ignore the Filter.

### How to use Filters to partition Collections

As you learned earlier, you can use Filters to partition Collections of child entities. To do this, you:&#x20;

1. Drag and drop the child entity’s branch to the Scope pane multiple times&#x20;
2. Assign an Alias for each branch to represent each Collection&#x20;
3. Create a Filter for each Alias&#x20;

For example, if there are two types of containers—STANDARD and LARGE—you can use Filters to count how many of each type of container is assigned to a FlightPlan:

![](<../../../.gitbook/assets/image (100).png>)

As you can see, the Cargo branch of FlightPlan has been added to FlightPlan two times. Each branch has been assigned a different Alias (stan and large) to represent the two types of sub-collections we want (STANDARD and LARGE). Finally, each Filter defines which instances of Cargo get added to which sub-collection. Cargo instances that have the value STANDARD (for the container attribute) get added to stan, as defined by the expression stan.container=‘STANDARD’. Similarly Cargo instances that have the value LARGE get added to large.

Once you define Filters to create sub-collections, you can use the Aliases in rules to compare sub-collections or perform Collection-based operations. For example, you could create a rule to check which type of container is greater in number using the ->size operator as shown here:

![](<../../../.gitbook/assets/image (20).png>)

![](<../../../.gitbook/assets/image (40).png>)

### Preconditions

You can make a Filter a Precondition. If no data survives the Precondition Filter, none of the rules will execute, regardless of whether the Scope of the rules match the Scope of the Filter. This is useful when the Rulesheet is part of a Ruleflow, and you want the Rulesheet to stop executing if no data survives the Filter, and pass the data to the next Rulesheet. This improves performance since the Decision Service does not spend time processing rules that it does not need to process.&#x20;

Let’s take an example. Suppose that we want to identify Cargo instances that have high priority so that we can ship them the same day. To enable this, we add an attribute named priorityLevel to the Cargo entity and an attribute named departureDate to the FlightPlan entity. Next, we create a Rulesheet with the following components:

* A Filter containing the expression: Cargo.priorityLevel=1&#x20;
* An action-only rule that uses the .new operator to create a new FlightPlan entity: FlightPlan.new\[flightNumber=11,departureDate=today]&#x20;

Note that if there are no containers with a priorityLevel of 1, we do not want the rule to fire. However, since this is an action-only rule, and it does not have the same Scope as the Filter, it will still fire. To get the result we want, we can make the Filter a Precondition by right-clicking the Filter and selecting Precondition:

![](<../../../.gitbook/assets/image (26).png>)

The Filter icon changes as shown below, indicating that the Filter is a Precondition:

![](<../../../.gitbook/assets/image (123).png>)

Here is the complete Rulesheet:

![](<../../../.gitbook/assets/image (17).png>)

Now let’s test the Rulesheet with input data containing a Cargo instance that survives the Filter. As you can see here, a new FlightPlan is created:

![](<../../../.gitbook/assets/image (9).png>)

Let’s test this Rulesheet again with data where no Cargo instances survive the Filter:

![](<../../../.gitbook/assets/image (74).png>)

As you can see, no FlightPlan is created.
