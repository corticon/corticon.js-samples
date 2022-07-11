# Kinvey Flex Sample https://www.progress.com/kinvey

A sample Kinvey Flex Service using a Corticon.js bundle. Kinvey Flex services are regular node applications using the flex-services-sdk. 

Verbose guides to Kinvey Flex here:

* https://www.progress.com/blogs/getting-started-with-kinvey-flexservices

* https://devcenter.kinvey.com/nativescript/guides/flex-services


## Initialise service and test locally: 
```
<Create account, app, Flex Service in Kinvey>
npm install -g kinvey-cli
npm install
kinvey init
kinvey profile use <PROFILENAME>
kinvey flex init
<Choose Org>
node .
```

HTTP POST to http://localhost:10001/_flexFunctions/postCorticonDemo

Headers:
```
Content-Type:application/json
X-Kinvey-API-Version:5
Authorization:Basic 
Y29ydGljb25kZW1vOmNvcnRpY29uZGVtbw==
X-Kinvey-App-Metadata:{ "_id" : "kid_SyiyiVK_X", "appsecret" : "16ce8459c15a4b3892728f3465bddbe8", , "baasUrl" : "https://baas.kinvey.com" }
```
Sample JSON payload
```
{
	"__metadataRoot": {
		"#locale": ""
	},
	"Objects": [
		{
		"Age": 22,
		"Gender": "male",
		"YearsDriving": 2,
		"DamageWaiver": "Full",
		"__metadata": {
			"#type": "Applicant",
			"#id": "Applicant_id_1"
			}
		}
	]   
}
```

## To deploy the Flex service to Kinvey:
```
kinvey flex deploy
<Bump version in package.json when redeploying>
kinvey flex status 
<Create "Custom Endpoint" in Kinvey Console and use Flex service - test in "API Console">
```

![Kinvey Console](/Kinvey/CorticonAPIConsole.png)

