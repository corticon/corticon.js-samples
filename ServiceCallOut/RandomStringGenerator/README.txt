This sample only provides the JavaScript service callout. The vocabulary, ruleflow, and tests
should be created in Corticon Studio.

This version keeps only three things dynamic through the decision service configuration under
serviceCallout:
- entityName
- targetAttributeName
- requestedLength

Example configuration:

const configuration = {
	logLevel: 0,
	serviceCallout: {
		entityName: 'MyEntity',
		targetAttributeName: 'myStringAttribute',
		requestedLength: 20
	}
};

Behavior:
- The SCO retrieves entities using entityName.
- It generates a random string using requestedLength.
- It writes the generated string to targetAttributeName on every entity of that type.

So the vocabulary contract is now:
- The entity type name is dynamic and comes from serviceCallout.entityName.
- The destination attribute name is dynamic and comes from serviceCallout.targetAttributeName.
- The generated length is dynamic and comes from serviceCallout.requestedLength.
- No helper input attributes are required on the entity.

Example for assigning EligibilityCase.policyContextId a 20-character value:

serviceCallout configuration:

const configuration = {
	logLevel: 0,
	serviceCallout: {
		entityName: 'EligibilityCase',
		targetAttributeName: 'policyContextId',
		requestedLength: 20
	}
};

Example payload entity:

{
	"EligibilityCase": [
		{
			"policyContextId": ""
		}
	]
}