
var landing_page = ['$scope', '$rootScope', '$location', 'DatasetService','UserService','$window',
    function ($scope, $rootScope, $location, DatasetService, UserService, $window){

		$scope.mydatasets = UserService.getMyDatasets();
        $scope.myprojects = UserService.getMyProjects();
        //$scope.mylastupdated = UserService.getMyLastUpdatedDatasets();

}];