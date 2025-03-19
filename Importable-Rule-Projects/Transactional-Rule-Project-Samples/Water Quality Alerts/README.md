**Automated Red Tide Monitoring Using AWS Lambda and Corticon.js**

Red tides, or harmful algal blooms (HABs), are an oceanic phenomenon characterized by an unnaturally high concentration of algae, including blue-green algae (cyanobacteria), in the water. While numerous species of algae can accumulate at levels sufficient to cause a red tide, the most common culprit in the Gulf of Mexico is _Karenia brevis_ (_K. brevis_).

A bloom can develop when algae drifts into a region and steadily accumulates due to optimal water conditions. Once the population grows to sufficient concentrations, the threats to marine life mount and compound on each other. Algae like _K. brevis_ produce neurotoxins that are toxic to exposed marine life or animals that consume exposed organisms—including humans. When the toxins become airborne from wind and waves, they can also lead to respiratory irritation in humans.

The toxins are not always the main threat to fish from algal blooms, however.

Although plants output oxygen via photosynthesis, they also must consume oxygen to survive. This isn’t usually a problem because the oxygen is created from photosynthesis at far faster rates than plants consume it. When the sun goes down, though, photosynthesis stops, and the injection of new oxygen into the ecosystem ceases, while plants’ consumption of oxygen continues. During an algal bloom, the large population of plant life can drain oxygen from the water overnight, killing massive numbers of fish through suffocation. Even when the algal bloom starts to dissipate, the natural breakdown of dead algae material by bacteria depletes additional oxygen from the water.

Given the multiple pathways through which red tides can cause harm to unsuspecting swimmers, boaters, anglers and others, it’s critical to monitor the water for trends toward the conditions suitable for algal blooms.

**Monitoring and Alerting for Red Tide Conditions**

Using sensor data from sources like buoys and docks, we can set up scheduled data queries for water conditions and trigger red tide risk alerts using business rules.

