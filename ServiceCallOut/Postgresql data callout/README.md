# Corticon.js PostgreSQL Data Callout Example

This project demonstrates how to use a Corticon.js Service Callout to retrieve data from a PostgreSQL database. It includes a Node.js backend service, a PostgreSQL database setup script, and a Corticon.js rule project.

## Repository Structure

The repository has the following folder structure:

* `ServiceCallOut\Postgresql data callout\backend-service.js`:  The Node.js backend service that connects to the PostgreSQL database and provides an API to retrieve driver duty status.
* `ServiceCallOut\Postgresql data callout\CreateTable.sql`:  SQL script to create the 'fleet' database and the 'Driver' table with initial data.
* `ServiceCallOut\Postgresql data callout\Postgres SCO Rules`:  Corticon.js rule project.
    * `ServiceCallOut\Postgresql data callout\Postgres SCO Rules\vocab.ecore`:  Corticon.js vocabulary file.
    * `ServiceCallOut\Postgresql data callout\Postgres SCO Rules\PostgreSQLServiceCallout.js`:  Corticon.js Service Callout implementation.
    * `ServiceCallOut\Postgresql data callout\Postgres SCO Rules\PostgreSQL callout.erf`:  Corticon.js ruleflow file.
    * `ServiceCallOut\Postgresql data callout\Postgres SCO Rules\test.ert`:  Corticon.js rule test file.
    * `ServiceCallOut\Postgresql data callout\Postgres SCO Rules\.project`:  Corticon.js project file.
* `ServiceCallOut\Postgresql data callout\PostgreSQL callout\browser\decisionServiceBundle.js`:  Generated Corticon.js decision service bundle for browser execution.

## Prerequisites

* PostgreSQL database server
* Node.js and npm
* Corticon.js Studio

## Setup Instructions

1.  **PostgreSQL Database Setup:**

    * Execute the SQL script `ServiceCallOut\Postgresql data callout\CreateTable.sql` using a PostgreSQL client (e.g., `psql` or pgAdmin). This will:
        * Create the 'fleet' database.
        * Create the 'Driver' table in the 'public' schema.
        * Insert initial driver data into the 'Driver' table.

2.  **Node.js Backend Service Setup:**

    * Navigate to the `ServiceCallOut\Postgresql data callout` directory in your terminal.
    * Install the required Node.js packages:

        ```bash
        npm install express pg
        ```

    * Set the following environment variables to configure the database connection:

        ```bash
        export DB_USER=your_postgres_user
        export DB_HOST=your_postgres_host
        export DB_NAME=fleet
        export DB_PASSWORD=your_postgres_password
        export DB_PORT=your_postgres_port (default: 5432)
        ```

        Replace the placeholder values with your actual PostgreSQL credentials.
    * Run the backend service:

        ```bash
        node backend-service.js
        ```

        The service will start and listen for requests (default port: 3000).

3.  **Corticon.js Studio Setup:**

    * Import the rule project `ServiceCallOut\Postgresql data callout\Postgres SCO Rules` into Corticon.js Studio.
    * Review the ruleflow (`PostgreSQL callout.erf`), rules, and vocabulary (`vocab.ecore`) to understand how the service callout is used.
    * Open the service callout file (`PostgreSQLServiceCallout.js`) and ensure that the `BACKEND_SERVICE_URL` variable is correctly set to the URL of your running Node.js backend service. You can either set it directly in the file or use an environment variable:

        ```javascript
        const BACKEND_SERVICE_URL = process.env.BACKEND_SERVICE_URL || 'http://localhost:3000';
        ```

4.  **Corticon.js Studio Testing:**

    * Execute the rule test (`test.ert`) in Corticon.js Studio. The test provides an input payload:

        ```json
        [{"licenseNo": "226521813"}]
        ```

    * Verify that the test runs successfully and that the `dutyStatus` attribute of the `Driver` entity is correctly updated with the data retrieved from the PostgreSQL database.

5.  **Browser Execution:**

    * Generate the decision service bundle for browser execution. The generated bundle is located at: `ServiceCallOut\Postgresql data callout\PostgreSQL callout\browser\decisionServiceBundle.js`
    * Create an HTML file to load and execute the decision service. You will need to provide the same input payload as in the Corticon Studio test.
    * Ensure that the browser has network access to the Node.js backend service. If they are on different origins, configure CORS in the backend service.
    * Execute the decision service in the browser and verify that the `dutyStatus` is retrieved and processed correctly.

## Notes

* **Error Handling:** Implement robust error handling in your Corticon.js rules and the backend service to handle potential issues such as database connection errors, network failures, and invalid data.
* **Security:** In a production environment, secure your backend service with appropriate authentication and authorization mechanisms. Protect your database credentials and avoid exposing them directly in the code.
* **CORS:** Configure CORS in the backend service if your Corticon.js application and the backend service are served from different origins.