
var modal_permit_edit_filetype = ['$scope', '$uibModalInstance', 'ProjectService',
    function ($scope, $modalInstance, ProjectService){

		$scope.header_message = "Edit File Type";

		$scope.save = function(){
			var saved_file = ProjectService.updateFile(PERMIT_PROJECTID, $scope.file_modal);
			saved_file.$promise.then(function(){
				$modalInstance.close($scope.file_modal);
			});
		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};
	}
];
