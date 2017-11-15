
var admin_edit_master = ['$scope', '$modal', 'DatasetService', 'AdminService', '$routeParams',
	function($scope, $modal, DatasetService, AdminService, $routeParams){

		$scope.datastore = DatasetService.getDatastore($routeParams.Id);
		
		$scope.SelectedField = null;

		$scope.$watch('datastore.Id', function(){
			if($scope.datastore.Id > 0)
				$scope.datastoreFields = AdminService.getMasterFields($scope.datastore.FieldCategoryId); //AdminService.getFields($routeParams.Id);
		});

		$scope.$watch('datastoreFields', function(){
			if(!$scope.datastoreFields)
				return;

				angular.forEach($scope.datastoreFields, function(field){
					//parseField(field, $scope);
					if(field.PossibleValues)
						field.Values = makeObjectsFromValues($scope.datastore.Id+field.DbColumnName, field.PossibleValues);

				});				
			

		},true);

		$scope.saveField = function()
		{
			console.log("console.log("Inside admin_edit_master, saveField...");
			
			$scope.saveResults = {};
			AdminService.saveMasterField($scope.SelectedField, $scope.saveResults);
		}
		
		$scope.selectField = function(field){
			$scope.SelectedField = field;
		};
		

	}
];