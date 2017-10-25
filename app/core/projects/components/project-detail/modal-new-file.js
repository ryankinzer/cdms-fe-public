
var modal_new_file = ['$scope','$modalInstance', 'DataService','DatastoreService',
	function($scope,  $modalInstance, DataService, DatastoreService){

		$scope.header_message = "Edit file";

		$scope.save = function(){
			var promise = DatastoreService.updateFile($scope.project.Id, $scope.row);
			promise.$promise.then(function(){
				$scope.reloadProject();
				$modalInstance.dismiss();
			});
		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};
	}
];
