# Modeling Dynamic Form Rules in Corticon.js Studio

Implementing the complexities of a dynamic form's user interface often involves a  level of complexity comparable to that of a traditional decision automation use case (e.g. eligibility determination, claims handling, loan origination...). With Corticon.js, we can define this logic using the same declarative, rules-driven paradigm that enables traditional decision automation.


## Introduction

For scenarios where the input data for a decision is being entered into a form by an end user, the decisions-from-data paradigm can be extended to optimize dynamic data-collection logic presented to end users.

To illustrate, we'll consider a scenario where an insurance company is building out a new dynamic form to apply for a car insurance policy. They have documented business rules that they want to guide the mobile app’s behavior related to—

- Maintaining updated versions of the myriad business rules and benchmarks set forth by the policy’s eligibility rules.
- Guiding the user of the app (applicants) with prompts to gather information on the driver(s), the vehicle(s), risk factors, etc., without presenting unnecessary or unlawful prompts along the way (car insurance regulations in the United States are handled at a state level).

In this section, we’ll explore one implementation possibility for handling the form that will produce a quote.  