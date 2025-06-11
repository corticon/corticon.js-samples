# Morphine Milligram Equivalents (MME) Calculator and Risk Assessment

## Business Purpose
This decision service is a clinical support tool designed to help healthcare providers manage opioid prescriptions safely. It calculates the total daily opioid dosage for a patient, converting various opioid types and dosages into their Morphine Milligram Equivalents (MME). Based on the total daily MME, the service provides an assessment of the patient's comparative risk of overdose, along with corresponding clinical guidance, to support safe and effective pain management.

## Ruleflow Process

The service operates through a single, streamlined rulesheet that performs the calculation and risk assessment in a logical sequence:

1.  **Opioid Conversion Factor Lookup**: For each opioid medication provided for an individual, the service first identifies the drug and looks up its standard MME conversion factor. This factor represents the drug's potency relative to morphine.
2.  **Daily MME Calculation per Drug**: The service calculates the daily MME for each individual medication. This is typically done by multiplying the dosage value by the number of doses per day and the drug's specific conversion factor. For medications like transdermal patches (e.g., Fentanyl), a direct conversion of the dosage is used.
3.  **Total MME Summation**: All individual drug MMEs are summed to determine the patient's total daily MME across all their prescribed opioids.
4.  **Risk Stratification and Guidance**: The final total daily MME value is used to classify the patient into one of four risk tiers. Each tier is associated with a specific level of overdose risk and a corresponding clinical recommendation to guide the prescriber on how to proceed.

## Notable Rule Aspects

This project is a clear example of implementing clinical guidelines as an executable decision service.

* **Decision Tables for Clinical Data**: The core of the service is built on two simple and effective decision tables:
    * The first table maps a list of common opioid drugs (Codeine, Fentanyl, Hydrocodone, etc.) to their official MME `conversionFactor`.
    * The second table maps the calculated total daily MME to a specific `mmeRisk` category and a plain-language description of the risk and associated clinical guidance.
    This approach allows clinical data and guidelines to be managed and updated easily without changing the application's code.
* **Calculation and Aggregation**: The rules demonstrate a powerful pattern of performing a calculation for each item in a collection (calculating `mmeDaily` for each `Drug`) and then aggregating the results using a collection operator (`->sum`) to get a total value for the patient.
* **Actionable, Risk-Based Output**: The service provides more than just a numerical score. The final output is an actionable, text-based recommendation tailored to the calculated risk level (e.g., "2x higher risk of overdose- ...use caution when prescribing opioids at any dose..."), making the information immediately useful for clinical decision-making.