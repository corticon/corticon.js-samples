const sdk = require('kinvey-flex-sdk');
const decisionService = require('rental-insurance'); 

sdk.service(function (err, flex) {
    const flexFunctions = flex.functions;
    function postCorticonDemo(context, complete, modules) {
        const configuration = { logLevel: 1, logIsOn: corticonLogEntry => console.log(corticonLogEntry)};
        const result = decisionService.execute(context.body, configuration);
        return complete().setBody(JSON.stringify(result)).ok().done();
    }
    flexFunctions.register('postCorticonDemo', postCorticonDemo);
});