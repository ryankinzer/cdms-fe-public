
// preferences factories and service

mod.factory('SaveUserInfo', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/saveuserinfo');
}]);


mod.factory('GetMyProjectsAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getmyprojects', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

mod.factory('SaveUserPreferenceAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/saveuserpreference', {}, {
        save: { method: 'POST', isArray: false }
    });
}]);


/*
* define the service that can be used by any module in our application to work with projects.
*/
projects_module.service('PreferencesService', ['$q', 'GetInstruments', 

    function ($q, GetInstruments, ) {

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


