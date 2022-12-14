# Car Insurance Quote Rules


- First, the app must prompt the applicant to enter the number of drivers on the policy, number of vehicles on the policy, and their state of residents. Each of these values need to be stored, as their respective responses will elicit different form paths.
- The form will gather information for each driver, only asking questions based upon questions that are [legally allowable](https://www.thezebra.com/resources/research/car-insurance-rating-factors-by-state/) in that state.
- Next, the end user will select a vehicle make, model, and year for each of their vehicles. The ‘make’ vocabulary attribute will be selected, based upon the values available from [this](https://api.npoint.io/d487567c8a34a506350e) REST endpoint.  
- The ‘make’ attribute will now be used as part of a JSON path query, defined in the rules, to return all models from [this](https://api.npoint.io/9da0ffc399de605ffa6d) REST endpoint with the specified make.  
- Based upon the selected model, only the model years that actually exist will be presented to the end user to select in a dropdown, by similarly filtering by model at [this](https://api.npoint.io/6164bb04bfc421a11a74) REST endpoint.
- Using the accrued data about the drivers, vehicles, and allowable risk factor considerations, a policy is created with various endorsements and discounts.
  