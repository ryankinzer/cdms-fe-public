
//kb 11/1 - I don't see this anywhere used in the system - it isn't being loaded by our module

var modal_quick_add_characteristic = ['$scope','$uibModalInstance', 'DatasetService','DatastoreService',
  function($scope,  $modalInstance, DatasetService, DatastoreService){

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
