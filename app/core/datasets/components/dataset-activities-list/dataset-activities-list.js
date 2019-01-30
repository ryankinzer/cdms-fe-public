﻿
var dataset_activities_list = ['$scope', '$routeParams',
    'DatasetService', 'SubprojectService', 'ProjectService', 'CommonService', 'UserService','GridService',
    '$uibModal', '$location', '$window', '$rootScope', '$timeout',
    function ($scope, $routeParams,
        DatasetService, SubprojectService, ProjectService, CommonService, UserService, GridService,
        $modal, $location, $window, $rootScope, $timeout) {

        $scope.dataset = DatasetService.getDataset($routeParams.Id);

        //this is the default columns (fields) to show in the activities grid, 
        //  but it will be overridden if there is one configured in the dataset.
        var DefaultActivityListFields = [
            "ActivityDate",
            "LocationId",
            "QAStatusId",
            "UserId",
        ];

        $scope.InstrumentCache = {};

        $scope.dataset.$promise.then(function () {

            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
            $scope.project.$promise.then(function () {
                //if user can edit this project, unhide the edit links
                if ($rootScope.Profile.canEdit($scope.project)) {
                    $scope.agGridOptions.columnApi.setColumnVisible("EditLink", true);
                    $scope.agGridOptions.api.refreshHeader();
                }

                $scope.activities = DatasetService.getActivitiesForView($routeParams.Id);
                $scope.activities.$promise.then(function () {
                    //now that the activities are loaded, tell the grid so that it can refresh.
                    $scope.agGridOptions.api.setRowData($scope.activities);
                    GridService.autosizeColumns($scope.agGridOptions);
                });

            });


            $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');
            
            //once the dataset loads, determine our columns

            var gridColumnNames = DefaultActivityListFields;

            if ($scope.dataset.Config.SpecifyActivityListFields)
                gridColumnNames = $scope.dataset.Config.ActivityListFields;

            var gridColDefs = [
                { field: 'ViewLink', headerName: '', cellRenderer: viewTemplate, width: 50, alwaysShowField: true, menuTabs: [] },
                { field: 'EditLink', headerName: '', cellRenderer: editTemplate, width: 50, alwaysShowField: true, menuTabs: [], hide: true },
            ];

            $scope.dataset.Fields.sort(orderByOrderIndex).forEach(function (field,index) { 
                if (field.FieldRoleId == FIELD_ROLE_HEADER && gridColumnNames.contains(field.DbColumnName)) { //is a header and should be in our grid

                    field.Label = (field.Field.Units) ? field.Label + " (" + field.Field.Units + ")" : field.Label;

                    //initial values for header column definition
                    var newColDef = {
                        headerName: field.Label,
                        field: field.DbColumnName,
                        width: SystemDefaultColumnWidth,
                        Label: field.Label,                 
                        DbColumnName: field.DbColumnName,   
                        ControlType: field.ControlType,     
                        PossibleValues: field.Field.PossibleValues, 
                        //cellRenderer: $scope.CellRenderers[field.ControlType],
                        valueGetter: $scope.ValueGetters[field.ControlType],
                        valueFormatter: $scope.ValueFormatters[field.ControlType],
                        filter: getAgGridFilterByType(field.ControlType),
                        menuTabs: ['filterMenuTab'],
                    };

                    gridColDefs.push(newColDef); 
                }
            });

            //set the first column to be the sort column:
            gridColDefs[2].sort = "desc";

            //add the user fullname to the end. this will appear for all datasets.
            gridColDefs.push({
                headerName: "By User",
                field: "UserFullname", //column from the activities list
                menuTabs: ['filterMenuTab'],
                filter: true,
            });

            //tell the grid we've changed the coldefs
            $scope.agGridOptions.api.setColumnDefs(gridColDefs); 

            console.log(" -- ok grid loaded and the coldefs are: ");
            console.dir(gridColDefs);
            
        });


        $scope.ValueGetters = {
            'activity-date': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]).format('YYYY-MM-DD HH:mm');
            },

            'time': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]).format('HH:mm');
            },

            'datetime': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]).format('YYYY-MM-DD HH:mm');
            },

            'text': function (params) {
                //if (params.node.data.headerdata.YearReported === undefined)
                //    return;
                //else
                return params.node.data[params.colDef.DbColumnName] ;
            },

            'location-select': function (params) {
                return params.node.data.LocationLabel
                    + ((params.node.data.OtherAgencyId) ? (' (' + params.node.data.OtherAgencyId + ')' ) : ''); //ternery: if otheragencyid then show it
                //return params.node.data[params.colDef.DbColumnName];
            },

            'qa-status-select': function (params) {
                //return $scope.QAStatusList[params.node.data.ActivityQAStatus.QAStatusId];
                //console.dir($scope.QAStatusList);
                //console.dir(params);
                return $scope.QAStatusList[params.node.data[params.colDef.DbColumnName]];
            },

            'instrument-select': function (params) {
                
                if ($scope.project.Instruments && !$scope.InstrumentCache.hasOwnProperty(params.node.data[params.colDef.DbColumnName])) {
                    var instrument = getByField($scope.project.Instruments, params.node.data[params.colDef.DbColumnName], "Id");
                    if(instrument)
                        $scope.InstrumentCache[params.node.data[params.colDef.DbColumnName]] = instrument.Name + " (SN:" + instrument.SerialNumber + ")";
                }
                return $scope.InstrumentCache[params.node.data[params.colDef.DbColumnName]];
            },
              
            'multiselect': function (params) { 
                var the_str = valueFormatterArrayToList(params.node.data[params.colDef.DbColumnName]);
                if (typeof the_str === 'string') //backwards compatible - remove the quotes
                    the_str = the_str.replace(/"/g, '');

                return the_str;
            }
            
        };


        $scope.ValueFormatters = {

            'activity-date': function (params) {
                //console.dir(params);
                return moment(params.value).format('L');
            },
/*
            'time': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]);
            },

            'datetime': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]);
            },

            'text': function (params) {
                return params.node.data[params.colDef.DbColumnName];
            },

            'location-select': function (params) {
                return params.node.data[params.colDef.DbColumnName];
            },

            'qa-status-select': function (params) {
                return params.node.data[params.colDef.DbColumnName];
            },

            'instrument-select': function (params) {
                
                if ($scope.project.Instruments && !$scope.InstrumentCache.hasOwnProperty(params.colDef.DbColumnName)) {
                    var instrument = getByField($scope.project.Instruments, params.node.data[params.colDef.DbColumnName], "Id");
                    $scope.InstrumentCache[params.colDef.DbColumnName] = instrument.Name + "(SN:" + instrument.SerialNumber + ")";
                }
                return $scope.InstrumentCache[params.colDef.DbColumnName];
            },*/

        };



        var viewTemplate = function (params) {

            //push our activityids into rootscope so that we can NEXT/PREV
            $rootScope.activities = [];

            $scope.agGridOptions.api.forEachNodeAfterFilterAndSort(function (node) { 
                $rootScope.activities.push({ Id: node.data.ActivityId });
            });
            
            return '<div><a href="#!/dataview/' + params.node.data.ActivityId + '">View</a></div>';
        };

        var editTemplate = function (params) {
            return '<div project-role="editor"><a href="#!/edit/' + params.node.data.ActivityId + '">Edit</a></div>';
        };


        $scope.agGridOptions = {
            animateRows: true,
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            showToolPanel: false,
            columnDefs: [],
            rowData: [],
            rowSelection: 'multiple',
            onSelectionChanged: function (params) {
                $scope.agGridOptions.selectedItems = $scope.agGridOptions.api.getSelectedRows();
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            onFilterModified: function () {
                $scope.agGridOptions.api.deselectAll();
            },
            selectedItems: [],
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        };

        //setup the grid
        var ag_grid_div = document.querySelector('#activity-list-grid');    //get the container id...
        $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.agGridOptions); //bind the grid to it.
        $scope.agGridOptions.api.showLoadingOverlay(); //show loading...

       $scope.openQueryWindow = function (p) {
            $location.path("/datasetquery/" + $scope.dataset.Id);
        };

        $scope.openDetailsWindow = function (p) {
            $location.path("/dataset-details/" + $scope.dataset.Id);
        };

        $scope.openImportWindow = function () {
            $scope.activities = null; // Dump the activities to free up memory.
            $location.path("/datasetimport/" + $scope.dataset.Id);
        };

        $scope.deleteActivities = function () {

            $scope.saveResults = {};


            if (!confirm("Are you sure you want to delete " + $scope.agGridOptions.selectedItems.length + " activities (and all associated files)?  There is no undo for this operation."))
                return;

            //ok, well lets give them a list of all files that will be deleted along with this activity... just to make sure!
            var num_activities = $scope.agGridOptions.selectedItems.length;
            var activities_deleted = [];
            var check_for_files = true;

            //if deleting more than 100 records, ask if they want to disable file checking
            if (num_activities > 100) {
                if (!confirm("You are deleting more than a hundred records. File checking will be disabled. Are you sure?"))
                    return;
                else
                    check_for_files = false;
            }

            if (check_for_files) {

                angular.forEach($scope.agGridOptions.selectedItems, function (activity) {
                    //console.dir(activity);
                    console.log("deleting activity : " + activity.ActivityId);

                    DatasetService.getActivityData(activity.ActivityId).$promise.then(function (in_activity) {
                        //console.dir(in_activity);
                        var files_to_delete = getFilenamesForTheseActivities($scope.dataset, Array(in_activity));

                        //console.log("ok! files we got back: " + files_to_delete);
                        //if there are no files to delete, just go ahead, otherwise confirm
                        if (files_to_delete != null)
                            if (!confirm("Last chance! - Deleting this activity will also permanently delete the following files: " + files_to_delete))
                                return;


                        var deleted = DatasetService.deleteActivities($rootScope.Profile.Id, $scope.dataset.Id, Array("" + activity.ActivityId));

                        deleted.$promise.then(function () {
                            //great! so remove those from the grid; no sense reloading
                            //console.log("Ok - let's add to the activities array: " + activity.ActivityId);

                            activities_deleted.push(activity.ActivityId);

                            if (activities_deleted.length == num_activities) {
                                //console.log("OK all done - now remove them all...");
                                //console.dir(activities_deleted);
                                $scope.allActivities = []; //this will be our activities to keep (skipping the ones to delete) 

                                //spin through allActivities and remove the selected activities from our activities
                                // remember: we can't splice items out of arrays we are foreaching or else unexpected results occur.
                                $scope.activities.forEach(function (activity, index) {

                                    //console.log(" -- checking == " + activity.Id + " is in deleted list? ");

                                    if (!activities_deleted.containsInt(activity.Id)) {
                                        //console.log("nope, not in there, add it to the ones we'll keep.");
                                        $scope.allActivities.push(activity);
                                    } else {
                                        //console.log("Yep! skipping! "+activity.Id);
                                    }
                                });
                                //console.log("these are the ones we keep.");
                                //console.dir($scope.allActivities);
                                //all done, so now refresh the view.
                                //console.log("done! refreshing view");
                                $scope.agGridOptions.api.deselectAll();  //clear selection
                                //console.log("after selection");
                                $scope.activities = $scope.allActivities; //update our activities with the new set of activities
                                //console.log("ready for grid update");
                                $scope.agGridOptions.api.setRowData($scope.activities); //update the grid.
                                //console.log("all done.");
                                //deleteWatcher();
                            }
                        });
                    });
                });
            } else {
                //delete without checking for files is much faster. :)
                var activities_to_delete = [];
                $scope.agGridOptions.selectedItems.forEach(function (activity) { 
                    activities_to_delete.push("" + activity.ActivityId);
                });

                var deleted = DatasetService.deleteActivities($rootScope.Profile.Id, $scope.dataset.Id, activities_to_delete);
        
                deleted.$promise.then(function () { 
                    $scope.allActivities = []; //this will be our activities to keep (skipping the ones to delete) 
                    $scope.activities.forEach(function (activity, index) {
                        if (!activities_to_delete.containsInt(activity.Id)) {
                            //console.log("nope, not in there, add it to the ones we'll keep.");
                            $scope.allActivities.push(activity);
                        } else {
                            //console.log("Yep! skipping! "+activity.Id);
                        }
                    });
                    $scope.agGridOptions.api.deselectAll();  //clear selection
                    $scope.activities = $scope.allActivities; //update our activities with the new set of activities
                    $scope.agGridOptions.api.setRowData($scope.activities); //update the grid.
                });

            }

        };

        $scope.openDataEntry = function (p) { 
            delete $rootScope.imported_rows;
            $location.path("/dataentryform/" + $scope.dataset.Id); 
        };

        //handle favorite toggle
        $scope.isFavorite = $rootScope.Profile.isDatasetFavorite($routeParams.Id);
        $scope.toggleFavorite = function () { 
            UserService.toggleFavoriteDataset($scope, $rootScope); 
        }

        $scope.ShowMap = {
            Display: false,
            Message: "Show Map",
            MessageToOpen: "Show Map",
            MessageToClose: "Hide Map",
        };

        $scope.toggleMap = function () {
            if ($scope.ShowMap.Display) {
//                $scope.removeFilter(); //also clears location
                $scope.ShowMap.Display = false;
                $scope.ShowMap.Message = $scope.ShowMap.MessageToOpen;
            }
            else {
                $scope.ShowMap.Display = true;
                $scope.ShowMap.Message = $scope.ShowMap.MessageToClose;

                //setTimeout(function () {
  //                  $scope.map.reposition();
                  //  console.log("repositioned");
                //}, 400);

            }
        };



        //$scope.columnDefs = []; // the one we'll bind to the grid; starts out empty...

        //the way we want this to be:

        //create list of candidate columndefs (possibleColumnDefs below).
        // have a list of default ShowFields - the fields we will show if the dataset doesn't have a different set configured.
        // but if there is a config, spin through the list and add all the dataset config's SHOWFIELDS and display those.

