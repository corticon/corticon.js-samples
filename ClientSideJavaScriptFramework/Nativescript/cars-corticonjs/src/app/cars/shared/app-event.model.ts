import {EventsService} from "./events.service";

export class AppEvent{
    public timestamp;
    constructor(
        public text: string,
        public description:string,
        public type: string,
        public duration: number
    ) {
        this.timestamp = EventsService.now();
    }

    public toString():string {
        return this.text;
    }
}