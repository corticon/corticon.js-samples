Corticon’s rule modeling capability is extended and enhanced by custom operators, allowing developers
to implement specialized logic while providing simplicity for rule modelers.

Custom operators in Corticon allow to:
1.	Handle complex calculations not natively supported by Corticon.
2.	Reuse specialized logic across multiple rule projects.
3.	Integrate custom calculations and transformations seamlessly into your decision services

This custom operators sample determines investment values over time using parameters like interest rates,
and durations. In particular, it illustrates the flexibility with parameter types and number.

Disclaimer: They are meant to show how to write operators and the various possibilities.
They are not meant to be used as such in production environments.

Understanding the example
-------------------------

1. Multi-Type Parameters

Custom operators in Corticon can handle multiple data types for their inputs.
The PresentValue and FutureValue operators demonstrate this by accepting:
• Numerical types: Integers, Decimals, or Strings representing numbers.
• Date/DateTime types: For duration calculations.

This flexibility enables operators to interpret data contextually.  For example if the number
of years parameter is passed as a Date or DateTime datatype we calculate durations dynamically,
using a future date to compute the number of years from today (a date 18 months in the future
translates into 1.5 years).


2. Default and Fallback Values

These operators gracefully handle missing or null parameters:
• Defaulting the number of years to 1 when no value is provided.
• Returning null when critical inputs like futureValue or interestRate are absent.

3. Validations and Error Handling

Before computation, the operators validate input types to ensure correctness.
This "fail-fast" approach stops execution early if inputs don’t match expectations, reducing potential downstream errors.


For more information, check the file FinanceCustomFunctions.js
