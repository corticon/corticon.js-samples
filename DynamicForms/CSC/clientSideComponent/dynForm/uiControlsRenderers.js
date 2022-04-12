corticon.util.namespace( "corticon.dynForm" );

corticon.dynForm.UIControlsRenderer = function () {
// TODO:
// Number field as integer vs decimal -> new field type?

    // Render all UI Controls into the specified basedEl (A Jquery object - typically from a div element)
    // Render all Containers in base element
    // Render all Controls in container element
    // This is the main public entry point
    function renderUI ( containers, baseEl, labelPositionAtUILevel, language ) {
        /* Without JQuery one could create all dynamic elements just using the DOM API.  For example:
        var contEl = document.createElement('div');
        contEl.setAttribute('id', containers[0].id);
        contEl.appendChild(document.createTextNode(containers[0].title));
        document.getElementById('theDynamicUIContainerId').appendChild(contEl);
        */
        // Start with clean component - that is without any UI Controls from previous steps
        baseEl.empty();

        const html = '<div id="' + containers[0].id + '"  title="' + containers[0].title + '"><h3>' + containers[0].title + '</h3></div>';
        baseEl.append(html);

        const uiControls = containers[0].uiControls;
        if ( uiControls === undefined || uiControls === null ) {
            alert('There are no UI Controls to render in this step');
            return;
        }

        for ( var i=0; i<uiControls.length; i++ ) {
            const oneUIControl = uiControls[i];
            if ( oneUIControl.type === 'Text' )
                renderTextInput(oneUIControl, baseEl, labelPositionAtUILevel);
            else if ( oneUIControl.type === 'TextArea' )
                renderTextAreaInput(oneUIControl, baseEl, labelPositionAtUILevel);
            else if ( oneUIControl.type === 'DateTime' )
                renderDateTimeInput(oneUIControl, baseEl, labelPositionAtUILevel);
            else if ( oneUIControl.type === 'YesNo' )
                renderYesNoInput(oneUIControl, baseEl, labelPositionAtUILevel, language);
            else if ( oneUIControl.type === 'ReadOnlyText' )
                renderReadOnlyText(oneUIControl, baseEl, labelPositionAtUILevel);
            else if ( oneUIControl.type === 'Number' )
                renderNumberInput(oneUIControl, baseEl, labelPositionAtUILevel);
            else if ( oneUIControl.type === 'SingleChoice' )
                renderSingleChoiceInput(oneUIControl, baseEl);
            else if ( oneUIControl.type === 'MultipleChoices' )
                renderMultipleChoicesInput(oneUIControl, baseEl, labelPositionAtUILevel);
            else if ( oneUIControl.type === 'MultiExpenses' )
                renderExpenseInput(oneUIControl, baseEl, labelPositionAtUILevel);
            else if ( oneUIControl.type === 'FileUpload' )
                renderFileUploadInput(oneUIControl, baseEl, labelPositionAtUILevel);
            else
                alert('This ui control is not yet supported: '+oneUIControl.type);
        }

        renderContainerValidationMessage(containers[0].validationMsg, baseEl);

        const allFormEls = $(baseEl).find(':input');
        if ( allFormEls !== null && allFormEls.length > 0 )
            allFormEls[0].focus();
    }

// Begin expense
    let nextExpenseId = 0;
    function renderExpenseInput(oneUIControl, baseEl, labelPositionAtContainerLevel) {
        const html = '<div class="expenseInputContainer"></div>';
        const expenseContainerEl = $(html);
        baseEl.append(expenseContainerEl);

        appendLabel(oneUIControl, labelPositionAtContainerLevel, expenseContainerEl);

        createOneExpenseInput(oneUIControl, expenseContainerEl);

        createAddExpenseControl( baseEl, oneUIControl, expenseContainerEl );

        addValidationMsgFromDecisionService(oneUIControl, expenseContainerEl);
    }

    function createAddExpenseControl( baseEl, oneUIControl, expenseContainerEl ) {
        const html = '<div title="Add another expense" class="addExpenseContainer">&nbsp;+&nbsp;</div>';
        const addContainerEl = $(html);
        baseEl.append(addContainerEl);
        addContainerEl.click(function() {
            createOneExpenseInput(oneUIControl, expenseContainerEl);
        });
    }

    function createOneExpenseInput(oneUIControl, expenseContainerEl) {
        nextExpenseId++;
        const inputContainerEl = createInputContainer(expenseContainerEl, true);
        inputContainerEl.data("uicontroltype", oneUIControl.type );  // save it so that we can conditionally add the proper fields when creating the expense object literal in the stepsController.js

        let htmlExpenseType = `<select "id": ${oneUIControl.id}_expType_${nextExpenseId}>`;
        const theOptions = oneUIControl.option;
        if ( theOptions === undefined || theOptions === null ) {
            alert("Missing options for "+oneUIControl.id);
        }
        else {
            if ( theOptions.length > 0 ) {
                for ( var i=0; i<theOptions.length; i++)
                    htmlExpenseType += `<option value="${theOptions[i].value}">${theOptions[i].displayName}</option>`;
            }
            else
                alert('missing list of options for expense control '+oneUIControl.id);
        }

        htmlExpenseType += '</select>';

        const expenseEl = $(htmlExpenseType);
        inputContainerEl.append(expenseEl);

        const theAttributes = { "type": "text", "id": `${oneUIControl.id}_expAmount_${nextExpenseId}`};
        const textInputEl = $('<input class="expenseAmount"/>').attr(theAttributes);
        textInputEl.appendTo(inputContainerEl);
        if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null ) {
            textInputEl.data("fieldName", oneUIControl.fieldName );
            textInputEl.data("type", "array" );
        }
        else
            alert('Missing field name for '+oneUIControl.id);

        addCurrencyDropDown(oneUIControl,inputContainerEl);
    }

    function addCurrencyDropDown(oneUIControl,inputContainerEl) {
        let currency = `<select class="currencySelector" "id": ${oneUIControl.id}_Currency_${nextExpenseId}>`;
        currency += `<option value="USD">$ US Dollars</option>`;
        currency += `<option value="EUR">&euro; Euro</option>`;
        currency += '</select>';

        const currencyEl = $(currency);
        currencyEl.data("fieldName", oneUIControl.fieldName );
        inputContainerEl.append(currencyEl);
    }
