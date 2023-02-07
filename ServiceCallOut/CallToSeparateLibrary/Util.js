function getPeriodOfDayFromCurrentTime() {
    console.log('XXXXXXXXXXX in getPeriodOfDayFromCurrentTime');
	const hour = new Date().getHours();
	let postfix = 'night';		
	if ( hour < 12 )
	   postfix = "morning";
	else if ( hour < 18 )
	  postfix = "afternoon";
	else if ( hour < 21 )
	  postfix = "evening";

	return postfix;	  
}

module.exports = { getPeriodOfDayFromCurrentTime };
