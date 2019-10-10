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
            if ((scope.datasets) && (scope.datasets.length > 0)) {

                // Exclude (delete) the Habitat-related datasets from the list
                for (var i = 0; i < scope.datasets.length; i++) {
                    if (scope.datasets[i].Config){
                        var tmpConfig = angular.fromJson(scope.datasets[i].Config);

                        if ((tmpConfig.LocationsPage) && (tmpConfig.LocationsPage.HideDataset)) {
                            scope.datasets.splice(i, 1);
                        }
                    }
                };

         	    for (var i = 0; i < scope.datasets.length; i++) {
				    DatasetService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
				}
			} else {
				console.warn("This project has no datasets.");
            }
        });

        scope.locationDataset.$promise.then(function () { 
            scope.dataGridOptions.columnDefs = GridService.getAgColumnDefs(scope.locationDataset).HeaderFields;
            scope.dataGridOptions.columnDefs.unshift({ field: 'EditLink', headerName: '', cellRenderer: EditLinkTemplate, width: 50, alwaysShowField: true, menuTabs: [], hide: true }),
            scope.activateDataGrid();
            //console.dir(scope.dataGridOptions.columnDefs);
        });

        scope.showLocations = function (dataset) { 
            
            scope.selectedDataset = dataset;
            //console.dir(dataset);

            var filter_component = scope.dataGridOptions.api.getFilterInstance('LocationTypeId');
            filter_component.selectNothing();
            filter_component.selectValue(dataset.Datastore.LocationTypeId);
            scope.dataGridOptions.api.onFilterChanged();
            scope.dataGridOptions.api.deselectAll();

            scope.displayLocationsOnMap();
        };

        scope.showProjectLocations = function () { 
            scope.selectedDataset = null;
            scope.dataGridOptions.api.setFilterModel(null);
            scope.dataGridOptions.api.onFilterChanged();
            scope.dataGridOptions.api.deselectAll();

            scope.displayLocationsOnMap();
        };

        scope.displayLocationsOnMap = function () { 
            var locationIds = [];

            scope.dataGridOptions.api.forEachNodeAfterFilter(function (node) { 
                //console.dir(node);
                locationIds.push(node.data.SdeObjectId);
            });

            if (scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                scope.map.locationLayer.showLocationsById(locationIds);

            //console.log("showing these locations");
            //console.dir(locationIds);

        }

        
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
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            columnDefs: [],
            rowSelection: 'multiple',
            onSelectionChanged: function (params) {
                scope.dataGridOptions.selectedItems = scope.dataGridOptions.api.getSelectedRows();
                scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            onGridReady: function (params) { console.log("Grid ready!"); },
            selectedItems: [],
            defaultColDef: {
                sortable: true,
                resizable: true,
                width: 180,
            },
        };

        scope.activateDataGrid = function () {

            var ag_grid_div = document.querySelector('#locations-grid');    //get the container id...
            scope.datatab_ag_grid = new agGrid.Grid(ag_grid_div, scope.dataGridOptions); //bind the grid to it.
            scope.dataGridOptions.api.showLoadingOverlay(); //show loading...

            scope.project.$promise.then(function () {

                // Exclude (delete) the Habitat-related locations from the list
                var tmpProjLocations = [];
                for (var i = 0; i < scope.project.Locations.length; i++) {
                    if (scope.project.Locations[i].LocationTypeId !== LOCATION_TYPE_Hab)
                        tmpProjLocations.push(scope.project.Locations[i]);

                }
                scope.project.Locations = angular.copy(tmpProjLocations);

                scope.dataGridOptions.api.setRowData(scope.project.Locations);

                if ($rootScope.Profile.canEdit(scope.project)) {
                    scope.dataGridOptions.columnApi.setColumnVisible("EditLink", true);
                    scope.dataGridOptions.api.refreshHeader();
                }

                scope.displayLocationsOnMap();
                GridService.autosizeColumns(scope.dataGridOptions);
            });

        };

        scope.openEditModal = function (a_selection) {
            scope.SaveMessage = null;
            scope.row = angular.copy(a_selection);

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-location.html',
                controller: 'ModalEditLocationCtrl',
                scope: scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_location) { 
                //replace that location in the grid with the one we got back
                scope.project.Locations.forEach(function (existing_location, index) {
                    if (existing_location.Id == saved_location.Id) {
                        console.dir("found field to replace : " + existing_location.Id);
                        scope.project.Locations[index] = saved_location;
                    }
                });
                
                scope.dataGridOptions.api.setRowData(scope.project.Locations);
                scope.SaveMessage = "Success.";
                scope.showProjectLocations();
    
            });
        };


        scope.addLocation = function (a_selection) {
            scope.SaveMessage = null;
            scope.row = GridService.getNewRow(scope.dataGridOptions.columnDefs); //sets the DefaultValue, etc.
            scope.row.Status = 0;

            //console.dir(scope.row);

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-location.html',
                controller: 'ModalEditLocationCtrl',
                scope: scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_location) { 
                //add that location in the grid with the one we got back
                scope.project.Locations.push(saved_location);

                scope.dataGridOptions.api.setRowData(scope.project.Locations);
                scope.SaveMessage = "Success.";
                scope.showProjectLocations();
            });
        };


        scope.deleteLocations = function () { 

            var selected_locationids = [];
            var selected_locations = [];

            //make a list of ids we have selected           
            scope.dataGridOptions.selectedItems.forEach(function (location) {
                selected_locationids.push(location.Id);
                selected_locations.push(location);
            });

            var index = scope.project.Locations.length;

            while (index--) {
                if (selected_locationids.containsInt(scope.project.Locations[index].Id)) {
                    scope.project.Locations.splice(index, 1);
                }
            }

            //set locations grid to remaining locations
            scope.dataGridOptions.api.setRowData(scope.project.Locations);
            scope.showProjectLocations();

            //delete selected locations
            selected_locations.forEach(function (location) { 
                var delete_loc = CommonService.deleteLocation(location.Id);
                delete_loc.$promise.then(function () { 
                    console.log("deleted location: " + location.Id);
                }, function () { 
                    alert("Could not delete " + location.Label + " because activities exist. Remove them and then you can delete this location.");
                    scope.project.Locations.push(location);
                    scope.dataGridOptions.api.setRowData(scope.project.Locations);
                    scope.showProjectLocations();

                });
            });

        };

        scope.ShowMap = {
            Display: false,
            Message: "Show Map",
            MessageToOpen: "Show Map",
            MessageToClose: "Hide Map",
        };

        scope.toggleMap = function () {
            if (scope.ShowMap.Display) {
//                scope.removeFilter(); //also clears location
                scope.ShowMap.Display = false;
                scope.ShowMap.Message = scope.ShowMap.MessageToOpen;
            }
            else {
                scope.ShowMap.Display = true;
                scope.ShowMap.Message = scope.ShowMap.MessageToClose;

                //setTimeout(function () {
  //                  scope.map.reposition();
                  //  console.log("repositioned");
                //}, 400);

            }
        };

        scope.click = function () { } //don't do anything for clicking for now...

        //handle favorite toggle
        scope.isFavorite = $rootScope.Profile.isProjectFavorite(routeParams.Id);
        scope.toggleFavorite = function () { 
            UserService.toggleFavoriteProject(scope, $rootScope); 
        }

    }

];






