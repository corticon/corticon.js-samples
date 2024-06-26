# Client Side Component (CSC)

- [Client Side Component (CSC)](#client-side-component-csc)
    - [Local versus Remote Decision Services](#local-versus-remote-decision-services)
  - [The Pre-Built CSC](#the-pre-built-csc)
  - [Responsibilities of the Client Side Component](#responsibilities-of-the-client-side-component)
  - [Returned Payload from Decision Service](#returned-payload-from-decision-service)
- [State Machine](#state-machine)
- [Storing answers with multiple projects/Multiple Decision Services](#storing-answers-with-multiple-projectsmultiple-decision-services)
- [Rendering UI Controls](#rendering-ui-controls)
  - [Supported Controls List](#supported-controls-list)
  - [Simple Controls](#simple-controls)
  - [Multiple Instance Controls](#multiple-instance-controls)
  - [Complex Controls](#complex-controls)
- [Controls Reading Data from External Data Sources](#controls-reading-data-from-external-data-sources)
- [Stages](#stages)
  - [In the Request](#in-the-request)
  - [In the Response](#in-the-response)


The Dynamic Forms in the sample page are rendered by a reusable, adaptable template referred to as the Client Side Component (CSC). By template, we mean that the same CSC can be reused for multiple questionnaires without any front end client changes. When you switch samples with the dropdown sample selector, you're in a different dynamic form; however it is using the CSC for all the samples.

This framework of separating the CSC from the rules promotes agility for development teams, as it disentangles the 'instructions' logic for what to present to the user (defined in a Corticon.js decision service) and the code that renders the form based upon these instructions.
Typically, a CSC is written and maintained by a developer or a team of developers while the decision services are written by business analysts who understand well the problem domain of the questionnaire.

If you are familiar with model/views design patterns; you can consider the CSC to be the view while the model is created and maintained using a [Corticon.js](https://www.progress.com/corticon-js) decision service.

### Local versus Remote Decision Services

Decision services can be run in process within the CSC or maintained in and invoked at a remote environment.

For the remote option, Corticon.js supports deployments to:

-  Any of the major cloud vendors' serverless environments (AWS Lambda, Azure and GCP functions)
-  Node.js servers
-  Traditional Java server running either in the cloud or on premises (traditional server deployments)

In-process deployments provide essentially instant response time, however, there are considerations for when it might make more sense to run maintain this logic in remote environments, such as:

- For Mobile Apps: a decision service hosted remotely can be updated very easily without having to force the user to reinstall the app.
- To address security:
	- Don’t want to expose some of the data used in the decision process.
	- Want to have the decision service access various data sources inside the firewall.
	- Don't want to risk exposing the decision service to reverse engineering.

There are only minor distinctions between how the CSC and decision service interactions take place when running in-process or remotely as illustrated in the 2 diagrams below:

<p style="text-align:center;">
<img width="500"  src="images/LocalDS.png"
 title="Running locally">
<br>
<br>
<img width="500"  src="images/RemoteDS.png"
 title="Remote decision service">
</p>

## The Pre-Built CSC

The [CSC within this repository](https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms/CSC/clientSideComponent) which you can fork and adapt as needed is based on plain HTML and JQuery. You can likewise test drive the client side form [here](https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html).

Whether you built off the template CSC or you want to leverage a different technology like React or Angular or Vue, it is useful to play around with the prebuilt components.

## Responsibilities of the Client Side Component

The Client Side Component is responsible for rendering the UI Controls (questions, labels, descriptions, validation messages…), collecting the data entered along the flow (the answers), and navigating through the next steps.  

It does so by:
1.	Invoking the decision service at both the start of the flow and at each step in the flow.  The decision service returns a JSON payload with all the necessary data to proceed for the entire step.
2.	Maintaining the state of the flow.  That is, the state machine representing the flow is maintained by the CSC and not by the decision service (The decision service is stateless).
3.	Exiting when the end of the flow is reported by the decision service. 
      
All of this is by default implemented in an interoperable fashion, as the same CSC can be reused on different pages and with different use cases.

## Returned Payload from Decision Service

The decision service returns a JSON payload containing an array with 2 elements.  
Each of the element represents top level entities from the Corticon model.  

The item at index 0 is the UI model.  

The item at index 1 is the data for the specific use case.  We call this the project data.  It contains:
1.	Initial data to pass to the first step of the flow (initialization data for this specific flow session).  For example, this could be contextual information about a user (first name, last name, preferred language…).  In an insurance claim that could be the type of insurance the user has, ect…
2.	Accumulated answers along the flow.
3.	Additional data created by the decision service along the flow.  For example, the decision service can compute the total expenses amount in one step and then use that total in another step to decide to skip some questions based on whether the total is less than say $1000.

Note: In the rest of this document when we reference an item as UI.fieldName we mean to reference the top level entity item at index 0 from the payload (that is UI.fieldName is a short hand notation for payload[0].fieldName).

# State Machine

How does the CSC maintain the state of the overall flow?
It does so by:
1. Keeping a variable for the current stage to execute and setting the next stage to execute based on instructions from the decision service.  Specifically, the decision service sets the attribute UI.nextStageNumber to specify the next step in the flow.  Thus, when the CSC is ready for the next step in the flow, it invokes the decision service by setting UI.currentStageNumber to UI.nextStageNumber in the input payload of the decision service.
2. Keeping a variable to an object literal for the set of data (answers) entered at each step.  
   The answers are stored in specific fields, again as specified by the decision service. Specifically, the field is specified in each UIControl as field UIControl.fieldName.      
3. Upon receiving a “done” instruction from the decision service (a notification of the end of the flow), it is expected the collected data will be passed to another function or process; typically an event will be raised with a pointer to the JSON data collected during the flow.  Specifically, this is specified in the UI.done attribute.

It’s important to keep in mind that the decision service does not maintain any state.

Another way to look at that is:
1. The CSC does not know the questions to be asked and what the answers mean.  It simply stores the answers as specified by the decision service.
2. The decision service does not know the current state of the questionnaire but know what to do at each step.

# Storing answers with multiple projects/Multiple Decision Services

As the CSC can be reused across different projects, there is a need to be able to specify where to store the data within the returned JSON payload.

The decision service can optionally specify a path to where the data will be stored within the answers object literal.
This is specified with UI.pathToData
When not specified the CSC will write the answers at the root of the object literal.
The CSC is responsible for maintaining the state of the pathToData as it can change between stages but the decision service is not responsible for specifying the pathToData at every single step.

# Rendering UI Controls

The CSC receives the list of UI controls to render from the decision service JSON payload at the “UI.containers” element.  
This is an array of all the containers to render for this stage.
The container can be viewed as a panel containing various labels and input fields.
The container has various attributes, for example a title.  
But, most importantly it has an array of UI controls to render within the container at UI.containers.uiControls.
Each UI control element has multiple attributes.  The most important one is the type attribute as it allows the CSC 
to know what kind of control to render and which necessary attributes to access based on the type.
For example a UI control type “Number” can have a min and max number associated with it to provide data validation.

The data the CSC receives is structured like this (pseudo json):
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

## Supported Controls List

| UI Control Type | Multiple Instance Controls (For more information read the section below) | Description | Rendering in Reference Implementation (Test Driver) |
| ----------- | ----------- | ----------- | ----------- |
| ReadOnlyText | No (NA) | A control to render HTML text | div class="readOnlyText" |
| TextArea | No | A control to render a multi-lines text input | textarea class="textAreaControl" |
| Text      | Yes | A control to render a single line text input | input "type": "text"|
| Number   | Yes | A control to render a single number input | input "type": "text"|
| DateTime   | Yes | A control to render a date time or a date input (based on attribute showTime) | input type="datetime-local" or input type="date" |
| SingleChoice   | No (NA) | A control to render a single choice input - typically rendered as a checkbox or ON/OFF item | input type="checkbox" |
| MultipleChoices   | No (NA) |  A control to render a multi-choice input.  The user can only selects one of the choice - typically rendered as a dropdown | select |
| MultipleChoicesMultiSelect | No (NA) | A control to render a multi-choice input.  The user can select 1 to all of the choice | select multiple |
| YesNo   | No (NA) | A control to render a binary yes - no choice.  This is a short cut to creating a multi choices control with yes and no values | select with 2 values, yes and no |
| FileUpload   | No | A control to render a file upload control.  | input type="file" with appropriate label |
| MultiExpenses   | Yes | An example to render a complex control (see below for details on simple vs complex controls).  | It contain 3 primitive UI elements: an expense type selector, an expense amount input and a currency selector. |


## Simple Controls

These correspond to a primitive UI element in HTML or mobile platform.  For example, a Text UI type can be rendered as 
an HTML input tag, or a MultiChoice ui type can be rendered as a dropdown using a "select" html tag.
Note: the CSC can decide to render the MultiChoice as a custom list that the user can click on.

No matter how the UI type is rendered, a simple control has only one input (a string, some numbers, a Boolean, ect…), thus the CSC will be responsible for storing one answer for each simple controls.  The UI control specifies where to store the data in the field UIControl.fieldName

## Multiple Instance Controls

Sometimes we don’t know in advance how many inputs there will be for a specific field.  
A good example would be asking for first name of all children.  There may be the need for 1 input or 2 inputs or 3 or more.
In this case, the UI control is specified with the attribute multiple.

We also call these kinds of controls ArrayTypeInputs as the answers will be stored in an array.

The array will be saved in the project data as specified by the UI control specified using the field UIControl.fieldName

For more information check the reference implementation function renderMultipleChoicesInput at https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js

## Complex Controls

These controls are characterized as:

1. We need to render a more sophisticated UI control containing multiple primitive UI elements 
   per entry.  For example, an expense claim entry may have both an expense type and an 
   expense amount; so the complex control would contain both a selector control for the type
   and a currency input control.

2. There can be multiple entries and the number of entries are not known in advance.  Again, a good example is an expenses question.  The user may have 2 items to claim or may have 10.  
For each item to claim, there is a choice input for the type of expense, a number input for the amount and a choice 
for the currency.  The complex control would typically display a button to let the user add another entry on demand.

We also call this type of controls ArrayTypeInputs as the answers will be stored in an array.
The array will be saved in the project data as specified by the UI control specifies using the field UIControl.fieldName

For more information check the reference implementation function renderExpenseInput at https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js


# Controls Reading Data from External Data Sources

When you implement your own CSC, you may want to support UIControls that populate the control from a datasource.  
This is particularly useful for list of items, for example a dropdown list, when the list of options already exists 
somewhere else, and you don’t want to duplicate it in Corticon.

Or perhaps the list is changing so frequently that you want to make sure the user always get the list 
from an external data source (for example a set of exchange rate).

The decision service can specify an external data source with the property UIControl.dataSource.

To see an example of what you need to implement, check the MultiChoice renderer (function renderMultipleChoicesInput in  https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js)

There are 2 working modes in this example:
1. Default mode: The REST service produces JSON with the field names “value” and “displayName” for the option value and text respectively.
2. Mapping mode: The field names are different and the mapping are specified in these 2 properties:
      UIControl.dataSource.dataSourceOptions.dataValueField
      UIControl.dataSource.dataSourceOptions.dataTextField

# Stages

Stage: a unique identifier representing where the flow currently is at in the state machine.

## In the Request

When the CSC makes a request to the decision service it asks for a specific stage to render by specifying 
UI.currentStageNumber.

On the request, the CSC tells the decision service the current stage number to execute. 
The decision service will respond with the corresponding to the current UI to render.

## In the Response

There are 3 attributes in the decision service JSON results that deal with stages:
* currentStageNumber: The decision service tell the CSC the current stage number it has executed.  
  The CSC shouldn't do anything special with it.  It is mostly useful for troubleshooting.
* currentStageDescription: An optional string.  Again, the CSC shouldn't do anything special with it.  It is mostly useful for troubleshooting.  
* nextStageNumber: This is the stage number the CSC specifies when calling the decision service for the next step. 



