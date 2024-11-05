# Developer's Overview of Corticon.js Dynamic Forms

- [Developer's Overview of Corticon.js Dynamic Forms](#developers-overview-of-corticonjs-dynamic-forms)
  - [Client Side Component (CSC)](#client-side-component-csc)
    - [Local versus Remote Decision Services](#local-versus-remote-decision-services)
  - [Functionalities of the Client Side Component](#functionalities-of-the-client-side-component)
  - [Returned Payload from Decision Service](#returned-payload-from-decision-service)
  - [Maintaining State throughout the Form](#maintaining-state-throughout-the-form)
- [Storing responses captured in the form](#storing-responses-captured-in-the-form)
- [Rendering UI Controls](#rendering-ui-controls)
  - [Simple Controls](#simple-controls)
  - [Multiple Instance Controls](#multiple-instance-controls)
  - [Complex Controls](#complex-controls)
- [Controls Reading Data from External Data Sources](#controls-reading-data-from-external-data-sources)
- [Stages](#stages)
  - [In the Request](#in-the-request)
  - [In the Response](#in-the-response)

<!-- TOC end -->
---

When we build the dynamic form rules, we're ultimately going to be transpiling the rules into a self-contained JavaScript bundle. In simpler terms, all of the logic will be encapsulated into just one file: decisionServiceBundle.js.

Front end developers handle the 'rendering side' of the form. This includes defining data that will be passed in at the onset of the form, styling, and where the data goes once the form is filled out.

To make everyone's life easier, we provide open source implementations of Corticon.js Dynamic Forms which you can freely download, import into your environment, and adapt to your needs. This includes both sample rule assets that you can work with in Corticon.js Studio, and a sample client side rendering component.

## Client Side Component (CSC)

[Corticon.js](https://www.progress.com/corticon-js) Dynamic Forms are rendered by a reusable, adaptable template we refer to as the Client Side Component (CSC). Using the same CSC, rule authors can create any number of dynamic forms without any front end client changes. This framework of separating the CSC from the rules promotes agility for development teams, as it disentangles the 'instructions' logic for what to present to the user (defined in a Corticon.js decision service) and the code that renders the form based upon these instructions.

The [CSC within this repository](https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms/CSC/clientSideComponent) which you can fork and adapt as needed is based on plain HTML and JQuery. You can likewise test drive the client side form [here](https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html).

Whether you built off the template CSC or you want to leverage a different technology like React or Angular or Vue, it is useful to play around with the prebuilt components.

This is demonstrated using the 'switch samples' dropdown in the test renderer included in the CSC template folder called [client.html](../../CSC/client.html). 

If you are familiar with model/views design patterns, you can consider the CSC to be the view while the model is created and maintained using a Corticon.js decision service.


### Local versus Remote Decision Services

Corticon.js decision services can be referenced by the front end form renderer *in process* (locally within the CSC) or, less commonly used with dynamic forms, the decision service can be exposed as a serverless function. In the latter case, the decision service would be generated as an AWS Lambda function, Azure function, or Google Cloud function, with the front end form invoking the decision service via that cloud endpoint. 

In-process deployments provide essentially instant response time, although there are specific scenarios wherein it may be better to use the serverless function approach:

- **For Mobile Apps**: a decision service hosted remotely can be updated very easily without having to force the user to reinstall the app.
- **Security Context:**
  - Don’t want to expose some of the data used in the decision service.
  - Want to have the decision service access data sources inside the firewall.
  - Don't want to risk exposing the decision service to reverse engineering. When running locally, the decision service file is stored locally too. That said, when you generate a decision service JavaScript bundle from Corticon Studio, the bundle is minified and compressed which makes it very hard to read. The rules as written in Corticon Studio are not written into the bundle, they are converted entirely into JavaScript.

There are only minor distinctions between how the CSC and decision service interactions take place when running in-process or remotely as illustrated in the 2 diagrams below:

<p style="text-align:center;">
<img width="500"  src="../images/LocalDS.png"
 title="Running locally">
<br>
<br>
<img width="500"  src="../images/RemoteDS.png"
 title="Remote decision service">
</p>

## Functionalities of the Client Side Component 

The Client Side Component is responsible for rendering  UI Controls (prompts to the end user, labels, descriptions, validation messages…), collecting the data entered along the flow (the answers), and navigating through the next steps.

It does so by:

1. Invoking the decision service at the very first stage of the form, and each subsequent stage through the form's completion. The decision service returns a JSON payload with all the necessary data to proceed for the entire stage.
2. Maintaining the *state* of the flow. Data is entirely maintained by the CSC, being passed into and changed by the rules in the decision service. The decision service itself is stateless. 
3. Exiting when the end of the flow is reported by the decision service.

All of this is designed entirely to be fully interoperable, as the same CSC can be reused on different pages and with different use cases.

## Returned Payload from Decision Service

The decision service returns a JSON payload containing an array with two elements.
Each of the elements represents top level entities from the Corticon rule vocabulary model.

The item at index 0 provides the UI specific rendering information as directed by the decision service.

The item at index 1 is the data for the specific use case, which we call the project data. The project data contains: 

1. Initialization data to pass to the first step of the form.  For example, this could be contextual information about a user (first name, last name, preferred language…). 
2. The users' responses to prompts from preceding stages in the form.
3. Data produced automatically by the decision service at stages through the form.  For example, the decision service might compute the total expenses amount in one stage, then depending on if the total of those expenses exceeds $1000, then generate/skip additional follow up prompts for the user.

```
[{
    "currentStageNumber": 0,
    "pathToData": "Person",
    "containers": {
        "id": "q2",
        "uiControls": {
            "fieldName": "age",
            "id": "question_1",
            "label": "Please enter your age.",
            "type": "Number"
        },
        "title": "Please select your sex"
    },
    "nextStageNumber": 1
}]
```


Note: In the rest of this document, when we reference an item as `UI.fieldName`, we are referring to the top level entity item at index 0 from the payload (in other words, `UI.fieldName` is a short hand notation for `payload[0].fieldName`).

## Maintaining State throughout the Form

How does the CSC capture, accrue, and change data throughout the end user's session filling out the form? It does so by:

1. Maintaining and updating an identifier that specifies the *current* stage to execute and the *next* stage to execute. Both the decision service and the CSC play a role here-- the decision service defines what to present to the user at a given stage, and sets the attribute `UI.nextStageNumber` to specify the next step in the form. When the end user progresses from one stage to another, the CSC replaces the value of `UI.currentStageNumber` with the value of `UI.nextStageNumber`.
2. Keeping a variable to an object literal for the new data produced throughout the form either through end user responses to prompts, or data produced by rules automatically. Any time a rule author developing a form defines a UIControl to present to an end user at a given stage, they likewise defines the name of the field under which to 'store' that response by specifiying that field's name under `UIControl.fieldName`.
3. Upon receiving a `UI.done=T` instruction from the decision service (a notification of the end of the flow), it is expected the collected data will be passed to another function or process; typically an event will be raised with a pointer to the JSON data collected during the flow. 

It’s important to keep in mind that the decision service does not maintain any state.

Another way to look at that is:

1. The CSC does not know the questions to be asked and what the answers mean.  It simply stores the answers as specified by the decision service.
2. The decision service does not know the current state of the questionnaire but knows what to do at each step.

# Storing responses captured in the form

The decision service can optionally specify a path to where the data will be stored within the answers object literal.
This is specified with `UI.pathToData`
When not specified, the CSC will write the answers at the root of the object literal.
The CSC is responsible for maintaining the state of the `pathToData` as it can change between stages, but the decision service doesn't need to specify the pathToData at every single stage--its value will be retained through the course of the form unless overwritten.

# Rendering UI Controls

The CSC receives the list of UI controls to render from the decision service JSON payload at the `UI.containers` element.
This is an array representing the container to render for this stage.
The container is effectively the pane in the screen on the front end within which all of the prompts throughout the form will be rendered. 
The container has various attributes, some required and some optional. 
In any case when a container is being rendered, though, it will be rendering >= 1 UI Control within the container-- at `UI.containers.uiControls`.
Each UI control element has multiple attributes.  The most important one is the type attribute as it allows the CSC
to know what kind of control to render and which necessary attributes to access based on the type.
For example a UI control type “Number” can have a min and max number associated with it to provide data validation.

The data the CSC receives is structured like this:

```
"uiControls": {
      "fieldName": "age",
      "min": "0.000000",
      "max": "110.000000",
      "id": "question_1",
      "label": "Please enter your age.",
      "type": "Number"
  }
```

For examples of actual payloads, run the [test driver client](../../CSC/client.html), select the canonical sample and look at the trace panel.

Here is an example for stage 2 of the 'Test all UI Controls' sample:

```
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
    "timestamp": "2024-04-25T15:39:33.534Z",
    "status": "success"
  }
}
```

## Simple Controls

These correspond to a primitive UI element in HTML or mobile platform.  For example, a Text UI type can be rendered as
an HTML input tag, or a MultipleChoices UI type can be rendered as a dropdown using a "select" html tag.

No matter how the UI type is rendered, a simple control has only one input (a string, some numbers, a Boolean, ect…), thus the CSC will be responsible for storing one answer for each simple controls.  The UI control specifies where to store the data in the field `UIControl.fieldName`.

## Multiple Instance Controls

Sometimes we don’t know in advance how many inputs there will be for a specific field.
A good example would be asking for first name of all children. There may be the need for 1 input or 2 inputs or 3 or more.
In this case, the UI control is specified with the attribute multiple in the rule vocabulary. In the CSC rendering code, these are defined as ArrayTypeInputs, as the answers will be stored in an array.

The array will be saved in the project data as specified by the UI control specified using the field `UIControl.fieldName`

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
The array will be saved in the project data as specified by the UI control specifies using the field `UIControl.fieldName`

For more information check the reference implementation function [renderExpenseInput](../../CSC/clientSideComponent/dynForm/uiControlsRenderers.js).

# Controls Reading Data from External Data Sources

When you implement your own CSC, you may want to support UIControls that populate the control from a datasource.
This is particularly useful for list of items, for example a dropdown list, when the list of options already exists
somewhere else, and you don’t want to duplicate it in Corticon.

Or perhaps the list is changing so frequently that you want to make sure the user always get the list
from an external data source (for example a set of exchange rate).

The decision service can specify an external data source with the property `UIControl.dataSource`.

To see an example of what you need to implement, check the MultiChoice renderer (function renderMultipleChoicesInput in  https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js)

There are 2 working modes in this example:

1. Default mode: The REST service produces JSON with the field names “value” and “displayName” for the option value and text respectively.
2. Mapping mode: The field names are different and the mapping are specified in these 2 properties:
   `UIControl.dataSource.dataSourceOptions.dataValueField`
   `UIControl.dataSource.dataSourceOptions.dataTextField`

# Stages

Stage: a unique identifier representing where the flow currently is at in the state machine.

## In the Request

When the CSC makes a request to the decision service it asks for a specific stage to render by specifying
`UI.currentStageNumber`.

On the request, the CSC tells the decision service the current stage number to execute.
The decision service will respond with the corresponding to the current UI to render.

## In the Response

There are 3 attributes in the decision service JSON results that deal with stages:

* `currentStageNumber`: The decision service tell the CSC the current stage number it has executed.The CSC shouldn't do anything special with it.  It is mostly useful for troubleshooting.
* `currentStageDescription`: An optional string.  Again, the CSC shouldn't do anything special with it.  It is mostly useful for troubleshooting.
* `nextStageNumber`: This is the stage number the CSC specifies when calling the decision service for the next step.

