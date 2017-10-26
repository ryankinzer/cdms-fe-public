//NOTE: this is the direction we're going but this isn't quite finished yet (and not being loaded...)

//defines the services (as ngResources) for the project module.

//includes fishermen and instrument services, too, since they are part of projects.

//var projects_module = angular.module('ProjectServices', ['ngResource']);

projects_module.factory('Projects', ['$resource', function (resource) {
    return resource(serviceUrl + '/api/v1/project/getprojects', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

projects_module.factory('Project', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/project/getproject', {}, {
        query: { method: 'GET', params: { id: 'id' }, isArray: false }
    });
}]);

projects_module.factory('ProjectDatasets', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/project/getprojectdatasets', {}, {
        query: { method: 'GET', params: { id: 'projectId' }, isArray: true }
    });
}]);

projects_module.factory('SetProjectEditors', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/project/setprojecteditors');
}]);

projects_module.factory('SaveProject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/project/saveproject');
}]);


projects_module.factory('SaveProjectLocation', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/location/saveprojectlocation');
}]);

projects_module.factory('GetAllInstruments', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/instrument/getinstruments');
}]);

projects_module.factory('SaveProjectInstrument', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/instrument/saveprojectinstrument');
}]);

projects_module.factory('SaveProjectFisherman', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/fishermen/saveprojectfishermen');
}]);

projects_module.factory('SaveInstrument', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/instrument/saveinstrument');
}]);

projects_module.factory('SaveInstrumentAccuracyCheck', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/instrument/saveinstrumentaccuracycheck');
}]);

projects_module.factory('SaveFisherman', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/fishermen/savefishermen');
}]);

projects_module.factory('UpdateFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/file/updatefile');
}]);

projects_module.factory('DeleteFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/file/deletefile');
}]);


/*
* define the service that can be used by any module in our application to work with projects.
*/
projects_module.service('ProjectService', ['$q', 'GetInstruments', 'SaveProjectLocation', 'GetAllInstruments',
    'SaveProjectInstrument', 'SaveInstrument', 'SaveInstrumentAccuracyCheck', 'GetInstrumentTypes',
    'RemoveProjectInstrument', 'SaveFisherman', 'GetFishermen', 'SaveProjectFisherman', 'GetProjectFishermen',
    'RemoveProjectFisherman', 'UpdateFile', 'DeleteFile',
    function ($q, GetInstruments, SaveProjectLocation, GetAllInstruments, SaveProjectInstrument, SaveInstrument, SaveInstrumentAccuracyCheck,
        GetInstrumentTypes, RemoveProjectInstrument, SaveFisherman, GetFishermen, SaveProjectFisherman, GetProjectFishermen, 
        RemoveProjectFisherman, UpdateFile, DeleteFile) {

        var service = {

            getProjects: function (id) {
                return GetDatastoreProjects.query({ id: id });
            },
            getInstruments: function () {
                return GetInstruments.query();
            },
            getInstrumentTypes: function () {
                return GetInstrumentTypes.query();
            },
            getFishermen: function () {
                return GetFishermen.query();
            },
            
            // We don't really like to set things this way...  Is there a better way?
            getProjectType: function (aProjectId) {
                var theType = null;

                if (aProjectId === 2247) 			// CRPP
                {
                    theType = "CRPP";
                }
                else if ((aProjectId === 1202) || // Walla Walla
                    (aProjectId === 1223) || 		// First HabSubproject, Umatilla
                    (aProjectId === 2223) || 		// NF John Day
                    (aProjectId === 2226) ||		// Rainwater
                    (aProjectId === 2228) ||		// Grande Ronde
                    (aProjectId === 2229) ||		// Tucannon
                    (aProjectId === 10029) ||		// Touchet
                    (aProjectId === 2249)			// Biomonitoring of Fish Enhancement
                ) {
                    theType = "Habitat";
                }
                else if (aProjectId === 1217)
                    theType = "Harvest";
                else if (aProjectId === 2246)
                    theType = "DECD";

                return theType;
            },
            saveNewProjectLocation: function (projectId, location) {
                return SaveProjectLocation.save({ ProjectId: projectId, Location: location });
            },
            getAllInstruments: function () {
                return GetAllInstruments.query();
            },
            saveInstrument: function (projectId, instrument) {
                return SaveInstrument.save({ ProjectId: projectId, Instrument: instrument }); //will connect to this project if creating instrument
            },
            saveFisherman: function (projectId, fisherman, saveResults) {
                console.log("Inside saveFisherman...");
                saveResults.saving = true;
                console.log("saveResults.saving = " + saveResults.saving);

                return SaveFisherman.save({ ProjectId: projectId, Fisherman: fisherman });
            },
            saveProjectInstrument: function (projectId, instrument) {
                return SaveProjectInstrument.save({ ProjectId: projectId, Instrument: instrument });
            },
            saveProjectFisherman: function (projectId, fisherman) {
                return SaveProjectFisherman.save({ ProjectId: projectId, Fisherman: fisherman });
            },
            removeProjectFisherman: function (projectId, fishermanId) {
                return RemoveProjectFisherman.save({ ProjectId: projectId, FishermanId: fishermanId });
            },
            removeProjectInstrument: function (projectId, instrumentId) {
                return RemoveProjectInstrument.save({ ProjectId: projectId, InstrumentId: instrumentId });
            },
            getProjectFishermen: function (projectId) {
                console.log("Inside getProjectFishermen, projectId = " + projectId);
                return GetProjectFishermen.query({ id: projectId });
            },
            saveInstrumentAccuracyCheck: function (instrumentId, ac) {
                return SaveInstrumentAccuracyCheck.save({ InstrumentId: instrumentId, AccuracyCheck: ac });
            },
            updateFile: function (projectId, file) {
                return UpdateFile.save({ ProjectId: projectId, File: file });
            },
            deleteFile: function (projectId, file) {
                console.log("Inside DatastoreService, deleteFile");
                console.log("ProjectId = " + projectId + ", attempting to delete file...");
                console.dir(file);
                return DeleteFile.save({ ProjectId: projectId, File: file });
            }
        };

        return service;
    }
]);