
### Rule Vocabulary

<img align="right" width="300"  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples@latest/DynamicForms/docs/images/JS%20vocabulary.png"
 title="Rule Vocabulary">

Typically, a client side component is written and maintained by a developer  while the form's rule-driven logic is written by business analysts who  best understand the subject domain of the form.

The communication between the rule author and front end developer, as well as between the actual artifacts they each produce, is facilitated by a well documented schema for the JSON to exchange IN and OUT.

Corticon business rules are authored in **Corticon.js Studio**, with the backbone of the rules we create being the *Rule Vocabulary*. This will serve as the data model to capture both the  that will define aspects of:

- The user interface (UI), such as which questions to pose to the end user at what stage in the form being filled, and what type of input should be allowed for these questions

- The data needed for the actual decision at hand, which will be captured as a form response and sent along to a downstream application, decision service or system of record

### Authoring the Rules

Corticon provides domain experts with the tools to define the parts of software guided by complex rules, without needing to be programmers.

Logic is authored and tested in Corticon Studio through Rule Modeling in a spreadsheet decision-table interface called *Rulesheets*.  A rule is like an ‘if-then’ statement. Each rule consists of one or more conditions (if) that are associated with one or more actions (then).

<p>
  <img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples/DynamicForms/docs/images/rulesheet%20overview.png" title="rulesheet  overview" >
</p>

### Testing the Rules

A *Ruletest* simulates a business scenario where the rules are applied to input data. If the data satisfies all the conditions in a rule, the rule fires and some output containing the results of the rule execution is produced.

You can define different sets of input data to test how the rules behave in different scenarios. You can also use a Ruletest to compare the output of a rule execution with expected results. A Ruletest stores this information in a Ruletest file, enabling you to save use-cases that are of interest, change rules, and run the test again to see how the modified rules behave when applied to the same use-cases.

Ruletests reproduce how the rules will behave once deployed as a decision service.

### Organizing the Rules

From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a Ruleflow to specify the sequence from one rulesheet to another.

As more rulesheets are added to our Ruleflow, Ruletests can be run against entire Ruleflows, instead of testing only the Rulesheets as they are developed. This enables you to test not only the rules as they are defined in the Rulesheet, but also how the Ruleflow works, and how the rules behave as part of the Ruleflow. This way, problems can be detected and fixed earlier in the lifecycle.

<p align="center">
  <img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples/DynamicForms/docs/images/ruleflowBreakdown.png" title="ruleflow overview">
</p>
