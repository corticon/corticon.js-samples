# Rulesheets

### Parts of a Rulesheet

**Rulesheets** are like Decision Tables. Users 'model' the business rules, where the rule is like an ‘if-then’ statement. Each rule consists of one or more conditions (if) that are associated with one or more actions (then).&#x20;

Here is an example of a Rulesheet with three rules. The Rulesheet editor has the following parts:

* **Conditions**—where you define the conditions for each rule. For example, `Aircraft.aircraftType` = 747. The condition value could be a single value (747), a set of values (747, 777, 787), or a range of values (weight=100000..200000).&#x20;
* **Actions**—where you define the actions that need to be triggered when the conditions are satisfied. For example, `Aircraft.maxCargoWeight`=150000.&#x20;
* **Rule columns**—the highlighted columns in this image. Each column represents a rule. It associates a set of conditions with a set of actions. For example, column 1 defines the rule—if the aircraft is a 747, then its maximum cargo weight is 150,000.&#x20;

![](<../../../.gitbook/assets/image (62).png>)

The terms `Aircraft.aircraftType` and `Aircraft.maxCargoWeight` come from the Rule Vocabulary. Each Rulesheet must be linked to a Rule Vocabulary.&#x20;

Corticon evaluates all the conditions in each rule. If all the conditions in the rule are satisfied, the actions in the rule are triggered. _Note: If an action does not execute for some reason, Corticon still tries to execute the other actions in the rule._

### **Rule Statements**

Each rule is documented with **Rule Statements**. Rule Statements will be sent along with the new/changed data resulting from the rules in the response from Corticon back to the calling application. Rule statements will only be sent back to the calling application if that rule was triggered as part of that decision's execution.

Note that you can define multiple rule statements for a single rule. For example, one rule statement can document the rule, while another is sent as part of the output message when the rule fires

### Rule Operators

When you use your Vocabulary to build rules, you also make use of rule operators such as =, <, and >. Corticon Studio provides a rich set of predefined rule operators in the Rule Operators view. By default, this view is located at the bottom-left of the Corticon Designer perspective.&#x20;

The Rule Operators view organizes operators into folders based on their function and purpose. For example, the Attribute Operators folder contains subfolders for different data types. The folder for each data type contains rule operators that you can use when defining rules that use attributes of that data type.

You can learn about each rule operator in the Rule Operators view by hovering the mouse pointer over it. A tooltip appears, describing the rule operator, as shown in this image. The Rule Language Guide in the documentation set provides details of all rule operators available in Corticon Studio.

![](<../../../.gitbook/assets/image (78).png>)

**Logical Integrity Checks**

Rulesheets also provide rule modelers with multiple click-of-a-button **Logical Integrity Checks** which identify incompleteness, conflict between rules, and infinite loops. For example, the rule completeness check on the below rule sheet reveals scenarios which are plausible based upon the rules we have thus far. In a real world scenario, we might want to define actions for each of these plausible sets of conditions.&#x20;

![](../../../.gitbook/assets/comp.png)

### Video:

{% tabs %}
{% tab title=" Introduction to rule modeling" %}
{% embed url="https://www.youtube.com/watch?v=YWoMkYPJyCc" %}


{% endtab %}

{% tab title="Creating and Testing a Rule" %}
{% embed url="https://www.youtube.com/watch?v=ympTJ1GUHoA&list=PLYNw760GOr2BIxRuUKMkiJEJjm2wnUtU7&index=2" %}


{% endtab %}

{% tab title="Rulesheets and Logical Integrity Checks" %}
{% embed url="https://www.youtube.com/watch?v=Lt3g-YTCIq4&list=PLC679RvCan2CoOLaYQzUEriM3WS-UFQ5N&index=11&t=34s" %}
{% endtab %}

{% tab title=" Revealing Rule Problems" %}
{% embed url="https://www.youtube.com/watch?v=KYel_behP1U&list=PLYNw760GOr2BIxRuUKMkiJEJjm2wnUtU7&index=7" %}


{% endtab %}

{% tab title="Scope and aliases in a Rulesheet" %}
{% embed url="https://www.youtube.com/watch?v=w3FM04jtmPs&list=PLYNw760GOr2BIxRuUKMkiJEJjm2wnUtU7&index=4" %}


{% endtab %}
{% endtabs %}

To learn more, see [Rulesheet sections](https://docs.progress.com/bundle/corticon-quick-reference/page/Rulesheet-sections.html) on Corticon Information Hub.
