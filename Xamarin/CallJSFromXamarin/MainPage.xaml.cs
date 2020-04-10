using System.ComponentModel;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Xamarin.Forms;

namespace CallJSFromXamarin
{
    // Learn more about making custom code visible in the Xamarin.Forms previewer
    // by visiting https://aka.ms/xamarinforms-previewer
    [DesignTimeVisible(false)]
    public partial class MainPage : ContentPage
    {
        private WebView webView;
        private object configuration;
        private dynamic payload;

        public MainPage()
        {
            InitializeComponent();

            this.InitializeWebView();
        }

        private void InitializeWebView()
        {
            var assembly = typeof(MainPage).Assembly;

            var stream = assembly.GetManifestResourceStream("CallJSFromXamarin.decisionServiceBundle.js");
            using (var reader = new StreamReader(stream))
            {
                this.webView = new WebView();

                var htmlSource = new HtmlWebViewSource();
                var js = reader.ReadToEnd();
                htmlSource.Html = $"<html><body><script type=\"text/javascript\">{js}</script></body></html>";
                this.webView.Source = htmlSource;
                this.stack.Children.Add(this.webView);

                this.webView.IsVisible = false;
            }

            this.configuration = JsonConvert.DeserializeObject<object>("{ logLevel: 0 }");

            var payloadStream = assembly.GetManifestResourceStream("CallJSFromXamarin.samplePayload.json");
            using (var payloadReader = new StreamReader(payloadStream))
            {
                this.payload = JsonConvert.DeserializeObject<object>(payloadReader.ReadToEnd());
            }
        }

        private async void MultiplyBtnClicked(System.Object sender, System.EventArgs e)
        {
            this.resultLabelHeader.Text = "Decision service call processing...";
            this.resultLabel.Text = "";

            payload.Objects[0].str1 = this.str1.Text;
            payload.Objects[0].str2 = this.str2.Text;

            decimal decValue1;
            if (decimal.TryParse(this.dec1.Text, out decValue1))
            {
                payload.Objects[1].dec1 = decValue1;
            }
            else
            {
                payload.Objects[1].dec1 = 0;
            }

            decimal decValue2;
            if (decimal.TryParse(this.dec2.Text, out decValue2))
            {
                payload.Objects[1].dec2 = decValue2;
            }
            else
            {
                payload.Objects[1].dec2 = 0;
            }

            /* dynamic is because we don't kow the type of returned data */
            dynamic result = await this.EvaluateJavaScriptAsync();
            this.resultLabelHeader.Text = "Result of calling Decision Service";
            this.resultLabel.Text = this.OutputResults(result);
        }

        private async Task<dynamic> EvaluateJavaScriptAsync()
        {
            /* Create the JS code to call the decision service on the engine  */
            // var jsFunc = $"JSON.stringify(window.corticonEngine.execute({this.payload}, {this.configuration}))";
            var jsFunc = $"window.corticonEngine.execute({this.payload}, {this.configuration})";
            /* For IOS web browser we need to remove blank characters */
            jsFunc = Regex.Replace(jsFunc, @"\t|\n|\r", "");

            /* Execute the decision service and Wait for it to finish */
            var result = await this.webView.EvaluateJavaScriptAsync(jsFunc);
            /* Convert to c# object */
            return JsonConvert.DeserializeObject<object>(result);
        }

        private string OutputResultsOld(dynamic result)
        {
            dynamic multiplyResult = result.Objects[1];
            string multiplyStr = "\nDecimal multiplication: " + multiplyResult.dec1 + " * " + multiplyResult.dec2 + " = " + multiplyResult.dec3;
            var outputString = "";
            var stringOperationsResult = result.Objects[0];
            outputString += "\nConcatenation Test: " + stringOperationsResult.str1 + " + " + stringOperationsResult.str2 + " = " + stringOperationsResult.str3;
            outputString += multiplyStr;

            return outputString;
        }
        private string OutputResults(dynamic result)
        {
            dynamic multiplyResult = result.Objects[1];
            string multiplyStr = "\nDecimal multiplication: " + multiplyResult.dec3;
            var outputString = "";
            var stringOperationsResult = result.Objects[0];
            outputString += "\nConcatenation Test: " + stringOperationsResult.str3;
            outputString += multiplyStr;

            return outputString;
        }
    }
}
