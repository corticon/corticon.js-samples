
# Car Insurance Premium Calculation 

This document provides an overview of a car insurance premium calculation project built with Corticon. The ruleflow demonstrates a typical "rating engine" use case, where business rules are used to determine the base premiums for various auto insurance coverages based on applicant, driver, and vehicle data.

## Business Purpose

The primary goal of this Corticon project is to automate and manage the complex business logic required to calculate car insurance premiums. It takes applicant and vehicle details as input and processes them through a series of logical steps to produce the appropriate base rates for different policy coverages. This separates the complex rating logic from the core application code, allowing business analysts to easily update rates, discounts, and territorial definitions without requiring new software development cycles.

## Ruleflow Process

The premium calculation is executed in a structured, multi-step ruleflow that orchestrates the entire decision-making process. Each step represents a distinct logical unit of work.

1.  **Coverage Types (`Coverage Types.ers`)**: This rulesheet defines the fundamental insurance coverages available (e.g., Bodily Injury, Collision, Comprehensive). It establishes their basic properties, such as whether the coverage is compulsory or optional, its default limits, and its base deductibles.

2.  **Operator Classes (`Operator Classes.ers`)**: Drivers are categorized into different classes based on their risk profile. The rules evaluate factors like years licensed, age, vehicle use (business or personal), and driver training completion to assign an `operatorClass` and a corresponding `operatorClassNo`.

3.  **Anti-Theft Categorization (`Anti Theft Categorization.ers`)**: This step categorizes various anti-theft devices into five distinct tiers. This categorization is used in a subsequent step to determine the applicable discount percentage.

4.  **Discounts (`Discounts` Subflow)**: This subflow contains a collection of rulesheets dedicated to calculating different types of discounts.
    * **Anti-Theft Discounts**: Calculates the percentage discount based on the highest category of anti-theft device installed on the vehicle. It also handles more complex scenarios, such as providing a larger discount if devices from multiple categories are present.
    * **Multi-Car Discounts**: Applies a flat 5% discount to specific coverages if there are two or more vehicles on the policy.
    * **Mileage Discounts**: Applies a 10% discount for vehicles driven 7,500 miles or less annually, and a 5% discount for vehicles driven between 7,501 and 9,999 miles.

5.  **Rating Territories (`Rating Territories.ers`)**: This acts as a large decision table that assigns a geographic `ratingTerritory` number based on the applicant's town. It also determines the county based on the town's statistical code.

6.  **Class-Territory Base Rates (`Class-Territory Base Rates.ers`)**: This is the core rating engine of the project. It uses a composite key of the driver's `operatorClassNo` and the `ratingTerritory` to look up and assign the final base premium rates and adjustment factors for multiple core coverages (Bodily Injury, Personal Injury Protection, etc.) simultaneously.

## Notable Rule Aspects

This Corticon project showcases several powerful features for managing complex business logic:

* **Data-Driven Rating**: The `Rating Territories` and `Class-Territory Base Rates` rulesheets are excellent examples of using Corticon to manage large sets of rating data. Instead of hard-coding hundreds of rates and town assignments, the logic is maintained in clear, tabular decision tables that are easy for business users to update.
* **Modular Design**: The use of a main Ruleflow (`Flow.erf`) that calls a `Subflow` (`Discounts`) demonstrates a modular approach. This separation of concerns makes the overall process easier to understand, maintain, and test.
* **Discount Overrides**: The `Anti Theft Discounts` rulesheet uses Corticon's override feature. For example, a vehicle with a Category 4 device might get a 20% discount, but if it also has a Category 1 device, a separate rule overrides the first and grants a higher 25% discount. This allows for the elegant handling of exceptions and combination-based logic.
* **Efficient Scoping with Filters**: The discount rulesheets use filters to efficiently apply rules to only the relevant data. For instance, the `MultiCar Discounts` rulesheet is only processed if the `vehiclesOnPolicy->size>=2` filter is met, and the discounts are applied only to specific coverage parts (e.g., `part1.componentID=1`). This prevents unnecessary rule execution and precisely targets actions.