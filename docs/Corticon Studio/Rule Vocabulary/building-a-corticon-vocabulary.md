# Building a Corticon Vocabulary

Business terms are represented in the Vocabulary as either **entities** or **attributes**.&#x20;

An attribute is like a data field that holds a value. An entity is a collection of attributes. For example, the term cargo may have data fields such as cargoID, weight, volume, etc. So, cargo should be defined as an entity in a Vocabulary and the terms cargo ID, weight, and volume should be defined as attributes that belong to the entity cargo.&#x20;

![](<../../../.gitbook/assets/image (108).png>)

Relationships between entities are represented as associations in a Vocabulary. For example, since a vehicle can carry multiple cargo containers, you could create a one-tomany association between the vehicle entity and the cargo entity in a Vocabulary.

![](<../../../.gitbook/assets/image (6).png>)
