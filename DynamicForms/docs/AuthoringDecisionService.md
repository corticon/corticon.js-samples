## Defining the Rules 

###Ruleflows

The Decision Service is generated from a Corticon Ruleflow. A Ruleflow is how Corticon assembles and organizes the components of a set of rules into a single unit. It is a presented as a flow diagram, where Rulesheets and  other Ruleflows are encapsulated into a 'top-level' ruleflow. 

In contrast to a typical decision automation use case, when creating dynamic forms with Corticon.js, rulesheets and ruleflows are not 'connected' from one to another when constructing the top level ruleflow. Connections are the objects that connect or “stitch” assets and objects together to control their sequence of execution. 

If a connector is drawn from Rulesheet sample1.ers to sample2.ers, then when a deployed Ruleflow is invoked, it will execute the rules in sample1.ers first, followed by the rules in sample2.ers.

For dynamic forms however, instead of a decision that will always go through the same chronology during a single execution, dynamic forms require the ability to navigate throughout the objects in a ruleflow, such that different rules may fire depending upon dynamic variables. For example, the sequence may be determined based upon:

-   Data that the end user has entered to that point (e.g. route to different parts of a ruleflow depending upon what type of claim a user has chosen to file)
-    whether any data is pre-populated at the start of a ruleflow (e.g. user had to log in prior to beginning form, so information tied to their account is leveraged in determining the route through which to fill the form)

The main function of the rules, from which the Decision Service is generated, are to define:

1.  The flow of the questions (What prompt is presented when and base upon what).
2.  For each step, either:
	- What user prompt to render (dropdown, true/false, number, etc). Henceforth, we refer to these user prompts as UI Controls. 
	- Execute some business logic or computation that doesn't involve presenting anything to the user (e.g. add together dollar amount of all expenses being submitted)
