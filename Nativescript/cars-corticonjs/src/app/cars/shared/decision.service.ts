import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http'; 
import { of } from 'rxjs';

import  * as RentalDecisionService from "rental-insurance";
//import { CarsModule } from "../cars.module";
import { action } from "tns-core-modules/ui/dialogs";
import { EventsService } from "./events.service";
import { AppEvent } from "./app-event.model";
import { Backend } from "./backend.model";

@Injectable({
    providedIn: "root" //CarsModule
})            

export class DecisionService {
    
    //Typescript polymorphism is fun
    private azureDS:Backend = {
        name: "Azure",
        bgcolor: "rgba(0, 136, 214, 1)",
        bgcolorlight: "rgba(0, 136, 214, 0.5)",
        toString: () => {return this.azureDS.name},
        callDS: (corticonPayload) => {
            let azureUrl = "https://carsdecisionservice.azurewebsites.net/api/rentalinsurance?code=RY8cZxulCemeWzOar7PsLOKk2J2TSPQF54tHoXdFAMY2wQUeP3F5bQ==";
            return this.http.post(azureUrl,corticonPayload); 
        }
    }

    private clientDS:Backend = {
        name: "Client (offline)",
        bgcolor: "rgba(92, 228, 1, 1)",
        bgcolorlight: "rgba(92, 228, 1, 0.5)",
        toString: () => {return this.clientDS.name},
        callDS: (corticonPayload) => {
            const configuration = { logLevel: 0 };
            //Enable for detailed console logging!
            //const configuration = { logLevel: 1, logIsOn: true, logFunction: function(logData){console.log(logData);return;}};
            
            //Uncomment to test error handling :)
            //corticonPayload.Objects[0].Age = "FOO";

            let result;
            try {
                result = RentalDecisionService.execute(corticonPayload, configuration);
                //console.log('Args no error', JSON.stringify(result));

            } catch (e){
                console.log('ARGS ERROR');
                this.events.events.unshift(new AppEvent(e.toString(),"","error",null));
                alert(e);
            }
            return of(result);
        }
    }

    private kinveyDS:Backend = {
        name: "Kinvey",
        bgcolor: "rgba(92, 228, 1, 1)",
        bgcolorlight: "rgba(92, 228, 1, 0.5)",
        toString: () => {return this.clientDS.name},
        callDS: () => {return "";}
    }

    public currentBackend = this.clientDS;

    public supportedBackends = [
        this.azureDS, this.clientDS, this.kinveyDS
    ];

    constructor(protected http: HttpClient, protected events: EventsService) {}


    public callDecisionService(corticonPayload:Object){
        this.events.events.unshift(new AppEvent("Calling DS on " + this.currentBackend ,"","info", null));
        this.events.eventCurrentlyProcessing = true;
        return this.currentBackend.callDS(corticonPayload);
    }

    //TODO: shouldn't really do UI in a service :S
    public openDialog(){
        action({
            message: "Select Decision Service Location",
            cancelButtonText: "Cancel",
            actions: this.supportedBackends.map(backend => backend.name)
        }).then((result) => {
            switch(result){
                case "Azure": 
                    this.currentBackend = this.azureDS;
                    break;
                case "Client (offline)":
                    this.currentBackend = this.clientDS;
                    break;
            }
            this.events.events.unshift(new AppEvent("Switching to DS Backend on " + this.currentBackend ,"","info", null));
        });
    }
}