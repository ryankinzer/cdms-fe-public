//controller for the main project list page.



var project_list = ['$scope', 'DatasetService', 'ProjectService','CommonService','$modal', '$window',
    function (scope, DatasetService, ProjectService, CommonService, $modal, $window){
    scope.projects = ProjectService.getProjects();

    scope.CellOptions = {}; //for metadata dropdown options
    scope.metadataList = {};
    scope.metadataPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID);
    scope.habitatPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_HABITATTYPEID);

    scope.metadataPropertiesPromise.promise.then(function(list){
        addMetadataProperties(list, scope.metadataList, scope, CommonService);
    });

    scope.habitatPropertiesPromise.promise.then(function(list){
        addMetadataProperties(list, scope.metadataList, scope, CommonService);
    });

      
        scope.locationObjectArray = [];
        scope.locationObjectIdArray = [];
        scope.locationObjectIds = "";

        scope.reloadProject = function()
        {
            scope.projects = ProjectService.getProjects();
        };
		
		//scope.reloadSubprojects = function()
		//{
		//	scope.subprojects = SubprojectService.getSubprojects();
		//};

        scope.openAddProject = function(){
            console.log("Inside project-list.js, openAddProject...");

            templateUrl = 'app/core/projects/components/project-detail/templates/modal-edit-project.html';

            if (typeof TRIBALCDMS_TEMPLATES !== 'undefined') {
                templateUrl = 'app/core/projects/components/project-detail/' + TRIBALCDMS_TEMPLATES + '/modal-edit-project.html';
            }

            var modalInstance = $modal.open({
              templateUrl: templateUrl,
              controller: 'ModalProjectEditorCtrl',
              scope: scope, //very important to pass the scope along...

            });
        };

        scope.resetProject = function (project) {
            ProjectService.clearProject();
            $window.location.reload();
        };

        scope.clearLocationSelection = function () {
            scope.selectedLocation = null;
            scope.projects = scope.allProjects;
            scope.map.infoWindow.hide();
            scope.agGridOptions.api.setRowData(scope.projects);
            scope.map.locationLayer.showLocationsById(scope.locationObjectIds); //bump and reload the locations.
        };

        scope.click = function(e){
			console.log("Inside project-list.js, scope.click...");
			// If the user has already clicked on another point, the projects list has been filtered.
			// We need to set the projects list back to the full list.
			scope.projects = scope.allProjects;
			try{

				if(!scope.map.graphics.infoTemplate)
				{
					scope.map.graphics.infoTemplate = scope.template;
					console.log("graphics layer infotemplate defined.");
				}

				scope.map.infoWindow.resize(250, 300);

				//show the infowindow
				if(e.graphic)
				{
					// These run in the watch 'infoContent'
					//scope.map.infoWindow.setContent(scope.getInfoContent(e.graphic));
					//scope.map.infoWindow.show(e.mapPoint);
					
					console.log("e.graphic is next...");
					console.dir(e.graphic);
					scope.getInfoContent(e.graphic); // We need to wait for this to complete...
					scope.mapEvent = 'undefined';
					scope.mapEvent = e;	
                }

			}catch(e)
			{
				console.dir(e);
			}
        };
		
		scope.$watch('infoContent', function()
		{
			console.log("Inside project-list.js, watch infoContent...");
			var matchingProjects = [];
			var html = "";
			
			if (!scope.infoContent)
				return;
			else if(scope.infoContent.length === 0)
				return;
			
			console.log("Inside project-list.js, watch infoContent...");
			console.log("scope.infoContent is next...");
			console.dir(scope.infoContent);
			console.log("scope.mapEvent.mapPoint is next...");
			console.dir(scope.mapEvent.mapPoint);
			
			scope.map.infoWindow.setContent(scope.infoContent);
			scope.map.infoWindow.show(scope.mapEvent.mapPoint);
		});

        scope.getInfoContent = function(graphic)
        {
			console.log("Inside project-list.js, getInfoContent...");
			console.log("graphic is next...");
			console.dir(graphic);
			var matchingProjects = [];
			var html = "";

			//console.log("scope is next...");
			//console.dir(scope);
			console.log("scope.projects is next...");
			console.dir(scope.projects);

			// Filter the projects, based upon the location that the user clicked.
			var filterProjects = [];
			
			//spin through projects and find the ones with this objectid (at this location)
			angular.forEach(scope.projects, function(project){
				var proj_loc = getByField(project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId");
				//console.log("proj_loc is next...");
				//console.dir(proj_loc);
				
				if(proj_loc && proj_loc.SdeObjectId === graphic.attributes.OBJECTID){
					matchingProjects.push(project);
					
					filterProjects.push(project);
				}
			});
			scope.projects = angular.copy(filterProjects);
            scope.selectedLocation = graphic.attributes.OBJECTID;
            scope.agGridOptions.api.setRowData(scope.projects);
            scope.map.locationLayer.showLocationsById(scope.locationObjectIds); //bump and reload the locations.
			
			console.log("matchingProjects is next...");
			console.dir(matchingProjects);

			if(matchingProjects.length === 1)
			{
				scope.map.infoWindow.setTitle("Project at location");
				html += matchingProjects[0].Name;
				html += "<br/><div class='right'><a href='#/projects/"+matchingProjects[0].Id+"'>View</a></div>"
			}
			else if (matchingProjects.length > 1)
			{
				scope.map.infoWindow.setTitle("Projects at location");
				html += "<ul>";
				angular.forEach(matchingProjects, function(p){
					html += "<li><a href='#/projects/"+p.Id+"'>"+ p.Name + "</a></li>";
				});
				html += "</ul>";
			}
			else
			{
				scope.map.infoWindow.setTitle("No project found");
				html += "Not found: " + graphic.attributes.OBJECTID;
			}
			console.log("html = " + html);
			scope.infoContent = html;
			//return html;
        };

		// Note:  This watch is for the main Projects page.
        var project_watcher = scope.$watch('projects',function(){
            if(scope.projects)
            {
                //console.log("Inside project-list.js, watch projects...");
				////console.log("scope is next...");
				////console.dir(scope);
				
				//console.log("scope.projects is next...");
				//console.dir(scope.projects);
				
				if (!scope.allProjects)
					scope.allProjects = scope.projects;

                //spin through and add a "Program" field to our project that we can display easily in the grid.
                //angular.forEach(scope.projects, function(project, key){
                angular.forEach(scope.allProjects, function(project, key){	
                    var program = getByField(project.Metadata,'23','MetadataPropertyId');
                    var subprogram = getByField(project.Metadata,'24','MetadataPropertyId');

                    if(program) project.Program = program.Values;

                    if(subprogram && subprogram.Values != "(None)")
                      project.Program += " > " + subprogram.Values;

                    var primary_location = getByField(project.Locations,3,"LocationTypeId");
                    if(primary_location)
                      scope.locationObjectArray.push(primary_location);
                });

                angular.forEach(scope.locationObjectArray, function(item, key){
                    scope.locationObjectIdArray.push(item.SdeObjectId);
                });
				//console.log("scope.locationObjectIdArray is next...");
				//console.dir(scope.locationObjectIdArray);

                scope.locationObjectIds = scope.locationObjectIdArray.join();
				//console.log("typeof scope.locationObjectId = " + typeof scope.locationObjectId);
                console.log("In project-list.js, projects watcher, found project locations: " + scope.locationObjectIds);

				//console.log("scope.map is next...");
				//console.dir(scope.map);
				//console.log("scope.map.locationLayer is next...");
				//console.dir(scope.map.locationLayer);

				if(scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                    scope.map.locationLayer.showLocationsById(scope.locationObjectIds); //bump and reload the locations.

                if (scope.agGridOptions === undefined) {
					console.log("Inside project-list.js...");
                    console.log(" ----------- ok we are defining our grid...");

                    //define the cell renderer (template) for our "Project Name" column.
                    var agCellRendererProjectName = function (params) {
                        //console.dir(params.node.data);
                        return '<div>' +
                            '<a title="' + params.node.data.Description
                            + '" href="#/projects/' + params.node.data.Id + '">'
                            + params.node.data.Name + '</a>' +
                            '</div>';
                    };

                    var agColumnDefs = [
                        { field: 'Program', headerName: 'Program', width: 220, sort: 'asc', menuTabs: ['filterMenuTab'] },
                        { field: 'ProjectType.Name', headerName: 'Type', width: 130, menuTabs: ['filterMenuTab'] },
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
                        debug: true,
                        onGridReady: function (params) {
                            params.api.sizeColumnsToFit();
                        }
                    };

                    console.log("Inside project-list.js, number of projects: " + scope.projects.length);

                    console.log("Inside project-list.js, starting ag-grid");
                    var ag_grid_div = document.querySelector('#project-list-grid');    //get the container id...
                    scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.agGridOptions); //bind the grid to it.

                    scope.agGridOptions.api.showLoadingOverlay(); //show loading...


                } else { 
                    //we didn't need to redefine but do need to redraw
					console.log("Inside project-list.js...")
                    console.log("----- ok we have projects and are defined -- setting new rowdata  ----");

                    console.log("setting number of projects: " + scope.projects.length);
                    scope.agGridOptions.api.setRowData(scope.projects);
                    //scope.agGridOptions.api.autoSizeColumns()
                    
                    console.log('done');
                    
                }

                if (scope.projects.length > 0)
                    project_watcher();
            }
        },true);
  }
];


