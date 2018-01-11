//this modal can be used anywhere you want to handle file uploads.
//things you need to do in the modal that calls this one:
// on your modal load:      $scope.originalExistingFiles = $scope.hi_row.ItemFiles; //in case the user cancels, we'll need to reset it
// in your cancel function: $scope.hi_row.ItemFiles = $scope.originalExistingFiles;


//handles managing file controltypes
var modal_files = ['$scope', '$modalInstance', 'DatasetService','SubprojectService','$rootScope',
    function ($scope, $modalInstance, DatasetService, SubprojectService, $rootScope){
		// This controller is for the Dataset Activity / Subproject File modal.
		console.log("Inside modals-controller.js, FileModalCtrl");
		//console.log("$scope is next...");
		//console.dir($scope);
		
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

		console.log("$scope.file_field.DbColumnName = " + $scope.file_field.DbColumnName);
    	$scope.currentFiles = $scope.originalExistingFiles;
    	if($scope.currentFiles)
    		$scope.currentFiles = angular.fromJson($scope.currentFiles);
    	else
            $scope.currentFiles = [];

        //$scope.original_existingFiles = $scope.file_row[$scope.file_field.DbColumnName];

		console.log("$scope.currentFiles (after check) is next...");
        console.dir($scope.currentFiles);
        console.log("And original");
        console.dir($scope.originalExistingFiles);
		
		$rootScope.currentFiles = angular.copy($scope.currentFiles);
		console.log("$rootScope.currentFiles is next...");
		console.dir($rootScope.currentFiles);


        //TODO: this needs to be refactored.
    	$scope.removeFile = function(file)
    	{
			console.log("Inside FileModalCtrl, removeFile...");
			console.log("file is next...");
			console.dir(file);
			console.log($scope);
			
			console.log("$rootScope.currentFiles is next...");
			console.dir($rootScope.currentFiles);
			
			angular.forEach($rootScope.currentFiles, function(existing_file, key){
				console.log("existing_file.Name = " + existing_file.Name + ", file.Name = " + file.Name);
				var existing_fileLength = existing_file.Name.length;
				var fileNameLength = file.Name.length;
				console.log("existing_fileLength = " + existing_fileLength + ", fileNameLength = " + fileNameLength);
				
				console.log("Check: " + existing_file.Name.indexOf(file.Name));
				//if(existing_file.Name == file.Name)
				if (existing_fileLength === fileNameLength)
				{
					console.log("Lengths match...");
					if (existing_file.Name.indexOf(file.Name) !== -1)
					{
						console.log("Name matches...");
                        if (isCRPPProject($scope.project))
                        {
							console.log("CRPP file...");
							SubprojectService.deleteCorresEventFile($scope.projectId, $scope.subprojectId, $scope.ce_row.Id, file);
						}
                        if (isHabitatProject($scope.project))
						{
							console.log("Habitat file...");
							// Subproject or Habitat Item-related?
							if ((typeof $scope.hi_row !== 'undefined') && ($scope.hi_row.Id !== null))
							{
								console.log("We want to delete a Habitat Item file...");
								SubprojectService.deleteHabitatItemFile($scope.projectId, $scope.subprojectId, $scope.hi_row.Id, file);
							}
							else
							{
								console.log("We want to delete a Subproject file...");
								SubprojectService.deleteHabSubprojectFile($scope.projectId, $scope.subprojectId, file);								
							}							
						}
						else if ($scope.datasetId)
						{
							console.log("Dataset file...");
							DatasetService.deleteDatasetFile($scope.projectId, $scope.datasetId, file);
						}

						$rootScope.currentFiles.splice(key,1);
						console.log("Deleted file from currentFiles");
						$scope.currentFiles = $rootScope.currentFiles;
						console.dir($rootScope.currentFiles);
						
						var foundFile = false;
						while (!foundFile)
						{
							if ($scope.datasetId)
							{
								angular.forEach($scope.dataset.Files, function(dFile){
									//console.log("dFile.Id = " + dFile.Id + ", file.Id = " + file.Id);
									if (!foundFile)
									{
										//console.log("We have not found the file yet...");
										//console.log("typeof file.Id = " + typeof file.Id);
										if ((typeof file.Id === 'undefined') || (file.Id === null))
										{
											//console.log("Either file file.Id is undefined, or the file.Id is null.");
											//console.log("dFile.Name = " + dFile.Name + ", file.Name = " + file.Name);
											if (dFile.Name === file.Name)
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
										else if (dFile.Id === file.Id)
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
									console.log("Found file in $scope.dataset.Files and removed it.");
								else
								{
									console.log("Did not find file in $scope.dataset.Files...");
									foundFile = true; // Set to true, to exit the loop.
								}
							}
							else
							{
								angular.forEach($scope.project.Files, function(pFile){
									//console.log("pFile.Id = " + pFile.Id + ", file.Id = " + file.Id);
									if (!foundFile)
									{
										//console.log("We have not found the file yet...");
										//console.log("typeof file.Id = " + typeof file.Id);
										if ((typeof file.Id === 'undefined') || (file.Id === null))
										{
											//console.log("Either file file.Id is undefined, or the file.Id is null.");
											//console.log("pFile.Name = " + pFile.Name + ", file.Name = " + file.Name);
											if (pFile.Name === file.Name)
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
										else if (pFile.Id === file.Id)
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
					}
				}
			});
	    	
	    	if(!file.Id) //removing a not-yet-saved file, so remove it from the tobeuploaded list
	    	{
	    		//also look in the previously scheduled for upload files...
	    		try{
	    		angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
	    			//console.dir(to_upload_file);
	    			//console.dir(file);
	    			//console.dir(key);

	    			if(to_upload_file.Name == file.Name){
	    				$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
	    			}
	    		});
	    		}
	    		catch(e)
	    		{
	    			console.dir(e);
	    		}
	    	}

//	    	console.dir($scope.filesToUpload);
    	}

        //remove this file from the $scope.filesToUpload
        $scope.removeFileFromUpload = function (file_to_remove) {
            var remainingFiles = [];
            $scope.filesToUpload[$scope.file_field.DbColumnName].forEach(function (file) {
                if (file.Name !== file_to_remove.Name) {
                    remainingFiles.push(file);
                }
            });

            $scope.filesToUpload[$scope.file_field.DbColumnName] = remainingFiles;
        };

        $scope.save = function(){
			console.log("Inside modals-controller, FileModalCtrl, save...");
			console.log("Adding file name(s) to the list.");
			//console.log("$scope is next...");
			//console.dir($scope);
			$rootScope.viewSubproject = $scope.viewSubproject; // Add this to the $rootScope, so that the filters can see it.
			var errors = [];
			
			console.log("$scope.filesToUpload is next...");
			console.dir($scope.filesToUpload);

            //this class is multi-use, so which files to check for duplicates depends on the context.
            var files_to_check_for_duplicates = [];
            var file_duplicate_message = "";

            if (isCRPPProject($scope.project) || isHabitatProject($scope.project)) {
                files_to_check_for_duplicates = $scope.viewSubproject.Files;
                file_duplicate_message = " - this file already exists in this subproject."
            } else {
                files_to_check_for_duplicates = $scope.project.Files;
                file_duplicate_message = " - this file already exists in this project."
            }
            //need the dataset one?


            var filesReadyToUpload = [];

            //remove any duplicates
            $scope.filesToUpload[$scope.file_field.DbColumnName].forEach(function (incoming_file, key) {
                if(isDuplicateUploadFile(incoming_file, files_to_check_for_duplicates)) {
                    $scope.foundDuplicate = true;
                    errors.push("Ignoring: " + incoming_file.Name + file_duplicate_message);
                } else {
                    filesReadyToUpload.push(incoming_file);
                    $scope.currentFiles.push(incoming_file); //add to our current files for display once they close this modal
                }
            });

            //set our uploads to only files that are ready.
            $scope.filesToUpload[$scope.file_field.DbColumnName] = filesReadyToUpload;

            // Inform the user we've removed their duplicate files.
            if ($scope.foundDuplicate) {
                console.warn(errors);
                alert(errors);
            }
            

            if ($scope.filesToUpload[$scope.file_field.DbColumnName].length > 0)
			{
				//copy back to the actual row field
                console.log("$scope.file_field.DbColumnName = " + $scope.file_field.DbColumnName);
				$scope.file_row[$scope.file_field.DbColumnName] = angular.toJson($scope.currentFiles);
				console.log("$scope.file_row is next...");
				console.dir($scope.file_row);
				
				// Notes are in order...
				// When first building this, I was working with Harvest, and it had files in "FieldSheetFile".
				// Later, when working with ScrewTrap, I discovered that it had files in FileTitle.
				// So, we put whatever the flavor into FieldSheetFile.
				if ($scope.DatastoreTablePrefix === "Harvest")
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FieldSheetFile;
				else if ($scope.DatastoreTablePrefix === "ScrewTrap")
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FileTitle;
				else
				{
					console.log("Neither Harvest nor ScrewTrap");
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FieldSheetFile;
				}
				
				$rootScope.currentFiles = $scope.currentFiles;
			}
			else
			{
				$scope.filesToUpload[$scope.file_field.DbColumnName] = undefined;
			}
			
			//console.dir($scope);
            $modalInstance.dismiss();
			
			//ServiceUtilities.setFileName($scope.file_row.FieldSheetFile, $scope) //<-- not sure why this is commented out? kb
        };


        $scope.uploadWaypoints = function(){
            var formData = new FormData();

            angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(incoming_file, key){
                formData.append('file', incoming_file);
            });

            $.ajax({
                url: serviceUrl + '/api/v1/file/handlewaypoints',
                type : 'POST',
                data : formData,
                processData: false,  // tell jQuery not to process the data
                contentType: false,  // tell jQuery not to set contentType
                success : function(data) {
                    
                    var waypoints = eval("(" + data + ")");
                    var size = 0, key;

                    for (key in waypoints)
                        size++;

                    alert(size + " waypoints loaded");

                    $scope.__proto__.waypoints = waypoints;     // This is probably not right, but not sure how else to get the outer scope object
                },
                error: function(jqXHR, error, errorThrown) {
                    if(jqXHR.status&&jqXHR.status == 400) {
                        alert(jqXHR.responseText + "\n\n" + "Waypoints not loaded!");
                    } else{
                        alert("Error uploading file!");
                    }
                }
            });

            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $scope.file_row[$scope.file_field.DbColumnName] = $scope.originalExistingFiles;
            $scope.filesToUpload[$scope.file_field.DbColumnName] = undefined;
            $modalInstance.dismiss();
        };

    }
];