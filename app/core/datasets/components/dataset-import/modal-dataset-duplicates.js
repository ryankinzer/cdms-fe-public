
var modal_dataset_duplicates = ['$scope', '$modalInstance',
    function ($scope, $modalInstance) {

        $scope.gridDuplicates = {
            data: 'DuplicateRecordsBucket',
            columnDefs: [{
                field: 'locationId',
                displayName: 'Location',
                cellFilter: 'locationNameFilter'
            },
            {
                field: 'activityDate',
                displayName: 'Activity Date',
                cellFilter: 'date: \'MM/dd/yyyy\'',
            }],
        };

        $scope.ok = function () {
            $modalInstance.dismiss();
        };

    }
];