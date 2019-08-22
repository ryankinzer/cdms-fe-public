var modal_add_permitperson = ['$scope', '$uibModalInstance', 'PermitService', 'GridService',
    function ($scope, $modalInstance, PermitService, GridService) {

        $scope.header_message = "Edit Contact Person";

        $scope.row = $scope.person_modal;

        //if we're not editing then we are creating a new one
        if (!$scope.row) {
            $scope.header_message = "Add Contact Person";
            $scope.row = { Id: 0 };
        }

        //console.dir($scope.row);

        $scope.row.LastUpdated = moment().format('L');
        $scope.row.UpdatedBy = $scope.Profile.Fullname;

        $scope.updateFullname = function () { 
            $scope.row.FullName = $scope.row.FirstName + " " + $scope.row.LastName;
        };

        $scope.save = function () {

            var save_result = PermitService.savePermitPerson($scope.row);

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

console.dir(event);

            GridService.validateCell(event);
            GridService.fireRule("OnChange", event); 
        }

        $scope.toggleMailingAddress = function(){
            console.log("mailing address toggle fired");
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