// End expense

    function renderSingleChoiceInput(oneUIControl, baseEl) {
        const inputContainerEl = createInputContainer(baseEl);

        if ( oneUIControl.label !== undefined && oneUIControl.label !== null ) {
            const theAttributes = { "type": "checkbox", "id": oneUIControl.id, "name": oneUIControl.id};
            const checkboxInputEl = $('<input/>').attr(theAttributes);
            checkboxInputEl.appendTo(inputContainerEl);
            const checkboxLabelEl = $(`<label for="${oneUIControl.id}">&nbsp;${oneUIControl.label}</label>`)
            checkboxLabelEl.appendTo(inputContainerEl);
            if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
                checkboxInputEl.data("fieldName", oneUIControl.fieldName );
            else
                alert('Missing field name for '+oneUIControl.id);
        }
        else
            alert('Missing label for checkbox '+oneUIControl.id);
    }

    function renderFileUploadInput(oneUIControl, baseEl, labelPositionAtContainerLevel) {
        const inputContainerEl = createInputContainer(baseEl);

        if ( oneUIControl.id === undefined || oneUIControl.id === null ) {
            alert('missing id for fileupload ');
            return;
        }

        /*
        <form action="/action_page.php">
          <input type="file" id="myFile" name="filename">
          <input type="submit">
        </form>

        <label for="fileUpId">Choose a file:</label>
        <input type="file" id="fileUpId" name="xyz">
         */
        if ( oneUIControl.label === undefined || oneUIControl.label === null || oneUIControl.label.length === 0 ) {
            alert('missing label for fileupload '+oneUIControl.id);
            return;
        }
        const fileUpHtml = `<label htmlFor="${oneUIControl.id}">${oneUIControl.label}:</label>
								<input type="file" id="${oneUIControl.id}">`;
        const fileUpEl = $(fileUpHtml);
        inputContainerEl.append(fileUpEl);
        if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
            fileUpEl.data("fieldName", oneUIControl.fieldName );
        else
            alert('Missing field name for '+oneUIControl.id);
    }

    function renderTextInput(oneUIControl, baseEl, labelPositionAtContainerLevel) {
        const inputContainerEl = createInputContainer(baseEl);

        appendLabel(oneUIControl, labelPositionAtContainerLevel, inputContainerEl);

        const theAttributes = { "type": "text", "id": oneUIControl.id };
        if ( oneUIControl.tooltip !== undefined && oneUIControl.tooltip !== null )
            theAttributes["title"] = oneUIControl.tooltip;

        const textInputEl = $('<input/>').attr(theAttributes);
        textInputEl.appendTo(inputContainerEl);
        if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
            textInputEl.data("fieldName", oneUIControl.fieldName );
        else
            alert('Missing field name for '+oneUIControl.id);

        addValidationMsgFromDecisionService(oneUIControl, inputContainerEl);
    }

    function renderTextAreaInput(oneUIControl, baseEl, labelPositionAtContainerLevel) {
        const inputContainerEl = createInputContainer(baseEl);

        appendLabel(oneUIControl, labelPositionAtContainerLevel, inputContainerEl);

        let html3 = `<textarea class="textAreaControl" id="${oneUIControl.id}"`;
        if ( oneUIControl.rows !== undefined && oneUIControl.rows !== null )
            html3 += ` rows="${oneUIControl.rows}"`;

        if ( oneUIControl.cols !== undefined && oneUIControl.cols !== null )
            html3 += ` cols="${oneUIControl.cols}"`;

        if ( oneUIControl.min !== undefined && oneUIControl.min !== null )
            html3 += ` minlength="${oneUIControl.min}"`;

        if ( oneUIControl.max !== undefined && oneUIControl.max !== null )
            html3 += ` maxlength="${oneUIControl.max}"`;

        html3 += `></textarea>`;

        const textInputEl = $(html3);
        textInputEl.appendTo(inputContainerEl);
        if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
            textInputEl.data("fieldName", oneUIControl.fieldName );
        else
            alert('Missing field name for '+oneUIControl.id);

        addValidationMsgFromDecisionService(oneUIControl, inputContainerEl);
    }

    function renderDateTimeInput(oneUIControl, baseEl, labelPositionAtContainerLevel) {
        const inputContainerEl = createInputContainer(baseEl);

        appendLabel(oneUIControl, labelPositionAtContainerLevel, inputContainerEl);

        const theAttributes = { "type": "date", "id": oneUIControl.id};
        if ( oneUIControl.minDT !== undefined && oneUIControl.minDT !== null )
            theAttributes['min'] = oneUIControl.minDT;

        if ( oneUIControl.maxDT !== undefined && oneUIControl.maxDT !== null )
            theAttributes['max'] = oneUIControl.maxDT;

        const textInputEl = $('<input/>').attr(theAttributes);
        textInputEl.appendTo(inputContainerEl);

        if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
            textInputEl.data("fieldName", oneUIControl.fieldName );
        else
            alert('Missing field name for '+oneUIControl.id);

        if ( oneUIControl.minDT !== undefined && oneUIControl.minDT !== null ) {
            const html3 = '<span  class="fieldValidationLabel">Enter a date between ' + oneUIControl.minDT.substr(0,10) + ' and ' + oneUIControl.maxDT.substr(0,10) +'</span>';
            const validationEl = $(html3);
            inputContainerEl.append(validationEl);
        }

        addValidationMsgFromDecisionService(oneUIControl, inputContainerEl);
    }

    function renderNumberInput(oneUIControl, baseEl, labelPositionAtContainerLevel) {
        const inputContainerEl = createInputContainer(baseEl);

        appendLabel(oneUIControl, labelPositionAtContainerLevel, inputContainerEl);

        const html3 = '<span style="display: none;" class="fieldValidationLabel">Enter a number between ' + oneUIControl.min + ' and ' + oneUIControl.max +'</span>';
        const validationEl = $(html3);

        const theAttributes = { "type": "text", "id": oneUIControl.id};
        const textInputEl = $('<input/>').attr(theAttributes);
        textInputEl.appendTo(inputContainerEl);
        if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null ) {
            textInputEl.data("fieldName", oneUIControl.fieldName );
            textInputEl.data("type", "decimal" ); //todo: should add an attrib for doing integer too
        }
        else
            alert('Missing field name for '+oneUIControl.id);

        // there may be a value (default value or when validation fails we re-render with entered data)
        if ( oneUIControl.value !== undefined && oneUIControl.value !== null ) {
            textInputEl.val(oneUIControl.value);
        }

        textInputEl.on("input", function() {
            const input = $(this).val();
            const converted = Number(input);
            if ( isNaN(converted) )
                alert("Please enter a number");
            else {
                if ( converted < oneUIControl.min || converted > oneUIControl.max )
                    validationEl.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
            }
        });

        inputContainerEl.append(validationEl);

        addValidationMsgFromDecisionService(oneUIControl, inputContainerEl);

        if( oneUIControl.min !== undefined )
            validationEl.show();
    }

    function renderReadOnlyText(oneUIControl, baseEl, labelPositionAtContainerLevel) {
        const inputContainerEl = createInputContainer(baseEl);

        appendLabel(oneUIControl, labelPositionAtContainerLevel, inputContainerEl);

        if ( oneUIControl.value !== undefined && oneUIControl.value !== null && oneUIControl.value.length !== 0 ) {
            const html3 = '<div class="readOnlyText">' + oneUIControl.value + '</div>';
            inputContainerEl.append($(html3));
        }
        else
            alert("missing value attribute for renderReadOnlyText id: "+oneUIControl.id);
    }

    function renderYesNoInput(oneUIControl, baseEl, labelPositionAtContainerLevel, language) {
        const inputContainerEl = createInputContainer(baseEl);

        let yes = 'Yes'; let no = 'No';
        if ( language !== undefined && language !== null ) {
            if ( language.toLowerCase() === 'italian' ) {
                yes = 'Si';
            }
        }

        appendLabel(oneUIControl, labelPositionAtContainerLevel, inputContainerEl);

        const html3 = `<select "id": ${oneUIControl.id}>
                        <option value="yes">${yes}</option>
                        <option value="no">${no}</option>
                </select>`;
        const yesNoEl = $(html3);

        if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
            yesNoEl.data("fieldName", oneUIControl.fieldName );
        else
            alert('Missing field name for '+oneUIControl.id);

        inputContainerEl.append(yesNoEl);
    }

    function renderMultipleChoicesInput(oneUIControl, baseEl, labelPositionAtContainerLevel) {
        const inputContainerEl = createInputContainer(baseEl);

        appendLabel(oneUIControl, labelPositionAtContainerLevel, inputContainerEl);

        let html3 = `<select "id": ${oneUIControl.id}>`;
        const theOptions = oneUIControl.option;
        if ( theOptions === undefined || theOptions === null ) {
            alert("Missing options for "+oneUIControl.id);
        }
        else {
            if ( theOptions.length > 0 ) {
                for ( var i=0; i<theOptions.length; i++)
                    html3 += `<option value="${theOptions[i].value}">${theOptions[i].displayName}</option>`;
            }
            else
                alert('missing list of options for multiple choices control '+oneUIControl.id);
        }

        html3 += '</select>';
        const multipleChoicesEl = $(html3);

        if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
            multipleChoicesEl.data("fieldName", oneUIControl.fieldName );
        else
            alert('Missing field name for '+oneUIControl.id);

        inputContainerEl.append(multipleChoicesEl);

        addValidationMsgFromDecisionService(oneUIControl, inputContainerEl);
    }

    function renderContainerValidationMessage(validationMessage, baseEl) {
        if ( validationMessage !== undefined && validationMessage !== null ) {
            const html = `<div class="containerValidationMessage">${validationMessage}</div>`;
            const msgEl = $(html);
            baseEl.append(msgEl);
        }
    }

    function createInputContainer(baseEl, arrayTypeControl=false ) {
        let html;
        if ( arrayTypeControl )
            html = '<div class="arrayTypeControl inputContainer"></div>';  //arrayTypeControl: this is needed as the marker for finding the inputs that have to be stored in an array as opposed to directly in a field.
        else
            html = '<div class="nonarrayTypeControl inputContainer"></div>';

        const inputContainerEl = $(html);
        baseEl.append(inputContainerEl);
        return inputContainerEl;
    }

    function addValidationMsgFromDecisionService(oneUIControl, inputContainerEl) {
        if (oneUIControl.validationErrorMsg !== undefined && oneUIControl.validationErrorMsg !== null) {
            const decisionServiceSideValidationEl = $(`<span class="controlValidationMessage">${oneUIControl.validationErrorMsg}</span>`);
            decisionServiceSideValidationEl.appendTo(inputContainerEl);
        }
    }

    function getLabelPositionForControl(oneUIControl, labelPositionAtContainerLevel) {
        let labelPosition;
        if ( oneUIControl.labelPosition !== undefined && oneUIControl.labelPosition !== null )
            labelPosition = oneUIControl.labelPosition;
        else
            labelPosition = labelPositionAtContainerLevel;

        return labelPosition;
    }

    function appendLabel(oneUIControl, labelPositionAtContainerLevel, inputContainerEl) {
        if (oneUIControl.label !== undefined && oneUIControl.label !== null) {
            let html2;
            const labelPosition = getLabelPositionForControl(oneUIControl, labelPositionAtContainerLevel);
            if (labelPosition === 'Above')
                html2 = '<div class="inputLabelAbove">' + oneUIControl.label + '</div>';
            else
                html2 = '<span class="inputLabelSide">' + oneUIControl.label + '</span>';

            inputContainerEl.append($(html2));
        }
    }

    // public interface
    return {
        renderUI: renderUI,
    }
}
