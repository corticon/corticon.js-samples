import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http'; 
import { of } from 'rxjs';

import  * as RentalDecisionService from "rental-insurance";
//import { CarsModule } from "../cars.module";
import { action } from "tns-core-modules/ui/dialogs";
import { EventsService } from "./events.service";
import { AppEvent } from "./app-event.model";

@Injectable({
    providedIn: "root" //CarsModule
})


export class DecisionService {
    public supportedBackends = [
        "Client (offline)", "Azure", "AWS Lambda", "Kinvey"
    ];
    public currentBackend = "Azure";

    constructor(protected http: HttpClient, protected events: EventsService) {}


    public callDecisionService(corticonPayload:Object){
        if(this.currentBackend == "Azure"){
            return this.callDSAzure(corticonPayload);
        } else {
            return this.callDSLocal(corticonPayload);
        }
    }
    public openDialog(){
        action({
            message: "Select Decision Service Location",
            cancelButtonText: "Cancel",
            actions: this.supportedBackends
        }).then((result) => {
            this.currentBackend = result;
            if (result == "Client (offline)") {
                console.log("Using Client JavaScript");
            } else if(result == "Azure") {
                console.log("Using Azure Functions Remote");
            } else {
                this.currentBackend = 'Client (offline)';
                console.log("Using Client JavaScript");
            }
        });
    }

    private callDSLocal(corticonPayload) {
        const configuration = { logLevel: 0 };
        //Enable for detailed console logging!
        //const configuration = { logLevel: 1, logIsOn: true, logFunction: function(logData){console.log(logData);return;}};

        let result;
        this.events.events.unshift(new AppEvent("Calling DS on " + this.currentBackend ,"","info", null));
        let startTime = EventsService.now();
        try {
            result = RentalDecisionService.execute(corticonPayload, configuration)
            let endTime = Math.round((EventsService.now() - startTime) * 100) / 100 ;
            this.events.events.unshift(new AppEvent("Finished DS execution on " + this.currentBackend + " in "+ endTime + "ms","","info", endTime));

        } catch (e){
            this.events.events.unshift(new AppEvent(e.toString(),"","error",null));
            alert(e);
        }
        return of(result);
    }

    private callDSAzure(corticonPayload) {
        this.events.events.unshift(new AppEvent("Calling DS on " + this.currentBackend ,"","info", null));
        let azureUrl = "https://carsdecisionservice.azurewebsites.net/api/rentalinsurance?code=RY8cZxulCemeWzOar7PsLOKk2J2TSPQF54tHoXdFAMY2wQUeP3F5bQ==";
        return this.http.post(azureUrl,corticonPayload); 

    }
}