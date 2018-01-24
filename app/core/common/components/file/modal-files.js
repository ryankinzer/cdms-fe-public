//this modal provides a common UI for file uploading

/*
* below the modal's controller function below, there are mixin properties and functions
*  that will need to be present on your controller in order for the uploading to work.
*  
* you simply call the setup function (modalFiles_setupControllerForFileChooserModal)
*  and pass in the necessary setup objects and it will expand the controller
*  so that it has all the new nifty file uploading capability.
*/

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

        console.log("$scope.file_field = " + $scope.file_field);

        //note: we are extending here or clearing with length=0 in order to avoid creating a local copy of this property in our child scope.
        if ($scope.originalExistingFiles) {
            $scope.currentFiles.length = 0;
            $scope.currentFiles = angular.extend($scope.currentFiles, angular.fromJson($scope.originalExistingFiles));
        }
    	else
            $scope.currentFiles.length = 0;

        //$scope.original_existingFiles = $scope.file_row[$scope.file_field.DbColumnName];

		console.log("$scope.currentFiles is : ", $scope.currentFiles);
        console.log("And originalExistingFiles: ", $scope.originalExistingFiles);
		
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
            $scope.filesToUpload[$scope.file_field].forEach(function (file) {
                if (file.Name !== file_to_remove.Name) {
                    remainingFiles.push(file);
                }
            });

            $scope.filesToUpload[$scope.file_field] = remainingFiles;
        };

        //fires when user clicks "done" button --> doesn't execute upload/removes, just gets everything ready for the host modal
        $scope.save = function(){
            console.log("Inside modals-controller, FileModalCtrl, save...");

            var hasFilesToUpload = true;

            if (!Array.isArray($scope.filesToUpload[$scope.file_field]) || $scope.filesToUpload[$scope.file_field].length == 0)
            {
                hasFilesToUpload = false;
                $scope.filesToUpload[$scope.file_field] = undefined;
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
                $scope.filesToUpload[$scope.file_field].forEach(function (incoming_file, key) {
                    if (isDuplicateUploadFile(incoming_file, $scope.modalFiles_filesToCheckForDuplicates)) {
                        $scope.foundDuplicate = true;
                        errors.push("Ignoring: " + incoming_file.Name + " - file already exists." + "\n");
                    } else {
                        filesReadyToUpload.push(incoming_file);
                        $scope.currentFiles.push(incoming_file); //add to our current files for display once they close this modal
                    }
                });

                //set our uploads to only files that are ready.
                $scope.filesToUpload[$scope.file_field] = filesReadyToUpload;

                // Inform the user we've removed their duplicate files.
                if ($scope.foundDuplicate) {
                    console.warn(errors);
                    alert(errors);
                }
            }
            
            // -- i think we always need this...
            //if ($scope.filesToUpload[$scope.file_field].length > 0)
			//{
				//copy back to the actual row field, whatever the state of currentFiles (maybe removed ones)
                console.log("$scope.file_field = " + $scope.file_field);
				$scope.file_row[$scope.file_field] = angular.toJson($scope.currentFiles);
				console.log("$scope.file_row is next...");
				console.dir($scope.file_row);
				
				// Notes are in order... (George Notes)
				// When first building this, I was working with Harvest, and it had files in "FieldSheetFile".
				// Later, when working with ScrewTrap, I discovered that it had files in FileTitle.
				// So, we put whatever the flavor into FieldSheetFile.
            /*
            //kb 1/23 - this shouldn't be necessary anymore since it just uses the incoming field name...

				if ($scope.DatastoreTablePrefix === "Harvest")
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FieldSheetFile;
				else if ($scope.DatastoreTablePrefix === "ScrewTrap")
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FileTitle;
				else
				{
					console.log("Neither Harvest nor ScrewTrap");
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FieldSheetFile;
				}
            */
			//}
			//else
		//	{
			//	$scope.filesToUpload[$scope.file_field] = undefined;
			//}

                console.dir($scope.currentFiles);

            $modalInstance.dismiss();
			
			//ServiceUtilities.setFileName($scope.file_row.FieldSheetFile, $scope) //<-- not sure why this is commented out? kb
        };


        $scope.uploadWaypoints = function(){
            var formData = new FormData();

            angular.forEach($scope.filesToUpload[$scope.file_field], function(incoming_file, key){
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
            $scope.file_row[$scope.file_field] = $scope.originalExistingFiles;
            $scope.filesToUpload[$scope.file_field] = undefined;
            $modalInstance.dismiss();
        };

    }
];









