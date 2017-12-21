//modal to bulk update RowQAStatus
var modal_bulk_rowqa_change = ['$scope', '$modalInstance',

    function ($scope, $modalInstance) {

        $scope.newRowQAStatus = {};

        $scope.save = function () {
            $scope.setSelectedBulkQAStatus($scope.newRowQAStatus.Id);
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
