
var admin_edit_dataset_config = ['$scope', '$uibModal', '$timeout', '$routeParams', 'DatasetService', 'CommonService','ProjectService','AdminService',
    function ($scope, $modal, $timeout, $routeParams, DatasetService, CommonService, ProjectService, AdminService) {

        $scope.OnTab = "Configuration";
        $scope.SaveMessage = null;
        $scope.dataset = DatasetService.getDataset($routeParams.Id);


        $scope.dataset.$promise.then(function () {

            $scope.dataset.DefaultActivityQAStatusId = "" + $scope.dataset.DefaultActivityQAStatusId;
            $scope.dataset.DefaultRowQAStatusId = "" + $scope.dataset.DefaultRowQAStatusId;

            $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');
            $scope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name'); 

        });

        $scope.saveConfig = function () {
            $scope.SaveMessage = "Saving...";
            console.dir($scope.dataset.Config);
            $scope.dataset.Config = angular.toJson($scope.dataset.Config);
            var promise = DatasetService.saveDataset($scope.dataset );

            promise.$promise.then(function () {
                if (promise.Id) {
                    $scope.dataset = DatasetService.getDataset(promise.Id);
                    $scope.SaveMessage = "Save successful.";
                } else {
                    console.dir(promise);
                    $scope.SaveMessage = "Save failed.";
                }
                $scope.dataset.Config = angular.fromJson($scope.dataset.Config);
            });
        };


        $scope.openChooseDuplicateFields = function () {
            
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-choose-duplicate-fields.html',
                controller: 'ModalChooseDuplicateFieldsCtrl',
                scope: $scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_field) { 

            });
        };

        $scope.openChooseActivityListFields = function () {
            
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-choose-activitylist-fields.html',
                controller: 'ModalChooseActivityListFieldsCtrl',
                scope: $scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_field) { 

            });
        };




    }

];