import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common'

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	
	title = 'corticon-test';
	window: any

	constructor(@Inject(DOCUMENT) private _document:any) {
		this.window = this._document.defaultView
	
		const payload = [{
			"YearsDriving": 1,
			"DamageWaiver": "Full",
			"Gender": "male",
			"Age": 20
		}];
			
		const configuration = {
			logLevel: 1,
			logFunction: (corticonLogEntry:any) => console.log(corticonLogEntry)
		};
		this.window.corticonEngine.execute(payload,configuration);
	};
}
