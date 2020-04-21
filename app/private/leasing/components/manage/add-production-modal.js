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
            
            var strLeaseYear = $scope.production_modal.LeaseYear.toString();

            if (($scope.production_modal.LeaseYear === undefined) || ($scope.production_modal.LeaseYear.length < 1))
            {
                $scope.saveResult.error = "Lease Year cannot be blank; it must be a 4-digit year."
                return;
            }
            else if (strLeaseYear.length !== 4)
            {
                $scope.saveResult.error = "Lease Year has incorrect number of digits."
                return;
            }
            else if (($scope.production_modal.LeaseYear < 1990) || ($scope.production_modal.LeaseYear > 2050))
            {
                $scope.saveResult.error = "Lease Year is outside of the accepted range (1990 - 2050)."
                return;
            }

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
