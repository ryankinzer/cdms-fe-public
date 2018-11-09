var modal_quick_add_accuracycheck = ['$scope', '$uibModalInstance', 'ProjectService', '$rootScope',
    function ($scope, $modalInstance, ProjectService, $rootScope){

    $scope.ac_row = {};

    $scope.save = function(){

        var new_AC = ProjectService.saveInstrumentAccuracyCheck($scope.row.Activity.Instrument.Id, $scope.ac_row);
        new_AC.$promise.then(function(){
            $modalInstance.close(new_AC);  
        });
    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };

  }
];