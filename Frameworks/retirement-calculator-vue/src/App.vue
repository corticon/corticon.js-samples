<script setup>
import { reactive, ref, onMounted } from 'vue';

// This component assumes that `window.corticonEngine` is globally available
// from the script tag included in the main index.html file.

// State management using Vue's Composition API
const inputs = reactive({
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
const results = ref(null);
const isLoading = ref(false);
const error = ref(null);

// Lifecycle hook to load data when the component is mounted
onMounted(() => {
    try {
        const savedInputs = localStorage.getItem('vueRetirementInputs');
        if (savedInputs) {
            Object.assign(inputs, JSON.parse(savedInputs));
        }
    } catch (e) {
        console.warn('Could not restore inputs from localStorage.');
    }
});

// Main calculation logic
const calculate = async () => {
    isLoading.value = true;
    error.value = null;
    results.value = null;
    localStorage.setItem('vueRetirementInputs', JSON.stringify(inputs));

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
            results.value = result.payload.find(obj => obj['#type'] === 'Individual');
        } else {
            error.value = result?.corticon?.messages?.[0]?.text || "An unknown error occurred during rule execution.";
            console.error("Corticon error details:", result);
        }
    } catch (e) {
        error.value = `An unexpected JavaScript error occurred: ${e.message}`;
        console.error(e);
    }
    isLoading.value = false;
};

// Formatting helper for currency display
const formatNumber = (num) => {
    if (typeof num === 'number' || (typeof num === 'string' && num.length > 0)) {
        return parseFloat(num).toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return '0';
};
</script>

<template>
  <main class="container">
    <h1>Retirement Calculator (Vue.js)</h1>
    <form @submit.prevent="calculate">
      <div class="grid">
        <label>Date of Birth:<input type="date" v-model="inputs.dateOfBirth"></label>
        <label>Annual Pre-Tax Income:<input type="number" v-model.number="inputs.annualPreTaxIncome" step="1000"></label>
      </div>
      <div class="grid">
        <label>Current Retirement Savings:<input type="number" v-model.number="inputs.currentRetirementSavings" step="1000"></label>
        <label>Monthly Contributions ($):<input type="number" v-model.number="inputs.monthlyContributions" step="50"></label>
      </div>
      <div class="grid">
        <label>Other Monthly Retirement Income ($):<input type="number" v-model.number="inputs.otherMonthlyRetirementIncome" step="50"></label>
      </div>

       <details>
          <summary>Advanced Details</summary>
          <div class="grid grid-3">
              <label>Retirement Age:<input type="number" v-model.number="inputs.ageOfRetirement"></label>
              <label>Life Expectancy:<input type="number" v-model.number="inputs.lifeExpectancy"></label>
          </div>
          <div class="grid grid-3">
              <label>Pre-Retirement Return (%):<input type="number" v-model.number="inputs.preRetirementRateOfReturn" step="0.1"></label>
              <label>Post-Retirement Return (%):<input type="number" v-model.number="inputs.postRetirementRateOfReturn" step="0.1"></label>
              <label>Inflation Rate (%):<input type="number" v-model.number="inputs.inflationRate" step="0.1"></label>
          </div>
          <div class="grid grid-3">
              <label>Annual Income Increase (%):<input type="number" v-model.number="inputs.annualIncomeIncrease" step="0.1"></label>
              <label>Retirement Budget (% of Income):<input type="number" v-model.number="inputs.monthlyBudgetInRetirement" step="1"></label>
          </div>
      </details>

      <button type="submit" :aria-busy="isLoading" :disabled="isLoading" style="margin-top: 1rem;">Calculate</button>
    </form>

    <div style="margin-top: 2rem;">
      <article v-if="isLoading" aria-busy="true"></article>
      <article v-if="error" style="background-color: var(--pico-form-element-invalid-background-color)"><strong>Error:</strong> {{ error }}</article>
      <section v-if="results">
        <h2>Results</h2>
        <p><strong>What you'll have:</strong> ${{ formatNumber(results.estimatedSavingsAtRetirement) }}</p>
        <p><strong>What you'll need:</strong> ${{ formatNumber(results.targetRetirementSavings) }}</p>
        <div v-if="results.guidance && results.guidance.length > 0">
          <h3>Guidance:</h3>
          <ul>
            <li v-for="(g, index) in results.guidance" :key="index">{{ g.content }}</li>
          </ul>
        </div>
        <details>
            <summary>Show Calculation Details</summary>
            <pre><code>{{ JSON.stringify(results, null, 2) }}</code></pre>
        </details>
      </section>
    </div>
  </main>
</template>

<style>
  /* You can add global styles here or in a separate CSS file */
  .container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
  }
  .grid-3 {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  details {
      border: 1px solid var(--pico-muted-border-color);
      padding: 1rem;
      border-radius: var(--pico-border-radius);
      margin-top: 1rem;
  }
  summary {
      font-weight: bold;
      cursor: pointer;
  }
</style>
