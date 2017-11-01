/*
*   These are functions used in services or controllers in the datasets module.
*/


// makes a field column definition
function makeField(colName, placeholder) {
    return '<input type="text" placeholder="' + placeholder + '" ng-blur="updateCell(row,\'' + colName + '\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
}


function makeFieldColDef(field, scope) {
    //console.log("Inside makeFieldColDef...");
    //console.log("field is next...");
    //console.dir(field);

    var coldef =
        {
            field: field.DbColumnName,
            displayName: field.Label,
            minWidth: 70,
            defaultValue: field.DefaultValue
        };

    //if (scope.dataset.Id === 1206) // Creel Survey
    if (scope.DatastoreTablePrefix == "CreelSurvey") {
        scope.disableFields = true;
    }
    else {
        scope.datasheetColDefs.cellEditableCondition = true;
    }

    //only setup edit templates for fields in grids with cell editing enabled.
    if (scope.gridDatasheetOptions.enableCellEdit) {
        //first of all!
        coldef.enableCellEdit = true;
        //if (scope.dataset.Id === 1206)
        if (scope.DatastoreTablePrefix == "CreelSurvey") {
            scope.datasheetColDefs.cellEditableCondition = false;
        }
        else {
            scope.datasheetColDefs.cellEditableCondition = true;
        }

        //setup column according to what type it is
        //  the "coldef" options available here are "ColumnDefs Options" http://angular-ui.github.io/ng-grid/

        switch (field.ControlType) {
            case 'select':
            case 'lookup':
                // Check for common misconfiguration error
                if (field.Field.PossibleValues == null)
                    console.log("Missing list of possible values from select/lookup field " + field.Field.Name);

                coldef.editableCellTemplate = '<select ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateCell(row,\'' + field.DbColumnName + '\')" ng-options="id as name for (id, name) in CellOptions.' + field.DbColumnName + 'Options"><option value="" selected="selected"></option></select>';
                scope.CellOptions[field.DbColumnName + 'Options'] = makeObjectsFromValues(scope.dataset.DatastoreId + field.DbColumnName, field.Field.PossibleValues);
                //                console.log("and we used: " + scope.dataset.DatastoreId+field.DbColumnName + " as the key");
                break;
            case 'multiselect':
            case 'multilookup':
                //coldef.editableCellTemplate = '<select class="field-multiselect" multiple="true" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"/>';
                //coldef.cellTemplate = '<div class="ngCellText cell-multiselect" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field)}}</span></div>';
                coldef.editableCellTemplate = '<select class="field-multiselect" multiple="true" ng-blur="updateCell(row,\'' + field.DbColumnName + '\')" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in CellOptions.' + field.DbColumnName + 'Options"/>';
                scope.CellOptions[field.DbColumnName + 'Options'] = makeObjectsFromValues(scope.dataset.DatastoreId + field.DbColumnName, field.Field.PossibleValues);
                //                console.log("and we used: " + scope.dataset.DatastoreId+field.DbColumnName + " as the key");
                break;

            case 'easting':
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 541324');
                break;
            case 'northing':
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 7896254');
                break;

            case 'date':
                //coldef.editableCellTemplate = '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 07/23/2014');
                break;
            case 'time':
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 16:20');
                break;
            case 'datetime':
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 07/23/2014 16:20');
                break;

            case 'textarea':
            case 'text':
                coldef.editableCellTemplate = '<input type="text" ng-blur="updateCell(row,\'' + field.DbColumnName + '\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                break;
            case 'number':
                //var maxmin = field.Field.Validation ? 'max="'+field.Field.Validation[1]+'" min="'+field.Field.Validation[0]+'"' : ''; //either returns our min/max setup for a numeric field or empty string.
                coldef.editableCellTemplate = '<input type="text" ng-model="COL_FIELD" ng-blur="updateCell(row,\'' + field.DbColumnName + '\')" ng-input="COL_FIELD" />';
                //coldef.cellTemplate = '<div class="ngCellText colt{{$index}}">{{row.getProperty(col.field)}}</div>';
                break;
            case 'checkbox':
                coldef.showSelectionCheckbox = true;
                coldef.editableCellTemplate = '<input type="checkbox" ng-checked="row.entity.' + field.DbColumnName + '==true" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                coldef.cellTemplate = coldef.editableCellTemplate; //checkbox for display and edit.
                break;
            case 'file':
                coldef.cellTemplate = '<button class="right btn btn-xs" ng-click="addFiles(row, col.field)">Add</button> <span ng-cell-text ng-bind-html="row.getProperty(col.field) | fileNamesFromString"></span>';
                //<span ng-bind-html="fileNamesFromRow(row,\''+ field.DbColumnName + '\')"></span>';
                break;
            //case 'grid':
            //    coldef.cellTemplate = '<button class="rigt btn btn-xs" ng-click="viewRelation(row, col.field)">View</button> <span ng-cell-text ng-bind-html="row.getProperty(col.field)"></span>';
            //    break;
            default:
                console.log("Unknown control type: " + field.ControlType);
        }
    }

    //setup cellfilters
    switch (field.ControlType) {
        case 'multiselect':
        case 'multilookup':
            coldef.cellFilter = 'arrayValues';
            break;

        case 'date':
            coldef.cellFilter = 'date: \'MM/dd/yyyy\'';
            break;

        case 'currency':
            coldef.cellFilter = 'currency';
            break;

        case 'datetime':
            coldef.cellFilter = 'date: \'MM/dd/yyyy HH:mm:ss\'';
            break;

        case 'link':
        case 'file':
            //override the defaul width for files...
            coldef.minWidth = '200';
            coldef.maxWidth = '400';
            coldef.width = '200';
            if (!coldef.enableCellEdit)
                coldef.cellTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text ng-bind-html="row.getProperty(col.field) | fileNamesFromString"></span></div>';//<span ng-bind-html="fileNamesFromRow(row,\''+ field.DbColumnName + '\')"></span>';
            break;
        case 'grid':
            coldef.minWidth = '150';
            coldef.maxWidth = '150';
            coldef.width = '150';
            coldef.cellTemplate = '<button class="right btn btn-xs" ng-click="viewRelation(row, col.field)">View</button> <div class="ngCellText" ng-bind-html="row.getProperty(col.field) | countItems"></div>';
            //coldef.cellTemplate = '<span ng-cell-text ng-bind-html="row.getProperty(col.field) | countItems"></span>';
            break;
    }

    return coldef;
}

