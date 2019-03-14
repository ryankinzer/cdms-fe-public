var pending_leases = ['$scope', '$route', '$filter', '$uibModal', '$location', '$window', '$rootScope', 'LeasingService',
    function ($scope, $route, $filter, $modal, $location, $window, $rootScope, LeasingService) {
        console.log("Inside pending leasing controller...");

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("LEASING"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "Pending";
        $scope.canViewCropFields = $rootScope.Profile.hasRole("LeaseCropAdmin");

        $scope.leases = LeasingService.getPendingLeases();

        leasing_module.prepareLeaseModalScope($scope, LeasingService);

        $scope.leases.$promise.then(function () {
            $scope.leaseGridDiv = document.querySelector('#pending-leases-grid');
            new agGrid.Grid($scope.leaseGridDiv, $scope.leaseGrid);

            $scope.countLevel = function (level) {
                return $filter('filter')($scope.leases, { Level: level }).length;
            };
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

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openEditLeaseModal(param.data);
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
            { colId: 'EditLinks', width: 130, cellRenderer: EditLinksTemplate, menuTabs: []},
            { headerName: "Allotment", field: "AllotmentName", width: 180, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "TAAMS Number", field: "TAAMSNumber", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "Lease Number", field: "LeaseNumber", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "Level", field: "Level", width: 160, menuTabs: ['filterMenuTab'] },
            {
                headerName: "Days at Level", width: 160,
                valueGetter: function (params) {
                    //return moment(params.node.data.StatusDate).diff(moment(new Date()), 'd');
                    return moment(new Date).diff(moment(params.node.data.StatusDate), 'd');
                }, menuTabs: ['filterMenuTab'], filter: "number"
            },
            {
                headerName: "Transaction Date",
                field: "TransactionDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.DueDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.TransactionDate);
                },menuTabs: ['filterMenuTab'], filter: "date"

            },
            {
                headerName: "Operator", width: 160, valueGetter: function (params) {
                    return (params.node.data.LeaseOperator.Organization) ? params.node.data.LeaseOperator.Organization : params.node.data.LeaseOperator.FirstName + " " + params.node.data.LeaseOperator.LastName;
                }, menuTabs: ['filterMenuTab']
            },
            //{ headerName: "Farm Number", field: "FarmNumber", width: 160 },
            
            //{ headerName: "Status", field: "Status", width: 160 },
            
            { headerName: "FSA Tract", field: "FSATractNumber", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            //{ headerName: "HEL", field: "HEL", width: 160 },
            { headerName: "Lease Type", field: "LeaseType", width: 160, menuTabs: ['filterMenuTab'] },
            { headerName: "Lease Acres", field: "LeaseAcres", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            //{ headerName: "Lease Duration", field: "LeaseDuration", width: 160 },
            { headerName: "Productive Acres", field: "ProductiveAcres", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            {
                headerName: "Negotiate Date",
                field: "NegotiateDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.NegotiateDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.NegotiateDate);
                }, menuTabs: ['filterMenuTab'], filter: "date"
            },
            {
                headerName: "Lease Start",
                field: "LeaseStart", width: 160,
                valueGetter: function (params) { return moment(params.node.data.LeaseStart) }, 
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LeaseStart);
                }, menuTabs: ['filterMenuTab'], filter: "date"
            },
            {
                headerName: "Lease End",
                field: "LeaseEnd", width: 160,
                valueGetter: function (params) { return moment(params.node.data.LeaseEnd) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LeaseEnd);
                },menuTabs: ['filterMenuTab'], filter: "date"

            },
            {
                headerName: "Under Internal Review?", field: "UnderInternalReview", width: 160,
                valueGetter: function (params) {
                    return valueFormatterBoolean(params.node.data.UnderInternalReview);
                },menuTabs: ['filterMenuTab']
            },
            {
                headerName: "Days Under Review", width: 160, 
                valueGetter: function (params) {

                    if (!params.node.data.UnderInternalReview)
                        return "N/A";

                    return moment(new Date).diff(moment(params.node.data.InternalReviewStartDate), 'd');
                },menuTabs: ['filterMenuTab'], filter: "number"
            },
            {
                headerName: "Due Date",
                field: "DueDate", width: 160, menuTabs: ['filterMenuTab'], filter: "text"
            },
            {
                headerName: "Approved Date",
                field: "ApprovedDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.ApprovedDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.ApprovedDate);
                },menuTabs: ['filterMenuTab'], filter: "date"

            }, {
                headerName: "Withdrawl Date",
                field: "WithdrawlDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.WithdrawlDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.WithdrawlDate);
                },menuTabs: ['filterMenuTab'], filter: "date"

            },
            {
                headerName: "Graze Start",
                field: "GrazeStart", width: 160,
                valueGetter: function (params) { return moment(params.node.data.GrazeStart) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.GrazeStart);
                },menuTabs: ['filterMenuTab'], filter: "date"

            },
            {
                headerName: "Graze End",
                field: "GrazeEnd", width: 160,
                valueGetter: function (params) { return moment(params.node.data.GrazeEnd) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.GrazeEnd);
                },menuTabs: ['filterMenuTab'], filter: "date"

            },
            { headerName: "Note", field: "Notes", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "Residue Required Pct", field: "ResidueRequiredPct", width: 160, menuTabs: ['filterMenuTab'], filter: "number", hide: !$scope.canViewCropFields },
            { headerName: "Green CoverRequired Pct", field: "GreenCoverRequiredPct", width: 160, menuTabs: ['filterMenuTab'], filter: "number", hide: !$scope.canViewCropFields },
            { headerName: "Clod Required Pct", field: "ClodRequiredPct", width: 160, menuTabs: ['filterMenuTab'], filter: "number", hide: !$scope.canViewCropFields },
            {
                headerName: "Optional Alt Crop", field: "OptionalAlternativeCrop", width: 160, hide: !$scope.canViewCropFields,
                valueGetter: function (params) {
                    return valueFormatterBoolean(params.node.data.OptionalAlternativeCrop);
                }, menuTabs: ['filterMenuTab'], 
            },
            { headerName: "AUMs", field: "AUMs", width: 160, menuTabs: ['filterMenuTab'], hide: !$scope.canViewCropFields  },

            { headerName: "Dollar Per Annum", field: "DollarPerAnnum", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Dollar Advance", field: "DollarAdvance", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Dollar Bond", field: "DollarBond", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Lease Fee", field: "LeaseFee", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Graze Animal", field: "GrazeAnimal", width: 160, menuTabs: ['filterMenuTab'],
                valueFormatter: function (params) {
                    return valueFormatterArrayToList(params.node.data.GrazeAnimal);
                }
            },
            

            { headerName: "Status By", field: "StatusBy", width: 160, menuTabs: ['filterMenuTab'] },
            {
                headerName: "Status Date",
                field: "StatusDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.StatusDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.StatusDate);
                }, menuTabs: ['filterMenuTab'], filter: "date"
            },
            
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
            window.location="index.html#view-lease/"+params.Id;
        };

        $scope.openEditLeaseModal = function (params) {

            $scope.lease = params;

            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/lease-modal.html',
                controller: 'LeaseModalController',
                scope: $scope,
            });
        }

        //after we save, this callback will run to reload our grid and upate our levels.
        $scope.saveLeaseCallback = function (saved_lease) {
            $scope.leases = LeasingService.getPendingLeases();

            $scope.leases.$promise.then(function () {
                if ($scope.leaseGrid.api)
                    $scope.leaseGrid.api.setRowData($scope.leases);

                $scope.countLevel = function (level) {
                    return $filter('filter')($scope.leases, { Level: level }).length;
                };
            });
        }

        $scope.currentUser = $rootScope.Profile.Fullname;
        $scope.currentDay = moment().format();

        $scope.viewOnMap = function (params) {
            window.location = "index.html#leasing?allotment=" + params.AllotmentName;
        }

}];