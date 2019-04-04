var modal_add_compliance_inspection = ['$scope', '$uibModalInstance', 'LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Edit Compliance Inspection";

        //if we're not editing then we are creating a new one
        if (!$scope.inspection_modal) {
            $scope.header_message = "Add Compliance Inspection";

            $scope.inspection_modal = {
                InspectionDateTime: $scope.currentDay,
                InspectedBy: $scope.currentUser,
                LeaseYear: "" + moment().year(),
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
