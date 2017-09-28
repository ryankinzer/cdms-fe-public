//Data Entry Controller
'use strict';

var mod_de = angular.module('DataEntryControllers', ['ui.bootstrap']);

mod_de.controller('ModalQuickAddAccuracyCheckCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.ac_row = {};

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


mod_de.controller('ModalQuickAddCharacteristicCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.char_row = {};

    $scope.save = function(){
      
      var promise = DatastoreService.saveCharacteristic($scope.viewLabCharacteristic.Id, $scope.char_row);
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


//datasheet version of the data entrypage
mod_de.controller('DataEntryDatasheetCtrl', ['$scope','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet','$route','DatastoreService',
	function($scope, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet, $route, DatastoreService){

		initEdit(); // stop backspace from ditching in the wrong place.

		$scope.userId = $rootScope.Profile.Id;
		$scope.fields = { header: [], detail: [], relation: {} };
		$scope.colDefs = [];
        
        //setup the data array that will be bound to the grid and filled with the json data objects
        $scope.dataSheetDataset = [];
		
		$scope.datasetLocationType=0;
		$scope.datasetLocations = [[]];			
		$scope.primaryDatasetLocation = 0;
		$scope.sortedLocations = [];
		$scope.errors = { heading: []};

		$scope.fishermenList = DatastoreService.getFishermen();		
		$scope.dataEntryPage = true;  // This is s flag, telling the app that we are on the Data Entry Page, to make the Add Section button show only on the Data Entry page.
        
		//datasheet grid definition
		$scope.gridDatasheetOptions = {
			data: 'dataSheetDataset',
			enableCellSelection: true,
	        enableRowSelection: false,
	        enableCellEdit: true,
	        columnDefs: 'datasheetColDefs',
	        enableColumnResize: true,
	        
		};

        //config the fields for the datasheet - include mandatory location and activityDate fields
		//$scope.datasheetColDefs = DataSheet.getColDefs();  // This runs in the dataset.Fields watcher now.
		DataSheet.initScope($scope);

		//fire up our dataset
        $scope.dataset = DataService.getDataset($routeParams.Id);

		// Note:  Need to watch for the length below, because fishermanList itself does not change, even if it is updated.
		$scope.$watch('fishermenList.length', function(){

			//if (typeof $scope.fishermenList.$resolved === 'undefined')
			if (!$scope.fishermenList)
			{
				console.log("$scope.fishermenList has not loaded.");
				return;
			}
			else if ($scope.fishermenList.length === 0)
			{
				console.log("No fishermen found yet...");
				return;
			}
			console.log("Inside watch, fishermenList");
			
			console.log("$scope.fishermenList is next..");
			console.dir($scope.fishermenList);		
		
			// If we switch the parameters for the makeObjects, like this makeObjects(scope.fishermenList, 'FullName', 'Id'), it will put them in alpha order by name.
			// However, we must test this first, to verify that it does not mess anything up.
			$scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.fishermenList, 'Id','FullName');
			
			// Debug output ... wanted to verify the contents of scope.fishermenOptions
			//angular.forEach($scope.fishermenOptions, function(fisherman){
			//	console.dir(fisherman);
			//});
			
			console.log("$scope.fishermenOptions is next...");
			console.dir($scope.fishermenOptions);
		});	
		
		//update our location options as soon as our project is loaded.
        $scope.$watch('project.Name', function(){
        	if(!$scope.project) return;
			
			console.log("Inside watch project.Name...");
			//console.log($scope.project is next...");
        	//console.dir($scope.project);
			
			$rootScope.projectId = $scope.project.Id;
			$scope.project.Files = null;
			$scope.project.Files = DataService.getProjectFiles($scope.project.Id);
			
			if ($scope.subprojectType === "Harvest")
			{
				console.log("Loading Harvest...");
				$scope.ShowFishermen = true;
				//$scope.theFishermen = DatastoreService.getProjectFishermen($scope.project.Id);
				$scope.fishermenList = DatastoreService.getFishermen();
			}

			//$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ; // Original line

			console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
			$scope.datasetLocationType = DatastoreService.getDatasetLocationType($scope.DatastoreTablePrefix);
			console.log("LocationType = " + $scope.datasetLocationType);			

			console.log("ProjectLocations is next...");
			console.dir($scope.project.Locations);
			//var locInd = 0;
			for (var i = 0; i < $scope.project.Locations.length; i++ )
			{
				//console.log("projectLocations Index = " + $scope.project.Locations[i].Label);
				//console.log($scope.project.Locations[i].Id + "  " + $scope.project.Locations[i].Id);
				if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType)
				{
					//console.log("Found one");
					$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
					//console.log("datasetLocations length = " + $scope.datasetLocations.length);
					//locInd++;
					
					if ($scope.DatastoreTablePrefix === "FishScales")
					{
						console.log("Setting $scope.primaryDatasetLocation...");
						$scope.primaryDatasetLocation = $scope.project.Locations[i].Id;
					}
				}
				/*else if ($scope.project.Locations[i].LocationTypeId === 3)
				{
					//$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);  // The label is NULL, so do not add it.
					$scope.primaryProjectLocation = $scope.project.Locations[i].Id;
					console.log("Found a primary location.  LocId = " + $scope.primaryProjectLocation);
				}*/					
			}
			console.log("datasetLocations is next...");
			console.dir($scope.datasetLocations);
			
			// When we built the array, it started adding at location 1 for some reason, skipping 0.
			// Therefore, row 0 is blank.  The simple solution is to just delete row 0.
			//$scope.datasetLocations.shift();
			
			// During the original development, the blank row was always at row 0.  Months later, I noticed that 
			// the blank row was not at row 0.  Therefore, it needed a different solution.
			var index = 0;
			angular.forEach($scope.datasetLocations, function(dsLoc)
			{
				if (dsLoc.length === 0)
				{
					$scope.datasetLocations.splice(index, 1);
				}
				
				index++;
			});
			
			console.log("datasetLocations after splice is next...");
			console.dir($scope.datasetLocations);

			$scope.datasetLocations.sort(order2dArrayByAlpha);
			console.log("datasetLocations sorted...");
			console.dir($scope.datasetLocations);

			// Convert our 2D array into an array of objects.
			for (var i = 0; i < $scope.datasetLocations.length; i++)
			{
				$scope.sortedLocations.push({Id: $scope.datasetLocations[i][0], Label: $scope.datasetLocations[i][1]});
			}
			$scope.datasetLocations = [[]]; // Clean up
			
			
			// Convert our array of objects into a list of objects, and put it in the select box.
			$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.sortedLocations, 'Id','Label') ;

			console.log("locationOptions is next...");
			console.dir($scope.locationOptions);
			
			console.log("$scope.project.Instruments is next...");
			console.dir($scope.project.Instruments);
        	if($scope.project.Instruments.length > 0)
        	{
        		$scope.instrumentOptions = $rootScope.instrumentOptions = makeInstrumentObjects($scope.project.Instruments);
        		//getByField($scope.datasheetColDefs, 'Instrument','Label').visible=true;
			}

			//check authorization -- need to have project loaded before we can check project-level auth
			if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
			{
				$location.path("/unauthorized");
			}

			console.log("$scope at end of Project watch is next...");
			console.dir($scope);
        });

         //setup a listener to populate column headers on the grid
		$scope.$watch('dataset.Fields', function() { 
			if(!$scope.dataset.Fields ) return;
			
			console.log("Inside watch dataset.Fields...");
			
			$rootScope.datasetId = $scope.datasetId = $scope.dataset.Id;
			console.log("$rootScope.datasetId = " + $rootScope.datasetId);
			$scope.dataset.Files = DataService.getDatasetFiles($scope.dataset.Id);
			
			$scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
			console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
			$scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix);  // Pass the TablePrefix (name of the dataset), because it will never change.			
			
			//load our project based on the projectid we get back from the dataset
        	$scope.project = DataService.getProject($scope.dataset.ProjectId);
			
        	$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');
 
 			$scope.timezoneOptions = $rootScope.timezoneOptions = makeObjects($scope.SystemTimezones,'Name','Name');  // Items sorted by Id
			//$scope.timezoneOptions = $rootScope.timezoneOptions = makeObjects($scope.SystemTimezones,'Name','Description');  // Items sorted by Name
 
			//iterate the fields of our dataset and populate our grid columns
			// Note:  If the OrderBy column of EITHER records that are being compared DOES NOT have a "real" value (not NULL or blank, etc.),
			// the sort process in services.js will use the FieldRoleId column instead.
			// This may be an all or none situation (all must have an OrderBy value), because if only some have the value set,
			// then the order is jumbled on the web page.  When the OrderBy is set for all, they all show in the proper order on the page.
			angular.forEach($scope.dataset.Fields.sort(orderByIndex), function(field){
								
				parseField(field, $scope);
				
				if(field.FieldRoleId == FIELD_ROLE_HEADER)
				{
					$scope.fields.header.push(field);
					$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}
				else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
				{
					$scope.fields.detail.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}				
    		});

			//now everything is populated and we can do any post-processing.
			if($scope.datasheetColDefs.length > 2)
			{
				$scope.addNewRow();
			}

			if($scope.dataset.Config)
			{
				var filteredColDefs = [];

				angular.forEach($scope.datasheetColDefs, function(coldef){
					if($scope.dataset.Config.DataEntryPage &&
						!$scope.dataset.Config.DataEntryPage.HiddenFields.contains(coldef.field))
					{
						filteredColDefs.push(coldef);
					}
				});

				$scope.datasheetColDefs = $scope.colDefs = filteredColDefs;
			}

			$scope.recalculateGridWidth($scope.datasheetColDefs.length);
            $scope.validateGrid($scope);

    	});

		$scope.doneButton = function()
		{
		 	$scope.activities = undefined;
		 	$scope.dataset = undefined;
			$scope.foundDuplicate = false;
		 	$route.reload();
			$scope.reloadProject();
		 	//DataSheet.initScope($scope); //needed?
		}

		$scope.viewButton = function()
		{
			$location.path("/"+$scope.dataset.activitiesRoute+"/"+$scope.dataset.Id);
		}

		 $scope.cancel = function(){
		 	if($scope.dataChanged)
		 	{	
			 	if(!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
			 		return;
			}

		 	$location.path("/"+$scope.dataset.activitiesRoute+"/"+$scope.dataset.Id);
		 };

		//adds row to datasheet grid
		$scope.addNewRow = function()
		{
			var row = makeNewRow($scope.datasheetColDefs);
			row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
			row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
			$scope.onRow = row;

		};

		$scope.saveData = function() {

			angular.forEach($scope.dataSheetDataset, function(dataRow){
				angular.forEach(dataRow, function(key, value){
					console.log("key = " + key);
					if ($scope.DatastoreTablePrefix === "JvRearing")
					{
						if (key === "Result")
						{
							value = parsefloat(value);
						}
					}
				});
			});
		
			var sheetCopy = angular.copy($scope.dataSheetDataset);
			
			console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
			if ($scope.DatastoreTablePrefix == "FishScales")
			{
				console.log("$scope.primaryDatasetLocation = " + $scope.primaryDatasetLocation);
				$scope.row.locationId = $scope.primaryDatasetLocation;
			}
			else
				console.log("Not working with FishScales...");

            //$scope.activities = ActivityParser.parseActivitySheet(sheetCopy, $scope.fields);
            //$scope.activities = ActivityParser.parseActivitySheet(sheetCopy, $scope.fields, $scope.dataset.QAStatuses);
            $scope.activities = ActivityParser.parseActivitySheet(sheetCopy, $scope.fields, $scope.DatastoreTablePrefix, "DataEntrySheet", $scope.dataset.QAStatuses);
            
            if(!$scope.activities.errors)
            {
                var promise = DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
                promise.$promise.then(function(){
                	$scope.new_activity = $scope.activities.new_records;
                });
            }

		};

		// For Creel Survey only. 
		// Open form to add a fisherman to the database
		$scope.addFisherman = function()
		{
			$scope.viewFisherman = null;
            var modalInstance = $modal.open({
              templateUrl: 'partials/fishermen/modal-create-fisherman.html',
              controller: 'ModalCreateFishermanCtrl',
              scope: $scope, //very important to pass the scope along...
			});
		};

		// For Creel Survey only. 
		$scope.addNewInterview = function()
		{
			var row = makeNewRow($scope.datasheetColDefs);
			row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
			$scope.onRow = row;
			
			for (var i = 0; i < $scope.datasheetColDefs.length; i++)
			{
				if ( // Headers
					($scope.datasheetColDefs[i].field === "activityDate") ||
					($scope.datasheetColDefs[i].field === "locationId") ||
					($scope.datasheetColDefs[i].field === "QAStatusId") ||
					($scope.datasheetColDefs[i].field === "Direction") ||
					($scope.datasheetColDefs[i].field === "Shift") ||
					($scope.datasheetColDefs[i].field === "SurveySpecies") ||
					($scope.datasheetColDefs[i].field === "Comments") ||
					($scope.datasheetColDefs[i].field === "FieldSheetFile") ||
					// Details
					($scope.datasheetColDefs[i].field === "InterviewTime") ||
					($scope.datasheetColDefs[i].field === "GPSEasting") ||
					($scope.datasheetColDefs[i].field === "GPSNorthing") ||
					($scope.datasheetColDefs[i].field === "CarcassComments") ||
					($scope.datasheetColDefs[i].field === "TotalTimeFished")
					)
					{
						$scope.datasheetColDefs[i].enableCellEdit = true;
						//$scope.datasheetColDefs[i].cellEditableCondition = true;
						//$scope.disabledFont();
					}
					
			}
		};		

		// For Creel Survey only.
		// Adds another row to datasheet grid and copies common items (surveyor, date, etc.)
		$scope.addAnotherFish = function()
		{
			console.log("Inside addAnotherFish...");
			console.log("$scope before copy is next...");
			console.dir($scope);
			
			var listLength = $scope.dataSheetDataset.length;
			// Header items:  Needed in datasheet form
			var theActivityDate = $scope.dataSheetDataset[listLength-1].activityDate;
			var theLocationId = $scope.dataSheetDataset[listLength-1].locationId;
			var theDirection = $scope.dataSheetDataset[listLength-1].Direction;
			var theShift = $scope.dataSheetDataset[listLength-1].Shift;
			var theSurveySpecies = $scope.dataSheetDataset[listLength-1].SurveySpecies;
			var surveyComments = $scope.dataSheetDataset[listLength-1].SurveyComments;
			var theFieldSheetLink = $scope.dataSheetDataset[listLength-1].FieldSheetFile;
			// Detail items
			var interviewTime = $scope.dataSheetDataset[listLength-1].InterviewTime;
			var gpsEasting = $scope.dataSheetDataset[listLength-1].GPSEasting;
			var gpsNorthing = $scope.dataSheetDataset[listLength-1].GPSNorthing;
			var interviewComments = $scope.dataSheetDataset[listLength-1].InterviewComments;
			var totalTimeFished = $scope.dataSheetDataset[listLength-1].TotalTimeFished;
			var numberFishCaught = $scope.dataSheetDataset[listLength-1].NumberFishCaught;
			var qaStatusId = $scope.dataSheetDataset[listLength-1].QAStatusId;
			
			var row = makeNewRow($scope.datasheetColDefs);
			row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
			//row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
			$scope.onRow = row;
			
			listLength = $scope.dataSheetDataset.length;
			// Headers:  Needed for datasheet form
			$scope.dataSheetDataset[listLength-1].activityDate = theActivityDate;
			$scope.dataSheetDataset[listLength-1].locationId = theLocationId;
			$scope.dataSheetDataset[listLength-1].Direction = theDirection;
			$scope.dataSheetDataset[listLength-1].Shift = theShift;
			$scope.dataSheetDataset[listLength-1].SurveySpecies = theSurveySpecies;
			$scope.dataSheetDataset[listLength-1].SurveyComments = surveyComments;
			$scope.dataSheetDataset[listLength-1].FieldSheetFile = theFieldSheetLink;			
			// Details
			$scope.dataSheetDataset[listLength-1].InterviewTime = interviewTime;
			$scope.dataSheetDataset[listLength-1].GPSEasting = gpsEasting;
			$scope.dataSheetDataset[listLength-1].GPSNorthing = gpsNorthing;
			$scope.dataSheetDataset[listLength-1].InterviewComments = interviewComments;
			$scope.dataSheetDataset[listLength-1].TotalTimeFished = totalTimeFished;
			$scope.dataSheetDataset[listLength-1].NumberFishCaught = numberFishCaught;
			$scope.dataSheetDataset[listLength-1].QAStatusId = qaStatusId;
			
			for (var i = 0; i < $scope.datasheetColDefs.length; i++)
			{
				if (($scope.datasheetColDefs[i].field === "InterviewTime") ||
					($scope.datasheetColDefs[i].field === "GPSEasting") ||
					($scope.datasheetColDefs[i].field === "GPSNorthing") ||
					($scope.datasheetColDefs[i].field === "InterviewComments") ||
					($scope.datasheetColDefs[i].field === "TotalTimeFished") ||
					// Header fields
					($scope.datasheetColDefs[i].field === "activityDate") ||
					($scope.datasheetColDefs[i].field === "locationId") ||
					($scope.datasheetColDefs[i].field === "QAStatusId") ||
					($scope.datasheetColDefs[i].field === "Direction") ||
					($scope.datasheetColDefs[i].field === "Shift") ||
					($scope.datasheetColDefs[i].field === "SurveySpecies") ||
					($scope.datasheetColDefs[i].field === "SurveyComments") ||
					($scope.datasheetColDefs[i].field === "FieldSheetFile")
					)
					{
						$scope.datasheetColDefs[i].enableCellEdit = false;
						//$scope.datasheetColDefs[i].cellEditableCondition = false;
						//$scope.disabledFont();
					}
					
			}

			console.log("$scope after copy is next...");
			console.dir($scope);

			//$scope.reloadProject();

			/*
			$scope.onRow.entity.InterviewTime = interviewTime;
			$scope.onRow.entity.GPSEasting = gpsEasting;
			$scope.onRow.entity.GPSNorthing = gpsNorthing;
			$scope.onRow.entity.CarcassComments = carcassComments;
			$scope.onRow.entity.TotalTimeFished = totalTimeFished;
			$scope.onRow.entity.NumberFishCaught = numberFishCaught;
			*/
		};
		
	}
]);


