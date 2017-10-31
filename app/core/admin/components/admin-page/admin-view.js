
var admin_view = ['$scope', 'DatastoreService', '$modal', 'DataService',
    function ($scope, DatastoreService, $modal, DataService) {

        //TODO: a nicer global route authorization scheme...
        if (!$scope.Profile.isAdmin())
            angular.rootScope.go("/unauthorized");

        $scope.datastores = DatastoreService.getDatastores();
        $scope.projects = DataService.getProjects();

        var watcher = $scope.$watch('datastores', function () {

            if ($scope.datastores.length > 0) {
                watcher();	//removes watch since we're about to do some updates that would cause multiple firings...!

                angular.forEach($scope.datastores, function (datastore, key) {
                    //datastore.Projects = DatastoreService.getDatastoreProjects(datastore.Id);
                    datastore.Datasets = DatastoreService.getDatasets(datastore.Id);
                });

            }


        }, true);


        $scope.addNewProjectDataset = function (datastore) {
            $scope.datastore = datastore;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/addNewProjectDataset.html',
                controller: 'ModalAddProjectDatasetCtrl',
                scope: $scope, //very important to pass the scope along... 

            });
        };

        $scope.getProjectName = function (id) {

            //console.log(">>" + id);
            var ret = "";
            var project = getMatchingByField($scope.projects, id, 'Id');
            if (project)
                ret = " - " + project.Name;

        }


    }

];