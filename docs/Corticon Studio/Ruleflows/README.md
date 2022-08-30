# Ruleflows

### Building a Ruleflow

From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a **Ruleflow** to specify the sequence from one rulesheet to another. When multiple Rulesheets are included in a Ruleflow, the Rulesheets will execute in a sequence determined by their Rulesheet order in the Ruleflow. With ruleflows, behavior like branching into separate rules for different scenarios can be defined and specify when the execution of a given Decision Service call that Corticon should retrieve additional data from external datasources.

![](<../../../.gitbook/assets/image (58).png>)

As more rulesheets are added to our Ruleflow, Ruletests can be run against entire Ruleflows, instead of testing only the Rulesheets as they are developed. This enables you to test not only the rules as they are defined in the Rulesheet, but also how the Ruleflow works, and how the rules behave as part of the Ruleflow. This way, problems can be detected and fixed earlier in the lifecycle.

![](<../../../.gitbook/assets/image (90).png>)

### Ruleflow Properties

Ruleflows are the final step in the rule development process and are thus deployed as Decision Services. Ruleflows can always be versioned as well, with either a major/minor version tag or effective date range for which they will execute when invoked. The invocation (request) payload must contain a version number or data parameter to consume the desired "versioned" decision service.

![](<../../../.gitbook/assets/image (103).png>)

### Test Ruleflows using Ruletests

You can test a Ruleflow using a Ruletest just as you use it to test a Rulesheet. When you test a Ruleflow in a Ruletest, the input data that you define is processed by the first Rulesheet in the Ruleflow’s sequence. After the first Rulesheet completes executing, its output becomes the input to the next Rulesheet in the sequence, and so on, until the last Rulesheet completes executing.&#x20;

The Output pane then displays the final output of the Ruleflow. The Rule Messages view displays all rule messages that are created as a result of rules firing in each Rulesheet.&#x20;

To test a Ruleflow using a Ruletest, you must select the Ruleflow as the Ruletest’s test subject either while creating the Ruletest or by modifying the Test Subject property in the Ruletest editor.

![](<../../../.gitbook/assets/image (13).png>)

### Advanced Ruleflow features

* **Nested Ruleflows**—you can reduce the complexity of large Ruleflows by breaking them into smaller, ‘child’ Ruleflows and adding them to the parent Ruleflow, referred to as “a Ruleflow in a Ruleflow.”&#x20;
* **Conditional Branching**—you can create branches in a Ruleflow, where the value of an attribute determines which branch the data is routed to.&#x20;
* **Subflows**—you can configure an Iteration for a Subflow to enable looping behavior.&#x20;
* **Versioning**—you can assign Major and Minor Version number that the Server responds correctly to requests for the different versions.&#x20;
* **Effective Dates**—you can have identically named Ruleflows with slight variations that respond to requests only when in the specified date range.&#x20;
* **Service Call-outs**—you can access Datasources to enrich your rules, and update databases

### Watch and Learn

{% tabs %}
{% tab title="Ruleflow Branching " %}
{% embed url="https://www.youtube.com/watch?v=LEX7BJ8pI3Y&list=PLYNw760GOr2BIxRuUKMkiJEJjm2wnUtU7&index=9" %}


{% endtab %}

{% tab title="Nested Ruleflows" %}
{% embed url="https://www.youtube.com/watch?v=4V1wlU4j85k&list=PLYNw760GOr2BIxRuUKMkiJEJjm2wnUtU7&index=10" %}


{% endtab %}
{% endtabs %}

To learn more, see [Ruleflows ](https://docs.progress.com/bundle/corticon-quick-reference/page/Ruleflows.html)on Corticon Information Hub.
