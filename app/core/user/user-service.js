﻿
// user preferences factories and service

user_module.factory('SaveUserInfo', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/saveuserinfo');
}]);

user_module.factory('GetMyProjectsAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getmyprojects', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

user_module.factory('GetMyProjectsList', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getmyprojectslist', {}, {
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

user_module.factory('GetMyDatasetsList', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getmydatasetslist', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

user_module.factory('GetMyLastUpdatedDatasets', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/GetMyLastUpdatedDatasets', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

//analytics

user_module.factory('UserLoginsPastMonth', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/analytics/UserLoginsPastMonth', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);


user_module.factory('UserRequestsTotalPastMonth', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/analytics/UserRequestsTotalPastMonth', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

user_module.factory('DatasetRequestsTotalPastMonth', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/analytics/DatasetRequestsTotalPastMonth', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

user_module.factory('LastUpdatedDatasets', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/analytics/LastUpdatedDatasets', {}, {
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
    'UserLoginsPastMonth',
    'UserRequestsTotalPastMonth',
    'DatasetRequestsTotalPastMonth',
    'LastUpdatedDatasets',
    'GetMyProjectsList',
    'GetMyDatasetsList',

    function ($q,
        SaveUserInfo,
        GetMyProjectsAction,
        SaveUserPreferenceAction,
        GetMyDatasetsAction,
        GetMyLastUpdatedDatasets,
        UserLoginsPastMonth,
        UserRequestsTotalPastMonth,
        DatasetRequestsTotalPastMonth,
        LastUpdatedDatasets,
        GetMyProjectsList,
        GetMyDatasetsList
) {

        var service = {

            getUserLoginsPastMonth: function () { 
                return UserLoginsPastMonth.query();
            },

            getUserRequestsTotalPastMonth: function () { 
                return UserRequestsTotalPastMonth.query();
            },

            getDatasetRequestsTotalPastMonth: function () { 
                return DatasetRequestsTotalPastMonth.query();
            },

            getLastUpdatedDatasets: function () { 
                return LastUpdatedDatasets.query();
            },

            getMyDatasets: function () {
                return GetMyDatasetsAction.query();
            },

            getMyProjects: function () {
                return GetMyProjectsAction.query();
            },

            getMyDatasetsList: function () {
                return GetMyDatasetsList.query();
            },

            getMyProjectsList: function () {
                return GetMyProjectsList.query();
            },

            saveUserPreference: function (name, value) {
                var payload = { UserPreference: { Name: name, Value: value } };

                return SaveUserPreferenceAction.save(payload);

            },

            saveUserInfo: function (user, scope) {
                console.log("Inside services, DatasetService.saveUserInfo...");
                var payload = { User: user };

                return SaveUserInfo.save(payload);

            },

            getMyLastUpdatedDatasets: function () { 
                return GetMyLastUpdatedDatasets.query();
            },

            //the_scope needs the project set; toggles the favorite status.
            toggleFavoriteProject: function(the_scope, root_scope){
    
                if (!the_scope || !the_scope.project)
                    return;

                the_scope.isFavorite = !the_scope.isFavorite; //make the visible change instantly.

                root_scope.Profile.toggleProjectFavorite(the_scope.project);

                var save_pref = this.saveUserPreference("Projects", root_scope.Profile.favoriteProjects.join());

                save_pref.$promise.then(function () {
                    //success = already done.
                }, function (data) { 
                    //if something goes wrong, roll it back.
                    the_scope.isFavorite = !the_scope.isFavorite;
                    root_scope.Profile.toggleProjectFavorite(the_scope.project);
                });
            },

            //the_scope needs the dataset set; toggles the favorite status.
            toggleFavoriteDataset: function(the_scope, root_scope){

                the_scope.isFavorite = !the_scope.isFavorite; //make the visible change instantly.

                root_scope.Profile.toggleDatasetFavorite(the_scope.dataset);

                var save_pref = this.saveUserPreference("Datasets", root_scope.Profile.favoriteDatasets.join());

                save_pref.$promise.then(function () {
                    //success = already done.
                }, function (data) { 
                    //if something goes wrong, roll it back.
                    the_scope.isFavorite = !the_scope.isFavorite;
                    root_scope.Profile.toggleDatasetFavorite(the_scope.dataset);
                });
            },
            
            
        };

        return service;
    }
]);


