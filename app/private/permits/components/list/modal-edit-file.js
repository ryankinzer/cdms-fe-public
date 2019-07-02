
var modal_edit_file = ['$scope', '$uibModalInstance', 'ProjectService',
    function ($scope, $modalInstance, ProjectService){

		$scope.header_message = "Edit file";

        //options from config.js
        $scope.SHARINGLEVEL_PRIVATE = SHARINGLEVEL_PRIVATE;
        $scope.SHARINGLEVEL_PUBLICREAD = SHARINGLEVEL_PUBLICREAD;
        $scope.SharingLevel = SharingLevel;

		$scope.save = function(){
			var promise = ProjectService.updateFile($scope.project.Id, $scope.row);
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
