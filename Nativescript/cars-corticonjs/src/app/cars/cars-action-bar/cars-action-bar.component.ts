import { Component, OnInit, Input } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { DecisionService } from "../shared/decision.service";


@Component({
    selector: 'CarsActionBar',
    moduleId: module.id,
    templateUrl: "./cars-action-bar.component.html"
})

export class CarsActionBarComponent implements OnInit {
    @Input('title') title: string;
    @Input('back') back: string;

    constructor(
        private _routerExtensions: RouterExtensions,
        public decisionService: DecisionService
    ) { }
    
    ngOnInit(): void {
    }

    getBackgroundColour(){
        if(this.decisionService.currentBackend == "Azure"){
            return "rgba(0, 136, 214, 1)"
            //return "#0089D6";
        } else {
            return "#5CE501";
        }
    }

    /* ***********************************************************
    * The back button is essential for a master-detail feature.
    *************************************************************/
    onBackButtonTap(): void {
        this._routerExtensions.backToPreviousPage();
    }

    onSettingsButtonTap(): void {
        this.decisionService.openDialog();
    }
}
