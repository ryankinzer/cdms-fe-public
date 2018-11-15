//multiple activities grid
var modal_activities_grid = ['$scope', '$uibModal','$uibModalInstance','GridService','$timeout',

    function ($scope, $modal, $modalInstance, GridService, $timeout) {




        $scope.getPageErrorCount = function () { 
            if (!$scope.dataAgGridOptions.hasOwnProperty('api'))
                return 0; //not loaded yet.

            var count = 0;

            $scope.dataAgGridOptions.api.forEachNode(function (node) { 
                if (node.data.rowHasError)
                    count ++;
            });

            return count;
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
                //console.dir(event);

                if (GridService.validateCell(event)) {
                    GridService.fireRule("OnChange", event); //only fires when valid change is made
                }

                $scope.PageErrorCount = $scope.getPageErrorCount();

                GridService.refreshRow(event);

                $scope.dataAgGridOptions.dataChanged = true;

                if (event.data.Id && (!$scope.dataAgGridOptions.editedRowIds.containsInt(event.data.Id))){ 
                    $scope.dataAgGridOptions.editedRowIds.push(event.data.Id);
                };
                $scope.$apply();

                //special case for water temp: fire dupecheck if readingdatetime changed
                if($scope.dataset.Datastore.TablePrefix == "WaterTemp" && event.colDef.DbColumnName == "ReadingDateTime")
                    $scope.checkForDuplicates();
            
            },
        };


        //call to fire up the grid after the $scope.dataset is ready
        $scope.activateGrid = function () {
            console.log("activating grid!");
            //setup grid and coldefs and then go!
            $timeout(function () {

                $scope.dataAgColumnDefs = GridService.getAgColumnDefs($scope.dataset);
                
                //spin through and set any sytem field detail possible values -----------------       //////TODO move the config.js fields into a systems dataset, then can use the Datasource technique to load these.
                angular.forEach($scope.dataAgColumnDefs.DetailFields, function (fieldDef) {
                    if (fieldDef.field == "QAStatusId") { //RowQAStatusId
                        fieldDef.setPossibleValues(makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name'));
                    }
                });

                angular.forEach($scope.dataAgColumnDefs.HeaderFields, function (fieldDef) {
                    if (fieldDef.field == "Location") { //RowQAStatusId
                        fieldDef.setPossibleValues(makeObjects($scope.project.Locations, 'Id', 'Label'));
                    }
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

                GridService.autosizeColumns($scope.dataAgGridOptions);

            }, 0);
        };

        $scope.activateGrid();

        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
