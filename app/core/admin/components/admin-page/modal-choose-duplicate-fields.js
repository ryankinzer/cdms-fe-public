//modal to choose duplicate fields
var modal_admin_choose_duplicate_fields = ['$scope', '$uibModal','$uibModalInstance','AdminService',

    function ($scope, $modal, $modalInstance, AdminService) {

        $scope.savedDuplicateCheckFields = $scope.dataset.Config.DuplicateCheckFields;

        //this HeaderFields thing is a workaround for IE11 because it doesn't render the following. Better would be to just use this in the template:
        /*
               <select size="8" class="form-control" multiple ng-model="dataset.Config.DuplicateCheckFields">
                    <option ng-repeat="field in dataset.Fields | filter:{FieldRoleId:1} | orderBy:'Label'" value="{{field.DbColumnName}}">{{field.Label}} {{field.Field.Units}}</option>
                </select> 
         */

        $scope.HeaderFields = [];

        $scope.dataset.Fields.forEach(function (field) { 
            if (field.FieldRoleId == 1) {
                field.FullLabel = field.Label + " (" + field.Units + ")";
                $scope.HeaderFields.push(field);
            }
        });

        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $scope.dataset.Config.DuplicateCheckFields = $scope.savedDuplicateCheckFields;
            $modalInstance.dismiss();
        };

    }
];
