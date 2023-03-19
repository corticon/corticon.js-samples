This demonstrates a browser side decision service that creates a localizable model for a dynamic form.  

The model is localized to the requested language in the input payload or if no language is specified 
the service callout reads the user's preferred language from the browser setting.

The localization is achieved with a service callout that executes as the last step of creating the model.
It updates the containers title as well as the UI labels and tooltips for the specified language.