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

permit_module.factory('GetPermitFiles', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPermitFiles', {}, {
        query: { method: 'GET', params: { ProjectId: 'ProjectId', PermitId: 'PermitId'}, isArray: true }
    });
}]);

leasing_module.factory('SavePermit', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermit');
}]);



permit_module.service('PermitService', ['$q',

    'AllPermits',
    'GetPermitContacts',
    'GetPermitParcels',
    'GetPermitEvents',
    'GetPermitFiles',
    'SavePermit',
  
    function ($q,
       
        AllPermits,
        GetPermitContacts,
        GetPermitParcels,
        GetPermitEvents,
        GetPermitFiles,
        SavePermit
      
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

            getPermitFiles: function (PermitId) {
                return GetPermitFiles.query({ ProjectId: PERMIT_PROJECTID, PermitId: PermitId });
            },

            savePermit: function (permit, contacts, parcels, files) {
                return SavePermit.save({ Permit: permit });
            },
        };

        return service;

    }
]);


