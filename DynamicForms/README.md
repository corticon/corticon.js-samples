# Dynamic Forms with Corticon.js

Creating a dynamic form can be a slog even when you know what you're doing. It's time consuming, repetitive, and frankly runs the risk of transforming front end developers into Jack Torrance from [The Shining](https://static.tumblr.com/72b7451c23e74696386ae2e2c05a8761/alu9pkg/eSdnfi67l/tumblr_static_7lu60nk316gw4sggg4owgcwgg_640_v2.jpg). 

But with Corticon.js, dynamic forms can be created in a fraction of the time, with substantial contributions from non-developers, and through a framework-agnostic design pattern that maximizes the reusability of form logic.

## What we mean by dynamic forms

It's common to fill out forms and most frameworks can easily handle simple forms, but dynamic forms are more challenging to create and maintain. The complexity in those two directions could be exacerbated when there is a use case with hundreds of fields and questions that should be entered by the users. This could be especially difficult for customers that need to deal with a vast number of rules that change over time. This leads to many possible paths for the end user to take (e.g., filling out an insurance claim).

One of the biggest challenges is how to manage those rules and systematize them into a single system and test those paths in a robust way without putting in manual labor. Another related problem is how those rules are defined (via descriptive language, UI, etc.) and whether a businessperson can write them down without having any technical experience.

The last element of the array of problems is how to visualize all those rules on the frontend as a form without asking your developers to have domain knowledge of your business processes, and of course, how to maintain any changes without taking days for implementation and regression testing.

## Dynamic Forms with Corticon.js

Dynamic Forms are just one use case for Corticon.js. The dynamic form solution is architected around having a model/view, where:

  * The model is generated from the rules system.
  * A generic UI component capable of rendering the instructions from the model is acting as the view. The component can be hosted in any Web app or in mobile apps.

In a nutshell, Corticon.js provides a model-driven interactive development interface called Corticon.js Studio within which users define business rules that will change input data based upon specified conditions.

Traditionally, you might think a rules engine is just used to automate a decision based upon data that is already known and available; for example, calculating a loan rate based upon the data known about an applicant.

But in this case, we're going to be gathering data from the end user filling out the form, dynamically presenting additional user prompts which are conditioned on previous answers. Think of this design pattern as the cold metal body of a robot and the 'brain' which gives it instructions on what to do, when, how, and based on what conditions.

Rule modelers (who could be developers or could be business analysts who aren't coders but are comfortable in Excel) use Corticon.js Studio to build the brain of the robot. OK, less a brain than a JavaScript file.

Front end developers will handle its body, starting from an open source form rendering template. Rules are defined in Corticon.js which specify what prompts to present to the user, the input type for responding to the prompt, in what order to present the prompts, constraints/validations on the entered data, how the previous responses may or may not impact subsequent prompts, and when the requisite data has been gathered and is ready to be passed along to downstream systems. While this logic is all defined in Corticon.js Studio, it will ultimately be transformed (or, technically, transpiled) into a Decision Service JavaScript bundle.

The front end rendering component in turn will be responsible for the styling of the forms' user interface and prompts, invoking the decision service when the user hits 'next', and rendering the components of the form that the decision service specifies, along with any constraints and validations it specifies.

For example, consider an insurance quoting form. An optimal dynamic form for the quoting process should:

  * Guide the end user through the quoting process in the most efficient way possible—not wasting the end users' time with inapplicable inquiries such as 'Please Select a Vehicle Make (if applicable)' for a renter's insurance policy, or ask for the applicant's home address if we already know that they're an existing customer and thus we know this information already.
  * Not risk the end user abandoning the quoting process by making calls to a server every time something dynamic must happen.
  * At each juncture where the form determines what information is needed, evaluate the accrued user provided data, data already known about the user (e.g. via them being logged in and their info populated from a CRM), or data retrieved live from external endpoints
  * Maintain form rendering logic (rendering component only knows that when it is told to render a multi select dropdown UI component, it will look and behave like this) as a separate but interoperable component from the content of the prompt/responses itself (decision service logic doesn't care how the multi select dropdown looks or behave, but the content of the prompt should be X, the options should be populated from the array Y, and the selection of the end user's selected value should be captured in the browser session storage under fieldname Z.

To get you started building forms, we provide a form accelerator template which is made up of:

  * A base Corticon.js Rule Vocabulary comprised of the UI definition components that are able to render by the rendering HTML out of the box
  * A 'test driver' html page which allows form developers to test the form as they go and see how the different components work together
  * JS files which serve as the glue between the Decision Service file and the front end HTML. These will be preconfigured to 'translate' the terminology used in the rule vocabulary to specify UI components into the actual HTML input types etc.

## Defining Form Behavioral Logic in Corticon.js Studio

Corticon Studio is a standalone desktop environment to model, analyze, test, and save business rules as executable decision services. Corticon 'rule modelers' are commonly business analysts with expertise in the business domain and its policies, using Corticon Studio to define, author, analyze and test rules.

Once satisfied, rules are then deployed as Decision Services onto Corticon Server or as serverless functions with Corticon.js.

This tutorial is focused on skills related to building dynamic forms with Corticon.js. If you're unfamiliar with Corticon but only interested in the dynamic forms use case, below is a brief overview of the core components involved in modeling Corticon business rules. These are just as important to know when building dynamic forms to gather form response data as they are for automating decisions based upon that data.

There are four main steps of building rules in Corticon Studio, culminating in the RuleFlow which will be deployed as a Decision Service.

1.  The first step of the rule modeling process with Corticon is to build the 'dictionary' of business terms used throughout the rules, the **Rule Vocabulary**.
2.  **Rulesheets** are like Decision Tables. Users 'model' the business rules by defining actions to take when specific conditions are met.
3.  Once the rules created in the rulesheet are satisfied, the first **Ruletest** in Corticon Studio can be created to run test data through the rules in the test server embedded in the local application.
4.  From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a **Ruleflow** to specify the sequence from one rulesheet to another. When multiple Rulesheets are included in a Ruleflow, the Rulesheets will execute in a sequence determined by their Rulesheet order in the Ruleflow.

### Building the Rule Vocabulary 

We can use Corticon.js Studio to model business rules to define both the dynamic form's behavior and the rules related to the operational decision being made based upon the collected data.

First, we define a unified data model—the Rule Vocabulary—that captures:

-   The user interface (UI), such as which questions to pose to the end user at what stage in the form being filled, and what type of input should be allowed for these questions
-   The data needed for the actual decision at hand, which will be captured as a form response and sent along to a downstream application, decision service or system of record

When working with this model in Corticon.js Studio, it is referred to as a Rule Vocabulary, but once we compile the rules into a JavaScript file, the Rule Vocabulary is translated into the JSON schema used to communicate between the front-end rendering component and the embedded business rules.

#### Out of the Box UI Rule Vocabulary Elements for Test Driver

 |                       **Entity/Attribute**                        |                                                                                                                                                                                                                                                                                                                                      **Description**                                                                                                                                                                                                                                                                                                                                      |                                                                         **Field Type**                                                                          |
 | :---------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------: |
 |                     UI\.noUiToRenderContinue                      |                                                                                                                                                                                                                              Boolean set to true for any stage numbers where something other than rendering a container is happening \(enumerating list of options/datasource for a multi choice dropdown, calculations, making decision from accrued data\)                                                                                                                                                                                                                              |                                                                             Boolean                                                                             |
 |                      UI\.currentStageNumber                       |                                                                                                                                                                                                                                 When the client side rendering component is ready for the next step in the flow, it invokes the decision service by setting UI\.currentStageNumber to UI\.nextStageNumber in the input payload of the decision service\.                                                                                                                                                                                                                                  |                                                                             Integer                                                                             |
 |                         UI\.labelPosition                         |                                                                                                                                                                                                                                                                                                     Sets the default label position \- Can be overidden on a control by control basis                                                                                                                                                                                                                                                                                                     |                                                                      Enum: 'Above', 'Side'                                                                      |
 |                          UI\.stageOnExit                          |                                                                                                                                                                                                                                                                                    To invoke a subflow we need to specify the entry stage via nextStageNumber and where we will resume via stageOnExit                                                                                                                                                                                                                                                                                    |                                                                             Integer                                                                             |
 |                          UI\.pathToData                           | We define which data we want to store by specifying in the initial stage of the rules which vocabulary entity should ‘store’ the data accrued throughout the form\. This is specified with UI\.pathToData in an initial stage\. The pathToData entity will be at index 1 in the JSON\. The stored data can then be passed along to other workflow steps once the form is complete, or used to define a conditional rule at a later stage in the form\. Data Type: Any alphanumeric string will be accepted, but in order to use user\-selected responses to dynamically change form behavior in future steps, this should be set to an entity in the vocabulary that will accrue the data |                                                                             String                                                                              |
 |                           UI\.language                            |                                                                                                                                                                                                                                                                               On start, the rendered can accept the language from the UI but a decision service may switch the language based on some rules                                                                                                                                                                                                                                                                               |                                                                             String                                                                              |
 |                             UI\.done                              |                                                                                                                                                                                           Upon receiving a done instruction from the decision service \(a notification of the end of the flow\) via UI\.done=T, it is expected the collected data will be passed to another function or process; typically an event will be raised with a pointer to the JSON data collected during the flow\.                                                                                                                                                                                            |                                                                             Boolean                                                                             |
 |                        UI\.nextStageNumber                        |                                                                                                                                                                                                                                              The decision service sets the attribute UI\.nextStageNumber to specify the next step in the flow, unless it is the last stage, in which case this field is left null and done is set to ‘true’                                                                                                                                                                                                                                               |                                                                             Integer                                                                             |
 |                    UI\.currentStageDescription                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |                                                                             String                                                                              |
 |                          UI\.containers                           |                                                                                       For all steps in which something is being presented to the user \(versus just a calculation/decision made in the background\), the decision service will specify the list of UI controls to render from the decision service JSON payload at the UI\.containers element\. This is an array of all the containers to render for this stage\. The container can be viewed as a panel containing various labels and input fields decision service\. The container has various attributes, for example a title\.                                                                                        |                                                                             object                                                                              |
 |                   UI\.containers\.validationMsg                   |                                                                                                                                                                                                                                                                                                                        Creates a container wide validation message                                                                                                                                                                                                                                                                                                                        |                                                                             String                                                                              |
 |                    UI\.containers\.description                    |                                                                                                                                                                                                                                                                                          An optional string that doesn't impact behavior of the form\. It is mostly useful for troubleshooting\.                                                                                                                                                                                                                                                                                          |                                                                             String                                                                              |
 |                       UI\.containers\.title                       |                                                                                                                                                                                                                                                                                                                         Renders the h3 header on Container entity                                                                                                                                                                                                                                                                                                                         |                                                                             String                                                                              |
 |                        UI\.containers\.id                         |                                                                                                                                                                                                                                                                                                                       Required if any container is being rendered\.                                                                                                                                                                                                                                                                                                                       |                                                                             String                                                                              |
 |                    UI\.containers\.uiControls                     |                                                                                                                                                                                                                          Each UI control element has multiple attributes\. The most important one is the 'type' attribute as it allows the Test Drive Client to know what kind of control to render and which necessary attributes to access based on the type\.                                                                                                                                                                                                                          |                                                                             object                                                                              |
 |               UI\.containers\.uiControls\.fieldName               |                                                                                   The UI control specifies where to store the data in the field UIControl\.fieldName\. For example, if we want to store the value of a person's date of birth in a field called 'dob', within a JSON object called 'Person', we would first need to set \(either in this stage or a preceding one\) the UI\.pathToData = 'Person' and then we could define the UI Control's fieldName to be 'dob'\. This would hold the value selected for the dob in the JSON object as follows: "Person" : \{ "dob" : "MM/DD/YYYY" \}                                                                                   |                                                                             String                                                                              |
 |           UI\.containers\.uiControls\.dataSourceOptions           |                          When using the MultipleChoices UI Control, the actual choices can be populated from a JSON endpoint or be specified by the rule modeler\. For the first option, the rule modeler must specify a URL on the field UIControl\.dataSource\. The default client renderer will look for the options at that endpoint under the value and displayName field\. If the JSON data has different keys, such as shown below, the client renderer must be told which field is going to serve as the value field and which as the displayName field—these can be, and often are, the same\. These are specified with the DataSourceOptions entity\.                           |                                                                             object                                                                              |
 |   UI\.containers\.uiControls\.dataSourceOptions\.dataTextField    |                                                                                                                                                                                                                                                  Optionally define the key name to use as the display name for this option from dropdown, if its name isn’t displayName\. Oftentimes this will be the same as the dataValueField field\.                                                                                                                                                                                                                                                  |                                                                             String                                                                              |
 |   UI\.containers\.uiControls\.dataSourceOptions\.dataValueField   |                                                                                                                                                                                                                                       Optionally define the name of the key whose value should be stored should end user select this option from dropdown, if its name isn’t value\. Oftentimes this will be the same as the dataTextField field\.                                                                                                                                                                                                                                        |                                                                             String                                                                              |
 | UI\.containers\.uiControls\.dataSourceOptions\.pathToOptionsArray |                                                                                                                                                                                                                                                                                            Optionally define where in a JSON endpoint is the array of options to populate a dropdown list with                                                                                                                                                                                                                                                                                            |                                                                             String                                                                              |
 |                  UI\.containers\.uiControls\.max                  |                                                                                                                                                                                                                                                                                                       Optionally give the rendering component for this UI Control a numeric maximum                                                                                                                                                                                                                                                                                                       |                                                                             Integer                                                                             |
 |             UI\.containers\.uiControls\.defaultValue              |                                                                                                                                                                                                                                                                                                  Optionally give the rendering component for this UI Control a placeholder default value                                                                                                                                                                                                                                                                                                  |                                                                             String                                                                              |
 |               UI\.containers\.uiControls\.showTime                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |                                                                             Boolean                                                                             |
 |               UI\.containers\.uiControls\.multiple                |                                                                                                                                                                                                                                                                When there could be any number of responses to a prompt, set this to true\. The answers are stored in an array pointed as specified by fieldName attribute                                                                                                                                                                                                                                                                 |                                                                             Boolean                                                                             |
 |                UI\.containers\.uiControls\.tooltip                |                                                                                                                                                                                                                                                                                                 Optionally give the rendering component for this UI Control a tooltip to assist end user                                                                                                                                                                                                                                                                                                  |                                                                             String                                                                              |
 |                 UI\.containers\.uiControls\.label                 |                                                                                                                                                                                                                                                                                                                     Content of the prompt provided by the UI Control                                                                                                                                                                                                                                                                                                                      |                                                                             String                                                                              |
 |                 UI\.containers\.uiControls\.rows                  |                                                                                                                                                                                                                                                                                                                         Description: HTML textarea rows attribute                                                                                                                                                                                                                                                                                                                         |                                                                             Integer                                                                             |
 |                 UI\.containers\.uiControls\.type                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Enum:Text, SingleChoice, MultipleChoices, DateTime, Number, ReadOnlyText, YesNo, TextArea, FileUpload, MultiExpenses, MultipleChoicesMultiSelect , YesNoBoolean |
 |               UI\.containers\.uiControls\.required                |                                                                                                                                                                                                                                                                                               Optionally tell the rendering component that this UI Control must be answered by the end user                                                                                                                                                                                                                                                                                               |                                                                             Boolean                                                                             |
 |                  UI\.containers\.uiControls\.min                  |                                                                                                                                                                                                                                                                                          Optionally give the rendering component for this UI Control a minimum numeric value end user can enter                                                                                                                                                                                                                                                                                           |                                                                             Integer                                                                             |
 |                 UI\.containers\.uiControls\.minDT                 |                                                                                                                                                                                                                                                                                            Optionally give the rendering component for this UI Control a minimum date value end user can enter                                                                                                                                                                                                                                                                                            |                                                                             String                                                                              |
 |             UI\.containers\.uiControls\.labelPosition             |                                                                                                                                                                                                                                                                                                 Optionally instruct the rendering component where to place the label for this UI Control                                                                                                                                                                                                                                                                                                  |                                                                      Enum: 'Above', 'Side'                                                                      |
 |              UI\.containers\.uiControls\.sortOptions              |                                                                                                                                                                                                                                                                        Optionally instruct the rendering component how to sort the list of options applied to this UI Control\. Allowed values: 'A to Z', 'Z to A'                                                                                                                                                                                                                                                                        |                                                                    Enum: 'A to Z', 'Z to A'                                                                     |
 |                 UI\.containers\.uiControls\.maxDT                 |                                                                                                                                                                                                                                                                                            Optionally give the rendering component for this UI Control a maximum date value end user can enter                                                                                                                                                                                                                                                                                            |                                                                             String                                                                              |
 |          UI\.containers\.uiControls\.validationErrorMsg           |                                                                                                                                                                                                                                                                                                                   Creates validation message for individual UI Control                                                                                                                                                                                                                                                                                                                    |                                                                             String                                                                              |
 |                  UI\.containers\.uiControls\.id                   |                                                                                                                                                                                                                                                                                                      Unique identifier \(within the context of one container\) for the UI control\.                                                                                                                                                                                                                                                                                                       |                                                                             String                                                                              |
 |                 UI\.containers\.uiControls\.cols                  |                                                                                                                                                                                                                                                                                                                         Description: HTML textarea cols attribute                                                                                                                                                                                                                                                                                                                         |                                                                             Integer                                                                             |
 |              UI\.containers\.uiControls\.dataSource               |                                                                                                                                                                                            Specifies the datasource to populate MultipleChoices dropdown options from\. Value field at the JSON endpoint must have the key value, display name must have the value displayName\. If not the case for either of these, these can be overridden by specifying a child entity ‘DataSourceOptions’                                                                                                                                                                                            |                                                                             String                                                                              |
 |                 UI\.containers\.uiControls\.value                 |                                                                                                                                                                                                                                                                                                                         The content of a ReadOnlyText UI Control                                                                                                                                                                                                                                                                                                                          |                                                                             String                                                                              |
 |                UI\.containers\.uiControls\.option                 |                                                                                                                                                                                                                                                    Use in conjunction with MultipleChoices UI Control to populate the list of options\. Alternative is to specify an endpoint for the UI Control's datasource to retrieve data from\.                                                                                                                                                                                                                                                     |                                                                             object                                                                              |
 |          UI\.containers\.uiControls\.option\.displayName          |                                                                                                                                                                                                                                                                                                                What the particular dropdown option's dispay name should be                                                                                                                                                                                                                                                                                                                |                                                                             String                                                                              |
 |             UI\.containers\.uiControls\.option\.value             |                                                                                                                                                                                                                                                                                                    What the particular dropdown option's value will be stored as should it be selected                                                                                                                                                                                                                                                                                                    |                                                                             String                                                                              |

# Using the Test Driver Client

When we build the dynamic form rules, we're ultimately going to be transpiling the rules into a self-contained JavaScript bundle. In simpler terms, all of the logic will be encapsulated into just one file decisionServiceBundle.js.

Front end developers handle the 'rendering side' of the form. This includes defining data that will be passed in at the onset of the form, styling, and where the data goes once the form is filled out.

To make everyone's life easier, we provide open source implementations of Corticon.js Dynamic Forms which you can freely download, import into your environment, and adapt to your needs. This includes both sample rule assets that you can work with in Corticon.js Studio, and a sample client side rendering component.

## Overview of the Test Drive Client

The Dynamic Forms in the sample page are rendered by a reusable, adaptable template referred to as the Test Drive Client. By template, we mean that the same Test Drive Client can be reused for multiple questionnaires without any front end client changes. When you switch samples with the dropdown sample selector, you're in a different dynamic form; however it is using the Test Drive Client for all the samples.

This framework of separating the Test Drive Client from the rules promotes agility for development teams, as it disentangles the 'instructions' logic for what to present to the user (defined in a Corticon.js decision service) and the code that renders the form based upon these instructions. Typically, a Test Drive Client is written and maintained by a developer or a team of developers while the decision services are written by business analysts who understand well the problem domain of the questionnaire.

If you are familiar with model/views design patterns; you can consider the Test Drive Client to be the view while the model is created and maintained using a Corticon.js decision service.

## Responsibilities  of the Test Drive Client

The Test Drive Client is responsible for rendering the UI Controls (questions, labels, descriptions, validation messages…), collecting the data entered along the flow (the answers), and navigating through the next steps.

It does so by:

1.  Invoking the decision service at both the start of the flow and at each step in the flow. The decision service returns a JSON payload with all the necessary data to proceed for the entire step.
2.  Maintaining the state of the flow. That is, the state machine representing the flow is maintained by the Test Drive Client and not by the decision service (The decision service is stateless).
3.  Exiting when the end of the flow is reported by the decision service.

All of this is by default implemented in an interoperable fashion, as the same Test Drive Client can be reused on different pages and with different use cases.

## What the Test Drive Client Needs from the Decision Service returned payload

The decision service informs the front end UI each and every prompt to present to the user, throughout the form. It likewise may define whether to execute a decision/computation in the background before moving on to subsequent stages. 

The content presented in the form at a given point can define different paths depending upon
 * Previously entered data data entry to make decisions. For example, the form may branch to a different step, or specify different UI controls 
 * The output of decisions and computations performed between steps
 * Data already known about the end user, for example data populated from an external CRM system

There are certain rules which are useful to implement only at the start or end of the form. For example, telling the Test Drive Client where to store the accrued form data, and telling the Test Drive Client when the form is complete.

## Maintaining State

How does the Test Drive Client maintain the state of the overall flow?
It does so by:
1. Keeping a variable for the current stage to execute and setting the next stage to execute based on instructions from the decision service.  Specifically, the decision service sets the attribute `UI.nextStageNumber` to specify the next step in the flow.  Thus, when the Test Drive Client is ready for the next step in the flow, it invokes the decision service by setting U`I.currentStageNumber` to `UI.nextStageNumber` in the input payload of the decision service.
2. Keeping a variable to an object literal for the set of data (answers) entered at each step.  
   The answers are stored in specific fields, again as specified by the decision service. Specifically, the field is specified in each `UIControl` as field `UIControl.fieldName`.      
3. Upon receiving a “done” instruction from the decision service (a notification of the end of the flow), it is expected the collected data will be passed to another function or process; typically an event will be raised with a pointer to the JSON data collected during the flow.  Specifically, this is specified in the `UI.done` attribute.

It’s important to keep in mind that the decision service does not maintain any state.

Another way to look at that is:
1. The Test Drive Client does not know the questions to be asked and what the answers mean.  It simply stores the answers as specified by the decision service.
2. The decision service does not know the current state of the questionnaire but know what to do at each step.

## Storing answers with multiple projects/Multiple Decision Services

As the Test Drive Client can be reused across different projects, there is a need to be able to specify where to store the data within the returned JSON payload.

The decision service can optionally specify a path to where the data will be stored within the answers object literal.
This is specified with `UI.pathToData`
When not specified the Test Drive Client will write the answers at the root of the object literal.
The Test Drive Client is responsible for maintaining the state of the `pathToData` as it can change between stages but the decision service is not responsible for specifying the `pathToData` at every single step.

## Rendering UI Controls

The Test Drive Client receives the list of UI controls to render from the decision service JSON payload at the `UI.containers` element. This is an array of all the containers to render for this stage.
The container can be viewed as a panel containing various labels and input fields.

The container has various attributes, for example a `title`.  

But, most importantly it has an array of UI controls to render within the container at `UI.containers.uiControls`. Each UI control element has multiple attributes.  The most important one is the type attribute as it allows the Test Drive Client to know what kind of control to render and which necessary attributes to access based on the type. For example a UI control type `Number` can have a min and max number associated with it to provide data validation.

The data the Test Drive Client receives is structured like this (pseudo json):
~~~
UI:
containers: [
   uiControls: [
      type: “ui control type identifier”
   ]
]
~~~

For examples of actual payloads, run the test driver client, select the canonical sample and look at the trace panel.

Here is an example for stage 2 of the canonical sample:

~~~
{
  "payload": [
    {
      "language": "english",
      "labelPosition": "Above",
      "pathToData": "canonicalSample",
      "currentStageNumber": 2,
      "containers": [
        {
          "id": "secondContainerId",
          "title": "Question with Number between 10 and 20 - Reference: Step2.ers",
          "uiControls": [
            {
              "fieldName": "Step2Field1",
              "id": "crtl2_2",
              "label": "Question 3",
              "max": "20",
              "min": "10",
              "type": "Number"
            }
          ]
        }
      ],
      "nextStageNumber": 3,
      "currentStageDescription": "This is implemented in Step2.ers"
    },
    {
      "canonicalSample": {
        "Step1Field1": "aaa",
        "Step1Field2": "bbb",
        "Step1Field3": "yes"
      }
    }
  ],
  "corticon": {
    "messages": {
      "message": []
    },
    "timestamp": "2022-04-25T15:39:33.534Z",
    "status": "success"
  }
}
~~~

### Supported Controls List

| UI Control Type            | Multiple Instance Controls (For more information read the section below) | Description                                                                                                                   | Rendering in Reference Implementation (Test Driver)                                                            |
| -------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| ReadOnlyText               | No (NA)                                                                  | A control to render HTML text                                                                                                 | div class="readOnlyText"                                                                                       |
| TextArea                   | No                                                                       | A control to render a multi-lines text input                                                                                  | textarea class="textAreaControl"                                                                               |
| Text                       | Yes                                                                      | A control to render a single line text input                                                                                  | input "type": "text"                                                                                           |
| Number                     | Yes                                                                      | A control to render a single number input                                                                                     | input "type": "text"                                                                                           |
| DateTime                   | Yes                                                                      | A control to render a date time or a date input (based on attribute showTime)                                                 | input type="datetime-local" or input type="date"                                                               |
| SingleChoice               | No (NA)                                                                  | A control to render a single choice input - typically rendered as a checkbox or ON/OFF item                                   | input type="checkbox"                                                                                          |
| MultipleChoices            | No (NA)                                                                  | A control to render a multi-choice input.  The user can only selects one of the choice - typically rendered as a dropdown     | select                                                                                                         |
| MultipleChoicesMultiSelect | No (NA)                                                                  | A control to render a multi-choice input.  The user can select 1 to all of the choice                                         | select multiple                                                                                                |
| YesNo                      | No (NA)                                                                  | A control to render a binary yes - no choice.  This is a short cut to creating a multi choices control with yes and no values | select with 2 values, yes and no                                                                               |
| FileUpload                 | No                                                                       | A control to render a file upload control.                                                                                    | input type="file" with appropriate label                                                                       |
| MultiExpenses              | Yes                                                                      | An example to render a complex control (see below for details on simple vs complex controls).                                 | It contain 3 primitive UI elements: an expense type selector, an expense amount input and a currency selector. |


### Simple Controls

These correspond to a primitive UI element in HTML or mobile platform.  For example, a `Text` UI type can be rendered as 
an HTML input tag, or a `MultiChoice` ui type can be rendered as a dropdown using a "select" html tag.

Note: the Test Drive Client can decide to render the MultiChoice as a custom list that the user can click on.

No matter how the UI type is rendered, a simple control has only one input (a string, some numbers, a Boolean, ect…), thus the Test Drive Client will be responsible for storing one answer for each simple controls.  The UI control specifies where to store the data in the field `UIControl.fieldName`

### Multiple Instance Controls

Sometimes we don’t know in advance how many inputs there will be for a specific field. A good example would be asking for first name of all children.  There may be the need for 1 input or 2 inputs or 3 or more. In this case, the UI control is specified with the attribute multiple.

We also call these kinds of controls ArrayTypeInputs as the answers will be stored in an array.

The array will be saved in the project data as specified by the UI control specified using the field `UIControl.fieldName`.

For more information check the [reference implementation function renderMultipleChoicesInput]( https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js).

### Complex Controls

These controls are characterized as:

1. We need to render a more sophisticated UI control containing multiple primitive UI elements 
   per entry.  For example, an expense claim entry may have both an expense type and an 
   expense amount; so the complex control would contain both a selector control for the type
   and a currency input control.

2. There can be multiple entries and the number of entries are not known in advance.  Again, a good example is an expenses question.  The user may have 2 items to claim or may have 10.  
For each item to claim, there is a choice input for the type of expense, a number input for the amount and a choice 
for the currency.  The complex control would typically display a button to let the user add another entry on demand.

We also call this type of controls ArrayTypeInputs as the answers will be stored in an array.
The array will be saved in the project data as specified by the UI control specifies using the field `UIControl.fieldName`

For more information check the[ reference implementation function renderExpenseInput](https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js).


### Controls Reading Data from External Data Sources

When you implement your own Test Drive Client, you may want to support UIControls that populate the control from a datasource.  
This is particularly useful for list of items, for example a dropdown list, when the list of options already exists somewhere else, and you don’t want to duplicate it in Corticon.

Or perhaps the list is changing so frequently that you want to make sure the user always get the list 
from an external data source (for example a set of exchange rate).

The decision service can specify an external data source with the property `UIControl.dataSource`.

To see an example of what you need to implement, check the [MultiChoice renderer](https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js).

There are 2 working modes in this example:
1. Default mode: The REST service produces JSON with the field names `value` and `displayName` for the option value and text respectively.
2. Mapping mode: The field names are different and the mapping are specified in these 2 properties:
      * `UIControl.dataSource.dataSourceOptions.dataValueField`
      * `UIControl.dataSource.dataSourceOptions.dataTextField`
      
### Stages

`Stage`: a unique identifier representing where the flow currently is at in the state machine.

#### In the Request

When the Test Drive Client makes a request to the decision service it asks for a specific stage to render by specifying `UI.currentStageNumber`.

On the request, the Test Drive Client tells the decision service the current stage number to execute. 
The decision service will respond with the corresponding to the current UI to render.

#### In the Response

There are 3 attributes in the decision service JSON results that deal with stages:
* `currentStageNumber`: The decision service tell the Test Drive Client the current stage number it has executed.  
  The Test Drive Client shouldn't do anything special with it.  It is mostly useful for troubleshooting.
* `currentStageDescription`: An optional string.  Again, the Test Drive Client shouldn't do anything special with it.  It is mostly useful for troubleshooting.  
* `nextStageNumber`: This is the stage number the Test Drive Client specifies when calling the decision service for the next step. 
