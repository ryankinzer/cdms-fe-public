
var admin_new_dataset = ['$scope', '$uibModal', 'DatasetService', 'AdminService', '$routeParams','ProjectService',
    function ($scope, $modal, DatasetService, AdminService, $routeParams, ProjectService) {

        $scope.datastore = DatasetService.getDatastore($routeParams.Id);
        $scope.projects = ProjectService.getProjects();
        $scope.datasets = DatasetService.getDatasets();

        $scope.projectsWithThisDatasetList = [];
        $scope.availableProjectList = [];

        $scope.datastoreFields = null; //the fields we'll load once the datastore is loaded

        $scope.SelectedProject = null;

        $scope.DefaultExcludeFields = ["Row QA Status", "Instrument", "Activity Description", "Accuracy Check", "Post Accuracy Check", "Reading Timezone"];

        $scope.datastore.$promise.then( function () {
            if ($scope.datastore.Id > 0) {
                $scope.datastoreFields = AdminService.getMasterFields($scope.datastore.Id); 

                $scope.datastoreFields.$promise.then(function () { 
                    if (!$scope.datastoreFields)
                        return;

                    angular.forEach($scope.datastoreFields, function (field) {
                        //parseField(field, $scope);
                        if (field.PossibleValues)
                            field.Values = makeObjectsFromValues($scope.datastore.Id + field.DbColumnName, field.PossibleValues);

                    });

                    //let's also load the system fields if it isn't a "single" type table
                    if($scope.datastore.TableType != 'Single'){
                        var systemFields = AdminService.getMasterFields(DATASTORE_ACTIVITYSYSTEMFIELDS);
                        systemFields.$promise.then(function () { 
                            systemFields.forEach(function (systemfield) {
                                if (systemfield.PossibleValues)
                                    systemfield.Values = makeObjectsFromValues(DATASTORE_ACTIVITYSYSTEMFIELDS + systemfield.DbColumnName, systemfield.PossibleValues);

                                if ($scope.DefaultExcludeFields.contains(systemfield.Name))
                                    systemfield.exclude = true;

                                $scope.datastoreFields.push(systemfield);
                            })
                        });
                    }
                });

            }
        });

        
        $scope.projects.$promise.then(function () {
            if ((typeof $scope.projects === 'undefined') || ($scope.projects === null))
                return;
            else if ((typeof $scope.projects[0] === 'undefined') || ($scope.projects[0] === null))
                return;

            // First, get the list of projects that have a dataset from this datastore.
            $scope.datasets.forEach(function (dataset) {
                if (dataset.DatastoreId === $scope.datastore.Id)
                    $scope.projectsWithThisDatasetList.push(dataset.ProjectId);
            });

            // Next, build our list of available projects, that DO NOT have this dataset.
            $scope.projects.forEach(function (project) {
                var DoesProjectHaveThisDataset = false;
                $scope.projectsWithThisDatasetList.forEach(function (p) {
                    if (project.Id === p)
                        DoesProjectHaveThisDataset = true;
                });
                if (!DoesProjectHaveThisDataset)
                    $scope.availableProjectList.push(project);

            });

            // Now set the list that we show in the combo-box to our list of available projects.
            $scope.projects = $scope.availableProjectList;
        });

        $scope.addDatasetToProject = function () {
            console.log("Inside admin_new_dataset, addDatasetToProject...");
            console.log("$scope is next...");
            console.dir($scope);

            if (!$scope.SelectedProject)
            {
                alert("Please select a project to add this dataset to.");
                return;
            }

            var projectIndex = $scope.projects.indexOf(parseInt($scope.SelectedProject));
            console.log("projectIndex = " + projectIndex);
                
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