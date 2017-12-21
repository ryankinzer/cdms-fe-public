var modal_save_success = ['$scope','$modalInstance',
  function($scope,  $modalInstance){

    $scope.header_message = "Save Successful!";

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];
