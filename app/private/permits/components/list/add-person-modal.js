var modal_add_permitperson = ['$scope', '$uibModalInstance', 'PermitService',
    function ($scope, $modalInstance, PermitService) {

        $scope.header_message = "Edit Contact Person";

        //if we're not editing then we are creating a new one
        if (!$scope.person_modal) {
            $scope.header_message = "Add Contact Person";
            $scope.person_modal = { Id: 0 };
        }

        console.dir($scope.person_modal);

        $scope.person_modal.LastUpdated = moment().format('L');
        $scope.person_modal.UpdatedBy = $scope.Profile.Fullname;

        $scope.updateFullname = function () { 
            $scope.person_modal.FullName = $scope.person_modal.FirstName + " " + $scope.person_modal.LastName;
        };

        $scope.save = function () {

            var save_result = PermitService.savePermitPerson($scope.person_modal);

            save_result.$promise.then(function () {
                $modalInstance.close(save_result);
            });
        };


        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
