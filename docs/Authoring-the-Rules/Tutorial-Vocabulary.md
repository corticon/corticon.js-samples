# The Rule Vocabulary

Each of the vocabulary entities (`UI`, `UIControl`, `AutoQuote` etc) represents part of a JSON array that will be passed between the form’s presentation layer and the embedded Corticon.js decision service (a JavaScript bundle which will always be generated with the name decisionServiceBundle.js). Each attribute underlying the entities (`AutoQuote.state`, `Driver.credit_score`, etc) represents a key/value pair.

In any given use case, some of the values specified within the JSON array will only be used occasionally, and the majority of the values are relevant only ephemerally, i.e., it is unnecessary to document in the final policy quote to report that at the first stage in the application, we presented to the user each of these 50 states—we just need the actual value that was selected.


### Vocabulary Elements for Form Definition
#### `UI`
The entity UI is the ‘parent’ entity, returned at index 0, which will guide things like where we are in the form, when the form is complete, and where to store the accrued data. See table below for full scope of available out of the box options. Items with an asterisk are required.

|**Attribute name**|**Acceptable Values**|**Description**|
| :-: | :-: | :-: |
|**pathToData**|Any alphanumeric string will be accepted, but in order to use user-selected responses to dynamically change form behavior in future steps, this should be set to an entity in the vocabulary that will accrue the data|<p>We define which data we want to store by specifying in the initial stage of the rules which vocabulary entity should ‘store’ the data accrued throughout the form. This is specified with `UI.pathToData` in an initial stage, in this case, it will be the `AutoQuote` entity. The `pathToData` entity will be at index 1 in the JSON. The stored data can then be passed along to other workflow steps once the form is complete, or used to define a conditional rule at a later stage in the form.</p><p></p><p>![Alt text](../assets/pathToData.png)</p><p></p>|
|<p>**noUiToRenderContinue**</p><p></p>|T/F|<p>Set to 'T' for any stages where no UI needs to be rendered, but some action (a decision/calculation/augmentation of separate rulesheet) needs to be executed. Does not need to be set to 'F' when this is not the case.</p><p></p><p>![Alt text](../assets/noUItoRender.png)</p><p></p>|
|**done**|T/F|<p>Upon receiving a done instruction from the decision service (a notification of the end of the flow) via `UI.done=T`, it is expected the collected data will be passed to another function or process; typically an event will be raised with a pointer to the JSON data collected during the flow.</p><p>![Alt text](../assets/UIdone.png)</p><p></p>|
|**nextStageNumber**|Integer|<p>The decision service sets the attribute `UI.nextStageNumber` to specify the next step in the flow, unless it is the last stage, in which case this field is left null and `done` is set to 'true'</p><p></p><p>![Alt text](../assets/nextStageNumber.png)</p><p></p>|
|**currentStageNumber**|Integer|<p>When the client side rendering component is ready for the next step in the flow, it invokes the decision service by setting `UI.currentStageNumber` to `UI.nextStageNumber` in the input payload of the decision service.</p><p></p><p>![](../assets/currentStageNumber.png)</p><p></p>|
|**language**||On start, the rendered can accept the language from the UI but a decision service may switch the language based on some rules|

#### *Container (UI.containers)*
For all steps in which something is being presented to the user (versus just a calculation/decision made in the background), the decision service will specify the list of UI controls to render from the decision service JSON payload at the `UI.containers` element. This is an array of all the containers to render for this stage. The container can be viewed as a panel containing various labels and input fields. The container has various attributes, for example a title.


|**Attribute name**|**Acceptable Values**|**Description**|
| :-: | :-: | :-: |
|**validationMsg**|Alphanumeric string|Creates a container wide validation message|
|**description**|Alphanumeric string|An optional string that doesn't impact behavior of the form. It is mostly useful for troubleshooting.|
|**id\***|Any unique alphanumeric string|Required if any container is being rendered.|
|**title\***|Alphanumeric string|h3 header on Container|

<p align="center">  <img src="https://cdn.jsdelivr.net/gh/corticon/documentation@main/docs/assets/createContainer.png" />
</p>

#### *UIControl (UI.containers.uiControls)*
Each UI control element has multiple attributes. The most important one is the `type` attribute as it allows the client-side component to know what kind of control to render and which necessary attributes to access based on the type. See table below for full scope of available out of the box options. Items with an asterisk are required.


