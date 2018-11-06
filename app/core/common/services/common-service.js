//CommonService includes:
//  Location (since locations exist in projects and dataset activities)
//  User
//  List things (the common ones like: waterbodies, sources, timezones, departments)
//  MetadataProperties (projects, datasets)

common_module.factory('GetMetadataProperties', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/v1/metadata/getmetadataproperties');
}]);

common_module.factory('GetMetadataEntities',  ['$resource', function($resource){
        return $resource(serviceUrl+'/api/v1/metadata/GetMetadataEntities');
}]);

common_module.factory('GetProjectLookupTables', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lookuptable/forproject', {}, {
        query: { method: 'GET', isArray: true }
    });
}]);

common_module.factory('GetLookupItems', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lookuptable/getitems', {}, {
        query: { method: 'GET', isArray: true }
    });
}]);

common_module.factory('SaveLookupTableItem', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/lookuptable/saveitem');
}]);

common_module.factory('SaveMetadataProperty', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/metadata/SaveMetadataProperty');
}]);

common_module.factory('DeleteMetadataProperty', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/metadata/DeleteMetadataProperty');
}]);


common_module.factory('SaveDatasetMetadata', ['$resource', function($resource){
    return $resource(serviceUrl +'/api/v1/metadata/setdatasetmetadata');
}]);

common_module.factory('GetMetadataFor',['$resource', function($resource){
    return $resource(serviceUrl +'/api/v1/metadata/getmetadatafor', {}, {
           save: {method: 'POST', isArray: true}
        });
}]);

common_module.factory('GetWaterBodies', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/v1/list/getwaterbodies');
}]);

common_module.factory('GetSources', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getsources');
}]);

common_module.factory('GetTimeZones', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/v1/list/gettimezones');
}]);

common_module.factory('GetDepartments', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/v1/department/getdepartments');
}]);

common_module.factory('Users', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getusers', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

common_module.factory('SaveProjectLocation', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/location/saveprojectlocation');
}]);

common_module.factory('DeleteLocationAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/location/deletelocation');
}]);

common_module.factory('GetAllPossibleDatastoreLocations', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getdatastorelocations');
}]);

common_module.factory('GetLocationTypes', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/location/getlocationtypes');
}]);

common_module.service('CommonService', ['$q',
    'GetMetadataProperties',
    'SaveDatasetMetadata',
    'GetMetadataFor',
    'GetWaterBodies',
    'GetSources',
    'GetTimeZones',
    'GetDepartments',
    'Users',
    'DeleteLocationAction',
    'GetAllPossibleDatastoreLocations',
    'GetLocationTypes',
    'SaveProjectLocation',
    'GetMetadataEntities',
    'SaveMetadataProperty',
    'DeleteMetadataProperty',
    'GetProjectLookupTables',
    'GetLookupItems',
    'SaveLookupTableItem',
    function ($q,
        GetMetadataProperties,
        SaveDatasetMetadata,
        GetMetadataFor,
        GetWaterBodies,
        GetSources,
        GetTimeZones,
        GetDepartments,
        Users,
        DeleteLocationAction,
        GetAllPossibleDatastoreLocations,
        GetLocationTypes,
        SaveProjectLocation,
        GetMetadataEntities,
        SaveMetadataProperty,
        DeleteMetadataProperty,
        GetProjectLookupTables,
        GetLookupItems,
        SaveLookupTableItem) {

        var service = {

            datastoreId: null,
            metadataProperties: null,

            clearMetadataProperties: function () {
                service.metadataProperties = null;
            },

            getLocations: function(id)
            {
                service.datastoreId = id;
                return GetAllPossibleDatastoreLocations.query({id: id});
            },

            getLocationTypes: function () {
                return GetLocationTypes.query();
            },
            
            getWaterBodies: function()
            {
                return GetWaterBodies.query();
            },

            getSources: function ()
            {
                return GetSources.query();
            },
            
            deleteLocation: function(locationId)
            {
                return DeleteLocationAction.save({LocationId: locationId});
            },

            //NB: not used anywhere
            getTimeZones: function ()
            {
                return GetTimeZones.query();
            }, 

            getUsers: function () {
                return Users.query();
            },

            getDepartments: function () {
                return GetDepartments.query();
            },

            saveNewProjectLocation: function (projectId, location) {
                return SaveProjectLocation.save({ ProjectId: projectId, Location: location });
            },

            filterListForOnlyActiveInstruments: function (instruments) {
                var newInstrumentList = [];

                angular.forEach(instruments, function(instrument){
                    if(instrument.StatusId === 0) 
                        newInstrumentList.push(instrument);
                });

                return newInstrumentList;
            },

            checkForDuplicateInstrument: function (instrumentList, instrument) {
                var blnInstrumentExists = false;
                var blnKeepGoing = true;

                angular.forEach(instrumentList, function (item) {
                    // Have we found a match yet? If so, we do not need to check the rest of the items.
                    if (blnKeepGoing) {
                        if ((item.Name === instrument.Name) && (item.SerialNumber === instrument.SerialNumber)) {
                            blnInstrumentExists = true;
                            blnKeepGoing = false;
                        }
                    }
                });

                return blnInstrumentExists;
            },

            getAllInstruments: function () {
                return GetAllInstruments.query();
            },

            getMetadataProperty: function (propertyId) {

                if (!service.metadataProperties) {
                    this._loadMetadataProperties().$promise.then(function () {
                        return service.metadataProperties["ID_" + propertyId];
                    });
                }
                else {
                    return service.metadataProperties["ID_" + propertyId];
                }
            },

            getMetadataProperties: function (propertyTypeId) {

    
                var properties = $q.defer();

                if (!service.metadataProperties) {
                    this._loadMetadataProperties().$promise.then(function () {
                        properties.resolve(getMatchingByField(service.metadataProperties, propertyTypeId, 'MetadataEntityId'));
                    });
                } else {
                    properties.resolve(getMatchingByField(service.metadataProperties, propertyTypeId, 'MetadataEntityId'));
                }

                return properties;

            },

            getMetadataEntities: function () { 
                return GetMetadataEntities.query();
            },


            getMetadataFor: function (relationId, typeId) {
                return GetMetadataFor.save({ RelationId: relationId, EntityTypeId: typeId });
            },

            //returns promise so you can carry on once it loads.
            _loadMetadataProperties: function () {
                return GetMetadataProperties.query(function (data) {
                    service.metadataProperties = {};
                    angular.forEach(data, function (value, key) {
                        service.metadataProperties["ID_" + value.Id] = value;
                    });
                });

            },

            saveDatasetMetadata: function (datasetId, metadata, saveResults) {
                var payload = {
                    DatasetId: datasetId,
                    Metadata: metadata
                };

                return SaveDatasetMetadata.save(payload);

            },

            saveMetadataProperty: function (property) {
                return SaveMetadataProperty.save(property);
            },

            deleteMetadataProperty: function (property) {
                return DeleteMetadataProperty.save({ Id: property.Id });
            },

            getProjectLookupTables: function (id) { 
                return GetProjectLookupTables.query({ id: id });        
            },

            getLookupItems: function (lookup) { 
                return GetLookupItems.query({ id: lookup.Id })
            },
    
            saveLookupTableItem: function (payload) {
                return SaveLookupTableItem.save(payload);
            }




        };

        service.getMetadataProperty(1); //cause our metadata properties to be loaded early.

        return service;
    }
]);