/*
        $scope.possibleColumnDefs = [  //in order the columns will display, by the way...
            { field: 'EditLinks', headerName: '', cellRenderer: editButtonTemplate, width: 40, alwaysShowField: true, menuTabs: [], hide: true },
            { field: 'ActivityDate', 
				headerName: 'Activity Date',
				valueGetter: function (params) { return moment(params.node.data.ActivityDate) }, //date filter needs js date object				
                filter: 'date', 
                filterParams: { apply: true },
				cellRenderer: activityDateTemplate, 
				width: 180, 
				menuTabs: ['filterMenuTab']
			},
            { field: 'headerdata.YearReported', headerName: 'Year Reported', cellRenderer: yearReportedTemplate, width: 120, menuTabs: [] },
            { field: 'headerdata.RunYear', headerName: 'Run Year', cellRenderer: runYearTemplate, width: 120, menuTabs: [] },

            { field: 'headerdata.TimeStart',
				headerName: 'DateTime Start',	
				valueGetter: function (params) { return params.node.data.headerdata.TimeStart }, //date filter needs js date object
                filter: 'text', 
                filterParams: { apply: true },
				cellRenderer: TimeStartTemplate, 
				width: 130, 
				menuTabs: ['filterMenuTab']
			},
            { field: 'headerdata.Allotment', headerName: 'Allotment', cellRenderer: allotmentTemplate, minWidth: 100, menuTabs: ['filterMenuTab'] }, //appraisal
            { field: 'headerdata.AllotmentStatus', headerName: 'Status', minWidth: 120, menuTabs: ['filterMenuTab'] },
            { field: 'Description', headerName: 'Date Range', cellRenderer: desclinkTemplate, minWidth: 200, width: 250, menuTabs: ['filterMenuTab'], filter:'text' },
            { field: 'Location.Label', headerName: 'Location', cellRenderer: locationLabelTemplate, minWidth: 360, menuTabs: ['filterMenuTab'] },
            { field: 'Location.WaterBody.Name', headerName: 'Waterbody', menuTabs: ['filterMenuTab'] },
            { field: 'headerdata.FieldActivityType', headerName: 'Field Activity Type', minWidth: 120, menuTabs: ['filterMenuTab'] },
            { field: 'headerdata.DataType', headerName: 'Data Type', minWidth: 120, menuTabs: ['filterMenuTab'] },

            //all datasets get these
            { field: 'User.Fullname', headerName: 'By User', minWidth: 120, alwaysShowField: true, menuTabs: ['filterMenuTab'] },  //note: alwaysShowField is true.
            {
                field: 'QAStatus', headerName: 'QA Status', cellRenderer: QATemplate, minWidth: 100,
                alwaysShowField: true,
                menuTabs: ['filterMenuTab'],
                valueGetter: function (params) { return $scope.QAStatusList[params.node.data.ActivityQAStatus.QAStatusId]; }
            }

        ];
*/
            /*{ == i think this is the original timestart that probably wasn't working right.
                field: 'headerdata.TimeStart',
                headerName: 'Time Start',
                width: 80,
                valueFormatter: function (params) {
                    if (params.node.data.headerdata.TimeStart && params.node.data.headerdata.TimeStart !== undefined )
                        return moment(params.node.data.headerdata.TimeStart).format('HH:mm');
                }, 
                filter: 'text', //'time' does not exist yet
                menuTabs: ['filterMenuTab'],
            },*/


        //$scope.selectedLocation = null;
        //$scope.newPoint = null;
        //$scope.newGraphic = null;

