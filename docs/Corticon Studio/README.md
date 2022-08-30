# Corticon Studio Basics

Corticon Studio is a standalone desktop environment to model, analyze, test, and save business rules as executable decision services. Corticon ‘rule modelers’ are commonly business analysts with expertise in the business domain and its policies, using Corticon Studio to define, author, analyze and test rules.&#x20;

Once satisfied, rules are then deployed as Decision Services onto Corticon Server or as serverless functions with Corticon.js.&#x20;

There are four key steps of building rules in Corticon Studio, culminating as a RuleFlow to deploy as a Decision Service.

1. The first step of the rule modeling process with Corticon is to build the 'dictionary' of business terms used throughout the rules, the **** [**Rule Vocabulary**](rule-vocabulary/).
2. [**Rulesheets** ](rulesheets/)are like Decision Tables. Users ‘model’ the business rules by defining actions to take when specific conditions are met.
3. Once the rules created in the rulesheet are satisfied, the first [**Ruletest** ](ruletests.md)in Corticon Studio can be created to run test data through the rules in the test server embedded in the local application.
4. From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a **** [**Ruleflow** ](ruleflows/)to specify the sequence from one rulesheet to another. When multiple Rulesheets are included in a Ruleflow, the Rulesheets will execute in a sequence determined by their Rulesheet order in the Ruleflow.



### **Video**: Learn about Rule Modeling with Progress Corticon

{% embed url="https://www.youtube.com/watch?v=tgAfhgL2k-4&list=PLC679RvCan2CoOLaYQzUEriM3WS-UFQ5N&index=18&t=49s" %}

