//modal to add/edit permit event 
var modal_edit_permitevent = ['$scope', '$uibModal','$uibModalInstance','GridService','CommonService','Upload','ProjectService',

    function ($scope, $modal, $modalInstance, GridService, CommonService, $upload, ProjectService) {

        $scope.mode = "edit";

        if (!$scope.activity_modal.Id) {
            $scope.mode = "new";
        }

        $scope.row = $scope.activity_modal; //note: this creates a LOCAL scope variable of ROW that will go away when this scope goes away...
        
        console.log($scope.activity_modal);

        modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.activity_modal.Files); 

        $scope.save = function () {
            //$scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
        };

        //call back from save above once the files are done processing and we're ready to save the item
        $scope.modalFile_saveParentItem = function (saveRow) {
            /*
            saveRow.LocationType = undefined;
            saveRow.WaterBody = undefined;

            var new_location = CommonService.saveNewProjectLocation($scope.project.Id, saveRow);
            new_location.$promise.then(function () {
                console.log("done and success!");
                $modalInstance.close(new_location);
            });
            */

            $modalInstance.close();
        };

        //callback that is called from modalFile to do the actual file removal (varies by module)
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            //console.dir(file_to_remove);
            //return ProjectService.deleteFile($scope.project.Id, file_to_remove);
        };

        //used as a filter to exclude the edit link - only show bonafide fields
        $scope.hasDbColumnName = function (field) {
            return field.hasOwnProperty('DbColumnName');
        }

        $scope.onHeaderEditingStopped = function (field) { 
            //build event to send for validation
            console.log("onHeaderEditingStopped: " + field.DbColumnName);


/*
            var event = {
                colDef: field,
                node: { data: $scope.row },
                value: $scope.row[field.DbColumnName],
                type: 'onHeaderEditingStopped'
            };

            if (GridService.validateCell(event)) {
                    GridService.fireRule("OnChange", event); //only fires when valid change is made
            }

            //update our collection of header errors if any were returned
            $scope.headerFieldErrors = [];
            if ($scope.row.rowHasError) {
                $scope.row.validationErrors.forEach(function (error) { 
                    if (Array.isArray($scope.headerFieldErrors[error.field.DbColumnName])) {
                        $scope.headerFieldErrors[error.field.DbColumnName].push(error.message);
                    } else {
                        $scope.headerFieldErrors[error.field.DbColumnName] = [error.message];
                    }
                });
            }
*/
        };

        //fire validation for all columns when we load (if we are editing)
        if ($scope.mode === 'edit') {
            $scope.permitEventsGrid.columnDefs.forEach(function (field) {
                $scope.onHeaderEditingStopped(field);
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
