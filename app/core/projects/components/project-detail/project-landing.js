/*
*   This is the landing page for a project
*/

var project_landing = ['$scope', '$routeParams','SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		//console.log("Inside controllers.js, projectDatasetsController...");
		//console.log("routeParams.Id = " + routeParams.Id);
		
        scope.OnTab = "Summary";

        scope.project = ProjectService.getProject(routeParams.Id);
		scope.currentUserId = $rootScope.Profile.Id;
        
        scope.UserIsAdmin = false;
        scope.UserIsOwner = false;
        scope.UserIsEditor = false;
        
        scope.metadataList = {};
        scope.CellOptions = {}; //for metadata dropdown options

        scope.status = {
            DoneLoadingProject: false,
            DoneLoadingMetadata: false,
        }; 

        //project metadata
        scope.metadataPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID); //load all the possible mdp 
        scope.metadataPropertiesPromise.promise.then(function (list) {
            //console.error("MDP now loaded -- adding the big list");
            addMetadataProperties(list, scope.metadataList, scope, CommonService); //add in all the mdp
            //console.error("Done setting up the full mdp list");
            scope.status.DoneLoadingMetadata = true;    
        });


        //habitat metadata
        scope.habitatPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_HABITATTYPEID); //gets all the possible properties
        scope.habitatPropertiesPromise.promise.then(function (hab_mdp_list) {
            //console.error("got 'em now add in the big list and fire off the request for the values.")
            addMetadataProperties(hab_mdp_list, scope.metadataList, scope, CommonService);

            //load the habitat metadata values once the project is loaded...
            var mdpproject_watcher = scope.$watch('status.DoneLoadingProject', function () {

                if (!scope.status.DoneLoadingProject)
                    return;

                mdpproject_watcher();

                var habitatProjectMetadataPromise = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITATTYPEID); //gets the values

                habitatProjectMetadataPromise.$promise.then(function (hab_proj_mdp_list) {
                    //console.error("ok, we have the values, adding them in (for habitat)");
                    addMetadataProperties(hab_proj_mdp_list, scope.metadataList, scope, CommonService);
                    //console.error("all done with habitat mdp");
                });
            });
        });
        

        scope.project.$promise.then(function () {

            console.log("Project is loaded.");

            //load all of the project's files
            scope.project.Files = ProjectService.getProjectFiles(scope.project.Id);


        });


		scope.uploadFileType = "";
		scope.projectName = "";
		scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = "";
		scope.filesToUpload = {};
		scope.AuthorizedToViewProject = true;
		
		// Get the project ID from the url.
		var theUrl = window.location.href;
		//console.log("theUrl = " + theUrl);
		var theLastSlashLoc = theUrl.lastIndexOf("/");
		scope.projectId = theUrl.substring(theLastSlashLoc + 1);
		console.log("scope.projectId = " + scope.projectId);

		scope.isFavorite = $rootScope.Profile.isProjectFavorite(routeParams.Id);


		scope.ShowMap = {
			Display: false,
			Message: "Show Map",
			MessageToOpen: "Show Map",
			MessageToClose: "Hide Map",
		};
		

		
        scope.toggleFavorite = function(){
            scope.isFavorite = !scope.isFavorite; //make the visible change instantly.

            scope.results = {};

            $rootScope.Profile.toggleProjectFavorite(scope.project);

            PreferencesService.saveUserPreference("Projects", $rootScope.Profile.favoriteProjects.join(), scope.results);

            var watcher = scope.$watch('results', function(){
                if(scope.results.done)
                {
                    //if something goes wrong, roll it back.
                    if(scope.results.failure)
                    {
                        scope.isFavorite = !scope.isFavorite;
                        $rootScope.Profile.toggleProjectFavorite(scope.project);
                    }
                    watcher();
                }
            },true);
        }
		
		scope.toggleMap = function(){
			if(scope.ShowMap.Display)
			{
				scope.removeFilter(); //also clears location
				scope.ShowMap.Display = false;
				scope.ShowMap.Message = scope.ShowMap.MessageToOpen;
			}
			else
			{
				scope.ShowMap.Display = true;
				scope.ShowMap.Message = scope.ShowMap.MessageToClose;

				setTimeout(function(){
					scope.map.reposition();
					console.log("repositioned");
				}, 400);

			}
		};
		
		
        scope.openChooseMapImage = function(){
            var modalInstance = $modal.open({
              templateUrl: 'app/core/projects/components/project-detail/templates/modal-choosemap.html',
              controller: 'ModalChooseMapCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

        scope.openChooseSummaryImages = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-choosesummaryimages.html',
              controller: 'ModalChooseSummaryImagesCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
        		
       
		 
        scope.syncToStreamnet = function(){
            $.ajax({
                url: serviceUrl + '/api/v1/streamnet/synctostreamnet',
                type : 'GET',
                // data : formData,
                // processData: false,  // tell jQuery not to process the data
                // contentType: false,  // tell jQuery not to set contentType
                success : function(data) {
                    // var output = eval("(" + data + ")");
                    alert(data.join('\n'));
                },
                error: function(jqXHR, error, errorThrown) {
                    if(jqXHR.status && jqXHR.status == 400) {
                        alert(jqXHR.responseText + "\n\n" + "Error running sync action!");
                    } else {
                        alert("Error running sync action!");
                    }
                }
            });

        };


    }

];






