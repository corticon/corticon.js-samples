# Greenhouse Gas (GHG) Protocol Emissions Calculator

## Business Purpose
This decision service is designed to calculate greenhouse gas (GHG) emissions from various sources based on the standards and factors provided by the Greenhouse Gas Protocol. It serves as a tool for organizations to quantify their emissions from both stationary sources (e.g., industrial boilers) and mobile sources (e.g., vehicles). The service takes fuel types, vehicle characteristics, and distances traveled as input and applies the appropriate emission factors to calculate CO2, CH4 (methane), and N2O (nitrous oxide) emissions.

## Ruleflow Process

The service calculates emissions by executing a series of rulesheets that progressively load and apply emission factors.

1.  **`Stationary CO2 Factors by Fuel`**: This is the first step, where the service loads CO2 emission factors for a wide range of stationary fuel types (e.g., Natural Gas, Crude Oil, various types of coal). For each fuel, it defines multiple factors, including Lower Heating Value, and emission factors based on energy (kg CO2/TJ), mass (kg CO2/tonne), and volume (kg CO2/litre).

2.  **`Mobile Combustion CO2- Fuel Use`**: This rulesheet loads CO2 emission factors for mobile combustion based on the type of fuel used (e.g., Motor Gasoline, Diesel Fuel, Kerosene). It contains region-specific factors (US, UK, and other) and differentiates between fossil-fuel and biogenic CO2 emissions.

3.  **`Mobile Combustion CH4 and N2O- Fuel Use`**: This step loads the emission factors for Methane (CH4) and Nitrous Oxide (N2O) from mobile sources. The rules are highly specific, depending on the region, fuel type, transport type (e.g., 'Ship and Boat', 'Aircraft'), and even the engine type (e.g., '2 Stroke', '4 Stroke').

4.  **`Average Fuel Economy per Vehicle Type`**: This rulesheet acts as a simple lookup table to establish the average fuel economy (in MPG and km/L) for different classes of vehicles, such as 'Passenger Cars' or 'Combination Trucks'.

5.  **`CH4 and N2O Emission Factors Vehicle Distance`**: This rulesheet loads CH4 and N2O emission factors based on distance traveled (g/mile or g/km). The rules are very granular, accounting for the vehicle's region, class, fuel type, and model year.

6.  **`Trip and Distance Emission Factors`**: The final step loads emission factors for public transportation, calculating CO2, CH4, and N2O per passenger-kilometer or passenger-mile. It includes factors for various modes of transport like air, rail, bus, and ferry, and often includes different factors for different passenger classes (e.g., Economy, Business, First Class).

## Notable Rule Aspects

This project effectively demonstrates how a business rules engine can manage and apply large, complex sets of scientific and regulatory data for calculation purposes.

* **Decision Tables for Emission Factors**: The core of this project is a series of large decision tables that map various inputs (fuel type, vehicle type, region, model year) to specific emission factors. This pattern is ideal for managing the extensive data provided by standards bodies like the GHG Protocol, as it allows for easy updates and verification of the factors without altering application logic.
* **Multi-Dimensional Conditions**: The rules often depend on multiple criteria to find the correct factor. For example, determining an N2O emission factor can require knowing the `region`, `transport_type`, and `vehicle_or_engine_type`, showcasing the ability to handle multi-dimensional data lookups.
* **Handling of Units**: The rules manage data with various units of measure (e.g., kg/US Gallon, g/mile, kg/TJ, kg/tonne). The vocabulary is structured to store the `value` and the `unit` separately, which is a best practice for maintaining clarity and enabling accurate calculations.
* **Regional Differentiation**: The rules clearly distinguish between different regional standards (e.g., US, UK, and a general 'other' category), allowing the service to apply the correct set of emission factors based on the location of the activity.
* **Granularity in Transportation**: The rules for mobile emissions are highly detailed, breaking down factors not only by vehicle type (car, truck, bus) but also by more specific classes (e.g., `Light Duty Trucks`, `Heavy Duty Vehicles`), fuel, and even model year ranges, reflecting the complexity of real-world emissions reporting.