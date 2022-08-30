# In-Browser Decision Services

When packaging for browser deployment, Corticon.js generates the files:

* `decisionServiceBundle.js`: Your obfuscated rules
* `browser.sample.js`: Sample code demonstrating calling Corticon.js rules
* `browser.sample.html`: Sample HTML page for testing browser deployment

The HTML page, `browser.sample.html`, present a simple form where you can provide a JSON payload, invoke your rules, and see the resulting JSON.

The wrapper, `browser.sample.js`, simply invokes the rules with the payload input provided in the form.

The html page and wrapper are pure sample code. They just demonstrate how Corticon.js rules can be embedded into a JavaScript application running in a browser.

The `browser.sample.html` is ready to run a simple page in a browser.

Paste in the JSON you exported from Studio tester into the left panel, and then click **Run Decision Service**. The results in the right panel as shown:

![Note that the rules replaced the default shipping mode and added a message.](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/oso1617031637426.image?\_LANG=enus)

You can tailor `browser.sample.html` to build your UI around the Decision Service that you have now validated.

### Multiple decision services on a browser page <a href="#d1644e122" id="d1644e122"></a>

An integrator can put more than one Decision Services on a single HTML page so that a set of Corticon engine execution functions are created with one execute function per included Decision Service. In the browser bundle, the file `browser.sample.multipleDS.html` provides the format for multiple decision services. In it, you see the array property **corticonEngines**. Each entry in the array contains an object literal with the **execute** function. The script inclusion order determines where in the array a specific decision is located. The first included Decision Service is available at index 0 `window.corticonEngines[0].execute`):

```
<script type="text/javascript" src="decisionServiceBundle.js" </script>
<script type="text/javascript" src="decisionServiceBundle2.js" </script>
const result1 = window.corticonEngines[0].execute(payload1, configuration);
const result2 = window.corticonEngines[1].execute(payload2, configuration);
```

You could specify a different configuration for each of the services.

**To set up multiple Decision Services to run in one browser instance**

1. In Studio, generate the first package as a bundle.
2. Generate the second package as a bundle with a different bundle name.
3. In the second bundle's folder, rename `decisionServiceBundle.js` to `decisionServiceBundle2.js`, and then copy it to the browser folder of the first bundle.
4. Opening `browser.sample.multipleDS.html` opens with two input and output areas for the Decision Services.

Note: If you want to add additional Decision Services, follow the pattern of steps two and three, and then revise `browser.sample.multipleDS.html` to specify each of the added Decision Services.

When you include only one decision service, you can access the execute function with either of the following code excerpts:

```
// Using the first array element
const result = window.corticonEngines[0].execute(payload, configuration);
```

```
// Using the last included one						
const result = window.corticonEngine.execute(payload, configuration)
```
