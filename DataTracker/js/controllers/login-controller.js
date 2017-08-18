

var app = angular.module('loginModule', ['ngRoute','ui.bootstrap', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) 
{
	$routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'});
	$routeProvider.when('/logout', {templateUrl: 'partials/login.html', controller: 'LogoutCtrl'});

	$routeProvider.otherwise({redirectTo: '/login'});
}]);


app.controller('LogoutCtrl', ['$scope','LoginSvc', function($scope, LoginSvc){
		
	var logout = LoginSvc.logout();
	if(logout)
	{
		logout.$promise.then(function(data){
			window.location = loginUrl;
		});
	}

}]);

// Login controller
app.controller('LoginCtrl', ['$scope','LoginSvc', function($scope, LoginSvc){
	
	$scope.loggingIn = false;
	$scope.loginMessage = "Trying to login...";

	$scope.login = function(){
		$scope.error = undefined; //clear any error

		if(!$scope.Username || !$scope.Password)
			return;

		$scope.loggingIn = true;

		try{
			
			var login_try = LoginSvc.login($scope.Username, $scope.Password);

			if(login_try)
			{
				login_try.$promise.then(function(data){
					if(data.Success)
					{
						$scope.loginMessage = data.Message;

						//set successUrl to landingpage if there is a preference
						if(data.User && data.User.UserPreferences)
						{
							for (var i = data.User.UserPreferences.length - 1; i >= 0; i--) {

								var pref = data.User.UserPreferences[i];

								if(pref.Name == USER_PREFERENCE_LANDINGPAGE)
								{
									successUrl = serverUrl + '/DataTracker/index.html#' + pref.Value;
								}
							};
						}

						window.location = successUrl;
					}
					else
					{
						$scope.loggingIn = false;
						$scope.error = data.Message;
					}
				});
			}
			else
			{
				$scope.loggingIn = false;
				$scope.error = 'There was a problem trying to login.  Contact the helpdesk if you need further assistance.';	
			}
		}catch(e)
		{
			console.dir(e);
		}
	};


}]);

app.factory('LoginRequest',['$resource', function(resource){
        return resource(serviceUrl+'/account/login');
}]);

app.factory('LogoutRequest', ['$resource', function(resource){
		return resource(serviceUrl+'/account/logout', {}, { query: {method: 'GET', params: {}, isArray: false}});
}]);

app.service('LoginSvc', ['LoginRequest','LogoutRequest', function(LoginRequest, LogoutRequest){
	var service = 
		{
			login: function(username, password){
				return LoginRequest.save({Username: username, Password: password});
			},

			logout: function(){
				return LogoutRequest.get();
			}
		};

	return service;

}]);
