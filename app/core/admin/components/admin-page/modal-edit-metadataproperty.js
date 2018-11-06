//modal to edit metadata property ("metafield")
var modal_admin_edit_metadataproperty = ['$scope', '$uibModal','$uibModalInstance','CommonService',

    function ($scope, $modal, $modalInstance, CommonService) {

        $scope.save = function () {
			var saved_field = CommonService.saveMetadataProperty($scope.field_to_edit);
            saved_field.$promise.then(function () { 
                $modalInstance.close(saved_field);
            }, function (error) {
                console.dir(error);
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