/*
        $scope.activities.$promise.then( function () {

            console.log("Inside activities-controller.js, $scope.activities.$promise, loading header data...");

            $scope.loading = true;
			
			console.log("Time check1 = " + moment(Date.now()).format('HH:mm:ss'));
			
			// Try this to increase speed.
			// First build a list of our ActivityIds that matches the Activities.
			$scope.activities.forEach(function(activity){
				$scope.activityIdList.push(activity.Id);
			});
			
			console.log("Time check2 = " + moment(Date.now()).format('HH:mm:ss'));

            $scope.headerdata.$promise.then(function () {
                //angular.forEach($scope.activities, function (activity, key) {
                //    activity.headerdata = getByField($scope.headerdata, activity.Id, "ActivityId");
                //});
				
				angular.forEach($scope.headerdata, function (header){
					var theActivityId = $scope.activityIdList.indexOf(header.ActivityId);
					//console.log("Found activity " + theActivityId);
					$scope.activities[theActivityId].headerdata = header;
					//console.dir($scope.activities[theActivityId]);
				});

                //now that the activities are loaded, tell the grid so that it can refresh.
                $scope.agGridOptions.api.setRowData($scope.activities);

                console.log("autosizing columns");
                var allColumnIds = [];
                $scope.agGridOptions.columnApi.getAllColumns().forEach(function (column) {
                    allColumnIds.push(column.colId);
                });
                //$scope.agGridOptions.columnApi.autoSizeColumns(allColumnIds);
                
            });
			console.log("Time check3 = " + moment(Date.now()).format('HH:mm:ss'));
            console.log("$scope at end of $scope.activities.$promise is next...");
            console.dir($scope);

            $scope.allActivities = $scope.activities; //set allActivities so we can reset our filters
            $scope.loading = false;
            
        });
*/


