var modal_invalid_operation =  ['$scope', '$modalInstance', 'DataService', 'DatastoreService',
    function ($scope, $modalInstance, DataService, DatastoreService) {

        $scope.header_title = $scope.invalidOperationTitle;
        $scope.header_message = $scope.invalidOperationMessage;

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
