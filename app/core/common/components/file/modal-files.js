//this modal provides a common UI for file uploading

/*
* below the modal's controller function below, there are mixin properties and functions
*  that will need to be present on your controller in order for the uploading to work.
*  see dataset-edit-form.js or modal-add-correspondence-event.js (etc) for example use.
*/

//handles managing file controltypes
var modal_files = ['$scope', '$uibModalInstance', 'DatasetService','SubprojectService','$rootScope',
    function ($scope, $modalInstance, DatasetService, SubprojectService, $rootScope){
		
		if (typeof $scope.onRow !== 'undefined')
			$scope.onRow.errors = [];
		
		$scope.foundDuplicate = false;

        //note: we are extending here or clearing with length=0 in order to avoid creating a local copy of this property in our child scope.
        if ($scope.file_row[$scope.file_field]) {
            $scope.currentFiles.length = 0;

            //only show the files that we aren't uploading
            var existing_files = [];
            var from_current_files = angular.fromJson($scope.file_row[$scope.file_field]);
            if (from_current_files && Array.isArray(from_current_files)) {
                from_current_files.forEach(function (file) {
                    if (!isFileInList(file, $scope.filesToUpload[$scope.file_field]))
                        existing_files.push(file);
                });
            }

            $scope.currentFiles = angular.extend($scope.currentFiles, existing_files);
        } else {
            $scope.currentFiles.length = 0;
        }

        //console.log("$scope.currentFiles is : ", $scope.currentFiles, "for field", $scope.file_field);
        //console.log("And originalExistingFiles: ", $scope.originalExistingFiles);
		
        //removes the file from currentFiles and adds to removedFiles (does NOT actually delete the file) 
        // - fires when user click remove button on current files
    	$scope.removeFile = function(file)
    	{
			//console.log("Inside FileModalCtrl, removeFile...");
			//console.dir(file);			
			//console.dir($scope.currentFiles);

            //find the file in our current files (match by name)
			angular.forEach($scope.currentFiles, function(existing_file, key){
				//console.log("existing_file.Name = " + existing_file.Name + ", file.Name = " + file.Name);

                if (existing_file.Name === file.Name)
                {
                    //remove from current files list
                    $scope.currentFiles.splice(key, 1);

                    //add to files to remove list
                    $scope.removedFiles.push(existing_file);
                    $scope.file_row.fieldRemovedFiles[$scope.file_field].push(existing_file);
                }
                
            });

            console.log("now removedFiles = ",$scope.removedFiles);
    	}

        //remove this file from the $scope.filesToUpload - fires when user clicks "remove" button on file to upload
        $scope.removeFileFromUpload = function (file_to_remove) {

            //remove from filesToUpload
            var remainingFiles = [];
            $scope.filesToUpload[$scope.file_field].forEach(function (file) {
                if (file.Name !== file_to_remove.Name) {
                    remainingFiles.push(file);
                }
            });

            $scope.filesToUpload[$scope.file_field] = remainingFiles;

            //now do the same for the row remaining files.
            var rowRemainingFiles = [];
            $scope.file_row.fieldFilesToUpload[$scope.file_field].forEach(function (file) {
                if (file.Name !== file_to_remove.Name) {
                    rowRemainingFiles.push(file);
                }
            });

            $scope.file_row.fieldFilesToUpload[$scope.file_field] = rowRemainingFiles;
        };

        //fires when user clicks "done" button --> doesn't execute upload/removes, just gets everything ready for the host modal
        $scope.save = function(){
            console.log(" -- DONE -- clicked --- prepping and closing file modal");

            var hasFilesToUpload = true;

            if (!Array.isArray($scope.filesToUpload[$scope.file_field]) || $scope.filesToUpload[$scope.file_field].length == 0)
            {
                hasFilesToUpload = false;
                $scope.filesToUpload[$scope.file_field] = [];
            }

            if ($scope.viewSubproject)
                $rootScope.viewSubproject = $scope.viewSubproject; // Add this to the $rootScope, so that the filters can see it.

			var errors = [];

            
			console.log("$scope.filesToUpload is next...");
            console.dir($scope.filesToUpload);
            console.dir($scope.currentFiles);
            console.dir($scope.removedFiles);

            console.log("-- file row -- ");
            console.dir($scope.file_row);
            

            if (hasFilesToUpload) {
                console.log(" --> we have files to upload <--");
                var filesReadyToUpload = [];

                //remove any duplicates
                $scope.filesToUpload[$scope.file_field].forEach(function (incoming_file, key) {
                    if (isDuplicateUploadFile(incoming_file, $scope.modalFiles_filesToCheckForDuplicates)) {
                        $scope.foundDuplicate = true;
                        errors.push("Ignoring: " + incoming_file.Name + " - file already exists." + "\n");
                    } else {
                        filesReadyToUpload.push(incoming_file);

                        //add to the currentfiles ONLY if the file is one coming from this field in the row...
                        if (isFileInList(incoming_file, $scope.file_row.fieldFilesToUpload[$scope.file_field])){
                            //add to our current files for display once they close this modal
                            $scope.currentFiles.push(incoming_file); 
                        }
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
            
            
				//copy back to the actual row field, whatever the state of currentFiles (maybe removed ones)
                $scope.file_row[$scope.file_field] = angular.toJson($scope.currentFiles);

                console.log("$scope.file_field = " + $scope.file_field);
				console.log("$scope.file_row = ");
				console.dir($scope.file_row);
                console.dir($scope.currentFiles);

            $modalInstance.close();
			
        };

        //cancel clicked
        $scope.cancel = function () {
            //remove the files that are in my row removed files,
            //$scope.removedFiles.length = 0;

            var removed_to_keep = [];
            $scope.removedFiles.forEach(function (file) {
                if (!isFileInList(file, $scope.file_row.fieldRemovedFiles[$scope.file_field]))
                    removed_to_keep.push(file);
            });
            $scope.removedFiles.length = 0;
            $scope.removedFiles = angular.extend($scope.removedFiles, removed_to_keep); //keep all the ones we aren't canceling (being removed from other fields)
            $scope.file_row.fieldRemovedFiles[$scope.file_field].length=0; //clear row's removed files
            
            //reset to my original existing
            $scope.file_row[$scope.file_field] = $scope.originalExistingFiles[$scope.file_field];

            //remove my row files to upload
            //$scope.filesToUpload[$scope.file_field] = [];

            var upload_files_to_keep = [];

            $scope.filesToUpload[$scope.file_field].forEach(function (file) {
                if (!isFileInList(file, $scope.file_row.fieldFilesToUpload[$scope.file_field]))
                    upload_files_to_keep.push(file);
            });

            $scope.filesToUpload[$scope.file_field] = upload_files_to_keep;
            $scope.file_row.fieldFilesToUpload[$scope.file_field] = [];

            console.log(" -- cancelled -- ");
            console.dir($scope.file_row);
            console.dir($scope.filesToUpload);
            console.dir($scope.removedFiles);

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
    $scope.originalExistingFiles = {};

    $scope.modalFiles_filesToCheckForDuplicates = in_files_to_check_for_duplicates;
    $scope.$modal = $modal;


    //opens the file modal. pass in the datarow and the field that we're managing files for
    //we set $scope.file_row and $scope.file_field so they are available later while we work with this field.

    $scope.openFileModal = function (row, field, callback) {

        //setup our files buckets on the row if it isn't already...
        if (!row.originalExistingFiles) {
            row.originalExistingFiles = {};
            row.fieldFilesToUpload = {};
            row.fieldRemovedFiles = {};
        }
        
        console.log("row origin starting: ", row.originalExistingFiles);

        //set our original existing files in our row if not already. (if it is already set then THOSE are the original files and we want to remember them)
        if (!row.originalExistingFiles[field]) {
            if (row[field]) {
                console.log("no existing files in row + row field exists... setting original to ", row[field]);
                $scope.originalExistingFiles[field] = row[field];
            } else {
                console.log("no existing fields in row + row field does not exist ... setting to blank");
                $scope.originalExistingFiles[field] = []; //meaning that this field has NO existing files.
            }
            console.log("setting row originalExistingFiles");
            row.originalExistingFiles[field] = $scope.originalExistingFiles[field]; //we will store this both in the row and in the scope... necessary since we sometimes are storing files in detail cells
        } else {
            console.log("already have original files set in the row, so use them in the scope.");
            $scope.originalExistingFiles[field] = row.originalExistingFiles[field];
        }

        console.log("------------------------ original files are set to: ", $scope.originalExistingFiles);
        $modal = $scope.$modal; //since we're in a different scope

        //set up our local buckets for files to upload and removed files
        // we will use these to remember our state in case the user cancels.
        if (!row.fieldFilesToUpload[field]) {
            row.fieldFilesToUpload[field] = [];
        }

        if (!row.fieldRemovedFiles[field])
            row.fieldRemovedFiles[field] = [];

        // $scope.filesToUpload gets set to undefined, during CreelSurvey addSection cleanup/prep action.
        // Therefore, we must recreate it here, before continuing.
        if ((typeof $scope.filesToUpload === 'undefined') || ($scope.filesToUpload === null))
            $scope.filesToUpload = {};

        if (!$scope.filesToUpload[field])
            $scope.filesToUpload[field] = [];
        
        console.log("row is next...", row);
        console.log("field is next...:", field);
        
        $scope.file_row = row;
        $scope.file_field = field;

        var modalInstance = $modal.open({
            templateUrl: 'app/core/common/components/file/templates/modal-file.html',
            controller: 'FileModalCtrl',
            scope: $scope, //scope to make a child of
        }).result.then(function (saved_field) { 
            console.log(" (*(((*(9************ we are back! ");
            callback();
        });
    };

    //field = DbColumnName
    //after user selects files to upload from the file chooser
    $scope.onFileSelect = function (field, files) {
        console.log("Inside onFileSelect for field: ", field);
        
        if (files) {
            files.forEach(function (file) {
                if (isDuplicateUploadFile(file, $scope.modalFiles_filesToCheckForDuplicates))
                    file.UploadMessage = "DUPLICATE: will not upload.";
                else
                    file.UploadMessage = "Ready to upload.";

                //add to the scope and to our own list
                if (!isFileInList(file, $scope.filesToUpload[field])) {
                    $scope.filesToUpload[field].push(file);
                    $scope.file_row.fieldFilesToUpload[field].push(file);
                } else {
                    console.log(">> that file is already in our upload list... ignoring...");
                }
                
            });
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

        $scope.file_row = saveRow; //important! otherwise our filerow is set to the last thing (which is only a problem when we have files in the grid)
       
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
                    //if this fails, we should add it back?
                }

            });
        }

        // Now let's handle incoming files if we have them.

        //in filesToUpload there might be several fields with files to handle.
        if ((typeof $scope.filesToUpload !== 'undefined') && ($scope.filesToUpload !== null)) {
            var file_fields = Object.keys($scope.filesToUpload);
            console.log("Fields that have files in them to upload: ", file_fields);

            //if there are no files being uploaded for any field then carry on.
            if (file_fields.length === 0) {
                $scope.modalFile_saveParentItem(saveRow);
                return;
            }

            //how many files do we have to upload?
            file_fields.forEach(function (key) {
                $scope.filesToUpload[key].forEach(function (file) {
                    console.log(key + " : " + file.Name);
                    $scope.fileCount++;
                });
            });
        }

        console.log(" >> total of " + $scope.fileCount + " files to upload <<");

        //this watcher will only run once after all files are uploaded.
        var fileProgressWatcher = $scope.$watch('fileProgress', function () {
            if ($scope.fileProgress < $scope.fileCount)
                return;

            //from here on, we run only if our files have all finished uploading.
            console.log(" -- files have all finished saving -- ")
            $scope.loading = false; // Stop the fish spinner.
            $scope.showCloseButton = true;
            $scope.showCancelButton = false;
            $scope.showFormItems = false;

            fileProgressWatcher(); //stop the watcher once we're done uploading...

            //set a scope variable we can use to show our files
            $scope.filesToUpload_keys = getPopulatedUploadKeys($scope.filesToUpload);
            console.log("filesToUpload keys: ", $scope.filesToUpload_keys);

            //for each of the uploaded file fields, see if there are any we need to remove from the list we'll save for that field because they failed
            $scope.filesToUpload_keys.forEach(function (in_file_field) {

                console.log(">>>>>>>>>>>>>>>>>> all done saving for field: " + in_file_field);

                console.log("before we remove the failed files::: working on field -------------------->>> ", in_file_field);
                console.log(saveRow[in_file_field]);


                //TODO: save a reference to the row somehow so that we can remove file links if they fail...
                //when we save a file in the grid, we don't have a reference to the grid row,
                // this means we can't remove files that fail from the list of files (just for grid row file fields).
                if (saveRow.hasOwnProperty(in_file_field)) {

                    //remove any failed files from the saveRow.ItemFiles/EventFiles/etc column
                    var remaining_files = [];
                    var current_files = angular.fromJson(saveRow[in_file_field]);
                    if (current_files && Array.isArray(current_files) && $scope.filesToUpload && $scope.filesToUpload[in_file_field]) {

                        current_files.forEach(function (file_to_check) {
                            //then find the file in the uploads... did it fail?
                            var uploading_this_one = false;
                            $scope.filesToUpload[in_file_field].forEach(function (upload_file) {
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

                    saveRow[in_file_field] = angular.toJson(remaining_files);
                } else {
                    console.log(" -- ignoring this step because the field was undefined -- assuming this is a grid file and we don't have the right saverow...");
                }

                console.log("after we remove the failed files...");
                console.log(saveRow[in_file_field]);

            });

            //and finally, save the item
            $scope.modalFile_saveParentItem(saveRow);

        }, true);

        // --------------------------------------------- end of watcher.


        if ((typeof file_fields !== 'undefined') && (file_fields !== null)) {
            //now go ahead and process the files for each field
            file_fields.forEach(function (in_file_field, index) {

                //iterate our incoming files...
                $scope.filesToUpload[in_file_field].forEach(function (file) {
                    console.log("incoming file:");
                    console.dir(file);
                    console.log("for field: ", in_file_field);

                    if (file.success != "Success") {
                        console.log("Let's save the file...");

                        //update our incoming data with some file info
                        in_data.Description = "Uploaded file " + file.Name;
                        in_data.Title = file.Name;

                        $scope.upload = $upload.upload({
                            url: serviceUrl + in_target,
                            method: "POST",
                            data: in_data,
                            file: file,

                        }).progress(function (evt) {
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                            file.success = "working: " + parseInt(100.0 * evt.loaded / evt.total) + "%";
                        }).success(function (data, status, headers, config) {

                            console.log("done saving and success!");

                            if (data.length == 0) //means the backend actually failed to create our object. We need an error message!
                            {
                                $scope.filesWithErrors++;
                                file.success = "Failed (unknown error)"
                            } else {
                                file.success = "Success";
                                $scope.modalFiles_filesToCheckForDuplicates.push(data[0]); //add this file to the duplicate file list
                            }

                            $scope.fileProgress++;

                        }).error(function (data, status, headers, config) {
                            $scope.filesWithErrors++;
                            console.error(file.name + " failed to upload.");
                            console.dir(data);
                            file.success = "Failed (" + data.ExceptionMessage + ")";
                            $scope.fileProgress++; //even if there is an error, we are done processing it...
                        });

                    }
                });
            }); //foreach filefield
        }
    };
};



//return just the keys that have files in them
function getPopulatedUploadKeys(files) {
    var keys = [];

    if (!files)
        return keys;

    var all_keys = Object.keys(files);
    all_keys.forEach(function (key) {
        if (files[key] && Array.isArray(files[key]) && files[key].length > 0 && key != "Waypoints") //ignore waypoints file
            keys.push(key);
    });

    return keys;
}
