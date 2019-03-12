var view_lease = ['$scope', '$route', '$routeParams', '$modal', '$location', '$window', '$rootScope', 'LeasingService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, LeasingService) {

        $rootScope.inModule = "leasing"; //signal to show the leasing menu, etc.

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        $scope.canViewCropFields = $rootScope.Profile.hasRole("LeaseCropAdmin");

        $scope.lease = LeasingService.getLease($routeParams.Id);
        $scope.revisions = LeasingService.getLeaseRevisions($routeParams.Id);
        $scope.cropplanrevisions_all = LeasingService.getLeaseCropPlanRevisions($routeParams.Id);
        $scope.cropplanrevisions = [];

        $scope.cropplanrevisions_all.$promise.then(function () {
            $scope.refreshCropRevisionsDropdown();
        });

        leasing_module.prepareLeaseModalScope($scope, LeasingService);

        //tab handling
        $scope.isLeaseSelected = true;

        $scope.clearTabSelection = function () {
            $scope.isLeaseSelected = false;
            $scope.isCropsSelected = false;
            $scope.isInspectionsSelected = false;
            $scope.isIncomeSelected = false;
            $scope.isDocumentsSelected = false;
            $scope.isHistorySelected = false;
            $scope.isComplianceSelected = false;
        };

        $scope.selectLease = function () { $scope.clearTabSelection(); $scope.isLeaseSelected = true; };

        $scope.selectCrops = function () {
            $scope.clearTabSelection();
            $scope.isCropsSelected = true;
            if (!$scope.cropsGridDiv) {
                $scope.cropsGridDiv = document.querySelector('#crops-grid');
                new agGrid.Grid($scope.cropsGridDiv, $scope.cropsGrid);
            }
            $scope.cropsGrid.api.setRowData($scope.lease.LeaseCropPlans);

        };

        $scope.selectCompliance = function () { 
            $scope.clearTabSelection();
            $scope.isComplianceSelected = true;
        };

        $scope.selectInspections = function () {
            $scope.clearTabSelection();
            $scope.isInspectionsSelected = true;
            if (!$scope.inspectionGridDiv) {
                $scope.inspectionGridDiv = document.querySelector('#inspections-grid');
                new agGrid.Grid($scope.inspectionGridDiv, $scope.inspectionsGrid);
            }
            $scope.inspectionsGrid.api.setRowData($scope.lease.LeaseInspections);
        };

        $scope.selectIncome = function () {
            $scope.clearTabSelection(); $scope.isIncomeSelected = true;
            if (!$scope.incomeGridDiv) {
                $scope.incomeGridDiv = document.querySelector('#income-grid');
                new agGrid.Grid($scope.incomeGridDiv, $scope.incomeGrid);
            }
            $scope.incomeGrid.api.setRowData($scope.lease.LeaseProductions);
        };

        //$scope.selectDocuments = function () { $scope.clearTabSelection(); $scope.isDocumentsSelected = true; };

        $scope.selectHistory = function () {
            $scope.clearTabSelection();
            $scope.isHistorySelected = true;
            if (!$scope.historyGridDiv) {
                $scope.historyGridDiv = document.querySelector('#history-grid');
                new agGrid.Grid($scope.historyGridDiv, $scope.historyGrid);
            }
            $scope.historyGrid.api.setRowData($scope.revisions);
            
        };

        var CropEditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Delete';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.viewLease(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };

        var InspectionEditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();

                if(param.data.InspectionType == "Spring")
                    $scope.openSpringInspectionModal(param.data);

                else if (param.data.InspectionType == "Fall")
                    $scope.openFallInspectionModal(param.data);

                else if (param.data.InspectionType == "Grazing")
                    $scope.openGrazingInspectionModal(param.data);

                else
                    alert("Inspection Type is not supported.");

            });
            div.appendChild(editBtn);

            return div;
        };

        var ProductionEditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openProductionModal(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };


        var HistoryViewLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'View';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                alert("open lease doc in new window")
                //$scope.viewLease(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };


        //crops
        var cropsColumnDefs = [
            //{ colId: 'CropEditLinks', width: 80, cellRenderer: CropEditLinksTemplate, menuTabs: [] },
            { headerName: "Year", field: "LeaseYear", width: 120, sort: 'asc' },
            { headerName: "Crop Requirement", field: "CropRequirement", width: 180 },
            {
                headerName: "Alt Crop Option?", field: "OptionAlternateCrop", width: 160,
                valueFormatter: function (params) {
                    return valueFormatterBoolean(params.node.data.OptionAlternateCrop);
                },
                
            }
        ];

        $scope.cropsGrid = {
            columnDefs: cropsColumnDefs,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            components: {
                booleanCellRenderer: BooleanCellRenderer,
            },
            rowSelection: 'single',

        }

        //inspections
        var inspectionsColumnDefs = [
            { colId: 'InspectionEditLinks', width: 80, cellRenderer: InspectionEditLinksTemplate, menuTabs: [] },
            { headerName: "Inspection", field: "InspectionType", width: 160 },

            {
                headerName: "Inspected", field: "InspectionDateTime", width: 140, sort: 'asc',
                valueGetter: function (params) { return moment(params.node.data.InspectionDateTime) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.InspectionDateTime);
                },
            },
            { headerName: "Lease Year", field: "LeaseYear", width: 140 },
            {
                headerName: "Failed?", field: "OutOfCompliance", width: 160,
                valueFormatter: function (params) {
                    return valueFormatterBoolean(params.node.data.OutOfCompliance);
                },
            },
            { headerName: "Crop Present", field: "CropPresent", width: 180 },
            { headerName: "Weeds1", field: "Weeds1", width: 160 },
            { headerName: "Weeds2", field: "Weeds2", width: 160 },
            { headerName: "Weeds3", field: "Weeds3", width: 160 },
            { headerName: "Crop Residue", field: "CropResiduePct", width: 160 },
            { headerName: "Green Cover", field: "GreenCoverPct", width: 160 },
            { headerName: "Clod Percent", field: "ClodPct", width: 160 },
            { headerName: "Residue Type", field: "ResidueType", width: 160 },
            { headerName: "Sub Practices", field: "SubstitutePractices", width: 160 },
            {
                headerName: "Animals", field: "Animals", width: 160,
                valueFormatter: function (params) {
                    return valueFormatterArrayToList(params.node.data.Animals);
                }
            },
            {
                headerName: "Field Records Recvd", field: "FieldRecordsReceived", width: 160,
                valueFormatter: function (params) {
                    return valueFormatterBoolean(params.node.data.FieldRecordsReceived);
                },
            },
            { headerName: "Improvement Tresspass", field: "ImprovementTresspass", width: 200 },
            { headerName: "Notes", field: "Notes", width: 200 },
            { headerName: "Inspector", field: "InspectedBy", width: 180 },
        ]; 

        

        $scope.inspectionsGrid = {
            columnDefs: inspectionsColumnDefs,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            rowSelection: 'single'
        }

        //history ---
        var historyColumnDefs = [
            
            {
                headerName: "Date Changed", field: "ChangedDate", width: 140,
                valueGetter: function (params) { return moment(params.node.data.ChangedDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.ChangedDate, "L HH:mm");
                },
            },
            { headerName: "Changed By", field: "ChangedBy", width: 180 },
            { headerName: "Reason for Modification", field: "ChangedReason", width: 450 },
            { headerName: "Allotment Name", field: "AllotmentName", width: 180 },
            { headerName: "Lease Number", field: "LeaseNumber", width: 160 },
            { headerName: "TAAMSNumber", field: "TAAMSNumber", width: 160 },

            {
                headerName: "Operator", width: 160,
                cellRenderer: function (params) {
                    return (params.node.data.LeaseOperator.Organization) ? params.node.data.LeaseOperator.Organization : params.node.data.LeaseOperator.FirstName + " " + params.node.data.LeaseOperator.LastName;
                }
            },
            //{ headerName: "Farm Number", field: "FarmNumber", width: 160 },
            { headerName: "Level", field: "Level", width: 160 },
            {
                headerName: "Status", field: "Status", width: 160,
                valueFormatter: function (params) {
                    return leasing_module.LeaseStatus[params.node.data.Status];
                }
            },
            { headerName: "Status By", field: "StatusBy", width: 160 },
            {
                headerName: "Status Date",
                field: "StatusDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.StatusDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.StatusDate, 'L HH:mm');
                },
            },
            { headerName: "FSA Tract", field: "FSATractNumber", width: 160 },
            //{ headerName: "HEL", field: "HEL", width: 160 },
            { headerName: "Lease Type", field: "LeaseType", width: 160 },
            { headerName: "Lease Acres", field: "LeaseAcres", width: 160 },
            //{ headerName: "Lease Duration", field: "LeaseDuration", width: 160 },
            { headerName: "Productive Acres", field: "ProductiveAcres", width: 160 },
            {
                headerName: "Transaction Date",
                field: "TransactionDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.TransactionDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.TransactionDate);
                },

            },

            {
                headerName: "Negotiate Date",
                field: "NegotiateDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.NegotiateDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.NegotiateDate);
                },
            },
            {
                headerName: "Lease Start",
                field: "LeaseStart", width: 160,
                valueGetter: function (params) { return moment(params.node.data.LeaseStart) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LeaseStart);
                },
            },
            {
                headerName: "Lease End",
                field: "LeaseEnd", width: 160,
                valueGetter: function (params) { return moment(params.node.data.LeaseEnd) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LeaseEnd);
                },

            },

            {
                headerName: "Due Date",
                field: "DueDate", width: 160,
            },
            {
                headerName: "Approved Date",
                field: "ApprovedDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.ApprovedDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.ApprovedDate);
                },

            }, {
                headerName: "Withdrawl Date",
                field: "WithdrawlDate", width: 160,
                valueGetter: function (params) { return moment(params.node.data.WithdrawlDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.WithdrawlDate);
                },

            },
            {
                headerName: "Graze Start",
                field: "GrazeStart", width: 160,
                valueGetter: function (params) { return moment(params.node.data.GrazeStart) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.GrazeStart);
                },

            },
            {
                headerName: "Graze End",
                field: "GrazeEnd", width: 160,
                valueGetter: function (params) { return moment(params.node.data.GrazeEnd) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.GrazeEnd);
                },

            },
            { headerName: "Residue Required Pct", field: "ResidueRequiredPct", width: 160, hide: !$scope.canViewCropFields },
            { headerName: "Green Cover Required Pct", field: "GreenCoverRequiredPct", width: 160, hide: !$scope.canViewCropFields },
            { headerName: "Clod Required Pct", field: "ClodRequiredPct", width: 160, hide: !$scope.canViewCropFields },
            {
                headerName: "Optional Alt Crop", field: "OptionalAlternativeCrop", width: 160, valueFormatter: function (params) {
                    return valueFormatterBoolean(params.node.data.OutOfCompliance);
                },
            },
            { headerName: "AUMs", field: "AUMs", width: 160, hide: !$scope.canViewCropFields },

            { headerName: "Dollar Per Annum", field: "DollarPerAnnum", width: 160 },
            { headerName: "Dollar Advance", field: "DollarAdvance", width: 160 },
            { headerName: "Dollar Bond", field: "DollarBond", width: 160 },
            { headerName: "Lease Fee", field: "LeaseFee", width: 160 },
            { headerName: "Graze Animal", field: "GrazeAnimal", width: 160, 
                valueFormatter: function (params) {
                    return valueFormatterArrayToList(params.node.data.GrazeAnimal);
                }
            },
            
            { headerName: "Notes", field: "Notes", width: 160 },


        ]

        $scope.historyGrid = {
            columnDefs: historyColumnDefs,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            rowSelection: 'single'
        }


        //income/production ---
        var incomeColumnDefs = [
            { colId: 'ProductionLink', width: 80, cellRenderer: ProductionEditLinksTemplate , menuTabs: [] },
            { headerName: "LeaseYear", field: "LeaseYear", width: 150 },
            {
                headerName: "Posted Date", field: "IncomeDate", width: 150,
                valueGetter: function (params) { return moment(params.node.data.IncomeDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.IncomeDate);
                },
            },
            { headerName: "Posted By", field: "IncomePostedBy", width: 180 },
            
            { headerName: "CropAcres", field: "CropAcres", width: 150 },
            { headerName: "HarvestedCrop", field: "HarvestedCrop", width: 150 },
            { headerName: "CropType", field: "CropType", width: 150 },
            { headerName: "CropVariety", field: "CropVariety", width: 150 },
            { headerName: "CropGrade", field: "CropGrade", width: 150 },
            {
                headerName: "HarvestDate", field: "HarvestDate", width: 150,
                valueGetter: function (params) { return moment(params.node.data.HarvestDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.HarvestDate);
                },
            },
            { headerName: "DeliveryPoint", field: "DeliveryPoint", width: 150 },
            { headerName: "DeliveryLocation", field: "DeliveryLocation", width: 150 },
            { headerName: "DeliveryUnit", field: "DeliveryUnit", width: 150 },
            { headerName: "Gross", field: "Gross", width: 150 },
            { headerName: "Net", field: "Net", width: 150 },
            { headerName: "YieldAcre", field: "YieldAcre", width: 150 },
            { headerName: "OwnerShare", field: "OwnerShare", width: 150 },
            { headerName: "MarketPrice", field: "MarketPrice", width: 150 },
            { headerName: "MarketUnit", field: "MarketUnit", width: 150 },
            { headerName: "CropShareDollar", field: "CropShareDollar", width: 150 },
            { headerName: "Deduct", field: "Deduction", width: 150 },
            { headerName: "DeductType", field: "DeductionType", width: 150 },
            { headerName: "Payment", field: "PaymentAmount", width: 150 },
            { headerName: "PaymentType", field: "PaymentType", width: 150 },
            { headerName: "TotalPayment", field: "TotalPaymentAmount", width: 150 },


            { headerName: "Comments", field: "Comments", width: 450 },

        ]

        $scope.incomeGrid = {
            columnDefs: incomeColumnDefs,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            rowSelection: 'single'
        }


        $scope.closeSidebar = function () {
            $scope.hasResults = false;
        };


        $scope.openFallInspectionModal = function (params) {

            if($scope.lease.LeaseCropPlans.length == 0)
            {
                alert("You must add a Crop Plan before you can add an inspection.")
                return;
            }

            delete $scope.inspection_modal;

            //if editing, we'll have incoming params
            if (params) {
                $scope.inspection_modal = params;
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/add-fall-inspection-modal.html',
                controller: 'FallInspectionModalController',
                scope: $scope, 
            });
        }


        $scope.openSpringInspectionModal = function (params) {

            if ($scope.lease.LeaseCropPlans.length == 0) {
                alert("You must add a Crop Plan before you can add an inspection.")
                return;
            }

            delete $scope.inspection_modal;

            //if editing, we'll have incoming params
            if (params) {
                $scope.inspection_modal = params;
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/add-spring-inspection-modal.html',
                controller: 'SpringInspectionModalController',
                scope: $scope, 
            });
        }

        $scope.openGrazingInspectionModal = function (params) {

            if($scope.lease.LeaseCropPlans.length == 0)
            {
                alert("You must add a Crop Plan before you can add an inspection.")
                return;
            }

            delete $scope.inspection_modal;

            //if editing, we'll have incoming params
            if (params) {
                $scope.inspection_modal = params;
            }
            
            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/add-grazing-inspection-modal.html',
                controller: 'GrazingInspectionModalController',
                scope: $scope,
            });
        }
        

        $scope.openEditLeaseModal = function (params) {

            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/lease-modal.html',
                controller: 'LeaseModalController',
                scope: $scope, 
            });
        }

        $scope.openChangeCropPlanModal = function (params) {
            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/modify-crop-plan-modal.html',
                controller: 'ModifyCropPlanController',
                scope: $scope, 
            });
        }
        
        $scope.openProductionModal = function (params) {

            delete $scope.production_modal;

            //if editing, we'll have incoming params
            if (params) {
                $scope.production_modal = params;
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/add-production-modal.html',
                controller: 'ProductionModalController',
                scope: $scope,
            });
        }

        $scope.saveLeaseCallback = function(saved_lease){
            $scope.lease = LeasingService.getLease(saved_lease.Id);
            $scope.revisions = LeasingService.getLeaseRevisions($routeParams.Id);
            $scope.operators = LeasingService.getOperators(); 
            $scope.cropplanrevisions_all = LeasingService.getLeaseCropPlanRevisions($routeParams.Id);
            $scope.cropplanrevisions = [];

            $scope.lease.$promise.then(function () {
                if ($scope.cropsGrid.api)
                    $scope.cropsGrid.api.setRowData($scope.lease.LeaseCropPlans);

                if ($scope.inspectionsGrid.api)
                    $scope.inspectionsGrid.api.setRowData($scope.lease.LeaseInspections);

                if ($scope.incomeGrid.api)
                    $scope.incomeGrid.api.setRowData($scope.lease.LeaseProductions);
                
                if ($scope.historyGrid.api)
                    $scope.historyGrid.api.setRowData($scope.revisions);

                $scope.cropplanrevisions_all.$promise.then(function () {
                    $scope.refreshCropRevisionsDropdown();
                });
            });

        }

        $scope.operators.$promise.then(function () { 
            $scope.operators.forEach(function (oper) { 
                oper.SortName = (oper.Organization) ? oper.Organization : oper.FirstName + " " + oper.LastName;
            });            
        });

        $scope.selectCropRevision = function () {
            var viewCropRevision = [];

            for (var i = 0; i < $scope.cropplanrevisions_all.length; i++) {
                if ($scope.cropplanrevisions_all[i].SequenceId == $scope.selectedCropRevision)
                    viewCropRevision.push($scope.cropplanrevisions_all[i]);
            }

            $scope.cropsGrid.api.setRowData(viewCropRevision); //$scope.lease.LeaseCropPlans);         

        }

        $scope.refreshCropRevisionsDropdown = function () {
            $scope.maxseq = 0;
            for (var i = 0; i < $scope.cropplanrevisions_all.length; i++) {

                var rev = $scope.cropplanrevisions_all[i];
                if (rev.SequenceId != $scope.maxseq) {
                    $scope.cropplanrevisions.push(rev);
                    $scope.maxseq = rev.SequenceId;
                }
            }

        };


        $scope.currentUser = $rootScope.Profile.Fullname;
        $scope.currentDay = moment().format();


}];