let allTraces = [];

function clearTraceData() {
    document.getElementById("decisionServiceInputId").value = "";
    document.getElementById("decisionServiceResultId").value = "";
    document.getElementById("formDataId").value = "";

    allTraces = [];
    $("#traceHistoryId").empty();
}
function traceDecisionServiceInputs ( input, stage ) {
    const index = allTraces.length;
    const x = JSON.stringify(input, null, 2);
    allTraces[index] = { "input": x, "result": null, "formData": null };
    showDecisionServiceInputs(x);
    addStageInHistory(stage, index);
}
function showDecisionServiceInputs ( newValue ) {
    document.getElementById("decisionServiceInputId").value = newValue;
}

function removeHighlightedStage() {
    $(".stageInTrace").removeClass("activeStageInTrace");
}

function addStageInHistory(stage, index) {
    removeHighlightedStage();

    let html = `<span>`;
    if ( index !== 0 )
        html += `&rarr;`

    html += `<a class="activeStageInTrace stageInTrace" href="#" onclick="switchToSavedStage(${index}, this)">&nbsp;${stage}&nbsp;</a></span>`

    $("#traceHistoryId").append(html);
}
function switchToSavedStage(index, theEl) {
    removeHighlightedStage();
    $(theEl).addClass("activeStageInTrace");
    const oneTrace = allTraces[index];
    showDecisionServiceInputs(oneTrace.input);
    showDecisionServiceResults(oneTrace.result);
    showSavedFormData(oneTrace.formData);
}
function traceDecisionServiceResults ( result ) {
    const index = allTraces.length - 1;
    const x = JSON.stringify(result, null, 2);
    allTraces[index].result = x;
    showDecisionServiceResults ( x );
}
function showDecisionServiceResults ( newValue ) {
    document.getElementById("decisionServiceResultId").value = newValue;
}
function traceFormData(theData) {
    const index = allTraces.length - 1;
    const x = JSON.stringify(theData, null, 2);
    allTraces[index].formData = x;
    showSavedFormData(x);
}
function showSavedFormData ( newValue ) {
    if ( newValue === null || newValue.length === 0 )
        newValue = "Form Data was not saved at that step";

    document.getElementById("formDataId").value = newValue;
}
