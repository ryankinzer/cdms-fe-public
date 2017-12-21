
var project_preferences = ['$scope', '$rootScope', '$location','PreferencesService','$window',
    function ($scope, $rootScope, $location, PreferencesService, $window){
		$scope.myprojects = PreferencesService.getMyProjects();
}];