/*
* Handles preparing a field to be used by the system...
*/
function parseField(field, scope) {
    //console.log("Inside services, parseField...");
    //console.log("field is next...");
    //console.dir(field);

    //do this no matter what.
    scope.FieldLookup[field.DbColumnName] = field; //setup our little convenience lookup associative array - used for validation

    //are we already parsed?
    if (field.parsed === true)
        return;

    var displayName = "";

    //if we are a DatasetField
    if (field.Label)
        displayName = field.Label;

    //if we are a Field
    if (field.Name)
        displayName = field.Name;

    //include units in the label if we are a DatasetField
    if (field.Field && field.Field.Units)
        if (field.Field.Units !== "NULL") // DO NOT include units, if it = "NULL"
            displayName += " (" + field.Field.Units + ")";

    //or if we are a Field
    if (field.Units)
        displayName += " (" + field.Units + ")";

    field.Label = displayName;

    //configure field validation for DatasetFields (will be skipped for global Fields (in the case of global query))
    if (field.Field && field.Field.Validation) {
        try {
            console.log("configuring validation for " + field.DbColumnName);
            field.Field.Validation = angular.fromJson(field.Field.Validation);
        }
        catch (e) {
            // Original code
            //console.log("*** There is an error parsing the validation for: "+ field.Field.Name + " ***");
            //console.dir(e);
            //console.log("Validation == " + field.Field.Validation);

            //TODO: we need to talk about this whole validation approach... no reason to "angular.fromJson" above
            //      when we are going to fail a bunch of times on purpose because we're doing something different
            //      with the whole switch thing below...

            console.log("e string = " + e.message.toString());
            var errorDescription = e.message.valueOf();
            if ((field.Field.Validation === "t") ||
                (field.Field.Validation === "i") ||
                (field.Field.Validation === "y") ||
                (field.Field.Validation === "NULL")) {
                // This could probably be handled a better way...
                // Do nothing.  The "t" means we are checking a time.
                // Ken previously used the field validation for checking upper/lower limits on numbers.
                // GC added these letters...
                // t :  to indicate a time value
                // i :  to indicate an integer
                // y :  to indicate a 4-digit year
                if (field.Field.Validation === "y") {
                    // We are looking for a year.
                    check4Digits()
                }
            }
            else if (errorDescription == "Invalid character") {
                // Do nothing.  We handle checking the value in the ValidateField function.
            }
            else {
                console.log("** There is an error parsing the validation for: " + field.Field.Name + " **");
                console.dir(e);
                console.log("Validation == " + field.Field.Validation);
            }
        }
    }

    //setup and parse the rule if there is one.
    try {
        field.Rule = (field.Rule) ? angular.fromJson(field.Rule) : {};

        if (field.Field)
            field.Field.Rule = (field.Field.Rule) ? angular.fromJson(field.Field.Rule) : {};
    }
    catch (e) {
        // Original code
        //console.log("*** there is a rule parsing error for " + field.Field.Name + " *** ");
        //console.dir(e);

        //console.log("e string = " + e.description.toString());
        var errorDescription = e.description.valueOf();
        if ((field.Field.Validation === "t") ||
            (field.Field.Validation === "i") ||
            (field.Field.Validation === "NULL")) {
            // This could probably be handled a better way...
            // Do nothing.  The "t" means we are checking a time.
            // Ken previously used the field validation for checking upper/lower limits on numbers.
            // GC added these letters...
            // t :  to indicate a time value
            // i :  to indicate an integer
        }
        else if (errorDescription == "Invalid character") {
            // Do nothing.  We handle checking the value in the ValidateField function.
        }
        else {
            console.log("** There is an error parsing the validation for: " + field.Field.Name + " **");
            console.dir(e);
            console.log("Validation == " + field.Field.Validation);
        }
    }

    fireRules("DefaultValue", null, field, null, null, null, null);
    fireRules("Default", null, field, null, null, null, null);

    field.parsed = true;

}

