Validations
There are 2 kinds of validations:

1. Those which are defined directly in UI control itself,  and can thus be directly enforced by the CSC. For this validation, the CSC does not need to call the Decision Service for validation. It can enforce the validation directly based on various attributes sets on the UIControl and the type of UIControl. For examples, we may set an input field as required or we may want a number field where the valid data is between 1 and 20. These are specified in the Decision Service model using the UIControl.required and UIControl.min and UIControl.max attributes respectively:

```
UI.containers.uiControls += UIControl.new[type='Number', min=1, max=200, label='Number 1', id='number1 Id', fieldName='number1']
```

2) The second kind is validation that can only be enforced by the Decision Service (remember the Client Side Component is generic, while the Decision Service is use case specific). The Decision Service can implement simple to very complex business rules to infer that some answers may not be valid using all the data available to it (That is data from previously entered user inputs, external data and initial data). And that validation may be conditional to various paths or various conditions. For example, validating that a claim cannot exceed some amount because the sum of all current claim exceeds the maximum for the month.
