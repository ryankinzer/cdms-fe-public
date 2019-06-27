var permit_dashboard = ['$scope', 'PermitService', 
    function ($scope, PermitService) {

        $scope.PermitStats = PermitService.getPermitStatistics();
        $scope.OutstandingRequests = PermitService.getOutstandingRequests();
        $scope.ExpiringPermits = PermitService.getExpiringPermits();
        $scope.DisplayStats = [];

        $scope.OutstandingRequests.$promise.then(function () { 
            $scope.requestsGridDiv = document.querySelector('#outstanding-requests-grid');
            new agGrid.Grid($scope.requestsGridDiv, $scope.requestsGrid);
            $scope.requestsGrid.api.setRowData($scope.OutstandingRequests);
        });

        $scope.ExpiringPermits.$promise.then(function () { 
            $scope.expiringGridDiv = document.querySelector('#expiring-permits-grid');
            new agGrid.Grid($scope.expiringGridDiv, $scope.expiringGrid);
            $scope.expiringGrid.api.setRowData($scope.ExpiringPermits);
        });

        $scope.PermitStats.$promise.then(function () { 
            $scope.PermitStats.forEach(function (stat) { 
                if(stat.PermitStatus == 'Conditionally Approved' || stat.PermitStatus == 'Approved')
                    $scope.DisplayStats['Approved'] = ($scope.DisplayStats['Approved']) ? $scope.DisplayStats['Approved']+ stat.TotalCount : stat.TotalCount;
                else
                    $scope.DisplayStats[stat.PermitStatus] = stat.TotalCount;

            });
        });

        $scope.requestsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            }
        };

        $scope.requestsGrid.columnDefs = [
            { headerName: "Permit #", field: "PermitNumber", width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Project Name", field: "ProjectName", width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Event Type", field: "EventType", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Item Type", field: "ItemType", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Date Sent", field: "RequestDate", width: 150, menuTabs: ['filterMenuTab'], 
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.RequestDate);
                },
                filter: 'agDateColumnFilter', sort: 'asc' 
            },
            //{ headerName: "Update", width: 150, menuTabs: ['filterMenuTab'], filter: false }
        ];


        $scope.expiringGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            }
        };

        $scope.expiringGrid.columnDefs = [
            { headerName: "Permit #", field: "PermitNumber", width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Project Name", field: "ProjectName", width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
            {
                headerName: "Expire Date", field: "ExpireDate", width: 150, menuTabs: ['filterMenuTab'], filter: 'agDateColumnFilter', sort: 'asc',
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.ExpireDate);
                }
            },
            { headerName: "Last Request", field: "RequestDate", width: 150, menuTabs: ['filterMenuTab'], filter: 'agDateColumnFilter', 
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.RequestDate);
                }
            },
            { headerName: "Last Response", field: "ResponseDate", width: 150, menuTabs: ['filterMenuTab'], filter: 'agDateColumnFilter',
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.ResponseDate);
                }
            } 
        ];

        
    }
];