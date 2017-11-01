//controller for the main project list page.



var project_list = ['$scope', 'DatasetService', '$modal',
  function(scope, DatasetService, $modal){
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

        var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
                               '<a title="{{row.getProperty(\'Description\')}}" href="#/projects/{{row.getProperty(\'Id\')}}">{{row.getProperty("Name")}}</a>' +
                               '</div>';
							  
		console.log("In controllers.js, projectsController, scope is next...");
		//console.dir(scope);

		// This just makes the "box" for the Projects list; it is empty.
        scope.gridOptionsFilter = {};
		scope.correspondenceEventsFilter = {};
        scope.gridOptions = {
            data: 'projects',
            columnDefs:
            [
                {field: 'Program', displayName:'Program', width:'230'},
                {field: 'ProjectType.Name',displayName:'Type', width: '100'},
                {field: 'Name', displayName: 'Project Name', cellTemplate: linkTemplate},
            ],
            showColumnMenu: true,
            filterOptions: scope.gridOptionsFilter,
            multiSelect: false,
        };

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

      //not sure this is actually used? kb 10/26/17

        scope.openAddProject = function(){
            var modalInstance = $modal.open({
              templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-project.html',
              controller: 'ModalProjectEditorCtrl',
              scope: scope, //very important to pass the scope along...

            });
        };


        scope.click = function(e){
			console.log("Inside controllers.js, scope.click...");
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
			console.log("Inside controllers.js, watch infoContent...");
			var matchingProjects = [];
			var html = "";
			
			if (!scope.infoContent)
				return;
			else if(scope.infoContent.length === 0)
				return;
			
			console.log("Inside controllers.js, watch infoContent...");
			console.log("scope.infoContent is next...");
			console.dir(scope.infoContent);
			console.log("scope.mapEvent.mapPoint is next...");
			console.dir(scope.mapEvent.mapPoint);
			
			scope.map.infoWindow.setContent(scope.infoContent);
			scope.map.infoWindow.show(scope.mapEvent.mapPoint);
		});

        scope.getInfoContent = function(graphic)
        {
			console.log("Inside controllers.js, getInfoContent...");
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
        scope.$watch('projects',function(){
            if(scope.projects)
            {
				//console.log("Inside controllers.js, watch projects...");
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
				console.log("typeof scope.locationObjectId = " + typeof scope.locationObjectId);
                console.log("In controllers, projects watcher, found project locations: " + scope.locationObjectIds);

				//console.log("scope.map is next...");
				//console.dir(scope.map);
				//console.log("scope.map.locationLayer is next...");
				//console.dir(scope.map.locationLayer);

				if(scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
					scope.map.locationLayer.showLocationsById(scope.locationObjectIds); //bump and reload the locations.
            }
        },true);


  }
];


