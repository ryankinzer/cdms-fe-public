//GridService - enables CDMS field validators and editors on ag-grid

datasets_module.service('GridService', ['$window', '$route','DatasetService',
    function ($window, $route, DatasetService, $q) {

        var service = {

            //brought over from Datasheet.js (though we might not need it?)
            initScope: function (scope) {
                //anything we need to setup a scope for use with the grid...
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

                        //set them if we have them already at construction time. for system fields, usually
                        if (col_def.hasOwnProperty('PossibleValues'))
                            col_def.cellEditorParams.values = col_def.PossibleValues;
                        
                        //only call with object version of the possible values
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
                                    if (error.field && error.field.DbColumnName === params.colDef.DbColumnName)
                                        fieldHasErrors = true;
                                });
                            }
                            return fieldHasErrors;
                        },
                    };

                    //set Default if exists
                    service.fireRule("DefaultValue", { colDef: col_def });

                }
                else {
                    console.warn("Notice: There isn't a ControlTypeDefinition for " + cdms_field.DbColumnName + " with ControlType = " + cdms_field.ControlType);
                }
            },

//TODO - still need this? - use a filter?
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
        service.getAgColumnDefs = function (dataset) {

            // what we return in the end            
            var finalColumnDefs = { HeaderFields: [], DetailFields: [] };

            var FieldsSorted = dataset.Fields.sort(orderByOrderIndex);

            //dataset defined header fields 
            FieldsSorted.forEach(function (field, index) {
                if (field.FieldRoleId === FIELD_ROLE_HEADER) {
            
                    field.Label = (field.Field.Units) ? field.Label + " (" + field.Field.Units + ")" : field.Label;

                    //initial values for header column definition
                    var newColDef = {
                        headerName: field.Label,
                        field: field.DbColumnName,
                        width: SystemDefaultColumnWidth,
                        Label: field.Label,                 
                        DbColumnName: field.DbColumnName,   
                        ControlType: field.Field.ControlType,     
                        PossibleValues: getJsonObjects(field.Field.PossibleValues), 
                        cdmsField: field, //our own we can use later
                        DatastoreId: field.Field.DatastoreId,
                        //menuTabs: [],
                    };

                    //setup column def for HEADER and add it to our list
                    service.setupColDefForField(field, newColDef);

                    finalColumnDefs.HeaderFields.push(newColDef);
                }
            });

            //now add in the dataset defined detail fields and set each one up for use in the grid 
            FieldsSorted.forEach(function (field, index) {
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
                        ControlType: field.Field.ControlType,     
                        PossibleValues: getJsonObjects(field.Field.PossibleValues), 
                        cdmsField: field,        
                        DatastoreId: field.Field.DatastoreId,
                    };

                    //setup column def for DETAIL  and add it to our list
                    service.setupColDefForField(field, newColDef);

                    finalColumnDefs.DetailFields.push(newColDef);

                }
            });

            return finalColumnDefs;
        };

        //pass a grid columndefs and we'll autosize the columns
        service.autosizeColumns = function (coldefObject) {
            var allColumnIds = [];
            coldefObject.columnApi.getAllColumns().forEach( function(columnDef) {
                allColumnIds.push(columnDef.colId);
            });
            coldefObject.columnApi.autoSizeColumns(allColumnIds);
            //console.log("tried to autosize: ");
            //console.dir(allColumnIds);
        };


        // Called to validate a cell value (like after editing or first time display). 
        //  once a cell is validated, if there are errors, here is the resulting state:
        //  (data represents the row)
        //  data.validationErrors is an array of errors from this cell + previously set errors from other cells in this row
        //  data.rowHasError = true (or false if no error)
        //  data.rowErrorTooltip = "error messages" from all validation errors for this cell for display as a tooltip (displayed on hover)
        // returns boolean: have an error?
        service.validateCell = function (event) { 

            //console.log(" --- validate cell for event : ");
            //console.dir(event);

            if (!event.colDef.hasOwnProperty('validator'))
                return false; //no error since no validator

            //var validator = event.colDef.validator;

            //console.log(" -- running cell validator -- ");
            //console.dir(validator);
            //remove this field's validation errors from our row's validation errors (returns [] if none)
            event.node.data.validationErrors = event.colDef.validator.removeFieldValidationErrors(event.node.data.validationErrors, event.colDef);

            //validate this cell's value - returns array of errors if any
            var fieldValidationErrors = event.colDef.validator.validate(event);
            //console.log(' ERRORS for this validation?');
            //console.dir(fieldValidationErrors);

            //merge in any row errors with this cell's errors.
            event.node.data.validationErrors = event.node.data.validationErrors.concat(fieldValidationErrors);
            //console.dir(event.node.data.validationErrors);

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

        //adds a single error to a node. Field can be null if it is a "row" error
        service.addErrorToNode = function (node, message, field) {
            //console.log("adding an error: " + message);
            node.data.validationErrors.push({ 'field': field, 'message': message });
            node.data.rowHasError = true;

            //re-create the tooltip
            node.data.validationErrors.forEach(function (error, index) {
                //console.dir(error);
                node.data.rowErrorTooltip = (index === 0) ? "" : node.data.rowErrorTooltip + "\n"; //either initialize to "" or add a newline

                //flatten the error messages for this cell
                var the_next_message = (error.field) ?  "[" + error.field.DbColumnName + "] " + error.message : error.message;

                if (!error.field && node.data.rowErrorTooltip.indexOf(error.message) > -1)
                    the_next_message = ""; //if a row message like this already exists, don't re-add it.
                
                node.data.rowErrorTooltip = node.data.rowErrorTooltip + the_next_message;
                //console.warn(node.data.rowErrorTooltip);
            });
        }


        service.refreshRow = function (event) {
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

        //redraw the whole grid (expensive)
        service.refreshGrid = function (gridOptions) {
            gridOptions.api.redrawRows();
        };



        service.validateGrid = function (gridOptions) {
            //get all of the columns for the grid
            var gridColumns = gridOptions.columnApi.getAllColumns();

            //iterate each node, columns and validate the cell
            gridOptions.api.forEachNode(function (node, index) {
                gridColumns.forEach(function (column) {
                    service.validateCell({
                        node: node,
                        colDef: column.colDef,
                        value: node.data[column.colDef.field],
                        api: gridOptions.api,
                    })
                });

            });

        };



        service.fireRule = function (type, event, scope) { //row, field, value, headers, errors, scope) {
            
            if (!event.colDef.hasOwnProperty('cdmsField')) {
                console.warn("fireRule ("+ type +")- no cdmsField defined so there are no rules - skipping. The event:");
                console.dir(event);
                return;
            }

            try {

                var MasterFieldRule = event.colDef.cdmsField.Field.Rule = (typeof event.colDef.cdmsField.Field.Rule === 'string') ? getJsonObjects(event.colDef.cdmsField.Field.Rule) : event.colDef.cdmsField.Field.Rule;
                var DatasetFieldRule = event.colDef.cdmsField.Rule = (typeof event.colDef.cdmsField.Rule === 'string') ? getJsonObjects(event.colDef.cdmsField.Rule) : event.colDef.cdmsField.Rule;

                //these are available to the rule if defined
                var field = event.colDef;
                var value = (event.value) ? event.value : "";
                var row = (event.data) ? event.data : {};

                //fire MasterFieldRule rule if it exists
                if (MasterFieldRule && MasterFieldRule.hasOwnProperty(type)) {

                        console.log("Firing a rule: " + type + " on " + field.DbColumnName);

                        if (type == "DefaultValue")
                            event.colDef.DefaultValue = MasterFieldRule[type];
                        else
                            eval(MasterFieldRule[type]);
                    }

                //fire DatasetFieldRule rule if it exists. this will override any results of the MasterFieldRule
                if (DatasetFieldRule && DatasetFieldRule.hasOwnProperty(type)) {
        
                    console.log("Firing a rule: " + type + " on " + field.DbColumnName);

                    if (type == "DefaultValue")
                        event.colDef.DefaultValue = DatasetFieldRule[type];
                    else
                        eval(DatasetFieldRule[type]);
                }


            } catch (e) {
                //so we don't die if the rule fails....
                console.warn("Looks like a rule failed: "+type);
                console.dir(event);
                console.dir(e);
            }
        };


        //creates an row with an empty field (or default value if set) for each columnDef 
        service.getNewRow = function (coldefs) {
            var obj = {};

            //sets to default value of this field if one is specified as a "DefaultValue" rule; otherwise null
            angular.forEach(coldefs, function (col) {
                obj[col.field] = (col.DefaultValue) ? col.DefaultValue : null;
            });

            return obj;
        };

        //checks for duplicates if enabled for dataset. 
        //dataset = dataset we are checking for duplicates in
        //dataAgGridOptions = grid
        //row = row that contains fields to check (header row)
        //saveResult = provides status and message results
        service.checkForDuplicates = function (dataset, dataAgGridOptions, row, saveResult ) { 

            if (!dataset.Config.EnableDuplicateChecking) {
                return null; //early return, bail out.
            }

            saveResult.saving = true;
            saveResult.saveMessage = "Checking for duplicates...";

            //console.log("we are dupe checking!");

            //special case for water temp - update the Activity.Description field with the range... we'll use this to duplicate check
            if (dataset.Datastore.TablePrefix == "WaterTemp") {
                //sort, then get the first and last dates

                //are there rows? if so then use the readingdatetimes to build our range we use for duplicate checking
                if (dataAgGridOptions.api.getDisplayedRowCount() > 0) {

                    dataAgGridOptions.api.setSortModel({ colId: 'ReadingDateTime', sort: 'asc' });
                    var oldest = dataAgGridOptions.api.getDisplayedRowAtIndex(0);
                    var newest = dataAgGridOptions.api.getDisplayedRowAtIndex(dataAgGridOptions.api.getDisplayedRowCount() - 1);

                    var oldest_date = moment(oldest.data.ReadingDateTime).format('YYYY/MM/DD');
                    var newest_date = moment(newest.data.ReadingDateTime).format('YYYY/MM/DD');
                    var watertemp_range = oldest_date + " - " + newest_date;
                    console.log("water temp date range is: " + watertemp_range);
                    row.Activity.Description = watertemp_range;
                }
                else {
                    console.log("There are no rows for this water temp, the Description (Date Range) will be empty.");
                }
            }

            //build up our duplicate checker query
            var query = {
                'DatasetId': dataset.Id,
                'Fields': [],
                'Locations': "["+ row.Activity.LocationId +"]",
                'QAStatusId' : 'all',
            };

            var AbortNoFullKey = false;

            //add in the duplicate checker key fields configured for this dataset 
            dataset.Config.DuplicateCheckFields.forEach(function (dc_field) {

                //if any of the key field values is empty, bail out -- only check if we have a full composite key.
                if (row.Activity[dc_field] == null)
                    AbortNoFullKey = true;

                query.Fields.push({ 'DbColumnName': dc_field, 'Value': row.Activity[dc_field] });
            });

            if (AbortNoFullKey) {
                console.warn("Aborting duplicate check because not all key fields have values");
                return null; //early return -- we are bailing out because our key isn't full.
            }

            var dupe_check = DatasetService.checkForDuplicateActivity(query); // will return { DuplicateActivityId: null (if none), ActivityId (if match exists)

            dupe_check.$promise.then(function () {
                //console.log("Dupecheck back with id: " + dupe_check.DuplicateActivityId + " and our activity id is " + row.Activity.Id);

                //if the dupe_check.DuplicateActivityId is null or equals our own activityid, it is not a duplicate.
                if (dupe_check.DuplicateActivityId === null || dupe_check.DuplicateActivityId === row.Activity.Id) { 
                    saveResult.hasError = false;
                    saveResult.error = null;
                } else { //otherwise it is.
                    saveResult.hasError = true;
                    saveResult.error = "Duplicate record exists for: " + 
                        dataset.Config.DuplicateCheckFields.toString().replace("Description","ReadingDateTimeRange").replace(/,/g,", ");
                }

                saveResult.saving = false;
                saveResult.saveMessage = "Saving..."; //back to default

            }, function (data) { 
                console.warn("duplicate check error:");
                console.dir(data);
            });

            return dupe_check;  //promise - can add other .then()'s
            
        };


        service.errorComparator = function (one, two, nodeone, nodetwo) { 
            if (nodeone.data.rowHasError && nodetwo.data.rowHasError)
                return 0;

            if (!nodeone.data.rowHasError && !nodetwo.data.rowHasError)
                return 0;

            if (nodeone.data.rowHasError && !nodetwo.data.rowHasError)
                return 1;

            if (!nodeone.data.rowHasError && nodetwo.data.rowHasError)
                return -1;

        };

        service.bubbleErrors = function (dataAgGridOptions) {
            var col = dataAgGridOptions.columnApi.getColumn('hasError');
            if (col == null) {
                var new_col = {
                    'headerName': 'Has Error', 'field': 'hasError', 'hide': true, 
                    'comparator': service.errorComparator, 
                    'valueFormatter': function (params) {
                        return (params.node.data.rowHasError) ? "Yes" : "No"
                    } 
                };
                dataAgGridOptions.columnDefs.unshift(new_col);
                dataAgGridOptions.api.setColumnDefs(dataAgGridOptions.columnDefs);
            }
            
            var sort = [
                { colId: 'hasError' , sort: 'desc' }
            ];
            
            dataAgGridOptions.api.setSortModel(sort);
            //console.log("set comparator");
        };



        return service;

    }]);