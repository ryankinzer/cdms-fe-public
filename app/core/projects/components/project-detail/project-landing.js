/*
*   This is the landing page for a project
*/

var project_landing = ['$scope', '$routeParams','SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, UserService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		//console.log("Inside controllers.js, projectDatasetsController...");
		//console.log("routeParams.Id = " + routeParams.Id);
		
        scope.OnTab = "Summary";

        scope.project = ProjectService.getProject(routeParams.Id);
		scope.currentUserId = $rootScope.Profile.Id;
        
        scope.UserIsAdmin = false;
        scope.UserIsOwner = false;
        scope.UserIsEditor = false;
        
        //scope.metadataList = {};
        scope.CellOptions = {}; //for metadata dropdown options

        
        scope.project.$promise.then(function () {
            scope.afterProjectLoaded();
        });

        scope.openProjectEditor = function () {
            scope.row = scope.project; //
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-project.html',
                controller: 'ModalProjectEditorCtrl',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_project) { 
                scope.project = saved_project;
                scope.afterProjectLoaded();
            });
        };

        scope.afterProjectLoaded = function () { 
            //load the metafields for this project once it loads
            scope.project.MetaFields = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_PROJECT);

            //if habitat project then load those fields, too...
            scope.project.MetaFields.$promise.then(function () { 

                var habfields = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITAT);
                habfields.$promise.then(function () {

                    habfields.forEach(function (habfield) {
                        habfield.isHabitat = true;
                        scope.project.MetaFields.push(habfield);
                    });

                    //prep the values if it is a multiselect
                    scope.project.MetaFields.forEach(function (field) {
                        if (field.Values && (field.ControlType == "multiselect" || field.ControlType == "multiselect-checkbox")) {
                            field.Values = getParsedMetadataValues(field.Values);
                        }
                    });
                });
                

                //console.dir(scope.project);
            });
        }


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

            UserService.saveUserPreference("Projects", $rootScope.Profile.favoriteProjects.join(), scope.results);

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






