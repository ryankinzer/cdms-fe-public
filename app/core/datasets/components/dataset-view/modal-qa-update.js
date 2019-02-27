var modal_qa_update = ['$scope', 'DatasetService', 'ProjectService', '$uibModalInstance',
    function ($scope, DatasetService, ProjectService, $modalInstance) {

        $scope.NewActivityStatus = {};

        $scope.message = "";        

        $scope.save = function () {
            var result = DatasetService.updateQaStatus(
                $scope.row.Activity.Id,
                $scope.NewActivityStatus.QAStatusId,
                $scope.NewActivityStatus.Comments,
            );

            console.dir(result);
            result.$promise.then(function () { 

                $scope.row.Activity.ActivityQAStatus.QAStatus = getById($scope.dataset.QAStatuses,$scope.NewActivityStatus.QAStatusId);
                $scope.row.Activity.ActivityQAStatus.User = $scope.Profile;
                $scope.row.Activity.ActivityQAStatus.QAStatusId = $scope.NewActivityStatus.QAStatusId;
                $scope.row.Activity.ActivityQAStatus.Comments = $scope.NewActivityStatus.Comments;

                console.dir($scope.row.Activity.ActivityQAStatus);

                $modalInstance.dismiss();
            }, function () { 
                $scope.message = "There was a problem saving the new status.";
            });
            
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];