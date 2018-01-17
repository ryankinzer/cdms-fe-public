//this modal can be used anywhere you want to handle file uploads.

//things you need to do in the modal that calls this one:
// on your modal load:      $scope.originalExistingFiles = $scope.in_row.ItemFiles; //in case the user cancels, we'll need to reset it
// in your cancel function: $scope.in_row.ItemFiles = $scope.originalExistingFiles;

//NOTE: there is a function below to run to setup your scope to use this file chooser.


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
        // - fires when user click remove button on current files
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

        //remove this file from the $scope.filesToUpload - fires when user clicks "remove" button on file to upload
        $scope.removeFileFromUpload = function (file_to_remove) {
            var remainingFiles = [];
            $scope.filesToUpload[$scope.file_field.DbColumnName].forEach(function (file) {
                if (file.Name !== file_to_remove.Name) {
                    remainingFiles.push(file);
                }
            });

            $scope.filesToUpload[$scope.file_field.DbColumnName] = remainingFiles;
        };

        //fires when user clicks "done" button --> doesn't execute upload/removes, just gets everything ready for the host modal
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

                /* from the old way -- 
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
                */

                var filesReadyToUpload = [];

                //remove any duplicates
                $scope.filesToUpload[$scope.file_field.DbColumnName].forEach(function (incoming_file, key) {
                    if (isDuplicateUploadFile(incoming_file, $scope.modalFiles_filesToCheckForDuplicates)) {
                        $scope.foundDuplicate = true;
                        errors.push("Ignoring: " + incoming_file.Name + " - file already exists." + "\n");
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









/**
 * setupControllerForFileChooserModal - Call this from your a modal you want to use file chooser (above)
 *  Sets up the given scope for your host modal with properties and methods it needs to handle uploading
 * @param {scope} $scope scope of your host modal to populate
*  @param {$modal} $modal modal controller
*  @param {string} in_DBColumnName DbColumnName to use on the filesToUpload array.
*  @param {array} in_files_to_check_for_duplicates Array of files to check for duplicates
 */
function modalFiles_setupControllerForFileChooserModal($scope, $modal, in_row, in_DbColumnName, in_files_to_check_for_duplicates) {
    console.log('Setting up controller for file chooser modal...');

    //properties that will be available on your host modal
    $scope.originalExistingFiles = in_row[in_DbColumnName]; //in case the user cancels, we'll need to reset it
    $scope.filesToUpload = {}; //populated by file chooser (filesToUpload.SomeDbColField)
    $scope.currentFiles = []; //shown on the file modal
    $scope.removedFiles = []; //gets files if the user removes them from currentFiles using the file modal
    $scope.UploadUserMessage = "saving, please wait...";
    $scope.ReadyToClose = "";
    $scope.showCloseButton = false;
    $scope.showCancelButton = true;
    $scope.showFormItems = true;
    $scope.fileCount = 0;
    $scope.fileProgress = 0;

    $scope.modalFiles_filesToCheckForDuplicates = in_files_to_check_for_duplicates;
    $scope.modalFiles_DbColumnName = in_DbColumnName;
    $scope.$modal = $modal;


    //opens the file modal
    $scope.openFileModal = function (row, field) {

        $modal = $scope.$modal; //since we're in a different scope

        console.log("Inside openFileModal...");
        console.log("row is next...");
        console.dir(row);
        console.log("field is next...");
        console.dir(field);
        $scope.file_row = row;
        //$scope.file_field = field;
        $scope.file_field = {
            DbColumnName: $scope.modalFiles_DbColumnName
        };

        var modalInstance = $modal.open({
            templateUrl: 'app/core/common/components/file/templates/modal-file.html',
            controller: 'FileModalCtrl',
            scope: $scope, //scope to make a child of
        });
    };

    //field = DbColumnName
    //after user selects files to upload from the file chooser
    $scope.onFileSelect = function (field, files) {
        console.log("Inside onFileSelect");
        //console.log("file selected! " + field);
        //console.dir(files);
        //console.log("what was in there?");

        files.forEach(function (file) {
            if (isDuplicateUploadFile(file, $scope.modalFiles_filesToCheckForDuplicates))
                file.UploadMessage = "DUPLICATE: will not upload.";
            else
                file.UploadMessage = "Ready to upload.";
        });

        $scope.filesToUpload[field] = files;
        console.dir($scope.filesToUpload);
    };







    /**
    * does the actual upload/remove of files, interacting with the api.
    *
    */
    $scope.handleFilesToUploadRemove = function (saveRow, in_data, in_target, $upload) {

        $scope.loading = true; // start the fish spinner.
        //$scope.showCloseButton = true;
        $scope.showCancelButton = false;
        $scope.showFormItems = false;
       
        $scope.filesWithErrors = 0;
        var save_item_promise = null; //will get setup later

        //first let's remove any files that need removing...
        if ($scope.removedFiles.length > 0) {
            $scope.removedFiles.forEach(function (file_to_remove) {
                // Subproject or Habitat Item-related?

                var remove_file_promise = null;

                console.log("We want to delete a file... - fire the callback");
                remove_file_promise = $scope.modalFile_doRemoveFile(file_to_remove, saveRow);

                //setup the callback if we got a promise back - set our status and remove from our file list
                if (remove_file_promise) {
                    file_to_remove.success = "removing...";
                    remove_file_promise.$promise.then(function () {
                        //condition to check?
                        file_to_remove.success = "Success."
                        console.log(" -- before file removed: ");
                        console.dir($scope.modalFiles_filesToCheckForDuplicates);
                        removeFileFromList(file_to_remove, $scope.modalFiles_filesToCheckForDuplicates);
                        console.log(" -- after file removed: ");
                        console.dir($scope.modalFiles_filesToCheckForDuplicates);
                    });
                }

            });
        }


        // Now let's handle incoming files if we have them.
        if ($scope.filesToUpload[$scope.modalFiles_DbColumnName]) { //like filesToUpload.ItemFiles or EventFiles

            //ok, setup our watcher that will run when all files are uploaded -------------------------------------
            var fileProgressWatcher = $scope.$watch('fileProgress', function () {
                if ($scope.fileProgress < $scope.fileCount)
                    return;

                //from here on, we run only if our files have all finished uploading.

                $scope.loading = false; // Stop the fish spinner.
                $scope.showCloseButton = true;
                $scope.showCancelButton = false;
                $scope.showFormItems = false;

                fileProgressWatcher(); //stop the watcher once we're done uploading...

                console.log("before we remove the failed files...");
                console.log(saveRow[$scope.modalFiles_DbColumnName]);

                //remove any failed files from the saveRow.ItemFiles/EventFiles/etc column
                var remaining_files = [];
                var current_files = angular.fromJson(saveRow[$scope.modalFiles_DbColumnName]);
                if (current_files && Array.isArray(current_files)) {

                    current_files.forEach(function (file_to_check) {
                        //then find the file in the uploads... did it fail?
                        var uploading_this_one = false;
                        $scope.filesToUpload[$scope.modalFiles_DbColumnName].forEach(function (upload_file) {
                            if (upload_file.Name === file_to_check.Name) {
                                uploading_this_one = true;
                                if (upload_file.success === "Success")
                                    remaining_files.push(file_to_check);
                            }
                        });
                        if (!uploading_this_one) //means this was an existing file so leave it.
                            remaining_files.push(file_to_check);
                    });
                }

                saveRow[$scope.modalFiles_DbColumnName] = angular.toJson(remaining_files);
                console.log("after we remove the failed files...");
                console.log(saveRow[$scope.modalFiles_DbColumnName]);

                //save the item...
                $scope.modalFile_saveParentItem(saveRow);

            }, true);

            // --------------------------------------------- end of watcher.

            console.log("incoming files to upload = " + $scope.filesToUpload[$scope.modalFiles_DbColumnName].length);
            console.dir($scope.filesToUpload[$scope.modalFiles_DbColumnName]);

            $scope.fileCount = $scope.filesToUpload[$scope.modalFiles_DbColumnName].length;

            $scope.filesToUpload[$scope.modalFiles_DbColumnName].forEach(function (file) {
                console.log("incoming file:");
                console.dir(file);

                var newFileNameLength = file.name.length;
                console.log("file name length = " + newFileNameLength);

                console.log("file is next again...");
                console.dir(file);
                console.log("file.success = " + file.success);
                if (file.success != "Success") {
                    console.log("No file.success, so let's save the file...");

                    //update our incoming data with some file info
                    in_data.Description = "Uploaded file " + file.Name;
                    in_data.Title = file.Name;

                    $scope.upload = $upload.upload({
                        url: serviceUrl + in_target,
                        method: "POST",
                        // headers: {'headerKey': 'headerValue'},
                        // withCredential: true,
                        //data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name},
                        //data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, DatastoreTablePrefix: $scope.DatastoreTablePrefix},
                        data: in_data,
                        file: file,

                    }).progress(function (evt) {
                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        file.success = "working: " + parseInt(100.0 * evt.loaded / evt.total) + "%";
                    }).success(function (data, status, headers, config) {
                        console.log("The following are next:  data, status, headers, config, file");
                        //console.log("file is next...");
                        console.dir(data); //this is what we get back... it should be an array with our saved file
                        console.dir(status);
                        console.dir(headers);
                        console.dir(config);
                        console.dir(file);

                        //console.log("file is next...");
                        //console.dir(file);
                        //var promise = SubprojectService.saveSubprojectFile($scope.project.Id, "Hab", $scope.subprojectId, file);
                        //promise.$promise.then(function(){
                        console.log("done and success!");
                        //reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
                        //$scope.refreshProjectLocations();
                        //$modalInstance.dismiss();
                        //});


                        if (data.length == 0) //means the backend actually failed to create our object. We need an error message!
                        {
                            $scope.filesWithErrors++;
                            file.success = "Failed (unknown error)"
                        } else {
                            $scope.modalFiles_filesToCheckForDuplicates.push(data[0]); //add this file to the file list
                            file.success = "Success";
                        }


                        $scope.fileProgress++;
                    }).error(function (data, status, headers, config) {
                        $scope.filesWithErrors++;
                        console.error(file.name + " failed to upload.");
                        file.success = "Failed";
                    });

                    console.log("$scope.upload is next...");
                    console.dir($scope.upload);

                }
            });
        } else {
            $scope.modalFile_saveParentItem(saveRow);
        }
    };
};

//remove file from the list (otherwise our duplicate checking will have false positives.)
function removeFileFromList (in_file, in_list) {
    in_list.forEach(function (list_file, index) {
        if (list_file.Name === in_file.Name) {
            in_list.splice(index, 1);
            console.log(" -- removing " + list_file.Name);
        } else {
            console.log(" -- keeping " + list_file.Name);
        }
    });    
};