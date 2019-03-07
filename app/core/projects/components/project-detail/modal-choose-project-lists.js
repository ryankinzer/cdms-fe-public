//modal to choose project config lists
var modal_projectconfig_choose_lists = ['$scope', '$uibModal','$uibModalInstance','AdminService','CommonService',

    function ($scope, $modal, $modalInstance, AdminService, CommonService) {

        $scope.savedLookups = $scope.project.Config.Lookups;
        
        //this HeaderFields thing is a workaround for IE11 because it doesn't render the following. Better would be to just use this in the template:
        /*
               <select size="8" class="form-control" multiple ng-model="dataset.Config.DuplicateCheckFields">
                    <option ng-repeat="field in dataset.Fields | filter:{FieldRoleId:1} | orderBy:'Label'" value="{{field.DbColumnName}}">{{field.Label}} {{field.Field.Units}}</option>
                </select> 
         */

        $scope.entities = CommonService.getMetadataEntities();

        $scope.lists = [];

        $scope.ListsToHide = ['Datasets', 'Lookups', 'Program', 'Project', 'ProjectType: Habitat'];

        $scope.entities.$promise.then(function () { 
    
            $scope.entities.forEach(function (entity) { 
                if(!$scope.ListsToHide.contains(entity.Name))
                    $scope.lists.push({ 'Id': entity.Id, 'Label': entity.Name, 'Type': 'Metafields' });
            });
    
            $scope.lists.push({ 'Label': 'Fishermen', 'DatasetId':FISHERMEN_DATASETID, 'Id': 1 }); //id here is the LookupTable.Id
            $scope.lists.push({ 'Label': 'Seasons', 'DatasetId': SEASONS_DATASETID, 'Id': 2 }, );
            $scope.lists.push({ 'Label': 'Instruments' });
            console.dir($scope.lists);
        });

/*
        $scope.HeaderFields = [];

        $scope.dataset.Fields.forEach(function (field) { 
            if (field.FieldRoleId == 1) {
                field.FullLabel = field.Label + " (" + field.Units + ")";
                $scope.HeaderFields.push(field);
            }
        });
*/

        $scope.save = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $scope.project.Config.Lookups = $scope.savedLookups;
            $modalInstance.dismiss();
        };

    }
];
