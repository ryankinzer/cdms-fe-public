
var modal_add_correspondence_event = ['$scope', '$rootScope','$modalInstance', '$modal', 'DataService','DatastoreService','ServiceUtilities',
	'$filter', 'FileUploadService','$upload','$location', '$anchorScroll',
  function($scope, $rootScope, $modalInstance, $modal, DataService, DatastoreService, ServiceUtilities, 
	$filter, FileUploadService, $upload, $location, $anchorScroll){
	console.log("Inside ModalAddCorrespondenceEventCtrl...");
	
	if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
		$rootScope.subprojectId = $scope.viewSubproject.Id;
	
	$scope.filesToUpload = {};
	$scope.verifyActionFormOpen = "No";
	$scope.showOtherResponseType = false;
	$scope.showOtherCorrespondenceType = false;
	$scope.ReadyToClose = ""; // Set to "", so that "False" does not show on the form.
	$scope.showCloseButton = false;
	$scope.showCancelButton = true;
	$scope.showFormItems = true;
	$scope.fileCount = 0;
	$scope.fileProgress = 0;

    $scope.ce_row = angular.copy($scope.ce_row);
	
	console.log("$scope.ce_row is next...");
	console.dir($scope.ce_row);
	
	$scope.ceCorrespondenceType = [];
		$scope.ceCorrespondenceType.push({Id: 0, Label: "Project Notification"});
		$scope.ceCorrespondenceType.push({Id: 1, Label: "Notice of Application"});
		$scope.ceCorrespondenceType.push({Id: 2, Label: "Seeking Concurrence"});
		$scope.ceCorrespondenceType.push({Id: 3, Label: "Document Review"});
		$scope.ceCorrespondenceType.push({Id: 4, Label: "Permit Review"});
		$scope.ceCorrespondenceType.push({Id: 5, Label: "Sending materials for our records"});
		$scope.ceCorrespondenceType.push({Id: 6, Label: "Other"});		
	
	/*$scope.ceResponseType = [];
		$scope.ceResponseType.push("APE letter");
		$scope.ceResponseType.push("Asked to be consulting party");
		$scope.ceResponseType.push("Defer to other tribe(s)");
		$scope.ceResponseType.push("Determination of Eligibility");
		$scope.ceResponseType.push("Did not review");
		$scope.ceResponseType.push("Emailed Comments");
		$scope.ceResponseType.push("Finding of Effect");
		$scope.ceResponseType.push("Issued survey/excavation permit");
		$scope.ceResponseType.push("Let it go");
		$scope.ceResponseType.push("Missed opportunity to review");
		$scope.ceResponseType.push("NAGPRA FR Notice");
		$scope.ceResponseType.push("NAGPRA inventory/summary");
		$scope.ceResponseType.push("none--ok");
		$scope.ceResponseType.push("Other");
		$scope.ceResponseType.push("Out of area");
		$scope.ceResponseType.push("Permit Application");
		$scope.ceResponseType.push("Report for Review");
		$scope.ceResponseType.push("Requested a monitor");
		$scope.ceResponseType.push("Requested a survey");
		$scope.ceResponseType.push("Requested additional information");
		$scope.ceResponseType.push("Requested report");
		$scope.ceResponseType.push("Requested testing");
		$scope.ceResponseType.push("Response to comments");
		$scope.ceResponseType.push("Reviewed report");
		$scope.ceResponseType.push("Same as previously reviewed project");
		$scope.ceResponseType.push("Sent letter");
		$scope.ceResponseType.push("Signed off on");
		$scope.ceResponseType.push("Simple Notification");
	*/
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
	
	/*$scope.ceResponseType = [];
		$scope.ceResponseType.push("APE letter");
		$scope.ceResponseType.push("Asked to be consulting party");
		$scope.ceResponseType.push("Defer to other tribe(s)");
		$scope.ceResponseType.push("Determination of Eligibility");
		$scope.ceResponseType.push("Did not review");
		$scope.ceResponseType.push("Emailed Comments");
		$scope.ceResponseType.push("Finding of Effect");
		$scope.ceResponseType.push("Issued survey/excavation permit");
		$scope.ceResponseType.push("Let it go");
		$scope.ceResponseType.push("Missed opportunity to review");
		$scope.ceResponseType.push("NAGPRA FR Notice");
		$scope.ceResponseType.push("NAGPRA inventory/summary");
		$scope.ceResponseType.push("none--ok");
		$scope.ceResponseType.push("Other");
		$scope.ceResponseType.push("Out of area");
		$scope.ceResponseType.push("Permit Application");
		$scope.ceResponseType.push("Report for Review");
		$scope.ceResponseType.push("Requested a monitor");
		$scope.ceResponseType.push("Requested a survey");
		$scope.ceResponseType.push("Requested additional information");
		$scope.ceResponseType.push("Requested report");
		$scope.ceResponseType.push("Requested testing");
		$scope.ceResponseType.push("Response to comments");
		$scope.ceResponseType.push("Reviewed report");
		$scope.ceResponseType.push("Same as previously reviewed project");
		$scope.ceResponseType.push("Sent letter");
		$scope.ceResponseType.push("Signed off on");
		$scope.ceResponseType.push("Simple Notification");
	*/	
	console.log("$scope.ceResponseType is next...");
	console.dir($scope.ceResponseType);
	
	/*$scope.responseTypeOptions = $rootScope.responseTypeOptions = makeObjects($scope.ceResponseType, 'Id','Label') ;
	console.log("$scope.responseTypeOptions is next...");
	console.dir($scope.responseTypeOptions);
	*/

	var keepGoing = true;
	var foundIt = false;
	//var responseTypeIndex = 0;
	//var responseTypeMarker = "";
	/*angular.forEach($scope.responseTypeOptions, function(option){
		console.log("option = x" + option + "x, $scope.ce_row.ResponseType = x" + $scope.ce_row.ResponseType + "x.");
		if ((keepGoing) && (option.indexOf($scope.ce_row.ResponseType) >= 0))
		{
			console.log("option = " + option);
			console.log("Found the ResponseType...");
			responseTypeMarker = responseTypeIndex;
			$scope.ce_row.ResponseType = "" + responseTypeMarker;
			foundIt = true;
			keepGoing = false;
		}
		responseTypeIndex++;
	});
	*/
	
	// If ce_row.CorrespondenceDate exists, then we are editing.
	if ($scope.ce_row.CorrespondenceDate)
	{
		angular.forEach($scope.ceResponseType, function(option){
		//console.log("option.Label = x" + option.Label + "x, $scope.ce_row.ResponseType = x" + $scope.ce_row.ResponseType + "x.");
			if ((keepGoing) && (option.Label === $scope.ce_row.ResponseType))
			{
				//console.log("option.Label = " + option.Label);
				//console.log("Found the ResponseType...");
				foundIt = true;
				keepGoing = false;
			}
			//responseTypeIndex++;
		});
	
		if (!foundIt)
		{
			console.log("Value of ResponseType is not in the list...");
			$scope.ce_row.OtherResponseType = $scope.ce_row.ResponseType;
			$scope.ce_row.ResponseType = "Other";
			$scope.showOtherResponseType = true;		
		}
		
		foundIt = false;
		keepGoing = true;
		//console.log("$scope.ce_row.CorrespondenceType is next...");
		//console.dir($scope.ce_row.CorrespondenceType);
		angular.forEach($scope.ceCorrespondenceType, function(option){
			//console.log("option is next...");
			//console.dir(option);
			//console.log("option.Label = x" + option.Label + "x, $scope.ce_row.CorrespondenceType = x" + $scope.ce_row.CorrespondenceType + "x.");
			if ((keepGoing) && (option.Label === $scope.ce_row.CorrespondenceType))
			{
				//console.log("option.Label = " + option.Label);
				//console.log("Found the CorrespondenceType...");
				foundIt = true;
				keepGoing = false;
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
	
	console.log("$scope is next...");
	console.dir($scope);
	
	/*$scope.ceEvents = function(items, key) {
		element.all(by.repeater(key + ' in $scope.viewSubproject.CorrespondenceEvents').column(key + '.EventComments')).then(function(arr) {
			arr.forEach(function(wd, i) {
			  expect(wd.getText()).toMatch(items[i]);
			});
		});
	};
	
	$scope.ceFilterEventComments = function()
	{
		var searchEventComments = element(by.model('correspondenceEventsFilter.EventComments'));
		var strict = element(by.model('strict'));
		searchEventComments.clear();
		searchEventComments.sendKeys('i');
		$scope.ceEvents($scope.viewSubproject.CorrespondenceEvents, event);
		//strict.click();
	}
	*/
	
	$scope.openFileModal = function(row, field)
	{
		console.log("Inside ModalAddCorrespondenceEventCtrl, openFileModal...");
		console.log("row is next...");
		console.dir(row);
		console.log("field is next...");
		console.dir(field);
		$scope.file_row = row;
		$scope.file_field = field;
		
		var modalInstance = $modal.open({
			templateUrl: 'app/core/common/components/file/templates/modal-file.html',
			controller: 'FileModalCtrl',
			scope: $scope, //scope to make a child of
		});
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
	
	/*$scope.responseTypeChanged = function () {
		console.log("Inside responseTypeChanged...");
		console.log("$scope.ce_row is next...");
		console.dir($scope.ce_row);
		if ($scope.ce_row.ResponseType === "Other")
			$scope.showOtherResponseType = true;
		else
		{
			$scope.showOtherResponseType = false;
			$scope.ce_row.OtherResponseType = 'undefined';
		}
		
		console.log("$scope.showOtherResponseType = " + $scope.showOtherResponseType);
	};
	*/
	
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


	
	//field = DbColumnName
	$scope.onFileSelect = function(field, files)
	{
		console.log("Inside ModalAddCorrespondenceEventCtrl, onFileSelect");
		console.log("file selected! " + field);
		$scope.filesToUpload[field] = files;
	};
	
	/*$scope.$watch("CorrespondenceDate", function(newValue, oldValue){
		console.log("CorrespondenceDate changed...");
	});
	*/
	
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
	
	$scope.remove = function(){
		console.log("Inside ModalAddCorrespondenceEventCtrl, remove...");
		console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
		console.log("$scope.ce_row is next...");
		console.dir($scope.ce_row);
		$scope.ce_rowId = $scope.ce_row.Id;
		
		$scope.verifyAction = "Delete";
		$scope.verifyingCaller = "CorrespondenceEvent";
		//console.log("scope.verifyAction = " + scope.verifyAction);
			
		$scope.verifyActionFormOpen = "Yes";
		
		if (confirm('Are you sure that you want to delete this Correspondence Event?'))
		{
			//DatastoreService.removeSubproject($scope.project.Id, $scope.viewSubproject.Id);
			
			//var promise = DatastoreService.removeCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, $scope.ce_rowId);
			var promise = DatastoreService.removeCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, $scope.ce_rowId, $scope.DatastoreTablePrefix);
			
			promise.$promise.then(function(){
				$scope.subprojects = null;
				$scope.reloadSubprojects();
				//$scope.viewSelectedSubproject();
				$scope.viewSelectedSubproject($scope.viewSubproject);
				$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
				$modalInstance.dismiss();

			});
		}
	};
	
	$scope.$watch('fileProgress', function(){
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
	
    $scope.save = function(){
		console.log("Inside ModalAddCorrespondenceEventCtrl, save...");
		console.log("$scope is next...");
		console.dir($scope);
		
		$scope.saving = true; // Used in $scope.$watch('fileProgress'
		$scope.loading = true; // Start the fish spinner.
		
		//console.log("$scope.ce_row.ResponseType.Id = " + $scope.ce_row.ResponseType.Id);
		//console.log("$scope.ce_row.ResponseType.Name = " + $scope.ce_row.ResponseType.Name);
		console.log("$scope.ce_row.ResponseType = " + $scope.ce_row.ResponseType);
		var saveRow = angular.copy($scope.ce_row);
		console.log("saveRow is next, before checking the Id...");
		console.dir(saveRow);
		if (!saveRow.Id)
			saveRow.Id = 0;
		//$scope.foundDuplicate = false;
		
		console.log("saveRow is next, after checking/setting the Id...");
		console.dir(saveRow);

		if ($scope.foundDuplicate)
		{
			alert("One or more of the files to upload is a duplicate!");
			return;
		}
		
		var subprojectId = 0;
		if ($scope.viewSubproject)
			subprojectId = $scope.viewSubproject.Id
		else
			subprojectId = $scope.subprojectId;
		
		// First let's handle the files.
		if ($scope.filesToUpload.EventFiles)
		{
			// Count how many files we have.
			$scope.fileCount = 0;
			angular.forEach($scope.filesToUpload.EventFiles, function(aFile){
				$scope.fileCount++;
			});
			console.log("$scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
			
			console.log("$scope.filesToUpload.EventFiles is next...");
			console.dir($scope.filesToUpload.EventFiles);
			for(var i = 0; i < $scope.filesToUpload.EventFiles.length; i++)
			{
				var file = $scope.filesToUpload.EventFiles[i];
				console.log("file is next...");
				console.dir(file);
				
				var newFileNameLength = file.name.length;
				console.log("file name length = " + newFileNameLength);

				// Inform the user immediately, if there are duplicate files.
				if ($scope.foundDuplicate)
					alert(errors);
				else
				{
					console.log("file.success = " + file.success);
					if(file.success != "Success")
					{
						console.log("No file.success, so let's save the file...");
						$scope.upload = $upload.upload({
                            url: serviceUrl + '/api/v1/crppsubproject/uploadcrppsubprojectfile',
							method: "POST",
							// headers: {'headerKey': 'headerValue'},
							// withCredential: true,
							//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name},
							data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, DatastoreTablePrefix: $scope.DatastoreTablePrefix},
							file: file,

							}).progress(function(evt) {
								console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
							}).success(function(data, status, headers, config) {
								console.dir(data);
								console.dir(status);
								console.dir(headers);
								console.dir(config);
								console.dir(file);
								config.file.success = "Success";
								console.log("done and success!");
								$scope.fileProgress++;
								console.log("$scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
							})
							.error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
								//console.log(file.name + " was error.");
								config.file.success = "Failed";
							});
						console.log("$scope.upload is next...");
						console.dir($scope.upload);
					}
				}
			}
			
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

				console.log("$scope is next...");
				console.dir($scope);
				console.log("$scope.file_row is next...");
				console.dir($scope.file_row);
				console.log("field = " + field);
				//if we already had actual files in this field, copy them in
				if($scope.file_row[field])
				{
					console.log("On Files field...");
					var current_files = angular.fromJson($scope.file_row[field]);
					angular.forEach(current_files, function(file){
						if(file.Id) //our incoming files don't have an id, just actual files.
							local_files.push(file);		
					});
				}

				$scope.file_row[field] = angular.toJson(local_files);
				//console.log("Ok our new list of files: "+$scope.row[field]);
			});
		}
		
		// Now let's handle the other fields on the form.
		console.log("typeof saveRow.CorrespondenceDate = " + typeof saveRow.CorrespondenceDate);
		if (typeof saveRow.CorrespondenceDate !== "string")
		{
			var strCorrespondenceDate = ServiceUtilities.toExactISOString(saveRow.CorrespondenceDate);
			console.log("strCorrespondenceDate = " + strCorrespondenceDate);
			saveRow.CorrespondenceDate = ServiceUtilities.extractDateFromString(strCorrespondenceDate);
			console.log("saveRow.CorrespondenceDate = " + saveRow.CorrespondenceDate);
		}
		
		//saveRow.CorrespondenceDate = ServiceUtilities.formatDate2(saveRow.CorrespondenceDate);
		//console.log("saveRow.CorrespondenceDate = " + saveRow.CorrespondenceDate);
		
		if (saveRow.ResponseDate)
		{
			console.log("saveRow.ResponseDate initially = " + saveRow.ResponseDate);
			console.log("typeof saveRow.ResponseDate = " + typeof saveRow.ResponseDate);
			if (typeof saveRow.ResponseDate !== "string")
			{
				var strResponseDate = ServiceUtilities.toExactISOString(saveRow.ResponseDate);
				console.log("strResponseDate = " + strResponseDate);
			}
			else
			{
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
		
		if (saveRow.CorrespondenceType === "Other")
		{
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
		if (saveRow.ResponseType === "Other")
		{
			saveRow.ResponseType = saveRow.OtherResponseType;
			saveRow.OtherResponseType = 'undefined'; // Throw this away, because we do not want to save it; no database field or it.
		}

		/*var promise = DatastoreService.saveCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, saveRow);
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
		
		console.log("$scope is next...");
		console.dir($scope);
		
		/*	If the user chooses to create a Correspondence Event (CE), at the same time that they are creating a new Subproject,
		*   $scope.viewSubproject is not available yet, so we cannot pass the Id from there.  When we create the new Subproject,
		*   we capture the Id from the Subproject, which is the same thing, so we pass that instead, to create the CE.
		*/
		if ($rootScope.crppProjectName)
			$scope.crppProjectName = $rootScope.crppProjectName;
		
		if ($scope.viewSubproject !== null)
		{
			console.log("$scope.viewSubproject is present, using that...");
			console.log("$scope.viewSubproject.Id = " + $scope.viewSubproject.Id);
			var promise = DatastoreService.saveCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, saveRow);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					$scope.reloadSubprojects();
					//$scope.viewSelectedSubproject();
					$scope.viewSelectedSubproject($scope.viewSubproject);
					$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
					//$modalInstance.dismiss();
					})
					
				console.log("1 typeof $scope.errors = " + typeof $scope.errors + ", $scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
				if ($scope.fileCount === 0)
				{
					$scope.loading = false; // Stop the fish spinner.
					$scope.showCloseButton = true;
					$scope.showCancelButton = false;
					$scope.showFormItems = false;
				}
			}	
		}
		else if ((typeof $scope.crppProjectName !== 'undefined' ) && ($scope.crppProjectName !== null))
		{
			console.log("$scope.viewSubproject missing, using $scope.subprojectId:  " + $scope.subprojectId);
			var promise = DatastoreService.saveCorrespondenceEvent($scope.project.Id, $scope.subprojectId, saveRow);
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
	
	$scope.close = function(){
		console.log("Inside $scope.close...");
		$modalInstance.dismiss();	
	};

    $scope.cancel = function(){
		$modalInstance.dismiss();
    };
	
	$scope.gotoBottom = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		$location.hash('bottom');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoTopCorrespondenceEventsTop = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		console.log("Inside gotoTopCorrespondenceEventsTop...");
		//$location.hash('top');
		$location.hash('ceTop');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoCategory = function (category) {
		$location.hash(category);
		$anchorScroll();
	};

  }
];
