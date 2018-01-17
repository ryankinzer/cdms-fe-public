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

        console.log("$scope.file_field.DbColumnName = " + $scope.file_field.DbColumnName);

        //currentFiles are the ones that show up on the modal-file.html "current files" list.
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
		
		//$rootScope.currentFiles = angular.copy($scope.currentFiles);
		//console.log("$rootScope.currentFiles is next...");
		//console.dir($rootScope.currentFiles);


        //removes the file from currentFiles and adds to removedFiles (does NOT actually delete the file)
    	$scope.removeFile = function(file)
    	{
			console.log("Inside FileModalCtrl, removeFile...");
			console.dir(file);			
			console.dir($scope.currentFiles);

            //find the file in our current files (match by name)
			angular.forEach($scope.currentFiles, function(existing_file, key){
				console.log("existing_file.Name = " + existing_file.Name + ", file.Name = " + file.Name);

                if (existing_file.Name === file.Name)
                {
                    //remove from current files list
                    $scope.currentFiles.splice(key, 1);

                    //add to files to remove list
                    $scope.removedFiles.push(existing_file);
                }
                
			});
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

            var hasFilesToUpload = true;

            if (!Array.isArray($scope.filesToUpload[$scope.file_field.DbColumnName]) || $scope.filesToUpload[$scope.file_field.DbColumnName].length == 0)
            {
                hasFilesToUpload = false;
                $scope.filesToUpload[$scope.file_field.DbColumnName] = undefined;
            }

			$rootScope.viewSubproject = $scope.viewSubproject; // Add this to the $rootScope, so that the filters can see it.
			var errors = [];

			console.log("$scope.filesToUpload is next...");
            console.dir($scope.filesToUpload);
            console.dir($scope.currentFiles);
            console.dir($scope.removedFiles);

            if (hasFilesToUpload) {
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
                    if (isDuplicateUploadFile(incoming_file, files_to_check_for_duplicates)) {
                        $scope.foundDuplicate = true;
                        errors.push("Ignoring: " + incoming_file.Name + file_duplicate_message + "\n");
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
            }
            
            // -- i think we always need this...
            //if ($scope.filesToUpload[$scope.file_field.DbColumnName].length > 0)
			//{
				//copy back to the actual row field, whatever the state of currentFiles (maybe removed ones)
                console.log("$scope.file_field.DbColumnName = " + $scope.file_field.DbColumnName);
				$scope.file_row[$scope.file_field.DbColumnName] = angular.toJson($scope.currentFiles);
				console.log("$scope.file_row is next...");
				console.dir($scope.file_row);
				
				// Notes are in order... (George Notes)
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
			//}
			//else
		//	{
			//	$scope.filesToUpload[$scope.file_field.DbColumnName] = undefined;
			//}
			
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
            $scope.removedFiles.length=0;
            $scope.file_row[$scope.file_field.DbColumnName] = $scope.originalExistingFiles;
            $scope.filesToUpload[$scope.file_field.DbColumnName] = undefined;
            $modalInstance.dismiss();
        };

    }
];