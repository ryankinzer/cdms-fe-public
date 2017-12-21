var modal_quick_add_accuracycheck = ['$scope', '$modalInstance', 'ProjectService',
    function ($scope, $modalInstance, ProjectService){

    $scope.ac_row = {};

    $scope.save = function(){
      
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