/*
        $scope.$watch('dataset.Fields', function () {
            if (!$scope.dataset.Fields) return;

            //run config on the dataset.
            //DatasetService.configureDataset($scope.dataset);

            console.log("Inside dataset.Fields watcher...");
            //console.log("$scope is next...");
            //console.dir($scope);

            $rootScope.datasetId = $scope.dataset.Id;
            //load our project based on the projectid we get back from the dataset
            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
            $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');

            $scope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            //console.log("$scope.columnDefs is next...");
            //console.dir($scope.columnDefs);



            //if the dataset has a config and the ActivityPage.ShowFields is set, use it
            if ($scope.dataset.Config != undefined
                && $scope.dataset.Config.ActivitiesPage != undefined
                && $scope.dataset.Config.ActivitiesPage.ShowFields != undefined) {
                console.log("Hey config has a showfields configured!");
                ShowFields = $scope.dataset.Config.ActivitiesPage.ShowFields; //set
            } else
                console.log("aww no showfields in config... we'll just use the ShowFields defaults...");

            var showColDefs = [];

            angular.forEach($scope.possibleColumnDefs, function (coldef) {
                //console.log("coldef is next...");
                //console.dir(coldef);
                if (coldef.alwaysShowField || ShowFields.contains(coldef.field)) {
                    showColDefs.push(coldef);
                }
            });

            //set the first column to be the sort column:
            showColDefs[1].sort = "desc";

            $scope.columnDefs = showColDefs; 
            $scope.agGridOptions.api.setColumnDefs(showColDefs); //tell the grid we've changed the coldefs
			
			console.log("Time after grid loaded = " + moment(Date.now()).format('HH:mm:ss'));

            //some specific dataset things... TODO: i'll bet we can move this out to config, too...
            if ($scope.DatastoreTablePrefix === "WaterTemp") {
                $scope.reloadDatasetLocations("WaterTemp", LOCATION_TYPE_WaterTemp);
            } else if ($scope.DatastoreTablePrefix === "Metrics") {
                $scope.showDataEntrySheetButton = false;
                $scope.reloadDatasetLocations("Metrics", LOCATION_TYPE_Hab);
            }

            // Using dataset.config, instead of hard-coding...
            if (($scope.dataset.Config) && 
                ($scope.dataset.Config.ActivitiesPage) &&
                ($scope.dataset.Config.ActivitiesPage.HasDatasetLocations))
            {
                console.log("The dataset has dataset locations..");
                // If $scope.dataset.Config.ActivitiesPage.AllowMultipleLocations exists, it will be set to No.
                if ($scope.dataset.Config.ActivitiesPage.AllowMultipleLocations) {
                    console.log("This datset DOES NOT allow multiple locations...");
                    $scope.reloadDatasetLocations($scope.DatastoreTablePrefix, LOCATION_TYPE_FishScales)
                }
            }

            
        });
*/



