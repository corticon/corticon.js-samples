// Main js file for Solar Application.  All the JS code is kept in a single file for simplicity.
// It is dependent on jQuery.

const config = {
  // Prefixes Execution Name inside AWS
  "execution-prefix": "JQuery_Solar_",

  // ARN found on State Machine page
  "state-machine-arn": "arn:aws:states:us-east-2:825395728724:stateMachine:DX_JavaScript_Solar",

  // API Gateway to StepFunction Endpoints, unlikely you should need to touch these
  "api-gateway-execution": "https://ezruukcqbk.execute-api.us-east-2.amazonaws.com/Development/execution",
  "api-gateway-describe-execution": "https://ezruukcqbk.execute-api.us-east-2.amazonaws.com/Development/describe-execution",

  // UI step delay to simulate step functions taking 1-2s per step
  "enable-step-delay": true,

  // 500ms delay range
  "enable-randomize-delay": true,

  // UI step delay in ms
  "step-delay": 1500,
};

function validateForm() {
  const fieldIds = ['#property-address',
    '#property-city',
    '#property-state',
    '#property-roof-size',
    '#property-shade',
    '#property-orientation',
    '#monthly-electric-bill',
    '#property-type',
    '#property-value',
    '#property-age'];

  // check all fields non empty
  let valid = true;
  for (let i = 0; i < fieldIds.length; i++) {
    if (!$(fieldIds[i]).val()) {
      console.log(fieldIds[i]);
      valid = false;
      break;
    }
  }

  if (valid) {
    $('#form-complete-msg').show();
    $('#form-incomplete-msg').hide();
  } else {
    $('#form-complete-msg').hide();
    $('#form-incomplete-msg').show();
  }

  if($('#require-loan').prop('checked')) {
    $('#loan-msg').show();
    $('#no-loan-msg').hide();
    $('#loan-options').show();
  } else {
    $('#loan-msg').hide();
    $('#no-loan-msg').show();
    $('#loan-options').hide();
  }

  return valid;
}

// create payload JSON from form data for consumption by Decision Services
function createStepFunctionInitialPayload() {
  return {
    "data": {
      "requireLoan": $('#require-loan').prop('checked')
    },
    "__metadataRoot": {},
    "Objects": [{
        "Address": $('#property-address').val(),
        "EstimatedMonthlyGenerated_kWhr": null,
        "MonthlyElectricBill": $('#monthly-electric-bill').val(),
        "City": $('#property-city').val(),
        "Orientation": $('#property-orientation').val(),
        "Shade": $('#property-shade').val(),
        "Type": $('#property-type').val(),
        "State": $('#property-state').val(),
        "RoofSize": $('#property-roof-size').val(),
        "Value": $('#property-value').val(),
        "Country": "US",
        "__metadata": {
            "#type": "Property",
            "#id": "Property_id_1"
        },
        "EstimatedInstallationCost": null,
        "Age": parseInt($("#property-age").val()),
        "MonthlyElectricConsumption": null
    },
    {
        "__metadata": {
            "#type": "Constants",
            "#id": "Constants_id_1"
        }
    }]
  };
}

// helper to find object from DS output
function findDSObject(json, type) {
  return json.Objects.find(function(object) { return object.__metadata["#type"] === type });
}

