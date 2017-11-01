var modal_save_success = ['$scope','$modalInstance', 'DatasetService','DatastoreService',
  function($scope,  $modalInstance, DatasetService, DatastoreService){

    $scope.header_message = "Save Successful!";

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];
