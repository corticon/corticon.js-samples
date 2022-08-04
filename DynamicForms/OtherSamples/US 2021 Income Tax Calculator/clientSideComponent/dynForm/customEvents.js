corticon.util.namespace( "corticon.dynForm" );


(function () {
//https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events

    corticon.dynForm.customEvents = {
        "BEFORE_START": "beforeStart",
        "AFTER_START": "afterStart",
        "AFTER_DONE": "afterDone",
        "NEW_STEP": "newStep",
        "NEW_FORM_DATA_SAVED": "newFormDataSaved", // Some data were saved to the form data storage
        "NEW_DS_EXECUTION": "newDSExecution", // A decision service was executed - data will contain the output
        "BEFORE_DS_EXECUTION": "beforeDSExecution", // A decision service is about to be executed - data will contain the input
    }

    corticon.dynForm.addCustomEventHandler = function  ( name, fct ) {
        // Listen for the event on the body element for the lack of a better element !.
        document.body.addEventListener(name, fct, false);
    }

    corticon.dynForm.raiseEvent = function ( name, data ) {
        const event = new Event(name);
        // I found that on some browsers, I couldn't get at detail as documented const event = new CustomEvent('build', { detail: elem.dataset.time });
        // So using my own field to store the data
        event.theData = data;
        document.body.dispatchEvent(event);
    }
})(); // Immediately invoke to have the equivalent of a static class

