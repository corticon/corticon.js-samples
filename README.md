# Corticon.js Samples

This repository contains sample decision services and examples for using Corticon.js across a variety of JavaScript environments.

## What is Corticon.js?

Corticon.js is a powerful rules engine that allows you to define, deploy, and execute business rules as JavaScript. With Corticon.js, you can automate decision-making processes by embedding rules directly into your applications, whether they run in the browser, on mobile devices, or in serverless/cloud environments.

### Key Features:
- **Cross-Platform Compatibility**: Deploy rules to any platform that supports JavaScript.
- **Serverless Integration**: Use Corticon.js with AWS Lambda, Google Cloud Functions, or Microsoft Azure Functions.
- **Dynamic Forms**: Create dynamic, rule-driven forms that adapt based on user input.
- **Mobile and Web Applications**: Bundle rules into mobile apps (e.g., React Native, Xamarin) or web applications.
- **Cloud Workflows**: Integrate rules into workflows like AWS Step Functions or Microsoft Logic Apps.
- **In-Browser Execution**: Execute rules directly in the browser for real-time decision-making.

## Repository Structure

This repository is organized into subdirectories, each showcasing specific use cases or integrations of Corticon.js:


### **Extended Operators**
Examples of custom operators and advanced rule modeling:
- **BasicSampleGetSetOperators**: Demonstrates custom operators for getting and setting data.
- **Finance**: Financial rule modeling examples.

### **Frameworks & Runtimes**
Samples for integrating Corticon.js with various frameworks and runtimes:
- **Browser**: Examples for Angular, jQuery, and plain JavaScript/TypeScript.
- **Deno**: Minimal example for the Deno runtime.
- **Node**: Node.js examples using Express and Koa frameworks.

### **Importable-Rule-Projects**
Prebuilt rule projects that can be imported into Corticon.js Studio:
- **DailyInsurance**: Insurance-related decision services.
- **Dynamic-Form-Samples**: Rule projects for dynamic forms.
- **Transactional-Rule-Project-Samples**: Examples of transactional rule modeling.

### **ServiceCallOut**
Examples of service callouts for extending Corticon.js functionality:
- **AccessConfigurationProperties**: Accessing configuration properties in decision services.
- **Weather REST API**: Calling external REST APIs for weather data.
- **I18N**: Localization examples for dynamic forms.

