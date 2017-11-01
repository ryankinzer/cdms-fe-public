//when you click the "View" button on a relation table field, it opens this modal
var modal_relationgrid = ['$scope','$modalInstance', 'DatasetService','DatastoreService',
    function($scope,  $modalInstance, DatasetService, DatastoreService){

        //incoming scope variable
        // $scope.relationgrid_row, $scope.relationgrid_field
        if($scope.relationgrid_field.Field == null || $scope.relationgrid_field.Field.DataSource == null)
        {
            $scope.alerts = [{type: "error", msg: "There is a misconfiguration in the relationship. "}];
            return;
        }
        else
        {
            $scope.relation_dataset = DatasetService.getDataset($scope.relationgrid_field.Field.DataSource);
        }

        //get the relationdata out of the row -- use it if it exists, otherwise fetch it from the db.
        if($scope.relationgrid_row[$scope.relationgrid_field.DbColumnName])
            $scope.relationgrid_data = $scope.relationgrid_row[$scope.relationgrid_field.DbColumnName];
        else
        {
            $scope.relationgrid_data = DatasetService.getRelationData($scope.relationgrid_field.FieldId, $scope.relationgrid_row.ActivityId, $scope.relationgrid_row.RowId);
            $scope.relationgrid_row[$scope.relationgrid_field.DbColumnName] = $scope.relationgrid_data;
        }

        $scope.relationColDefs = [];
        $scope.relationGrid = {
            data: 'relationgrid_data',
            columnDefs: 'relationColDefs',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEdit: $scope.isEditable,
            enableColumnResize: true,
        };

        $scope.$watch('relation_dataset.Id', function(){
            if(!$scope.relation_dataset.Id)
                return;

            var grid_fields = [];

            //iterate the fields of our relation dataset and populate our grid columns
            angular.forEach($scope.relation_dataset.Fields.sort(orderByIndex), function(field){
                parseField(field, $scope);
                grid_fields.push(field);
                $scope.relationColDefs.push(makeFieldColDef(field, $scope));
            });

            //add our list of fields to a relationFields collection -- we will use this later when saving...
            $scope.fields.relation[$scope.relationgrid_field.Field.DbColumnName] = grid_fields;
            
        });

        $scope.save = function(){

            //copy back to the actual row field
            //$scope.link_row[$scope.link_field.DbColumnName] = angular.toJson($scope.currentLinks);
            //console.dir($scope.relationgrid_row);
            $scope.updatedRows.push($scope.relationgrid_row.Id);
            $modalInstance.dismiss();
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

        $scope.addRow = function()
        {
            $scope.relationgrid_data.push(makeNewRow($scope.relationColDefs));
        }

    }
];
