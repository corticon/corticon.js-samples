function getEnglishStrings(allStrings) {

allStrings["cont0_title"] = `I18N and L18N Application Sample`;

allStrings["ctrl0_0_value"] =
`This sample shows a multi-steps form in 2 languages (English/French) using a Service Call Out (SCO).\
<br/><br/>The SCO is invoked as the last step of the flow.<br/>`;

allStrings["cont1_title"] = `A form with 2 text fields`;
allStrings["crtl1_1_label"] = `First Name`;
allStrings["crtl1_1_tooltip"] = `Control 1 tooltip - en`;
allStrings["crtl1_2_label"] = `Last Name`;
allStrings["crtl1_2_tooltip"] = `Control 2 tooltip - en`;

}

function getFrenchStrings(allStrings) {

allStrings["cont0_title"] = `Un example montrant comment traduire une forme dynamique`;

allStrings["ctrl0_0_value"] =
`Cet example montre un formulaire multi-langue (Anglais/Francais) utlisant les Service Call Out (SCO).\
<br/><br/>Le SCO est appelé lors de la dernière étape du flux.<br/>`;

allStrings["cont1_title"] = `Une forme avec 2 champs texte`;
allStrings["crtl1_1_label"] = `Prénom`;
allStrings["crtl1_1_tooltip"] = `Control 1 tooltip - FR`;
allStrings["crtl1_2_label"] = `Nom`;
allStrings["crtl1_2_tooltip"] = `Control 2 tooltip - FR`;

}

module.exports = {
	getEnglishStrings,
	getFrenchStrings
};
