# Rule-Driven Dynamic Forms


## Introduction

Implementing the complexities of a dynamic form's user interface often involves a  level of complexity comparable to that of a traditional decision automation use case (e.g. eligibility determination, claims handling, loan origination...). With Corticon.js, we can define this logic using the same declarative, rules-driven paradigm that enables traditional decision automation.

There are a wide array of UI paradigms fit for the purpose of building forms with a multitude of questions/prompts, the answers from which will be passed into downstream workflows. But the form logic can evolve into a monolith in its own right when&mdash;

1.  Answers to the form's earlier questions change which questions are asked later in the form.
2.  The questions change frequently.
3.  External data must be wrangled from external systems in order to pre-populate or predetermine certain steps.


Quickly, the number of unique paths which a user can progress through increases exponentially, as does the effort required to maintain and update it.

Using a rules-driven paradigm for dynamic form logic, authored with a proven decision automation engine like [Corticon.js](https://www.progress.com/corticon-js), this complexity can be tamed through logic modularization and data abstraction.

Rules define the model for what, when, and how to present prompts to an end user independently from the definition of how these prompts are presented stylistically in the front end UI (denoted hereafter as the Client Side Component, or CSC).


## Building Dynamic Forms with Corticon.js

> It may be easiest to conceptualize Corticon.js Dynamic Forms by first checking out the samples that you can interact with as an end user, leveraging the 'test driver' web page. You can launch it right away at [this link](https://refined-github-html-preview.kidonng.workers.dev/corticon/corticon.js-samples/raw/master/DynamicForms/CSC/client.html), or review the HTML [here](https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html).


### Design

The Dynamic Forms in the sample page are rendered by a reusable Client Side Component (CSC). Just switch samples with the dropdown and you're in a different dynamic form.

This framework&mdash;separating the CSC from the rules&mdash;promotes agility for development teams, as it distinguishes the 'instructions' for what to present to the user (defined in a Corticon.js decision service) and the code that renders the form based upon these instructions.

The CSC does not know the questions to be asked at each step and what the answers mean but it knows how to render these questions and collect the answers.

The decision service driving the dynamic forms, specify what the questions, the constraints on questions and where to store the answers.  The decision services do not know the current state of the questionnaire but know what to do at each step.

Typically, a CSC is written and maintained by a developer or a team of developers while the decision services are written by business analysts who understand well the problem domain of the questionnaire.

Here is a summary of the roles and responsibilities:

![](https://cdn.jsdelivr.net/gh/corticon/documentation/docs/assets/architecture.png)


## Local versus Remote Decision Services

Decision service can be run in process within the CSC or maintained and invoked in a remote environment.

For the remote option, Corticon.js supports deployments to:

-  Any of the major cloud vendors' serverless environments (AWS Lambda, Azure and GCP functions)
-  Node.js servers
-  Traditional Java server running either in the cloud or on premises (traditional server deployments)

In-process deployments provide essentially instant response time, however, there are considerations for when it might make more sense to run maintain this logic in remote environments, such as:

- For Mobile Apps: a decision service hosted remotely can be updated very easily without having to force the user to reinstall the app.
- To address security:
	- Don’t want to expose some of the data used in the decision process
	- Want to have the decision service access various data sources inside the firewall.
	- Don't to risk exposing the decision service to reverse engineering

There are only minor distinctions between how the CSC and decision service interactions take place when running in-process or remotely:

![](https://cdn.jsdelivr.net/gh/corticon/documentation/docs/assets/LocalDS.png)


![](https://cdn.jsdelivr.net/gh/corticon/documentation/docs/assets/RemoteDS.png)

## Building and integrating a rule-driven form's components

For more detail on the CSC and the decision service please refer to these documents:

1. [Authoring a the dynamic form logic in Corticon (these will be generated into the Decision Service) ](https://cdn.jsdelivr.net/gh/corticon/documentation/docs/AuthoringDecisionService.md)
2. [Building and configuring the client side component (CSC)](https://cdn.jsdelivr.net/gh/corticon/documentation/docs/AuthoringClientSideComponents.md)
## Summary

![](https://cdn.jsdelivr.net/gh/corticon/documentation/docs/assets/SameModelforDifferentRenderersSmaller.png)


- A single component for rendering dynamic questionnaires can be reused with multiple applications
- In other words, to implement a new use cases, you only need to develop the *model* for the new use case.
- Additionally, the same model can be used to drive dynamic questionnaires on different platforms (for example, Web page and Mobile device).
- All of this provides agility and improves delivery time.



## Additional Resources

Find out more about [Corticon.js](https://www.progress.com/corticon-js)

You can check [these blogs](https://www.progress.com/blogs/author/thierry-ciot) for Corticon news and features as well as Serverless industry trends.

Free training for Corticon.js at [https://www.progress.com/blogs/learning-opportunity-available-get-started-corticonjs-rules-today](https://www.progress.com/blogs/learning-opportunity-available-get-started-corticonjs-rules-today)
