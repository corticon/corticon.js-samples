# JSON payloads and results in Corticon.js

When deployed or integrated into your application your Corticon.js decision services execute by accepting a JSON payload and returning a JSON result. The JSON payload contains the item or items your rules are to execute on—for example, a mortgage application to be evaluated or a set of sales leads to be routed. When your rules execute, they will update or add to the input payload—for example, adding a determination for a mortgage application or assigning the sales rep for each sales lead. The JSON result returned from the decision service will contain the state of the payload after rule execution.

\
\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/aud1619024465470.image?\_LANG=enus)

Corticon.js accepts most well-formatted JSON as the input payload. The result JSON will reflect the input payload plus any changes made by the rules. In addition, it will contain information about the rule execution, such as status indicating if rule execution was successful.

As a very simple example, consider a mortgage approval application where the JSON payload to your decision service is as follows:\
\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/dze1618945908379.image?\_LANG=enus)

The rules in the decision service look at the mortgage application information to determine if the applicant should be approved, how much they are approved for, and at what rate. The rules in the decision service set the attributes `approved`, `mortgageRate` and `mortgageAmount` on the application. The result payload would be similar to:

\
\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/srm1618946025101.image?\_LANG=enus)

The result payload has the same data as was in the input payload plus the attributes set by the rules. In this case the applicant has been approved for $350,000 at 3.5%.

The result payload also contains a `corticon` object that has the `timestamp` of when the rules were run plus the status, `success`, of the execution. The `corticon` object contains additional information about the execution of your rules.

### JSON to vocabulary mapping <a href="#d837e113" id="d837e113"></a>

When your decision service is invoked, Corticon maps the JSON payload to the internal data model of your Corticon vocabulary to enable the rules to execute on it. To perform this mapping, Corticon must first examine the JSON payload to identify the top-level objects in the JSON and the vocabulary entities they correspond to.

In our simple mortgage application example, the vocabulary could be defined as:\
![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/uwq1618946105790.image?\_LANG=enus)\
This is a very simple vocabulary with a single entity, `Application`. Our JSON payload is equally simple:\
\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/dze1618945908379.image?\_LANG=enus)

Here the JSON payload represents a single application and Corticon would map it to the `Application` entity. In a real application your Corticon vocabulary and JSON payload are likely to be much more complex.

Once the top-level objects in the JSON payload are mapped to the vocabulary model, Corticon can map any nested objects in the JSON to associations in the vocabulary. Let’s expand our mortgage sample to have a slightly more complex vocabulary:\
![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/lxk1618946282739.image?\_LANG=enus)\
Here the mortgage application was defined to have an `Application` entity with a one-to-many association to a `CreditReport` entity and a one-to-one association to a `Mortgage` entity. This is more reflective of a real Corticon vocabulary. A real vocabulary is likely to have many entities and associations. A JSON payload for this vocabulary may look like:\
\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/hsc1618946362098.image?\_LANG=enus)

Once Corticon has mapped the root object in the JSON to the `Application` entity, it can use the knowledge that the `Application` entity has an association to a `CreditReport` entity to map the nested `creditReport` in the JSON. Corticon will set the association on the `Application` entity to this `CreditReport` entity.

### JSON Path and JSON Element Name <a href="#d837e178" id="d837e178"></a>

Corticon employs two strategies to map a JSON payload to the vocabulary. First, it will use the knowledge it has of the vocabulary to identify how to perform the mapping. When this information is insufficient, Corticon will use a "best match" strategy to perform the mapping.

In your Corticon vocabulary, you can define properties on entities, attributes, and associations to provide guidance for Corticon when mapping a JSON payload to the vocabulary. If fully utilized, Corticon may need to perform no "best match" mapping.

In the Corticon Studio vocabulary, you can set the **JSON Path** property on entities and the **JSON Element Name** property on attributes and associations.

The **JSON Path** property defines the path to the entity in the JSON payload. When JSON payload is passed to a decision service, Corticon can use this information to map entities in the payload to the vocabulary.

The **JSON Element Name** property defines the attribute a field in the JSON payload is mapped to or the association a nested object in the payload is mapped to.

Both **JSON Path** and **JSON Element name** can be set in the Corticon.js vocabulary editor but the easiest, and least error prone, way to set them in your vocabulary is to generate your vocabulary using the Corticon.js **Populate Vocabulary form JSON** wizard. See [Generate a Vocabulary](https://docs.progress.com/bundle/corticon-js-rule-modeling/page/Generate-a-Vocabulary.html) .

Given this JSON:\
\
Corticon would generate this vocabulary:\
\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/ldn1618946462665.image?\_LANG=enus)

![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/hdd1618946519504.image?\_LANG=enus)

