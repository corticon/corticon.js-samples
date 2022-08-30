# Rule Vocabulary

### What is a Vocabulary?

The first step of the rule modeling process with Corticon is to build the 'dictionary' of business terms used throughout the rules, the Rule Vocabulary.&#x20;

For example, a transport company may have a rule that determines how much cargo each type of vehicle can carry. There are two key business terms used in this rule—cargo and vehicle. You could define these terms as entities in your Vocabulary. A Vocabulary is similar to a data model such as a [Unified Modeling Language ](https://www.uml.org/what-is-uml.htm)(UML) model or an Entity-Relationship model. The terms for the Vocabulary could come from a number of sources—database tables, forms used in business operations, policy and procedure documents, etc.&#x20;

When you build a Vocabulary, you not only define the terms, you also define relationships between those terms. For example, a single vehicle can carry many cargo containers, implying a one-to-many relationship. You would define this as an association in your Vocabulary.&#x20;

The rule vocabulary can be created manually, or it can be auto generated based on an external data source, the schema of any relational database, or the JSON structure of a REST endpoint.

![](../../../.gitbook/assets/image005.png)

###
