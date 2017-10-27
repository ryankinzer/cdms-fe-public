

var modal_quick_add_characteristic = ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.char_row = {};

    $scope.save = function(){
      
      var promise = DatastoreService.saveCharacteristic($scope.viewLabCharacteristic.Id, $scope.char_row);
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
