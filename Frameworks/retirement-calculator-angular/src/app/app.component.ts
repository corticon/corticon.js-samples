// File: src/app/app.component.ts

// This tells TypeScript that 'corticonEngine' is a global variable
// that will be available at runtime.
declare const corticonEngine: any;

import { Component, OnInit } from '@angular/core';
// Import CommonModule for pipes and directives like *ngIf, and FormsModule for [(ngModel)].
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true, // Mark the component as standalone
  imports: [
    CommonModule, // Import for common directives and pipes
    FormsModule   // Import for two-way data binding with [(ngModel)]
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // The 'inputs' object holds all the data bound to our form fields.
  inputs = {
    dateOfBirth: "1993-11-05",
    annualPreTaxIncome: 60000,
    currentRetirementSavings: 30000,
    monthlyContributions: 500,
    otherMonthlyRetirementIncome: 0,
    ageOfRetirement: 67,
    lifeExpectancy: 95,
    preRetirementRateOfReturn: 6,
    postRetirementRateOfReturn: 5,
    inflationRate: 3,
    annualIncomeIncrease: 2,
    monthlyBudgetInRetirement: 70
  };

  // These properties will hold the state of our application (the results, loading status, and any errors).
  results: any = null;
  isLoading = false;
  error: string | null = null;

  // ngOnInit is a lifecycle hook that runs once when the component is first initialized.
  ngOnInit() {
    // We try to load any previously saved inputs from the user's browser.
    try {
      const savedInputs = localStorage.getItem('angularRetirementInputs');
      if (savedInputs) {
        this.inputs = JSON.parse(savedInputs);
      }
    } catch (e) {
      console.warn('Could not restore inputs from localStorage.');
    }
  }

  // This is the main function that gets called when the form is submitted.
  // It's 'async' because it needs to 'await' the result from the Corticon engine.
  async calculate() {
    this.isLoading = true;
    this.error = null;
    this.results = null;
    localStorage.setItem('angularRetirementInputs', JSON.stringify(this.inputs));

    // We build the payload object in the exact format the decision service expects.
    const payload = [{
      "#type": "Individual",
      ...this.inputs,
      // We must convert the percentage values from the form (e.g., 6) to decimals (e.g., 0.06).
      preRetirementRateOfReturn: this.inputs.preRetirementRateOfReturn / 100,
      postRetirementRateOfReturn: this.inputs.postRetirementRateOfReturn / 100,
      inflationRate: this.inputs.inflationRate / 100,
      annualIncomeIncrease: this.inputs.annualIncomeIncrease / 100,
      monthlyBudgetInRetirement: this.inputs.monthlyBudgetInRetirement / 100,
    }];

    // We call the Corticon engine and handle the results.
    try {
      const result = await corticonEngine.execute(payload, { logLevel: 0 });

      if (result && result.payload && result.corticon.status === 'success') {
        this.results = result.payload.find((obj: any) => obj['#type'] === 'Individual');
      } else {
        this.error = result?.corticon?.messages?.[0]?.text || "An unknown error occurred.";
        console.error("Corticon error details:", result);
      }
    } catch (e: any) {
      this.error = `An unexpected JavaScript error occurred: ${e.message}`;
      console.error(e);
    }
    this.isLoading = false;
  }

  // A simple helper function to make sure numbers are formatted correctly for the template.
  formatNumber(num: any): number {
    return parseFloat(num);
  }
}