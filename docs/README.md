# Corticon.js Studio 

Corticon Studio is a standalone desktop environment to model, analyze, test, and save business rules as executable decision services. Corticon ‘rule modelers’ are commonly business analysts with expertise in the business domain and its policies, using Corticon Studio to define, author, analyze and test rules.

Once satisfied, rules are then deployed as Decision Services onto Corticon Server or as serverless functions with Corticon.js.

This site is focused on enablement related to building dynamic forms with Corticon.js. If you're unfamiliar with Corticon but only interested in the dynamic forms use case, below is a brief overview of the core components involved in modeling Corticon business rules. These are just as important to know when building dynamic forms to gather form response data as they are for automating decisions based upon that data. 

There are four main steps of building rules in Corticon Studio, culminating in the RuleFlow which will be deployed as a Decision Service.

1. The first step of the rule modeling process with Corticon is to build the 'dictionary' of business terms used throughout the rules, the **Rule Vocabulary**.
2. **Rulesheets** are like Decision Tables. Users ‘model’ the business rules by defining actions to take when specific conditions are met.
3. Once the rules created in the rulesheet are satisfied, the first **Ruletest** in Corticon Studio can be created to run test data through the rules in the test server embedded in the local application.
4. From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a  **Ruleflow** to specify the sequence from one rulesheet to another. When multiple Rulesheets are included in a Ruleflow, the Rulesheets will execute in a sequence determined by their Rulesheet order in the Ruleflow.