//creates an empty row for arbitrary datasets
function makeNewRow(coldefs) {
    var obj = {};

    //sets to default value of this field if one is specified as a "DefaultValue" rule; otherwise null
    angular.forEach(coldefs, function (col) {
        obj[col.field] = (col.defaultValue) ? col.defaultValue : null;
    });

    obj.isValid = true;

    return obj;
}


function isInvalidOption(scope, field, value) {
    return Object.keys(scope.CellOptions[field.DbColumnName + 'Options']).indexOf(value.toString()) == -1;
}


function checkNumber(row, field, value, range, row_errors) {
    //console.log("Inside checkNumber...");
    //console.dir(row);
    //console.dir(field);
    //console.log("value = " + value);
    //console.dir(range);
    //console.dir(row_errors);

    if (is_empty(value))
        return true;

    // Check if input is a number even if we haven't specified a numeric range
    if (!stringIsNumber(value)) {
        row_errors.push("[" + field.DbColumnName + "] Value is not a number.");
        return false;
    }
    // The range (Validation field) could be an alphanumeric string (4d for 4 decimal places), not just [min, max], and we must allow for the possibility.
    //else if(range && range.length == 2)     // Expecting a 2-element array [min,max]; yes, but if the value is a string, this will be a false positive for a range.
    else if (range && (typeof range === 'object') && range.length === 2)     // Expecting a 2-element array [min,max], an array is an object...
    {
        var min = range[0];
        var max = range[1];

        if (min && value < min) {
            row_errors.push("[" + field.DbColumnName + "] Value is too low.");
            return false;
        }

        if (max && value > max) {
            row_errors.push("[" + field.DbColumnName + "] Value is too high.");
            return false;
        }
    }

    return true;
}


