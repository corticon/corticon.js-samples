# ReactNative Port of [cars-corticonjs (NativeScript)](https://github.com/corticon/corticon.js-samples/tree/master/Nativescript)

The purposes of this Demo are multi-fold:
 1) To demonstrate how easy it is to call from ReactNative mobile application a Corticon.js Decision Services directly from the app - this is to illustrate working offline 
 2) To demonstrate how to call the same decision service deployed as a Lambda function in AWS via a REST endpoint.
 3) Show dynamic screen prompting: in this demo, the insurance premium on the car detail screen (click on any car from the home screen) is modified based on the information the user provides.

Note: Clicking on the Header/Title Bar will open up a list showing some of the things happening under the hood. Of note, this demo shows the potential difference in response times between local and cloud deployed Decision Services.

## How to use the app:

To test the CorticonJS Decision Service, please select a car. You can then get a quote on the additional damage waiver. The decision service is meant to model a typical car rental damage waiver insurance programme. It expects driver details such as age, gender, driving experience and the collision damage waiver plan ('Full' or 'Limited'). Its expected output is a calculated premium based on the driver details. To this end, it's highly discriminatory to younger drivers and to drivers identifying as male in particular. All other genders are fine and it's not a binary spectrum.
You can switch from offline to online mode with a simple toggle - no need to turn network off :)

To see how to call the decisions service from code, see 

[decisionServiceHandler.js](corticon/decisionServiceHandler.js) - a wrapper that handles calling the DS

[CarInsurance.js](src/components/CarInsurance/CarInsurance.js) - the component that is calling the DS / handling the response

For an example on how to check the status / handle the response out of the decision service,
see [CarInsurance.js](src/components/CarInsurance/CarInsurance.js) inside CalculateInsurancePremium.

## Usage - Windows/Mac/Linux

### Minimum setup
Please follow the general ReactNative setup at
<https://github.com/corticon/corticon.js-samples/tree/master/ReactNative>

Once you have cloned the repository, cd into your project and run:

`npm install`

### Viewing your application
Start React Native Server

`react-native start`

Bundle/Start emulator

`react-native run-android`

## Differences from Nativescript App

### Kinvey
This port does not keep the Kinvey functionality which includes fetching the car data. Instead the data is sourced from [demo-data.json](./demo-data.json)

### AWS
Instead of an Azure Server, this demo instead calls an AWS step function when toggled from offline.


