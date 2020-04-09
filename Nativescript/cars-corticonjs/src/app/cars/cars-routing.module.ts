import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { CarDetailEditComponent } from "./car-detail-edit/car-detail-edit.component";
import { CarDetailComponent } from "./car-detail/car-detail.component";
import { CarListComponent } from "./car-list.component";
import { CarInsuranceComponent } from "./car-insurance/car-insurance.component";

const routes: Routes = [
    { path: "", component: CarListComponent },
    { path: "car-detail/:id", component: CarDetailComponent },
    { path: "car-detail-edit/:id", component: CarDetailEditComponent },
    { path: "car-insurance/:id", component: CarInsuranceComponent }

];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class CarsRoutingModule { }