//function validateField(field, row, key, scope, row_errors)
function validateField(field, row, key, scope, row_errors) {
    //console.log("Inside services, validateField...");
    //console.log("field is next...");
    //console.dir(field);
    //console.log("scope.callingPage = " + scope.callingPage);

    var value = row[key];

    //if (typeof field.DbColumnName !== 'undefined')
    //	console.log("Validating: (" + value + ") on field: " + field.DbColumnName);
    //console.dir(field);

    switch (field.ControlType) {
        case 'select':
            //is the value in our list of options?
            //console.log("scope.CellOptions for " + field.DbColumnName + " are next...");
            //console.log(scope.CellOptions[field.DbColumnName+'Options']);
            if (scope.CellOptions[field.DbColumnName + 'Options']) {
                if (isInvalidOption(scope, field, value)) // Is value in the option list?
                    row_errors.push("[" + field.DbColumnName + "] Invalid selection, value = " + value);
            }
            else {
                console.log("Error: no cellOptions for " + field.DbColumnName + 'Options');
                console.dir(scope.CellOptions);
                console.log("This might be because you're calling a rule wrong?");
            }
            break;

        case 'multiselect':
            //is each value in our list of options?
            var values = angular.fromJson(value);
            row[key] = values;
            //console.log("doing a comparison: " + values + " for value: "+ value);
            for (var a = 0; a < values.length; a++) {
                var a_value = values[a];
                if (isInvalidOption(scope, field, a_value)) // Is value in the option list?
                    row_errors.push("[" + field.DbColumnName + "] Invalid selection (" + a_value + ")");
            }
            break;
        case 'date':
            if (isNaN(Date.parse(value)))
                row_errors.push("[" + field.DbColumnName + "] Value is not a date (mm/dd/yyyy).");
            break;
        case 'datetime':
            console.log("Inside datetime...");
            console.log("value = " + value);
            if (isNaN(Date.parse(value)))
                row_errors.push("[" + field.DbColumnName + "] Value is not a date-time (mm/dd/yyyy hh:mm).");
            else // Valid date value.
            {
                var theDate = new Date(value);
                var theYear = theDate.getFullYear();
                console.log("theYear = " + theYear);
                if (theYear < 1901)
                    row_errors.push("[" + field.DbColumnName + "] Value has a default year (from Excel?); user must set year.");
            }

            break;

        case 'time':
            var theTime = value;
            var strTime = theTime.toString();
            console.log("strTime = " + strTime);

            var timeContentValid = true;
            if (!stringIsTime(value) && !is_empty(value))
                timeContentValid = false;
            else if (value.indexOf(".") > -1)
                timeContentValid = false;
            else if (value.indexOf(":") === -1)
                timeContentValid = false;

            if (!timeContentValid)
                row_errors.push("[" + field.DbColumnName + "] Value is not a time (hh:mm).");

            break;

        case 'text':
            if (field.Field.Validation && (field.Field.Validation !== 'null')) {
                if (field.Field.Validation === "t")  // For a time
                {
                    //console.log("Text time field name = " + field.DbColumnName);
                    //if ((field.DbColumnName === "InterviewTime") || (field.DbColumnName === "TimeStart") || (field.DbColumnName === "TimeEnd")) // This looks for specific field names.
                    if ((field.Field.Units === "00:00") || (field.Field.Units === "HH:MM")) // This looks for time fields (better).
                    {
                        //console.log("In services, validateField, found time field...");
                        //console.log("scope.callingPage = " + scope.callingPage);
                        //if(!stringIsNumber(value) && !is_empty(value))

                        // 


                        if ((field.DbColumnName === "InterviewTime") ||
                            (field.DbColumnName === "TimeStart") ||
                            (field.DbColumnName === "TimeEnd")) {
                            if ((typeof scope.callingPage !== 'undefined') && (scope.callingPage === "Import")) {
                                if (!checkDateTimeFormat1(value))
                                    row_errors.push("[" + field.DbColumnName + "] Value is not a date-time format (YYYY-MM-DD hh:mm)");

                                var theYear = extractYearFromString(value);
                                if (parseInt(theYear) < 1901) {
                                    strErrorMessage = "[" + field.DbColumnName + "] has a less than 1901 (Excel default year); user must enter a valid year (YYYY)";
                                    console.log(strErrorMessage);
                                    row_errors.push(strErrorMessage);
                                }
                            }
                            else {
                                // value may contain a time (HH:MM) or the time may be in a datetime string (YYYY-MM-DDTHH:mm:SS format).
                                //console.log("value (before extracting time)= " + value);
                                if (value !== null) {
                                    var colonLocation = value.indexOf(":");
                                    value = value.substr(colonLocation - 2);
                                    if (value.length > 5)
                                        value = value.substr(0, 6);

                                    //console.log("value (after extracting time)= " + value);
                                    var validTime = checkTime(value);
                                    //console.log("validTime (time is valid)= " + validTime)
                                    if ((typeof validTime === 'undefined') || (value.length < 5)) {
                                        console.log("Error: Invalid time entry in " + field.DbColumnName + ".");
                                        row_errors.push("[" + field.DbColumnName + "] Invalid entry.  The entry must use the 24-hr military time format.  Example:  8:00 a.m. = 08:00 and 5:15 p.m. = 17:15");
                                    }
                                }
                            }
                        }
                        else {
                            // value may contain a time (HH:MM) or the time may be in a datetime string (YYYY-MM-DDTHH:mm:SS format).
                            console.log("value (before extracting time)= " + value);
                            var colonLocation = value.indexOf(":");
                            value = value.substr(colonLocation - 2);
                            if (value.length > 5)
                                value = value.substr(0, 6);

                            //console.log("value (after extracting time)= " + value);
                            var validTime = checkTime(value);
                            //console.log("validTime (time is valid)= " + validTime)

                            if ((typeof validTime === 'undefined') || (value.length < 5)) {
                                console.log("Error: Invalid time entry in " + field.DbColumnName + ".");
                                row_errors.push("[" + field.DbColumnName + "] Invalid entry.  The entry must use the 24-hr military time format.  Example:  8:00 a.m. = 08:00 and 5:15 p.m. = 17:15");
                            }
                        }
						/* Before import change
						console.log("Found time field...");
						//if(!stringIsNumber(value) && !is_empty(value))
						console.log("Value = " + value);
						var validTime = checkTime(value);
						console.log("validTime = " + validTime)
						if ((typeof validTime === 'undefined') || (value.length < 5))
						{
							console.log("Error: Invalid time entry in " + field.DbColumnName + "." );
							row_errors.push("["+field.DbColumnName+"] Invalid entry.  The entry must use the 24-hr military time format.  Example:  8:00 a.m. = 08:00 and 5:15 p.m. = 17:15");
						}
						*/
                    }
                }
                else if (field.Field.Validation === "nb")  // For a name, nb = not blank
                {
                    console.log("Field name = " + field.DbColumnName);
                    if (field.DbColumnName === "Surveyor") {
                        console.log("Found surveyor field...");
                        //if(!stringIsNumber(value) && !is_empty(value))
                        console.log("Value = " + value);
                        if (value.length > 0)
                            var validName = value;
                        else
                            console.log("validName = " + validName);

                        if (typeof validName === 'undefined') {
                            console.log("Error: Invalid time entry in " + field.DbColumnName + ".");
                            row_errors.push("[" + field.DbColumnName + "] Invalid entry.  [Surveyor] cannot be blank.");
                        }
                    }
                }
            }
            break;
        case 'easting':
            return checkNumber(row, field, value, [100000, 999999], row_errors);
        case 'northing':
            return checkNumber(row, field, value, [1000000, 9999999], row_errors);

        case 'number':
            //return checkNumber(row, field, value, field.Field.Validation, row_errors); // Chris' code.

            //console.log("Inside validateField, case number...");
            //console.log("field.Field.DbColumnName = " + field.Field.DbColumnName);
            //console.log("field.Field.Validation = " + field.Field.Validation);
            //console.log("field.Field.DataType = " + field.Field.DataType);
            //console.log("value = " + value);
            //if (field.Field.DataType === 'float')
            //{
            //	return checkNumber(row, field, value, field.Field.Validation, row_errors);
            //}
            //console.log("typeof field.Field.Validation = " + typeof field.Field.Validation);

            if (typeof field.Field.Validation === "number") {
                field.Field.Validation = "" + field.Field.Validation;
                //console.log("typeof field.Field.Validation = " + typeof field.Field.Validation);
            }

            if ((field.Field.Validation !== null) && (field.Field.Validation.indexOf("null") < 0)) {
                //console.log("Validation exists and is not null...");
                if (field.Field.Validation === "i")  // For an Integer
                //if (field.Field.Validation.indexOf("i") > -1)  // For an Integer
                {
                    //console.log("Must be an integer...");
                    //console.log("Field name = " + field.DbColumnName);
                    //console.log("value = " + value);
                    if ((typeof value !== 'undefined') && (value !== null)) {
                        //console.log("field.DbColumnName = " + field.DbColumnName + ", value = " + value);
                        // First verify the number is an integer.
                        var validNumber = checkInteger(value);
                        //console.log("validNumber = " + validNumber)
                        if (typeof validNumber === 'undefined') {
                            console.log("Error: Invalid entry in " + field.DbColumnName + ".");
                            if ((field.DbColumnName === "NumberAnglersObserved") || (field.DbColumnName === "NumberAnglersInterviewed")) {
                                row_errors.push("[" + field.DbColumnName + "] Invalid entry in header.  The entry must be a whole number.  Example:  3");
                            }
                            else {
                                row_errors.push("[" + field.DbColumnName + "] Invalid entry.  The entry must be a whole number.  Example:  3");
                            }
                        }

                        //console.log("NumberAnglersInterviewed = " + value);
                        if (field.DbColumnName === "NumberAnglersInterviewed") {
                            //console.log("Found NumberAnglersInterviewed...");
                            ////console.log("scope is next...");
                            //console.dir(scope);
                            if (row.NumberAnglersInterviewed > row.NumberAnglersObserved) {
                                row_errors.push("[" + field.DbColumnName + "] cannot be more than [NumberAnglersObserved]");
                            }

                        }

                    }
                }
                else if (field.Field.Validation === "i4") // 4-digit integer
                {
                    //console.log("Must be a 4-digit integer...");
                    //console.log("Field name = " + field.DbColumnName);
                    //console.log("value = " + value);
                    if (is_empty(value)) {
                        // Empty is OK.  Do nothing.
                    }
                    else if ((typeof value !== 'undefined') && (value !== null)) {
                        var strErrorMessage = "[" + field.DbColumnName + "] Invalid entry.  The entry must be a 4-digit whole number.  Example:  1234";

                        var strValue = value.toString();
                        var validNumber = checkInteger(value);
                        //console.log("validNumber = " + validNumber)
                        if (typeof validNumber === 'undefined') {
                            row_errors.push(strErrorMessage);
                        }
                        else if ((strValue.length < 4) || (strValue.length > 4)) {
                            row_errors.push(strErrorMessage);
                        }
                    }
                }
                else if (field.Field.Validation === "y") // We are looking for a year (4-digit number)
                {
                    //console.log("Field name = " + field.DbColumnName);
                    //console.log("value = " + value);
                    //console.log("typeof value = " + typeof value);

                    // The value can be blank.  If present, value must be a 4-digit year.
                    if ((typeof value !== 'undefined') && (value !== null) && (value.length > 0)) {
                        validNumber = check4Digits(value);
                        if (typeof validNumber === 'undefined') {
                            console.log("Error: Invalid entry in " + field.DbColumnName + ".");
                            if (field.DbColumnName === "YearReported") {
                                row_errors.push("[" + field.DbColumnName + "] Invalid value for year.  The entry must be a 4-digit year.  Example:  2017");
                            }
                            else {
                                row_errors.push("[" + field.DbColumnName + "] Invalid entry.  The entry must be a whole number.  Example:  3");
                            }
                        }
                    }
                }
                else if (field.Field.Validation.indexOf("4d") > -1) // No more than 4 decimal places
                {
                    //console.log("Inside check for 4d...");
                    if ((typeof value !== 'undefined') && (value !== null)) {
                        var strValue = value.toString();
                        var strDecimalPart = "";
                        var intDecimalLoc = strValue.indexOf(".");

                        if (intDecimalLoc > -1) {
                            strDecimalPart = strValue.substring(intDecimalLoc + 1);
                            if (strDecimalPart.length > 4)
                                row_errors.push("[" + field.DbColumnName + "] Invalid entry.  The entry can only have 4 decimal places.")
                        }
                    }
                }
                //else if (field.Field.DataType === 'float')
                else if (field.Field.DataType.indexOf("float") > -1) {
                    //console.log("We have a float type...");
                    return checkNumber(row, field, value, field.Field.Validation, row_errors);
                }
                else {
                    return checkNumber(row, field, value, field.Field.Validation, row_errors);
                }
            }
            //else if (field.Field.DataType === 'float')
            //{
            //	return checkNumber(row, field, value, field.Field.Validation, row_errors);
            //}
            break;
        case 'checkbox':
            //anything here?
            break;

    }


    // You can test validation rules here
    //------------------------------------
    /*
    if(field.DbColumnName == "Disposition")
    {
        console.log("Disposition value: " + value);
        var testRule =
        {
            "OnValidate":
            "if((value == 'O' || value == 'T') && (scope.FieldLookup['ReleaseSite'] && !row['ReleaseSite'])) row_errors.push('[ReleaseSite] Disposition choice requires ReleaseSite');"
        };
    
        field.Field.Rule = angular.fromJson(testRule);
    }
    */
    /*
    console.log(field.DbColumnName);
    if(field.DbColumnName == "FinClip")
    {
        console.log("Origin value: " + value);
        var testRule =
        {
            "OnValidate":
            "row['Origin'] = 'NAT';if(!(!row['FinClip'] || (row['FinClip'] == 'NONE' || row['FinClip'] == 'NA')) || ( row['Tag'] == 'WIRE')) row['Origin'] = 'HAT';"
        };
    
        field.Field.Rule = angular.fromJson(testRule);
    }
    */

    fireRules("OnValidate", row, field, value, scope.row, row_errors, scope);

}



