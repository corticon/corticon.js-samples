# Service Callouts (SCO) in Corticon.js

This directory contains examples of **Service Callouts (SCO)**, a powerful feature in Corticon.js that allows you to extend the functionality of decision services by integrating external logic or data sources. These examples demonstrate how to use SCOs to perform tasks such as accessing external APIs, manipulating data, and integrating with third-party services.

## What Are Service Callouts?

Service Callouts enable Corticon.js decision services to interact with external systems or perform custom logic that goes beyond the built-in rule modeling capabilities. SCOs are written in JavaScript and can be used to:
- Fetch data from external APIs or databases.
- Perform asynchronous operations.
- Manipulate entities and attributes within decision services.
- Extend decision services with custom logic.

## Directory Structure

### **AccessConfigurationProperties**
- Demonstrates how to access configuration properties defined in the decision service.
- Example: Retrieve and log configuration properties, then update entity attributes with the configuration values.

### **BasicAsyncOperation**
- Shows how to perform asynchronous operations using the `async/await` pattern.
- Example: Fetch data asynchronously and update entity attributes with the retrieved data.

### **BasicAsyncOperationWithPromiseThen**
- Illustrates the use of promises with `.then()` for asynchronous operations.
- **Note**: This pattern is not recommended for Corticon.js. Use the `async/await` pattern instead.

### **BrowserSpecific**
- Contains browser-specific examples, such as storing and retrieving data from `localStorage`.
- Example: Save the last-used timestamp of a decision service in the browser's `localStorage`.

### **CallToSeparateLibrary**
- Demonstrates how to call functions from an external JavaScript library within a service callout.

### **CreateAssociation**
- Shows how to create associations between entities within a decision service.
- Example: Link products to providers based on specific attributes.

### **CreateAssociationAsync**
- Extends the `CreateAssociation` example by performing the association creation asynchronously.

### **GraphQL**
- Examples for integrating with GraphQL APIs.
- Includes CRUD operations and fetching data from GraphQL endpoints.

### **HelloWorld**
- A simple "Hello World" example to get started with service callouts.

### **I18N Browser Dynamic Form**
- Demonstrates localization (internationalization) in dynamic forms using service callouts.

### **MarkLogic**
- Shows how to integrate with MarkLogic, a NoSQL database, using service callouts.

### **MultipleSCO**
- Demonstrates the use of multiple service callouts within a single decision service.

### **RESTCall**
- Examples for making REST API calls from a service callout.
- Example: Fetch data from an external REST API and update entity attributes with the response.

### **UpdateEntityAttributes**
- Demonstrates how to update entity attributes using custom logic in a service callout.
- Example: Modify product attributes such as price, quantity, and expiration date.

### **Weather REST API for LatLong**
- Shows how to fetch weather data for a given latitude and longitude using a REST API.
- Example: Retrieve weather information and update entities with the results.

### **WriteEntitiesAsJSON**
- Demonstrates how to serialize entities into JSON format for external use.

## How to Use These Examples

1. Navigate to the folder corresponding to the example you want to explore.
2. Follow the instructions in the respective `README.txt` or source files to set up and run the example.
3. Review the code to understand how the service callout is implemented and integrated with Corticon.js.

## Notes and Best Practices

- **Asynchronous Operations**: Use the `async/await` pattern for asynchronous operations to ensure proper execution flow within decision services.
- **Error Handling**: Always include error handling in your service callouts to manage unexpected issues gracefully.
- **Browser-Specific Features**: Be cautious when using browser-specific features like `localStorage`, as they may not work in non-browser environments.

## Further Resources 

- [Corticon.js Service Callout documentation](https://docs.progress.com/bundle/corticon-js-extensions/page/About-Corticon.js-extensions-for-service-callouts.html). 
- [Blog: Business Rules with GraphQL](https://www.progress.com/blogs/business-rules-with-graphql)
- [Blog: Two Design Choices for Your MarkLogic Decision Services](https://www.progress.com/blogs/two-design-choices-for-your-marklogic-decision-services)
- [Blog: No-Code Business Logic Development for MarkLogic Database](https://www.progress.com/blogs/no-code-business-logic-development-for-marklogic-database)