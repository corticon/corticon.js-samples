# ReactNative Port of [cars-corticonjs (NativeScript)](https://github.com/corticon/corticon.js-samples/tree/master/Nativescript)

__This is a reasonable example of using a CorticonJS bundle decision service in a JS/TS project. The external dependency management approach should be valid for any NativeScript/ReactNative app and any web application using node dependency management (e.g. Angular et al.). This should allow for decent CI/CD setups, webpacking etc. It would facilitate decoupling development of the web/mobile project from modelling the Corticon Rules.__

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


