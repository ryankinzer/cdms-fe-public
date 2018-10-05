//GridService - enables CDMS field validators and editors

//This should include anything portable that extends our ag-grid 

// to use: 

datasets_module.service('GridService', ['$window', '$route',
    function ($window, $route, $q) {

        var service = {

            //brought over from Datasheet.js (though we might not need it?)
            initScope: function (scope) {
                //anything we need to setup a scope for use with the grid...
                //NOTE - previously said this:  config the fields for the datasheet - include mandatory location and activityDate fields
                //lets do that now:

            },

            //sets the control for the field(defines renderers, editors, validators, formatters, etc.)
            //  based on the cdms_field.ControlType

            setupColDefForField: function (cdms_field, col_def) {
                //gets the control type definition function
                var col_builder = getControlDefinition(cdms_field.ControlType);

                if (col_builder !== null) {

                    //build this field's column definition (adds to the col_def)
                    col_builder(cdms_field, col_def);

                    //setup this field's validator (if it has one defined)
                    if (col_def.hasOwnProperty('cellValidator')) {
                        var validatorFunction = col_def.cellValidator;
                        col_def.validator = new validatorFunction(cdms_field);
                    }

                    //add a function to the column to populate PossibleValues
                    if (col_def.hasOwnProperty('cellEditorParams')) {
                        col_def.setPossibleValues = function (in_values) {
                            if (this.hasOwnProperty('cellEditorParams'))
                                this.cellEditorParams.values = in_values;
                        };
                    }
                }
                else {
                    console.warn("Notice: There isn't a ControlTypeDefinition for " + cdms_field.DbColumnName + " with ControlType = " + cdms_field.ControlType);
                }
            },

            convertStatus: function (aStatus) {
                //console.log("Inside convertStatus...");
                //console.log("aStatus = " + aStatus);

                var strStatus = null;

                if (aStatus === 0) {
                    strStatus = "Active";
                }
                else {
                    strStatus = "Inactive";
                }
                //console.log("strStatus = " + strStatus);

                return strStatus;
            },
            convertOkToCall: function (aStatus) {
                //console.log("Inside convertOkToCall...");
                //console.log("aStatus = " + aStatus);

                var strStatus = null;

                if (aStatus === 0) {
                    strStatus = "Yes";
                }
                else {
                    strStatus = "No";
                }
                //console.log("strStatus = " + strStatus);

                return strStatus;
            },
        };

        //This method builds the column definitions of a dataset for use on any grid view.
        // and returns them as an object: {HeaderFields: [], DetailFields: []}

        // the composition of header and detail arrays is controlled by the definition in dataset config key "datasheet"
        // and is in the structure:
        //   top header fields ("top-header-fields")
        //   dataset defined header fields
        //   bottom header fields ("bottom-header-fields")
        //   left detail fields ("left-detail-fields")
        //   dataset defined detail fields
        //   right detail fields ("right-detail-fields")
        //  this enables you to control the complete appearance and order of the fields via the dataset config.
        //  Here is the default (as an example of what you might put into the dataset config):
        //      config: [... "DatasheetFields":
        //        {  'TopHeaderFields': ['Location','ActivityDate'],
        //           'BottomHeaderFields': ['QAStatus', 'QAComments'],
        //           'LeftDetailFields': ['RowQAStatus'],
        //           'RightDetailFields': []  //note that you could just leave this key out -- you only need define the present ones.
        //           'sort': { 'field': 'ActivityDate', 'direction': 'desc' } //you can control the default sort on the detail grid this way
        //        }

        service.getAgColumnDefs = function (dataset) {

            //SystemFieldDefinitions and DefaultSystemFieldsToShow are defined in config.js
            // these are the "system" columns that can be turned on via dataset configuration for the data entry page
            var possibleColumnDefs = SystemFieldDefinitions;           
            var showColumns = DefaultSystemFieldsToShow;

            var finalColumnDefs = { HeaderFields: [], DetailFields: [] };

            console.log("composing data grid columns from config - here is the dataset config!");
            console.dir(dataset.Config);

            //if the dataset has a config and the ActivityPage.ShowFields is set, use it
            if (dataset.Config != undefined
                && dataset.Config.DatasheetFields != undefined) {

                console.log("Hey config has a DatasheetFields configured!");
                showColumns = dataset.Config.DatasheetFields; //use our dataset config instead of our defaults

            } else {
                console.log("aww no showfields in config... we'll just use the ShowColumns defaults as configured above...");
            }

            //top header fields
            if (typeof showColumns.TopHeaderFields !== 'undefined' && Array.isArray(showColumns.TopHeaderFields)) {
                showColumns.TopHeaderFields.forEach(function (fieldname) {
                    possibleColumnDefs.forEach(function (coldef) {
                        var coldef_fieldname = (coldef.hasOwnProperty('ConfigAlias')) ? coldef.ConfigAlias : coldef.DbColumnName;
                        if (coldef_fieldname == fieldname)
                            finalColumnDefs.HeaderFields.push(coldef);
                    });
                });
            }

            //dataset defined header fields 
            dataset.Fields.sort(orderByIndex).forEach(function (field, index) {
                if (field.FieldRoleId === FIELD_ROLE_HEADER) {
                    //some col builder function here soon!! TODO
                    finalColumnDefs.HeaderFields.push({
                        headerName: field.Label,
                        field: field.DbColumnName,
                        width: SystemDefaultColumnWidth,
                        Label: field.Label,                 //legacy
                        DbColumnName: field.DbColumnName,   //legacy
                        ControlType: field.ControlType,     //legacy
                        PossibleValues: field.Field.PossibleValues, //legacy
                        cdmsField: field, //our own we can use later
                        //menuTabs: [],
                    });
                }
            });

            //bottom header fields
            if (typeof showColumns.BottomHeaderFields !== 'undefined' && Array.isArray(showColumns.BottomHeaderFields)) {
                showColumns.BottomHeaderFields.forEach(function (fieldname) {
                    possibleColumnDefs.forEach(function (coldef) {
                        var coldef_fieldname = (coldef.hasOwnProperty('ConfigAlias')) ? coldef.ConfigAlias : coldef.DbColumnName;
                        if (coldef_fieldname == fieldname)
                            finalColumnDefs.HeaderFields.push(coldef);
                    });
                });
            }

            //left detail fields
            if (typeof showColumns.LeftDetailFields !== 'undefined' && Array.isArray(showColumns.LeftDetailFields)) {
                showColumns.LeftDetailFields.forEach(function (fieldname) {
                    possibleColumnDefs.forEach(function (coldef) {
                        var coldef_fieldname = (coldef.hasOwnProperty('ConfigAlias')) ? coldef.ConfigAlias : coldef.DbColumnName;
                        if (coldef_fieldname == fieldname)
                            finalColumnDefs.DetailFields.push(coldef);
                    });
                });
            }

            //dataset defined detail fields 
            dataset.Fields.sort(orderByIndex).forEach(function (field, index) {
                if (field.FieldRoleId === FIELD_ROLE_DETAIL) {
                    //initial values for detail column definition
                    var newColDef = {
                        headerName: field.Label,
                        field: field.DbColumnName,
                        width: SystemDefaultColumnWidth,
                        menuTabs: [],
                        tooltipField: "rowErrorTooltip", //rowErrorTooltip is populated only when a validation error exists for any cell in a row.
                        cellClassRules: {
                            'has-validation-error': function (params) {
                                var fieldHasErrors = false;
                                //console.log("checking for validatoin errors in css");
                                //this css class is added to the cell if there are validation errors matching this field
                                if ((Array.isArray(params.node.data.validationErrors) && params.node.data.validationErrors.length > 0)) {
                                    //console.log(" >> we do have errors for this row... ");
                                    params.node.data.validationErrors.forEach(function (error, index) {
                                        //console.log(" -- checking " + error.field.DbColumnName + " and " + params.colDef.field);
                                        //is there a validation error for this cell?
                                        if (error.field.DbColumnName === params.colDef.field)
                                            fieldHasErrors = true;
                                    });
                                }
                                return fieldHasErrors;
                            },
                        },
                        Label: field.Label,                 //legacy
                        DbColumnName: field.DbColumnName,   //legacy
                        ControlType: field.ControlType,     //legacy
                        PossibleValues: field.Field.PossibleValues, //legacy
                        cdmsField: field, //our own we can use later
                    };

                    //setup column def for DETAIL only for right now... //TODO -- header fields?
                    service.setupColDefForField(field, newColDef);
                    finalColumnDefs.DetailFields.push(newColDef);

                }
            });

            //right detail fields
            if (typeof showColumns.RightDetailFields !== 'undefined' && Array.isArray(showColumns.RightDetailFields)) {
                showColumns.RightDetailFields.forEach(function (fieldname) {
                    possibleColumnDefs.forEach(function (coldef) {
                        var coldef_fieldname = (coldef.hasOwnProperty('ConfigAlias')) ? coldef.ConfigAlias : coldef.DbColumnName;
                        if (coldef_fieldname == fieldname)
                            finalColumnDefs.DetailFields.push(coldef);
                    });
                });
            }

            //set the sort from the config, if present.
            if (typeof showColumns.sort !== 'undefined' && showColumns.sort.field && showColumns.sort.direction) {
                finalColumnDefs.DetailFields.forEach(function (field) {
                    if (field.DbColumnName === showColumns.sort.field) {
                        field.sort = showColumns.sort.direction;
                    }
                });
            }
            //console.log("returning from datasheet ------------------------------------------------------ asynch " + finalColumnDefs.DetailFields.length);
            return finalColumnDefs;
        };

        return service;

    }]);