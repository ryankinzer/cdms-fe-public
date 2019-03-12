var modal_add_production = ['$scope', '$modalInstance', 'LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Production";

        if (!$scope.production_modal) {
            $scope.production_modal = {
                IncomeDate: $scope.currentDay,
                IncomePostedBy: $scope.currentUser,
                LeaseYear: "" + moment().year(),
            };
        }

        $scope.save = function () {
            console.dir($scope.production_modal);


            $scope.production_modal.LeaseId = $scope.lease.Id;
            var save_result = LeasingService.saveProduction($scope.production_modal);

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
