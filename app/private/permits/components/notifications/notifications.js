var permit_notifications = ['$scope', 'PermitService',
    function ($scope, PermitService) {

        $scope.PermitNotifications = PermitService.getNotifications();
        $scope.PermitRoutes = PermitService.getPermitRoutes();

        $scope.PermitRoutes.$promise.then(function () {
            $scope.routesGridDiv = document.querySelector('#routes-grid');
            new agGrid.Grid($scope.routesGridDiv, $scope.routesGrid);
            $scope.routesGrid.api.setRowData($scope.PermitRoutes);
        });

        $scope.routesGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        };

        $scope.routesGrid.columnDefs = [
            { headerName: "Event Type", field: "EventType", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Item Type", field: "ItemType", width: 120, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Rank", field: "Rank", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Email", field: "Email", width: 250, menuTabs: ['filterMenuTab'], filter: true }
        ];

        $scope.addRow = function () { 
            $scope.routesGrid.api.updateRowData({add: [{ItemType:"",Rank:null,Email:""}]});
        };

    }
];