// result handler for step function output
function resultHandler(result) {
  /* Here is an example of what the returned data would be
  const example = {
    "__metadataRoot": {},
    "Objects": [
      {
        "Address": "That Street in",
        "EstimatedMonthlyGenerated_kWhr": "719.7885",
        "MonthlyElectricBill": "100",
        "City": "Boston",
        "Orientation": "SW",
        "Shade": "0.97",
        "Type": "Residential",
        "State": "MA",
        "RoofSize": "150",
        "Value": "400000",
        "Country": "US",
        "__metadata": {
          "#type": "Property",
          "#id": "Property_id_1"
        },
        "EstimatedInstallationCost": "15500",
        "Age": 11,
        "MonthlyElectricConsumption": null
      },
      {
        "__metadata": {
          "#type": "Constants",
          "#id": "Constants_id_1"
        },
        "DefaultInstallationSize": "5000",
        "DefaultRequiredRoofSpace": "33",
        "PanelPricePerWatt": "3.1",
        "Cost_kWhr": "0.2257"
      },
      {
        "__metadata": {
          "#type": "Rebate",
          "#id": "Rebate_id_1"
        },
        "Flat": "1000",
        "Percent": "0.31"
      },
      {
        "__metadata": {
          "#type": "Savings",
          "#id": "Savings_id_1"
        },
        "Resell_kWhr": "0.3057"
      },
      {
        "__metadata": {
          "#type": "Quote",
          "#id": "Quote_id_1"
        },
        "Value": "9695"
      }
    ],
    "status": "success",
    "awsRequestId": "062e26e2-b48f-4ce3-acd1-6c6d0b7c023f",
    "data": {
      "requireLoan": false
    }
  };
  */

  const property = findDSObject(result, 'Property');
  const constants = findDSObject(result, 'Constants');
  const rebate = findDSObject(result, 'Rebate');
  const quote = findDSObject(result, 'Quote');
  const savings = findDSObject(result, 'Savings');

  // Update Quote UI
  const estimateBreakdown = constants["DefaultInstallationSize"] + 'W * $' + parseFloat(constants["PanelPricePerWatt"]).toFixed(2) + ' ='
  $('#quote-estimate-breakdown').text(estimateBreakdown);
  $('#quote-percent-breakdown').text('$' + property["EstimatedInstallationCost"] + ' * ' + rebate["Percent"] + ' =');

  $('#quote-estimate').text('$' + property["EstimatedInstallationCost"]);
  $('#quote-percent-rebate').text('$' + (parseInt(property["EstimatedInstallationCost"]) * parseFloat(rebate["Percent"])).toFixed(2));
  $('#quote-flat-rebate').text('$' + rebate["Flat"]);

  $('#quote-final').text('$' + quote["Value"]);

  // Update Savings UI
  $('#savings-monthly-electric-bill').text('$' + parseFloat(savings["MonthlyElectricBill"]).toFixed(2));
  $('#savings-net-20').text('$' + parseFloat(savings["NetSavings_20"]).toFixed(2));

  // Update Loan UI
  let qualifiedLoanOptions = result.Objects.filter(function(object) {
    return object.__metadata["#type"] === 'LoanOption' && object["Qualified"]
  });
  /*
  An example of returned data
  {
      "DurationMonths": 24,
      "DownPaymentPercent": "0",
      "Interest": "4.5",
      "Tier": 3,
      "AmortizedMonthlyPayment": "423.1655329974577",
      "__metadata": {
        "#type": "LoanOption",
        "#id": "LoanOption_id_6"
      },
      "Qualified": false
    }
    */
  if (qualifiedLoanOptions.length > 0) {
    $('#loan-option-1 .loan-term').text(qualifiedLoanOptions[0]["DurationMonths"] + ' Months');
    $('#loan-option-1 .loan-down-payment').text('$' + (parseFloat(qualifiedLoanOptions[0]["DownPaymentPercent"]) / 100 * quote["Value"]) + 
      ' (' + qualifiedLoanOptions[0]["DownPaymentPercent"] + '%)');
    $('#loan-option-1 .loan-interest').text(qualifiedLoanOptions[0]["Interest"] + '%');
    $('#loan-option-1 .loan-monthly-payment').text('$' + parseFloat(qualifiedLoanOptions[0]["AmortizedMonthlyPayment"]).toFixed(2));
  }
  if (qualifiedLoanOptions.length > 1) {
    $('#loan-option-2 .loan-term').text(qualifiedLoanOptions[1]["DurationMonths"] + ' Months');
    $('#loan-option-2 .loan-down-payment').text('$' + (parseFloat(qualifiedLoanOptions[1]["DownPaymentPercent"]) / 100 * quote["Value"]) + 
      ' (' + qualifiedLoanOptions[1]["DownPaymentPercent"] + '%)');
    $('#loan-option-2 .loan-interest').text(qualifiedLoanOptions[1]["Interest"] + '%');
    $('#loan-option-2 .loan-monthly-payment').text('$' + parseFloat(qualifiedLoanOptions[1]["AmortizedMonthlyPayment"]).toFixed(2));
  }
}

// Start an execution of the configured State Machine, see config at top of file to change state machine arn
function callStepFunction() {
  if (!validateForm()) { return; }

  const data = {
      "name":  config["execution-prefix"] + Date.now(),
      "input": JSON.stringify(createStepFunctionInitialPayload()),
      "stateMachineArn": config["state-machine-arn"]
  };

  $.ajax({
      type: 'Post',
      url: config["api-gateway-execution"],
      crossDomain: true,
      data: JSON.stringify(data),
      success: data => {
          pollForResult(data["executionArn"], resultHandler);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
    }
  });
}

