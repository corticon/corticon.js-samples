# AWS Lambda Functions

When packaging for AWS Lambda deployment, Corticon.js generates the files:

* `decisionServiceBundle.js`: Your rules, obfuscated
* `index.js`: Sample AWS Lambda wrapper
* `lambda.zip`: Zip file with both `.js` files to simplify deployment.

The wrapper, index.js, implements the AWS Lambda API to be invoked as a serverless function and returns the results of its execution.

When invoked, the AWS Lambda function is passed a JSON payload. Examples of how this could be triggered include using a REST API gateway to call your function, and using the function as a step in an AWS Step Functions workflow. Once deployed as a serverless function, your rules are available to the AWS ecosystem.

The wrapper is a complete, ready-to-deploy, Lambda function but you can also modify it to meet the specific needs of your application.

The `lambda.zip` file is generated as a convenience. AWS makes it easy to deploy a Lambda function in one step using a `.zip` file.

See the [AWS Lambda documentation](https://docs.aws.amazon.com/lambda/index.html) for details on deploying serverless functions.
