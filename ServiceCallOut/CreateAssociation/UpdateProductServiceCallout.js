const updateProduct = {
    func: 'updateProductFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function updates the product entities from the data source including associations to providers.'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'updateProduct'}
};

const allProducts = new Map();  // For storing the simulated data.

let logger;

function updateProductFct(corticonDataManager) {
	logger = corticonDataManager.getLogger();
	
    const theProductsToBuy = corticonDataManager.getEntitiesByType('Product');
    theProductsToBuy.forEach(productToBuy => {
        const sku = productToBuy['sku'];
        if ( sku !== null ) {
            const productFromStore = allProducts.get(sku);
            if ( productFromStore === undefined ) {
                productToBuy['quantityAvailable'] = 0;
                productToBuy['_debug'] = "Requested product not found for sku: " + sku;                
            }
            else
                updateProductToBuyFromStore (productToBuy, productFromStore, corticonDataManager);
        }
    });
}

exports.updateProductFct = updateProductFct;

/*
  This function updates various attributes of the product entity.
  It demonstrates how to use decimal and dateTime Corticon operators to manipulate these
  data types.  For String, Integer and Boolean, you can directly use the JavaScript built-in 
  types String, Number and Boolean respectively.   
*/
function updateProductToBuyFromStore (productToBuy, productFromStore, corticonDataManager) {
	// Access decimal and dateTime Corticon operators.
    const decimalOperators = corticonDataManager.getOperator().decimal;
    const dateTimeOperators = corticonDataManager.getOperator().dateTime;

	// Update some product attributes.
    productToBuy['quantityAvailable'] = productFromStore['quantityAvailable'];
    productToBuy['price'] = decimalOperators.constructDecimal(productFromStore['price']);
    productToBuy['expirationDate'] = dateTimeOperators.constructDateTime(productFromStore['expirationDate']);
    
    // An example showing how to use additional DateTime operators.
	const now = dateTimeOperators.now();
	const nowTxt = dateTimeOperators.outputToJson(now);
	productToBuy['_debug'] = "Ran at " + nowTxt;

    logger.logDebug('SCO updateProduct: updated product sku: ' + productToBuy['sku'] );
    
    // Now add the association to providers
    updateProductWithProviders (productToBuy, productFromStore, corticonDataManager);
}


/*
	This function demonstrates how to create an entity (a provider) and how to associate it to the product
	on order, effectively creating the association.
*/
function updateProductWithProviders (productToBuy, productFromStore, corticonDataManager) {
	const allProviders = productFromStore["providers"];
	for ( let i=0; i<allProviders.length; i++ ) {
		const oneProvider = allProviders[i];
		productToBuy['_debug'] += " - Provider: " + oneProvider["name"];
		const providerEntity = corticonDataManager.createEntity('Provider', oneProvider);
    	logger.logDebug('one Provider entity created for '+ oneProvider["name"]);
		corticonDataManager.addAssociation(productToBuy, providerEntity, 'provider');
    	logger.logDebug('one Provider association added for ' + productToBuy["sku"]);
	}
}

/*
The code below defines some products data; in a real application this would be coming, for example,
from a REST service or Database.
*/
defineSimulatedProductData();

function defineSimulatedProductData() {
    allProducts.set('A-123', {
        "quantityAvailable": 14,
        "price": 11.22,
        "expirationDate": '2026-02-14T00:00:00.000Z',
        "providers": [
        	{ "name": 'Provider1',
        	  "email": 'abc@prov1.com',
        	  "availableTillDate": '2024-02-14T00:00:00.000Z',
        	  "deliveryCost": 15.33,
        	},
        	{
        	 "name": 'Provider2',
        	  "email": 'def@prov2.com',
        	  "availableTillDate": '2024-02-14T00:00:00.000Z',
        	  "deliveryCost": 21.10,
        	}
        ]
    });
    allProducts.set('B-123', {
        "quantityAvailable": 58,
        "price": 79.39,
        "expirationDate": '2025-12-01T00:00:00.000Z',
        "providers": [
        	{ "name": 'Provider3',
        	  "email": 'abc@prov3.com',
        	  "availableTillDate": '2024-02-14T00:00:00.000Z',
        	  "deliveryCost": 11.70,
        	}
        ]
    });
}