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

        $scope.personEntry = "";
        $scope.personMatches = [];

        $scope.Selected = {Person : []};

        $scope.personEntryUpdate = function () { 
            $scope.personMatches = [];
            $scope.Selected.Person.length = 0;
            $scope.person_modal = {};

            var regex = RegExp($scope.personEntry, "gi"); //global + case insensitive
            var entryLength = $scope.personEntry.length;

            if(entryLength < 2)
                return;

            $scope.PermitPersons.forEach(function (person) { 

                if (person.Label == null || person.Label == "")
                    return;

                if (regex.test(person.Label)) {

                    // if (person.ParcelId == $scope.personEntry) {
                    //     $scope.person_modal = person;
                    //     $scope.Selected.Parcel.push(angular.toJson($scope.person_modal)); //this is the trick
                    // }

                    $scope.personMatches.push(person);
                }
            });
        };

        $scope.selectPerson = function(){
            if(!$scope.Selected)
                return;
                
            var person = angular.fromJson($scope.Selected.Person[0]); //this is the trick
            $scope.contact_modal.PermitPersonId = person.Id;
            $scope.contact_modal.Person = person;
            //console.dir(person);
            //console.dir($scope.contact_modal);
        }

  
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
                //$(function () { $("#persons-select").select2(); });
            });
        }

        
    }
];
