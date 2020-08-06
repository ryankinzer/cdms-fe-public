
var admin_view = ['$scope', '$uibModal', 'DatasetService',
    function ($scope, $modal, DatasetService) {

        if (!$scope.Profile.isAdmin())
            angular.rootScope.go("/unauthorized");

        $scope.hasNewDatastore = false;
        $scope.datastoresIgnore = ["ActivitySystemFields","LocationSystemFields","CRPPCorrespondence"];
        $scope.datastores = DatasetService.getDatastores();
        $scope.datastores.$promise.then(function(){
            $scope.datasets = DatasetService.getDatasetsList();

            $scope.datasets.$promise.then(function () {

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
                    { field: 'DatastoreName', headerName: 'Datastore Name', cellRenderer: CellRendererDatastore, width: 280, menuTabs: ['filterMenuTab'], filter: 'text', sort: 'asc'},
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

                //see which datastores have a dataset already
                $scope.datastores.forEach(function(datastore){
                    //iterate the datasets and mark this datastore as having a dataset if it does
                    $scope.datasets.forEach(function(dataset){
                        if(dataset.DatastoreId == datastore.Id){
                            datastore.hasDataset = true;
                            return;
                        }
                    })

                    if(!datastore.hasDataset && !$scope.datastoresIgnore.contains(datastore.Name)){
                        $scope.hasNewDatastore = true;
                        datastore.hasDataset = false;
                    }
                })
            })
        });

        $scope.createDatastore = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-datastore.html',
                controller: 'ModalDatastore',
                scope: $scope, //very important to pass the scope along... 
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_datastore) {
                saved_datastore.hasDataset = false;
                $scope.hasNewDatastore = true; 
                $scope.datastores.push(saved_datastore);
            });
            
        };
    }
];