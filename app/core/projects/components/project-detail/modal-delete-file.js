var modal_delete_file = ['$scope','$modalInstance', 'DataService','DatastoreService',
	function($scope,  $modalInstance, DataService, DatastoreService){

		$scope.header_message = "Delete file";

		$scope.save = function(){
			var promise = DatastoreService.deleteFile($scope.project.Id, $scope.row);
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
