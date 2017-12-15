//ControlType Definitions are defined below.
// Each type of control that can be on a datasheet needs to have a basic
// definition that will be used to configure a column of that type.




var MultiselectControlType = function (cdms_field, col_def) {
    
    /* -- if you need to so something special when rendering you can : 
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

    //col_def.cellRenderer = SpeciesCellRenderer;
    col_def.cellEditor = 'agSelectCellEditor'; //or: agRichSelectCellEditor
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
    col_def.cellEditor = 'agSelectCellEditor'; //or: agRichSelectCellEditor OR better I think we make our own...
    col_def.cellEditorParams = {
        values: angular.fromJson(cdms_field.Field.PossibleValues)
    };

    console.log('ok it was a select');
    if (!col_def.cellEditorParams.values || !Array.isArray(col_def.cellEditorParams.values))
    {
        console.log("nope not an array");
        //at least return an empty array
        var new_values = [];

        console.log("the values");
        console.dir(col_def.cellEditorParams.values);
        console.log(typeof (col_def.cellEditorParams.values));

        //if we actually have an object then just return the values ----------------------------------------- TODO this is temporary, we need our own control.
        if (col_def.cellEditorParams.values && typeof (col_def.cellEditorParams.values) === 'object')
        {
            console.log(" hey we have an object... ");
            Object.values(col_def.cellEditorParams.values).forEach(function (item) {
                console.dir(item);
                new_values.push(item);
            });
        }

        col_def.cellEditorParams.values = new_values;
    }

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