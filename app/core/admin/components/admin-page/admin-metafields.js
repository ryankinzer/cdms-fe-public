/*
*   This page loads the metafields (entities and properties). 
*/

var admin_metafields = ['$scope', '$routeParams','GridService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, GridService, ProjectService, DatasetService, CommonService, UserService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
        
        scope.entities = CommonService.getMetadataEntities();

        scope.entities.$promise.then(function () {
            if(!scope.selectedEntity) //only set if it isn't already
                scope.selectedEntity = scope.entities[0];

            scope.activateDataGrid();
        });

        scope.showEntityProperties = function (entity) {
            if (!entity)
                return;

            if (scope.selectedEntity && scope.selectedEntity.Id != entity.Id) {
                console.log("Showing entity properties -- ");
                console.dir(entity);
                scope.selectedEntity = entity;
                if (scope.dataGridOptions.api)
                    scope.dataGridOptions.api.setRowData(scope.selectedEntity.Properties);
            }
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

        scope.dataGridOptions = {
            //data: 'datasets',
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            columnDefs: [
                { field: 'EditLink', headerName: '', cellRenderer: EditLinkTemplate, width: 50, menuTabs: [], hide: true },
                { field: 'Name', headerName: 'Name', width: 180, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Description', headerName: 'Description', cellStyle: { 'white-space': 'normal' }, width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'DataType', headerName: 'DataType', width: 100, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'ControlType', headerName: 'Control Type', width: 100, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'PossibleValues', headerName: 'Possible Values', width: 350, menuTabs: ['filterMenuTab'], filter: 'text',
                    valueFormatter: function (params) {
                        return valueFormatterArrayToList(params.node.data.PossibleValues);
                    }
                },
            ],
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                scope.dataGridOptions.selectedItems = scope.dataGridOptions.api.getSelectedRows();
                scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            selectedItems: [],
            defaultColDef: {
                sortable: true,
                resizable: true,
            },
        };

        scope.activateDataGrid = function () {
            console.log("activating grid...");

            var ag_grid_div = document.querySelector('#properties-grid');    //get the container id...
            scope.datatab_ag_grid = new agGrid.Grid(ag_grid_div, scope.dataGridOptions); //bind the grid to it.
            scope.dataGridOptions.api.showLoadingOverlay(); //show loading...
            scope.dataGridOptions.api.setRowData(scope.selectedEntity.Properties);           

            if (scope.project) {
                scope.project.$promise.then(function () {
                    //unhide the edit link column if they are the owner or editor.
                    if ($rootScope.Profile.isProjectOwner(scope.project)) {
                        scope.dataGridOptions.columnApi.setColumnVisible("EditLink", true);
                        scope.dataGridOptions.api.refreshHeader();
                    }
                });
            } else if ($rootScope.Profile.isAdmin()) {
                    scope.dataGridOptions.columnApi.setColumnVisible("EditLink", true);
                    scope.dataGridOptions.api.refreshHeader();
            }

            


        };

        scope.openEditModal = function (a_selection) {
            scope.SaveMessage = null;
            scope.field_to_edit = angular.copy(a_selection);
            scope.field_to_edit.MetadataEntityId = scope.selectedEntity.Id;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-edit-metadataproperty.html',
                controller: 'ModalEditMetadataPropertyCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved) { 
                //replace that location in the grid with the one we got back
                var found = false;
                scope.selectedEntity.Properties.forEach(function (existing, index) {
                    if (existing.Id == saved.Id) {
                        console.dir("found field to replace : " + existing.Id);
                        scope.selectedEntity.Properties[index] = saved;
                        found = true;
                    }
                });
                
                if (!found)
                    scope.selectedEntity.Properties.push(saved);

                scope.dataGridOptions.api.setRowData(scope.selectedEntity.Properties);
                scope.SaveMessage = "Success.";
            });
        };
        

        scope.addProperty = function () { 
            scope.openEditModal({});
        }

        scope.deleteProperty = function () { 
            scope.dataGridOptions.selectedItems.forEach(function (property) { 
                var delete_prop = CommonService.deleteMetadataProperty(property);
                delete_prop.$promise.then(function () { 
                    scope.selectedEntity.Properties.forEach(function (existing, index) {
                        if (existing.Id == property.Id) {
                            console.dir("found field to remove : " + existing.Id);
                            scope.selectedEntity.Properties.splice(index);
                            scope.dataGridOptions.api.setRowData(scope.selectedEntity.Properties);
                        }
                    });
                }, function () { 
                    console.log("something went wrong");
                });
            });

        };


    }

];






