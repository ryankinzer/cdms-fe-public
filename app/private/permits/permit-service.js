﻿//Permits api

permit_module.factory('AllPermits', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/allpermits', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

permit_module.factory('RoutingPermits', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/routingpermits', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

permit_module.factory('InspectionPermits', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/inspectionpermits', {}, {
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

permit_module.factory('GetRelatedParcels', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetRelatedParcels', {}, {
        query: { method: 'GET', params: { ParcelId: 'ParcelId'}, isArray: true }
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

permit_module.factory('SavePermit', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermit');
}]);

permit_module.factory('SavePermitPerson', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermitperson');
}]);

permit_module.factory('SavePermitContact', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermitcontact');
}]);

permit_module.factory('RemovePermitContact', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/RemovePermitContact');
}]);

permit_module.factory('SavePermitParcel', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/savepermitparcel');
}]);

permit_module.factory('RemovePermitParcel', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/RemovePermitParcel');
}]);

permit_module.factory('SavePermitEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/SavePermitEvent');
}]);

permit_module.factory('DeletePermitFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/DeletePermitFile');
}]);

permit_module.factory('DeletePermitPerson', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/DeletePermitPerson');
}]);

permit_module.factory('GetOutstandingRequests', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetOutstandingRequests', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('GetExpiringPermits', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetExpiringPermits', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('GetPermitStatistics', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPermitStatistics', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('GetPermitByPermitNumber', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPermitByPermitNumber', {}, {
        query: { method: 'GET', params: { }, isArray: false }
    });
}]);

permit_module.factory('GetPublicHearingPermits', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPublicHearingPermits', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('GetNotifications', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/syslog/GetNotificationsByModule', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('GetPermitRoutes', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPermitRoutes', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('GetPermitTypes', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/GetPermitTypes', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('GetViolations', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/allviolations', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('SaveViolation', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/saveviolation');
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
    'SavePermitEvent',
    'RoutingPermits',
    'InspectionPermits',
    'DeletePermitFile',
    'GetRelatedParcels',
    'GetExpiringPermits',
    'GetOutstandingRequests',
    'GetPermitStatistics',
    'GetPermitByPermitNumber',
    'GetPublicHearingPermits',
    'GetNotifications',
    'GetPermitRoutes',
'GetPermitTypes',
'DeletePermitPerson',
'GetViolations',
'SaveViolation',
  
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
        RemovePermitParcel,
        SavePermitEvent,
        RoutingPermits,
        InspectionPermits,
        DeletePermitFile,
        GetRelatedParcels,
        GetExpiringPermits,
        GetOutstandingRequests,
        GetPermitStatistics,
        GetPermitByPermitNumber,
        GetPublicHearingPermits,
        GetNotifications,
        GetPermitRoutes,
GetPermitTypes,
DeletePermitPerson,
GetViolations,
SaveViolation
      
    ) {
        var service = {

            getAllPermits: function () {
                return AllPermits.query();
            },

            getInspectionPermits: function () {
                return InspectionPermits.query();
            },

            getRoutingPermits: function () {
                return RoutingPermits.query();
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
            
            getPermitTypes: function () { 
                return GetPermitTypes.query();
            },

            getPermitEvents:  function (Id) {
                return GetPermitEvents.query({ Id: Id });
            },

            getPermitFiles: function (PermitId) {
                return GetPermitFiles.query({ ProjectId: PERMIT_PROJECTID, PermitId: PermitId });
            },

            getPermitsByRelatedParcels: function (ParcelId) {
                return GetRelatedParcels.query({ ParcelId: ParcelId });
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

            savePermitEvent: function (permitevent) {
                return SavePermitEvent.save({ PermitEvent: permitevent });
            },

            deleteFile: function (projectId, subprojectId, itemId, file) {
                return DeletePermitFile.save({ ProjectId: projectId, SubprojectId: subprojectId, ItemId: itemId, File: file });
            },

            deletePermitPerson: function(Id){
                return DeletePermitPerson.save({Id: Id});
            },

            getOutstandingRequests: function () { 
                return GetOutstandingRequests.query();
            },

            getExpiringPermits: function () { 
                return GetExpiringPermits.query();
            },

            getPermitStatistics: function () { 
                return GetPermitStatistics.query();
            },
            
            getAllViolations: function () { 
                return GetViolations.query();
            },

            saveViolation: function(violation) {
                return SaveViolation.save({Violation: violation})
            },
            
            getPermitByPermitNumber: function (permitnumber) {
                return GetPermitByPermitNumber.query({ PermitNumber: permitnumber });
            },

            getPublicHearingPermits: function () { 
                return GetPublicHearingPermits.query();
            },

            getPermitRoutes: function () { 
                return GetPermitRoutes.query();
            },
    
            getPermitRoutesByItemType: function (itemType) { 
                return GetPermitRoutes.query({ ItemType: itemType });
            },

            getNotifications: function () { 
                return GetNotifications.query({ Module: 'Permits' });
            }

        };

        return service;

    }
]);


