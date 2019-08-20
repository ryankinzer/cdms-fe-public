
var modal_add_habitat = ['$scope', '$rootScope', '$uibModalInstance', '$uibModal', 'DatasetService','SubprojectService','ServiceUtilities',
	'$filter', 'Upload','$location', '$anchorScroll',
    function ($scope, $rootScope, $modalInstance, $modal, DatasetService, SubprojectService, ServiceUtilities, 
	$filter, $upload, $location, $anchorScroll){
	console.log("Inside ModalAddHabitatItemCtrl...");

    //mixin the properties and functions to enable the modal file chooser for this controller...
    modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.viewSubproject.Files);

    if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
    {
        $rootScope.subprojectId = $scope.viewSubproject.Id;
    } else {
        console.error("View Subproject is not defined! ");
    }

	$rootScope.projectId = $scope.project.Id;
	console.log("$scope.projectId = " + $scope.projectId);
	
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

	console.log("$scope.hi_row is next...");
	console.dir($scope.hi_row);	
	
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
			backdrop: "static",
			keyboard: false
		});
    };


    //callback that is called from modalFile to do the actual file removal (varies by module)
    $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
        return SubprojectService.deleteHabitatItemFile($scope.projectId, $scope.subprojectId, saveRow.Id, file_to_remove);
    };
	
    $scope.save = function () {
        console.log("Inside ModalAddHabitatItemCtrl, save...");

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

        //this gets passed along via api call... TODO: this is just to get going...
        var data = {
            ProjectId: $scope.project.Id,
            SubprojectId: subprojectId,
            SubprojectType: "Hab"
        };

        var target = '/api/v1/habsubproject/uploadhabitatfile';

        $scope.handleFilesToUploadRemove(saveRow, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.

    };

    //call back from save above once the files are done processing and we're ready to save the item
    $scope.modalFile_saveParentItem = function (saveRow) {
        var save_item_promise = SubprojectService.saveHabitatItem($scope.projectId, $scope.viewSubproject.Id, saveRow);

        //setup the promise.then that runs after the habitat item is saved...
        if (typeof save_item_promise !== 'undefined') {
            save_item_promise.$promise.then(function () {
                //did we edit or add new?
                if (saveRow.Id > 0) {
                    $scope.postEditHabitatItemUpdateGrid(save_item_promise);
                } else {
                    $scope.postAddHabitatItemUpdateGrid(save_item_promise);
                }

                if (!$scope.filesToUpload[$scope.file_field] && !$scope.removedFiles.length > 0) {
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

        if ($scope.originalExistingFiles && $scope.originalExistingFiles.hasOwnProperty($scope.file_field)) {
            $scope.hi_row.ItemFiles = $scope.originalExistingFiles[$scope.file_field];
        }
		$modalInstance.dismiss();
    };
  }
];
