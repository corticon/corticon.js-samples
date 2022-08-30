# Custom Data Types

### Custom Data Types

Corticon provides rule modelers with 'base' datatypes (Integer, Decimal, String, Date, Time, DateTime, and Boolean) via a dropdown when building the vocabulary.&#x20;

You can also define a Custom Data Type based on one of these Base data types. A Custom Data Type enables you to predefine what values can be assigned to an attribute.

You define Custom Data Types in the Custom Data Types tab. You access the Custom Data Types tab by opening a Vocabulary file and clicking on the Vocabulary name, as shown in the image.

![](<../../../.gitbook/assets/image (97).png>)

#### Enumerated Custom Data Types

A specific list of acceptable values. For example, in the transport company scenario, you may want to limit the acceptable values for the `Aircraft.aircraftType` attribute to 747, 777, and 787. You can achieve this by: – Defining a Custom Data Type that is based on the String data type, – with the values ‘747’, ‘777’, and ‘787’, and, – configure the `aircraftType`attribute to use this Custom Data Type.&#x20;

![](<../../../.gitbook/assets/image (105).png>)

#### Constrained Custom Data Types

A constrained Custom Data Type enables you to limit acceptable values through a constraint expression. The constraint expression must include the special term value.&#x20;

For example, if you want to define a Custom Data Type that constrains the value of an attribute to less than 10,000, the constraint expression would be value < 10000.&#x20;

Bear in mind the following when you define constraint expressions:&#x20;

* You can use logical connectors such as AND and OR.&#x20;
* You can use parentheses to form more complex expressions.&#x20;
* You can use attribute operators that are compatible with the Base data type.&#x20;
* You cannot use null or collection operators.&#x20;

Here are a few examples of constraint expressions:

| Constraint Expression                                                           | Meaning                                                                                                          |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| value > 5                                                                       | Integer values greater than 5                                                                                    |
| value >= 10.2                                                                   | Decimal values greater than or equal to 10.2                                                                     |
| value in (1.1..9.9]                                                             | Decimal values between 1.1 (exclusive) and 9.9 \[inclusive]                                                      |
| <p>value in ['1/1/2000 12:30:00 PM'..<br>'1/2/2000 11:00:00 AM')</p>            | <p>DateTime values between '1/1/2000 12:30:00 PM'<br>[inclusive] and '1/2/2000 11:00:00 AM' (exclusive)</p>      |
| value in \['1:00:00 PM'.. '2:00:00 PM']                                         | <p>Time values between '1:00:00 PM' [inclusive] and<br>'2:00:00 PM' [inclusive]</p>                              |
| <p>value.size >= 6 and<br>(value.indexOf(1) > 0 or<br>value.indexOf(2) > 0)</p> | <p>String values of minimum 6 characters in length, whose<br>first or second characters are positive numbers</p> |

![](<../../../.gitbook/assets/image (76).png>)

After you define a Custom Data Type, you can apply the Custom Data Type to attributes.

![](<../../../.gitbook/assets/image (42).png>)
