# Solar Installation Cost Computation

## Introduction

This demo illustrates computing a solar installation cost estimate, the rebate the user could get, how much savings they would get yearly 
and get some loan offers to finance the installation.
 
It is a Web and Cloud Serverless application that integrates Corticon.js with AWS Step Functions. 
The aim of this sample is to show composite applications.  By composite applications, we mean applications that mesh 
together various services to compose a main application. 
Additionally, we aim to demonstrate composing the application using several discrete (more atomistic) decision services that do 
a specific job well; as opposed to having a single, much larger decision service that gathers data and compute all the results.

To demonstrate these concepts, our demo app links together several Corticon.js Decision Services and Rest Services in an AWS Step 
functions workflow using a non-trivial use case.

Limitations: The application is programmed for a couple of US states, namely CA, MA and NY.

## How does the application work?

The application has the following architecture:
- The UI is a Web Browser application
- An AWS API Gateway entry point to kick start the workflow.
- An AWS Step functions state machine to execute Corticon.js decision services and REST services.

### A bit about each component

- A bit about the client: it is an HTML/Browser based application.  It lets users enter some data about their residence.  
It triggers the workflow (AWS step functions) via an HTTP call to an AWS/API Gateway entry point. It shows progress of the state machine
 and finally shows the various computed metrics. 
- A bit about the decision services: they do complex logic analysis and computations based on state of residence and various other input parameters.  See section below for details on what each rule sheet does
- a bit about REST services: the provide additional data required for computing the cost, rebate and savings.  Even though they are implemented as
simple JavaScript Lambda functions to keep the demo manageable, they illustrate very well composite applications and in particular how to integrate data 
coming from different sources.   
- A bit about the cloud side state machine: the demo include an example of each key feature of Step functions, 
    - we have sequential steps, to show how to decompose the application into discrete decision services
    - we have a parallel step to show 2 independent execution happening at the same time.  It is interesting to see how to data is passed in and out of that step.
    - we have a conditional step to compute loan offers if user selected that option.

This project is broken up into two directories.
- The "Client UI" directory contains the HTML client.  You can simply use that to see it in action (no need to create a separate state machine)
- The "Step Functions Assets" contains the definition of the state machine (the step functions), the associated Lambda functions 
as well as the Corticon.js decision services rules set and rule flows.  Use these if you want to create the step functions and associated Lambda functions in a separate AWS environment.

Note: some of the index.js Lambda functions generated by Corticon.js are customized to manipulate the payload coming from the
previous step.  The modified index.js are available in "Customized DS Lambda Entry Points".
If you update the decision service and redeploy to AWS Lambda using the zip file the index.js will be overwritten,
please be sure to only upload the decision service bundle file (decisionServiceBundle.js).

### Decision Services Documentation
This section describes what each Rulesheet role and the kind of computation it does.
 
TODO: Explain what is computed and where

#### Solar Constants

TBD


#### Solar Price Constants

TBD

#### Solar Quote

TBD

#### Solar Rebate

TBD

#### Solar Savings

TBD

#### Solar Loan

TBD


### Mapping of Decision Services Names to Lambda Function Names

This table shows the mapping of Rule flows names to Lambda functions used in state machine


| Rule Flow Name | Associated Lambda Function Name|
| ----------- | ----------- |
| Constants.erf | |
| Quote.erf | |
| Rebate.erf | |
| Savings.erf | |

### REST Services

There are 2 REST services:
- solar_price_rest.js: provides electricity cost in the state and solar panel cost.  See file for details.
- solar_loan_rest.js: TBD. See file for details.

## Demo Points

TODO: 

What can be changed to show different results.


## Setup

Introduction of what options you have

## Client Setup
Once you have all the files, open up index.html (preferably in Chrome) in the 'Client UI' directory

## AWS Setup
This section is for recreating the AWS step function and related components on your own AWS account.


There are four different AWS Services you will need to recreate:
- Roles for StepFunction and APIGateway
- Step Function
- Lambda Functions
- API Gateway to Step Function

### StepFunctionsLambdaRole + APIGatewayToStepFunctionsRole
If there is no existing StepFunctionsLambdaRole or if you want your own copy that is not shared by another resource
- Go to `console.aws.amazon.com/iam` > **Roles** > **Create Role**
- Select **Step Functions** > **Next: Permissions**
- You should see AWSLambdaRole by default in the list. If not add it manually
- Click **Next: Tags** > **Next: Review** to move to the last step
- Add whatever Role Name you would like and corresponding description.

If there is no existing APIGatewayToStepFunctionsRole or if you want your own copy that is not shared by another resource
- Go to `console.aws.amazon.com/iam` > **Roles** > **Create Role**
- Select **API Gateway** > **Next: Permissions**
- Click **Next: Tags** > **Next: Review** to move to the last step
- Add whatever Role Name you would like and corresponding description.
- Find your newly created role on the **Roles** page
- Go to the **Permission** tab and select **Attach Policy**
- Search for `AWSStepFunctionsFullAccess` and click **Attach Policy** 

### Creating your Step Function
If you haven't already, go ahead and create your Step Function.
- Navigate to **Step Functions** from the **Service** dropdown.
- Click **Create state machine**
	- The default selected setup options are fine for the purposes of this demo. 
- Click **Next** to move to the **Specify Detail** screen
	- Enter your **State machine name**
	- Under **Permissions**, select **Choose an existing role** and choose StepFunctionsLambdaRole or the role you created earlier
- Go ahead and finish up and click **Create State Machine**

### Defining your Step Function
Now that you have your Step Function you have to define the states using a special JSON-based syntax. If you want more detail or are stuck on something, please refer to `https://docs.aws.amazon.com/step-functions/latest/dg/concepts-states.html`

For now, just paste the contents of [statemachine_definition.json](./Step%20Functions%20Assets/statemachine_definition.json) into the definition text editor.

### Creating the Decision Service Lambdas / REST Services
You've seen how to create a task state, but you don't have the lambdas you want to invoke yet.

- First create a new AWS lambda function from **Services** > **Lambda** > **Create Function** 
- Give your new function a name (eg. 'Solar_Constants_Lambda')
- Click **Create Function**
- Under the Function Code section, open the **Actions** dropdown in the upper right and select **Upload a .zip file**
- Upload the zip file for the corresponding Lambda Function / REST Service under `Decision Services/Customized DS Lambda Entry Points` and `RestServices`

Once you have setup your Decision Service and REST Lambdas, find the **arn** located in the upper right on their respective page. Then replace the arn inside your Step Function definition with your new arn!

### APIGateway to StepFunction
Please follow the [provided documentation](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html)

## Demoing