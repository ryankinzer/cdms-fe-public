
var add_project_dataset = ['$scope','$modalInstance', 'DataService','DatastoreService',
	function($scope,  $modalInstance, DataService, DatastoreService){

		$scope.row = {};

		$scope.projects = DataService.getProjects(); //.sort(orderByAlpha);
		

		$scope.save = function(){
			
			$modalInstance.dismiss();

		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};

	}
];
