import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule, ModalDialogParams } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { NativeScriptUIDataFormModule} from "nativescript-ui-dataform/angular";
import { CarDetailComponent } from "./car-detail/car-detail.component";
import { CarListComponent } from "./car-list.component";
import { CarsRoutingModule } from "./cars-routing.module";
import { CarInsuranceComponent } from "./car-insurance/car-insurance.component";
import { HttpClientModule } from "@angular/common/http";
import { TopBarComponent } from "./top-bar/top-bar.component";
import { CarsActionBarComponent } from "./cars-action-bar/cars-action-bar.component";

@NgModule({
    imports: [
        CarsRoutingModule,
        NativeScriptCommonModule,
        NativeScriptFormsModule,
        NativeScriptUIListViewModule,
        NativeScriptUIDataFormModule
    ],
    declarations: [
        CarListComponent,
        CarDetailComponent,
        CarInsuranceComponent,
        CarsActionBarComponent,
        TopBarComponent
    ],
    providers: [],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class CarsModule { }
