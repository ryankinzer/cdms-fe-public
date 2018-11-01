var modal_invalid_operation =  ['$scope', '$uibModalInstance',  
    function ($scope, $modalInstance) {

        $scope.header_title = $scope.invalidOperationTitle;
        $scope.header_message = $scope.invalidOperationMessage;

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
