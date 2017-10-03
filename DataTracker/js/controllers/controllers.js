
'use strict';


/* Controllers */

var mod_ds = angular.module('DatasetControllers', ['ui.bootstrap', 'angularFileUpload','ui.select2']);

mod_ds.controller('ModalAddAccuracyCheckCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope, $modalInstance, DataService, DatastoreService){

    $scope.ac_row = angular.copy($scope.ac_row);

    $scope.save = function(){

		var promise = DatastoreService.saveInstrumentAccuracyCheck($scope.viewInstrument.Id, $scope.ac_row);

		promise.$promise.then(function(){
			$scope.reloadProject();
			$modalInstance.dismiss();
		});
    };

    $scope.cancel = function(){
		$modalInstance.dismiss();
    };

  }
]);

//*****

mod_ds.controller('ModalProjectEditorCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
	function($scope,  $modalInstance, DataService, DatastoreService){

		if($scope.row && $scope.row.Id)
		{
			$scope.header_message = "Edit project: " + $scope.project.Name;
		}
		else
		{
			$scope.header_message = "Create new project";
			$scope.row = {};
		}

		$scope.save = function(){
			console.log("Inside ModalProjectEditorCtrl, save...");
			console.log("$scope.row is next...")
			console.dir($scope.row);
			
			if (!$scope.row.Name)
			{
				alert("You must enter a Program/Project Name!");
				return;
			}
		
		    $scope.row.Metadata = [];

		    //need to make multi-selects into json objects
		    angular.forEach($scope.metadataList, function(md){
				//flatten multiselect values into an json array string
				if(md.Values && md.controlType == "multiselect")
				{
					md = angular.copy(md);
					md.Values = angular.toJson(md.Values).toString(); //wow, definitely need tostring here!
				}

				$scope.row.Metadata.push(md);
			});

			console.log("About to save...");
			var promise = DataService.saveProject($scope.row);
			console.log("Just saved...");
			promise.$promise.then(function(){
				console.log("About to reload project...");
				$scope.reloadProject();
				$modalInstance.dismiss();
			});

		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};

	}
]);

mod_ds.controller('ModalDeleteFileCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
	function($scope,  $modalInstance, DataService, DatastoreService){

		$scope.header_message = "Delete file";

		$scope.save = function(){
			var promise = DatastoreService.deleteFile($scope.project.Id, $scope.row);
			promise.$promise.then(function(){
				$scope.reloadProject();
				$modalInstance.dismiss();
			});
		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};
	}
]);

mod_ds.controller('ModalEditFileCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
	function($scope,  $modalInstance, DataService, DatastoreService){

		$scope.header_message = "Edit file";

		$scope.save = function(){
			var promise = DatastoreService.updateFile($scope.project.Id, $scope.row);
			promise.$promise.then(function(){
				$scope.reloadProject();
				$modalInstance.dismiss();
			});
		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};
	}
]);



