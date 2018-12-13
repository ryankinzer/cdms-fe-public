var my_preferences = ['$scope', 'UserService', 'ConvertStatus',
    function ($scope, UserService, ConvertStatus) {
        console.log("Inside MyPreferencesCtrl...");
        //console.log("$scope is next");
        ////console.dir($scope);

        $scope.savePreferences = function () {
            console.log("Inside savePreferences...");

            $scope.User = {
                Id: $scope.Profile.Id,
                Username: $scope.Profile.Username,
                Description: $scope.Profile.Description,
                DepartmentId: $scope.Profile.DepartmentId,
                Fullname: $scope.Profile.Fullname
            }
//            console.log("$scope.preferencesUpdate is next...");
//            console.dir($scope.preferencesUpdate);

            $scope.savePreferencesResults = [];
//            console.log("$scope.savePreferencesResults = " + $scope.savePreferencesResults);

            var userresult = UserService.saveUserInfo($scope.User, $scope);
            
            userresult.$promise.then(function () { 
                var prefresult = UserService.saveUserPreference("LandingPage", $scope.Profile.LandingPage);
                prefresult.$promise.then(function () { 
                    $scope.Message = "Success";
                }, function (data) { 
                    console.dir(data);
                    $scope.Message = "Failure";
                });
            }, function (data) { 
                console.dir(data);
                $scope.Message = "Failed to save user.";
            });
            
        };

        $scope.cancel = function () {
            window.location = "index.html";
        };

    }
];