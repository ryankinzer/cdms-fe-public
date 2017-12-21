
module_add_accuracy_check = ['$scope', '$modalInstance', 'ProjectService',
    function ($scope, $modalInstance, ProjectService) {

        $scope.ac_row = angular.copy($scope.ac_row);

        $scope.save = function () {

            var promise = ProjectService.saveInstrumentAccuracyCheck($scope.viewInstrument.Id, $scope.ac_row);

            promise.$promise.then(function () {
                //$scope.reloadProject();
                $scope.postInstrumentAccuracyCheckUpdateGrid(promise);
                $modalInstance.dismiss();
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];