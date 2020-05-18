//NB: this is the bundle created by parcel in CorticonJS Studio plus a prepended: var parcelRequire = undefined; so the stricter Deno environment doesn't trip over.
import * as DS from "https://raw.githubusercontent.com/steinerj/node-cars-decision-service/master/decisionServiceBundleNoGlobalRequire.js";

const configuration = { logLevel: 1 };
const driverDetailsPayload = {
	__metadataRoot: {
		"#locale": ""
	},
	Objects: [{
		Age: 22,
		Gender: "male",
		YearsDriving: 2,
		DamageWaiver: "Full",
		Premium: null,
		__metadata: {
				"#type": "Applicant",
				"#id": "Applicant_id_1"
			}
		}
	]   
};

/*
Workaround until we have a true ES module.
Deno is an isomorophic JS/TS env and it provides a global window object to that end.
The parcel.js loader in the Corticon bundle thinks it's running in a browser and 
therefore attaches itself to the window object (not sure why nested)...
Could probably also do something along these lines:
https://github.com/denoland/deno/blob/master/std/node/README.md#commonjs-module-loading
or whatever https://jspm.io/ does.
*/
const dsResult = window.execute.execute(driverDetailsPayload, configuration);

console.log(JSON.stringify(dsResult));