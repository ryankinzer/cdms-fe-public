﻿//Permits api

permit_module.factory('AllPermits', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/allpermits', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

permit_module.factory('AllParcels', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/allparcels', {}, {
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

permit_module.factory('GetAllPermitPersons', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetAllPermitPersons', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);


leasing_module.factory('SavePermit', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermit');
}]);


leasing_module.factory('SavePermitPerson', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermitperson');
}]);


leasing_module.factory('SavePermitContact', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermitcontact');
}]);

leasing_module.factory('RemovePermitContact', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/RemovePermitContact');
}]);

leasing_module.factory('SavePermitParcel', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermitparcel');
}]);

leasing_module.factory('RemovePermitParcel', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/RemovePermitParcel');
}]);



permit_module.service('PermitService', ['$q',

    'AllPermits',
    'GetPermitContacts',
    'GetPermitParcels',
    'GetPermitEvents',
    'GetPermitFiles',
    'SavePermit',
    'GetAllPermitPersons',
    'SavePermitContact',
    'SavePermitPerson',
    'RemovePermitContact',
    'AllParcels',
    'SavePermitParcel',
    'RemovePermitParcel',

  
    function ($q,
       
        AllPermits,
        GetPermitContacts,
        GetPermitParcels,
        GetPermitEvents,
        GetPermitFiles,
        SavePermit,
        GetAllPermitPersons,
        SavePermitContact,
        SavePermitPerson,
        RemovePermitContact,
        AllParcels,
        SavePermitParcel,
        RemovePermitParcel
      
    ) {
        var service = {

            getAllPermits: function () {
                return AllPermits.query();
            },

            getAllParcels: function () {
                return AllParcels.query();
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

            savePermit: function (permit) {
                return SavePermit.save({ Permit: permit });
            },

            savePermitPerson: function (permitperson) {
                return SavePermitPerson.save({ PermitPerson: permitperson });
            },

            savePermitContact: function (permitcontact) {
                return SavePermitContact.save({ PermitContact: permitcontact });
            },

            getAllPersons:  function (Id) {
                return GetAllPermitPersons.query();
            },

            removeContact: function (permitcontact) {
                return RemovePermitContact.save({ PermitContact: permitcontact });
            },

            savePermitParcel: function (permitparcel) {
                return SavePermitParcel.save({ PermitParcel: permitparcel });
            },

            removePermitParcel: function (permitparcel) {
                return RemovePermitParcel.save({ PermitParcel: permitparcel });
            },


        };

        return service;

    }
]);


