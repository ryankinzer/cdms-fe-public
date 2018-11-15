//map locations for multiple activity import
var modal_map_locations = ['$scope', '$uibModal','$uibModalInstance',

    function ($scope, $modal, $modalInstance) {

        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
