
var admin_view = ['$scope', '$uibModal', 'DatasetService','ProjectService',
    function ($scope, $modal, DatasetService, ProjectService) {

        if (!$scope.Profile.isAdmin())
            angular.rootScope.go("/unauthorized");


            $scope.datasets = DatasetService.getDatasetsList();

            $scope.datasets.$promise.then(function () {
    
                //angular.forEach($scope.datasets, function (dataset, key) {
                    //need to bump this to get the route
                //    DatasetService.configureDataset(dataset, $scope);
                //});
    
                var CellRendererDataset = function (params) {
                    return '<div>' +
                        '<a title="' + params.node.data.Description
                        + '" href="#!/admin-dataset/'+ params.node.data.Id + '">'
                        + params.node.data.Name + '</a>' +
                        '</div>';
                };

                var CellRendererDatastore = function (params) {
                    return '<div>' +
                        '<a title="' + params.node.data.Description
                        + '" href="#!/admin-master/'+ params.node.data.DatastoreId + '">'
                        + params.node.data.DatastoreName + '</a>' +
                        '</div>';
                };

                var agColumnDefs = [
                    { field: 'DatastoreName', headerName: 'Master Dataset', cellRenderer: CellRendererDatastore, width: 280, menuTabs: ['filterMenuTab'], filter: 'text', sort: 'asc'},
                    { field: 'Name', headerName: 'Dataset Name', cellRenderer: CellRendererDataset, width: 300, menuTabs: ['filterMenuTab'], filter: 'text'},
                    { field: 'ProjectName', headerName: 'Project', width: 300, menuTabs: ['filterMenuTab'], filter: 'text'},
                ];
    
                $scope.agGridOptions = {
                    animateRows: true,
                    showToolPanel: false,
                    columnDefs: agColumnDefs,
                    rowData: $scope.projects,
                    debug: false,
                    onGridReady: function (params) {
                        params.api.sizeColumnsToFit();
                    },
                    defaultColDef: {
                        sortable: true,
                        resizable: true,
                    },
                };
    
                var ag_grid_div = document.querySelector('#datasets-list-grid');    //get the container id...
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.agGridOptions); //bind the grid to it.
    
                $scope.agGridOptions.api.setRowData($scope.datasets);
            
            });


        $scope.createMasterDataset = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-datastore.html',
                controller: 'ModalDatastore',
                scope: $scope, //very important to pass the scope along... 
                backdrop: "static",
                keyboard: false
            });
            
        };

        $scope.addNewProjectDataset = function (datastore) {
            $scope.datastore = datastore;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/add-new-project-dataset.html',
                controller: 'ModalAddProjectDatasetCtrl',
                scope: $scope, //very important to pass the scope along... 
                backdrop: "static",
                keyboard: false
            });
        };

    }

];