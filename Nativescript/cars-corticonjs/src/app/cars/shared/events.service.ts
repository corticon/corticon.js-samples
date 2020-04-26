import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http'; 
import { of } from 'rxjs';

import  * as RentalDecisionService from "rental-insurance";
import { action } from "tns-core-modules/ui/dialogs";
import { AppEvent } from "./app-event.model";

@Injectable({
    providedIn: "root" //CarsModule
})

export class EventsService {

    constructor() {}

    public events:AppEvent[] = [];
    public eventCurrentlyProcessing:boolean = false;
    
    //Implement a timing method using native APIs as JS' Date.now() is very imprecise and performance.now() is not available in N
    public static now() {
        if (global.android) {
            //@ts-ignore (Native object access, could do it properly, but this adds lots of perf overhead to IDE - https://docs.nativescript.org/core-concepts/accessing-native-apis-with-javascript)
            return java.lang.System.nanoTime() / 1000000;
        } else {
            //@ts-ignore
            return CACurrentMediaTime();
        }
    }
    
}