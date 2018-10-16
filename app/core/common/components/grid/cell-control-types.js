//Cell Control Types are defined below.
// Each type of control that can be in a grid needs to have a basic
// definition that will be used to configure a column of that type with the
// cell editors, cell validators, formatters, etc. so that they function properly according to their type (dropdown, currency, date, etc.).


//multiselect list - displays as multiple selection dropdown list
var MultiselectControlType = function (cdms_field, col_def) {

    //check for master field's possible values and copy them if they exist.
    if (cdms_field.hasOwnProperty('Field') && cdms_field.Field.hasOwnProperty('PossibleValues'))
        cdms_field.PossibleValues = cdms_field.Field.PossibleValues;

    //now either directly set or copied from master, do we have possible values?
    if (!cdms_field.hasOwnProperty('PossibleValues')) {
        console.warn("Field: " + cdms_field.DbColumnName + " is Multiselect but no PossibleValues are given.");
        return;
    }

    //if so then define our cell editor and validator.
    col_def.cellEditor = CDMSMultiselectCellEditor;
    col_def.cellEditorParams = {
        values: getJsonObjects(cdms_field.PossibleValues)
    };
    col_def.cellValidator = CDMSMultiselectCellValidator;
    col_def.valueGetter = function (params) {
        //console.dir(params);
        return angular.fromJson(params.data[params.column.colId]);
    };
    return col_def;

};

//select list - displays as drop down select
var SelectControlType = function (cdms_field, col_def) {

    //check for master field's possible values and copy them if they exist.
    if (cdms_field.hasOwnProperty('Field') && cdms_field.Field.hasOwnProperty('PossibleValues'))
        col_def.PossibleValues = getJsonObjects(cdms_field.Field.PossibleValues);

    //now either directly set or copied from master, do we have possible values?
    if (!col_def.hasOwnProperty('PossibleValues')) {
        console.warn("Field: " + cdms_field.field + " is Select but no PossibleValues are given.");
        return;
    }

    //if so then define our cell editor and validator.
    col_def.cellEditor = CDMSSelectCellEditor; //works for standard cdms values: ["label"] or {"alias":"label"}
    col_def.cellEditorParams = {
        values: col_def.PossibleValues
    };
    col_def.cellValidator = CDMSSelectCellValidator;
    col_def.valueFormatter = function (params) {
        var retval = null;
        if (Array.isArray(params.colDef.cellEditorParams.values)) { //if array type of possible values, just return the value
            retval = params.value; //params.data[params.column.colId];
        }
        else {
            retval = params.colDef.cellEditorParams.values[params.value]; //[params.data[params.column.colId]];
        }
        return retval;
    };
    return col_def;
};

//currency - displays as USD currency, saves as number
var CurrencyControlType = function (cdms_field, col_def) {
    col_def.valueFormatter = function (params) {
        return filterToCurrency(params.value);
    };
    col_def.valueParser = function (params) {
        return parseToFloat(params.newValue);
    };
    return col_def;
};

//date - displays as MM/DD/YYYY date without time, saves datetime
//TIMEZONE note - we save it as a date without any timezone. 
var DateControlType = function (cdms_field, col_def) {
    col_def.cellEditor = 'agTextCellEditor';
    col_def.cellEditorParams = {
        useFormatter: true, 
    };
    col_def.valueFormatter = function (params) {
        if (params.value == null)
            return params.value;
        else {
            the_date = moment(params.value);
            return (the_date.isValid()) ? the_date.format("YYYY-MM-DD") : params.value;
        }
    };

    col_def.valueParser = function (params) {
        if (params.newValue == null)
            return params.newValue;
        else {
            the_date = moment(params.newValue);
            return (the_date.isValid()) ? the_date.format("YYYY-MM-DDTHH:mm:ss") : params.newValue; // 2017-12-19T14:03:10 (no timezone)
        }
    };

    col_def.cellValidator = CDMSDateCellValidator;
    return col_def;};