The complete set of rule assets and lambda functions can he access from the [Corticon GitHub Repository](https://github.com/corticon/corticon.js-samples/tree/master/Importable-Rule-Projects/Transactional-Rule-Project-Samples/Water%20Quality%20Alerts).

In this project, we will leverage AWS Lambda functions to access data from a [monitoring station](https://sensors.ioos.us/#metadata/134984/station/data) maintained by Florida Gulf Coast University’s Water School at Sanibel Island in Florida. The station provides measurements every 10 minutes of the following conditions:

- pH
- Phycoerythrin (Blue Green Algae)
- Specific Conductance
- Turbidity
- Water Temperature
- Salinity
- Chlorophyll
- Conductivity

**AWS Lambda Configuration**

For this project, we have two Lambda functions.

**Data Retrieval Function:**

The first is a Python function that retrieves water quality data from the ERDDAP server, transforms it into a usable format, and then sends it to a Corticon decision service (also implemented as a Lambda function) for analysis and reporting. It is comprised of the following components:

1. **Trigger:** An event (e.g., a scheduled event in CloudWatch) triggers the Lambda function.
2. **Data Retrieval:** The Lambda function retrieves water quality data from the ERDDAP server for the past 7 days.
3. **Data Transformation:** The Lambda function transforms the ERDDAP data into a list of dictionaries.
4. **Corticon Invocation:** The Lambda function invokes the Corticon Lambda function, passing the transformed data as a JSON array.
5. **Rule Execution:** The Corticon Lambda function executes a set of rules against the water quality data.
6. **Report Generation:** The Corticon Lambda function returns a JSON response indicating which rules were triggered (if any).
7. **Report Formatting:** The Lambda function formats the Corticon response into a human-readable report.
8. **Response:** The Lambda function returns a success response with the formatted water quality report.
9. **Monitoring and Alerting:** This setup enables automated monitoring and alerting for Tampa Bay water quality, providing timely information for decision-making.

**Rules configured in Corticon Decision Service Lambda:**

- **Chlorophyll:** Chlorophyll is the pigment responsible for light absorption in photosynthesis. Chlorophyll-a is the predominant type of chlorophyll used by algae and is generally highly correlated to harmful algae concentrations.
  - Rule 1: If the chlorophyll concentration is between 10 and 50 micrograms per liter (µg/L), trigger an alert indicating a potentially high chlorophyll level, suggesting a possible algal bloom. This triggers actions such as notifying water quality managers.
  - Rule 2: If the chlorophyll concentration is 50 µg/L or higher, trigger an alert indicating a very high chlorophyll level, suggesting a harmful algal bloom. This may trigger more severe actions like public health advisories.
  - Rule 3: If the chlorophyll concentration is below 0.1 µg/L, trigger an alert indicating low chlorophyll, suggesting nutrient depletion.
- **Dissolved Oxygen:** Because algae consume oxygen but only replenish it when photosynthesizing from sunlight, excessive concentrations of algae can deplete oxygen from the water.
  - Rule 1: If the most recent dissolved oxygen concentration is below 2 milligrams per liter (mg/L), trigger an alert indicating hypoxia (low dissolved oxygen).
  - Rule 2: If the most recent fractional saturation of oxygen is below 30%, trigger an alert indicating hypoxia.
  - Rule 3: If the latest oxygen concentration is more than 2 mg/L lower than the previous oxygen concentration, trigger an alert indicating a rapid oxygen depletion event.
- **Practical Salinity:** In Florida waters, _K. brevis_ thrives in high-salinity areas.
  - Rule 1: If the salinity is below 25 parts per thousand, trigger an alert indicating a significant influx of freshwater (a salinity anomaly).
  - Rule 2: If the salinity is above 40 parts per thousand, trigger an alert indicating excessive evaporation or drought conditions (high salinity).
- **pH:** Algae thrive in environments with elevated pH levels, so high pH levels can encourage excessive algae proliferation.
  - Rule 1: If the pH is below 7.7, trigger an alert indicating ocean acidification (low pH).
  - Rule 2: If the pH is above 8.3, trigger an alert indicating high pH (alkalinity).
- **Turbidity:** Turbidity is the measure of the cloudiness in water caused by suspended particles. It is measured in Nephelometric Turbidity Units (NTUs).
  - Rule 1: If the turbidity is higher than 50 NTUs, trigger an alert indicating high turbidity, potentially due to sediment runoff.
- **Fluorescent Dissolved Organic Matter (FDOM):** FDOM appears in higher concentrations during red tides. It is measured based on the fluorescence of a given volume of water sampled, measured in quinine sulfate units (QSU).
  - Rule 1: If Fluorescent Dissolved Organic Matter is higher than 25 QSU, trigger an alert indicating potential pollution from sewage or agricultural runoff.
- **Phycoerythrin:** Phycoerythrin is a red pigment found in cyanobacteria that can contribute to the reddish color of seawater during red tide events. Cyanobacteria are the only phytoplankton that contain phycoerythrin, making it a good indicator of the amount of cyanobacteria in a body of water.
  - Rule 1: If phycoerythrin >= 4 µg/L and mass_concentration_of_chlorophyll_in_sea_water >= 5 µg/L, generate an initial alert to increase testing.
  - Rule 2: If phycoerythrin >= 8 µg/L and mass_concentration_of_chlorophyll_in_sea_water >= 10 µg/L and sea_water_temperature BETWEEN 18 AND 30 degrees Celsius, trigger a Red Tide Bloom Investigation (Moderate Suspicion).

This serverless water quality monitoring system exemplifies the power and efficiency of combining modern technologies like AWS Lambda and a rules engine like Corticon. By decoupling data retrieval from the decision-making process, we achieve a highly scalable, cost-effective, and easily maintainable solution.

The use of a rules engine empowers business users to define and adapt alert thresholds and logic without requiring code changes, enabling rapid responses to evolving environmental conditions. For large enterprises evaluating serverless architectures, this approach demonstrates the potential to build robust, event-driven systems that optimize resource utilization, minimize operational overhead, and provide actionable insights from real-time data streams, unlocking significant advantages in agility and cost savings compared to traditional monolithic applications.

Furthermore, this architecture's modularity facilitates seamless integration with other enterprise systems, paving the way for a more comprehensive and responsive approach to environmental management and other data-intensive domains.