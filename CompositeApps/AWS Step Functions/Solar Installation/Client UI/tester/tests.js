// Tests for Solar Step Function, requires corticon.js

const testConfig = {
  "enabled-test-ids": [
    "default-ma",
    "default-ca",
    "default-ny",
    "savings-low-bill",
    "savings-low-generation",
    "savings-low-bill-low-generation",
    "loan-commercial",
    "loan-high-value",
    "loan-low-value",
    "loan-low-age",
    "loan-med-age",
    "loan-high-age",
    "loan-low-value-low-age",
    "loan-low-value-med-age",
    "loan-low-value-high-age"
  ],
};

// Set text areas and links to tests
function initiateTester() {
  let testSidebarEntry = $('.tester-sidebar .entry');
  let testContainer = $('.test-container').first();

  config["execution-prefix"] = "SolarDemo_Tester_";

    testConfig["enabled-test-ids"].forEach(function(id) {
    let newContainer = testContainer.clone();
    newContainer.find('.test-title').text(id);
    newContainer.find('.test-description').text(descriptions[id]);
    newContainer.find('.input').text(JSON.stringify(payloads[id], null, 2)).attr("id", "input-" + id);
    newContainer.attr("id", id);

    let newSidebarEntry = testSidebarEntry.clone();
    newSidebarEntry.text(id);
    newSidebarEntry.attr("href", "#" + id);
    newSidebarEntry.attr("id", "link-" + id);

    newSidebarEntry.insertAfter($('.tester-sidebar .entry').last());
    newContainer.insertAfter($('.test-container').last());
  });

  testSidebarEntry.remove();
  testContainer.remove();
}

// Asserts an object of objType exists, and optionally that each instance has non-empty properties
// with names in propertyNames ["propName1", "propName2"]
function assertExists(res, errors, objType, propertyNames=undefined) {
  if (!res.Objects) {
    errors.push("Malformed Response. Expected to find Decision Service Object array.");
    return false;
  }

  let passes = true;
	let matches = res.Objects.filter(function(object) { return object.__metadata["#type"] === objType });
  if (!matches) {
    errors.push("Expected to find an Object of type [" + objType + "]");
    return false;
  }

  matches.forEach(function(match, i) {
    // array of properties, ex: ["string", undefined, ""]
    let props = propertyNames.map(function(propertyName) {
      if (match[propertyName === undefined || match[propertyName] === "" || match[propertyName === null]]) {
        errors.push("Expected non-empty \"" + propertyName + "\" on Object of type [" + objType + "]")
        passes = false;
      } 
      return match[propertyName]; 
    });
  });

  return passes;
}

// add further validation to specific test ids
function testResponseHandler(res, inputObj) {
  let errors = [];

  switch($(inputObj).id) {
    case "test-1":
      break;
    case "test-2":
      break;
    case "test-3":
      break;
    default:
      //
  }
  
  assertExists(res, errors, "Property", [
      "EstimatedMonthlyGenerated_kWhr",
      "MonthlyElectricBill",
      "Orientation",
      "Shade",
      "Type",
      "State",
      "Value",
      "EstimatedInstallationCost",
      "Age",
      "MonthlyElectricConsumption"
  ]);

  assertExists(res, errors, "Constants", [
      "DefaultInstallationSize",
      "DefaultRequiredRoofSpace",
      "PanelPricePerWatt",
      "Cost_kWhr"
  ]);

  assertExists(res, errors, "Rebate", [
      "Flat",
      "Percent"
  ]);

  assertExists(res, errors, "Savings", [
      "Resell_kWhr",
      "MonthlyElectricBill",
      "NetSavings_20"
  ]);

  assertExists(res, errors, "Quote", [
      "Value"
  ]);

  assertExists(res, errors, "LoanOption", [
      "DurationMonths",
      "DownPaymentPercent",
      "Interest",
      "Tier",
      "AmortizedMonthlyPayment",
      "Qualified"
  ]);

  $(inputObj).siblings('.output').text(JSON.stringify(res, null, 2));
  outputErrors(errors, inputObj);
}

