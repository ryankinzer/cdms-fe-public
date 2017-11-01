var modal_delete_file = ['$scope','$modalInstance', 'DatasetService','DatastoreService',
	function($scope,  $modalInstance, DatasetService, DatastoreService){

		$scope.header_message = "Delete file";

		$scope.save = function(){
			var promise = ProjectService.deleteFile($scope.project.Id, $scope.row);
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
