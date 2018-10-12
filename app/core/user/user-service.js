
// user preferences factories and service

user_module.factory('SaveUserInfo', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/saveuserinfo');
}]);

user_module.factory('GetMyProjectsAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getmyprojects', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

user_module.factory('SaveUserPreferenceAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/saveuserpreference', {}, {
        save: { method: 'POST', isArray: false }
    });
}]);

user_module.factory('GetMyDatasetsAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getmydatasets', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

user_module.factory('GetMyLastUpdatedDatasets', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/GetMyLastUpdatedDatasets', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);


/*
* define the service that can be used by any module in our application to work with projects.
*/
user_module.service('UserService', ['$q',
    'SaveUserInfo',
    'GetMyProjectsAction',
    'SaveUserPreferenceAction',
    'GetMyDatasetsAction',
    'GetMyLastUpdatedDatasets',

    function ($q,
        SaveUserInfo,
        GetMyProjectsAction,
        SaveUserPreferenceAction,
        GetMyDatasetsAction,
        GetMyLastUpdatedDatasets) {

        var service = {

            getMyDatasets: function () {
                return GetMyDatasetsAction.query();
            },

            getMyProjects: function () {
                return GetMyProjectsAction.query();
            },

            saveUserPreference: function (name, value, results) {
                var payload = { UserPreference: { Name: name, Value: value } };

                SaveUserPreferenceAction.save(payload, function (data) {
                    results.done = true;
                    results.success = true;
                }, function (data) {
                    results.done = true;
                    results.failure = true;
                });

            },

            saveUserInfo: function (user, scope) {
                console.log("Inside services, DatasetService.saveUserInfo...");
                var payload = { User: user };

                SaveUserInfo.save(payload, function (data) {
                    //scope.savePreferencesResults.done = true;
                    scope.savePreferencesResults.success = true;
                    console.log("scope.savePreferencesResults.success = " + scope.savePreferencesResults.success);
                }, function (data) {
                    //scope.savePreferencesResults.done = true;
                    scope.savePreferencesResults.failure = true;
                    console.log("scope.savePreferencesResults.failure = " + scope.savePreferencesResults.failure);
                });

            },

            getMyLastUpdatedDatasets: function () { 
                return GetMyLastUpdatedDatasets.query();
            },


            
        };

        return service;
    }
]);


