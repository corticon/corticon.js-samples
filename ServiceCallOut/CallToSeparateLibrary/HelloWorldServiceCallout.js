const utility = require('./Util');

const hello = {
    func: 'sayHelloFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function writes a greeting message into the Hello entity'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'hello'}
};

function sayHelloFct(corticonDataManager) {
    console.log('XXXXXXXXXXX pass 1');
	
	let postfix;
	try {
		postfix = utility.getPeriodOfDayFromCurrentTime();
	}
	catch ( e ) {
		postfix = e;
	}  
    const entities = corticonDataManager.getEntitiesByType('Hello');
    entities.forEach(entity => {
    	entity.message = 'Hello World from SCO.  I wish you a good ' + postfix;
    });
}

exports.sayHelloFct = sayHelloFct;
