# Using the Template Vocabulary

In order for the front end UI to know how to interpret a message from the decision service, they must work from the same data model. In the pre-built template form, all of the following data elements can be used when building the rules, and the front end component will understand the directions.

## UI


Description: The entity UI is the ‘parent’ entity, returned at index 0, which will guide things like where we are in the form, when the form is complete, and where to store the accrued data. See table below for full scope of available out of the box options. Items with an asterisk are required.


### pathToData


Data Type: _Any alphanumeric string will be accepted, but in order to use user-selected responses to dynamically change form behavior in future steps, this should be set to an entity in the vocabulary that will accrue the data_
  
Description: We define which data we want to store by specifying in the initial stage of the rules which vocabulary entity should ‘store’ the data accrued throughout the form. This is specified with `UI.pathToData` in an initial stage, in this case, it will be the `AutoQuote` entity. The `pathToData` entity will be at index 1 in the JSON. The stored data can then be passed along to other workflow steps once the form is complete, or used to define a conditional rule at a later stage in the form.


### noUiToRenderContinue


Data Type: _T/F_


Description: Set to ‘T’ for any stages where no UI needs to be rendered, but some action (a decision/calculation/augmentation of separate rulesheet) needs to be executed. Does not need to be set to ‘F’ when this is not the case.


![](../images/noUItoRender.png)
```hover mouse to copy
UI.noUItoRender
```

### done


Data Type: _T/F_

Description: Upon receiving a done instruction from the decision service (a notification of the end of the flow) via `UI.done=T`, it is expected the collected data will be passed to another function or process; typically an event will be raised with a pointer to the JSON data collected during the flow.



### **Rule Definition**

![](../images/UIdone.png)

### **Copy these rules**

```
UI.done
```

### nextStageNumber


Data Type: _Integer_

Where to specify: **Action** row of rulesheet

Description: The decision service sets the attribute `UI.nextStageNumber` to specify the next step in the flow, unless it is the last stage, in which case this field is left null and done is set to ‘true’


![](../images/nextStageNumber.png)


### currentStageNumber


Data Type: _Integer_

Where to specify: **Filter** panel of rulesheet, in advanced view

Description: When the client side rendering component is ready for the next step in the flow, it invokes the decision service by setting UI.currentStageNumber to `UI.nextStageNumber` in the input payload of the decision service.


![](../images/currentStageNumber.png)


###  Language

Data Type: _String_

Description: On start, the rendered can accept the language from the UI but a decision service may switch the language based on some rules

---


## Container 
`UI.containers`

Description: For all steps in which something is being presented to the user (versus just a calculation/decision made in the background), the decision service will specify the list of UI controls to render from the decision service JSON payload at the UI.containers element. This is an array of all the containers to render for this stage. The container can be viewed as a panel containing various labels and input fields. The container has various attributes, for example a title.


### validationMsg


Data Type: _Alphanumeric string_

Description: Creates a container wide validation message


### description

Data Type: _Alphanumeric string_

Description: An optional string that doesn’t impact behavior of the form. It is mostly useful for troubleshooting.


### id


Data Type: _Any unique alphanumeric string_

Description: Required if any container is being rendered.


### title


Data Type: _Alphanumeric string_

Description: Renders the h3 header on Container entity


![](../images/createContainer.png)

---


## UIControl 
`UI.containers.uiControls`

Description: Each UI control element has multiple attributes. The most important one is the type attribute as it allows the client-side component to know what kind of control to render and which necessary attributes to access based on the type. See table below for full scope of available out of the box options. Items with an asterisk are required.


### type


Description: The specific type of UI Control. In the out of the box test driver, the following UI Controls / specifications are defined:

- `type = ‘Text’`

   Description:    Single line text field input


### **Rule Definition**

![](../images/text_rule.png)

### **Rendered Rules**

![](../images/text_rendered.png)

- `type = ‘TextArea’`
  
  Description:   Multi-lines text input

### **Rule Definition**

![](../images/text_area_rules.png)

### **Rendered Rules**

