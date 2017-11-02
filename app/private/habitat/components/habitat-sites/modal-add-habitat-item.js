
var modal_add_habitat = ['$scope', '$rootScope', '$modalInstance', '$modal', 'DatasetService','SubprojectService','ServiceUtilities',
	'$filter', 'FileUploadService','$upload','$location', '$anchorScroll',
    function ($scope, $rootScope, $modalInstance, $modal, DatasetService, SubprojectService, ServiceUtilities, 
	$filter, FileUploadService, $upload, $location, $anchorScroll){
	console.log("Inside ModalAddHabitatItemCtrl...");
	
	if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
		$rootScope.subprojectId = $scope.viewSubproject.Id;
	
	$scope.filesToUpload = {};
	$scope.verifyActionFormOpen = "No";
	$scope.showOtherResponseType = false;
	$scope.ReadyToClose = "";
	$scope.showCloseButton = false;
	$scope.showCancelButton = true;
	$scope.showFormItems = true;
	$scope.fileCount = 0;
	$scope.fileProgress = 0;
	
	$rootScope.projectId = $scope.project.Id;
	console.log("$scope.projectId = " + $scope.projectId);
	
    $scope.hi_row = angular.copy($scope.hi_row);
	//if ($scope.hi_row)
	//{
	//	$scope.hi_row = angular.copy($scope.hi_row);

	//}
	//else
	//	$scope.hi_row = {};
	
	var keepGoing = true;
	var foundIt = false;

    if($scope.hi_row.Id > 0)
    {
        $scope.header_message = "Edit Item for Project " + $scope.viewSubproject.ProjectName;
    }
	else
	{
		if ((typeof $scope.viewSubproject !== 'undefined' ) && ($scope.viewSubproject !== null))
			$scope.header_message = "Add Item to Project " + $scope.viewSubproject.ProjectName;
		else if ((typeof $scope.habProjectName !== 'undefined' ) && ($scope.habProjectName !== null))
			$scope.header_message = "Add Item to Project " + $scope.habProjectName;
	}
	
	console.log("$scope.hi_row is next...");
	console.dir($scope.hi_row);
	
	console.log("$scope (after initialization) is next...");
	//console.dir($scope);
	
	$scope.openFileModal = function(row, field)
	{
		console.log("Inside ModalAddHabitatItemCtrl, openFileModal...");
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
	
	$scope.openLinkModal = function(row, field)
	{
		console.log("Inside ModalAddHabitatItemCtrl, openLinkModal...");
		console.log("row is next...");
		console.dir(row);
		console.log("field is next...");
		console.dir(field);
		$scope.link_row = row;
		//$scope.link_field = field;
		$scope.link_field = {
			DbColumnName: "ExternalLinks"
		};
		
		var modalInstance = $modal.open({
            templateUrl: 'app/core/common/components/modals/templates/modal-link-field.html',
			controller: 'LinkModalCtrl',
			scope: $scope, //scope to make a child of
		});
	};
	
	//field = DbColumnName
	$scope.onFileSelect = function(field, files)
	{
		console.log("Inside ModalAddHabitatItemCtrl, onFileSelect");
		console.log("file selected! " + field);
		$scope.filesToUpload[field] = files;
	};
	
	$scope.remove = function(){
		console.log("Inside ModalAddHabitatItemCtrl, remove...");
		//console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
		console.log("$scope.hi_row is next...");
		console.dir($scope.hi_row);
		$scope.hi_rowId = $scope.hi_row.Id;
		
		$scope.verifyAction = "Delete";
		$scope.verifyingCaller = "HabitatItem";
		//console.log("scope.verifyAction = " + scope.verifyAction);
			
		$scope.verifyActionFormOpen = "Yes";
		
		if (confirm('Are you sure that you want to delete this Habitat Item?'))
		{
			//SubprojectService.removeSubproject($scope.project.Id, $scope.viewSubproject.Id);
			
			//var promise = SubprojectService.removeCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, $scope.ce_rowId);
			//var promise = SubprojectService.removeHabitatItem($scope.project.Id, $scope.viewSubproject.Id, $scope.hi_rowId, $scope.DatastoreTablePrefix);
			var promise = SubprojectService.removeHabitatItem($scope.project.Id, $scope.viewSubproject.Id, $scope.hi_rowId);
			
			promise.$promise.then(function(){
				$scope.subprojects = null;
				
				// If we were down in the list of subprojects (sites) somewhere, and we removed a Habitat Item
				// -- perhaps we entered it in error on the wrong Subproject (site) -- 
				// we would want that item to pop to the top; all updated items to go the top (most recent).
				// Therefore we must reload all the subprojects to pop it to the top, not just this project.
				//$scope.reloadThisProject();
				
				$scope.reloadSubprojects(); // Need to reload ALL the subprojects, so that this one will pop to the top.
				//$scope.viewSelectedSubproject(); // Don't run this just yet, because the project has not re-loaded yet.
				$("#habitatItems").load("habitatItems.html #habitatItems");
				$modalInstance.dismiss();
			});
		}
	};
	
	$scope.$watch('fileProgress', function(){
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
		console.log("Inside ModalAddHabitatItemCtrl, save...");
		//console.log("$scope is next...");
		//console.dir($scope);
		
		$scope.saving = true; // Used in $scope.$watch('fileProgress'
		$scope.loading = true; // Start the fish spinner.
		
		var saveRow = angular.copy($scope.hi_row);
		//console.log("saveRow is next, before checking the Id...");
		//console.dir(saveRow);
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
		if ($scope.filesToUpload.ItemFiles)
		{
			// Count how many files we have.
			$scope.fileCount = 0;
			angular.forEach($scope.filesToUpload.ItemFiles, function(aFile){
				$scope.fileCount++;
			});
			console.log("$scope.fileCount = " + $scope.fileCount);
			
			console.log("$scope.filesToUpload.ItemFiles is next...");
			console.dir($scope.filesToUpload.ItemFiles);
			for(var i = 0; i < $scope.filesToUpload.ItemFiles.length; i++)
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
						console.log("No file.success, so let's save the file...");
						$scope.upload = $upload.upload({
                            url: serviceUrl + '/api/v1/habsubproject/uploadhabitatfile',
							method: "POST",
							// headers: {'headerKey': 'headerValue'},
							// withCredential: true,
							//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name},
							//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, DatastoreTablePrefix: $scope.DatastoreTablePrefix},
							data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, SubprojectType: "Hab"},
							file: file,

							}).progress(function(evt) {
								console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
							}).success(function(data, status, headers, config) {
								console.log("The following are next:  data, status, headers, config, file");
								//console.log("file is next...");
								console.dir(data);
								console.dir(status);
								console.dir(headers);
								console.dir(config);
								console.dir(file);
								config.file.success = "Success";
								
								//console.log("file is next...");
								//console.dir(file);
								//var promise = SubprojectService.saveSubprojectFile($scope.project.Id, "Hab", $scope.subprojectId, file);
								//promise.$promise.then(function(){
									console.log("done and success!");
									//reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
									//$scope.refreshProjectLocations();
									//$modalInstance.dismiss();
								//});
								
								$scope.fileProgress++;
							}).error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
								//console.log(file.name + " was error.");
								config.file.success = "Failed";
							});
							
						console.log("$scope.upload is next...");
						console.dir($scope.upload);

					}
					
					if (file.success)
					{
						
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
					//console.dir($scope);
				  
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
						//console.log("$scope is next...");
						//console.dir($scope);
						throw "Problem saving file: " + file.Name;
					}
				}

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
		
		/*
		// Now let's handle the links.
		console.log("$scope.link_row.ExternalLinks is next...");
		console.dir($scope.link_row.ExternalLinks);
		if ($scope.link_row.ExternalLinks)
		{
			console.log("")
			$scope.saveLink = $upload.upload({
				url: serviceUrl + '/data/UploadHabitatFile',
				method: "POST",
				data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded link " + link.Name, Title: link.Name, SubprojectType: "Hab"},

				}).progress(function(evt) {
					console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
				}).success(function(data, status, headers, config) {
					console.log("The following are next:  data, status, headers, config, file");
					console.dir(data);
					console.dir(status);
					console.dir(headers);
					console.dir(config);
					console.dir(file);
					config.file.success = "Success";
					
					console.log("file is next...");
					console.dir(file);
					//var promise = SubprojectService.saveSubprojectFile($scope.project.Id, "Hab", $scope.subprojectId, file);
					//promise.$promise.then(function(){
						console.log("done and success!");
						//reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
						//$scope.refreshProjectLocations();
						//$modalInstance.dismiss();
					//});
				}).error(function(data, status, headers, config) {
					$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
					//console.log(file.name + " was error.");
					config.file.success = "Failed";
			});
		}
		*/
		
		// Now let's handle the other fields on the form.		
		//console.log("$scope is next...");
		//console.dir($scope);
		
		/*	If the user chooses to create a Habitat Item (HI), at the same time that they are creating a new Subproject,
		*   $scope.viewSubproject is not available yet, so we cannot pass the Id from there.  When we create the new Subproject,
		*   we capture the Id from the Subproject, which is the same thing, so we pass that instead, to create the HI.
		*/
		if ($rootScope.habProjectName)
			$scope.habProjectName = $rootScope.habProjectName;
		
		if ($scope.viewSubproject !== null)
		{
			console.log("$scope.viewSubproject is present, using that...");
			console.log("$scope.viewSubproject.Id = " + $scope.viewSubproject.Id);
			var promise = SubprojectService.saveHabitatItem($scope.projectId, $scope.viewSubproject.Id, saveRow);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					$scope.reloadSubprojects();
					$scope.viewSelectedSubproject();
					$("#habitatItems").load("habitatItems.html #habitatItems");
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
		else if ((typeof $scope.habProjectName !== 'undefined' ) && ($scope.habProjectName !== null))
		{
			console.log("$scope.viewSubproject missing, using $scope.subprojectId:  " + $scope.subprojectId);
			var promise = SubprojectService.saveHabitatItem($scope.projectId, $scope.subprojectId, saveRow);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					$scope.reloadSubprojects();
					$scope.viewSelectedSubproject();
					$("#habitatItems").load("habitatItems.html #habitatItems");
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
	  
	$scope.gotoTopHabitatItemsTop = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		console.log("Inside gotoTopHabitatItemsTop...");
		//$location.hash('top');
		$location.hash('hiTop');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoCategory = function (category) {
		$location.hash(category);
		$anchorScroll();
	};

  }
];
