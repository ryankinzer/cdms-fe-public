
var project_preferences = ['$scope', '$rootScope', '$location','UserService','$window',
    function ($scope, $rootScope, $location, UserService, $window){
		$scope.myprojects = UserService.getMyProjects();
}];