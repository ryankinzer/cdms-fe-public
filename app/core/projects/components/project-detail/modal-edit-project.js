
var modal_edit_project = ['$scope', '$modalInstance', 'ProjectService', 
    function ($scope, $modalInstance, ProjectService) {

        if ($scope.row && $scope.row.Id) {
            $scope.header_message = "Edit project: " + $scope.project.Name;
        }
        else {
            $scope.header_message = "Create new project";
            $scope.row = {};
        }

        $scope.save = function () {
            console.log("Inside ModalProjectEditorCtrl, save...");
            console.log("$scope.row is next...")
            console.dir($scope.row);

            if (!$scope.row.Name) {
                alert("You must enter a Program/Project Name!");
                return;
            }

            $scope.row.Metadata = [];

            //need to make multi-selects into json objects
            angular.forEach($scope.metadataList, function (md) {
                //flatten multiselect values into an json array string
                if (md.Values && md.controlType == "multiselect") {
                    md = angular.copy(md);
                    md.Values = angular.toJson(md.Values).toString(); //wow, definitely need tostring here!
                }

                $scope.row.Metadata.push(md);
            });

            console.log("About to save...");
            var promise = ProjectService.saveProject($scope.row);
            console.log("Just saved...");
            promise.$promise.then(function () {
                console.log("About to reload project...");
                $scope.reloadProject();
                $modalInstance.dismiss();
            });

        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
