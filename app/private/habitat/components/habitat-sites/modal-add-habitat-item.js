
var modal_add_habitat = ['$scope', '$rootScope', '$modalInstance', '$modal', 'DatasetService','SubprojectService','ServiceUtilities',
	'$filter', 'FileUploadService','$upload','$location', '$anchorScroll',
    function ($scope, $rootScope, $modalInstance, $modal, DatasetService, SubprojectService, ServiceUtilities, 
	$filter, FileUploadService, $upload, $location, $anchorScroll){
	console.log("Inside ModalAddHabitatItemCtrl...");
	
    if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
    {
        $rootScope.subprojectId = $scope.viewSubproject.Id;
    } else {
        console.error("View Subproject is not defined! ");
    }
		
	$scope.verifyActionFormOpen = "No";
	$scope.showOtherResponseType = false;
	$scope.ReadyToClose = "";
	$scope.showCloseButton = false;
	$scope.showCancelButton = true;
	$scope.showFormItems = true;
	$scope.fileCount = 0;
    $scope.fileProgress = 0;

    $scope.originalExistingFiles = "";
    $scope.filesToUpload = {}; //populated by file chooser (filesToUpload.SomeDbColField)
    $scope.currentFiles = []; //shown on the file modal
    $scope.removedFiles = []; //gets files if the user removes them from currentFiles using the file modal

    $scope.UploadUserMessage = "saving, please wait...";
	
	$rootScope.projectId = $scope.project.Id;
	console.log("$scope.projectId = " + $scope.projectId);
	
	var keepGoing = true;
	var foundIt = false;

    if($scope.hi_row.Id > 0)
    {
        $scope.header_message = "Edit Item for: " + $scope.viewSubproject.ProjectName;
    }
	else
	{
		if ((typeof $scope.viewSubproject !== 'undefined' ) && ($scope.viewSubproject !== null))
			$scope.header_message = "Add Item to: " + $scope.viewSubproject.ProjectName;
		else if ((typeof $scope.habProjectName !== 'undefined' ) && ($scope.habProjectName !== null))
			$scope.header_message = "Add Item to: " + $scope.habProjectName;
	}

    $scope.originalExistingFiles = $scope.hi_row.ItemFiles; //in case the user cancels, we'll need to reset it

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
    //after user selects files to upload from the file chooser
	$scope.onFileSelect = function(field, files)
	{
        //console.log("Inside ModalAddHabitatItemCtrl, onFileSelect");
        //console.log("file selected! " + field);
        //console.dir(files);
        //console.log("what was in there?");

        files.forEach(function (file) {
            if (isDuplicateUploadFile(file, $scope.viewSubproject.Files))
                file.UploadMessage = "DUPLICATE: will not upload";
            else
                file.UploadMessage = "Ready to upload.";
        });

        $scope.filesToUpload[field] = files;
        //console.dir($scope.filesToUpload);
	};

    
	
	
    $scope.save = function () {
        console.log("Inside ModalAddHabitatItemCtrl, save...");

        $scope.loading = true; // start the fish spinner.
        //$scope.showCloseButton = true;
        $scope.showCancelButton = false;
        $scope.showFormItems = false;

        var saveRow = angular.copy($scope.hi_row);

        if (!saveRow.Id)
            saveRow.Id = 0;

        console.log("saveRow is next, after checking/setting the Id...");
        console.dir(saveRow);


        var subprojectId = 0;
        if ($scope.viewSubproject)
            subprojectId = $scope.viewSubproject.Id
        else
            subprojectId = $scope.subprojectId;

        $scope.filesWithErrors = 0;
        var save_habitat_item_promise = null; //will get setup later

        //first let's remove any files that need removing...
        if ($scope.removedFiles.length > 0)
        {
            $scope.removedFiles.forEach(function (file_to_remove) {
                // Subproject or Habitat Item-related?

                var remove_file_promise = null;

                if ((typeof $scope.hi_row !== 'undefined') && ($scope.hi_row.Id !== null)) {
                    console.log("We want to delete a Habitat Item file...");
                    remove_file_promise = SubprojectService.deleteHabitatItemFile($scope.projectId, $scope.subprojectId, $scope.hi_row.Id, file_to_remove);
                }
                else {
                    console.log("We want to delete a Subproject file...");
                    remove_file_promise = SubprojectService.deleteHabSubprojectFile($scope.projectId, $scope.subprojectId, file_to_remove);
                }							

                //setup the callback if we got a promise back
                if (remove_file_promise)
                {
                    file_to_remove.success = "removing...";
                    remove_file_promise.$promise.then(function () {
                        //condition to check?
                        file_to_remove.success = "Success."
                    });
                }

            });
        }


        // Now let's handle incoming files if we have them.
        if ($scope.filesToUpload.ItemFiles) {

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
                console.log(saveRow.ItemFiles);

                //remove any failed files from the saveRow.ItemFiles column
                var remaining_files = [];
                var current_files = angular.fromJson(saveRow.ItemFiles);
                if (current_files && Array.isArray(current_files)) {

                    current_files.forEach(function (file_to_check) {
                        //then find the file in the uploads... did it fail?
                        var uploading_this_one = false;
                        $scope.filesToUpload.ItemFiles.forEach(function (upload_file) {
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
                
                saveRow.ItemFiles = angular.toJson(remaining_files);
                console.log("after we remove the failed files...");
                console.log(saveRow.ItemFiles);

                //save the habitat item...
                $scope.saveHabitatItem(saveRow);

            }, true);

            // --------------------------------------------- end of watcher.

            console.log("incoming files to upload = " + $scope.filesToUpload.ItemFiles.length);
            console.dir($scope.filesToUpload.ItemFiles);

            $scope.fileCount = $scope.filesToUpload.ItemFiles.length;

            $scope.filesToUpload.ItemFiles.forEach(function (file) {
                console.log("incoming file:");
                console.dir(file);

                var newFileNameLength = file.name.length;
                console.log("file name length = " + newFileNameLength);

                console.log("file is next again...");
                console.dir(file);
                console.log("file.success = " + file.success);
                if (file.success != "Success") {
                    console.log("No file.success, so let's save the file...");
                    $scope.upload = $upload.upload({
                        url: serviceUrl + '/api/v1/habsubproject/uploadhabitatfile',
                        method: "POST",
                        // headers: {'headerKey': 'headerValue'},
                        // withCredential: true,
                        //data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name},
                        //data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, DatastoreTablePrefix: $scope.DatastoreTablePrefix},
                        data: { ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, SubprojectType: "Hab" },
                        file: file,

                    }).progress(function (evt) {
                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        file.success = "working: " + parseInt(100.0 * evt.loaded / evt.total);
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
                            $scope.viewSubproject.Files.push(data[0]); //add this file to the subproject's file list
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
            $scope.saveHabitatItem(saveRow);
        }

       
    };

    //called from save above once we're ready to save the item
    $scope.saveHabitatItem = function (saveRow) {
        var save_habitat_item_promise = SubprojectService.saveHabitatItem($scope.projectId, $scope.viewSubproject.Id, saveRow);

        //setup the promise.then that runs after the habitat item is saved...
        if (typeof save_habitat_item_promise !== 'undefined') {
            save_habitat_item_promise.$promise.then(function () {
                //did we edit or add new?
                if (saveRow.Id > 0) {
                    $scope.postEditHabitatItemUpdateGrid(save_habitat_item_promise);
                } else {
                    $scope.postAddHabitatItemUpdateGrid(save_habitat_item_promise);
                }

                if (!$scope.filesToUpload.ItemFiles && !$scope.removedFiles.length > 0) {
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
    };



	$scope.close = function(){
		console.log("Inside $scope.close...");
		$modalInstance.dismiss();	
	};

    $scope.cancel = function () {
        //if they've made file changes, the files appear as if they are existing files in the ItemFiles array... 
        // we need to reset it back to the real, actual existing files.

        $scope.hi_row.ItemFiles = $scope.originalExistingFiles;
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
