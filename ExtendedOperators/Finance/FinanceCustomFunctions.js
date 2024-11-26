/**
 * Get the present value of an investment.
 *
 * A custom operator receives its parameters as an array. 
 * 
 * @param[0] futureValue Target future investment amount from which to compute the present value.
 * @param[1] interestRate Annual interest rate as a percentage (for example, 4.5 is 4.5% interest rate).
 * @param[2] numberOfYears Number of years (fractional years are supported, for example, 3.5 years).
 *
 *           Each of these parameters can be a Decimal, an Integer or a String representing a number.
 *           Additionally, the numberOfYears can also be a Date or DateTime. In that case we compute the 
 *           number of years as the difference between current date (today) with the passed in date or dateTime.
 *           Note that this is computed using the number of months divided by 12 to get fractional years.
 *           For example, a date 18 months in the future will result in 1.5 years.
 *           
 *           If the parameters are of the incorrect type an exception will be thrown which will stop the execution
 *           of the rules (fail fast).
 *           
 * @return   The amount which would need to be deposited to achieve the target futureValue at the specified 
 *           interest rate for the numberOfYears.
 *           
 *           If no futureValue is passed or if futureValue is null, the operator returns null.
 *           If no inputInterestRate is passed or if inputInterestRate is null the operator returns null 
 *           If no numberOfYears is passed or if numberOfYears is null the numberOfYears is defaulted to 1 year.
 *           
 */
function presentValue ( helper, params ) {
	// Validate input parameters are of the expected types - if not throw an exception to reject the call.
	checkForValidTypes ( helper, params );
	
	let futureValue = params[0];
	// check if no params are passed or if param is null
	if ( futureValue === undefined || futureValue === null ) 
		return null; 

	// Note: there is no need to check if it's a string type as Decimals accept as inputs strings as long as they represent a valid number.	
//	if ( typeof futureValue === 'string' )
//		futureValue = helper.decimal.constructDecimal(futureValue);
	
	let inputInterestRate = params[1];
	// If no interest rate, just return current value
	if ( inputInterestRate === undefined || inputInterestRate === null )
		return null;
	
	// interest rate value: 1 + inputInterestRate/100	 
	const interestRateDecimal = helper.decimal.add(1, helper.decimal.divide(inputInterestRate, 100) );
	
	let numberOfYears = params[2];
	// Default to 1 year if parameter is missing
	if ( numberOfYears === undefined || numberOfYears === null )
		numberOfYears = 1;

	// We support the number of years to be passed as a Date or a DateTime in the future
	if ( helper.date.isDate( params[2] ) )
		numberOfYears = getNumberYearsFromDate ( helper, params[2] ); 
	else if ( helper.dateTime.isDateTime( params[2] ) )
		numberOfYears = getNumberYearsFromDateTime ( helper, params[2] ); 
	
	// Math.pow(interestRateDecimal, numberOfYears);
	const x = helper.decimal.power(interestRateDecimal, numberOfYears)			
	const thePresentValue = helper.decimal.divide ( futureValue, x ); 
	
	return thePresentValue;
}

/**
 * Get the future value of an investment.
 * 
 * @param[0] presentValue Present investment amount from which to compute the future value.
 * @param[1] interestRate Annual interest rate as a percentage (for example, 4.5 is 4.5% interest rate).
 * @param[2] numberOfYears Number of years(fractional years are supported, for example, 3.5 years).
 *
 *           Each of these parameters can be a Decimal, an Integer or a String representing a number.
 *           Additionally, the numberOfYears can also be a Date or DateTime. In that case we compute the 
 *           number of years as the difference between current date (today) with the passed in date or dateTime.
 *           Note that this is computed using the number of months divided by 12 to get fractional years.
 *           For example, a date 18 months in the future will result in 1.5 years.
 *           
 *           If the parameters are of the incorrect type an exception will be thrown which will stop the execution
 *           of the rules (fail fast).
 *           
 * @return The future value of the investment given the presentValue, the interestRate and numberOfYears.
 *           
 *           If no futureValue is passed or if futureValue is null, the operator returns null.
 *           If no inputInterestRate is passed or if inputInterestRate is null the operator returns null 
 *           If no numberOfYears is passed or if numberOfYears is null the numberOfYears is defaulted to 1 year.
 */
