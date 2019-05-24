//Leasing api

leasing_module.factory('AllLeases', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/allleases', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);


leasing_module.factory('ActiveLeases', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/activeleases', {}, {
        query: { method: 'GET', params: { }, isArray: true }
    });
}]);

leasing_module.factory('PendingLeases', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/pendingleases', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);


leasing_module.factory('AvailableFields', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/availablefields', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

leasing_module.factory('AvailableAllotments', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/availableallotments', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);


leasing_module.factory('GetLease', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/getlease', {}, {
        query: { method: 'GET', params: { id: 'id'}, isArray: false }
    });
}]);

leasing_module.factory('GetLeasesByField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/GetLeasesByField', {}, {
        query: { method: 'GET', params: { id: 'id'}, isArray: true }
    });
}]);


leasing_module.factory('GetOperators', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/getoperators', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

leasing_module.factory('DeleteOperator', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/deleteoperator');
}]);


leasing_module.factory('SaveLease', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/savelease');
}]);

leasing_module.factory('SaveCropPlan', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/savecropplan');
}]);

leasing_module.factory('SaveInspection', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/SaveInspection');
}]);

leasing_module.factory('SaveProduction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/SaveProduction');
}]);

leasing_module.factory('GetLeaseRevisions', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/GetLeaseRevisions', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

leasing_module.factory('GetCropPlanRevisions', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/GetCropPlanRevisions', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

leasing_module.factory('GetInspectionViolations', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/GetInspectionViolations', {}, {
        query: { method: 'POST', params: {}, isArray: true }
    });
}]);

leasing_module.factory('SaveInspectionViolation', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/SaveInspectionViolation');
}]);

leasing_module.factory('SaveOperator', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/SaveOperator');
}]);

leasing_module.factory('GetLookups', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/metadata/GetPropertiesForEntity', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

leasing_module.factory('PutMetadataProperty', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/metadata/PutMetadataProperty', {}, {
        update: { method: 'PUT' }
    });
}]);

leasing_module.factory('GetMetadataProperty', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/metadata/GetMetadataProperty', {}, {
        query: { method: 'GET', params: {}, isArray: false }
    });
}]);

leasing_module.factory('ExpireLeases', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lease/ExpireLeases', {}, {
        query: { method: 'GET', params: {}, isArray: false }
    });
}]);




leasing_module.service('LeasingService', ['$q',
    'ActiveLeases',
    'GetLease',
    'PendingLeases',
    'AvailableFields',
    'GetOperators',
    'SaveLease',
    'SaveCropPlan',
    'SaveInspection',
    'SaveProduction',
    'GetLeaseRevisions',
    'GetInspectionViolations',
    'SaveInspectionViolation',
    'AllLeases',
    'SaveOperator',
    'GetLookups',
    'PutMetadataProperty',
    'GetMetadataProperty',
    'GetCropPlanRevisions',
    'ExpireLeases',
    'AvailableAllotments',
    'GetLeasesByField',
    'DeleteOperator',
    function ($q,
        ActiveLeases,
        GetLease,
        PendingLeases,
        AvailableFields,
        GetOperators,
        SaveLease,
        SaveCropPlan,
        SaveInspection,
        SaveProduction,
        GetLeaseRevisions,
        GetInspectionViolations,
        SaveInspectionViolation,
        AllLeases,
        SaveOperator,
        GetLookups,
        PutMetadataProperty,
        GetMetadataProperty,
        GetCropPlanRevisions,
        ExpireLeases,
        AvailableAllotments,
        GetLeasesByField,
        DeleteOperator
    ) {
        var service = {

            getAllLeases: function () {
                return AllLeases.query();
            },
            
            getActiveLeases: function () {
                return ActiveLeases.query();
            },

            getLease: function (id) {
                return GetLease.query({ id: id });
            },

            getLeasesByField: function (id) {    
                return GetLeasesByField.query({ id: id });
            },

            getPendingLeases: function () {
                return PendingLeases.query();
            },

            getAvailableFields: function () {
                return AvailableFields.query();
            },

            getAvailableAllotments: function () {
                return AvailableAllotments.query();
            },

            getOperators: function () {
                return GetOperators.query();
            },

            saveLease: function (lease, cropshareremove) {
                var cropshares = lease.LeaseCropShares;
                delete lease.LeaseCropShares;
                return SaveLease.save({ Lease: lease, LeaseCropShares: cropshares, CropShareRemove: cropshareremove });
            },

            saveCropPlan: function (lease, plan) {
                return SaveCropPlan.save({ Lease: lease, CropPlan: plan });
            },

            saveInspection: function (inspection) {
                return SaveInspection.save({ Inspection: inspection });
            },

            expireLeases: function () {
                return ExpireLeases.query();
            },

            saveProduction: function (production) {
                return SaveProduction.save({ Production: production});
            },

            getLeaseRevisions: function (id) {
                return GetLeaseRevisions.query({ id: id });
            },

            getLeaseCropPlanRevisions: function (id) {
                return GetCropPlanRevisions.query({ id: id });
            },

            getInspectionViolations: function (params) {
                return GetInspectionViolations.query({ QueryParams: params });
            },

            saveInspectionViolation: function (inspectionviolation) {
                return SaveInspectionViolation.save({ Inspection: inspectionviolation });
            },

            saveOperator: function (operator) {
                return SaveOperator.save({ LeaseOperator: operator });
            },

            deleteOperator: function (operator) {
                console.dir(operator);
                return DeleteOperator.query({ Id: operator.Id });
            },

            getLookupLists: function () {
                var lists = GetLookups.query({ Id: METADATA_ENTITY_LEASING });
                lists.$promise.then(function () {
                    lists.forEach(function (lookup_list) {
                        lookup_list.ListValues = JSON.parse(lookup_list.PossibleValues);
                    });
                })
                return lists;
            },

            getLeasingSystemValues: function () { 
                return GetLookups.query({ Id: METADATA_ENTITY_LEASING_SYSTEM });
            },

            getLookupValues: function(property_id){
                var property = GetMetadataProperty.query({ id: property_id });
                property.$promise.then(function () {
                    property.ListValues = JSON.parse(property.PossibleValues);                  
                });
                return property;
            },

            saveLookupList: function (metadata) {
                return PutMetadataProperty.update({ Id: metadata.Id }, metadata);
            }
            

        };

        return service;

    }
]);


