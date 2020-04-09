import { Component, OnInit } from "@angular/core";
import { PageRoute, RouterExtensions } from "nativescript-angular/router";
import { switchMap } from "rxjs/operators";

import { Car } from "../shared/car.model";
import { CarService } from "../shared/car.service";
import { Driver } from "../shared/driver.model";

/* ***********************************************************
* This is the item details component in the master-detail structure.
* This component retrieves the passed parameter from the master list component,
* finds the data item by this parameter and displays the detailed data item information.
*************************************************************/
@Component({
    selector: "CarInsurance",
    moduleId: module.id,
    templateUrl: "./car-insurance.component.html"
})
export class CarInsuranceComponent implements OnInit {
    private _car: Car;
    private _driver: Driver;

    constructor(
        private _carService: CarService,
        private _pageRoute: PageRoute,
        private _routerExtensions: RouterExtensions
    ) { }

    ngOnInit(): void {
        this._pageRoute.activatedRoute
        .pipe(switchMap((activatedRoute) => activatedRoute.params))
        .forEach((params) => {
            const carId = params.id;
            this._car = this._carService.getCarById(carId);
        });
        this._driver = new Driver("Bob", "male", 22, 3, "Full");
       
    }

    get car(): Car {
        return this._car;
    }

    get driver(): Driver {
        return this._driver;
    }
    onCalculateTap():void {
        console.log(JSON.stringify(this._driver));
        this._carService.calculateInsurancePremium(this._driver);
    }
    onBackButtonTap(): void {
        this._routerExtensions.backToPreviousPage();
    }
}
