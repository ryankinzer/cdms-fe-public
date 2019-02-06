
var landing_page = ['$scope', '$rootScope', '$location', 'DatasetService','UserService','$window',
    function ($scope, $rootScope, $location, DatasetService, UserService, $window){

		$scope.mydatasets = UserService.getMyDatasets();

        $scope.mydatasets.$promise.then(function () { 

            $scope.myprojects = UserService.getMyProjects();
            
			angular.forEach($scope.mydatasets, function(dataset, key){
		        //need to bump this to get the route
	            DatasetService.configureDataset(dataset);    
			});

            //if the user doesn't have any projects or datasets, bounce them to the projects page
            $scope.myprojects.$promise.then(function () { 
                if($scope.myprojects.length == 0 && $scope.mydatasets.length == 0)
                    angular.rootScope.go("/projects");
            })

        });

}];