/*
        $scope.$watch('project.Name', function () {
            if ($scope.project && $scope.project.$resolved) {
                console.log("Inside watch project.Name...");

                console.log("$scope.project.Id = " + $scope.project.Id);
                console.log("$scope.subprojectType = " + $scope.subprojectType);
                SubprojectService.setServiceSubprojectType($scope.subprojectType);

                //if user can edit, unhide the edit links
                if ($rootScope.Profile.canEdit($scope.project)) {
                    $scope.agGridOptions.columnApi.setColumnVisible("EditLinks", true);
                    $scope.agGridOptions.api.refreshHeader();
                }

                // -- this may no longer be necessary? -- 
                //if ($scope.subprojectType === "Habitat")
                if ($scope.DatastoreTablePrefix === "Metrics") {
                    console.log("x")
                    $scope.subprojectList = SubprojectService.getProjectSubprojects($scope.project.Id);
                    var watcher = $scope.$watch('subprojectList.length', function () {
                        // We wait until subprojects gets loaded and then turn this watch off.
                        if ($scope.subprojectList === null) {
                            console.log("$scope.subprojectList is null");
                            return;
                        }
                        else if (typeof $scope.subprojectList.length === 'undefined') {
                            console.log("$scope.subprojectList.length is undefined.");
                            return;
                        }
                        else if ($scope.subprojectList.length === 0) {
                            console.log("$scope.subprojectList.length is 0");
                            return;
                        }

                        console.log("$scope.subprojectList.length = " + $scope.subprojectList.length);
                        console.log("subprojects is loaded...");
                        console.dir($scope.subprojectList);

                        $scope.reloadProjectLocations();

                        if ($scope.map && $scope.map.locationLayer && $scope.map.locationLayer.hasOwnProperty('showLocationsById')) {
                            //$scope.map.locationLayer.showLocationsById($scope.thisProjectsLocationObjects); //bump and reload the locations.
                            // Note:  If we sent an empty list, it pulls all the locations.
                            // If we supply an Id that we know does not exist (0), we get no locations, which is what we expect.
                            $scope.map.locationLayer.showLocationsById(0); //bump and reload the locations.
                        }

                        watcher();
                    });
                }
                else {
                    $scope.reloadProjectLocations();

                    // Using dataset.config, instead of hard-coding...
                    if (($scope.dataset.Config) &&
                        ($scope.dataset.Config.ActivitiesPage) &&
                        ($scope.dataset.Config.ActivitiesPage.HasDatasetLocations)) {
                        console.log("The dataset has dataset locations..");
                        // If $scope.dataset.Config.ActivitiesPage.AllowMultipleLocations exists, it will be set to No.
                        if ($scope.dataset.Config.ActivitiesPage.AllowMultipleLocations) {
                            console.log("This datset DOES NOT allow multiple locations...");
                            $scope.reloadDatasetLocations($scope.DatastoreTablePrefix, LOCATION_TYPE_FishScales)
                        }
                    }
                }
                
            }
        });
*/

