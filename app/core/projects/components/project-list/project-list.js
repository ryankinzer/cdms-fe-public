//controller for the main project list page.
var project_list = ['$scope', 'DatasetService', 'ProjectService','CommonService','$uibModal', '$window',
    function (scope, DatasetService, ProjectService, CommonService, $modal, $window){
  
    scope.projects = ProjectService.getProjects();

        scope.newProject = function () {

            scope.project = {};
            scope.project.MetaFields = CommonService.getMetadataProperties(METADATA_ENTITY_PROJECT);

            //if habitat project then load those fields, too...
            scope.project.MetaFields.$promise.then(function () {

                scope.project.MetaFields.forEach(function (field) { field.MetadataPropertyId = field.Id });

                var habfields = CommonService.getMetadataProperties(METADATA_ENTITY_HABITAT);
                habfields.$promise.then(function () {

                    habfields.forEach(function (habfield) {
                        habfield.MetadataPropertyId = habfield.Id
                        habfield.isHabitat = true;
                        scope.project.MetaFields.push(habfield);
                    });

                    scope.openNewProjectModal();

                });
            });
        }

        scope.openNewProjectModal = function(){
			console.log("Inside project-list.js, openAddProject...");

            templateUrl = 'app/core/projects/components/project-detail/templates/modal-edit-project.html';

//            if (typeof TRIBALCDMS_TEMPLATES !== 'undefined') {
//                templateUrl = 'app/core/projects/components/project-detail/' + TRIBALCDMS_TEMPLATES + '/modal-edit-project.html';
//            }

            var modalInstance = $modal.open({
              templateUrl: templateUrl,
              controller: 'ModalProjectEditorCtrl',
              scope: scope, //very important to pass the scope along...
              backdrop: "static",
              keyboard: false
            }).result.then(function (saved_project) { 
                scope.projects = ProjectService.getProjects();
                scope.projects.$promise.then(function () { 
                    scope.afterProjectsLoaded();
                });
            });
        };
		
        scope.projects.$promise.then(function () { 
            scope.afterProjectsLoaded();
        });

        scope.afterProjectsLoaded = function () { 
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
                        + '" href="'+serverUrl+'/index.html#!/projects/' + params.node.data.Id + '">'
                        + params.node.data.Name + '</a>' +
                        '</div>';
                };

                var agColumnDefs = [
                    { field: 'Program', headerName: 'Program', width: 220, sort: 'asc', menuTabs: ['filterMenuTab'], filter: 'text' },
                    { field: 'ProjectType', headerName: 'Type', width: 130, menuTabs: ['filterMenuTab'], filter: 'text'},
                    { field: 'Name', headerName: 'Project Name', cellRenderer: agCellRendererProjectName, width: 300, menuTabs: ['filterMenuTab'], filter: 'text'},
                ];

                scope.agGridOptions = {
                    animateRows: true,
                    //enableSorting: true,
                    //enableFilter: true,
                    //enableColResize: true,
                    showToolPanel: false,
                    columnDefs: agColumnDefs,
                    rowData: scope.projects,
                    debug: false,
                    onGridReady: function (params) {
                        params.api.sizeColumnsToFit();
                    },
                    defaultColDef: {
                        sortable: true,
                        resizable: true,
                    },
                };

                var ag_grid_div = document.querySelector('#project-list-grid');    //get the container id...
                scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.agGridOptions); //bind the grid to it.
                //scope.agGridOptions.api.showLoadingOverlay(); //show loading...

            } else { 
                scope.agGridOptions.api.setRowData(scope.projects);
            }
        }
  }
];


