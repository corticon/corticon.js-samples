// We maintain the state of the multi-steps UI in these variables
// An array with 2 elements:
// First element is for the UI containers and controls, the second element is for storing all form data
let decisionServiceInput = [{},{}];
let pathToData;
let formData;
let allDone;
let labelPositionAtUILevel;

function startDynUI( baseDynamicUIEl, decisionServiceEngine, externalData, language ) {
    _resetDecisionServiceInput(language);
    _resetState();

    const deepCopyExternalData = JSON.parse(JSON.stringify(externalData));// need to do that to be able to start more than once (if we don't copy, _resetDecisionServiceInput will erase the original externalData)
    decisionServiceInput[1] = deepCopyExternalData;

    raiseEvent(BEFORE_START);

    _askDecisionServiceForNextUIElementsAndRender( decisionServiceEngine, decisionServiceInput, baseDynamicUIEl );

    raiseEvent(AFTER_START);
}

function processNextStep(baseDynamicUIEl, decisionServiceEngine, language) {
    // On Next click, copy value of all rendered elements to the UI Controls in payload
    _saveEnteredInputsToFormData(baseDynamicUIEl);

    raiseEvent(NEW_STEP);

    // If previous call to decision service returned done then reset ui to restart and in this sample we just display the form data in debug panel
    if ( allDone ) {
        raiseEvent(AFTER_DONE);
    }
    else {
        _preparePayloadForNextStage (decisionServiceInput[0].nextStageNumber, language);
        let nextUI = _askDecisionServiceForNextUIElementsAndRender ( decisionServiceEngine, decisionServiceInput, baseDynamicUIEl );
        // Execute all the steps that are just computation steps till we get a step that require rendering (in which case we will wait for user input and click next)
        while ( nextUI.noUiToRenderContinue !== undefined && nextUI.noUiToRenderContinue ) {
            _preparePayloadForNextStage (nextUI.nextStageNumber);
            nextUI = _askDecisionServiceForNextUIElementsAndRender( decisionServiceEngine, decisionServiceInput, baseDynamicUIEl );
            raiseEvent( NEW_FORM_DATA_SAVED, formData );
            if ( nextUI.done ) // if last step is a computation step
                break;
        }

        allDone = nextUI.done;
    }
}


/*
When Dynamic UI starts the initial input looks like this:
    [   {
            "currentStageNumber": 0,
            "done": false
        },
        {
        }
    ];
 */
function _resetDecisionServiceInput(language) {
    _preparePayloadForNextStage( 0, language );

    for (const property in decisionServiceInput[1]) // clear all previous form data if any
        delete decisionServiceInput[1][property];
}

function _preparePayloadForNextStage( nextStage, language ) {
    for (const property in decisionServiceInput[0]) // clear all previous step data except stageOnExit
    {
        if ( property !== 'stageOnExit' )
            delete decisionServiceInput[0][property];
    }

    decisionServiceInput[0].currentStageNumber = nextStage;
    decisionServiceInput[0].language = language;
}

function _resetState() {
    formData = null;
    allDone = false;
    pathToData = null;
    labelPositionAtUILevel = "Above"; // Default
}

function _processLabelPositionSetting ( newLabelPosition ) {
    // If rule sends a new position uses it - otherwise we will just use the default or whatever was set at a previous step
    if ( newLabelPosition !== undefined && newLabelPosition !== null)
        labelPositionAtUILevel = newLabelPosition;
}

function _askDecisionServiceForNextUIElementsAndRender ( decisionServiceEngine, payload, baseEl ) {
    const result = _runDecisionService( decisionServiceEngine, payload );
    const nextUI = result.payload[0];

    // Save context of where we need to save data the user enters so that rule modeler does not have to specify it at each step.
    if ( nextUI.pathToData !== undefined && nextUI.pathToData !== null && nextUI.pathToData.length !== 0 )
        pathToData = nextUI.pathToData;

    // Save the default label position so that rule modeler does not have to specify it at each step.
    _processLabelPositionSetting ( nextUI.labelPosition );

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

    renderUI ( containers, baseEl, labelPositionAtUILevel, nextUI.language );

    return nextUI;
}

function _saveOneFormData(formDataFieldName, val) {
    if ( val === undefined )
        return;

    if (pathToData === undefined || pathToData === null)
        formData[formDataFieldName] = val;
    else {
        if (formData[pathToData] === undefined)
            formData[pathToData] = {};

        formData[pathToData][formDataFieldName] = val;
    }
}

