import { Component, OnInit } from "@angular/core";
import { PageRoute, RouterExtensions } from "nativescript-angular/router";
import { switchMap } from "rxjs/operators";

import { Car } from "../shared/car.model";
import { CarService } from "../shared/car.service";
import { Driver } from "../shared/driver.model";
import { DecisionService } from "../shared/decision.service";
import { EventsService } from "../shared/events.service";

/* ***********************************************************
* This is the item details component in the master-detail structure.
* This component retrieves the passed parameter from the master list component,
* finds the data item by this parameter and displays the detailed data item information.
*************************************************************/
@Component({
    selector: "CarDetail",
    templateUrl: "./car-detail.component.html"
})
export class CarDetailComponent implements OnInit {
    private _car: Car;
    private _driver: Driver;
    
    constructor(
        private _carService: CarService,
        private _pageRoute: PageRoute,
        private _routerExtensions: RouterExtensions,
        public events: EventsService,
        public decisionService: DecisionService
    ) { }


    /* ***********************************************************
    * Use the "ngOnInit" handler to get the data item id parameter passed through navigation.
    * Get the data item details from the data service using this id and assign it to the
    * private property that holds it inside the component.
    *************************************************************/
    ngOnInit(): void {
        /* ***********************************************************
        * Learn more about how to get navigation parameters in this documentation article:
        * http://docs.nativescript.org/angular/core-concepts/angular-navigation.html#passing-parameter
        *************************************************************/
        this._pageRoute.activatedRoute
            .pipe(switchMap((activatedRoute) => activatedRoute.params))
            .forEach((params) => {
                const carId = params.id;

                this._car = this._carService.getCarById(carId);
            });
    }
    
    get car(): Car {
        return this._car;
    }
    get driver() {
        return this._driver;
    }

    get totalPrice(): number {
        if(this._driver && this._driver.insurancePremium){
            return this.car.price + this.driver.insurancePremium;
        } else {
            return this.car.price;
        }
       
    }
    /*get insurancePremiumText(): string {
        if(this._driver && this._driver.insurancePremium){
            return this.car.price + " +" + this.driver.insurancePremium;
        } else {
            return this.car.price;
        }
    }*/
  

    insurancePremiumChanged(newDriver:Driver) {
        this._driver = newDriver;
    }

}
