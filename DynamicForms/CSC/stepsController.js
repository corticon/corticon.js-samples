// We maintain the state of the multi-steps UI in these variables
// An array with 2 elements:
// First element is for the UI containers and controls, the second element is for storing all form data
let decisionServiceInput = [{},{}];
let pathToData;
let formData;
let allDone;

/*
When Dynamic UI starts the initial input looks like this:
    [   {
            "currentStageNumber": 1,
            "done": false
        },
        {
        }
    ];
 */
function resetDecisionServiceInput() {
    preparePayloadForNextStage( 0 );

    for (const property in decisionServiceInput[1]) // clear all previous form data if any
        delete decisionServiceInput[1][property];
}

function preparePayloadForNextStage( nextStage ) {
    for (const property in decisionServiceInput[0]) // clear all previous step data except stageOnExit
    {
        if ( property !== 'stageOnExit' )
            delete decisionServiceInput[0][property];
    }

    decisionServiceInput[0].currentStageNumber = nextStage;
    decisionServiceInput[0].done = false;
}

function startDynUI(inputData) {
    resetDecisionServiceInput();
    decisionServiceInput[1] = inputData;

    formData = null;
    allDone = false;
    clearTraceData();

    $('#dynUIContainerId').empty();
    askDecisionServiceForNextUIElementsAndRender( decisionServiceInput );
    $("#nextActionId").show();
    $("#startActionId").hide();
}

function processNextStep() {
    // On Next click, copy value of all rendered elements to the UI Controls in payload
    saveEnteredInputsToFormData();

    // remove previous UI
    $('#dynUIContainerId').empty();

    // If previous call to decision service returned done then reset ui to restart and in this sample we just display the form data in debug panel
    if ( allDone ) {
        $("#nextActionId").hide();
        $("#startActionId").show();
        $('#dynUIContainerId').html("<div style='margin: 2em;'>All Done</div>");
    }
    else {
        preparePayloadForNextStage (decisionServiceInput[0].nextStageNumber);
        let nextUI = askDecisionServiceForNextUIElementsAndRender ( decisionServiceInput );
        // Execute all the steps that are just computation steps till we get a step that require rendering (in which case we will wait for user input and click next)
        while ( nextUI.noUiToRenderContinue !== undefined && nextUI.noUiToRenderContinue ) {
            preparePayloadForNextStage (nextUI.nextStageNumber);
            nextUI = askDecisionServiceForNextUIElementsAndRender(decisionServiceInput);
            traceFormData( formData ); // we need to save current form data for the trace history to work
            if ( nextUI.done ) // if last step is a computation step
                break;
        }

        allDone = nextUI.done;
    }
}

function askDecisionServiceForNextUIElementsAndRender ( payload ) {
    const result = runDecisionService( payload );
    const nextUI = result.payload[0];

    // Save context of where we need to save data the user enters.
    if ( nextUI.pathToData !== undefined && nextUI.pathToData !== null && nextUI.pathToData.length !== 0 )
        pathToData = nextUI.pathToData;

    // Save state: the decision service could potentially augment the form data with computed values that we want to keep carrying around.
    formData = decisionServiceInput[1];

    // Check if this step was just a computation step in which case we just continue as there is no ui to display
    if ( nextUI.noUiToRenderContinue !== undefined && nextUI.noUiToRenderContinue )
        return nextUI;

    const containers = nextUI.containers;
    if ( containers === undefined ) {
        alert('Error: missing container');
        return nextUI;
    }

    renderUI ( containers );

    return nextUI;
}

function saveOneFormData(formDataFieldName, val) {
    if ( val === undefined )
        return;

    if (pathToData === undefined)
        formData[formDataFieldName] = val;
    else {
        if (formData[pathToData] === undefined)
            formData[pathToData] = {};

        formData[pathToData][formDataFieldName] = val;
    }
}

function saveEnteredInputsToFormData () {
    // With space in selector we get all descendants.
    // There's a difference between $("#panel input") and $("#panel :input).
    // The first one will only retrieve elements of type input, that is <input type="...">, but not <textarea>, <button> and <select> elements.
    let allFormEls = $('#dynUIContainerId :input').not('#dynUIContainerId :checkbox');
    allFormEls.each(function(index,item){
        const oneInputEl = $(item);
        const formDataFieldName = oneInputEl.data("fieldName");
        const val = oneInputEl.val();
        const type = oneInputEl.data("type");
        if ( type !== undefined && type !== null && type === "decimal" ) {
            const converted = Number(val);
            if ( isNaN(converted) )
                alert("you didn't enter a number in the field");
            else
                saveOneFormData(formDataFieldName, converted);
        }
        else
            saveOneFormData(formDataFieldName, val);
    });

    allFormEls = $('#dynUIContainerId :checkbox');
    allFormEls.each(function(index,item){
        const oneInputEl = $(item);
        const formDataFieldName = oneInputEl.data("fieldName");
        const val = oneInputEl.is(':checked');
        saveOneFormData(formDataFieldName, val);
    });

    traceFormData( formData );
}

function runDecisionService( payload ) {
    try {
        traceDecisionServiceInputs(payload, payload[0].currentStageNumber);

        const configuration = { logLevel: 0 };
        // const configuration = { logLevel: 1 };
        const result = window.corticonEngine.execute(payload, configuration);
        traceDecisionServiceResults (result);

        if(result.corticon !== undefined) {
            if ( result.corticon.status === 'success' )
                return result;
            else
                alert('There was an error executing the rules.\n' + JSON.stringify(result, null, 2));
        }
        else
            alert('There was an error executing the rules.\n' + JSON.stringify(result, null, 2));
    }
    catch ( e ) {
        alert('There was an exception executing the rules ' + e);
    }
}
