//modal to edit location
var modal_edit_location = ['$scope', '$uibModal','$uibModalInstance','GridService','CommonService',

    function ($scope, $modal, $modalInstance, GridService, CommonService) {

        $scope.mode = "edit";

        if (!$scope.row.Id) {
            $scope.mode = "new";
        }

        $scope.save = function () {

            var payload = {
                'ProjectId' : $scope.project.Id,
                'Location' : $scope.row,
            };

            var save_location = CommonService.saveNewProjectLocation($scope.project.Id, $scope.row);

            save_location.$promise.then(function () { 
                $modalInstance.close(save_location);
            }, function (error) {
                $scope.SaveMessage = "Error: " + error.data.ExceptionMessage;
            });
          
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

        //fire validation for all columns when we load (if we are editing)
        if ($scope.mode === 'edit') {
            $scope.dataGridOptions.columnDefs.forEach(function (field) {
                $scope.onHeaderEditingStopped(field);
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
