﻿/*
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
		
		scope.lookupTables = CommonService.getProjectLookupTables(routeParams.Id);
        scope.project = ProjectService.getProject(routeParams.Id);

        scope.selectedLookup = null;

        scope.lookupTables.$promise.then(function () { 
            console.dir(scope.lookupTables);

            if (Object.keys(scope.lookupTables).length > 0) {
                scope.selectLookup(scope.lookupTables[0]);
            }

        });

        scope.selectLookup = function (lookup) { 
            scope.selectedLookup = lookup;
            scope.lookupItems = CommonService.getLookupItems(lookup);

            scope.dataGridOptions.columnDefs = GridService.getAgColumnDefs(scope.selectedLookup.Dataset).HeaderFields;
            scope.dataGridOptions.columnDefs.unshift({ field: 'EditLink', headerName: '', cellRenderer: EditLinkTemplate, width: 50, alwaysShowField: true, menuTabs: [], hide: true });

//            console.dir(scope.dataGridOptions.columnDefs);

            scope.lookupItems.$promise.then(function () {
                if (!scope.datatab_ag_grid)
                    scope.activateDataGrid();
                else {
                    scope.dataGridOptions.api.setRowData(scope.lookupItems);
                    scope.dataGridOptions.api.setColumnDefs(scope.dataGridOptions.columnDefs);  //redraws everything
                }

                //unhide the edit link column if they can edit.
                if ($rootScope.Profile.canEdit(scope.project)) {
                    scope.dataGridOptions.columnApi.setColumnVisible("EditLink", true);
                    scope.dataGridOptions.api.refreshHeader();
                }
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

        

/*
		//once the datasets load, make sure each is configured with our scope.
        scope.datasets.$promise.then(function () {
         	if ((scope.datasets) && (scope.datasets.length > 0)) {
				for (var i = 0; i < scope.datasets.length; i++)	{
					DatasetService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
				}
			} else {
				console.warn("This project has no datasets.");
            }
        });
  */

        

    }

];






