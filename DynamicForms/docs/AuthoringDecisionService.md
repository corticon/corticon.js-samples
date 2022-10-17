# Authorign the Rules in Corticon.js Studio

Corticon Studio is a standalone desktop environment to model, analyze, test, and save business rules as executable decision services. Corticon ‘rule modelers’ are commonly business analysts with expertise in the business domain and its policies, using Corticon Studio to define, author, analyze and test rules.

Once satisfied, rules are then deployed as Decision Services onto Corticon Server or as serverless functions with Corticon.js.

There are four key steps of building rules in Corticon Studio, culminating as a RuleFlow to deploy as a Decision Service.

1. The first step of the rule modeling process with Corticon is to build the 'dictionary' of business terms used throughout the rules, the **Rule Vocabulary**.
2. **Rulesheets** are like Decision Tables. Users ‘model’ the business rules by defining actions to take when specific conditions are met.
3. Once the rules created in the rulesheet are satisfied, the first **Ruletest** in Corticon Studio can be created to run test data through the rules in the test server embedded in the local application.
4. From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a  **Ruleflow** to specify the sequence from one rulesheet to another. When multiple Rulesheets are included in a Ruleflow, the Rulesheets will execute in a sequence determined by their Rulesheet order in the Ruleflow.



# Rule Vocabulary

<img align="right" width="300"  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples@latest/DynamicForms/docs/images/JS%20vocabulary.png"
 title="Rule Vocabulary">

Typically, a client side component is written and maintained by a developer  while the form's rule-driven logic is written by business analysts who  best understand the subject domain of the form.

The communication between the rule author and front end developer, as well as between the actual artifacts they each produce, is facilitated by a well documented schema for the JSON to exchange IN and OUT.

Corticon business rules are authored in **Corticon.js Studio**, with the backbone of the rules we create being the *Rule Vocabulary*. This will serve as the data model to capture both the  that will define aspects of:

- The user interface (UI), such as which questions to pose to the end user at what stage in the form being filled, and what type of input should be allowed for these questions

- The data needed for the actual decision at hand, which will be captured as a form response and sent along to a downstream application, decision service or system of record

# Authoring the Rules

Corticon provides domain experts with the tools to define the parts of software guided by complex rules, without needing to be programmers.

Logic is authored and tested in Corticon Studio through Rule Modeling in a spreadsheet decision-table interface called *Rulesheets*.  A rule is like an ‘if-then’ statement. Each rule consists of one or more conditions (if) that are associated with one or more actions (then).

<p>
  <img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples/DynamicForms/docs/images/rulesheet%20overview.png" title="rulesheet  overview" >
</p>

# Testing the Rules

A *Ruletest* simulates a business scenario where the rules are applied to input data. If the data satisfies all the conditions in a rule, the rule fires and some output containing the results of the rule execution is produced.

You can define different sets of input data to test how the rules behave in different scenarios. You can also use a Ruletest to compare the output of a rule execution with expected results. A Ruletest stores this information in a Ruletest file, enabling you to save use-cases that are of interest, change rules, and run the test again to see how the modified rules behave when applied to the same use-cases.

Ruletests reproduce how the rules will behave once deployed as a decision service.

# Organizing the Rules

From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a Ruleflow to specify the sequence from one rulesheet to another.

As more rulesheets are added to our Ruleflow, Ruletests can be run against entire Ruleflows, instead of testing only the Rulesheets as they are developed. This enables you to test not only the rules as they are defined in the Rulesheet, but also how the Ruleflow works, and how the rules behave as part of the Ruleflow. This way, problems can be detected and fixed earlier in the lifecycle.

<p align="center">
  <img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples/DynamicForms/docs/images/ruleflowBreakdown.png" title="ruleflow overview">
</p>


# Modeling Dynamic Form Rules in Corticon.js Studio

## What the Client Side Component needs from the rules

The decision service informs the front end UI each and every prompt to present to the user, throughout the form. It likewise may define whether to execute a decision/computation in the background before moving on to subsequent stages.

