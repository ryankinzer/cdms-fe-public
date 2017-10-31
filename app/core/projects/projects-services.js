//project factories and service

//includes fishermen and instrument services, too, since they are part of projects.


projects_module.factory('ProjectFunders', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/getprojectfunders', {}, {
        query: { method: 'GET', params: { id: 'projectId' }, isArray: true }
    });
}]);

projects_module.factory('ProjectCollaborators', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/getprojectcollaborators', {}, {
        query: { method: 'GET', params: { id: 'projectId' }, isArray: true }
    });
}]);

projects_module.factory('ProjectFiles', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/file/getprojectfiles', {}, {
        query: { method: 'GET', params: { id: 'projectId' }, isArray: true }
    });
}]);

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

projects_module.factory('GetDatastoreProjects', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getdatastoreprojects');
}]);

projects_module.factory('GetInstruments', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/instrument/getinstruments');
}]);

projects_module.factory('GetInstrumentTypes', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/instrument/getinstrumenttypes');
}]);

projects_module.factory('RemoveProjectInstrument', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/instrument/removeprojectinstrument');
}]);

projects_module.factory('GetFishermen', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/fishermen/getfishermen');
}]);

projects_module.factory('GetProjectFishermen', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/fishermen/getprojectfishermen');
}]);

projects_module.factory('RemoveProjectFisherman', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/fishermen/removeprojectfishermen');
}]);


/*
* define the service that can be used by any module in our application to work with projects.
*/
projects_module.service('ProjectService', ['$q', 'GetInstruments', 'SaveProjectLocation', 'GetAllInstruments',
    'SaveProjectInstrument', 'SaveInstrument', 'SaveInstrumentAccuracyCheck', 'GetInstrumentTypes',
    'RemoveProjectInstrument', 'SaveFisherman', 'GetFishermen', 'SaveProjectFisherman', 'GetProjectFishermen',
    'RemoveProjectFisherman', 'UpdateFile', 'DeleteFile', 'GetDatastoreProjects',
    'Project',
    'Projects',
    'ProjectDatasets',
    'SetProjectEditors',
    'SaveProject',
    'ProjectFunders',
    'ProjectCollaborators',
    'ProjectFiles',

    function ($q, GetInstruments, SaveProjectLocation, GetAllInstruments, SaveProjectInstrument, SaveInstrument, SaveInstrumentAccuracyCheck,
        GetInstrumentTypes, RemoveProjectInstrument, SaveFisherman, GetFishermen, SaveProjectFisherman, GetProjectFishermen, 
        RemoveProjectFisherman, UpdateFile, DeleteFile, GetDatastoreProjects, Project, Projects,
    ProjectDatasets, SetProjectEditors, SaveProject, ProjectFunders, ProjectCollaborators, ProjectFiles) {

        var service = {
            project: null,

            //we'd like to move this subproject stuff all out soon
            subproject: null,
            subprojects: null,
            subprojectType: null,

            clearProject: function () {
                service.project = null;
            },
            getDatastoreProjects: function (id) {
                return GetDatastoreProjects.query({ id: id });
            },
            getProjects: function () {
                return Projects.query();
            },
            getProjectDatasets: function (projectId) {
                this.getProject(projectId); //set our local project to the one selected
                return ProjectDatasets.query({ id: projectId });
            },
            getProjectFunders: function (projectId) {
                console.log("Inside getProjectFunders, projectId = " + projectId);
                this.getProject(projectId); //set our local project to the one selected
                return ProjectFunders.query({ id: projectId });
            },

            getProjectCollaborators: function (projectId) {
                console.log("Inside getProjectCollaborators...");
                this.getProject(projectId); //set our local project to the one selected
                return ProjectCollaborators.query({ id: projectId });
            },

            saveProject: function (project) {
                return SaveProject.save({ Project: project });
            },

            getProjectFiles: function (projectId) {
                console.log("Inside getProjectFiles...");
                console.log("projectId = " + projectId);
                return ProjectFiles.query({ id: projectId });
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

            getProject: function (id) {
                console.log("Inside services.js, getProject; id = " + id);
                //console.log("service is next...");
                //console.dir(service);
                //if(service.project && service.project.Id == id)
                if (service.project && service.project.Id == id && service.subprojectType !== "Habitat") // Not Habitat
                {
                    console.log("service.project.Id = " + service.project.Id);
                    return service.project;
                }

                service.project = Project.query({ id: id });

                service.project.$promise.then(function () {
                    //console.log("after-project-load!");
                    //do some sorting after we load for instruments
                    if (service.project.Instruments && service.project.Instruments.length > 0)
                        service.project.Instruments = service.project.Instruments.sort(orderByAlphaName);

                    //and also for locations
                    //service.project.Locations = service.project.Locations.sort(orderByAlpha);
                });

                return service.project;
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

            saveEditors: function (userId, projectId, editors, saveResults) {
                saveResults.saving = true;
                var payload = {
                    ProjectId: projectId,
                    Editors: editors,
                };

                SetProjectEditors.save(payload, function (data) {
                    saveResults.saving = false;
                    saveResults.success = true;
                }, function (data) {
                    saveResults.saving = false;
                    saveResults.failure = true;
                });

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
            },

            //these are subproject functions we'd like to move out
            setServiceSubprojectType: function (spType) {
                console.log("Inside setServiceSubprojectType, spType = " + spType);
                service.subprojectType = spType;
                console.log("service.subprojectType = " + service.subprojectType);
            },

            
        };

        return service;
    }
]);