|**Attribute name**|**Acceptable Values**|**Description**|
| :-: | :-: | :-: |
|**type\***||<p>The specific type of UI Control. In the out of the box test driver, the following UI Controls / specifications are defined:</p><p></p>|
||type = 'Text'|Single line text field input|
||type = ‘TextArea’|Multi-lines text input|
||type = 'SingleChoice'|Renders as a checkbox with value stored as T/F|
||type = 'MultipleChoices'|Multiple choice dropdown. Options must be specified either by pointing to a JSON datasource or defining the options in a subsequent rulesheet.|
||type = 'Number'|Single number input|
||type = 'DateTime'|Date picker|
||type = 'ReadOnlyText'|A control to render HTML text|
||type = 'YesNo'|Dropdown of Yes or No, stored as Yes or No|
||type = 'YesNoBoolean'|Dropdown of Yes or No, stored as T or F|
||type = 'FileUpload'|A control to render a file upload control.|
||type = 'MultiExpenses'|List of financial line items. It contain 3 primitive UI elements: an expense type selector, an expense amount input and a currency selector.|
||type = 'MultipleChoicesMultiSelect'|Similar to MultipleChoices, but allows for multiple selected options|
|**fieldName\***|fieldName = `entity_assigned_as_pathToData.attribute` |The UI control specifies where to store the data in the field `UIControl.fieldName`. For example, if we want to store the value of a person's date of birth in a field called `dob`, within a JSON object called `Person`, we would first need to set (either in this stage or a preceding one) the `UI.pathToData = 'Person'` and then we could define the UI Control's `fieldName` to be 'dob'. This would hold the value selected for the `dob` in the JSON object as follows: `"Person" : { "dob" : "MM/DD/YYYY" }`|
|**id\***|Any unique alphanumeric string|Unique identifier (within the context of one container) for the UI control.|
|**dataSource**|URL pointing to JSON formatted data |<p>Specifies the datasource to populate MultipleChoices dropdown options from. Value field at the JSON endpoint must have the key `value`, display name must have the value `displayName`. If not the case for either of these, these can be overridden by specifying a child entity ‘DataSourceOptions’</p><p></p><p>![](../assets/datasource.png)</p><p></p>|
|**max**|Integer|Optionally give the rendering component for this UI Control a numeric maximum|
|**min**|Integer|<p>Optionally give the rendering component for this UI Control a minimum numeric value end user can enter</p><p></p><p>![](../assets/min.png)</p><p></p>|
|**minDT**|Date|Optionally give the rendering component for this UI Control a minimum date value end user can enter|
|**maxDT**|Date|<p>Optionally give the rendering component for this UI Control a maximum date value end user can enter</p><p></p><p>![](../assets/maxDt.png)</p><p></p>|
|**defaultValue**|Alphanumeric string|Optionally give the rendering component for this UI Control a placeholder default value|
|**multiple**|T/F|When there could be any number of responses to a prompt, set this to true. The answers are stored in an array pointed as specified by `fieldName` attribute. |
|**tooltip**|Alphanumeric string|Optionally give the rendering component for this UI Control a tooltip to assist end user|
|**label\***|Alphanumeric string|Content of the prompt provided by the UI Control|
|**rows**|integer|HTML textarea rows attribute|
|**required**|T/F|Whether the user filling out the form is required to respond to this prompt|
|**validationErrorMsg**|Alphanumeric string|Creates validation message for individual UI Control|
|**cols**|integer|HTML textarea cols attribute|
|**value**|Alphanumeric string|<p>The content of a `ReadOnlyText` UI Control</p><p></p><p>![Alt text](../assets/readOnlyText.png)</p><p></p>|
|**labelPosition**|‘Above’, ‘Side’|Optionally instruct the rendering component where to place the label for this UI Control|
|**sortOptions**|'A to Z', 'Z to A'|Optionally instruct the rendering component how to sort the list of options applied to this UI Control|

When using the MultipleChoices UI Control, the actual choices can be populated from a JSON endpoint or be specified by the rule modeler. For the first option, the rule modeler must specify a URL on the field `UIControl.dataSource`. The default client renderer will look for the options at that endpoint under the `value` and `displayName` field. So if the endpoint looks like this, then you’re good to go:
<p align="center">  <img src="https://cdn.jsdelivr.net/gh/corticon/documentation@latest/docs/assets/formattedJSON.png" />
</p>

If the JSON data has different keys, such as shown below, the client renderer must be told which field is going to serve as the `value` field and which as the `displayName` field—these can be, and often are, the same. These are specified with the `DataSourceOptions` entity.

 <p align="center">  <img src="https://cdn.jsdelivr.net/gh/corticon/documentation@latest/docs/assets/unformattedJsonEnd.png" />
</p>

#### *DataSourceOptions (UI.containers.uiControls.dataSourceOptions)*


|**Attribute name**|Description|
| :-: | :-: |
|<p>**dataTextField**</p><p></p>|<p>Optionally define the key name to use as the display name for this option from dropdown, if its name isn't `displayName`. Oftentimes this will be the same as the `dataValueField` field.</p><p></p><p>![Alt text](../assets/dataTextField.png)</p><p></p>|
|**dataValueField**|<p>Optionally define the name of the key whose value should be stored should end user select this option from dropdown, if its name isn't `value`. Oftentimes this will be the same as the `dataTextField` field. </p><p></p><p>![](../assets/dataValueField.png)</p><p></p>|
|**pathToOptionsArray**|<p>Optionally define where in a JSON endpoint is the array of options to populate a dropdown list with</p><p></p><p>![](../assets/pathToOptionsArray.png)</p><p></p>|


When the rule modeler is defining the list of dropdown options, they can do so with the Option entity.

#### *Option (UI.containers.uiControls.option)*


|**Attribute name**|**Description**|
| :-: | :-: |
|**displayName**|<p>The displayed option within a multiple-choice dropdown. When selected, it is stored as the corresponding value under the attribute assigned `UIControl.fieldName`</p><p></p>|
|**value**|The value stored in the `pathToData.fieldName` when user selects corresponding `displayName`. |

![](../assets/manualOptions.png)