//controller for modal-create-habSubproject.html
// create/edit habitat subproject

var modal_create_habitat_subproject = ['$scope', '$rootScope', '$uibModalInstance', '$uibModal', 'DatasetService','CommonService','SubprojectService', 'ServiceUtilities', 
	'$timeout', '$location', '$anchorScroll', '$document', 'Upload', 
    function ($scope, $rootScope, $modalInstance, $modal, DatasetService, CommonService, SubprojectService, ServiceUtilities, 
	$timeout, $location, $anchorScroll, $document, $upload){
	console.log("Inside ModalCreateHabSubprojectCtrl...");

    initEdit(); //prevent backspace

    $scope.header_message = "Create new Habitat project";
	$rootScope.newSubproject = $scope.newSubproject = true;
    $scope.waterbodies = CommonService.getWaterBodies();
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
    $scope.subprojectId = 0; 
	
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
	
	//console.log("$scope.collaboratorList is next...");
	//console.dir($scope.collaboratorList);
	
	$scope.showCollaboratorOptions = false;
	$scope.showOtherCollaborators = false;
	$scope.showOtherFundingAgency = false;
	$scope.showFunders = false;
	$scope.showFundingOptions = false;
	$scope.subproject_row.strCollaborators = "";
	$scope.subproject_row.Collaborators = [];
	$scope.uploadComplete = false;
	var values = null;
	
	//console.log("$scope.subproject_row (after initialization) is next...");
	//console.dir($scope.subproject_row);
	
	//if we are editing, viewSubproject will be set. -- prepare scope for editing...
    if ($scope.viewSubproject) {
        $scope.header_message = "Edit Habitat project: " + $scope.viewSubproject.ProjectName;
        $rootScope.newSubproject = $scope.newSubproject = false;
        $scope.subprojectFileList = $rootScope.subprojectFileList;

        $scope.subproject_row = angular.copy($scope.viewSubproject);
        $scope.subprojectId = $scope.subproject_row.Id;

        $scope.showAddDocument = false;

        /* kb commented out 11/21 - not used?
        if ((typeof $scope.subproject_row.Collaborators !== 'undefined') && ($scope.subproject_row.Collaborators !== null))
        {
            //console.log("$scope.subproject_row.Collaborators is next...");
            //console.dir($scope.subproject_row.Collaborators);
            	
            var strCollaborators = $scope.subproject_row.Collaborators;
            strCollaborators = strCollaborators.replace(/(\r\n|\r|\n)/gm, ""); // Remove any newlines
            strCollaborators = strCollaborators.replace(/["\[\]]+/g, ''); // Remove any brackets []
            strCollaborators = strCollaborators.trim();
            console.log("strCollaborators = " + strCollaborators);
            	
            //$scope.subproject_row.strCollaborators = null; // dump the previous contents.
            $scope.subproject_row.strCollaborators = strCollaborators; // reset its value
            //console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);
            if ($scope.subproject_row.strCollaborators.indexOf("Other") > -1)
                $scope.showOtherCollaborators = true;
            	
            $scope.subproject_row.strCollaborators = strCollaborators;
            	
        }
        */

        if ($scope.subproject_row.FeatureImage !== null) {
            $scope.subproject_row.ItemFiles = '[{"Name":"' + $scope.subproject_row.FeatureImage + '"}]';
        }


        values = null; // Set/reuse this variable.
        var strFirstFoods = null
        try {
            values = angular.fromJson($scope.subproject_row.FirstFoods);
            //console.log("First Foods was an object.");
            //console.log("First Foods = " + values);
            strFirstFoods = values.toString();
            //console.log("strFirstFoods = " + strFirstFoods);
        }
        catch (e) {
            if ($scope.subproject_row.FirstFoods) {
                values = $scope.subproject_row.FirstFoods.split(",");
                strFirstFoods = $scope.subproject_row.FirstFoods.toString();
            }
            else {
                values = "";
                strFirstFoods = "";
            }
                
            //console.log("First Foods was a string.");
            
            //console.log(strFirstFoods);
        }
        $scope.subproject_row.FirstFoods = values;

        values = null; // Set/reuse this variable.		
        try {
            values = angular.fromJson($scope.subproject_row.RiverVisionTouchstone);
            //console.log("It was an object.");
        }
        catch (e) {
            values = $scope.subproject_row.RiverVisionTouchstone.split(",");
            //console.log("It was a string.");
        }
        $scope.subproject_row.RiverVisionTouchstone = values;

        values = null; // Set/reuse this variable.
        try {
            values = angular.fromJson($scope.subproject_row.HabitatObjectives);
            //console.log("It was an object.");
        }
        catch (e) {
            values = $scope.subproject_row.HabitatObjectives.split(",");
            //console.log("It was a string.");
        }
        $scope.subproject_row.HabitatObjectives = values;

        values = null; // Set/reuse this variable.
        try {
            values = angular.fromJson($scope.subproject_row.NoaaEcologicalConcerns);
            //console.log("It was an object.");
        }
        catch (e) {
            values = $scope.subproject_row.NoaaEcologicalConcerns.split(",");
            //console.log("It was a string.");
        }
        $scope.subproject_row.NoaaEcologicalConcerns = values;

        values = null; // Set/reuse this variable.
        try {
            values = angular.fromJson($scope.subproject_row.NoaaEcologicalConcernsSubcategories);
            //console.log("It was an object.");
        }
        catch (e) {
            values = $scope.subproject_row.NoaaEcologicalConcernsSubcategories.split(",");
            //console.log("It was a string.");
        }
        $scope.subproject_row.NoaaEcologicalConcernsSubcategories = values;

        values = null; // Set/reuse this variable.
        try {
            values = angular.fromJson($scope.subproject_row.LimitingFactors);
            //console.log("It was an object.");
        }
        catch (e) {
            values = $scope.subproject_row.LimitingFactors.split(",");
            //console.log("It was a string.");
        }
        $scope.subproject_row.LimitingFactors = values;

        //ok, all initialized... now:
        //mixin the properties and functions to enable the modal file chooser for this controller...
        modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.viewSubproject.Files);

    } else {
        //mixin the properties and functions to enable the modal file chooser for this controller...
        modalFiles_setupControllerForFileChooserModal($scope, $modal, []); //last param is files to check for duplicates... we are new, so we don't have any.
    }
	
	console.log("inside ModalCreateHabSubprojectCtrl, after initializing");

    
    //this is called to after the location is saved (if necessary) by the save() function.
    $scope.saveFilesAndParent = function () {

        var saveRow = angular.copy($scope.subproject_row);
        console.log("saveRow (before wiping HabitatItems) is next..");
        console.dir(saveRow);

        saveRow.HabitatItems = undefined;
        console.log("saveRow (after wiping HabitatItems) is next...");
        console.dir(saveRow);

        //if we are saving a new project...
        if ($scope.subprojectId === 0) {
            console.log("saveFielsAndParent -- we are creating a new one before we sav so that we have the subprojectId...");

            var save_subproject_promise = SubprojectService.saveHabSubproject(parseInt($scope.projectId), saveRow, $scope.saveResults);
            save_subproject_promise.$promise.then(function () {
                console.log("Back from save_subproject_promise!");
                console.log(save_subproject_promise);

                $scope.subprojectId = save_subproject_promise.Id;
                $scope.subproject_row.Id = save_subproject_promise.Id;
                $scope.saveFilesAndParent(); //call ourselves again now that our ID is set.
            }, function (error) {
                console.error("something went wrong: ", error);
            });
            return;
        }

        //if we are editing a project, we carry on from here...
        var data = {
            ProjectId: $scope.project.Id,
            SubprojectId: $scope.subprojectId,
            SubprojectType: "Hab",
            FeatureImage: 1
        };

        var target = '/api/v1/habsubproject/uploadhabitatfile';

        $scope.handleFilesToUploadRemove(saveRow, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.

    }

    //callback that is called from modalFile to do the actual file removal (varies by module)
    $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
        return SubprojectService.deleteHabitatItemFile($scope.projectId, $scope.subprojectId, saveRow.Id, file_to_remove);
    }
    
    //call back from save above once the files are done processing and we're ready to save the item
    $scope.modalFile_saveParentItem = function (saveRow) {

        var promise;

        //we are always here with a subproject id, so first handle saving the location (if new) so that saveHabSubproject doesn't fail (it requires a valid location)

        // Are we working with a new point, or an existing one?
        if ($scope.NewPoint) {
            console.log(" -------------- creating a new point 000000000000000000 ");
            // Normally, scope.SdeObjectId is set to 0; if it is > 0, then we just saved a new location and need to handle it.
            //console.log("promise in $scope.$watch('subproject_row.LocationId' is next...");
            //console.dir(promise);
            //console.dir($scope);
            //$scope.subprojectId = $rootScope.subprojectId = promise.Id;
            console.log("$scope.subprojectId = " + $scope.subprojectId);
            //$scope.locationId = promise.LocationId;
            $scope.locationId = $scope.subproject_row.LocationId;

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

            var loc_promise = CommonService.saveNewProjectLocation($scope.project.Id, newLocation);

            loc_promise.$promise.then(function () {
                console.log("Adding this to the project locations: ");
                console.dir(loc_promise);
                console.log(" -- locations after");
                console.dir($scope.project.Locations);
                $scope.project.Locations.push(loc_promise); //add to our list of locations.

                $scope.reloadSubprojectLocations();

                //ok once this is done we can save our hab sub project
                promise = SubprojectService.saveHabSubproject(parseInt($scope.projectId), saveRow, $scope.saveResults);
                $scope.finishAndClose(promise, saveRow);
            });
        }
        else {
            console.log("We are working with an existing location...");
            promise = SubprojectService.saveHabSubproject(parseInt($scope.projectId), saveRow, $scope.saveResults);
            $scope.finishAndClose(promise, saveRow);
        }	
	};

    $scope.finishAndClose = function (promise, saveRow) {
        if (typeof promise !== 'undefined') {
            promise.$promise.then(function () {

                //i guess we overwrite the json we get back with the objects from our saveRow...
                promise.Collaborators = saveRow.Collaborators;
                promise.Funding = saveRow.Funding;

                console.log("and here is our final new edited subproject_edited:");
                $scope.subproject_edited = promise;
                console.dir($scope.subproject_edited);


                console.log("and if we do the extends thing:")
                var extended = angular.extend({}, saveRow, promise); //empty + saveRow + promise -- in that order
                console.dir(extended);

                $scope.postSaveHabitatSubprojectUpdateGrid($scope.subproject_edited);

                console.log("1 typeof $scope.errors = " + typeof $scope.errors + ", $scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
                if ($scope.fileCount === 0) {
                    $scope.loading = false; // Stop the fish spinner.
                    $scope.showCloseButton = true;
                    $scope.showCancelButton = false;
                    $scope.showFormItems = false;
                }

                if ($scope.filesWithErrors == 0)
                    $scope.UploadUserMessage = "All actions successful.";
                else
                    $scope.UploadUserMessage = "There was a problem uploading a file.  Please try again or contact the Helpdesk if this issue continues.";

            }, function (error) {
                console.error("something went wrong: ", error);
            }); //promise/then - after saving habitat subproject
        } else {
            console.log("finish and close called without a promise. :( -----------------");
        }
    };
	
	

	$scope.selectFunder = function () {
		console.log("Inside selectFunder...");
		//console.dir($scope);
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
		//console.dir($scope);
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
	

    //kick off saving the project.
    //  if there is a location, saves it
    //  then hands off to saveFilesAndParent
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
		
        if ($scope.subprojectSave.error)
            return;


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
		//console.log("$scope is next...");
		//console.dir($scope);
			
		// First, a little cleanup.
		$scope.subprojectSave.error = false;
		$scope.subprojectSave.errorMessage = "";
			
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
			
		var subprojectId = 0;
		// Are we creating a new Subproject, or editing an existing one?
		if ($scope.viewSubproject)
		{
			console.log("We are editing an existing subproject; no new location needed...");
			subprojectId = $scope.viewSubproject.Id
				
			//ok -- everything is set to save; we are editing a subproject don't have a new location to save; hand off to next step.
            $scope.saveFilesAndParent();
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

						var promise = CommonService.saveNewProjectLocation($scope.project.Id, newLocation);
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

                                    //ok - new location is saved and we are prepped to save the subproject so handoff to next step:
                                    $scope.saveFilesAndParent();
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
		
    };


    $scope.close = function () {
        console.log("Inside $scope.close...");
        $modalInstance.dismiss();
    };

    $scope.cancel = function () {
        //if they've made file changes, the files appear as if they are existing files in the ItemFiles array... 
        // we need to reset it back to the real, actual existing files.

        if ($scope.originalExistingFiles && $scope.originalExistingFiles.hasOwnProperty($scope.file_field)) {
            $scope.subproject_row.ItemFiles = $scope.originalExistingFiles[$scope.file_field];
        }
        $modalInstance.dismiss();
    };


  }
];
