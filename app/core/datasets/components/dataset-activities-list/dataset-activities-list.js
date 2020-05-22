
var dataset_activities_list = ['$scope', '$routeParams',
    'DatasetService', 'SubprojectService', 'ProjectService', 'CommonService', 'UserService','GridService',
    '$uibModal', '$location', '$window', '$rootScope', '$timeout',
    function ($scope, $routeParams,
        DatasetService, SubprojectService, ProjectService, CommonService, UserService, GridService,
        $modal, $location, $window, $rootScope, $timeout) {

        $scope.dataset = DatasetService.getDataset($routeParams.Id);

        //TODO: this is running EVERY SINGLE TIME.... should only run if the dataset has a field that needs it.
        $scope.fishermen = ProjectService.getFishermen();
        $scope.fishermen.$promise.then(function () {
            console.log("Fishermen loaded...");
            //console.log("Fishermen loaded and is next...");
            //console.dir($scope.fishermen);
        });

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

                    var newColDef = null;
                    //initial values for header column definition
                    //var newColDef = {
                    /*
                    if (field.DbColumnName === "FishermanId") {
                        newColDef = {
                            headerName: field.Label,
                            field: field.DbColumnName,
                            width: SystemDefaultColumnWidth,
                            Label: field.Label,
                            DbColumnName: field.DbColumnName,
                            ControlType: field.ControlType,
                            PossibleValues: field.Field.PossibleValues,
                            //cellRenderer: $scope.CellRenderers[field.ControlType],
                            valueGetter: $scope.ValueGetters[field.ControlType],
                            valueFormatter: function (params) { // Note:  params.node.data contains the row data
                                var the_str = getNameFromUserId(params.node.data.FishermanId, $scope.fishermen);
                                if (typeof the_str === 'string') //backwards compatible - remove the quotes
                                    the_str = the_str.replace(/"/g, '');
                                return the_str;
                            },
                            filter: getAgGridFilterByType(field.ControlType),
                            filterParams: getAgGridFilterParamsByType(field.ControlType),
                            menuTabs: ['filterMenuTab'],
                        };
                    }
                    else {
                    */
                        newColDef = {
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
                            filterParams: getAgGridFilterParamsByType(field.ControlType),
                            menuTabs: ['filterMenuTab'],
                        };
                    //}

                    gridColDefs.push(newColDef); 
                }
            });

            //set the first column to be the sort column:
            if(gridColDefs[2])
                gridColDefs[2].sort = "desc";

            //add the user fullname to the end. this will appear for all datasets.
            gridColDefs.push({
                headerName: "By User",
                field: "UserFullname", //column from the activities list
                menuTabs: ['filterMenuTab'],
                filter: true,
            });

            /*
            gridColDefs.push({
                headerName: "Fisherman",
                field: "FullName", //column from the activities list
                valueGetter: $scope.ValueGetters[field.ControlType],
                valueFormatter: $scope.ValueFormatters[field.ControlType],
                menuTabs: ['filterMenuTab'],
                filter: true,
            });
            */

            //tell the grid we've changed the coldefs
            $scope.agGridOptions.api.setColumnDefs(gridColDefs); 

            console.log(" -- ok grid loaded and the coldefs are: ");
            console.dir(gridColDefs);
            
        });


        $scope.ValueGetters = {
            'activity-date': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]);
            },

            'time': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]);
            },

            'datetime': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]);
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
            
            'fisherman-select': function (params) {

                if ($scope.fishermen && params.node.data[params.colDef.DbColumnName]) {
                    var fisherman = getByField($scope.fishermen, params.node.data[params.colDef.DbColumnName], "Id");
                    if (fisherman)
                        params.node.data[params.colDef.DbColumnName] = fisherman.FullName;
                }
                return params.node.data[params.colDef.DbColumnName];
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

            'time': function (params) {
			   //console.dir(params);
			   //console.log(params.node.data[params.colDef.DbColumnName]);
			   //JN Tribal CDMS Edit: if SQL Server value is NULL then return empty string to grid 
			  if (params.node.data[params.colDef.DbColumnName]) {
				   return moment(params.node.data[params.colDef.DbColumnName]).format('HH:mm');
			   }
			   else {
				 	return '';
				}

            },

            'datetime': function (params) {
                return moment(params.node.data[params.colDef.DbColumnName]).format('YYYY-MM-DD HH:mm');
            },
/*
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
                $scope.ShowMap.Display = false;
                $scope.ShowMap.Message = $scope.ShowMap.MessageToOpen;
            }
            else {
                $scope.ShowMap.Display = true;
                $scope.ShowMap.Message = $scope.ShowMap.MessageToClose;

            }
        };

    }

   
];
