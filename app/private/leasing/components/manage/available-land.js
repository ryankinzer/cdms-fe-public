var available_land = ['$scope', '$route', '$filter', '$uibModal', '$location', '$window', '$rootScope', 'LeasingService',
    function ($scope, $route, $filter, $modal, $location, $window, $rootScope, LeasingService) {

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "Available";

        $scope.fields = LeasingService.getAvailableFields();

        leasing_module.prepareLeaseModalScope($scope, LeasingService);

        $scope.fields.$promise.then(function () {
            $scope.leaseGridDiv = document.querySelector('#available-land-grid');
            new agGrid.Grid($scope.leaseGridDiv, $scope.leaseGrid);
        });

        $scope.countLandUse = function (landuse) {
            return $filter('filter')($scope.fields, { FieldLandUse: landuse }).length;
        };

        $scope.showAll = "No";
        $scope.toggleShowAll = function () {
            $scope.showAll = ($scope.showAll == 'Yes') ? 'No' : 'Yes';
            if ($scope.showAll == 'Yes') {
                $scope.fields = LeasingService.getAvailableAllotments();
                $scope.fields.$promise.then(function () {
                    $scope.leaseGrid.api.setRowData($scope.fields);
                });
            } else {
                $scope.fields = LeasingService.getAvailableFields();
                $scope.fields.$promise.then(function () {
                    $scope.leaseGrid.api.setRowData($scope.fields);
                });
            }
        }

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Map';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.viewOnMap(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };

        var leaseColumnDefs = [
            { colId: 'EditLinks', width: 60, cellRenderer: EditLinksTemplate, menuTabs: [] },
            { headerName: "Allotment", field: "AllotmentName", width: 100, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "Field Land Use", field: "FieldLandUse", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Field #", field: "FieldId", width: 100, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Field Acres", field: "FieldAcres", width: 140, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Expires", field: "Expiration", width: 140, menuTabs: ['filterMenuTab'], filter: true },
            {
                headerName: "Date Available", field: "DateAvailable", width: 160,
                valueGetter: function (params) { return moment(params.node.data.DateAvailable) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.DateAvailable);
                },
                menuTabs: ['filterMenuTab'], filter: "agDateColumnFilter"
            },
            //{ headerName: "AY Income", field: "AvgAnnualIncome", width: 140, menuTabs: ['filterMenuTab'], filter: "number" },
            //{ headerName: "AYI Per Acre", field: "AvgAnnualIncomePerAcre", width: 140, menuTabs: ['filterMenuTab'], filter: "number" },
            //{ headerName: "Yield Per Unit", field: "NumUnit", width: 140, menuTabs: ['filterMenuTab'], filter: "number" },   
            { headerName: "FSA Tract #", field: "FSATractNumber", width: 140, menuTabs: ['filterMenuTab'], filter: "text" },
            //{ headerName: "HEL", field: "HEL", width: 100 },
            { headerName: "TAAMS Number", field: "TAAMSNumber", width: 140, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "Last Operator", field: "Operator", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },

        ];


        $scope.leaseGrid = {
            columnDefs: leaseColumnDefs,
            rowData: $scope.fields,
            rowSelection: 'multiple',
            selectedItems: [],
            onSelectionChanged: function () {
                $scope.leaseGrid.selectedItems = $scope.leaseGrid.api.getSelectedRows();
                $scope.$apply(); //we're changing something that angular isn't aware of
            },
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }

        $scope.openNewLeaseModal = function (params) {

            var selected_land = $scope.leaseGrid.selectedItems[0];

            $scope.lease = {
                FSATractNumber: selected_land.FSATractNumber,
                TAAMSNumber: selected_land.TAAMSNumber,
                AllotmentName: selected_land.AllotmentName,
                LeaseType: selected_land.FieldLandUse,
                LeaseAcres: selected_land.FieldAcres,
                ProductiveAcres: selected_land.FieldAcres,
                LeaseStart: selected_land.DateAvailable,
                Level: 1, //Level 1
                Status: LEASE_STATUS_PENDING, //Pending
                FieldsToLink: [], //comma separated list of fields we will join this lease to
                LeaseFields: [],
                StatusDate: $scope.currentDay,
                StatusBy: $scope.currentUser,
            };

            $scope.leaseGrid.selectedItems.forEach(function (item) {
                if (item.FieldId) {
                    $scope.lease.FieldsToLink.push(item.FieldId);
                    $scope.lease.LeaseFields.push(item);
                }
            });


            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/lease-modal.html',
                controller: 'LeaseModalController',
                scope: $scope, //very important to pass the scope along...
            });
        }

        $scope.saveLeaseCallback = function (saved_lease) {
            $scope.fields = LeasingService.getAvailableFields();
            $scope.fields.$promise.then(function () {
                if ($scope.leaseGrid.api)
                    $scope.leaseGrid.api.setRowData($scope.fields);
            });
        }


        $scope.currentUser = $rootScope.Profile.Fullname;
        $scope.currentDay = moment().format();

        $scope.viewOnMap = function (params) {
            window.location = "index.html#!leasing?allotment=" + params.AllotmentName;
        }

        /* pattern = 
            1056889599

            1-Farming (other numbers for other types of leases 4, 7)
            0-Place holder (they are about to reach the threshold of 10,000 leases) with soon be 1
            5688-Old lease number (TL-5688) currently at 9600 something I think
            95-last two digits of the lease start year
            99-Last two digits of the lease end year
        */
        $scope.generateLeaseNumber = function (lease) {

            if (lease.lastleasenumber)
                return $scope.constructLeaseNumber(lease);

            var systemvals = LeasingService.getLeasingSystemValues();

            systemvals.$promise.then(function () {
                systemvals.forEach(function (val) {
                    if (val.Id == METADATA_PROPERTY_LEASING_SYSTEM_LASTLEASENUMBER) {
                        lease.lastleasenumberproperty = val;
                        lease.lastleasenumberproperty.PossibleValues = parseInt(val.PossibleValues);
                        $scope.constructLeaseNumber(lease);
                    }
                });
            });

        };

        //needs the lease.lastleasenumber already set
        $scope.constructLeaseNumber = function (lease) { 

            var nextlease = lease.lastleasenumberproperty.PossibleValues+1;

            if (leasing_module.LeaseTypeLeaseNumber.hasOwnProperty(lease.LeaseType))
                lease.LeaseNumber = leasing_module.LeaseTypeLeaseNumber[lease.LeaseType] + "0" + nextlease;
            else
                lease.LeaseNumber = "0" + nextlease;

            var begin = moment(lease.LeaseStart);
            if (begin.isValid() && lease.LeaseStart)
                lease.LeaseNumber += begin.format("YY");

            var end = moment(lease.LeaseEnd);
            if (end.isValid() && lease.LeaseEnd)
                lease.LeaseNumber += end.format("YY");

        }


}];