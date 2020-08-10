/* This file handles application logic regarding the decision servic*/
// requires jQuery


const entityDefaults = {
  "Collection": {
    "Name": null,
  },
};


// Helper function to add required metatdata and populate defaults
function payload(entities) {
  const payload = { "__metadataRoot": {"#locale": ""} };
  const entityCount = {};
  if (!Array.isArray(entities)) { console.error("Provided entities should be place in an array."); }

  payload["Objects"] = entities.map(entity => {
    let [entityName, entityObject] = Object.entries(entity)[0];

    // maintain a count of each type of entity for id purposes
    if (!entityCount[entityName]++) { entityCount[entityName] = 1; }

    // id can be any request unique identifier
    entityObject["__metadata"] = {
      "#type": entityName,
      "#id": `${entityName}_id_${entityCount[entityName]}`
    }

    // shallow merge object into defaults
    return {...entityDefaults[entityName], ...entityObject};
  })
  
  return payload;
};

function runDecisionService(entities, configuration={}, responseHandler, service=window.corticonEngine) {
  const result = service.execute(payload(entities), configuration);
  if ( result.status === 'success' ) {
    responseHandler(result);
  } else {
    console.error('There was an error executing the rules.\n' + JSON.stringify(result, null, 2));
  }
};

// sets array of strings as options to the jQuery select object
function selectAppendOptions(select, arr) {
  select.empty();
  arr.forEach(function(str, i) {
    select.append('<option value="' + str + '">' + str + '</option>')
  });
}

// initial call to DS to fetch information
function populateCars() {
  runDecisionService([{"Collection": {"name": "Cars"}}], {}, function(result) {
    console.log(result);
    // update necessary form fields based on fetched cars
    let cars = result.Objects.filter(function(object) { return object.__metadata["#type"] == 'Cars.Car' });
    cars.sort(function(a, b) { return a.manufacturer > b.manufacturer ? 1 : -1 });

    let manufacturers = [];
    cars.forEach(function(car) {
      // assumes sort on manufacturer above
      if (manufacturers[manufacturers.length - 1] != car.manufacturer) {
        manufacturers.push(car.manufacturer);
      }
      // other processing
    })

    selectAppendOptions($('select#car-manufacturer'), manufacturers);

    // make available elsewhere if needed
    window.cars = cars;
    window.manufacturers = manufacturers;


    updateModels();
  });
}

// update Model options based on current manufacturer
function updateModels() {
  let manufacturer = $('select#car-manufacturer').val()
  let models = window.cars.reduce(function(arr, car) {
    if (car.manufacturer == manufacturer) {
      arr.push(car.name)
    }
    return arr;
  }, []);
  selectAppendOptions($('select#car-model'), models);
}

// create entities JSON from form data
function formEntities() {
  let car = window.cars.find(function(car) {
    return car.name == $('#car-model').val();
  });

  let entities = [
    { "User": {
      "firstName": $('#user-first-name').val(),
      "lastName": $('#user-last-name').val(),
      "birthDate": $('#user-date-of-birth').val(),
      "streetAddress": $('#user-address').val(),
      "city": $('#user-city').val(),
      "profession": $('#user-profession').val(),
      "employer": $('#user-employer').val() || $('#alt-user-employer').val(),
      "employeeId": $('#user-employee-id').val() || $('#alt-user-employee-id').val(),
      "car": {
        "price": car.price,
        "name": car.name,
        "__metadata": {
            "#type": "Cars.Car",
            "#id": "Cars.Car_id_1"
        },
        "manufacturer": car.manufacturer,
      },
    }},
  ];
  return entities;
}

// call client Decision Service to decide whether to show next step
function professionDiscountStep() {
  runDecisionService(formEntities(), {}, function(result) {
    console.log(result);
    let user = result.Objects.filter(function(object) { return object.__metadata["#type"] == 'User' })[0];
    if (user.showProfessionDiscount) {
      $('#conditional-user-step-1').removeClass('hide-step');
      $('#conditional-user-step-1-header').removeClass('hide-step');
    } else {
      $('#conditional-user-step-1').addClass('hide-step');
      $('#conditional-user-step-1-header').addClass('hide-step');
    }
  }, window.corticonEngine);
}

