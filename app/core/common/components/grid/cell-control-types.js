//Cell Control Types are defined below with their validators and their formatters
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
        //console.dir(params.data[params.column.colId]);
        //console.dir(col_def.cellEditorParams.values);
        //console.dir(getParsedMetadataValues(params.data[params.column.colId]));
        return getParsedMetadataValues(params.data[params.column.colId]);
        //return col_def.cellEditorParams.values[params.data[params.column.colId]];
    };
    return col_def;

};

//select list - displays as drop down select
var SelectControlType = function (cdms_field, col_def) {

    //check for master field's possible values and copy them if they exist.
//?? this already done? kbhere 11/30
    //if (cdms_field.hasOwnProperty('Field') && cdms_field.Field.hasOwnProperty('PossibleValues'))
    //    col_def.PossibleValues = (cdms_field.Field.PossibleValues);

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
        if (params.colDef.cellEditorParams.values != null) {
            if (Array.isArray(params.colDef.cellEditorParams.values)) { //if array type of possible values, just return the value
                retval = params.value; //params.data[params.column.colId];
            }
            else {
                retval = params.colDef.cellEditorParams.values[params.value]; //[params.data[params.column.colId]];
            }
        } else {
            console.warn("Warning: Field " + params.colDef.Label + " is a select but no values are set.");
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
            if (!the_date.isValid())
                console.log("could not format date: moment failed to parse : " + params.value);
            return (the_date.isValid()) ? the_date.format("MM/DD/YYYY") : params.value;
        }
    };

    col_def.valueParser = function (params) {
        if (params.newValue == null)
            return params.newValue;
        else {
            the_date = moment(params.newValue);
            if (!the_date.isValid())
                console.log("could not parse date: moment failed to parse : " + params.newValue);
            return (the_date.isValid()) ? the_date.format("YYYY-MM-DD") : params.newValue; // 2017-12-19T14:03:10 (no timezone)
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
            return (the_date.isValid()) ? the_date.format("HH:mm") : params.value;
        }
    };

    col_def.valueParser = function (params) { //formats for saving in the grid
        var strHours = "";
        var strMinutes = "";

        if (params.newValue == null)
            return params.newValue;
        else if (params.oldValue == null)
        {
            try {
                var the_new_date = moment(params.api._headerrow.Activity.ActivityDate);
                the_new_date.set({
                    'hour': 0,
                    'minute': 0,
                    'second': 0
                });

                if (params.newValue.length == 4) { // Exmample:  Time = 1300
                    strHours = params.newValue.substr(0, 2);
                    strMinutes = params.newValue.substr(2, 2);
                    the_new_date.set({
                        hour: parseInt(strHours),
                        minute: parseInt(strMinutes)
                    });

                    return (the_new_date.isValid()) ? the_new_date.format("HH:mm") : params.newValue;
                }
                if (params.newValue.length == 5) { // Exmample:  Time = 13:00
                    strHours = params.newValue.substr(0, 2);
                    strMinutes = params.newValue.substr(3, 2);
                    the_new_date.set({
                        hour: parseInt(strHours),
                        minute: parseInt(strMinutes)
                    });

                    return (the_new_date.isValid()) ? the_new_date.format("HH:mm") : params.newValue;
                }
            } catch (e) {
                console.error("failed to convert time: ");
                console.dir(params);
                return "error";
            }
            
        }
        else {
            try {
                if (params.newValue.length == 4) { // Exmample:  Time = 1300
                    strHours = params.newValue.substr(0, 2);
                    strMinutes = params.newValue.substr(2, 2);
                    params.newValue = strHours + ":" + strMinutes;  // Reformat Time to 13:00
                }

                the_old_date = moment(params.oldValue); //get the date from the old value.
                if (!the_old_date.isValid())
                    the_old_date = moment(params.api._headerrow.Activity.ActivityDate);

                the_date = moment(params.newValue, ["HH:mm"], true);
                //console.log("the_date is next...");
                //console.dir(the_date);
                var the_combined_date = the_date.set(
                    {
                        year: the_old_date.year(),
                        month: the_old_date.month(),
                        date: the_old_date.date()
                    });
                //console.log("the_combined_date is next...");
                //console.dir(the_combined_date);
                return (the_combined_date.isValid()) ? the_combined_date.format("YYYY-MM-DDTHH:mm:ss") : params.newValue; // 2017-12-19T14:03:10 (no timezone)

            } catch (e) {
                console.error("failed to convert time: ");
                console.dir(params);
                return "error";
            }
            
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

//file

var FileListCellTemplate = function (params) {
    var list = '<div class="event-file-list"><ul>';
    //console.dir(params);
    //console.dir(this);
    var file_links = getProjectFilesArrayAsLinks(params.colDef.ProjectId, params.colDef.DatasetId, params.node.data[params.colDef.DbColumnName]);
    console.dir(file_links);
    file_links.forEach(function (link) {
        list += '<li>' + link + '</li>';
    });

    list += '</ul></div>';
    //list += '</ul><button class="right btn btn-xs" style="margin: 0" ng-click="editCellFiles()">[*]</button></div>';
    //console.dir(list);
    return list;
};

var FileControlType = function (cdms_field, col_def) {
/*
    col_def.valueFormatter = function (params) {
        retval = params.value;
        
        console.dir(params.value);
        var filenames = [];
        if (params.value) {
            var files = angular.fromJson(params.value);
            files.forEach(function (file) { 
                filenames.push(file.Name);
            });
            retval = filenames.join("\n");
        }
        return retval;
    };
*/
    col_def.editable = false;
    col_def.cellRenderer = FileListCellTemplate;
    return col_def;
};

//link - just in header fields? (TSR sharepoint)
var LinkControlType = function (cdms_field, col_def) {
    return col_def;
};

//number - no special handling
var NumberControlType = function (cdms_field, col_def) {
    col_def.cellValidator = CDMSNumberCellValidator;
/*
    col_def.suppressKeyboardEvent = function (params) { 
        console.log('cell is editing: ' + params.editing);
        console.log('keyboard event:', params.event);

        // return true (to suppress) if editing and user hit up/down keys
        var keyCode = params.event.keyCode;
        var gridShouldDoNothing = params.editing && (keyCode===9 );
        return gridShouldDoNothing;
    };
*/
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
//TODO
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
    'easting': NumberControlType,
    'file': FileControlType,
    'link': LinkControlType,
    'northing': NumberControlType,
    'number': NumberControlType,
    'select': SelectControlType,
    'instrument-select': SelectControlType,
    'select-number': SelectControlType,
    'string': TextControlType, //just use the Text renderer
    'temp-waypoint-file': TempWaypointFileControlType,
    'text': TextControlType,
    'textarea': TextAreaControlType,
    'time': TimeControlType,
    'upload': UploadControlType,
    'qa-status-comment': TextAreaControlType,
    'location-select' : SelectControlType,
    'activity-date' : DateControlType,
    'qa-status-select': SelectControlType,

};

function getControlDefinition(def) {
    if (ControlTypeDefinitions.hasOwnProperty(def))
        return ControlTypeDefinitions[def];
    else
        return null;
}




/*

var LinkListCellTemplate = function (params) {
    if (!params.node.data.ExternalLinks)
        return;

    var list = '<div class="event-link-list"><ul>';

    var links = angular.fromJson(params.node.data.ExternalLinks);
    if (Array.isArray(links)) {
        links.forEach(function (link) {
            list += '<li><a href="' + link.Link + '" target="_blank">' + link.Name + '</a></li>';
        });
    }
            
    list += '</ul></div>';

    return list;
}
*/