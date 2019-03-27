var inspection_violation_modal = ['$scope', '$uibModalInstance', 'LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Update Inspection Violation Action";
        
        $scope.save = function () {

            console.dir($scope.violation_modal);
            var save_result = LeasingService.saveInspectionViolation($scope.violation_modal);

            save_result.$promise.then(function () {
                $scope.saveInspectionCallback(save_result);
                $modalInstance.dismiss();
            });
        };


        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
