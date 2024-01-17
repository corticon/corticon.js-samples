# Controls Reading Data from External Data Sources

When you implement your own Test Drive Client, you may want to support UIControls that populate the control from a datasource.  
This is particularly useful for list of items, for example a dropdown list, when the list of options already exists somewhere else, and you don’t want to duplicate it in Corticon.

Or perhaps the list is changing so frequently that you want to make sure the user always get the list from an external data source (for example a set of exchange rate).

The decision service can specify an external data source with the property `UIControl.dataSource`.

To see an example of what you need to implement, check the [MultipleChoices renderer](https://github.com/corticon/corticon.js-samples/blob/master/DynamicForms/CSC/clientSideComponent/dynForm/uiControlsRenderers.js).

There are 2 working modes in this example:
1. Default mode: The REST service produces JSON with the field names `value` and `displayName` for the option value and text respectively.
2. Mapping mode: The field names are different and the mapping are specified in these 2 properties:
      * `UIControl.dataSource.dataSourceOptions.dataValueField`
      * `UIControl.dataSource.dataSourceOptions.dataTextField`
      
