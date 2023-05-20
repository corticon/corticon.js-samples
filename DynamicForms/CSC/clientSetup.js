let currentDecisionServiceEngine;
let allInputData = [];
let inputData; // per decision service initial data set (external data)
let itsCurrentLanguage = 'english';
let itsQuestionnaireKey = '0';
let itsFlagRenderWithKui = false;

const itsTracer = new Tracer();
const itsStepsController = new corticon.dynForm.StepsController();

function processSwitchSample(selectObject) {
    const index = selectObject.value;
    setDataForCurrentSample(index);
    saveStateToLocalStorage('CorticonSelectedSample', index);
}

function setDataForCurrentSample(index) {
    currentDecisionServiceEngine = window.corticonEngines[index];
    inputData = allInputData[index];
    itsQuestionnaireKey = index;

    if ( index === "5" || index === "7" ) {
        $('#languageSelectId').html('');
        $('#languageSelectId').append('<option value="english">English</option>');
        if ( index === "5" )
            $('#languageSelectId').append('<option value="italian">Italiano</option>');
        else
            $('#languageSelectId').append('<option value="french">French</option>');
        $("#languageContainerId").show();
    }
    else
        $("#languageContainerId").hide();
}

function processSwitchLanguage(selectObject) {
    itsCurrentLanguage = selectObject.value;
}

function processClickStart() {
    const baseDynamicUIEl = $('#dynUIContainerId');
    itsStepsController.startDynUI(baseDynamicUIEl, currentDecisionServiceEngine, inputData, itsCurrentLanguage, itsQuestionnaireKey, itsFlagRenderWithKui);
}

function processClickNext() {
    const baseDynamicUIEl = $('#dynUIContainerId');
    itsStepsController.processNextStep(baseDynamicUIEl, currentDecisionServiceEngine, itsCurrentLanguage);
}

function processClickPrev() {
    const baseDynamicUIEl = $('#dynUIContainerId');
    itsStepsController.processPrevStep(baseDynamicUIEl, currentDecisionServiceEngine, itsCurrentLanguage);
}

function saveStateToLocalStorage(key, value) {
    // save it in local storage for restore  on reload
    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        // Some browser in private mode may throw exception when using local storage
    }
}

function processShowTrace() {
    const traceEl = $('.allTracesContainer');
    traceEl.show();
    $("#hideTraceId").show();
    $("#showTraceId").hide();
    saveStateToLocalStorage('CorticonShowDSTrace', true);
}

function processHideTrace() {
    const traceEl = $('.allTracesContainer');
    traceEl.hide();
    $("#showTraceId").show();
    $("#hideTraceId").hide();
    saveStateToLocalStorage('CorticonShowDSTrace', false);
}

function processUseHtml() {
    $("#useHtmlId").hide();
    $("#useKuiId").show();
    saveStateToLocalStorage('CorticonUseKui', false);
    itsFlagRenderWithKui = false;
}

function processUseKui() {
    $("#useHtmlId").show();
    $("#useKuiId").hide();
    saveStateToLocalStorage('CorticonUseKui', true);
    itsFlagRenderWithKui = true;
}

function setupInitialInputData() {
    const inDataEmpty = {};
    const inDataCanonical = inDataEmpty;
    const inDataTaxes = inDataEmpty;
    const inDataValidation = inDataEmpty;
    const inJobApplication = inDataEmpty;
    const inMulticontainer = inDataEmpty;
    const inI18N = inDataEmpty;

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
    allInputData.push(inI18N);

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

    const useKui = window.localStorage.getItem('CorticonUseKui');
    if ( useKui !== null  ) {
        if ( useKui === 'true' )
            processUseKui();
        else if ( useKui === 'false' )
            processUseHtml();
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
        $("#useHtmlId").hide();
        $("#useKuiId").hide();

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
        if ( itsFlagRenderWithKui )
            $("#useHtmlId").show();
        else
            $("#useKuiId").show();
    });
});
