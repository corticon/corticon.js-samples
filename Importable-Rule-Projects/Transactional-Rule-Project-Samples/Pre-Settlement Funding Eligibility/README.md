# Pre-Settlement Funding Eligibility

## Business Purpose
This decision service automates the eligibility determination process for pre-settlement funding applications. It evaluates if a plaintiff in an ongoing lawsuit qualifies for a cash advance against their potential future settlement. The rules assess the applicant's legal and financial situation, the specifics of their case, and the state-specific regulations that govern this type of funding.

## Ruleflow Process

The eligibility process is structured as a two-step ruleflow to efficiently screen applications.

1.  **Claimant & Case Eligibility**: This is the initial screening step that validates the fundamental criteria of the applicant and their legal case. An application is checked for the following:
    * **Bankruptcy Status**: The applicant must not be currently in bankruptcy.
    * **Prior Funding**: The applicant must not have received prior funding for the same legal case.
    * **Legal Representation**: The applicant must have retained an attorney for their case.
    * **Valid Case Type**: The lawsuit must fall into one of the approved categories, such as Motor Vehicle Accident, Premise Liability, or Medical Malpractice.

2.  **State-Level Eligibility**: If the claimant and case pass the initial screening, this step applies a set of rules based on the applicant's state of residence, reflecting the different legal and business requirements across jurisdictions.
    * **Ineligible States**: The service checks against a list of states (e.g., Colorado, Maryland, North Carolina) where the company does not offer funding. Applications from these states are denied.
    * **Minimum Case Value**: For states where funding is offered, the rules check if the `estimated_case_value` of the lawsuit meets a specific minimum financial threshold. These thresholds vary by state (e.g., Arkansas requires a case value of at least $50,000, while Illinois requires $400,000).

## Notable Rule Aspects

This project demonstrates several effective techniques for managing complex eligibility criteria.

* **Multi-Stage Vetting**: The ruleflow employs a sequential, two-stage process. It first validates universal criteria related to the claimant and then applies more specific, jurisdiction-based rules. This creates an efficient "eligibility funnel," allowing applications to be disqualified early for fundamental reasons before proceeding to more nuanced checks.
* **Jurisdiction-Specific Logic**: The `State Eligibility` rulesheet is a clear example of how to manage business rules that vary by region. It uses a straightforward decision table structure to define ineligible states and set distinct minimum case value thresholds for others, making it easy to update as state regulations change.
* **Exclusionary Rules (Blacklisting)**: The service effectively uses a "blacklist" to automatically deny applications from states where funding is not available, which is a common and efficient pattern for handling geographic restrictions.
* **Clear Boolean Logic**: The rules for claimant eligibility are based on simple, clear boolean attributes (`has_retained_attorney`, `is_in_bankruptcy`), which makes the logic easy to read, understand, and maintain.