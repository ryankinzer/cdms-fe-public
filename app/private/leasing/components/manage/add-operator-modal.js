var modal_add_operator = ['$scope', '$uibModalInstance', 'LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Edit Operator";

        //if we're not editing then we are creating a new one
        if (!$scope.operator_modal) {
            $scope.header_message = "Add Operator";
            $scope.operator_modal = { };
        }

        $scope.operator_modal.LastUpdated = $scope.currentDay;
        $scope.operator_modal.UpdatedBy = $scope.currentUser;

        $scope.save = function () {

            var save_result = LeasingService.saveOperator($scope.operator_modal);

            save_result.$promise.then(function () {
                $scope.saveOperatorCallback(save_result);
                $modalInstance.dismiss();
            });
        };


        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
