

//var app = angular.module('loginModule', ['ngRoute','ui.bootstrap', 'ngResource']);
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
	console.log("Inside controller LoginCtrl...");
	
	$scope.loggingIn = false;
	$scope.loginMessage = "Trying to login...";

	$scope.login = function(){
		console.log("Inside function login...");
		
		//var strServerNumber = "";
		//var strClientNumber = "";
		var strFirstNumber = "";
		var strSecondNumber = "";
		
		var strOriginalText = $scope.Password;
		
		var oText = {};
		
			oText.strText = "";
			oText.intNumber = -1;
			//oText.intSize = -1;

		
		$scope.error = undefined; //clear any error

		if(!$scope.Username || !$scope.Password)
			return;
		
		// For some reason, the login runs twice, without this if check to prevent it.
		if ($scope.loggingIn === false)
		{
			$scope.loggingIn = true;
			
			try{		
				$scope.Password = LoginSvc.encrypt($scope.Password);
				//console.log("$scope.Password = " + $scope.Password);
				//throw "Stopping right here...";
				
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
			}catch(e)
			{
				console.dir(e);
			}
		}
	};
}]);

app.factory('RetrieveNumber',['$resource', function(resource){
        return resource(serviceUrl+'/account/GetNumber', {}, {
        //return resource("http://10.10.10.86:81/Development/services-dev/account/GetNumber', {}, {			
			query: {method: 'GET', params: {}, isArray: false} 
		});
        //return resource(serviceUrl+'/data/GetNumber', {}, { 
		//	query: {method: 'GET', params: {}, isArray: false} 
		//});
}]);
//mod.factory('Project',['$resource', function($resource){
//        return $resource(serviceUrl+'/api/projects', {}, {
//            query: {method: 'GET', params: {id:'id'}, isArray: false}
//        });
//}]);

app.factory('LoginRequest',['$resource', function(resource){
        return resource(serviceUrl+'/account/login');
}]);

app.factory('LogoutRequest', ['$resource', function(resource){
		return resource(serviceUrl+'/account/logout', {}, { query: {method: 'GET', params: {}, isArray: false}});
}]);

//app.service('LoginSvc', ['LoginRequest','LogoutRequest', function(LoginRequest, LogoutRequest){
app.service('LoginSvc', ['LoginRequest','LogoutRequest','RetrieveNumber', function(LoginRequest, LogoutRequest, RetrieveNumber){
	var service = 
		{
			login: function(username, password){
				console.log("Inside LoginSvc, login...");
				return LoginRequest.save({Username: username, Password: password});
			},

			logout: function(){
				console.log("Inside LoginSvc, logout...");
				return LogoutRequest.get();
			},
			
			retrieveNumber: function(){
				console.log("Inside retrieveNumber...");
				return RetrieveNumber.get();
			},
			
			encrypt: function(strText)
			{
				//var strServerNumber = "";
				//var strClientNumber = "";
				var strFirstNumber = "";
				var strSecondNumber = "";
				var strPassword = ""
				var originalTextList = [];
				
				var strFinalResult = "";
				//var strLastDigit = "";
				
				var strOriginalText = strText;
				//console.log("strOriginalText = " + strOriginalText);
				
				var oText = {};
				
					oText.strText = "";
					oText.intNumber = -1;
					//oText.intSize = -1;
					
				strFirstNumber = buildRandomString10();
				//strFirstNumber = "8989898989"; // Use this for development/testing.
				//console.log("strFirstNumber = " + strFirstNumber);
				
				strSecondNumber = buildRandomString10();
				//strSecondNumber = "7878787878"; // Use this for development/testing.
				//console.log("strSecondNumber = " + strSecondNumber);

				for (var i = 0; i < strOriginalText.length; i++)
				{
					var oText = {};

					oText.strText = strOriginalText.substr(i, 1);
					oText.intNumber = strOriginalText.charCodeAt(i);

					//$scope.originalTextList.push(oText);
					originalTextList.push(oText);
				}
				//console.log("originalTextList is next...");
				//console.dir(originalTextList);
				
				//writeResults(originalTextList);
				
				var intFirstNumberLength = strFirstNumber.length;
				//console.log("intFirstNumberLength = " + intFirstNumberLength);
				
				for (var i = 0; i < intFirstNumberLength; i++)
				{
					// Step1:  1st digit tells what digit in second number to multiply by.
					angular.forEach (originalTextList, function(item){
						//console.log("strFirstNumber[i] = " + strFirstNumber[i]);
						//console.log("item.strText = " + item.strText + ", ");
						//console.log("i = " + i);
						//console.log("parseInt(strFirstNumber.substr(i, 1)) = " + parseInt(strFirstNumber.substr(i, 1)));
						//console.log("strSecondNumber = " + strSecondNumber);

						if ((i === 0) || (i === 3) || (i === 6) || (i === 9))
						{
							item.intNumber = item.intNumber + getNumberFromPlace(parseInt(strFirstNumber.substr(i, 1)), strSecondNumber);
						}
						else if ((i === 1) || (i === 4) || (i === 7))
						{
								item.intNumber = item.intNumber * getNumberFromPlace(parseInt(strFirstNumber.substr(i, 1)), strSecondNumber);
						}
						else if ((i === 2) || (i === 5) || (i === 8))
						{
								item.intNumber = item.intNumber - getNumberFromPlace(parseInt(strFirstNumber.substr(i, 1)), strSecondNumber);
						}
						//writeResults(originalTextList);
					});
					
				}
				strPassword = buildFinalResults(originalTextList, strFirstNumber, strSecondNumber);
				//console.log("strPassword = " + strPassword);
							
				return strPassword;
			}
			
		};

	return service;

}]);

