const byebye = {
    func: 'sayByeFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function writes a bye bye message into Hello.message2 entity.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'byebye'}
};

function sayByeFct(corticonDataManager) {
    const entities = corticonDataManager.getEntitiesByType('Hello');
    entities.forEach(entity => {
    	entity.message2 = 'Good bye now from SCO.';
    });
}

exports.sayByeFct = sayByeFct;
