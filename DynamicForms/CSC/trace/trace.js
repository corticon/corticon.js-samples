function Tracer () {
    // private section
    let itsStagesTrace = [];

    function setupTracing() {
        corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.BEFORE_START, _clearTraceData );
        corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.NEW_FORM_DATA_SAVED, _traceFormData);
        corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.BEFORE_DS_EXECUTION, _traceDecisionServiceInputs);
        corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.NEW_DS_EXECUTION, _traceDecisionServiceResults);
    }

    function _clearTraceData() {
        document.getElementById("decisionServiceInputId").value = "";
        document.getElementById("decisionServiceResultId").value = "";
        document.getElementById("formDataId").value = "";

        itsStagesTrace = [];
        $("#traceHistoryId").empty();
    }

    function _traceDecisionServiceInputs ( event ) {
        const theData = event.theData;
        const input = theData.input;
        const stage = theData.stage;
        const index = itsStagesTrace.length;
        const x = JSON.stringify(input, null, 2);
        itsStagesTrace[index] = { "input": x, "result": null, "formData": null };
        _showDecisionServiceInputs(x);
        _addStageInHistory(stage, index);
    }

    function _traceDecisionServiceResults (event) {
        const theData = event.theData;
        const result = theData.output;
        const execTimeMs = theData.execTimeMs;

        // we assume there was a call to trace the input and thus a new element in history
        const index = itsStagesTrace.length - 1;
        itsStagesTrace[index].result = JSON.stringify(result, null, 2);
        itsStagesTrace[index].timing = Math.round(execTimeMs);

        _showDecisionServiceResults ( itsStagesTrace[index].result, itsStagesTrace[index].timing );
    }

    function _traceFormData(event) {
        const theData = event.theData;
        const index = itsStagesTrace.length - 1;
        const x = JSON.stringify(theData, null, 2);
        itsStagesTrace[index].formData = x;
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

        const newTitle = "Stages History: " + itsStagesTrace.length + " stages";
        $("#traceHistorySummaryId").prop("title", newTitle);
    }

    function _switchToSavedStage(index, theEl) {
        _removeHighlightedStage();
        $(theEl).addClass("activeStageInTrace");
        const oneTrace = itsStagesTrace[index];
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

    return {
        setupTracing: setupTracing
    }
}
