//modal to add/edit permit contact 
var modal_edit_permitcontact = ['$scope', '$uibModal','$uibModalInstance','PermitService',

    function ($scope, $modal, $modalInstance, PermitService) {

        $scope.mode = "edit";

        if (!$scope.contact_modal.Id) {
            $scope.mode = "new";
        }

        $scope.save = function () {

            var new_contact = PermitService.savePermitContact($scope.contact_modal);

            new_contact.$promise.then(function () {
                console.log("done and success!");
                $modalInstance.close(new_contact);
            });

        };

  
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };


        $scope.addPermitPersonModal = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-person-modal.html',
                controller: 'AddPermitPersonModalController',
                scope: $scope,
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_person) { 
                $scope.PermitPersons.push(saved_person);
                $scope.contact_modal.PermitPersonId = saved_person.Id;
                $(function () { $("#persons-select").select2(); });
            });
        }

        
    }
];
