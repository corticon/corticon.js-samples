# HR Employee Data Analysis Service

## Business Purpose
This decision service is designed for an HR department to perform complex analysis and reporting on a collection of employee data. Given a dataset of employees, the service can efficiently answer key analytical questions, including:

* What is the total number of employees?
* What are the total and average number of children across the company?
* What are the average, maximum, and minimum employee salaries?
* How many employees are single?
* In what unique states do the employees have residences?
* How many employees are in the top 20% of earners, and who are they?
* Who are the employees living in specific zip codes?

The service processes this information and returns a structured set of answers and human-readable summaries.

## Ruleflow Process

The service executes a sequence of rulesheets to process the employee data and generate the required analytics.

1.  **`init`**: Sets a default value for the percentile query (e.g., 80th percentile for identifying the top 20% of earners).
2.  **`Classifications`**: This is the primary data processing step where most aggregate calculations are performed. It uses Corticon's collection operators to determine total employee counts, sum and average of children, salary statistics (min, max, avg), and the count of single employees. It also uniquely identifies all states and zip codes from the employee location data and calculates the salary threshold for the top percentile.
3.  **`zips`**: This rulesheet iterates through the unique zip codes identified in the previous step. It associates employees with their corresponding zip code and counts the number of employees in each. It also flags employees whose salary exceeds the calculated percentile threshold.
4.  **`employees by zip`**: This rulesheet constructs a human-readable summary string for each zip code, listing the names of the employees who reside there.
5.  **`states`**: This rulesheet constructs a single, comma-separated string that lists all of the unique states where employees live.
6.  **`summaries`**: This step aggregates the individual summary strings generated in the `employees by zip` rulesheet into a final, comprehensive report.
7.  **`Restore structure` / `Restore structure2`**: These final rulesheets perform a cleanup task, removing the temporary `States` and `Zipcodes` data entities that were created for intermediate calculations. This ensures the final output payload is clean and only contains the requested results.

## Notable Rule Aspects

This project demonstrates several powerful Corticon features for data analysis and manipulation:

* **Powerful Collection Operators**: The rules make extensive use of Corticon's collection operators (`->size`, `->sum`, `->avg`, `->max`, `->min`, `->newUnique`, `->sortedBy`) to perform complex aggregations and calculations across the entire set of employees in a single, efficient rulesheet.
* **Dynamic Segmentation**: The service dynamically calculates a salary value based on a given percentile and then uses that value to filter the employee collection. This allows for flexible analysis, such as identifying employees in the top 20% of earners, without hard-coding salary thresholds.
* **In-Memory Data Transformation**: The ruleflow creates new, temporary data entities (`States`, `Zipcodes`) to store intermediate calculations. These temporary entities are then used to group, filter, and summarize data in subsequent steps before being removed from the final payload, showcasing a powerful pattern for complex data analysis.
* **Conditional String Aggregation**: The `states` and `employees by zip` rulesheets use a series of simple, sequential rules to build comma-separated lists. By having a separate rule for each possible count of items in the collection, the rules can correctly format lists without needing complex looping logic, making the rules easy for business users to understand and modify.