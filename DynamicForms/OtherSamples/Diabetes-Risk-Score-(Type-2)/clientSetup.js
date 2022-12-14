let currentDecisionServiceEngine;
let allInputData = [];
let inputData; // per decision service initial data set (external data)
let itsCurrentLanguage = 'english';
let itsQuestionnaireKey = '0';

const itsTracer = new Tracer();
const itsStepsController = new corticon.dynForm.StepsController();

function processSwitchSample(selectObject) {
    const index = selectObject.value;
    setDataForCurrentSample(index);
    saveStateSelectedSample(index);
}

function setDataForCurrentSample(index) {
    currentDecisionServiceEngine = window.corticonEngines[index];
    inputData = allInputData[index];
    itsQuestionnaireKey = index;

    if ( index === "5" )
        $("#languageContainerId").show();
    else
        $("#languageContainerId").hide();
}

function saveStateSelectedSample(index) {
    // save it in local storage for restore on reload
    try {
        window.localStorage.setItem('CorticonSelectedSample', index);
    } catch (e) {
        // Some browser in private mode may throw exception when using local storage
    }
}

function processSwitchLanguage(selectObject) {
    itsCurrentLanguage = selectObject.value;
}

function processClickStart() {
    const baseDynamicUIEl = $('#dynUIContainerId');
    itsStepsController.startDynUI(baseDynamicUIEl, currentDecisionServiceEngine, inputData, itsCurrentLanguage, itsQuestionnaireKey);
}

function processClickNext() {
    const baseDynamicUIEl = $('#dynUIContainerId');
    itsStepsController.processNextStep(baseDynamicUIEl, currentDecisionServiceEngine, itsCurrentLanguage);
}

function processClickPrev() {
    const baseDynamicUIEl = $('#dynUIContainerId');
    itsStepsController.processPrevStep(baseDynamicUIEl, currentDecisionServiceEngine, itsCurrentLanguage);
}

function saveStateButton(show) {
    // save it in local storage for restore  on reload
    try {
        window.localStorage.setItem('CorticonShowDSTrace', show);
    } catch (e) {
        // Some browser in private mode may throw exception when using local storage
    }
}

function processShowTrace() {
    const traceEl = $('.allTracesContainer');
    traceEl.show();
    $("#hideTraceId").show();
    $("#showTraceId").hide();
    saveStateButton(true);
}
function processHideTrace() {
    const traceEl = $('.allTracesContainer');
    traceEl.hide();
    $("#showTraceId").show();
    $("#hideTraceId").hide();
    saveStateButton(false);
}
function setupInitialInputData() {
    const inDataEmpty = {};
    const inDataCanonical = inDataEmpty;
    const inDataTaxes = inDataEmpty;
    const inDataValidation = inDataEmpty;
    const inJobApplication = inDataEmpty;
    const inMulticontainer = inDataEmpty;

    const inDataReuseSubflow = {};
    inDataReuseSubflow.reusingSubflows = {};
    inDataReuseSubflow.reusingSubflows.SubflowField2 = '0';

    const inDataClaim = {};
    inDataClaim.claim = {};
    inDataClaim.claim.policyType = 'Individual';

    // Must correspond with the order of the DS inclusion
    allInputData.push(inDataCanonical);
    allInputData.push(inDataValidation);
    allInputData.push(inDataTaxes);
    allInputData.push(inDataClaim);
    allInputData.push(inDataReuseSubflow);
    allInputData.push(inJobApplication);
    allInputData.push(inMulticontainer);

    inputData = allInputData[0];
}

function restoreUIState() {
    const show = window.localStorage.getItem('CorticonShowDSTrace');
    if ( show !== null  ) {
        if ( show === 'true' )
            processShowTrace();
        else if ( show === 'false' )
            processHideTrace();
    }

    const selectedSample = window.localStorage.getItem('CorticonSelectedSample');
    if ( selectedSample !== null ) {
        const selector = `#sampleSelectId option[value='${selectedSample}']`
        $(selector).prop('selected', true);
        setDataForCurrentSample(selectedSample);
    }
}

$( document ).ready(function() {
    currentDecisionServiceEngine = window.corticonEngines[0];

    setupInitialInputData();

    itsTracer.setupTracing();

    restoreUIState();

    corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.AFTER_START, ( event ) => {
        $("#nextActionId").show();
        $("#startActionId").hide();
        $("#sampleSelectId").attr('disabled', true);

        if ( event !== undefined && event !== null ) {
            if ( event.theData['historyEmpty'] )
                $("#prevActionId").hide();
            else
                $("#prevActionId").show();
        }
    });

    corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.NEW_STEP, () => {
        $("#prevActionId").show();
    });

    corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.FORM_DONE, () => {
        $("#prevActionId").hide();
    });
    corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.BACK_AT_FORM_BEGINNING, () => {
        $("#prevActionId").hide();
    });

    corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.AFTER_DONE, () => {
        $("#nextActionId").hide();
        $("#prevActionId").hide();  // needed when continuing to a sample after finishing a sample
        $("#startActionId").show();
        $('#dynUIContainerId').html('<div style="margin: 2em; font-size: larger;">&nbsp;<i class="bi bi-check-circle"></i>All Done</div>');
        $("#sampleSelectId").attr('disabled', false);
    });
});
