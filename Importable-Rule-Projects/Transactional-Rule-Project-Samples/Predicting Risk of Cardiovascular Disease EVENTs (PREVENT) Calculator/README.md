# Cardiovascular Disease (CVD) Risk Calculator (AHA PREVENT™ Model)

## Business Purpose
This decision service is a clinical support tool that implements the American Heart Association's PREVENT™ (Predicting Risk of cardiovascular disease EVENTs) equations. Its purpose is to estimate a patient's 10-year and 30-year risk of developing atherosclerotic cardiovascular disease (ASCVD), including heart attack and stroke. The calculator uses a comprehensive set of patient health metrics to generate a quantitative risk score, which is then translated into a qualitative risk level to help clinicians with patient counseling and preventative treatment planning.

## Ruleflow Process

The service executes in a clear, three-step sequence to ensure accurate risk calculation.

1.  **Data Preparation and Conversions**: The first step prepares the raw patient data for the PREVENT equations. This includes:
    * Calculating the patient's current age from their date of birth.
    * Converting lab values for HDL and Total Cholesterol from milligrams per deciliter (mg/dL) to millimoles per liter (mmol/L), the standard unit required by the formulas.
    * Setting boolean flags to indicate if the patient is currently on statin or blood pressure medications.

2.  **Risk Calculation via PREVENT Equations**: This is the core of the service, where the complex PREVENT formulas are executed.
    * The logic is segregated by the patient's sex, as the PREVENT model uses different coefficients for males and females.
    * For both 10-year and 30-year predictions, a `linearPredictor` score is calculated. This score is a summation of multiple terms, where each term is a patient attribute (e.g., age, cholesterol level, systolic blood pressure, smoking status, kidney function) multiplied by its specific coefficient from the PREVENT model. The formula also accounts for interactions between variables (e.g., age multiplied by cholesterol).
    * The final risk percentage is then calculated from the `linearPredictor` score using a baseline survival formula.

3.  **Risk Interpretation**: The calculated 10-year CVD risk percentage is classified into one of three qualitative categories to provide a clear summary for the clinician:
    * **Low risk** (< 7.5%)
    * **Intermediate risk** (7.5% to 19.99%)
    * **High risk** (>= 20%)

## Notable Rule Aspects

This project demonstrates several powerful techniques for implementing complex clinical algorithms in a decision service.

* **Complex Medical Algorithm Implementation**: This service is a prime example of translating a sophisticated, multi-variable statistical model into an executable business rule set. This encapsulates the complex medical logic, making it easier to manage and validate as a standalone component.
* **Segregation of Logic**: The process is cleanly divided into three distinct rulesheets: data preparation, core calculation, and interpretation. This separation of concerns is a best practice that improves the clarity and maintainability of the rules. For instance, the PREVENT equations can be updated based on new medical research without impacting the data conversion or risk interpretation rules.
* **Handling Conditional Formulas**: The rules effectively manage the different formulas required for males and females by using separate, clearly defined rule columns for each, ensuring the correct coefficients are applied based on the patient's sex.
* **Unit of Measure Standardization**: The initial `Data Conversions` step highlights a critical aspect of implementing medical calculations: ensuring all inputs are converted to a standard unit of measure before being used in the core formulas. This prevents errors and ensures the accuracy of the final risk score.