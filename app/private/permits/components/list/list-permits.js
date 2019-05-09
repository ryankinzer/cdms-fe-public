var list_permits = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "Issued";
        $scope.row = null;
        $scope.showArchived = 'No';

        $scope.toggleShowArchived = function () { 
            $scope.showArchived = ($scope.showArchived == 'Yes') ? 'No' : 'Yes';
            $scope.applyArchiveFilter();
        }

        $scope.dataset = DatasetService.getDataset(PERMIT_DATASETID);

        $scope.dataset.$promise.then(function () { 
        
            $scope.AllColumnDefs = GridService.getAgColumnDefs($scope.dataset);
            $scope.permitsGrid.columnDefs = $scope.AllColumnDefs.HeaderFields;
            
            //activate the grid with the permits data
            $scope.permitsGridDiv = document.querySelector('#active-permits-grid');
            new agGrid.Grid($scope.permitsGridDiv, $scope.permitsGrid);

            $scope.permits = PermitService.getAllPermits();

            $scope.permits.$promise.then(function () {
            
                $scope.permitsGrid.api.setRowData($scope.permits);
                $scope.applyArchiveFilter();

            });
        });


        $scope.applyArchiveFilter = function () {
            
            var filterComponent = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filterComponent.selectNothing();
            for (var i = 0; i<filterComponent.getUniqueValueCount(); i++) {
                var value = filterComponent.getUniqueValue(i);
                if ($scope.showArchived == 'Yes' || value != "Archived" ) {
                    filterComponent.selectValue(value);
                }
            }
            $scope.permitsGrid.api.onFilterChanged();
        }

        $scope.permitsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                $scope.permitsGrid.selectedItem = $scope.row = $scope.permitsGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                //console.dir(params);
            },
            selectedItem: null ,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }



}];