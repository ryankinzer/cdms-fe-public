
var admin_edit_master = ['$scope', '$timeout', '$modal', 'DatasetService', 'AdminService', '$routeParams',
	function($scope, $timeout, $modal, DatasetService, AdminService, $routeParams){

		$scope.datastore = DatasetService.getDatastore($routeParams.Id);
		
		$scope.SelectedField = null;

        $timeout(function () {
            //stickyfill - this is so that IE (dumb thing) can have sticky div.
            //https://www.npmjs.com/package/stickyfill2
            var stickybox = document.getElementById('sticky-box');
            if (stickybox) {
                Stickyfill.add(stickybox);
                //console.log("stickyfill is a go!!! - !!!!!!!!!!!!!!!!!!!!!!");
            }
        }, 0);

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
			console.log("Inside admin_edit_master, saveField...");
			
			$scope.saveResults = {};
			AdminService.saveMasterField($scope.SelectedField, $scope.saveResults);
		}
		
		$scope.selectField = function(field){
			$scope.SelectedField = field;
		};
		

	}
];