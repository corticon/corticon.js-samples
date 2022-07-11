import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { PageRoute, RouterExtensions } from "nativescript-angular/router";

import { Car } from "../shared/car.model";
import { CarService } from "../shared/car.service";
import { Driver } from "../shared/driver.model";

/* ***********************************************************
* This is the item details component in the master-detail structure.
* This component retrieves the passed parameter from the master list component,
* finds the data item by this parameter and displays the detailed data item information.
*************************************************************/
@Component({
    selector: 'CarInsurance',
    moduleId: module.id,
    templateUrl: "./car-insurance.component.html"
})
export class CarInsuranceComponent implements OnInit {

    @Output() currentDriver = new EventEmitter<Driver>();
    private _car: Car;
    private _driver: Driver;
    public isLoading = false;

    constructor(
        private _carService: CarService,
    ) {            
        this._driver = new Driver("Bob", "male", 22, 3, "Full");
        //this._driver = this._carService.calculateInsurancePremium(this._driver).insurancePremium;
    }

    ngOnInit(): void {
        //validateAndCommitAll():
        this.formChanged(null);
        //this._driver = this._carService.calculateInsurancePremium(this._driver);
    }
    get car(): Car {
        return this._car;
    }

    get driver(): Driver {
        return this._driver;
    }

    formChanged($event):void {
        this.isLoading = true;
        this._carService.calculateInsurancePremium(this._driver).subscribe((newDriver) => {
            this.isLoading = false;
            this._driver.insurancePremium = newDriver.insurancePremium;
            this.currentDriver.emit(newDriver);
        });
        
    }
}
