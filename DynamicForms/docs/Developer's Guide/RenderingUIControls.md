# Rendering UI Controls

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

For examples of actual payloads, run the test driver client, select the kitchen sink sample and look at the trace panel.

Here is an example for stage 2 of the kitchen sink sample:

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


## Simple Controls

These correspond to a primitive UI element in HTML or mobile platform.  For example, a Text UI type can be rendered as 
an HTML input tag, or a MultiChoice ui type can be rendered as a dropdown using a "select" html tag.

> Note: the CSC can decide to render the MultiChoice as a custom list that the user can click on.

No matter how the UI type is rendered, a simple control has only one input (a string, some numbers, a Boolean, ect…), thus the CSC will be responsible for storing one answer for each simple controls.  The UI control specifies where to store the data in the field `UIControl.fieldName`

## Complex Controls
Sometimes we don’t know in advance how many inputs there will be for a specific field.  
A good example would be asking for first name of all children.  There may be the need for 1 input or 2 inputs or 3 or more.
In this case, the UI control is specified with the attribute multiple.

We also call these kinds of controls `ArrayTypeInputs` as the answers will be stored in an array.

The array will be saved in the project data as specified by the UI control specified using the field `UIControl.fieldName`

These controls are characterized as:

1. We need to render a more sophisticated UI control containing multiple primitive UI elements per entry.  For example, an expense claim entry may have both an expense type and an expense amount; so the complex control would contain both a selector control for the type and a currency input control.

2. There can be multiple entries and the number of entries are not known in advance.  Again, a good example is an expenses question.  The user may have 2 items to claim or may have 10. For each item to claim, there is a choice input for the type of expense, a number input for the amount and a choice for the currency.  The complex control would typically display a button to let the user add another entry on demand.

We also call these types of controls `ArrayTypeInputs`, as the answers will be stored in an array. The array will be saved in the project data as specified by the UI control specifies using the field `UIControl.fieldName`

For more information check the reference implementation function renderExpenseInput at https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js