This is similar to the previous vocabulary, the only differences are that the application entity is named `Root` and the `creditReport` association is one-to-one. Where the root entity in JSON doesn’t have a name, Corticon names it `Root`. It is common to rename this to something more meaningful to rule modelers. The `creditReport` association is one-to-one because there was only one credit report in the JSON.

Let’s examine how **JSON Path** would be set in this vocabulary:

| Entity                 | JSON Path           |
| ---------------------- | ------------------- |
| Application (aka Root) | `$`                 |
| CreditReport           | `$[*].creditReport` |
| Mortgage               | `$[*].mortgage`     |

**JSON Path** is a robust syntax for defining the path to elements in a JSON file. In our example the **JSON Path** element `$` indicates the root of the document. Where `Application` is the root entity in the JSON, its JSON Path is simply `$`. A period, `.`, Is used to identify a nested entity.

The **JSON Path** syntax can be complex but fortunately Corticon.js can set it for you when populating a vocabulary from a JSON file. In most cases, all you need set is the **JSON Path** for the root entities in the JSON.

Now let’s examine how **JSON Element Name** would be set in this vocabulary:

| Entity                | JSON Element Name |
| --------------------- | ----------------- |
| Application.firstName | firstName         |
| Application.lastName  | lastName          |
| Application.income    | income            |
| CreditReport.agency   | agency            |
| CreditReport.score    | score             |
| Mortgage.amount       | amount            |
| Mortgage.rate         | rate              |
| Mortgage.approved     | approved          |

| Association              | JSON Element Name |
| ------------------------ | ----------------- |
| Application.creditReport | creditReport      |
| Application.mortgage     | mortgage          |

The JSON Element Name is the name of the field or nested object in the JSON. You can rename attributes and associations in your vocabulary to be a name more meaningful to a rule modeler. If specified, the JSON Element Name must match the JSON payload.

**Best Match Mapping**

You don’t have to specify **JSON Path** or **JSON Element Name** in your vocabulary. When not specified, Corticon.js will use a "best match" algorithm to map JSON payload to your vocabulary. This algorithm is dependent on the object and field names in your JSON closely matching the entity, attribute, and association names in your vocabulary.

You also don’t have to specify the top-level objects in the JSON payload. When not specified, Corticon.js will examine the attributes on the top-level objects in the JSON payload and use them to map to the best matching entity.

Corticon.js "best matching" is very effective in most use cases. The negative aspect is that the mapping is slower. For performance critical applications or those processing large JSON payloads, this performance impact may be significant.

At minimum, you should have **JSON Path** specified for the top-level entities in your JSON payload and identify these as the top-level entities when packaging your rules for deployment.

**Identifying Top-Level Entities**

When you package your rules for deployment, you can specify the top-level entities of interest in the JSON payload that will be processed when integrated with your application. This information can then be used by Corticon.js to optimize the mapping of JSON payloads to your vocabulary. It is not uncommon for a Corticon vocabulary to have hundreds of entities. If only one of these entities will be at the top-level, identifying the entity allows Corticon.js to map payloads to the vocabulary much more efficiently.

In Corticon.js Studio, the **Package Rules for Deployment** wizard provides a dialog where you can select the top-level entities.\
\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/gro1618946665965.image?\_LANG=enus)

In this example, the vocabulary was expanded to have many more entities as would be typical in a real application. Here, `Application` is selected to indicate that `Application` is the top-level entity in the JSON payloads the decision service will process.

Top-level entities do not need to be at the root of your JSON payload. Often the objects of interest to your rules may be nested in a larger JSON document.\
\


![](https://progress-be-prod.zoominsoftware.io/bundle/corticon-js-integration/page/hcx1618946775550.image?\_LANG=enus)

Here the mortgage application is nested in a JSON document where the other information is not needed by the rules. Setting JSON Path for the Application entity to `$.FDO.application` will let Corticon know where it is within the JSON document. It and its nested objects are the only portions of the JSON that need to be mapped to the vocabulary.

Corticon.js allows the top-level entities to be identified when a Ruleflow is packaged for deployment. The integration API allows you to override this within your application. See [Config options](https://docs.progress.com/bundle/corticon-js-integration/page/Config-options.html).

**Unmapped JSON Payload**

Any objects or fields in the JSON payload that are not mapped to your vocabulary are preserved and included in the result payload.

### Error handling <a href="#d837e547" id="d837e547"></a>

If there is an error during the execution of the decision service, the status `"error"` is returned to the user along with the description of the error which will be part of the `"corticon"` JSON object as follows:

```
{
    "corticon": {
        "status": "error",
        "description": "<error message>"
    }
}							
```

NOTE: The pattern for an error was different in V1.2 where the status "error" and description were returned in the root JSON response as follows:

```
{
    "status" : "error",
    "description" : "<error message>"
}						
```
