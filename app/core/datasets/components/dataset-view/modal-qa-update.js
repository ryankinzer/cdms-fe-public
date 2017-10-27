var modal_qa_update = ['$scope', 'DataService', '$modalInstance',
    function ($scope, DataService, $modalInstance) {
        $scope.save = function () {

            DataService.updateQaStatus(
                $scope.grid.Header.ActivityId,
                $scope.row.ActivityQAStatus.QAStatusId,
                $scope.row.ActivityQAStatus.Comments,
                $scope.QaSaveResults);

            DataService.clearProject();

            $scope.fields = { header: [], detail: [], relation: [] };
            $scope.datasheetColDefs = [];
            $scope.dataSheetDataset = [];
            $scope.fieldsloaded = false;

            $scope.reloadProject();
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];