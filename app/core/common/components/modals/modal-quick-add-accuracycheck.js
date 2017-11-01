var modal_quick_add_accuracycheck = ['$scope','$modalInstance', 'DatasetService','DatastoreService',
  function($scope,  $modalInstance, DatasetService, DatastoreService){

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