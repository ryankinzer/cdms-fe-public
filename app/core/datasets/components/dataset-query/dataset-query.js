﻿
var dataset_query = ['$scope', '$routeParams', 'DatasetService', '$location', '$uibModal', 'DataSheet', '$rootScope', 'ChartService',
    'ProjectService', 'CommonService', 'SubprojectService','GridService','$timeout', 
    function ($scope, $routeParams, DatasetService, $location, $modal, DataSheet, $rootScope, ChartService, ProjectService, CommonService, SubprojectService, GridService, $timeout) {

        $scope.system = { loading: true, messages : [] };

        $scope.Criteria = {};
        $scope.criteriaList = [];
        $scope.AutoExecuteQuery = false;
        $scope.selectedRow = {};
        $scope.onField = {};

        $scope.dataset = DatasetService.getDataset($routeParams.Id);

        $scope.dataset.$promise.then(function () {

            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);

            $scope.project.$promise.then(function () { 
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
                
                var hidden_header_controltypes = ["file", "hidden", "accuracy-check-select", "activity-text", "instrument-select", "post-accuracy-check-select", "qa-status-comment", "timezone-select"];
                var hidden_grid_controltypes = ["hidden", "activity-text","accuracy-check-select","timezone-select","post-accuracy-check-select"];

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
                    } else if (fieldDef.ControlType == "fisherman-select") {
                        fieldDef.PossibleValuesList = fieldDef.PossibleValues;

                        if (fieldDef.hasOwnProperty('setPossibleValues'))
                            fieldDef.setPossibleValues(fieldDef.PossibleValuesList);
                    } else if (fieldDef.ControlType == "number-select") {
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
            
            //possible values that are associative arrays will need to dereference from the value to the key
            if ($scope.Criteria.ParamFieldSelect[0].PossibleValues && !Array.isArray($scope.Criteria.ParamFieldSelect[0].PossibleValues)) {
                Object.keys($scope.Criteria.ParamFieldSelect[0].PossibleValues).forEach(function (key) { 
                    if ($scope.Criteria.ParamFieldSelect[0].PossibleValues[key] == $scope.Criteria.Value)
                        $scope.Criteria.Value = key; //convert it to the key instead of the value...
                });
            }           

            $scope.criteriaList.push({
                DbColumnName: 		$scope.Criteria.ParamFieldSelect[0].DbColumnName,
                Id: 				$scope.Criteria.ParamFieldSelect[0].cdmsField.Id,
                Value: 				$scope.Criteria.Value,
            });

            
            //console.log($scope.Criteria.ParamFieldSelect[0].PossibleValues
            //console.dir($scope.Criteria.ParamFieldSelect[0]);
            console.dir($scope.criteriaList);
        
            $scope.Criteria.Value = null;
        
            if($scope.AutoExecuteQuery)
                $scope.executeQuery();
        };



        $scope.executeQuery = function(){
                        	
            $scope.query = $scope.buildQuery();
        
            $scope.query.results = DatasetService.queryActivities($scope.query);
            
            $scope.query.results.$promise.then(function () { 
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



        /*
                    $scope.headerFields = [];
                    $scope.detailFields = [];
                    $scope.datasheetColDefs = [];
                    $scope.query = {results: []};
                    $scope.dataSheetDataset = [];
                    $scope.dataFields = [];
                    $scope.criteriaList = [];
                    $scope.queryToolVisible = true;
                    $scope.Criteria = {};
                        $scope.Criteria.paramActivityDateType = "all"; //default
                        var migrationYearDate = new Date();
                        var migrationYear = migrationYearDate.getFullYear();
                        var migrationMonth = migrationYearDate.getMonth();
                        if (migrationMonth > 9)
                        {
                            migrationYear++;
                        }
                        $scope.Criteria.paramActivityWhereMigrationYear = migrationYear;
        
                    $scope.AutoExecuteQuery = true;
        
                    $scope.row = {ActivityQAStatus: {}}; //header field values get attached here by dbcolumnname
        
                    $scope.sortedLocations = [];
                    $scope.datasetLocationType=0;
                    $scope.datasetLocations = [[]];		
                    $scope.primaryProjectLocation = 0;
                    $scope.showActivitiesWhereAll = true;
                    $scope.showActivitiesWhereMigrationYear = false;
                    $scope.showActivitiesWhereRunYear = false;
                    $scope.showActivitiesWhereReportYear = false;
                    $scope.showActivitiesWhereSpawningYear = false;
                    $scope.showActivitiesWhereBroodYear = false;
                    $scope.showActivitiesWhereOutmigrationYear = false;
                    $scope.showActivitiesWhereSampleYear = false;
        
                    $scope.fishermenList = null;
                    //$scope.fishermenOptions = $rootScope.fishermenOptions = null;		
                    $scope.migrationYearsList = [];
                    $scope.runYearsList = [];	
                    $scope.reportYearsList = [];
                    $scope.spawningYearsList = [];
                    $scope.broodYearsList = [];
                    $scope.outmigrationYearsList = [];	
        
                    $scope.fieldIndex = 0;
        
                    $scope.gridDatasheetOptions = { 
                        data: 'dataSheetDataset', 
                        columnDefs: 'datasheetColDefs',
                        enableColumnResize: true, 
                        enableRowSelection: true,
                        enableCellEdit: false,
                        enableSorting: true, 
                        enableCellSelection: true,
                        showFilter: false,
                        showColumnMenu: true,
                        multiSelect: false,
                    };
        
                    $scope.chartConfig = {
                          title : 'Fish by Species',
                          tooltips: true,
                          labels : false,
                          
                          legend: {
                            display: true,
                            position: 'right'
                          }
                    };
        
                    $scope.chartData = {"series": [], "data":[{ "x": "Loading...", "y": [0],"tooltip": ""}]}; //default
        
                    DataSheet.initScope($scope);
        
                    $scope.datasheetColDefs = [{   
                                                field: 'LocationId', 
                                                displayName: 'Location', 
                                                cellFilter: 'locationNameFilter'
                                            },
                                            {
                                                field: 'ActivityDate', 
                                                displayName: 'Activity Date',
                                                cellFilter: 'date: \'MM/dd/yyyy\'',
                                            },
                                            {
                                                field: 'ActivityQAStatusId',
                                                displayName: 'Activity QA',
                                                cellFilter: 'QAStatusFilter'
                                            },
                                            {
                                                //field: "QAStatusId", //QARowStatus
                                                field: "RowQAStatusId", //QARowStatus
                                                displayName: "Row QA",
                                                minWidth: 50, maxWidth: 200,
                                                cellFilter: 'RowQAStatusFilter',
                                                visible: false,  //start off hidden -- show only if relevant
                                            }
        
                                        ];
                                        	
                    $scope.datasheetColDefs2 = [ 
                                            {
                                                field: 'FishermanId',
                                                displayName: 'Fisherman',
                                                cellFilter: 'fishermanFilter',
                                            }
                                        ];
        
                    var fishermenWatcher = 
                    $scope.$watch('theFishermen.length', function(){
                        if ((typeof $scope.theFishermen !== 'undefined') && ($scope.theFishermen !== null))
                        {
                            console.log("Inside theFishermen watch...");
                            console.log("$scope.theFishermen.length = " + $scope.theFishermen.length)
                        	
                            if ($scope.theFishermen.length > 0)
                            {
                                //$scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.fishermenList, 'Id','FullName');
                                $scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.project.Fishermen, 'Id','FullName');
                                console.log("$scope.fishermenOptions is next...");
                                console.dir($scope.fishermenOptions);						
                            }
                        }
                        	
                    });
                	
                    //setup a listener to populate column headers on the grid
                    $scope.$watch('dataset.Id', function() { 
                        if(!$scope.dataset.Fields)
                            return;
                    	
                        console.log("Inside dataset.Id watcher...");
        
                        $scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
                        console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
                        $scope.datasetLocationType = getDatasetLocationType($scope.DatastoreTablePrefix);					
                        console.log("LocationType = " + $scope.datasetLocationType);				
        
                        $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
                        $scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');
                        $scope.QAStatusOptions["all"] = "- All -";
                        $scope.Criteria.ParamQAStatusId = "all";
        
                        $scope.fieldIndex = 0;
        
                    	
                        // For CreelSurvey, we must add the Fisherman field.
                        if ($scope.DatastoreTablePrefix === "CreelSurvey")
                        {
                            console.log("Dataset is Creelsurvey, adding Fisherman field...");
                            $scope.detailFields.push($scope.datasheetColDefs2);
                            //console.log("$scope.detailFields is next...");
                            //console.dir($scope.detailFields);
        
                            $scope.datasheetColDefs.push($scope.datasheetColDefs2[0]);
                            //console.log("$scope.datasheetColDefs is next...");
                            //console.dir($scope.datasheetColDefs);
                        }
                        else if ($scope.DatastoreTablePrefix === "AdultWeir") 
                        {
                            //$scope.showActivitiesWhereAll = false;
                            $scope.showActivitiesWhereAll = true;
                            $scope.showActivitiesWhereRunYear = true;
                            //$scope.Criteria.paramActivityDateType = "singleYear"; // We set this in BuildQuery instead.
                            $scope.runYearsList = DatasetService.getRunYears($scope.dataset.Id);
                        }
                        else if ($scope.DatastoreTablePrefix === "ScrewTrap") 
                        {
                            $scope.showActivitiesWhereAll = false;
                            $scope.showActivitiesWhereMigrationYear = true;
                            $scope.Criteria.paramActivityDateType = "singleYear";
                            $scope.migrationYearsList = DatasetService.getMigrationYears($scope.dataset.Id);
                        }
                        else if (($scope.DatastoreTablePrefix === "Metrics") || 
                            ($scope.DatastoreTablePrefix === "Benthic") ||
                            ($scope.DatastoreTablePrefix === "Drift")
                            )
                        {
                            $scope.showActivitiesWhereAll = false;
                            $scope.Criteria.paramActivityDateType = "singleYear";
                        	
                            //$scope.showActivitiesWhereReportYear = true;
                            if ($scope.DatastoreTablePrefix === "Metrics")
                            {
                                $scope.showActivitiesWhereReportYear = true;
                                $scope.reportYearsList = DatasetService.getReportYears($scope.dataset.Id);
                            }
                            else if ($scope.DatastoreTablePrefix === "Benthic")
                            {
                                $scope.showActivitiesWhereSampleYear = true;
                                $scope.sampleYearsList = DatasetService.getBenthicSampleYears($scope.dataset.Id);
                            }
                            else if ($scope.DatastoreTablePrefix === "Drift")
                            {
                                $scope.showActivitiesWhereSampleYear = true;
                                $scope.sampleYearsList = DatasetService.getDriftSampleYears($scope.dataset.Id);
                            }
                        	
                            $scope.datasheetColDefs = [];
                            $scope.datasheetColDefs = [{   
                                                        field: 'LocationId', 
                                                        displayName: 'Location', 
                                                        cellFilter: 'locationNameFilter'
                                                    },
                                                    {
                                                        field: 'ActivityDate', 
                                                        displayName: 'Activity Date',
                                                        cellFilter: 'date: \'MM/dd/yyyy\'',
                                                    },
                                                ];
                        }
                        else if ($scope.DatastoreTablePrefix === "StreamNet_NOSA") 
                        {
                            $scope.showActivitiesWhereAll = false;
                            $scope.showActivitiesWhereSpawningYear = true;
                            $scope.Criteria.paramActivityDateType = "singleYear";
                            $scope.spawningYearsList = DatasetService.getSpawningYears($scope.dataset.Id);
                        	
                            $scope.datasheetColDefs = [];
                            $scope.datasheetColDefs = [
                                                    {
                                                        field: 'ActivityDate', 
                                                        displayName: 'Activity Date',
                                                        cellFilter: 'date: \'MM/dd/yyyy\'',
                                                    }
                                                ];
                        }
                        else if ($scope.DatastoreTablePrefix === "StreamNet_RperS") 
                        {
                            $scope.showActivitiesWhereAll = false;
                            $scope.showActivitiesWhereBroodYear = true;
                            $scope.Criteria.paramActivityDateType = "singleYear";
                            $scope.broodYearsList = DatasetService.getBroodYears($scope.dataset.Id);
                        	
                            $scope.datasheetColDefs = [];
                            $scope.datasheetColDefs = [
                                                    {
                                                        field: 'ActivityDate', 
                                                        displayName: 'Activity Date',
                                                        cellFilter: 'date: \'MM/dd/yyyy\'',
                                                    }
                                                ];
                        }
                        else if ($scope.DatastoreTablePrefix === "StreamNet_SAR") 
                        {
                            $scope.showActivitiesWhereAll = false;
                            $scope.showActivitiesWhereOutmigrationYear = true;
                            $scope.Criteria.paramActivityDateType = "singleYear";
                            $scope.outmigrationYearsList = DatasetService.getOutmigrationYears($scope.dataset.Id);
                        	
                            $scope.datasheetColDefs = [];
                            $scope.datasheetColDefs = [
                                                    {
                                                        field: 'ActivityDate', 
                                                        displayName: 'Activity Date',
                                                        cellFilter: 'date: \'MM/dd/yyyy\'',
                                                    }
                                                ];
                        }
                        else if ($scope.DatastoreTablePrefix === "WaterTemp") 
                        {
                            $scope.showActivitiesWhereAll = true;
                        }
                        else if ($scope.DatastoreTablePrefix === "CrppContracts") 
                        {
                            $scope.projectLeadList = ProjectService.getCrppStaff(); // Get all CRPP staff.
                            $scope.showActivitiesWhereAll = false;
                            $scope.datasheetColDefs = [];
                            $scope.datasheetColDefs = [
                                {
                                    field: 'ActivityDate', 
                                    displayName: 'Activity Date',
                                    cellFilter: 'date: \'MM/dd/yyyy\'',
                                },
                                {
                                    field: 'ActivityQAStatusId',
                                    displayName: 'QA Status',
                                    cellFilter: 'QAStatusFilter'
                                },
                                {
                                    field: "QAStatusId", //QARowStatus
                                    displayName: "QA",
                                    minWidth: 50, maxWidth: 200,
                                    cellFilter: 'RowQAStatusFilter',
                                    visible: false,  //start off hidden -- show only if relevant
                                }
                            ];
                        }
                    	
                        $scope.addHeaders();
                        $scope.addDetails();
                    	
                        $scope.dataFields = $scope.dataFields.sort(orderByAlpha);
        
                        $scope.recalculateGridWidth($scope.datasheetColDefs.length);
        
                        $scope.RowQAStatuses =  $rootScope.RowQAStatuses = undefined;
        
                        // RowQAStatus should only show for the WaterTemp dataset.
                        //if($scope.dataset.RowQAStatuses.length > 1)
                        if (($scope.DatastoreTablePrefix === "WaterTemp") && ($scope.dataset.RowQAStatuses.length > 1))
                        {
                            $scope.RowQAStatuses =  $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids
        
                            //$scope.RowQAStatuses["all"] = "- All -";
                            //$scope.Criteria.ParamRowQAStatusId = ["all"];
                            $scope.datasheetColDefs[3].visible = true; //QAStatusId
                        }
                    	
                        console.log("$scope at end of watch dataset.Id is next...");
                        //console.dir($scope);
                    });
                                    	
                    $scope.$watch('project.Name', function(){
                        //if($scope.project.Name){	
                        if ((typeof $scope.project === 'undefined') || ($scope.project === null))  
                            return;
                        else if ((typeof $scope.project.Name === 'undefined') || ($scope.project.Name === null))  
                            return;  
                        else if ((typeof $scope.project.Id === 'undefined') || ($scope.project.Id === null))  
                            return; 
                    	
                        console.log("Inside DataQueryCtrl, project.Name watcher...");
                    	
                        // Original code
                        //$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ;
                        //$scope.locationOptions["all"] = "- All -";
                        //$scope.Criteria.LocationIds = ["all"]; //set the default				
        
                        console.log("scope in watch project.Name is next...");
                        //console.dir($scope);
                    	
                        //$scope.subprojectType = ProjectService.getProjectType($scope.project.Id);
                        console.log("$scope.subprojectType = " + $scope.subprojectType);
                        SubprojectService.setServiceSubprojectType($scope.subprojectType);
        
                        //if ($scope.subprojectType === "Harvest")
                        if ($scope.DatastoreTablePrefix === "CreelSurvey")
                        {
                            console.log("Loading Harvest...");
                            $scope.ShowFishermen = true;
                            $scope.theFishermen = ProjectService.getProjectFishermen($scope.project.Id);
                        }
                    	
                        console.log("ProjectLocations is next...");
                        console.dir($scope.project.Locations);
                        //var locInd = 0;
                        //for (var i = 0; i < $scope.project.Locations.length; i++ )
                        //{
                            //console.log($scope.project.Locations[i].Id + "  " + $scope.project.Locations[i].Label);
                        //	if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType)
                            //if (($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType) || ($scope.project.Locations[i].LocationTypeId === LOCATION_TYPE_Hab))
                        //	{
                                //console.log("Found one");
                        //		$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
                                //console.log("datasetLocations length = " + $scope.datasetLocations.length);
                                //locInd++;
                        //	}
                        //}
                    	
                        if ($scope.project.Locations)
                        {
                            for (var i = 0; i < $scope.project.Locations.length; i++ )
                            {
                                //console.log("projectLocations Index = " + $scope.project.Locations[i].Label);
                                //console.log($scope.project.Locations[i].LocationTypeId + "  " + $scope.datasetLocationType); //$scope.project.Locations[i]);
                                if (($scope.DatastoreTablePrefix === "Metrics") ||
                                    ($scope.DatastoreTablePrefix === "Benthic") ||
                                    ($scope.DatastoreTablePrefix === "Drift")
                                    )
                                {
                                    if (($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType) || ($scope.project.Locations[i].LocationTypeId === LOCATION_TYPE_Hab))
                                    {
                                        //console.log("Found Habitat-related location");
                                        $scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
                                    }
                                }
                                else
                                {
                                    if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType)
                                    {
                                        //console.log("Found non-Habitat-related location");
                                        $scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
                                    }
                                }
        
                                //{
                                //	//console.log("Found one");
                                //	$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
                                //	//console.log("datasetLocations length = " + $scope.datasetLocations.length);
                                //	//locInd++;
                                //}
                            }
                            console.log("datasetLocations is next...");
                            console.dir($scope.datasetLocations);
                        }
                    	
                        // When we built the array, it started adding at location 1 for some reason, skipping 0.
                        // Therefore, row 0 is blank.  The simple solution is to just delete row 0.
                        //$scope.datasetLocations.shift();
                    	
                        // During the original development, the blank row was always at row 0.  Months later, I noticed that 
                        // the blank row was not at row 0.  Therefore, it needed a different solution.
                        var index = 0;
                        angular.forEach($scope.datasetLocations, function(dsLoc)
                        {
                            if (dsLoc.length === 0)
                            {
                                $scope.datasetLocations.splice(index, 1);
                            }
                        	
                            index++;
                        });
                    	
                        console.log("datasetLocations after splice is next...");
                        console.dir($scope.datasetLocations);
        
                        $scope.datasetLocations.sort(order2dArrayByAlpha);
                        console.log("datasetLocations sorted...");
                        console.dir($scope.datasetLocations);
            	
                        // Convert our 2D array into an array of objects.
                        for (var i = 0; i < $scope.datasetLocations.length; i++)
                        {
                            $scope.sortedLocations.push({Id: $scope.datasetLocations[i][0], Label: $scope.datasetLocations[i][1]});
                        }
                        $scope.datasetLocations = [[]]; // Clean up		
                    	
                        // Convert our array of objects into a list of objects, and put it in the select box.
                        $scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.sortedLocations, 'Id','Label') ;
                        $scope.locationOptions["all"] = "- All -";
                        $scope.Criteria.LocationIds = ["all"]; //set the default
                    	
                        console.log("locationOptions is next...");
                        console.dir($scope.locationOptions);
        
                        // Keeping this code in, because we want to get it working properly.
                        // Why it does not work correctly?
                        // Even if $scope.locationOptions has only one, the array still has 2 (the one location, and a blank).
                        // Therefore, we must check for a size of 2, in order to auto-select the one location.
                        // We must turn this on, test it, and shake out the bugs.
                        if(array_count($scope.locationOptions) === 2)
                        {
                            var count = 0;
                            //there will only be one.
                            angular.forEach(Object.keys($scope.locationOptions), function(key){
                                console.log("key = " + key);
                                //if (key !== "undefined")
                                if ((count = 1) && (key !== "undefined"))
                                {
                                    $scope.row['locationId'] = key;	
                                    console.log("row is next...");
                                    console.dir($scope.row['locationId']);
                                }
                                count++;
                            });
                        	
                        }		
                        //}
                    });
        
                    $scope.$watch('migrationYearsList.length', function() { 
                        if ($scope.migrationYearsList.length === 0)
                        {
                            console.log("$scope.migrationYearsList.length is 0");
                            return;
                        }
                    	
                        console.log("Inside watch migrationYearsList.length...");
                    	
                        $scope.MigrationYearOptions = [];
                        $scope.RowMigrationYears = [];
                    	
                        angular.forEach($scope.migrationYearsList, function(yearRec){
                            $scope.RowMigrationYears.push({
                                Id:		yearRec["MigrationYear"],
                                Year:	yearRec["MigrationYear"]
                            });
                        });
                        console.log("$scope.RowMigrationYears is next...");
                        console.dir($scope.RowMigrationYears);
                        $scope.MigrationYearOptions = makeObjects($scope.RowMigrationYears, 'Id', 'Year');
                    	
                        console.log("$scope.MigrationYearOptions is next...");
                        console.dir($scope.MigrationYearOptions);
                    });
                	
                    $scope.$watch('runYearsList.length', function() { 
                        if ($scope.runYearsList.length === 0)
                        {
                            console.log("$scope.runYearsList.length is 0");
                            return;
                        }
                    	
                        console.log("Inside watch runYearsList.length...");
                    	
                        $scope.RunYearOptions = [];
                        $scope.RowRunYears = [];
                    	
                        angular.forEach($scope.runYearsList, function(yearRec){
                            $scope.RowRunYears.push({
                                Id:		yearRec["RunYear"],
                                Year:	yearRec["RunYear"]
                            });
                        });
                        if ($scope.RowRunYears.length > 0)
                        {
                            $scope.RowRunYears.push({
                                Id:		["0"],
                                Year:	[null]
                            });
                        }
                        console.log("$scope.RowRunYears is next...");
                        console.dir($scope.RowRunYears);
                        $scope.RunYearOptions = makeObjects($scope.RowRunYears, 'Id', 'Year');
                    	
                        console.log("$scope.RunYearOptions is next...");
                        console.dir($scope.RunYearOptions);
                    });
                	
                    $scope.$watch('reportYearsList.length', function() { 
                        if ($scope.reportYearsList.length === 0)
                        {
                            console.log("$scope.reportYearsList.length is 0");
                            return;
                        }
                    	
                        console.log("Inside watch reportYearsList.length...");
                        console.log("$scope.reportYearsList is next...");
                        console.dir($scope.reportYearsList);
                    	
                        $scope.ReportYearOptions = [];
                        $scope.RowReportYears = [];
                    	
                        angular.forEach($scope.reportYearsList, function(yearRec){
                            $scope.RowReportYears.push({
                                Id:		yearRec["YearReported"],
                                Year:	yearRec["YearReported"]
                            });
                        });
                        console.log("$scope.RowReportYears is next...");
                        console.dir($scope.RowReportYears);
                        $scope.ReportYearOptions = makeObjects($scope.RowReportYears, 'Id', 'Year');
                    	
                        console.log("$scope.ReportYearOptions is next...");
                        console.dir($scope.ReportYearOptions);
                    });
                	
                    $scope.$watch('sampleYearsList.length', function() { 
                        if ((typeof $scope.sampleYearsList === 'undefined') || ($scope.sampleYearsList === null))
                            return;
                        else if ($scope.sampleYearsList.length === 0)
                        {
                            console.log("$scope.sampleYearsList.length is 0");
                            return;
                        }
                    	
                        console.log("Inside watch sampleYearsList.length...");
                        console.log("$scope.sampleYearsList is next...");
                        console.dir($scope.sampleYearsList);
                    	
                        $scope.SampleYearOptions = [];
                        $scope.RowSampleYears = [];
                    	
                        angular.forEach($scope.sampleYearsList, function(yearRec){
                            $scope.RowSampleYears.push({
                                Id:		yearRec["SampleYear"],
                                Year:	yearRec["SampleYear"]
                            });
                        });
                        console.log("$scope.RowSampleYears is next...");
                        console.dir($scope.RowSampleYears);
                        $scope.SampleYearOptions = makeObjects($scope.RowSampleYears, 'Id', 'Year');
                    	
                        console.log("$scope.SampleYearOptions is next...");
                        console.dir($scope.SampleYearOptions);
                    });
                	
                    $scope.$watch('spawningYearsList.length', function() { 
                        if ($scope.spawningYearsList.length === 0)
                        {
                            console.log("$scope.spawningYearsList.length is 0");
                            return;
                        }
                    	
                        console.log("Inside watch spawningYearsList.length...");
                        console.log("$scope.spawningYearsList is next...");
                        console.dir($scope.spawningYearsList);
                    	
                        $scope.SpawningYearOptions = [];
                        $scope.RowSpawningYears = [];
                    	
                        angular.forEach($scope.spawningYearsList, function(yearRec){
                            $scope.RowSpawningYears.push({
                                Id:		yearRec["SpawningYear"],
                                Year:	yearRec["SpawningYear"]
                            });
                        });
                        console.log("$scope.RowSpawningYears is next...");
                        console.dir($scope.RowSpawningYears);
                        $scope.SpawningYearOptions = makeObjects($scope.RowSpawningYears, 'Id', 'Year');
                    	
                        console.log("$scope.SpawningYearOptions is next...");
                        console.dir($scope.SpawningYearOptions);
                    });
                	
                    $scope.$watch('broodYearsList.length', function() { 
                        if ($scope.broodYearsList.length === 0)
                        {
                            console.log("$scope.broodYearsList.length is 0");
                            return;
                        }
                    	
                        console.log("Inside watch broodYearsList.length...");
                        console.log("$scope.broodYearsList is next...");
                        console.dir($scope.broodYearsList);
                    	
                        $scope.BroodYearOptions = [];
                        $scope.RowBroodYears = [];
                    	
                        angular.forEach($scope.broodYearsList, function(yearRec){
                            $scope.RowBroodYears.push({
                                Id:		yearRec["BroodYear"],
                                Year:	yearRec["BroodYear"]
                            });
                        });
                        console.log("$scope.RowBroodYears is next...");
                        console.dir($scope.RowBroodYears);
                        $scope.BroodYearOptions = makeObjects($scope.RowBroodYears, 'Id', 'Year');
                    	
                        console.log("$scope.BroodYearOptions is next...");
                        console.dir($scope.BroodYearOptions);
                    });
                	
                    $scope.$watch('outmigrationYearsList.length', function() { 
                        if ($scope.outmigrationYearsList.length === 0)
                        {
                            console.log("$scope.outmigrationYearsList.length is 0");
                            return;
                        }
                    	
                        console.log("Inside watch outmigrationYearsList.length...");
                        console.log("$scope.outmigrationYearsList is next...");
                        console.dir($scope.outmigrationYearsList);
                    	
                        $scope.OutmigrationYearOptions = [];
                        $scope.RowOutmigrationYears = [];
                    	
                        angular.forEach($scope.outmigrationYearsList, function(yearRec){
                            $scope.RowOutmigrationYears.push({
                                Id:		yearRec["OutmigrationYear"],
                                Year:	yearRec["OutmigrationYear"]
                            });
                        });
                        console.log("$scope.RowOutmigrationYears is next...");
                        console.dir($scope.RowOutmigrationYears);
                        $scope.OutmigrationYearOptions = makeObjects($scope.RowOutmigrationYears, 'Id', 'Year');
                    	
                        console.log("$scope.OutmigrationYearOptions is next...");
                        console.dir($scope.OutmigrationYearOptions);
                    });
        
                    $scope.removeCriteria = function(idx) {
                        $scope.criteriaList.splice(idx,1);
                        if($scope.AutoExecuteQuery)
                            $scope.executeQuery();
                    };
        
                    $scope.clearValue = function()
                    {
                        $scope.Criteria.Value = null;
                    };
        
                    $scope.addCriteria = function(){
                        $scope.criteriaList.push({
                            //commenting these out because they will be read at EXECUTE time, not saved per query.
                            //qastatus:   $scope.Criteria.ParamQAStatusId,
                            //locations:  $scope.Criteria.LocationIds,
                            //activities: $scope.Criteria.paramActivityDateType, 
                            DbColumnName: 		$scope.Criteria.ParamFieldSelect[0].DbColumnName,
                            Id: 				$scope.Criteria.ParamFieldSelect[0].Id,
                            Value: 				$scope.Criteria.Value,
                        });
        
                        $scope.Criteria.Value = null;
        
                        if($scope.AutoExecuteQuery)
                            $scope.executeQuery();
                    };
        
                    $scope.buildQuery = function(){
                        console.log("Inside DataQueryCtrl.buildQuery...");
                    	
                        console.log("$scope.Criteria.LocationsIds is next...");
                        console.dir($scope.Criteria.LocationsIds);
                        console.log("x " + angular.toJson($scope.Criteria.LocationIds).toString());
                    	
                        // Declare and define the basic query criteria.  We will add onto the criteria, depending upon $scope.DatastoreTablePrefix.
                        var query = null;
                        query = 
                        {
                            criteria: {
                                DatasetId: 	  $scope.dataset.Id,
                                QAStatusId:   $scope.Criteria.ParamQAStatusId,
                                RowQAStatusId: $scope.Criteria.ParamRowQAStatusId,
                                Locations:    angular.toJson($scope.Criteria.LocationIds).toString(),
                                FromDate:     $scope.Criteria.BetweenFromActivityDate,
                                ToDate:       $scope.Criteria.BetweenToActivityDate,
                                DateSearchType: $scope.Criteria.paramActivityDateType, 
                                Fields: 	  $scope.criteriaList,
                                TablePrefix:  $scope.DatastoreTablePrefix,
                            },
                            loading: true,
                        };
                    	
                        //if ($scope.DatastoreTablePrefix === "AdultWeir")
                        if ($scope.DatastoreTablePrefix === "AdultWeir")
                        {
                            if (($scope.Criteria.paramActivityWhereRunYear) && ($scope.Criteria.paramActivityWhereRunYear > 0))
                            {
                                query.criteria.DateSearchType = $scope.Criteria.paramActivityDateType = "singleYear";
                                query.criteria.RunYear = $scope.Criteria.paramActivityWhereRunYear;
                            }
                            else
                                query.criteria.DateSearchType = $scope.Criteria.paramActivityDateType;
                        }
                        else if ($scope.DatastoreTablePrefix === "ScrewTrap")
                        {
                            query.criteria.MigrationYear = $scope.Criteria.paramActivityWhereMigrationYear;
                        }
                        else if ($scope.DatastoreTablePrefix === "Metrics")
                        {
                            query.criteria.ReportYear = $scope.Criteria.paramActivityWhereReportYear;
                        }
                        else if (($scope.DatastoreTablePrefix === "Benthic") ||
                            ($scope.DatastoreTablePrefix === "Drift")
                            )
                        {
                            query.criteria.SampleYear = $scope.Criteria.paramActivityWhereSampleYear;
                        }
                        else if ($scope.DatastoreTablePrefix === "StreamNet_NOSA")
                        {
                            query.criteria.SpawningYear = $scope.Criteria.paramActivityWhereSpawningYear;
                        }
                        else if ($scope.DatastoreTablePrefix === "StreamNet_RperS")
                        {
                            query.criteria.BroodYear = $scope.Criteria.paramActivityWhereBroodYear;
                        }
                        else if ($scope.DatastoreTablePrefix === "StreamNet_SAR")
                        {
                            query.criteria.OutmigrationYear = $scope.Criteria.paramActivityWhereOutmigrationYear;
                        }
                    	
                        console.log("query in buildQuery is next...");
                        console.dir(query);
        
                        if(query.criteria.RowQAStatusId)
                            query.criteria.RowQAStatusId = angular.toJson(query.criteria.RowQAStatusId).toString();
        
                        console.log("query criteria before sending...");
                        console.dir(query.criteria);
                        return query;
                    };
        
                    $scope.executeQuery = function(){
                            console.log("Inside DataQueryCtrl.executeQuery...");
                        	
                        $scope.query = $scope.buildQuery();
        
                        DatasetService.queryActivities($scope.query);
                        //service will run query and then update:
                            //query.results
                            //query.errors
                    };
        
                    $scope.$watch('query.loading', function(){
                        if(!$scope.dataset.Id)
                            return;
                    	
                        console.log("Inside DataQueryCtrl.query.loading watch -- gathering graph data");
                        // Only for debug; causes front end to run out of memory.
                        console.log("query.results is next...");
                        console.dir($scope.query.results);
                    	
                        $scope.dataSheetDataset = null; // Reset this, just so that it does not take up a bunch of memory.
                        $scope.dataSheetDataset = $scope.query.results;
                        //console.log("$scope.dataSheetDataset is next...");
                        //console.dir($scope.dataSheetDataset);
                        $scope.query.results = null; // Dump this too, because we have the results in $scope.dataSheetDataset.
                    	
                        // Only for debug; causes front end to run out of memory.
                        //console.log("$scope.dataSheetDataset is next...");
                        //console.dir($scope.dataSheetDataset);
                        //if ((typeof $scope.query.results !== 'undefined') && ($scope.query.results !== null))
                        if ((typeof $scope.dataSheetDataset !== 'undefined') && ($scope.dataSheetDataset !== null))
                        {
                            console.log("$scope.dataSheetDataset !== 'undefined' and $scope.dataSheetDataset !== null");
                        	
                            if ($scope.DatastoreTablePrefix === "CreelSurvey")
                            {
                                for (var i = 0; i < $scope.dataSheetDataset.length; i++)
                                {
                                    //console.log("Extracting times from strings...");
                                    var strTimeStart = $scope.dataSheetDataset[i].TimeStart;
                                    var strTimeEnd = $scope.dataSheetDataset[i].TimeEnd;
                                    var intTLoc = -1;
                                    if ((typeof strTimeStart !== 'undefined') && (strTimeStart !== null))
                                    {
                                        intTLoc = strTimeStart.indexOf("T");
                                        // Start just past the "T" in the string, and get the time portion (the next 5 characters).
                                        strTimeStart = strTimeStart.substr(intTLoc + 1, 5);
                                        $scope.dataSheetDataset[i].TimeStart = strTimeStart;
                                    	
                                        if ((typeof strTimeEnd !== 'undefined') && (strTimeEnd !== null))
                                        {
                                            strTimeEnd = strTimeEnd.substr(intTLoc + 1, 5);
                                            $scope.dataSheetDataset[i].TimeEnd = strTimeEnd;
                                        }							
                                    }
                                	
                                    var strInterviewTime = $scope.dataSheetDataset[i].InterviewTime;
                                    if ((typeof strInterviewTime !== 'undefined') && (strInterviewTime !== null))
                                    {
                                        //console.log("strInterviewTime = " + strInterviewTime);
                                        intTLoc = strInterviewTime.indexOf("T");
                                        //console.log("intLoc = " + intTLoc);
                                        strInterviewTime = strInterviewTime.substr(intTLoc + 1, 5);
                                        //console.log("strInterviewTime = " + strInterviewTime);
                                        $scope.dataSheetDataset[i].InterviewTime = strInterviewTime
                                    }
                                }
                            }
                            else if ($scope.DatastoreTablePrefix === "CrppContracts")
                            {
                                for (var i = 0; i < $scope.dataSheetDataset.length; i++)
                                {
                                    var pLeadList = $scope.dataSheetDataset[i].ProjectLead.split(";");
                                    console.log("pLeadList is next...");
                                    console.dir(pLeadList);
                                	
                                    // Next, get rid of that trailing semicolon.
                                    pLeadList.splice(-1, 1);
                                    console.log("pLeadList is next...");
                                    console.dir(pLeadList);
                                	
                                    var strProjectLead = "";
                                	
                                    // Locate the ProjectLead Id and get the Fullname
                                    angular.forEach($scope.projectLeadList, function(staffMember){
                                    	
                                        angular.forEach(pLeadList, function(pLead){
                                            //console.log("pLead = " + pLead + ", staffMember = " + staffMember.Id);
                                            if (parseInt(pLead) === parseInt(staffMember.Id))
                                            {
                                                //console.log("Matched...");
                                                strProjectLead += staffMember.Fullname + ";\n";
                                                //$scope.showProjectLeads = true;
                                            }
                                        });
                                    });
                                    $scope.dataSheetDataset[i].ProjectLead = strProjectLead;
                                }
                            }
                            else if ($scope.DatastoreTablePrefix === "AdultWeir") {
                                var strTime = "";
                                var intTimeLoc = -1;
                                angular.forEach($scope.dataSheetDataset, function (item) {
                                    //console.log("item is next...");
                                    //console.dir(item);
                                    if ((typeof item.PassageTime !== 'undefined') && (item.PassageTime !== null)) {
                                        intTimeLoc = item.PassageTime.indexOf("T");
                                        strTime = item.PassageTime.substr(intTimeLoc + 1, 5);
                                        item.PassageTime = strTime;
                                    }
                                    //else
                                    //    console.log("item.PassageTime is null or blank...");
                                });
                            }
                            console.log("$scope in watch query.loading is next...");
                            console.dir($scope);
                            //ChartService.buildChart($scope, $scope.dataSheetDataset, $scope.dataset.Datastore.TablePrefix, {height: 360, width: 800});
                            ChartService.buildChart($scope, $scope.dataSheetDataset, $scope.dataset.Datastore.TablePrefix, {height: 360, width: 800});
                        }
                        //$scope.chartData = getAdultWeirChartData($scope.query.results);
                    	
                    });
        
                    $scope.openActivity = function()
                    {
                        console.log("Inside $scope.openActivity...");
                        //console.log("$scope is next...");
                        //console.dir($scope);
                        $location.path("/dataview/"+$scope.onRow.entity.ActivityId);
                    };
        
        
                    $scope.openExportView = function() {
                        var modalInstance = $modal.open({
                            templateUrl: 'app/core/common/components/modals/templates/modal-exportfile.html',
                            controller: 'ModalExportController',
                            scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
                            //resolve: { files: function() { return $scope.files; } }
                        });
                    }
                	
                    $scope.addHeaders = function(){
                        console.log("Inside dataset-query.js, addHeaders...");
                        angular.forEach($scope.dataset.Fields.sort(orderByIndex), function (field) {
        
                            if (field.ControlType === "file")
                                return;
        
                            //console.log("field.DbColumnName = " + field.DbColumnName);
                            //console.log("field.FieldRoleId = " + field.FieldRoleId);
                            if(field.FieldRoleId === FIELD_ROLE_HEADER)
                            {
                                //console.log("Found a header...field.DbColumnName = " + field.DbColumnName);
                                parseField(field, $scope);
                                $scope.headerFields.push(field);
                            	
                                //create a javascript list from our possible values (if any)
                                if(field.Field.PossibleValues)
                                {
                                	
                                    field.PossibleValuesList = makeObjectsFromValues(field.DbColumnName, field.Field.PossibleValues); //set this into our object
            	
                                    //fieldIndex ++;
                                    $scope.fieldIndex++
                                }
        
                                $scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
        
                                $scope.dataFields.push(field);
                                //console.log("Just added " + field.DbColumnName + " to dataFields");
                            }
                        });
                    }
                	
                    $scope.addDetails = function(){
                        console.log("Inside dataset-query.js, addDetails...");
                        angular.forEach($scope.dataset.Fields.sort(orderByIndex), function (field) {
                            	
                            if(field.FieldRoleId == FIELD_ROLE_DETAIL)
                            {
                                parseField(field, $scope);
                                //console.log("The field = " + field.DbColumnName);
                                $scope.detailFields.push(field);
                            	
                                //create a javascript list from our possible values (if any)
                                if(field.Field.PossibleValues)
                                {
                                    field.PossibleValuesList = makeObjectsFromValues(field.DbColumnName, field.Field.PossibleValues); //set this into our object
            	
                                    //fieldIndex ++;
                                    $scope.fieldIndex++;
                                }
        
                                $scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
        
                                $scope.dataFields.push(field);
                            }
                        });	
                    }
                }*/
    }];