
var modal_modify_crop_plan = ['$scope', '$uibModalInstance','LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Modify lease contract: " + $scope.lease.LeaseNumber;

        $scope.lease_modal = {}; //for changedby
        
        var cropsColumnDefs = [
            { headerName: "Year", field: "LeaseYear", width: 120, sort: 'asc' },
            {
                headerName: "Crop Requirement", field: "CropRequirement", width: 180,
                cellEditor: "select",
                cellEditorParams: { values: $scope.cropOptions.ListValues } 
            },
            {
                headerName: "Alt Crop Option?", field: "OptionAlternateCrop", width: 160,
                cellEditor: 'booleanEditor',
                cellRenderer: 'booleanCellRenderer',
            }
        ];

        var cropsRowData = $scope.lease.LeaseCropPlans;

        $scope.cropsGrid = {
            columnDefs: cropsColumnDefs,
            rowData: cropsRowData,
            rowSelection: 'multiple',
            components: {
                booleanEditor: BooleanEditor,
                booleanCellRenderer: BooleanCellRenderer,
            },
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
            },
        }

        $modalInstance.opened.then(function () {
            setTimeout(function () {
                $scope.cropsGridDiv = document.querySelector('#crops-grid-modal');
                new agGrid.Grid($scope.cropsGridDiv, $scope.cropsGrid);
            }, 1000)
        });

        $scope.save = function () {
            console.dir($scope.cropsGrid);

            var lease_save = angular.copy($scope.lease);

            delete lease_save.LeaseComplianceActions;
            delete lease_save.LeaseCropPlans;
            delete lease_save.LeaseFields;
            delete lease_save.LeaseInspections;
            delete lease_save.LeaseOperator;
            delete lease_save.LeaseProductions;

            lease_save.ChangedReason = $scope.lease_modal.ChangedReason; 

            var rowdata = [];
            $scope.cropsGrid.api.forEachNode(function (node) {
                rowdata.push(node.data);
            });

            var saved_lease = LeasingService.saveCropPlan(lease_save, rowdata);
            saved_lease.$promise.then(function(){
                $scope.saveLeaseCallback(saved_lease);
                $modalInstance.dismiss();
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.addRow = function () {
            $scope.cropsGrid.api.updateRowData({ add: [{}] });
        };

        $scope.removeRow = function () {
            var selected = $scope.cropsGrid.api.getSelectedRows();
            $scope.cropsGrid.api.updateRowData({ remove: selected });
        };


    }
];

