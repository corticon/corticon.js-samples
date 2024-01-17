# Defining Form Behavioral Logic in Corticon.js Studio

Corticon Studio is a standalone desktop environment to model, analyze, test, and save business rules as executable decision services. Corticon 'rule modelers' are commonly business analysts with expertise in the business domain and its policies, using Corticon Studio to define, author, analyze and test rules.

Once satisfied, rules are then deployed as Decision Services onto Corticon Server or as serverless functions with Corticon.js.

This tutorial is focused on skills related to building dynamic forms with Corticon.js. If you're unfamiliar with Corticon but only interested in the dynamic forms use case, below is a brief overview of the core components involved in modeling Corticon business rules. These are just as important to know when building dynamic forms to gather form response data as they are for automating decisions based upon that data.

There are four main steps of building rules in Corticon Studio, culminating in the RuleFlow which will be deployed as a Decision Service.

1.  The first step of the rule modeling process with Corticon is to build the 'dictionary' of business terms used throughout the rules, the **Rule Vocabulary**.
2.  **Rulesheets** are like Decision Tables. Users 'model' the business rules by defining actions to take when specific conditions are met.
3.  Once the rules created in the rulesheet are satisfied, the first **Ruletest** in Corticon Studio can be created to run test data through the rules in the test server embedded in the local application.
4.  From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a **Ruleflow** to specify the sequence from one rulesheet to another. When multiple Rulesheets are included in a Ruleflow, the Rulesheets will execute in a sequence determined by their Rulesheet order in the Ruleflow.

## Building the Rule Vocabulary 

Typically, a client side component is written and maintained by a developer  while the form's rule-driven logic is written by business analysts who  best understand the subject domain of the form.

The communication between the rule author and front end developer, as well as between the actual artifacts they each produce, is facilitated by a well documented schema for the JSON to exchange IN and OUT.

Corticon business rules are authored in **Corticon.js Studio**, with the backbone of the rules we create being the *Rule Vocabulary*. This will serve as the data model to capture both the  that will define aspects of:
- The user interface (UI), such as which questions to pose to the end user at what stage in the form being filled, and what type of input should be allowed for these questions
- The data needed for the actual decision at hand, which will be captured as a form response and sent along to a downstream application, decision service or system of record

Note that the vocabulary includes every data point involved in the decision/calculation. Some of this data may be passed into the Decision Service when it is called by another application, some of this data may be retrieved by Corticon from an external data source and some of this data may be produced as a result of the rules themselves.

The Client-Side Rendering components is preconfigured to 'know' how to render specific end user prompts based on Corticon.js rules, because it works with the same data model that underlies the rule vocabulary. These preconfigured fields are documented [here](<Using the Template Vocabulary.md>).

## Rulesheets

Rulesheets are like Decision Tables. Users 'model' the business rules, where the rule is like an ‘if-then’ statement. Each rule consists of one or more conditions (if) that are associated with one or more actions (then). 


## Ruletests

A Ruletest simulates a business scenario where the rules are applied to input data. If the data satisfies all the conditions in a rule, the rule fires and some output containing the results of the rule execution is produced.

You can define different sets of input data to test how the rules behave in different scenarios. You can also use a Ruletest to compare the output of a rule execution with expected results. A Ruletest stores this information in a Ruletest file, enabling you to save use-cases that are of interest, change rules, and run the test again to see how the modified rules behave when applied to the same use-cases. 

## Ruleflows

From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a Ruleflow to specify the sequence from one rulesheet to another.Ruleflows are both graphical (appearing similar to a flow diagram) and functional (they impact rule behavior, and are ultimately generated into a decision service).

![Ruleflow example](https://progress-be-prod.zoominsoftware.io/bundle/corticon-rule-modeling/page/gsa1430508228388.image?_LANG=enus)

When multiple Rulesheets are included in a Ruleflow, the Rulesheets will execute in a sequence determined by their Rulesheet order in the Ruleflow.

In a typical decision automation use case, rulesheets and ruleflows are 'connected' from one to another when constructing the top level ruleflow. Connections are the objects that connect or “stitch” assets and objects together to control their sequence of execution. 

If a connector is drawn from Rulesheet `sample1.ers` to `sample2.ers`, then when a deployed Ruleflow is invoked, it will execute the rules in `sample1.ers` first, followed by the rules in `sample2.ers`.

For dynamic forms however, instead of a decision that will always go through the same chronology during a single execution, dynamic forms require the ability to navigate throughout the objects in a ruleflow, such that different rules may fire at different times, depending upon dynamic variables. For example, the sequence may be determined based upon:

-   Data that the end user has entered to that point (e.g. to route to different parts of a ruleflow depending upon what type of claim a user has chosen to file)
-    Whether any data is pre-populated at the start of a ruleflow (e.g. leveraging account information specific to the end user as part of the decision for what gets presented in the form)

<table><tr>
<td> 
  <p align="center" style="padding: 10px">
    <img alt="Forwarding" src="https://user-images.githubusercontent.com/40301564/186739602-888ae2bc-9d55-4bc6-a3cf-527e3d7e47a7.PNG" width="554">
    <br>
    <em style="color: grey">Dynamic Form Ruleflow </em>
  </p> 
</td>
<td> 
  <p align="center">
    <img alt="Routing" src="https://user-images.githubusercontent.com/40301564/186739592-17ba7774-31ed-413f-81f4-991308728116.PNG" width="515">
    <br>
    <em style="color: grey">Typical, Connected Ruleflow</em>
  </p> 
</td>
</tr></table>

## What the Client Side Component needs from the rules

The decision service informs the front end UI each and every prompt to present to the user, throughout the form. It likewise may define whether to execute a decision/computation in the background before moving on to subsequent stages. 

The content presented in the form at a given point can define different paths depending upon
 * Previously entered data data entry to make decisions. For example, the form may branch to a different step, or specify different UI controls 
 * The output of decisions and computations performed between steps
 * Data already known about the end user, for example data populated from an external CRM system

There are certain rules which are useful to implement only at the start or end of the form. For example, telling the CSC where to store the accrued form data, and telling the CSC when the form is complete.

## Working with Corticon.js Studio file types to build Dynamic Forms

The main functions of the rules throughout a form's ruleflow, from which the Decision Service will be generated, are to define:

1.  The sequence of the questions (What prompt is presented when and base upon what).
2.  For each step, either:
  - What user prompt to render (e.g. dropdown, true/false, number, etc). Henceforth, we refer to these user prompts as **UI Controls**. 
	- Execute some business logic or computation that doesn't involve presenting anything to the user (e.g. add together dollar amount of all expenses being submitted)
3. Which data should be retained and accrued to pass along upon form completion, versus which data is only relevant ephemerally (e.g., assigning data related to a claim to be retained, while assigning the response to '_Do you have more claims to submit_?' to be discarded. 