mod_ds.controller('ModalNewFileCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService', '$upload',
	function($scope,  $modalInstance, DataService, DatastoreService, $upload){
		// This controller is for the Project File (Documents tab) modal.
		// note: file selected for upload in this controller are managed by onFileSelect in this controller (see below).

		$scope.header_message = "Add file(s) to "+$scope.project.Name;

		$scope.onFileSelect = function($files)
		{
			console.log("Inside ModalNewFileCtrl, file selected! " + $files);
			$scope.uploadFiles = $files;
			//console.dir($scope.uploadFiles);
		};

		$scope.save = function(){
			console.log("Inside controllers.js, ModalNewFileCtrl, save...");
			console.log("$scope is next...");
			console.dir($scope);
			// Just in case they clicked the Upload button, without selecting a file first.
			if (!$scope.uploadFiles)
			{
				console.log("No file selected; do nothing...");
				return;
			}

			$scope.foundDuplicate = false;		
			$scope.uploadErrorMessage = undefined;
			var errors = [];

			for(var i = 0; i < $scope.uploadFiles.length; i++)
			{
				var file = $scope.uploadFiles[i];
				console.log("file is next...");
				console.dir(file);
				
				var newFileNameLength = file.name.length;
				console.log("file name length = " + newFileNameLength);

				// $scope.uploadFileType gets set when the user clicks on the new button, 
				// and it determined whether they are in the Project gallery, or Project Documents.
				console.log("$scope.uploadFileType = " + $scope.uploadFileType);
				if ($scope.uploadFileType === "image")
				{
					console.log("We have an image...");
					for(var n = 0; n < $scope.project.Images.length; n++)
					{
						var existingFileName = $scope.project.Images[n].Name;
						console.log("existingFileName = " + existingFileName);
						var existingFileNameLength = existingFileName.length;
						if ((newFileNameLength >= existingFileNameLength) && (file.name.indexOf(existingFileName) > -1))
						{
								$scope.foundDuplicate = true;
								console.log(file.name + " already exists in the project file list.");
								errors.push(file.name + " already exists in the list of project images.");						
						}
					}
				}
				else
				{
					console.log("We have something other than an image...");
					for(var n = 0; n < $scope.project.Files.length; n++)
					{
						var existingFileName = $scope.project.Files[n].Name;
						console.log("existingFileName = " + existingFileName);
						var existingFileNameLength = existingFileName.length;
						if ((newFileNameLength >= existingFileNameLength) && (file.name.indexOf(existingFileName) > -1))
						{
								$scope.foundDuplicate = true;
								console.log(file.name + " already exists in the project file list.");
								errors.push(file.name + " already exists in the list of project Files.");						
						}
					}
				}
				
				console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);
				// Inform the user immediately, if there are duplicate files.
				if ($scope.foundDuplicate)
					alert(errors);
				else
				{
					console.log("file is next...");
					console.dir(file);
					//if(file.success != "Success")
					if(!file.success)
					{
						console.log("file.success does not exist yet...");
						$scope.upload = $upload.upload({
							url: serviceUrl + '/data/UploadProjectFile',
							method: "POST",
							// headers: {'headerKey': 'headerValue'},
							// withCredential: true,
							data: {ProjectId: $scope.project.Id, Description: file.Info.Description, Title: file.Info.Title},
							file: file,

							}).progress(function(evt) {
								console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
							}).success(function(data, status, headers, config) {
								config.file.success = "Success";
							})
							.error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
								//console.log(file.name + " was error.");
								config.file.success = "Failed";
							});
					}
				}
			}

		};

		$scope.cancel = function(){
			if($scope.uploadFiles)
				$scope.reloadProject();

			$scope.foundDuplicate = undefined;

			$modalInstance.dismiss();
		};
	}
]);

