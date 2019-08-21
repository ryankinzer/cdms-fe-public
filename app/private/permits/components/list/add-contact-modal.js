//modal to add/edit permit contact 
var modal_edit_permitcontact = ['$scope', '$uibModal','$uibModalInstance','PermitService',

    function ($scope, $modal, $modalInstance, PermitService) {

        $scope.mode = "edit";

        if (!$scope.contact_modal.PermitPersonId) {
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
            //$scope.person_modal = $scope.contact_modal;
            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/contacts/templates/add-person-modal.html',
                controller: 'AddPermitPersonModalController',
                scope: $scope,
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_person) { 

                saved_person.Label = (saved_person.Organization) ? saved_person.Organization : saved_person.FullName;
                if (saved_person.Label == "")
                    saved_person.FirstName + " " + saved_person.LastName;

                $scope.PermitPersons.push(saved_person);
                $scope.contact_modal.PermitPersonId = saved_person.Id;
                $(function () { $("#persons-select").select2(); });
            });
        }

        
    }
];
