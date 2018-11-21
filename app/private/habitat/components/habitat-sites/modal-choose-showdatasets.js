//modal to choose datasets to show habitat sites on
var modal_hab_choose_showdatasets = ['$scope', '$uibModal','$uibModalInstance','ProjectService',

    function ($scope, $modal, $modalInstance, ProjectService) {

        if (!$scope.project.Config.ShowHabitatSitesForDatasets)
            $scope.project.Config.ShowHabitatSitesForDatasets = {};

        $scope.savedChosenDatasets = $scope.project.Config.ShowHabitatSitesForDatasets;

        $scope.project_datasets = ProjectService.getProjectDatasets($scope.project.Id);

        $scope.save = function () {
            console.dir($scope.project.Config.ShowHabitatSitesForDatasets);
            var save_project = angular.copy($scope.project);
            save_project.Config = angular.toJson(save_project.Config);

            var returned_project = ProjectService.saveProjectConfig(save_project);
            returned_project.$promise.then(function () { 
                console.log("Successfully saved project config");
                $modalInstance.close(returned_project);
            }, function () { 
                console.log("Failed to save project config");
                $scope.project.Config.ShowHabitatSitesForDatasets = $scope.savedChosenDatasets;
                $modalInstance.dismiss();
            });
            
        };

        $scope.cancel = function () {
            $scope.project.Config.ShowHabitatSitesForDatasets = $scope.savedChosenDatasets;
            $modalInstance.dismiss();
        };

    }
];
