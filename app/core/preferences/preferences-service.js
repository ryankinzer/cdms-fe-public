
// preferences factories and service

preferences_module.factory('SaveUserInfo', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/saveuserinfo');
}]);

preferences_module.factory('GetMyProjectsAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getmyprojects', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

preferences_module.factory('SaveUserPreferenceAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/saveuserpreference', {}, {
        save: { method: 'POST', isArray: false }
    });
}]);

preferences_module.factory('GetMyDatasetsAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getmydatasets', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

/*
* define the service that can be used by any module in our application to work with projects.
*/
preferences_module.service('PreferencesService', ['$q',
    'SaveUserInfo',
    'GetMyProjectsAction',
    'SaveUserPreferenceAction',
    'GetMyDatasetsAction', 

    function ($q,
        SaveUserInfo,
        GetMyProjectsAction,
        SaveUserPreferenceAction,
        GetMyDatasetsAction) {

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
                console.log("Inside services, Dataservice.saveUserInfo...");
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


            
        };

        return service;
    }
]);


