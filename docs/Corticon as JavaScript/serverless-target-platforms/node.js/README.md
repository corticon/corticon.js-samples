# node.js

When packaging for Node deployment, Corticon.js will generate the files:

* `decisionServiceBundle.js`: Your obfuscated rules
* `node.sample.js`: Sample Node.js wrapper

The wrapper, `node.sample.js`, is pure sample code demonstrating how to embed rules in a Node.js application. How you invoke rules from your own Node.js application depends on your needs.

You need to define a file named `payload.json` that contains the decision service request. You can export the data from Corticon rule tester. To do so, open the Ruletest file (`.ert`) file, and then choose the menu option: **Rulesheet->RuleTest -> Data -> Input -> Export Request JSON**

The sample wrapper reads the file `payload.json`, passes it to your rules, and writes the result to `result.json`.

See the [Node.js documentation](https://nodejs.org/en/docs/) for details on deploying serverless functions.
