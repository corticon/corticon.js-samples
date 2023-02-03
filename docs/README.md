
# Corticon.js Dynamic Forms Starter Pack
> Codeless Definition of Complex Dynamic Form Behavior 

- Separate form logic from form renderer
- Zero platform or front end dependencies
- Execute decisions and calculations over the course of a course

---
## What it is

Dynamic Forms are just one use case for Corticon.js. 

In a nutshell, with Corticon and Corticon.js, you use a model-driven development environment called Corticon Studio for defining rules that will change input data based upon conditions and their resulting actions. Typically, a rules engine is used for making a decision from data that is _already known and available_, for example, calculating a loan rate based upon the data known about an applicant. 

## Corticon.js vs Corticon Server

Corticon.js is the JavaScript runtime variant of Corticon, distinct from deployments onto Corticon Server. With Corticon.js, we can do many things that are less well suited for client/server applications, such as extending the afformentioned tradional use cases for rules engines into use cases where rules running on the front end define a dynamic flow of an end user form. 

## Dynamic Forms with Corticon.js

For example, consider a car insurance application. Insurers in the United States are regulated at the state level, and states allow different kinds of factors to be weighed as part of the evaluation. A dynamic form for the insurance application can thus be used to only present prompts based upon the insured's state of residence. Depending upon the number of drivers, the number of vehicles, and the types of vehicles, different prompts would need to be presented, and different data elements captured. 

This logic can be managed in business rules by leveraging the fact that the deployable in Corticon.js is a self contained JavaScript bundle, so all rule logic can be built directly into a front end website or app to guide the rendering of the form. 
