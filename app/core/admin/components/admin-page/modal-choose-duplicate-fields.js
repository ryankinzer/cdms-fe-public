//modal to choose duplicate fields
var modal_admin_choose_duplicate_fields = ['$scope', '$uibModal','$uibModalInstance','AdminService',

    function ($scope, $modal, $modalInstance, AdminService) {

        $scope.savedDuplicateCheckFields = $scope.dataset.Config.DuplicateCheckFields;
        
        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $scope.dataset.Config.DuplicateCheckFields = $scope.savedDuplicateCheckFields;
            $modalInstance.dismiss();
        };

    }
];
