# Custom JavaScript functions

Corticon.js provides data access operators in a mechanism that will execute custom JavaScript functions. The custom functions are accessed as a group of built-in operators available from Studio's Rule operator tree under **General > Functions** as standalone GET and SET operators for each Corticon.js data type:\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/fvh1629311110121.image?\_LANG=enus)

Each `get` operator works the same way; only the returned data type is different.

Each `set` operator works in a fashion similar to the `get` operators yet each has an additional parameter, the _value_ to set. Set operators do not return any data as they are void operators.

### The project for **SampleJS Get Set Operators** <a href="#d2058e88" id="d2058e88"></a>

The sample project provides JavaScript provides examples of the operators as well as Rulesheets, a RuleFlow, and a Ruletest that demonstrates the features.

### The sample's Rulesheet getData <a href="#d2058e99" id="d2058e99"></a>

A custom `get` function takes two parameters:

1. The name of the custom function to call.
2. A string parameter. For multiple parameters, the JSON string can encapsulate all the parameters to pass to the custom function.

The sample Rulesheet `getData.ers` shows each data type with data to fetch.

![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/elf1629316701131.image?\_LANG=enus)

For example, to call the custom function `getData` with parameter `key2` using the `getString` operator, the result is stored in the string attribute, `Ent1.str2`.

### The sample's Rulesheet setData <a href="#d2058e143" id="d2058e143"></a>

![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/mns1629315531750.image?\_LANG=enus)

A custom `set` function takes three parameters:

1. The name of the custom function to call.
2. A string parameter. If you need to pass more than one parameter, the JSON string can encapsulate all the parameters to pass to the custom function.
3. The value to set. The type of this parameter corresponds to the operator name. For example, `setDateTime`, requires a `DateTime` object.

For example, to call the custom decimal function `setData` with the parameter `key5` using the `setDecimal` operator, use the following action. The result is stored in the string attribute, `Ent1.decimal3`.

### How to set a mock implementation for the Studio tester <a href="#d2058e191" id="d2058e191"></a>

Studio tester runs the Ruleflows and Rulesheets in the context of a local Node.js process. Consequently, it is possible that:

* the production environment data may not be available
* the production context is not available. For example, in studio tester the browser session context or the Serverless function context is not available .

However, you can specify a mock implementation to run local unit tests by appending the implementation to the project. The configuration of the extensions in the sample is in `getSetData.js`:

| <pre><code>const sessionData = new Map();

function getData ( helper, name ) {
	if ( name === 'key4' )  // example showing how to construct a DateTime
		return helper.dateTime.constructDateTime(sessionData.get(name));
	else if ( name === 'key5' ) // example showing how to construct a Decimal
		return helper.decimal.constructDecimal(sessionData.get(name));
	else
		return sessionData.get(name); 
}

function setData ( helper, name, value ) {
	if ( name === 'key4' )  // example showing how to construct a DateTime
		 sessionData.set('key4', helper.dateTime.outputToJson(value));
	else if ( name === 'key5' ) // example showing how to construct a Decimal
		sessionData.set('key5', helper.decimal.outputToJson(value) );
	else
		sessionData.set(name, value); // for all other data we simply store as is.
}

module.exports = { getData, setData }; // export the names to be used in studio</code></pre> |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

This code is appended to the project for testing in Studio.

**To append the extension file to the project:**

1. In Corticon.js Studio, open your project.
2. Click on your project, and then select **Properties**.
3. Select **Corticon.js Extensions**.
4. Click **Add**, and then select your .js implementation file, as illustrated:\
   ![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/aic1629310034311.image?\_LANG=enus)\

5. Click **Apply and Close**.

Note: The functions from this code are not added to a production bundle that is generated by **Package Rules for Deployment**.

### Running the sample's Ruletest <a href="#d2058e283" id="d2058e283"></a>

A Ruleflow puts the setters Rulesheet to process ahead of the getters Rulesheet:

![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/dfy1629896547953.image?\_LANG=enus)

Open the Sample Ruletest, and then run it:

![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/dws1629896738699.image?\_LANG=enus)

### Runtime <a href="#d2058e303" id="d2058e303"></a>

**How to write the implementation of custom functions for runtime**

The implementation file contains the custom functions. You export them using the following syntax:

**`module.exports={name of function as used in rulesheet:reference to custom function};`**

For example:

`module.exports={getSessionData:getSessionData};`

That can be abbreviated to `module.exports ={getSessionData};`

The following code shows a more complete example with two custom functions:

| <pre><code>const sessionData = new Map();
sessionData.set('key1', true);
sessionData.set('key2', 'my session string');
sessionData.set('key3', 12);
																	
function getSessionData ( helper, name ) {
	if ( !sessionData.has(name) )
		return 'ERROR - no session data for ' + name;
	else
		return sessionData.get(name);
}
											
