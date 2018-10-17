//modal to bulk update RowQAStatus
var modal_bulk_rowqa_change = ['$scope', '$uibModal','$uibModalInstance',

    function ($scope, $modal, $modalInstance) {

        $scope.newRowQAStatus = {};

        $scope.save = function () {
            $scope.setSelectedBulkQAStatus($scope.newRowQAStatus.Id);
            $modalInstance.close('save');
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
