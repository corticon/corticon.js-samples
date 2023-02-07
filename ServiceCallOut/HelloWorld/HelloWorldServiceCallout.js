const hello = {
    func: 'sayHelloFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function writes a greeting message into the Hello entity.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'hello'}
};

function sayHelloFct(corticonDataManager) {
	//runTimeError();
	//const syntaxError;
	
	const hour = new Date().getHours();
	let postfix = 'night';		
	if ( hour < 12 )
	   postfix = "morning";
	else if ( hour < 18 )
	  postfix = "afternoon";
	else if ( hour < 21 )
	  postfix = "evening";

    const entities = corticonDataManager.getEntitiesByType('Hello');
    entities.forEach(entity => {
    	entity.message = 'Hello World from SCO.  I wish you a good ' + postfix;
    });
}

exports.sayHelloFct = sayHelloFct;
