

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
		scope.allInstruments = ProjectService.getAllInstruments();
	
		scope.fishermanList = null;
		//scope.fishermenList = ProjectService.getFishermen();
		scope.subprojectList = null;  // Set this to null first, so that we can monitor it later.
		//scope.subprojectList = SubprojectService.getSubprojects();
		scope.uploadFileType = "";
		scope.projectName = "";
		scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = "";
		scope.filesToUpload = {};
		scope.AuthorizedToViewProject = true;

		scope.subprojectType = "";
		scope.ShowInstruments = false;
		scope.ShowFishermen = false;
		scope.ShowSubproject = false;
		scope.ShowHabitat = false;
		scope.viewSubproject = null;
		scope.SdeObjectId = 0;
		scope.FileLocationSubprojectFundersWatchVariable = "";
        
		// Get the project ID from the url.
		var theUrl = window.location.href;
		console.log("theUrl = " + theUrl);
		var theLastSlashLoc = theUrl.lastIndexOf("/");
		scope.projectId = theUrl.substring(theLastSlashLoc + 1);
		console.log("scope.projectId = " + scope.projectId);


		// On the CorrespondenceEvents html page, the app was getting confused with serviceUrl somehow (only gave the domain name...).
		// When I manually set here like this, and use theServiceUrl instead, the links worked properly.
		//console.log("serviceUrl = " + serviceUrl);
		//scope.theServiceUrl = serviceUrl;
		
		// Get the fishermen associated to the project.
		//scope.theFishermen = ProjectService.getProjectFishermen(scope.projectId);
		scope.theFishermen = null;
	
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



        //returns null if none found...
        scope.getSubprojectById = function (subprojectList_in, id_in) {
            
            if (subprojectList_in == null || id_in == null)
                return null;

            var result = null;

            subprojectList_in.forEach(function (item) {
                if (item.Id === id_in) {
                    result = item; //can't just return here -- see Array.foreach docs
                }
            });

            return result;
        };

		scope.$watch('fishermenList', function(){
			console.log("Inside watch, fishermenList");
			//if (typeof scope.fishermenList.$resolved === 'undefined')
			if (!scope.fishermenList)
			{
				console.log("scope.fishermenList has not loaded.");
				return;
			}
			else if (scope.fishermenList.length === 0)
			{
				console.log("No fishermen found yet...");
				return;
			}
			
			console.log("scope.fishermenList is next..");
			console.dir(scope.fishermenList);		
		
			// If we switch the parameters for the makeObjects, like this makeObjects(scope.fishermenList, 'FullName', 'Id'), it will put them in alpha order by name.
			// However, we must test this first, to verify that it does not mess anything up. ~GC tested the idea; it needed more work.  It does not work in it simplicity here.
			scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects(scope.fishermenList, 'Id','FullName');
			
			// Debug output ... wanted to verify the contents of scope.fishermenOptions
			//angular.forEach(scope.fishermenOptions, function(fisherman){
			//	console.dir(fisherman);
			//});
			
			console.log("scope.fishermenOptions is next...");
			console.dir(scope.fishermenOptions);
		});	
		
        scope.$watch('datasets', function () {

            console.log("---------- our datasets");
            console.dir(scope.datasets);

			//console.log("scope.datasets in datasets watch is next...");
            ////console.dir(scope);

            if(!scope.datasets.$resolved)
              return;
			
			console.log("Inside watch datasets...");
            console.log("OK.  The datasets are loaded...");

            //need to bump this since we are looking at a LIST of datasets...
            //angular.forEach(scope.datasets, function(dataset){
			//});
			if ((scope.datasets) && (scope.datasets.length > 0))
			{
				// Notes are in order...
				// controllers.js works mostly at the Project-level.  One project can have mulitiple key datasets (Habitat, WaterTemp, etc.).
				// The only things that would be uploading/editing/deleting from this level, though, would be project-level, or subproject-level (Habitat or CRPP).
				// Project-level documents/images do not require scope.DatastoreTablePrefix; only subproject-level do.
				// Therefore, we only need to check the datasets for those (Habitat or CRPP), and it would be one or the other, but never both.
				// If the user picks a WaterTemp dataset, under a Habitat project, the dataset-level controllers will set the DatastoreTablePrefix accordingly.
				//scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[0].Datastore.TablePrefix;
				//console.log("scope.DatastoreTablePrefix (in datasets watcher) = " + scope.DatastoreTablePrefix);
				
				for (var i = 0; i < scope.datasets.length; i++)
				{
					//DatasetService.configureDataset(dataset);
					//DatasetService.configureDataset(dataset, scope);  // We must pass the scope along on this call.
					DatasetService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
					console.log("Found dataset for..." + scope.datasets[i].Datastore.TablePrefix);
					
					if (scope.datasets[i].Datastore.TablePrefix === "WaterTemp")
					{
						console.log("Adding instruments to tab bar...");
						scope.ShowInstruments = true;
						// scope.project.Instruments gets pulled in automatically with the project.
					}
					else if (scope.datasets[i].Datastore.TablePrefix === "CreelSurvey")
					{
						console.log("Adding Fishermen to tab bar...");
						scope.ShowFishermen = true;
						// Note:  Fishermen follows the logic/flow of instruments.
						// Example:  There are more instruments than what are assigned to just one project.
						// Therefore, we allowed that more fishermen could exist, besides what is in only the Harvest project -- just following the logic.
						scope.fishermenList = ProjectService.getFishermen(); // All fishermen, but only CreelSurvey has fishermen.//
						scope.theFishermen = ProjectService.getProjectFishermen(scope.datasets[i].ProjectId);
						// Note:  If we are on Harvest, it has only one dataset.
						scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;
					}
				}
				//console.log("scope.DatastoreTablePrefix = " + scope.DatastoreTablePrefix);
			}
			else
			{
				console.log("This project has no datasets yet.");
			}
        },true);

		//********** These 4 watches work together Start ******		
		/*scope.$watch('subprojectList.length', function(){
			// We wait until subprojects gets loaded and then turn this watch off.
			if (scope.subprojectList.length === 0)
				return;
			
			console.log("Inside subprojectList.length' watch...");
			
			angular.forEach(scope.subprojectList, function(subproject){
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
			
			console.log("subprojects is loaded...");
			console.dir(scope.subprojectList);
			//watcher();
		});
		*/

		scope.$watch('subprojectFileList.length', function(){
			if ($rootScope.featureImagePresent)
			{
				if ((typeof scope.subprojectFileList === 'undefined') || (typeof scope.subprojectFileList.length === 'undefined') || (scope.subprojectFileList.length === null))
					return;
				else if (scope.subprojectFileList.length < 0)
					return;
				else
				{
					console.log("scope.subprojectFileList is next...");
					console.dir(scope.subprojectFileList);
					
					// Check if this watch has completed already.  If so, clean out the text File before appending; otherwise, the string gets really long.
					//if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("File") > -1)
					//{
						//scope.FileLocationSubprojectFundersWatchVariable.replace(/File/g, '');
					//}
					scope.cleanGateKeeper("File");
					scope.FileLocationSubprojectFundersWatchVariable += "File";
				}
			}
			else
			{
				scope.cleanGateKeeper("File");
				scope.FileLocationSubprojectFundersWatchVariable += "File";
			}
		});
		
		scope.$watch('project.Locations.length', function(){
			//if ((typeof scope.project.Locations === 'undefined') || (typeof scope.project.Locations.length === 'undefined') || (scope.project.Locations.length === null))
			if (scope.project && ((typeof scope.project.Locations === 'undefined') || (typeof scope.project.Locations.length === 'undefined') || (scope.project.Locations.length === null)))
				return;
			else if (scope.project.Locations.length < 0)
				return;
			else
			{
				//console.log("scope.project.Locations is next...");
				//console.dir(scope.project.Locations);
				
				// Check if this watch has completed already.  If so, clean out the text Loc before appending; otherwise, the string gets really long.
				//if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Loc") > -1)
				//{
					//scope.FileLocationSubprojectFundersWatchVariable.replace(/Loc/g, '');
				//}
				scope.cleanGateKeeper("Loc");
				scope.FileLocationSubprojectFundersWatchVariable += "Loc";
			}
			
		});
		
		scope.$watch('funderList.length', function(){
			if ($rootScope.fundersPresent)
			{
				if ((typeof scope.funderList === 'undefined') || (typeof scope.funderList.length === 'undefined') || (scope.funderList.length === null))
					return;
				else if (scope.funderList.length < 0)
					return;
				else
				{
					//console.log("scope.funderList is next...");
					//console.dir(scope.funderList);
					
					// Check if this watch has completed already.  If so, clean out the text Fund before appending; otherwise, the string gets really long.
					//if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Fund") > -1)
					//{
						//scope.FileLocationSubprojectFundersWatchVariable.replace(/Fund/g, '');
					//}
					scope.cleanGateKeeper("Fund");
					scope.FileLocationSubprojectFundersWatchVariable += "Fund";
				}
			}
			else
			{
				scope.cleanGateKeeper("Fund");
				scope.FileLocationSubprojectFundersWatchVariable += "Fund";
			}
		});
		
		scope.$watch('collaboratorList.length', function(){
			if ($rootScope.collaboratorPresent)
			{
				if ((typeof scope.collaboratorList === 'undefined') || (typeof scope.collaboratorList.length === 'undefined') || (scope.collaboratorList.length === null))
					return;
				else if (scope.collaboratorList.length < 0)
					return;
				else
				{
					//console.log("scope.collaboratorList is next...");
					//console.dir(scope.collaboratorList);
					
					// Check if this watch has completed already.  If so, clean out the text Coll before appending; otherwise, the string gets really long.
					//if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Coll") > -1)
					//{
						//scope.FileLocationSubprojectFundersWatchVariable.replace(/Coll/g, '');
					//}
					scope.cleanGateKeeper("Coll");
					scope.FileLocationSubprojectFundersWatchVariable += "Coll";
				}
			}
			else
			{
				scope.cleanGateKeeper("Coll");
				scope.FileLocationSubprojectFundersWatchVariable += "Coll";
			}
		});
		
		scope.$watch('FileLocationSubprojectFundersWatchVariable', function(){
			console.log("Inside watch FileLocationSubprojectFundersWatchVariable, scope.FileLocationSubprojectFundersWatchVariable = " + scope.FileLocationSubprojectFundersWatchVariable);
			//console.dir(scope);

			if ((scope.FileLocationSubprojectFundersWatchVariable.indexOf("Sdone") > -1) &&
				(scope.FileLocationSubprojectFundersWatchVariable.indexOf("Loc") > -1))
			{
				scope.matchLocationsToSubprojects();

				//if ((scope.featureImagePresent) && (scope.FileLocationSubprojectFundersWatchVariable.indexOf("File") > -1))
				if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("File") > -1)
				{
					scope.matchFilesToSubproject();
				}

				//if ((scope.fundersPresent) && (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Fund") > -1))
				if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Fund") > -1)
				{
					scope.matchFundersToSubproject();
				}
				
				//if ((scope.collaboratorPresent) && (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Coll") > -1))
				if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Coll") > -1)
				{
					scope.matchCollaboratorToSubproject();
				}
			}
			else
				return;
		});
		//********** These 4 watches work together End ******
		
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
				//**************************************************//
				// This is the better way to determine what to show; however, it wasn't getting set in time.  Need a better way to do this, rather than using scope.project.Id below.
				/*if (scope.DatastoreTablePrefix === "CreelSurvey")
					scope.ShowFishermen = true;
				else if (scope.DatastoreTablePrefix === "CrppDocuments")
					scope.ShowCorrespondence = true;
				*/
				console.log("scope.project.Id = " + scope.project.Id);
				$rootScope.projectId = scope.project.Id;
				
				scope.project.Files = null;
				scope.project.Files = ProjectService.getProjectFiles(scope.project.Id);
				
				/*************************************************************/				
				// Need this section for the subprojects in Habitat and CRPP to work properly.
                scope.subprojectType = $rootScope.subprojectType = ProjectService.getProjectType(scope.project.Id);
				//$rootScope.subprojectType = scope.subprojectType = ProjectService.getProjectType(scope.project.Id);
				console.log("scope.subprojectType = " + scope.subprojectType);
				SubprojectService.setServiceSubprojectType(scope.subprojectType);
				/*************************************************************/
				
                scope.editors = scope.project.Editors;
                scope.users = CommonService.getUsers();
				
				//var theFishermen = ProjectService.getProjectFishermen(scope.project.Id);

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

                //reload if it is already selected -- this is what allows you to see the new accuracycheck/characteristic immediately after it is added
                if(scope.viewInstrument)
                    scope.viewInstrument = getMatchingByField(scope.project.Instruments, scope.viewInstrument.Id, 'Id')[0];

                if ((typeof scope.viewFisherman !== 'undefined') && (scope.viewFisherman !== null))
                {
                    scope.viewFisherman = getMatchingByField(scope.project.Fishermen, scope.viewFisherman.Id, 'Id')[0];
					// The DateAdded is in UTC format and we need to display only YYYY-MM-DD format.
					// The value is a string, and JavaScript Date
					console.log("scope.viewFisherman is next...");
					console.dir(scope.viewFisherman);
					
					// If we just deleted a fisherman from the project, scope.viewFisherman will be null or undefined now, after the getMatchingByField function call above.
					// So we don't want to try accessing scope.viewFisherman.DateAdded at this time.
					if ((typeof scope.viewFisherman !== 'undefined') && (scope.viewFisherman !== null))
					{
						var strDate = scope.viewFisherman.DateAdded;
						scope.viewFisherman.DateAdded = ServiceUtilities.extractDateFromString(strDate);
						
						scope.viewFisherman.Status = ConvertStatus.convertStatus(scope.viewFisherman.StatusId);
						console.log("scope.viewFisherman.Status = " + scope.viewFisherman.Status);
						
						scope.viewFisherman.OkToCall = ConvertStatus.convertOkToCall(scope.viewFisherman.OkToCallId);
						console.log("scope.viewFisherman.OkToCall = " + scope.viewFisherman.OkToCall);						
					}
                }
				
                //add in the metadata to our metadataList that came with this dataset
                addMetadataProperties(scope.project.Metadata, scope.metadataList, scope, CommonService);

                scope.mapHtml = $sce.trustAsHtml(scope.project.MetadataValue[25]);
                scope.imagesHtml = $sce.trustAsHtml(scope.project.MetadataValue[13]);


                //get habitat (and possibly other?) metadata values for this project.  they don't come with project metadata as they are their own category.
                var habitatProjectMetadataPromise = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITATTYPEID);
                habitatProjectMetadataPromise.$promise.then(function(list){
                    addMetadataProperties(list, scope.metadataList, scope, CommonService);
                });

                scope.project.Instruments = scope.project.Instruments.sort(orderByAlphaName);
				
				console.log("scope at end of controllers.js, project watch is next...");
				//console.dir(scope);
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
		
		scope.matchLocationsToSubprojects = function()
		{
			console.log("Inside controllers.js, scope.matchLocationsToSubprojects...");	

			//console.log("scope is next...");
			//console.dir(scope);
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
			//console.log("scope.project.Locations is next...");
			//console.dir(scope.project.Locations);

			scope.thisProjectsLocationObjects = []; // Dump this list, before refilling it.
			angular.forEach(scope.subprojectList, function(subproject){
				
				angular.forEach(scope.project.Locations, function(location, key){
					//console.log("location key = " + key);
					//console.log("location is next...");
					//console.dir(location);

					// We will show the Primary Project Location, and the locations of the subprojects.
					//if ((location.LocationTypeId === 3) || (subproject.Id === location.SubprojectId))
					//console.log("location.LocationTypeId = " +  location.LocationTypeId + ", subproject.LocationId = " + subproject.LocationId + ", location.Id = " + location.Id);
					if (subproject.LocationId === location.Id)
					{
						console.log("Found a subproject location")
						//console.dir(location);
						scope.thisProjectsLocationObjects.push(location.SdeObjectId);
						subproject.GPSEasting = location.GPSEasting;
						subproject.GPSNorthing = location.GPSNorthing;
						subproject.UTMZone = location.UTMZone;
						subproject.Projection = location.Projection;
						subproject.WaterBodyId = location.WaterBodyId;
					}
				});
			});
			scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
		};
		
		scope.matchFilesToSubproject = function()
		{
			console.log("Inside controllers.js, scope.matchFilesToSubproject...");	

			//console.log("scope is next...");
			//console.dir(scope);
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
			//console.log("scope.subprojectFileList is next...");
			//console.dir(scope.subprojectFileList);
			//console.log("scope.project.Files is next...");
			//console.dir(scope.project.Files);			
			
			angular.forEach(scope.subprojectList, function(subproject){

				angular.forEach(scope.subprojectFileList, function(spFile){
					//if (subproject.Id === spFile.SubprojectId)
					//if (subproject.Id === spFile.Subproject_CrppId)
					if ((subproject.Id === spFile.Subproject_CrppId) && (spFile.FeatureImage === 1))
					{
						//angular.forEach(scope.project.Files, function(pFile){
						//	if (pFile.Id === spFile.FileId)
						//		subproject.ItemFiles = angular.copy(pFile);
						//});
						if (!subproject.ItemFiles)
						{
							subproject.ItemFiles = [];
							subproject.ItemFiles.push(spFile);
						}
						else
							subproject.ItemFiles = angular.copy(spFile);
						
						//scope.viewSubproject.ItemFiles = subproject.ItemFiles;
						console.log("Matched subproject file...");
					}
				});
			});	

			$rootScope.subprojectFileList = scope.subprojectFileList;			
		};
		
		scope.matchFundersToSubproject = function()
		{
			console.log("Inside controllers.js, scope.matchFundersToSubproject...");
			
			//console.log("scope is next...");
			//console.dir(scope);
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
			//console.log("scope.funderList is next...");
			//console.dir(scope.funderList);	

			var strFunders = "";
			angular.forEach(scope.subprojectList, function(subproject){
				strFunders = "";			
				angular.forEach(scope.funderList, function(funder){
					if (funder.SubprojectId === subproject.Id)
					{
						strFunders += funder.Name + ", " + funder.Amount + ";\n";
					}
				});
				subproject.strFunders = strFunders;	
			});
		};
		
		scope.matchCollaboratorToSubproject = function()
		{
			console.log("Inside controllers.js, scope.matchCollaboratorToSubproject...");
			
			//console.log("scope is next...");
			//console.dir(scope);
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
			//console.log("scope.collaboratorList is next...");
			//console.dir(scope.collaboratorList);
			
			var strCollaborators = "";
			angular.forEach(scope.subprojectList, function(subproject){
				strCollaborators = "";
				angular.forEach(scope.collaboratorList, function(collaborator){
					if (collaborator.SubprojectId === subproject.Id)
					{
						strCollaborators += collaborator.Name + ";\n";
					}
				});
				subproject.strCollaborators = strCollaborators;
			});
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

        scope.createInstrument = function(){
            scope.viewInstrument = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

		scope.createFisherman = function(){
            scope.viewFisherman = null;
            var modalInstance = $modal.open({
              templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
              controller: 'ModalCreateFishermanCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 

		
        scope.editViewInstrument = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        scope.editViewFisherman = function(){
            var modalInstance = $modal.open({
              templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
              controller: 'ModalCreateFishermanCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };




        scope.openAccuracyCheckForm = function(ac_row){
            if(ac_row)
              scope.ac_row = ac_row;
            else
              scope.ac_row = {};

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-new-accuracycheck.html',
              controller: 'ModalAddAccuracyCheckCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

        scope.openHabitatItemForm = function(hi_row){
			console.log("Inside openHabitatItemForm...")
			//console.dir(scope);
			
            if(hi_row)
              scope.hi_row = hi_row;
            else
              scope.hi_row = {};


            var modalInstance = $modal.open({
                templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-new-habitatItem.html',
              controller: 'ModalAddHabitatItemCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
		scope.openGeospatialDataPage = function(){
			console.log("Inside openGeospatialDataPage...");

			var strUrl = "http://ctuirgis.maps.arcgis.com/apps/webappviewer/index.html?id=1669df9b26874c9eb49cc41ec4d57ec5";
			//var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";			
			var strWindowFeatures = "location=yes,scrollbars=yes,status=yes";
			$window.open(strUrl, "_blank", strWindowFeatures);
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

        scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

        scope.viewInstrument = null; //what they've clicked to view accuracy checks
        scope.selectedInstrument = null; //what they've selected in the dropdown to add to the project

        scope.reloadProject = function(){
            //reload project -- this will reload the instruments & laboratories
            ProjectService.clearProject();
            scope.project = ProjectService.getProject(routeParams.Id);
        };

        
		scope.reloadSubproject = function(id){
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubproject, id = " + id);
			SubprojectService.clearSubproject();
			//scope.subproject = SubprojectService.getSubproject(id);
			
			if (scope.DatastoreTablePrefix === "CrppContracts")
			{
				console.log("Reloading Crpp...");
				scope.subproject = SubprojectService.getSubproject(id);
			}
			else if (scope.subprojectType === "Habitat")
			{
				console.log("Reloading Habitat, Id = " + id);
				scope.subproject = null;
				scope.subproject = SubprojectService.getSubproject(id);
			}
			
			var watcher = scope.$watch('subproject.Id', function(){
				if ((typeof scope.subproject === 'undefined') || (scope.subproject === null))
				{
					console.log("watching...");
					return;
				}
				
				/*scope.subproject.searchField = "";
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.ProjectName);
				scope.subproject.searchField = scope.subproject.searchField.concat(" ");
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.Agency);
				scope.subproject.searchField = scope.subproject.searchField.concat(" ");
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.ProjectProponent);
				scope.subproject.searchField = scope.subproject.searchField.concat(" ");
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.Closed);
				scope.subproject.searchField = scope.subproject.searchField.concat(" ");
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.ProjectLead);
				*/
				console.log("scope.subproject.Id = " + scope.subproject.Id);
				// We wait until subproject gets loaded and then turn this watch off.
				watcher();
			});
		};
		
		scope.reloadSubprojectLocations = function()
		{
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubprojectLocations...");
			
			scope.thisProjectsLocationObjects = []; // Dump this list, before refilling it.
			angular.forEach(scope.subprojectList, function(subproject){
				angular.forEach(scope.project.Locations, function(location, key){
					//console.log("location key = " + key);
					//console.log("location is next...");
					//console.dir(location);

					if (subproject.LocationId === location.Id)
						scope.thisProjectsLocationObjects.push(location.SdeObjectId);
					
				});
			});
			console.log("scope.thisProjectsLocationObjects is next...");
			console.dir(scope.thisProjectsLocationObjects);
			
			if (scope.thisProjectsLocationObjects.length > 0)
			{
				if(scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
					scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
			}
			//else
			//{
			//	scope.map.locationLayer.showLocationsById(0);
			//}
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

        scope.addInstrument = function(){
			/* Verify that all three situations are true:
			*  scope.selectedInstrument exists				This is important because IE will not actually select something, when you select it the first time.
			*  scope.selectedInstrument is not null			Important for the same reason just mentioned.
			*  The selected instrument is not already associated to the project.
			*/
            //if(!scope.selectedInstrument || getMatchingByField(scope.project.Instruments, scope.selectedInstrument, 'Id').length > 0)
            if(!scope.selectedInstrument || scope.selectedInstrument === null || getMatchingByField(scope.project.Instruments, scope.selectedInstrument, 'Id').length > 0)	
                return;

            var Instruments = getMatchingByField(scope.allInstruments, scope.selectedInstrument, 'Id');

            var promise = ProjectService.saveProjectInstrument(scope.project.Id, Instruments[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };

        scope.addFisherman = function(){
			console.log("Inside controllers.addFisherman.");
			//console.log("scope is next...");
			//console.dir(scope);
			console.log("scope.selectedFisherman is next...");
			console.dir(scope.selectedFisherman);
			
            if(!scope.selectedFisherman || scope.selectedFisherman === null || getMatchingByField(scope.project.Fishermen, scope.selectedFisherman, 'Id').length > 0)
                return;
	
            var theFishermen = getMatchingByField(scope.fishermenList, scope.selectedFisherman, 'Id');

			var promise = ProjectService.saveProjectFisherman(scope.project.Id, theFishermen[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };
		 


        scope.removeViewInstrument = function(){
            if(!scope.viewInstrument)
                return;

            var promise = ProjectService.removeProjectInstrument(scope.project.Id, scope.viewInstrument.Id);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };
		 
        scope.removeViewFisherman = function(){
			//console.log("scope is next...");
			//console.dir(scope);
            if(!scope.viewFisherman)
                return;

            var promise = ProjectService.removeProjectFisherman(scope.project.Id, scope.viewFisherman.Id);

            promise.$promise.then(function(){
                scope.reloadProject();
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

        scope.viewSelectedInstrument = function(instrument){
            scope.viewInstrument = instrument;
        };
		 
		scope.viewSelectedFisherman = function(fisherman){
			console.log("Inside controllers.js, scope.viewSelectedFisherman");
			if (scope.viewFisherman)
				delete scope.viewFisherman;
			
			scope.viewFisherman = fisherman;
			//console.log("scope is next...");
			//console.dir(scope);			
			console.log("scope.viewFisherman is next...");
			console.dir(scope.viewFisherman);
			console.log("scope.viewFisherman.DateAdded = " +  scope.viewFisherman.DateAdded);			

			//var strInDate = scope.viewFisherman.DateAdded;
			//console.log("strInDate = " + strInDate);
			//scope.viewFisherman.DateAdded = ServiceUtilities.extractDateFromString(strInDate);
			//console.log("scope.viewFisherman.DateAdded = " + scope.viewFisherman.DateAdded);

			scope.viewFisherman.Status = ConvertStatus.convertStatus(scope.viewFisherman.StatusId);
			console.log("scope.viewFisherman.Status = " + scope.viewFisherman.Status)

			scope.viewFisherman.OkToCall = ConvertStatus.convertOkToCall(scope.viewFisherman.OkToCallId);
			console.log("scope.viewFisherman.OkToCall = " + scope.viewFisherman.OkToCall);			
        };
		 

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
		 	  
		scope.gotoSubprojectsTop = function (){
			// set the location.hash to the id of
			// the element you wish to scroll to.
			console.log("Inside projectDatasetsController, gotoSubprojectsTop...");
			
			// Have angular get the hash for this location (), and capture the result.
			var old = $location.hash();
			//console.log("Got old...");

			// Now have angular do the hash for the real location.
			if (scope.subprojectType === "CRPP")
			{
				$location.hash('spTop');
				console.log("Found spTop");
			}
			else if (scope.subprojectType === "Habitat")
			{
				$location.hash('spHTop');
				console.log("Found spHTop");
			}
			
			// call $anchorScroll() and go to that location.
			$anchorScroll();
			//console.log("Scrolled...");
			
			// Now set the location.hash back to the "old" location; this way, angular will not "notice" the routing change.
			$location.hash(old);
			//console.log("Set hash back to old...");
		};
		
		scope.gotoHabitatItemsTop = function (){
			// set the location.hash to the id of
			// the element you wish to scroll to.
			console.log("Inside projectDatasetsController, gotoHabitatItemsTop...");
			
			// Have angular get the hash for this location (), and capture the result.
			var old = $location.hash();
			
			// Now have angular do the hash for the real location.
			//$location.hash('top');
			$location.hash('hiTop');
			
			// call $anchorScroll() and go to that location.
			$anchorScroll();
			
			// Now set the location.hash back to the "old" location; this way, angular will not "notice" the routing change.
			$location.hash(old);
		};
		 
		scope.gotoCorrespondenceEventsTop = function (){
			// set the location.hash to the id of
			// the element you wish to scroll to.
			console.log("Inside projectDatasetsController, gotoCorrespondenceEventsTop...");
			
			// Have angular get the hash for this location (), and capture the result.
			var old = $location.hash();
			
			// Now have angular do the hash for the real location.
			//$location.hash('top');
			$location.hash('ceTop');
			
			// call $anchorScroll() and go to that location.
			$anchorScroll();
			
			// Now set the location.hash back to the "old" location; this way, angular will not "notice" the routing change.
			$location.hash(old);
		};
		
		/*scope.clearSubprojectFilters = function(){
			scope.gridOptionsFilter = null;
		};
		*/
        scope.cancel = function()
        {
           // scope.users =
        };

	}
];




