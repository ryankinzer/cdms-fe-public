var list_permits = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "Issued";
        $scope.row = null;

        $scope.dataset = DatasetService.getDataset(PERMIT_DATASETID);

        $scope.dataset.$promise.then(function () { 
        
            $scope.AllColumnDefs = GridService.getAgColumnDefs($scope.dataset);
            $scope.permitsGrid.columnDefs = $scope.AllColumnDefs.HeaderFields;
            
            console.dir($scope.AllColumnDefs);

            //activate the grid with the permits data
            $scope.permitsGridDiv = document.querySelector('#active-permits-grid');
            new agGrid.Grid($scope.permitsGridDiv, $scope.permitsGrid);

            $scope.permits = PermitService.getAllPermits();

            $scope.permits.$promise.then(function () {
            
                $scope.permitsGrid.api.setRowData($scope.permits);

            });
        });

        $scope.permitsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                $scope.permitsGrid.selectedItem = $scope.row = $scope.permitsGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                console.dir($scope.row);
                $scope.selectPermit($scope.row.Id);
            },
            selectedItem: null ,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }

        $scope.permitContactsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            components: {
                booleanEditor: BooleanEditor,
                booleanCellRenderer: BooleanCellRenderer,
            },
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }

        $scope.permitContactsGrid.columnDefs = [
            {
                headerName: "Primary", field: "IsPrimary", width: 100,
                cellEditor: 'booleanEditor',
                cellRenderer: 'booleanCellRenderer',
            },
            {
                headerName: "Contact", width: 200,
                cellRenderer: function (params) {
                    if(params.node.data.PermitPerson.Organization) 
                        return params.node.data.PermitPerson.Organization

                    return (params.node.data.PermitPerson.FullName) ? params.node.data.PermitPerson.FullName : params.node.data.PermitPerson.FirstName + " " + params.node.data.PermitPerson.LastName;
                },
                filter: 'text',
                menuTabs: ['filterMenuTab'],
            },
            { headerName: "Type", field: "ContactType", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            {
                headerName: "Info", width: 120,
                cellRenderer: function (params) {
                    if (params.node.data.PermitPerson.CellPhone)
                        return params.node.data.PermitPerson.CellPhone;

                    if (params.node.data.PermitPerson.WorkPhone)
                        return params.node.data.PermitPerson.WorkPhone;

                    if (params.node.data.PermitPerson.HomePhone)
                        return params.node.data.PermitPerson.HomePhone;

                    return (params.node.data.PermitPerson.Email) ? params.node.data.PermitPerson.Email : "None provided";

                },
                filter: 'text',
                menuTabs: ['filterMenuTab'],
            },

        ];
    

        $scope.selectPermit = function (Id) { 

            $scope.PermitContacts = PermitService.getPermitContacts(Id);

            $scope.PermitContacts.$promise.then(function () { 
                //activate the permit contacts grid
                if (!$scope.permitContactsGridDiv) {
                    $scope.permitContactsGridDiv = document.querySelector('#permit-contacts-grid');
                    new agGrid.Grid($scope.permitContactsGridDiv, $scope.permitContactsGrid);
                }
                $scope.permitContactsGrid.api.setRowData($scope.PermitContacts);
            });
        };



}];