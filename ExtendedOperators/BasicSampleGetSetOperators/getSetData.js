/*
This sample shows the basic working features of get and set custom operators in Corticon.js.
These operators are implemented by a custom function you write.  In this sample, we
have implemented getSessionData and setSessionData to be used with the corresponding
get and set operators.

The names of the custom functions to be used in Corticon studio when implementing a rule
using either get or set operators is specified in the module.exports section below.
This is called the public name.  The name of the internal function is private, though they
can be the same.
This provides 2 main capabilities:
1) You can provide a more user-friendly public name, for example, one that contains space
   like "from session data".
2) It is a level of indirection so that you can change the private function name without
   having to change the rules.

Implementation notes:

For Date, DateTime or Decimal datatypes we store them as a JSON String when calling set,
and we convert them back to the proper object when calling get.  See implementation
below showing how to use the helper object to do that.

The session data is stored in memory in a Map object.  For a real implementation, you
would probably want to use a browser store like "Local Storage".

Please refer to the online documentation for additional detailed explanations.
 */

const sessionData = new Map();

function getVarData(helper, name) {
    return name;
}

function getSessionData(helper, name) {
    // First we verify value exists for the key
    if (!sessionData.has(name))
        return 'ERROR - no session data for ' + name;

    //Second we verify if the key exists but value is null
    if (sessionData.get(name) == null)
        return null;

    // We are returning the value as is except for items like Date, DateTime or Decimal
    // as these are stored in a text representation and as Corticon.js expects them
    // as specific objects.
    if (name === 'key4') // example showing how to construct a DateTime
        return helper.dateTime.constructDateTime(sessionData.get(name));
    else if (name === 'key6') // example showing how to construct a Date
        return helper.date.constructDate(sessionData.get(name));
    else if (name === 'key5') // example showing how to construct a Decimal
        return helper.decimal.constructDecimal(sessionData.get(name));
    else
        return sessionData.get(name);
}

function setSessionData(helper, name, value) {
    console.log("Custom function setSessionData called for " + name);
    if (value === null) {
        sessionData.delete(name);
        sessionData.set(name, value);
    } else {
        if (name === 'key4') // example showing how to construct a DateTime
            sessionData.set('key4', helper.dateTime.outputToJson(value));
        if (name === 'key6') // example showing how to construct a Date
            sessionData.set('key6', helper.date.outputToJson(value));
        else if (name === 'key5') // example showing how to construct a Decimal
            sessionData.set('key5', helper.decimal.outputToJson(value));
        else
            sessionData.delete(name);

        sessionData.set(name, value);
    }
}

// This is where we specify the public names to be used in Corticon.js studio when using
// either the get or set operators.
module.exports = {
    getSessionData,
    setSessionData: setSessionData
};