//Fieldsheet / form version of the dataentry page
mod_de.controller('DataEntryFormCtrl', ['$scope','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet','$route','FileUploadService','DatastoreService','$upload',
	function($scope, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet, $route, UploadService,DatastoreService,$upload){

		initEdit(); // stop backspace from ditching in the wrong place.

		$scope.userId = $rootScope.Profile.Id;
		$scope.fields = { header: [], detail: [], relation: []}; 
		$scope.datasheetColDefs = [];
        
		$scope.filesToUpload = {};

        $scope.dataSheetDataset = [];
        // $scope.row = {ActivityQAStatus: {}, activityDate: new Date()}; //header field values get attached here by dbcolumnname

		$scope.datastoreLocations = DatastoreService.getLocations($routeParams.Id);
		//$scope.fishermenList = DatastoreService.getFishermen();
		$scope.fishermenList = null;  // Set this to null first, so that we can monitor it later.
		$scope.subprojectList = null;  // Set this to null first, so that we can monitor it later.
		$scope.datasetLocations = [[]];	
		$scope.datasetLocationType=0;		
		$scope.primaryDatasetLocation = 0;
		$scope.sortedLocations = [];
		$scope.errors = { heading: []};

		$scope.addNewSection = false; // This is a flag.  On Creel Survey, a user may add a new section, which saves the section, but the page remains on the activity.
		$scope.dataEntryPage = true;  // This is s flag, telling the app that we are on the Data Entry Page, to make the Add Section button show only on the Data Entry page.	

		$scope.foundDuplicate = false;
		$scope.showDetails = true;
		$scope.ShowFishermen = false;
		$scope.showDoneButton = true;
        
		//datasheet grid
		$scope.gridDatasheetOptions = {
			data: 'dataSheetDataset',
			enableCellSelection: true,
	        enableRowSelection: false,
	        enableCellEdit: true,
	        columnDefs: 'datasheetColDefs',
	        enableColumnResize: true,
	        
		};

        //config the fields for the datasheet - include mandatory location and activityDate fields
		//$scope.datasheetColDefs = DataSheet.getColDefs();
		DataSheet.initScope($scope);

		//fire up our dataset
		console.log("routeParams.Id = " + $routeParams.Id);
        $scope.dataset = DataService.getDataset($routeParams.Id);
		
		// Note:  Need to watch for the length below, because fishermanList itself does not change, even if it is updated.
		$scope.$watch('fishermenList.length', function(){

			//if (typeof $scope.fishermenList.$resolved === 'undefined')
			if (!$scope.fishermenList)
			{
				console.log("$scope.fishermenList has not loaded.");
				return;
			}
			else if ($scope.fishermenList.length === 0)
			{
				console.log("No fishermen found yet...");
				return;
			}
			console.log("Inside watch, fishermenList");
			
			console.log("$scope.fishermenList is next..");
			console.dir($scope.fishermenList);		
		
			// If we switch the parameters for the makeObjects, like this makeObjects(scope.fishermenList, 'FullName', 'Id'), it will put them in alpha order by name.
			// However, we must test this first, to verify that it does not mess anything up.
			$scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.fishermenList, 'Id','FullName');
			
			// Debug output ... wanted to verify the contents of scope.fishermenOptions
			//angular.forEach($scope.fishermenOptions, function(fisherman){
			//	console.dir(fisherman);
			//});
			
			console.log("$scope.fishermenOptions is next...");
			console.dir($scope.fishermenOptions);
		});	
		
         //setup a listener to populate column headers on the grid
		$scope.$watch('dataset.Fields', function() { 

			if(!$scope.dataset.Fields ) return;

			console.log("Inside watcher for dataset.Fields.");
			
			//$rootScope.datasetId = $scope.dataset.Id;
			$rootScope.datasetId = $scope.datasetId = $scope.dataset.Id;
			console.log("$rootScope.datasetId = " + $rootScope.datasetId);
			$scope.dataset.Files = DataService.getDatasetFiles($scope.dataset.Id);
			
			$scope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
			console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);		
			$scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix, "form");  // Pass the TablePrefix (name of the dataset), because it will never change.

			if ($scope.DatastoreTablePrefix === "CreelSurvey")
			{
				console.log("Loading Harvest...");
				$scope.ShowFishermen = true;
				$scope.fishermenList = DatastoreService.getFishermen(); // Get all fishermen.
				$scope.theFishermen = DatastoreService.getProjectFishermen($scope.dataset.ProjectId); // Get just the fishermen for this project.
			}
			else if ($scope.DatastoreTablePrefix === "CrppContracts")
			{
				console.log("Loading CRPP subprojects...");
				$scope.ShowSubproject = true;
				$scope.subprojectList = DataService.getSubprojects();
			}
			else if ($scope.DatastoreTablePrefix === "Appraisal")
			{
				console.log("Loading DECD ...");
				$scope.showDoneButton = false;
			}
			
			//load our project based on the projectid we get back from the dataset
        	$scope.project = DataService.getProject($scope.dataset.ProjectId); // We will wait until this loads, before doing anything more with it.  See $scope.$watch('project.Name...
			
        	if ($scope.DatastoreTablePrefix === "CreelSurvey" || 
				$scope.DatastoreTablePrefix === "SpawningGroundSurvey"
				)
				$scope.row = {ActivityQAStatus: {}}; //header field values get attached here by dbcolumnname; leave activityDate blank for CreelSurvey.								
			else
				$scope.row = {ActivityQAStatus: {}, activityDate: new Date()}; //header field values get attached here by dbcolumnname
			
			console.log("($scope.dataset.QAStatuses is next...");
			console.dir($scope.dataset.QAStatuses);
        	$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

        	//iterate the fields of our dataset and populate our grid columns
			// Note:  If the OrderBy column of EITHER records that are being compared DOES NOT have a "real" value (not NULL or blank, etc.),
			// the sort process in services.js will use the FieldRoleId column instead.
			// This may be an all or none situation (all must have an OrderBy value), because if only some have the value set,
			// then the order is jumbled on the web page.  When the OrderBy is set for all, they all show in the proper order on the page.
			angular.forEach($scope.dataset.Fields.sort(orderByIndex), function(field){
				
				parseField(field, $scope);

				if(field.FieldRoleId == FIELD_ROLE_HEADER)
				{
					$scope.fields.header.push(field);
				}
				else if (field.FieldRoleId == FIELD_ROLE_DETAIL)
				{
					//console.log("Adding to details:  " + field.DbColumnName + ", " + field.Label);
					$scope.fields.detail.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));

    				//a convention:  if your dataset has a ReadingDateTime field then we enable timezones for an activity.
    				if(field.DbColumnName == "ReadingDateTime")
    				{
						/* Note:  The first line below allows the system to automatically determine what timezone we are in, based upon the current date.
							Initially this seemed like a good idea.  However, while the WaterTemp folks collect their data during the Daylight Savings
							timezone, they upload their data during the Standard timezone.  When the system requires them to remember to change the timezone,
							for all their imports from Standard to Daylight Savings, it can cause a headache, if they forget to make the change.
							Therefore, we decided instead to default the timezone to Daylight Savings, and have them change it to Standard if they must.
							Changing to Standard is a less occurring event than changing from Standard to Daylight Savings.
						*/
    					//$scope.row.Timezone = getByField($scope.SystemTimezones, new Date().getTimezoneOffset() * -60000, "TimezoneOffset"); //set default timezone
    					$scope.row.Timezone = getByField($scope.SystemTimezones, 420 * -60000, "TimezoneOffset"); //set default timezone to Daylight Savings
    				}
				}
    		});

			//now everything is populated and we can do any post-processing.
			if($scope.datasheetColDefs.length > 2)
			{
				$scope.addNewRow();
			}

			//set defaults for header fields
			angular.forEach($scope.fields.header, function(field){
				$scope.row[field.DbColumnName] = (field.DefaultValue) ? field.DefaultValue : null;

				//FEATURE: any incoming parameter value that matches a header will get copied into that header value.
				if($routeParams[field.DbColumnName])
				{
					$scope.row[field.DbColumnName] = $routeParams[field.DbColumnName];
				}

			});

			$scope.row.ActivityQAStatus.QAStatusId = ""+$scope.dataset.DefaultActivityQAStatusId;

			$scope.recalculateGridWidth($scope.fields.detail.length);

			$scope.validateGrid($scope);

			console.log("headerFieldErrors is next...");
			console.dir($scope.headerFieldErrors);
			console.log("headerFieldErrors.length = " + $scope.headerFieldErrors.length);
			
			console.log("$scope at end of dataset.Fields watcher...");
			console.dir($scope);
    	});
		
        //update our location options as soon as our project is loaded.
		// The project gets called/loaded in $scope.$watch('dataset.Fields' (above), so $scope.DatastoreTablePrefix was set there.
        $scope.$watch('project.Name', function(){
        	if(!$scope.project) return;
        	//console.dir($scope.project);
			
			console.log("Inside watch project.Name...");
			
			$rootScope.projectId = $scope.project.Id;
			$scope.project.Files = null;
			$scope.project.Files = DataService.getProjectFiles($scope.project.Id);
			
			console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
			$scope.datasetLocationType = DatastoreService.getDatasetLocationType($scope.DatastoreTablePrefix);			
			console.log("LocationType = " + $scope.datasetLocationType);
			
			$scope.subprojectType = DatastoreService.getProjectType($scope.project.Id);
			console.log("$scope.subprojectType = " + $scope.subprojectType);
			DataService.setServiceSubprojectType($scope.subprojectType);
			
			//if ($scope.subprojectType === "Harvest")
			if ($scope.DatastoreTablePrefix === "CreelSurvey")
			{
				console.log("Loading Harvest...");
				$scope.ShowFishermen = true;
			}
			//else if ($scope.subprojectType === "CRPP")
			else if ($scope.DatastoreTablePrefix === "CrppContracts")
			{
				console.log("Loading CRPP subprojects...");
				$scope.ShowSubproject = true;
				$scope.subprojectList = DataService.getSubprojects();
			}
			//else if ($scope.subprojectType === "Habitat")
			//else if ($scope.DatastoreTablePrefix === "Metrics")
			else if (($scope.DatastoreTablePrefix === "Metrics") || 
				($scope.DatastoreTablePrefix === "Benthic") ||
				($scope.DatastoreTablePrefix === "Drift")
				)
			{
				console.log("Loading Habitat subprojects...");				

				$scope.subprojectList = DataService.getProjectSubprojects($scope.project.Id);
				var watcher = $scope.$watch('subprojectList.length', function(){
					console.log("Inside watcher for subprojectList.length...");
					// We wait until subprojects gets loaded and then turn this watch off.
					if ($scope.subprojectList === null)
					{
						console.log("$scope.subprojectList is null");
						return;
					}
					else if (typeof $scope.subprojectList.length === 'undefined')
					{
						console.log("$scope.subprojectList.length is undefined.");
						return;
					}
					else if ($scope.subprojectList.length === 0)
					{
						console.log("$scope.subprojectList.length is 0");
						return;
					}
					
					//if ($scope.DatastoreTablePrefix === "Metrics")
					if (($scope.DatastoreTablePrefix === "Metrics") ||
						($scope.DatastoreTablePrefix === "Benthic") ||
						($scope.DatastoreTablePrefix === "Drift")
						)
					{
						console.log("$scope.subprojectList is next...");
						console.dir($scope.subprojectList);
						console.log("$scope.project.Locations is next...");
						console.dir($scope.project.Locations);
						
						$scope.datasetLocations = [[]]; // Dump the locations, before refilling them.
						angular.forEach($scope.subprojectList, function(subproject){
							angular.forEach($scope.project.Locations, function(location){
								//console.log("location.LocationTypeId = " +  location.LocationTypeId + ", subproject.LocationId = " + subproject.LocationId + ", location.Id = " + location.Id);
								if (subproject.LocationId === location.Id)
								{
									console.log("Found a subproject location")
									console.dir(location);
									$scope.datasetLocations.push([location.Id, location.Label]);
								}
							});						
						});
					}
					
					console.log("datasetLocations (with subprojects) is next...");
					console.dir($scope.datasetLocations);
					
					console.log("$scope.subprojectList.length = " + $scope.subprojectList.length);
					console.dir($scope.subprojectList);
					
					$scope.selectProjectLocationsByLocationType();
					
					watcher();
				});
			}
			//else if ($scope.subprojectType === "DECD")
			else if ($scope.DatastoreTablePrefix === "Appraisal")
			{
				$scope.showDoneButton = false;
			}
			
			if (($scope.DatastoreTablePrefix !== "Metrics") &&
				($scope.DatastoreTablePrefix !== "Benthic") &&
				($scope.DatastoreTablePrefix !== "Drift")
				)
				{
					$scope.selectProjectLocationsByLocationType();
				}
			
			//check authorization -- need to have project loaded before we can check project-level auth
			if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
			{
				$location.path("/unauthorized");
			}

			//if ?LocationId=123 is passed in then lets set it to the given LocationId
			if($routeParams.LocationId)
			{
				$scope.row['locationId'] = ""+$routeParams.LocationId;
			}
			
			console.log("$scope at end of watch project.Name is next...");
			console.dir($scope);
        });
		
		$scope.selectProjectLocationsByLocationType = function(){
			console.log("Inside selectProjectLocationsByLocationType...");
			
			if ($scope.project.Locations)
			{
				console.log("ProjectLocations is next...");
				console.dir($scope.project.Locations);
			
				for (var i = 0; i < $scope.project.Locations.length; i++ )
				{
					//console.log("i = " + i);
					//console.log($scope.project.Locations[i].Id + "  " + $scope.project.Locations[i].Label);
					//console.log("$scope.project.Locations[i].LocationTypeId = " + $scope.project.Locations[i].LocationTypeId + ", $scope.datasetLocationType = " + $scope.datasetLocationType);
					//if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType)
					//if (parseInt($scope.project.Locations[i].LocationTypeId) === parseInt($scope.datasetLocationType))
					//{
						//console.log("Found one");
						// If the label is blank, this item is the Primary Project Location, and the label is null.
					//	if ((typeof $scope.project.Locations[i].Label !== 'undefined') && ($scope.project.Locations[i].Label != null))
					//	{
					//		console.log("$scope.project.Locations[i].Id = " + $scope.project.Locations[i].Id + ", $scope.project.Locations[i].Label = " + $scope.project.Locations[i].Label);
							
							// Note:  We are pushing an ARRAY into $scope.datasetLocations, NOT separate items.
					//		$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]); 									
							
					//		console.log("$scope.datasetLocations (inside the loop) is next");
					//		console.dir($scope.datasetLocations);
							
					//		if ($scope.DatastoreTablePrefix === "FishScales")
					//		{
					//			console.log("Setting $scope.primaryDatasetLocation...");
					//			$scope.primaryDatasetLocation = $scope.project.Locations[i].Id;
					//		}
					//	}
					//}
					
					console.log("$scope.project.Locations[i].LocationTypeId = " + $scope.project.Locations[i].LocationTypeId + ", $scope.datasetLocationType = " + $scope.datasetLocationType);
					if (($scope.DatastoreTablePrefix === "Metrics") ||
						($scope.DatastoreTablePrefix === "Benthic") ||
						($scope.DatastoreTablePrefix === "Drift")
						)
					{
						if (($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType) || ($scope.project.Locations[i].LocationTypeId === LOCATION_TYPE_Hab))
						{
							//console.log("Found Habitat-related location");
							$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
						}
					}
					else
					{
						if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType)
						{
							//console.log("Found non-Habitat-related location");
							$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
						}
						
						if ($scope.DatastoreTablePrefix === "FishScales")
						{
							console.log("Setting $scope.primaryDatasetLocation...");
							$scope.primaryDatasetLocation = $scope.project.Locations[i].Id;
						}
					}
				}
				console.log("datasetLocations (only project/dataset) is next...");
				console.dir($scope.datasetLocations);

				$scope.finishLocationProcessing();
			}
		};
		
		$scope.finishLocationProcessing = function(){
			console.log("Inside $scope.finishLocationProcessing...");
			// When we built the array, it started adding at location 1 for some reason, skipping 0.
			// Therefore, row 0 is blank.  The simple solution is to just delete row 0.
			//$scope.datasetLocations.shift();
			
			// During the original development, the blank row was always at row 0.  Months later, I noticed that 
			// the blank row was not at row 0.  Therefore, it needed a different solution.
			var index = 0;
			//console.log("$scope.datasetLocations (before splice) is next...");
			//console.dir($scope.datasetLocations);
			angular.forEach($scope.datasetLocations, function(dsLoc)
			{
				//if (dsLoc.length === 0)
				//{
				//	$scope.datasetLocations.splice(index, 1);
				//}
				if (typeof dsLoc[0] === 'undefined')
					$scope.datasetLocations.splice(index, 1);
				
				index++;
			});
			
			console.log("datasetLocations after splice is next...");
			console.dir($scope.datasetLocations);	

			// When we feed these locations to makeObjects, Angular sorts them in Id order.  Therefore, this is currently wasted activity.
			//$scope.datasetLocations.sort(order2dArrayByAlpha);
			//console.log("datasetLocations sorted...");
			//console.dir($scope.datasetLocations);

			// Convert our 2D array into an array of objects.
			for (var i = 0; i < $scope.datasetLocations.length; i++)
			{
				$scope.sortedLocations.push({Id: $scope.datasetLocations[i][0], Label: $scope.datasetLocations[i][1]});
			}		
			$scope.datasetLocations = [[]]; // Clean up
			
			
			// Convert our array of objects into a list of objects, and put it in the select box.
			$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.sortedLocations, 'Id','Label') ;

			console.log("locationOptions is next...");
			console.dir($scope.locationOptions);

			//if there is only one location, just set it to that location
			if(array_count($scope.locationOptions)==1)
			{
				//there will only be one.
				angular.forEach(Object.keys($scope.locationOptions), function(key){
					console.log(key);
					$scope.row['locationId'] = key;	
				});
				
			}			
		};

		$scope.reloadProject = function(){
                //reload project instruments -- this will reload the instruments, too
                DataService.clearProject();
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
                var watcher = $scope.$watch('project.Id', function(){
                	$scope.selectInstrument();	
                	watcher();
                });
                
        };

		$scope.openAccuracyCheckModal = function(){

            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-new-accuracycheck.html',
              controller: 'ModalQuickAddAccuracyCheckCtrl',
              scope: $scope, //very important to pass the scope along... 
        
            });
		};

        $scope.createInstrument = function(){
            $scope.viewInstrument = null;
            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: $scope, //very important to pass the scope along...
            });
         };

        $scope.createSurveyor = function(){
            $scope.viewSurveyor = null;
            var modalInstance = $modal.open({
              templateUrl: 'partials/surveyors/modal-create-surveyor.html',
              controller: 'ModalCreateSurveyorCtrl',
              scope: $scope, //very important to pass the scope along...
            });
         };

		$scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

		$scope.selectInstrument = function(){
			if(!$scope.row.InstrumentId)
				return;

			//get latest accuracy check
			$scope.viewInstrument = getByField($scope.project.Instruments, $scope.row.InstrumentId, "Id");
			$scope.row.LastAccuracyCheck = $scope.viewInstrument.AccuracyChecks[$scope.viewInstrument.AccuracyChecks.length-1];
			$scope.row.DataGradeText = getDataGrade($scope.row.LastAccuracyCheck) ;

			if($scope.row.LastAccuracyCheck)
				$scope.row.AccuracyCheckId = $scope.row.LastAccuracyCheck.Id;
		};

		$scope.cancel = function(){
		 	if($scope.dataChanged)
		 	{	
			 	if(!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
			 		return;
			}

		 	$location.path("/"+$scope.dataset.activitiesRoute+"/"+$scope.dataset.Id);
		 };
		

		//adds row to datasheet grid
		$scope.addNewRow = function()
		{
			var row = makeNewRow($scope.datasheetColDefs);
			row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
			$scope.onRow = row;
		};

		// For Creel Survey only. 
		$scope.addSection = function()
		{
			console.log("Inside addSection...");
			console.log("$scope in addSection is next...");
			console.dir($scope);
			
			$scope.addNewSection = true;
			console.log("$scope.addNewSection = " + $scope.addNewSection);
			$scope.saveData();  // Save what we have, before blanking fields.
			
			$scope.addNewSectionWatcherCount = 0;
			var addNewSectionWatcher = $scope.$watch('activities.addNewSection', function(){
				console.log("Inside watcher addNewSection...");
				console.log("$scope.activities.addNewSection = " + $scope.activities.addNewSection);
				if ((typeof $scope.activities.addNewSection !== 'undefined') && ($scope.activities.addNewSection === false))
				{
					if ($scope.addNewSectionWatcherCount === 0)
					{
						console.log("Resetting the page.")
						// Reset the content of specific fields, to blank, null, or 0.
						$scope.row.locationId = 59; // Blank
						$scope.row.TimeStart = null;
						$scope.row.TimeEnd = null;
						$scope.row.NumberAnglersObserved = 0;
						$scope.row.NumberAnglersInterviewed = 0;
						$scope.row.SurveyComments = null;
						$scope.row.FieldSheetFile = null;
						
						// Dump the contents of the datasheet and add the new row.
						$scope.dataSheetDataset = [];
						$scope.addNewRow();									
						$scope.addNewSection = false;

						// This pops the Save Success modal after Add Section.
						var modalInstance = $modal.open({
						  templateUrl: 'partials/success/modal-save-success.html',
						  controller: 'ModalSaveSuccess',
						  scope: $scope, //very important to pass the scope along...
						});
						$scope.addNewSectionWatcherCount++;
					}
				}
			});
			
			console.log("At end of addNewSection; $scope is next...");
			console.dir($scope);
		};
		
		// For Creel Survey only. 
		$scope.addNewInterview = function()
		{
			var row = makeNewRow($scope.datasheetColDefs);
			row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
			$scope.onRow = row;
			
			for (var i = 0; i < $scope.datasheetColDefs.length; i++)
			{
				if (($scope.datasheetColDefs[i].field === "InterviewTime") ||
					($scope.datasheetColDefs[i].field === "GPSEasting") ||
					($scope.datasheetColDefs[i].field === "GPSNorthing") ||
					($scope.datasheetColDefs[i].field === "CarcassComments") ||
					($scope.datasheetColDefs[i].field === "TotalTimeFished")
					)
					{
						$scope.datasheetColDefs[i].enableCellEdit = true;
						//$scope.datasheetColDefs[i].cellEditableCondition = true;
						//$scope.disabledFont();
					}
					
			}
		};
		
		// For Creel Survey only. 
		//Open form to add a fisherman to the database
		$scope.addFisherman = function()
		{
			$scope.viewFisherman = null;
            var modalInstance = $modal.open({
              templateUrl: 'partials/fishermen/modal-create-fisherman.html',
              controller: 'ModalCreateFishermanCtrl',
              scope: $scope, //very important to pass the scope along...
			});
		};

		// For Creel Survey only.
		// Adds another row to datasheet grid and copies common items (surveyor, date, etc.)
		$scope.addAnotherFish = function()
		{
			console.log("Inside addAnotherFish...");
			console.log("$scope before copy is next...");
			console.dir($scope);
						
			var listLength = $scope.dataSheetDataset.length;
			var theFisherman = $scope.dataSheetDataset[listLength-1].FishermanId
			var interviewTime = $scope.dataSheetDataset[listLength-1].InterviewTime;
			var gpsEasting = $scope.dataSheetDataset[listLength-1].GPSEasting;
			var gpsNorthing = $scope.dataSheetDataset[listLength-1].GPSNorthing;
			var interviewComments = $scope.dataSheetDataset[listLength-1].InterviewComments;
			var totalTimeFished = $scope.dataSheetDataset[listLength-1].TotalTimeFished;
			var numberFishCaught = $scope.dataSheetDataset[listLength-1].NumberFishCaught;
			//var qaStatusId = $scope.dataSheetDataset[listLength-1].QAStatusId;
			
			//var x = 0;
			//if (x !== 0)
			//{
			var row = makeNewRow($scope.datasheetColDefs);
			row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
			//row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
			$scope.onRow = row;
			
			listLength = $scope.dataSheetDataset.length;
			$scope.dataSheetDataset[listLength-1].FishermanId = theFisherman;
			$scope.dataSheetDataset[listLength-1].InterviewTime = interviewTime;
			$scope.dataSheetDataset[listLength-1].GPSEasting = gpsEasting;
			$scope.dataSheetDataset[listLength-1].GPSNorthing = gpsNorthing;
			$scope.dataSheetDataset[listLength-1].InterviewComments = interviewComments;
			$scope.dataSheetDataset[listLength-1].TotalTimeFished = totalTimeFished;
			$scope.dataSheetDataset[listLength-1].NumberFishCaught = numberFishCaught;
			//$scope.dataSheetDataset[listLength-1].QAStatusId = qaStatusId;
			
			for (var i = 0; i < $scope.datasheetColDefs.length; i++)
			{
				if (($scope.datasheetColDefs[i].field === "InterviewTime") ||
					($scope.datasheetColDefs[i].field === "GPSEasting") ||
					($scope.datasheetColDefs[i].field === "GPSNorthing") ||
					($scope.datasheetColDefs[i].field === "InterviewComments") ||
					($scope.datasheetColDefs[i].field === "TotalTimeFished")
					)
					{
						$scope.datasheetColDefs[i].enableCellEdit = false;
						//$scope.datasheetColDefs[i].cellEditableCondition = false;
						//$scope.disabledFont();
					}
					
			}

			console.log("$scope after copy is next...");
			console.dir($scope);

			//$scope.reloadProject();

			/*
			$scope.onRow.entity.InterviewTime = interviewTime;
			$scope.onRow.entity.GPSEasting = gpsEasting;
			$scope.onRow.entity.GPSNorthing = gpsNorthing;
			$scope.onRow.entity.CarcassComments = carcassComments;
			$scope.onRow.entity.TotalTimeFished = totalTimeFished;
			$scope.onRow.entity.NumberFishCaught = numberFishCaught;
			*/
			//}
		};
		
   	    //overriding the one in our service because we don't want to allow removing of a blank row.
        $scope.removeRow = function(){
        	if($scope.dataSheetDataset.length > 1)
        		DataSheet.removeOnRow($scope);
        };


		$scope.doneButton = function()
		{
		 	$scope.activities = undefined;
		 	$route.reload();
			$scope.reloadProject();
			//DataSheet.initScope($scope);  // Is this needed at all?
		}

		$scope.viewButton = function()
		{
			$location.path("/"+$scope.dataset.activitiesRoute+"/"+$scope.dataset.Id);
		}

		$scope.viewRelation = function(row, field_name)
        {
        	console.dir(row.entity);
        	var field = $scope.FieldLookup[field_name];
        	console.dir(field);

        	$scope.openRelationEditGridModal(row.entity, field);
        }


		$scope.openRelationEditGridModal = function(row, field)
		{
			$scope.relationgrid_row = row;
			$scope.relationgrid_field = field;
			$scope.isEditable = true;
			var modalInstance = $modal.open({
				templateUrl: 'partials/modals/relationgrid-edit-modal.html',
				controller: 'RelationGridModalCtrl',
				scope: $scope, 
			});
		};

		/* -- these functions are for uploading - */
		$scope.openFileModal = function(row, field)
        {
            console.log("Inside DataEntryFormCtrl, openFileModal");
            //console.dir(row);
            //console.dir(field);
            $scope.file_row = row;
            $scope.file_field = field;
			$rootScope.FieldSheetFile = "";
            
            var modalInstance = $modal.open({
                templateUrl: 'partials/modals/file-modal.html',
                controller: 'FileModalCtrl',
                scope: $scope, //scope to make a child of
            });
        };
		
		$scope.openFileAddModal = function(row, field)
		{
			console.log("Inside DataEditCtrl, openFileAddModal...");
			console.log("row is next...");
			console.dir(row);
			console.log("field is next...");
			console.dir(field);
			$scope.file_row = row;
			$scope.file_field = field;
			
			var modalInstance = $modal.open({
				templateUrl: 'partials/modals/file-add-modal.html',
				controller: 'FileAddModalCtrl',
				scope: $scope, //scope to make a child of
			});
		};
		
		$scope.openFileDeleteModal = function(row, field)
		{
			console.log("Inside DataEditCtrl, openFileDeleteModal...");
			console.log("row is next...");
			console.dir(row);
			console.log("field is next...");
			console.dir(field);
			$scope.file_row = row;
			$scope.file_field = field;
			
			var modalInstance = $modal.open({
				templateUrl: 'partials/modals/file-delete-modal.html',
				controller: 'FileDeleteModalCtrl',
				scope: $scope, //scope to make a child of
			});
		};

		$scope.openWaypointFileModal = function(row, field)
        {
            $scope.file_row = row;
            $scope.file_field = field;
            
            var modalInstance = $modal.open({
                templateUrl: 'partials/modals/waypoint-file-modal.html',
                controller: 'FileModalCtrl',
                scope: $scope, //scope to make a child of
            });
        };

        //field = DbColumnName
        $scope.onFileSelect = function(field, files)
        {
            console.log("Inside DataEntryFormCtrl, onFileSelect");
			console.log("file selected! " + field);
            $scope.filesToUpload[field] = files;
        };

        //this function gets called when a user clicks the "Add" button in a GRID file cell
        $scope.addFiles = function(row, field_name)
        {
            var field = $scope.FieldLookup[field_name];

            //console.dir(row);
            //console.dir(field);
            $scope.openFileModal(row.entity, field);

            //go ahead and mark this row as being updated.
            if($scope.updatedRows)
                $scope.updatedRows.push(row.entity.Id);

        };
      
		$scope.saveData = function(){
			console.log("Inside saveData, $scope is next...");
			console.dir($scope);
			console.log("$rootScope is next...");
			console.dir($rootScope);
			
			/**** CreeSurvey Header Time Time calculations Start ****/
			if ($scope.DatastoreTablePrefix === "CreelSurvey")
			{
				// Headers = row
				// Details = onRow
				
				// Notes relating to date/time...
				// Regarding the month:
				// The getmonth() function is zero-based, so Jan = 0, Feb = 1, etc.
				// When we pull the month below, we are expecting Jan = 1, Feb = 2, etc.
				// To get the date format we need, we must add 1 to the month.
				
				// Regarding the time:
				// When we enter the date in m/d/yyyy (or mm/dd/yyyy) format, the datepicker will leave the time at 00:00.
				// However, when we enter the date in yyyy-mm-dd format, the datepicker applies our timezone offset.
				// PST = -8, PDT = -7
				// Also, the conversion is based upon the ActivityDate you enter, NOT the current time of year.
				// For example, if the user is entering information in June (Daylight time), and the actual date is Feb (Standard time),
				// JavaScript will apply the Standard-time offset.
				// For our purposes, users should be able to enter the date in either m/d/yyyy or yyyy-mm-dd format, and experience
				// the same system behavior.  Therefore, we must allow for those formats in the code.
				console.log("$scope.row.activityDate before adjustment = " + $scope.row.activityDate);
				console.log("Offset = " + $scope.row.activityDate.getTimezoneOffset());
				
				var intHours = $scope.row.activityDate.getHours();
				console.log("Hours = " +  intHours)
				
				if (intHours > 0)
				{
					console.log("The user entered the date in a format that caused the time zone offset to be applied.");
					var newDate = $scope.row.activityDate;
					
					// The returned offset for the time zone is in minutes, so convert to hours.
					var intOffsetHours = $scope.row.activityDate.getTimezoneOffset() / 60;

					newDate.setHours(newDate.getHours() + intOffsetHours);
					$scope.row.activityDate = newDate;
				}
				console.log("$scope.row.activityDate after adjustment = " + $scope.row.activityDate);
				
				var strYear = $scope.row.activityDate.getFullYear().toString();
				console.log("strYear = " + strYear);
				
				var intMonth = $scope.row.activityDate.getMonth() + 1;
				console.log("intMonth = " + intMonth);
				var strMonth = "" + intMonth;
				console.log("strMonth = " + strMonth);
				if (strMonth.length < 2)
					strMonth = "0" + strMonth;
				
				var strDay = $scope.row.activityDate.getDate().toString();
				console.log("strDay = " + strDay);
				if (strDay.length < 2)
					strDay = "0" + strDay;

				var tmpTime = $scope.row.TimeStart;
				console.log("tmpTime (TimeStart) = " + tmpTime);
				if (tmpTime !== null)
				{
					$scope.row.TimeStart = "";
					$scope.row.TimeStart = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
					console.log("$scope.row.TimeStart = " + $scope.row.TimeStart);
				}
				
				tmpTime = $scope.row.TimeEnd;
				console.log("tmpTime (TimeEnd) = " + tmpTime);
				if (tmpTime !== null)
				{
					$scope.row.TimeEnd = "";
					$scope.row.TimeEnd = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
					console.log("$scope.row.TimeEnd = " + $scope.row.TimeEnd);
				}
			}
			/**** CreeSurvey Header Time Time calculations End ****/
			
			// Orignal line.  
			//var promise = UploadService.uploadFiles($scope.filesToUpload, $scope);
			/* Notes:  In the line above, the returned promise is an array.  IE does not handle a promise like that.
			*  According to online documentation, IE does not handle promise at all.  However, my experience has shown the following.
			*  IE cannot handle a promise array (as noted).
			*  IE cannot handle nested promises either.
			*  IE CAN handle a single promise.
			*  So, we have to check for duplicate file names in a different way.
			*  In this method (not necessarily the best way), we do the checking here, rather than calling FileUploadService.uploadFiles in services.js.
			*/
			
			// Firstly, if the user does not attach a file (such was with WaterTemp), we can skip checking for a duplicate file name.
			// WaterTemp is more concerned about imputting duplicate data.  The user may often use the same file, but a different tab.
			// For other datasets (Creel), they do have the concern about uploading a duplicate file.
			
			
			// We need to check for duplicate file names first.
			if ($scope.foundDuplicate)
			{
				alert("One or more of the files to upload is a duplicate!");
				return;
			}
			
			// In modals-controller, FileModalCtrl, the file gets stored in $rootScope.FieldSheetFile.
			// The bucket for the file can change names, depending upon the dataset.
			console.log("$rootScope.FieldSheetFile is next...");
			console.dir($rootScope.FieldSheetFile);
			$scope.filesToUpload.FieldSheetFile = $rootScope.FieldSheetFile;
			
			if ($scope.filesToUpload.FieldSheetFile)
			{
				//for(var i = 0; i < $scope.filesToUpload.FieldSheetFile.length; i++)
				//for(var i = 0; i < $scope.filesToUpload.length; i++)
				for(var i = 0; i < $rootScope.currentFiles.length; i++)
				{
					//var file = $scope.filesToUpload.FieldSheetFile[i];
					var file = $scope.currentFiles[i];
					console.log("file is next...");
					console.dir(file);
					
					var newFileNameLength = file.name.length;
					console.log("file name length = " + newFileNameLength);

					console.log("file.type = " + file.type);
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
					
					if ($scope.foundDuplicate)
						alert(errors);
					else
					{
						console.log("Not a duplicate.  Uploading the file...");
						if(file.success != "Success")
						{
							$scope.upload = $upload.upload({
								//url: serviceUrl + '/data/UploadProjectFile',
								url: serviceUrl + '/data/UploadDatasetFile',
								method: "POST",
								// headers: {'headerKey': 'headerValue'},
								// withCredential: true,
								//data: {ProjectId: $scope.project.Id, Description: "Uploaded file " + file.Name, Title: file.Name},
								data: {ProjectId: $scope.project.Id, DatasetId: $scope.dataset.Id, Description: "Uploaded file " + file.Name, Title: file.Name},
								file: file,

								}).progress(function(evt) {
									console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
								}).success(function(data, status, headers, config) {
									config.file.success = "Success";
								}).error(function(data, status, headers, config) {
									$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
									//console.log(file.name + " was error.");
									config.file.success = "Failed";
								});		
						}
					}
				}

				//spin through the files that we uploaded
				//angular.forEach($scope.filesToUpload, function(files, field){
				angular.forEach($scope.currentFiles, function(files, field){

					if(field == "null" || field == "")
						return;
					
					var local_files = [];
					
					//if we already had actual files in this field, copy them in
					if($scope.file_row[field])
					{
						var current_files = angular.fromJson($scope.file_row[field]);
						angular.forEach(current_files, function(file){
							if(file.Id) //our incoming files don't have an id, just actual files.
								local_files.push(file);		
						});
					}

					$scope.file_row[field] = angular.toJson(local_files);
					//console.log("Ok our new list of files: "+$scope.row[field]);
				});
				
				$scope.saveDatasheetData();
			}
			else
			{
				$scope.saveDatasheetData();
			}
		};
		
		$scope.saveDatasheetData = function(){
			console.log("Inside saveDatasheetData, $scope is next...");
			console.dir($scope);
			
			var strYear = null;
			var strMonth = null;
			var strDay = null;
			var tmpTime = null;
			
			/**** CreeSurvey Detail Time Time calculations Start ****/
			if ($scope.DatastoreTablePrefix === "CreelSurvey")
			{
				strYear = $scope.row.activityDate.getFullYear().toString();
				console.log("strYear = " + strYear);
				
				strMonth = $scope.row.activityDate.getMonth().toString();
				console.log("strMonth = " + strMonth);
				if (strMonth.length < 2)
					strMonth = "0" + strMonth;
				
				strDay = $scope.row.activityDate.getDate().toString();
				console.log("strDay = " + strDay);
				if (strDay.length < 2)
					strDay = "0" + strDay;
				
				
				for (var i = 0; i < $scope.dataSheetDataset.length; i++)
				{
					if ((typeof $scope.dataSheetDataset[i].TotalTimeFished !== 'undefined') && ($scope.dataSheetDataset[i].TotalTimeFished != null))
					{
						console.log("TotalTimeFished for row " + i + " = " + $scope.dataSheetDataset[i].TotalTimeFished);
						var theHours = parseInt($scope.dataSheetDataset[i].TotalTimeFished.substring(0,2));
						console.log("theHours = " + theHours);
						var theMinutes = parseInt($scope.dataSheetDataset[i].TotalTimeFished.substring(3,5));
						console.log("theMinutes = " + theMinutes);
						var TotalTimeFished = theHours * 60 + theMinutes;
						console.log("TotalTimeFished (in min) = " + TotalTimeFished);
						$scope.dataSheetDataset[i].TotalTimeFished = TotalTimeFished;
					}
					
					if ((typeof $scope.dataSheetDataset[i].InterviewTime !== 'undefined') && ($scope.dataSheetDataset[i].InterviewTime !== null))
					{
						tmpTime = $scope.dataSheetDataset[i].InterviewTime;
						//console.log("tmpTime (TimeEnd) = " + tmpTime);
						$scope.dataSheetDataset[i].InterviewTime = "";
						$scope.dataSheetDataset[i].InterviewTime = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
					}
				}
			}
			/**** CreeSurvey Detail Time Time calculations End ****/
			

			
			var sheetCopy = angular.copy($scope.dataSheetDataset);
			console.log("The following items are next: $scope.row, sheetCopy, $scope.fields");
			console.dir($scope.row);
			console.dir(sheetCopy);
			console.dir($scope.fields);
			//throw "Stopping right here...";

			console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
			if ($scope.DatastoreTablePrefix == "FishScales")
			{
				console.log("$scope.primaryDatasetLocation = " + $scope.primaryDatasetLocation);
				$scope.row.locationId = $scope.primaryDatasetLocation;
			}
			else
				console.log("Not working with FishScales...");
			
			if ($scope.DatastoreTablePrefix === "CreelSurvey")
			{
				console.log("$scope.row.Dry = " + $scope.row.Dry);
				if ((typeof $scope.row.Dry === 'undefined') || ($scope.row.Dry === null))
					$scope.row.Dry = "NO";
			}
			console.log("$scope.row.Dry = " + $scope.row.Dry);

			//$scope.activities = ActivityParser.parseSingleActivity($scope.row, sheetCopy, $scope.fields);
			$scope.activities = ActivityParser.parseSingleActivity($scope.row, sheetCopy, $scope.fields, $scope.dataset.QAStatuses);
			if(!$scope.activities.errors)
			{
				if ($scope.addNewSection)
				{
					console.log("$scope.addNewSection is true, so setting $scope.activities.addNewSection to true also.");
					$scope.activities.addNewSection = true;
				}
				console.log("$scope.activities in saveData, just before calling DataService.saveActivities is next...");
				console.dir($scope.activities);	
				DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
			}
			else
			{	
				console.log("We have errors...");
				console.dir($scope.activities.errors);
			}		
		};
	}
]);


//not being used.	
mod_de.controller('ModalDataEntryCtrl', ['$scope', '$modalInstance', 
	function($scope, $modalInstance){
		//DRY alert -- this was copy and pasted... how can we fixy?
		$scope.alerts = [];

		$scope.ok = function(){
			try{
				$scope.addGridRow($scope.row);
				$scope.row = {};
				$scope.alerts.push({type: 'success',msg: 'Added.'});
			}catch(e){
				console.dir(e);
			}
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};

		$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
		};

		$scope.row = {}; //modal fields are bound here

		$scope.dateOptions = {
		    'year-format': "'yy'",
		    'starting-day': 1
		};


	}
]);


