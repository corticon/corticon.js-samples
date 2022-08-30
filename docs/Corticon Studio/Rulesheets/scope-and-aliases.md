# Scope and Aliases

Every rule has Scope. Scope determines which entity instances are evaluated and acted upon by a rule. Recall that when you create an association between two entities, a branch gets added under each entity. In this example, an association was created between `Aircraft` and `FlightPlan`. As you can see, a branch for `FlightPlan` appears under `Aircraft` and a branch for `Aircraft` appears under `FlightPlan`.

So both `Aircraft` and `FlightPlan` appear in two places—at a top level and at a branch level.

![](<../../../.gitbook/assets/image (95).png>)

Notice that the attributes of each entity also appear in two places. When you drag and drop one of the attributes, such as `maxCargoWeight`, from the top-level `Aircraft` on to a cell in the Rulesheet, you form the term `Aircraft.maxCargoWeight`. If you use this term in a rule, it applies to ALL instances of the Aircraft entity in the rule’s input or output messages. This rule has global scope.&#x20;

If you drag and drop the `maxCargoWeight` attribute from the branch level `Aircraft` (under `FlightPlan`), you form the term `FlightPlan.aircraft.maxCargoWeight`. If you use this term in a rule, it applies ONLY to those instances of `Aircraft` that are associated with a `FlightPlan` in the rule’s input or output messages. Aircraft that are not associated with a `FlightPlan` will not be evaluated or acted upon by the rule. This rule has narrow or limited scope.&#x20;

Whether you use a term from a top level or a branch level entity depends on the scope of the rule that you want to model.

### Example of rule scope

Let’s assume that the transportation company creates a flight plan. It assigns a cargo container and an aircraft to the flight plan and wants to model a rule that throws a Violation message if the cargo weight exceeds the maximum cargo weight of the aircraft assigned to that flight plan.

![](<../../../.gitbook/assets/image (86).png>)

To achieve this, you define a rule that uses `FlightPlan`’s associations with `Cargo` and with `Aircraft`. You define a condition that compares `Cargo.weight` under `FlightPlan` in the Rule Vocabulary with `Aircraft.maxCargoWeight`, also under `FlightPlan`. When you drag and drop these terms from under `FlightPlan` in the Rule Vocabulary, the terms get represented as shown above.

To test this Rulesheet, you must define input data in the Ruletest in the same hierarchical structure. You must drag and drop FlightPslan from its top level first. Then, you drag and drop Cargo and Aircraft from their branch levels to FlightPlan in the Input pane.

![](<../../../.gitbook/assets/image (104).png>)

When you run the Ruletest, Corticon evaluates only those Cargo-Aircraft pairings that match the same `FlightPlan`. This means that a `Cargo.weight` will only be compared to an `Aircraft.maxCargoWeight` if both the `Cargo` and the `Aircraft` share the same `FlightPlan`.&#x20;

If you had used `Aircraft.maxCargoWeight` and `Cargo.weight` from the top level in the Vocabulary tree to define your rule (`Cargo.weight > Aircraft.maxCargoWeight`), Corticon would have compared every Cargo weight with every `Aircraft.maxCargoWeight`, which is not what you want.&#x20;

When you model rules, it is important to understand what you want your rules to do and define scope accordingly.

### How to choose the right Scope in the Rule Statement

Now that you have some understanding of Scope in rules, let’s look at how to choose the right Scope in a Rule Statement.&#x20;

As you know, a Rule Statement describes the purpose of a rule and can also be posted as a Rule Message. When you configure it to be posted as a Rule Message, you choose an entity to post it to in the Alias column. What this means is that when the Rule Message is sent or displayed, it is associated with an instance of that entity. For example, if you choose FlightPlan, the rule message contains the entity name (FlightPlan) along with the instance ID (FlightPlan\[1], FlightPlan\[2], etc) as shown in this example:

![](<../../../.gitbook/assets/image (132).png>)

![](<../../../.gitbook/assets/image (25).png>)

This helps a client application that is invoking the rule, or a rule modeler who is testing the rule, know which entity instance is responsible for triggering which rule. In some cases, choosing the right entity in the Alias column of a Rule Statement is intuitive. In the FlightPlan.cargo.weight > FlightPlan.aircraft.maxCargoWeight example, you would choose FlightPlan in the Alias column, because you want to know which FlightPlan instance triggered the rule. However, in cases where you are comparing the attributes of two root-level entities, (for example if Cargo.weight > Aircraft.maxCargoWeight), it may be unclear which entity to use in the Alias column. In these cases, you should pick whichever entity you are more interested in from a business point-of-view.

### The Scope Pane

So far, you have modeled simple rules with a small Vocabulary where Scope is easy to identify. However, when you model rules using a complex Vocabulary with many terms and associations, you may find that it is easier to first determine which entities (top level or branch level) and attributes you want to use in your Rulesheet and preselect them for rule modeling.&#x20;

To do this, you use the Scope pane. To open the Scope pane, switch the Rulesheet to an Advanced View by selecting Rulesheet > Advanced View. You can then drag and drop just those top-level and branch-level terms that you want to use in your Rulesheet from the Rule Vocabulary view. You can then drag and drop terms from the Scope pane to Rulesheet cells.

![](<../../../.gitbook/assets/image (106).png>)

### Aliases

An Alias is a name you define for an entity in the Scope pane. Aliases help reduce the length of terms in Rulesheet cells and make it easier to read the rules. You can define an Alias for a top-level or branch-level entity by double-clicking the node in the Scope pane and entering the Alias name as shown in this example.

![](<../../../.gitbook/assets/image (65).png>)

For example, if you want to compare cargo weight and aircraft maxCargoWeight for a FlightPlan, you could define the Alias plane for aircraft under FlightPlan and the Alias load to cargo as shown in this example. The comparison expression in the Rulesheet cell changes from FlightPlan.cargo.weight > FlightPlan.aircraft.maxCargoWeight to load.weight > plane.maxCargoWeight. Although the length of the terms reduce, the Scope of the rule remains the same.&#x20;

When you define an Alias in the Scope pane, the Alias name replaces the entity name in the list of choices in the Rule Statement’s Alias column. For example, instead of FlightPlan.aircraft, the Alias column will display plane when you click on one of its cells.&#x20;

In some cases, such as in Collections, Aliases are mandatory. You will learn more about Collections in the next lesson in this course.
