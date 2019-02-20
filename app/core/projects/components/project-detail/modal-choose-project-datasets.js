//modal to choose project config datasets
var modal_projectconfig_choose_datasets = ['$scope', '$uibModal','$uibModalInstance','AdminService','ProjectService',

    function ($scope, $modal, $modalInstance, AdminService, ProjectService) {

        if (!$scope.project.Config.ShowHabitatSitesForDatasets)
            $scope.project.Config.ShowHabitatSitesForDatasets = {};

        $scope.savedDatasets = $scope.project.Config.ShowHabitatSitesForDatasets;
        
        $scope.project_datasets = ProjectService.getProjectDatasets($scope.project.Id);

        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $scope.project.Config.ShowHabitatSitesForDatasets = $scope.savedDatasets;
            $modalInstance.dismiss();
        };

    }
];
