# Corticon.js Decision Service on Azure Functions
## Fully scripted deployment
This is a guide to deploy a Corticon.js Decision Service bundle on Azure Functions, making it available for HTTP POST/GET invocations [from the internet](https://i.kym-cdn.com/photos/images/original/000/009/985/internet-serious-business.jpg).
The actual Corticon.js DS bundle is provided as a node dependency to the service.

It is fully scripted and ~automated~ automatable, so it's also a good starter for CI/CD setups. The only Azure web portal interaction necessary, is signing up for Azure!
It's currently Windows based and assumes a free/trial Azure plan. Please Bring-Your-Own-Plan.

You may of course opt to forgo the shell-fun and retrace the steps outlined here in the Azure console. Essentially you will have to follow [this guide](https://docs.microsoft.com/en-us/azure/azure-functions/deployment-zip-push) placing the contents of everything under the _CarsDecisionService_ directory in the deployment.zip file.
You may also use Visual Studio Code with the Azure extension and follow [this guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-vs-code).
If you went ahead and downloaded the several hundred terabytes of Visual Studio - unfortunately it can only be used for deploying .NET/C# based projects.

## Contents

The decision service is meant to model a typical car rental damage waiver insurance policy. It expects driver details such as age, gender, driving experience and the collision damage waiver plan ('Full' or 'Limited'). Its expected output is a calculated premium based on the driver details. To this end, it's highly discriminatory to younger drivers and to drivers identifying as male in particular. All other genders are fine and it's not a binary spectrum.

- _CarsDecisionService_ - The project/app container which can hold various functions. Its configuration is largely autogenerated using the CLI tools.
- _CarsDecisionService/RentalInsurance_ - The node HTTP endpoint which makes the CorticonJS DS available for calling. This is an actual Azure Function.
- _createapp.bat_ - A Windows Batch Script that runs the necessary Azure CLI Commands to create the Azure Function Deployment environment in the cloud
- _testCarsPayload.json_ - a sample JSON that can be used as a request body to verify the DS is working correctly - look for a "status: success" in the response)

## System Prerequisites / Tested With

- Windows 10
- Chocolatey (https://chocolatey.org/install)
- A good shell can't hurt (e.g. cmder)

The guide below is roughly based on [this MS doc]( https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-azure-function-azure-cli?tabs=bash%2Cbrowser&pivots=programming-language-javascript), with a few modifications due to stuff not working as advertised.


## Steps - Setup locally, deploy on Azure and creating your own function using Azure CLI tools

### Setup project &  verify local run
* (Optional) Install curl to ultimately test the HTTP endpoint or use HTTP Client of choice (Insomnia, Postman etc)

	`choco install curl`

* (Optional) Install latest LTS node, if not installed:

	`choco install nodejs-lts`

* Install Azure Functions Core Tools CLI globally (ie from anywhere)

	`npm i -g azure-functions-core-tools@3 --unsafe-perm true`

* Then clone this repo into a work directory of your choice (If you want to use the CLI tools to create your own Functions-project, jump to the bottom)

	`git clone https://github.com/corticon/corticon.js-samples.git`

* In directory `corticon.js-samples\Azure\CarsDecisionService` install the Cars Corticon DS bundle from github by executing

	`npm install`

* And finally, run the Function in a local Azure environment

	`func start`

You should see output similar to this, which means your service is available locally:

`RentalInsurance: [GET,POST] http://localhost:7071/api/RentalInsurance`

You can test that it's running correctly by POSTing to the HTTP endpoint:

`corticon.js-samples\Azure\curl --request POST --url http://localhost:7071/api/RentalInsurance --header "content-type: application/json" --data @testCarsPayload.json`

**Et voilà - you should have a Corticon decision service running in node HTTP service shell running in a locally emulated Azure environment. Whew.**

## Deploying to Azure Functions

That's what we're here for.
If you haven't signed up for Azure yet, [please do so now](https://azure.microsoft.com/en-us/free/).

* Install the Azure CLI (az) globally from anywhere

	`choco install azure-cli`

* Once installed, log in to Azure. This should open a web login:

	`az login`

* Then cd to `corticon.js-samples\Azure` and run

	`createapp.bat`

	This sets up a few Azure cloud services: a resource group, a storage account and an app service/function container (+ app insights and service plan automagically).
For detailed settings like deployment regions check the batch file. NB Any other region that "eastus" I tried resulted in errors, either when creating the storage engine or the function container.

* Now that all the _admin stuff_ is out of the way you can finally deploy your Corticon DS to Azure; in `corticon.js-samples\Azure\CarsDecisionService` please execute

	`func azure functionapp publish CarsDecisionService`

* This publishing step occasionally times out for me, but ultimately it will deploy something. So that you should see, something along these lines:

```
Functions in CarsDecisionService:
    RentalInsurance - [httpTrigger]
        Invoke url: https://carsdecisionservice.azurewebsites.net/api/rentalinsurance?code=DASDDASDASDASDASDASDAS123123123123123==
```

* The code-token is _important_! You can and should verify that everything is setup correctly by modifying the URL in the curl statement from above

	`corticon.js-samples\Azure\curl --request POST --url https://carsdecisionservice.azurewebsites.net/api/rentalinsurance?code=DASDDASDASDASDASDASDAS123123123123123== --header "content-type: application/json" --data @testCarsPayload.json`

	The cloud call should not only return a 200 OK, but also echo a slightly modified JSON, giving you an insurance premium rate and adding a
	`   "status": "success"` somewhere in the JSON.

You have successfully deployed a CorticonJS DS in the (Microsoft) cloud and you're all FaaS serveless now.

## Create your own Service

* To create the scaffolding for a node/javascript based Azure Function container, please run in some other working directory e.g.
	`func init MyOwnDecisionService --node`

* In order to actually create a function endpoint/handler within that container, you could run for instance

	`func new --template "Http Trigger" --language "node" --name MyDecisionServiceHandler`

	This would create code for an HTTP endpoint responding to GET and POST. There are other languages and templates available of course.

* In our sample, the CorticonJS DS bundle is added as an npm dependency on the container level, that is it would available to all functions in that container.
	It's also perfectly viable to just add it on a function level or add the bundle to the project as a hard dependency.
	If npm sounds good, you can add a dependency to the container's(!) package.json by:

	`npm install --save rental-insurance@git+https://github.com/steinerj/node-cars-decision-service.git`


EOF
