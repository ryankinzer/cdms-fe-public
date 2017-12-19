//ControlType Definitions are defined below.
// Each type of control that can be on a datasheet needs to have a basic
// definition that will be used to configure a column of that type.
// Note: Custom cell renderers are defined in ag-grid-custom-components.js

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

    return col_def;

};


var SelectControlType = function (cdms_field, col_def) {
    //    console.log('we are a select');

    col_def.cellEditor = CDMSSelectCellEditor; //or: agRichSelectCellEditor OR better I think we make our own...
    col_def.cellEditorParams = {
        values: angular.fromJson(cdms_field.Field.PossibleValues),
    };

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