//map locations for multiple activity import
var modal_map_locations = ['$scope', '$uibModal','$uibModalInstance',

    function ($scope, $modal, $modalInstance) {

        //this is a workaround for angularjs' either too loose matching or too strict...
        $scope.locequals = function (actual, expected) { return actual == expected; };

        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
];
