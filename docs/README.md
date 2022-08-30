# Corticon Overview

## Corticon Rule Development Life Cycle

![Corticon Runtimes](https://github.com/corticon/corticon.js-samples/blob/b0b2251c261b9f895da2ec88941cfd6d425c9ecc/docs/assets/corticon%20server%20vs%20js.png)


Corticon has three main components:



* **Corticon Studio** enables you to model, test, and automate business rules within. Progress Corticon rules can then be deployed as _decision services_, made available in nearly any architectural environment by using either:
  * **Progress Corticon Server** (For deploying Decision Services onto a server)—the runtime environment that hosts deployed rule models (created in Corticon Studio), exposing them as Decision Services to the external world. Decision Services can be exposed as Web services (SOAP or REST), Java services, or .NET services.
  * **Corticon.js** (For serverless environments)- Corticon is able to package business rules as executable JavaScript bundles (created in Corticon.js Studio), without any external dependencies. These bundles include both the business rules and the rule engine and can be run in any browser application client-side.
