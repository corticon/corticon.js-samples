# Corticon.js Samples

This repository contains sample Decision Services and integration examples for Corticon.js across a range of JavaScript environments, from importable Studio rule projects to full browser, framework, and service-integration applications.

## Prerequisites

- **Corticon.js Studio** to open, author, and package the rule projects.
- **Node.js** (LTS) for the framework, service-callout, and application samples.
- Individual samples may require additional software, databases, or API credentials. Check each sample's own README before running it.

## Quick Start

1. Choose a track from the #sample-index below.
2. Open that folder's README for setup and run instructions.
3. For import-ready Studio assets, start with Importable-Rule-Projects/README.md.

## About Corticon.js

Corticon.js executes business rules as self-contained JavaScript. Rules authored in Corticon.js Studio are packaged into portable bundles that run in the browser, on mobile devices, in Node.js services, or in serverless and cloud environments, allowing decision logic to execute close to the application, user, or data.

Common uses demonstrated in this repository include:

- Importable rule projects for learning and reuse in Corticon.js Studio
- Custom rule operators written in JavaScript
- Service callouts that integrate rules with REST APIs, databases, and GraphQL sources
- Rule-driven dynamic forms
- Decision Services embedded in Angular, React, Vue, and vanilla JavaScript applications
- Serverless and cloud-workflow integrations

## Sample Index

The repository is organized into the tracks below, grouped by purpose.

### Rule Projects and Studio Assets

#### Importable-Rule-Projects/README.md
Prebuilt rule projects that can be imported directly into Corticon.js Studio, including transactional rule projects, dynamic-form samples, and the DailyInsurance example. This is the recommended starting point.

#### ExtendedOperators/README.md
Rule projects extended with custom rule operators written in JavaScript, covering session-data operators and financial calculations.

#### ServiceCallOut/README.md
Rule projects extended with service callouts that integrate decision logic with external systems, including REST APIs, PostgreSQL, MarkLogic, GraphQL, and asynchronous data access.

### Applications and Integrations

#### DynamicForms/README.md
A rule-driven client-side component for rendering dynamic, multi-step forms whose flow, visibility, and validation are controlled by Corticon.js rules rather than front-end code.

#### Frameworks/README.md
The same Corticon.js Decision Service running in Angular, React, Vue, and vanilla JavaScript, using a retirement-calculator example to compare framework integration patterns.

#### Auto-Insurance/README.md
An auto-insurance decisioning example, including supporting vehicle-fact data and tooling.

### Guides and Prototypes

#### HowTo/AsynchronousInvocation
A focused example demonstrating asynchronous invocation of a Corticon.js Decision Service.

#### Prototypes
Experimental and exploratory samples. These are provided for reference and are not intended as production patterns.

## Related Corticon Repositories

- [corticon/corticon-classic-samples](https://github.com/corticon/corticon-classic-samples)
- [corticon/corticon-dynamic-forms](https://github.com/corticon/corticon-dynamic-forms)
- [corticon/corticon-on-marklogic](https://github.com/corticon/corticon-on-marklogic)

## Documentation

- [Corticon.js Studio guide](https://docs.progress.com/bundle/corticon-js-quick-reference/page/A-guide-to-Progress-Corticon.js-Studio.html)
- [Corticon documentation](https://docs.progress.com/category/corticon-information-hub)
