var table_data_modal = ['$scope', '$uibModalInstance', 'DatasetService', 'GridService',
    function ($scope, $modalInstance, DatasetService, GridService) {

        $scope.header_message = "Edit " + $scope.dataset.Name;

        $scope.row = $scope.data_modal;

        //if we're not editing then we are creating a new one
        if (!$scope.row) {
            $scope.header_message = "Add " + $scope.dataset.Name;
        }

        //console.dir($scope.row);

        //$scope.row.LastUpdated = moment().format('L');
        //$scope.row.UpdatedBy = $scope.Profile.Fullname;

        $scope.save = function () {

            var save_result = DatasetService.saveTableData($scope.row);

            save_result.$promise.then(function () {
                $modalInstance.close(save_result);
            });
        };

        $scope.onHeaderEditingStopped = function (field, logerrors) { 
            //build event to send for validation
            console.log("onHeaderEditingStopped: " + field.DbColumnName);
            var event = {
                colDef: field,
                node: { data: $scope.row },
                scope: $scope,
                value: $scope.row[field.DbColumnName],
                type: 'onHeaderEditingStopped'
            };

            GridService.validateCell(event);
            GridService.fireRule("OnChange", event); 
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
