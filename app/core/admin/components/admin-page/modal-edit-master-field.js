//modal to edit master field
var modal_admin_edit_master_field = ['$scope', '$uibModal','$uibModalInstance','AdminService',

    function ($scope, $modal, $modalInstance, AdminService) {

        $scope.field_to_edit.DatastoreId = $scope.datastore.Id;

        $scope.save = function () {
			var saved_field = AdminService.saveMasterField($scope.field_to_edit);
            saved_field.$promise.then(function () { 
                $modalInstance.close(saved_field);
            }, function (error) {
                $scope.SaveMessage = "Error: " + error.data.ExceptionMessage;
            });
        };

        $scope.parsePossibleValuesString = function () { 
            try {
                $scope.field_to_edit.Values = angular.fromJson($scope.field_to_edit.PossibleValues);
            } catch (exception) {
                $scope.field_to_edit.Values = exception.message;
            }
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.parsePossibleValuesString();        

    }
];
