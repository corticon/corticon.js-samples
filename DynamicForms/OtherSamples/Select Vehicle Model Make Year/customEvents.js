//https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events

const BEFORE_START = "beforeStart";
const AFTER_START = "afterStart";
const AFTER_DONE = "afterDone";
const NEW_STEP = "newStep";
const NEW_FORM_DATA_SAVED = "newFormDataSaved"; // Some data were saved to the form data storage
const NEW_DS_EXECUTION = "newDSExecution"; // A decision service was executed - data will contain the output
const BEFORE_DS_EXECUTION = "beforeDSExecution"; // A decision service is about to be executed - data will contain the input

function addCustomEventHandler ( name, fct ) {
    // Listen for the event on the body element for the lack of a better element !.
    document.body.addEventListener(name, fct, false);
}

function raiseEvent( name, data ) {
    const event = new Event(name);
    // I found that on some browsers, I couldn't get at detail as documented const event = new CustomEvent('build', { detail: elem.dataset.time });
    // So using my own field to store the data
    event.theData = data;
    document.body.dispatchEvent(event);
}