function getMoreData ( helper, name ) {
	return name;
}
																	
 module.exports = { getSessionData, "from session data": getMoreData };							  </code></pre> |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

These definitions enable you to use `getSessionData` `from session data` as custom function names in any of the simplified extended operators.

For example:

![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/ufv1614181387040.image?\_LANG=enus)

### How to specify implementation of custom functions for runtime <a href="#d2058e393" id="d2058e393"></a>

The custom functions are specified at runtime in the configuration object. This allows for complete separation of the custom functions from the rulesheets and their bundles.

The custom functions can be:

* Shared across several decision services.
* Developed and managed with your own build pipeline.

The custom functions are specified in the configuration object using the attribute "**customFunctions**".

This attribute points to an array of object literals. Each object literal contains the information for one custom function.

The syntax of the object literal is: **{ \<name of function as used in rulesheet>: \<reference to custom function> }**

For example, here is the configuration for the custom function examples in previous section:

| <pre><code>const sessionData = new Map();
sessionData.set('key1', true);
sessionData.set('key2', 'my session string');
sessionData.set('key3', 12);
sessionData.set('key4', '2021-02-10T00:00:00.000Z');
sessionData.set('key5', 10.23);
 
function getSessionData ( helper, name ) {
    console.log("Custom function called for " + name);
    if ( name === 'key4' )  // example showing how to construct a DateTime
        return helper.dateTime.constructDateTime(sessionData.get(name));
    else if ( name === 'key5' ) {// example showing how to construct a Decimal
        return helper.decimal.constructDecimal(sessionData.get(name));
    }
    else if ( !sessionData.has(name) )
        return 'ERROR - no session data for ' + name;
    else
        return sessionData.get(name);
    }
 
function setSessionData ( helper, name, value ) {
    if ( name === 'key4' )  // example showing how to construct a DateTime
         sessionData.set('key4', helper.dateTime.outputToJson(value));
    else if ( name === 'key5' ) {// example showing how to construct a Decimal
        sessionData.set('key5', helper.decimal.outputToJson(value) );
    }
    else
        sessionData.set(name, value);
}
 
const configuration = { logLevel: 1,
    customFunctions: [
        { getSessionData: getSessionData },
        { setSessionData: setSessionData }
    ]
};</code></pre> |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

Custom functions are specified at run time in the configuration object. This allows for complete separation of the custom functions from the rulesheets and its bundle.

In particular, the custom functions can easily be:

* Shared across several decision services.
* Developed and managed with your own build pipeline.

The custom functions are specified in the configuration object using the attribute "**customFunctions**".

This attribute points to an array of object literals. Each object literal contains the information for one custom function.

The syntax of the object literal is:

**`{name of function as used in rulesheet:reference to custom function};`**

For example, the following is a configuration for the custom function example:

```
const configuration = {
	logLevel: 0,
	customFunctions: [  {"getSessionData": getSessionData}, 
				 	 {"from data store":getMoreData}
				   ]
};const configuration = {
	logLevel: 0,
	customFunctions: [  {"getSessionData": getSessionData}, 
				 	 {"from data store":getMoreData}
				   ]
};
```

### Get custom function signature <a href="#d2058e517" id="d2058e517"></a>

A custom function must have the following signature:

**`function <functionName> ( helper, name )`**

The name parameter contains the second argument string as entered in the Rulesheet editor.

For example, in the Rulesheet editor:

```
Ent1.str1 = getString('getSessionData','key2')
```

The `getSessionData` custom function name parameter will contain the string `key2`.

The helper function is an object literal containing references to Decimal and DateTime operators.

It has the following syntax:

```
helper={'decimal': <all decimal operators>,
        'dateTime': <all dateTime operators> }
```

### How to write the implementation of custom functions for runtime <a href="#d2058e557" id="d2058e557"></a>

You can implement the body of a custom function with whatever logic your use case requires.

The only constraints are:

* The custom function has the proper signature.
* You return the proper object type. A `getDecimal` call needs to return a Decimal, likewise a `getDateTime` needs to return a DateTime.
* You use the helper object to create or operate on Decimal and DateTime objects.

### Custom GET functions <a href="#d2058e586" id="d2058e586"></a>

The following code shows how to construct and return a decimal and a dateTime:

| <pre><code>const sessionData = new Map();
sessionData.set('key1', true);
sessionData.set('key2', 'my session string');
sessionData.set('key3', 12);
 
function getSessionData ( helper, name ) {
    if ( name === 'key4' ) {  // example showing how to construct a DateTime
        return helper.dateTime.constructDateTime('2021-02-10T00:00:00.000Z');
    }
    else if ( name === 'key5' ) { // example showing how to construct a Decimal
        return helper.decimal.constructDecimal('10.23');
    }
    else if ( name === 'key6' ) { // example showing how to use additional built-in operators like now and addDays
        const dt = helper.dateTime.now();
        const dt2 = helper.dateTime.addDays(dt, 7);
        return dt2;
    }                  
    else if ( !sessionData.has(name) )
        return 'ERROR - no session data for ' + name;
    else
        return sessionData.get(name);
}
 
