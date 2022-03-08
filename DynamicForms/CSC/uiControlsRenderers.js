// TODO:
// rows and cols params on text area
// Number field as integer vs decimal -> new field type?

function renderUI ( containers ) {
    // Render Container in its own element
    // Render all Controls in container element
    /* Without JQuery one could create all dynamic elements just using the DOM API.  For example:
    var contEl = document.createElement('div');
    contEl.setAttribute('id', containers[0].id);
    contEl.appendChild(document.createTextNode(containers[0].title));
    document.getElementById('dynUIContainerId').appendChild(contEl);
    */
    const baseEl = $('#dynUIContainerId');
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
            renderTextInput(oneUIControl, baseEl);
        else if ( oneUIControl.type === 'TextArea' )
            renderTextAreaInput(oneUIControl, baseEl);
        else if ( oneUIControl.type === 'DateTime' )
            renderDateTimeInput(oneUIControl, baseEl);
        else if ( oneUIControl.type === 'YesNo' )
            renderYesNoInput(oneUIControl, baseEl);
        else if ( oneUIControl.type === 'ReadOnlyText' )
            renderReadOnlyText(oneUIControl, baseEl);
        else if ( oneUIControl.type === 'Number' )
            renderNumberInput(oneUIControl, baseEl);
        else if ( oneUIControl.type === 'SingleChoice' )
            renderSingleChoiceInput(oneUIControl, baseEl);
        else if ( oneUIControl.type === 'MultipleChoices' )
            renderMultipleChoicesInput(oneUIControl, baseEl);
        else if ( oneUIControl.type === 'FileUpload' )
            renderFileUploadInput(oneUIControl, baseEl);
        else
            alert('This ui control is not yet supported: '+oneUIControl.type);
    }

    renderContainerValidationMessage(containers[0].validationMsg, baseEl);
}

function renderContainerValidationMessage(validationMessage, baseEl) {
    if ( validationMessage !== undefined && validationMessage !== null ) {
        const html = `<div class="containerValidationMessage">${validationMessage}</div>`;
        const msgEl = $(html);
        baseEl.append(msgEl);
    }
}

function renderSingleChoiceInput(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

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

function renderFileUploadInput(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

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
    if ( oneUIControl.id === undefined || oneUIControl.id === null ) {
        alert('missing id for fileupload ');
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

function renderTextInput(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

    if ( oneUIControl.label !== undefined && oneUIControl.label !== null ) {
        const html2 = '<span class="inputLabel">' + oneUIControl.label + '</span>';
        inputContainerEl.append($(html2));
    }

    const theAttributes = { "type": "text", "id": oneUIControl.id };
    if ( oneUIControl.tooltip !== undefined && oneUIControl.tooltip !== null )
        theAttributes["title"] = oneUIControl.tooltip;

    const textInputEl = $('<input/>').attr(theAttributes);
    textInputEl.appendTo(inputContainerEl);
    if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
        textInputEl.data("fieldName", oneUIControl.fieldName );
    else
        alert('Missing field name for '+oneUIControl.id);
}

function renderTextAreaInput(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

    if ( oneUIControl.label !== undefined && oneUIControl.label !== null ) {
        const html2 = '<span class="inputLabel">' + oneUIControl.label + '</span>';
        inputContainerEl.append($(html2));
    }

    let rows = 5;
    let cols = 80;
    const html3 = `<textarea id="${oneUIControl.id}" rows="${rows}" cols="${cols}"></textarea>`;

    const textInputEl = $(html3);
    textInputEl.appendTo(inputContainerEl);
    if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
        textInputEl.data("fieldName", oneUIControl.fieldName );
    else
        alert('Missing field name for '+oneUIControl.id);
}

function renderDateTimeInput(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

    if ( oneUIControl.label !== undefined && oneUIControl.label !== null ) {
        const html2 = '<span class="inputLabel">' + oneUIControl.label + '</span>';
        inputContainerEl.append($(html2));
    }

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
}

function renderNumberInput(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

    const html2 = '<span class="inputLabel">' + oneUIControl.label + '</span>';
    inputContainerEl.append($(html2));

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

    if( oneUIControl.validationErrorMsg !== undefined && oneUIControl.validationErrorMsg !== null ) {
        const decisionServiceSideValidationEl = $(`<span class="controlValidationMessage">${oneUIControl.validationErrorMsg}</span>`);
        decisionServiceSideValidationEl.appendTo(inputContainerEl);
    }

    if( oneUIControl.min !== undefined )
        validationEl.show();
}

function renderReadOnlyText(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

    if ( oneUIControl.label !== undefined && oneUIControl.label !== null && oneUIControl.label.length !== 0 ) {
        const html2 = '<span class="inputLabel">' + oneUIControl.label + '</span>';
        inputContainerEl.append($(html2));
    }

    if ( oneUIControl.value !== undefined && oneUIControl.value !== null && oneUIControl.value.length !== 0 ) {
        const html3 = '<span  class="readOnlyText">' + oneUIControl.value + '</span>';
        inputContainerEl.append($(html3));
    }
    else
        alert("missing value attribute for renderReadOnlyText id: "+oneUIControl.id);
}

function renderYesNoInput(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

    if ( oneUIControl.label !== undefined && oneUIControl.label !== null && oneUIControl.label.length !== 0 ) {
        const html2 = '<span class="inputLabel">' + oneUIControl.label + '</span>';
        inputContainerEl.append($(html2));
    }

    const html3 = `<select "id": ${oneUIControl.id}>
								<option value="yes">Yes</option>
								<option value="no">No</option>
							</select>`;
    const yesNoEl = $(html3);

    if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
        yesNoEl.data("fieldName", oneUIControl.fieldName );
    else
        alert('Missing field name for '+oneUIControl.id);


    inputContainerEl.append(yesNoEl);
}

function renderMultipleChoicesInput(oneUIControl, baseEl) {
    const html = '<div class="inputContainer"></div>';
    const inputContainerEl = $(html);
    baseEl.append(inputContainerEl);

    if ( oneUIControl.label !== undefined && oneUIControl.label !== null && oneUIControl.label.length !== 0 ) {
        const html2 = '<span class="inputLabel">' + oneUIControl.label + '</span>';
        inputContainerEl.append($(html2));
    }

    let html3 = `<select "id": ${oneUIControl.id}>`;
    const theOptions = oneUIControl.option;
    if ( theOptions.length > 0 ) {
        for ( var i=0; i<theOptions.length; i++)
            html3 += `<option value="${theOptions[i].value}">${theOptions[i].displayName}</option>`;
    }
    else
        alert('missing list of options for multiple choices control '+oneUIControl.id);

    html3 += '</select>';
    const multipleChoicesEl = $(html3);

    if ( oneUIControl.fieldName !== undefined && oneUIControl.fieldName !== null )
        multipleChoicesEl.data("fieldName", oneUIControl.fieldName );
    else
        alert('Missing field name for '+oneUIControl.id);

    inputContainerEl.append(multipleChoicesEl);
}
