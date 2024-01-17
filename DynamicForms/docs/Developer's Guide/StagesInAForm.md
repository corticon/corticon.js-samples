# Maintaining State

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

## Communicating Stage in Form between Decision Service and Client

There are 3 attributes in the decision service JSON results that deal with stages:
* `currentStageNumber`: The decision service tell the Test Drive Client the current stage number it has executed.  
  The Test Drive Client shouldn't do anything special with it.  It is mostly useful for troubleshooting.
* `currentStageDescription`: An optional string.  Again, the Test Drive Client shouldn't do anything special with it.  It is mostly useful for troubleshooting.  
* `nextStageNumber`: This is the stage number the Test Drive Client specifies when calling the decision service for the next step. 

#### In the Request

When the Test Drive Client makes a request to the decision service it asks for a specific stage to render by specifying `UI.currentStageNumber`.

On the request, the Test Drive Client tells the decision service the current stage number to execute. The decision service will respond with the corresponding to the current UI to render.


## Returned Payload from Decision Service

The decision service returns a JSON payload containing an array with 2 elements. Each of the element represents top level entities from the Corticon model.  

The item at index 0 is the UI model.  

The item at index 1 is the data for the specific use case.  We call this the project data.  It contains:
1.	Initial data to pass to the first step of the flow (initialization data for this specific flow session).  For example, this could be contextual information about a user (first name, last name, preferred language…).  In an insurance claim that could be the type of insurance the user has, ect…
2.	Accumulated answers along the flow.
3.	Additional data created by the decision service along the flow.  For example, the decision service can compute the total expenses amount in one step and then use that total in another step to decide to skip some questions based on whether the total is less than say $1000.

Note: In the rest of this document when we reference an item as `UI.fieldName` we mean to reference the top level entity item at index 0 from the payload (that is `UI.fieldName` is a short hand notation for payload[0].fieldName).