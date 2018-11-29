//list all datasets.
var datasets_list = ['$scope', 'DatasetService', 'ProjectService','CommonService','$uibModal', '$window',
    function (scope, DatasetService, ProjectService, CommonService, $modal, $window){
  
        scope.datasets = DatasetService.getDatasetsList();

        scope.datasets.$promise.then(function () {

            angular.forEach(scope.datasets, function (dataset, key) {
                //need to bump this to get the route
                DatasetService.configureDataset(dataset);
            });

            var agCellRendererName = function (params) {
                return '<div>' +
                    '<a title="' + params.node.data.Description
                    + '" href="/index.html#!/'+ params.node.data.activitiesRoute +'/' + params.node.data.Id + '">'
                    + params.node.data.Name + '</a>' +
                    '</div>';
            };

            var agColumnDefs = [
                { field: 'Name', headerName: 'Dataset Name', sort: 'asc', cellRenderer: agCellRendererName, width: 300, menuTabs: ['filterMenuTab'], filter: 'text'},
                { field: 'ProjectName', headerName: 'Project', width: 300, menuTabs: ['filterMenuTab'], filter: 'text'},
                { field: 'DatastoreName', headerName: 'Type', width: 300, menuTabs: ['filterMenuTab']},
            ];

            scope.agGridOptions = {
                animateRows: true,
                enableSorting: true,
                enableFilter: true,
                enableColResize: true,
                showToolPanel: false,
                columnDefs: agColumnDefs,
                rowData: scope.projects,
                debug: false,
                onGridReady: function (params) {
                    params.api.sizeColumnsToFit();
                }
            };

            var ag_grid_div = document.querySelector('#datasets-list-grid');    //get the container id...
            scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.agGridOptions); //bind the grid to it.

            scope.agGridOptions.api.setRowData(scope.datasets);
        });
  }
];


