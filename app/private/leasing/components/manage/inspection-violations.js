var inspection_violations = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'LeasingService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope,LeasingService) {

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        //$scope.FromDate = moment().subtract(10, "years"); //how many violations to show?
        $scope.ShowResolved = true;

        $scope.violations = LeasingService.getInspectionViolations({ShowResolved: $scope.ShowResolved});

        $scope.violationResolutions = $scope.leaseTypes = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_INSPECTIONVIOLATIONS);

        $scope.violations.$promise.then(function () {
            $scope.violationsGridDiv = document.querySelector('#inspection-violations-grid');
            new agGrid.Grid($scope.violationsGridDiv, $scope.violationsGrid);

            if ($rootScope.Profile.hasRole("LeasingEditor")) {
                $scope.violationsGrid.columnApi.setColumnVisible("EditLinks", true);
                $scope.violationsGrid.api.refreshHeader();
            }

        });

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openInspectionViolationModal(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };

        var violationsColumnDefs = [
            { colId: 'EditLinks', width: 90, cellRenderer: EditLinksTemplate, menuTabs: [], hide: true },

            {
                headerName: "Inspection Date", field: "InspectionDateTime", width: 160,
                valueGetter: function (params) { return moment(params.node.data.InspectionDateTime) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.InspectionDateTime);
                },
                menuTabs: ['filterMenuTab'],
                filter: 'date',
                sort: 'desc',
                filterParams: { apply: true }
            },
            {
                headerName: "Resolved?", field: "ViolationIsResolved", width: 120,
                valueFormatter: function (params) {
                    if (params && params.node) {
                        return valueFormatterBoolean(params.node.data.ViolationIsResolved);
                    } else {
                        return valueFormatterBoolean(params.value === "true"); //for filter!
                    }
                },
                menuTabs: ['filterMenuTab'],
            },

            { headerName: "Allotment", field: "AllotmentName", width: 120, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Crop Present", field: "CropPresent", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Inspection Type", field: "InspectionType", width: 160, menuTabs: ['filterMenuTab'], filter: true},
            { headerName: "Violation Type", field: "ViolationType", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Inspection Notes", field: "InspectionNotes", width: 300, menuTabs: ['filterMenuTab'], filter: "text" },

            {
                headerName: "Resolution", field: "ViolationResolution", width: 160, menuTabs: ['filterMenuTab'], filter: true
            },
            { headerName: "Fee Collected", field: "ViolationFeeCollected", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            {
                headerName: "Date Fee Collected", field: "ViolationDateFeeCollected", width: 160,
                valueGetter: function (params) { return moment(params.node.data.StatusDate) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.StatusDate);
                }, menuTabs: ['filterMenuTab'], filter: "number"
            },
            { headerName: "Fee Collected By", field: "ViolationFeeCollectedBy", width: 160, menuTabs: ['filterMenuTab']},
            { headerName: "Hours Spent", field: "ViolationHoursSpent", width: 160,menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Comments", field: "ViolationComments", width: 160,menuTabs: ['filterMenuTab'], filter: "text"},

            //more lease fields
            { headerName: "Lease Number", field: "LeaseNumber", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "Lease Type", field: "LeaseType", width: 160, menuTabs: ['filterMenuTab'] , filter: true},
            { headerName: "Lease Acres", field: "LeaseAcres", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            {
                headerName: "Optional Alt Crop", field: "OptionalAlternativeCrop", width: 160,
                valueGetter: function (params) {
                    return valueFormatterBoolean(params.node.data.OutOfCompliance);
                },
                menuTabs: ['filterMenuTab']
            },
            { headerName: "Graze Animal", field: "GrazeAnimal", width: 160, menuTabs: ['filterMenuTab'],
                valueFormatter: function (params) {
                    return valueFormatterArrayToList(params.node.data.GrazeAnimal);
                }
            },
            { headerName: "TAAMSNumber", field: "TAAMSNumber", width: 160, menuTabs: ['filterMenuTab'], filter: "text" },
            { headerName: "Lease Year", field: "LeaseYear", width: 160, menuTabs: ['filterMenuTab'], filter: "number" },
            { headerName: "Inspected By", field: "InspectedBy", width: 160, menuTabs: ['filterMenuTab'], filter: true },

        ];

        $scope.rowsChanged = {};

        $scope.violationsGrid = {
            columnDefs: violationsColumnDefs,
            rowData: $scope.violations,
            rowSelection: 'multiple',
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

        $scope.openInspectionViolationModal = function (params) {

            $scope.violation_modal = params;

            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/inspection-violation-modal.html',
                controller: 'InspectionViolationModalController',
                scope: $scope,
            });
        }

        $scope.saveInspectionCallback = function () {
            $scope.violations = LeasingService.getInspectionViolations({ ShowResolved: $scope.ShowResolved });
            $scope.violations.$promise.then(function () {
                $scope.violationsGrid.api.setRowData($scope.violations);
            });
        }

}];