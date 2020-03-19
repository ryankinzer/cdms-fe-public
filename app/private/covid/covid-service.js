//Covid api

covid_module.factory('MyEmployees', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/covid/supervisedemployees', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

covid_module.factory('MyEmployeesWork', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/covid/supervisedemployeeswork', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

covid_module.factory('SaveEmployees', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/covid/saveemployees');
}]);

covid_module.service('CovidService', ['$q',

    'MyEmployees',
    'MyEmployeesWork',
    'SaveEmployees',
    
    function ($q,
       
        MyEmployees,
        MyEmployeesWork,
        SaveEmployees
      
    ) {
        var service = {

            getMyEmployees: function () {
                return MyEmployees.query();
            },

            getMyEmployeesWork: function() {
                return MyEmployeesWork.query();
            },

            saveEmployees: function(data){
                return SaveEmployees.save({ Employees: data });
            }

        };

        return service;

    }
]);


