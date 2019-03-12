var modal_add_fall_inspection = ['$scope', '$modalInstance', 'LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Edit Fall Inspection";

        //if we're not editing then we are creating a new one
        if (!$scope.inspection_modal) {
            $scope.header_message = "Add Fall Inspection";

            $scope.inspection_modal = {
                InspectionDateTime: $scope.currentDay,
                InspectedBy: $scope.currentUser,
                LeaseYear: "" + moment().year(),
                InspectionType: "Fall",
            };
        }

        console.dir($scope.inspection_modal);


        $scope.save = function () {
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
