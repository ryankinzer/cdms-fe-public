﻿//unused

//gridDatasheetOptions needs to be set to your datasheet grid
datasets_module.service('DataSheet', ['Logger', '$window', '$route', 'GridService', 'DatasetService','$rootScope',
    function (Logger, $window, $route, GridService, DatasetService, $rootScope, $q) {

        //var LocationCellTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateEntity(row)" />';
        var LocationCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'locationId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in locationOptions"/>';

        var QACellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'QAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in QAStatusOptions"/>';

        var InstrumentCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'InstrumentId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in instrumentOptions"/>';

        var FishermanCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'FishermanId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in fishermenOptions"/>';  // GC

        var TimezoneCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'timezone\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in timezoneOptions"/>';

        var service = {

            initScope: function (scope) {

                //setup variable in the scope
                scope.CellOptions = {}; //dropdown list options
                scope.FieldLookup = {}; //convenience lookup dbcolname->fieldobj (populated by dataentry-controller.makecoldef)
                scope.onRow = undefined;
                scope.onField = undefined;
                scope.autoUpdateUndone = [];
                scope.deletedRows = [];
                scope.updatedRows = [];
                scope.autoUpdateFeatureDisabled = true;
                scope.headerFieldErrors = {};
                scope.dataChanged = false; //any changes to the grid yet?
                scope.gridWidth = { width: '2000' }; //will set below based on number of fields

                //scope wrapper functions
                scope.undoAutoUpdate = function () { service.undoAutoUpdate(scope) };
                scope.updateCell = function (row, field) { service.updateCell(row, field, scope) };
                //scope.updateHeaderField = function(field) { service.updateHeaderField(field, scope)};
                scope.updateHeaderField = function (row, field) { service.updateHeaderField(row, field, scope) };
                //scope.validateGrid = function() { service.validateGrid(scope)};
                scope.validateGrid = function () { service.validateGrid(scope) };
                scope.validate = function (row) { service.validate(scope, row) };
                scope.removeRow = function () { service.removeOnRow(scope) };
                scope.undoRemoveRow = function () { service.undoRemoveOnRow(scope) };
                scope.getFieldStats = function () { return service.getFieldStats(scope) };

                scope.onNumberField = function () {
                    if (!scope.onField)
                        return false;

                    return (scope.onField.ControlType == "number");
                };

                scope.recalculateGridWidth = function (length) {
                    console.log("recalculateGridWidth with length: " + length);

                    var minwidth = (980 < $window.innerWidth) ? $window.innerWidth - 50 : 980;
                    //console.log("minwidth: " + minwidth);

                    var width = 150 * length; //multiply number of columns by 100px
                    //console.log("or multiplied: " + width);

                    //if(width < minwidth) width=minwidth; //min-width
                    if (width < minwidth) width = minwidth; //min-width

                    //console.log("Decided: " + width);

                    scope.gridWidth = { width: width };
                    //refresh the grid
                    setTimeout(function () {
                        scope.gridDatasheetOptions.$gridServices.DomUtilityService.RebuildGrid(scope.gridDatasheetOptions.$gridScope, scope.gridDatasheetOptions.ngGrid); //refresh
                        console.log("Width now: " + width);
                    }, 400);
                };

                scope.selectCell = function (field) {
                    //console.log("select cell!");
                    scope.onField = scope.FieldLookup[field];
                };

                //dynamically set the width of the grids.
                /*
                var grid_width_watcher = scope.$watch('FieldLookup', function(){
                    var length = array_count(getMatchingByField(scope.FieldLookup,"2","FieldRoleId"));

                    console.log("Found number of detail fields: "+length);

                    //however -- if we are in full-grid mode, we need space calculated on adding in the header fields.
                    //  currently that is only for import, full datasheet and query.
                    if($route.current.controller == 'DatasetImportCtrl' || $route.current.controller == 'DataQueryCtrl' || $route.current.controller == 'DataEntryDatasheetCtrl')
                        length = array_count(scope.FieldLookup);

                    console.log("calling with length: "+ length);

                    scope.recalculateGridWidth(length);
                    grid_width_watcher(); //remove watcher.

                },true);
                */

                //only do this for pages that have editing enabled
                if (scope.gridDatasheetOptions.enableCellEdit) {
                    //setup editing rowtemplate
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="{\'has-validation-error\': !row.getProperty(\'isValid\')}" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';
                }
                else {
                    //for viewing
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';

                }

                //this is pure awesomeness: setup a watcher so that when we navigate the grid we update our current row and validate it.
                scope.$watch('gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow', function () {
                    //console.dir(scope.gridDatasheetOptions.$gridScope);
                    scope.onRow = scope.gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow;
                    //console.dir(scope.gridDatasheetOptions.$gridScope.selectionProvider);
                });

            },

            
            

            getColDefs: function (DatastoreTablePrefix, theMode) {
                console.log("Inside services, getColDefs...");
                console.log("theMode = " + theMode);
                console.log("DatastoreTablePrefix = " + DatastoreTablePrefix);

                if (DatastoreTablePrefix === "WaterTemp")   // Water Temp related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [
                            {
                                field: 'InstrumentId',
                                Label: 'Instrument',
                                displayName: 'Instrument',
                                cellFilter: 'instrumentFilter', //'','instrumentFilter',
                                //editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
                                //Field: { Description: "ID number of the instrument"}
                                editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                                visible: false,
                                Field: { Description: "Instrument the detected this value." }
                            },
                        ];
                        console.log("Water Temp-related form...");
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter', //'locationNameFilter','',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
                            {
                                field: 'InstrumentId',
                                Label: 'Instrument',
                                displayName: 'Instrument',
                                cellFilter: 'instrumentFilter', //'','instrumentFilter',
                                //editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
                                //Field: { Description: "ID number of the instrument"}
                                editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                                visible: true,
                                Field: { Description: "Instrument the detected this value." }
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status" }

                            },
                            {
                                field: 'Timezone',
                                Label: 'Reading Timezone',
                                displayName: 'Reading Timezone',
                                editableCellTemplate: TimezoneCellEditTemplate,
                                cellFilter: 'timezoneFilter',
                                Field: { Description: "The timezone the reading took place in." }
                            }
                        ];
                    }
                }
                else if (DatastoreTablePrefix === "WaterQuality")  // Water Quality related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [
                            {
                                field: 'InstrumentId',
                                Label: 'Instrument',
                                displayName: 'Instrument',
                                cellFilter: 'instrumentFilter', //'','instrumentFilter',
                                //editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
                                //Field: { Description: "ID number of the instrument"}
                                editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                                visible: false,
                                Field: { Description: "Instrument the detected this value." }
                            },
                        ];
                        console.log("Water Quality-related form...");
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter', //'locationNameFilter','',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
                            {
                                field: 'InstrumentId',
                                Label: 'Instrument',
                                displayName: 'Instrument',
                                cellFilter: 'instrumentFilter', //'','instrumentFilter',
                                //editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
                                //Field: { Description: "ID number of the instrument"}
                                editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                                visible: true,
                                Field: { Description: "Instrument the detected this value." }
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status" }

                            }
                        ];
                    }
                }
                //else if (theDatasetId == 1206) // This changes the order of the fields, to what makes for sense for the users of this dataset.
                else if (DatastoreTablePrefix === "CreelSurvey") // Creel Survey related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [
                            {
                                field: 'FishermanId',
                                Label: 'Fisherman',
                                displayName: 'Fisherman',
                                cellFilter: 'fishermanFilter',
                                editableCellTemplate: FishermanCellEditTemplate,
                                //visible:  false,
                                Field: { Description: "Fisherman that was interviewed." }
                            }
                        ];
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'activityDate',
                                Label: 'Activity Date',
                                displayName: 'Activity Date (MM/DD/YYYY)',
                                cellFilter: 'date: \'MM/dd/yyyy\'',
                                editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="' + date_pattern + '" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                                Field: { Description: "Date of activity in format: '10/22/2014'" }
                            },
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
							/*{
								field: 'QAStatusId',
								Label: 'QA Status',
								displayName: 'QA Status',
								cellFilter: 'QAStatusFilter',
								editableCellTemplate: QACellEditTemplate,
								Field: { Description: "Quality Assurance workflow status"}

							},*/
                            {
                                field: 'FishermanId',
                                Label: 'Fisherman',
                                displayName: 'Fisherman',
                                cellFilter: 'fishermanFilter',
                                editableCellTemplate: FishermanCellEditTemplate,
                                //visible:  false,
                                Field: { Description: "Fisherman that was interviewed." }
                            }
                        ];
                    }
                }
                else if ((DatastoreTablePrefix === "SpawningGroundSurvey") || //Spawning Ground related
                    (DatastoreTablePrefix === "SnorkelFish") || //Snorkel Fish related
                    (DatastoreTablePrefix === "FishTransport") || //Fish Transport related
                    (DatastoreTablePrefix === "Electrofishing") || //Electrofishing related
                    (DatastoreTablePrefix === "ScrewTrap") || //Screw Trap related
                    (DatastoreTablePrefix === "ArtificialProduction") || //ArtificialProduction related
                    (DatastoreTablePrefix === "BSample") || //BSample related
                    (DatastoreTablePrefix === "JvRearing") || //JvRearing related
                    (DatastoreTablePrefix === "Genetic") || //Genetic related
                    (DatastoreTablePrefix === "Benthic") || //Benthic related
                    (DatastoreTablePrefix === "Drift") || //Drift related
                    (DatastoreTablePrefix === "AdultWeir") //Adult Weir related
                ) {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
                            {
                                field: 'activityDate',
                                Label: 'Activity Date',
                                displayName: 'Activity Date (MM/DD/YYYY)',
                                cellFilter: 'date: \'MM/dd/yyyy\'',
                                editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="' + date_pattern + '" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                                Field: { Description: "Date of activity in format: '10/22/2014'" }
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status" }
                            }
                        ];
                    }
                }
                else if ((DatastoreTablePrefix === "StreamNet_RperS") ||
                    (DatastoreTablePrefix === "StreamNet_NOSA") ||
                    (DatastoreTablePrefix === "StreamNet_SAR")
                ) {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?" }
                            },
                            {
                                field: 'activityDate',
                                Label: 'Activity Date',
                                displayName: 'Activity Date (MM/DD/YYYY)',
                                cellFilter: 'date: \'MM/dd/yyyy\'',
                                editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="' + date_pattern + '" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                                Field: { Description: "Date of activity in format: '10/22/2014'" }
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status" }
                            }
                        ];
                    }
                }
                else if (DatastoreTablePrefix === "FishScales") //Fish Scales related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [{
                            field: 'QAStatusId',
                            Label: 'QA Status',
                            displayName: 'QA Status',
                            cellFilter: 'QAStatusFilter',
                            editableCellTemplate: QACellEditTemplate,
                            Field: { Description: "Quality Assurance workflow status" }
                        }];
                    }
                }

                else if (DatastoreTablePrefix === "Metrics") {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [{
                            field: 'QAStatusId',
                            Label: 'QA Status',
                            displayName: 'QA Status',
                            cellFilter: 'QAStatusFilter',
                            editableCellTemplate: QACellEditTemplate,
                            Field: { Description: "Quality Assurance workflow status" }
                        }];
                    }
                }

                else if (DatastoreTablePrefix === "Appraisal") // Appraisal-related (Tax Parcels)
                {
                    console.log("Configuring for Appraisal...");
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [];
                    }
                }

                else if (DatastoreTablePrefix === "CrppContracts") // CRPP Contracts-related
                {
                    console.log("Configuring for CrppContracts...");
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1)) {
                        var coldefs = [];
                    }
                    else {
                        var coldefs = [];
                    }
                }

                else {
                    var coldefs = [ ];
                }

                return coldefs;
            },

            //in order to call validate, you'll need to have your FieldLookup and CellOptions set
            //  on the controller (and obviously previously populated by the DataSheet service.)
            validate: function (row, scope) {
                if (row) {
                    //console.log("Inside validate...");
                    //console.log("scope.callingPage = " + scope.callingPage);
                    ////console.log("scope is next...");
                    ////console.dir(scope);
                    //console.log("row is next...");
                    //console.dir(row);
					//row.errors = angular.copy(row.errors); // row.errors is not filling in without doing this.
                    //console.log("row is next...");
                    //console.dir(row);
					//console.dir(row.errors);

                    //spin through our fields and validate our value according to validation rules
                    var row_errors = [];

                    //console.log("Validating a row with " + array_count(scope.FieldLookup) + " rows.");

                    // We use row_num to give us a reference for what line of data we are on, in the debugger.
                    //var row_num = 0;
					//console.log("row_errors.length = " + row_errors.length + ", row.errors.length = " + row.errors.length);
					//console.dir(row.errors);
                    angular.forEach(scope.FieldLookup, function (field, key) {
                        //TODO: first check if there is no value but one is required.

                        //if not value, ditch.
                        if (!row[key])
                            return;


                        validateField(field, row, key, scope, row_errors);
                        //row_num++;
                        //console.log("  >>incrementing!");

                    });

                    if (scope.DatastoreTablePrefix === "CreelSurvey") {
                        // Do we have a valid location?
                        if ((typeof row.LocationId !== 'undefined') && (row.LocationId !== null)) {
                            row_errors.push("[LocationId] The Location does not match anything in the Locations table for this dataset.");
                        }


                        if ((typeof row.InterviewTime === 'undefined') && (typeof row.FishermanId === 'undefined')) // No interviewTime && No FishermandId
                        {
                            // Do nothing, because we probably do not have a detail; no error.
                            console.log("No detail...");
                        }
                        else if (((typeof row.InterviewTime !== 'undefined') && (row.InterviewTime !== null)) && ((typeof row.FishermanId === 'undefined') || (row.FishermanId === null))) {
                            // We have an interview, so we must have a fisherman also; error
                            row_errors.push("[Fisherman] InterviewTime is present, but the Fisherman is missing.");
                        }
                        else // We have row.InterviewTime && row.FishermanId
                        {
                            // Verify that the fisherman is in the Fishermen table.
                            var foundName = false;
                            angular.forEach(scope.fishermenList, function (aFisherman) {
                                //console.log("aFisherman.Fullname = " + aFisherman.Fullname + ", row.Fullname =" + row.Fullname);
                                if ((typeof row.FishermanId !== 'undefined') && (aFisherman.Id === row.FishermanId)) {
                                    //console.log("Matched the fisherman to a name in the Fishermen table.");
                                    foundName = true;
                                }

                            });

                            //console.log("typeof row.FishermanId = " + typeof row.FishermanId + ", row.FishermanId = " + row.FishermanId + ", foundName = " + foundName);
                            //if ((row.FishermanId !== null) && (!foundName))
                            //	row_errors.push("Fisherman name does not match any name in the Fishermen table."); // This turns the row color to red.
                        }
                    }

                    //console.log(row_num + " --------------- is our rownum");
                    //console.log("row_errors is next...");
                    //console.dir(row_errors);
					//console.log("row.errors is next...");
					//console.dir(row.errors);
					//if ((typeof row.errors !== 'undefined') && (row.errors !== null))
					//	console.log("row_errors.length = " + row_errors.length + ", row.errors.length = " + row.errors.length);
					
					/*	Notes are in order here.
					*	All three items below (row.isValid, row.errors, and scope.gridHasErrors) are necessary to turn the row color red.
					*	If all three items ARE NOT present, the error will be flagged, but the color WILL NOT turn red.
					*/
                    if (row_errors.length > 0) {
                        //console.log("row_errors.length = " + row_errors.length)

                        row.isValid = false;
                        //row.errors = row_errors;
						
						// validateGrid(scope) calls validate
						// validate does angular.forEach on scope.dataSheetDataset, passing the data_row to here, coming in as row.
                        //row.errors = angular.copy(row_errors);

                        // If we are one ScriptTrap, first set this to false.  If we have any validation errors, we will set it to true.
                        // If we only have possible duplicate errors, we must this set to false, to enable the Import button.
                        if (scope.DatastoreTablePrefix === "ScrewTrap")
                            scope.gridHasErrors = false;

						angular.forEach(row_errors, function(item){
							if ((typeof row.errors === 'undefined') || (row.errors === null))
								row.errors = [];
							
                            row.errors.push(item);

                            if (item.indexOf("Duplicate:") < 0) // A validation error, not a duplicate
                            {
                                scope.gridHasErrors = true;
                            }

						});
						//console.log("row.errors.length = " + row.errors.length)
                        //scope.row.errors = angular.copy(row_errors);
                        //if (scope.DatastoreTablePrefix === "ScrewTrap")
                        //    scope.gridHasErrors = false;
                        //else
                        //    scope.gridHasErrors = true;
                    }
					else if ((typeof row.errors !== 'undefined') && (row.errors !== null))
					{
						//console.log("row.errors is real...");
						if (row.errors.length > 0)
						{
							//console.log("row.errors.length = " + row.errors.length)
							//row.isValid = false;
							//scope.gridHasErrors = true;
                            if (scope.DatastoreTablePrefix === "ScrewTrap") {
                                row.isValid = false;
                                scope.gridHasErrors = false;
                            }
                            else {
                                row.isValid = false;
                                scope.gridHasErrors = true;
                            }
						}
						else
						{
							row.isValid = true;						
						}
					}
                    else {
						//console.log("No Errors...");
                        row.isValid = true;
                        row.errors = undefined;
                    }

                }
				//console.log("scope.gridHasErrors = " + scope.gridHasErrors);
				//console.log("row is next...");
				//console.dir(row);
            },

            //updateHeaderField: function(field_name, scope)
            updateHeaderField: function (row, field_name, scope) {
                scope.dataChanged = true;
                console.log("Inside datasheet.js, updateHeaderField...");
                //console.log("scope is next...");
                //console.dir(scope);

                //var value = scope.row[field_name];
                if (typeof field_name === 'undefined') {
                    // We are probably checking a header field on the form.
                    field_name = row;
                    console.log("field_name updated = " + field_name);
                    var value = scope.row[row];
                }
                else {
                    var value = scope.row[field_name];
                }
                console.log("value = " + value);

                var field = scope.FieldLookup[field_name];
                var errors = [];
                var row = scope.row;
                var headers = []; //there are none; our row is the headers.

                validateField(field, scope.row, field_name, scope, errors);

                if (errors.length > 0) {
                    scope.headerFieldErrors[field_name] = errors;
                    row.isValid = false;
                    scope.headerHasErrors = true;
                    if (typeof scope.onRow !== 'undefined')
                    {
                        scope.onRow.errors = errors;
                    }
                    //scope.gridHasErrors = true;

                }
                else {
                    delete scope.headerFieldErrors[field_name];
                    row.isValid = true;
                    scope.headerHasErrors = false;
                    //row.errors = undefined;
                    if (typeof scope.onRow !== 'undefined')
                        scope.onRow.errors = undefined;
                }

                var strFieldName = field_name.toLowerCase();
                console.log("strFieldName = " + strFieldName);
                if (strFieldName == "timestart")
                {
                    //console.log("We have a TimeStart...");
                    service.checkForDuplicates(scope);
                }
                else if (strFieldName == "arrivaltime") {
                    console.log("We have a ArrivalTime...");
                    service.checkForDuplicates(scope);
                }

                //fire rules - OnChange

                fireRules("OnChange", row, field, value, headers, errors, scope);

                scope.headerHasErrors = (array_count(scope.headerFieldErrors) > 0);
                //console.log("scope is next...");
                //console.dir(scope);
                //console.log("row is next...");
                //console.dir(row);

                //console.log("scope.headerHasErrors = " + scope.headerHasErrors);
                //console.log("row.isValid = " + row.isValid);
                //console.log("scope.gridHasErrors = " + scope.gridHasErrors);
                //console.log("scope.duplicateEntry = " + scope.duplicateEntry);
                //console.log("scope.DupeCheckRunning = " + scope.DupeCheckRunning);
                //console.log("scope.activities.saving = " + scope.activities.saving);
            },

            onTimeChange: function (scope) {
                console.log("Inside datasheet.js, onTimeChange...");
                console.log("scope is next...");
                console.dir(scope);
                console.log("Leaving onTimeChange...");
            },

            undoAutoUpdate: function (scope) {
                for (var i = 0; i < scope.autoUpdate.updated.length; i++) {

                    //TODO -- eww don't do it this way! don't need rendered rows
                    var entityFieldValue = scope.gridDatasheetOptions.$gridScope.renderedRows[i].entity[scope.autoUpdate.field];

                    //console.log("Unsetting "+scope.autoUpdate.field+": " + entityFieldValue + " back to " + scope.autoUpdate.from);

                    scope.gridDatasheetOptions.$gridScope.renderedRows[i].entity[scope.autoUpdate.field] = scope.autoUpdate.from;
                }

                //set the originally changed one to still be TO
                scope.gridDatasheetOptions.$gridScope.renderedRows[scope.autoUpdate.origRowIndex].entity[scope.autoUpdate.field] = scope.autoUpdate.to;

                scope.autoUpdateUndone.push(scope.autoUpdate.field); // mark this so we don't do it again.
                scope.autoUpdate = undefined;

                service.validateGrid(scope);

            },

            //fired whenever a cell value changes.
            //updateCell: function (row, field_name, scope) {
            updateCell: function (row, field_name, scope, $rootScope) {
				console.log("Inside datasheet.js, updateCell...");
				console.log("row is next...");
				console.dir(row);
                //console.log("Field changed: " + field_name);
				//console.log("scope is next...");
				//console.dir(scope);
				//console.log("scope.row is next...");
				//console.dir(scope.row);			
				//console.log("scope.onRow.entity is next...");
				//console.dir(scope.onRow.entity);	
				
                scope.dataChanged = true;

                if (scope.onRow.entity) {
                    //var fromValue = scope.onRow.entity[field_name];
                    var toValue = row.entity[field_name];

                    //console.log("Changed " + field + " from: " + fromValue + " to: " + toValue);
                    console.log("Changed " + field_name + " to: " + toValue);
					
					//scope.removeRowErrorsBeforeRecheck();
                }
                //console.log("has an id? " + row.entity.Id);

                //make note of this update so we can save it later. (relevant only for editing)
                if (row.entity.Id) {

                    if (scope.updatedRows.indexOf(row.entity.Id) == -1) {
                        //console.log("added an update: " + row.entity.Id);
                        scope.updatedRows.push(row.entity.Id);
                    }
                    //else
                    //    console.log("Not updating a record.");
                }
                //else
                //console.log("not row.entity.id");


                //set value of multiselect back to an array


                //row.entity[field] = angular.toJson(toValue).toString();


                /*

                // bail out if it would be a duplicate update
                if(fromValue == toValue)
                {
                    scope.validateGrid(scope);
                    return;
                }

                //bail out if they've already undone this cascade once before
                if(scope.autoUpdateUndone.indexOf(field) > -1 || scope.autoUpdateFeatureDisabled)
                {
                    scope.validateGrid(scope); // before we bail out.
                    return;
                }
                */

                /*
                //go ahead and change all the others (this will expose an option to undo if they want)
                scope.autoUpdate = {
                    field: field,
                    from: fromValue,
                    to: toValue,
                    origRowIndex: row.rowIndex,
                    updated: [],
                };

                angular.forEach(scope.gridDatasheetOptions.$gridScope.renderedRows, function(data_row, key){
                    //if the value of this row is the same as what they just changed FROM
                    //  AND if the rowindex is higher than the current rowindex (cascade down only)
                    if(data_row.entity[field] == fromValue && key > row.rowIndex )
                    {
                        data_row.entity[field] = toValue;
                        scope.autoUpdate.updated.push(key);
                        //console.log("Autoupdated: " + key);
                    }
                });
                */

                var value = row.entity[field_name];
                var field = scope.FieldLookup[field_name];

                //console.dir(scope.FieldLookup);
                //console.log("field name = " + field_name);

                row = row.entity; //get the right reference for our rules

                //fire OnChange rule

                // -------------------------------------------
                //I like to write my test rules here and move into rule and delete when i'm done  ---------------------------
                //eg:
                /*
                
                                if(field_name == "Disposition")
                                {
                                    console.log("Disposition value: " + value);
                                    var testRule =
                                    {
                                        "OnChange":
                                        ""
                                    };
                
                                    field.Field.Rule = angular.fromJson(testRule);
                
                                }
                */
                // ------------------------------------------
                var headers = scope.row;
                console.log("headers is next...");
                console.dir(headers);

                if (typeof scope.onRow.entity.errors === 'undefined')
                    scope.onRow.entity.errors = [];

                if ((typeof field !== 'undefined') && (field.FieldRoleId !== null) && (field.FieldRoleId == 1)) {
                    scope.onRow.errors = [];
                    fireRules("OnValidate", row, field, value, headers, scope.onRow.errors, scope);
                }
                else {
                    fireRules("OnValidate", row, field, value, headers, scope.onRow.entity.errors, scope);
                }

                if (field && value) {
                    fireRules("OnChange", row, field, value, headers, [], scope);
                }
				
				if ((field_name === "ReadingDateTime") || (field_name === "activityDate"))
				{
					console.log("Found " + field_name);
					if ((typeof scope.activities !== 'undefined') && (scope.activities !== null))
						scope.activities.errors = undefined;
					
					//scope.gridHasErrors = (scope.validation_error_count == 0) ? false : true;
					
					scope.removeRowErrorsBeforeRecheck();
					//if (scope.DatastoreTablePrefix !== "WaterQuality")
					if ((scope.DatastoreTablePrefix !== "CrppContracts") && (scope.DatastoreTablePrefix !== "WaterQuality"))
					{
						scope.rebuildDateTimeList();
						//scope.checkForDuplicates();
                        service.checkForDuplicates(scope);
					}
					
					//this is expensive in that it runs every time a value is changed in the grid.
					scope.validateGrid(scope); //so that number of errors gets calculated properly.
				}
				else
				{
					//this is expensive in that it runs every time a value is changed in the grid.
					scope.validateGrid(scope); //so that number of errors gets calculated properly.
				}
				
				console.log("scope.gridHasErrors = " + scope.gridHasErrors);
				console.log("scope.onRow")
            },


            undoRemoveOnRow: function (scope) {
                var entity = scope.deletedRows.pop();
                scope.dataSheetDataset.push(entity);
                scope.validateGrid(scope);
            },


            removeOnRow: function (scope) {

                console.log("-------------------------------- ROW ---------",scope.onRow);
                console.log("dataset: ", scope.dataset);
                console.log(scope.filesToUpload);

                //see if there are any files in this row, if so, give a confirmation message
                var file_fields = getFileFields(scope.dataset);

                console.log("File_Fields ", file_fields);

                var files_to_delete = [];

                //spin through all of the detail file fields and gather the files (that we aren't uploading) so we can confirm the user wants to delete them.
                file_fields.Details.forEach(function (field) {
                    var file_json = scope.onRow.entity[field.DbColumnName];
                    if (file_json) {
                        var file_obj = angular.fromJson(file_json);
                        if (file_obj && Array.isArray(file_obj)) {
                            file_obj.forEach(function (file) {
                                if (scope.filesToUpload[field.DbColumnName]) {
                                    if (!isFileInList(file, scope.filesToUpload[field.DbColumnName])) {
                                        files_to_delete.push(file.Name); //add to our list of files to delete since we aren't uploading it, it must exist already.
                                    } else {
                                        removeFileFromList(file, scope.filesToUpload[field.DbColumnName]); //remove from the list of uploading files since we're dropping the row.
                                    }
                                } else {
                                    files_to_delete.push(file.Name);
                                }
                            });
                        }
                    }
                });


                if (files_to_delete.length > 0) {
                    if (!confirm("This row has files that will also be permanently deleted when you save! (" + files_to_delete.join(", ") + "). Are you sure?"))
                        return;
                }

                scope.dataChanged = true;
                scope.deletedRows.push(scope.onRow.entity);
                var index = scope.dataSheetDataset.indexOf(scope.onRow.entity);
                scope.dataSheetDataset.splice(index, 1);
                scope.onRow = undefined;
                scope.validateGrid(scope);
                
            },



            //spin through all of the rows and re-validate.
            validateGrid: function (scope) {
                console.log("Inside validateGrid...");
                //console.log("scope.callingPage = " + scope.callingPage);
                //console.dir(scope);

                if (!scope.gridDatasheetOptions.enableCellEdit)
                    return;

                console.log(">>>>>>> validating the whole grid baby");
				console.log("Resetting scope.validation_error_count...");
                scope.validation_error_count = 0;
				scope.ValidationCheckRunning = true;

                angular.forEach(scope.dataSheetDataset, function (data_row, key) {
					//console.log("data_row (before validate) is next...");
					//console.dir(data_row);
					
					// Notes:  We run checkForDuplicates right before the validation checks.
					// Therefore, we may have some rows that have been flagged as duplicate records.
					// We must retain those errors, so we cannot just set data_row.error = undefined.
					// This solution deletes the non-duplicate-type errors.
					//data_row.errors = undefined; // original line
					if ((typeof data_row.errors !== 'undefined') && (data_row.errors !== null))
					{
						data_row.errors.forEach(function(errorRow){
							console.log("errorRow = " + errorRow);
							if (errorRow.indexOf("Duplicate:") < 0)
							{
								console.log("Deleting non-duplicate-type error...");
                                const index = data_row.errors.indexOf(errorRow);

                                console.log("index = " + index);
								if (index !== -1)
								{
									data_row.errors.splice(index, 1);
								}
							}
						});
					}
					
                    service.validate(data_row, scope);
					console.log("data_row (after validate) is next...");
                    console.dir(data_row);
                    // The following scope.gridHasErrors is just a progress check, to verify that we caught errors,
                    // when they exist.
                    // However, when we have corrected errors, it is not helpful.
					console.log("scope.gridHasErrors = " + scope.gridHasErrors);
                    if (!data_row.isValid)
                        scope.validation_error_count++;
                });

                scope.gridHasErrors = (scope.validation_error_count == 0) ? false : true;
                //if (scope.DatastoreTablePrefix === "ScrewTrap") {
                //    if ((scope.gridHasErrors) && (scope.validation_error_count > 0))
                //        scope.gridHasErrors = true;
                //    else //if ((!scope.gridHasErrors) && (scope.validation_error_count > 0))
                //        scope.gridHasErrors = false;
                //}
                //else
                //    scope.gridHasErrors = (scope.validation_error_count == 0) ? false : true;

				//console.log("scope.gridHasErrors (after resetting) = " + scope.gridHasErrors);
				if (!scope.gridHasErrors)
					scope.ValidationCheckRunning = false;

				//console.log("scope.dataSheetDataset[0] is next...");
				//console.dir(scope.dataSheetDataset[0]);
				//console.log("scope.onRow.entity is next...");
				//console.dir(scope.onRow.entity);

                //console.log("scope.gridHasErrors (after checkForDuplicates, aft validateGrid) = " + scope.gridHasErrors);
                //if ((typeof scope.activities !== 'undefined') && (scope.activities !== null))
                    //console.log("scope.activities.saving = " + scope.activities.saving);

                //console.log("scope.DupeCheckRunning = " + scope.DupeCheckRunning);
                //console.log("scope.duplicateEntry = " + scope.duplicateEntry);
                //console.log("scope.weHaveDuplicates = " + scope.weHaveDuplicates);
                //console.log("scope.pageConfig.weHaveDuplicates = " + scope.pageConfig.weHaveDuplicates);
            },

            getFieldStats: function (scope) {

                if (!scope.onField || scope.onField.ControlType != "number")
                    return "";

                //first get the mean (average)
                var total = 0;
                var num_recs = 0;
                var max = undefined;
                var min = undefined;

                //calculate total (for mean), max, min
                angular.forEach(scope.dataSheetDataset, function (item, key) {

                    try {
                        var num = new Number(item[scope.onField.DbColumnName]);

                        if (!isNaN(num)) //just skip if it is not a number (NaN)
                        {
                            total += num;

                            if (typeof min == "undefined")
                                min = num;

                            if (typeof max == "undefined")
                                max = num;

                            if (num > max)
                                max = num;

                            if (num < min)
                                min = num;

                            num_recs++;
                        }
                    }
                    catch (e) {
                        //ran across something that wasn't a number (usurally a blank...)
                        console.log("couldn't convert this to a number: " + item[scope.onField.DbColumnName] + " on " + scope.onField.DbColumnName);
                    }

                });

                var mean = total / num_recs;

                var std_total = 0;

                //now do standard deviation
                angular.forEach(scope.dataSheetDataset, function (item, key) {
                    if (!isNaN(item[scope.onField.DbColumnName]))
                        std_total += Math.pow((item[scope.onField.DbColumnName] - mean), 2); //difference of each item, squared
                });

                var std_dev = Math.sqrt(std_total / (num_recs - 1));//square root of sum of squared differences

                var stats = "Mean: " + mean.toFixed(2);
                stats += " / Max: " + max;
                stats += " / Min: " + min;
                stats += " / Std Dev: " + std_dev.toFixed(2);
                stats += " / Total: " + total;

                return stats;
            },

            //checkForDuplicates: function () {
            checkForDuplicates: function (scope) {
                console.log("Inside datasheet.js, checkForDuplicates...");
                //console.log("scope.callingPage = " + scope.callingPage)
                //console.log("scope is next...");
                //console.dir(scope);
                //console.log("$rootScope in checkForDuplicates is next...");
                //console.dir($rootScope);

                if (scope.callingPage == "Import")
                    service.checkForImportDuplicates(scope);
                else if (scope.callingPage == "DataEntry")
                    service.checkForDataEntryDuplicates(scope);
                else {
                    console.log("scope.callingPage not set correctly, aborting dupe checks...");
                    return;
                }

            },

            checkForDataEntryDuplicates: function (scope)
            {
                console.log("Inside datasheet.js, checkoutForDataEntryDuplicates...");

                var dtIsoFormat = "";
                var strActivityLocationList = "";
                var strInstrumentIdList = "";
                var strTimeList = "";
                var count = 0;

                if (scope.DatastoreTablePrefix === "WaterTemp") {
                    var strReadingDateTimeList = "";
                    strActivityLocationList = scope.row.locationId;
                    console.log("typeof strActivityLocationList = " + typeof strActivityLocationList + ", strActivityLocationList = " + strActivityLocationList);
                    strInstrumentIdList = scope.row.InstrumentId;
                    console.log("typeof strInstrumentIdList = " + typeof strInstrumentIdList + ", strInstrumentIdList = " + strInstrumentIdList);

                    // As users work their way down the form, changing the location, or the instrument will
                    // trigger this function, even if they have NOT entered a ReadingDateTime yet.
                    // We must wait until we have the location, instrument, and ReadingDateTime, before we proceed.
                    if ((typeof strActivityLocationList === 'undefined') || (strInstrumentIdList === null)) return;

                    count = 0;
                    var keepGoing = true;
                    angular.forEach(scope.dataSheetDataset, function (item) {
                        console.log("item is next...");
                        console.dir(item);

                        // If the user has not entered a ReadingDateTime yet, then we DO NOT have the necessary data to continue yet.
                        if ((typeof item.ReadingDateTime !== 'undefined') && (item.ReadingDateTime !== null)) {
                            //var strIsoDateTime = null;
                            //var strIsoTime = moment(item.ReadingDateTime).format("YYYY-MM-DD").toString();
                            //var strIsoDateTime = strIsoDateTime = formatDateFromFriendlyToUtc(item.ReadingDateTime);
                            var strIsoDateTime = formatDateFromFriendlyToUtc(item.ReadingDateTime);

                            //console.log("strIsoDateTime = " + strIsoDateTime);

                            if (count === 0) {
                                strReadingDateTimeList = strIsoDateTime;
                            }
                            else {
                                strReadingDateTimeList += "," + strIsoDateTime; // Note the leading comma.
                            }
                            count++;
                        }
                        else
                            keepGoing = false;
                    });
                    if (!keepGoing)
                        return;

                    console.log("strReadingDateTimeList (with dupes) = " + strReadingDateTimeList);
                    console.log("typeof strReadingDateTimeList = " + typeof strReadingDateTimeList);

                    var aryReadingDateTimeList = strReadingDateTimeList.split(",");
                    strReadingDateTimeList = uniq_fast(aryReadingDateTimeList);
                    console.log("strReadingDateTimeList (without dupes) = " + strReadingDateTimeList);

                    console.log("strActivityLocationList (with dupes) = " + strActivityLocationList);
                    console.log("typeof strActivityLocationList = " + typeof strActivityLocationList);
                    var aryActivityLocationList = strActivityLocationList.split(",");
                    strActivityLocationList = uniq_fast(aryActivityLocationList);
                    console.log("strActivityLocationList = " + strActivityLocationList);

                    console.log("strInstrumentIdList (with dupes) = " + strInstrumentIdList);
                    console.log("typeof strInstrumentIdList = " + typeof strInstrumentIdList);
                    var aryInstrumentIdList = strInstrumentIdList.split(",");
                    strInstrumentIdList = uniq_fast(aryInstrumentIdList);
                    console.log("strInstrumentIdList = " + strInstrumentIdList);

                    var promise = null;
                    promise = DatasetService.getSpecificWaterTempActivities(scope.datasetId, strActivityLocationList, strInstrumentIdList, strReadingDateTimeList);

                    //console.log("typeof $promise = " + typeof promise);
                    if (typeof promise !== 'undefined') {
                        promise.$promise.then(function (list) {
                            console.log("promise is next...");
                            console.dir(promise);
                            if (promise.length > 0) {
                                scope.duplicateEntry = true;
                                var duplicateItems = angular.copy(promise);
                                //console.log("duplicateItems is next...");
                                //console.dir(duplicateItems);

                                angular.forEach(duplicateItems, function (item) {
                                    // The datetime coming back from the backend has a "T" in it; we must remove it.
                                    item.ReadingDateTime = item.ReadingDateTime.replace("T", " ");
                                    //console.log("item.ReadingDateTime = " + item.ReadingDateTime);

                                    angular.forEach(scope.dataSheetDataset, function (detailRecord) {
                                        // In order tom compare the "friendly" date format to the UTC coming from the backend, we must convert it UTC.
                                        strIsoDateTime = formatDateFromFriendlyToUtc(detailRecord.ReadingDateTime);

                                        // The datetime coming from the backend DOES NOT have milliseconds, so strip them off here.
                                        strIsoDateTime = strIsoDateTime.substr(0, 19); // Start here, take this many.
                                        //console.log("strIsoDateTime = " + strIsoDateTime);
                                        if (item.ReadingDateTime === strIsoDateTime) {
                                            //console.log("Found dupe...");
                                            if (!detailRecord.errors)
                                                detailRecord.errors = [];

                                            // All three of these are required to turn the lines with errors red.
                                            detailRecord.isValid = false;
                                            detailRecord.errors.push("Duplicate:  a record with this Location, Instrument, and ReadingDateTime already exists.");

                                            // During the (angular?) cycle, checkForDuplicates ends up running twice, so we get duplicate error entries.
                                            // Therefore, clean out the duplicate entries from the error array.
                                            detailRecord.errors = uniq_fast(detailRecord.errors);
                                            scope.gridHasErrors = true;
                                            scope.saving = false;
                                            console.log("scope.saving = " + scope.saving);
                                        }
                                    });

                                });
                                //console.log("scope.dataSheetDataset is next...");
                                //console.dir(scope.dataSheetDataset);
                            }
                            else {
                                scope.duplicateEntry = false;
                            }
                        });
                    }
                }
                else {
                    console.log("typeof scope.row.activityDate = " + typeof scope.row.activityDate);
                    console.log(scope.row.activityDate);
                    //console.dir(scope);

                    // If the ActivityDate is blank, we can stop right now.
                    if ((typeof scope.row.activityDate === 'undefined') || (scope.row.activityDate === null))
                        return;
                    
                    var strActivityDate = toExactISOString(scope.row.activityDate);

                    console.log("strActivityDate = " + strActivityDate);

                    strActivityDate = strActivityDate.replace("T", " ");
                    console.log("strActivityDate (without T) = " + strActivityDate);

                    // Convert the single date item to a one element array, because the back end expects an array.
                    var aryActivityDateList = strActivityDate.split(",");
                    console.log("aryActivityDateList is next...");
                    console.dir(aryActivityDateList);

                    var strActivityDateList = uniq_fast(aryActivityDateList); // Removes dupes and converts to a string.
                    console.log("strActivityDateList = " + strActivityDateList);

                    // Get the Locations
                    var intLocationId = scope.row.locationId;

                    var aryActivityLocationList = intLocationId.split(",");
                    strActivityLocationList = uniq_fast(aryActivityLocationList);
                    console.log("strActivityLocationList = " + strActivityLocationList);

                    //scope.SpecificActivitiesResults = null;

                    if (scope.DatastoreTablePrefix === "CreelSurvey") {
                        console.log("We are on CreelSurvey...");
                        strTimeList = scope.row.TimeStart;
                        console.log("strTimeList = " + strTimeList);

                        console.log("scope.datasetId = " + scope.datasetId + ", strActivityLocationList = " + strActivityLocationList + ", strActivityDateList = " + strActivityDateList + ", strTimeList = " + strTimeList);
                        var promise = DatasetService.getSpecificCreelSurveyActivities(scope.datasetId, strActivityLocationList, strActivityDateList, strTimeList);

                        //console.log("typeof $promise = " + typeof promise);
                        if (typeof promise !== 'undefined') {
                            promise.$promise.then(function (list) {
                                console.log("promise is next...");
                                console.dir(promise);
                                if (promise.length > 0) {
                                    scope.duplicateEntry = true;
                                    if (!scope.activities.errors)
                                        scope.activities.errors = {};

                                    scope.activities.errors.saveError = "Duplicate:  For this Location, Activity Date and Start Time, a record already exists.";
                                    scope.saving = false;
                                    console.log("scope.saving = " + scope.saving);
                                }
                                else {
                                    scope.duplicateEntry = false;
                                    scope.activities.errors = undefined;
                                }
                            });
                        }
                    }
                    else
                    {
                        console.log("scope.datasetId = " + scope.datasetId + ", strActivityLocationList = " + strActivityLocationList + ", strActivityDateList = " + strActivityDateList);
                        var promise = DatasetService.getSpecificActivities(scope.datasetId, strActivityLocationList, strActivityDateList);
                        console.log("Called getSpecificActivities, promise getting filled...");

                        //console.log("typeof $promise = " + typeof promise);
                        if (typeof promise !== 'undefined') {
                            promise.$promise.then(function (list) {
                                console.log("getSpecificActivities promise is next...");
                                console.dir(promise);
                                if (promise.length > 0) {
                                    if (scope.DatastoreTablePrefix === "ScrewTrap") {
                                        scope.duplicateEntry = false;
                                        if (!scope.activities.errors)
                                            scope.activities.errors = {};

                                        scope.activities.errors.saveError = "Duplicate:  For this Dataset, Location, and Activity Date, a record may already exist.";
                                        // On ScrewTrap, we allow the user to continue to save, if they wish, 
                                        // assuming that they have checked the data and know that this record IS NOT a duplicate.
                                        // We can have multiple records with the same ActivityDate, and Location.
                                        // Also some records may have a blank ArrivalTime, so the only way to check for duplicates, is to omit the ArrivalTime.
                                        // However, using only the ActivityDate and location can flag some false positives for duplicate records also.
                                        //scope.saving = false;
                                        //console.log("scope.saving = " + scope.saving);
                                    }
                                    else {
                                        scope.duplicateEntry = true;
                                        if (!scope.activities.errors)
                                            scope.activities.errors = {};

                                        scope.activities.errors.saveError = "Duplicate:  For this Dataset, Location, and Activity Date, a record already exists.";
                                        scope.saving = false;
                                        console.log("scope.saving = " + scope.saving);
                                    }
                                }
                                else {
                                    scope.duplicateEntry = false;
                                    scope.activities.errors = undefined;
                                }
                            });
                        }
                    }
                }
            },

            checkForImportDuplicates: function (scope)
            {
                console.log("Inside scope.checkForImportDuplicates...");

                console.log("scope.activities is next...");
                console.dir(scope.activities);
                console.log("scope.dataSheetDataset is next...");
                console.dir(scope.dataSheetDataset);

                var strActivityLocationList = "";
                var strInstrumentIdList = "";
                var count = 0;
                var intPlaceCount = 0;
                var keepGoing = true;
                var DateTimeIndex = -1;
                var strDupeItemDateTime = "";
                //var strIsoDateTime = "";
                var strTimeList = "";
                var errorMessage = ""

                if (scope.DatastoreTablePrefix === "WaterTemp") {
                    var strReadingDateTimeList = "";
                    var strIsoDateTime = "";

                    count = 0;
                    angular.forEach(scope.dataSheetDataset, function (item) {
                        //console.log("item is next...");
                        //console.dir(item);

                        strIsoDateTime = convertDateFromUnknownStringToUTC(item.ReadingDateTime);

                        if (count === 0) {
                            strReadingDateTimeList = strIsoDateTime;
                            strActivityLocationList = item.locationId;
                            strInstrumentIdList = item.InstrumentId;
                        }
                        else {
                            strReadingDateTimeList += "," + strIsoDateTime; // Note the leading comma.

                            // If we are on a datasheet form (not header form), each line could have a different location.
                            //if (!scope.showHeaderForm) {
                            if (!scope.pageConfig.showHeaderForm) {
                                strActivityLocationList += "," + item.locationId;
                                strInstrumentIdList += "," + item.InstrumentId;
                            }
                        }
                        count++;
                    });
                    console.log("strReadingDateTimeList (with dupes) = " + strReadingDateTimeList);
                    console.log("typeof strReadingDateTimeList = " + typeof strReadingDateTimeList);

                    var aryReadingDateTimeList = strReadingDateTimeList.split(",");
                    strReadingDateTimeList = uniq_fast(aryReadingDateTimeList);
                    console.log("strReadingDateTimeList (without dupes) = " + strReadingDateTimeList);

                    var aryActivityLocationList = strActivityLocationList.split(",");
                    strActivityLocationList = uniq_fast(aryActivityLocationList);
                    console.log("strActivityLocationList = " + strActivityLocationList);

                    var aryInstrumentIdList = strInstrumentIdList.split(",");
                    strInstrumentIdList = uniq_fast(aryInstrumentIdList);
                    console.log("strInstrumentIdList = " + strInstrumentIdList);

                    var promise = null;
                    promise = DatasetService.getSpecificWaterTempActivities(scope.datasetId, strActivityLocationList, strInstrumentIdList, strReadingDateTimeList);


                    //console.log("typeof $promise = " + typeof promise);
                    if (typeof promise !== 'undefined') {
                        promise.$promise.then(function (list) {
                            console.log("promise is next...");
                            console.dir(promise);
                            if (promise.length > 0) {
                                scope.duplicateEntry = true;
                                var duplicateItems = angular.copy(promise);
                                //console.log("duplicateItems is next...");
                                //console.dir(duplicateItems);
                                var strDupeItemDateTime = "";
                                //var intPlaceCount = 0;
                                var keepGoing = true;
                                var readingDateTimeIndex = -1;

                                //angular.forEach(duplicateItems, function(item){
                                duplicateItems.forEach(function (item) {
                                    //intPlaceCount++;
                                    // The datetime coming back from the backend has a "T" in it; we must remove it.
                                    //item.ReadingDateTime = item.ReadingDateTime.replace("T", " ");
                                    //console.log("item.ReadingDateTime = " + item.ReadingDateTime);

                                    strDupeItemDateTime = convertDateFromUnknownStringToUTC(item.ReadingDateTime);
                                    keepGoing = true;
									/*angular.forEach(scope.dataSheetDataset, function(detailRecord){
										if (keepGoing)
										{
											// In order to compare the "friendly" date format to the UTC coming from the backend, we must convert it UTC.
											//strIsoDateTime = formatDateFromFriendlyToUtc(detailRecord.ReadingDateTime);
											strIsoDateTime = convertDateFromUnknownStringToUTC(detailRecord.ReadingDateTime);
											
											// The datetime coming from the backend DOES NOT have milliseconds, so strip them off here.
											strIsoDateTime = strIsoDateTime.substr(0, 19); // Start here, take this many.
											//console.log("strDupeItemDateTime = " + strDupeItemDateTime + ", strIsoDateTime = " + strIsoDateTime);
											if (strDupeItemDateTime === strIsoDateTime)
											{
												//console.log("Found dupe...");
												keepGoing = false;
												if (!detailRecord.errors)
													detailRecord.errors = [];
												
												// All three of these are required to turn the lines with errors red.
												detailRecord.isValid = false;
												detailRecord.errors.push("Duplicate:  a record with this Location, Instrument, and ReadingDateTime already exists.");
												//scope.validation_error_count++;
												//if (scope.validation_error_count > scope.dataSheetDataset.length)
												//if (scope.validation_error_count > intPlaceCount)
												//{
												//	var strMsg = "detailRecord.ReadingDateTime = " + detailRecord.ReadingDateTime;
												//	alert(strMsg);
												//}
												
												// During the (angular?) cycle, checkForDuplicates ends of running twice, so we get duplicate error entries.
												// Therefore, clean out the duplicate entries from the error array.
												detailRecord.errors = uniq_fast(detailRecord.errors);
												scope.gridHasErrors = true;
											}
										}
									});
									*/
                                    //var strDupeItemDateTime2 = strDupeItemDateTime + ".000";
                                    //console.log("strDupeItemDateTime = " + strDupeItemDateTime2);

                                    //console.log("typeof item.ReadingDateTime = " + typeof item.ReadingDateTime);
                                    //console.log("item.ReadingDateTime = " + item.ReadingDateTime);
                                    //strIsoDateTime = toExactISOString(item.ReadingDateTime);

                                    strIsoDateTime = item.ReadingDateTime;
                                    //console.log("typeof strIsoDateTime = " + typeof strIsoDateTime);
                                    strIsoDateTime = strIsoDateTime.replace("T", " ");

                                    // strIsoDateTime starts out like this:  "YYYY-MM-DD HH.MM.SS".
                                    // Is the ReadingDateTime in this format "YYYY-MM-DD HH.MM.SS" or this "YYYY-MM-DD HH.MM.SS.mmm"?
                                    //console.log("strIsoDateTime = " + strIsoDateTime + ", scope.datetimeList[0] = " + scope.datetimeList[0]);
                                    if (strIsoDateTime.length < scope.datetimeList[0].length) {
                                        //console.log("item.ReadingDateTime has YYYY-MM-DD HH.MM.SS format.");
                                        strIsoDateTime = strIsoDateTime + ".000";
                                    }
                                    else {
                                        //console.log("item.ReadingDateTime has YYYY-MM-DD HH.MM.SS.mmm format.");
                                    }
                                    //console.log("strIsoDateTime = " + strIsoDateTime);

                                    //console.log("scope.datetimeList is next...");
                                    //console.dir(scope.datetimeList);
                                    dateTimeIndex = scope.datetimeList.indexOf(strIsoDateTime);
                                    //console.log("dateTimeIndex = " + dateTimeIndex);

                                    //console.log("scope.dataSheetDataset[dateTimeIndex] is next...");
                                    //console.dir(scope.dataSheetDataset[dateTimeIndex]);
                                    if (typeof scope.dataSheetDataset[dateTimeIndex].errors === 'undefined')
                                        scope.dataSheetDataset[dateTimeIndex].errors = [];

                                    scope.dataSheetDataset[dateTimeIndex].isValid = false;
                                    errorMessage = "Duplicate:  a record with this Location, Instrument, and ReadingDateTime already exists.";
                                    //if ((scope.dataSheetDataset[dateTimeIndex].errors.length > 0) &&
                                    //	(scope.dataSheetDataset[dateTimeIndex].errors.indexOf(errorMessage) < 0))
                                    scope.dataSheetDataset[dateTimeIndex].errors.push(errorMessage);

                                    scope.dataSheetDataset[dateTimeIndex].errors = uniq_fast(scope.dataSheetDataset[dateTimeIndex].errors);
                                    scope.gridHasErrors = true;
                                    //scope.weHaveDuplicates = true;
                                    scope.pageConfig.weHaveDuplicates = true;

                                });

                                console.log("Checking for duplicates is complete...");
                                scope.DupeCheckRunning = false;
                                //console.log("scope.dataSheetDataset (after dupe checks) is next...");
                                //scope.dataSheetDataset.forEach(function(item){
                                //	console.dir(item);
                                //});
                                //console.log("scope.gridHasErrors = " + scope.gridHasErrors);
                            }
                            else {
                                scope.duplicateEntry = false;
                                scope.DupeCheckRunning = false;
                                //scope.weHaveDuplicates = false;
                                scope.pageConfig.weHaveDuplicates = false;
                            }
                            //console.log("After the 'if' promise.length...");
                            scope.validateGrid(scope);

                            //console.log("scope.dataSheetDataset (after validation checks) is next...");
                            //scope.dataSheetDataset.forEach(function(item){
                            //	console.dir(item);
                            //});
                        });
                        //console.log("Location after promise.then (but it may not have completed yet)... ");
                    }
                }
                else {
                    var strActivityDateList = "";
                    var strTimeList = "";

                    count = 0;
                    angular.forEach(scope.dataSheetDataset, function (item) {
                        //console.log("item is next...");//***
                        //console.dir(item);//***

                        // ActivityDate
                        // If we will show the header form (header at the top), we will get the ActivityDate from scope.ActivityFields.ActivityDate.
                        // If we will NOT show the header form, we will get the ActivityDate from scope.dataSheetDataset.activityDate.
                        var strIsoDataTime = "";

                        //console.log("scope.showHeaderForm = " + scope.showHeaderForm);
                        //if (scope.showHeaderForm) {
                        if (scope.pageConfig.showHeaderForm) {
                            //console.log("scope.ActivityFields.ActivityDate = " + scope.ActivityFields.ActivityDate);
                        }

                        //var strIsoDataTime = "";
                        if (typeof item.activityDate === "string") {
                            var slashLoc = item.activityDate.indexOf("/");
                            //console.log("slashLoc = " + slashLoc);

                            if (slashLoc > -1) {
                                //console.log("The date is in friendly format; need to convert...");
                                strIsoDateTime = formatDateFromFriendlyToUtc(item.activityDate);
                                item.activityDate = strIsoDateTime.replace(" ", "T");
                                var periodLoc = strIsoDateTime.indexOf(".");
                                strIsoDateTime = strIsoDateTime.substring(0, periodLoc);
                            }
                            else {
                                //console.log("The date is in UTC; OK...");
                                strIsoDateTime = item.activityDate.replace("T", " ");
                            }
                        }
                        else // date object
                        {
                            // Use our toolbox of functions to get the date into the format we need.
                            var dtActivityDate = formatDate(item.activityDate); // Take the date object and put it in friendly format (dd/mm/yyyy ...) first;
                            //console.log("dtActivityDate = " + dtActivityDate);
                            strIsoDateTime = formatDateFromFriendlyToUtc(dtActivityDate); // Now take the date and put it in ISO format (yyyy-mm-dd ...);
                            //console.log("strIsoDateTime = " + strIsoDateTime);
                        }
 
                        //console.log("typeof item.activityDate = " + typeof item.activityDate);//***


                        if (count === 0) {
                            strActivityDateList = strIsoDateTime;
                            strActivityLocationList = item.locationId;

                            //if (scope.DatastoreTablePrefix === "ScrewTrap") {
                            //    if ((typeof item.ArrivalTime !== 'undefined') && (item.ArrivalTime !== null))
                            //        strTimeList = item.ArrivalTime;
                            //}
                            //else if (scope.DatastoreTablePrefix === "CreelSurvey") {
                            //    if ((typeof item.TimeStart !== 'undefined') && (item.TimeStart !== null))
                            //        strTimeList = item.TimeStart;
                            //}

                        }
                        else {
                            // If we are on a datasheet form (not header form), each line could have a different location.
                            //if (!scope.showHeaderForm) {
                            if (!scope.pageConfig.showHeaderForm) {
                                strActivityDateList += "," + strIsoDateTime; // Note the leading comma.
                                strActivityLocationList += "," + item.locationId;
                            }

                            //if (scope.DatastoreTablePrefix === "ScrewTrap")
                            //{
                            //    if ((typeof item.ArrivalTime !== 'undefined') && (item.ArrivalTime !== null)) {
                            //        if (strTimeList.length === 0)
                            //            strTimeList = item.ArrivalTime;
                            //        else
                            //            strTimeList += "," + item.ArrivalTime; // Note the leading comma.
                            //    }

                            //}
                            //else if (scope.DatastoreTablePrefix === "CreelSurvey") {
                            //    if ((typeof item.TimeStart !== 'undefined') && (item.TimeStart !== null)) {
                            //        if (strTimeList.length === 0)
                            //            strTimeList = item.TimeStart;
                            //        else
                            //            strTimeList += "," + item.TimeStart; // Note the leading comma.
                            //    }

                            //}
                        }
                        count++;
                    });

                    //console.log("strActivityDateList (with dupes) = " + strActivityDateList);
                    var aryActivityDateList = strActivityDateList.split(",");
                    strActivityDateList = uniq_fast(aryActivityDateList);
                    console.log("strActivityDateList (without dupes) = " + strActivityDateList);

                    var aryActivityLocationList = strActivityLocationList.split(",");
                    strActivityLocationList = uniq_fast(aryActivityLocationList);
                    console.log("strActivityLocationList = " + strActivityLocationList);

                    //var aryTimeList = strTimeList.split(",");
                    //strTimeList = uniq_fast(aryTimeList);
                    //console.log("strTimeList = " + strTimeList);

                    //console.log("scope.datasetId = " + scope.datasetId + ", scope.row.locationId = " + scope.row.locationId + ", scope.row.activityDate = " + scope.row.activityDate);
                    console.log("scope.datasetId = " + scope.datasetId + ", strActivityLocationList = " + strActivityLocationList + ", strActivityDateList = " + strActivityDateList);
                    //console.log("scope.datasetId = " + scope.datasetId + ", strActivityLocationList = " + strActivityLocationList + ", strActivityDateList = " + strActivityDateList + ", strTimeList = " + strTimeList);

                    //var promise = DatasetService.getSpecificActivities(scope.datasetId, strActivityLocationList, strActivityDateList);
                    var promise = null;
                    if ((typeof strActivityLocationList !== 'undefined') && (strActivityLocationList !== null) && (strActivityLocationList[0] !== "") &&
                        (typeof strActivityDateList !== 'undefined') && (strActivityDateList !== null) && (strActivityDateList[0] !== "")
                    )
                        promise = DatasetService.getSpecificActivities(scope.datasetId, strActivityLocationList, strActivityDateList);
                    else
                        return;

                    //var promise = null;
                    //if (scope.DatastoreTablePrefix === "ScrewTrap") {
                    //    promise = DatasetService.getSpecificScrewTrapActivities(scope.datasetId, strActivityLocationList, strActivityDateList, strTimeList);
                    //}
                    //else if (scope.DatastoreTablePrefix === "CreelSurvey") {

                    //}
                    //else {
                    //    promise = DatasetService.getSpecificActivities(scope.datasetId, strActivityLocationList, strActivityDateList);
                    //}

                    console.log("typeof $promise = " + typeof promise);
                    if (typeof promise !== 'undefined') {
                        console.log("promise is exists, but has no results yet...")
                        console.dir(promise);

                        promise.$promise.then(function (list) {
                            console.log("promise received its results and is next...");
                            console.dir(promise);
                            //console.log("list is next...");
                            //console.dir(list);
                            if (promise.length > 0) {
                                //scope.duplicateEntry = true;
                                if (scope.DatastoreTablePrefix === "ScrewTrap")
                                    scope.duplicateEntry = false;
                                else
                                    scope.duplicateEntry = true;

                                var duplicateItems = angular.copy(promise);

                                //if (scope.showHeaderForm) {
                                if (scope.pageConfig.showHeaderForm) {
                                    console.log("typeof scope.activities = " + typeof scope.activities);
                                    console.dir(scope.activities);
                                    if ((typeof scope.activities === 'undefined') || (scope.activities === null))
                                        scope.activities = {};

                                    scope.activities.errors = {};
                                    console.log("scope.DatastoreTablePrefix = " + scope.DatastoreTablePrefix);
                                    if (scope.DatastoreTablePrefix === "ScrewTrap") {
                                        scope.duplicateEntry = false;
                                        scope.activities.errors.saveError = "Duplicate:  For this Dataset, Location, Activity Date, and ArrivalTime, a record may already exist.";
                                        scope.gridHasErrors = $rootScope.gridHasErrors = false;
                                    }
                                    else {
                                        scope.duplicateEntry = true;
                                        scope.activities.errors.saveError = "Duplicate:  For this Dataset, Location, and Activity Date, a record already exists.";
                                        scope.saving = false;
                                        scope.gridHasErrors = $rootScope.gridHasErrors = true;
                                    }

                                }
                                else {
                                    console.log("scope.datetimeList is next..");
                                    console.dir(scope.datetimeList);

                                    console.log("duplicateItems.length = " + duplicateItems.length);
                                    count = 1;
                                    //console.dir(scope);
                                    angular.forEach(duplicateItems, function (item) {
                                        //console.log("item is next...");
                                        //console.dir(item);

                                        //console.log("scope.dataSheetDataset (inside duplicateItems loop) is next...");
                                        //console.dir(scope.dataSheetDataset);
                                        angular.forEach(scope.dataSheetDataset, function (detailRecord) {
                                            // In order to compare the "friendly" date format to the UTC coming from the backend, we must convert it UTC.
                                            //strIsoDateTime = formatDateFromFriendlyToUtc(detailRecord.activityDate);
                                            strIsoDateTime = detailRecord.activityDate;

                                            // The datetime coming from the backend DOES NOT have milliseconds, so strip them off here.
                                            strIsoDateTime = strIsoDateTime.substr(0, 19); // Start here, take this many.
                                            //console.log("item.ActivityDate = " + item.ActivityDate + ", strIsoDateTime = " + strIsoDateTime);
                                            if (item.ActivityDate === strIsoDateTime) {
                                                //console.log("Found dupe...");
                                                if (!detailRecord.errors)
                                                    detailRecord.errors = [];

                                                if (scope.DatastoreTablePrefix === "ScrewTrap") {
                                                    // All three of these are required to turn the lines with errors red.
                                                    detailRecord.isValid = false;
                                                    detailRecord.errors.push("Duplicate:  a record with this Dataset, Location, and ActivityDate may already exist.");
                                                    //scope.validation_error_count++;

                                                    // During the (angular?) cycle, checkForDuplicates ends up running twice, so we get duplicate error entries.
                                                    // Therefore, clean out the duplicate entries from the error array.
                                                    detailRecord.errors = uniq_fast(detailRecord.errors);
                                                    scope.gridHasErrors = $rootScope.gridHasErrors = false;
                                                    //scope.weHaveDuplicates = $rootScope.weHaveDuplicates = true;
                                                    scope.pageConfig.weHaveDuplicates = $rootScope.weHaveDuplicates = true;
                                                }
                                                else {
                                                    // All three of these are required to turn the lines with errors red.
                                                    detailRecord.isValid = false;
                                                    detailRecord.errors.push("Duplicate:  a record with this Dataset, Location, and ActivityDate already exists.");
                                                    //scope.validation_error_count++;

                                                    // During the (angular?) cycle, checkForDuplicates ends up running twice, so we get duplicate error entries.
                                                    // Therefore, clean out the duplicate entries from the error array.
                                                    detailRecord.errors = uniq_fast(detailRecord.errors);
                                                    scope.gridHasErrors = $rootScope.gridHasErrors = true;
                                                    //scope.weHaveDuplicates = $rootScope.weHaveDuplicates = true;
                                                    scope.pageConfig.weHaveDuplicates = $rootScope.weHaveDuplicates = true;
                                                }
                                            }
                                        });

                                        //console.log("Finished inside looping through scope.dataSheetDataset for ActivityDate errors...");
                                    });
                                    //console.log("Finished outside looping through duplicateItems for ActivityDate errors...");
                                }
                                //console.log("After 'if' checking for duplicates...");
                            }
                            else {
                                scope.duplicateEntry = false;
                                //scope.weHaveDuplicates = false;
                                scope.pageConfig.weHaveDuplicates = false;
                            }
                            scope.DupeCheckRunning = false;
                            //console.log("After the 'if' promise.length...");
                            console.log("scope.dataSheetDataset is next...");
                            console.dir(scope.dataSheetDataset);
                            console.error("---");

                            scope.validateGrid(scope);
                        });
                        console.log("Location after promise.then (but it may not have completed yet)... ");
                    }
                }
                console.log("scope.dataSheetDataset is next...");
                console.dir(scope.dataSheetDataset);

                $rootScope.dataSheetDataset = angular.copy(scope.dataSheetDataset);
                //console.dir(scope);
                //console.dir($rootScope);
                scope.DupeCheckRunning = false;
                //console.log("scope.DupeCheckRunning (at end of checkForDuplictes) = " + scope.DupeCheckRunning);
            },
            

        } //end service

        return service;

    }]);