var projectDatasetsController = ['$scope', '$routeParams', 'DataService','DatastoreService', '$rootScope','$modal','$sce','$window','$http','ServiceUtilities','ConvertStatus','$location','$anchorScroll',
	function(scope, routeParams, DataService, DatastoreService, $rootScope, $modal,$sce, $window, $http, ServiceUtilities, ConvertStatus, $location, $anchorScroll){
		console.log("Inside projectDatasetsController...");
		console.log("routeParams.Id = " + routeParams.Id);
		
		if ((typeof scope.activities !== 'undefined') && (scope.activites !== null))
		{
			scope.activities = null;
			console.log("Set scope.activities to null for project page...");
		}
		
		scope.datasets = DataService.getProjectDatasets(routeParams.Id);
		scope.project = DataService.getProject(routeParams.Id);
		scope.currentUserId = $rootScope.Profile.Id;
		scope.filteredUsers = false;
		scope.allInstruments = DatastoreService.getAllInstruments();
	
		scope.fishermanList = null;
		//scope.fishermenList = DatastoreService.getFishermen();
		scope.subprojectList = null;  // Set this to null first, so that we can monitor it later.
		//scope.subprojectList = DataService.getSubprojects();
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
		console.log("serviceUrl = " + serviceUrl);
		scope.theServiceUrl = serviceUrl;
		
		// Get the fishermen associated to the project.
		//scope.theFishermen = DatastoreService.getProjectFishermen(scope.projectId);
		scope.theFishermen = null;
	
		scope.CellOptions = {}; //for metadata dropdown options
		scope.isFavorite = $rootScope.Profile.isProjectFavorite(routeParams.Id);

		scope.metadataList = {};
		scope.metadataPropertiesPromise = DataService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID);
		scope.habitatPropertiesPromise = DataService.getMetadataProperties(METADATA_ENTITY_HABITATTYPEID);

		var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
            				   '<a href="#/{{row.getProperty(\'activitiesRoute\')}}/{{row.getProperty(\'Id\')}}">{{row.getProperty("Name")}}</a>' +
            				   '</div>';

		var activityTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
								   'PLACEHOLDER' +
								   '</div>';

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
                                '<img src="images/file_image.png" width="100px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';

        var uploadedBy = '<div class="ngCellText" ng-class="col.colIndex()">' +
                               '{{row.getProperty("UploadDate")|date}} by {{row.getProperty("User.Fullname")}}' +
                               '</div>';

        scope.fileSelection = [];
        scope.FileFilterOptions = {};
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
			angular.forEach(scope.fishermenOptions, function(fisherman){
				console.dir(fisherman);
			});
			
			console.log("scope.fishermenOptions is next...");
			console.dir(scope.fishermenOptions);
		});	
		
        scope.$watch('datasets', function(){
			//console.log("scope.datasets in datasets watch is next...");
            //console.dir(scope);

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
					//DataService.configureDataset(dataset);
					//DataService.configureDataset(dataset, scope);  // We must pass the scope along on this call.
					DataService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
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
						scope.fishermenList = DatastoreService.getFishermen(); // All fishermen, but only CreelSurvey has fishermen.//
						scope.theFishermen = DatastoreService.getProjectFishermen(scope.datasets[i].ProjectId);
						// Note:  If we are on Harvest, it has only one dataset.
						scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;
					}
					else if (scope.datasets[i].Datastore.TablePrefix === "CrppContracts")
					{
						console.log("Adding Correspondence to tab bar...");
						scope.ShowSubproject = true;
						scope.subprojectList = DataService.getSubprojects();
						console.log("Fetching CRPP subproject...");
						// Note:  If we are on CRPP, it has only one dataset.
						// We must set the scope.DatastoreTablePrefix, in order for the Edit Subproject to work.
						// The Correspondence Event also needs scope.DatastoreTablePrefix, in order to save documents properly.
						scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;
					}
					//else if (scope.datasets[i].Datastore.TablePrefix === "Metrics")
					else if ((scope.datasets[i].Datastore.TablePrefix === "Metrics") || 
						(scope.datasets[i].Datastore.TablePrefix === "Benthic") ||
						(scope.datasets[i].Datastore.TablePrefix === "Drift")
						)
					{
						console.log("Adding Sites to tab bar...");
						scope.ShowHabitat = true;
						//scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;
						
						// We call the functions that will build the list of funders, and list of files related to the project.
						// We add the items from these lists to the project later, after we have the data.
						scope.subprojectFileList = null;
						scope.subprojectFileList = DataService.getSubprojectFiles(scope.datasets[i].ProjectId);
						scope.funderList = null;
						scope.funderList = DataService.getProjectFunders(scope.datasets[i].ProjectId);
						scope.collaboratorList = null;
						scope.collaboratorList = DataService.getProjectCollaborators(scope.datasets[i].ProjectId);
						
						scope.subprojectList = DataService.getProjectSubprojects(scope.datasets[i].ProjectId);
						var watcher = scope.$watch('subprojectList.length', function(){
							console.log("Inside watcher for subprojectList.length...");
							// We wait until subprojects gets loaded and then turn this watch off.
							if (scope.subprojectList === null)
							{
								console.log("scope.subprojectList is null");
								return;
							}
							else if (typeof scope.subprojectList.length === 'undefined')
							{
								console.log("scope.subprojectList.length is undefined.");
								return;
							}
							else if (scope.subprojectList.length === 0)
							{
								console.log("scope.subprojectList.length is 0");
								if(scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
								{
									//scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
									// Note:  If we sent an empty list, it pulls all the locations.
									// If we supply an Id that we know does not exist (0), we get no locations, which is what we expect.
									scope.map.locationLayer.showLocationsById(0); //bump and reload the locations.
								}
								return;
							}
							console.log("scope.subprojectList.length = " + scope.subprojectList.length);
							console.log("subprojects is loaded...");
							console.dir(scope.subprojectList);
							
							scope.cleanGateKeeper("Sdone");
							scope.FileLocationSubprojectFundersWatchVariable += "Sdone";
							watcher();
						});
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
				console.log("scope.project.Locations is next...");
				console.dir(scope.project.Locations);
				
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
					console.log("scope.funderList is next...");
					console.dir(scope.funderList);
					
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
					console.log("scope.collaboratorList is next...");
					console.dir(scope.collaboratorList);
					
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
			console.dir(scope);

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
			console.log("project.Files is next...");
			console.dir(scope.project.Files);
			
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
				scope.project.Files = DataService.getProjectFiles(scope.project.Id);
				
				/*************************************************************/				
				// Need this section for the subprojects in Habitat and CRPP to work properly.
				scope.subprojectType = DatastoreService.getProjectType(scope.project.Id);
				$rootScope.subprojectType = scope.subprojectType = DatastoreService.getProjectType(scope.project.Id);
				console.log("scope.subprojectType = " + scope.subprojectType);
				DataService.setServiceSubprojectType(scope.subprojectType);
				/*************************************************************/
				
                scope.editors = scope.project.Editors;
                scope.users = DataService.getUsers();
				
				//var theFishermen = DatastoreService.getProjectFishermen(scope.project.Id);

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
                addMetadataProperties(scope.project.Metadata, scope.metadataList, scope, DataService);

                scope.mapHtml = $sce.trustAsHtml(scope.project.MetadataValue[25]);
                scope.imagesHtml = $sce.trustAsHtml(scope.project.MetadataValue[13]);


                //get habitat (and possibly other?) metadata values for this project.  they don't come with project metadata as they are their own category.
                var habitatProjectMetadataPromise = DataService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITATTYPEID);
                habitatProjectMetadataPromise.$promise.then(function(list){
                    addMetadataProperties(list, scope.metadataList, scope, DataService);
                });

                scope.project.Instruments = scope.project.Instruments.sort(orderByAlphaName);
				
				console.log("scope at end of controllers.js, project watch is next...");
				console.dir(scope);
            }

        });
		
		scope.$watch('subproject.Id', function(){
			if ((typeof scope.subproject === 'undefined') || (scope.subproject === null))
			{
				console.log("watching...");
				return;
			}
			
			console.log("Inside controllers.js, watch subproject.Id...");
			console.log("scope.subproject.Id = " + scope.subproject.Id);
		});
		
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

            DataService.saveUserPreference("Projects", $rootScope.Profile.favoriteProjects.join(), scope.results);

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

			console.log("scope is next...");
			console.dir(scope);
			console.log("scope.subprojectList is next...");
			console.dir(scope.subprojectList);
			console.log("scope.project.Locations is next...");
			console.dir(scope.project.Locations);

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

			console.log("scope is next...");
			console.dir(scope);
			console.log("scope.subprojectList is next...");
			console.dir(scope.subprojectList);
			console.log("scope.subprojectFileList is next...");
			console.dir(scope.subprojectFileList);
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
			
			console.log("scope is next...");
			console.dir(scope);
			console.log("scope.subprojectList is next...");
			console.dir(scope.subprojectList);
			console.log("scope.funderList is next...");
			console.dir(scope.funderList);	

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
			
			console.log("scope is next...");
			console.dir(scope);
			console.log("scope.subprojectList is next...");
			console.dir(scope.subprojectList);
			console.log("scope.collaboratorList is next...");
			console.dir(scope.collaboratorList);
			
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
            addMetadataProperties(list, scope.metadataList, scope, DataService);
        });

        scope.habitatPropertiesPromise.promise.then(function(list){
            addMetadataProperties(list, scope.metadataList, scope, DataService);
        });


        scope.openChooseMapImage = function(){
            var modalInstance = $modal.open({
              templateUrl: 'partials/modals/choosemap-modal.html',
              controller: 'ModalChooseMapCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

        scope.openChooseSummaryImages = function(){
            var modalInstance = $modal.open({
              templateUrl: 'partials/modals/choosesummaryimages-modal.html',
              controller: 'ModalChooseSummaryImagesCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

		/*mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm*/
		/* The controllers specified below are located in the file modals-controller.js
		/*mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm*/
        scope.createInstrument = function(){
            scope.viewInstrument = null;
            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

		scope.createFisherman = function(){
            scope.viewFisherman = null;
            var modalInstance = $modal.open({
              templateUrl: 'partials/fishermen/modal-create-fisherman.html',
              controller: 'ModalCreateFishermanCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        scope.createSubproject = function(){
            scope.viewSubproject = null;
			scope.createNewSubproject = true;
			scope.subprojectList = null;
			scope.subprojectOptions = null;
			console.log("scope.createNewSubproject = " + scope.createNewSubproject);
            var modalInstance = $modal.open({
              templateUrl: 'partials/subproject/modal-create-subproject.html',
              controller: 'ModalCreateSubprojectCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.createHabSubproject = function(){
            scope.viewSubproject = null;
			scope.createNewSubproject = true;
			scope.subprojectList = null;
			scope.subprojectOptions = null;
			console.log("scope.createNewSubproject = " + scope.createNewSubproject);
            var modalInstance = $modal.open({
              templateUrl: 'partials/subproject/modal-create-habSubproject.html',
              controller: 'ModalCreateHabSubprojectCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        scope.editViewInstrument = function(){
            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        scope.editViewFisherman = function(){
            var modalInstance = $modal.open({
              templateUrl: 'partials/fishermen/modal-create-fisherman.html',
              controller: 'ModalCreateFishermanCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        //scope.editViewSubproject = function(){
        scope.editViewSubproject = function(subproject){
			console.log("Inside editViewSubproject...");
			
			/* Note:  Let's say we just added or edited a subproject, and then clicked on the Edit button to review it.
			* If you simply click on the edit, it will not contain the most recent info (that you just updated),
			* and that will leave you wondering what just happened.
			* However, if you click on the subproject first (runs viewSelectedSubproject, in this file), and then click the Edit button,
			* the form WILL have the most recent info (that you just updated).
			* So, what we must do is run viewSelectedSubproject first, and then open the form, which is what we do just below.
			*/
			scope.viewSelectedSubproject(subproject);
			
			console.log("scope.DatastoreTablePrefix = " + scope.DatastoreTablePrefix + ", scope.project.Id = " + scope.projectId);
			if (scope.DatastoreTablePrefix === "CrppContracts")
			{
				console.log("viewing a CRPP subproject");
				var modalInstance = $modal.open({
				  templateUrl: 'partials/subproject/modal-create-subproject.html',
				  controller: 'ModalCreateSubprojectCtrl',
				  scope: scope, //very important to pass the scope along...
				});
			}
			else if (scope.subprojectType === "Habitat")
			{
				console.log("viewing a Habitat subproject");
				//scope.subprojectFileList = DataService.getSubprojectFiles(scope.projectId, subproject.Id);
				var modalInstance = $modal.open({
				  templateUrl: 'partials/subproject/modal-create-habSubproject.html',
				  controller: 'ModalCreateHabSubprojectCtrl',
				  scope: scope, //very important to pass the scope along...
				});
			}
        };
		
		/*mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm*/
		/* The controllers specified above are located in the file modals-controller.js
		/*mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm*/

		/*cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc*/
		/* The controllers specified below are located in the file controllers.js
		/*cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc*/
        scope.openAccuracyCheckForm = function(ac_row){
            if(ac_row)
              scope.ac_row = ac_row;
            else
              scope.ac_row = {};

            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-new-accuracycheck.html',
              controller: 'ModalAddAccuracyCheckCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

        scope.openCorrespondenceEventForm = function(ce_row){
			console.log("Inside openCorrespondenceEventForm...")
			console.dir(scope);
			
            if(ce_row)
              scope.ce_row = ce_row;
            else
              scope.ce_row = {};


            var modalInstance = $modal.open({
              templateUrl: 'partials/subproject/modal-new-correspondenceEvent.html',
              controller: 'ModalAddCorrespondenceEventCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.openHabitatItemForm = function(hi_row){
			console.log("Inside openHabitatItemForm...")
			console.dir(scope);
			
            if(hi_row)
              scope.hi_row = hi_row;
            else
              scope.hi_row = {};


            var modalInstance = $modal.open({
              templateUrl: 'partials/subproject/modal-new-habitatItem.html',
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
              templateUrl: 'partials/project/modal-delete-file.html',
              controller: 'ModalDeleteFileCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };	

        scope.openEditFileModal = function(selection)
        {
            scope.row = selection;
            var modalInstance = $modal.open({
              templateUrl: 'partials/project/modal-edit-file.html',
              controller: 'ModalEditFileCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.openNewFileModal = function(selection)
        {
            var modalInstance = $modal.open({
              templateUrl: 'partials/project/modal-upload-files.html',
              controller: 'ModalNewFileCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.openProjectEditor = function(){
            scope.row = scope.project; //
            var modalInstance = $modal.open({
				templateUrl: 'partials/project/modal-edit-project.html',
				controller: 'ModalProjectEditorCtrl',
				scope: scope, //very important to pass the scope along...

            });
        };
		 
		/*cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc*/
		/* The controllers specified above are located in the file controllers.js
		/*cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc*/

        scope.syncToStreamnet = function(){
            $.ajax({
                url: serviceUrl + '/action/SyncToStreamnet',
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
            DataService.clearProject();
            scope.project = DataService.getProject(routeParams.Id);
        };
		 
		scope.reloadSubproject = function(id){
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubproject, id = " + id);
			DataService.clearSubproject();
			//scope.subproject = DataService.getSubproject(id);
			
			if (scope.DatastoreTablePrefix === "CrppContracts")
			{
				console.log("Reloading Crpp...");
				scope.subproject = DataService.getSubproject(id);
			}
			else if (scope.subprojectType === "Habitat")
			{
				console.log("Reloading Habitat, Id = " + id);
				scope.subproject = null;
				scope.subproject = DataService.getSubproject(id);
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
			//scope.project = [];
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadThisProject...");
			console.log("scope.projectId = " + scope.projectId + ", scope.SdeObjectId = " + scope.SdeObjectId);
			
			scope.FileLocationSubprojectFundersWatchVariable = ""; // Clean GateKeeper variable.
			
			// Right now, we still now what the project and subproject type are, so reload the extra items for these specific projects.
			if (scope.subprojectType === "CRPP") // CRPP
				scope.subprojectList = DataService.getSubprojects();
			else if (scope.subprojectType === "Habitat")
			{
				console.log("scope.projectId = " + scope.projectId);
				scope.project = DataService.getProject(scope.projectId);
				//scope.subprojectList = DataService.getHabSubprojects();
				scope.subprojectList = DataService.getProjectSubprojects(scope.projectId);
				scope.funderList = DataService.getProjectFunders(scope.projectId);
			}
			
			scope.project = DataService.getProject(parseInt(scope.projectId));
        };
		
        scope.reloadThisHabSubproject = function(subprojectId)
        {
			//scope.project = [];
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadThisHabSubproject...");
			console.log("scope.projectId = " + scope.projectId + ", scope.SdeObjectId = " + scope.SdeObjectId + ", subprojectId = " + subprojectId);
			scope.project = DatastoreService.getHabSubproject(parseInt(subprojectId));		
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
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubprojects...");
			DataService.clearSubprojects();

			if (scope.subprojectType === "CRPP") // CRPP
				scope.subprojectList = DataService.getSubprojects();
			else if (scope.subprojectType === "Habitat")
			{
				console.log("scope.projectId = " + scope.projectId);
				scope.project = DataService.getProject(scope.projectId);
				//scope.subprojectList = DataService.getHabSubprojects();
				scope.subprojectList = DataService.getProjectSubprojects(scope.projectId);
				scope.funderList = DataService.getProjectFunders(scope.projectId);
			}
			
			var watcher = scope.$watch('subprojectList.length', function(){
				// We wait until subprojects gets loaded and then turn this watch off.
				if (scope.subprojectList === null)
					return;
				else if (scope.subprojectList.length === 0)
					return
				
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

            var promise = DatastoreService.saveProjectInstrument(scope.project.Id, Instruments[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };

        scope.addFisherman = function(){
			console.log("Inside controllers.addFisherman.");
			console.log("scope is next...");
			console.dir(scope);
			console.log("scope.selectedFisherman is next...");
			console.dir(scope.selectedFisherman);
			
            if(!scope.selectedFisherman || scope.selectedFisherman === null || getMatchingByField(scope.project.Fishermen, scope.selectedFisherman, 'Id').length > 0)
                return;
	
            var theFishermen = getMatchingByField(scope.fishermenList, scope.selectedFisherman, 'Id');

			var promise = DatastoreService.saveProjectFisherman(scope.project.Id, theFishermen[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };
		 
        scope.addSubproject = function(){
			console.log("Inside controllers.addSubproject.");
			console.log("scope is next...");
			console.dir(scope);
			console.log("scope.selectedSubproject is next...");
			console.dir(scope.selectedSubproject);
			
            if(!scope.selectedSubproject || scope.selectedSubproject === null || getMatchingByField(scope.project.CrppSubProjects, scope.selectedSubproject, 'Id').length > 0)
                return;
	
            var theSubproject = getMatchingByField(scope.correspondenceProjectList, scope.selectedSubproject, 'Id');

			var promise = DatastoreService.saveSubproject(scope.project.Id, theSubproject[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };

        scope.removeViewInstrument = function(){
            if(!scope.viewInstrument)
                return;

            var promise = DatastoreService.removeProjectInstrument(scope.project.Id, scope.viewInstrument.Id);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };
		 
        scope.removeViewFisherman = function(){
			console.log("scope is next...");
			console.dir(scope);
            if(!scope.viewFisherman)
                return;

            var promise = DatastoreService.removeProjectFisherman(scope.project.Id, scope.viewFisherman.Id);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };
		 
        scope.removeViewSubproject = function(){
			console.log("Inside removeViewSubproject, scope is next...");
			console.dir(scope);
            if(!scope.viewSubproject)
                return;
			
			console.log("scope.projectId = " + scope.projectId);
			if (scope.subprojectType === "CRPP")
			{
				console.log("CRPP-related...")
				if (scope.viewSubproject.CorrespondenceEvents.length > 0)
				{
					alert("This project has associated correspondence events.  Those must be deleted first.");
				}
				else
				{
					scope.verifyAction = "Delete";
					scope.verifyingCaller = "CrppSubproject";
					console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " +  scope.viewSubproject.Id);
					var modalInstance = $modal.open({
					  templateUrl: 'partials/verifyAction/modal-verifyAction.html',
					  controller: 'ModalVerifyActionCtrl',
					  scope: scope, //very important to pass the scope along...
					});
				}
			}
			else if (scope.subprojectType === "Habitat")
			{
				console.log("Habitate-related...")
				if (scope.viewSubproject.HabitatItems.length > 0)
				{
					alert("This project has associated Habitat items.  Those must be deleted first.");
				}
				else
				{
					scope.verifyAction = "Delete";
					scope.verifyingCaller = "HabSubproject";
					console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " +  scope.viewSubproject.Id);
					var modalInstance = $modal.open({
					  templateUrl: 'partials/verifyAction/modal-verifyAction.html',
					  controller: 'ModalVerifyActionCtrl',
					  scope: scope, //very important to pass the scope along...
					});
				}
			}
        };
		
		scope.refreshProjectLocations = function(){
			console.log("Inside controllers.js, refreshProjectLocations...");
			DataService.clearProject();
			scope.project = null;
			scope.project = DataService.getProject(parseInt(scope.projectId));
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
			console.log("scope is next...");
			console.dir(scope);			
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
		 
		scope.viewSelectedSubproject = function(subproject){
			console.log("Inside controllers.js, scope.viewSelectedSubproject");
			console.log("subproject is next...");
			console.dir(subproject);
			//console.log("scope is next...");
			//console.dir(scope);
			if (scope.viewSubproject)
			{
				console.log("scope.viewSubproject exists...");
				delete scope.viewSubproject;
			}
			
			//console.log("subproject is next...");
			//console.dir(subproject);
			if ((typeof subproject !== 'undefined') && (subproject !== null))
			{
				// Need to verify that these two $rootScope variables are set.
				//$rootScope.DatastoreTablePrefix = scope.DatastoreTablePrefix;
				$rootScope.viewSubproject = scope.viewSubproject = angular.copy(subproject);
				
				console.log("scope (in scope.viewSelectedSubproject) is next...");
				console.dir(scope);			
				console.log("scope.viewSubproject (in scope.viewSelectedSubproject) is next...");
				console.dir(scope.viewSubproject);
				console.log("scope.viewSubproject.ProjectName (in scope.viewSelectedSubproject) = " +  scope.viewSubproject.ProjectName);
				$rootScope.subprojectId = scope.viewSubproject.Id;
			}
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
            DataService.saveEditors(scope.currentUserId, scope.project.Id, scope.editors, scope.saveResults);
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


var projectsController = ['$scope', 'DataService', '$modal',
  function(scope, DataService, $modal){
    scope.projects = DataService.getProjects();

    scope.CellOptions = {}; //for metadata dropdown options
    scope.metadataList = {};
    scope.metadataPropertiesPromise = DataService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID);
    scope.habitatPropertiesPromise = DataService.getMetadataProperties(METADATA_ENTITY_HABITATTYPEID);

    scope.metadataPropertiesPromise.promise.then(function(list){
        addMetadataProperties(list, scope.metadataList, scope, DataService);
    });

    scope.habitatPropertiesPromise.promise.then(function(list){
        addMetadataProperties(list, scope.metadataList, scope, DataService);
    });

        var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
                               '<a title="{{row.getProperty(\'Description\')}}" href="#/projects/{{row.getProperty(\'Id\')}}">{{row.getProperty("Name")}}</a>' +
                               '</div>';
							  
		console.log("In projectsController, scope is next...");
		console.dir(scope);

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
            scope.projects = DataService.getProjects();
        };
		
		//scope.reloadSubprojects = function()
		//{
		//	scope.subprojects = DataService.getSubprojects();
		//};

        scope.openAddProject = function(){
            var modalInstance = $modal.open({
              //templateUrl: 'partials/project/modal-create-project.html',
              templateUrl: 'partials/project/modal-edit-project.html',
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

			console.log("scope is next...");
			console.dir(scope);
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
				console.log("Inside controllers.js, watch projects...");
				console.log("scope is next...");
				console.dir(scope);
				
				console.log("scope.projects is next...");
				console.dir(scope.projects);
				
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

                scope.locationObjectIds = scope.locationObjectIdArray.join();
                console.log("In controllers, projects watcher, found project locations: " + scope.locationObjectIds);

				console.log("scope.map is next...");
				console.dir(scope.map);
				console.log("scope.map.locationLayer is next...");
				console.dir(scope.map.locationLayer);
				console.log("scope.map.locationLayer is next...");
				console.dir(scope.map.locationLayer);
                if(scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                    scope.map.locationLayer.showLocationsById(scope.locationObjectIds); //bump and reload the locations.

            }
        },true);


  }
];


var errController = ['$scope', 
  function(scope)
  {
    //nothing so far!
  }
];

mod_ds.controller('ProjectsCtrl', projectsController);
mod_ds.controller('ProjectDatasetsCtrl', projectDatasetsController);
mod_ds.controller('ErrorCtrl', errController);

//might be a list of metadata values from project.Metadata or a list of actual properties.
function addMetadataProperties(metadata_list, all_metadata, scope, DataService)
{
    angular.forEach(metadata_list, function(i_property, key){

        var property = i_property;
        if(i_property.MetadataPropertyId) //is it a value from project.Metadata? if so then grab the property.
            property = DataService.getMetadataProperty(i_property.MetadataPropertyId);

        //property var is a "metadataProperty" (not a metadata value)

		//console.log("typeof property.Name = " + property.Name);
		//if (typeof property.Name !== 'undefined')
		//	console.log("property.Name = " + property.Name);
		//else
		//	console.log("property.Name = " + "'undefined'");
		
        //if it isn't already there, add it as an available option
        //if(!(property.Name in all_metadata))
        if((typeof property.Name !== 'undefined') && (property.Name !== null) && !(property.Name in all_metadata))
        {
            scope.metadataList[property.Name] =
            {
                field: property.Name,
                MetadataPropertyId: property.Id,
                controlType: property.ControlType,
            };
        }

        //set the value no matter what if we have it.
        if(i_property.Values)
        {
          if(property.ControlType == "multiselect")
          {
              //need to see if we are dealing with old style (just a list) or if it is a bonafide object.
              var values;
              try{
                values = angular.fromJson(i_property.Values);
              }
              catch(e)  //if we can't then it wasn't an object... use split instead.
              {
                values = i_property.Values.split(",")
              }

              all_metadata[property.Name].Values = values;
          }
          else
          {
              all_metadata[property.Name].Values = i_property.Values;
          }

          if(scope.project)
              scope.project.MetadataValue[property.Id] = all_metadata[property.Name].Values; //make it easy to get values by metadata id.
        }
        else
          all_metadata[property.Name].Values = "";



        if(property.PossibleValues)
        {
          populateMetadataDropdowns(scope,property); //setup the dropdown
          all_metadata[property.Name].options = scope.CellOptions[property.Id+"_Options"];
        }


    });
};
