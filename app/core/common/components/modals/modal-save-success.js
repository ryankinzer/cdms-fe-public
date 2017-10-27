var modal_save_success = ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.header_message = "Save Successful!";

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];
