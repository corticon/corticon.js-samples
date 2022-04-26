# Client Side Component (CSC)

It is responsible for rendering the UI Controls (questions, labels, descriptions, validation messages…), collecting the 
data entered along the flow (the answers), and moving to the next steps when the user asks for it.  

It does so by:
1.	Invoking the DS at both the start of the flow and at each step in the flow.  The DS returns a JSON payload with all 
      the necessary data to proceed for the entire step.
2.	Maintaining the state of the flow.  That is, the state machine representing the flow is maintained by the CSC and 
      not by the DS (The DS is stateless).
3.	Exiting when the end of the flow is reported by the DS. 
      
All of this can be implemented in a generic fashion so that the same CSC can be reused on different pages and with 
different use cases.

# Using the Pre-Built CSC

We provide a CSC based on Plain Html and JQuery.  It is a very lightweight component.  It is a reference implementation.

You are welcome to use it as is or augment it or change it to fit your need.
The component is available at https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms/CSC/clientSideComponent
You can run it out of the box using https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html

Whether you use it directly, or you want to leverage a different technology like React or Angular or Vue, it is a good place to start
to understand what to do.


# Returned Payload from DS

The DS returns a JSON payload containing an array with 2 elements.  
Each of the element represents top level entities from the Corticon model.  

The item at index 0 is the UI model.  

The item at index 1 is the data for the specific use case.  We call this the project data.  It contains:
1.	Initial data to pass to the first step of the flow (initialization data for this specific flow session).  For example, this could be contextual information about a user (first name, last name, preferred language…).  In an insurance claim that could be the type of insurance the user has, ect…
2.	Accumulated answers along the flow.
3.	Additional data created by the DS along the flow.  For example, the DS can compute the total expenses amount in one step and then use that total in another step to decide to skip some questions based on whether the total is less than say $1000.

Note: In the rest of this document when we reference an item as UI.fieldName we mean to reference the top level entity item at index 0 from the payload (that is UI.fieldName is a short hand notation for payload[0].fieldName).

# State Machine

How does the CSC maintain the state of the overall flow?
It does so by:
1. Keeping a variable for the current stage to execute and setting the next stage to execute based on instructions from the DS.  Specifically, the DS sets the attribute UI.nextStageNumber to specify the next step in the flow.  Thus, when the CSC is ready for the next step in the flow, it invokes the DS by setting UI.currentStageNumber to UI.nextStageNumber in the input payload of the DS.
2. Keeping a variable to an object literal for the set of data (answers) entered at each step.  
   The answers are stored in specific fields, again as specified by the DS. Specifically, the field is specified in each UIControl as field UIControl.fieldName.      
3. Upon receiving a “done” instruction from the DS (a notification of the end of the flow), it is expected the collected data will be passed to another function or process; typically an event will be raised with a pointer to the JSON data collected during the flow.  Specifically, this is specified in the UI.done attribute.

It’s important to keep in mind that the DS does not maintain any state.

Another way to look at that is:
1. The CSC does not know the questions to be asked and what the answers mean.  It simply stores the answers as specified by the DS.
2. The DS does not know the current state of the questionnaire but know what to do at each step.

# Storing answers with multiple projects/Multiple DS

As the CSC can be reused across different projects, there is a need to be able to specify where to store the data within the returned JSON payload.

The DS can optionally specify a path to where the data will be stored within the answers object literal.
This is specified with UI.pathToData
When not specified the CSC will write the answers at the root of the object literal.
The CSC is responsible for maintaining the state of the pathToData as it can change between stages but the DS is not responsible for specifying the pathToData at every single step.

# Rendering UI Controls

The CSC receives the list of UI controls to render from the DS JSON payload at the “UI.containers” element.  
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

# Simple Controls

These correspond to a primitive UI element in HTML or mobile platform.  For example, a Text UI type can be rendered as an HTML <input> tag.
Another example: a MultiChoice ui type can be rendered as a dropdown using a "select" html tag.  

Note: the CSC can decide to render the MultiChoice as a custom list that the user can click on.

No matter how the UI type is rendered, a simple control has only one input (a string, some numbers, a Boolean, ect…), thus the CSC will be responsible for storing one answer for each simple controls.  The UI control specifies where to store the data in the field UIControl.fieldName

# Multiple Instance Controls

Sometimes we don’t know in advance how many inputs there will be for a specific field.  
A good example would be asking for first name of all children.  There may be the need for 2 inputs or 3 or more.
In this case, the UI control is specified with the attribute multiple.

We also call these kinds of controls ArrayTypeInputs as the answers will be stored in an array.

The array will be saved in the project data as specified by the UI control specifies using the field UIControl.fieldName

# Complex Controls

Sometimes we need to render a more sophisticated UI control containing multiple primitive UI elements as well as we don’t 
know in advance how many inputs there will be.  

A good example is an expenses question.  The user may have 2 items to claim or may have 10.  
For each item to claim, there is a choice input for the type of expense, a number input for the amount and a choice 
for the currency.

We also call these kind of controls ArrayTypeInputs as the answers will be stored in an array.
The array will be saved in the project data as specified by the UI control specifies using the field UIControl.fieldName

# Controls Reading Data from External Data Sources

When you implement your own CSC, you may want to support UIControls that populate the control from a datasource.  
This is particularly useful for list of items, for example a dropdown list, when the list of options already exists 
somewhere else, and you don’t want to duplicate it in Corticon.

Or perhaps the list is changing so frequently that you want to make sure the user always get the list 
from an external data source (for example a set of exchange rate).

The DS can specify an external data source with the property UIControl.dataSource.

To see an example of what you need to implement, check the MultiChoice renderer (function renderMultipleChoicesInput in  https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js)

There are 2 working modes in this example:
1. Default mode: The REST service produces JSON with the field names “value” and “displayName” for the option value and text respectively.
2. Mapping mode: The field names are different and the mapping are specified in these 2 properties:
      UIControl.dataSource.dataSourceOptions.dataValueField
      UIControl.dataSource.dataSourceOptions.dataTextField

# Stages

Stage: a unique identifier representing where the flow currently is at in the state machine.

## In the Request

When the CSC makes a request to the DS it asks for a specific stage to render by specifying 
UI.currentStageNumber.

On the request, the CSC tells the DS the current stage number to execute. 
The DS will respond with the corresponding to the current UI to render.

## In the Response

There are 3 attributes in the DS JSON results that deal with stages:
* currentStageNumber: The DS tell the CSC the current stage number it has executed.  
  The CSC shouldn't do anything special with it.  It is mostly useful for troubleshooting.
* currentStageDescription: An optional string.  Again, the CSC shouldn't do anything special with it.  It is mostly useful for troubleshooting.  
* nextStageNumber: This is the stage number the CSC specifies when calling the DS for the next step. 