//datetime - displays as MM/DD/YYYY HH:mm:ss, saves as datetime
//TIMEZONE note - we save it as a date without any timezone. 
var DateTimeControlType = function (cdms_field, col_def) {
    col_def.cellEditor = 'agTextCellEditor';
    col_def.cellEditorParams = {
        useFormatter: true,
    };

    col_def.valueFormatter = function (params) { //valueformatter - formats the field for display

        if (params.value == null) {
            return params.value;
        }
        else {
            the_date = moment(params.value);
            return (the_date.isValid()) ? the_date.format("YYYY-MM-DD HH:mm:ss") : params.value;
        }
    };

    col_def.valueParser = function (params) { //valueparser - parses the field for storing in the grid

        if (params.newValue == null) {
            return params.newValue; 
        }
        else {
            the_date = moment(params.newValue);
            return (the_date.isValid()) ? the_date.format("YYYY-MM-DDTHH:mm:ss") : params.newValue;  // 2017-12-19T14:03:10 (no timezone)
        }
        
    };

    col_def.cellValidator = CDMSDateTimeCellValidator;
    return col_def;
};

//time - displays as time, saves as date+time (default date)
var TimeControlType = function (cdms_field, col_def) {
    col_def.cellEditor = 'agTextCellEditor';
    col_def.cellEditorParams = {
        useFormatter: true,
    };
    col_def.valueFormatter = function (params) { //formats for display
        if (params.value == null)
            return params.value;
        else {
            the_date = moment(params.value);
            return (the_date.isValid()) ? the_date.format("HH:mm:ss") : params.value;
        }
    };

    col_def.valueParser = function (params) { //formats for saving in the grid
        if (params.newValue == null)
            return params.newValue;
        else {
            the_date = moment(params.newValue);
            return (the_date.isValid()) ? the_date.format("YYYY-MM-DDTHH:mm:ss") : params.newValue; // 2017-12-19T14:03:10 (no timezone)
        }
    };
    col_def.cellValidator = CDMSTimeCellValidator;
    return col_def;
};

//easting - no special handling in the editor or display
var EastingControlType = function (cdms_field, col_def) {
    return col_def;
};

//northing - no special handling in the editor or display
var NorthingControlType = function (cdms_field, col_def) {
    return col_def;
};

//file - just in header fields...
var FileControlType = function (cdms_field, col_def) {
    return col_def;
};

//link - just in header fields? (TSR sharepoint)
var LinkControlType = function (cdms_field, col_def) {
    return col_def;
};

//number - no special handling
var NumberControlType = function (cdms_field, col_def) {
    col_def.cellValidator = CDMSNumberCellValidator;
    return col_def;
};

//temp-waypoint-file - header only
var TempWaypointFileControlType = function (cdms_field, col_def) {
    return col_def;
};

//text - no special editor handling
var TextControlType = function (cdms_field, col_def) {
    col_def.cellValidator = CDMSTextCellValidator;
    return col_def;
};

//textarea - our own special text box
var TextAreaControlType = function (cdms_field, col_def) {
    col_def.cellEditor = CDMSTextareaCellEditor;     
    //col_def.cellValidator = CDMSTextareaCellValidator;
    return col_def;
};

//upload - headers
var UploadControlType = function (cdms_field, col_def) {
    return col_def;
};

var ControlTypeDefinitions = {
    'multiselect': MultiselectControlType,
    'currency': CurrencyControlType,
    'date': DateControlType,
    'datetime': DateTimeControlType,
    'easting': EastingControlType,
    'file': FileControlType,
    'link': LinkControlType,
    'northing': NorthingControlType,
    'number': NumberControlType,
    'select': SelectControlType,
    'string': TextControlType, //just use the Text renderer
    'temp-waypoint-file': TempWaypointFileControlType,
    'text': TextControlType,
    'textarea': TextAreaControlType,
    'time': TimeControlType,
    'upload': UploadControlType,
};

function getControlDefinition(def) {
    if (ControlTypeDefinitions.hasOwnProperty(def))
        return ControlTypeDefinitions[def];
    else
        return null;
}
