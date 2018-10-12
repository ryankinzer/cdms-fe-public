/*
*   This page loads the project details. It includes some tabs that are always populated and some tabs
*   that are conditionally shown and populated depending on the project type.
*
*/

var project_data = ['$scope', '$routeParams','SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		//console.log("Inside controllers.js, projectDatasetsController...");
		//console.log("routeParams.Id = " + routeParams.Id);

        scope.OnTab = "Data";
		
		scope.datasets = ProjectService.getProjectDatasets(routeParams.Id);
        scope.project = ProjectService.getProject(routeParams.Id);

		scope.AuthorizedToViewProject = true;

		//once the datasets load, make sure each is configured with our scope.
        scope.datasets.$promise.then(function () {
         	if ((scope.datasets) && (scope.datasets.length > 0))
			{
				for (var i = 0; i < scope.datasets.length; i++)
				{
					DatasetService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
				}
			}
			else
			{
				console.log("This project has no datasets.");
            }
        
            scope.activateDataGrid();

        });
        

        var linkTemplate = function (param) {

            var div = document.createElement('div');

            var linkBtn = document.createElement('a');
            linkBtn.href = '#/' + param.data.activitiesRoute + '/' + param.data.Id;
            linkBtn.innerHTML = param.data.Name;

            div.appendChild(linkBtn);

            return div;
        };

        //datasets tab grid
        scope.dataGridOptions = {
            //data: 'datasets',
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            onGridReady: function (params) {
                params.api.sizeColumnsToFit();
            },
            columnDefs:
            [
                { field: 'Name', headerName: 'Dataset Name', cellRenderer: linkTemplate, width: 280 },
                { field: 'Description', headerName: 'Description', width: 450 },
            ]
        };

        scope.activateDataGrid = function () {

            var ag_grid_div = document.querySelector('#data-tab-grid');    //get the container id...
            scope.datatab_ag_grid = new agGrid.Grid(ag_grid_div, scope.dataGridOptions); //bind the grid to it.
            scope.dataGridOptions.api.showLoadingOverlay(); //show loading...

            scope.dataGridOptions.api.setRowData(scope.datasets);
            scope.dataGridOptions.api.sizeColumnsToFit(); //

        };


    }

];






