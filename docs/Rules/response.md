
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

A Stage may encompass one or more **[Rulesheets](https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms#authoring-the-rules)**.

 When building dynamic forms, the rulesheets typically specify:
1. Current stage number
2. If presenting anything to the end user at this step, a  **Container** to host the UI controls is created.
3. Within a container, 1 or more UI controls are created (e.g. text input, numeric input, checkbox, or multiple choice dropdown list.)
4. What the next stage is

<img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples@latest/docs/assets/uiContainerAndControls.jpg"
 title="uiContainerAndControls">

Once all rulesheets in the ruleflow have been arranged and [tested](https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms#testing-the-rules), the ruleflow is deployed as a JavaScript Decision Service bundle--a single file called `decisionServiceBundle.js`.
