var modal_add_spring_inspection = ['$scope', '$uibModalInstance','LeasingService',
    function ($scope, $modalInstance, LeasingService) {

        $scope.header_message = "Edit Spring Inspection";

        //if we're not editing then we are creating a new one
        if (!$scope.inspection_modal) {
            $scope.header_message = "Add Spring Inspection";
            $scope.inspection_modal = {
                InspectionDateTime: $scope.currentDay,
                InspectedBy: $scope.currentUser,
                LeaseYear: "" + moment().year(),
                InspectionType: "Spring",
            };
        }

        console.dir($scope.inspection_modal);

        var cropsColumnDefsModal = [
            { headerName: "Year", field: "LeaseYear", width: 75, sort: 'asc' },
            { headerName: "Crop Req'd", field: "CropRequirement", width: 120 },
            {
                headerName: "AltCrop?", field: "OptionAlternateCrop", width: 95,
                valueFormatter: function (params) {
                    return valueFormatterBoolean(params.node.data.OptionAlternateCrop);
                },

            }
        ];

        $scope.cropsGridModal = {
            columnDefs: cropsColumnDefsModal,
            rowData: $scope.lease.LeaseCropPlans,
            enableSorting: true,
            enableFilter: true,
            rowSelection: 'single'
        }

        //we want $modalInstance.rendered, but that isn't in our angularjs yet. :/
        $modalInstance.opened.then(function () {
            setTimeout(function () {
                $scope.cropsGridModalDiv = document.querySelector('#modal-crops-grid');
                new agGrid.Grid($scope.cropsGridModalDiv, $scope.cropsGridModal);
            }, 500);
        })

        
        $scope.save = function () {
            console.dir($scope.inspection_modal);
            $scope.inspection_modal.LeaseId = $scope.lease.Id;
            var save_result = LeasingService.saveInspection($scope.inspection_modal);

            save_result.$promise.then(function () {
                $scope.saveLeaseCallback(save_result);
                $modalInstance.dismiss();
            });
            
        };


        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
