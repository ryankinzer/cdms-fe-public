var modal_invalid_operation =  ['$scope', '$modalInstance', 'DatasetService', 'DatastoreService',
    function ($scope, $modalInstance, DatasetService, DatastoreService) {

        $scope.header_title = $scope.invalidOperationTitle;
        $scope.header_message = $scope.invalidOperationMessage;

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
