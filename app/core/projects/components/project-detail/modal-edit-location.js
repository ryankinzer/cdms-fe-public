//modal to edit location
var modal_edit_location = ['$scope', '$uibModal','$uibModalInstance','GridService',

    function ($scope, $modal, $modalInstance, GridService) {

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

        //used as a filter to exclude the edit link - only show bonafide fields
        $scope.hasDbColumnName = function (field) {
            return field.hasOwnProperty('DbColumnName');
        }

        $scope.onHeaderEditingStopped = function (field) { 
            //build event to send for validation
            console.log("onHeaderEditingStopped: " + field.DbColumnName);
            var event = {
                colDef: field,
                node: { data: $scope.row },
                value: $scope.row[field.DbColumnName],
                type: 'onHeaderEditingStopped'
            };

            if (GridService.validateCell(event)) {
                    GridService.fireRule("OnChange", event); //only fires when valid change is made
            }

            //update our collection of header errors if any were returned
            $scope.headerFieldErrors = [];
            if ($scope.row.rowHasError) {
                $scope.row.validationErrors.forEach(function (error) { 
                    if (Array.isArray($scope.headerFieldErrors[error.field.DbColumnName])) {
                        $scope.headerFieldErrors[error.field.DbColumnName].push(error.message);
                    } else {
                        $scope.headerFieldErrors[error.field.DbColumnName] = [error.message];
                    }
                });
            }

        };

        //fire validation for all columns when we load
        $scope.dataGridOptions.columnDefs.forEach(function (field) { 
            $scope.onHeaderEditingStopped(field);
            //console.dir(field);
        });

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
