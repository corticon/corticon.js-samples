// Main js file for Solar Application
// requires jQuery

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

  // UI step delay in ms
  "step-delay": 1000,
};
const fieldIds = ['#property-address', 
                  '#property-city',
                  '#property-state',
                  '#property-roof-size',
                  '#property-shade',
                  '#property-orientation',
                  '#monthly-electric-bill',
                  '#property-type',
                  '#property-value'];

function validateForm() {
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

  return valid;
}

// create payload JSON from form data for consumption by Decision Services
function payload() {
  let payload = {
    //TODO: loan lambda, loan ui, loan rest
    "data": {
      //"requireLoan": $('#require-loan').prop('checked')
      "requireLoan": false
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
        "Age": null,
        "MonthlyElectricConsumption": null
    },
    {
        "__metadata": {
            "#type": "Constants",
            "#id": "Constants_id_1"
        }
    }]
  };
  return payload;
}

// result handler for step function output
function resultHandler(result) {
  let quote = result.Objects.find(function(object) { return object.__metadata["#type"] == 'Quote' });

  $('#quote-value').text('Your Total is: $' + quote["Value"]);
}

// Start an execution of the configured State Machine, see config at top of file to change state machine arn
function callStepFunction() {
  return false; // TODO: remove me, working on form dont want a million executions
  //if (!validateForm()) { return; }
  const data = {
      "name":  config["execution-prefix"] + Date.now(),
      "input": JSON.stringify(payload()),
      "stateMachineArn": config["state-machine-arn"]
  }
  $.ajax({
      type: 'Post',
      url: config["api-gateway-execution"],
      crossDomain: true,
      data: JSON.stringify(data),
      success: data => {
          pollForResult(data["executionArn"], resultHandler);
      }
  });
}

// Poll 'describe-execution' endpoint until completed, call responseHandler when done
function pollForResult(executionArn, responseHandler, pollCount=0, interval=1000) {
  const data = {
      "executionArn": executionArn
  }
  $.ajax({
    type: 'Post',
    url: config["api-gateway-describe-execution"],
    crossDomain: true,
    data: JSON.stringify(data),
    success: data => {
      window.finishedExecution = true;
      //$('#status').text(data['status']); //RUNNING, SUCCEEDED, FAILED
      console.log(data['status']);
      if (data['status'] == 'SUCCEEDED') {
        console.log(data['output']);
        responseHandler(JSON.parse(data['output']));
      } else if (data['status'] == 'FAILED') {
        console.log('Step Function Failed: See Execution page for more details');
      } else {
        if (pollCount < 10) {
          window.setTimeout(pollForResult(executionArn, responseHandler, pollCount + 1), interval);
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
}

function onAwsStep(jQueryObj, resubmit = false) {
  //only call if manual trigger or first execution
  if (jQueryObj.is('#aws-step') && (resubmit || window.finishedExecution == false)) {
    callStepFunction();
  }
  return jQueryObj;
}

// Left-side Nav 
function changeStep() {
  $('.step-item.selected').removeClass('selected');
  $(this).addClass('selected')

  $('.form-step.selected').fadeOut().removeClass('selected');
  let target = $('#' + $(this).attr('id').replace(/-title/g,''))
  
  onAwsStep(target.addClass('selected').fadeIn());
}

// Form Controls
function nextStep() {
  let steps = $('.form-step.selected').nextAll('.form-step');
  if (steps.length) {
    $('.form-step.selected').fadeOut().removeClass('selected');
    onAwsStep(steps.eq(0).addClass('selected').fadeIn());
  }
}
function prevStep() {
  let steps = $('.form-step.selected').prevAll('.form-step');
  if (steps.length) {
    $('.form-step.selected').fadeOut().removeClass('selected');
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
  $('.step-progress-bar .step-item').click(changeStep);
  $('.form-next').click(nextStep);
  $('.form-prev').click(prevStep);

  $('#aws-step-graph').click(showModal);
  $('.modal').click(hideModal);

  //Pre-populate some form values for demo/testing purposes
  populateDemoData();
});