# Setup


## React Native
https://reactnative.dev/docs/environment-setup
(React Native CLI Quickstart tab)

### Dependencies
Node.js
https://nodejs.org/en/download/
64 bit, optional tools installed (not necessary, but I did)

Python 2
https://www.python.org/ftp/python/2.7.15/python-2.7.15.msi

Java >= 8

Android Studio (+ Android SDK)

### CLI
npm should come installed with your Node.js download
`npm install -g react-native-cli`

`react-native-cli init somename`
will create a sample react native application (some dependencies may be fetched)

### Viewing your application
Start React Native Server
`react-native start`
Bundle/Start emulator
`react-native run-android`

### 3rd Parties Libraries
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
## TODO: Organize
