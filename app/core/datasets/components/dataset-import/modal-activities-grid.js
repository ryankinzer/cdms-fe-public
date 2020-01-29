//multiple activities grid
var modal_activities_grid = ['$scope', '$uibModal','$uibModalInstance','GridService','$timeout','$rootScope','DatasetService',

    function ($scope, $modal, $modalInstance, GridService, $timeout, $rootScope, DatasetService) {

        $modalInstance.rendered.then(function() {
            console.log("Rendered, so now we will activate.");
            $scope.activateGrid();
        });

        $scope.system = { 
            loading: true, 
            messages: [ "Processing data and preparing the grid..."]
        };

        $scope.hasDuplicateError = false;
        $scope.ActivityDatesDuplicates = [];
        $scope.ActivitiesToSave = [];

        $scope.calculateStatistics = function () { 
            
            $scope.ActivityDates = [];
            $scope.PageErrorCount = 0;

            if (!$scope.dataAgGridOptions.hasOwnProperty('api'))
                return; //not loaded yet.

            $scope.dataAgGridOptions.api.forEachNode(function (node) {
                if (node.data.rowHasError)
                    $scope.PageErrorCount++;

                try {
                    var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');
                    var the_key = the_date + "_" + node.data.Activity.LocationId;
                    if (!$scope.ActivityDates.contains(the_key)) {
                        $scope.ActivityDates.push(the_key);
                    }
                }catch(e){ 
                    console.warn("invalid date not added to ActivityDates calculation: "+node.data.Activity.ActivityDate);
                    console.dir(e);
                }
            });
        };


        //ag-grid - header + details --- all in one grid for multiple activities
        $scope.dataAgGridOptions = {
            animateRows: true,
            //enableSorting: true,
            //enableFilter: true, 
            //enableColResize: true,
            showToolPanel: false,
            columnDefs: null,
            rowData: null,
            dataChanged: false, //updated to true if ever any data is changed
            rowSelection: 'multiple',
            onSelectionChanged: function (params) {
                
                var rows = params.api.getSelectedRows();
                $scope.dataAgGridOptions.selectedItems.length = 0; //truncate, don't replace with [] -- otherwise it is a shadow copy
                rows.forEach(function (row) {
                    $scope.dataAgGridOptions.selectedItems.push(row);
                });
                    
                $scope.$apply(); //bump angular (won't work otherwise!)
            },
            selectedItems: [],
            onGridReady: function (params) {
                console.log("GRID READY fired. ------------------------------------------>>>");
                $scope.system.loading = false;
                
                setTimeout(function(){
                    GridService.autosizeColumns($scope.dataAgGridOptions);
                    $scope.$apply();
                    console.log("resize grid columns")
                },200);

            },

            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
            },
            rowClassRules: {
                'row-validation-error': function(params) { return params.node.data.rowHasError; }
            },
            onCellEditingStarted: function (event) {
                //console.log('cellEditingStarted');
            },
            onCellEditingStopped: function (event) {
                //save the row we just edited
                //console.log("finished editing.");
                //console.dir(event);

                if (GridService.validateCell(event)) {
                    GridService.fireRule("OnChange", event); //only fires when valid change is made
                }

                //this might be too slow, but it is nice to have...
                $scope.calculateStatistics();
                GridService.refreshRow(event);
                $scope.$apply();

                if ($scope.dataset.Config.DuplicateCheckFields && $scope.dataset.Config.DuplicateCheckFields.contains(event.colDef.DbColumnName)) {
                    $scope.checkRowForDuplicates(event.node);
                }
            
                //console.log("all done edit validation");

            },
        };


        //call to fire up the grid after the $scope.dataset is ready
        $scope.activateGrid = function () {
            console.log("activating grid!");
            $scope.system.messages.push("Preparing data for grid...");
            //setup grid and coldefs and then go!

                $scope.dataAgColumnDefs = GridService.getAgColumnDefs($scope.dataset);
                
                //setup any possible values that are needed - detail
                $scope.dataAgColumnDefs.DetailFields.forEach(function (fieldDef) {
                    if (fieldDef.field == "QAStatusId") { //RowQAStatusId because we're in the details
                        fieldDef.setPossibleValues(makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name'));
                    }

                    if (fieldDef.ControlType == 'file' || fieldDef.ControlType == 'hidden')
                        fieldDef.hide = true;

                });

                //setup activity fields to point to the right place
                $scope.dataAgColumnDefs.HeaderFields.forEach(function (fieldDef) {
                    if (fieldDef.field == "LocationId") { 
                        if (fieldDef.setPossibleValues) {
                            fieldDef.setPossibleValues(makeObjects($scope.project.Locations, 'Id', 'Label'));
                            fieldDef.field = "Activity." + fieldDef.DbColumnName;
                        }
                    }

                    if (fieldDef.field == "QAStatusId") { //ActivityQAStatusId 
                        fieldDef.setPossibleValues(makeObjects($scope.dataset.QAStatuses, 'Id', 'Name'));
                        fieldDef.field = "Activity." + fieldDef.DbColumnName;
                    }

                    if (fieldDef.field == "QAComments") { 
                        fieldDef.field = "Activity." + fieldDef.DbColumnName;
                    }

                    if (fieldDef.field == "ActivityDate") { 
                        fieldDef.field = "Activity." + fieldDef.DbColumnName;
                    }

                    if (fieldDef.ControlType == 'file' || fieldDef.ControlType == 'hidden')
                        fieldDef.hide = true;

                });
                $scope.system.messages.push("Preparing grid...");

                $scope.dataAgGridOptions.columnDefs = $scope.dataAgColumnDefs.HeaderFields.concat($scope.dataAgColumnDefs.DetailFields);
                //$scope.fields = { header: $scope.dataAgColumnDefs.HeaderFields, detail: $scope.dataAgColumnDefs.DetailFields };

                console.log("Ready to go!");
                //console.dir($scope.dataAgGridOptions.columnDefs);
                //console.dir($scope.imported_rows);


                var ag_grid_div = document.querySelector('#data-import-grid');    //get the container id...
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.dataAgGridOptions); //bind the grid to it.
                //$scope.dataAgGridOptions.api.showLoadingOverlay(); //show loading...

                //set the detail values into the grid
                //console.log("setting grid data");
                $scope.dataAgGridOptions.api.setRowData($scope.imported_rows);

                //console.log("GRID Validate. ------------------------------------------>>>");
                GridService.validateGrid($scope.dataAgGridOptions);
                //console.log("GRID Validate IS DONE ------------------------------------------>>>");

                $scope.system.messages.push("Checking for duplicates...");
                //console.log("GRID Dupe check ------------------------------------------>>>");
                $scope.checkAllRowsForDuplicates();
                //console.log("GRID Dupe check IS DONE ------------------------------------------>>>");

                $scope.dataAgGridOptions.api.redrawRows();  
                
                $scope.system.messages.push("Calculating statistics...");
                $scope.calculateStatistics();
                GridService.bubbleErrors($scope.dataAgGridOptions);

                $scope.system.messages.push("Done...");


            //}, 0);
        };

        //check for duplicates in all rows
        $scope.checkAllRowsForDuplicates = function () {

            if (!$scope.dataset.Config.EnableDuplicateChecking || !$scope.dataset.Config.DuplicateCheckFields.contains('ActivityDate')) {
                return; //early return, bail out since we aren't configured to duplicate check or don't have ActivityDate as a key
            }

            $scope.ActivityDatesChecked = [];
            $scope.num_checked = 0;

            //check for duplicate using each unique ActivityDate (if there is one defined (water temp doesn't have one))
            $scope.dataAgGridOptions.api.forEachNode(function (node) { 
                var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');
        
                if (!$scope.ActivityDatesChecked.contains(the_date)) {
                    //ok, let's check this one...
                    $scope.ActivityDatesChecked.push(the_date);
                    $scope.checkRowForDuplicates(node); 
                }
            });
        };

        //checks a row(node) for duplicate record. if so, pushes to ActivityDatesDuplicates
        $scope.checkRowForDuplicates = function (node) {
            
            var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');

            var row = {
                'Activity': {
                    'ActivityDate': node.data.Activity.ActivityDate,
                    'LocationId': node.data.Activity.LocationId,
                    'Id': 0,
                }
            };

            //if this is already marked as a duplicate, don't bother sending off another request...

            var saveResult = {};
            var dupe_promise = GridService.checkForDuplicates($scope.dataset, $scope.dataAgGridOptions, row, saveResult );
            if (dupe_promise !== null) {
                dupe_promise.$promise.then(function () {
                    $scope.num_checked++;
                    if (saveResult.hasError) { //is a duplicate!
                        var existing_dupe = getByField($scope.ActivityDatesDuplicates, the_date, 'ActivityDate');
                        if (existing_dupe) {
                            existing_dupe.marked = false;
                        } else {
                            $scope.ActivityDatesDuplicates.push({ 'ActivityDate': the_date, 'LocationId': node.data.Activity.LocationId, 'marked': false, 'message': saveResult.error, 'row': row }); //will be marked by a watcher
                        }
                    }
                    if ($scope.num_checked == $scope.ActivityDatesChecked.length) {
                        //console.log(" >>>>>>>>> ok all done with all rows! --------------------");
                        //ok, duplicate checking promises are all back -- let's mark any in our grid that are duplicates and then bubble them up.
                        var hadAnyError = false;

                        $scope.ActivityDatesDuplicates.forEach(function (dupe) {
                            if (!dupe.marked && $scope.dataAgGridOptions.api) {
                                dupe.marked = true;
                                $scope.dataAgGridOptions.api.forEachNode(function (node) {
                                    var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');

                                    if (the_date == dupe.ActivityDate) {
                                        hadAnyError = true;
                                        GridService.addErrorToNode(node, dupe.message, null);
                                    }
                                });
                            }
                        });

                        if (hadAnyError) {
                            $scope.hasDuplicateError = hadAnyError;
                            $scope.dataAgGridOptions.api.redrawRows();
                            $scope.calculateStatistics();
                            GridService.bubbleErrors($scope.dataAgGridOptions);
                        }
                    }
                });
            }
        };


        $scope.save = function () {
            //compose an activity for each and give a condition "we will save 17 new activities"
            //lets get a list of all activities that we will save
        
            $scope.system.messages.length = 0;
            $scope.system.loading = true;

            var unique_dates = [];
            $scope.ActivityDatesDuplicates.forEach(function (dupe) { unique_dates.push(dupe.ActivityDate+"_"+dupe.LocationId) });
            
            var missing_fields = false;

            $scope.dataAgGridOptions.api.forEachNode(function (node) {
                if (!node.data.Activity.ActivityDate || !node.data.Activity.LocationId) {
                    missing_fields = true;
                    console.log("uhoh - missing stuff from activity:");
                    console.dir(node.data.Activity);
                }
                var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');
                var the_key = the_date + "_" + node.data.Activity.LocationId;
                
                if (!unique_dates.contains(the_key)) {
                    unique_dates.push(the_key);
                    $scope.ActivitiesToSave.push({ 'ActivityDate': the_date, 'Key': the_key, 'LocationId': node.data.Activity.LocationId });
                }
            });

            if (missing_fields) {
                alert("All rows require an ActivityDate and Location. Please check your data and try again.");
                $scope.ActivitiesToSave.length = 0;
                return;
            }

            //console.dir($scope.ActivitiesToSave);

            if (!confirm("A total of " + $scope.ActivitiesToSave.length + " activities will be saved.")) {
                $scope.system.loading = false;
                $scope.ActivitiesToSave.length = 0;
                return;
            }

            $scope.ActivitiesToSave.forEach(function (activity) { 
                //compose our payload 
                var payload = {
                    'Activity': null,
                    'DatasetId': $scope.dataset.Id,
                    'ProjectId': $scope.project.Id,
                    'UserId': $rootScope.Profile.Id,
                    'deletedRowIds': [],
                    'editedRowIds': [],
                    'header': null,
                    'details': [],
                };

                $scope.dataAgGridOptions.api.forEachNode(function (node, index) { 
                    var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');

                    if (activity.ActivityDate == the_date && node.data.Activity.LocationId == activity.LocationId) {
                        //console.dir(node);
                        if (payload.header == null) {
                            payload.Activity = node.data.Activity;
                            payload.header = {};

                            $scope.dataAgColumnDefs.HeaderFields.forEach(function (header_field) { 
                                payload.header[header_field.DbColumnName] = node.data[header_field.DbColumnName];
                            })
                            //add the ActivityQAStatus back in with values from the activity
                            payload.Activity.ActivityQAStatus = {
                                'Comments': node.data.Activity.QAComments,
                                'QAStatusId': node.data.Activity.QAStatusId,
                            };
                            delete payload.header['QAStatusId'];
                            delete payload.header['QAComments'];
                            delete payload.header['LocationId'];
                            delete payload.header['ActivityDate'];

                        }
                        //console.dir(node);
                        if (node.data.data_row_hasdata) {

                            var the_detail = { 'QAStatusId': node.data['QAStatusId'] };

                            $scope.dataAgColumnDefs.DetailFields.forEach(function (detail_field) {
                                if (detail_field.ControlType == "multiselect" && Array.isArray(node.data[detail_field.DbColumnName]))
                                    the_detail[detail_field.DbColumnName] = angular.toJson(node.data[detail_field.DbColumnName]);
                                else
                                    the_detail[detail_field.DbColumnName] = node.data[detail_field.DbColumnName];
                            });
                            payload.details.push(the_detail);
                            //console.dir(the_detail);
                        } else { 
                            console.log("skipping data for this row because it was empty!");
                        }
                        
                    }
                });

                activity.numRecords = payload.details.length;

                //console.dir(payload); 
                activity.result = DatasetService.saveActivities(payload);

                activity.result.$promise.then(
                function () {
                    activity.result.success = "Save successful.";
                    console.log("Success!");
                    $scope.system.loading = false;
                }, 
                function (data) { 
                    console.log("Failure!");
                    $scope.system.loading = false;
                    //console.dir(data);

                    if (typeof data.data !== 'undefined') {
                        if (typeof data.data.ExceptionMessage !== 'undefined') {
                            theErrorText = data.data.ExceptionMessage;
                            console.log("Save error:  theErrorText = " + theErrorText);
                        }

                    }
                    activity.result.error = "Error: " + theErrorText ;

                });

            });




            //$scope.dataAgGridOptions.api.forEachNode(function (node) {

            //$scope.ActivityDatesDuplicates.forEach(function(unique_activity

            //$scope.dataAgColumnDefs.HeaderFields.forEach(
            

            //$modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.close = function () { 
            $modalInstance.close();
        }
    }
];
