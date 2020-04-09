//Violations api - loaded by permits since they are both TPO projects

// NOTE: that means the resources have the same namespace and cannot share names across services...


permit_module.factory('GetViolations', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/allviolations', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

permit_module.factory('SaveViolation', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/saveviolation');
}]);

permit_module.factory('GetViolationContacts', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/GetViolationContacts', {}, {
        query: { method: 'GET', params: { Id: 'Id'}, isArray: true }
    });
}]);

permit_module.factory('SaveViolationContact', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/saveviolationcontact');
}]);


permit_module.factory('GetViolationParcels', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/GetViolationParcels', {}, {
        query: { method: 'GET', params: { Id: 'Id'}, isArray: true }
    });
}]);

permit_module.factory('GetViolationRelatedParcels', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/GetRelatedParcels', {}, {
        query: { method: 'GET', params: { ParcelId: 'ParcelId'}, isArray: true }
    });
}]);

permit_module.factory('SaveViolationParcel', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/saveviolationparcel');
}]);

permit_module.factory('DeleteViolationFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/DeleteViolationFile');
}]);

permit_module.factory('GetViolationFiles', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/GetViolationFiles', {}, {
        query: { method: 'GET', params: { ProjectId: 'ProjectId', ViolationId: 'ViolationId'}, isArray: true }
    });
}]);

permit_module.factory('GetViolationEvents', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/GetViolationEvents', {}, {
        query: { method: 'GET', params: { Id: 'Id'}, isArray: true }
    });
}]);

permit_module.factory('SaveViolationEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/SaveViolationEvent');
}]);

permit_module.factory('GetViolationCodes', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/GetViolationCodes', {}, {
        query: { method: 'GET', params: { Id: 'Id'}, isArray: true }
    });
}]);

permit_module.factory('SaveViolationCode', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/SaveViolationCode');
}]);

permit_module.factory('RemoveViolationContact', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/RemoveViolationContact');
}]);

permit_module.factory('RemoveViolationParcel', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/violation/RemoveViolationParcel');
}]);


permit_module.service('ViolationService', ['$q',
'GetViolations',
'SaveViolation',
'GetViolationContacts',
'SaveViolationContact',
'GetViolationParcels',
'GetViolationRelatedParcels',
'SaveViolationParcel',
'DeleteViolationFile',
'GetViolationFiles',
'GetViolationEvents',
'SaveViolationEvent',
'GetViolationCodes',
'SaveViolationCode',
'RemoveViolationContact',
'RemoveViolationParcel',
  
    function ($q,
        GetViolations,
        SaveViolation,
        GetViolationContacts,
        SaveViolationContact,
        GetViolationParcels,
        GetViolationRelatedParcels,
        SaveViolationParcel,
        DeleteViolationFile,
        GetViolationFiles,
        GetViolationEvents,
        SaveViolationEvent,
        GetViolationCodes,
        SaveViolationCode,
        RemoveViolationContact,
        RemoveViolationParcel
      
    ) {
        var service = {

            
            getAllViolations: function () { 
                return GetViolations.query();
            },

            getViolationContacts: function (Id) { 
                return GetViolationContacts.query({ Id: Id });
            },

            saveViolation: function(violation) {
                return SaveViolation.save({Violation: violation})
            },
            
            saveViolationContact: function (contact) {
                return SaveViolationContact.save({ ViolationContact: contact });
            },

            getViolationParcels:  function (Id) {
                return GetViolationParcels.query({ Id: Id });
            },
            
            getViolationsByRelatedParcels: function (ParcelId) {
                return GetViolationRelatedParcels.query({ ParcelId: ParcelId });
            },

            saveViolationParcel: function (violationparcel) {
                return SaveViolationParcel.save({ ViolationParcel: violationparcel });
            },

            deleteViolationFile: function (projectId, subprojectId, itemId, file) {
                return DeleteViolationFile.save({ ProjectId: projectId, SubprojectId: subprojectId, ItemId: itemId, File: file });
            },

            getViolationFiles: function (ViolationId) {
                return GetViolationFiles.query({ ProjectId: EHS_PROJECTID, ViolationId: ViolationId });
            },

            saveViolationEvent: function (violationevent) {
                return SaveViolationEvent.save({ ViolationEvent: violationevent });
            },

            getViolationEvents:  function (Id) {
                return GetViolationEvents.query({ Id: Id });
            },

            saveViolationCode: function (violationcode) {
                return SaveViolationCode.save({ ViolationCode: violationcode });
            },

            getViolationCodes:  function (Id) {
                return GetViolationCodes.query({ Id: Id });
            },

            removeViolationParcel: function (violationparcel) {
                return RemoveViolationParcel.save({ ViolationParcel: violationparcel });
            },

            removeViolationContact: function (violationcontact) {
                return RemoveViolationContact.save({ ViolationContact: violationcontact });
            },
            
        };

        return service;

    }
]);


