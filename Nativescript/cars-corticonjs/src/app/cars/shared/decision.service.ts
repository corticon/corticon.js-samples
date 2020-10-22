import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { action } from "tns-core-modules/ui/dialogs";

import * as RentalDecisionService from "rental-insurance";

import { EventsService } from "./events.service";
import { AppEvent } from "./app-event.model";
import { Backend } from "./backend.model";

@Injectable({
    providedIn: "root"
})

export class DecisionService {

    private azureDS: Backend = {
        name: "Azure",
        bgcolor: "rgba(0, 136, 214, 1)",
        bgcolorlight: "rgba(0, 136, 214, 0.5)",
        toString: () => { return this.azureDS.name },
        callDS: (corticonPayload: Object) => {
            let azureUrl = "https://carsdecisionservice.azurewebsites.net/api/rentalinsurance?code=RY8cZxulCemeWzOar7PsLOKk2J2TSPQF54tHoXdFAMY2wQUeP3F5bQ==";
            return this.http.post(azureUrl, corticonPayload);
        }
    }

    private clientDS: Backend = {
        name: "Client (offline)",
        bgcolor: "rgba(92, 228, 1, 1)",
        bgcolorlight: "rgba(92, 228, 1, 0.5)",
        toString: () => { return this.clientDS.name },
        callDS: (corticonPayload: Object) => {
            const configuration = { logLevel: 0 };
            let result: Object;
            try {
                result = RentalDecisionService.execute(corticonPayload, configuration);
            } catch (e) {
                this.events.events.unshift(new AppEvent(e.toString(), "", "error", null));
                alert(e);
            }
            return of(result);
        }
    }

    private kinveyDS: Backend = {
        name: "Kinvey",
        bgcolor: "rgba(92, 228, 1, 1)",
        bgcolorlight: "rgba(92, 228, 1, 0.5)",
        toString: () => { return this.clientDS.name },
        callDS: () => { return ""; }
    }

    public currentBackend = this.clientDS;

    public supportedBackends = [
        this.azureDS, this.clientDS, this.kinveyDS
    ];

    constructor(protected http: HttpClient, protected events: EventsService) { }


    public callDecisionService(corticonPayload: Object) {
        this.events.events.unshift(new AppEvent("Calling DS on " + this.currentBackend, "", "info", null));
        this.events.eventCurrentlyProcessing = true;
        return this.currentBackend.callDS(corticonPayload);
    }

    //TODO: shouldn't really do UI in a service :S
    public openDialog() {
        action({
            message: "Select Decision Service Location",
            cancelButtonText: "Cancel",
            actions: this.supportedBackends.map(backend => backend.name)
        }).then((result) => {
            switch (result) {
                case "Azure":
                    this.currentBackend = this.azureDS;
                    break;
                case "Client (offline)":
                    this.currentBackend = this.clientDS;
                    break;
            }
            this.events.events.unshift(new AppEvent("Switching to DS Backend on " + this.currentBackend, "", "info", null));
        });
    }
}