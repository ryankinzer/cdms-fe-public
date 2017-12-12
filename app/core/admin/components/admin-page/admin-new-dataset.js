
var admin_new_dataset = ['$scope', '$modal', 'DatasetService', 'AdminService', '$routeParams','ProjectService',
    function ($scope, $modal, DatasetService, AdminService, $routeParams, ProjectService) {

        $scope.datastore = DatasetService.getDatastore($routeParams.Id);
        $scope.projects = ProjectService.getProjects();
        $scope.datastoreFields = null; //the fields we'll load once the datastore is loaded

        $scope.SelectedProject = null;

        $scope.$watch('datastore.Id', function () {
            if ($scope.datastore.Id > 0)
                $scope.datastoreFields = AdminService.getMasterFields($scope.datastore.FieldCategoryId); //AdminService.getFields($routeParams.Id);
        });

        $scope.$watch('datastoreFields', function () {
            if (!$scope.datastoreFields)
                return;

            angular.forEach($scope.datastoreFields, function (field) {
                //parseField(field, $scope);
                if (field.PossibleValues)
                    field.Values = makeObjectsFromValues($scope.datastore.Id + field.DbColumnName, field.PossibleValues);

            });


        }, true);

        $scope.addDatasetToProject = function () {

            if (!$scope.SelectedProject)
            {
                alert("Please select a project to add this dataset to.");
                return;
            }
                
            console.log(" The selected project: " + $scope.SelectedProject);
            $scope.fieldsToSave = [];

            //whip up an array with the fields we want to have in our new dataset.
            $scope.datastoreFields.forEach(function (item, index) {
                if (!item.exclude)
                    $scope.fieldsToSave.push(item);
            });

            console.dir($scope.fieldsToSave);

            var promise = DatasetService.addDatasetToProject($scope.datastore.Id, $scope.SelectedProject, $scope.fieldsToSave);

            promise.$promise.then(function () {
                console.log("Hey we're back! Success!")
                console.dir(promise);
                angular.rootScope.go("/admin");
            });
        }

        $scope.selectField = function (field) {
            $scope.SelectedField = field;
        };

        $scope.removeField = function (field) {
            //console.dir(field);
            field.exclude = !field.exclude;
        };

    }
];