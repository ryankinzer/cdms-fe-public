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

        scope.AuthorizedToViewProject = true;

        scope.project = ProjectService.getProject(routeParams.Id);
		scope.currentUserId = $rootScope.Profile.Id;
        
        scope.UserIsAdmin = false;
       // scope.UserIsOwner = false;
		scope.UserIsEditor = false;

	  //Tribal CDMS edit
		scope.UserIsOwner = function () {
			console.log("UserIsOwner called");
			if (scope.project.OwnerId == scope.currentUserId)
				return true;
		};
        
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
                backdrop  : 'static',
                windowClass: 'modal-medium',
                keyboard  : false
            }).result.then(function (saved_project) { 
                scope.project = saved_project;
                scope.afterProjectLoaded();
            });
        };
		
		scope.getEditors = function () {
            console.log("getEditors called");
            var result = "";
            scope.project.Editors.forEach(function (item) {
                result = result + item.Fullname + ', '
                console.dir(item.Fullname);
            });
            result = result.slice(0, -2);
            return result;
        };

        scope.afterProjectLoaded = function () { 
            //load the metafields for this project once it loads
            scope.project.MetaFields = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_PROJECT);

            //if habitat project then load those fields, too...
            scope.project.MetaFields.$promise.then(function () { 

                /* -- not adding in the habitat level metafields anymore -- */
                //var habfields = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITAT);
                //habfields.$promise.then(function () {

                //    habfields.forEach(function (habfield) {
                //        habfield.isHabitat = true;
                //        scope.project.MetaFields.push(habfield);
                //    });

                    //prep the values if it is a multiselect
                    scope.project.MetaFields.forEach(function (field) {
                        if (field.Values && (field.ControlType == "multiselect" || field.ControlType == "multiselect-checkbox")) {
                            field.Values = getParsedMetadataValues(field.Values);
                        }
                    });
                //});
                

                //console.dir(scope.project);
            });

            //Check our config to see if there is a role restriction for this project.
            if (scope.project.Config) {
                scope.project.Config = angular.fromJson(scope.project.Config);
                if (scope.project.Config.hasOwnProperty('RestrictRoles') && scope.project.Config.RestrictRoles != "") {
                    if (!$rootScope.Profile.hasRole(scope.project.Config.RestrictRoles)) {
                        scope.AuthorizedToViewProject = false;
                        console.log("User not authorized for this role: " + scope.project.Config.RestrictRoles);
                    }
                }
            } else {
                scope.project.Config = {};
            }

        }

        scope.getMetaField = function (id) { 

            var result = "";

            scope.project.MetaFields.forEach(function (field) { 
                if (field.MetadataPropertyId == id)
                    result = field;
            });

            return result;

        };
            

		scope.uploadFileType = "";
		scope.projectName = "";
		scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = "";
		scope.filesToUpload = {};
		//scope.AuthorizedToViewProject = true; //We have this up at line 15 already...
		
		// Get the project ID from the url.
		var theUrl = window.location.href;
		//console.log("theUrl = " + theUrl);
		var theLastSlashLoc = theUrl.lastIndexOf("/");
		scope.projectId = theUrl.substring(theLastSlashLoc + 1);
		console.log("scope.projectId = " + scope.projectId);

		
		scope.ShowMap = {
			Display: false,
			Message: "Show Map",
			MessageToOpen: "Show Map",
			MessageToClose: "Hide Map",
		};
		
		
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
              backdrop: "static",
              keyboard: false
            });
        };

        scope.openChooseSummaryImages = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-choosesummaryimages.html',
              controller: 'ModalChooseSummaryImagesCtrl',
              scope: scope, //very important to pass the scope along...
              backdrop: "static",
              keyboard: false
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

        //handle favorite toggle
        scope.isFavorite = $rootScope.Profile.isProjectFavorite(routeParams.Id);
        scope.toggleFavorite = function () { 
            UserService.toggleFavoriteProject(scope, $rootScope); 
        }


    }

];






