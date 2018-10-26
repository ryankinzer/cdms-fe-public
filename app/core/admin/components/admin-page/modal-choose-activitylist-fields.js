//modal to choose activitieslist fields
var modal_admin_choose_activitylist_fields = ['$scope', '$uibModal','$uibModalInstance','AdminService',

    function ($scope, $modal, $modalInstance, AdminService) {

        $scope.savedActivityListFields = $scope.dataset.Config.ActivityListFields;
        
        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $scope.dataset.Config.ActivityListFields = $scope.savedActivityListFields;
            $modalInstance.dismiss();
        };

    }
];
