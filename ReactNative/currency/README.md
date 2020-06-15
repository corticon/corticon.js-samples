# Currency Exchange App
Purpose of this application is to demonstrate 
	- Navigation
	- Inputs that affect state
	- Calling a Decision Service

### Home Screen
Shows a list of currencies with a colored indicator. The color of the indicator is based on a call to a decision service that checks how much the exchange rate has changed.

### Exchange Screen
Shows a form that allows you to select your Sell/Buy currency and input how much you want to exchange. The output changes automatically when you submit input.

## Getting Started
See the react_native README.md for how to setup React Native

Pull all node packages
`npm install`

Start React Native Server
`react-native start`

Start Application
`react-native run-android`

## Getting Around

### Source Code
Entry point is /index.js -> /src/App.js

App.js is home to the navigation screens + app-wide styling

Home.js is the default screen
Exchange.js is the only other view

Reusable containers reside in /src/components/Containers
Constants reside in /constants/Constants.js

### Demo Data
Sample Demo Data is placed into /app.json

### android/ios
Respective apps are built to these folders

### corticon
Corticon.js bundle and handler

Importing Handler
`import * as Corticon from '../../../corticon/decisionServiceHandler'`

`Corticon.payload()` expects an array of Objects 
``` 
	{
    "Name of Entity": { Entity Properties}
	}
```

Example Usage:
`const currencyExchange = Corticon.runDecisionService(Corticon.payload(entities));`

Logging:
`console.log()` does work

Logs can be viewed via
`npx react-native log-android`
or
`npx react-native log-ios`