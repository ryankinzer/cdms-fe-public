//modal to edit lookups
var modal_edit_lookup_item = ['$scope', '$uibModal','$uibModalInstance','GridService','CommonService',

    function ($scope, $modal, $modalInstance, GridService, CommonService) {

        $scope.mode = "edit";

        if (!$scope.row.Id) {
            $scope.mode = "new";
        }

        $scope.save = function () {

            var payload = {
                'LookupTableId' : $scope.selectedLookup.Id,
                'Item' : $scope.row,
            };

            var save_item = CommonService.saveLookupTableItem(payload);

            save_item.$promise.then(function () { 
                $modalInstance.close(save_item);
            }, function (error) {
                $scope.SaveMessage = "Error: " + error.data.ExceptionMessage;
            });
          
        };

        //used as a filter to exclude the edit link - only show bonafide fields
        $scope.hasDbColumnName = function (field) {
            return field.hasOwnProperty('DbColumnName');
        }

        $scope.onHeaderEditingStopped = function (field, logerrors) { 
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

            if (logerrors !== false) {
                console.dir($scope.headerFieldErrors);
                console.dir($scope.row);
            }

        };

        //fire validation for all columns when we load (if we are editing)
        if ($scope.mode === 'edit') {
            $scope.dataGridOptions.columnDefs.forEach(function (field) {
                $scope.onHeaderEditingStopped(field,false);
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
