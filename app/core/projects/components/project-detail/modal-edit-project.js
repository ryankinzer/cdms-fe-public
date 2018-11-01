
var modal_edit_project = ['$scope', '$uibModal','$uibModalInstance', 'ProjectService', 'CommonService',
    function (scope, $modal, $modalInstance, ProjectService, CommonService) {

        //console.dir(scope);
        
        scope.CellOptions = {}; //for metadata dropdown options
        scope.metadataList = {};
        scope.metadataPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID);
        scope.metadataPropertiesPromise.promise.then(function(list){
            addMetadataProperties(list, scope.metadataList, scope, CommonService);
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
