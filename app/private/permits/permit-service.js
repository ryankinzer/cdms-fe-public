//Permits api

permit_module.factory('AllPermits', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/allpermits', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

permit_module.factory('GetPermitContacts', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPermitContacts', {}, {
        query: { method: 'GET', params: { Id: 'Id'}, isArray: true }
    });
}]);

permit_module.factory('GetPermitParcels', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPermitParcels', {}, {
        query: { method: 'GET', params: { Id: 'Id'}, isArray: true }
    });
}]);

permit_module.factory('GetPermitEvents', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPermitEvents', {}, {
        query: { method: 'GET', params: { Id: 'Id'}, isArray: true }
    });
}]);


permit_module.service('PermitService', ['$q',

    'AllPermits',
    'GetPermitContacts',
    'GetPermitParcels',
    'GetPermitEvents',
  
    function ($q,
       
        AllPermits,
        GetPermitContacts,
        GetPermitParcels,
        GetPermitEvents
      
    ) {
        var service = {

            getAllPermits: function () {
                return AllPermits.query();
            },

            getPermitContacts: function (Id) {
                return GetPermitContacts.query({ Id: Id });
            },

            getPermitParcels:  function (Id) {
                return GetPermitParcels.query({ Id: Id });
            },
            
            getPermitEvents:  function (Id) {
                return GetPermitEvents.query({ Id: Id });
            },
        };

        return service;

    }
]);


