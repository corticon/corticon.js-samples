var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const payload = [{
        "YearsDriving": 1,
        "DamageWaiver": "Full",
        "Gender": "male",
        "Age": 20
    }];
const configuration = {
    logLevel: 1,
    logFunction: (corticonLogEntry) => { console.log(corticonLogEntry); }
};
var result;
function processResult(e) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('page is fully loaded');
        result = yield window.corticonEngine.execute(payload, configuration);
        document.getElementById('result').append(JSON.stringify(result));
    });
}
;
window.onload = processResult;
