
# Corticon.js Dynamic Forms Starter Pack
> Codeless Definition of Complex Dynamic Form Behavior 

- Separate form logic from form renderer
- Zero platform or front end dependencies
- Execute decisions and calculations over the course of a course

---
## What it is

Dynamic Forms are just one use case for Corticon.js.  In a nutshell, with Corticon and Corticon.js, you use a model-driven development environment called Corticon Studio for defining rules that will change input data based upon conditions and their resulting actions. Typically, a rules engine is used for making a decision from data that is _already known and available_, for example, calculating a loan rate based upon the data known about an applicant. Here, we're going to be _gathering data_ from the end user, dynamically presenting additional user prompts that may be impacted based upon previous answers.

## Dynamic Forms with Corticon.js

Think of this design pattern as if you're designing a robot. Rule modelers will use Corticon to build the brain of the robot, while front end developers will handle its body. 

Corticon will be used to specify what prompts to present to the user, the input type for responding to the prompt, in what order to present the prompts, constraints/validations on the entered data, how the previous responses may or may not impact subsequent prompts, and when the requisite data has been gathered and is ready to be passed along to downstream systems. This is all defined in Corticon.js Studio, but are then transformed into a Decision Service-- the robot brain. 

The front end/client-side component in turn will be responsible for the styles of the forms' user interface and prompts, communicating with the decision service when the user hits 'next', rendering the components of the form that the decision service specifies, along with any constraints and validations it specifies.

For example, consider a car insurance application. Insurers in the United States are regulated at the state level, and states allow different kinds of factors to be weighed as part of the evaluation. A dynamic form for the insurance application can thus be used to only present prompts based upon the insured's state of residence. Depending upon the number of drivers, the number of vehicles, and the types of vehicles, different prompts would need to be presented, and different data elements captured. 

This logic can be managed in business rules by leveraging the fact that the deployable in Corticon.js is a self contained JavaScript bundle, so all rule logic can be built directly into a front end website or app to guide the rendering of the form. 
