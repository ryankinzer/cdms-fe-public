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
            console.dir($scope.production_modal);
            
            var intCropAcres = parseInt($scope.production_modal.CropAcres);
            //if (($scope.production_modal.CropAcres !== 'undefined') && (intCropAcres === NaN))
            if (isNaN($scope.production_modal.CropAcres))
            {
                $scope.saveResult.error = "Crop Acres must be either blank, or a number."
                return;
            }
            //throw "Stopping right here...";

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
