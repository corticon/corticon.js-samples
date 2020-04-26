import { Component, OnInit, Input } from "@angular/core";
import { CarService } from "../shared/car.service";
import { PageRoute, RouterExtensions } from "nativescript-angular/router";
import { EventsService } from "../shared/events.service";
import { DecisionService } from "../shared/decision.service";


@Component({
    selector: 'TopBar',
    moduleId: module.id,
    templateUrl: "./top-bar.component.html"
})

export class TopBarComponent implements OnInit {
    @Input('title') title: string;

    constructor(
        private _carService: CarService,
        private _pageRoute: PageRoute,
        private _routerExtensions: RouterExtensions,
        public events: EventsService,
        public decisionService: DecisionService
    ) {            
       
    }

    public eventLogVisible = false;
    //public title="placeholder";
    toggleEventLog($event) {
        this.eventLogVisible = !this.eventLogVisible;
    }

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
    getBackgroundColourLight(){
        if(this.decisionService.currentBackend == "Azure"){
            return "rgba(0, 136, 214, 0.5)"
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
