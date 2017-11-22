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
		console.log("Inside controllers.js, projectDatasetsController...");
		console.log("routeParams.Id = " + routeParams.Id);
		
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


        // -- things to move out to their own tab listener?

		scope.subprojectList = null;  // Set this to null first, so that we can monitor it later.
        scope.subprojectType = "";
        scope.viewSubproject = null;
        scope.SdeObjectId = 0;
        scope.FileLocationSubprojectFundersWatchVariable = "";


        // -- don't know if we need to move these
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

		var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
            				   '<a href="#/{{row.getProperty(\'activitiesRoute\')}}/{{row.getProperty(\'Id\')}}">{{row.getProperty("Name")}}</a>' +
            				   '</div>';

		var activityTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
								   'PLACEHOLDER' +
								   '</div>';

        //datasets tab grid
		scope.gridOptions = {
            	data: 'datasets',
            	columnDefs:
            		[
            			{field:'Name', displayName:'Dataset Name', cellTemplate: linkTemplate},
            			{field:'Description',displayName: 'Description'},
            			//{field:'CreateDate',displayName: 'Last Activity', cellTemplate: activityTemplate}
            		]
            };

        var fileLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img src="assets/images/file_image.png" width="100px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';

        var uploadedBy = '<div class="ngCellText" ng-class="col.colIndex()">' +
                               '{{row.getProperty("UploadDate")|date}} by {{row.getProperty("User.Fullname")}}' +
                               '</div>';

        scope.fileSelection = [];
        scope.FileFilterOptions = {};

        //docs tab grid
        scope.gridFiles = {
            data: 'project.Docs',
            columnDefs:
            [
                {field:'Name',displayName: 'File Name', cellTemplate: fileLinkTemplate, width: "18%"},
                {field: 'Title'},
                {field: 'Description'},
                {field: 'Uploaded', displayName: "Uploaded", cellTemplate: uploadedBy, width: "15%"},
                //{field: 'Size'},
            ],
            filterOptions: scope.FileFilterOptions,
            multiSelect: false,
            selectedItems: scope.fileSelection
        };

        scope.users = [];
		scope.thisProjectsLocationObjects = [];

        var galleryLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';
        scope.galleryFileSelection = [];
        scope.GalleryFilterOptions = {};

        //gallery tab grid
        scope.gridGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File', cellTemplate: galleryLinkTemplate, width: "18%"},
                {field: 'Title'},
                {field: 'Description'},
                {field: 'Uploaded', displayName: "Uploaded", cellTemplate: uploadedBy, width: "15%"},
                //{field: 'Size'},
            ],
            filterOptions: scope.GalleryFilterOptions,
            multiSelect: false,
            selectedItems: scope.galleryFileSelection

        };



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
					console.log("dataset CONFIGURED! TablePrefix: " + scope.datasets[i].Datastore.TablePrefix);
				}
			}
			else
			{
				console.log("This project has no datasets.");
            }

            dataset_watcher();

        },true);

        
		

		
		scope.$watch('project.Files.length', function(){
			
			console.log("Inside watch project.Files.length...");
			//console.log("project.Files is next...");
			//console.dir(scope.project.Files);
			
			//if ((typeof scope.project.Files === 'undefined') || (scope.project.Files === null))
			//{
			//	scope.project.Files = [];
			//}
			//else
			//{
				//if (scope.project.Files.length > 0)
				//{
					scope.project.Images = [];
					scope.project.Docs = [];
					
					var docIndex = 0;
					angular.forEach(scope.project.Files, function(file, key){
						//console.log("file.FileType.Name = " + file.FileType.Name + ", file.Subproject_CrppId = " + file.Subproject_CrppId);
						//if ((file.FileType.Name === "Image") && ((file.Subproject_CrppId === null) || (file.Subproject_CrppId === 1)))
						//if ((file.FileType.Name === "Image") && (file.Subproject_CrppId === null))
						if ((file.FileType.Name === "Image") && (file.DatasetId === null) && (file.Subproject_CrppId === null))
							scope.project.Images.push(file);
						else
						{
							//if ((file.Subproject_CrppId === null) || (file.Subproject_CrppId === 1))
							//if (file.Subproject_CrppId === null)
							if ((file.DatasetId === null) && (file.Subproject_CrppId === null))
							{
								scope.project.Docs.push(file);

								// If the user created a document and left the Title or Description blank, those fields were saved as "undefined" in the database.
								// When we read the list of files back in, the "undefined" shows on the page, and the user would rather have a blank show instead.
								if(!scope.project.Docs[docIndex].Title)
									scope.project.Docs[docIndex].Title = "";

								if(!scope.project.Docs[docIndex].Description)
									scope.project.Docs[docIndex].Description = "";

								docIndex++;
							}	     
						}
					});
				//}
				//else
				//{
				//	console.log("scope.project.Files empty; nothing to load...");
				//}
			//}
		});
		
        scope.$watch('project.Id', function(){
            if(scope.project && scope.project.Id)
            {
				console.log("Inside controllers, watch project.Id...");

				console.log("scope.project.Id = " + scope.project.Id);
				$rootScope.projectId = scope.project.Id;
				
				scope.project.Files = null;
				scope.project.Files = ProjectService.getProjectFiles(scope.project.Id);
				
                scope.editors = scope.project.Editors;
                scope.users = CommonService.getUsers();
				
                //split out the images and other files.
                scope.project.MetadataValue = {};
                scope.project.Images = [];
                scope.project.Docs = [];

                var docIndex = 0;
                angular.forEach(scope.project.Files, function(file, key){
					//console.log("file.FileType.Name = " + file.FileType.Name + ", file.Subproject_CrppId = " + file.Subproject_CrppId);
                    //if ((file.FileType.Name === "Image") && ((file.Subproject_CrppId === null) || (file.Subproject_CrppId === 1)))
                    //if ((file.FileType.Name === "Image") && (file.Subproject_CrppId === null))
                    if (file.FileType.Name === "Image")
                        scope.project.Images.push(file);
                    else
                    {
						//if ((file.Subproject_CrppId === null) || (file.Subproject_CrppId === 1))
						//if (file.Subproject_CrppId === null)
						if ((file.DatasetId === null) && (file.Subproject_CrppId === null))
						{
							scope.project.Docs.push(file);

							// If the user created a document and left the Title or Description blank, those fields were saved as "undefined" in the database.
							// When we read the list of files back in, the "undefined" shows on the page, and the user would rather have a blank show instead.
							if(!scope.project.Docs[docIndex].Title)
								scope.project.Docs[docIndex].Title = "";

							if(!scope.project.Docs[docIndex].Description)
								scope.project.Docs[docIndex].Description = "";

							docIndex++;
						}	     
                    }
                });

                
                //add in the metadata to our metadataList that came with this dataset
                addMetadataProperties(scope.project.Metadata, scope.metadataList, scope, CommonService);

                scope.mapHtml = $sce.trustAsHtml(scope.project.MetadataValue[25]);
                scope.imagesHtml = $sce.trustAsHtml(scope.project.MetadataValue[13]);


                //get habitat (and possibly other?) metadata values for this project.  they don't come with project metadata as they are their own category.
                var habitatProjectMetadataPromise = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITATTYPEID);
                habitatProjectMetadataPromise.$promise.then(function(list){
                    addMetadataProperties(list, scope.metadataList, scope, CommonService);
                });

            }

        });

        /* 
		scope.$watch('subproject.Id', function(){
			if ((typeof scope.subproject === 'undefined') || (scope.subproject === null))
			{
				console.log("watching...");
				return;
			}
			
			console.log("Inside controllers.js, watch subproject.Id...");
			console.log("scope.subproject.Id = " + scope.subproject.Id);
		});
        */

        /*
		
		scope.cleanGateKeeper = function(theText)
		{
			console.log("Inside scope.cleanGateKeeper...theText = " + theText);
			
			var intStringLocation = -1;
			
			// Check if the watch has completed already.  If so, clean out the text before appending; otherwise, the string gets really long.
			if (scope.FileLocationSubprojectFundersWatchVariable.indexOf(theText) > -1)
			{
				//scope.FileLocationSubprojectFundersWatchVariable.replace(/File/g, '');
				intStringLocation = scope.FileLocationSubprojectFundersWatchVariable.indexOf(theText);
				while (intStringLocation > -1)
				{
					//console.log("scope.FileLocationSubprojectFundersWatchVariable (during cleaning) = " + scope.FileLocationSubprojectFundersWatchVariable);
					scope.FileLocationSubprojectFundersWatchVariable = scope.FileLocationSubprojectFundersWatchVariable.replace(theText, "");
					intStringLocation = scope.FileLocationSubprojectFundersWatchVariable.indexOf(theText);
				}
			}
			//console.log("scope.FileLocationSubprojectFundersWatchVariable (after cleaning) = " + scope.FileLocationSubprojectFundersWatchVariable);
		};
		*/


		scope.ShowMap = {
			Display: false,
			Message: "Show Map",
			MessageToOpen: "Show Map",
			MessageToClose: "Hide Map",
		};
		
        scope.deleteGalleryFile = function()
        {
            scope.openDeleteFileModal(scope.galleryFileSelection[0]);
        };
		
        scope.editGalleryFile = function()
        {
            scope.openEditFileModal(scope.galleryFileSelection[0]);
        };

        scope.newGalleryFile = function()
        {
			scope.uploadFileType = "image";
            scope.openNewFileModal();
        };

        scope.deleteFile = function()
        {
            scope.openDeleteFileModal(scope.fileSelection[0]);
        };	
		
        scope.editFile = function()
        {
            scope.openEditFileModal(scope.fileSelection[0]);
        };

        scope.newFile = function()
        {
			scope.uploadFileType = "document";
            scope.openNewFileModal();
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

      

		

		


		
        scope.openDeleteFileModal = function(selection)
        {
            scope.row = selection;
            var modalInstance = $modal.open({
              templateUrl: 'app/core/projects/components/project-detail/templates/modal-delete-file.html',
              controller: 'ModalDeleteFileCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };	

        scope.openEditFileModal = function(selection)
        {
            scope.row = selection;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-file.html',
              controller: 'ModalEditFileCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.openNewFileModal = function(selection)
        {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-upload-files.html',
              controller: 'ModalNewFileCtrl',
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

        

        scope.reloadProject = function(){
            ProjectService.clearProject();
            scope.project = ProjectService.getProject(routeParams.Id);
        };

        
        
		
		
		
        scope.reloadThisProject = function()
        {
            console.log('0000000000000000000000000------------------------------------------');
            return;


			//scope.project = [];
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadThisProject...");
			console.log("scope.projectId = " + scope.projectId + ", scope.SdeObjectId = " + scope.SdeObjectId);
			
			scope.FileLocationSubprojectFundersWatchVariable = ""; // Clean GateKeeper variable.
			
			// Right now, we still now what the project and subproject type are, so reload the extra items for these specific projects.
			if (scope.subprojectType === "CRPP") // CRPP
				scope.subprojectList = SubprojectService.getSubprojects();
			else if (scope.subprojectType === "Habitat")
			{
				console.log("scope.projectId = " + scope.projectId);
				scope.project = ProjectService.getProject(scope.projectId);
				//scope.subprojectList = SubprojectService.getHabSubprojects();
				scope.subprojectList = SubprojectService.getProjectSubprojects(scope.projectId);
				scope.funderList = ProjectService.getProjectFunders(scope.projectId);
			}
			
			scope.project = ProjectService.getProject(parseInt(scope.projectId));
        };
		
        scope.reloadThisHabSubproject = function(subprojectId)
        {
            console.log('00022222222222220000000000000000000000------------------------------------------');
            return;
			//scope.project = [];
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadThisHabSubproject...");
			console.log("scope.projectId = " + scope.projectId + ", scope.SdeObjectId = " + scope.SdeObjectId + ", subprojectId = " + subprojectId);
			scope.project = SubprojectService.getHabSubproject(parseInt(subprojectId));		
        };
		
		scope.setSdeObjectId = function(sdeObjectId)
		{
			console.log("Inside contollers.js, scope.setSdeObjectId...");
			console.log("sdeObjectId = " + sdeObjectId);
			scope.SdeObjectId = sdeObjectId;
			console.log("scope.SdeObjectId");
		};
		 
		scope.reloadSubprojects = function()
        {
            console.log('000000044444444444444000000000000000000------------------------------------------');
            return;

			console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubprojects...");
			SubprojectService.clearSubprojects();

			if (scope.subprojectType === "CRPP") // CRPP
				scope.subprojectList = SubprojectService.getSubprojects();
			else if (scope.subprojectType === "Habitat")
			{
				console.log("scope.projectId = " + scope.projectId);
				scope.project = ProjectService.getProject(scope.projectId);
				//scope.subprojectList = SubprojectService.getHabSubprojects();
				scope.subprojectList = SubprojectService.getProjectSubprojects(scope.projectId);
				scope.funderList = ProjectService.getProjectFunders(scope.projectId);
			}
			
			var watcher = scope.$watch('subprojectList.length', function(){
				// We wait until subprojects gets loaded and then turn this watch off.
				if (scope.subprojectList === null)
					return;

                //else if (scope.subprojectList.length === 0) //watcher() below turns off the watch.
				//	return
				
				/*angular.forEach(scope.subprojectList, function(subproject){
					subproject.searchField = "";
					subproject.searchField = subproject.searchField.concat(subproject.ProjectName);
					subproject.searchField = subproject.searchField.concat(" ");
					subproject.searchField = subproject.searchField.concat(subproject.Agency);
					subproject.searchField = subproject.searchField.concat(" ");
					subproject.searchField = subproject.searchField.concat(subproject.ProjectProponent);
					subproject.searchField = subproject.searchField.concat(" ");
					subproject.searchField = subproject.searchField.concat(subproject.Closed);
					subproject.searchField = subproject.searchField.concat(" ");
					subproject.searchField = subproject.searchField.concat(subproject.ProjectLead);
				});
				*/
			
				scope.FileLocationSubprojectFundersWatchVariable += "Sdone";
				
				console.log("subprojects is loaded...");
                console.dir(scope.subprojectList);

				watcher();
			});
			
		};

        




        //return an array from the eventfiles.
        scope.getFilesArrayAsList = function (theFiles) {
            if (theFiles === undefined || theFiles === null)
                return [];

            var files = angular.fromJson(theFiles);
            return (files === null || !Array.isArray(files)) ? [] : files; //if it isn't an array, make an empty array

        }
		
		scope.refreshProjectLocations = function(){
			console.log("Inside controllers.js, refreshProjectLocations...");
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

	}
];




