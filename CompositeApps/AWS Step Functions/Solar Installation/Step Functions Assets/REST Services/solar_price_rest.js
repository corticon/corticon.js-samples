exports.handler = async (event) => {
    let pricePerWatt = 0;
    let cost_kWhr = 0;
    let property = event.Objects.find(obj => {
        return obj.__metadata["#type"] == "Property";
    });
    
    if (property.State == "MA") {
        pricePerWatt = 3.1;
        cost_kWhr = .2257;
    } else if (property.State == "CA") {
        pricePerWatt = 2.94;
        cost_kWhr = .1058;
    } else if (property.State == "NY") {
        pricePerWatt = 3.09;
        cost_kWhr = .1717;
    } else if (property.State) {
        pricePerWatt = 3;
        cost_kWhr = .1308;
    }
    
    let constants_index = event.Objects.findIndex(obj => {
        return obj.__metadata["#type"] == "Constants";
    });
    
    if (constants_index == -1) {
        // create constants object
        let constants = {
            "PricePerWatt": pricePerWatt,
            "Cost_kWhr": cost_kWhr,
            "__metadata": {
                "#type": "Constants",
                "#id": "Constants_id_1"
            }
        }
        event.Objects.push(constants);
    } else {
        event.Objects[constants_index]["PricePerWatt"] = pricePerWatt;
        event.Objects[constants_index]["Cost_kWhr"] = cost_kWhr;
    }
    
    return event;
};
