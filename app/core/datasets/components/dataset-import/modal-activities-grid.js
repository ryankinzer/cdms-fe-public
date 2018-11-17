//multiple activities grid
var modal_activities_grid = ['$scope', '$uibModal','$uibModalInstance','GridService','$timeout','$rootScope',

    function ($scope, $modal, $modalInstance, GridService, $timeout, $rootScope) {

        $scope.hasDuplicateError = false;
        $scope.ActivityDatesDuplicates = [];

        $scope.calculateStatistics = function () { 
            
            $scope.ActivityDates = [];
            $scope.PageErrorCount = 0;

            if (!$scope.dataAgGridOptions.hasOwnProperty('api'))
                return; //not loaded yet.

            $scope.dataAgGridOptions.api.forEachNode(function (node) {
                if (node.data.rowHasError)
                    $scope.PageErrorCount++;

                try {
                    var the_date = moment(node.data.Activity.ActivityDate).format('l');
                    if (!$scope.ActivityDates.contains(the_date)) {
                        $scope.ActivityDates.push(the_date);
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
            enableSorting: true,
            enableFilter: true, 
            enableColResize: true,
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
            },

            defaultColDef: {
                editable: true,
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

                if ($scope.dataset.Config.DuplicateCheckFields.contains(event.colDef.DbColumnName)) {
                    $scope.checkRowForDuplicates(event.node);
                }
            
                //console.log("all done edit validation");

            },
        };


        //call to fire up the grid after the $scope.dataset is ready
        $scope.activateGrid = function () {
            console.log("activating grid!");
            //setup grid and coldefs and then go!
            $timeout(function () {

                $scope.dataAgColumnDefs = GridService.getAgColumnDefs($scope.dataset);
                
                //setup any possible values that are needed - detail
                angular.forEach($scope.dataAgColumnDefs.DetailFields, function (fieldDef) {
                    if (fieldDef.field == "QAStatusId") { //RowQAStatusId because we're in the details
                        fieldDef.setPossibleValues(makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name'));
                    }

                    if (fieldDef.ControlType == 'file' || fieldDef.ControlType == 'hidden')
                        fieldDef.hide = true;

                });

                //setup activity fields to point to the right place
                angular.forEach($scope.dataAgColumnDefs.HeaderFields, function (fieldDef) {
                    if (fieldDef.field == "LocationId") { 
                        fieldDef.setPossibleValues(makeObjects($scope.project.Locations, 'Id', 'Label'));
                        fieldDef.field = "Activity." + fieldDef.DbColumnName;
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

                $scope.dataAgGridOptions.columnDefs = $scope.dataAgColumnDefs.HeaderFields.concat($scope.dataAgColumnDefs.DetailFields);
                //$scope.fields = { header: $scope.dataAgColumnDefs.HeaderFields, detail: $scope.dataAgColumnDefs.DetailFields };

                console.log("Ready to go!");
                //console.dir($scope.dataAgGridOptions.columnDefs);
                //console.dir($scope.imported_rows);


                var ag_grid_div = document.querySelector('#data-import-grid');    //get the container id...
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.dataAgGridOptions); //bind the grid to it.
                $scope.dataAgGridOptions.api.showLoadingOverlay(); //show loading...

                //set the detail values into the grid
                $scope.dataAgGridOptions.api.setRowData($scope.imported_rows);
                
                console.log("GRID Validate. ------------------------------------------>>>");
                GridService.validateGrid($scope.dataAgGridOptions);
                console.log("GRID Validate IS DONE ------------------------------------------>>>");

                console.log("GRID Dupe check ------------------------------------------>>>");
                $scope.checkAllRowsForDuplicates();
                console.log("GRID Dupe check IS DONE ------------------------------------------>>>");

                $scope.dataAgGridOptions.api.redrawRows();  
                GridService.autosizeColumns($scope.dataAgGridOptions);

                $scope.calculateStatistics();

            }, 0);
        };

        $scope.activateGrid();

        //check for duplicates in all rows
        $scope.checkAllRowsForDuplicates = function () {

            if (!$scope.dataset.Config.EnableDuplicateChecking || !$scope.dataset.Config.DuplicateCheckFields.contains('ActivityDate')) {
                return; //early return, bail out since we aren't configured to duplicate check or don't have ActivityDate as a key
            }

            var ActivityDatesChecked = [];

            //check for duplicate using each unique ActivityDate (if there is one defined (water temp doesn't have one))
            $scope.dataAgGridOptions.api.forEachNode(function (node) { 
                var the_date = moment(node.data.Activity.ActivityDate).format('l');
                if (!ActivityDatesChecked.contains(the_date)) {
                    //ok, let's check this one...
                    ActivityDatesChecked.push(the_date);
                    $scope.checkRowForDuplicates(node); 
                }
            });
        };

        //checks a row(node) for duplicate record. if so, pushes to ActivityDatesDuplicates
        $scope.checkRowForDuplicates = function (node) {
            
            var the_date = moment(node.data.Activity.ActivityDate).format('l');

            var row = {
                'Activity': {
                    'ActivityDate': node.data.Activity.ActivityDate,
                    'LocationId': node.data.Activity.LocationId,
                    'Id': 0,
                }
            };

            var saveResult = {};
            var dupe_promise = GridService.checkForDuplicates($scope.dataset, $scope.dataAgGridOptions, row, saveResult );
            if (dupe_promise !== null) {
                dupe_promise.$promise.then(function () {
                    if (saveResult.hasError) { //is a duplicate!
                        var existing_dupe = getByField($scope.ActivityDatesDuplicates, the_date, 'ActivityDate');
                        if (existing_dupe) {
                            existing_dupe.marked = false;
                        } else {
                            $scope.ActivityDatesDuplicates.push({ 'ActivityDate': the_date, 'marked': false, 'message': saveResult.error, 'row': row }); //will be marked by a watcher
                        }
                    }
                });
            }
        };


        //mark all rows that are duplicates as duplicates (if not already marked)
        $scope.$watch('ActivityDatesDuplicates', function(){ 

            var hadAnyError = false;
            
            $scope.ActivityDatesDuplicates.forEach(function (dupe) {
                if (!dupe.marked && $scope.dataAgGridOptions.api) {
                    dupe.marked = true;
                    $scope.dataAgGridOptions.api.forEachNode(function (node) {
                        var the_date = moment(node.data.Activity.ActivityDate).format('l');
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
            }

        },true);

        $scope.save = function () {
            //compose an activity for each and give a condition "we will save 17 new activities"

            //lets get a list of all activities that we will save
        
            console.dir($scope.ActivityDatesDuplicates);

            var ActivitiesToSave = [];

            var duplicates = [];
            $scope.ActivityDatesDuplicates.forEach(function (dupe) { duplicates.push(dupe.ActivityDate) });

            $scope.dataAgGridOptions.api.forEachNode(function (node) {
                var the_date = moment(node.data.Activity.ActivityDate).format('l');
                if (!duplicates.contains(the_date))
                    ActivitiesToSave.push(the_date);
            });

            alert("A total of " + ActivitiesToSave.length + " activities will be saved.");

            ActivitiesToSave.forEach(function (activity) { 

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
                    var the_date = moment(node.data.Activity.ActivityDate).format('l');
                    if (activity == the_date) {
                        if (payload.header == null) {
                            payload.Activity = node.data.Activity;
                            payload.header = {};
                            $scope.dataAgColumnDefs.HeaderFields.forEach(function (header_field) { 
                                payload.header[header_field.DbColumnName] = node.data[header_field.DbColumnName];
                            })
                        }
                        var the_detail = {};
                        $scope.dataAgColumnDefs.DetailFields.forEach(function (detail_field) {
                            the_detail[detail_field.DbColumnName] = node.data[detail_field.DbColumnName];
                        }); 
                        payload.details.push(the_detail);
                    }
                });

                console.log("send me to save!");
                console.dir(payload); //kbhere!

            });




            //$scope.dataAgGridOptions.api.forEachNode(function (node) {

            //$scope.ActivityDatesDuplicates.forEach(function(unique_activity

            //$scope.dataAgColumnDefs.HeaderFields.forEach(
            

            //$modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
