# Progress Kinvey

When packaging for Progress Kinvey FlexServices deployment, Corticon.js generates the files:

* `decisionServiceBundle.js`: Your rules, obfuscated
* `kinvey.sample.js`: Sample Kinvey FlexService wrapper

The wrapper, `kinvey.sample.js`, is designed as a Kinvey FlexService of the type FlexFunction. Refer to [https://devcenter.kinvey.com/rest/guides/flex-services#flex-functions](https://devcenter.kinvey.com/rest/guides/flex-services#flex-functions) for specifics.

When invoked, the Kinvey FlexFunction is passed a typical JSON payload.

Examples of how this could be triggered include as collection hooks, allowing them to modify, filter, clean or otherwise utilize data as it is being retrieved, saved or deleted in a Kinvey collection. When paired with custom endpoints, the FlexFunction can be used as a Serverless REST microservice for your mobile app, or run it as a scheduled job.

Once deployed as a FlexService, your rules are available to the Kinvey ecosystem. The wrapper is a complete, ready-to-deploy Kinvey FlexFunctions FlexService, yet you can also modify it to meet the specific needs of your application, or adapt it for use as FlexData or FlexAuth FlexServices types.

See the [Progress Kinvey FlexServices documentation](https://devcenter.kinvey.com/rest/guides/flex-services) for details on deploying FlexServices.