function buildRandomString10()
{
	var strNum = "";
	
	var intRandom = -1;
	for (var i = 0; i < 10; i++)
	{
		intRandom = Math.floor(Math.random() * 8) + 1; // We want a number between 1 and 9, inclusively.

		strNum += intRandom;
	}
	return strNum;
}

function writeResults(originalTextList)
{
	angular.forEach(originalTextList, function(item){
		console.log(item.strText + ", " + item.intNumber);
		console.log("***********");
		console.log("***********");
	});
}

function buildFinalResults(originalTextList, strFirstNumber, strSecondNumber)
{
	//console.log("originalTextList is next...");
	//console.dir(originalTextList);
	//console.log("strFirstNumber = " + strFirstNumber);
	//console.log("strSecondNumber = " + strSecondNumber);
	
	var strFinalResult = "";
	var strLastDigit = "";

	angular.forEach (originalTextList, function(item)
	{
		strFinalResult += item.intNumber.toString().length +  item.intNumber.toString();
	});
	//console.log("strFinalResult (before concat)= " + strFinalResult);

	// Note:  The string contained in strFinalResult has a good probability of being too long 
	// for either int32 or int64.
	// Int32 -- (-2,147,483,648 to +2,147,483,647)
	// Int64 -- (-9,223,372,036,854,775,808 to +9,223,372,036,854,775,807)
	//
	// Therefore, we need to handle the number in a string instead.

	strFinalResult += strFirstNumber + strSecondNumber;
	//console.log("strFinalResult (after concat) = " + strFinalResult);
	
	var n = -1;
	//for (int i = (strSecondNumber.length - 1); i > -1; i--)
	for (var i = (strFirstNumber.length - 1); i > -1; i--)
	{
		//n = parseInt(strSecondNumber.Substring(i, 1));
		n = parseInt(strFirstNumber.substr(i, 1));
		if ( n > 2)
		{
			//console.log("Last hash # = " + n);
			strFinalResult = multiply(strFinalResult, n.toString());
			strLastDigit = n.toString();
			i = -1;
		}
		strFinalResult = angular.copy(strFinalResult) + strLastDigit;
	}
	console.log("strFinalResult (after final hash)= " + strFinalResult);

	//$scope.strFinalResult = intFinalResult.toString();

	//console.log("strFinalResult (final)= " + strFinalResult);
	//console.log("strFinalResult.length = " + strFinalResult.length);
	//console.log("strOriginalText.length = " + strOriginalText.length);
	//console.log("strFirstNumber = " + strFirstNumber);
	//console.log("strSecondNumber = " + strClientNumber);
	return strFinalResult;
}

function multiply(strA, strB)
{
	//console.log("Inside multiply...");
	//console.log("strA = " + strA + ", strB = " + strB);
	// This method expects two numbers, each in a separate string.
	// This version accepts a multidigit numbr (strA), and a single-digit second numbr (strB)
	var intADigit = 0;
	var intBDigit = 0;

	var intRemainder = 0;
	var intCarryOver = 0;

	var intResult = 0;
	var strResult = "";

	strA.trim();
	strB.trim();

	var intALength = strA.length;
	//console.log("intALength = " + intALength);

	var intBLength = strB.length;
	//console.log("intBLength = " + intBLength);

	// Example of what we are doing...
	//  123
	// *  2
	//  ---
	//  246

	intBDigit = parseInt(strB);
	for (var i = intALength - 1; i > -1; i--)
	{
		intADigit = parseInt(strA.substr(i, 1));
		//intBDigit = parseInt(strB.substr(i, 1));
		//console.log("intADigit = " + intADigit);
		//console.log("intBDigit = " + intBDigit);
		
		intResult = intADigit * intBDigit;
		//console.log("intResult = " + intResult);

		// The first time through, intCarryOver is 0;
		intRemainder = (intResult % 10) + intCarryOver;
		//console.log("intRemainder = " + intRemainder);
		
		intCarryOver = Math.floor((intResult / 10)); // Round down to nearest integer; 1.7 -> 1.
		//console.log("intCarryOver = " + intCarryOver);
		
		while (intRemainder > 9)
		{
			intCarryOver += Math.floor((intRemainder / 10)); // Round down to nearest integer; 1.7 -> 1.
			intRemainder = intRemainder % 10;
		}
		//console.log("intCarryOver = " + intCarryOver + ", intRemainder = " + intRemainder);

		strResult = intRemainder.toString() + strResult;
		//console.log("strResult = " + strResult);
	}
	if (intCarryOver > 0)
	{
		//strResult = intRemainder.toString() + intCarryOver.toString() + strResult;
		strResult = intCarryOver.toString() + strResult;
	}

	return strResult;
}

function getNumberFromPlace(aNumber, strSecondNumber)
{
	//console.log("Inside $scope.getNumberFromPlace...");
	//console.log("aNumber = " + aNumber);
	var intDigitFromSecond = parseInt(strSecondNumber.substr(aNumber - 1, 1));

	return intDigitFromSecond;
}