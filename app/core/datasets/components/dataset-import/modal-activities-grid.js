//multiple activities grid
var modal_activities_grid = ['$scope', '$uibModal','$uibModalInstance','GridService','$timeout',

    function ($scope, $modal, $modalInstance, GridService, $timeout) {

        $scope.hasDuplicateError = false;

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
                console.log("finished editing.");
                console.dir(event);

                if (GridService.validateCell(event)) {
                    GridService.fireRule("OnChange", event); //only fires when valid change is made
                }

                //this might be too slow, but it is nice to have...
                $scope.calculateStatistics();

                GridService.refreshRow(event);

                $scope.$apply();

                //duplicate checking - run for header keys and also ReadingDateTime for WaterTemp (special case)
                if($scope.dataset.Datastore.TablePrefix == "WaterTemp" && event.colDef.DbColumnName == "ReadingDateTime")
                    $scope.checkForDuplicates();
            
                console.log("all done edit validation");

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
                console.dir($scope.dataAgGridOptions.columnDefs);
                console.dir($scope.imported_rows);


                var ag_grid_div = document.querySelector('#data-import-grid');    //get the container id...
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.dataAgGridOptions); //bind the grid to it.
                $scope.dataAgGridOptions.api.showLoadingOverlay(); //show loading...

                //set the detail values into the grid
                $scope.dataAgGridOptions.api.setRowData($scope.imported_rows);
                
                console.log("GRID Validate. ------------------------------------------>>>");
                GridService.validateGrid($scope.dataAgGridOptions);
                $scope.dataAgGridOptions.api.redrawRows();
                console.log("GRID Validate IS DONE ------------------------------------------>>>");

                console.log("GRID Dupe check ------------------------------------------>>>");
                $scope.checkForDuplicates();
                console.log("GRID Dupe check IS DONE ------------------------------------------>>>");

                GridService.autosizeColumns($scope.dataAgGridOptions);

                $scope.calculateStatistics();

            }, 0);
        };

        $scope.activateGrid();

        //check for duplicates        
        $scope.checkForDuplicates = function () {

            if (!$scope.dataset.Config.EnableDuplicateChecking || !$scope.dataset.Config.DuplicateCheckFields.contains('ActivityDate')) {
                return; //early return, bail out since we aren't configured to duplicate check or don't have ActivityDate as a key
            }

            var ActivityDatesChecked = [];
            var hadAnyError = false;

            //check for duplicate using each unique ActivityDate (if there is one defined (water temp doesn't have one))
            $scope.dataAgGridOptions.api.forEachNode(function (node) { 
                var the_date = moment(node.data.Activity.ActivityDate).format('l');
                if (!ActivityDatesChecked.contains(the_date)) {
                    ActivityDatesChecked.push(the_date);
                    //ok, let's check this one.
                    var row = {
                        'Activity': {
                            'ActivityDate': node.data.Activity.ActivityDate,
                            'LocationId': node.data.Activity.LocationId,
                        }
                    };
                    console.log("checking for duplicates: ");
                    console.dir(row);
                    hadAnyError = hadAnyError || GridService.checkForDuplicates($scope.dataset, $scope.dataAgGridOptions, row, {});
                    console.log("result = " + hadAnyError);
                }
                
            });

            $scope.hasDuplicateError = hadAnyError;
            
        };

        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
