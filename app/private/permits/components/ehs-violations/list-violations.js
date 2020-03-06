var list_violations = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService','CommonService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService, CommonService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "All";
        $scope.row = null;

        /*
        $scope.PermitParcels = [];
        $scope.PermitEvents = [];
        $scope.PermitFiles = [];
        $scope.ParcelHistory = [];
        $scope.PermitFileTypes = [];
        */

        $scope.dataset = DatasetService.getDataset(EHS_DATASETID);
        //$scope.eventsdataset = DatasetService.getDataset(PERMITEVENTS_DATASETID);
        //$scope.PermitFileTypes = CommonService.getMetadataProperty(METADATA_PROPERTY_PERMIT_FILETYPES);
        //$scope.contactsdataset = DatasetService.getDataset(PERMITCONTACTS_DATASETID);

        /*
        $scope.contactsdataset.$promise.then(function () {
            $scope.ContactsDatasetColumnDefs = GridService.getAgColumnDefs($scope.contactsdataset);
        });

        $scope.PermitFileTypes.$promise.then(function () {
            $scope.PermitFileTypes = angular.fromJson($scope.PermitFileTypes.PossibleValues);
        });
        */

        $scope.dataset.$promise.then(function () {
            // console.log(" -- dataset back -- ");
            $scope.AllColumnDefs = GridService.getAgColumnDefs($scope.dataset);
            $scope.ehsGrid.columnDefs = $scope.AllColumnDefs.HeaderFields;

            //setup some custom "tweaks" to the column definition defaults TODO: might be a better way
            $scope.ehsGrid.columnDefs.forEach(function (coldef) {
                if (coldef.DbColumnName == 'FileNumber'){
                    coldef.Disabled = true;
                    coldef.filter='agTextColumnFilter'; //change from the default (checkboxes) to a "contains" filter
                }

                //if(coldef.DbColumnName == 'ProjectName' || coldef.DbColumnName == 'SiteAddress')
                //    coldef.filter='agTextColumnFilter'; 

                //if(coldef.DbColumnName == 'ReviewsRequired'){
                //    coldef.valueFormatter = function (params) {
                //        return valueFormatterArrayToList(params.node.data.ReviewsRequired);
                //    }
               // }
                    
                
            });

            //activate the grid with the violations data
            $scope.ehsGridDiv = document.querySelector('#active-ehs-grid');
            new agGrid.Grid($scope.ehsGridDiv, $scope.ehsGrid);

            $scope.violations = PermitService.getAllViolations();

            $scope.violations.$promise.then(function () {
                // console.log(" -- violations back -- ");
                $scope.ehsGrid.api.setRowData($scope.violations);

                //if there is an incoming Id, select it.
                if ($routeParams.Id) {
                    $scope.ehsGrid.api.forEachNode(function (node) {
                        if (node.data.Id == $routeParams.Id) {
                            node.setSelected(true);
                            $scope.ehsGrid.api.ensureIndexVisible(node.rowIndex, 'top');
                        }
                    });
                }

                /*
                //if there is an incoming filter, select it
                if($routeParams.filter) {
                    $scope['show'+$routeParams.filter]();
                }
                */

                GridService.autosizeColumns($scope.ehsGrid);

            });

            /*
            //now do some caching...
            $scope.PermitPersons = PermitService.getAllPersons();
            $scope.CadasterParcels = PermitService.getAllParcels();

            $scope.PermitPersons.$promise.then(function () {
                $scope.PermitPersons.forEach(function (person) {
                    person.Label = $scope.getPersonLabel(person);
                });

                $scope.PermitPersons = $scope.PermitPersons.sort(orderByAlpha);
            });
            */
        });
            //requirement: can navigate permits by up and down arrow keys
        $scope.keyboardNavigation = function (params) {
            //console.log("my navigation");
            var previousCell = params.previousCellDef;
            var suggestedNextCell = params.nextCellDef;

            var KEY_UP = 38;
            var KEY_DOWN = 40;
            var KEY_LEFT = 37;
            var KEY_RIGHT = 39;

            switch (params.key) {
                case KEY_DOWN:
                    //console.log("down");
                    previousCell = params.previousCellDef;
                    // set selected cell on current cell + 1
                    $scope.ehsGrid.api.forEachNode(function (node) {
                        if (previousCell.rowIndex + 1 === node.rowIndex) {
                            node.setSelected(true);
                        }
                    });
                    return suggestedNextCell;
                case KEY_UP:
                    previousCell = params.previousCellDef;
                    // set selected cell on current cell - 1
                    $scope.ehsGrid.api.forEachNode(function (node) {
                        if (previousCell.rowIndex - 1 === node.rowIndex) {
                            node.setSelected(true);
                        }
                    });
                    return suggestedNextCell;
                case KEY_LEFT:
                case KEY_RIGHT:
                    return suggestedNextCell;
                default:
                    throw "this will never happen, navigation is always one of the 4 keys above";
            }
        };


        $scope.ehsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            hasFilters: false,
            onSelectionChanged: function (params) {

                if ($scope.row && $scope.row.dataChanged) {
                    //warn if they're trying to change the selection when data is changed
                    if ($scope.row.Id != $scope.ehsGrid.api.getSelectedRows()[0].Id) {
                        alert("It looks like you've changed this record. Please click 'Save' or 'Cancel' before navigating to another record.");
                        $scope.ehsGrid.selectedNode.setSelected(true);
                    }

                    //in any case, don't change.
                    return false;
                }

                $scope.ehsGrid.selectedItem = $scope.row = angular.copy($scope.ehsGrid.api.getSelectedRows()[0]);
                $scope.ehsGrid.selectedNode = $scope.ehsGrid.api.getSelectedNodes()[0];
                $('#tab-basicinfo').tab('show'); //default to the "Permit Status" tab when select a different permit
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                //console.dir($scope.row);
                //if ($scope.row)
                //    $scope.selectPermit($scope.row.Id);
            },
            selectedItem: null,
            selectedNode: null,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onFilterChanged: function(params){
                if($scope.clearingFilters == true)
                    $scope.ehsGrid.hasFilters = $scope.clearingFilters = false;
                else
                    $scope.ehsGrid.hasFilters = true;
                    
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            navigateToNextCell: $scope.keyboardNavigation
        }


        
    }];        