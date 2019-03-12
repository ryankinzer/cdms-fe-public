var manage_operators = ['$scope', '$route', '$routeParams', '$modal', '$location', '$window', '$rootScope', 'LeasingService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope,LeasingService) {

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        leasing_module.prepareLeaseModalScope($scope, LeasingService);

        $scope.operators = LeasingService.getOperators();

        $scope.operators.$promise.then(function () {
            $scope.operatorsGridDiv = document.querySelector('#operators-grid');
            new agGrid.Grid($scope.operatorsGridDiv, $scope.operatorsGrid);
        });

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openAddOperator(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };


        var operatorColumnDefs = [
            { colId: 'EditLinks', width: 90, cellRenderer: EditLinksTemplate, menuTabs: []},
            { headerName: "Organization", field: "Organization", width: 180, menuTabs: ['filterMenuTab'] },
            { headerName: "FirstName", field: "FirstName", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "LastName", field: "LastName", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "Prefix", field: "Prefix", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "Suffix", field: "Suffix", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "MailingAddress1", field: "MailingAddress1", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "MailingAddress2", field: "MailingAddress2", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "MailingCity", field: "MailingCity", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "MailingState", field: "MailingState", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "MailingZip", field: "MailingZip", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "PhysicalAddress1", field: "PhysicalAddress1", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "PhysicalAddress2", field: "PhysicalAddress2", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "PhysicalCity", field: "PhysicalCity", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "PhysicalState", field: "PhysicalState", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "PhysicalZip", field: "PhysicalZip", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "IsMailingDifferent", field: "IsMailingDifferent", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "Phone", field: "Phone", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "Cell", field: "Cell", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "Fax", field: "Fax", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "Email", field: "Email", width: 160, menuTabs: ['filterMenuTab'] },
            {
                headerName: "LastUpdated", field: "LastUpdated", width: 160,
                valueGetter: function (params) { return moment(params.node.data.LastUpdated) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LastUpdated);
                }, menuTabs: ['filterMenuTab']
            },
            { headerName: "UpdatedBy", field: "UpdatedBy", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "Inactive", field: "Inactive", width: 160, menuTabs: ['filterMenuTab'] },

        ];

        $scope.deleteOperator = function () { 

            if (confirm("Are you sure you want to delete this operator?")) {
                var deleting = LeasingService.deleteOperator($scope.operatorsGrid.selectedItems[0]);
                
                deleting.$promise.then(function () {
                    $scope.saveOperatorCallback(); //refresh the operators...
                });
            }
        };

        $scope.openAddOperator = function (params) {

            delete $scope.operator_modal;

            if (params) {
                $scope.operator_modal = params;
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/add-operator-modal.html',
                controller: 'AddOperatorModalController',
                scope: $scope,
            });
        }

        $scope.operatorsGrid = {
            columnDefs: operatorColumnDefs,
            rowData: $scope.operators,
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                $scope.operatorsGrid.selectedItems = $scope.operatorsGrid.api.getSelectedRows();
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            selectedItems: []
        }

        $scope.saveOperatorCallback = function () {
            $scope.operators = LeasingService.getOperators();

            $scope.operators.$promise.then(function () {
                if ($scope.operatorsGrid.api)
                    $scope.operatorsGrid.api.setRowData($scope.operators);
            });
            
        }

        $scope.currentUser = $rootScope.Profile.Fullname;
        $scope.currentDay = moment().format();
}];