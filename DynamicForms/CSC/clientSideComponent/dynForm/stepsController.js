corticon.util.namespace( "corticon.dynForm" );

corticon.dynForm.StepsController = function () {
    // We maintain the state of the multi-steps UI in these variables
    // An array with 2 elements:
    // First element is for the UI containers and controls, the second element is for storing all form data
    let itsDecisionServiceInput = [{},{}];
    let itsPathToData;
    let itsFormData;
    let itsFlagAllDone;
    let itsLabelPositionAtUILevel;
    let itsQuestionnaireName;
    let itsInitialLanguage;

    const itsUIControlsRenderer = new corticon.dynForm.UIControlsRenderer();

    function startDynUI( baseDynamicUIEl, decisionServiceEngine, externalData, language, questionnaireName ) {
        itsQuestionnaireName = questionnaireName;
        itsInitialLanguage = language;

        const restartData = getRestartData (questionnaireName);
        if ( restartData === null ) {
            setStateForStartFromBeginning(language, externalData);
        }
        else {
            const dialog = confirm("Do you want to start from where you left last time?");
            if (dialog) {
                setStateFromRestartData(questionnaireName, restartData);
            }
            else {
                clearRestartData(questionnaireName);
                setStateForStartFromBeginning(language, externalData);
            }
        }

        corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.BEFORE_START);

        _askDecisionServiceForNextUIElementsAndRender( decisionServiceEngine, itsDecisionServiceInput, baseDynamicUIEl );

        corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.AFTER_START);
    }

    function setStateForStartFromBeginning(language, externalData) {
        _resetDecisionServiceInput(language);

        itsFormData = null;
        itsFlagAllDone = false;
        itsPathToData = null;
        itsLabelPositionAtUILevel = "Above"; // Default

        // We do a deep Copy of externalData.  We need to do that to be able to start more than once
        // (if we don't copy, _resetDecisionServiceInput will erase the original externalData)
        itsDecisionServiceInput[1] = JSON.parse(JSON.stringify(externalData));
    }

    function setStateFromRestartData(questionnaireName, restartData) {
        itsPathToData = getPathToData(questionnaireName);
        itsDecisionServiceInput = restartData;
        itsFormData = itsDecisionServiceInput[1];
    }

    function processNextStep(baseDynamicUIEl, decisionServiceEngine, language) {
        // On Next click, copy value of all rendered elements to the UI Controls in payload
        _saveEnteredInputsToFormData(baseDynamicUIEl);

        corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.NEW_STEP);

        // If previous call to decision service returned done then reset ui to restart and in this sample we just display the form data in debug panel
        if ( itsFlagAllDone ) {
            clearRestartData(itsQuestionnaireName);
            corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.AFTER_DONE);
        }
        else {
            _preparePayloadForNextStage (itsDecisionServiceInput[0].nextStageNumber);
            const restartData = JSON.stringify(itsDecisionServiceInput); // save before call
            let nextUI = _askDecisionServiceForNextUIElementsAndRender ( decisionServiceEngine, itsDecisionServiceInput, baseDynamicUIEl );
            // Execute all the steps that are just computation steps till we get a step that require rendering (in which case we will wait for user input and click next)
            while ( nextUI.noUiToRenderContinue !== undefined && nextUI.noUiToRenderContinue ) {
                _preparePayloadForNextStage (nextUI.nextStageNumber);
                nextUI = _askDecisionServiceForNextUIElementsAndRender( decisionServiceEngine, itsDecisionServiceInput, baseDynamicUIEl );
                corticon.dynForm.raiseEvent( corticon.dynForm.customEvents.NEW_FORM_DATA_SAVED, itsFormData );
                if ( nextUI.done ) // if last step is a computation step
                    break;
            }

            // now that we have skipped noUIToRender steps we can save the restart data
            saveRestartData(itsQuestionnaireName, restartData);

            itsFlagAllDone = nextUI.done;
        }
    }

    function clearRestartData( decisionServiceName ) {
        // try {
            window.localStorage.removeItem('CorticonRestartPayload_'+decisionServiceName);
            window.localStorage.removeItem('CorticonRestartPathToData_'+decisionServiceName);
        // } catch (e) {
        //     // Some browser in private mode may throw exception when using local storage
        // }
    }

    function saveRestartData( decisionServiceName, payload ) {
        // save it in local storage for restore on reload
        try {
            window.localStorage.setItem('CorticonRestartPayload_'+decisionServiceName, payload);
            window.localStorage.setItem('CorticonRestartPathToData_'+decisionServiceName, itsPathToData);
        } catch (e) {
            // Some browser in private mode may throw exception when using local storage
        }
    }

    // returns null when no restart data present
    function getRestartData(decisionServiceName) {
        const payload = window.localStorage.getItem('CorticonRestartPayload_'+decisionServiceName);
        if ( payload !== null )
            return JSON.parse(payload);
        else
            return null;
    }
    function getPathToData(decisionServiceName) {
        return window.localStorage.getItem('CorticonRestartPathToData_'+decisionServiceName);
    }

    function _resetDecisionServiceInput(language) {
        _preparePayloadForNextStage( 0, language );

        for (const property in itsDecisionServiceInput[1]) // clear all previous form data if any
            delete itsDecisionServiceInput[1][property];
    }

    function _preparePayloadForNextStage( nextStage, language ) {
        // clear all previous step data except a few state fields like stageOnExit, language, labelPosition
        const nextPayload = {};
        const stateProperties = ['stageOnExit', 'language', 'labelPosition', 'pathToData'];
        // const stateProperties = ['stageOnExit', 'language', 'pathToData'];
        for ( let i=0; i<stateProperties.length; i++ ) {
            const prop = stateProperties[i];
            if ( itsDecisionServiceInput[0][prop] !== undefined )
                nextPayload[prop] = itsDecisionServiceInput[0][prop];
        }

        nextPayload.currentStageNumber = nextStage;

        // Special process language:
        // On start we accept the language from the UI but a decision service may switch the language based on some rules
        if ( language !== undefined ) {
            nextPayload['language'] = language;
        }

        itsDecisionServiceInput[0] = nextPayload;
    }

    function _processLabelPositionSetting ( newLabelPosition ) {
        // If rule sends a new position uses it - otherwise we will just use the default or whatever was set at a previous step
        if ( newLabelPosition !== undefined && newLabelPosition !== null)
            itsLabelPositionAtUILevel = newLabelPosition;
    }

    function _askDecisionServiceForNextUIElementsAndRender ( decisionServiceEngine, payload, baseEl ) {
        const result = _runDecisionService( decisionServiceEngine, payload );
        const nextUI = result.payload[0];

        // Save context of where we need to save data the user enters so that rule modeler does not have to specify it at each step.
        if ( nextUI.pathToData !== undefined && nextUI.pathToData !== null && nextUI.pathToData.length !== 0 )
            itsPathToData = nextUI.pathToData;

        // Save the default label position so that rule modeler does not have to specify it at each step.
        _processLabelPositionSetting ( nextUI.labelPosition );

        // Save state: the decision service could potentially augment the form data with computed values that we want to keep carrying around.
        itsFormData = itsDecisionServiceInput[1];

        // Check if this step was just a computation step in which case we just continue as there is no ui to display
        if ( nextUI.noUiToRenderContinue !== undefined && nextUI.noUiToRenderContinue )
            return nextUI;

        const containers = nextUI.containers;
        if ( containers === undefined ) {
            alert('Error: missing container');
            return nextUI;
        }

        itsUIControlsRenderer.renderUI ( containers, baseEl, itsLabelPositionAtUILevel, nextUI.language );

        return nextUI;
    }

    function _saveOneFormData(formDataFieldName, val) {
        if ( val === undefined )
            return;

        if (itsPathToData === undefined || itsPathToData === null)
            itsFormData[formDataFieldName] = val;
        else {
            if (itsFormData[itsPathToData] === undefined)
                itsFormData[itsPathToData] = {};

            itsFormData[itsPathToData][formDataFieldName] = val;
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
        corticon.dynForm.raiseEvent( corticon.dynForm.customEvents.NEW_FORM_DATA_SAVED, itsFormData );
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

        if (itsPathToData === undefined || itsPathToData === null)
            itsFormData[formDataFieldName] = outerArray;
        else {
            if (itsFormData[itsPathToData] === undefined)
                itsFormData[itsPathToData] = {};

            itsFormData[itsPathToData][formDataFieldName] = outerArray;
        }
    }

    function _runDecisionService(decisionServiceEngine, payload ) {
        try {
            corticon.dynForm.raiseEvent( corticon.dynForm.customEvents.BEFORE_DS_EXECUTION,{ "input": payload, "stage": payload[0].currentStageNumber });
            // const configuration = { logLevel: 0 };
            const configuration = { logLevel: 1 };
            const t1 = performance.now();
            const result = decisionServiceEngine.execute(payload, configuration);
            const t2 = performance.now();
            corticon.dynForm.raiseEvent( corticon.dynForm.customEvents.NEW_DS_EXECUTION,
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

    // Public interface
    return {
        startDynUI: startDynUI,
        processNextStep: processNextStep
    }
}
