var modal_add_grazing_inspection = ['$scope', '$modalInstance', 'LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Edit Grazing Inspection";

        //if we're not editing then we are creating a new one
        if (!$scope.inspection_modal) {
            $scope.header_message = "Add Grazing Inspection";

            $scope.inspection_modal = {
                InspectionDateTime: $scope.currentDay,
                InspectedBy: $scope.currentUser,
                LeaseYear: "" + moment().year(),
                InspectionType: "Grazing",
                Animals: []
            };
        }
        else {
            $scope.inspection_modal.Animals = angular.fromJson($scope.inspection_modal.Animals);
        }

        console.dir($scope.inspection_modal);


        $scope.save = function () {

            $scope.inspection_modal.Animals = JSON.stringify($scope.inspection_modal.Animals);

            console.dir($scope.inspection_modal);
            $scope.inspection_modal.LeaseId = $scope.lease.Id;
            var save_result = LeasingService.saveInspection($scope.inspection_modal);

            save_result.$promise.then(function () {
                $scope.saveLeaseCallback(save_result);
                $modalInstance.dismiss();
            });
        };


        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
