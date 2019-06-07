//modal to add/edit permit parcel
var modal_edit_permitparcel = ['$scope', '$uibModal','$uibModalInstance','GridService','CommonService','Upload','ProjectService',

    function ($scope, $modal, $modalInstance, GridService, CommonService, $upload, ProjectService) {

        $scope.mode = "edit";

        if (!$scope.parcel_modal.Id) {
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
