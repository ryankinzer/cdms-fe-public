//ControlType Definitions are defined below.
// Each type of control that can be on a datasheet needs to have a basic
// definition that will be used to configure a column of that type.




var MultiselectControlType = function (cdms_field, col_def) {
    
    /* -- if you need to do something special when rendering you can : 
    var SpeciesCellRenderer = function (params) {
        //note: in params here are some cool things you have:
        // .data (whole row)
        // .columnApi
        // .gridApi
        // .value
     
        console.log("In renderer!");
        console.dir(params);
        return params.value;
    };
    */

    //col_def.cellRenderer = CDMSMultiselectCellRenderer;
    col_def.cellEditor = CDMSMultiselectCellEditor;
    col_def.cellEditorParams = {
        values: angular.fromJson(cdms_field.Field.PossibleValues)
    };

//    console.dir(col_def);

    return col_def;

};

var CurrencyControlType = function (cdms_field, col_def) {
    return col_def;
};

var DateControlType = function (cdms_field, col_def) {
    return col_def;
};

var DateTimeControlType = function (cdms_field, col_def) {
    return col_def;
};

var EastingControlType = function (cdms_field, col_def) {
    return col_def;
};

var FileControlType = function (cdms_field, col_def) {
    return col_def;
};

var LinkControlType = function (cdms_field, col_def) {
    return col_def;
};

var NorthingControlType = function (cdms_field, col_def) {
    return col_def;
};

var NumberControlType = function (cdms_field, col_def) {
    return col_def;
};

var SelectControlType = function (cdms_field, col_def) {
    console.log('we are a select');

    col_def.cellEditor = CDMSSelectCellEditor; //or: agRichSelectCellEditor OR better I think we make our own...
    col_def.cellEditorParams = {
        values: angular.fromJson(cdms_field.Field.PossibleValues),
    };

    /*
    var the_values = [];
    var possiblevalues = angular.fromJson(cdms_field.Field.PossibleValues);

    if (Array.isArray(possiblevalues)) {
        console.log("select values is an array!");
        the_values = possiblevalues;
    } else if (typeof (possiblevalues) === 'object') {
        console.log("select values is an object!")
        the_values = Object.values(possiblevalues);
    }
    
    col_def.cellEditorParams = {
        values: the_values,
    };

    col_def.valueFormatter = function (params) {
        console.log("valueformatter");
        console.dir(params);
        var mappings = angular.fromJson(cdms_field.Field.PossibleValues);
        var alias = params.value;

        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                if (alias === mappings[key]) {
                    return key;
                }
            }
        }
        //return angular.fromJson(cdms_field.Field.PossibleValues)[params.value]
    };
    col_def.valueParser = function (params) {
        console.log("valueparser");
        console.dir(params);
        var mappings = angular.fromJson(cdms_field.Field.PossibleValues);
        var alias = params.newValue;

        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                if (alias === mappings[key]) {
                    return key;
                }
            }
        }
    };
    */
    return col_def;
};

var StringControlType = function (cdms_field, col_def) {
    return col_def;
};

var TempWaypointFileControlType = function (cdms_field, col_def) {
    return col_def;
};

var TextControlType = function (cdms_field, col_def) {
    return col_def;
};

var TextAreaControlType = function (cdms_field, col_def) {
    return col_def;
};

var TimeControlType = function (cdms_field, col_def) {
    return col_def;
};

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
    'string': StringControlType,
    'temp-waypoint-file': TempWaypointFileControlType,
    'text': TextControlType,
    'textarea': TextAreaControlType,
    'time': TimeControlType,
    'upload': UploadControlType,
};