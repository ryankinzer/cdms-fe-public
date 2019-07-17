﻿var permit_dashboard = ['$scope', 'PermitService', 
    function ($scope, PermitService) {

        $scope.PermitStats = PermitService.getPermitStatistics();
        $scope.OutstandingRequests = PermitService.getOutstandingRequests();
        $scope.ExpiringPermits = PermitService.getExpiringPermits();
        $scope.PublicHearingPermits = PermitService.getPublicHearingPermits();

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

        $scope.PublicHearingPermits.$promise.then(function () { 
            $scope.publichearingGridDiv = document.querySelector('#publichearing-permits-grid');
            new agGrid.Grid($scope.publichearingGridDiv, $scope.publichearingGrid);
            $scope.publichearingGrid.api.setRowData($scope.PublicHearingPermits);
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
            },
            onRowDoubleClicked: function (params) { 
                window.open("index.html#!/permits/list?Id=" + params.data.Id, "_blank");
            },
        };

        $scope.requestsGrid.columnDefs = [
            //{ headerName: "Reviewer", field: "ReviewedBy", width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Permit #", field: "PermitNumber", width: 120, menuTabs: ['filterMenuTab'], filter: 'text' },
            //{ headerName: "Project Name", field: "ProjectName", width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
            //{ headerName: "Event Type", field: "EventType", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Type", field: "ItemType", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Date Sent", field: "RequestDate", width: 150, menuTabs: ['filterMenuTab'], 
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.RequestDate);
                },
                filter: 'agDateColumnFilter', sort: 'asc' 
            },
            //{ headerName: "Update", width: 150, menuTabs: ['filterMenuTab'], filter: false }
        ];


        $scope.publichearingGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onRowDoubleClicked: function (params) { 
                window.open("index.html#!/permits/list?Id=" + params.data.Id, "_blank");
            },
        };

        $scope.publichearingGrid.columnDefs = [
            { headerName: "Permit #", field: "PermitNumber", width: 120, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Project Name", field: "ProjectName", width: 235, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Hearing Date", field: "RequestDate", width: 140, menuTabs: ['filterMenuTab'], 
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.RequestDate);
                },
                filter: 'agDateColumnFilter', sort: 'asc' 
            },
        ];


        $scope.expiringGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null,
            onRowDoubleClicked: function (params) { 
                window.open("index.html#!/permits/list?Id=" + params.data.Id, "_blank");
            },
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            }
        };

        $scope.expiringGrid.columnDefs = [
            //{ headerName: "Reviewer", field: "ReviewedBy", width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Permit #", field: "PermitNumber", width: 120, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Project Name", field: "ProjectName", width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: "Last Event", field: "RequestDate", width: 120, menuTabs: ['filterMenuTab'], filter: 'agDateColumnFilter', sort: 'asc',
                valueFormatter: function (params) {
                    console.dir(params.node.data.RequestDate);
                    console.dir(params.node.data.ResponseDate);
                    if(params.node.data.RequestDate > params.node.data.ResponseDate || params.node.data.ResponseDate == null)
                        return valueFormatterDate(params.node.data.RequestDate);
                    else
                        return valueFormatterDate(params.node.data.ResponseDate);
                }
            },
            {
                headerName: "Expire Date", field: "ExpireDate", width: 150, menuTabs: ['filterMenuTab'], filter: 'agDateColumnFilter', 
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.ExpireDate);
                }
            }
            //{ headerName: "Last Response", field: "ResponseDate", width: 150, menuTabs: ['filterMenuTab'], filter: 'agDateColumnFilter',
            //    valueFormatter: function (params) {
            //        return valueFormatterDate(params.node.data.ResponseDate);
            //    }
            //} 
        ];

        
    }
];