function futureValue ( helper, params ) {
	// Validate input parameters are of the expected types - if not throw an exception to reject the call.
	checkForValidTypes ( helper, params );
	
	const presentValue = params[0];
	// check if no params are passed or if param is null
	if ( presentValue === undefined || presentValue === null ) 
		return null; 

	const inputInterestRate = params[1];
	if ( inputInterestRate === undefined || inputInterestRate === null )
		return null;
		 
	// interest rate value: 1 + inputInterestRate/100	 
	const interestRateDecimal = helper.decimal.add(1, helper.decimal.divide(inputInterestRate, 100) );
	
	let numberOfYears = params[2];
	if ( numberOfYears === undefined )
		numberOfYears = 1;

	// Check if number of years is passed a Date or DateTime	
	if ( helper.date.isDate( params[2] ) )
		numberOfYears = getNumberYearsFromDate ( helper, params[2] ); 
	else if ( helper.dateTime.isDateTime( params[2] ) )
		numberOfYears = getNumberYearsFromDateTime ( helper, params[2] ); 
			
	// Math.pow(interestRateDecimal,numberOfYears);
	const x = helper.decimal.power( interestRateDecimal, numberOfYears )			
	const theFutureValue = helper.decimal.multiply ( presentValue, x ); 
	
	return theFutureValue;
}

function getNumberYearsFromDate ( helper, date ) {
	// we use monthsBetween instead of yearsBetween to take fractional years into account
	const today = helper.date.today();
	const x = helper.date.monthsBetween ( today, date ) / 12;
	if ( x < 0 )
		throw Error("You need to specify a date in the future and not in the past - Date is: "+helper.date.outputToJson(date));
	else
		return x;
}

function getNumberYearsFromDateTime ( helper, dateTime ) {
	// we use monthsBetween instead of yearsBetween to take fractional years into account
	const now = helper.dateTime.now();
	const x = helper.dateTime.monthsBetween ( now, dateTime ) / 12;
	if ( x < 0 )
		throw Error("You need to specify a dateTime in the future and not in the past - DateTime is: " + helper.dateTime.outputToJson(dateTime));
	else
		return x;
}

function checkForValidTypes ( helper, params ) {
	if ( params[0] !== undefined && params[0] !== null ) {
		if ( typeof params[0] !== 'string' && typeof params[0] !== 'number' && !helper.decimal.isDecimal( params[0] ) )
			throw Error ( "First parameter (" + params[0] + ") needs to be an Integer a Decimal or a number as a String" ); 
	} 
	
	if ( params[1] !== undefined && params[1] !== null ) {
		if ( typeof params[1] !== 'string' && typeof params[1] !== 'number' && !helper.decimal.isDecimal( params[1] ) )
			throw Error ( "Second parameter (" + params[1] + ") needs to be an Integer a Decimal or a number as a String" ); 
	} 
	
	if ( params[2] !== undefined && params[2] !== null ) {
		if ( typeof params[2] !== 'string' && typeof params[2] !== 'number' && !helper.decimal.isDecimal( params[2] ) && !helper.date.isDate( params[2] ) && !helper.dateTime.isDateTime( params[2] ) )
			throw Error ( "Third parameter (" + params[2] + ") needs to be an Integer a Decimal or a number as a String or a Date or a DateTime" ); 
	} 	
}

module.exports = { PresentValue: presentValue, FutureValue: futureValue };

/*
For use in deployment outside of studio tester:

const configuration = { logLevel: 0, customFunctions: [{FutureValue: futureValue}, {PresentValue: presentValue} ]};
*/