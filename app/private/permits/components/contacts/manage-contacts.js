var permit_contacts = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService','GridService','DatasetService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope,PermitService, GridService,DatasetService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.contactsdataset = DatasetService.getDataset(PERMITCONTACTS_DATASETID);

        $scope.contactsdataset.$promise.then(function () {
            $scope.contacts = PermitService.getAllPersons();

            $scope.contacts.$promise.then(function () {
                $scope.contactsGrid.api.setRowData($scope.contacts);
            });
    
            $scope.ContactsDatasetColumnDefs = GridService.getAgColumnDefs($scope.contactsdataset);

            $scope.contactsGrid.columnDefs = angular.copy($scope.ContactsDatasetColumnDefs.HeaderFields);
            $scope.contactsGrid.columnDefs.unshift({ colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 60, menuTabs: [] });
                
            $scope.contactsGridDiv = document.querySelector('#contacts-grid');
            new agGrid.Grid($scope.contactsGridDiv, $scope.contactsGrid);

        });

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openAddContact(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };


        $scope.deleteContact = function () { 

            if (confirm("Are you sure you want to delete this contact?")) {
                var deleting = PermitService.deletePermitPerson($scope.contactsGrid.selectedItems[0].Id);
                
                deleting.$promise.then(function () {
                    $scope.saveContactCallback(); //refresh the contacts...
                });
            }
        };

        $scope.openAddContact = function (params) {

            delete $scope.person_modal;

            if (params) {
                $scope.person_modal = params;
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/contacts/templates/add-person-modal.html',
                controller: 'AddPermitPersonModalController',
                scope: $scope,
            }).result.then(function(saved){
                $scope.saveContactCallback();
            });
        }

        $scope.contactsGrid = {
            columnDefs: [],
            rowData: null,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                $scope.contactsGrid.selectedItems = $scope.contactsGrid.api.getSelectedRows();
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            selectedItems: [],
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }

        $scope.saveContactCallback = function () {
            $scope.contacts = PermitService.getAllPersons();

            $scope.contacts.$promise.then(function () {
                if ($scope.contactsGrid.api)
                    $scope.contactsGrid.api.setRowData($scope.contacts);
            });
            
        }

        $scope.currentUser = $rootScope.Profile.Fullname;
        $scope.currentDay = moment().format();
}];