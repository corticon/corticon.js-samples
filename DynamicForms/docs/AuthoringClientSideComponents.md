# Introduction 

Decision Service (Rules Based Questions)

The DS is composed of a series of Corticon rulesheets and at least one ruleflow including the rulesheets.  
The main responsibilities of the DS is to specify:
1. The flow of the questions (step by step).  
2. For each step, either:
    * What UI controls to render (questions to ask) 
    * Implement some business logic or computation before executing the next step
3. Where to store the accumulated data entered by the user or data computed at various steps.


A step is typically implemented with one or more rulesheets.

A single rulesheet specifies 3 main items:
1.	It creates 1 or more container to host the UI controls (This can be viewed as the panel that will contain the questions).
2.	It adds to the container, 1 or more UI controls.  There are various types of controls available.  See the UIControlType enumeration in Corticon.js vocabulary custom data types.  For examples, one can create a text input or a numeric input or a single choice (dropdown list) or multiple choices (checkboxes) or readonly text.
3.	It sets the next step to execute in the flow using the stage attribute.  At the end of the flow, it also sets the done flag.
