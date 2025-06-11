/**
 * This script waits for the HTML document to be fully loaded before running any code.
 * This prevents errors from trying to access elements that don't exist yet.
 */
document.addEventListener('DOMContentLoaded', () => {
    // This code runs only after the entire page is ready.

    // Attempt to restore any previously saved inputs from the user's last session.
    restoreInputs();

    // Find the form element on the page.
    const form = document.getElementById('retirementForm');

    // If the form exists, listen for the 'submit' event (when the user clicks "Calculate").
    if (form) {
        form.addEventListener('submit', runCalculator);
    } else {
        // Log an error to the console if the form can't be found, for easier debugging.
        console.error('Error: The form with id "retirementForm" was not found.');
    }
});

/**
 * Main function to execute the Corticon decision service.
 * This function is 'async' because it waits for the corticonEngine to finish.
 * @param {Event} event - The form submission event.
 */
async function runCalculator(event) {
    // Prevent the form from submitting in the traditional way, which would reload the page.
    event.preventDefault();

    // 1. Collect all inputs from the form fields.
    const inputs = getAllInputs();

    // Save the user's current inputs to localStorage for the next visit.
    saveInputs();

    // 2. Construct the payload in the format required by this specific Decision Service.
    // The payload is an array containing a single entity object with a "#type" identifier.
    const payload = [{
        "#type": "Individual",
        ...inputs
    }];

    const configuration = { logLevel: 0 }; // Set to 1 for more detailed logging from Corticon.
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<article aria-busy="true">Calculating...</article>';

    // 3. Execute the Decision Service within a try...catch block to handle potential errors.
    try {
        const result = await window.corticonEngine.execute(payload, configuration);

        // 4. Process and display the results.
        // ** CORRECTION: The successful result data is in `result.payload`, not `result.Objects` **
        if (result && result.payload && result.corticon && result.corticon.status === 'success') {
            const individual = result.payload.find(obj => obj['#type'] === 'Individual');

            // Access guidance from *within* the individual object, as shown in the log
            const guidance = individual.guidance || [];

            let html = '<h2>Results</h2>';
            html += `<p><strong>What you'll have:</strong> $${formatNumber(individual.estimatedSavingsAtRetirement)}</p>`;
            html += `<p><strong>What you'll need:</strong> $${formatNumber(individual.targetRetirementSavings)}</p>`;

            if (guidance.length > 0) {
                html += '<h3>Guidance:</h3><ul>';
                guidance.forEach(g => { html += `<li>${g.content}</li>`; });
                html += '</ul>';
            }

            // ** NEW: Add a collapsible section to show all calculated data **
            html += `
                <details>
                    <summary>Show Calculation Details</summary>
                    <pre><code>${JSON.stringify(individual, null, 2)}</code></pre>
                </details>
            `;

            resultsContainer.innerHTML = html;
        } else {
            // If the execution failed, display a clear error message.
            let errorMessage = "An unknown error occurred during rule execution.";
            if (result && result.corticon && result.corticon.messages && result.corticon.messages.length > 0) {
                errorMessage = result.corticon.messages[0].text;
            }
            resultsContainer.innerHTML = `<p><strong>Error executing rules:</strong> ${errorMessage}</p>`;
            console.error("Corticon error details:", JSON.stringify(result, null, 2));
        }
    } catch (e) {
        resultsContainer.innerHTML = `<p>An unexpected JavaScript error occurred: ${e.message}</p>`;
        console.error(e);
    }
}

// === Helper functions to read, save, and restore inputs ===

// A small utility function to format numbers as currency.
function formatNumber(num) {
    if (typeof num === 'number' || (typeof num === 'string' && num.length > 0)) {
        return parseFloat(num).toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return '0';
}

function getAllInputs() {
    return {
        // Note: 'age' is intentionally omitted. The decision service calculates it from dateOfBirth.
        ageOfRetirement: parseInt(document.getElementById('ageOfRetirement').value, 10) || 67,
        lifeExpectancy: parseInt(document.getElementById('lifeExpectancy').value, 10) || 95,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        annualPreTaxIncome: parseFloat(document.getElementById('annualPreTaxIncome').value) || 0,
        currentRetirementSavings: parseFloat(document.getElementById('currentRetirementSavings').value) || 0,
        monthlyContributions: parseFloat(document.getElementById('monthlyContributions').value) || 0,
        otherMonthlyRetirementIncome: parseFloat(document.getElementById('otherMonthlyRetirementIncome').value) || 0,
        preRetirementRateOfReturn: (parseFloat(document.getElementById('preRetirementRateOfReturn').value) || 0) / 100,
        postRetirementRateOfReturn: (parseFloat(document.getElementById('postRetirementRateOfReturn').value) || 0) / 100,
        inflationRate: (parseFloat(document.getElementById('inflationRate').value) || 0) / 100,
        annualIncomeIncrease: (parseFloat(document.getElementById('annualIncomeIncrease').value) || 0) / 100,
        monthlyBudgetInRetirement: (parseFloat(document.getElementById('monthlyBudgetInRetirement').value) || 0) / 100,
    };
}

function saveInputs() {
    const rawInputs = {
        dateOfBirth: document.getElementById('dateOfBirth').value,
        annualPreTaxIncome: document.getElementById('annualPreTaxIncome').value,
        currentRetirementSavings: document.getElementById('currentRetirementSavings').value,
        monthlyContributions: document.getElementById('monthlyContributions').value,
        otherMonthlyRetirementIncome: document.getElementById('otherMonthlyRetirementIncome').value,
        ageOfRetirement: document.getElementById('ageOfRetirement').value,
        lifeExpectancy: document.getElementById('lifeExpectancy').value,
        preRetirementRateOfReturn: document.getElementById('preRetirementRateOfReturn').value,
        postRetirementRateOfReturn: document.getElementById('postRetirementRateOfReturn').value,
        inflationRate: document.getElementById('inflationRate').value,
        annualIncomeIncrease: document.getElementById('annualIncomeIncrease').value,
        monthlyBudgetInRetirement: document.getElementById('monthlyBudgetInRetirement').value
    };
    localStorage.setItem('retirementCalculatorInputs', JSON.stringify(rawInputs));
}

function restoreInputs() {
    const savedInputs = localStorage.getItem('retirementCalculatorInputs');
    if (savedInputs) {
        const inputs = JSON.parse(savedInputs);
        for (const key in inputs) {
            const element = document.getElementById(key);
            if (element) {
                element.value = inputs[key];
            }
        }
    }
}