![](../images/text_area_rendered.png)

- `type = ‘SingleChoice’`
  
   Description:    Renders as a checkbox with value stored as T/F
    
### **Rule Definition**

![](../images/singlechoice.png)

### **Rendered Rules**

![](../images/singlechoice-rendered.png)


- `type = ‘MultipleChoices’`

   Description:  Multiple choice dropdown. Options must be specified either by pointing to a JSON datasource or defining the options in a subsequent rulesheet.
    

### **Rule Definition**

![](../images/multiple_choices_rules.png)

### **Rendered Rules**

![](../images/multiple_choices_rendered.png)



- `type = ‘Number’`

  Description:   Single number input
    

### **Rule Definition**

![](../images/number_rules.png)

### **Rendered Rules**

![](../images/number_rendered.png)



- `type = ‘DateTime’`

  Description:   Date picker
    

### **Rule Definition**

![](../images/date_time_rules.png)

### **Rendered Rules**

![](../images/date_time_rendered.png)


- `type = ‘ReadOnlyText’`

   Description:  A control to render HTML text


### **Rule Definition**

![](../images/readOnlyText.png)

### **Rendered Rules**

![](../images/readOnlyText_render.png)


- `type = ‘YesNo’`

  Description:   Dropdown of Yes or No, stored as Yes or No
    
    

### **Rule Definition**

![](../images/yes_no_rule.png)

### **Rendered Rules**

![](../images/yes-no_rendered.png)



- `type = ‘YesNoBoolean’`

  Description:   Dropdown of Yes or No, stored as T or F
    

### **Rule Definition**

![](../images/yes_no_boolean_rule.png)

### **Rendered Rules**

![](../images/yes-no_rendered.png)



- `type = ‘FileUpload’`

   - Description:  A control to render a file upload control.
    

### **Rule Definition**

![](../images/file-upload-expense.png)

### **Rendered Rules**

![](../images/file_upload_rendered.png)



- `type = ‘MultiExpenses’`

   Description:  List of financial line items. It contain 3 primitive UI elements: an expense type selector, an expense amount input and a currency selector.


