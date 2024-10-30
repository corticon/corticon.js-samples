corticon.util.namespace("corticon.dynForm");
function _createEachTextEntity(outerArray, textFieldArray) {
    const convertedArray = [];
    for (let i = 0; i < outerArray.length; i++) {
        const oneItemAsAnArray = outerArray[i];
        const oneItemAsObjLit = {};
        for (let j = 0; j < oneItemAsAnArray.length; j++) {
            oneItemAsObjLit[textFieldArray[j]] = oneItemAsAnArray[j];
        }

        convertedArray.push(oneItemAsObjLit);
    }
    return convertedArray;
}
corticon.dynForm.StepsController = function () {
    // We maintain the state of the multi-steps UI in these variables
    // An array with 2 elements:
    // First element is for the UI containers and controls, the second element is for storing all form data
    let itsDecisionServiceInput = [{}, {}];
    let itsPathToData;
    let itsFormData;
    let itsFlagAllDone;
    let itsLabelPositionAtUILevel;
    let itsQuestionnaireName;
    let itsInitialLanguage;
    let itsFlagRenderWithKui;

    const itsHistory = new corticon.dynForm.History();
    const itsUIControlsRenderer = new corticon.dynForm.UIControlsRenderer();

    async function startDynUI(baseDynamicUIEl, decisionServiceEngine, externalData, language, questionnaireName, useKui) {
        itsFlagRenderWithKui = useKui;
        itsQuestionnaireName = questionnaireName;
        itsInitialLanguage = language;
        itsHistory.setupHistory();

        const restartData = getRestartData(questionnaireName);
        if (restartData === null) {
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

        await _askDecisionServiceForNextUIElementsAndRender(decisionServiceEngine, itsDecisionServiceInput, baseDynamicUIEl);

        corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.AFTER_START, { historyEmpty: itsHistory.isHistoryEmpty() });
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
    async function _processBackgroundData(backgroundData) {
        const url = backgroundData.url;
        const arrayToSet = backgroundData.arrayToSet;
        const arrayToCollection = backgroundData.arrayToCollection;
        const collectionName = backgroundData.collectionName;
        const fieldName1 = backgroundData.fieldName1;
        const labelName1 = backgroundData.labelName1;
        const pathToValue1 = backgroundData.pathToValue1;
        const labelName2 = backgroundData.labelName2;
        const pathToValue2 = backgroundData.pathToValue2;
        const fieldName3 = backgroundData.fieldName3;
        const labelName3 = backgroundData.labelName3;
        const pathToValue3 = backgroundData.pathToValue3;
        const fieldName4 = backgroundData.fieldName4;
        const labelName4 = backgroundData.labelName4;
        const pathToValue4 = backgroundData.pathToValue4;
        const fieldName5 = backgroundData.fieldName5;
        const labelName5 = backgroundData.labelName5;
        const pathToValue5 = backgroundData.pathToValue5;
        const fieldName6 = backgroundData.fieldName6;
        const labelName6 = backgroundData.labelName6;
        const pathToValue6 = backgroundData.pathToValue6;
        const fieldName7 = backgroundData.fieldName7;
        const labelName7 = backgroundData.labelName7;
        const pathToValue7 = backgroundData.pathToValue7;
        const fieldName8 = backgroundData.fieldName8;
        const labelName8 = backgroundData.labelName8;
        const pathToValue8 = backgroundData.pathToValue8;
        const fieldName9 = backgroundData.fieldName9;
        const labelName9 = backgroundData.labelName9;
        const pathToValue9 = backgroundData.pathToValue9;
        const fieldName10 = backgroundData.fieldName10;
        const labelName10 = backgroundData.labelName10;
        const pathToValue10 = backgroundData.pathToValue10;

        try {
            const response = await fetch(url);
            const data = await response.json();

            let value;
            if (arrayToSet) {
                value = data.map(item => item[labelName1]).join(', ');
            } else if (arrayToCollection) {
                value = data.map(item => {
                    const newObj = {};
                    for (let i = 1; i <= 10; i++) {
                        const fieldName = backgroundData[`fieldName${i}`];
                        const labelName = backgroundData[`labelName${i}`];
                        const pathToValue = backgroundData[`pathToValue${i}`];  // Access pathToValue here
                        if (fieldName && labelName) {  // Only check for fieldName and labelName
                            newObj[fieldName] = item[labelName];  // Directly use labelName for extraction
                        }
                    }
                    return newObj;
                });
            } else if (fieldName1 && labelName1 && pathToValue1) {  // Condition for single value extraction
                value = JSONPath.JSONPath(pathToValue1, data)[0];
                _saveOneFormData(fieldName1, value); // Save the extracted value
            } else {
                // Handle other cases or provide a default behavior if needed
            }

            // Store the value under the collectionName if arrayToCollection is true
            if (arrayToCollection) {
                _saveOneFormData(collectionName, value);
            } else if (!(fieldName1 && labelName1 && pathToValue1)) { // Avoid saving again if already saved in the condition above
                _saveOneFormData(fieldName1, value);
            }

        } catch (error) {
            console.error('Error processing background data:', error);
            // Handle errors appropriately
        }
    }
    function setStateFromRestartData(questionnaireName, restartData) {
        itsLabelPositionAtUILevel = "Above"; // Default
        itsPathToData = getPathToData(questionnaireName);
        setStateFromStepData(restartData);
        itsHistory.setRestartHistory(getRestartHistory(questionnaireName));
        itsHistory.getPreviousStageData(); // we remove from stack the most recent as we are going to execute it again and push it.
    }

    function getRestartHistory(decisionServiceName) {
        return window.localStorage.getItem('CorticonRestartHistory_' + decisionServiceName);
    }

    function setStateFromStepData(data) {
        itsDecisionServiceInput = data;
        itsFormData = itsDecisionServiceInput[1];
    }

    async function processPrevStep(baseDynamicUIEl, decisionServiceEngine, language) {
        if (itsFlagAllDone)  // Technically not needed if we disable the previous button correctly all the time but safer to double protect in case of bugs.
            return;

        const allData = itsHistory.getPreviousStageData();
        if (allData === undefined)  // we are at beginning
            return;

        const prevStageNbr = allData['stage'];
        itsDecisionServiceInput = allData['input'];
        itsDecisionServiceInput[0].nextStageNumber = prevStageNbr;
        await processNextStep(baseDynamicUIEl, decisionServiceEngine, language, false);

        if (prevStageNbr === 0)
            corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.BACK_AT_FORM_BEGINNING);
    }

    async function processNextStep(baseDynamicUIEl, decisionServiceEngine, language, saveInputToFormData = true) {
        if (saveInputToFormData) {
            // Validate required fields within each container
            const containers = baseDynamicUIEl.find('.inputContainer');
            let isValid = true;
            containers.each(function (index, container) {
                const requiredInputs = $(container).find('.required-input');
                requiredInputs.each(function (index, item) {
                    const inputEl = $(item);
                    if (inputEl.val() === '') {
                        // Create an error message element
                        const errorMessage = $('<span class="error-message">This field is required</span>');

                        // Insert the error message after the input field
                        inputEl.after(errorMessage);

                        isValid = false;
                        return false;
                    }
                });
                if (!isValid) return false; // Exit the outer loop if invalid
            });

            if (!isValid) {
                return; // Prevent moving to the next step
            }

            // Now save the input data since it's valid
            _saveEnteredInputsToFormData(baseDynamicUIEl);
        }

        corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.NEW_STEP);

        // If previous call to decision service returned done then reset ui to restart and in this sample we
        // just display the form data in the trace panel.  In a production application, the data would be submitted
        // to a backend service for further processing.
        if (itsFlagAllDone) {
            clearRestartData(itsQuestionnaireName);
            corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.AFTER_DONE);
        }
        else {
            _preparePayloadForNextStage(itsDecisionServiceInput[0].nextStageNumber);
            const restartData = JSON.stringify(itsDecisionServiceInput); // save before call
            let nextUI = await _askDecisionServiceForNextUIElementsAndRender(decisionServiceEngine, itsDecisionServiceInput, baseDynamicUIEl);
            // Execute all the steps that are just computation steps till we get a step that require rendering (in which case we will wait for user input and click next)
            while (nextUI.noUiToRenderContinue !== undefined && nextUI.noUiToRenderContinue) {
                _preparePayloadForNextStage(nextUI.nextStageNumber);
                nextUI = await _askDecisionServiceForNextUIElementsAndRender(decisionServiceEngine, itsDecisionServiceInput, baseDynamicUIEl);
                corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.NEW_FORM_DATA_SAVED, itsFormData);
                if (nextUI.done) // if last step is a computation step
                    break;
            }

            // now that we have skipped noUIToRender steps we can save the restart data
            saveRestartData(itsQuestionnaireName, restartData);

            if (nextUI.done) {
                itsFlagAllDone = nextUI.done;
                corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.FORM_DONE);
            }
        }
    }

    function clearRestartData(decisionServiceName) {
        window.localStorage.removeItem('CorticonRestartPayload_' + decisionServiceName);
        window.localStorage.removeItem('CorticonRestartPathToData_' + decisionServiceName);
        window.localStorage.removeItem('CorticonRestartHistory_' + decisionServiceName);
    }

    function saveRestartData(decisionServiceName, payload) {
        // save it in local storage for restore on reload
        try {
            window.localStorage.setItem('CorticonRestartPayload_' + decisionServiceName, payload);
            window.localStorage.setItem('CorticonRestartPathToData_' + decisionServiceName, itsPathToData);
            window.localStorage.setItem('CorticonRestartHistory_' + decisionServiceName, itsHistory.getRestartHistory());
        } catch (e) {
            // Some browser in private mode may throw exception when using local storage
        }
    }

    // returns null when no restart data present
    function getRestartData(decisionServiceName) {
        const payload = window.localStorage.getItem('CorticonRestartPayload_' + decisionServiceName);
        if (payload !== null)
            return JSON.parse(payload);
        else
            return null;
    }

    function getPathToData(decisionServiceName) {
        return window.localStorage.getItem('CorticonRestartPathToData_' + decisionServiceName);
    }

    function _resetDecisionServiceInput(language) {
        _preparePayloadForNextStage(0, language);

        for (const property in itsDecisionServiceInput[1]) // clear all previous form data if any
            delete itsDecisionServiceInput[1][property];
    }

    function _preparePayloadForNextStage(nextStage, language) {
        // clear all previous step data except a few state fields like stageOnExit, language, labelPosition
        const nextPayload = {};
        const stateProperties = ['stageOnExit', 'language', 'labelPosition', 'pathToData'];
        // const stateProperties = ['stageOnExit', 'language', 'pathToData'];
        for (let i = 0; i < stateProperties.length; i++) {
            const prop = stateProperties[i];
            if (itsDecisionServiceInput[0][prop] !== undefined)
                nextPayload[prop] = itsDecisionServiceInput[0][prop];
        }

        nextPayload.currentStageNumber = nextStage;

        // Special process language:
        // On start we accept the language from the UI but a decision service may switch the language based on some rules
        if (language !== undefined) {
            nextPayload['language'] = language;
        }

        itsDecisionServiceInput[0] = nextPayload;
    }

    function _processLabelPositionSetting(newLabelPosition) {
        // If rule sends a new position uses it - otherwise we will just use the default or whatever was set at a previous step
        if (newLabelPosition !== undefined && newLabelPosition !== null)
            itsLabelPositionAtUILevel = newLabelPosition;
    }

    async function _askDecisionServiceForNextUIElementsAndRender(decisionServiceEngine, payload, baseEl) {
        const result = await _runDecisionService(decisionServiceEngine, payload);
        if (result.corticon.status !== 'success')
            return;

        const nextUI = result.payload[0];

        // Save context of where we need to save data the user enters so that rule modeler does not have to specify it at each step.
        if (nextUI.pathToData !== undefined && nextUI.pathToData !== null && nextUI.pathToData.length !== 0)
            itsPathToData = nextUI.pathToData;

        // Save the default label position so that rule modeler does not have to specify it at each step.
        _processLabelPositionSetting(nextUI.labelPosition);

        // Save state: the decision service could potentially augment the form data with computed values that we want to keep carrying around.
        itsFormData = itsDecisionServiceInput[1];

        // Handle Background Data (this block should be here)
        const backgroundDataArray = nextUI.backgroundData;
        if (backgroundDataArray) {
            for (const backgroundData of backgroundDataArray) {
                await _processBackgroundData(backgroundData);
            }
        }

        // Check if this step was just a computation step in which case we just continue as there is no ui to display
        if (nextUI.noUiToRenderContinue !== undefined && nextUI.noUiToRenderContinue)
            return nextUI;

        const containers = nextUI.containers;
        if (containers === undefined) {
            alert('Error: missing container');
            return nextUI;
        }

        itsUIControlsRenderer.renderUI(containers, baseEl, itsLabelPositionAtUILevel, nextUI.language, itsFlagRenderWithKui);

        const event = { "input": payload, "stage": payload[0].currentStageNumber };
        corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.AFTER_UI_STEP_RENDERED, event);

        return nextUI;
    }
    function _saveOneFormData(formDataFieldName, val) {
        if (val === undefined)
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
        let allFormEls = baseEl.find('.nonarrayTypeControl :input').not(':checkbox').not('.markerFileUploadExpense');
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
            }
            else if (type !== undefined && type !== null && type === "datetimetag" || type === "datetag") {
                if (val !== undefined && val !== null && val !== "") {
                    const theDate = new Date(val);
                    let theDateISOString;
                    let theDateAsMsSinceEpoch;  // if one prefers to work with ms since epoch
                    if (type === "datetag") {
                        const tzOffsetMns = theDate.getTimezoneOffset();
                        // Create a new Date object UTC timezone
                        const utcMs = theDate.getTime() + tzOffsetMns * 60 * 1000;
                        const utcDate = new Date(utcMs);
                        theDateISOString = utcDate.toISOString();
                        theDateAsMsSinceEpoch = utcDate.getTime(); // it is possible to pass the date to Corticon DS as ms since epoch
                    }
                    else {
                        theDateISOString = theDate.toISOString();
                        theDateAsMsSinceEpoch = theDate.getTime();
                    }

                    // debugger;
                    _saveOneFormData(formDataFieldName, theDateISOString);
                    // _saveOneFormData(formDataFieldName, theDateAsMsSinceEpoch);
                }
            }
            else {
                if (val !== undefined && val !== null && val !== "")
                    _saveOneFormData(formDataFieldName, val);
            }
        });

        // allFormEls = $('#dynUIContainerId :checkbox');
        allFormEls = baseEl.find('.nonarrayTypeControl :checkbox');
        allFormEls.each(function (index, item) {
            const oneInputEl = $(item);
            const formDataFieldName = oneInputEl.data("fieldName");
            const val = oneInputEl.is(':checked');
            _saveOneFormData(formDataFieldName, val);
        });

        _saveFileUploadExpenses(baseEl);
    }

    function _saveFileUploadExpenses(baseEl) {
        // With space in selector we get all descendants.
        let allFormEls = baseEl.find('.nonarrayTypeControl .markerFileUploadExpense');

        allFormEls.each(function (index, item) {
            const oneInputEl = $(item);
            const formDataFieldName = oneInputEl.data("fieldName");
            const id = oneInputEl.attr('id')
            const val = oneInputEl.val();
            _saveOneFileUploadExpenseData(formDataFieldName, val, id);
        });

    }

    function _saveOneFileUploadExpenseData(formDataFieldName, val, id) {
        if (val === undefined)
            return;

        let theExpenses;
        if (itsPathToData === undefined || itsPathToData === null)
            theExpenses = itsFormData[formDataFieldName];
        else {
            if (itsFormData[itsPathToData] === undefined) {
                alert('Error: There should already be form data');
                return;
            }
            else
                theExpenses = itsFormData[itsPathToData][formDataFieldName];
        }

        // iterate expenses and find corresponding id.  When found set the data.
        for (let i = 0; i < theExpenses.length; i++) {
            const oneExpense = theExpenses[i];
            if (oneExpense.id === id)
                oneExpense['fileUpload'] = val;
        }
    }

    // Process all the simple and the complex array type controls
    function _saveArrayTypeInputsToFormData(baseEl) {
        _processAllSimpleArrayControls(baseEl);
        _processAllComplexArrayControls(baseEl, itsPathToData); // Pass itsPathToData as an argument
    }
    function _processAllComplexArrayControls(baseEl, itsPathToData) {
        let outerArray = [];
        let formDataFieldName;
        let uiControlType;

        let allArrayEls = baseEl.find(".complexArrayTypeControl");

        // Check if there are any complex array-type controls
        if (allArrayEls.length === 0) {
            return; // Return early if no controls are found
        }

        allArrayEls.each(function (index, item) {
            const oneArrayEl = $(item);
            uiControlType = $(this).parent().data("uicontroltype");
            let allFormEls = oneArrayEl.find(":input").not(":checkbox");

            let innerArray = [];
            for (var i = 0; i < allFormEls.length; i++) {
                const oneFormEl = allFormEls[i];
                const oneInputEl = $(oneFormEl);
                formDataFieldName = oneInputEl.data("fieldName");
                const val = oneInputEl.val();
                innerArray.push(val);
            }

            outerArray.push(innerArray);
        });

        if (outerArray.length !== 0) {
            if (uiControlType === "MultiExpenses") {
                const expenseFieldArray = ["expenseCode", "amount", "currency"];
                const convertedArray = _createEachExpenseEntity(outerArray, expenseFieldArray);
                _saveArrayElFormData(formDataFieldName, convertedArray, itsPathToData);
            } else if (uiControlType === "MultiText") {
                const textFieldArray = ["textInput"];
                const convertedArray = _createEachTextEntity(outerArray, textFieldArray);
                _saveArrayElFormData(formDataFieldName, convertedArray, itsPathToData);
            } else {
                alert("This complex array type is not yet supported " + uiControlType);
            }
        }
    }

    function _processAllSimpleArrayControls(baseEl) {
        const allSimpleUiControlsOfArrayType = _getAllSimpleArrayTypeInputsToFormData(baseEl);

        for (let j = 0; j < allSimpleUiControlsOfArrayType.length; j++) {
            const oneControlData = allSimpleUiControlsOfArrayType[j];
            const uiControlType = oneControlData['type'];
            const formDataFieldName = oneControlData['fieldName'];
            const valuesForOneControl = oneControlData['values'];
            if (uiControlType === 'Text' || uiControlType === 'Number' || uiControlType === 'DateTime') {
                const convertedArray = _createEachItemEntity(valuesForOneControl, uiControlType);
                _saveArrayElFormData(formDataFieldName, convertedArray);
            } else
                alert('This simple array type is not yet supported ' + uiControlType);
        }
    }

    function _getAllSimpleArrayTypeInputsToFormData(baseEl) {
        // there can be more than one set of multi inputs per container -> we need to group them per field name
        let allUiControlsOfArrayType = [];

        let allArrayEls = baseEl.find('.simpleArrayTypeControl');
        allArrayEls.each(function (index, item) {
            let formDataFieldName;
            const oneArrayEl = $(item);
            const uiControlType = oneArrayEl.data("uicontroltype");
            const allFormEls = oneArrayEl.find(':input').not(':checkbox');

            let allValuesForOneControl = [];
            for (let i = 0; i < allFormEls.length; i++) {
                const oneFormEl = allFormEls[i];
                const oneInputEl = $(oneFormEl);
                formDataFieldName = oneInputEl.data("fieldName");
                const val = oneInputEl.val();
                allValuesForOneControl.push(val);
            }

            const allDataForOneControl = {};
            allDataForOneControl['fieldName'] = formDataFieldName;
            allDataForOneControl['type'] = uiControlType;
            allDataForOneControl['values'] = allValuesForOneControl;

            allUiControlsOfArrayType.push(allDataForOneControl);
        });

        return allUiControlsOfArrayType;
    }

    function _createEachItemEntity(valuesForOneControl, uiControlType) {
        const convertedArray = [];
        let fieldName;
        if (uiControlType === 'Text')
            fieldName = 'itemText';
        else if (uiControlType === 'Number')
            fieldName = 'itemNumber';
        else if (uiControlType === 'DateTime')
            fieldName = 'itemDateTime';
        else {
            alert('This uicontrol type for simple array type is not yet supported ' + uiControlType);
            return convertedArray;
        }

        for (let i = 0; i < valuesForOneControl.length; i++) {
            const val = valuesForOneControl[i];
            if (val !== undefined && val !== null && val !== "") {
                const oneItemAsObjLit = {};
                oneItemAsObjLit[fieldName] = val;
                convertedArray.push(oneItemAsObjLit);
            }
        }
        return convertedArray;
    }

    function _createEachExpenseEntity(outerArray, expenseFieldArray) {
        const convertedArray = [];
        for (let i = 0; i < outerArray.length; i++) {
            const oneItemAsAnArray = outerArray[i];
            const oneItemAsObjLit = {};
            for (let j = 0; j < oneItemAsAnArray.length; j++) {
                oneItemAsObjLit[expenseFieldArray[j]] = oneItemAsAnArray[j];
            }
            const converted = Number(oneItemAsObjLit['amount']);
            if ($.isNumeric(converted))
                oneItemAsObjLit['amount'] = converted;
            else
                oneItemAsObjLit['amount'] = 0;

            oneItemAsObjLit['id'] = '' + i;  // add a unique id that can be used in other steps where we need to add data to an expense item (like a file upload doc)

            convertedArray.push(oneItemAsObjLit);
        }
        return convertedArray;
    }

    function _saveArrayElFormData(formDataFieldName, outerArray) {
        if (outerArray === undefined)
            return;

        if (itsPathToData === undefined || itsPathToData === null)
            itsFormData[formDataFieldName] = outerArray;
        else {
            if (itsFormData[itsPathToData] === undefined)
                itsFormData[itsPathToData] = {};

            itsFormData[itsPathToData][formDataFieldName] = outerArray;
        }
    }

    async function _runDecisionService(decisionServiceEngine, payload) {
        try {
            const event = { "input": payload, "stage": payload[0].currentStageNumber };
            corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.BEFORE_DS_EXECUTION, event);

            const configuration = { logLevel: 0 };
            // const configuration = { logLevel: 1 };
            const t1 = performance.now();
            // console.log("** About to call decision service");
            const result = await decisionServiceEngine.execute(payload, configuration);
            // console.log("** Done with call decision service");
            const t2 = performance.now();
            const event2 = {
                "output": result,
                "execTimeMs": t2 - t1,
                "stage": payload[0].currentStageNumber
            };

            if (result.corticon !== undefined) {
                if (result.corticon.status === 'success') {
                    const newStepUI = result.payload[0];
                    if (newStepUI.currentStageDescription !== undefined && newStepUI.currentStageDescription !== null)
                        event2["stageDescription"] = newStepUI.currentStageDescription;
                }
                else
                    alert('There was an error executing the rules.\n' + JSON.stringify(result, null, 2));

                corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.NEW_DS_EXECUTION, event2);
                return result;
            }
            else
                alert('There was an error executing the rules.\n' + JSON.stringify(result, null, 2));
        }
        catch (e) {
            alert('There was an exception executing the rules ' + e);
        }
    }

    // Public interface
    return {
        startDynUI: startDynUI,
        processNextStep: processNextStep,
        processPrevStep: processPrevStep
    }
    function _saveEnteredInputsToFormData(baseEl) {
        _saveNonArrayInputsToFormData(baseEl);
        _saveArrayTypeInputsToFormData(baseEl);
        corticon.dynForm.raiseEvent(corticon.dynForm.customEvents.NEW_FORM_DATA_SAVED, itsFormData);

        // Handle 'MultiText' controls
        let multiTextEls = baseEl.find('.multiTextInputContainer');

        multiTextEls.each(function (index, item) {
            const oneArrayEl = $(item);
            let allFormEls = oneArrayEl.find(':input').not(':checkbox');
            let formDataFieldName;
            let outerArray = [];
            let innerArray = [];
            for (let i = 0; i < allFormEls.length; i++) {
                const oneFormEl = allFormEls[i];
                const oneInputEl = $(oneFormEl);
                formDataFieldName = oneInputEl.data("fieldName");
                const val = oneInputEl.val();
                innerArray.push(val);
            }
            outerArray.push(innerArray);

            if (outerArray.length !== 0) {
                let uiControlType = $(this).find('input').data("uicontroltype"); if (uiControlType === 'MultiText') {
                    const textFieldArray = ['textInput'];
                    const convertedArray = _createEachTextEntity(outerArray, textFieldArray);
                    _saveArrayElFormData(formDataFieldName, convertedArray, itsPathToData); // Pass itsPathToData
                }
                //  else
                //        alert('This complex array type is not yet supported ' + uiControlType);
            }
        });

    }

}

