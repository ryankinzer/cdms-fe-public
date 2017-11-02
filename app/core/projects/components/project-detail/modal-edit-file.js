
var modal_edit_file = ['$scope', '$modalInstance', 'ProjectService',
    function ($scope, $modalInstance, ProjectService){

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
