//modal to edit metadata property ("metafield")
var modal_admin_edit_metadataproperty = ['$scope', '$uibModal','$uibModalInstance','CommonService',

    function ($scope, $modal, $modalInstance, CommonService) {

        console.dir($scope.field_to_edit);

        $scope.save = function () {

            $scope.parseValues();
            
            $scope.field_to_edit.PossibleValues = JSON.stringify($scope.field_to_edit.ListValues);

 //           console.dir($scope.field_to_edit);
            var saved_field = CommonService.saveMetadataProperty($scope.field_to_edit);
            saved_field.$promise.then(function () { 
                $modalInstance.close(saved_field);
            }, function (error) {
                console.dir(error);
                $scope.SaveMessage = "Error: " + error.data.ExceptionMessage;
            });
          
        };

        $scope.makeList = function (array_in) {
            var result = '';
            array_in.forEach(function (item) {
                result += item + "\n";
            })
                
            return result;
        }

        $scope.parseValues = function () { 
            //do some cleanup of the incoming data
            $scope.field_to_edit.Values = $scope.field_to_edit.Values.replace(/,|"/g, "");

            $scope.field_to_edit.ListValues = $scope.field_to_edit.Values.trim().split('\n');
    
            for (i = 0; i < $scope.field_to_edit.ListValues.length; i++) {
                $scope.field_to_edit.ListValues[i] = $scope.field_to_edit.ListValues[i].trim();
            }

            $scope.field_to_edit.Values = $scope.makeList($scope.field_to_edit.ListValues);
            

        };



        $scope.loadPossibleValuesString = function () { 

            if (!$scope.field_to_edit.PossibleValues) {
                $scope.field_to_edit.Values = "";
                return; //early return
            }
    

            try {
                $scope.field_to_edit.Values = $scope.makeList(angular.fromJson($scope.field_to_edit.PossibleValues));
            } catch (exception) {
                $scope.field_to_edit.Values = "";
                $scope.SaveMessage = "Error: " + exception.message;
            }
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.loadPossibleValuesString();        

    }
];
