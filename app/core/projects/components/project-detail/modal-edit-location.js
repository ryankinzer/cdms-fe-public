//modal to edit location
var modal_edit_location = ['$scope', '$uibModal','$uibModalInstance','AdminService',

    function ($scope, $modal, $modalInstance, AdminService) {

        
        $scope.save = function () {
/*
			var saved_field = AdminService.saveDatasetField($scope.field_to_edit);
            saved_field.$promise.then(function () { 
                $modalInstance.close(saved_field);
            }, function (error) {
                $scope.SaveMessage = "Error: " + error.data.ExceptionMessage;
            });
  */          
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
