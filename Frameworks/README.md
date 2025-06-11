# Corticon.js Front-End Framework Examples

This project demonstrates the power and portability of a Corticon.js decision service by showing how a single, self-contained bundle can be seamlessly integrated into multiple front-end environments.

The core of this project is a **Retirement Calculator** whose complex business logic (calculating savings, projecting growth, and providing guidance) is entirely encapsulated within a single file: `decisionServiceBundle.js`.

This bundle is then consumed by four different front-end applications, each built with a different popular technology.

---

## The Self-Contained Decision Service

The `decisionServiceBundle.js` file is a standard JavaScript file that contains the complete, compiled Corticon rules engine and the specific rules for the retirement calculator.

### Key Benefits:
- **Portability:** The exact same file is used in every example. There are no framework-specific versions. This means you can "write once, run anywhere" for your business logic.
- **Separation of Concerns:** The front-end applications don't need to know anything about the complex financial calculations. Their only job is to collect user input and display the results returned by the decision service.
- **Maintainability:** If the retirement calculation logic needs to be updated (e.g., to account for new tax laws), you only need to update the rules and regenerate the `decisionServiceBundle.js` file. No changes are required in any of the front-end applications.

---

## Front-End Examples

This repository contains four different implementations of the retirement calculator front end. Each one calls the same decision service to perform its calculations.

### 1. [Vanilla JavaScript](./retirement-calculator-vanilla-javaScript/)
A plain HTML, CSS, and JavaScript implementation with no external frameworks. This is the most direct example of using the Corticon.js bundle in a browser.
- **To Run:** Simply open the `index.html` file in a web browser.

### 2. [React](./retirement-calculator-react/)
A modern, component-based implementation using Create React App.
- **To Run:**
  ```bash
  cd retirement-calculator-react
  npm install
  npm start

### 3. [Vue.js](retirement-calculator-vue)
An implementation using the Vue.js framework, featuring a clean, reactive single-file component.

To Run:

cd retirement-calculator-vue
npm install
npm run dev

### 4. [Angular](retirement-calculator-angular)
A robust implementation using the Angular framework, demonstrating two-way data binding and integration with the Angular CLI.

To Run:

cd retirement-calculator-angular
npm install
ng serve
