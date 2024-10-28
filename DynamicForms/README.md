# Dynamic Forms with Corticon.js

Creating a dynamic form can be a slog even when you know what you're doing. But with Corticon.js, dynamic forms can be created in a fraction of the time, with substantial contributions from non-developers, and through a framework-agnostic design pattern that maximizes the reusability of form logic.

Try a Corticon.js rules-driven dynamic form with the [test driver on Codepen](https://codepen.io/SethMeldon/pen/wvOGvra).

## What we mean by dynamic forms

It's common to fill out forms and most frameworks can easily handle simple forms, but dynamic forms are more challenging to create and maintain. The complexity in those two directions could be exacerbated when there is a use case with hundreds of fields and questions that should be entered by the users. This could be especially difficult for customers that need to deal with a vast number of rules that change over time. This leads to many possible paths for the end user to take (e.g., filling out an insurance claim).

One of the biggest challenges is how to manage those rules and systematize them into a single system and test those paths in a robust way without putting in manual labor. Another related problem is how those rules are defined (via descriptive language, UI, etc.) and whether a businessperson can write them down without having any technical experience.

The last element of the array of problems is how to visualize all those rules on the frontend as a form without asking your developers to have domain knowledge of your business processes, and of course, how to maintain any changes without taking days for implementation and regression testing.

## Dynamic Forms with Corticon.js

Dynamic Forms are just one use case for Corticon.js. The dynamic form solution is architected around having a model/view, where:

* The model is generated from the rules system.
* A generic UI component capable of rendering the instructions from the model is acting as the view. The component can be hosted in any Web app or in mobile apps.

In a nutshell, Corticon.js provides a model-driven interactive development interface called Corticon.js Studio within which users define business rules that will change input data based upon specified conditions.

Traditionally, you might think a rules engine is just used to automate a decision based upon data that is already known and available; for example, calculating a loan rate based upon the data known about an applicant.

But in this case, we're going to be gathering data from the end user filling out the form, dynamically presenting additional user prompts which are conditioned on previous answers. Think of this design pattern as the cold metal body of a robot and the 'brain' which gives it instructions on what to do, when, how, and based on what conditions.

Rule modelers (who could be developers or could be business analysts who aren't coders but are comfortable in Excel) use Corticon.js Studio to build the brain of the robot. OK, less a brain than a JavaScript file.

Front end developers will handle its body, starting from an open source form rendering template. Rules are defined in Corticon.js which specify what prompts to present to the user, the input type for responding to the prompt, in what order to present the prompts, constraints/validations on the entered data, how the previous responses may or may not impact subsequent prompts, and when the requisite data has been gathered and is ready to be passed along to downstream systems. While this logic is all defined in Corticon.js Studio, it will ultimately be transformed (or, technically, transpiled) into a Decision Service JavaScript bundle.

The front end rendering component in turn will be responsible for the styling of the forms' user interface and prompts, invoking the decision service when the user hits 'next', and rendering the components of the form that the decision service specifies, along with any constraints and validations it specifies.

For example, consider an insurance quoting form. An optimal dynamic form for the quoting process should:

* Guide the end user through the quoting process in the most efficient way possible—not wasting the end users' time with inapplicable inquiries such as 'Please Select a Vehicle Make (if applicable)' for a renter's insurance policy, or ask for the applicant's home address if we already know that they're an existing customer and thus we know this information already.
* Not risk the end user abandoning the quoting process by making calls to a server every time something dynamic must happen.
* At each juncture where the form determines what information is needed, evaluate the accrued user provided data, data already known about the user (e.g. via them being logged in and their info populated from a CRM), or data retrieved live from external endpoints
* Maintain form rendering logic (rendering component only knows that when it is told to render a multi select dropdown UI component, it will look and behave like this) as a separate but interoperable component from the content of the prompt/responses itself (decision service logic doesn't care how the multi select dropdown looks or behave, but the content of the prompt should be X, the options should be populated from the array Y, and the selection of the end user's selected value should be captured in the browser session storage under fieldname Z.

To get you started building forms, we provide a form accelerator template which is made up of:

* A base Corticon.js Rule Vocabulary comprised of the UI definition components that are able to render by the rendering HTML out of the box
* A 'test driver' html page which allows form developers to test the form as they go and see how the different components work together
* JS files which serve as the glue between the Decision Service file and the front end HTML. These will be preconfigured to 'translate' the terminology used in the rule vocabulary to specify UI components into the actual HTML input types etc.
