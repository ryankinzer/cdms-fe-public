
var modal_add_correspondence_event = ['$scope', '$rootScope', '$uibModalInstance', '$uibModal', 'DatasetService','SubprojectService','ServiceUtilities',
	'$filter', 'Upload','$location', '$anchorScroll',
    function ($scope, $rootScope, $modalInstance, $modal, DatasetService, SubprojectService, ServiceUtilities, 
	$filter, $upload, $location, $anchorScroll){
	console.log("Inside ModalAddCorrespondenceEventCtrl...");

    //mixin the properties and functions to enable the modal file chooser for this controller...
    modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.viewSubproject.Files); //"EventFiles"


	if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
		$rootScope.subprojectId = $scope.viewSubproject.Id;
	
	$scope.showOtherResponseType = false;
	$scope.showOtherCorrespondenceType = false;
	
    //$scope.ce_row = angular.copy($scope.ce_row); ??

    

    //setup some dropdown stuff

    //sure would be nice to get these from a user-defined list somewhere...
	$scope.ceCorrespondenceType = [];
		$scope.ceCorrespondenceType.push({Id: 0, Label: "Project Notification"});
		$scope.ceCorrespondenceType.push({Id: 1, Label: "Notice of Application"});
		$scope.ceCorrespondenceType.push({Id: 2, Label: "Seeking Concurrence"});
		$scope.ceCorrespondenceType.push({Id: 3, Label: "Document Review"});
		$scope.ceCorrespondenceType.push({Id: 4, Label: "Permit Review"});
		$scope.ceCorrespondenceType.push({Id: 5, Label: "Sending materials for our records"});
		$scope.ceCorrespondenceType.push({Id: 6, Label: "Other"});		
	
	$scope.ceResponseType = [];
		$scope.ceResponseType.push({Id: 0, Label: "APE letter"});
		$scope.ceResponseType.push({Id: 1, Label: "Asked to be consulting party"});
		$scope.ceResponseType.push({Id: 2, Label: "Defer to other tribe(s)"});
		$scope.ceResponseType.push({Id: 3, Label: "Determination of Eligibility"});
		$scope.ceResponseType.push({Id: 4, Label: "Did not review"});
		$scope.ceResponseType.push({Id: 5, Label: "Emailed Comments"});
		$scope.ceResponseType.push({Id: 6, Label: "Finding of Effect"});
		$scope.ceResponseType.push({Id: 7, Label: "Issued survey/excavation permit"});
		$scope.ceResponseType.push({Id: 8, Label: "Let it go"});
		$scope.ceResponseType.push({Id: 9, Label: "Missed opportunity to review"});
		$scope.ceResponseType.push({Id: 10, Label: "NAGPRA FR Notice"});
		$scope.ceResponseType.push({Id: 11, Label: "NAGPRA inventory/summary"});
		$scope.ceResponseType.push({Id: 12, Label: "none--ok"});
		$scope.ceResponseType.push({Id: 13, Label: "Notice of Application"});
		$scope.ceResponseType.push({Id: 14, Label: "Other"});
		$scope.ceResponseType.push({Id: 15, Label: "Out of area"});
		$scope.ceResponseType.push({Id: 16, Label: "Permit Application"});
		$scope.ceResponseType.push({Id: 17, Label: "Report for Review"});
		$scope.ceResponseType.push({Id: 18, Label: "Requested a monitor"});
		$scope.ceResponseType.push({Id: 19, Label: "Requested a survey"});
		$scope.ceResponseType.push({Id: 20, Label: "Requested additional information"});
		$scope.ceResponseType.push({Id: 21, Label: "Requested report"});
		$scope.ceResponseType.push({Id: 22, Label: "Requested testing"});
		$scope.ceResponseType.push({Id: 23, Label: "Response to comments"});
		$scope.ceResponseType.push({Id: 24, Label: "Reviewed report"});
		$scope.ceResponseType.push({Id: 25, Label: "Same as previously reviewed project"});
		$scope.ceResponseType.push({Id: 26, Label: "Sent letter"});
		$scope.ceResponseType.push({Id: 27, Label: "Signed off on"});
		$scope.ceResponseType.push({Id: 28, Label: "Simple Notification"});
	
	console.log("$scope.ceResponseType is next...");
	console.dir($scope.ceResponseType);
	
    var foundIt = false;

	// If ce_row.CorrespondenceDate exists, then we are editing.
	if ($scope.ce_row.CorrespondenceDate)
    {
        $scope.ceResponseType.forEach(function (option) {
			if ((option.Label === $scope.ce_row.ResponseType))	{
                foundIt = true;
			}
		});

        if (!foundIt) {
            console.log("Value of ResponseType is not in the list...");
            $scope.ce_row.OtherResponseType = $scope.ce_row.ResponseType;
            $scope.ce_row.ResponseType = "Other";
            $scope.showOtherResponseType = true;
        }


        var foundIt = false;

		$scope.ceCorrespondenceType.forEach(function(option){
			if ((option.Label === $scope.ce_row.CorrespondenceType)){
				foundIt = true;
			}
		});
	
		if (!foundIt)
		{
			console.log("Value of CorrespondenceType is not in the list...");
			$scope.ce_row.OtherCorrespondenceType = $scope.ce_row.CorrespondenceType;
			$scope.ce_row.CorrespondenceType = "Other";
			$scope.showOtherCorrespondenceType = true;		
		}
	}
	/*console.log("Location of ResponseType = " + $scope.ceResponseType.indexOf($scope.ce_row.ResponseType));
	if ($scope.ceResponseType.indexOf($scope.ce_row.ResponseType) < 0)
	{
		// The value of ResponseType IS NOT in our array of possible values, which means we have an odd item,
		// so we must do some jiggling...
		console.log("Value of ResponseType is not in the list...");
		$scope.ce_row.OtherResponseType = $scope.ce_row.ResponseType;
		$scope.ce_row.ResponseType = "Other";
		$scope.showOtherResponseType = true;
	}
	*/
    if($scope.ce_row.Id > 0)
    {
        $scope.header_message = "Edit Event for Project " + $scope.viewSubproject.ProjectName;
    }
	else
	{
		if ((typeof $scope.viewSubproject !== 'undefined' ) && ($scope.viewSubproject !== null))
			$scope.header_message = "Add Event to Project " + $scope.viewSubproject.ProjectName;
		else if ((typeof $scope.crppProjectName !== 'undefined' ) && ($scope.crppProjectName !== null))
			$scope.header_message = "Add Event to Project " + $scope.crppProjectName;
	}
	
	if (!$scope.ce_row.NumberOfDays)
		$scope.ce_row.NumberOfDays = "Other";
	
	//console.log("$scope.ce_row is next...");
	//console.dir($scope.ce_row);
	
	$scope.field = {
		DbColumnName: "EventFiles"
	};

	$scope.selectCorrespondenceType = function () {
		console.log("Inside selectCorrespondenceType...");
		console.log("$scope.ce_row at top of selectCorrespondenceType is next...");
		console.dir($scope.ce_row);
		if ($scope.ce_row.CorrespondenceType === "Other")
			$scope.showOtherCorrespondenceType = true;
		else
		{
			$scope.showOtherCorrespondenceType = false;
			$scope.ce_row.OtherCorrespondenceType = null;
		}
		
		console.log("$scope.showOtherCorrespondenceType = " + $scope.showOtherCorrespondenceType);
		console.log("$scope.ce_row at end of selectCorrespondenceType is next...");
		console.dir($scope.ce_row);
	};
	
	
	$scope.selectResponseType = function () {
		console.log("Inside selectResponseType...");
		console.log("$scope.ce_row at top of selectResponseType is next...");
		console.dir($scope.ce_row);
		if ($scope.ce_row.ResponseType === "Other")
			$scope.showOtherResponseType = true;
		else
		{
			$scope.showOtherResponseType = false;
			$scope.ce_row.OtherResponseType = null;
		}
		
		console.log("$scope.showOtherResponseType = " + $scope.showOtherResponseType);
		console.log("$scope.ce_row at end of selectResponseType is next...");
		console.dir($scope.ce_row);
	};

	$scope.GetTypeOfResponse = function(){
		var theName = [];
		theName.push($filter('ResponseTypeFilter')($scope.ResponseTypeList, $scope.ce_row.ResponseType.Id))[0];
		console.log("theName is next...");
		console.dir(theName);
		
	};

        
	
	$scope.calculateDateOfResponse = function(){
		console.log("Inside calculateDateOfResponse...");
		console.log("$scope.ShowDateOfResponsePopup = " + $scope.ShowDateOfResponsePopup);
		console.log("$scope.ce_row is next...");
		console.dir($scope.ce_row);
		//console.log("$scope.ce_row.NumberOfDays.length = " + $scope.ce_row.NumberOfDays.length);
		
		var	dtDateOfResponse = 'undefined';
		var	strDateOfResponse = 'undefined';
		
		/* 	Initially, we set NumberOfDays to Other, with the placeholder in the box on the form.
		*	When the user chooses a number, we change the NumberOfDays to a DatePicker.
		*	If the user chooses Other again, we switch back to the placeholder.
		*/
		if ($scope.ce_row.NumberOfDays.length < 3)
		{
			//if ($scope.ce_row.CorrespondenceDate)
			//console.log("$scope.ce_row.CorrespondenceDate text:  " + $scope.ce_row.CorrespondenceDate.toString());

			// If the user left the Date of Correspondence blank, get today's date.
			// Otherwise, use the date they picked.
			if ((!$scope.ce_row.CorrespondenceDate) || ($scope.ce_row.CorrespondenceDate === null))
			{
				console.log("Date of Correspondence left blank; using today's date...");
				dtDateOfResponse = new Date();
			}
			else
			{
				console.log("User picked this date...");
				console.dir($scope.ce_row.CorrespondenceDate);

				// If we just copy $scope.ce_row.CorrespondenceDate into dtDateOfResponse,
				// all that really gets copied is the reference.  As we do calculations
				// and change dtDateOfResponse, the same changes happen to $scope.ce_row.CorrespondenceDate.
				// To avoid this, we clone the object in the next line, in order to break that link.
				var strTmpDate = JSON.parse(JSON.stringify($scope.ce_row.CorrespondenceDate));
				//console.log("strTmpDate = " + strTmpDate);

				var dtTempDate = new Date(strTmpDate);
				//var dtTempDate = Date.parse(strTmpDate);
				console.log("dtTempDate " + dtTempDate);
				dtDateOfResponse = dtTempDate;
			}
			
			console.log("dtDateOfResponse initial setting is next...");
			console.dir(dtDateOfResponse);
			
			dtDateOfResponse.setDate(dtDateOfResponse.getDate() + parseInt($scope.ce_row.NumberOfDays));
			//console.log("dtDateOfResponse after adding days = " + dtDateOfResponse);

			var strDateOfResponse = ServiceUtilities.formatDate2(dtDateOfResponse);
			//console.log("strDateOfResponse after formatting = " + strDateOfResponse);

			// Extract the date info from the date/time string.
			var intSpaceLocation = strDateOfResponse.indexOf(" ");
			strDateOfResponse = strDateOfResponse.substring(0, intSpaceLocation);
			console.log("strDateOfResponse (text version) = " + strDateOfResponse);


			$scope.ce_row.ResponseDate = strDateOfResponse;
			console.log("$scope.ce_row.ResponseDate = " + $scope.ce_row.ResponseDate);
			
			console.log("$scope.ce_row is next...");
			console.dir($scope.ce_row);
			//$scope.ShowDateOfResponsePopup  = true;
		}
		else
		{
			$scope.ShowDateOfResponsePopup  = false;
			//$scope.ce_row.ResponseDate = null;
		}
	};
	

    //callback that is called from modalFile to do the actual file removal (varies by module)
    $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
        return SubprojectService.deleteCorresEventFile($scope.projectId, $scope.subprojectId, saveRow.Id, file_to_remove);
    };

    //called when the user clicks "save"
    $scope.save = function () {
        console.log("Inside ModalAddCorrespondenceEventCtrl, save...");


        //console.log("$scope.ce_row.ResponseType.Id = " + $scope.ce_row.ResponseType.Id);
        //console.log("$scope.ce_row.ResponseType.Name = " + $scope.ce_row.ResponseType.Name);
        console.log("$scope.ce_row.ResponseType = " + $scope.ce_row.ResponseType);
        var saveRow = angular.copy($scope.ce_row);
        console.log("saveRow is next, before checking the Id...");
        console.dir(saveRow);
        if (!saveRow.Id)
            saveRow.Id = 0;



        var subprojectId = 0;
        if ($scope.viewSubproject)
            subprojectId = $scope.viewSubproject.Id
        else
            subprojectId = $scope.subprojectId;

        //this gets passed along via api call... TODO: this is just to get going...
        var data = {
            ProjectId: $scope.project.Id,
            SubprojectId: subprojectId,
            DatastoreTablePrefix: $scope.DatastoreTablePrefix,
        };

        var target = '/api/v1/crppsubproject/uploadcrppsubprojectfile';

        $scope.handleFilesToUploadRemove(saveRow, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.


    };

    //call back from save above once the files are done processing and we're ready to save the item
    $scope.modalFile_saveParentItem = function (saveRow) {
        //prepare to save the correspondence event
        // Now let's handle the other fields on the form.
        console.log("typeof saveRow.CorrespondenceDate = " + typeof saveRow.CorrespondenceDate);
        if (typeof saveRow.CorrespondenceDate !== "string") {
            var strCorrespondenceDate = ServiceUtilities.toExactISOString(saveRow.CorrespondenceDate);
            console.log("strCorrespondenceDate = " + strCorrespondenceDate);
            saveRow.CorrespondenceDate = ServiceUtilities.extractDateFromString(strCorrespondenceDate);
            console.log("saveRow.CorrespondenceDate = " + saveRow.CorrespondenceDate);
        }

        //saveRow.CorrespondenceDate = ServiceUtilities.formatDate2(saveRow.CorrespondenceDate);
        //console.log("saveRow.CorrespondenceDate = " + saveRow.CorrespondenceDate);

        if (saveRow.ResponseDate) {
            console.log("saveRow.ResponseDate initially = " + saveRow.ResponseDate);
            console.log("typeof saveRow.ResponseDate = " + typeof saveRow.ResponseDate);
            if (typeof saveRow.ResponseDate !== "string") {
                var strResponseDate = ServiceUtilities.toExactISOString(saveRow.ResponseDate);
                console.log("strResponseDate = " + strResponseDate);
            }
            else {
                var dtDateOfResponse = new Date(saveRow.ResponseDate);
                console.log("dtDateOfResponse = " + dtDateOfResponse);
                var strResponseDate = ServiceUtilities.toExactISOString(dtDateOfResponse);
                console.log("strResponseDate = " + strResponseDate);
            }
            saveRow.ResponseDate = ServiceUtilities.extractDateFromString(strResponseDate);
            console.log("saveRow.ResponseDate after conversion = " + saveRow.ResponseDate);

        }

        console.log("saveRow is next, after processing dates...");
        console.dir(saveRow);

        if (saveRow.NumberOfDays === "Other")
            saveRow.NumberOfDays = null;

        if (saveRow.CorrespondenceType === "Other") {
            saveRow.CorrespondenceType = saveRow.OtherCorrespondenceType;
            saveRow.OtherCorrespondenceType = 'undefined';  // Throw this away, because we do not want to save it; no database field or it.
        }

        // Note:  I could not get the following working; while it pulled the ResponseType name OK for the select, when you clicked save, 
        // the ResponseTypeName was always 'undefined'.
		/* On the form, $scope.subproject_row.ResponseType is an object, like this: (Id: theId Name: theName)
		* The technique used to grab the ResponseType works on the first click (an improvement).  
		* Note:  The improvement only occurred on the subproject page; the select box for ResponseType did not behave the same way.
		* Therefore, I (gc) kept the technique, and chose to extract/reset $scope.subproject_row.Agency here in the controller, as just the name.
		*/
        //console.log("typeof saveRow.ResponseType = " + typeof saveRow.ResponseType);
        //saveRow.ResponseType = 'undefined';
        //saveRow.ResponseType = $scope.ce_row.ResponseType.Name;
        //console.log("saveRow.ResponseType = " + saveRow.ResponseType);

        // Response Type:  If the user selected Other, we must use the name they supplied in OtherResponseType.
        //if ((saveRow.OtherResponseType) && (typeof saveRow.OtherResponseType !== 'undefined'))
        if (saveRow.ResponseType === "Other") {
            saveRow.ResponseType = saveRow.OtherResponseType;
            saveRow.OtherResponseType = 'undefined'; // Throw this away, because we do not want to save it; no database field or it.
        }

		/*var promise = SubprojectService.saveCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, saveRow);
		if (typeof promise !== 'undefined')
		{
			promise.$promise.then(function(){
				$scope.reloadSubprojects();
				$scope.viewSelectedSubproject();
				$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
				$modalInstance.dismiss();
				})
		}
		*/

        //console.log("$scope is next...");
        //console.dir($scope);

		/*	If the user chooses to create a Correspondence Event (CE), at the same time that they are creating a new Subproject,
		*   $scope.viewSubproject is not available yet, so we cannot pass the Id from there.  When we create the new Subproject,
		*   we capture the Id from the Subproject, which is the same thing, so we pass that instead, to create the CE.
		*/
        if ($rootScope.crppProjectName)
            $scope.crppProjectName = $rootScope.crppProjectName;


        var save_item_promise = SubprojectService.saveCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, saveRow);
        //SubprojectService.saveHabitatItem($scope.projectId, $scope.viewSubproject.Id, saveRow);

        //setup the promise.then that runs after the habitat item is saved...
        if (typeof save_item_promise !== 'undefined') {
            save_item_promise.$promise.then(function () {
                //did we edit or add new?
                if (saveRow.Id === 0) //we saved a new one!
                    $scope.postAddCorrespondenceEventUpdateGrid(save_item_promise);
                else //we edited one!
                    $scope.postEditCorrespondenceEventUpdateGrid(save_item_promise);


                console.log("all done saving correspondence event!");

                if (!$scope.filesToUpload[$scope.file_field] && !$scope.removedFiles.length > 0) {
                    $modalInstance.dismiss();
                }

            });

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

        }



        /*

		if ($scope.viewSubproject !== null)
        {
            console.log("$scope.viewSubproject is present, using that...");
			console.log("$scope.viewSubproject.Id = " + $scope.viewSubproject.Id);
			var promise = SubprojectService.saveCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, saveRow);
			if (typeof promise !== 'undefined')
			{
                promise.$promise.then(function () {
                    //$scope.reloadSubprojects();
                    //$scope.viewSelectedSubproject();
                    //$scope.viewSelectedSubproject($scope.viewSubproject);
                    //$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
                    //$modalInstance.dismiss();
                    if (saveRow.Id === 0) //we saved a new one!
                        $scope.postAddCorrespondenceEventUpdateGrid(promise);
                    else //we edited one!
                        $scope.postEditCorrespondenceEventUpdateGrid(promise);

                    console.log("all done saving correspondence event!");

                    console.log("1 typeof $scope.errors = " + typeof $scope.errors + ", $scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
                    if ($scope.fileCount === 0) {
                        $scope.loading = false; // Stop the fish spinner.
                        $scope.showCloseButton = true;
                        $scope.showCancelButton = false;
                        $scope.showFormItems = false;
                    }
                });
			}	
		}
		else if ((typeof $scope.crppProjectName !== 'undefined' ) && ($scope.crppProjectName !== null))
		{
			console.log("$scope.viewSubproject missing, using $scope.subprojectId:  " + $scope.subprojectId);
			var promise = SubprojectService.saveCorrespondenceEvent($scope.project.Id, $scope.subprojectId, saveRow);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					$scope.reloadSubprojects();
					//$scope.viewSelectedSubproject();
					$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
					//$modalInstance.dismiss();
					})
					
				if ($scope.fileCount === 0)
				{
					$scope.loading = false; // Stop the fish spinner.
					$scope.showCloseButton = true;
					$scope.showCancelButton = false;
					$scope.showFormItems = false;					
				}
			}
		}
        
    };
    */
    }
	
	$scope.close = function(){
		console.log("Inside $scope.close...");
		$modalInstance.dismiss();	
	};

    $scope.cancel = function () {
        
        if ($scope.originalExistingFiles && $scope.originalExistingFiles.hasOwnProperty($scope.file_field)) {
            $scope.ce_row.EventFiles = $scope.originalExistingFiles[$scope.file_field];
            //console.log("setting EventFiles to " + $scope.originalExistingFiles[$scope.file_field]);
        }
        
		$modalInstance.dismiss();
    };
  }
];
