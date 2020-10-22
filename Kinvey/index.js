const sdk = require('kinvey-flex-sdk');
const decisionService = require('rental-insurance');

sdk.service(function (err, flex) {
    const flexFunctions = flex.functions;

    function postCorticonDemo(context, complete, modules) {
        const configuration = { logLevel: 1, logFunction: corticonLogEntry => flex.logger.info(corticonLogEntry) }; //Verbose logging, probably don't use in production
        const result = decisionService.execute(context.body, configuration);

        if (result.status === "success") {
            return complete().setBody(JSON.stringify(result)).ok().done();
        } else {
            return complete().badRequest('Error when executing decision service ' + JSON.stringify(result)).done();
        }
    }
    flexFunctions.register('postCorticonDemo', postCorticonDemo);
});