// Poll 'describe-execution' endpoint until completed, call responseHandler when done
function pollForResult(executionArn, responseHandler, pollCount=0, interval=1000) {
    const errorMsgPostfix = 'See Execution page for more details on the AWS step function console';

  const data = {
      "executionArn": executionArn
  };
  $.ajax({
    type: 'Post',
    url: config["api-gateway-describe-execution"],
    crossDomain: true,
    data: JSON.stringify(data),
    success: data => {
      window.finishedExecution = true;
      //$('#status').text(data['status']); //RUNNING, SUCCEEDED, FAILED
      console.log(data['status']);
      if (data['status'] === 'SUCCEEDED') {
        console.log(data['output']);
        responseHandler(JSON.parse(data['output']));
      } else if (data['status'] === 'FAILED') {
        console.log('ERROR: Step Function Failed. ' + errorMsgPostfix);
      } else {
        if (pollCount < 30) {
          window.setTimeout(pollForResult(executionArn, responseHandler, pollCount + 1), interval);
        } else {
            console.log('ERROR: Could not get status of state machine execution. ' + errorMsgPostfix);
        }
      }
    }
  });
}

// sets some form values ahead of time
function populateDemoData() {
  $('#property-address').val('10 Sunny Lane');
  $('#property-city').val('The Future');
  $('#property-state').val('MA');
  $('#property-roof-size').val(100);
  $('#property-shade').val('1');
  $('#property-orientation').val('S');
  $('#monthly-electric-bill').val(200);
  $('#property-type').val('Residential');
  $('#property-value').val(1000000);
  $('#property-age').val(5);
}

function onAwsStep(jQueryObj, resubmit = false) {
  //only call if manual trigger or first execution
  if (jQueryObj.is('#aws-step') && (resubmit || window.finishedExecution === false)) {
    callStepFunction();
    cycleAwsStep();
  }
  return jQueryObj;
}

// Left-side Nav 
function changeStep() {
  // already selected
  if($(this).hasClass('selected')) { return; }
  $('.step-item.selected').removeClass('selected').addClass('complete');
  $(this).addClass('selected');

  $('.form-step.selected').fadeOut().removeClass('selected');
  let target = $('#' + $(this).attr('id').replace(/-title/g,''));
  
  onAwsStep(target.addClass('selected').fadeIn());
}

function changeNestedStep(index) {
  if (index < 1 || index > 6) { return; }

  const awsStepImgEl = $('.aws-step-img');
  //$('#aws-step-title .step-progress-bar.nested .selected').removeClass('selected').addClass('complete');
  $('#aws-step-title .step-progress-bar.nested li:nth-child(' + index + ')').addClass('selected').addClass('complete');
    awsStepImgEl.removeClass('aws-step-1-img aws-step-2-img aws-step-3-img aws-step-4-img aws-step-5-img aws-step-6-img');
    awsStepImgEl.addClass('aws-step-' + index + '-img');
}
function changeNestedStepClickHandler() {
  changeNestedStep($(this).index() + 1);
}
// Simulate steps completing with delay
function cycleAwsStep(index=1) {
  if (index < 1 || index > 6) { return; }
  changeNestedStep(index);
  if (config["enable-step-delay"]) {
    let delay =  config["enable-randomize-delay"] ? config["step-delay"] + Math.random() * 1000 - 500 : config["step-delay"]
    setTimeout(function(){cycleAwsStep(index + 1)}, delay);
  } else {
    cycleAwsStep(index++);
  }
}

// Form Controls
function nextStep() {
    const formStepSelectedEl = $('.form-step.selected');
  const steps = formStepSelectedEl.nextAll('.form-step');
  if (steps.length) {
      const stepItem = $('.step-item.selected').removeClass('selected').addClass('complete');
    stepItem.next().addClass('selected');

      formStepSelectedEl.fadeOut().removeClass('selected');
    onAwsStep(steps.eq(0).addClass('selected').fadeIn());
  }
}
function prevStep() {
    const formStepSelectedEl = $('.form-step.selected');
  const steps = formStepSelectedEl.prevAll('.form-step');
  if (steps.length) {
      const stepItem = $('.step-item.selected').removeClass('selected');
    stepItem.prev().addClass('selected');

      formStepSelectedEl.fadeOut().removeClass('selected');
    onAwsStep(steps.eq(0).addClass('selected').fadeIn());
  }
}

function showModal() {
  $('.modal').fadeIn(200);
}

function hideModal() {
  $('.modal').fadeOut(200);
}

$(document).ready(function() {
  window.finishedExecution = false; // flag for step function

  // Click Handlers
  $('.step-progress-bar .step-item:not(.nested)').click(changeStep);
  $('.step-progress-bar .step-item.nested').click(changeNestedStepClickHandler);
  $('.form-next').click(nextStep);
  $('.form-prev').click(prevStep);

  $('#aws-step-graph').click(showModal);
  $('.modal').click(hideModal);

  //Pre-populate some form values for demo/testing purposes
  populateDemoData();
});