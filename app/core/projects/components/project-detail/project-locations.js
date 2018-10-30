/*
*   This page loads the project locations. 
*/

var project_locations = ['$scope', '$routeParams','GridService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, GridService, ProjectService, DatasetService, CommonService, UserService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		//console.log("Inside controllers.js, projectDatasetsController...");
		//console.log("routeParams.Id = " + routeParams.Id);

        scope.OnTab = "Locations";
		
		scope.datasets = ProjectService.getProjectDatasets(routeParams.Id);
        scope.project = ProjectService.getProject(routeParams.Id);
        scope.locationDataset = DatasetService.getDataset(SYSTEM_LOCATION_DATASET); //load the dataset with the fields for location grid

        scope.selectedDataset = null;


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

        });

        scope.locationDataset.$promise.then(function () { 
            scope.dataGridOptions.columnDefs = GridService.getAgColumnDefs(scope.locationDataset).HeaderFields;
            scope.activateDataGrid();
        });

        
        scope.showLocations = function (dataset) { 
            
            scope.selectedDataset = dataset;

            var filter_component = scope.dataGridOptions.api.getFilterInstance('LocationTypeId');
            filter_component.selectNothing();
            filter_component.selectValue(dataset.Datastore.LocationTypeId);
            scope.dataGridOptions.api.onFilterChanged();
            scope.dataGridOptions.api.deselectAll();
            
        };

        scope.showProjectLocations = function () { 
            scope.selectedDataset = null;
            scope.dataGridOptions.api.setFilterModel(null)
            scope.dataGridOptions.api.onFilterChanged();
            scope.dataGridOptions.api.deselectAll();
        };

        var linkTemplate = function (param) {

            var div = document.createElement('div');

            var linkBtn = document.createElement('a');
            linkBtn.href = '#!/' + param.data.activitiesRoute + '/' + param.data.Id;
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
            columnDefs: [],
            rowSelection: 'multiple',
            onSelectionChanged: function (params) {
                scope.dataGridOptions.selectedItems = scope.dataGridOptions.api.getSelectedRows();
                scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            selectedItems: []
        };

        scope.activateDataGrid = function () {

            var ag_grid_div = document.querySelector('#locations-grid');    //get the container id...
            scope.datatab_ag_grid = new agGrid.Grid(ag_grid_div, scope.dataGridOptions); //bind the grid to it.
            scope.dataGridOptions.api.showLoadingOverlay(); //show loading...

            scope.project.$promise.then(function () { 
                scope.dataGridOptions.api.setRowData(scope.project.Locations);
                //scope.dataGridOptions.api.sizeColumnsToFit(); 
            });
            
            

        };


    }

];






