# Dynamic Forms with Corticon.js

> For the latest, most complete documentation, see the dedicated [Corticon.js Dynamic Forms site](https://corticon.github.io/corticon-dynamic-forms/) and the [corticon-dynamic-forms repository](https://github.com/corticon/corticon-dynamic-forms).

This directory demonstrates building rules-driven dynamic forms with Corticon.js. Form logic is authored in Corticon.js Studio and executed as a Decision Service, allowing much of the form to be defined and maintained by non-developers through a framework-agnostic design pattern that maximizes reuse of form logic.

Try a Corticon.js rules-driven dynamic form with the [test driver on CodePen](https://codepen.io/SethMeldon/pen/wvOGvra).

## What We Mean by Dynamic Forms

Most frameworks handle simple forms easily, but dynamic forms are harder to build and maintain — especially for use cases with hundreds of fields and questions, or rule sets that change frequently. Complex forms produce many possible paths for the end user, such as completing an insurance claim.

The core challenges are:

- Managing the rules and consolidating them into a single system that can be tested across paths without extensive manual effort.
- Defining those rules in a way a business user can maintain without technical experience.
- Rendering the resulting form on the front end without requiring developers to have domain knowledge of the business process, and maintaining changes without lengthy implementation and regression cycles.

## The Corticon.js Approach

Dynamic forms are one use case for Corticon.js. The solution is architected around a model/view separation:

- The **model** is generated from the rules.
- A generic **view** component renders the instructions from the model. It can be hosted in any web or mobile application.

Rule modelers use Corticon.js Studio to define the business rules that drive the form. Rather than only automating a decision from data that is already known, a dynamic-forms Decision Service gathers data from the end user and presents additional prompts conditioned on previous answers.

Rule modelers — who may be developers or business analysts comfortable with tools such as Excel — define, in Corticon.js Studio:

- Which prompts to present
- The input type for each prompt
- The order of prompts
- Constraints and validations on entered data
- How prior responses affect subsequent prompts
- When the required data has been gathered and is ready to pass to downstream systems

This logic is transpiled into a Decision Service JavaScript bundle. A front-end rendering component handles the form's styling and user interface, invokes the Decision Service as the user advances, and renders the prompts, constraints, and validations the Decision Service specifies.

For example, an insurance quoting form should:

- Guide the end user efficiently, avoiding inapplicable prompts (for example, not asking for a vehicle make on a renter's policy, or for an address already known from an existing customer record).
- Avoid unnecessary round-trips to a server for each dynamic step.
- Evaluate accumulated user input, data already known about the user, or data retrieved from external endpoints at each decision point.
- Keep form-rendering logic separate from prompt content, so the rendering component controls appearance and behavior while the Decision Service controls which prompt to show, the options to present, and where the response is captured.

## Form Accelerator Template

To get started, this directory provides a form accelerator template consisting of:

- A base Corticon.js Rule Vocabulary of UI-definition components that the rendering layer can display out of the box.
- A test-driver HTML page for developing and previewing the form as you build it.
- JavaScript files that connect the Decision Service to the front-end HTML, translating the Rule Vocabulary's UI terminology into HTML input types.
