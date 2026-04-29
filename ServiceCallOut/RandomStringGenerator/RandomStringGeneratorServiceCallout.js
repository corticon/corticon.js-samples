const randomStringGenerator = {
    func: 'generateRandomStringFct',
    type: 'ServiceCallout',
	description: {'en_US': 'This function writes a random string into a configured target attribute.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'randomStringGenerator'}
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomStringFct(corticonDataManager) {
	const logger = corticonDataManager.getLogger();
	logger.logDebug('Start SCO generateRandomString');
	logPayloadSnapshot(corticonDataManager, logger);
	const configuration = getConfiguration(corticonDataManager, logger);
	if ( configuration === null )
		return;

	const entities = corticonDataManager.getEntitiesByType(configuration.entityName);
	entities.forEach(entity => assignRandomString(entity, configuration, logger));
}

exports.generateRandomStringFct = generateRandomStringFct;

function logPayloadSnapshot(corticonDataManager, logger) {
	try {
		const allEntities = corticonDataManager.getAllEntities();
		const payloadSnapshot = [];
		allEntities.forEach(entity => payloadSnapshot.push(serializeValue(entity, corticonDataManager, new WeakSet())));
		logger.logError(`generateRandomString: payload snapshot at start ${JSON.stringify(payloadSnapshot, null, 2)}`);
	}
	catch ( e ) {
		logger.logError(`generateRandomString: failed to log payload snapshot ${e}`);
	}
}

function getConfiguration(corticonDataManager, logger) {
	const configuration = corticonDataManager.getConfiguration();
	logger.logError(`generateRandomString: serviceCallout configuration ${JSON.stringify(configuration)}`);
	if ( typeof configuration.entityName !== 'string' || configuration.entityName.length === 0 ) {
		logger.logError('generateRandomString: missing configuration property entityName');
		return null;
	}

	if ( typeof configuration.targetAttributeName !== 'string' || configuration.targetAttributeName.length === 0 ) {
		logger.logError('generateRandomString: missing configuration property targetAttributeName');
		return null;
	}

	if ( !Number.isInteger(configuration.requestedLength) || configuration.requestedLength <= 0 ) {
		logger.logError('generateRandomString: requestedLength configuration must be a positive integer');
		return null;
	}

	return configuration;
}

function assignRandomString(entity, configuration, logger) {
	const randomValue = buildRandomString(configuration.requestedLength);
	entity[configuration.targetAttributeName] = randomValue;

	logger.logDebug(`generateRandomString: wrote ${randomValue.length} characters to ${configuration.targetAttributeName}`);
}

function buildRandomString(requestedLength) {
	let randomValue = '';
	for ( let index = 0; index < requestedLength; index++ ) {
		const alphabetIndex = Math.floor(Math.random() * alphabet.length);
		randomValue += alphabet[alphabetIndex];
	}

	return randomValue;
}

function serializeValue(value, corticonDataManager, seenObjects) {
	if ( value === null || value === undefined )
		return value;

	if ( typeof value !== 'object' )
		return value;

	const operators = corticonDataManager.getOperator();
	if ( operators.decimal.isDecimal(value) )
		return operators.decimal.outputToJson(value);

	if ( operators.dateTime.isDateTime(value) )
		return operators.dateTime.outputToJson(value);

	if ( operators.date.isDate(value) )
		return operators.date.outputToJson(value);

	if ( seenObjects.has(value) )
		return '[Circular]';

	seenObjects.add(value);

	if ( Array.isArray(value) )
		return value.map(item => serializeValue(item, corticonDataManager, seenObjects));

	const serializedObject = {};
	Object.entries(value).forEach(([key, entryValue]) => {
		if ( key === 'dataMgr' )
			return;

		serializedObject[key] = serializeValue(entryValue, corticonDataManager, seenObjects);
	});

	return serializedObject;
}