# Dynamic Form
This Corticon.js browser sample aims to illustrate the common use case of a dynamic user questionnaire. 

This sample shows off a number of different uses of Corticon.js inside of a form:
- Storing Configurable Data (that some business analyst could change on the fly)
- Conditionally showing a field/step that is already part of the form
- Conditionally generating a field in the view based on the Decision Service output
- Separating your Decisions Service into local and server so users do not have access to certain information

## Setup
If you have all the files, all you have to do to run it is open up home.html, preferrably in Chrome as that is where this was tested.

You can also host this webpage anywhere and view it both on browser and mobile. This sample renders perfectly well on mobile applications!

## Demoing
This sample aims to be very accessible. It is not only very easy to setup, but there are also explanations built into the sample about what is happening at each step. 

In a demo you can choose to either show or skip the small text sections on Cortion.js by clicking straight on the 'View Your Quote' button in the very top section. Most of those text sections are there to add context in case of an unguided demo.

For the dynamic form there are 6 steps in total

Step 1) User selects car from a selection of cars that are fetched from the Decision Service
- This means that some business department could modify which cars are shown whenever they want to
- This paradigm applies to any kind of configurable data

Step 2) User is asked for First Name/Last Name + DoB. The User's age may affect eventual price quote

Step 3) User is asked for Address/City/Profession
- City may affect price quote
- Profession is the key field. Depending on the selection, the next couple steps will be affected

Step 4) A call is made to the Decision Service. If the Decision Service decides so (based on the profession), a step asking for more detailed information about the profession is shown to the user
- This step is already part of the application and is shown or hidden based on the Decision Service
- Similarly specific fields could be shown/hidden in the same manner
- If the User picked 'Other' as profession, this step will be hidden

Step 5) Similar to step 4, however in this case the form fields itself are configured by the Decision Service
- in this case, the Decision Service told the application that it should show the user a text field called 'Employee ID Number' as well as a select dropdown named 'Employer' with specified selection options
- the application then uses JQuery to create these fields

Step 6) The actual price quote. This uses a separate Decision Service to illustrate the fact that you may want the flexibility to hide certain confidential methodologies like pricing for example in a server Decision Service.

## JQuery
JQuery is used in place of any heavyweight JavaScript framework because we wanted to a sample that would run in the browser with no setup required.

## Getting Around
[home.html](home.html) - All the markup resides here

[main.js](assets/js/main.js) - Some of the application wide JavaScript 

[corticon.js](assets/js/corticon.js) - All of the dynamic form JavaScript happens here

[main.css](assets/css/main.css) - There's a lot of css here. Most of the form specific css is at the bottom.

[decisionServiceBundle.js](corticon/decisionServiceBundle.js) - The local Decision Service that contains teh configured cars and handles the conditional fields

[decisionServiceBundle.server.js](corticion/decisionServiceBundle.server.js) - The "server" Decision Service that handles the price quote. This is seperated to illustrate the point that you could host this file however you want.

## Attribution
This sample is based off of HTML5UP Zerofour by @ajlkn