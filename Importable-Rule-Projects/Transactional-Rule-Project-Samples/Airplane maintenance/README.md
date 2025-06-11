# Airline Maintenance Scheduling System

## Business Purpose
This decision service automates the complex process of scheduling required maintenance for a fleet of aircraft. By analyzing key operational data for each plane—such as its age, total flight hours, and number of flight cycles (takeoffs and landings)—the service determines precisely which maintenance tasks are due according to regulatory and operational schedules. The goal is to ensure safety and compliance while optimizing aircraft availability and minimizing downtime.

## Ruleflow Process

The service evaluates each aircraft by executing a sequence of rulesheets, each responsible for a specific aspect of the maintenance schedule.

1.  **Calculate Aircraft Usage**: This initial step processes the raw flight log for an aircraft to calculate key cumulative metrics. It sums the duration of all flights to get `totalHours`, counts the number of flights to get `totalCycles`, and calculates the `ageInDays` since the aircraft's purchase. These metrics are the primary drivers for all subsequent maintenance checks.

2.  **"C-Check" Scheduling**: The service checks if a major "C-Check" is required. The rules for this heavy maintenance check are specific to each aircraft's `tailNumber`, with different flight hour thresholds triggering the event for different planes.

3.  **Major Component Checks**: A series of rulesheets evaluate the need for maintenance on critical, high-cost components. These tasks are often triggered by multiple conditions:
    * **Landing Gear**: A replacement is scheduled if the aircraft exceeds 20,000 flight cycles OR has been in service for more than 10 years (3,650 days).
    * **Engine**: An overhaul is scheduled if the aircraft exceeds 15,000 flight cycles OR 20,000 flight hours.
    * **Auxiliary Power Unit (APU)**: A replacement is scheduled if the aircraft exceeds 10,000 flight hours.

4.  **Minor Component and Opportunistic Maintenance**: The final rulesheet handles more routine tasks. For example, it schedules a headlamp change every 1,000 flight hours. This step also includes sophisticated "opportunistic" rules that trigger the headlamp change if the aircraft is already near its 1,000-hour interval (e.g., within 50 hours) or its annual check (e.g., within 10 days), ensuring the task is bundled with other maintenance to improve efficiency.

## Notable Rule Aspects

This project demonstrates several powerful techniques for building a complex scheduling and maintenance system.

* **Multiple Triggering Conditions**: The rules showcase the ability to schedule maintenance based on different operational metrics. Events can be triggered by usage (flight hours, flight cycles) or by time (age in days), and a single maintenance task can be triggered by an "OR" combination of these conditions.
* **Asset-Specific Logic**: By using the aircraft's unique `tailNumber` as a condition, the rules can support different maintenance schedules for different individual aircraft, even within the same fleet. This allows for a high degree of customization.
* **Opportunistic Scheduling**: The "Check Headlamp" logic is a prime example of building advanced, real-world scheduling rules. By checking if a routine task is "almost due" when other maintenance is occurring, the system can intelligently bundle tasks to reduce the number of times an aircraft is taken out of service, thus optimizing fleet availability.
* **Data Transformation and Aggregation**: The initial `Calculate_Aircraft_Usage` step is a critical feature. It demonstrates how a rules engine can effectively process a collection of transactional records (individual `flights`) and aggregate them into the key performance indicators (`totalHours`, `totalCycles`) that drive the core business decisions.