function runAllTests() {
	$(".test-container .input").each(function(index, input) {
		runTest($(input).text(), input);
	});

  // // reset all status indicators
  // $('.success, .error').removeClass('success error');

  // // add an interval to calls to prevent ajax errors from running 20 requests a second
  // let i = 0;
  // let inputs = $(".test-container .input");
  // let id = setInterval(function() {
  //   if (i >= inputs.length) {
  //     clearInterval(id);
  //   }
  //   let input =  $(inputs)[i];
  //   runTest($(input).text(), input);
  //   i++;
  // }, 5000)
}
function runClickHandler() {
  let inputObj = $(this).parents('.test-container').find('.input')
  runTest($(inputObj).text(), inputObj);
}
function runTest(jsonInput, inputObj) {
  let id = $(inputObj).parents('.test-container').attr('id');
  $('#link' + id).removeClass('success error');
  $('#' + id).removeClass('sucess error');

  callStepFunction(JSON.parse(jsonInput),
    function(res) {
      testResponseHandler(res, inputObj);
    }
  );
}

function outputErrors(errors, inputObj) {
  let id = $(inputObj).parents('.test-container').attr("id");
  if (errors.length) {
    console.log(errors);
    $(inputObj).parents('.test-container').addClass('error');
    $('#link-' + id).addClass('error');
  } else {
    $(inputObj).parents('.test-container').addClass('success');
    $('#link-' + id).addClass('success');
  }
  
}

$(document).ready(function() {
  initiateTester();
  //runAllTests();
  $('.run').click(runClickHandler);
  $('#run-all').click(runAllTests);
});

// Test Payloads
const payloads = {}
const descriptions = {}

descriptions["default-ma"] = "Verify default payload response has all expected objects and properties"
payloads["default-ma"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["default-ca"] = "Verify default payload response has all expected objects and properties"
payloads["default-ca"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "CA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["default-ny"] = "Verify default payload response has all expected objects and properties"
payloads["default-ny"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "NY",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["savings-low-bill"] = "Verify default payload response has all expected objects and properties"
payloads["savings-low-bill"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "50",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["savings-low-generation"] = "Verify default payload response has all expected objects and properties"
payloads["savings-low-generation"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "NE",
      "Shade": "0.8",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["savings-low-bill-low-generation"] = "Verify default payload response has all expected objects and properties"
payloads["savings-low-bill-low-generation"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "20",
      "City": "The Future",
      "Orientation": "NW",
      "Shade": "0.7",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-high-value"] = "Verify default payload response has all expected objects and properties"
payloads["loan-high-value"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "2000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-low-value"] = "Verify default payload response has all expected objects and properties"
payloads["loan-low-value"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "200000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-low-age"] = "Verify default payload response has all expected objects and properties"
payloads["loan-low-age"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 2,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-med-age"] = "Verify default payload response has all expected objects and properties"
payloads["loan-med-age"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 8,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-high-age"] = "Verify default payload response has all expected objects and properties"
payloads["loan-high-age"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 20,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-low-value-low-age"] = "Verify default payload response has all expected objects and properties"
payloads["loan-low-value-low-age"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "100000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 2,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-low-value-med-age"] = "Verify default payload response has all expected objects and properties"
payloads["loan-low-value-med-age"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "100000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 8,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-low-value-high-age"] = "Verify default payload response has all expected objects and properties"
payloads["loan-low-value-high-age"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Residential",
      "State": "MA",
      "RoofSize": "100",
      "Value": "100000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 20,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}

descriptions["loan-commercial"] = "Verify default payload response has all expected objects and properties"
payloads["loan-commercial"] = {
  "additional-data": {
    "requireLoan": true
  },
  "__metadataRoot": {},
  "Objects": [
    {
      "Address": "10 Sunny Lane",
      "EstimatedMonthlyGenerated_kWhr": null,
      "MonthlyElectricBill": "200",
      "City": "The Future",
      "Orientation": "S",
      "Shade": "1",
      "Type": "Commercial",
      "State": "MA",
      "RoofSize": "100",
      "Value": "1000000",
      "Country": "US",
      "__metadata": {
        "#type": "Property",
        "#id": "Property_id_1"
      },
      "EstimatedInstallationCost": null,
      "Age": 5,
      "MonthlyElectricConsumption": null
    },
    {
      "__metadata": {
        "#type": "Constants",
        "#id": "Constants_id_1"
      }
    }
  ]
}