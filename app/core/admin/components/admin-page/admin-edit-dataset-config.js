
var admin_edit_dataset_config = ['$scope', '$uibModal', '$timeout', '$routeParams', 'DatasetService', 'CommonService','ProjectService','AdminService',
    function ($scope, $modal, $timeout, $routeParams, DatasetService, CommonService, ProjectService, AdminService) {

        $scope.OnTab = "Configuration";
        $scope.SaveMessage = null;
        $scope.dataset = DatasetService.getDataset($routeParams.Id);


        $scope.dataset.$promise.then(function () {

            if ($scope.dataset.Config !== undefined && $scope.dataset.Config != null) {
                $scope.dataset.ConfigString = angular.toJson($scope.dataset.Config, true);
                $scope.parseConfigString();
            }

            $scope.dataset.DefaultActivityQAStatusId = "" + $scope.dataset.DefaultActivityQAStatusId;
            $scope.dataset.DefaultRowQAStatusId = "" + $scope.dataset.DefaultRowQAStatusId;

            $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');
            $scope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name'); 

        });

        $scope.parseConfigString = function () {
            try {
                var ConfigObject = angular.fromJson($scope.dataset.ConfigString);
                if (ConfigObject)
                    $scope.ConfigParse = "Parse successful.";
            } catch (exception) {
                console.dir(exception);
                $scope.ConfigParse = exception.message;
            }
        }

        $scope.saveConfig = function () {
            $scope.SaveMessage = "Saving...";
            $scope.dataset.Config = $scope.dataset.ConfigString;
            var promise = DatasetService.saveDataset($scope.dataset );

            promise.$promise.then(function () {
                //console.dir(promise);
                if (promise.Id) {
                    $scope.dataset = DatasetService.getDataset(promise.Id);
                    $scope.SaveMessage = "Save successful.";
                } else {
                    console.dir(promise);
                    $scope.SaveMessage = "Save failed.";
                }
            });
        };

    }

];