//modal to add/edit permit event 
var modal_edit_permitevent = ['$scope', '$uibModal','$uibModalInstance','GridService','Upload','PermitService',

    function ($scope, $modal, $modalInstance, GridService, $upload, PermitService) {

        $scope.row = $scope.activity_modal; //note: this creates a LOCAL scope variable of ROW that will go away when this scope goes away...

        $scope.mode = "edit";

        if (!$scope.activity_modal.Id) {
            $scope.mode = "new";
            $scope.row.EventDate = moment().format('L');
            $scope.row.RequestDate = moment().format('L');    
        }
        else {
            if(!$scope.row.ResponseDate)
                $scope.row.ResponseDate = moment().format('L');    

            if(!$scope.row.Reviewer)
                $scope.row.Reviewer = $scope.Profile.Fullname;
        }
        
        
        //console.log($scope.activity_modal);

        modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.activity_modal.Files); 

        $scope.save = function () {
            //$scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
            $scope.modalFile_saveParentItem($scope.row);
        };

        //call back from save above once the files are done processing and we're ready to save the item
        $scope.modalFile_saveParentItem = function (saveRow) {
            
            var new_event = PermitService.savePermitEvent(saveRow);

            new_event.$promise.then(function () {
                console.log("done and success!");
                $modalInstance.close(new_event);
            });

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
