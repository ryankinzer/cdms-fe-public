var active_leases = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'LeasingService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope,LeasingService) {

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "Active";

        LeasingService.expireLeases();

        $scope.canViewCropFields = $rootScope.Profile.hasRole("LeaseCropAdmin");

        $scope.showAll = false;
        $scope.toggleShowAll = function () { 
            $scope.showAll = !$scope.showAll;
            if ($scope.showAll) {
                $scope.leases = LeasingService.getAllLeases();
                $scope.leases.$promise.then(function () {
                    $scope.leaseGrid.api.setRowData($scope.leases);
                    $scope.leaseGrid.columnApi.setColumnVisible("Status", true);
                });
            } else { 
                $scope.leases = LeasingService.getActiveLeases();
                $scope.leases.$promise.then(function () { 
                    $scope.leaseGrid.api.setRowData($scope.leases);
                });
            }
        }

        $scope.leases = LeasingService.getActiveLeases();

        $scope.leases.$promise.then(function () {
            $scope.leaseGridDiv = document.querySelector('#active-leases-grid');
            new agGrid.Grid($scope.leaseGridDiv, $scope.leaseGrid);
        });

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'View';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.viewLease(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode(" | "));

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Map';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.viewOnMap(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };


        var leaseColumnDefs = [
            { colId: 'EditLinks', width: 90, cellRenderer: EditLinksTemplate, menuTabs: []},
            { headerName: "Status", field: "Status", width: 160, hide: true, 
                valueFormatter: function (params) {
                    if(params.node)
                        return leasing_module.LeaseStatus[params.node.data.Status];
                    else
                        return leasing_module.LeaseStatus[params.value];
                } 
            },
            { headerName: "Allotment", field: "AllotmentName", width: 180, menuTabs: ['filterMenuTab'], filter:"text" },
            { headerName: "TAAMSNumber", field: "TAAMSNumber", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "Lease Number", field: "LeaseNumber", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            {
                headerName: "Operator", width: 160,
                valueGetter: function (params) {
                    return (params.node.data.LeaseOperator.Organization) ? params.node.data.LeaseOperator.Organization : params.node.data.LeaseOperator.FirstName + " " + params.node.data.LeaseOperator.LastName;
                },
                menuTabs: ['filterMenuTab'],
                filter: true
            },
            //{ headerName: "Farm Number", field: "FarmNumber", width: 160 },
            //{ headerName: "Level", field: "Level", width: 160 },
            
            { headerName: "Status By", field: "StatusBy", width: 160, menuTabs: ['filterMenuTab'], filter:'text' },
{
                headerName: "Transaction Date",
                field: "TransactionDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.TransactionDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.TransactionDate);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"
            },
            {
                headerName: "Status Date",
                field: "StatusDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.StatusDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.StatusDate);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"
            },
            { headerName: "FSA Tract", field: "FSATractNumber", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            //{ headerName: "HEL", field: "HEL", width: 160 },
            { headerName: "Lease Type", field: "LeaseType", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Lease Acres", field: "LeaseAcres", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            //{ headerName: "Lease Duration", field: "LeaseDuration", width: 160 },
            { headerName: "Productive Acres", field: "ProductiveAcres", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            {
                headerName: "Negotiate Date",
                field: "NegotiateDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.NegotiateDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.NegotiateDate);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"
            },
            {
                headerName: "Lease Start",
                field: "LeaseStart", width: 160,
                valueGetter: function (params) { return moment(params.node.data.LeaseStart) }, 
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LeaseStart);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"
            },
            {
                headerName: "Lease End",
                field: "LeaseEnd", width: 160,
                valueGetter: function (params) { return moment(params.node.data.LeaseEnd) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LeaseEnd);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"
            },
            {
                headerName: "Due Date",
                field: "DueDate", width: 160,
                menuTabs: ['filterMenuTab'],
                filter: "text"
            },
            {
                headerName: "Approved Date",
                field: "ApprovedDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.ApprovedDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.ApprovedDate);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"
            }, {
                headerName: "Withdrawl Date",
                field: "WithdrawlDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.WithdrawlDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.WithdrawlDate);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"
            },
            {
                headerName: "Graze Start",
                field: "GrazeStart", width: 160,
                valueGetter: function (params) { return moment(params.node.data.GrazeStart) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.GrazeStart);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"
            },
            {
                headerName: "Graze End",
                field: "GrazeEnd", width: 160,
                valueGetter: function (params) { return moment(params.node.data.GrazeEnd) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.GrazeEnd);
                },
                menuTabs: ['filterMenuTab'],
                filter: "agDateColumnFilter"

            },
            { headerName: "Residue Required Pct", field: "ResidueRequiredPct", width: 160, menuTabs: ['filterMenuTab'], filter: "number", hide: !$scope.canViewCropFields },
            { headerName: "Green Cover Required Pct", field: "GreenCoverRequiredPct", width: 160, menuTabs: ['filterMenuTab'], filter: "number", hide: !$scope.canViewCropFields },
            { headerName: "Clod Required Pct", field: "ClodRequiredPct", width: 160, menuTabs: ['filterMenuTab'], filter: "number", hide: !$scope.canViewCropFields },
            {
                headerName: "Optional Alt Crop", hide: !$scope.canViewCropFields,
                field: "OptionalAlternativeCrop", width: 160, 
                valueGetter: function (params) {
                    return valueFormatterBoolean(params.node.data.OptionalAlternativeCrop);
                },
                menuTabs: ['filterMenuTab'], filter: true
            },
            { headerName: "AUMs", field: "AUMs", width: 160, menuTabs: ['filterMenuTab'], hide: !$scope.canViewCropFields, filter: true },
            { headerName: "Dollar Per Annum", field: "DollarPerAnnum", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Dollar Advance", field: "DollarAdvance", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Dollar Bond", field: "DollarBond", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Lease Fee", field: "LeaseFee", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Graze Animal", field: "GrazeAnimal", width: 160, menuTabs: ['filterMenuTab'], filter: true,
                valueFormatter: function (params) {
                    return valueFormatterArrayToList(params.node.data.GrazeAnimal);
                }
            },
            { headerName: "Notes", field: "Notes", width: 160, menuTabs: ['filterMenuTab'], filter:"text" },

        ];


        $scope.leaseGrid = {
            columnDefs: leaseColumnDefs,
            rowData: $scope.leases,
            rowSelection: 'single',
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }


        $scope.viewLease = function (params) {
            window.location="index.html#!view-lease/"+params.Id;
        };

        $scope.viewOnMap = function (params) {
            window.location = "index.html#!leasing?allotment=" + params.AllotmentName;
        }

}];