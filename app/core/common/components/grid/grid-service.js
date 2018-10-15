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

                    //setPossibleValues (PossibleValues are copied in if they exist, this is for calling later/dynamically)
                    if (col_def.hasOwnProperty('cellEditorParams')) {

                        if (col_def.hasOwnProperty('PossibleValues'))
                            col_def.cellEditorParams.values = getJsonObjects(col_def.PossibleValues);
                        
                        col_def.setPossibleValues = function (in_values) {
                            this.PossibleValues = in_values;
                            if (this.hasOwnProperty('cellEditorParams'))
                                this.cellEditorParams.values = in_values;
                        };
                        
                    }
    
                    //setup tooltip
                    col_def.tooltipField = "rowErrorTooltip";  //rowErrorTooltip is populated only when a validation error exists for any cell in a row.
                    col_def.cellClassRules = {
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
                    };

                    //set Default if exists
                    service.fireRule("DefaultValue",

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
        //@param dataset - the dataset we're building for (uses the fields and config)
        //@param page - the page is the key to the config and systemformfields (like "DataEntryPage")
        service.getAgColumnDefs = function (dataset, page) {

            // these are the "system" columns that can be turned on via dataset configuration for the data entry page
            var systemFields = angular.copy(SystemFormFields[page]);

            // what we return in the end            
            var finalColumnDefs = { HeaderFields: [], DetailFields: [] };

            //apply the dataset config to our defaults for which fields to show/hide
            if (dataset.Config != undefined && dataset.Config[page] != undefined) {
                
                var config = dataset.Config[page];

                console.log("Hey config has a "+page+" configured!");
                console.dir(config);

                //unhide all show fields
                if (config.hasOwnProperty('ShowFields')) {
                    config.ShowFields.forEach(function (field_to_show) {
                        //remove the showfield if it exists in hiddenfields
                        systemFields.HiddenFields.indexOf(field_to_show) !== -1 && systemFields.HiddenFields.splice(systemFields.HiddenFields.indexOf(field_to_show), 1);
                        if (field_to_show == 'Instrument') { 
                            //then lets also show the AccuracyCheck/PostAccuracyCheck
                            systemFields.HiddenFields.indexOf('AccuracyCheck') !== -1 && systemFields.HiddenFields.splice(systemFields.HiddenFields.indexOf('AccuracyCheck'), 1);
                            systemFields.HiddenFields.indexOf('PostAccuracyCheck') !== -1 && systemFields.HiddenFields.splice(systemFields.HiddenFields.indexOf('PostAccuracyCheck'), 1);
                        }
                    });
                }

                //hide all hidden fields
                if (config.hasOwnProperty('HiddenFields')) {
                    config.HiddenFields.forEach(function (field_to_hide) {
                        //ensure the hiddenfield is in hiddenfields
                        systemFields.HiddenFields.indexOf(field_to_hide) == -1 && systemFields.HiddenFields.push(field_to_hide);
                    });
                }

            } else {
                console.log("aww nothing for that page in config... we'll just use the defaults");
            }


            //now remove all hidden fields from headerfields
            systemFields.HiddenFields.forEach(function (field_to_hide) { 
                systemFields.HeaderFields.indexOf(field_to_hide) !== -1 && systemFields.HeaderFields.splice(systemFields.HeaderFields.indexOf(field_to_hide), 1);
            });

            //now same for details
            systemFields.HiddenFields.forEach(function (field_to_hide) { 
                systemFields.DetailFields.indexOf(field_to_hide) !== -1 && systemFields.DetailFields.splice(systemFields.DetailFields.indexOf(field_to_hide), 1);
            });

            console.log("the fields we'll show after having applied the config");
            console.dir(systemFields);

            //the only headerfields left are those we should have - add them to the beginning of the header fields
            systemFields.HeaderFields.forEach(function (fieldname) {
                finalColumnDefs.HeaderFields.push(SystemFieldDefinitions[fieldname]);
            });

            //dataset defined header fields 
            dataset.Fields.sort(orderByIndex).forEach(function (field, index) {
                if (field.FieldRoleId === FIELD_ROLE_HEADER) {
            
                    field.Label = (field.Field.Units) ? field.Label + " (" + field.Field.Units + ")" : field.Label;

                    //some col builder function here soon!! TODO
                    finalColumnDefs.HeaderFields.push({
                        headerName: field.Label,
                        field: field.DbColumnName,
                        width: SystemDefaultColumnWidth,
                        Label: field.Label,                 
                        DbColumnName: field.DbColumnName,   
                        ControlType: field.ControlType,     
                        PossibleValues: field.Field.PossibleValues, 
                        cdmsField: field, //our own we can use later
                        //menuTabs: [],
                    });
                }
            });

            //qa header fields (unless in "hidden fields")
            if (systemFields.HiddenFields.indexOf('QAFields') == -1) {
                systemFields.QAFields.forEach(function (qa_field) { 
                    finalColumnDefs.HeaderFields.push(SystemFieldDefinitions[qa_field]);
                });
            }
            
            //detail "header" fields
            systemFields.DetailFields.forEach(function (fieldname) {
                var field = SystemFieldDefinitions[fieldname];
                service.setupColDefForField(field, field);
                finalColumnDefs.DetailFields.push(field);
            });

            //now add in the dataset defined detail fields and set each one up for use in the grid 
            dataset.Fields.sort(orderByIndex).forEach(function (field, index) {
                if (field.FieldRoleId === FIELD_ROLE_DETAIL) {

                    field.Label = (field.Field.Units) ? field.Label + " (" + field.Field.Units + ")" : field.Label;

                    //initial values for detail column definition
                    var newColDef = {
                        headerName: field.Label,
                        field: field.DbColumnName,
                        width: SystemDefaultColumnWidth,
                        menuTabs: [],
                        Label: field.Label,                 
                        DbColumnName: field.DbColumnName,   
                        ControlType: field.ControlType,     
                        PossibleValues: field.Field.PossibleValues, //TODO?
                        cdmsField: field,                               //in case it is somehow needed
                    };

                    //setup column def for DETAIL only for right now... //TODO -- header fields?
                    service.setupColDefForField(field, newColDef);
                    finalColumnDefs.DetailFields.push(newColDef);

                }
            });

            //set the sort from the config, if present.
            if (typeof systemFields.sort !== 'undefined' && systemFields.sort.field && systemFields.sort.direction) {
                finalColumnDefs.DetailFields.forEach(function (field) {
                    if (field.DbColumnName === systemFields.sort.field) {
                        field.sort = systemFields.sort.direction;
                    }
                });
            }
            
            return finalColumnDefs;
        };

        //pass a grid columndefs and we'll autosize the columns
        service.autosizeColumns = function (coldefObject) {
            var allColumnIds = [];
            coldefObject.columnApi.getAllColumns().forEach( function(columnDef) {
                allColumnIds.push(columnDef);
            });
            coldefObject.columnApi.autoSizeColumns(allColumnIds);
        };


        // Called to validate a cell value (like after editing or first time display). 
        //  once a cell is validated, if there are errors, here is the situation:
        //  (data represents the row)
        //  data.validationErrors is an array of errors from this cell + previously set errors from other cells in this row
        //  data.rowHasError = true (or false if no error)
        //  data.rowErrorTooltip = "error messages" from all validation errors for this cell for display as a tooltip (displayed on hover)
        // returns boolean as to whether the field was valid or not.
        service.validateCell = function (event) { 

            console.log(" --- validate cell for event : ");
            console.dir(event);

            if (!event.colDef.hasOwnProperty('validator'))
                return false;

            var validator = event.colDef.validator;

            console.log(" -- running cell validator -- ");
            //console.dir(validator);
            //remove this field's validation errors from our row's validation errors (returns [] if none)
            event.node.data.validationErrors = validator.removeFieldValidationErrors(event.node.data.validationErrors, event.colDef);

            //validate this cell's value - returns array of errors if any
            var fieldValidationErrors = validator.validate(event);
            //console.dir(fieldValidationErrors);

            //merge in any row errors with this cell's errors.
            event.node.data.validationErrors = event.node.data.validationErrors.concat(fieldValidationErrors);
            //console.dir(fieldValidationErrors);

            //set validation status
            event.node.data.rowHasError = ((Array.isArray(event.node.data.validationErrors) && event.node.data.validationErrors.length > 0));

            //collect error messages into a tooltip for the cells with error/s
            if (event.node.data.rowHasError) {
                event.node.data.validationErrors.forEach(function (error, index) {
                    event.node.data.rowErrorTooltip = (index === 0) ? "" : event.node.data.rowErrorTooltip + "\n"; //either initialize to "" or add a newline

                    //flatten the error messages for this cell
                    event.node.data.rowErrorTooltip = event.node.data.rowErrorTooltip +
                        "[" + error.field.DbColumnName + "] " + error.message;

                    //console.log("validation errors for [" + error.field.DbColumnName + "] " + event.node.data.rowErrorTooltip);
                    //console.dir(event.node.data);

                });
            }
            else {
                event.node.data.rowErrorTooltip = ""; //clear the tooltip if there are no errors.
            }

            return (fieldValidationErrors.length === 0); //true if we no errors (is valid)

        };


        service.refreshGrid = function (event) {
            //TODO: ok, this isn't working right, but is close enough for the moment.
            //we redraw the current row/column in order to immediately update the UI about the validation result
            //console.dir(event);
            //event.api.redrawRows({ columns: event.column });
            event.api.redrawRows({rowNodes: [event.node] });
            var cell = event.api.getFocusedCell();
            //console.dir(cell);
            //if ( cell && cell.column.colDef.ControlType !== "select") {
            //    console.log(" ---- set focus --- ");
                event.api.setFocusedCell( cell.rowIndex, cell.column );
            //}
        };



        service.validateGrid = function (params) {
            console.log(" -- NOT validating the whole grid FIXME! --");

/*
            //get all of the columns for the grid
            var gridColumns = params.columnApi.getAllColumns();

            //iterate each node, columns and validate the cell
            params.api.forEachNode(function (node, index) {
                gridColumns.forEach(function (column) {
                    $scope.agValidateCell({
                        node: node,
                        colDef: column.colDef,
                        value: node.data[column.colDef.field],
                        api: params.api,
                    })
                });

            });
*/
        };





        service.fireRule = function (type, event, scope) { //row, field, value, headers, errors, scope) {
            
            if (!event.colDef.hasOwnProperty('cdmsField'))
                return;

            var MasterFieldRule = event.colDef.cdmsField.Field.Rule = (typeof event.colDef.cdmsField.Field.Rule === 'string') ? getJsonObjects(event.colDef.cdmsField.Field.Rule) : event.colDef.cdmsField.Field.Rule;
            var DatasetFieldRule = event.colDef.cdmsField.Rule = (typeof event.colDef.cdmsField.Rule === 'string') ? getJsonObjects(event.colDef.cdmsField.Rule) : event.colDef.cdmsField.Rule;

            //these are available to the rule
            var field = event.colDef;
            var value = event.value;
            var row = event.data;

            try {
                //fire MasterFieldRule rule if it exists
                if (MasterFieldRule && MasterFieldRule.hasOwnProperty(type)) {
                        if (type == "DefaultValue")
                            event.colDef.DefaultValue = MasterFieldRule[type];
                        else
                            eval(MasterFieldRule[type]);
                    }

                //fire DatasetFieldRule rule if it exists. this will override any results of the MasterFieldRule
                if (DatasetFieldRule && DatasetFieldRule.hasOwnProperty(type)) {
                    if (type == "DefaultValue")
                        event.colDef.DefaultValue = DatasetFieldRule[type];
                    else
                        eval(DatasetFieldRule[type]);
                }


            } catch (e) {
                //so we don't die if the rule fails....
                console.warn("Looks like a rule failed: "+type);
                console.dir(e);
                console.dir(event);
            }
        };





        return service;

    }]);