function getMoreData ( helper, name ) {
    return name;
}	
module.exports = { getSessionData, "from session data": getMoreData };								</code></pre> |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

### Custom SET functions <a href="#d2058e615" id="d2058e615"></a>

Similar to `get` custom functions, notice how the functions are exposed via the configuration object:

| <pre><code>const sessionData = new Map();
sessionData.set('key1', true);
sessionData.set('key2', 'my session string');
sessionData.set('key3', 12);
sessionData.set('key4', '2021-02-10T00:00:00.000Z');
sessionData.set('key5', 10.23);
 
function getSessionData ( helper, name ) {
    console.log("Custom function called for " + name);
    if ( name === 'key4' )  // example showing how to construct a DateTime
        return helper.dateTime.constructDateTime(sessionData.get(name));
    else if ( name === 'key5' ) {// example showing how to construct a Decimal
        return helper.decimal.constructDecimal(sessionData.get(name));
    }
    else if ( !sessionData.has(name) )
        return 'ERROR - no session data for ' + name;
    else
        return sessionData.get(name);
    }
 
function setSessionData ( helper, name, value ) {
    if ( name === 'key4' )  // example showing how to construct a DateTime
         sessionData.set('key4', helper.dateTime.outputToJson(value));
    else if ( name === 'key5' ) {// example showing how to construct a Decimal
        sessionData.set('key5', helper.decimal.outputToJson(value) );
    }
    else
        sessionData.set(name, value);
}
 
const configuration = { logLevel: 1,
    customFunctions: [
        { getSessionData: getSessionData },
        { setSessionData: setSessionData }
    ]
};</code></pre> |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

### Helper functions <a href="#d2058e649" id="d2058e649"></a>

A helper function is an object literal containing references to Decimal and DateTime operators. It has the following syntax:

```
helper = { 'decimal': <all decimal operators>, 'dateTime': <all dateTime operators> }
```

The list of operators is nearly identical to the one listed in the studio operator tree.

Note: The list of operators is nearly identical to the one listed in the studio operator tree. See [DateTime](https://docs.progress.com/bundle/corticon-js-rule-language/page/DateTime.html) and [Decimal](https://docs.progress.com/bundle/corticon-js-rule-language/page/Decimal.html) .

The lists of helper functions are documented in the operator tree. Exceptions are distinguished at the bottom of each list.

**Decimal helper functions**

The helper Decimal functions are as follows:

* `multiply`
* `divide`
* `negated`
* `exponent`
* `add`
* `minus`
* `absVal`
* `floor`
* `ceiling`
* `ln`
* `log`
* `logBase`
* `lessThan`
* `lessThanOrEqual`
* `equal`
* `different`
* `greaterThan`
* `greaterThanOrEqual`
* `min`
* `max`
* `random`
* `toString`
* `toInteger`
* `round`

Exceptions:

* `isDecimal` returns a boolean `true` if the object is a Decimal else returns `false`
* `constructDecimal` returns a Decimal object. It accepts number or strings as parameter. For example, `constructDecimal(10.5)` or `constructDecimal("100000000000000000000000.56789")`
* `outputToJson` returns a string representation suitable for inclusion in a JSON payload.

### DateTime helper functions <a href="#d2058e830" id="d2058e830"></a>

The helper DateTime functions are as follows:

* `lessThan`
* `lessThanOrEqual`
* `equal`
* `notEqualTo`
* `greaterThan`
* `greaterThanOrEqual`
* `addYears`
* `addMonths`
* `addDays`
* `addHours`
* `addMinutes`
* `addSeconds`
* `yearsBetween`
* `monthsBetween`
* `weeksBetween`
* `daysBetween`
* `hoursBetween`
* `minutesBetween`
* `secondsBetween`
* `year`
* `month`
* `day`
* `hour`
* `min`
* `sec`
* `now`
* `dayOfWeek`
* `dayOfYear`
* `getMilliseconds`
* `weekOfMonth`
* `weekOfYear`
* `afterDate`
* `beforeDate`
* `isSameDate`
* `afterTime`
* `beforeTime`
* `isSameTime`

Exceptions:

* `constructDateTime` create a DateTime object. It accepts either a string which has to be an ISO-8601 representation of a DateTime or a long value which represents the time since epoch in milliseconds.
* `isDateTime` returns a boolean `true` if the object is a DateTime else returns `false`
* `outputToJson` returns a string representation in ISO-8601 format as UTC. The string is suitable for inclusion in a JSON payload.
