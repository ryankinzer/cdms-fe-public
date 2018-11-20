var modal_delete_file = ['$scope', '$uibModalInstance', 'ProjectService',
    function ($scope, $modalInstance, ProjectService){

		$scope.header_message = "Delete file?";

		$scope.save = function(){
			var promise = ProjectService.deleteFile($scope.project.Id, $scope.row);
			promise.$promise.then(function(){
				$scope.callback(promise);
				$modalInstance.dismiss();
			});
		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};
	}
];
