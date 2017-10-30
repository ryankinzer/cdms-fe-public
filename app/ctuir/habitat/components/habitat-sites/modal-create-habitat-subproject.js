
var modal_create_habitat_subproject = ['$scope', '$rootScope','$modalInstance','$modal','DataService','DatastoreService', 'ServiceUtilities', 
	'$timeout', '$location', '$anchorScroll', '$document', '$upload', 
  function($scope, $rootScope, $modalInstance, $modal, DataService, DatastoreService, ServiceUtilities, 
	$timeout, $location, $anchorScroll, $document, $upload){
	console.log("Inside ModalCreateHabSubprojectCtrl...");

    $document.on('keydown', function(e) {
		//console.log("Inside document.on keydown...");
		//console.log("e is next...");
		//console.dir(e);
		//console.log("e.target.nodeName = " + e.target.nodeName);
		
		// Note:  keyCode 8 = Backspace; the nodeName value is in uppercase, so we must check for that here.
		if ((e.keyCode === 8) && (e.target.nodeName === "TEXTAREA"))
		{
			//console.log("  Backspace pressed...and we are in a TEXTAREA");
			//e.preventDefault();
			
			var keyboardEvent = $document[0].createEvent("KeyboardEvent");
			var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
			
			keyboardEvent[initMethod](
				"keydown", // event type : keydown, keyup, keypress
                true, // bubbles
                true, // cancelable
                window, // viewArg: should be window
                false, // ctrlKeyArg
                false, // altKeyArg
                false, // shiftKeyArg
                false, // metaKeyArg
                37, // keyCodeArg : unsigned long the virtual key code, else 0.  37 = Left Arrow key
                0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0				
			);
			//console.log("Just did left arrow...");
			
			document.dispatchEvent(keyboardEvent);
			
			keyboardEvent[initMethod](
				"keydown", // event type : keydown, keyup, keypress
                true, // bubbles
                true, // cancelable
                window, // viewArg: should be window
                false, // ctrlKeyArg
                false, // altKeyArg
                false, // shiftKeyArg
                false, // metaKeyArg
                46, // keyCodeArg : unsigned long the virtual key code, else 0.  46 = Delete key
                0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0				
			);

			//console.log("Doing delete...");			
			return document.dispatchEvent(keyboardEvent);
		}
    });
	
    $scope.header_message = "Create new Habitat project";
	$rootScope.newSubproject = $scope.newSubproject = true;
    $scope.waterbodies = DatastoreService.getWaterBodies();
	$rootScope.habProjectName = $scope.habProjectName = "";
	$scope.showAddDocument = true;
	$scope.savingHabSubproject = false;
	$scope.showFundingBox = false;
	$rootScope.projectId = $scope.project.Id;
	$scope.SdeObjectId = angular.copy($scope.SdeObjectId);
	$scope.NewPoint = false;
	$scope.fundersPresent = false;
	$scope.collaboratorPresent = false;
	$scope.featureImagePresent = false;
	
    $scope.subproject_row = {
        StatusId: 0,
        //OwningDepartmentId: 1,
    };
	
	// This line pulls in the Projection and the UTMZone
	$scope.subproject_row = angular.copy(DEFAULT_LOCATION_PROJECTION_ZONE);
	
	$scope.subproject_row.strFunders = "";
	$scope.subproject_row.Funding = [];
	
	//var fundtionOptionCount = 0;
	/*angular.forEach($scope.metadataList['Funding'].options, function(value){
		console.log("value = " + value);

		var fundingOption = new Object();
		//fundingOption.Checked = false;
		fundingOption.Name = "";
		fundingOption.Amount = 0;
		
		fundingOption.Name = value;
		$scope.subproject_row.Funding.push(fundingOption);
	});
	console.dir($scope.subproject_row.Funding);
	*/
	
	/*$scope.collaboratorList = [];
		$scope.collaboratorList.push({Id: 0, Label: "Blue Mountain Habitat Restoration Council"});
		$scope.collaboratorList.push({Id: 1, Label: "Bureau of Reclamation"});
		$scope.collaboratorList.push({Id: 2, Label: "Bonneville Power Authority"});
		$scope.collaboratorList.push({Id: 3, Label: "Columbia Conservation District"});
		$scope.collaboratorList.push({Id: 4, Label: "CTUIR"});
		$scope.collaboratorList.push({Id: 5, Label: "Eco Trust"});
		$scope.collaboratorList.push({Id: 7, Label: "Grande Ronde Model Watershed"});
		$scope.collaboratorList.push({Id: 8, Label: "Landowners"});
		$scope.collaboratorList.push({Id: 9, Label: "Nez Perce Tribe"});
		$scope.collaboratorList.push({Id: 10, Label: "NF John Day Watershed Council"});
		$scope.collaboratorList.push({Id: 11, Label: "Natural Resource Conservation Service"});
		$scope.collaboratorList.push({Id: 12, Label: "Oregon Department of Fish and Wildlife"});
		$scope.collaboratorList.push({Id: 13, Label: "Oregon Department of Transportation"});
		$scope.collaboratorList.push({Id: 14, Label: "Oregon Watershed Enhancement Board"});
		$scope.collaboratorList.push({Id: 15, Label: "Other"});
		$scope.collaboratorList.push({Id: 16, Label: "Pacific Coastal Salmon Recovery Fund"});
		$scope.collaboratorList.push({Id: 17, Label: "Pomeroy Conservation District"});
		$scope.collaboratorList.push({Id: 18, Label: "Salmon Recovery Funding Board"});
		$scope.collaboratorList.push({Id: 19, Label: "Snake River Salmon Recovery Board"});
		$scope.collaboratorList.push({Id: 20, Label: "Umatilla County Soil and Water Conservation District"});
		$scope.collaboratorList.push({Id: 21, Label: "Umatilla National Forest"});
		$scope.collaboratorList.push({Id: 22, Label: "US Forest Service"});
		$scope.collaboratorList.push({Id: 23, Label: "Wallowa Whitman National Forest"});
		$scope.collaboratorList.push({Id: 24, Label: "Washington Department of Fish and Wildlife"});
		*/
		
	$scope.collaboratorList = [];
		$scope.collaboratorList.push("Blue Mountain Habitat Restoration Council");
		$scope.collaboratorList.push("Bureau of Reclamation");
		$scope.collaboratorList.push("Bonneville Power Authority");
		$scope.collaboratorList.push("Columbia Conservation District");
		$scope.collaboratorList.push("CTUIR");
		$scope.collaboratorList.push("Eco Trust");
		$scope.collaboratorList.push("Grande Ronde Model Watershed");
		$scope.collaboratorList.push("Landowners");
		$scope.collaboratorList.push("Nez Perce Tribe");
		$scope.collaboratorList.push("NF John Day Watershed Council");
		$scope.collaboratorList.push("Natural Resource Conservation Service");
		$scope.collaboratorList.push("Oregon Department of Fish and Wildlife");
		$scope.collaboratorList.push("Oregon Department of Transportation");
		$scope.collaboratorList.push("Oregon Watershed Enhancement Board");
		$scope.collaboratorList.push("Other");
		$scope.collaboratorList.push("Pacific Coastal Salmon Recovery Fund");
		$scope.collaboratorList.push("Pomeroy Conservation District");
		$scope.collaboratorList.push("Salmon Recovery Funding Board");
		$scope.collaboratorList.push("Snake River Salmon Recovery Board");
		$scope.collaboratorList.push("Umatilla County Soil and Water Conservation District");
		$scope.collaboratorList.push("Umatilla National Forest");
		$scope.collaboratorList.push("US Forest Service");
		$scope.collaboratorList.push("Wallowa Whitman National Forest");
		$scope.collaboratorList.push("Washington Department of Fish and Wildlife");
	
	console.log("$scope.collaboratorList is next...");
	console.dir($scope.collaboratorList);
	
	$scope.showCollaboratorOptions = false;
	$scope.showOtherCollaborators = false;
	$scope.showOtherFundingAgency = false;
	$scope.showFunders = false;
	$scope.showFundingOptions = false;
	$scope.subproject_row.strCollaborators = "";
	$scope.subproject_row.Collaborators = [];
	$scope.uploadComplete = false;
	var values = null;
	
	console.log("$scope.subproject_row (after initialization) is next...");
	console.dir($scope.subproject_row);
	
	// $scope.viewSubproject gets set when the user clicks on a subproject.
    if($scope.viewSubproject)
    {
        $scope.header_message = "Edit Habitat project: " + $scope.viewSubproject.ProjectName;
		$rootScope.newSubproject = $scope.newSubproject = false;
		$scope.subprojectFileList = $rootScope.subprojectFileList;
		
        $scope.subproject_row = angular.copy($scope.viewSubproject);
		
		console.log("$scope.subproject_row (in viewSubproject) is next...");
		console.dir($scope.subproject_row);
		
		$scope.showAddDocument = false;
		
		if ((typeof $scope.subproject_row.Collaborators !== 'undefined') && ($scope.subproject_row.Collaborators !== null))
		{
			console.log("$scope.subproject_row.Collaborators is next...");
			console.dir($scope.subproject_row.Collaborators);
			
			var strCollaborators = $scope.subproject_row.Collaborators;
			strCollaborators = strCollaborators.replace(/(\r\n|\r|\n)/gm, ""); // Remove any newlines
			strCollaborators = strCollaborators.replace(/["\[\]]+/g, ''); // Remove any brackets []
			strCollaborators = strCollaborators.trim();
			console.log("strCollaborators = " + strCollaborators);
			
			//$scope.subproject_row.strCollaborators = null; // dump the previous contents.
			$scope.subproject_row.strCollaborators = strCollaborators; // reset its value
			console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);
			if ($scope.subproject_row.strCollaborators.indexOf("Other") > -1)
				$scope.showOtherCollaborators = true;
			
			$scope.subproject_row.strCollaborators = strCollaborators;
			
		}
		
		//if ((typeof $scope.subproject_row.OtherCollaborators !== 'undefined') && ($scope.subproject_row.OtherCollaborators !== null))
		//	$scope.showOtherCollaborators = true;
		
		if ($scope.subproject_row.FeatureImage !== null)
		{
			$scope.subproject_row['ItemFiles'] = '[{"Name":"' + $scope.subproject_row.FeatureImage + '"}]';
		}
				
		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.FirstFoods);
			//console.log("First Foods was an object.");
			//console.log("First Foods = " + values);
			var strFirstFoods = values.toString();
			//console.log("strFirstFoods = " + strFirstFoods);
		}
		catch(e)
		{
			values = $scope.subproject_row.FirstFoods.split(",");
			//console.log("First Foods was a string.");
			var strFirstFoods = $scope.subproject_row.FirstFoods.toString();
			//console.log(strFirstFoods);
		}
		$scope.subproject_row.FirstFoods = values;
		
		values = null; // Set/reuse this variable.		
		try
		{
			values = angular.fromJson($scope.subproject_row.RiverVisionTouchstone);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.RiverVisionTouchstone.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.RiverVisionTouchstone = values;
		
		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.HabitatObjectives);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.HabitatObjectives.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.HabitatObjectives = values;
		
		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.NoaaEcologicalConcerns);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.NoaaEcologicalConcerns.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.NoaaEcologicalConcerns = values;
		
		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.NoaaEcologicalConcernsSubcategories);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.NoaaEcologicalConcernsSubcategories.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.NoaaEcologicalConcernsSubcategories = values;

		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.LimitingFactors);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.LimitingFactors.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.LimitingFactors = values;
		
    }
	
	console.log("$scope inside ModalCreateHabSubprojectCtrl, after initializing, is next...");
	console.dir($scope);

    //var uploadWatch = $scope.$watch('uploadComplete', function(){
    $scope.$watch('uploadComplete', function(){
		if (!$scope.uploadComplete)
			return;
		
		console.log("Inside watch uploadComplete...");
		angular.forEach($scope.filesToUpload, function(files, field){

			if(field == "null" || field == "")
				return;
			
			var local_files = [];

			for(var i = 0; i < files.length; i++)
			{
				console.log("$scope is next...")
				console.dir($scope);
			  
				var file = files[i];
				console.log("Reviewing results on file " + file.Name);
				console.dir(file);
			  
				console.log("$scope.errors is next...");
				console.dir($scope.errors);
				console.log("typeof $scope.errors = " + typeof $scope.errors);
				if(file.data && file.data.length == 1) //since we only upload one at a time...
				{
					//console.dir(file.data);
					local_files.push(file.data[0]); //only ever going to be one if there is any...
					//console.log("file id = "+file.data[0].Id);
				}
				else if (typeof $scope.errors === 'undefined')
				{
					console.log("No errors...");
				}
				else
				{
					//console.log("no file id.");
					$scope.foundDuplicate = true;
					$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
					console.log("$scope is next...");
					console.dir($scope);
					throw "Problem saving file: " + file.Name;
				}
			}

			console.log("$scope.subproject_row is next...");
			console.dir($scope.subproject_row);
			console.log("field = " + field);
			//if we already had actual files in this field, copy them in
			if($scope.subproject_row[field])
			{
				console.log("On Files field...");
				var current_files = angular.fromJson($scope.subproject_row[field]);
				angular.forEach(current_files, function(file){
					if(file.Id) //our incoming files don't have an id, just actual files.
						local_files.push(file);		
				});
			}

			$scope.subproject_row[field] = angular.toJson(local_files);
			//console.log("Ok our new list of files: "+$scope.row[field]);
			
			if ($scope.addDocument === "Yes")
			{
				console.log("$scope.addDocument = Yes...");
				
				// If the user wishes to add a Correspondence Event right away, we must wait to get the ID of the new subproject, before we can continue.
				//$scope.reloadSubproject(promise.Id);
				//var promise2 = $scope.reloadSubproject(promise.Id);
				//console.log("Inside reloadSubproject...");
				//DataService.clearSubproject();
				//DataService.clearHabSubproject(); // Commented out in services.js
				//$scope.reloadSubproject($scope.subprojectId);
				//$modalInstance.dismiss();	
				$scope.openHabitatItemForm();
				//$scope.subproject = DataService.getSubproject(id);
			}
			else
			{
				console.log("$scope.addDocument != Yes");
				
				// If the user just wants to create the Subproject, we can continue without waiting.
				//$scope.reloadSubproject($scope.subprojectId);
				//$modalInstance.dismiss();
			}
			
			DataService.clearSubproject();
			if (($scope.filesToUpload.ItemFiles) || ($scope.NewPoint)) // No new files to upload, and using an existing point.
			{
				console.log("Reloading the whole project, because we have a new location or file...");
				$scope.reloadThisProject();
			}
			else
			{
				console.log("Just reloading the subproject...");
				$scope.reloadSubproject($scope.subprojectId);
			}
		});
		
		//uploadWatch();
	});
	
    $scope.$watch('savingHabSubproject', function(){
		console.log("Inside ModalCreateHabSubprojectCtrl, watch savingHabSubproject...");
		console.log("$scope.savingHabSubproject = " + $scope.savingHabSubproject);

		// The save function saved the location associated to this subproject.
		// This watch saves the actual subproject, and any files associated to it.
		
		//if ((!$scope.subproject_row.LocationId) || ($scope.subproject_row.LocationId === null))
		if ($scope.savingHabSubproject === false)
			return;
		
		var fileAlreadySaved = false;
		// Now begin saving the subproject.
		console.log("$scope.subproject_row.LocationId (in watch) = " + $scope.subproject_row.LocationId);
		
		var saveRow = angular.copy($scope.subproject_row);
		console.log("saveRow (before wiping HabitatItems) is next..");
		console.dir(saveRow);

		saveRow.HabitatItems = undefined;
		console.log("saveRow (after wiping HabitatItems) is next...");
		console.dir(saveRow);
		
		var promise = null;		
		promise = DatastoreService.saveHabSubproject(parseInt($scope.projectId), saveRow, $scope.saveResults);
		
		if (typeof promise !== 'undefined')
		{
			promise.$promise.then(function(){
				//window.location.reload();
				
				// Are we working with a new point, or an existing one?
				if ($scope.NewPoint)
				{
					// Normally, scope.SdeObjectId is set to 0; if it is > 0, then we just saved a new location and need to handle it.
					console.log("promise in $scope.$watch('subproject_row.LocationId' is next...");
					console.dir(promise);
					console.dir($scope);
					$scope.subprojectId = $rootScope.subprojectId = promise.Id;
					console.log("$scope.subprojectId = " + $scope.subprojectId);
					$scope.locationId = promise.LocationId;
					console.log("$scope.locationId = " + $scope.locationId);			
					
					// Note:  In the Save function, we created a location object, but we had no SubprojectId.
					// Now we have subprojects, so let's go back right away and update that Location object, providing the new SubprojectId.
					var newLocation = angular.copy(DEFAULT_LOCATION_PROJECTION_ZONE);
					newLocation.Id = $scope.locationId;
					newLocation.Label = saveRow.ProjectName;
					newLocation.Description = saveRow.ProjectDescription;
					newLocation.GPSEasting = saveRow.GPSEasting;
					newLocation.GPSNorthing = saveRow.GPSNorthing;
					newLocation.ProjectId = parseInt($scope.projectId);
					newLocation.SubprojectId = $scope.subprojectId;
					newLocation.SdeObjectId = $scope.SdeObjectId; // We set this in the $scope.save function.
					newLocation.LocationTypeId = LOCATION_TYPE_Hab;
					newLocation.WaterBodyId = saveRow.WaterBodyId;
					
					console.log("newLocation is next...");
					console.dir(newLocation);
					
					promise = DatastoreService.saveNewProjectLocation($scope.project.Id, newLocation);
					promise.$promise.then(function(){
						//$scope.subproject_row = 'undefined';
						$scope.habProjectName = saveRow.ProjectName;
					});
				}
				else
				{
					console.log("We are working with an existing location...");
				}
				
				var i = 0;  // Number of files.
				var fileSize = 1;
				// Check if we updated the file list.
				if ($scope.filesToUpload.ItemFiles)
				{
					console.log("$scope.filesToUpload.ItemFiles is next...");
					console.dir($scope.filesToUpload.ItemFiles);
					$rootScope.featureImagePresent = $scope.featureImagePresent = true;
					//var i = 0;
					for(i = 0; i < $scope.filesToUpload.ItemFiles.length; i++)
					{
						var file = $scope.filesToUpload.ItemFiles[i];
						console.log("file is next...");
						console.dir(file);
						
						var newFileNameLength = file.name.length;
						console.log("file name length = " + newFileNameLength);

						// Inform the user immediately, if there are duplicate files.
						if ($scope.foundDuplicate)
							alert(errors);
						else
						{
							console.log("file is next again...");
							console.dir(file);
							console.log("file.success = " + file.success);
							if(file.success != "Success")
							{
								console.log("No file.success means we have not saved the file yet, so let's save it...");
								// *** Note:  Timing issue.  After the upload kicks off, JavaScript goes on, running the stuff that follows, and then this completes. ***
								$scope.upload = $upload.upload({
                                    url: serviceUrl + '/api/v1/habsubproject/uploadhabitatfile',
									method: "POST",
									// headers: {'headerKey': 'headerValue'},
									// withCredential: true,
									//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name},
									//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, DatastoreTablePrefix: $scope.DatastoreTablePrefix},
									//data: {ProjectId: $scope.project.Id, SubprojectId: $scope.subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, SubprojectType: "Hab"},
									
									// FeatureImage of 1 = Yes
									// FeatureImage of 0 = No, HabitatItem file
									data: {ProjectId: $scope.project.Id, SubprojectId: $scope.subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, SubprojectType: "Hab", FeatureImage: 1},
									file: file,

									}).progress(function(evt) {
										console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
									}).success(function(data, status, headers, config) {
										//console.log("The following are next:  data, status, headers, config, file");
										console.log("file is next...");
										//console.dir(data);
										//console.dir(status);
										//console.dir(headers);
										//console.dir(config);
										console.dir(file);
										config.file.success = "Success";
										
										console.log("file is next...");
										console.dir(file);
										//var promise = DatastoreService.saveSubprojectFile($scope.project.Id, "Hab", $scope.subprojectId, file);
										//promise.$promise.then(function(){
											console.log("done and success!");
											//reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
											$scope.refreshProjectLocations();
											//$modalInstance.dismiss();
										//});
										
										//$scope.uploadComplete = true;
										
									}).error(function(data, status, headers, config) {
										$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
										//console.log(file.name + " was error.");
										config.file.success = "Failed";
										
									});
									
								//console.log("$scope.upload is next...");
								//console.dir($scope.upload);

							}
							else
							{
								console.log("We have already saved this file...");
								fileAlreadySaved = true;
							}
							
						}
					}
					if (i === 0)
						$rootScope.featureImagePresent = $scope.featureImagePresent = false;
					
					if (!fileAlreadySaved)
						setTimeout($scope.fileUploadResultsReviewer, (i*1000));
					
					/*angular.forEach($scope.filesToUpload, function(files, field){

						if(field == "null" || field == "")
							return;
						
						var local_files = [];

						for(var i = 0; i < files.length; i++)
						{
							console.log("$scope is next...")
							console.dir($scope);
						  
							var file = files[i];
							console.log("Reviewing results on file " + file.Name);
							console.dir(file);
						  
							console.log("$scope.errors is next...");
							console.dir($scope.errors);
							console.log("typeof $scope.errors = " + typeof $scope.errors);
							if(file.data && file.data.length == 1) //since we only upload one at a time...
							{
								//console.dir(file.data);
								local_files.push(file.data[0]); //only ever going to be one if there is any...
								//console.log("file id = "+file.data[0].Id);
							}
							else if (typeof $scope.errors === 'undefined')
							{
								console.log("No errors...");
							}
							else
							{
								//console.log("no file id.");
								$scope.foundDuplicate = true;
								$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
								console.log("$scope is next...");
								console.dir($scope);
								throw "Problem saving file: " + file.Name;
							}
						}

						console.log("$scope.subproject_row is next...");
						console.dir($scope.subproject_row);
						console.log("field = " + field);
						//if we already had actual files in this field, copy them in
						if($scope.subproject_row[field])
						{
							console.log("On Files field...");
							var current_files = angular.fromJson($scope.subproject_row[field]);
							angular.forEach(current_files, function(file){
								if(file.Id) //our incoming files don't have an id, just actual files.
									local_files.push(file);		
							});
						}

						$scope.subproject_row[field] = angular.toJson(local_files);
						//console.log("Ok our new list of files: "+$scope.row[field]);
					});
					*/
				}
				else
				{
					console.log("Not uploading any new files...");
				}
				
				setTimeout($scope.finalPart, ((i+1)*1000));
				
				//$scope.reloadThisProject(); // Reload the project, to reload the project locations (what shows on the map); this will also reload the subprojects.
				//$scope.reloadSubprojects(); // Reload the subprojects, 
				
				
				/*if ($scope.addDocument === "Yes")
				{
					console.log("$scope.addDocument = Yes...");
					
					// If the user wishes to add a Correspondence Event right away, we must wait to get the ID of the new subproject, before we can continue.
					//$scope.reloadSubproject(promise.Id);
					//var promise2 = $scope.reloadSubproject(promise.Id);
					//console.log("Inside reloadSubproject...");
					//DataService.clearSubproject();
					//DataService.clearHabSubproject(); // Commented out in services.js
					//$scope.reloadSubproject($scope.subprojectId);
					$modalInstance.dismiss();	
					$scope.openHabitatItemForm();
					//$scope.subproject = DataService.getSubproject(id);
				}
				else
				{
					console.log("$scope.addDocument != Yes");
					
					// If the user just wants to create the Subproject, we can continue without waiting.
					//$scope.reloadSubproject($scope.subprojectId);
					$modalInstance.dismiss();
				}
				
				DataService.clearSubproject();
				if (($scope.filesToUpload.ItemFiles) || ($scope.NewPoint)) // No new files to upload, and using an existing point.
				{
					console.log("Reloading the whole project, because we have a new location or file...");
					$scope.reloadThisProject();
				}
				else
				{
					console.log("Just reloading the subproject...");
					$scope.reloadSubproject($scope.subprojectId);
				}*/
			});
		}		
	});

	$scope.fileUploadResultsReviewer = function(){
		console.log("Inside $scope.fileUploadResultsReviewer...");
		//angular.forEach($scope.filesToUpload, function(files, field){
		angular.forEach($scope.filesToUpload, function(files, field){

			if(field == "null" || field == "")
				return;
			
			var local_files = [];
			console.log("$scope is next...")
			console.dir($scope);
			
			for(var i = 0; i < files.length; i++)
			{ 
				var file = files[i];
				console.log("Reviewing results on file " + file.Name);
				console.dir(file);
			  
				console.log("$scope.errors is next...");
				console.dir($scope.errors);
				console.log("typeof $scope.errors = " + typeof $scope.errors);
				if(file.data && file.data.length == 1) //since we only upload one at a time...
				{
					//console.dir(file.data);
					local_files.push(file.data[0]); //only ever going to be one if there is any...
					//console.log("file id = "+file.data[0].Id);
				}
				else if (typeof $scope.errors === 'undefined')
				{
					console.log("No errors...");
				}
				else
				{
					//console.log("no file id.");
					$scope.foundDuplicate = true;
					$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
					console.log("$scope is next...");
					console.dir($scope);
					throw "Problem saving file: " + file.Name;
				}
			}

			console.log("$scope.subproject_row is next...");
			console.dir($scope.subproject_row);
			console.log("field = " + field);
			//if we already had actual files in this field, copy them in
			if($scope.subproject_row[field])
			{
				console.log("On Files field...");
				var current_files = angular.fromJson($scope.subproject_row[field]);
				console.log("var current_files is next...");
				console.dir(current_files);
				angular.forEach(current_files, function(file){
					if(file.Id) //our incoming files don't have an id, just actual files.
						local_files.push(file);		
				});
			}

			$scope.subproject_row[field] = angular.toJson(local_files);
			//console.log("Ok our new list of files: "+$scope.row[field]);
		});
	};
	
	$scope.finalPart = function(){
		console.log("Inside $scope.finalPart...");
		if ($scope.addDocument === "Yes")
		{
			console.log("$scope.addDocument = Yes...");
			
			// If the user wishes to add a Habitat Item right away, we must wait to get the ID of the new subproject, before we can continue.
			//$scope.reloadSubproject(promise.Id);
			//var promise2 = $scope.reloadSubproject(promise.Id);
			//console.log("Inside reloadSubproject...");
			//DataService.clearSubproject();
			//DataService.clearHabSubproject(); // Commented out in services.js
			//$scope.reloadSubproject($scope.subprojectId);
			$modalInstance.dismiss();	
			$scope.openHabitatItemForm();
			//$scope.subproject = DataService.getSubproject(id);
		}
		else
		{
			console.log("$scope.addDocument != Yes");
			
			// If the user just wants to create the Subproject, we can continue without waiting.
			//$scope.reloadSubproject($scope.subprojectId);
			
			$scope.subprojects = null;
			$scope.reloadSubprojects();
			$scope.reloadSubprojectLocations();
			
			$modalInstance.dismiss();
		}
		
		DataService.clearSubproject();

		console.log("Reload the whole project; this is the easiest way to capture the updates.");
		// If we use services.js, service.getSubproject, it only reloads what we already had, before the changes.
		// The save action puts the updates in the database, so we must pull the updates (and update our variables in the process) from the database.
		$scope.reloadThisProject();
	};
	
	//$scope.showStartDate = function(){
	//	console.log("$scope.subproject_row.ProjectStartDate (before conversion) = " + $scope.subproject_row.ProjectStartDate);		
		//$scope.subproject_row.ProjectStartDate = setDateTo0000($scope.subproject_row.ProjectStartDate);
	//	console.log("$scope.subproject_row.ProjectStartDate (after conversion) = " + $scope.subproject_row.ProjectStartDate);
	//};
	
	//$scope.showEndDate = function(){
	//	console.log("$scope.subproject_row.ProjectEndDate (before conversion) = " + $scope.subproject_row.ProjectEndDate);		
		//$scope.subproject_row.ProjectEndDate = setDateTo0000($scope.subproject_row.ProjectEndDate);
	//	console.log("$scope.subproject_row.ProjectEndDate (after conversion) = " + $scope.subproject_row.ProjectEndDate);
	//};

	$scope.selectFunder = function () {
		console.log("Inside selectFunder...");
		console.dir($scope);
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
				
		if ($scope.subproject_row.fundingName === "Other")
		{
			$scope.showOtherFunder = true;
			$scope.subproject_row.OtherFundingAgency = "";
		}
		else
		{
			$scope.showOtherFunder = false;
			$scope.subproject_row.OtherFundingAgency = 'undefined';
		}
		
		console.log("$scope.showOtherAgency = " + $scope.showOtherAgency);
	};

	$scope.selectCollaborator = function () {
		console.log("Inside selectCollaborator...");
		console.dir($scope);
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
						
		if ($scope.subproject_row.Collaborators === "Other")
		{
			$scope.showOtherCollaborators = true;
			$scope.subproject_row.OtherCollaborators = "";
		}
		else
		{
			$scope.showOtherCollaborators = false;
			$scope.subproject_row.OtherCollaborators = 'undefined';
		}
		
		console.log("$scope.OtherCollaborators = " + $scope.OtherCollaborators);
	};
	
	$scope.enteredSelectedCollaborators = function () {
		$scope.showCollaboratorOptions = true;
	};
	
	$scope.enteredSomethingElse = function () {
		$scope.showCollaboratorOptions = false;
	};
	
	$scope.collaboratorChanged = function() {
		console.log("Inside collaboratorChanged...");
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
		
		$scope.subproject_row.strCollaborators = $scope.subproject_row.Collaborators.toString();
		if ($scope.subproject_row.strCollaborators.indexOf("Other") > -1)
		{
			$scope.showOtherCollaborators = true;
		}
		else
		{
			$scope.showOtherCollaborators = false;
			$scope.subproject_row.OtherCollaborators = null;
		}
		
		console.log("$scope.showOtherCollaborators = " + $scope.showOtherCollaborators);
	};
	
	$scope.addCollaborator = function() {
		console.log("+C clicked...");
		console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);	
		
		if (typeof $scope.subproject_row.strCollaborators === 'undefined')
			$scope.subproject_row.strCollaborators = "";

		// We will add a new line at the end, so that the string presents well on the page.
		if ($scope.subproject_row.Collaborators === "Other")
		{
			$scope.subproject_row.strCollaborators += $scope.subproject_row.OtherCollaborators + ";\n";			
		}
		else
		{
			$scope.subproject_row.strCollaborators += $scope.subproject_row.Collaborators + ";\n";
		}
		
		console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);		
	};
	
	$scope.removeCollaborator = function() {
		console.log("-C clicked...");
		console.log("$scope.subproject_row.strCollaborators before stripping = " + $scope.subproject_row.strCollaborators);
		
		// First, strip out the new line characters.
		$scope.subproject_row.strCollaborators = $scope.subproject_row.strCollaborators.replace(/(\r\n|\r|\n)/gm, "");
		console.log("$scope.subproject_row.strCollaborators after stripping = " + $scope.subproject_row.strCollaborators);
		
		// Note, we still have the trailing semicolon.
		// Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
		var aryCollaborators = $scope.subproject_row.strCollaborators.split(";");
		
		// Next, get rid of that trailing semicolon.
		aryCollaborators.splice(-1, 1);
		console.dir(aryCollaborators);
		
		// Now we can continue with the delete action.
		var aryCollaboratorsLength = aryCollaborators.length;
		
		// First check if the user entered an "other" funder.
		if (($scope.subproject_row.Collaborators === "Other") && ($scope.subproject_row.OtherCollaborators))
		{	
			for (var i = 0; i < aryCollaboratorsLength; i++)
			{
				console.log("aryCollaborators[i] = " + aryCollaborators[i]);
				if (aryCollaborators[i].indexOf($scope.subproject_row.OtherCollaborators) > -1)
				{
					console.log("Found the item...");
					aryCollaborators.splice(i,1);
					console.log("Removed the item.");
					
					$scope.subproject_row.strCollaborators = "";
					console.log("Wiped $scope.subproject_row.strCollaborators...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryCollaborators, function(item){
						$scope.subproject_row.strCollaborators += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryCollaboratorsLength;
				}
			}
		}
		else
		{
			for (var i = 0; i < aryCollaboratorsLength; i++)
			{
				console.log("aryCollaborators[i] = " + aryCollaborators[i]);
				if (aryCollaborators[i].indexOf($scope.subproject_row.Collaborators) > -1)
				{
					console.log("Found the item...");
					aryCollaborators.splice(i,1);
					console.log("Removed the item.");
					
					$scope.subproject_row.strCollaborators = "";
					console.log("Wiped $scope.subproject_row.strCollaborators...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryCollaborators, function(item){
						$scope.subproject_row.strCollaborators += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryCollaboratorsLength;
				}
			}
		}
		console.log("Finished.");
	};
	
	/*$scope.fundingItemClicked = function(itemChecked) {
		console.log("itemChecked = " + itemChecked);
		console.log("$scope.subproject_row.Funding is next...");
		console.dir($scope.subproject_row.Funding);
		if ($scope.subproject_row.Funding.Checked)
			$scope.showFundingBox = false;
		else
			$scope.showFundingBox = true;
		
		console.log("$scope.showFundingBox = " + $scope.showFundingBox);
	};*/
	
	$scope.addFundingAgency = function() {
		console.log("+FA clicked...");
		console.log("$scope.subproject_row.strFunders = " + $scope.subproject_row.strFunders);
		//console.log("$scope.subproject_row.Funding.Amount = " + $scope.subproject_row.Funding.Amount + ", typeof $scope.subproject_row.Funding.Amount = " + typeof $scope.subproject_row.Funding.Amount);
		console.log("$scope.subproject_row.fundingAmount = " + $scope.subproject_row.fundingAmount + ", typeof $scope.subproject_row.fundingAmount = " + typeof $scope.subproject_row.fundingAmount);
		
		//if (!$scope.subproject_row.Funding.Amount) //|| (!$scope.subproject_row.Funding.Amount.trim()))
		if (!$scope.subproject_row.fundingAmount) //|| (!$scope.subproject_row.Funding.Amount.trim()))
		{
			alert("If you add a Funding Agency, you MUST enter a funding amount.");
			return;
		}
		
		// First, capture what we really need for a number ($ and commas are OK, but we strip them out).
		//var amt1 = $scope.subproject_row.Funding.Amount.replace(/(,|\$)/gm, "");  // Remove the $ and commas.
		
		// Next, locate the decimal; there should only be one.
		//var decimalLoc1 = $scope.subproject_row.Funding.Amount.indexOf(".");  // Find the decimal.
		//var decimalLoc2 = $scope.subproject_row.Funding.Amount.lastIndexOf(".");  // Find the last decimal; the number can have only one decimal.
		
		// Remove the decimals.
		//var noDecimal = amt1.replace(/./gm, "");  // Remove the decimals now.
		
		// Remove the digits.
		//var noDigits = noDecimal.replace(/\d/gm, "");  // Now remove the digits.
		
		// If anything remains now, the value is not a number.
		//console.log("decimalLoc1 = " + decimalLoc1 + ", decimalLoc2 = " + decimalLoc2);
		//if (decimalLoc1 !== decimalLoc2)
		//{
		//	alert("Only one decimal (.) is allowed.");
		//	return;
		//}
		//$scope.subproject_row.Funding.Amount = $scope.subproject_row.Funding.Amount.replace(/(,|\$)/gm, "");
		
		//console.log("$scope.subproject_row.Funding.Name = " + $scope.subproject_row.Funding.Name);
		console.log("$scope.subproject_row.fundingName = " + $scope.subproject_row.fundingName);
		//console.log("$scope.subproject_row.Funding.Amount = " + $scope.subproject_row.Funding.Amount);
		console.log("$scope.subproject_row.fundingAmount = " + $scope.subproject_row.fundingAmount);

		if (typeof $scope.subproject_row.strFunders === 'undefined')
			$scope.subproject_row.strFunders = "";
		
		// We will add a new line at the end, so that the string presents well on the page.
		if ($scope.subproject_row.fundingName === "Other")
		{
			$scope.subproject_row.strFunders += $scope.subproject_row.OtherFundingAgency + ", " + $scope.subproject_row.fundingAmount + ";\n";			
		}
		else
		{
			//$scope.subproject_row.strFunders += $scope.subproject_row.Funding.Name + ", " + $scope.subproject_row.Funding.Amount + ";\n";
			$scope.subproject_row.strFunders += $scope.subproject_row.fundingName + ", " + $scope.subproject_row.fundingAmount + ";\n";
		}
		
		console.log("$scope.subproject_row.strFunders = " + $scope.subproject_row.strFunders);
	};
	
	$scope.removeFundingAgency = function() {
		console.log("- clicked...");
		console.log("$scope.subproject_row.strFunders before stripping = " + $scope.subproject_row.strFunders);
		
		// First, strip out the new line characters.
		//$scope.subproject_row.strFunders = $scope.subproject_row.strFunders.replace(/[^\x00-\x1F]/gmi, "");
		$scope.subproject_row.strFunders = $scope.subproject_row.strFunders.replace(/(\r\n|\r|\n)/gm, "");
		console.log("$scope.subproject_row.strFunders after stripping = " + $scope.subproject_row.strFunders);
		
		// Note, we still have the trailing semicolon.
		// Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
		var aryFunders = $scope.subproject_row.strFunders.split(";");
		
		// Next, get rid of that trailing semicolon.
		aryFunders.splice(-1, 1);
		console.dir(aryFunders);
		
		// Now we can continue with the delete action.
		var aryFundersLength = aryFunders.length;
		
		// First check if the user entered an "other" funder.
		if (($scope.subproject_row.fundingName === "Other") && ($scope.subproject_row.OtherFundingAgency))
		{	
			for (var i = 0; i < aryFundersLength; i++)
			{
				console.log("aryFunders[i] = " + aryFunders[i]);
				if (aryFunders[i].indexOf($scope.subproject_row.OtherFundingAgency) > -1)
				{
					console.log("Found the item...");
					aryFunders.splice(i,1);
					console.log("Removed the item.");
					
					$scope.subproject_row.strFunders = "";
					console.log("Wiped $scope.subproject_row.strFunders...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryFunders, function(item){
						$scope.subproject_row.strFunders += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryFundersLength;
				}
			}
		}
		else
		{
			for (var i = 0; i < aryFundersLength; i++)
			{
				console.log("aryFunders[i] = " + aryFunders[i]);
				if (aryFunders[i].indexOf($scope.subproject_row.fundingName) > -1)
				{
					console.log("Found the item...");
					aryFunders.splice(i,1);
					console.log("Removed the item.");
					
					$scope.subproject_row.strFunders = "";
					console.log("Wiped $scope.subproject_row.strFunders...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryFunders, function(item){
						$scope.subproject_row.strFunders += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryFundersLength;
				}
			}
		}
		console.log("Finished.");
	};
	
	$scope.openFileModal = function(row, field)
	{
		console.log("Inside ModalCreateHabSubprojectCtrl, openFileModal...");
		console.log("row is next...");
		console.dir(row);
		console.log("field is next...");
		console.dir(field);
		$scope.file_row = row;
		//$scope.file_field = field;
		$scope.file_field = {
			DbColumnName: "ItemFiles"
		};
		
		var modalInstance = $modal.open({
			templateUrl: 'app/core/common/components/file/templates/modal-file.html',
			controller: 'FileModalCtrl',
			scope: $scope, //scope to make a child of
		});
	};
	
	$scope.onFileSelect = function(field, files)
	{
		console.log("Inside ModalCreateHabSubprojectCtrl, onFileSelect");
		console.log("file selected! " + field);
		$scope.filesToUpload[field] = files;
	};
	
	/*$scope.$watch('fileProgress', function(){
		console.log("Inside watch fileProgress...");
		console.log("$scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
		if($scope.fileProgress < $scope.fileCount)
			return;
		
		if ($scope.saving)
		{
			$scope.loading = false; // Stop the fish spinner.
			$scope.showCloseButton = true;
			$scope.showCancelButton = false;
			$scope.showFormItems = false;
		}
	});
	*/
	
    $scope.save = function(){
		console.log("Inside ModalCreateHabSubprojectCtrl, save...");
		$scope.subprojectSave = undefined;
		$scope.subprojectSave = [];
		$scope.subprojectSave.error = false;
		$scope.subprojectSave.errorMessage = "";
		$scope.savingHabSubproject = false;
		$scope.subproject_row.Funding = []; // Declare this again.
		$scope.subproject_row.Collaborators = []; // Declare this again.
		$scope.createNewSubproject = false;
		//$scope.featureImage = null;
		$scope.locationId = 0;
		$scope.NewPoint = false;
		//$scope.subproject_row.LocationTypeId = 112; // Metrics
		
		// Note:  The main thing that we do in this function is save the new location for the Subproject.
		// After we save the location, the watch for $scope.savingHabSubproject run, and it saves the subproject.
		
		if ((typeof $scope.subproject_row.ProjectName === 'undefined') || ($scope.subproject_row.ProjectName === null))
		{
			console.log("Project name is empty...");
			$scope.subprojectSave.error = true;
			$scope.subprojectSave.errorMessage = "Project Name cannot be blank!  ";
		}
		
		if ((typeof $scope.subproject_row.GPSEasting === 'undefined') || (typeof $scope.subproject_row.GPSNorthing === 'undefined'))
		{
			console.log("Easting or Northing is blank...");
			$scope.subprojectSave.error = true;
			$scope.subprojectSave.errorMessage += "Easting and Northing cannot be blank!  ";
		}
		
		console.log("$scope is next...");
		console.dir($scope);
		
		if (!$scope.subprojectSave.error)
		{
			console.log("$scope.subproject_row, full is next...");
			console.dir($scope.subproject_row);

			// Capture the AddDocument flag, before discarding it.			
			$scope.addDocument = $scope.subproject_row.AddDocument;
			$scope.subproject_row.AddDocument = null;
			
			if (!$scope.subproject_row.LocationId)
				$scope.subproject_row.LocationId = 0;
			
			/********* A note about time start ***********/
			/* 	When we save the subproject, when the backend converts the ProjectStartDate and ProjectEndDate to UTC (adds 8 hours).
				So, with an initial saved time of 0000, the backend converts it to 0800.
				Each time we save then, the time will have 8 hours added to it.  On the 4th save, it will go into the next day.
				To avoid this, we take the saved date (now 0800), and set it back to 0000.
				This will keep the time in the same spot (keep it from changing).
				There may be a better way to handle this issue, but this technique works too...
			*/
			
			if ($scope.subproject_row.ProjectStartDate)
			{
				var psDate = new Date(Date.parse($scope.subproject_row.ProjectStartDate));
				$scope.subproject_row.ProjectStartDate = setDateTo0000(psDate);
			}
			
			if ($scope.subproject_row.ProjectEndDate)
			{
				var peDate = new Date(Date.parse($scope.subproject_row.ProjectEndDate));
				$scope.subproject_row.ProjectEndDate = setDateTo0000(peDate);
			}
			/********* A note about time end ***********/

			console.log("$scope.addDocument = " + $scope.addDocument);
			console.log("$scope.subproject_row, after del is next...");
			console.dir($scope.subproject_row);			
			
			$scope.saveResults = {};
			console.log("$scope is next...");
			console.dir($scope);
			
			// First, a little cleanup.
			$scope.subprojectSave.error = false;
			$scope.subprojectSave.errorMessage = "";
			
			// Check the Feature Image box.
			/*if ((typeof $scope.subproject_row['ItemFiles'] !== 'undefined') && (typeof $scope.subproject_row['ItemFiles'] !== 'undefined'))
			{
				$scope.subproject_row.featureImage = 1;
			}
			else
			{
				$scope.subproject_row.featureImage = null;
			}
			*/
			
			// First Foods
			console.log("First Foods = " + $scope.subproject_row.FirstFoods);
			
			// Funding
			console.log("$scope.subproject_row.Funding is next...");
			console.dir($scope.subproject_row.Funding);
			console.log("type of $scope.subproject_row.Funding = " + typeof $scope.subproject_row.Funding);
			
			//if ($scope.subproject_row.Funding.length > 0)
			if ((typeof $scope.subproject_row.strFunders !== 'undefined') && ($scope.subproject_row.strFunders !== null) && ($scope.subproject_row.strFunders.length > 0))
			{
				if ($scope.subproject_row.strFunders.length > 0)
				{
					$rootScope.fundersPresent = $scope.fundersPresent = true;
					var strFunders = $scope.subproject_row.strFunders.replace(/(\r\n|\r|\n)/gm, "");  // Remove all newlines (used for presentation).
					var aryFunders = $scope.subproject_row.strFunders.split(";");  // 
					aryFunders.splice(-1, 1);
					
					angular.forEach(aryFunders, function(item) {
						console.log("item = " + item);
						var funderRecord = item.split(",");
						
						var fundingOption = new Object();
						//fundingOption.Checked = false;
						fundingOption.Id = 0;
						fundingOption.Name = "";
						fundingOption.Amount = 0;
						
						fundingOption.Name = funderRecord[0].trim();
						console.log("fundingOption.Name = " + fundingOption.Name);
						
						// Get the Id for the funder from funderList.
						//angular.forEach($scope.funderList, function(funder) {
						//	if (funder.Name = fundingOption.Name)
						//		fundingOption.Id = funder.Id;
						//});
						
						fundingOption.Amount = parseFloat(funderRecord[1]);
						console.log("fundingOption.Amount = " + fundingOption.Amount);
						
						$scope.subproject_row.Funding.push(fundingOption);		
					});
					$scope.subproject_row.strFunders = undefined;
				}
			}
			
			// Collaborators
			console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);
			console.log("type of $scope.subproject_row.strCollaborators = " + typeof $scope.subproject_row.strCollaborators);
	
			if ((typeof $scope.subproject_row.strCollaborators !== 'undefined') && ($scope.subproject_row.strCollaborators !== null) && ($scope.subproject_row.strCollaborators.length > 0))
			{
				$rootScope.collaboratorPresent = $scope.collaboratorPresent = true;
				var strCollaborators = $scope.subproject_row.strCollaborators.replace(/(\r\n|\r|\n)/gm, "");  // Remove all newlines (used for presentation).
				console.log("strCollaborators = " + strCollaborators);
				var aryCollaborators = $scope.subproject_row.strCollaborators.split(";");  // 
				//aryCollaborators.splice(-1, 1);
				
				angular.forEach(aryCollaborators, function(item) {
					//After the split on ";", one of the lines is a newline.  We need to watch for and omit that line.
					//console.log("item = X" + item + "X");
					//item = item.replace(/(\r\n|\r|\n)/gm, "");
					item = item.replace(/\n/g, "");
					//console.log("item = X" + item + "X");
					
					if (item.length > 0)
					{
						var collaboratorOption = new Object();
						collaboratorOption.Id = 0;
						collaboratorOption.Name = "";
						
						collaboratorOption.Name = item.trim();
						//console.log("collaboratorOption.Name = " + collaboratorOption.Name);
						
						$scope.subproject_row.Collaborators.push(collaboratorOption);
					}
				});
				$scope.subproject_row.strCollaborators = undefined;
			}
			//$scope.savingHabSubproject = true;
			
			var subprojectId = 0;
			// Are we creating a new Subproject, or editing an existing one?
			if ($scope.viewSubproject)
			{
				console.log("We are editing an existing subproject; no new location needed...");
				subprojectId = $scope.viewSubproject.Id
				
				// We put this inside both branches of the if, because we need the branch to complete, before the watch triggers.
				$scope.savingHabSubproject = true;
			}
			else
			{
				subprojectId = $scope.subprojectId;
				
				//$scope.viewSubproject either does not exist or is null, so we are creating a new Subproject.
				// Next, we add/save the location.
				console.log("This is a new subproject; creating a new location...");
				var newLocation = angular.copy(DEFAULT_LOCATION_PROJECTION_ZONE);
				newLocation.Label = $scope.subproject_row.ProjectName;
				newLocation.Description = $scope.subproject_row.ProjectDescription;
				newLocation.GPSEasting = $scope.subproject_row.GPSEasting;
				newLocation.GPSNorthing = $scope.subproject_row.GPSNorthing;
				newLocation.ProjectId = parseInt($scope.projectId);
				newLocation.LocationTypeId = LOCATION_TYPE_Hab;
				newLocation.WaterBodyId = $scope.subproject_row.WaterBodyId;
				//newLocation.SubprojectId = $scope.subprojectId; // When we are creating a new subproject, we do not have the subprojectId yet; this is from the old one.
				console.log("newLocation is next...");
				console.dir(newLocation);
				
				//nad83 zone 11...  might have to have this as a list somehwere...
				var inSR = new esri.SpatialReference({ wkt: NAD83_SPATIAL_REFERENCE });
				var outSR = new esri.SpatialReference({wkid: 102100});
				var geometryService = new esri.tasks.GeometryService(GEOMETRY_SERVICE_URL);
				$scope.newPoint = new esri.geometry.Point(newLocation.GPSEasting, newLocation.GPSNorthing, inSR);			

				//convert spatial reference
				var PrjParams = new esri.tasks.ProjectParameters();

				PrjParams.geometries = [ $scope.newPoint ];
				// PrjParams.outSR is not set yet, so we must set it also.
				PrjParams.outSR = outSR;

				//do the projection (conversion)
				geometryService.project(PrjParams, function(outputpoint) {

					$scope.newPoint = new esri.geometry.Point(outputpoint[0], outSR);
					$scope.newGraphic = new esri.Graphic($scope.newPoint, new esri.symbol.SimpleMarkerSymbol());
					$scope.map.graphics.add($scope.newGraphic);

					//add the graphic to the map and get SDE_ObjectId
					$scope.map.locationLayer.applyEdits([$scope.newGraphic],null,null).then(function(results){

						if(results[0].success)
						{
							newLocation.SdeObjectId = $scope.SdeObjectId = results[0].objectId;
							$scope.setSdeObjectId($scope.SdeObjectId);
							console.log("Created a new point! "+ newLocation.SdeObjectId);
							$scope.NewPoint = true;

							var promise = DatastoreService.saveNewProjectLocation($scope.project.Id, newLocation);
							promise.$promise.then(function(result){
								console.log("done and success!");
								console.log("result is next...");
								console.dir(result);
								angular.forEach(result, function(item, key){
									//console.log("key = " + key + ", item is next...");
									//console.dir(item);
									if (key === "Id")
									{
										//$scope.locationId = promise.LocationId;
										$scope.subproject_row.LocationId = item;
										console.log("$scope.subproject_row.LocationId = " + $scope.subproject_row.LocationId);
										
										// We put this inside both branches of the if ($scope.viewSubproject), because we need the branch to complete, before the watch triggers. ...Obsolete?
										$scope.savingHabSubproject = true;
									}
								});
						
								//reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
								//$scope.refreshProjectLocations();
								//$modalInstance.dismiss();  // This is from the ActivitiesConroller, ModalAddLocationCtrl.  We have this down below, so we do not need it here; it causes an error.
							});

						}
						else
						{
							$scope.subprojectSave.errorMessage = "There was a problem saving that location.";
						}

					});
				});
			}
			
			// If we had a problem saving the location, stop here and do not save the subproject.
			if ($scope.subprojectSave.errorMessage.length > 0)
			{
				console.log("Had a problem saving the location.  Stopping the save...");
				return;
			}
		}
    };

    $scope.cancel = function(){	
		$scope.subproject_row = 'undefined';
        $modalInstance.dismiss();
		$scope.reloadSubprojects();

    };
  }
];
