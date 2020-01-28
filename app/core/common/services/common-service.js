//CommonService includes:
//  Location (since locations exist in projects and dataset activities)
//  User
//  List things (the common ones like: waterbodies, sources, timezones, departments)
//  MetadataProperties (projects, datasets)

common_module.factory('GetMetadataPropertiesForEntity', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/v1/metadata/GetMetadataPropertiesForEntity');
}]);

common_module.factory('GetMetadataEntities',  ['$resource', function($resource){
        return $resource(serviceUrl+'/api/v1/metadata/GetMetadataEntities');
}]);

common_module.factory('GetMetadataProperty', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/metadata/GetMetadataProperty');
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

common_module.factory('GetAllUsers', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/getallusers', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

common_module.factory('SaveUser', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/saveuser');
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

common_module.factory('SaveFeedback', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/user/SaveFeedback');
}]);

common_module.factory('DeleteLookupItem', ['$resource', function ($resource) {
	return $resource(serviceUrl + '/api/v1/lookuptable/DeleteLookupItem');
}]);



common_module.service('CommonService', ['$q',
    'SaveDatasetMetadata',
    'GetMetadataFor',
    'GetWaterBodies',
    'GetSources',
    'GetTimeZones',
    'GetDepartments',
    'Users',
    'GetAllUsers',
    'SaveUser',
    'DeleteLocationAction',
    'GetAllPossibleDatastoreLocations',
    'GetLocationTypes',
    'SaveProjectLocation',
    'GetMetadataEntities',
    'SaveMetadataProperty',
    'DeleteMetadataProperty',
    'GetLookupItems',
    'SaveLookupTableItem',
    'GetMetadataPropertiesForEntity',
    'SaveFeedback',
	'GetMetadataProperty',  
	'DeleteLookupItem',
    function ($q,
        SaveDatasetMetadata,
        GetMetadataFor,
        GetWaterBodies,
        GetSources,
        GetTimeZones,
        GetDepartments,
        Users,
        GetAllUsers,
        SaveUser,
        DeleteLocationAction,
        GetAllPossibleDatastoreLocations,
        GetLocationTypes,
        SaveProjectLocation,
        GetMetadataEntities,
        SaveMetadataProperty,
        DeleteMetadataProperty,
        GetLookupItems,
        SaveLookupTableItem,
        GetMetadataPropertiesForEntity,
        SaveFeedback,
		GetMetadataProperty,
		DeleteLookupItem
) {

        var service = {

            datastoreId: null,
            metadataProperties: null,

            clearMetadataProperties: function () {
                service.metadataProperties = null;
            },

            getLocations: function (id) {
                service.datastoreId = id;
                return GetAllPossibleDatastoreLocations.query({ id: id });
            },

            getLocationTypes: function () {
                return GetLocationTypes.query();
            },

            getWaterBodies: function () {
                return GetWaterBodies.query();
            },

            getSources: function () {
                return GetSources.query();
            },

            deleteLocation: function (locationId) {
                return DeleteLocationAction.save({ LocationId: locationId });
            },

            //NB: not used anywhere
            getTimeZones: function () {
                return GetTimeZones.query();
            },

            getUsers: function () {
                return Users.query();
            },

            getAllUsers: function () {
                return GetAllUsers.query();
            },

            getDepartments: function () {
                return GetDepartments.query();
            },

            saveNewProjectLocation: function (projectId, location) {
                return SaveProjectLocation.save({ ProjectId: projectId, Location: location });
            },

            filterListForOnlyActiveInstruments: function (instruments) {
                var newInstrumentList = [];

                angular.forEach(instruments, function (instrument) {
                    if (instrument.StatusId === 0)
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
                        //console.log("item.Name = " + item.Name + ", instrument.Name = " + instrument.Name + ", item.SerialNumber = " + item.SerialNumber + ", instrument.SerialNumber = " + instrument.SerialNumber); 
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

            getMetadataProperty: function(id) {
                return GetMetadataProperty.query({ id: id });
            },

            getMetadataProperties: function (propertyTypeId) {
                return GetMetadataPropertiesForEntity.query({ id: propertyTypeId });
            },

            getMetadataEntities: function () {
                return GetMetadataEntities.query();
            },


            getMetadataFor: function (relationId, typeId) {
                return GetMetadataFor.save({ RelationId: relationId, EntityTypeId: typeId });
            },

            saveDatasetMetadata: function (datasetId, metadata, saveResults) {
                var payload = {
                    DatasetId: datasetId,
                    Metadata: metadata
                };

                return SaveDatasetMetadata.save(payload);

            },

            saveFeedback: function (feedback) { 
                return SaveFeedback.save({ Feedback: feedback });
            },

            saveUser: function (user) {
                return SaveUser.save({ User: user });
            },

            saveMetadataProperty: function (property) {
                return SaveMetadataProperty.save(property);
            },

            deleteMetadataProperty: function (property) {
                return DeleteMetadataProperty.save({ Id: property.Id });
            },

            getLookupItems: function (lookup) { 
                return GetLookupItems.query({ id: lookup.Id })
            },
    
            saveLookupTableItem: function (payload) {
                return SaveLookupTableItem.save(payload);
			},

			deleteLookupItem: function (item, lookupId) {
				console.log('deleteLookupItem');
				var payload = {
					ItemId: item.Id,
					LookupId: lookupId
				};
				return DeleteLookupItem.save({ payload });
			}

            
        };

        return service;
    }
]);
