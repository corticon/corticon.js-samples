# Service Callouts in Corticon.js

This directory contains examples of **Service Callouts** in Corticon.js. A Service Callout extends a Decision Service with custom JavaScript logic, allowing rules to interact with external systems or perform operations beyond built-in rule modeling.

Service Callouts are written in JavaScript and are commonly used to:

- Fetch data from external APIs or databases
- Perform asynchronous operations
- Create or modify entities and associations within a Decision Service
- Extend a Decision Service with custom logic

## Directory Structure

### [AccessConfigurationProperties](AccessConfigurationProperties/)
Access configuration properties defined in the Decision Service, then update entity attributes with those values.

### [AdvancedDataConnectorML](AdvancedDataConnectorML/)
A full read/write data connector for MarkLogic, bringing an Advanced Data Connector (ADC) pattern from Corticon for Java to Corticon.js.
- **Read:** Executes dynamic, parameterized SQL queries against MarkLogic TDE views. Query definitions are stored as JSON documents in MarkLogic and resolved at runtime, with placeholder substitution from the Decision Service payload.
- **Write:** Persists Corticon working-memory entities back to MarkLogic as JSON documents, supporting round-trip data flows within a single Decision Service invocation.

### [BasicAsyncOperation](BasicAsyncOperation/)
Perform asynchronous operations using the `async/await` pattern, then update entity attributes with the retrieved data.

### [BasicAsyncOperationWithPromiseThen](BasicAsyncOperationWithPromiseThen/)
Illustrates promises with `.then()` for asynchronous operations. The `async/await` pattern is recommended instead.

### [BrowserSpecific](BrowserSpecific/)
Browser-specific examples, such as storing and retrieving data from `localStorage`.

### [CallToSeparateLibrary](CallToSeparateLibrary/)
Call functions from an external JavaScript library within a Service Callout.

### [CreateAssociation](CreateAssociation/)
Create associations between entities within a Decision Service, such as linking products to providers based on attributes.

### [CreateAssociationAsync](CreateAssociationAsync/)
Extends CreateAssociation by performing the association creation asynchronously.

### [GraphQL](GraphQL/)
Integrate with GraphQL APIs, including CRUD operations and fetching data from GraphQL endpoints.

### [HelloWorld](HelloWorld/)
A minimal example for getting started with Service Callouts.

### [I18N Browser dynamic form](I18N%20Browser%20dynamic%20form/)
Localization and internationalization in dynamic forms using Service Callouts.

### [MarkLogic](MarkLogic/)
Integrate with the MarkLogic NoSQL database using Service Callouts.

### [MultipleSCO](MultipleSCO/)
Use multiple Service Callouts within a single Decision Service.

### [RandomStringGenerator](RandomStringGenerator/)
Generate a random string in a Service Callout and write it to a target string attribute chosen in the input payload.

### [RESTCall](RESTCall/)
Make REST API calls from a Service Callout and update entity attributes with the response.

### [UpdateEntityAttributes](UpdateEntityAttributes/)
Update entity attributes using custom logic, such as modifying product price, quantity, and expiration date.

### [Weather REST API for LatLong](Weather%20REST%20API%20for%20LatLong/)
Fetch weather data for a given latitude and longitude using a REST API and update entities with the results.

### [WriteEntitiesAsJSON](WriteEntitiesAsJSON/)
Serialize entities into JSON format for external use.

## How to Use These Examples

1. Open the folder for the example you want to explore.
2. Follow the instructions in that folder's README or source files to set up and run it.
3. Review the source to see how the Service Callout is implemented and integrated with Corticon.js.

## Notes and Best Practices

- **Asynchronous operations:** Use the `async/await` pattern to ensure proper execution flow within Decision Services.
- **Error handling:** Include error handling in every Service Callout to manage unexpected issues gracefully.
- **Browser-specific features:** Features such as `localStorage` will not work in non-browser environments.

## Further Resources

- [Corticon.js Service Callout documentation](https://docs.progress.com/bundle/corticon-js-extensions/page/About-Corticon.js-extensions-for-service-callouts.html)
- [Blog: Business Rules with GraphQL](https://www.progress.com/blogs/business-rules-with-graphql)
- [Blog: Two Design Choices for Your MarkLogic Decision Services](https://www.progress.com/blogs/two-design-choices-for-your-marklogic-decision-services)
- [Blog: No-Code Business Logic Development for MarkLogic Database](https://www.progress.com/blogs/no-code-business-logic-development-for-marklogic-database)
