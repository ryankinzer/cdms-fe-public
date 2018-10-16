
var landing_page = ['$scope', '$rootScope', '$location', 'DatasetService','UserService','$window',
    function ($scope, $rootScope, $location, DatasetService, UserService, $window){

		$scope.mydatasets = UserService.getMyDatasets();
        $scope.myprojects = UserService.getMyProjects();
        //$scope.mylastupdated = UserService.getMyLastUpdatedDatasets();

        $scope.mydatasets.$promise.then(function () { 
			angular.forEach($scope.mydatasets, function(dataset, key){
		        //need to bump this to get the route
	            DatasetService.configureDataset(dataset);    
			});
        });

}];