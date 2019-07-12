//modal to add fee
// note - this modal allows editing of the fee fields of the selected permit

var modal_add_fee = ['$scope', '$uibModal','$uibModalInstance','Upload','PermitService',

    function ($scope, $modal, $modalInstance, $upload, PermitService) {

        $scope.row.FeePaymentDate = moment().format('L');

        $scope.save = function () {

            var save_permit = angular.copy($scope.row);
            save_permit.ReviewsRequired = angular.toJson(save_permit.ReviewsRequired);
        
            var new_permit = PermitService.savePermit(save_permit);

            new_permit.$promise.then(function () {
                console.log("done and success!");
                $modalInstance.close(new_permit);
            });

        };
  
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
