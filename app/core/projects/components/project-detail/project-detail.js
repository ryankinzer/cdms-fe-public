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
		scope.currentUserId = $rootScope.Profile.Id;
        scope.filteredUsers = false;

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
		console.log("theUrl = " + theUrl);
		var theLastSlashLoc = theUrl.lastIndexOf("/");
		scope.projectId = theUrl.substring(theLastSlashLoc + 1);
		console.log("scope.projectId = " + scope.projectId);

        
		scope.CellOptions = {}; //for metadata dropdown options
		scope.isFavorite = $rootScope.Profile.isProjectFavorite(routeParams.Id);

		scope.metadataList = {};
		scope.metadataPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID);
		scope.habitatPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_HABITATTYPEID);
        
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
        var project_watcher = scope.$watch('project', function () {

            if (typeof scope.project === 'undefined' || typeof scope.project.Id === 'undefined')
                return;

            project_watcher();

			console.log("Inside project-detail -- our project just loaded...");
			console.log("scope.project.Id = " + scope.project.Id);
			$rootScope.projectId = scope.project.Id;
				
			scope.editors = scope.project.Editors;
            scope.users = CommonService.getUsers();
            scope.project.MetadataValue = {};
                              
            //add in the metadata to our metadataList that came with this dataset
            addMetadataProperties(scope.project.Metadata, scope.metadataList, scope, CommonService);

            //get habitat (and possibly other?) metadata values for this project.  they don't come with project metadata as they are their own category.
            var habitatProjectMetadataPromise = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITATTYPEID);
            habitatProjectMetadataPromise.$promise.then(function(list){
                addMetadataProperties(list, scope.metadataList, scope, CommonService);
            });

            scope.mapHtml = $sce.trustAsHtml(scope.project.MetadataValue[25]);
            scope.imagesHtml = $sce.trustAsHtml(scope.project.MetadataValue[13]);

            //load the project's files
            scope.project.Files = ProjectService.getProjectFiles(scope.project.Id);

            //once they load... (the docs and gallery tabs listen for this and then handle their grids.)
            var file_watcher = scope.$watch('project.Files', function () {
                if (typeof scope.project.Files === 'undefined' || scope.project.Files.length === 0)
                    return;

                file_watcher();
                //console.log('-------------- project FILES are loaded >>>>>>>>>>>>>>>> ');

                //since we want a tab of images and a tab of other files, 
                // split them out into two arrays we will use to populate the two grids.
                scope.project.Images = [];
                scope.project.Docs = [];

                scope.project.Files.forEach(function (file, key) {
                    // If the user created a document and left the Title or Description blank, those fields were saved as "undefined" in the database.
                    // When we read the list of files back in, the "undefined" shows on the page, and the user would rather have a blank show instead.
                    file.Title = (!file.Title || file.Title === 'undefined' || typeof file.Title === 'undefined') ? "" : file.Title;
                    file.Description = (!file.Description || file.Description === 'undefined' || typeof file.Description === 'undefined') ? "" : file.Description;

                    //note: Subproject_CrppId indicates the file belongs to a subproject (not just crpp)
                    if (file.DatasetId === null && file.Subproject_CrppId === null)
                    {
                        if (file.FileType.Name === "Image") { //images go to 'Gallery' tab
                            scope.project.Images.push(file);
                        } else { //everything else goes to 'Documents' tab
                            scope.project.Docs.push(file);
                        }
                    }
                });
                console.log("OK! Done loading files... ");
                //console.dir(scope.project.Images);
                //console.dir(scope.project.Docs);

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
		

        //metadata -- we have a list of metadata properties that are configured for "project" entities.
        //  any metadata already associated with a project come in teh project's Metadata array, but ones that haven't
        //  been given a value yet on a specific project won't appear and need to be added in separately.


        scope.metadataPropertiesPromise.promise.then(function(list){
            addMetadataProperties(list, scope.metadataList, scope, CommonService);
        });

        scope.habitatPropertiesPromise.promise.then(function(list){
            addMetadataProperties(list, scope.metadataList, scope, CommonService);
        });


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
            console.log(" --- *** --- *** Reloading project... are you sure you want this?!!  *****************");
            ProjectService.clearProject();
            scope.project = ProjectService.getProject(routeParams.Id);
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
			//console.log("Inside controllers.js, refreshProjectLocations...");
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
	}
];




