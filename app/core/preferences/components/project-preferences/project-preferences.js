
var project_preferences = ['$scope','$rootScope','$location','DataService','$window',
	function($scope, $rootScope,$location, DataService, $window){
		$scope.myprojects = DataService.getMyProjects();
}];