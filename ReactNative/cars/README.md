# ReactNative Port of [cars-corticonjs (NativeScript)](https://github.com/corticon/corticon.js-samples/tree/master/Nativescript)

__The purpose of this Demo is to demonstrate invoking two different Decision Services (offline local and AWS Step Function) inside of a ReactNative mobile application. In this Demo, the insurance premium on the car detail screen (click on any car from the homescreen) is modified based on the information the user provides.__

__Clicking on the Header/Title Bar will open up a list showing some of the things happening under the hood. Of note, this demo shows the potential difference in response times between local and cloud deployed Decision Services.__


To test the CorticonJS Decision Service, please select a car. You can then get a quote on the additional damage waiver. The decision service is meant to model a typical car rental damage waiver insurance programme. It expects driver details such as age, gender, driving experience and the collision damage waiver plan ('Full' or 'Limited'). Its expected output is a calculated premium based on the driver details. To this end, it's highly discriminatory to younger drivers and to drivers identifying as male in particular. All other genders are fine and it's not a binary spectrum.

To see how to call the decisions service from code, see 

[decisionServiceHandler.js](corticon/decisionServiceHandler.js) - a wrapper that handles calling the DS
[CarInsurance.js](src/components/CarInsurance/CarInsurance.js) - the component that is calling the DS / handling the response

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


