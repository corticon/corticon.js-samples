// Define the service callout metadata
const getWeather = {
    func: 'getWeatherFct', // Function name for the service callout
    type: 'ServiceCallout', // Type of extension
    description: {'en_US': 'This function retrieves current weather data from Open-Meteo API based on latitude and longitude.'}, // Description for the service callout
    extensionType: 'SERVICE_CALLOUT', // Extension type is Service Callout
    name: {'en_US': 'getWeather'} // User-friendly name for the service callout in Corticon
};

let logger; // Declare logger outside the function

/**
 * Service Callout function to fetch weather data from Open-Meteo API.
 * It expects 'Location' entities in the Corticon payload with 'latitude' and 'longitude' attributes.
 * It updates the 'current_temp' attribute of each 'Location' entity with the temperature from the API.
 *
 * @param {CorticonDataManager} corticonDataManager - The Corticon Data Manager object, providing access to entities, operators, and logger.
 */
async function getWeatherFct(corticonDataManager) {
    logger = corticonDataManager.getLogger();
    logger.logDebug('Entering getWeatherFct Service Callout');

    try {
        const locationEntities = corticonDataManager.getEntitiesByType('Location');

        for (const locationEntity of locationEntities) {
            // **CONVERT TO NUMBERS USING parseFloat()**
            const latitude = parseFloat(locationEntity['latitude']);
            const longitude = parseFloat(locationEntity['longitude']);

            logger.logDebug(`Latitude (after parseFloat): ${latitude}, type: ${typeof latitude}`); // **Log types after conversion**
            logger.logDebug(`Longitude (after parseFloat): ${longitude}, type: ${typeof longitude}`); // **Log types after conversion**


            if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) { // **Added isNaN checks**
                logger.logDebug(`Processing location: Latitude: ${latitude}, Longitude: ${longitude}`);

                // Construct the Open-Meteo API URL
                const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=fahrenheit`;
                logger.logDebug(`API URL being called: ${apiUrl}`); // **Log the constructed API URL**

                try {
                    const response = await fetch(apiUrl);

                    if (!response.ok) {
                        const errorText = await response.text(); // Get error text from response
                        logger.logError(`HTTP error! status: ${response.status}, text: ${response.statusText}, body: ${errorText}`);
                        throw new Error(`HTTP error! status: ${response.status}, text: ${response.statusText}, body: ${errorText}`);
                    }

                    const weatherData = await response.json();
                    logger.logDebug(`Received weather data: ${JSON.stringify(weatherData, null, 2)}`); // **Log the entire weatherData object (pretty printed)**

                    // **REVISED LINE: No more optional chaining**
                    let currentTemperature = null;
                    if (weatherData.current && weatherData.current.temperature_2m !== undefined) {
                        currentTemperature = weatherData.current.temperature_2m;
                    }

                    logger.logDebug(`Extracted currentTemperature (before conversion): ${currentTemperature}`); // **Log temperature before conversion**

                    if (typeof currentTemperature === 'number') {
                        logger.logDebug(`Current temperature (number): ${currentTemperature}°F`);
                        const corticonDecimalTemp = corticonDataManager.getOperator().decimal.constructDecimal(currentTemperature);
                        logger.logDebug(`Corticon decimal temperature: ${corticonDecimalTemp}`); // **Log after decimal conversion**
                        locationEntity['current_temp'] = corticonDecimalTemp;
                        logger.logDebug(`Updated Location entity with current_temp: ${corticonDecimalTemp}`);
                    } else {
                        logger.logError('Temperature data not found or is not a number in Open-Meteo API response.');
                        locationEntity['current_temp'] = null;
                    }

                } catch (fetchError) {
                    logger.logError(`Error fetching weather data from Open-Meteo API: ${fetchError}`);
                    locationEntity['current_temp'] = null;
                }
            } else {
                logger.logDebug(`Invalid latitude or longitude values for Location entity. Latitude: ${latitude}, Longitude: ${longitude}. Skipping weather data fetch.`);
                locationEntity['current_temp'] = null;
            }
        }

    } catch (error) {
        logger.logError(`Error in getWeatherFct Service Callout: ${error}`);
    } finally {
        logger.logDebug('Exiting getWeatherFct Service Callout');
    }
}

// Export the service callout metadata and the function
module.exports = {
    getWeather,
    getWeatherFct
};