/*
        $scope.reloadDatasetLocations = function (datasetName, locationType) {
            console.log("Inside activities-controllers.js, scope.reloadDatasetLocations...");
            console.log("datasetName = " + datasetName);
            console.log("locationType = " + locationType);

            //console.log("$scope is next...");
            //console.dir($scope);
            //console.log("$scope.project.Locations is next...");
            //console.dir($scope.project.Locations);

            $scope.thisDatasetLocationObjects = []; // Dump this list, before refilling it.

            if (datasetName === "WaterTemp") {
                console.log("We have a WaterTemp dataset...");

                angular.forEach($scope.project.Locations, function (location, key) {
                    if (location.LocationType.Id === LOCATION_TYPE_WaterTemp)
                        $scope.thisDatasetLocationObjects.push(location.SdeObjectId);
                });
            }
            else if (datasetName === "Metrics") {
                console.log("We have a Metrics dataset...");
                console.log("$scope.subprojectList is next...");
                console.dir($scope.subprojectList);

                angular.forEach($scope.subprojectList, function (subproject) {

                    angular.forEach($scope.project.Locations, function (location, key) {
                        //console.log("location key = " + key);
                        //console.log("location is next...");
                        //console.dir(location);

                        // We will show the locations of the subprojects.
                        //console.log("location.LocationTypeId = " +  location.LocationTypeId + ", subproject.LocationId = " + subproject.LocationId + ", location.Id = " + location.Id);
                        if ((locationType === LOCATION_TYPE_Hab) && (subproject.LocationId === location.Id)) {
                            console.log("Found a subproject location")
                            console.dir(location);
                            $scope.thisDatasetLocationObjects.push(location.SdeObjectId);
                            subproject.GPSEasting = location.GPSEasting;
                            subproject.GPSNorthing = location.GPSNorthing;
                            subproject.UTMZone = location.UTMZone;
                            subproject.Projection = location.Projection;
                            subproject.WaterBodyId = location.WaterBodyId;
                        }
                    });
                });
            }
            else if (datasetName === "FishScales")
            {
                console.log("Working with FishScales...");
                //angular.forEach($scope.project.Locations, function (loc) {
                //    console.log("loc Id = " + loc.Id);
                //});

                // Need to run this here, because the project has not loaded yet, by the time the 
                // dataset.Fields watch completes...
                //console.dir($scope.project.Locations);
                //angular.forEach($scope.project.Locations, function (location, key) {
                //    console.log("location.LocationType.Id = " + location.LocationType.Id + ", LOCATION_TYPE_FishScales = " + LOCATION_TYPE_FishScales);
                //    if (location.LocationType.Id === LOCATION_TYPE_FishScales)
                //        $scope.thisDatasetLocationObjects.push(location.SdeObjectId);
                //});

                $scope.thisDatasetLocationObjects = buildDatasetLocationObjectsList($scope.project.Locations, LOCATION_TYPE_FishScales);
            }

            $scope.map.locationLayer.showLocationsById($scope.thisDatasetLocationObjects); //bump and reload the locations.
            //console.log("$scope (at end of reloadDatasetLocations) is next...");
            //console.dir($scope);
        };
*/