function _saveNonArrayInputsToFormData(baseEl) {
    // With space in selector we get all descendants.
    // There's a difference between $("#panel input") and $("#panel :input).
    // The first one will only retrieve elements of type input, that is <input type="...">, but not <textarea>, <button> and <select> elements.
    // let allFormEls = $('#dynUIContainerId :input').not('#dynUIContainerId :checkbox');
    let allFormEls = baseEl.find('.nonarrayTypeControl :input').not(':checkbox');
    allFormEls.each(function (index, item) {
        const oneInputEl = $(item);
        const formDataFieldName = oneInputEl.data("fieldName");
        const val = oneInputEl.val();
        const type = oneInputEl.data("type");
        if (type !== undefined && type !== null && type === "decimal") {
            const converted = Number(val);
            if (isNaN(converted))
                alert("you didn't enter a number in the field");
            else
                _saveOneFormData(formDataFieldName, converted);
        } else
            _saveOneFormData(formDataFieldName, val);
    });

    // allFormEls = $('#dynUIContainerId :checkbox');
    allFormEls = baseEl.find('.nonarrayTypeControl :checkbox');
    allFormEls.each(function (index, item) {
        const oneInputEl = $(item);
        const formDataFieldName = oneInputEl.data("fieldName");
        const val = oneInputEl.is(':checked');
        _saveOneFormData(formDataFieldName, val);
    });
}

function _saveEnteredInputsToFormData (baseEl) {
    _saveNonArrayInputsToFormData(baseEl);
    _saveArrayTypeInputsToFormData(baseEl);
    raiseEvent( NEW_FORM_DATA_SAVED, formData );
}

function _saveArrayTypeInputsToFormData (baseEl) {
    let outerArray = [];
    let formDataFieldName;
    let uiControlType;

    let allArrayEls = baseEl.find('.arrayTypeControl');
    allArrayEls.each(function(index,item){
        const oneArrayEl = $(item);
        uiControlType = oneArrayEl.data("uicontroltype");
        let allFormEls = oneArrayEl.find(':input').not(':checkbox');

        let innerArray = [];
        for ( var i=0; i<allFormEls.length; i++ ) {
            const oneFormEl = allFormEls[i];
            const oneInputEl = $(oneFormEl);
            formDataFieldName = oneInputEl.data("fieldName");
            const val = oneInputEl.val();
            innerArray.push( val );
        }

        outerArray.push(innerArray);
    });

    if ( outerArray.length !== 0 ) {
        if ( uiControlType === 'MultiExpenses' ) {
            const expenseFieldArray = ['expenseCode', 'amount', 'currency' ];
            const convertedArray = _createEachExpenseEntity(outerArray, expenseFieldArray);
            _saveArrayElFormData(formDataFieldName, convertedArray);
        }
        else
            alert('This array type is not yet supported ' + uiControlType );
    }
}

function _createEachExpenseEntity(outerArray, expenseFieldArray) {
    const convertedArray = [];
    for ( var i=0; i<outerArray.length; i++ ) {
        const oneItemAsAnArray = outerArray[i];
        const oneItemAsObjLit = {};
        for ( var j=0; j<oneItemAsAnArray.length; j++ ) {
            oneItemAsObjLit[expenseFieldArray[j]] = oneItemAsAnArray[j];
        }
        const converted = Number(oneItemAsObjLit['amount']);
        if ( $.isNumeric(converted) )
            oneItemAsObjLit['amount'] = converted;
        else
            oneItemAsObjLit['amount'] = 0;

        convertedArray.push( oneItemAsObjLit );
    }
    return convertedArray;
}
function _saveArrayElFormData(formDataFieldName, outerArray) {
    if ( outerArray === undefined )
        return;

    if (pathToData === undefined || pathToData === null)
        formData[formDataFieldName] = outerArray;
    else {
        if (formData[pathToData] === undefined)
            formData[pathToData] = {};

        formData[pathToData][formDataFieldName] = outerArray;
    }
}


function _runDecisionService(decisionServiceEngine, payload ) {
    try {
        raiseEvent( BEFORE_DS_EXECUTION,{ "input": payload, "stage": payload[0].currentStageNumber });
        // const configuration = { logLevel: 0 };
        const configuration = { logLevel: 1 };
        var t1 = performance.now();
        const result = decisionServiceEngine.execute(payload, configuration);
        var t2 = performance.now();
        raiseEvent( NEW_DS_EXECUTION,
            { "output": result,
                  "execTimeMs": t2-t1,
                  "stage": payload[0].currentStageNumber
                 }
        );

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
