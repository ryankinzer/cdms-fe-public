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
        query: { method: 'GET', params: { ProjectId: 'ProjectId', DatasetId: EHS_DATASETID, ViolationId: 'ViolationId'}, isArray: true }
    });
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
  
    function ($q,
        GetViolations,
        SaveViolation,
        GetViolationContacts,
        SaveViolationContact,
        GetViolationParcels,
        GetViolationRelatedParcels,
        SaveViolationParcel,
        DeleteViolationFile,
        GetViolationFiles
      
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
                return DeleteViolationFile.save({ ProjectId: projectId, DatasetId: EHS_DATASETID, SubprojectId: subprojectId, ItemId: itemId, File: file });
            },

            getViolationFiles: function (ViolationId) {
                return GetViolationFiles.query({ ProjectId: PERMIT_PROJECTID, DatasetId: EHS_DATASETID, ViolationId: ViolationId });
            },
        };

        return service;

    }
]);


