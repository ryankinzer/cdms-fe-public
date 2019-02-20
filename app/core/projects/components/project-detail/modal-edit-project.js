
var modal_edit_project = ['$scope', '$uibModal','$uibModalInstance', 'ProjectService', 'CommonService',
    function (scope, $modal, $modalInstance, ProjectService, CommonService) {

        if (scope.row && scope.row.Id) {
            scope.header_message = "Edit project: " + scope.project.Name;
        }
        else {
            scope.header_message = "Create new project";
            scope.row = scope.project;
        }

        //make the row of values that map to our field directives.
        scope.project.MetaFields.forEach(function (field) { 
            field.DbColumnName = field.Label = field.Name;
            if (field.Values)
                scope.row[field.DbColumnName] = field.Values;
            else
                scope.row[field.DbColumnName] = null;
        });

        scope.openChooseLookupLists = function () {
            
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-choose-project-lists.html',
                controller: 'ModalProjectConfigLists',
                scope: scope, //very important to pass the scope along...
            }).result.then(function (saved_field) { 

            });
        };

        scope.getConfig = function () { 
            return angular.toJson(scope.project.Config);
        };

        scope.save = function () {

            if (!scope.row.Name) {
                alert("You must enter a Program/Project Name!");
                return;
            }

            if (!scope.row['Program'] || !scope.row['Sub-program']) {
                alert("You must choose a Program and Sub-program on the 'Project' tab.");
                return;
            }

            scope.row.Metadata = [];
            
            //need to make multi-selects into json objects
            angular.forEach(scope.row.MetaFields, function (md) {
                if (scope.row[md.DbColumnName]) {

                    //flatten multiselect values into an json array string
                    if (md.ControlType == "multiselect" || md.ControlType == "multiselect-checkbox") {
                        md = angular.copy(md);
                        md.Values = angular.toJson(scope.row[md.DbColumnName]);
                    }
                    else {
                        md.Values = scope.row[md.DbColumnName];
                    }
                    md.RelationId = scope.project.Id; 
                    md.UserId = scope.currentUserId;
                    delete md.EffDt;
                    scope.row.Metadata.push(md);
                } 
            });
            
            var saveRow = angular.copy(scope.row);
            delete saveRow.Editors;
            delete saveRow.Files;
            delete saveRow.Instruments;
            delete saveRow.Editors;
            delete saveRow.Locations;
            delete saveRow.MetaFields;
            delete saveRow.Owner;

            var promise = ProjectService.saveProject(saveRow);
            promise.$promise.then(function (saved_project) {
                $modalInstance.close(saved_project);
            });

        };

        scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
