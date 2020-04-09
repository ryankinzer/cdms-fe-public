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

covid_module.factory('RemoveEmployee', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/covid/removeemployee');
}]);


covid_module.service('CovidService', ['$q',

    'MyEmployees',
    'MyEmployeesWork',
    'SaveEmployees',
    'RemoveEmployee',
    
    function ($q,
       
        MyEmployees,
        MyEmployeesWork,
        SaveEmployees,
        RemoveEmployee
      
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
            },

            removeEmployee: function(Id) {
                return RemoveEmployee.save({ Id: Id });
            }

            

        };

        return service;

    }
]);


