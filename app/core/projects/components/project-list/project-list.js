//controller for the main project list page.



var project_list = ['$scope', 'DatasetService', 'ProjectService','CommonService','$uibModal', '$window',
    function (scope, DatasetService, ProjectService, CommonService, $modal, $window){
  
    scope.projects = ProjectService.getProjects();

        scope.openAddProject = function(){
			console.log("Inside project-list.js, openAddProject...");
            var modalInstance = $modal.open({
              templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-project.html',
              controller: 'ModalProjectEditorCtrl',
              scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_project) { 
                scope.projects.push(saved_project);
                scope.agGridOptions.api.setRowData(scope.projects);
                scope.agGridOptions.api.redrawRows();
            });
        };
		
        scope.projects.$promise.then(function () { 
        
                //spin through and add a "Program" field to our project that we can display easily in the grid.
                angular.forEach(scope.projects, function(project, key){	
                    
                    if(project.SubProgram && project.SubProgram != "(None)")
                      project.Program += " > " + project.SubProgram;
                });

                if (scope.agGridOptions === undefined) {

                    //define the cell renderer (template) for our "Project Name" column.
                    var agCellRendererProjectName = function (params) {
                        return '<div>' +
                            '<a title="' + params.node.data.Description
                            + '" href="/index.html#!/projects/' + params.node.data.Id + '">'
                            + params.node.data.Name + '</a>' +
                            '</div>';
                    };

                    var agColumnDefs = [
                        { field: 'Program', headerName: 'Program', width: 220, sort: 'asc', menuTabs: ['filterMenuTab'] },
                        { field: 'ProjectType', headerName: 'Type', width: 130, menuTabs: ['filterMenuTab'] },
                        { field: 'Name', headerName: 'Project Name', cellRenderer: agCellRendererProjectName, width: 300, menuTabs: ['filterMenuTab'], filter: 'text'},
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

                    var ag_grid_div = document.querySelector('#project-list-grid');    //get the container id...
                    scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.agGridOptions); //bind the grid to it.
                    //scope.agGridOptions.api.showLoadingOverlay(); //show loading...

                } else { 
                    scope.agGridOptions.api.setRowData(scope.projects);
                }
        });
  }
];


