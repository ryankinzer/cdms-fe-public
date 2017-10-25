
module_add_accuracy_check = ['$scope', '$modalInstance', 'DataService', 'DatastoreService',
    function ($scope, $modalInstance, DataService, DatastoreService) {

        $scope.ac_row = angular.copy($scope.ac_row);

        $scope.save = function () {

            var promise = DatastoreService.saveInstrumentAccuracyCheck($scope.viewInstrument.Id, $scope.ac_row);

            promise.$promise.then(function () {
                $scope.reloadProject();
                $modalInstance.dismiss();
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];