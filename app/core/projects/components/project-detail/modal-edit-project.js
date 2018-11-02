
var modal_edit_project = ['$scope', '$uibModal','$uibModalInstance', 'ProjectService', 'CommonService',
    function (scope, $modal, $modalInstance, ProjectService, CommonService) {

        //make the row of values that map to our field directives.
        scope.project.MetaFields.forEach(function (field) { 
            field.DbColumnName = field.Label = field.Name;
            scope.row[field.DbColumnName] = field.Values;
        });

        if (scope.row && scope.row.Id) {
            scope.header_message = "Edit project: " + scope.project.Name;
        }
        else {
            scope.header_message = "Create new project";
            scope.row = {};
        }

        scope.save = function () {
            console.log("Inside ModalProjectEditorCtrl, save...");
            console.log("scope.row is next...")
            console.dir(scope.row);

            if (!scope.row.Name) {
                alert("You must enter a Program/Project Name!");
                return;
            }

            scope.row.Metadata = [];
            
            //need to make multi-selects into json objects
            angular.forEach(scope.metadataList, function (md) {
                //flatten multiselect values into an json array string
                if (md.Values && md.controlType == "multiselect") {
                    md = angular.copy(md);
                    md.Values = angular.toJson(md.Values).toString(); 
                }

                scope.row.Metadata.push(md);
            });

            var promise = ProjectService.saveProject(scope.row);
            promise.$promise.then(function (saved_project) {
                $modalInstance.close(saved_project);
            });

        };

        scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
