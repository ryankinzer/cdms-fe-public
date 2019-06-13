//modal to add/edit permit file
var modal_edit_permitfile = ['$scope', '$uibModal','$uibModalInstance','GridService','CommonService','Upload','ProjectService',

    function ($scope, $modal, $modalInstance, GridService, CommonService, $upload, ProjectService) {

        $scope.mode = "edit";

        if (!$scope.file_modal.Id) {
            $scope.mode = "new";
        }

        $scope.save = function () {
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

  
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
