import { Component, OnInit, Input } from "@angular/core";
import { EventsService } from "../shared/events.service";
import { DecisionService } from "../shared/decision.service";


@Component({
    selector: 'TopBar',
    moduleId: module.id,
    templateUrl: "./top-bar.component.html"
})

export class TopBarComponent implements OnInit {

    constructor(
        public events: EventsService,
        public decisionService: DecisionService
    ) { }

    public eventLogVisible = false;

    toggleEventLog($event) {
        this.eventLogVisible = !this.eventLogVisible;
    }

    ngOnInit(): void {
    }

    getBackgroundColourLight(){
        return this.decisionService.currentBackend.bgcolorlight;
    }
}
