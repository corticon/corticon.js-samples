# Corticon.js Extended Operators

This directory contains examples and documentation for **Extended Operators** in Corticon.js. Extended Operators allow you to enhance the functionality of Corticon.js decision services by implementing custom logic in JavaScript. These operators are particularly useful for handling complex calculations, managing session data, and integrating advanced business logic into your decision services.

## Overview of Extended Operators

Extended Operators in Corticon.js enable:
- **Custom Logic**: Implement specialized calculations or transformations.
- **Data Handling**: Manage session data or interact with external systems.
- **Reusable Functions**: Create reusable logic for multiple decision services.
- **Advanced Rule Modeling**: Extend the capabilities of Corticon.js beyond its built-in operators.

## Directory Structure

### **BasicSampleGetSetOperators**
This example demonstrates how to use custom `get` and `set` operators to manage session data.

- **Key Features**:
  - Retrieve and store session data using `getSessionData` and `setSessionData`.
  - Handle various data types, including `Date`, `DateTime`, and `Decimal`.
  - Showcase how to use helper functions for data conversion.

- **Files**:
  - `getSetData.js`: Implements the custom `get` and `set` operators.
  - `getSetData.ers`: Rulesheet demonstrating the use of `get` and `set` operators.
  - `getSetDataTest.ert`: Test cases for validating the operators.
  - `getSetDataVocab.ecore`: Vocabulary file for the rules.

### **Finance**
This example focuses on financial calculations, such as Present Value and Future Value, using custom operators.

- **Key Features**:
  - Perform financial calculations with support for multiple data types (`Decimal`, `Date`, `DateTime`).
  - Handle fractional years using `Date` or `DateTime` inputs.
  - Validate input parameters to ensure correctness.

- **Files**:
  - `FinanceCustomFunctions.js`: Implements custom financial functions like `presentValue` and `futureValue`.
  - `finance.ers`: Rulesheet demonstrating financial calculations.
  - `financeInteger.ers` and `financeString.ers`: Variants for handling integer and string inputs.
  - `test.ert`: Test cases for validating financial rules.
  - `vocab.ecore`: Vocabulary file for the financial rules.

## Key Functionalities Demonstrated

### **1. Custom Operators for Session Data**
The `BasicSampleGetSetOperators` example shows how to:
- Use `getSessionData` to retrieve session data, converting it to the appropriate type (e.g., `Date`, `DateTime`, `Decimal`).
- Use `setSessionData` to store session data, converting it to a JSON-compatible format.

### **2. Financial Calculations**
The `Finance` example demonstrates:
- **Present Value**: Calculate the current value of a future amount based on an interest rate and time period.
- **Future Value**: Calculate the future value of a present amount based on an interest rate and time period.
- Support for fractional years using `Date` or `DateTime` inputs.

### **3. Input Validation**
Both examples include robust input validation to ensure that parameters are of the expected types. Invalid inputs result in descriptive error messages.

### **4. Reusable Logic**
Custom functions are implemented in JavaScript and exported for use in Corticon.js decision services. This allows for consistent and reusable logic across multiple projects.

## How to Use These Examples

1. **Import the Rule Projects**:
   - Open Corticon.js Studio and import contents of one of this repository's subdirectories into a Rule Project.

2. **Run the Test Cases**:
   - Use the `.ert` files to validate the behavior of the rules and custom operators, following the instructions [here](https://docs.progress.com/bundle/corticon-js-integration/page/Customized-data-access-operators.html#:~:text=How%20to%20set%20a%20mock%20implementation%20for%20the%20Studio%20tester). 

3. **Customize the Operators**:
   - Modify the JavaScript files (e.g., `getSetData.js`, `FinanceCustomFunctions.js`) to implement additional logic or adapt the examples to your use case.

4. **Deploy the Decision Services**:
   - Package the decision services and deploy them to your target environment (e.g., browser, Node.js, serverless).

## Additional Notes

- The `BasicSampleGetSetOperators` example uses an in-memory `Map` object to store session data. For production use, consider using a persistent storage mechanism like local storage or a database.
- The `Finance` example includes helper functions for handling fractional years and validating input types. These functions can be extended to support additional use cases.

## Further Resources 
-  [Corticon.js documentation on using data access operators](https://docs.progress.com/bundle/corticon-js-integration/page/About-Corticon.js-integration.html).

- [Blog: Mastering Custom Corticon.js Operators: Flexibility Beyond Standard Implementations]((https://www.progress.com/blogs/mastering-custom-corticon-operators-flexibility-beyond-standard-implementations))