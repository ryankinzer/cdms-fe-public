var permit_contacts = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope,PermitService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.contacts = PermitService.getAllPersons();

        $scope.contacts.$promise.then(function () {
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


        var contactColumnDefs = [
            { colId: 'EditLinks', width: 90, cellRenderer: EditLinksTemplate, menuTabs: []},
            { headerName: "Organization", field: "Organization", width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "FirstName", field: "FirstName", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "LastName", field: "LastName", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Prefix", field: "Prefix", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Suffix", field: "Suffix", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "MailingAddress1", field: "MailingAddress1", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "MailingAddress2", field: "MailingAddress2", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "MailingCity", field: "MailingCity", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "MailingState", field: "MailingState", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "MailingZip", field: "MailingZip", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "PhysicalAddress1", field: "PhysicalAddress1", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "PhysicalAddress2", field: "PhysicalAddress2", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "PhysicalCity", field: "PhysicalCity", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "PhysicalState", field: "PhysicalState", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "PhysicalZip", field: "PhysicalZip", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "IsMailingDifferent", field: "IsMailingDifferent", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Phone", field: "Phone", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Cell", field: "Cell", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Fax", field: "Fax", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Email", field: "Email", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            {
                headerName: "LastUpdated", field: "LastUpdated", width: 160,
                valueGetter: function (params) { return moment(params.node.data.LastUpdated) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LastUpdated);
                }, menuTabs: ['filterMenuTab'], filter: 'date'
            },
            { headerName: "UpdatedBy", field: "UpdatedBy", width: 160, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Inactive", field: "Inactive", width: 160, menuTabs: ['filterMenuTab'], filter: true },

        ];

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
            columnDefs: contactColumnDefs,
            rowData: $scope.contacts,
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