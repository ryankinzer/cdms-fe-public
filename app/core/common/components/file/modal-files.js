
//handles managing file controltypes
var modal_files = ['$scope','$modalInstance', 'DataService','DatastoreService','ServiceUtilities','$rootScope',
    function($scope, $modalInstance, DataService, DatastoreService, ServiceUtilities, $rootScope){
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
						else if ($scope.datasetId)
						{
							console.log("Dataset file...");
							DatastoreService.deleteDatasetFile($scope.projectId, $scope.datasetId, file);
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

        $scope.save = function(){
			console.log("Inside modals-controller, FileModalCtrl, save...");
			console.log("Adding file name(s) to the list.");
			//console.log("$scope is next...");
			//console.dir($scope);
			$rootScope.viewSubproject = $scope.viewSubproject; // Add this to the $rootScope, so that the filters can see it.
			var errors = [];
			
			console.log("$scope.filesToUpload is next...");
			console.dir($scope.filesToUpload);
			//add any newly scheduled to upload files to the list for display
        	angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(incoming_file, key){
        		incoming_file.Name = incoming_file.name; //copy this value!
				console.log("incoming_file.Name = " + incoming_file.Name);
        		$scope.currentFiles.push(incoming_file);
				
				$scope.foundDuplicate = false;
				console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
				console.log("$scope.dataset is next..");
				console.dir($scope.dataset);
				console.log("$scope.viewSubproject is next...");
				console.dir($scope.viewSubproject);
				//if (($scope.DatastoreTablePrefix === "CrppContracts") && ($scope.viewSubproject))
				if (($scope.viewSubproject) && ( ($scope.DatastoreTablePrefix === "CrppContracts") || ($scope.DatastoreTablePrefix === "Metrics")) )
				{
					console.log("Need to check subprojects for duplicate document...");
					// If a subproject is has no files yet, Files will not be defined.
					if ($scope.viewSubproject.Files)
					{
						for (var p = 0; p < $scope.viewSubproject.Files.length; p++)
						{
							if (incoming_file.Name.length <= $scope.viewSubproject.Files[p].Name.length)
							{
								if ($scope.viewSubproject.Files[p].Name.indexOf(incoming_file.Name) > -1)
								{
									$scope.foundDuplicate = true;
									console.log(incoming_file.Name + " already exists in the subproject file list.");
									errors.push(incoming_file.Name + " already exists in list of subproject documents.");
								}
							}
						}
					}
				}
				else if ($scope.dataset)
				{
					console.log("Need to check dataset-level files for duplicate document...");
					if ($scope.dataset.Files)
					{
						console.log("$scope.dataset.Files is next...");
						console.dir($scope.dataset.Files);
						for (var p = 0; p < $scope.dataset.Files.length; p++)
						{
							if (incoming_file.Name.length <= $scope.dataset.Files[p].Name.length)
							{
								if ($scope.dataset.Files[p].Name.indexOf(incoming_file.Name) > -1)
								{
									$scope.foundDuplicate = true;
									console.log(incoming_file.Name + " already exists in the dataset file list.");
									errors.push(incoming_file.Name + " already exists in list of dataset documents.\n");
								}
							}
						}
					}
				}
				else
				{
					console.log("Need to check project-level files for duplicate document...");
					if ($scope.project.Files)
					{
						for (var p = 0; p < $scope.project.Files.length; p++)
						{
							if (incoming_file.Name.length <= $scope.project.Files[p].Name.length)
							{
								if ($scope.project.Files[p].Name.indexOf(incoming_file.Name) > -1)
								{
									$scope.foundDuplicate = true;
									console.log(incoming_file.Name + " already exists in the project file list.");
									errors.push(incoming_file.Name + " already exists in list of project documents.\n");
								}
							}
						}
					}
				}
        	});
			
			console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);			
			if (!$scope.foundDuplicate)
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
			
			// Inform the user immediately, if there are duplicate files.
			if ($scope.foundDuplicate)
				alert(errors);
			
			//ServiceUtilities.setFileName($scope.file_row.FieldSheetFile, $scope)
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

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
];