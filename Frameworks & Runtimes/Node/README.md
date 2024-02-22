# Corticon JavaScript node examples
## Contents
* _simple-express_ - A CorticonJS sample for the node express framework.
* _simple-koa_ - A CorticonJS sample for the node koa framework

Both samples just implement a simple POST route on / where a decisions service payload can be posted

The decision service is meant to model a typical car rental damage waiver insurance programme. It expects driver details such as age, gender, driving experience and the collision damage waiver plan ('Full' or 'Limited'). Its expected output is a calculated premium based on the driver details. To this end, it's highly discriminatory to younger drivers and to drivers identifying as male in particular. All other genders are fine and it's not a binary spectrum.

## Setup
* Checkout and cd to the desire framework subdir
* `npm install`

## Testing
* `node .` 
* Post to http://localhost:3000
* Sample JSON payload:
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

![Postman](/Node/request_postman.png)