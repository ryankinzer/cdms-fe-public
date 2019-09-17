
var admin_view = ['$scope', '$uibModal', 'DatasetService','ProjectService',
    function ($scope, $modal, DatasetService, ProjectService) {

        if (!$scope.Profile.isAdmin())
            angular.rootScope.go("/unauthorized");

        $scope.datastores = DatasetService.getDatastores();
        $scope.projects = ProjectService.getProjects();

        $scope.datastores.$promise.then(function(){
            angular.forEach($scope.datastores, function (datastore, key) {
                datastore.Datasets = DatasetService.getDatastoreDatasets(datastore.Id);
            });
        })


        $scope.createMasterDataset = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-datastore.html',
                controller: 'ModalDatastore',
                scope: $scope, //very important to pass the scope along... 
                backdrop: "static",
                keyboard: false
            });
            
        };

        $scope.addNewProjectDataset = function (datastore) {
            $scope.datastore = datastore;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/add-new-project-dataset.html',
                controller: 'ModalAddProjectDatasetCtrl',
                scope: $scope, //very important to pass the scope along... 
                backdrop: "static",
                keyboard: false
            });
        };

        $scope.getProjectName = function (id) {
            var ret = "";
            var project = getMatchingByField($scope.projects, id, 'Id');
            if (Array.isArray(project) && project.length == 1) {
                ret = project[0].Name;
            }
            return ret;
        }


    }

];