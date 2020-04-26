import { Injectable } from "@angular/core";
// TODO: should be imported from kinvey-nativescript-sdk/angular but declaration file is currently missing
import { DataStoreService, UserService, Query } from "kinvey-nativescript-sdk/lib/angular";
import { map } from 'rxjs/operators';

import { Config } from "../../shared/config";
import { DecisionService } from "./decision.service";
import { Car } from "./car.model";
import { Driver } from "./driver.model";
import { EventsService } from "./events.service";
import { AppEvent } from "./app-event.model";



const editableProperties = [
    "class",
    "doors",
    "hasAC",
    "transmission",
    "luggage",
    "name",
    "price",
    "seats",
    "imageUrl"
];

@Injectable({
    providedIn: "root"
})
export class CarService {

    private _allCars: Array<Car> = [];
    private _carsStore = null;
    private _decisionService;

    constructor(
        dataStoreService: DataStoreService,
        decisionService: DecisionService,
        protected events: EventsService,
        private _userService: UserService) 
        {
            this._decisionService = decisionService;
            this._carsStore = dataStoreService.collection("cars");
        }

    getCarById(id: string): Car {
        if (!id) {
            return;
        }

        return this._allCars.filter((car) => {
            return car.id === id;
        })[0];
    }

    calculateInsurancePremium(driver:Driver){
        let corticonPayload = {
            "__metadataRoot": { "#locale": "" },
            "Objects": [
                {
                "Age": driver.age,
                "Gender": driver.gender ,
                "YearsDriving": driver.licenceYears,
                "DamageWaiver": driver.coverage,
                "Premium": 0,
                "__metadata": {
                    "#type": "Applicant",
                    "#id": "Applicant_id_1"
                    }
                }
            ]   
        }
        return this._decisionService.callDecisionService(corticonPayload).pipe(map((result:any) => {
            let newDriver:Driver;

            //TODO: asynch issue, what if an event is unshifted inbetween...
            let endTime = Math.round((EventsService.now() - this.events.events[0].timestamp) * 100) / 100 ;    

            this.events.events.unshift(new AppEvent("Finished DS round-trip on " + this._decisionService.currentBackend + " in "+ endTime + "ms","","info", endTime));

            if(result.Objects[0]) {
                //Create a new driver object instance, bc immutability and we don't know which values coming back from Corticon have changed
                newDriver = new Driver(driver.name, result.Objects[0].Gender, result.Objects[0].Age, result.Objects[0].YearsDriving,result.Objects[0].DamageWaiver );
                newDriver.insurancePremium = result.Objects[0].Premium;
                this.events.events.unshift(new AppEvent("The resulting driver premium was €" + newDriver.insurancePremium , "","info", null));
            } 
            return newDriver;
        }));
    }

    load(): Promise<any> {
        return this.login().then(() => {
            return this._carsStore.sync();
        }).then(() => {
            const sortByNameQuery = new Query();
            sortByNameQuery.ascending("name");
            const stream = this._carsStore.find(sortByNameQuery);

            return stream.toPromise();
        }).then((data) => {
            this._allCars = [];
            data.forEach((carData: any) => {
                carData.id = carData._id;
                const car = new Car(carData);

                this._allCars.push(car);
            });

            return this._allCars;
        });
    }

    private login(): Promise<any> {
        if (!!this._userService.getActiveUser()) {
            return Promise.resolve();
        } else {
            return this._userService.login(Config.kinveyUsername, Config.kinveyPassword);
        }
    }

}
