# Corticon.js Front-End Framework Examples

This directory demonstrates the portability of a Corticon.js Decision Service by integrating a single, self-contained bundle into four different front-end applications.

The example is a **Retirement Calculator** whose business logic (calculating savings, projecting growth, and providing guidance) is fully contained in one file, `decisionServiceBundle.js`. Each front-end application collects user input, invokes that same bundle, and displays the result.

## The Self-Contained Decision Service

`decisionServiceBundle.js` is a standard JavaScript file containing the compiled Corticon.js rules and the retirement-calculator logic.

- **Portability:** The identical file is used in every example. There are no framework-specific versions of the decision logic.
- **Separation of concerns:** The front-end applications collect input and render output. They contain none of the calculation logic.
- **Maintainability:** When the calculation logic changes, you update the Rulesheets and regenerate `decisionServiceBundle.js`. No front-end changes are required.

## Front-End Examples

Each implementation calls the same Decision Service to perform its calculations.

### [Vanilla JavaScript](retirement-calculator-vanilla-javaScript/)

Plain HTML, CSS, and JavaScript with no framework. The most direct example of using the bundle in a browser.

To run, open `index.html` in a web browser.

### [React](retirement-calculator-react/)

A component-based implementation.

```bash
cd retirement-calculator-react
npm install
npm start
```

### [Vue.js](retirement-calculator-vue/)

A reactive single-file-component implementation.

```bash
cd retirement-calculator-vue
npm install
npm run dev
```

### [Angular](retirement-calculator-angular/)

An Angular CLI implementation demonstrating two-way data binding.

```bash
cd retirement-calculator-angular
npm install
ng serve
```
