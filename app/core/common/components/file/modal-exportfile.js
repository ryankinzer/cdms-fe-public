var modal_exportfile = ['$scope','DatasetService','$uibModalInstance','$window',
	function($scope, DatasetService,$modalInstance, $window) {

		//$scope.alerts 
		$scope.Export = { Filename: "Export.csv" };

		$scope.ok = function(){
			$scope.downloadQuery = $scope.buildQuery(); 
			$scope.downloadQuery.criteria.Filename = $scope.Export.Filename;
			DatasetService.exportActivities($scope.downloadQuery);

			//$modalInstance.dismiss();
		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};
	}
];