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
				console.warn("This project has no datasets.");
            }

        });

        scope.locationDataset.$promise.then(function () { 
            scope.dataGridOptions.columnDefs = GridService.getAgColumnDefs(scope.locationDataset).HeaderFields;
            scope.dataGridOptions.columnDefs.unshift({ field: 'EditLink', headerName: '', cellRenderer: EditLinkTemplate, width: 50, alwaysShowField: true, menuTabs: [], hide: true }),
            scope.activateDataGrid();
        });


        scope.project.$promise.then(function () { 
            if ($rootScope.Profile.canEdit(scope.project)) {
                scope.dataGridOptions.columnApi.setColumnVisible("EditLink", true);
                scope.dataGridOptions.api.refreshHeader();
            }
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

        
        var EditLinkTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openEditModal(param.data);
            });
            div.appendChild(editBtn);
            
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

        scope.openEditModal = function (a_selection) {
            scope.SaveMessage = null;

            scope.row = angular.copy(a_selection);

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-location.html',
                controller: 'ModalEditLocationCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_location) { 
                //replace that field in the grid with the one we got back
/*
                scope.dataset.Fields.forEach(function (existing_field,index) {
                    if (existing_field.FieldId == saved_field.FieldId) {
                        console.dir("found field to replace : " + existing_field.FieldId);
                        scope.dataset.Fields[index] = saved_field;
                    }
                });
*/
  //              scope.populateAddFieldDropdown();
    //            scope.fieldGridOptions.api.setRowData(scope.dataset.Fields);
                scope.SaveMessage = "Success.";
            });
        };


        scope.addLocation = function (a_selection) {
            scope.SaveMessage = null;

            scope.row = {};

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-location.html',
                controller: 'ModalEditLocationCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_location) { 
                //replace that field in the grid with the one we got back
/*
                scope.dataset.Fields.forEach(function (existing_field,index) {
                    if (existing_field.FieldId == saved_field.FieldId) {
                        console.dir("found field to replace : " + existing_field.FieldId);
                        scope.dataset.Fields[index] = saved_field;
                    }
                });
*/
  //              scope.populateAddFieldDropdown();
    //            scope.fieldGridOptions.api.setRowData(scope.dataset.Fields);
                scope.SaveMessage = "Success.";
            });
        };


    }

];






