var user_analytics = ['$scope', 'UserService', 
    function ($scope, UserService) {

        $scope.analytics = UserService.getAnalytics();

    }
];