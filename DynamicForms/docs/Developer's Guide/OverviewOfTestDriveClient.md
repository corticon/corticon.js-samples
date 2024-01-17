# Test Drive Client

When we build the dynamic form rules, we're ultimately going to be transpiling the rules into a self-contained JavaScript bundle. In simpler terms, all of the logic will be encapsulated into just one file decisionServiceBundle.js.

Front end developers handle the 'rendering side' of the form. This includes defining data that will be passed in at the onset of the form, styling, and where the data goes once the form is filled out.

To make everyone's life easier, we provide open source implementations of Corticon.js Dynamic Forms which you can freely download, import into your environment, and adapt to your needs. This includes both sample rule assets that you can work with in Corticon.js Studio, and a sample client side rendering component.

## Overview of the Test Drive Client

The Dynamic Forms in the sample page are rendered by a reusable, adaptable template referred to as the Test Drive Client. By template, we mean that the same Test Drive Client can be reused for multiple questionnaires without any front end client changes. When you switch samples with the dropdown sample selector, you're in a different dynamic form; however it is using the Test Drive Client for all the samples.

This framework of separating the Test Drive Client from the rules promotes agility for development teams, as it disentangles the 'instructions' logic for what to present to the user (defined in a Corticon.js decision service) and the code that renders the form based upon these instructions. Typically, a Test Drive Client is written and maintained by a developer or a team of developers while the decision services are written by business analysts who understand well the problem domain of the questionnaire.

If you are familiar with model/views design patterns; you can consider the Test Drive Client to be the view while the model is created and maintained using a Corticon.js decision service.

The Dynamic Forms in the sample page are rendered by a reusable, adaptable template referred to as the Client Side Component (CSC). By template, we mean that the same CSC can be reused for multiple questionnaires without any front end client changes. When you switch samples with the dropdown sample selector, you're in a different dynamic form; however it is using the CSC for all the samples.

This framework of separating the CSC from the rules promotes agility for development teams, as it disentangles the 'instructions' logic for what to present to the user (defined in a Corticon.js decision service) and the code that renders the form based upon these instructions.
Typically, a CSC is written and maintained by a developer or a team of developers while the decision services are written by business analysts who understand well the problem domain of the questionnaire.

If you are familiar with model/views design patterns; you can consider the CSC to be the view while the model is created and maintained using a [Corticon.js](https://www.progress.com/corticon-js) decision service.


## The Pre-Built CSC

The [CSC within this repository](https://github.com/corticon/corticon.js-samples/tree/master/DynamicForms/CSC/clientSideComponent) which you can fork and adapt as needed is based on plain HTML and JQuery. You can likewise test drive the client side form [here](https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/client.html).

Whether you built off the template CSC or you want to leverage a different technology like React or Angular or Vue, it is useful to play around with the prebuilt components.


## Responsibilities of the Test Drive Client

The Test Drive Client is responsible for rendering the UI Controls (questions, labels, descriptions, validation messages…), collecting the data entered along the flow (the answers), and navigating through the next steps.

It does so by:

1.  Invoking the decision service at both the start of the flow and at each step in the flow. The decision service returns a JSON payload with all the necessary data to proceed for the entire step.
2.  Maintaining the state of the flow. That is, the state machine representing the flow is maintained by the Test Drive Client and not by the decision service (The decision service is stateless).
3.  Exiting when the end of the flow is reported by the decision service.

All of this is by default implemented in an interoperable fashion, as the same Test Drive Client can be reused on different pages and with different use cases.

## What the Test Drive Client Needs from the Decision Service returned payload

The decision service informs the front end UI each and every prompt to present to the user, throughout the form. It likewise may define whether to execute a decision/computation in the background before moving on to subsequent stages. 

The content presented in the form at a given point can define different paths depending upon
 * Previously entered data data entry to make decisions. For example, the form may branch to a different step, or specify different UI controls 
 * The output of decisions and computations performed between steps
 * Data already known about the end user, for example data populated from an external CRM system

There are certain rules which are useful to implement only at the start or end of the form. For example, telling the Test Drive Client where to store the accrued form data, and telling the Test Drive Client when the form is complete.

