
var modal_edit_file = ['$scope','$modalInstance', 'DatasetService','DatastoreService',
	function($scope,  $modalInstance, DatasetService, DatastoreService){

		$scope.header_message = "Edit file";

		$scope.save = function(){
			var promise = ProjectService.updateFile($scope.project.Id, $scope.row);
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
