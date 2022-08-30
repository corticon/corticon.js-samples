# Defining the Rules 

- [Defining the Rules](#defining-the-rules)
  - [File types used in Corticon.js Studio for Building Dynamic Forms](#file-types-used-in-corticonjs-studio-for-building-dynamic-forms)
    - [Rule Vocabulary](#rule-vocabulary)
    - [Rulesheets](#rulesheets)
    - [Ruletests](#ruletests)
    - [Ruleflows](#ruleflows)
  - [Rules Driven Forms](#rules-driven-forms)
    - [What the Client Side Component needs from the rules](#what-the-client-side-component-needs-from-the-rules)
    - [Working with Corticon.js Studio file types to build Dynamic Forms](#working-with-corticonjs-studio-file-types-to-build-dynamic-forms)
    - [Defining a Form's Sequence of Events](#defining-a-forms-sequence-of-events)
    - [Capturing the Response Data](#capturing-the-response-data)
    - [Executing Steps with No UI to Render](#executing-steps-with-no-ui-to-render)
    - [Validations](#validations)
  

## File types used in Corticon.js Studio for Building Dynamic Forms

### Rule Vocabulary


The first step of the rule modeling process with Corticon is to build the 'dictionary' of business terms used throughout the rules, the Rule Vocabulary. 

For example, a transport company may have a rule that determines how much cargo each type of vehicle can carry. There are two key business terms used in this rule—cargo and vehicle. You could define these terms as entities in your Vocabulary. 

A Vocabulary is similar to a data model such as a (UML) model or an Entity-Relationship model. The terms for the Vocabulary could come from a number of sources—database tables, forms used in business operations, policy and procedure documents, etc. When you build a Vocabulary, you not only define the terms, you also define relationships between those terms. For example, a single vehicle can carry many cargo containers, implying a one-to-many relationship. You would define this as an association in your Vocabulary. The rule vocabulary can be created manually, or it can be auto generated based on a JSON schema or object.

Note that the vocabulary includes every data point involved in the decision/calculation. Some of this data may be passed into the Decision Service when it is called by another application, some of this data may be retrieved by Corticon from an external data source and some of this data may be produced as a result of the rules themselves.

### Rulesheets

Rulesheets are like Decision Tables. Users 'model' the business rules, where the rule is like an ‘if-then’ statement. Each rule consists of one or more conditions (if) that are associated with one or more actions (then). 
Here is an example of a Rulesheet with three rules.

![Rulesheet](https://files.gitbook.com/v0/b/gitbook-legacy-files/o/assets%2F-MX-6L60ogNliIiTS_7L%2F-MbMxC3TwMXx3YxmGQeh%2F-MbMxvPiOWy07klsoQ3B%2Fimage.png?alt=media&token=265a5d09-3c20-4d13-b3eb-4d7e40efbd5e)

 The Rulesheet editor has the following parts:
- Conditions—where you define the conditions for each rule. For example, Aircraft.aircraftType = 747. The condition value could be a single value (747), a set of values (747, 777, 787), or a range of values (weight=100000..200000). 
- Actions—where you define the actions that need to be triggered when the conditions are satisfied. For example, Aircraft.maxCargoWeight=150000. 
- Rule columns—the highlighted columns in this image. Each column represents a rule. It associates a set of conditions with a set of actions. For example, column 1 defines the rule—if the aircraft is a 747, then its maximum cargo weight is 150,000. 

### Ruletests

A Ruletest simulates a business scenario where the rules are applied to input data. If the data satisfies all the conditions in a rule, the rule fires and some output containing the results of the rule execution is produced.

 You can define different sets of input data to test how the rules behave in different scenarios. You can also use a Ruletest to compare the output of a rule execution with expected results.
 
  A Ruletest stores this information in a Ruletest file, enabling you to save use-cases that are of interest, change rules, and run the test again to see how the modified rules behave when applied to the same use-cases. 

### Ruleflows

From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a Ruleflow to specify the sequence from one rulesheet to another.Ruleflows are both graphical (appearing similar to a flow diagram) and functional (they impact rule behavior, and are ultimately generated into a decision service).

![Ruleflow example](https://progress-be-prod.zoominsoftware.io/bundle/corticon-rule-modeling/page/gsa1430508228388.image?_LANG=enus)

 When multiple Rulesheets are included in a Ruleflow, the Rulesheets will execute in a sequence determined by their Rulesheet order in the Ruleflow.

## Rules Driven Forms

### What the Client Side Component needs from the rules

The decision service informs the front end UI each and every prompt to present to the user, throughout the form. It likewise may define whether to execute a decision/computation in the background before moving on to subsequent stages. 

The content presented in the form at a given point can define different paths depending upon
 * Previously entered data data entry to make decisions. For example, the form may branch to a different step, or specify different UI controls 
 * The output of decisions and computations performed between steps
 * Data already known about the end user, for example data populated from an external CRM system

There are certain rules which are useful to implement only at the start or end of the form. For example, telling the CSC where to store the accrued form data, and telling the CSC when the form is complete.

### Working with Corticon.js Studio file types to build Dynamic Forms

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

### Defining a Form's Sequence of Events

The front end UI (CSC) does not know the questions to be asked at each step nor what the answers mean, but it knows how to render these questions and collect the answers. 

The decision service does not know the current state of the questionnaire but knows what to do at each **Stage.** All of the logic applicable to a question and its answer are tied together which a unique identifier, the stage number. 

A Stage may encompass one or more **[Rulesheets](https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms#authoring-the-rules)**. When building dynamic forms, the rulesheets typically specify:
1. Current stage number
2. If presenting anything to the end user at this step, a  **Container** to host the UI controls is created.
3. Within a container, 1 or more UI controls are created (e.g. text input, numeric input, checkbox, or multiple choice dropdown list.)
4. What the next stage is 

![uiContainerAndControls](images/uiContainerAndControls.jpg)

Once all rulesheets in the ruleflow have been arranged and [tested](https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms#testing-the-rules), the ruleflow is deployed as a JavaScript Decision Service bundle--a single file called `decisionServiceBundle.js`.

### Capturing the Response Data
By default, response data is stored in an entity assigned to be the pathToData, using the attribute `UI.pathToData` . 

For example, if we're building auto insurance form, when we're collecting information about the Vehicle, we might assign the 'vehicle' entity to be the vocabulary entity / JSON object within which the accrued data will be stored:

![](images/pathtodata.PNG)

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

### Executing Steps with No UI to Render

Sometimes the Decision Service needs to execute a stage with no associated UI to rende. For example, the Decision Service might need to execute business logic and then move to next step.

This is implemented by the Decision Service in the attribute UI.noUiToRenderContinue (a boolean).

### Validations
There are 2 kinds of validations:

1. Those which are defined directly in UI control itself,  and can thus be directly enforced by the CSC. For this validation, the CSC does not need to call the Decision Service for validation. It can enforce the validation directly based on various attributes sets on the UIControl and the type of UIControl. For examples, we may set an input field as required or we may want a number field where the valid data is between 1 and 20. These are specified in the Decision Service model using the UIControl.required and UIControl.min and UIControl.max attributes respectively:

```
UI.containers.uiControls += UIControl.new[type='Number', min=1, max=200, label='Number 1', id='number1 Id', fieldName='number1']
```

2) The second kind is validation that can only be enforced by the Decision Service (remember the Client Side Component is generic, while the Decision Service is use case specific). The Decision Service can implement simple to very complex business rules to infer that some answers may not be valid using all the data available to it (That is data from previously entered user inputs, external data and initial data). And that validation may be conditional to various paths or various conditions. For example, validating that a claim cannot exceed some amount because the sum of all current claim exceeds the maximum for the month.