### **Rule Definition**
![](images//multiexpense%20rule.png)

### **Rendered Rules**
![](images//multiexpense%20rendered.png)



- `type = ‘MultipleChoicesMultiSelect’`

    Description: Similar to MultipleChoices, but allows for multiple selected options




### **Rule Definition**

![](../images/MultipleChoicesMultiSelect_rule.png)



### **Rendered Rules**

![](../images/MultipleChoicesMultiSelect_rendered.png)

### **Copy these rules**
```hover mouse to copy
UI.containers.uiControls += UIControl.new[type='MultiExpenses', label='Enter all the expenses', id='crtl8_1', fieldName='Step8Field1']
UI.containers.uiControls.option += Option.new[value='hotelCode', displayName='Hotel']
UI.containers.uiControls.option += Option.new[value='carRentalCode', displayName='Car Rental']
UI.containers.uiControls.option += Option.new[value='airfareCode', displayName='Airfare']

UI.nextStageNumber
UI.currentStageDescription = 'This is implemented in Step8.ers' 

```




### fieldName



`fieldName = entity_assigned_as_pathToData.attribute`

   Description: The UI control specifies where to store the data in the field UIControl.fieldName. For example, if we want to store the value of a person’s date of birth in a field called dob, within a JSON object called `Person`, we would first need to set (either in this stage or a preceding one) the `UI.pathToData = 'Person'` and then we could define the UI Control’s `fieldName` to be ‘dob’. This would hold the value selected for the dob in the JSON object as follows: 

   `"Person":{
      "dob":"MM/DD/YYYY"
   }`


### id


Data Type: _Any unique alphanumeric string_

Description: Unique identifier (within the context of one container) for the UI control.



Example: `UI.containers.uiControls += UIControl.new [id = 'dietary_restrictions', type = 'MultipleChoices', label =  'Do you have any dietary restrictions?', fieldName = 'has_dietary_restrictions']`


### dataSource


Data Type: _URL pointing to JSON formatted data_

Description: Specifies the datasource to populate MultipleChoices dropdown options from. Value field at the JSON endpoint must have the key value, display name must have the value `displayName`. If not the case for either of these, these can be overridden by specifying a child entity `‘DataSourceOptions’`


![](../images/datasource.png)


### max


Data Type: _Integer_

Description: Optionally give the rendering component for this UI Control a numeric maximum


### min


Data Type: _Integer_

Description: Optionally give the rendering component for this UI Control a minimum numeric value end user can enter


![](../images/min.png)


### minDT


Data Type: _Date_

Description: Optionally give the rendering component for this UI Control a minimum date value end user can enter


### maxDT


Data Type: _Date_

Description: Optionally give the rendering component for this UI Control a maximum date value end user can enter


[](../images/maxDt.png)


###  defaultValue


Data Type: _Alphanumeric string_

Description: Optionally give the rendering component for this UI Control a placeholder default value


### multiple


Data Type: _T/F_

Description: When there could be any number of responses to a prompt, set this to true. The answers are stored in an array pointed as specified by `fieldName` attribute.


### tooltip


Data Type: _Alphanumeric string_

Description: Optionally give the rendering component for this UI Control a tooltip to assist end user


### label


Data Type: _Alphanumeric string_

Description: Content of the prompt provided by the UI Control


### rows


Data Type: _integer_

Description: HTML textarea rows attribute


### required


Data Type: _T/F_

Description: Whether the user filling out the form is required to respond to this prompt


### validationErrorMsg


Data Type: _Alphanumeric string_

Description: Creates validation message for individual UI Control


### cols


Data Type: _integer_

Description: HTML textarea cols attribute


### value


Data Type: _Alphanumeric string_

Description: The content of a `ReadOnlyText` UI Control


![](../images/readOnlyText.png)


###  labelPosition


Data Type: _‘Above’, ‘Side’_

Description: Optionally instruct the rendering component where to place the `label` for this UI Control


### sortOptions


Data Type: _‘A to Z’, ‘Z to A’_

Description: Optionally instruct the rendering component how to sort the list of options applied to this UI Control

## DataSourceOptions
 `UI.containers.uiControls.dataSourceOptions`

   When using the MultipleChoices UI Control, the actual choices can be populated from a JSON endpoint or be specified by the rule modeler. For the first option, the rule modeler must specify a URL on the field `UIControl.dataSource`. The default client renderer will look for the options at that endpoint under the `value` and `displayName` field. So if the endpoint looks like this, then you’re good to go:


![](../images/formattedJSON.png)


  If the JSON data has different keys, such as shown below, the client renderer must be told which field is going to serve as the value field and which as the displayName field—these can be, and often are, the same. These are specified with the DataSourceOptions entity.


![](../images/unformattedJsonEnd.png)


---



### dataTextField


Description: Optionally define the key name to use as the display name for this option from dropdown, if its name isn’t `displayName`. Oftentimes this will be the same as the `dataValueField` field.


![](../images/dataTextField.png)


### dataValueField


Description: Optionally define the name of the key whose value should be stored should end user select this option from dropdown, if its name isn’t value. Oftentimes this will be the same as the `dataTextField` field.


![](images//dataValueField.png)


### pathToOptionsArray


Description: Optionally define where in a JSON endpoint is the array of options to populate a dropdown list with


### **Rule Definition**
![](../images/pathToOptionsArray.png)

### **Copy this rule**
```
data.pathToOptionsArray='$.[?(@.brand== \'' + AutoQuote.vehicle_make + '\' )]'
```


## Option 
`UI.containers.uiControls.option`

Description: When the rule modeler is defining the list of dropdown options, they can do so with the `Option` entity.


### displayName


Description: The displayed option within a multiple-choice dropdown. When selected, it is stored as the corresponding value under the attribute assigned `UIControl.fieldName`


### value


Description: The value stored in the `pathToData.fieldName` when user selects corresponding displayName.


![](../images/manualOptions.png)


