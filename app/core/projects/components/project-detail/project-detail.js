/*
*   This page loads the project details. It includes some tabs that are always populated and some tabs
*   that are conditionally shown and populated depending on the project type.
*
*/

var project_detail = ['$scope', '$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		//console.log("Inside controllers.js, projectDatasetsController...");
		//console.log("routeParams.Id = " + routeParams.Id);
		
		scope.activities = null;
		
		scope.datasets = ProjectService.getProjectDatasets(routeParams.Id);
        scope.project = ProjectService.getProject(routeParams.Id);
        scope.status = {
            DoneLoadingProject: false,
            DoneLoadingMetadata: false,
        }; 
		scope.currentUserId = $rootScope.Profile.Id;
        scope.filteredUsers = false;
        
        scope.metadataList = {};

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
        

        //conditional tabs on the project detail page
        scope.ShowInstruments = false; //water temp only
        scope.ShowFishermen = false;   //harvest (creel)
        scope.ShowSubproject = false;  //crpp correspondence
        scope.ShowHabitat = false;     //habitat


		scope.subprojectList = null;  // Set this to null first, so that we can monitor it later.
        scope.subprojectType = "";
        scope.viewSubproject = null;
        scope.SdeObjectId = 0;
        //scope.FileLocationSubprojectFundersWatchVariable = "";


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

        
		scope.CellOptions = {}; //for metadata dropdown options
		scope.isFavorite = $rootScope.Profile.isProjectFavorite(routeParams.Id);

        scope.users = [];
		scope.thisProjectsLocationObjects = [];
        

		//once the datasets load, make sure each is configured with our scope.
        var dataset_watcher = scope.$watch('datasets', function () {

            if(!scope.datasets.$resolved)
              return;
			
			console.log("Inside project-detail datasets. all done loading!");
            
			if ((scope.datasets) && (scope.datasets.length > 0))
			{
				for (var i = 0; i < scope.datasets.length; i++)
				{
					DatasetService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
                    //console.log("dataset CONFIGURED! TablePrefix: " + scope.datasets[i].Datastore.TablePrefix);

                    //this is used in some of the modals -- note that doing this will set the DatastoreTablePrefix to the LAST dataset parsed.
                    scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;
				}
			}
			else
			{
				console.log("This project has no datasets.");
            }

            dataset_watcher();

        },true);

		//once the project loads...
        var project_watcher = scope.$watch('project.Id', function () {

            if (typeof scope.project === 'undefined' || typeof scope.project.Id === 'undefined')
                return;

            console.log("Inside project-detail -- our project just loaded..." + scope.project.Id);
            //console.log(" -  - - - - - - >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> project load only on change");
			
			$rootScope.projectId = scope.project.Id;
				
			scope.editors = scope.project.Editors;
            scope.users = CommonService.getUsers();

            //add in the metadata to our metadataList that came with this dataset
            //console.error("setup the metadata for this project");

            scope.project.MetadataValue = {};

            if (scope.status.DoneLoadingMetadata) {
                addMetadataProperties(scope.project.Metadata, scope.metadataList, scope, CommonService); //match and add in the values
                scope.status.DoneLoadingProject = true;
                //console.error("loaded values direction for mpd -- we were alrady done...");
            } else {
                //only setup the mdp values when we're done loading the whole list...
                var mdpload_watcher = scope.$watch('status.DoneLoadingMetadata', function () {

                    if (!scope.status.DoneLoadingMetadata)
                        return;

                    //console.error("loading values for mdp now from watcher!");
                    addMetadataProperties(scope.project.Metadata, scope.metadataList, scope, CommonService); //match and add in the values
                    scope.status.DoneLoadingProject = true;

                    scope.mapHtml = $sce.trustAsHtml(scope.project.MetadataValue[25]);
                    scope.imagesHtml = $sce.trustAsHtml(scope.project.MetadataValue[13]);

                    mdpload_watcher();
                });
                
            }
            
            //load all of the project's files
            scope.project.Files = ProjectService.getProjectFiles(scope.project.Id);

            //since we want a tab of images and a tab of other files, 
            // sort them out into three arrays we will use to populate the tabs.
            scope.project.Images = [];
            scope.project.Docs = [];
            scope.project.SubprojectFiles = [];

            //once they load... (the docs and gallery tabs listen for this and then handle their grids.)
            var file_watcher = scope.$watch('project.Files', function () {
                if (typeof scope.project.Files === 'undefined' || scope.project.Files.length === 0)
                    return;

                file_watcher();
                console.log('-------------- project FILES are loaded >>>>>>>>>>>>>>>> ');
                //console.dir(scope.project.Files);
                
                scope.project.Files.forEach(function (file, key) {
                    // If the user created a document and left the Title or Description blank, those fields were saved as "undefined" in the database.
                    // When we read the list of files back in, the "undefined" shows on the page, and the user would rather have a blank show instead.
                    file.Title = (!file.Title || file.Title === 'undefined' || typeof file.Title === 'undefined') ? "" : file.Title;
                    file.Description = (!file.Description || file.Description === 'undefined' || typeof file.Description === 'undefined') ? "" : file.Description;

                    //here we'll sort the files into some arrays...
                    // scope.project.Docs = document tab
                    // scope.project.Images = images tab
                    // scope.project.SubprojectFiles = subproject files <-- TODO: someday refactor this away so that projects are just nested...

                    //note: Subproject_CrppId indicates the file belongs to a subproject (not just crpp)
                    if (file.DatasetId === null && file.Subproject_CrppId === null)
                    {
                        if (file.FileType.Name === "Image") { //images go to 'Gallery' tab
                            scope.project.Images.push(file);
                        } else { //everything else goes to 'Documents' tab
                            scope.project.Docs.push(file);
                        }
                    } else {
                        scope.project.SubprojectFiles.push(file);
                    }
                });
                console.log("OK! Done loading files for project");
                //console.dir(scope.project);

            }, true); //end after files load watcher.

        }, true); //end after project load watcher.

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
		
		scope.removeFilter = function()
		{
			//scope.activities = scope.allActivities;
			scope.clearLocation();
		};
		
		scope.clearLocation = function(){
			scope.map.infoWindow.hide();
			scope.selectedLocation = null;

			if(scope.newGraphic)
			{
				scope.map.graphics.remove(scope.newGraphic);
				scope.newGraphic = null;
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

        scope.openPrintWindow = function()
        {
			$window.open(PROJECT_REPORT_URL+scope.project.Id,'_blank');
        };
        

        scope.reloadProject = function () {

            console.error("reloading project");

            ProjectService.clearProject();
            CommonService.clearMetadataProperties();

            scope.project = {};
            scope.metadataList = {};
            
            scope.status.DoneLoadingMetadata = true;
            scope.status.DoneLoadingProject = false;

            //reload all project metadata
            scope.metadataPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID); //load all the possible mdp 

            scope.metadataPropertiesPromise.promise.then(function (list) {
                console.error("MDP now loaded -- adding the big list");
                addMetadataProperties(list, scope.metadataList, scope, CommonService); //add in all the mdp
                console.error("Done setting up the full mdp list");
                scope.status.DoneLoadingMetadata = true;

                console.log("-- NOW calling get project --");
                scope.project = ProjectService.getProject(routeParams.Id);

            });
            
        };


		scope.setSdeObjectId = function(sdeObjectId)
		{
			console.log("Inside contollers.js, scope.setSdeObjectId...");
			console.log("sdeObjectId = " + sdeObjectId);
			scope.SdeObjectId = sdeObjectId;
			console.log("scope.SdeObjectId");
		};
       
        //return an array from the eventfiles.
        scope.getFilesArrayAsList = function (theFiles) {
            if (theFiles === undefined || theFiles === null)
                return [];

            var files = angular.fromJson(theFiles);
            return (files === null || !Array.isArray(files)) ? [] : files; //if it isn't an array, make an empty array

        }

        //return an array of file links to cdmsShareUrl (defined in config) for subproject
        scope.getSubprojectFilesArrayAsLinks = function(a_projectId, a_subprojectId, a_files)
        {
            var files = scope.getFilesArrayAsList(a_files);
            var retval = [];

            angular.forEach(files, function (file, value) {
                retval.push("<a href='" + cdmsShareUrl + "P/" + a_projectId + "/S/" + a_subprojectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
            });

            return retval;
        }

		scope.refreshProjectLocations = function(){
			console.log("refreshProjectLocations...");
			ProjectService.clearProject();
			scope.project = null;
			scope.project = ProjectService.getProject(parseInt(scope.projectId));
		};

        scope.clearUsersWatch = scope.$watch('users', function(){
                if(scope.users)
                {
                    if(scope.users.length > 0)
                    {
                        scope.clearUsersWatch();
                        scope.filterUsers();
                    }
                }
                else
                    console.log("not yet.");

        },true); //note this TRUE here... this is required when watching an array directly.

		 

        //remove this editor from the users dropdown.
        scope.filterUsers = function()
        {
            console.log("filterusers starting with " + scope.users.length);

            var newusers = [];

            for (var a = 0; a < scope.users.length; a++) {
                var user = scope.users[a];
                var filterOut = false;

                for (var i = 0; i < scope.editors.length; i++) {
                    //is this user an editor already?  if so leave them off the list.
                    if(scope.editors[i].Id == user.Id)
                    {
                        filterOut = true;
                        break;
                    }
                }

                if(!filterOut)
                    newusers.push(user);


            };

            console.log("set a new group: " + newusers.length);
            scope.users = newusers.sort(orderUserByAlpha);

        }

        scope.select2Options = {
            allowClear:true
        };

        scope.selectedUser = null;

        scope.addEditor = function(){
            console.log("Add Editor.");
            for (var i = 0; i < scope.users.length; i++) {
                var user = scope.users[i];

                if(user.Id == scope.selectedUser)
                {
                    scope.editors.push(user);
                    scope.users.splice(i,1);
                    scope.selectedUser = null;
                    break;
                }
            };
        };

        scope.removeEditor = function(index)
        {
            scope.users.push(scope.editors.splice(index,1)[0]);
            scope.users.sort(orderUserByAlpha);
        };

        scope.saveEditors = function()
        {
            scope.saveResults = {};
            ProjectService.saveEditors(scope.currentUserId, scope.project.Id, scope.editors, scope.saveResults);
        };
		 	  
	
        scope.cancel = function()
        {
           // scope.users =
        };


        scope.openProjectEditor = function () {
            scope.row = scope.project; //
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-project.html',
                controller: 'ModalProjectEditorCtrl',
                scope: scope, //very important to pass the scope along...

            });
        };



        //both docs and gallery tabs use these:
        scope.openDeleteFileModal = function (a_selection, a_callback) {
            scope.row = a_selection;
            scope.callback = a_callback;

            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-delete-file.html',
                controller: 'ModalDeleteFileCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        //selection to edit, callback to fire on success.
        scope.openEditFileModal = function (a_selection, a_callback) {
            scope.row = a_selection;
            scope.callback = a_callback;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-file.html',
                controller: 'ModalEditFileCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        scope.openNewFileModal = function (a_callback) {
            scope.callback = a_callback;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-upload-files.html',
                controller: 'ModalNewFileCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        //removes the given file from project.Files (usually after deleting an item from docs/gallery already)
        scope.removeFromFiles = function (removed_item) {
            scope.project.Files.forEach(function (item, index) {
                //console.log("item id is " + item.Id + " looking for " + removed_item.File.Id);
                if (item.Id === removed_item.File.Id) {
                    //console.log("FOund an ID that matches for delete");
                    scope.project.Files.splice(index, 1);
                }
            });
        };

        scope.canEdit = function (project) {
            return $rootScope.Profile.canEdit(project);
        };
        
    }

];






