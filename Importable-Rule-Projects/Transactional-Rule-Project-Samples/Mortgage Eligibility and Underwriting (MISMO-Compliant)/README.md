# Mortgage Eligibility and Underwriting (MISMO-Compliant)

## Business Purpose
This decision service is designed to automate the mortgage underwriting process. It determines a borrower's eligibility for various loan programs by evaluating their financial health against a complex set of underwriting criteria. The service assesses factors such as Loan-to-Value (LTV) ratio, FICO score, employment status, and property type to identify all mortgage products for which an applicant qualifies. For each eligible product, it also determines the required documentation and the applicable interest rate. The vocabulary used is aligned with MISMO (Mortgage Industry Standards Maintenance Organization) standards.

## Ruleflow Process

The service uses a sophisticated, multi-level ruleflow that assesses eligibility for different loan programs in sequence. An application is evaluated against each program, and all qualifying products are added to the final list of eligible options.

1.  **"Regular" Program Eligibility**: This is the first sub-flow, which determines eligibility for standard "Regular" mortgage products.
    * **LTV & FICO Score Evaluation**: The initial rulesheet acts as a large decision table, checking the borrower's Loan-to-Value (LTV) ratio and FICO credit score to determine a `credit_risk_rating`. Different LTV/FICO combinations result in different risk ratings. Applications that do not meet the minimum thresholds are immediately disqualified from this program.
    * **Property and Employment Checks**: Subsequent rulesheets verify other critical criteria, such as ensuring the property is not a mobile home and that the borrower's debt-to-income (DTI) ratio is within an acceptable range (e.g., <= 40%). It also checks for specific documentation requirements based on employment type (e.g., self-employed vs. salaried).
    * **Rate and Program Assignment**: If all checks are passed, the applicant is deemed eligible for the "Regular" program, and a corresponding interest rate and documentation requirements are assigned.

2.  **"Select" Program Eligibility**: This sub-flow runs after the "Regular" program evaluation and checks for eligibility against a different set of criteria for "Select" mortgage products.
    * **LTV & FICO Score Evaluation**: Similar to the "Regular" program, this step uses a decision table to assess the borrower's LTV and FICO score, but with different thresholds specific to the "Select" program.
    * **Property and Financial Checks**: These rules verify that the property is an eligible type (e.g., a Single Family Home) and that the borrower meets specific financial requirements, such as having a certain amount of cash reserves.
    * **Rate and Documentation Determination**: Applicants who pass all "Select" criteria are assigned the corresponding program name, interest rate, and a specific list of required documentation (e.g., "2 years 1040s and 2 years W2s").

3.  **Final Eligibility Check**: A final, top-level rulesheet checks if the application was found eligible for *any* "Select" program loan. This step can be used to provide a conclusive message to the user about their overall eligibility status for this premium loan category.

## Notable Rule Aspects

This project showcases a robust and scalable approach to modeling complex underwriting guidelines.

* **Multi-Level, Modular Ruleflows**: The use of nested sub-flows (one for each major loan program) is a powerful way to organize complex and distinct sets of rules. This modular design allows new loan programs to be added or existing ones to be modified with minimal impact on the rest of the system.
* **Decision Tables for Core Underwriting Rules**: The LTV/FICO score evaluations in both the "Regular" and "Select" programs are classic examples of using decision tables. This technique makes the core credit risk policies transparent, easy for business analysts to understand, and simple to update as market conditions or underwriting standards change.
* **Collection of Eligible Products**: The service is designed to evaluate an applicant against multiple potential products and return a collection of all programs for which they are eligible. This is a common and valuable pattern in product recommendation and eligibility systems.
* **Dynamic Documentation Requirements**: The rules do not use a one-size-fits-all approach to documentation. Instead, they dynamically assign specific documentation needs based on the applicant's attributes (e.g., employment type) and the loan program they qualify for.
* **Clear Separation of Logic**: Each rulesheet in the flow has a distinct responsibility—validating LTV/Score, checking property type, determining documentation, etc. This clear separation of concerns makes the overall underwriting process highly transparent and manageable.