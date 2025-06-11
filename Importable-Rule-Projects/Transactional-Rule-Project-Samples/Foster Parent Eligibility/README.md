# Foster Parent Eligibility Determination

## Business Purpose
This decision service is designed to automate the initial eligibility screening for prospective foster or pre-adoptive parents. It evaluates an application against a set of criteria defined by the Department of Children & Families (DCF) to ensure a safe, stable, and suitable environment for children. The service checks various aspects of the applicants and their household, including personal history, financial stability, and the physical characteristics of the home. The final output is an eligibility decision, which can be 'Denied', 'Department Review', 'Approved with Restrictions', or 'Pending'.

## Ruleflow Process

The eligibility determination is performed by a sequence of rulesheets, each focused on a specific area of the application.

1.  **`Capacity Limits`**: This rulesheet enforces DCF regulations regarding the number of children in a home. It checks for violations such as having too many foster children in total, too many children under the age of two, or more than one infant.

2.  **`Eligibility to Apply`**: This is a critical step that verifies the applicant's background and current situation. It checks for disqualifying conditions such as applicants being under 18, having a criminal record, recent or adverse involvement with DCF, or lacking stable income and housing. It also assesses for potential issues that require further review, such as the amount of childcare needed per week.

3.  **`Household Safety`**: This rulesheet assesses the physical safety of the home. It ensures the home is free of hazards, has essential utilities, and meets safety standards like having smoke detectors on every floor. It also handles specific checks for homes with well water, firearms, or certain breeds of pets.

4.  **`Household Furnishings`**: This step confirms the presence of essential household items. It mandates that the home must be equipped with a working refrigerator, a functional cooking stove, and an operational telephone.

5.  **`Bedroom Requirements`**: This final rulesheet evaluates the sleeping arrangements for foster children. It enforces rules about children not sharing rooms with adults or children of the opposite sex (with some exceptions for young siblings). It also verifies that each child has a separate bed, adequate storage space, and that the bedroom meets minimum size and safety egress requirements.

## Notable Rule Aspects

This project demonstrates how to model complex compliance and screening policies using business rules.

* **Violation and Warning System**: The rules are designed to produce different outcomes based on the severity of a finding.
    * **Hard Stops (`Denied`)**: Critical violations, such as an applicant being under 18 or the home lacking a working phone, result in an immediate 'Denied' status.
    * **Flags for Manual Review (`Department Review`)**: Issues that are not automatic disqualifiers but require an expert opinion, such as a household member having a past criminal record or owning a specific dog breed, set the status to 'Department Review'.
    * **Conditional Approvals (`Approved with Restrictions`)**: Situations that are permissible but require specific limitations, like needing more than 25 hours of childcare per week for a school-aged child, result in a restricted approval.
* **Logical Grouping of Rules**: The ruleflow is organized into distinct rulesheets (`Capacity Limits`, `Household Safety`, `Bedroom Requirements`, etc.), each handling a specific domain of the eligibility criteria. This modular approach makes the complex policy easier to manage, test, and update.
* **Handling Policy Exceptions with Overrides**: The `Bedroom Requirements` rulesheet contains an example of an override. While a bedroom must normally have 50 sq ft per child, a rule allows this to be waived for 'Kinship' or 'Child Specific' license types, provided the room still meets a 35 sq ft minimum. This demonstrates how to handle specific exceptions to a general rule.
* **Date-Based Logic**: The rules effectively use date-based calculations to enforce time-sensitive policies. For example, the `Eligibility to Apply` rulesheet checks if a prior DCF case was closed within the last 12 months using the `monthsBetween` operator.