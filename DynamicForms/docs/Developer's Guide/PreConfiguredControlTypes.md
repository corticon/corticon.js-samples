# Preconfigured Control Types

Below are the types of UI Controls (UI.containers.uiControls.type) that are already implemented in the test drive template. 

| UI Control Type | Multiple Instance Controls | Description | Rendering in Reference Implementation (Test Driver) |
| ----------- | ----------- | ----------- | ----------- |
| ReadOnlyText | No (N/A) | A control to render HTML text | div class="readOnlyText" |
| TextArea | No | A control to render a multi-lines text input | textarea class="textAreaControl" |
| Text      | Yes | A control to render a single line text input | input "type": "text"|
| Number   | Yes | A control to render a single number input | input "type": "text"|
| DateTime   | Yes | A control to render a date time or a date input (based on attribute showTime) | input type="datetime-local" or input type="date" |
| SingleChoice   | (N/A)  | A control to render a single choice input - typically rendered as a checkbox or ON/OFF item | input type="checkbox" |
| MultipleChoices   | (N/A)  |  A control to render a multi-choice input.  The user can only selects one of the choice - typically rendered as a dropdown | select |
| MultipleChoicesMultiSelect | (N/A) | A control to render a multi-choice input.  The user can select 1 to all of the choice | select multiple |
| YesNo   | (N/A)  | A control to render a binary yes - no choice.  This is a short cut to creating a multi choices control with yes and no values | select with 2 values, yes and no |
| FileUpload   | No | A control to render a file upload control.  | input type="file" with appropriate label |
| MultiExpenses   | Yes | An example to render a complex control (see below for details on simple vs complex controls).  | It contain 3 primitive UI elements: an expense type selector, an expense amount input and a currency selector. |
