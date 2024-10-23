# Browse Healthcare.gov Marketplace Plans with a Corticon.js Dynamic Form

Just in time for [open enrollment](https://www.healthcare.gov/quick-guide/dates-and-deadlines/), let's take a look at how Corticon.js can provide all of the logic involved in building a front end dynamic form for selecting the optimal healthcare plan using healthcare.gov. As with all [Corticon.js dynamic forms](https://www.progress.com/corticon/solutions/dynamic-form-rules), the renderer is entirely independent of the business case at hand—Corticon.js JavaScript decision services tell the renderer what to do and when, the renderer captures the users’ inputs and passes along the inputs back to Corticon.js.

[Healthcare.gov ](https://www.healthcare.gov/)is one of the main pathways through which Americans can sign up for a healthcare plan. Like shopping on an ecommerce site and filtering down a search query result, selecting a plan entails narrowing down a list of options from a massive initial set of plan data. The variables considered by this dynamic form are as follows:
•	Geography – based upon a household's address, an applicant may be routed to a different healthcare marketplace—[not all US states make use of healthcare.gov](https://www.healthcare.gov/marketplace-in-your-state/), opting instead to manage their own portal or share a portal with other non-healthcare.gov states. Additionally, each state has any number of Rating Areas which impact the rates for each plan.
•	Household – who lives in the household? It’s common for plan options to [differentiate between characteristics](https://www.healthcare.gov/income-and-household-information/household-size/) like married/unmarried couples, number of dependents, income sources, whether or not they are tobacco users, if anyone is pregnant, and their residency statuses.
•	Cost Savings Programs – Depending on the household’s income and other variables described above, plans may provide cost waivers or tax credits to members. In this form, we’ll determine eligibility for the [advance premium tax credit](https://www.healthcare.gov/glossary/advanced-premium-tax-credit/).
•	Coverage options – Filtering down through the options, plans have [different coverages and benefits](https://www.healthcare.gov/choose-a-plan/comparing-plans/) like specialty drug coverages, homecare services, or chiropractic care. Copays, coinsurance rates, premiums, and limit for these services likewise vary, sometimes depending on criteria specific to a given household member.
•	Quality – Enrollees of plans are annually surveyed about their experiences with their respective plan, providing a 1-5 rating for many different measures like customer service experience and availability of health services in a reasonable amount of time. [This measure is indexed](https://www.healthcare.gov/quality-ratings/), along with patient outcomes data (e.g. readmissions, appropriate frequency and kind of screenings, accurate diagnostic determinations from reported clinical notes).
These factors are evaluated based upon data provided by the end user filling out the form, APIs exposed by the healthcare.gov [marketplace API](https://developer.cms.gov/marketplace-api/api-spec#/), with rules specifying what data should be obtained from each. Rules concurrently are ruling out plans based upon eligibility criteria and end user preferences for the healthcare plan’s coverages and costs. Finally, all of the matching plans are presented back to the user with links to the plan overview.

## Data gathered from the end user filling out the form:

•	Household zipcode
•	Household members’ ages, marital statuses, tax filing status, income, citizenship status, employment status, and whether they use tobacco or are pregnant,
•	Desired ‘metal’ level of plan’s coverage (Bronze, Silver, Gold)
•	Desired minimum quality level of plan

## Data gathered from REST APIs over the course of the form:

•	Retrieve household FIPS code and State Code based upon provided zip code sent to the healthcare.gov [/counties/by/zip/{zipcode}](https://developer.cms.gov/public-apis/#/Geography/get_counties_by_zip__zipcode_) endpoint
•	Retrieve the rating area for the household based upon where in the state the household is located from the healthcare.gov [/rate-areas](https://developer.cms.gov/public-apis/#/Geography/get_rate_areas) endpoint
•	Retrieve the poverty level for the state where the household is with a household of the size provided by the end user from the healthcare.gov [/states/{abbrev}/poverty-guidelines](https://developer.cms.gov/public-apis/#/Geography/get_states__abbrev__poverty_guidelines) endpoint
•	Query the healthcare.gov [/api/1/datastore/sql](https://data.healthcare.gov/api) endpoint for the Plan ID of all plans for the household state, rating area, and the age of enrollee(s)
•	Retrieve rating, metal-level, and a link to the plan brochure by querying the healthcare.gov [/plans/{plan_id}](https://developer.cms.gov/public-apis/#/Insurance%20Plans/get_plans__plan_id_) endpoint with the respective Plan ID numbers
Finally, after removing any plans beneath the quality or coverage thresholds specified, the form presents the user with the matching plans:
