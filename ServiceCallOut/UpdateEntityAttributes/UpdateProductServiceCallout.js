const updateProduct = {
    func: 'updateProductFct',
    type: 'ServiceCallout',
    description: {'en_US': 'This function updates the product entities from the data source'},
    extensionType: 'SERVICE_CALLOUT',
    name: {'en_US': 'updateProduct'}
};

const allProducts = new Map();

let logger;

function updateProductFct(corticonDataManager) {
	logger = corticonDataManager.getLogger();
	
    logger.logDebug('Start SCO updateProduct');
    
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
}

/*
The code below defines some products data; in a real application this would be coming, for example,
from a REST service or Database.
*/
defineSimulatedProductData();

function defineSimulatedProductData() {
    allProducts.set('A-123', {
        "quantityAvailable": 12,
        "price": 11.22,
        "expirationDate": '2024-02-10T00:00:00.000Z'
    });
    allProducts.set('B-123', {
        "quantityAvailable": 56,
        "price": 79.39,
        "expirationDate": '2025-12-01T00:00:00.000Z'
    });
}