3. Which data should be retained and accrued to pass along upon form completion, versus which data is only relevant ephemerally (e.g., assigning data related to a claim to be retained, while assigning the response to 'do you have more claims to submit?' to be discarded. 


A *Stage* is typically implemented with one or more rulesheets.

A single rulesheet specifies 3 main items:
1.	It creates 1 or more container to host the UI controls (This can be viewed as the panel that will contain the questions).
2.	It adds to the container, 1 or more UI controls.  There are various types of controls available.  See the UIControlType enumeration in Corticon.js vocabulary custom data types.  For examples, one can create a text input or a numeric input or a single choice (dropdown list) or multiple choices (checkboxes) or readonly text.
3.	It sets the next step to execute in the flow using the stage attribute.  At the end of the flow, it also sets the done flag.

# How to Write Decision Services with Corticon

Corticon is a very versatile product, as such there are many ways to approach and solve problems
with it.  We have developed one approach and a set of patterns that will help you getting started
very quickly with complex rules based dynamic forms.  
Feel free to use the solution as is or to adapt it to your own need as you see fit.

## What does the decision service do?
Below is high level summary. And we will get into detailed descriptions in subsequent sections:
* The decision service  provides the set of steps and paths to take for complex rules-based questionnaires.  The paths can be viewed as a tree of decisions where each branch is a set of different questions (of course there is provision for reusing set of steps that are common to various paths).
* A step is typically composed of one or more stages.  The stage is a number that identifies what needs to happen for a specific step in the questionnaire.
* At each step the Decision Service provides the set of UI controls to render and their properties:
   * It can leverage previous data entry to make decisions.
   For example, decide to branch to a different step or to specify different UI controls to render
   * It can perform complex business logic and computations (non-UI Step).
* The Decision Service is composed of a series of Corticon rulesheets that represent, in an abstract manner:
   * The flow of the questions (step by step).  
   * For each step, either:
      * What UI controls to render (questions to ask)
      * Implement some business logic/complex computation before executing the next step
* The Decision Service specifies where to store both:
   * the accumulated data entered by the user (See fieldName attribute on UIControl)
   * and results of business logic

## Stages and Steps

What are stages?

The stage is a number that identifies what needs to happen for a specific step in the questionnaire.  
A typical questionnaire goes through many stages.  For example, it can go through stage 1, 2, 3, 4 and 10 
if the user answers yes to the first question and through stage 1, 5, 6, 7, 8, 9 and 10 if the user 
answers no to the first question.

As a modeler and creator of the Decision Service you decide what stage numbers to assign to the various stages
used in the overall questionnaire.  

What are Steps?

It is what happens in a single step in the UI (the CSC).  
For example, it could be a single question to ask the user for a yes / no answer.  
If the user answers Yes, the Decision Service may take go down one path while if the user answers no, 
the Decision Service will go down another path.  

However, a step may be composed of more than one question.
* A step is typically implemented with one or more rulesheets.
* A single rulesheet specifies 3 main items:
   * It creates 1 or more containers to host the UI controls
   * It adds to the container, 1 or more UI controls.  There are various types of controls available.  See the UIControlType enumeration in the vocabulary custom data types.  
   * It sets the next stage to execute in the flow and at the end of the flow, it sets the done flag.

# Basic Questionnaire

In this section we will see the minimum items you need to create for a trivial questionnaire.
Let’s imagine our questionnaire is so simple that it has only 2 steps.  Step 1 and 2.  

You would create 2 rulesheets: Step1.ers and Step2.ers

The first thing you need to do when creating a rulesheet is to assign a pre-condition filter to specify what stage the rulesheet executes.  This is done using a filter like this: UI.currentStageNumber = <stageNbr>
Where stageNbr is the actual number.  For example for stage 0:

![Filtering on stage number](images/FilterStage.png)

And you would create an action to specify the next stage like this:
UI.nextStageNumber = 1

This means from stage 0, the next step will go to rulesheet filtered on stage 1.

Additionally, in the first rulesheet, you will typically specify some initialization attributes like:
* The base path to where to store data.  It is specified in the attribute:  UI.pathToData
It is the base path of where all the answers will be stored.  This is very useful when you have multiple projects and you are writing multiple decision services.
If you don’t set this parameter, all answers will be stored at the root of the project json data.
* Whether the question labels are displayed next to the input field or above using the attribute: UI.labelPosition

## Typical Rulesheet

It will set the next stage to execute using:
UI.nextStageNumber = <stageNbr>
For example: UI.nextStageNumber = 23

It would typically specify UI controls to render, and it could do this conditionally to previous answers.  
For example, rendering a different control if the user entered yes on a first step.

See the canonical sample for examples of the supported UI Controls and in particular look at Step3.ers
as an example where we specify ui controls based on previous inputs.

## Last Rulesheet

It needs to specify that the questionnaire is done using an action like this: UI.done = T

Note: other rulesheets do not need to specify UI.done = F

# Typical Patterns

## Executing Step with No UI to Render

Sometimes the Decision Service needs to execute a stage with no associated UI to render; for example, the Decision Service just needs to execute
business logic and move to next step.

This is specified by the Decision Service in the attribute UI.noUiToRenderContinue (a boolean)

Note: The CSC needs to keep calling the Decision Service by setting the UI.currentStageNumber to UI.nextStageNumber until the flag
noUiToRenderContinue is not set (undefined) or set to false.

## Validation

There are 2 kinds of validation:

1. The first one is at the UI control itself and can directly be enforced by the CSC.  
   For this validation, the CSC does not need to call the Decision Service for validation.  
   It can enforce the validation directly based on various attributes sets on the UIControl and the type of UIControl.  
   For examples, we may set an input field as required or we may want a number field where the valid data is between 1 and 20.  
   These are specified in the Decision Service model using the UIControl.required and UIControl.min and UIControl.max attributes respectively.

2)	The second kind is validation that can only be enforced by the Decision Service (remember the CSC is generic and the Decision Service is use case specific). 
      The DS can implement simple to very complex business rules to infer that some answers may not be valid
      using all the data available to it (That is data from previously entered user inputs, external data and initial data).  
      And that validation may be conditional to various paths or various conditions.
      
      For example, validating that a claim cannot exceed some amount because the sum of all current claim exceeds the maximum for 
      the month.