The content presented in the form at a given point can define different paths depending upon
 * Previously entered data data entry to make decisions. For example, the form may branch to a different step, or specify different UI controls
 * The output of decisions and computations performed between steps
 * Data already known about the end user, for example data populated from an external CRM system

There are certain rules which are useful to implement only at the start or end of the form. For example, telling the CSC where to store the accrued form data, and telling the CSC when the form is complete.

## Unique Considerations when Building Rules for Dynamic Forms Rules

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

The main functions of the rules throughout a form's ruleflow, from which the Decision Service will be generated, are to define:

1.  The sequence of the questions (What prompt is presented when and base upon what).
2.  For each step, either:

	- What user prompt to render (e.g. dropdown, true/false, number, etc). Henceforth, we refer to these user prompts as **UI Controls**.
	- Execute some business logic or computation that doesn't involve presenting anything to the user (e.g. add together dollar amount of all expenses being submitted)
3. Which data should be retained and accrued to pass along upon form completion, versus which data is only relevant ephemerally (e.g., assigning data related to a claim to be retained, while assigning the response to '_Do you have more claims to submit_?' to be discarded.

## Orchestrating a Form's Sequence

The front end UI (CSC) does not know the questions to be asked at each step nor what the answers mean, but it knows how to render these questions and collect the answers.

The decision service does not know the current state of the questionnaire but knows what to do at each **Stage.** All of the logic applicable to a question and its answer are tied together which a unique identifier, the stage number.

A Stage may encompass one or more **[Rulesheets](https://corticon.github.io/corticon.js-samples/#/Rules/README?id=authoring-the-rules)**.

 When building dynamic forms, the rulesheets typically specify:
1. Current stage number
2. If presenting anything to the end user at this step, a  **Container** to host the UI controls is created.
3. Within a container, 1 or more UI controls are created (e.g. text input, numeric input, checkbox, or multiple choice dropdown list.)
4. What the next stage is

<img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples@latest/docs/assets/uiContainerAndControls.jpg"
 title="uiContainerAndControls">

Once all rulesheets in the ruleflow have been arranged and [tested](https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms#testing-the-rules), the ruleflow is deployed as a JavaScript Decision Service bundle--a single file called `decisionServiceBundle.js`.

## Accruing and Using Form Response Data

By default, response data is stored in an entity assigned to be the pathToData, using the attribute `UI.pathToData` .

For example, if we're building auto insurance form, when we're collecting information about the Vehicle, we might assign the 'vehicle' entity to be the vocabulary entity / JSON object within which the accrued data will be stored:

<img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples@latest/docs/assets/pathtodata.PNG"
 title="path to data">

If we start by just collecting the end user's responses for year/make/model of a vehicle, the accrued data would look something like:

```
    {
      "vehicle": {
        "year": 2020,
        "make": "Mazda",
        "model": "Cx-3 4Dr Awd"
      }
    }
```
## Executing Steps with No UI to Render

Sometimes the Decision Service needs to execute a stage with no associated UI to rende. For example, the Decision Service might need to execute business logic and then move to next step.

This is implemented by the Decision Service in the attribute `UI.noUiToRenderContinue` (a boolean).

## Validations
There are 2 kinds of validations:

1. Those which are defined directly in UI control itself,  and can thus be directly enforced by the CSC. For this validation, the CSC does not need to call the Decision Service for validation. It can enforce the validation directly based on various attributes sets on the UIControl and the type of UIControl. For examples, we may set an input field as required or we may want a number field where the valid data is between 1 and 20. These are specified in the Decision Service model using the `UIControl.required`, `UIControl.min`, and `UIControl.max` attributes respectively:

`
UI.containers.uiControls += UIControl.new[type='Number', min=1, max=200, label='Number 1', id='number1 Id', fieldName='number1']
`

2) The second kind is validation that can only be enforced by the Decision Service (remember the Client Side Component is generic, while the Decision Service is use case specific). The Decision Service can implement simple to very complex business rules to infer that some answers may not be valid using all the data available to it (That is data from previously entered user inputs, external data and initial data). And that validation may be conditional to various paths or various conditions. For example, validating that a claim cannot exceed some amount because the sum of all current claim exceeds the maximum for the month.
