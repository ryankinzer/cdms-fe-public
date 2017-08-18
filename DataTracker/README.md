README

We'll collect some documentation in here to help folks who might want to use CDMS code in the future.

## Rules ##

Rules are just bits of javascript code that run at certain times.  Rules can be configured for a "Field" -- such rules will fire at the appropriate event for all instances of that Field across all datasets.  Rules can also be configured for a "DatasetField" -- such rules will fire at the appropriate event for only the dataset for which it is configured.

The rule lives as a javascript object in the "Rule" column of either a DatasetField or Field item.

# Rule context: #

The following objects are available to your rule:

scope = access to current scope
field = current full field object
value = current field value
row_errors = array of error strings
scope.row = array of the entire row of fields

The validation rules will already have fired, errors will be strings in row_errors.  You can push new errors if your rule needs to: 
	
	row_errors.push("["+field.DbColumnName+"] Had trouble converting to mushrooms.")


# Rule events: #

Field, DatasetField: OnChange
	Runs after moving out of a cell of this field type in a grid.  Runs for both import and data entry.  Does not run if the value is changed to empty.

Field, DatasetField: OnValidate
	Runs whenever a field is validated (which is often!)


# Rule example: #

Here is an example of the rule on the WaterTemperature field in the Fields table.  This rule's purpose is to update the Fahrenheit field every time the Celsius field is changed.  There is a corresponding rule on the Fahrenheit field to update the Celsius field.  For us, it is required that both fields are present and they are kept in "sync".  Here's how we accomplish it:

{OnChange: "scope.row['WaterTemperatureF'] = convertCtoF(value);"}

Since this rule is checking the value of a DIFFERENT field in the row, it uses "scope.row['fielddbcolumnname']" in order to check the value.  In this example, when the WaterTemperature field changes, the OnChange rule fires and sets the WaterTemperatureF (notice the "F"!) to the converted value.



