# Washington D.C. Medicaid and CHIP Eligibility Determination

## Business Purpose
This decision service automates the eligibility screening process for Washington D.C.'s public health insurance programs: Medicaid and the Children's Health Insurance Program (CHIP). It evaluates applicants and their household members against a comprehensive set of rules covering citizenship, income, and various demographic and situational criteria. The service determines if an individual is eligible for Medicaid, and if not, subsequently checks their eligibility for CHIP. For those who qualify for CHIP, it also calculates the applicable monthly premiums.

## Ruleflow Process

The service is orchestrated through a main ruleflow that executes two major sub-flows in sequence: Medicaid eligibility followed by CHIP eligibility.

### 1. Medicaid Applicant Eligibility
This sub-flow is dedicated to determining if an applicant qualifies for Medicaid.

* **Household Grouping**: The process begins by structuring the incoming data. It creates unique `Household` entities and groups individual `Person` records into them based on their primary insured ID. It then calculates the total household size and the Modified Adjusted Gross Income (MAGI) by summing the wages of all members.
* **FPL Calculation**: Using the calculated household size, the rules look up the corresponding Federal Poverty Level (FPL) income threshold from a decision table. This FPL value is then used to calculate various percentage-based thresholds (e.g., 138% FPL, 223% FPL) that are critical for income tests. The household's actual income as a percentage of the FPL is also calculated.
* **Citizenship and Non-Financial Rules**: Applicants are screened against non-financial requirements. The primary check is for U.S. citizenship, with rules that account for exceptions, such as for pregnant individuals or those with emergency medical conditions.
* **MAGI Eligibility Determination**: The core logic resides in this step, where each person is evaluated against numerous MAGI-based eligibility groups (cohorts). An individual can be matched with multiple cohorts, such as 'Pregnant Women', 'Childless Adults', 'Aged, Blind & Disabled', or 'Former Foster Care Youth', based on their age, income, and other specific life situations.
* **Output Finalization**: The resulting eligibility cohorts are parsed and assigned to the person's record, and a final Medicaid eligibility decision is made.

### 2. CHIP Eligibility and Premium Calculation
If an applicant is found to be ineligible for Medicaid, this second sub-flow is executed to determine CHIP eligibility.

* **Income and Status Requirements**: The service first checks if the applicant meets the basic criteria for CHIP: they must be under 19 years old, not an inmate, and have a household income below 400% of the FPL. Individuals already eligible for Medicaid are screened out.
* **Tiered Premium Determination**: For CHIP-eligible applicants, the rules determine the monthly premium structure. The premium per child and the maximum household premium are set based on the household's income level relative to the FPL (e.g., <220% FPL, 220-250% FPL, etc.).
* **Final Premium Calculation**: The final step calculates the total monthly premium for the household by multiplying the number of eligible children by the per-child premium, while respecting the maximum monthly premium cap for households with many children.

## Notable Rule Aspects
This project highlights several key techniques for implementing complex public sector eligibility rules:

* **Cascading Logic**: The overall design uses two distinct ruleflows to create a "waterfall" or "cascading" eligibility model. An applicant is fully evaluated for Medicaid before being considered for CHIP, which is a common pattern in public assistance programs.
* **In-Memory Data Aggregation**: The rules first create temporary `Household` objects to aggregate and calculate shared data like total income (MAGI) and household size. This information is then distributed back to each individual `Person` record, a powerful pattern that simplifies the writing of subsequent person-level rules.
* **Decision Tables for Policy Management**: The `Set FPL from Household Size` rulesheet serves as a clear and easily maintainable decision table for a core piece of policy data. This allows administrators to update the annual FPL values without changing the underlying rule logic.
* **Multi-Cohort Eligibility**: The system is designed to identify all possible Medicaid eligibility pathways for an individual. A person can be matched to multiple cohorts, and all successful matches are presented in the final output, providing a complete picture of their eligibility.
* **Tiered Rate Structures**: The CHIP premium calculation is a classic example of a tiered system. The rules cleanly define different premium amounts for different income brackets based on FPL percentages.