
var add_project_dataset = ['$scope','$uibModalInstance', 'ProjectService',
	function($scope,  $modalInstance, ProjectService){

		$scope.row = {};

        $scope.projects = ProjectService.getProjects(); //.sort(orderByAlpha);
		

		$scope.save = function(){
			
			$modalInstance.dismiss();

		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};

	}
];
