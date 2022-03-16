let allTraces = [];

function setupTracing() {
    addCustomEventHandler( BEFORE_START, _clearTraceData );
    addCustomEventHandler( NEW_FORM_DATA_SAVED, _traceFormData);
    addCustomEventHandler( BEFORE_DS_EXECUTION, _traceDecisionServiceInputs);
    addCustomEventHandler( NEW_DS_EXECUTION, _traceDecisionServiceResults);
}

function _clearTraceData() {
    document.getElementById("decisionServiceInputId").value = "";
    document.getElementById("decisionServiceResultId").value = "";
    document.getElementById("formDataId").value = "";

    allTraces = [];
    $("#traceHistoryId").empty();
}

function _traceDecisionServiceInputs ( event ) {
    const theData = event.theData;
    const input = theData.input;
    const stage = theData.stage;
    const index = allTraces.length;
    const x = JSON.stringify(input, null, 2);
    allTraces[index] = { "input": x, "result": null, "formData": null };
    _showDecisionServiceInputs(x);
    _addStageInHistory(stage, index);
}

function _traceDecisionServiceResults (event) {
    const theData = event.theData;
    const result = theData.output;
    const execTimeMs = theData.execTimeMs;

    // we assume there was a call to trace the input and thus a new element in history
    const index = allTraces.length - 1;
    allTraces[index].result = JSON.stringify(result, null, 2);
    allTraces[index].timing = Math.round(execTimeMs);

    _showDecisionServiceResults ( allTraces[index].result, allTraces[index].timing );
}

function _traceFormData(event) {
    const theData = event.theData;
    const index = allTraces.length - 1;
    const x = JSON.stringify(theData, null, 2);
    allTraces[index].formData = x;
    _showSavedFormData(x);
}

function _showDecisionServiceInputs ( newValue ) {
    document.getElementById("decisionServiceInputId").value = newValue;
}

function _removeHighlightedStage() {
    $(".stageInTrace").removeClass("activeStageInTrace");
}

function _addStageInHistory(stage, index) {
    _removeHighlightedStage();

    let html = `<span>`;
    if ( index !== 0 )
        html += `&rarr;`

    html += `<a class="activeStageInTrace stageInTrace" href="#" onclick="_switchToSavedStage(${index}, this)">&nbsp;${stage}&nbsp;</a></span>`

    $("#traceHistoryId").append(html);
}

function _switchToSavedStage(index, theEl) {
    _removeHighlightedStage();
    $(theEl).addClass("activeStageInTrace");
    const oneTrace = allTraces[index];
    _showDecisionServiceInputs(oneTrace.input);
    _showDecisionServiceResults(oneTrace.result, oneTrace.timing);
    _showSavedFormData(oneTrace.formData);
}

function _showDecisionServiceResults ( newValue, execTimeMs ) {
    document.getElementById("decisionServiceResultId").value = newValue;
    $("#execTimeId").html("(" + execTimeMs +"ms)");
}

function _showSavedFormData ( newValue ) {
    if ( newValue === null || newValue.length === 0 )
        newValue = "Form Data was not saved at that step";

    document.getElementById("formDataId").value = newValue;
}


function copyToClipboard (selector) {
    const text = $(selector).val();
    // navigator.permissions.query({name: "clipboard-write"}).then(result => {
    //     if (result.state == "granted" || result.state == "prompt") {
    //         /* write to the clipboard now */
    //         console.log("should work now");
    //         navigator.clipboard.writeText(text).then(function(result) {
    //             /* clipboard successfully set */
    //         }, function(result) {
    //             console.log("Still Could not copy to clipboard - probably no privs to do that in this browser !"+result);
    //         });
    //     }
    // });

    navigator.clipboard.writeText(text).then(function(result) {
        /* clipboard successfully set */
    }, function(result) {
        console.log("Could not copy to clipboard - probably no privs to do that in this browser !"+result);
    });
}
