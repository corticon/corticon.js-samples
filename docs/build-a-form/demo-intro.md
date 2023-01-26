
# Car Insurance Quote Rules

## Introduction

For scenarios where the input data for a decision is being entered into a form by an end user, the decisions-from-data paradigm can be extended to optimize dynamic data-collection logic presented to end users.

To illustrate, we'll consider a scenario where an insurance company is building out a new dynamic form to apply for a car insurance policy. They have documented business rules that they want to guide the mobile app’s behavior related to—

- Maintaining updated versions of the myriad business rules and benchmarks set forth by the policy’s eligibility rules.
- Guiding the user of the app (applicants) with prompts to gather information on the driver(s), the vehicle(s), risk factors, etc., without presenting unnecessary or unlawful prompts along the way (car insurance regulations in the United States are handled at a state level).

In this section, we’ll explore one implementation possibility for handling the form that will produce a quote.  


- First, the app must prompt the applicant to enter the number of drivers on the policy, number of vehicles on the policy, and their state of residents. Each of these values need to be stored, as their respective responses will elicit different form paths.
- The form will gather information for each driver, only asking questions based upon questions that are [legally allowable](https://www.thezebra.com/resources/research/car-insurance-rating-factors-by-state/) in that state.
- Next, the end user will select a vehicle make, model, and year for each of their vehicles. The ‘make’ vocabulary attribute will be selected, based upon the values available from [this](https://api.npoint.io/d487567c8a34a506350e) REST endpoint.  
- The ‘make’ attribute will now be used as part of a JSON path query, defined in the rules, to return all models from [this](https://api.npoint.io/9da0ffc399de605ffa6d) REST endpoint with the specified make.  
- Based upon the selected model, only the model years that actually exist will be presented to the end user to select in a dropdown, by similarly filtering by model at [this](https://api.npoint.io/6164bb04bfc421a11a74) REST endpoint.
- Using the accrued data about the drivers, vehicles, and allowable risk factor considerations, a policy is created with various endorsements and discounts.
  
## Building the Data Model
We can use Corticon.js Studio to model business rules to define both the dynamic form’s behavior and the eligibility/qualification rules. First, we define a unified data model—the Rule Vocabulary—that captures:

- The underwriters’ mental model of necessary data points for evaluating the applicant
- The user experience team’s vision for the logic and steps involved throughout the form’s user interface   

When working with this model in Corticon.js Studio, it is referred to as a Rule Vocabulary, but once we compile the rules into a JavaScript file, the Rule Vocabulary is translated into the JSON schema used to communicate between the front-end rendering component and the embedded business rules.

|**Rule Vocabulary - Quote Details Section**|**Rule Vocabulary - Dynamic Forms Section**|
| :-: | :-: | 
|![](../assets/quoteVocab.png) | ![](../assets/formVocab.png) |

## The Rule Vocabulary

Each of the vocabulary entities (`UI`, `UIControl`, `AutoQuote` etc) represents part of a JSON array that will be passed between the form’s presentation layer and the embedded Corticon.js decision service (a JavaScript bundle which will always be generated with the name decisionServiceBundle.js). Each attribute underlying the entities (`AutoQuote.state`, `Driver.credit_score`, etc) represents a key/value pair.

In any given use case, some of the values specified within the JSON array will only be used occasionally, and the majority of the values are relevant only ephemerally, i.e., it is unnecessary to document in the final policy quote to report that at the first stage in the application, we presented to the user each of these 50 states—we just need the actual value that was selected.


## Unique Considerations when Building Rules for Dynamic Forms Rules

In a typical decision automation use case, rulesheets and ruleflows are 'connected' from one to another when constructing the top level ruleflow. Connections are the objects that connect or “stitch” assets and objects together to control their sequence of execution.

If a connector is drawn from Rulesheet `sample1.ers` to `sample2.ers`, then when a deployed Ruleflow is invoked, it will execute the rules in `sample1.ers` first, followed by the rules in `sample2.ers`.

For dynamic forms however, instead of a decision that will always go through the same chronology during a single execution, dynamic forms require the ability to navigate throughout the objects in a ruleflow, such that different rules may fire at different times, depending upon dynamic variables. For example, the sequence may be determined based upon:

-   Data that the end user has entered to that point (e.g. to route to different parts of a ruleflow depending upon what type of claim a user has chosen to file)
-    Whether any data is pre-populated at the start of a ruleflow (e.g. leveraging account information specific to the end user as part of the decision for what gets presented in the form)

<table><tr>
<td>
  <p align="center" style="padding: 10px">
    <img alt="Forwarding" src="https://user-images.githubusercontent.com/40301564/186739602-888ae2bc-9d55-4bc6-a3cf-527e3d7e47a7.PNG" width="554">
    <br>
    <em style="color: grey">Dynamic Form Ruleflow </em>
  </p>
</td>
<td>
  <p align="center">
    <img alt="Routing" src="https://user-images.githubusercontent.com/40301564/186739592-17ba7774-31ed-413f-81f4-991308728116.PNG" width="515">
    <br>
    <em style="color: grey">Typical, Connected Ruleflow</em>
  </p>
</td>
</tr></table>
