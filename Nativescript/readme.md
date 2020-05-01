# NativeScript Mobile Sample - Car Rental Insurance 

This is a NativeScript car rental app. It will run as native apps on both iOS and Android.

To test the CorticonJS Decision Service, please select a car. You can then get a quote on the additional damage waiver. The decision service is meant to model a typical car rental damage waiver insurance programme. It expects driver details such as age, gender, driving experience and the collision damage waiver plan ('Full' or 'Limited'). Its expected output is a calculated premium based on the driver details. To this end, it's highly discriminatory to younger drivers and to drivers identifying as male in particular. All other genders are fine and it's not a binary spectrum.
 
## Contents

* _cars-corticonjs_ - The NativeScript app project
* _cars-ds_ - The CorticonJS DS bundle as a node package
* _corticon-base-project/RentalInsurance_ - The Corticon Rules project which can be imported into Corticon Studio for JS.

* _app-debug.apk_ - And Android pre-built APK for trying it out without installing a NativeScript build stack

## Usage - Windows/Mac/Linux

### Minimum setup
* Install nodejs 10+
* Install the nativescript command line interface _tns_ 
  `npm install -g nativescript"
* Follow the step-by-step guide, when asked configure for "Sync to Playground". On your phone(!) install the NativeScript Playground App from the App/Playstore:
```To scan the QR code and deploy your app on a device, you need to have the NativeScript Playground app: App Store (iOS): https://itunes.apple.com/us/app/nativescript-playground/id1263543946?mt=8&ls=1 Google Play (Android): https://play.google.com/store/apps/details?id=org.nativescript.play ```
 
* After cloning the project, cd into _cars-corticonjs_ and run
  `npm install`
* Then run 
  `tns preview`
* And scan the generated QR code. You might need to adjust your cmd/console font to be able to correctly scan the QR code using the Playground app. Any changes to the app project should synchronise immediately on your phone.

If you wish to enable local building, e.g. for emulator deployment, adb building etc. please install a NativeScript stack as per: https://docs.nativescript.org/angular/start/quick-setup

Have fun. The CorticonJS DS is added as a dependency in the [package.json](https://github.com/corticon/corticon.js-samples/blob/master/Nativescript/cars-corticonjs/package.json) of the NativeScript project. The DS is imported and used in the [cars service class](https://github.com/corticon/corticon.js-samples/blob/master/Nativescript/cars-corticonjs/src/app/cars/shared/car.service.ts)

__This is a reasonable example of using a CorticonJS bundle decision service in a JS/TS project. The external dependency management approach should be valid for any NativeScript/ReactNative app and any web application using node dependency management (e.g. Angular et al.). This should allow for decent CI/CD setups, webpacking etc. It would facilitate decoupling development of the web/mobile project from modelling the Corticon Rules.__
![Preview New](/Nativescript/previewnew.png)
![Preview New2](/Nativescript/previewnew2.png)

![Preview 1](/Nativescript/preview1.jpg)
![Preview 2](/Nativescript/preview2.jpg)
![Preview 3](/Nativescript/preview3.jpg)
![Preview 4](/Nativescript/preview4.jpg)
