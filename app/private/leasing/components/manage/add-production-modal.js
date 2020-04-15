var modal_add_production = ['$scope', '$uibModalInstance', 'LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Production";

        $scope.saveResult = {};

        if (!$scope.production_modal) {
            $scope.production_modal = {
                IncomeDate: $scope.currentDay,
                IncomePostedBy: $scope.currentUser,
                LeaseYear: "" + moment().year(),
            };
        }

        $scope.save = function () {
            console.log("Inside add-production-modal.js, save...");
            console.log("$scope.production_modal is next...");
            console.dir($scope.production_modal);
            
            if (($scope.production_modal.CropAcres != undefined) && (isNaN($scope.production_modal.CropAcres)))
            {
                $scope.saveResult.error = "Crop Acres must be either blank, or a number."
                return;
            }

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
