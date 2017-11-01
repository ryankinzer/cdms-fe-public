
var project_preferences = ['$scope','$rootScope','$location','DatasetService','$window',
	function($scope, $rootScope,$location, DatasetService, $window){
		$scope.myprojects = PreferencesService.getMyProjects();
}];