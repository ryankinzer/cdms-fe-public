
var admin_edit_master = ['$scope','DatastoreService','$modal', 'DataService', '$routeParams',
	function($scope, DatastoreService, $modal, DataService, $routeParams){

		$scope.datastore = DatastoreService.getDatastore($routeParams.Id);
		
		$scope.SelectedField = null;

		$scope.$watch('datastore.Id', function(){
			if($scope.datastore.Id > 0)
				$scope.datastoreFields = DatastoreService.getMasterFields($scope.datastore.FieldCategoryId); //DatastoreService.getFields($routeParams.Id);
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
			$scope.saveResults = {};
			DatastoreService.saveMasterField($scope.SelectedField, $scope.saveResults);
		}
		
		$scope.selectField = function(field){
			$scope.SelectedField = field;
		};
		

	}
];