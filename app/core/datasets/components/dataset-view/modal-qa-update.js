var modal_qa_update = ['$scope', 'DatasetService', 'ProjectService', '$modalInstance',
    function ($scope, DatasetService, ProjectService, $modalInstance) {
        $scope.save = function () {

            DatasetService.updateQaStatus(
                $scope.grid.Header.ActivityId,
                $scope.row.ActivityQAStatus.QAStatusId,
                $scope.row.ActivityQAStatus.Comments,
                $scope.QaSaveResults);

            ProjectService.clearProject();

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