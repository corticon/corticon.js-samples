/*
This code is intended to be run in an AWS Lambda function.
It simulates a REST service providing:
1) Current electricity cost in $
2) Current solar panel cost per watt in $
 */

//TODO: refactor to have the entry point here be just a wrapper that extract US State, calls
// REST service function simulator and then write Results into existing payload
// idea is to decouple REST service fct from payload manipulation.

exports.handler = async (event) => {
    // Initialize the 2 items we are computing
    let panelPricePerWatt = 0;
    let costKiloWhatHour = 0;

    // Fetch house/building property object out of the payload.
    const property = event.Objects.find(obj => {
        return obj.__metadata["#type"] === "Property";
    });

    // For the sake of a simple demo, we hardcoded some numbers
    // these are real numbers as of August 2020.
    if (property.State === "MA") {
        panelPricePerWatt = 3.1;
        costKiloWhatHour = .2257;
    } else if (property.State === "CA") {
        panelPricePerWatt = 2.94;
        costKiloWhatHour = .1058;
    } else if (property.State === "NY") {
        panelPricePerWatt = 3.09;
        costKiloWhatHour = .1717;
    } else if (property.State) {
        panelPricePerWatt = 3;
        costKiloWhatHour = .1308;
    }

    // Find the constants computed on the state machine first step
    // We use the index to modify the values directly in the payload.
    const constantsIndex = event.Objects.findIndex(obj => {
        return obj.__metadata["#type"] === "Constants";
    });

    // If no index we create an object
    if (constantsIndex === -1) {
        // create constants object
        const constants = {
            "PricePerWatt": panelPricePerWatt,
            "Cost_kWhr": costKiloWhatHour,
            "__metadata": {
                "#type": "Constants",
                "#id": "Constants_id_1"
            }
        };
        event.Objects.push(constants);
    } else {
        event.Objects[constantsIndex]["PricePerWatt"] = panelPricePerWatt;
        event.Objects[constantsIndex]["Cost_kWhr"] = costKiloWhatHour;
    }
    
    return event;
};
