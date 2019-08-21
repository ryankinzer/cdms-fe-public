var manage_operators = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'LeasingService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope,LeasingService) {

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        leasing_module.prepareLeaseModalScope($scope, LeasingService);

        $scope.operators = LeasingService.getOperators();

        $scope.operators.$promise.then(function () {
            $scope.operatorsGridDiv = document.querySelector('#operators-grid');
            new agGrid.Grid($scope.operatorsGridDiv, $scope.operatorsGrid);

            if ($rootScope.Profile.hasRole("LeasingEditor")) {
                $scope.operatorsGrid.columnApi.setColumnVisible("EditLinks", true);
                $scope.operatorsGrid.api.refreshHeader();
            }
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
                backdrop: "static",
                keyboard: false
            });
        }

        $scope.operatorsGrid = {
            columnDefs: operatorColumnDefs,
            rowData: $scope.operators,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                $scope.operatorsGrid.selectedItems = $scope.operatorsGrid.api.getSelectedRows();
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            selectedItems: [],
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
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