/*
        $scope.ShowMap = {
            Display: false,
            Message: "Show Map",
            MessageToOpen: "Show Map",
            MessageToClose: "Hide Map",
        };
*/
/*
        $scope.addLocation = function () {
            console.log("Inside addLocation...");
            console.log("$scope.thisDatasetLocationObjects is next...");
            console.dir($scope.thisDatasetLocationObjects);

            if (($scope.dataset.Config) &&
                ($scope.dataset.Config.ActivitiesPage) &&
                ($scope.dataset.Config.ActivitiesPage.AllowMultipleLocations) &&
                ($scope.thisDatasetLocationObjects.length > 0)
            )
            {
                alert("This is a FishScales dataset and it can have only one location, which is already has...");
            }
            else
            {
                templateUrl = 'app/core/common/components/modals/templates/modal-addlocation.html';

                if (typeof TRIBALCDMS_TEMPLATES !== 'undefined') {
                    templateUrl = 'app/core/common/components/modals/' + TRIBALCDMS_TEMPLATES + '/modal-addlocation.html';
                }

                var modalInstance = $modal.open({
                    templateUrl: templateUrl,
                    controller: 'ModalAddLocationCtrl',
                    scope: $scope, //very important to pass the scope along...
                    });
            }

        };

*/
/*
        $scope.removeFilter = function () {
            $scope.activities = $scope.allActivities;
            $scope.agGridOptions.api.setRowData($scope.activities);
            $scope.clearLocation();
        }

        $scope.clearLocation = function () {
            $scope.agGridOptions.api.deselectAll();
            $scope.map.infoWindow.hide();
            $scope.selectedLocation = null;

            if ($scope.newGraphic) {
                $scope.map.graphics.remove($scope.newGraphic);
                $scope.newGraphic = null;
            }

        };

        $scope.removeLocation = function () {
            if (confirm("Are you sure you want to delete this location?")) {
                var deleting = CommonService.deleteLocation($scope.selectedLocation.Id);
                $scope.removeFilter();

                deleting.$promise.then(function () {
                    $scope.refreshProjectLocations();
                    $scope.reloadProjectLocations();
                });
            }

        };
*/




/*

        $scope.editLocation = function () {
            $scope.row = $scope.selectedLocation;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-addlocation.html',
                controller: 'ModalAddLocationCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };

        $scope.getFormContent = function () {
            return "Click button above to create a new location here.";
        };


        // expose a method for handling clicks ON THE MAP - this is linked to from the Map.js directive
        $scope.click = function (e) {

            //clear the delete selection if they click on the map somewhere...
            $scope.agGridOptions.api.deselectAll();

            try {

                if (!$scope.map.graphics.infoTemplate) {
                    $scope.map.graphics.infoTemplate = $scope.template;
                    console.log("graphics layer infotemplate defined.");
                }


                $scope.map.infoWindow.resize(250, 300);

                //show the infowindow
                if (e.graphic) {
                    console.log("e.graphic is next...");
                    console.dir(e.graphic);
                    $scope.map.infoWindow.setContent($scope.getInfoContent(e.graphic));
                }
                else {
                    $scope.map.infoWindow.setTitle("New Location");
                    $scope.map.infoWindow.setContent($scope.getFormContent());
                }

                $scope.map.infoWindow.show(e.mapPoint);



                //now... did they click an existing map point?
                if (e.graphic) {
                    //filter activities based on the location they clicked.
                    var filterActivities = [];
                    var location = getByField($scope.locationsArray, e.graphic.attributes.OBJECTID, "SdeObjectId");

                    //console.log("Filtering --- looking for location: "+location.Id); 
                    //console.dir(location);

                    angular.forEach($scope.allActivities, function (item, key) {
                        if (item.LocationId == location.Id) {
                            //console.log("Found: item with location id");
                            filterActivities.push(item);
                        }
                    });

                    console.log("number of filteractivities: " + filterActivities.length);
                    //set the filtered activities
                    $scope.activities = filterActivities;
                    $scope.agGridOptions.api.setRowData($scope.activities);


                    
                    //console.log("$scope.activities is next...");
                    //console.dir($scope.activities);

                    $scope.selectedLocation = location;
                    if ($scope.newGraphic) {
                        $scope.map.graphics.remove($scope.newGraphic);
                        $scope.newGraphic = null; // just to clear the buttons on the UI.
                    }

                    //$scope.center = [e.mapPoint.x,e.mapPoint.y];
                }
                else // no -- maybe they are making a new point?
                {
                    $scope.selectedLocation = null; //since we didn't select an existing one.

                    $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

                    $scope.newPoint = e.mapPoint;

                    //if they had already clicked somewhere, remove that point.
                    if ($scope.newGraphic)
                        $scope.map.graphics.remove($scope.newGraphic);

                    $scope.newGraphic = new esri.Graphic(
                        e.mapPoint,
                        new esri.symbol.SimpleMarkerSymbol()
                    );

                    $scope.map.graphics.add($scope.newGraphic);

                }

            } catch (e) {
                console.dir(e);
            }

        };

*/

