# Google Cloud Functions

When packaging for Google Cloud Functions deployment, Corticon.js generates the files:

* `decisionServiceBundle.js`: Your rules, obfuscated
* `index.js`: Sample Google Cloud Functions wrapper

The wrapper, `index.js`, implements the Google Cloud Functions API for responding to HTTP triggers.

When invoked, the Google Cloud function is passed a JSON payload. This is most likely triggered by a REST call to invoke the function.

The wrapper is a complete, ready-to-run, Google Cloud function, yet you can also modify it to meet the specific needs of your application. The Google Cloud functions API has different signatures for different triggers. You can modify the wrapper to meet the needs of different triggers.

See the [Google Cloud Functions documentation](https://cloud.google.com/functions/docs) for details on deploying serverless functions.
