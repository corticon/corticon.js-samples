import React, { useState, useEffect } from 'react';

// This component assumes that `window.corticonEngine` is globally available
// from the script tag included in the main index.html file.

// A helper function to format numbers as currency.
function formatNumber(num) {
    if (typeof num === 'number' || (typeof num === 'string' && num.length > 0)) {
        return parseFloat(num).toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return '0';
}

export default function App() {
    const [inputs, setInputs] = useState({
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
    });
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Effect to load saved inputs from localStorage when the component mounts
    useEffect(() => {
        try {
            const savedInputs = localStorage.getItem('reactRetirementInputs');
            if (savedInputs) {
                setInputs(JSON.parse(savedInputs));
            }
        } catch (e) {
            console.warn('Could not restore inputs from localStorage.');
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setInputs(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResults(null);
        localStorage.setItem('reactRetirementInputs', JSON.stringify(inputs));

        const payload = [{
            "#type": "Individual",
            dateOfBirth: inputs.dateOfBirth,
            annualPreTaxIncome: inputs.annualPreTaxIncome,
            currentRetirementSavings: inputs.currentRetirementSavings,
            monthlyContributions: inputs.monthlyContributions,
            otherMonthlyRetirementIncome: inputs.otherMonthlyRetirementIncome,
            ageOfRetirement: inputs.ageOfRetirement,
            lifeExpectancy: inputs.lifeExpectancy,
            preRetirementRateOfReturn: inputs.preRetirementRateOfReturn / 100,
            postRetirementRateOfReturn: inputs.postRetirementRateOfReturn / 100,
            inflationRate: inputs.inflationRate / 100,
            annualIncomeIncrease: inputs.annualIncomeIncrease / 100,
            monthlyBudgetInRetirement: inputs.monthlyBudgetInRetirement / 100,
        }];

        try {
            const result = await window.corticonEngine.execute(payload, { logLevel: 0 });

            if (result && result.payload && result.corticon.status === 'success') {
                const individual = result.payload.find(obj => obj['#type'] === 'Individual');
                setResults(individual);
            } else {
                const errorMessage = result?.corticon?.messages?.[0]?.text || "An unknown error occurred during rule execution.";
                setError(errorMessage);
                console.error("Corticon error details:", result);
            }
        } catch (e) {
            setError(`An unexpected JavaScript error occurred: ${e.message}`);
            console.error(e);
        }
        setIsLoading(false);
    };

    return (
        <main className="container">
            <h1>Retirement Calculator (React)</h1>
            <form onSubmit={handleCalculate}>
                 {/* Re-using the same form structure with React-specific attributes */}
                <div className="grid">
                    <label>Date of Birth:<input type="date" name="dateOfBirth" value={inputs.dateOfBirth} onChange={handleInputChange} /></label>
                    <label>Annual Pre-Tax Income:<input type="number" name="annualPreTaxIncome" value={inputs.annualPreTaxIncome} onChange={handleInputChange} step="1000" /></label>
                </div>
                 <div className="grid">
                     <label>Current Retirement Savings:<input type="number" name="currentRetirementSavings" value={inputs.currentRetirementSavings} onChange={handleInputChange} step="1000" /></label>
                    <label>Monthly Contributions ($):<input type="number" name="monthlyContributions" value={inputs.monthlyContributions} onChange={handleInputChange} step="50" /></label>
                </div>
                 <div className="grid">
                     <label>Other Monthly Retirement Income ($):<input type="number" name="otherMonthlyRetirementIncome" value={inputs.otherMonthlyRetirementIncome} onChange={handleInputChange} step="50" /></label>
                </div>
                <button type="submit" disabled={isLoading}>Calculate</button>
            </form>

            <div style={{ marginTop: '2rem' }}>
                {isLoading && <article aria-busy="true">Calculating...</article>}
                {error && <article style={{backgroundColor: 'var(--pico-form-element-invalid-background-color)'}}><strong>Error:</strong> {error}</article>}
                {results && (
                    <section>
                        <h2>Results</h2>
                        <p><strong>What you'll have:</strong> ${formatNumber(results.estimatedSavingsAtRetirement)}</p>
                        <p><strong>What you'll need:</strong> ${formatNumber(results.targetRetirementSavings)}</p>

                        {results.guidance && results.guidance.length > 0 && (
                            <>
                                <h3>Guidance:</h3>
                                <ul>{results.guidance.map((g, index) => <li key={index}>{g.content}</li>)}</ul>
                            </>
                        )}
                         <details>
                            <summary>Show Calculation Details</summary>
                            <pre><code>{JSON.stringify(results, null, 2)}</code></pre>
                        </details>
                    </section>
                )}
            </div>
        </main>
    );
}
