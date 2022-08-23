# Rules Based Dynamic Forms

## Introduction

Implementing the complexities of a dynamic form's user interface often involves a  level of complexity comparable to that of a traditional decision automation use case (e.g. eligibility determination, claims handling, loan origination...). With Corticon.js, we can define this logic using the same declarative, rules-driven paradigm that enables traditional decision automation. 

There are a wide array of UI paradigms fit for the purpose of building forms with a multitude of questions/prompts, the answers from which will be passed into downstream workflows. But the form logic can evolve into a monolith in its own right when--

1.  Answers to the form's earlier questions change which questions are asked later in the form. 
2.  The questions change frequently. 
3.  External data must be wrangled from external systems in order to pre-populate or predetermine certain steps. 


Quickly, the number of unique paths which a user can progress through increases exponentially, as does the effort required to maintain and update it. 

Using a rules-driven paradigm for dynamic form logic, authored with a proven decision automation engine like [Corticon.js](https://www.progress.com/corticon-js), this complexity can be tamed through logic modularization and data abstraction. 

Rules define the model for what, when, and how to present prompts to an end user independently from the definition of how these prompts are presented stylistically in the front end UI.


## Corticon.js Rule Authoring Concepts

Corticon business rules are authored in **Corticon.js Studio**, with the backbone of the rules we create being the *Rule Vocabulary*. This will serve as the data model to capture both the  that will define aspects of:

- The user interface (UI), such as which questions to pose to the end user at what stage in the form being filled, and what type of input should be allowed for these questions 
- The data needed for the actual decision at hand, which will be captured as a form response and sent along to a downstream application, decision service or system of record

![](https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples@latest/DynamicForms/docs/images/JS%20vocabulary.png)



* **Rulesheet**: the Corticon condition and actions sheet where the modeler specifies the business rules for rendering the dynamic questionnaire
* **Ruleflow**: the Corticon unit of decision service deployment.
* **Flow**: The set of stages the user goes through in a specific scenario 
* **Stage**: a unique identifier representing where the flow currently is at in the state machine.


## Getting Started

To make it easy to familiarize yourself with the concepts, we have made available several samples 
that you can run from a test driver web page.

To get started:
* invoke client.html (available at https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html)
* go through each sample to get a feel for what is available
* Run the canonical sample. Each step in this sample shows how to use a specific UI control and display
the corresponding Corticon rulesheet file in the title of the container.  You can then use the corresponding step rulesheet as an example to implement what you need.
  
## Design

These Dynamic Questionnaires are rendered by a generic client side component (CSC).  
By generic, we mean that the same CSC can be reused for multiple questionnaires without 
any changes.  

This promotes agility for the development team.

The CSC renders the questionnaire following the instructions from a set of rules 
embedded in a decision service (DS).

Here is a visual representation of the interaction between the CSC and DS:

![Big picture view](docs/images/bigPic.PNG)

The CSC does not know the questions to be asked at each step and what the answers mean but it knows
how to render these questions and collect the answers.

The decision service (DS) driving the dynamic forms, specify what the questions, the constraints on questions and where to store the
answers.  The DS do not know the current state of the questionnaire but know what to do at each step.

Typically, a CSC is written and maintained by a developer or a team of developers while the DS are written by business analysts 
who understand well the problem domain of the questionnaire.

Here is a summary of the roles and responsibilities:

![Big picture view](docs/images/RolesResponsibilities.PNG)

## Local versus Remote Decision Services

It is typical for the DS to run in process with the CSC or in a remote environment.

For the remote option, Corticon.js supports deployments to any of 
the major cloud vendors Serverless environments (AWS Lambda. Azure and GCP functions), 
and to any Node.js server or traditional Java server running either in the cloud or on premises (traditional server deployments).

Of course, an in-process deployment will provide instant response time, however, there can be situations where you may want to run the model remotely.  
Here are the cases we have encountered with customers:
1) For Mobile Apps: a decision service hosted remotely can be updated very easily without having 
   to force the user to reinstall the app.
2) Security:
      * we don’t want to expose some of the data used in the decision process
      * we want to have the decision service access various data sources inside the firewall.
      * we don't to risk exposing the decision service to reverse engineering 

This is illustrated in the 2 diagrams below

![In-process decision service](docs/images/LocalDS.png)

![Remote decision service](docs/images/RemoteDS.png)

# More Information

For more detail on the CSC and the DS please refer to these documents:
1. [Authoring a decision service (DS)](docs/AuthoringDecisionService.md)
2. [Authoring a client side component (CSC)](docs/AuthoringClientSideComponents.md)

# Benefits

A single component for rendering dynamic questionnaires can be reused with multiple 
applications as illustrated below:

![Reuse CSC across applications](docs/images/ReuseCSCAcrossAppsSmaller.jpg)

In other words, to implement a new use cases, you only need to develop the model for the new use case. 

Additionally, the same model can be used to drive dynamic questionnaires on different platforms 
(for example, Web page and Mobile device).

![Web page and Mobile device](docs/images/SameModelforDifferentRenderersSmaller.png)

All of this provides agility and improves delivery time.

# Additional Resources

Find out more about [Corticon.js](https://www.progress.com/corticon-js)

You can check [these blogs](https://www.progress.com/blogs/author/thierry-ciot) for Corticon news and features as well as Serverless industry trends.

Free training for Corticon.js at https://www.progress.com/blogs/learning-opportunity-available-get-started-corticonjs-rules-today

