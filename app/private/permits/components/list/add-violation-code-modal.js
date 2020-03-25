//modal to add/edit violation event 
var modal_edit_violationcode = ['$rootScope','$scope', '$uibModal','$uibModalInstance','GridService','Upload','ViolationService',

    function ($rootScope, $scope, $modal, $modalInstance, GridService, $upload, ViolationService) {

        $scope.violation = $scope.row; // parent violation
        $scope.row = $scope.code_modal; //code form -- note: this creates a LOCAL scope variable for the CODE that will go away when this scope goes away...

        $scope.Results = {
            SuccessMessage: null,
            FailureMessage: null,
            DoneSaving: false,
        };

        $scope.mode = ($scope.row.Id) ? "edit" : "new";

        if (!$scope.row.Files)
            $scope.row.Files = [];

        //set up for attaching files
        modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.ViolationFiles); 

        $scope.save = function () {

            $scope.Results.DoneSaving = false;
            $scope.Results.IsSaving = true;

            $scope.row.ByUser = $scope.Profile.Id;

            var target = '/api/v1/violation/uploadfile';

            var data = {
                ProjectId: EHS_PROJECTID,
                SubprojectId: $scope.violation.Id,      //parent violation id
                ItemId: $scope.row.Id                   //event id
            };

            if (Array.isArray($scope.row.Files)) {
                if ($scope.row.Files.length == 0)
                    delete $scope.row.Files;
                else
                    $scope.row.Files = angular.toJson($scope.row.Files);
            }

            var to_save = angular.copy($scope.row);

            /*
            if($scope.row.FilesToInclude){
                var new_files = [];
                $scope.row.FilesToInclude.forEach(function(file){
                    console.dir(file);
                    file = angular.fromJson(file);
                    delete file.User;
                    new_files.push(file);
                })
                to_save.FilesToInclude = new_files;
            }else{
                to_save.FilesToInclude = [];
            }
*/
            //if this is a new event, save it first to get the ID
            if (!$scope.row.Id) {

                var new_event = ViolationService.saveViolationCode(to_save);

                new_event.$promise.then(function () {
                    console.log("done and success saving event!");
                    $scope.row.Id = data.ItemId = new_event.Id;

                    $scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
                });

            } else {
                $scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
            }

        };

        //callback that is called from modalFile to do the actual file removal (varies by module)
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            //console.dir(file_to_remove);
            return ViolationService.deleteViolationFile(EHS_PROJECTID, $scope.violation.Id, saveRow.Id, file_to_remove);
        };

        //call back from save above once the files are done processing and we're ready to save the item
        $scope.modalFile_saveParentItem = function (saveRow) {

            //save again to update with the files we uploaded
            $scope.saved_event = ViolationService.saveViolationCode(saveRow);

            $scope.saved_event.$promise.then(function () {

                $scope.Results.DoneSaving = true;

                console.log("done and success updating the files");
                $scope.Results.SuccessMessage = "Saved.";

                    
            }, function (data) {
                console.error("failure!");
                console.dir(data);
                $scope.Results.FailureMessage = "There was a problem saving or sending notifications.";
                $scope.Results.DoneSaving = false;
            });

        };

        $scope.close = function () { 
            $modalInstance.close($scope.saved_event);
        };


        //fire validation for all columns when we load (if we are editing)
        if ($scope.mode === 'edit') {
            $scope.violationCodesGrid.columnDefs.forEach(function (field) {
                $scope.onHeaderEditingStopped(field);
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.getFileLabel = function(file){
            return file.Name + ((file.Description) ? " ("+file.Description+")" : "");
        }

        //setup an event listener that fires every time a header field is changed.
        $rootScope.$on('headerEditingStopped', function (event, field) {
            // anything?
        });
        
}];
