const localizeTexts = {
    func: 'localizeTextsFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function updates the containers title as well as the UI labels and tooltips for the specified language.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'localizeTexts'}
};

// A utility function to detect if we are in browser.
const isBrowserFct = new Function('try {return this===window;}catch(e){ return false;}');

const allLanguageStrings = new Map();

let logger;

function localizeTextsFct(corticonDataManager) {
	logger = corticonDataManager.getLogger();
	logger.logDebug('Start SCO localizeTexts');

	const theStrings = getStringsForCurrentLanguage(corticonDataManager);

	localizeAllContainersTitle(corticonDataManager, theStrings);
	localizeAllUIControls(corticonDataManager, theStrings);
}

function localizeAllContainersTitle(corticonDataManager, theStrings) {
    const theContainers = corticonDataManager.getEntitiesByType('Container');
    theContainers.forEach(oneContainer => {
        let key = oneContainer['titleKey'];
        if ( key !== null ) {
        	if ( theStrings[key] !== undefined ) {
	        	oneContainer['title'] = theStrings[key];
	        	logger.logDebug(`Localizing title for ui container id ${oneContainer['id']} with string ${theStrings[key]}`);
        	}
        }
    });
}

function localizeAllUIControls(corticonDataManager, theStrings) {
    const theUIControls = corticonDataManager.getEntitiesByType('UIControl');
    theUIControls.forEach(oneControl => {
        let key = oneControl['labelKey'];
        if ( key !== null ) {
        	if ( theStrings[key] !== undefined ) {
	        	oneControl['label'] = theStrings[key];
	        	logger.logDebug(`Localizing label for ui control id ${oneControl['id']} with string ${theStrings[key]}`);
        	}
        }
        key = oneControl['tooltipKey'];
        if ( key !== null ) {
        	if ( theStrings[key] !== undefined ) {
	        	oneControl['tooltip'] = theStrings[key];
	        	logger.logDebug(`Localizing tooltip for ui control id ${oneControl['id']} with string ${theStrings[key]}`);
        	}
        }
        if ( oneControl['type'] === 'ReadOnlyText' ) {
        	key = oneControl['valueKey'];
        	if ( key !== null ) {
        		if ( theStrings[key] !== undefined ) {
		        	oneControl['value'] = theStrings[key];
		        	logger.logDebug(`Localizing read-only text for ui control id ${oneControl['id']} with string ${theStrings[key]}`);
	        	}
        	}
        }
    });
}

function getPreferredLanguage(theUI) {
    let requestedLanguage;
	if ( theUI.language !== undefined && theUI.language !== null ) {
		requestedLanguage = theUI.language;
	}
	else {
		if ( isBrowserFct() ) {
			requestedLanguage = navigator.language;
		}
		else {
			requestedLanguage = "en";
		}
	}

    let theLanguage;
    requestedLanguage = requestedLanguage.toLowerCase();
    if (requestedLanguage.startsWith('fr'))
		theLanguage = 'fr';
    else
	    theLanguage = 'en';

	logger.logDebug('Requesting translation for language: ' + requestedLanguage);

	return theLanguage;
}

function getStringsForCurrentLanguage(corticonDataManager) {
    const allUI = corticonDataManager.getEntitiesByType('UI');
    let theStrings;
    allUI.forEach(theUI => {
		const theLanguage = getPreferredLanguage(theUI);
		theStrings = allLanguageStrings.get(theLanguage);
    });

    if ( theStrings === undefined ) {
		theStrings = allLanguageStrings.get('en');
	}

	return theStrings;
}

exports.localizeTextsFct = localizeTextsFct;

/*
	This is where we define all the translatable strings per language
*/
initializeLanguageStringsMap();

function initializeLanguageStringsMap() {
	const englishStrings = {};
	getEnglishStrings(englishStrings);
	allLanguageStrings.set('en', englishStrings);

	const frenchStrings = {};
	getFrenchStrings(frenchStrings);
	allLanguageStrings.set('fr', frenchStrings);
}

function getEnglishStrings(allStrings) {
	allStrings["step0_title"] = 'I18N and L18N Application Sample';
	allStrings["ctrl0_0_value"] = 'This sample shows a multi-steps form in 2 languages (English/French) using a Service Call Out (SCO).<br/><br/>The SCO is invoked as the last step of the flow<br/>';
	allStrings["step1_title"] = 'A step in the form with 2 text fields';
	allStrings["crtl1_1_label"] = 'First Name';
	allStrings["crtl1_1_tooltip"] = 'Control 1 tooltip - en';
	allStrings["crtl1_2_label"] = 'Last Name';
	allStrings["crtl1_2_tooltip"] = 'Control 2 tooltip - en';
}

function getFrenchStrings(allStrings) {
	allStrings["step0_title"] = 'Exemple I18N et L18N';
	allStrings["ctrl0_0_value"] = 'Cet example montre un formulaire multi-langue (Anglais/Francais) utlisant les Service Call Out (SCO).<br/><br/>Le SCO est appelé lors de la dernière étape du flux<br/>';
	allStrings["step1_title"] = 'Une étape de la forme avec 2 champs';
	allStrings["crtl1_1_label"] = 'Prénom';
	allStrings["crtl1_1_tooltip"] = 'Control 1 tooltip - FR';
	allStrings["crtl1_2_label"] = 'Nom';
	allStrings["crtl1_2_tooltip"] = 'Control 2 tooltip - FR';
}
