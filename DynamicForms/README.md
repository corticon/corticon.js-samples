# Rules-Driven Dynamic Forms

----------


### Table of contents

- [Rules-Driven Dynamic Forms](#rules-driven-dynamic-forms)
  - [Introduction](#introduction)
  - [Corticon.js Rule Authoring Concepts](#corticonjs-rule-authoring-concepts)
  - [Building Dynamic Forms with Corticon.js](#building-dynamic-forms-with-corticonjs)
  - [Design](#design)
  - [Local versus Remote Decision Services](#local-versus-remote-decision-services)
- [More Information](#more-information)
- [Benefits](#benefits)
- [Additional Resources](#additional-resources)

## Introduction

Implementing the complexities of a dynamic form's user interface often involves a  level of complexity comparable to that of 
a traditional decision automation use case (e.g. eligibility determination, claims handling, loan origination...). 
With Corticon.js, we can define this logic using the same declarative, rules-driven paradigm that enables traditional decision automation.

There are a wide array of UI paradigms fit for the purpose of building forms with a multitude of questions/prompts, the answers from which will be passed into downstream workflows. But the form logic can evolve into a monolith in its own right when--

1.  Answers to the form's earlier questions change which questions are asked later in the form.
2.  The questions change frequently.
3.  External data must be wrangled from external systems in order to pre-populate or predetermine certain steps.

Quickly, the number of unique paths which a user can progress through increases exponentially, as does the effort required to maintain and update them.

Using a rules-driven paradigm for dynamic form logic, authored with a proven decision automation engine like [Corticon.js](https://www.progress.com/corticon-js), this complexity can be tamed through logic modularization and data abstraction.

Rules define the model for what, when, and how to present prompts to an end user independently of the definition of how these prompts are presented stylistically in the front end UI (denoted here as the Client Side Component, or CSC).

Note: These forms are sometimes called Dynamic Questionnaires.


## Corticon.js Rule Authoring Concepts
*(Not limited to Dynamic Forms)*

### Rule Vocabulary

<img align="right" width="300"  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples@latest/DynamicForms/docs/images/JS%20vocabulary.png"
 title="Rule Vocabulary">

Typically, a client side component is written and maintained by a developer  while the form's rule-driven logic is written by business analysts who  best understand the subject domain of the form.

The communication between the rule author and front end developer, as well as between the actual artifacts they each produce, is facilitated by a well documented schema for the JSON to exchange IN and OUT.

Corticon business rules are authored in **Corticon.js Studio**, with the backbone of the rules we create being the *Rule Vocabulary*. This will serve as the data model to capture both the  that will define aspects of:

- The user interface (UI), such as which questions to pose to the end user at what stage in the form being filled, and what type of input should be allowed for these questions

- The data needed for the actual decision at hand, which will be captured as a form response and sent along to a downstream application, decision service or system of record

### Authoring the Rules

Corticon provides domain experts with the tools to define the parts of software guided by complex rules, without needing to be programmers.

Logic is authored and tested in Corticon Studio through Rule Modeling in a spreadsheet decision-table interface called *Rulesheets*.  A rule is like an ‘if-then’ statement. Each rule consists of one or more conditions (if) that are associated with one or more actions (then).

<p>
  <img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples/DynamicForms/docs/images/rulesheet%20overview.png" title="rulesheet  overview" >
</p>

### Testing the Rules

A *Ruletest* simulates a business scenario where the rules are applied to input data. If the data satisfies all the conditions in a rule, the rule fires and some output containing the results of the rule execution is produced.

You can define different sets of input data to test how the rules behave in different scenarios. You can also use a Ruletest to compare the output of a rule execution with expected results. A Ruletest stores this information in a Ruletest file, enabling you to save use-cases that are of interest, change rules, and run the test again to see how the modified rules behave when applied to the same use-cases.

Ruletests reproduce how the rules will behave once deployed as a decision service.

### Organizing the Rules

From here, you can continue adding more rules to the rulesheet, or more commonly, compartmentalize our rules into different rulesheets, and create a Ruleflow to specify the sequence from one rulesheet to another.

As more rulesheets are added to our Ruleflow, Ruletests can be run against entire Ruleflows, instead of testing only the Rulesheets as they are developed. This enables you to test not only the rules as they are defined in the Rulesheet, but also how the Ruleflow works, and how the rules behave as part of the Ruleflow. This way, problems can be detected and fixed earlier in the lifecycle.

<p align="center">
  <img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples/DynamicForms/docs/images/ruleflowBreakdown.png" title="ruleflow overview">
</p>


## Building Dynamic Forms with Corticon.js

It may be easiest to conceptualize Corticon.js Dynamic Forms by first checking out the samples that you can interact with as an 
end user, leveraging the 'test driver' web page. 
You can launch it right away at [this link](https://refined-github-html-preview.kidonng.workers.dev/corticon/corticon.js-samples/raw/master/DynamicForms/CSC/client.html), or review the HTML [here](https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html).


### Design

The Dynamic Forms in the sample page are rendered by a generic and reusable Client Side Component (CSC).
Here by generic, we mean that the same CSC can be reused for multiple questionnaires without any front end client changes.
When you switch samples with the dropdown sample selector, you're in a different dynamic form; however it is using the CSC for 
all the samples.

This framework--separating the CSC from the rules--promotes agility for development teams, as it distinguishes the 'instructions' 
for what to present to the user (defined in a Corticon.js decision service) and the code that renders the form based upon 
these instructions.

If you are familiar with the various model/views design patterns; you can consider the CSC to be the view while the model is
created and maintained using [Corticon](https://www.progress.com/corticon-js)) rule system as a decision service.
Another way to put it, is the decision service defines a model for the questionnaire independently of how it is rendered in the
front end UI and device.

How does this work?

The CSC does not know the questions to be asked at each step and what the answers mean, but it knows how to render these questions 
and collect the answers.

Here is a visual representation of the interaction between the CSC and DS:

![Big picture view](docs/images/bigPic.PNG)

The decision service driving the dynamic forms specify what the questions, the constraints on questions, where to store the answers
and what paths to take based on various conditions. The decision services do not know the current state of the questionnaire 
but know what to do at each step.

Typically, a CSC is written and maintained by a developer or a team of developers while the decision services are written by business analysts
who understand well the problem domain of the questionnaire.

Here is a summary of the roles and responsibilities:

<p style="text-align:center;">
<img width="500"src="docs/images/architecture.png"
 title="architecture">
</p>

## Local versus Remote Decision Services

Decision service can be run in process within the CSC or maintained and invoked in a remote environment.

For the remote option, Corticon.js supports deployments to:

-  Any of the major cloud vendors' serverless environments (AWS Lambda, Azure and GCP functions)
-  Node.js servers
-  Traditional Java server running either in the cloud or on premises (traditional server deployments)

In-process deployments provide essentially instant response time, however, there are considerations for when it might make more sense to run maintain this logic in remote environments, such as:

- For Mobile Apps: a decision service hosted remotely can be updated very easily without having to force the user to reinstall the app.
- To address security:
	- Don’t want to expose some of the data used in the decision process.
	- Want to have the decision service access various data sources inside the firewall.
	- Don't want to risk exposing the decision service to reverse engineering.

There are only minor distinctions between how the CSC and decision service interactions take place 
when running in-process or remotely as illustrated in the 2 diagrams below:

<p style="text-align:center;">
<img width="500"  src="docs/images/LocalDS.png"
 title="Running locally">
<br>
<br>
<img width="500"  src="docs/images/RemoteDS.png"
 title="Remote decision service">
</p>

## Building and integrating a rule-driven form's components

For more detail on the CSC and the decision service please refer to these documents:

1. [Authoring a the dynamic form logic in Corticon (these will be generated into the Decision Service) ](docs/AuthoringDecisionService.md)
2. [Building and configuring the client side component (CSC)](docs/AuthoringClientSideComponents.md)

# Benefits

A single component for rendering dynamic questionnaires can be reused with multiple
applications as illustrated below:

![Reuse CSC across applications](docs/images/ReuseCSCAcrossAppsSmaller.jpg)

In other words, to implement a new use cases, you only need to develop the model for the new use case.

Additionally, the same model can be used to drive dynamic questionnaires on different platforms
(for example, Web page and Mobile device).

![Web page and Mobile device](docs/images/SameModelforDifferentRenderersSmaller.png)

All of this provides agility and improves delivery time.

## Getting Started

To make it easy to familiarize yourself with the concepts, we have made available several samples
that you can run from a test driver web page.

To get started:
* invoke client.html (available at https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html)
* go through each sample to get a feel for what is available
* Run the canonical sample. Each step in this sample shows how to use a specific UI control and display
  the corresponding Corticon rulesheet file in the title of the container.  You can then use the corresponding step rulesheet as an example to implement what you need.

## Summary

- A single component for rendering dynamic questionnaires can be reused with multiple applications
- In other words, to implement a new use cases, you only need to develop the *model* for the new use case.
- Additionally, the same model can be used to drive dynamic questionnaires on different platforms (for example, Web page and Mobile device).
- All of this provides agility and improves delivery time.


## Additional Resources

Find out more about [Corticon.js](https://www.progress.com/corticon-js)

You can check [these blogs](https://www.progress.com/blogs/author/thierry-ciot) for Corticon news and features as well as Serverless industry trends.

Free training for Corticon.js at [https://www.progress.com/blogs/learning-opportunity-available-get-started-corticonjs-rules-today](https://www.progress.com/blogs/learning-opportunity-available-get-started-corticonjs-rules-today)
