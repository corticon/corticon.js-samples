# Azure Functions

When packaging for Microsoft Azure Functions deployment, Corticon.js generates the files:

* `decisionServiceBundle.js`: Your rules, obfuscated
* `azure.sample.js`: Sample Azure Functions wrapper

The wrapper, `azure.sample.js`, implements the Azure Functions API for responding to HTTP triggers.

When invoked the Azure function is passed a JSON payload. This is most likely triggered by a REST call to invoke the function.

The wrapper is a complete, ready-to-run, Azure function, yet you can also modify it to meet the specific needs of your application. The Azure functions API has different signatures for different triggers. You can modify the wrapper to meet the needs of different triggers.

See the [Azure Functions documentation](https://docs.microsoft.com/en-us/azure/azure-functions/) for details on deploying serverless functions.
