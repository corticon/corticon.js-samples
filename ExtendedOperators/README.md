# Corticon.js Extended Operators

This directory contains examples of **Extended Operators** in Corticon.js. Extended Operators add custom JavaScript logic to a Decision Service and are useful for complex calculations, session-data handling, and other logic beyond the built-in operators.

## What Extended Operators Enable

- **Custom logic:** Specialized calculations or transformations.
- **Data handling:** Manage session data or interact with external systems.
- **Reusable functions:** Share logic across multiple Decision Services.
- **Advanced rule modeling:** Extend Corticon.js beyond its built-in operators.

## Directory Structure

### [BasicSampleGetSetOperators](BasicSampleGetSetOperators/)
Demonstrates custom `get` and `set` operators for managing session data.

- Retrieve and store session data using `getSessionData` and `setSessionData`.
- Handle multiple data types, including `Date`, `DateTime`, and `Decimal`.
- Use helper functions for data conversion.

Files:
- `getSetData.js` — implements the custom `get` and `set` operators.
- `getSetData.ers` — Rulesheet demonstrating the operators.
- `getSetDataTest.ert` — test cases for validating the operators.
- `getSetDataVocab.ecore` — Rule Vocabulary for the rules.

### [Finance](Finance/)
Demonstrates financial calculations such as Present Value and Future Value using custom operators.

- Perform calculations across multiple data types (`Decimal`, `Date`, `DateTime`).
- Handle fractional years using `Date` or `DateTime` inputs.
- Validate input parameters.

Files:
- `FinanceCustomFunctions.js` — implements custom functions such as `presentValue` and `futureValue`.
- `finance.ers` — Rulesheet demonstrating financial calculations.
- `financeInteger.ers`, `financeString.ers` — variants for integer and string inputs.
- `test.ert` — test cases for validating the rules.
- `vocab.ecore` — Rule Vocabulary for the financial rules.

## Functionality Demonstrated

- **Custom operators for session data:** `getSessionData` retrieves and converts session data to the appropriate type; `setSessionData` stores it in a JSON-compatible format.
- **Financial calculations:** Present Value and Future Value based on an interest rate and time period, including fractional years.
- **Input validation:** Both examples validate parameter types and return descriptive error messages for invalid inputs.
- **Reusable logic:** Custom functions are implemented in JavaScript and exported for consistent reuse across Decision Services.

## How to Use These Examples

1. **Import the rule projects:** In Corticon.js Studio, import the contents of one of the subdirectories into a Rule Project.
2. **Run the tests:** Use the `.ert` files to validate the rules and custom operators. See [setting a mock implementation for the Studio tester](https://docs.progress.com/bundle/corticon-js-integration/page/Customized-data-access-operators.html).
3. **Customize the operators:** Modify the JavaScript files (for example, `getSetData.js`, `FinanceCustomFunctions.js`) to adapt them to your use case.
4. **Deploy the Decision Services:** Package and deploy to your target environment, such as a browser, Node.js, or a serverless function.

## Notes

- `BasicSampleGetSetOperators` uses an in-memory `Map` to store session data. For production, use a persistent storage mechanism.
- The `Finance` example includes helper functions for fractional years and input validation that can be extended to additional use cases.

## Further Resources

- [Corticon.js documentation on using data access operators](https://docs.progress.com/bundle/corticon-js-integration/page/About-Corticon.js-integration.html)
- [Blog: Mastering Custom Corticon.js Operators: Flexibility Beyond Standard Implementations](https://www.progress.com/blogs/mastering-custom-corticon-operators-flexibility-beyond-standard-implementations)