// call client Decision Service to decide whether ot show next step
// also fetch what fields to present to user
function professionDiscountOptionsStep() {
  runDecisionService(formEntities(), {}, function(result) {
    console.log(result);
    let user = result.Objects.filter(function(object) { return object.__metadata["#type"] == 'User' })[0];
    if (user.showProfessionDiscount) {
      $('#conditional-user-step-2').removeClass('hide-step');
      $('#conditional-user-step-2-header').removeClass('hide-step');
    } else {
      $('#conditional-user-step-2').addClass('hide-step');
      $('#conditional-user-step-2-header').addClass('hide-step');
    }
    
    // Type 2 - Some or All Form fields/options reside in Decision Service
    // Data passed down along with the decision to render the step
    let newStep = result.Objects.filter(function(object) { return object.__metadata["#type"] == 'ConditionalFormStep' })[0];
    
    // TODO: Replace with association
    let newFields = result.Objects.filter(function(object) { return object.__metadata["#type"] == 'ConditionalFormField' });
    let selectOptions = result.Objects.filter(function(object) { return object.__metadata["#type"] == 'ConditionalFormFieldOption' });

    // construct and append the new fields
    $('#conditional-user-step-2').empty();
    newFields.forEach(function(field) {
      let fieldHtml = '<div class="form-label">' + field.label + '</div>';
      if (field.type == 'text') {
        fieldHtml += '<input id="alt-' + field.name + '" type="text" class="form-control">';
        fieldHtml = '<div class="form-group form-row">' + fieldHtml + '</div>';
        $('#conditional-user-step-2').append(fieldHtml);
      } else if (field.type == 'select') {
        fieldHtml += '<select id="alt-' + field.name + '" class="form-control"></select>';
        fieldHtml = '<div class="form-group form-row">' + fieldHtml + '</div>';
        $('#conditional-user-step-2').append(fieldHtml);

        let select = $('#alt-' + field.name);
        selectOptions.forEach(function(option) {
          select.append('<option value="' + option.value + '">' + option.text + '</option>')
        })

      }
      
    })

  }, window.corticonEngine);
}

function prevStep() {
  let curr_step = $('#steps .step.curr-step');
  let curr_step_header = $('#steps-header .step.curr-step');

  let steps = curr_step.prevAll('#steps .step:not(.hide-step)');
  if (steps.length) {
    curr_step.fadeOut().removeClass('curr-step');
    steps.eq(0).addClass('curr-step').fadeIn();

    curr_step_header.fadeOut().removeClass('curr-step');
    curr_step_header.prevAll('#steps-header .step:not(.hide-step)').eq(0).addClass('curr-step').fadeIn();

    // re-hide submit button
    $('#steps-nav-continue').removeClass('display-none');
    $('#steps-nav-submit').addClass('display-none');
  }
}

function nextStep() {
  let curr_step = $('#steps .step.curr-step');
  let curr_step_header = $('#steps-header .step.curr-step');

  // Call DS after User finishes providing Profession
  if (curr_step.is('#user-step-2')) {
    professionDiscountStep();
    professionDiscountOptionsStep();
  }

  let steps = curr_step.nextAll('#steps .step:not(.hide-step)');
  if (steps.length) {
    curr_step.fadeOut().removeClass('curr-step');
    steps.eq(0).addClass('curr-step').fadeIn();

    curr_step_header.fadeOut().removeClass('curr-step');
    curr_step_header.nextAll('#steps-header .step:not(.hide-step)').eq(0).addClass('curr-step').fadeIn();

    $('#steps-nav-back').removeClass('display-none');

    if (steps.eq(0).is("#user-submit-quote-step")) {
      $('#steps-nav-continue').addClass('display-none');
      $('#steps-nav-submit').removeClass('display-none');
    }
  }
}

// call server Decision Service to calculate price quote
function getQuote() {
  let entities = formEntities();
  runDecisionService(entities, {}, function(result) {
    console.log(result);
    let user = result.Objects.filter(function(object) { return object.__metadata["#type"] == 'User' })[0]
    $('#user-quote-display').text("$" + user.priceQuote);
    nextStep();
  }, window.corticonEngineServer);
}

// sets some form values ahead of time
function populateDemoData() {
  $('#user-first-name').val('Rex');
  $('#user-last-name').val('Cars');
  $('#user-date-of-birth').val('2011-11-11')
  $('#user-address').val('4 Car Salvage Yard');
  $('#user-city').val('JunkTown');
  $('#user-profession').val('Automotive Technician');
  $('#user-employer').val('');
}


$(document).ready(function() {
  $('select#car-manufacturer').change(updateModels);


  // Click Handlers
  $('#steps-nav-back').click(prevStep);

  $('#steps-nav-continue').click(nextStep);


  $('#steps-nav-submit').click(getQuote);
  populateCars();

  //Pre-populate some form values for demo/testing purposes
  populateDemoData();
});