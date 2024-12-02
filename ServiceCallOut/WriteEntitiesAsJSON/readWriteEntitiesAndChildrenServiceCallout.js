/* See reame.txt for detailed explanations */

// Define the two SCO calls 
const addCustomersWithShoppingCarts = {
    func: 'addCustomersWithShoppingCartsFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function adds the customers with their shopping cart to the in-memory payload.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'addCustomersWithShoppingCarts'}
};

const getShoppingCart = {
    func: 'getShoppingCartForCustomerFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function get the shopping cart and all its associated items for all the customers in the in-memory payload.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'getShoppingCart'}
};

// implement the SCO calls
async function addCustomersWithShoppingCartsFct(corticonDataManager) {
	const logger = corticonDataManager.getLogger();
	const payload = [
		{ 
		"Name": "Larry Hungry",
        "shoppingCartAsJson": "not set yet",
		"ShoppingCart": {
			"totalAmount": 0,
			"id": "72084720",
			"Item": [
				{
					"price": "15.00",
					"name": "Chicken",
					"barCode": "01-380-12345"
				},
				{
					"price": "4.50",
					"name": "Milk",
					"barCode": "33-100-00001"
				},
				{
					"price": "3.50",
					"name": "Eggs",
					"barCode": "32-300-23456"
				}
			]
		}
    },
	{
		"Name": "Laura Jones",
        "shoppingCartAsJson": "not set yet",
        "ShoppingCart": {
            "totalAmount": 0,
			"id": "549034512",
            "Item": [
				{
					"price": "12.69",
					"name": "Salmon",
					"barCode": "52-947-12345"
				},
				{
					"price": "5.2",
					"name": "Cereals",
					"barCode": "39-280-12345"
				},
            ]
        }
    }];	
	
	try {
	    corticonDataManager.addEntitiesAndAssociations('Customer', payload);
	}
	catch ( e ) {
		logger.logError(`*** Error adding entity: ${e}`);
	}  
}


async function getShoppingCartForCustomerFct(corticonDataManager) {
	const logger = corticonDataManager.getLogger();
	try {
		const entities = corticonDataManager.getEntitiesByType('Customer');
		entities.forEach(customerEntity => {
			const shoppingCartAsJson = getShoppingCartAndAssociatedItemsForCustomer (corticonDataManager);
			saveShoppingCartToBackend(shoppingCartAsJson, customerEntity);
		});
	}
	catch ( e ) {
		logger.logError(`*** Error in getShoppingCartForCustomerFct: ${e}`);
	}  
}

function saveShoppingCartToBackend(shoppingCartAsJson, customerEntity) {
	// Now we write them as a single JSON string so that we can see everything works fine in Corticon tester
	// In a real scenario we would want to use 
	customerEntity['shoppingCartAsJson'] = JSON.stringify(shoppingCartAsJson);
}

function getShoppingCartAndAssociatedItemsForCustomer (corticonDataManager) {
	//Get the shopping and the items association for the specific customer
	const shoppingCartAsJson = corticonDataManager.getAssociationsForEntity(customerEntity, "ShoppingCart");

	return shoppingCartAsJson;
}

exports.addCustomersWithShoppingCartsFct = addCustomersWithShoppingCartsFct;
exports.getShoppingCartForCustomerFct = getShoppingCartForCustomerFct;