/*

        $scope.toggleMap = function () {
            if ($scope.ShowMap.Display) {
                $scope.removeFilter(); //also clears location
                $scope.ShowMap.Display = false;
                $scope.ShowMap.Message = $scope.ShowMap.MessageToOpen;
            }
            else {
                $scope.ShowMap.Display = true;
                $scope.ShowMap.Message = $scope.ShowMap.MessageToClose;

                setTimeout(function () {
                    $scope.map.reposition();
                    console.log("repositioned");
                }, 400);

            }
        };
*/
        
/*
        $scope.refreshProjectLocations = function () {
            ProjectService.clearProject();
            $scope.project = null;
            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
        };
*/



/*
        $scope.reloadProjectLocations = function () {
            console.log("Inside $scope.reloadProjectLocations...");
            //console.log("$scope is next...")
            ////console.dir($scope);
            //console.log("$scope.project.Locations is next...");
            //console.dir($scope.project.Locations);
            $scope.subprojectList = angular.copy($scope.subprojectList);
            //console.log("$scope.subprojectList is next...");
            //console.dir($scope.subprojectList);

            $scope.datasetLocationType = getDatasetLocationType($scope.DatastoreTablePrefix);
            console.log("LocationType = " + $scope.datasetLocationType);

            //$scope.locationsArray = getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId");
            $scope.locationsArray = getMatchingByField($scope.project.Locations, $scope.datasetLocationType, "LocationTypeId");
            //console.log("$scope.locationsArray (after adding Locations based upon location type) is next...");
            //console.dir($scope.locationsArray);

            if ($scope.subprojectType === "Habitat") {
                console.log("Checking for subproject locations now...");
                angular.forEach($scope.project.Locations, function (location) {
                    ;
                    angular.forEach($scope.subprojectList, function (subproject) {
                        //console.log("subproject.ProjectId = " + subproject.ProjectId + ", $scope.project.Id = " + $scope.project.Id + ", location.ProjectId = " + location.ProjectId);
                        if ((subproject.ProjectId === $scope.project.Id) && (subproject.ProjectId === location.ProjectId) && (subproject.Id === location.SubprojectId)) {
                            console.log("Found subproject location...");
                            $scope.locationsArray.push(location);
                        }
                    });
                });

                console.log("$scope.locationsArray (after adding subproject locs) is next...");
                console.dir($scope.locationsArray);

                $scope.locationObjectIds = getLocationObjectIdsFromLocationsWithSubprojects($scope.locationsArray);
            }
            else {
                //$scope.locationObjectIds = getLocationObjectIdsByInverseType(PRIMARY_PROJECT_LOCATION_TYPEID,$scope.project.Locations);
                $scope.locationObjectIds = getLocationObjectIdsByInverseType($scope.datasetLocationType, $scope.project.Locations);
            }
            //console.log("$scope.locationObjectIds is next...");
            //console.dir($scope.locationObjectIds);

            if ($scope.map && $scope.map.locationLayer && $scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                $scope.map.locationLayer.showLocationsById($scope.locationObjectIds); //bump and reload the locations.

            //console.log("Project locations loaded!");
            //console.dir($scope.locationsArray);
            console.log("$scope (at end of reloadProjectLocations) is next...");
            console.dir($scope);
        };*/


/*

        $scope.reloadActivities = function () {
            $scope.loading = true;
            $scope.activities = DatasetService.getActivitiesForView($routeParams.Id);
        }
*/
 

    }

   
];
