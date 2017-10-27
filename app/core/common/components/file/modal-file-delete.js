
//handles managing file controltypes
var modal_file_delete = ['$scope','$modalInstance', 'DataService','DatastoreService','ServiceUtilities','$rootScope',
    function($scope, $modalInstance, DataService, DatastoreService, ServiceUtilities, $rootScope){
		// This controller is for the Dataset Activity / Subproject File modal.
		console.log("Inside modals-controller.js, FileDeleteModalCtrl");
		console.log("$scope is next...");
		console.dir($scope);
		
		$scope.verifyBeforeDelete = false;
		$scope.readyToClose = false;
		
		if (typeof $scope.onRow !== 'undefined')
			$scope.onRow.errors = [];
		
		$scope.foundDuplicate = false;
    	//note: files selected for upload are managed by onFileSelect from parent scope, in one of the following places: 
		// ModalAddCorrespondenceEventCtrl, ModalAddHabitatItemCtrl

    	//file_field and file_row
    	//console.dir($scope.file_row);
    	//console.dir($scope.file_field);
    	//console.log("Files!");
    	//console.dir($scope.filesToUpload);
		console.log("$scope.dataset.Files is next...");
		console.dir($scope.dataset.Files);

		console.log("$scope.file_field.DbColumnName = " + $scope.file_field.DbColumnName);
    	$scope.currentFiles = $scope.file_row[$scope.file_field.DbColumnName];
    	if($scope.currentFiles)
    		$scope.currentFiles = angular.fromJson($scope.currentFiles);
    	else
    		$scope.currentFiles = [];

		console.log("$scope.currentFiles (after check) is next...");
    	console.dir($scope.currentFiles);
		
		$rootScope.currentFiles = angular.copy($scope.currentFiles);
		console.log("$rootScope.currentFiles is next...");
		console.dir($rootScope.currentFiles);
	
		$scope.verifyDelete = function()
		{
			console.log("Inside FileDeleteModalCtrl, verifyDelete...");
			$scope.verifyBeforeDelete = true;
			console.dir($scope.currentFiles);
			$rootScope.currentFiles = $scope.currentFiles;
			console.dir($scope);
		}
	
    	$scope.removeFiles = function()
    	{
			console.log("Inside FileDeleteModalCtrl, removeFiles...");
			console.log("$scope is next...");
			console.log($scope);
			
			var tmpFiles = [];
			
			console.log("$rootScope.currentFiles is next...");
			console.dir($rootScope.currentFiles);
			
			angular.forEach($rootScope.currentFiles, function(existing_file, key){
				if (existing_file.DeleteThisFile)
				{
					// We will need the file name later, so make a note of it.
					tmpFiles.push(existing_file);
					
					// First, we delete the file from the backend (server drive and database)
					// *** Backend start
					console.log("existing_file.Name = " + existing_file.Name);

					if ($scope.DatastoreTablePrefix === "CrppContracts")
					{
						console.log("CRPP file...");
						DatastoreService.deleteCorresEventFile($scope.projectId, $scope.subprojectId, $scope.ce_row.Id, file);
					}
					//else if ($scope.project.Id === 1223)
					//else if ($scope.project.Id === HAB_PROJECTID)
					//else if (DatastoreService.getProjectType($scope.project.Id) === "Habitat")
					else if ($scope.DatastoreTablePrefix === "Metrics")
					{
						console.log("Habitat file...");
						// Subproject or Habitat Item-related?
						if ((typeof $scope.hi_row !== 'undefined') && ($scope.hi_row.Id !== null))
						{
							console.log("We want to delete a Habitat Item file...");
							DatastoreService.deleteHabitatItemFile($scope.projectId, $scope.subprojectId, $scope.hi_row.Id, file);
						}
						else
						{
							console.log("We want to delete a Subproject file...");
							DatastoreService.deleteHabSubprojectFile($scope.projectId, $scope.subprojectId, file);								
						}
					}
					//else if ($scope.subprojectId)
					//{
						
					//}
					else if ($scope.datasetId)
					{
						console.log("Dataset file...");
						DatastoreService.deleteDatasetFile($scope.projectId, $scope.datasetId, existing_file);
					}
					// *** Backend end					

					//$rootScope.currentFiles.splice(key,1);
					//console.log("Deleted file from currentFiles");
					//$scope.currentFiles = $rootScope.currentFiles;
					//console.dir($rootScope.currentFiles);
					// *** Now let's delete it from the front end.
					var foundFile = false;
					while (!foundFile)
					{
						// First check the dataset and project files.
						if ($scope.datasetId)
						{
							console.log("We have a dataset file...");
							angular.forEach($scope.dataset.Files, function(dFile){
								//console.log("dFile.Id = " + dFile.Id + ", file.Id = " + file.Id);
								if (!foundFile)
								{
									//console.log("We have not found the file yet...");
									//console.log("typeof file.Id = " + typeof file.Id);
									if ((typeof existing_file.Id === 'undefined') || (existing_file.Id === null))
									{
										//console.log("Either file file.Id is undefined, or the file.Id is null.");
										console.log("dFile.Name = " + dFile.Name + ", existing_file.Name = " + existing_file.Name);
										if (dFile.Name === existing_file.Name)
										{
											//console.log("Found file in $scope.dataset.Files...");
											foundFile = true;
											$scope.dataset.Files.splice(dFile.Id, 1);
											console.log("Removed file from $scope.dataset.Files...");
											
											angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
												//console.dir(to_upload_file);
												//console.dir(file);
												//console.dir(key);

												if(to_upload_file.Name === dFile.Name){
													$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
													console.log("Removed file from $scope.filesToUpload...");
												}
											});
										}
									}
									else if (dFile.Id === existing_file.Id)
									{
										//console.log("Found file in $scope.project.Files...");
										foundFile = true;
										$scope.dataset.Files.splice(dFile.Id, 1);
										console.log("Removed file from $scope.dataset.Files...");
										
										angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
											//console.dir(to_upload_file);
											//console.dir(file);
											//console.dir(key);

											if(to_upload_file.Name === dFile.Name){
												$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
												console.log("Removed file from $scope.filesToUpload...");
											}
										});
									}
								}
							});
							if (foundFile)
							{
								console.log("Found file in $scope.dataset.Files and removed it...");
							}
							else
							{
								console.log("Did not find file in $scope.dataset.Files...");
								foundFile = true; // Set to true, to exit the loop.
							}
						}
						else
						{
							console.log("We have a project file...");
							angular.forEach($scope.project.Files, function(pFile){
								//console.log("pFile.Id = " + pFile.Id + ", file.Id = " + file.Id);
								if (!foundFile)
								{
									//console.log("We have not found the file yet...");
									//console.log("typeof file.Id = " + typeof file.Id);
									if ((typeof existing_file.Id === 'undefined') || (existing_file.Id === null))
									{
										//console.log("Either file file.Id is undefined, or the file.Id is null.");
										//console.log("pFile.Name = " + pFile.Name + ", file.Name = " + file.Name);
										if (pFile.Name === existing_file.Name)
										{
											//console.log("Found file in $scope.project.Files...");
											foundFile = true;
											$scope.project.Files.splice(pFile.Id, 1);
											console.log("Removed file from $scope.project.Files...");
											
											angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
												//console.dir(to_upload_file);
												//console.dir(file);
												//console.dir(key);

												if(to_upload_file.Name === pFile.Name){
													$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
													console.log("Removed file from $scope.filesToUpload...");
												}
											});
										}
									}
									else if (pFile.Id === existing_file.Id)
									{
										//console.log("Found file in $scope.project.Files...");
										foundFile = true;
										$scope.project.Files.splice(pFile.Id, 1);
										console.log("Removed file from $scope.project.Files...");
										
										angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
											//console.dir(to_upload_file);
											//console.dir(file);
											//console.dir(key);

											if(to_upload_file.Name === pFile.Name){
												$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
												console.log("Removed file from $scope.filesToUpload...");
											}
										});
									}
								}
							});
							if (foundFile)
								console.log("Found file in $scope.project.Files and removed it.");
							else
							{
								console.log("Did not find file in $scope.project.Files...");
								foundFile = true; // Set to true, to exit the loop.
							}
						}
					}
					
					// Now adjust the items that keep track of files.
					// currentFiles
					$rootScope.currentFiles.splice(key,1);
					console.log("Deleted file from currentFiles");
					$scope.currentFiles = $rootScope.currentFiles;
					console.dir($rootScope.currentFiles);
					
					// Remove the file name from the actual field.
					angular.forEach($scope.file_row, function(field, key){
						console.log("field = " + field + ", key = " + key);
						if (key === $scope.file_field.DbColumnName)
						{
							console.log("Found the field...");
							
							// The field is a JSON option, so extract the files into an array.
							var theFiles = JSON.parse(field);
							console.dir(theFiles);
							angular.forEach(theFiles, function(item, key){
								console.log("item = " + item + ", key = " + key);
								console.dir(item);
								if (item.Name === existing_file.Name)
								{
									console.log("Names match...");
									theFiles.splice(key, 1);
								}
							});
							$scope.file_row[$scope.file_field.DbColumnName] = JSON.stringify(theFiles);//theFiles.toString();
							console.log("$scope.file_row[$scope.file_field.DbColumnName] = " + $scope.file_row[$scope.file_field.DbColumnName]);
						}

					});
					console.log("$scope.file_row is next...");
					console.dir($scope.file_row);
				}
			});
	    	

			angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
				//console.dir(to_upload_file);
				//console.dir(key);
				angular.forEach(tmpFiles, function(tmpFile){
					if(to_upload_file.Name == tmpFile.Name)
					{
						$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
					}
				});

			});
//	    	console.dir($scope.filesToUpload);

			console.dir($scope);
            //$modalInstance.dismiss();
			$scope.readyToClose = true;
    	}

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
];
