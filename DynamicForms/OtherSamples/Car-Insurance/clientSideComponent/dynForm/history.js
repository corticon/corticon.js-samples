corticon.util.namespace( "corticon.dynForm" );

corticon.dynForm.History = function () {
    let itsHistory = [];

    function setupHistory() {
        corticon.dynForm.addCustomEventHandler( corticon.dynForm.customEvents.AFTER_UI_STEP_RENDERED, storeDecisionServiceInputs2);
    }

    function storeDecisionServiceInputs2 ( event ) {
        const theData = event.theData;
        // We do a deep Copy of the input.  We need it otherwise we get a reference to current input
        const input = JSON.parse(JSON.stringify(theData.input));
        const stage = theData.stage;
        if ( stage === 0 ) // Take care of restart the form after all done (By convention on stage 0 we are restarting)
            itsHistory = [];

        const index = itsHistory.length;
        itsHistory[index] = { "input": input, "stage": stage };
        // - console.log(`History: Stored stage ${stage} at ${index}`);
    }

    function isHistoryEmpty() {
        return itsHistory.length <= 1;
    }

    function getPreviousStageData() {
        // We are maintaining the data about all stages as soon as they are rendered.  This means that the
        // current stage corresponds to the UI currently displayed. We could have stored the stages in history only
        // when moving onto the next stage but it would have complicated the controller as it would have had to maintain
        // the data about that stage until the next button was clicked.  It is just easier to pop twice to get to the
        // previous stage.

        let currentStage;
        if ( itsHistory.length === 1 ) // Trying to do previous when on the very first step.
            currentStage = itsHistory[0];
        else
            currentStage = itsHistory.pop();

        if ( currentStage === undefined ) {
            console.log('Internal error in history.getPreviousStageData: there should be a current stage');
            return;
        }

        const prevStage = itsHistory.pop();
        if ( prevStage === undefined ) {
            console.log('error in history.getPreviousStageData: there should be a previous stage');
            return;
        }

        return prevStage;
    }

    function getRestartHistory () {
        return JSON.stringify(itsHistory);
    }

    function setRestartHistory (savedHistory) {
        itsHistory = JSON.parse(savedHistory);
    }

    return {
        setupHistory: setupHistory,
        getRestartHistory: getRestartHistory,
        setRestartHistory: setRestartHistory,
        getPreviousStageData: getPreviousStageData,
        isHistoryEmpty: isHistoryEmpty
    }
}