//convert a F to C
function convertFtoC(fahr) {
    if (fahr != null)
        return ((parseFloat(fahr) - 32) * (5 / 9)).toFixed(NUM_FLOAT_DIGITS);

    return fahr;
}

function convertCtoF(cels) {
    if (cels != null)
        return (parseFloat(cels) * 9 / 5 + 32).toFixed(NUM_FLOAT_DIGITS);

    return cels;
}




function previousActivity(activities, routeId, $location) {
    var previousId;

    //spin through the activities - when we get to the one we're on, send the one before
    //  (unless we are on the first one, then do nothing)

    for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];

        if (activity.Id == routeId) {
            if (previousId)
                break; // meaning the previousId is set already; we are good to go.
            else {
                previousId = activity.Id; //meaning we are on the first one.
                break;
            }
        }
        previousId = activity.Id;
    };

    $location.path("/dataview/" + previousId);
};

function nextActivity(activities, routeId, $location) {
    var nextId;
    var found = false;

    for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];

        if (found) {
            nextId = activity.Id;
            break;
        }

        if (activity.Id == routeId) {
            found = true;
            nextId = activity.Id; // in case we don't get another one.
        }

    };

    $location.path("/dataview/" + nextId);
}




function fireRules(type, row, field, value, headers, errors, scope) {
    var row_errors = errors; //older rules use "row_errors"
    try {
        //fire Field rule if it exists -- OnChange
        if (field.Field && field.Field.Rule && field.Field.Rule[type]) {
            console.log("Dataset field rule: " + field.Field.Rule[type]);
            if (type == "DefaultValue")
                field.DefaultValue = field.Field.Rule[type];
            else
                eval(field.Field.Rule[type]);
        }

        //fire Datafield rule if it exists -- OnChange
        if (field.Rule && field.Rule[type]) {
            console.log("Master field rule: " + field.Rule[type]);
            if (type == "DefaultValue")
                field.DefaultValue = field.Rule[type];
            else
                eval(field.Rule[type]);
        }
    } catch (e) {
        //so we don't die if the rule fails....
        console.dir(e);
    }

}