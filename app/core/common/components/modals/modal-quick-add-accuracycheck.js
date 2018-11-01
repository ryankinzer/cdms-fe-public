var modal_quick_add_accuracycheck = ['$scope', '$uibModalInstance', 'ProjectService', '$rootScope',
    function ($scope, $modalInstance, ProjectService, $rootScope){

    $scope.ac_row = {};

    $scope.save = function(){

        // Capture the Id of the instrument we are working on, so that after we save it, and the form closes,
        // we can "remember" what it was, so that we can set the instrument box to it, after the project reloads.
        $rootScope.InstrumentId = $scope.viewInstrument.Id;

        var promise = ProjectService.saveInstrumentAccuracyCheck($scope.viewInstrument.Id, $scope.ac_row);
        promise.$promise.then(function(){
            $scope.reloadProject();  
            $modalInstance.dismiss();  
        });
    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };

  }
];