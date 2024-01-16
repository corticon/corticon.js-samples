const translations = require('./Translations');

const localizeTexts = {
    func: 'localizeTextsFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function updates various UI elements for the specified language.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'localizeTexts'}
};

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

// A utility function to detect if we are in browser.
const isBrowserFct = new Function('try {return this===window;}catch(e){ return false;}');

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
	    const requestedLanguage = getPreferredLanguage(theUI);
	    logger.logDebug('Requesting translation for language: ' + requestedLanguage);
	    let theLanguage;
	    if (requestedLanguage.startsWith('fr'))
	    	  theLanguage = 'fr';
	    else
			    theLanguage = 'en';
	
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
	translations.getEnglishStrings(englishStrings);	
	allLanguageStrings.set('en', englishStrings);

	const frenchStrings = {};	
	translations.getFrenchStrings(frenchStrings);	
	allLanguageStrings.set('fr', frenchStrings);
}
