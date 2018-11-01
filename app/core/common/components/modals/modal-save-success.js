var modal_save_success = ['$scope','$uibModalInstance',
  function($scope,  $modalInstance){

    $scope.header_message = "Save Successful!";

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];
