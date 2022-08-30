# Ruletests

### Ruletests Overview

A Ruletest simulates a business scenario where the rules are applied to input data. If the data satisfies all the conditions in a rule, the rule fires and some output containing the results of the rule execution is produced.&#x20;

You can define different sets of input data to test how the rules behave in different scenarios. You can also use a Ruletest to compare the output of a rule execution with expected results.

A Ruletest stores this information in a Ruletest file, enabling you to save use-cases that are of interest, change rules, and run the test again to see how the modified rules behave when applied to the same use-cases.

Take a close look at the images. Here is an example of a Rulesheet (`AircraftRules.ers`) with two rules and a Ruletest (`TestingAircraftRules.ert`) that has been executed.

{% tabs %}
{% tab title="Rulesheet" %}
![](<../../.gitbook/assets/image (81).png>)
{% endtab %}

{% tab title="Ruletest" %}
![](<../../.gitbook/assets/image (111).png>)
{% endtab %}
{% endtabs %}

### The Ruletest editor&#x20;

The Rulesheet has rules that define a value for `Aircraft.maxCargoWeight` based on the value of `Aircraft.aircraftType` received in input data.

The Ruletest tests the Rulesheet. The Ruletest editor has four parts:&#x20;

* **Test Subject**—specifies which Rulesheet or Ruleflow is being tested (in this case `AircraftRules.ers`).&#x20;
* **Input**—where you define input data to be processed by the rules in the Rulesheet. In this example, there are two instances of the Aircraft entity with different values for `Aircraft.aircraftType`.&#x20;
* **Output**—where Corticon Studio displays the result of a Ruletest execution. As you can see, a value for `Aircraft.maxCargoWeight` has been assigned based on the rules in the AircraftRules.ers Rulesheet.&#x20;
* **Expected**—where you can optionally define the result that you expect.

![](<../../.gitbook/assets/image (59).png>)

### When you run a Ruletest

1. &#x20;Input data is processed by the rules in the Rulesheet.&#x20;
2. If the input data satisfies all the conditions in one or more rules, those rules fire. The Ruletest then displays output that could include the same data as the input but with changed values, and/or additional data and values.&#x20;
3. If the input data does not trigger any rules, the Ruletest displays the unchanged input data as the output.&#x20;
4. f you specify expected results for a test, the Ruletest automatically compares the output with the expected results and displays any differences through color-coding

The Ruletest reproduces how the rules will behave once deployed as a decision service. At runtime, decision service invocations can take different formats such as XML, JSON, Java, or .NET objects.&#x20;

A fully formatted sample request in each form can be exported from the ruletest. This provides visibility to the data structure that Corticon expects and can also be copied into third party testing applications such as Postman, Insomnia, or SoapUI as test message parameters.

![](https://raw.githubusercontent.com/corticon/Corticon\_Enablement/master/assets/images/toclip.png)

### How to link a rule statement to multiple rules

![](<../../.gitbook/assets/image (87).png>)

Using dynamic data, you can create a single rule statement that describes multiple rules. You can then link the rule statement to each of the rules. When any of the rules fire, attribute names will be replaced by actual values in the rule message.&#x20;

For example, suppose you have three rules, as shown in this image. Each of these rules specifies the maximum cargo weight for a certain type of aircraft. A single rule statement that embeds the aircraft tail number, the aircraft type, and the maximum cargo weight, can be used to cover all three rules.&#x20;

### Watch and Learn

{% embed url="https://www.youtube.com/watch?v=ympTJ1GUHoA&list=PLYNw760GOr2BIxRuUKMkiJEJjm2wnUtU7&index=2" %}



To learn more, see [Ruletests ](ruletests.md)on Corticon Information Hub.
