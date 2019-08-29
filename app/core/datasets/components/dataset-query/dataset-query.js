
var dataset_query = ['$scope', '$routeParams', 'DatasetService', '$location', '$uibModal', 'DataSheet', '$rootScope', 'ChartService',
    'ProjectService', 'CommonService', 'SubprojectService','GridService','$timeout', 
    function ($scope, $routeParams, DatasetService, $location, $modal, DataSheet, $rootScope, ChartService, ProjectService, CommonService, SubprojectService, GridService, $timeout) {

        $scope.system = { loading: true, messages : [] };

        $scope.Criteria = {};
        $scope.criteriaList = [];
        $scope.AutoExecuteQuery = false;
        $scope.selectedRow = {};
        $scope.onField = {};

        $scope.instrumentIdList = [];
        $scope.instrumentAccuracyCheckList = [];

        $scope.dataset = DatasetService.getDataset($routeParams.Id);

        $scope.dataset.$promise.then(function () {

            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);

            if ($scope.dataset.Datastore.TablePrefix === "WaterTemp")
                $scope.instrumentAccuracyCheckList = ProjectService.getAllInstrumentAccuracyChecks();

            $scope.project.$promise.then(function () {

                //if ($scope.dataset.Datastore.TablePrefix === "WaterTemp")
                //    $scope.instrumentAccuracyCheckList = ProjectService.getAllInstrumentAccuracyChecks();

                $scope.activateGrid();
            });

        });

        $scope.clearValue = function()
        {
            $scope.Criteria.Value = null;
            console.dir($scope.Criteria);
        };


        //ag-grid - header + details --- all in one grid for multiple activities
        $scope.dataAgGridOptions = {
            animateRows: true,
            //enableSorting: true,
            //enableFilter: true, 
            //enableColResize: true,
            //showToolPanel: false,
            columnDefs: null,
            rowData: [],
            rowSelection: 'multiple',

            onSelectionChanged: function (params) {
                $scope.selectedRow = $scope.dataAgGridOptions.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
        
            onCellFocused: function (params) {
                //console.dir(params);
                if (!params.column)
                    return;

                $scope.onField = (params.column.colDef.cdmsField);
                $scope.$apply();
            },

            onGridReady: function (params) {
                console.log("GRID READY fired. ------------------------------------------>>>");
                $scope.system.loading = false;
                $scope.$apply();
            },

            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },

            processCellForClipboard: $scope.processCellDataForOutput, 
        };

        $scope.activateGrid = function () {
            console.log("activating grid!");
            //setup grid and coldefs and then go!
            $timeout(function () {

                //need to set some header field possible values manually BEFORE we load our coldefs - so that the named value will display in the grid.
                var instrument_coldef = getByField($scope.dataset.Fields,"InstrumentId", "DbColumnName");
                if (instrument_coldef) {
                    instrument_coldef.Field.PossibleValues = instrumentsToPossibleValues($scope.project.Instruments);
                }

                //var accuracyCheck_coldef = getByField($scope.dataset.Fields, "AccuracyCheckId", "DbColumnName");
                //if (accuracyCheck_coldef) {
                    //$scope.project.Instruments.forEach

                //    accuracyCheck_coldef.Field.PossibleValues = instrumentAccuracyChecksToPossibleValues($scope.project.Instruments.AccuracyChecks);
                //}
              
                //var hidden_header_controltypes = ["file", "hidden", "accuracy-check-select", "activity-text", "instrument-select", "post-accuracy-check-select", "qa-status-comment", "timezone-select"];
                var hidden_header_controltypes = ["file", "hidden", "activity-text", "instrument-select", "qa-status-comment", "timezone-select"];
                //var hidden_grid_controltypes = ["hidden", "activity-text","accuracy-check-select","timezone-select","post-accuracy-check-select"];
                var hidden_grid_controltypes = ["hidden", "activity-text", "timezone-select"];

                $scope.dataAgColumnDefs = GridService.getAgColumnDefs($scope.dataset);
                
                //setup any possible values that are needed - detail
                //note: the "hide" property hides the column in the results grid; the "hide_header" hides it in the header list in columns multiselect
                angular.forEach($scope.dataAgColumnDefs.DetailFields, function (fieldDef) {
                    if (fieldDef.field == "QAStatusId") { //RowQAStatusId because we're in the details
                        fieldDef.field = fieldDef.DbColumnName = "RowQAStatusId"; 
                        fieldDef.PossibleValuesList = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');
                        fieldDef.setPossibleValues(fieldDef.PossibleValuesList);
                        fieldDef.hide_header = true; 
                        
                    } else {
                        fieldDef.PossibleValuesList = getParsedMetadataValues(fieldDef.PossibleValues);
                    }

                    if (fieldDef.ControlType == 'file' || fieldDef.ControlType == 'hidden')
                        fieldDef.hide_header = true;
                    
                });

                //setup activity fields to point to the right place
                //note: the "hide" property hides the column in the results grid; the "hide_header" hides it in the header list in columns multiselect
                angular.forEach($scope.dataAgColumnDefs.HeaderFields, function (fieldDef) {
                    //console.dir(fieldDef);
                    if (fieldDef.field == "LocationId") {

                        //load the config so that we can check if we are supposed to include the habitat sites for this project                        
                        try {
                            $scope.project.Config = ($scope.project.Config) ? angular.fromJson($scope.project.Config) : {};
                        } catch (e) { 
                            console.error("config could not be parsed for project" + $scope.project.Config);
                            console.dir(e);
                        }

                        //do we need to pull in habitat site locations?
                        if ($scope.project.Config.ShowHabitatSitesForDatasets && $scope.project.Config.ShowHabitatSitesForDatasets.contains($scope.dataset.Name)) { 
                            $scope.project.Locations.forEach(function (loc) {
                                if (loc.LocationTypeId == LOCATION_TYPE_Hab) {
                                    //switch the type to say "it is one of us" and add the label...
                                    loc.LocationTypeId = $scope.dataset.Datastore.LocationTypeId;
                                    loc.Label = loc.Label + " (Hab Site)";
                                }
                            });
                        }

                        var dataset_locations = getAllMatchingFromArray($scope.project.Locations, $scope.dataset.Datastore.LocationTypeId, 'LocationTypeId');

                        //if no locations for this dataset, use the primary project location
                        if (dataset_locations.length == 0) {
                            $scope.project.Locations.forEach(function (loc) { 
                                if (loc.LocationTypeId == PRIMARY_PROJECT_LOCATION_TYPEID) {
                                    dataset_locations.push(loc);
                                }
                            });
                        }

                        dataset_locations = dataset_locations.sort(orderByAlpha);

                        fieldDef.PossibleValuesList = dataset_locations; //makeObjects(dataset_locations, 'Id', 'Label'); //used in the headers

                        if (fieldDef.hasOwnProperty('setPossibleValues')) 
                            fieldDef.setPossibleValues(makeObjects(dataset_locations, 'Id', 'Label')); //used in the grid

                    } else if (fieldDef.field == "QAStatusId") { //ActivityQAStatusId 
                        fieldDef.field = fieldDef.DbColumnName = "ActivityQAStatusId";
                        fieldDef.PossibleValuesList = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');

                        if (fieldDef.hasOwnProperty('setPossibleValues'))
                            fieldDef.setPossibleValues(fieldDef.PossibleValuesList);

                        fieldDef.hide_header = true; //hide in header
                    }
                    else if (fieldDef.field == "QAComments") { //ActivityQAStatusId 
                        fieldDef.field = fieldDef.DbColumnName = "ActivityQAComments";
                    }

                    if (fieldDef.ControlType == "select" || fieldDef.ControlType == "multiselect") {
                        fieldDef.PossibleValuesList = getParsedMetadataValues(fieldDef.PossibleValues);

                        if (fieldDef.hasOwnProperty('setPossibleValues'))
                            fieldDef.setPossibleValues(fieldDef.PossibleValuesList);

                    } else if (fieldDef.ControlType == "instrument-select") {// || fieldDef.ControlType == "accuracy-check-select" || fieldDef.ControlType =="post-accuracy-check-select" || fieldDef.ControlType == "timezone-select") {
                        fieldDef.PossibleValuesList = makeObjects(fieldDef.PossibleValues, 'Id', 'Label'); 

                        if (fieldDef.hasOwnProperty('setPossibleValues'))
                            fieldDef.setPossibleValues(fieldDef.PossibleValuesList);

                        //fieldDef.AccuracyChecks = 

                    } else if (fieldDef.ControlType == "fisherman-select") {
                        fieldDef.PossibleValuesList = fieldDef.PossibleValues;

                        if (fieldDef.hasOwnProperty('setPossibleValues'))
                            fieldDef.setPossibleValues(fieldDef.PossibleValuesList);

                    } else if (fieldDef.ControlType == "number-select") {
                        fieldDef.PossibleValuesList = fieldDef.PossibleValues;

                        if (fieldDef.hasOwnProperty('setPossibleValues'))
                            fieldDef.setPossibleValues(fieldDef.PossibleValuesList);

                    } else if (fieldDef.ControlType == "accuracy-check-select") {
                        fieldDef.PossibleValuesList = fieldDef.PossibleValues;

                        if (fieldDef.hasOwnProperty('setPossibleValues'))
                            fieldDef.setPossibleValues(fieldDef.PossibleValuesList);

                    } else if (fieldDef.ControlType == "post-accuracy-check-select") {
                        fieldDef.PossibleValuesList = fieldDef.PossibleValues;

                        if (fieldDef.hasOwnProperty('setPossibleValues'))
                            fieldDef.setPossibleValues(fieldDef.PossibleValuesList);

                    }

                    //hidden headers
                    if (hidden_header_controltypes.contains(fieldDef.ControlType))
                        fieldDef.hide_header = true; //just the headers

                    //hidden in grid
                    if (hidden_grid_controltypes.contains(fieldDef.ControlType))
                        fieldDef.hide = true; //just the detail
                    

                });

                $scope.dataAgGridOptions.columnDefs = $scope.dataAgColumnDefs.HeaderFields.concat($scope.dataAgColumnDefs.DetailFields);

                //console.log("Ready to go!");
                //console.dir($scope.dataAgGridOptions.columnDefs);
                //console.dir($scope.imported_rows);


                var ag_grid_div = document.querySelector('#query-grid');    //get the container id...
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.dataAgGridOptions); //bind the grid to it.
                //$scope.dataAgGridOptions.api.showLoadingOverlay(); //show loading...

                //set the detail values into the grid
                //$scope.dataAgGridOptions.api.setRowData($scope.imported_rows);
                
                //$scope.dataAgGridOptions.api.redrawRows();  
                //GridService.autosizeColumns($scope.dataAgGridOptions);

                //$scope.calculateStatistics();

            }, 0);
        };


        $scope.addCriteria = function(){
            // Notes...
            // When we have a list of possible values, such as the sex of a fish (["Male","Female","Unknown"]),
            // and the list is an array, we pick the item, for example "Male", and store the value in the backend.
            // However, when the list is itself an object (Fishermen, or StreamName), the possible values are
            // a collection of key value pairs, and the list is NOT an array.  In this case the Id gets stored
            // in the backend, NOT the name on the screen.

            // When the user selects only 1 item from the list, it gets converted to a number (below).
            // However, when the user selects 2 or more items from the list, the value becomes an array.
            // Therefore, we must walk this list first, and check each item against the PossibleValues.

            //possible values that are associative arrays will need to dereference from the value to the key
            /*if ($scope.Criteria.ParamFieldSelect[0].PossibleValues && !Array.isArray($scope.Criteria.ParamFieldSelect[0].PossibleValues)) {
                Object.keys($scope.Criteria.ParamFieldSelect[0].PossibleValues).forEach(function (key) { 
                    if ($scope.Criteria.ParamFieldSelect[0].PossibleValues[key] == $scope.Criteria.Value) {
                        //$scope.Criteria.DisplayName = $scope.Criteria.Value;
                        $scope.Criteria.Value = key; //convert it to the key instead of the value...
                    }
                });
            }
            */


            if ($scope.Criteria.ParamFieldSelect[0].PossibleValues && !Array.isArray($scope.Criteria.ParamFieldSelect[0].PossibleValues)) {
                if (Array.isArray($scope.Criteria.Value)) {
                    var arySearchList = [];
                    var aryDisplayList = [];
                    
                    $scope.Criteria.Value.forEach(function (item) {
                        // If the item is already a number, just add it to the list.
                        // Otherwise, we must convert it to a number.
                        if (parseInt(item)) {
                            //Object.keys($scope.Criteria.ParamFieldSelect[0].PossibleValuesList).forEach(function (key) {
                            $scope.Criteria.ParamFieldSelect[0].PossibleValuesList.forEach(function (key) {
                                if (key.Id === parseInt(item)) {
                                    arySearchList.push(item);
                                    aryDisplayList.push(key.Label);
                                }
                            });
                        }
                        else {
                            Object.keys($scope.Criteria.ParamFieldSelect[0].PossibleValuesList).forEach(function (key) {
                                if ($scope.Criteria.ParamFieldSelect[0].PossibleValues[key] === item) {
                                    arySearchList.push(key);
                                    aryDisplayList.push(item);
                                }
                            });
                        }
                    });

                    $scope.Criteria.Value = "[" + arySearchList.join() + "]";
                    $scope.Criteria.DisplayName = "[" + aryDisplayList.join() + "]";
                }
                else {
                    Object.keys($scope.Criteria.ParamFieldSelect[0].PossibleValues).forEach(function (key) {

                        if ($scope.Criteria.ParamFieldSelect[0].PossibleValues[key] == $scope.Criteria.Value) {
                            //$scope.Criteria.DisplayName = $scope.Criteria.Value;
                            $scope.Criteria.Value = key; //convert it to the key instead of the value...
                        }

                    });
                }
            }
            else {
                Object.keys($scope.Criteria.ParamFieldSelect[0].PossibleValues).forEach(function (key) {

                    if ($scope.Criteria.ParamFieldSelect[0].PossibleValues[key] == $scope.Criteria.Value) {
                        $scope.Criteria.DisplayName = $scope.Criteria.Value;
                    }

                });
            }

            
            $scope.criteriaList.push({
                DbColumnName: 		$scope.Criteria.ParamFieldSelect[0].DbColumnName,
                Id: 				$scope.Criteria.ParamFieldSelect[0].cdmsField.Id,
                Value:              $scope.Criteria.Value,
                DisplayName:        $scope.Criteria.DisplayName,
            });

            
            //console.log($scope.Criteria.ParamFieldSelect[0].PossibleValues
            //console.dir($scope.Criteria.ParamFieldSelect[0]);
            console.dir($scope.criteriaList);
        
            $scope.Criteria.Value = null;
            $scope.Criteria.DisplayName = null;
        
            if($scope.AutoExecuteQuery)
                $scope.executeQuery();
        };



        $scope.executeQuery = function(){
                        	
            $scope.query = $scope.buildQuery();
        
            $scope.query.results = DatasetService.queryActivities($scope.query);
            
            $scope.query.results.$promise.then(function () { 

                $scope.query.results.forEach(function (item) {
                    $scope.instrumentAccuracyCheckList.forEach(function (accCheck) {
                        if (item.AccuracyCheckId === accCheck.Id) {
                            item.AccuracyCheckId = accCheck.Bath1Grade + "-" + accCheck.Bath2Grade + " " + moment(accCheck.CheckDate).format('MMM DD YYYY');
                        }
                        if (item.PostAccuracyCheckId === accCheck.Id) {
                            item.PostAccuracyCheckId = accCheck.Bath1Grade + "-" + accCheck.Bath2Grade + " " + moment(accCheck.CheckDate).format('MMM DD YYYY');
                        }
                    });
                });

                $scope.dataAgGridOptions.api.setRowData($scope.query.results);
                $scope.query.loading = false;

            });

        };


        $scope.buildQuery = function(){
                    	
            var queryCriteriaList = angular.copy($scope.criteriaList);
            queryCriteriaList.forEach(function (criteria) { 
                try {
                    if(Array.isArray(criteria.Value))
                        criteria.Value = angular.toJson(criteria.Value);
                } catch (e) { 
                    //oh well.
                }
            });

            var query = null;
            query = 
            {
                criteria: {
                    DatasetId: 	  $scope.dataset.Id,
                    //QAStatusId:   $scope.Criteria.ParamQAStatusId,
                    //RowQAStatusId: $scope.Criteria.ParamRowQAStatusId,
                    //Locations:    angular.toJson($scope.Criteria.LocationIds).toString(),
                    //FromDate:     $scope.Criteria.BetweenFromActivityDate,
                    //ToDate:       $scope.Criteria.BetweenToActivityDate,
                    //DateSearchType: $scope.Criteria.paramActivityDateType, 
                    Fields: 	  queryCriteriaList,
                    TablePrefix:  $scope.dataset.Datastore.TablePrefix,
                },
                loading: true,
            };
                    	
            //console.log("query in buildQuery is next...");
            //console.dir(query);
        
            return query;
        };

        $scope.removeCriteria = function(idx) {
            $scope.criteriaList.splice(idx,1);
            if($scope.AutoExecuteQuery)
                $scope.executeQuery();
        };


        $scope.openActivity = function()
        {
            console.dir($scope.selectedRow);
            $location.path("/dataview/"+$scope.selectedRow.ActivityId);
        };

        //export the data - button click
        $scope.doExport = function () {

            if (!$scope.ExportFilename) {
                alert("Please enter a name for your export file like: 'TucannonJune25Export'.");
                return;
            }

            var params = {
                fileName: $scope.ExportFilename + ".xlsx",
                processCellCallback : $scope.processCellDataForOutput,
            };

            $scope.dataAgGridOptions.api.exportDataAsExcel(params);
        };

        //this is used by both export and copy functions to de-reference our values
        $scope.processCellDataForOutput = function (params) { 

            //here we do any special formatting since export does NOT call cell renderers or cell formatters...
            if (params.column.colDef.DbColumnName == "LocationId") {
                return params.column.colDef.PossibleValues[params.value];
            }

            if (params.column.colDef.DbColumnName == "InstrumentId") {
                return params.column.colDef.PossibleValues[params.value];
            }

            if (params.column.colDef.DbColumnName == "FishermanId") {
                return params.column.colDef.PossibleValues[params.value];
            }

            if (params.column.colDef.DbColumnName == "StreamName") {
                return params.column.colDef.PossibleValues[params.value];
            }

            if (params.column.colDef.DbColumnName == "ActivityQAStatusId" ) {
                return params.column.colDef.PossibleValues[params.value];
            }

            if (params.column.colDef.DbColumnName == "RowQAStatusId") {
                return params.column.colDef.PossibleValues[params.value];
            }

            if (params.column.colDef.ControlType == 'file' || params.column.colDef.ControlType == 'link') {
                var retvalue = [];
                var files = getFilesArrayAsList(params.value);
                files.forEach(function (file) { 
                    if (params.column.colDef.ControlType == 'file')
                        retvalue.push(file.Name);
                    else if (params.column.colDef.ControlType == 'link')
                        retvalue.push(file.Link);
                });
                return retvalue.join();
            }

            if (params.column.colDef.ControlType == "datetime" || params.column.colDef.ControlType == "time") { 
                retval = params.value;
                try {
                    retval = moment(params.value).format("YYYY-MM-DD HH:mm:ss");
                } catch (e) { 
                    console.log("problem converting: " + retval + " to datetime text");
                    console.dir(e);
                }
                return retval;
            }

            if (params.column.colDef.ControlType == "date" || params.column.colDef.ControlType == "activity-date") { 
                retval = params.value;
                try {
                    retval = moment(params.value).format("YYYY-MM-DD");
                } catch (e) { 
                    console.log("problem converting: " + retval + " to datetime text");
                    console.dir(e);
                }
                return retval;
            }
                    
            //default
            return params.value;

        };

    }];