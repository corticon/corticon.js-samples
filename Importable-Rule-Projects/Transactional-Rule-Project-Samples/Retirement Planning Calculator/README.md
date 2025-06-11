# Retirement Readiness Calculator

## Business Purpose
This decision service is a financial planning tool designed to help individuals assess their retirement readiness. It takes a user's current financial details—such as age, current savings, and monthly contributions—along with their retirement goals, to project their total estimated savings at their target retirement age. The service then compares this projection to the user's calculated savings goal and provides personalized guidance on whether they are on track, offering actionable advice to help them achieve their financial objectives.

## Ruleflow Process

The retirement calculation is performed in a logical, three-step process:

1.  **Intermediate Calculations**: The service first establishes the key timeframes for the projection. It calculates the `yearsToRetirement` (the time from the user's current age to their target retirement age) and the `yearsInRetirement` (the duration from retirement to their life expectancy).

2.  **Estimated Savings At Retirement**: This step contains the core financial projection logic. It calculates the user's total expected savings by:
    * Determining the future value of the user's `currentRetirementSavings` by applying a standard compound interest formula over the calculated `yearsToRetirement`.
    * Calculating the future value of all planned `monthlyContribution` amounts from now until retirement, using a future value of an annuity formula.
    * Summing these two results to arrive at the total `estimatedSavingsAtRetirement`.

3.  **Retirement Readiness and Guidance**: In the final step, the service assesses the user's financial position and provides tailored advice.
    * It first calculates the user's `targetRetirementSavings` goal based on their desired monthly budget during retirement and their expected lifespan.
    * It then compares the `estimatedSavingsAtRetirement` to this target.
    * Based on whether there is a projected surplus or shortfall, a unique set of personalized guidance messages is generated. If the user is on track, it offers congratulations and suggests options like retiring earlier. If there is a shortfall, it provides constructive advice on how to close the gap, such as increasing contributions, delaying retirement, or adjusting the retirement budget.

## Notable Rule Aspects

This project demonstrates several key features for building financial planning tools with a business rules engine.

* **Implementation of Financial Formulas**: The service effectively encodes standard time-value of money formulas (Future Value and Future Value of an Annuity) directly into the rules. This encapsulates complex financial logic in a manageable and transparent way.
* **Goal-Oriented Analysis**: The entire ruleflow is structured around a central goal: comparing a projected outcome (`estimatedSavingsAtRetirement`) against a calculated target (`targetRetirementSavings`). This is a powerful pattern for building advisory and recommendation systems.
* **Dynamic and Personalized Guidance**: Instead of providing a static report, the service generates dynamic, conditional guidance. The messages are tailored to the user's specific situation, offering either positive reinforcement or actionable, constructive advice, which makes the output more personal and helpful.
* **Clear Separation of Concerns**: The process is broken down into logical stages (setup calculations, core projection, and final assessment). This modularity makes the entire decision-making process easy to understand, test, and maintain. For example, assumptions like the `annualReturnRate` can be modified in one location without affecting the overall structure.