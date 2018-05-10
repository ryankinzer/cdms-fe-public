//CommonService includes:
//  Location (since locations exist in projects and dataset activities)
//  User
//  List things (the common ones like: waterbodies, sources, timezones, departments)
//  MetadataProperties (projects, datasets)

common_module.factory('GetMetadataProperties', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/v1/metadata/getmetadataproperties');
}]);

common_module.factory('SaveDatasetMetadata', ['$resource', function($resource){
    return $resource(serviceUrl +'/api/v1/metadata/setdatasetmetadata');
}]);

// NB: why a POST?
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

common_module.service('CommonService', ['$q',
    'GetMetadataProperties',
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
    function ($q,
        GetMetadataProperties,
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
        SaveProjectLocation) {

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
            
            
			// We don't really like to set things this way...  Is there a better way?
			getDatasetLocationType: function(aDatastoreName)
			{
				//console.log("Inside services.js, getDatasetLocationType...");
				//console.log("aDatastoreName = " + aDatastoreName);
				// The settings for these are in the config.js file.
				var theLocationType = 0;
                if (aDatastoreName === "AdultWeir") {
                    console.log("This dataset is for Adult Weir...");
                    theLocationType = LOCATION_TYPE_AdultWeir;
                }
                else if (aDatastoreName === "BSample") {
                    console.log("This dataset is for Water Temperature...");
                    theLocationType = LOCATION_TYPE_BSample;
                }
                else if (aDatastoreName === "WaterTemp") {
                    console.log("This dataset is for Water Temperature...");
                    theLocationType = LOCATION_TYPE_WaterTemp;
                }
                else if (aDatastoreName === "SpawningGroundSurvey") {
                    console.log("This dataset is for Spawning Ground Survey...");
                    theLocationType = LOCATION_TYPE_SpawningGroundSurvey;
                }
                else if (aDatastoreName === "CreelSurvey") {
                    console.log("This dataset is for Creel Survey...");
                    theLocationType = LOCATION_TYPE_CreelSurvey;
                }
                else if (aDatastoreName === "Electrofishing") {
                    console.log("This dataset is for Electrofishing...");
                    theLocationType = LOCATION_TYPE_Electrofishing;
                }
                else if (aDatastoreName === "SnorkelFish") {
                    console.log("This dataset is for Snorkel Fish...");
                    theLocationType = LOCATION_TYPE_SnorkelFish;
                }
                else if (aDatastoreName === "ScrewTrap") {
                    console.log("This dataset is for Screw Trap...");
                    theLocationType = LOCATION_TYPE_ScrewTrap;
                }
                else if (aDatastoreName === "FishScales") {
                    console.log("This dataset is for Fish Scales...");
                    theLocationType = LOCATION_TYPE_FishScales;
                }
                else if (aDatastoreName === "WaterQuality") {
                    console.log("This dataset is for Water Quality with Labs...");
                    theLocationType = LOCATION_TYPE_WaterQuality;
                }
                else if (aDatastoreName === "StreamNet_RperS") {
                    console.log("This dataset is for StreamNet_RperS...");
                    theLocationType = LOCATION_TYPE_StreamNet_NOSA;
                }
                else if (aDatastoreName === "StreamNet_NOSA") {
                    console.log("This dataset is for StreamNet_NOSA...");
                    theLocationType = LOCATION_TYPE_StreamNet_NOSA;
                }
                else if (aDatastoreName === "StreamNet_SAR") {
                    console.log("This dataset is for StreamNet_SAR...");
                    theLocationType = LOCATION_TYPE_StreamNet_SAR;
                }
                else if (aDatastoreName === "ArtificialProduction") {
                    console.log("This dataset is for ArtificialProduction...");
                    theLocationType = LOCATION_TYPE_ArtificialProduction;
                }
                else if (aDatastoreName === "Metrics") {
                    console.log("This dataset is for Metrics...");
                    theLocationType = LOCATION_TYPE_Metrics;
                }
                else if (aDatastoreName === "JvRearing") {
                    console.log("This dataset is for JvRearing...");
                    theLocationType = LOCATION_TYPE_JvRearing;
                }
                else if (aDatastoreName === "Genetic") {
                    console.log("This dataset is for Genetic...");
                    theLocationType = LOCATION_TYPE_Genetic;
                }
                else if (aDatastoreName === "Benthic") {
                    console.log("This dataset is for Benthic...");
                    theLocationType = LOCATION_TYPE_Benthic;
                }
                else if (aDatastoreName === "Drift") {
                    console.log("This dataset is for Drift...");
                    theLocationType = LOCATION_TYPE_Drift;
                }
                else if (aDatastoreName === "FishTransport") {
                    console.log("FishTransport");
                    theLocationType = LOCATION_TYPE_FishTransport;
                }

				return theLocationType;
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

            getMetadataFor: function (projectId, typeId) {
                return GetMetadataFor.save({ ProjectId: projectId, EntityTypeId: typeId });
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

            saveUser: function (user) {
                return SaveUser.save({ User: user });
            },

        };

        service.getMetadataProperty(1); //cause our metadata properties to be loaded early.

        return service;
    }
]);
