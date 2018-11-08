/*
*   This lets you edit possiblevalues for select/multiselct fields in your dataset... 
*/

var project_lookups = ['$scope', '$routeParams','GridService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, GridService, ProjectService, DatasetService, CommonService, UserService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		//console.log("Inside controllers.js, projectDatasetsController...");
		//console.log("routeParams.Id = " + routeParams.Id);

        scope.OnTab = "Lookups";
        scope.AuthorizedToViewProject = true;
		
        scope.project = ProjectService.getProject(routeParams.Id);
        scope.selectedLookup = null;

        //to support metadata lookup editing
        scope.metadataentities = CommonService.getMetadataEntities();
        scope.selectedEntity = null;

        scope.project.$promise.then(function () { 
            try {
                scope.project.Config = angular.fromJson(scope.project.Config);

                if (scope.project.Config.hasOwnProperty('Lookups')) {
                    scope.lookupTables = scope.project.Config.Lookups;
                    if (scope.lookupTables.length > 0) {
                        scope.selectLookup(scope.lookupTables[0]);
                    }
                    console.dir(scope.lookupTables);
                }
            } catch (e) { 
                console.error("config could not be parsed for project: " + scope.project.Config);
                console.dir(e);
            }
            
        });

        scope.deselectAll = function () { 
            scope.dataGridOptions.api.setFilterModel(null)
            scope.dataGridOptions.api.onFilterChanged();
            scope.dataGridOptions.api.deselectAll();
        }

        scope.selectLookup = function (lookup) { 
            console.log("selected lookup ------");
            console.dir(lookup);

            scope.selectedLookup = lookup;

            if (lookup.hasOwnProperty('Type') && lookup.Type == "Metafields") {
                scope.metadataentities.forEach(function (entity) {
                    if (entity.Id == lookup.Id) {
                        scope.selectedEntity = entity;
                        console.log("selected entity = ");
                        console.dir(entity);

                    }
                });
            }

            //if a lookup doesn't have a dataset then don't try to load up the grid.
            if (lookup.DatasetId == null)
                return;

            scope.lookupItems = CommonService.getLookupItems(lookup);

            scope.selectedLookup.Dataset = DatasetService.getDataset(scope.selectedLookup.DatasetId);

            scope.selectedLookup.Dataset.$promise.then(function () { 
                scope.dataGridOptions.columnDefs = GridService.getAgColumnDefs(scope.selectedLookup.Dataset).HeaderFields;
                scope.dataGridOptions.columnDefs.unshift({ field: 'EditLink', headerName: '', cellRenderer: EditLinkTemplate, width: 50, alwaysShowField: true, menuTabs: [], hide: true });

                scope.lookupItems.$promise.then(function () {
                    if (!scope.datatab_ag_grid)
                        scope.activateDataGrid();
                    else {
                        scope.deselectAll();
                        scope.dataGridOptions.api.setRowData(scope.lookupItems);
                        scope.dataGridOptions.api.setColumnDefs(scope.dataGridOptions.columnDefs);  //redraws everything
                    }

                    //unhide the edit link column if they can edit.
                    if ($rootScope.Profile.canEdit(scope.project)) {
                        scope.dataGridOptions.columnApi.setColumnVisible("EditLink", true);
                        scope.dataGridOptions.api.refreshHeader();
                    }
                });


            });

            
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
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            columnDefs: [],
            rowSelection: 'multiple',
            onSelectionChanged: function (params) {
                scope.dataGridOptions.selectedItems = scope.dataGridOptions.api.getSelectedRows();
                scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                console.dir(params);
            },
            selectedItems: []
        };

        scope.activateDataGrid = function () {

            var ag_grid_div = document.querySelector('#lookups-grid');    //get the container id...
            scope.datatab_ag_grid = new agGrid.Grid(ag_grid_div, scope.dataGridOptions); //bind the grid to it.
            scope.dataGridOptions.api.showLoadingOverlay(); //show loading...

            scope.dataGridOptions.api.setRowData(scope.lookupItems);

        };

         scope.openEditModal = function (a_selection) {
            scope.SaveMessage = null;
            scope.row = angular.copy(a_selection);

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-lookup-item.html',
                controller: 'ModalEditLookupItemCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_item) { 
                //replace that item in the grid with the one we got back
                var found = false;
                
                scope.lookupItems.forEach(function (existing, index) {
                    if (existing.Id == saved_item.Id) {
                        console.dir("found field to replace : " + existing.Id);
                        scope.lookupItems[index] = saved_item;
                        found = true;
                    }
                });

                if (!found)
                    scope.lookupItems.push(saved_item);

                scope.deselectAll();
                scope.dataGridOptions.api.setRowData(scope.lookupItems);
                scope.SaveMessage = "Success.";
    
            });
        };

        scope.addItem = function (a_selection) {
            scope.SaveMessage = null;
            scope.row = { };

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-lookup-item.html',
                controller: 'ModalEditLookupItemCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_item) { 
                //add that item in the grid with the one we got back
                scope.lookupItems.push(saved_item);
                scope.deselectAll();
                scope.dataGridOptions.api.setRowData(scope.lookupItems);
                scope.SaveMessage = "Success.";
            });
        };


    }

];






