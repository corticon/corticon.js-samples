# Setup
This is the setup documentation for ReactNative apps in general. For project specific additional requirements, see their respective documentation.

## React Native
https://reactnative.dev/docs/environment-setup
(React Native CLI Quickstart tab)

### Dependencies
Node.js
https://nodejs.org/en/download/

Python 2
https://www.python.org/ftp/python/2.7.15/python-2.7.15.msi

Java >= 8

Android Studio (+ Android SDK)

### CLI
`npm install -g react-native-cli`

`react-native init somename` will create a sample react native application (some dependencies may be fetched)
This command actually runs `npm install react-native` behind the scenes into the new project directory.

### Viewing your application
Start React Native Server

`react-native start`

Bundle/Start emulator

`react-native run-android`

View console logs

`npx react-native log-android`

### Optional 3rd Parties Libraries
__The following are some of the third party libraries used in sample apps. These are for reference only and there is no need to pull the dependencies yourself.__

Navigation (React Navigation)

`npm install -s @react-navigation/native @react-navigation/stack`

`npm install -s react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view
`

Vector Icons

`npm install --save react-native-vector-icons`

React Native Material Design

`npm install -s react-native-material-ui`

`react-native link react-native-vector-icons`

Picker

`npm install -s @react-native-community/picker`

Picker-select (easier to use)

`npm install -s @react-native-picker-select`