/**
 * setupControllerForFileChooserModal - Call this from your host modal you want to use file chooser modal (above)
 *  Sets up the given scope for your host modal with properties and methods it needs to handle uploading
 * @param {scope} $scope scope of your host modal to populate
*  @param {$modal} $modal modal controller
*  @param {array} in_files_to_check_for_duplicates Array of files to check for duplicates
 */
function modalFiles_setupControllerForFileChooserModal($scope, $modal, in_files_to_check_for_duplicates) {
    console.log('Setting up controller for file chooser modal...');

    $scope.filesToUpload = {}; //populated by file chooser (filesToUpload[$scope.file_field])
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
    $scope.$modal = $modal;


    //opens the file modal. pass in the datarow and the field that we're managing files for
    //we set $scope.file_row and $scope.file_field so they are available later while we work with this field.
    $scope.openFileModal = function (row, field) {

        //properties that will be available on your host modal
        $scope.originalExistingFiles = row[field]; //in case the user cancels, we can reset it

        console.log("------------------------ original files are set to: ", $scope.originalExistingFiles);
        $modal = $scope.$modal; //since we're in a different scope

                console.log("row is next...", row);
        console.log("field is next...:", field);
        
        $scope.file_row = row;
        
        //$scope.file_field = {
        //    DbColumnName: field
        //};

        //lets see if we can do without the .DbColumnName
        $scope.file_field = field;

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
        
        console.log("We will set the field to be: ", field);
        console.log(field);

        if (files) {
            files.forEach(function (file) {
                if (isDuplicateUploadFile(file, $scope.modalFiles_filesToCheckForDuplicates))
                    file.UploadMessage = "DUPLICATE: will not upload.";
                else
                    file.UploadMessage = "Ready to upload.";
            });

            $scope.filesToUpload[field] = files;
        } else
            console.log("there were no files on FileSelect")
        
        console.log("filesToUpload",$scope.filesToUpload);
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
        if ($scope.filesToUpload[$scope.file_field]) { 

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
                console.log(saveRow[$scope.file_field]);

                //remove any failed files from the saveRow.ItemFiles/EventFiles/etc column
                var remaining_files = [];
                var current_files = angular.fromJson(saveRow[$scope.file_field]);
                if (current_files && Array.isArray(current_files)) {

                    current_files.forEach(function (file_to_check) {
                        //then find the file in the uploads... did it fail?
                        var uploading_this_one = false;
                        $scope.filesToUpload[$scope.file_field].forEach(function (upload_file) {
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

                saveRow[$scope.file_field] = angular.toJson(remaining_files);
                console.log("after we remove the failed files...");
                console.log(saveRow[$scope.file_field]);

                //set a scope variable we can use to show our files
                $scope.filesToUpload_keys = Object.keys($scope.filesToUpload);

                //save the item...
                $scope.modalFile_saveParentItem(saveRow);

            }, true);

            // --------------------------------------------- end of watcher.

            console.log("incoming files to upload = " + $scope.filesToUpload[$scope.file_field].length);
            console.dir($scope.filesToUpload[$scope.file_field]);

            $scope.fileCount = $scope.filesToUpload[$scope.file_field].length;

            $scope.filesToUpload[$scope.file_field].forEach(function (file) {
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