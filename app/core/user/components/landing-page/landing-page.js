
var landing_page = ['$scope', '$rootScope', '$location', 'DatasetService','UserService','$window',
    function ($scope, $rootScope, $location, DatasetService, UserService, $window){

        $scope.myprojects = UserService.getMyProjects();
		$scope.mydatasets = UserService.getMyDatasets();

        //if the user doesn't have any projects or datasets, bounce them to the projects page
        $scope.myprojects.$promise.then(function () { 
            $scope.checkIfEmpty();    
        })

        $scope.mydatasets.$promise.then(function () { 
            
			angular.forEach($scope.mydatasets, function(dataset, key){
		        //need to bump this to get the route
	            DatasetService.configureDataset(dataset);    
			});

            $scope.checkIfEmpty();    

        });

        $scope.checkIfEmpty = function () {
            console.dir($scope.myprojects);
            console.dir($scope.mydatasets);
            if ($scope.myprojects.$resolved && $scope.mydatasets.$resolved) {
                if($scope.myprojects.length == 0 && $scope.mydatasets.length == 0)
                    angular.rootScope.go("/projects");
            }
        };



}];