### Decision Service Validation Pattern

The design pattern is to have a first rulesheet for specifying the UI and another one for data validation.  
Both executes on the same stage number and, as a consequence, the step always executes the 2 rulesheets.  
And it executes them at least 2 times.  

The first time, the UI rulesheet specifies the controls to render with no default values and the validation rulesheet 
does not really have any effect as the data to be entered is null.  However, in the second execution, the user data is
validated and a decision is made to continue to the next step if validation passes or to go back to the UI if validation fails.

The only difference between the 2 passes is that in the first pass there is no data yet
while in the second pass, there is data to validate.  And if validation fails, we want to reuse the data as the default value for the UI Controls so that the user does not have to retype everything and can just correct the data.

To understand the details, let’s look at our validation sample available at https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms/DS/ValidationSample:

The first rulesheet (Step1.ers) creates the UI as usual and does not set a next stage.  That way, we will re-enter the step
after the user has submitted data.  

The second rulesheet (Step1Validation.ers) does the data validation.

When the CSC submits the current step, the Decision Service executes both rulesheets again but this time with the data entered by the user.  
If the validation passes, then we move to next stage (the validation rulesheet sets stage to next stage).

If the validation fails, then we go back to rendering the UI for the same step but this time we have both the 
data entered by the user and a set of validation messages to render as well.  
The data entered by the user is set as the default value of the UI control (using the value attribute).

Let's look in details at some key attributes at play, in the validation rulesheet (Step1Validation.ers):

1. when the validation passes the rulesheet sets UI.nextStageNumber to the next stage and the flag “UI.noUiToRenderContinue” to True.
   That way the client side component knows to execute the decision service a second time to get to the next stage.
   
2. when the validation fails the rulesheet sets UI.nextStageNumber to the same stage; so we keep executing till the
   validation succeeds.


## Reusing Some Stages (Reuse via Subflows)

Sometimes multiple paths share a common set of steps (Stages) as shown in this image:

![common steps](images/SubflowAsReusableItem1Smaller.jpg)

One way to achieve reuse is to create a separate ruleflow and use it inside another ruleflow (this is the concept of a subflow).  

The subflow does not contain anything special.  It just contains the set of stages the subflow needs to achieve its purpose.  
Once completed, the subflow can be dragged into the main ruleflow similarly to how we drag rulesheets into a ruleflow.

As a subflow can be invoked from different stages, the UI.nextStageNumber is not known in advance.  
To solve that problem we follow the following pattern:

* Before invoking a subflow, the main flow (the flow calling the reusable flow) needs to set UI.stageOnExit to where 
   the subflow needs to resume.
   
* The subflow needs to set UI.nextStageNumber to UI.stageOnExit

This is illustrated in the following diagram:

![Subflows as reusable items](images/SubflowAsReusableItem2Smaller.jpg)

### Sample

To become familiar with this pattern, check the sample: ReusingFlowSample at https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms/DS/ReusingFlowSample

In this sample, the subflow is implemented in stage 10 and 11.  We reuse it twice, the first time from stage 1 
and the second time from stage 2 as shown below:

![Sample reuse Subflows](images/ReuseSubFlow.PNG)

Notice, the first time the subflow will return to stage 2 and the second time to stage 3. 



# Getting Started

The best way to get started is to first try the various samples provided out of the box.  

To get started:
* invoke client.html (available at https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html)
* go through each sample to get a feel for what is available
* Run the canonical sample. Each step in this sample shows how to use a specific UI control and display
  the corresponding Corticon rulesheet file in the title of the container.  
  You can then use the corresponding step rulesheet as an example to implement what you need in your own project.

# Additional Resources

Find out more about [Corticon.js](https://www.progress.com/corticon-js)

You can check [these blogs](https://www.progress.com/blogs/author/thierry-ciot) for Corticon news and features as well as Serverless industry trends.

Free training for Corticon.js at https://www.progress.com/blogs/learning-opportunity-available-get-started-corticonjs-rules-today

