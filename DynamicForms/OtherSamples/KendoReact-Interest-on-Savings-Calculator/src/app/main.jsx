import * as React from "react";
import * as ReactDOM from "react-dom";
import { Form, Field, FormElement } from "@progress/kendo-react-form";
import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { FormNumericTextBox } from "./form-components";
import { requiredValidator } from "./validators";
import { TextArea } from "@progress/kendo-react-inputs";

const App = () => {
  const [showRatePeriodInterval, setRatePeriodInterval] = React.useState(false);

  const [resultValue, setResultValue] = React.useState("");

  const [message, setMessage] = React.useState("");

  const runDecisionService = (value) => {
    const configuration = { logLevel: 0 };

    const result = window.corticonEngine.execute(value, configuration);

    if (result.corticon.status === "success") {
      setMessage(result.corticon.messages.message[0].text);
      setResultValue(JSON.stringify(result, null, 2));
    }
  };

  const handleSubmit = (dataItem) => {
    runDecisionService(dataItem);
  };

  const interestType = ["simple", "compounded"];
  const ratePeriodInterval = ["daily", "weekly", "monthly", "annually"];

  return (
    <React.Fragment>
      <Form
        onSubmit={handleSubmit}
        render={(formRenderProps) => (
          <FormElement
            style={{
              width: 400
            }}
          >
            <fieldset className={"k-form-fieldset"}>
              <legend className={"k-form-legend"}>Interest on Savings</legend>

              <Field
                id={"principal"}
                name={"principal"}
                label={"Starting amount"}
                format={"c2"}
                component={FormNumericTextBox}
                validator={requiredValidator}
              />

              <Field
                id={"termYears"}
                name={"termYears"}
                label={"How many years from  now?"}
                format={""}
                component={FormNumericTextBox}
                validator={requiredValidator}
              />

              <Field
                id={"interestType"}
                name={"interestType"}
                label={"Simple or Compound Interest"}
                data={interestType}
                component={DropDownList}
                validator={requiredValidator}
                onChange={(e) => {
                  if (e.value === "simple") {
                    setRatePeriodInterval(false);
                  } else {
                    setRatePeriodInterval(true);
                  }
                }}
              />

              {showRatePeriodInterval && (
                <Field
                  id={"ratePeriodInterval"}
                  name={"ratePeriodInterval"}
                  label={"Compound Interval"}
                  component={DropDownList}
                  validator={requiredValidator}
                  data={ratePeriodInterval}
                />
              )}

              <Field
                id={"ratePerYear"}
                name={"ratePerYear"}
                label={"Interest Rate (per year)"}
                format={"p"}
                component={FormNumericTextBox}
                validator={requiredValidator}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <div className="k-form-buttons">
                  <Button
                    primary={true}
                    type={"submit"}
                    disabled={!formRenderProps.allowSubmit}
                  >
                    Calculate{" "}
                  </Button>
                  <Button onClick={formRenderProps.onFormReset}>Clear</Button>
                </div>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
      <hr />
      {message}
      <hr />
      <TextArea style={{ width: "100%", height: "400" }} value={resultValue} />
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.querySelector("my-app"));
ReactDOM.render(<App />, document.querySelector("my-app"));
