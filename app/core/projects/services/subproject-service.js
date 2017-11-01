//subproject (crpp + habitat) factories and service

project_module.factory('MigrationYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getmigrationyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

project_module.factory('RunYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getrunyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

project_module.factory('ReportYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getreportyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

project_module.factory('SpawningYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/getspawningyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

project_module.factory('BroodYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getbroodyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

project_module.factory('OutmigrationYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/getoutmigrationyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

project_module.factory('ProjectSubprojects', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/gethabsubprojects', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

project_module.factory('SubprojectFiles', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/getcrppsubprojectfiles', {}, {
        query: { method: 'GET', params: { id: 'projectId' }, isArray: true }
    });
}]);

project_module.factory('SaveCorrespondenceEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/savecorrespondenceevent');
}]);

project_module.factory('SaveHabitatItem', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/savehabitatitem');
}]);

project_module.factory('DeleteCorresEventFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/deletecorreseventfile');
}]);

project_module.factory('DeleteHabitatItemFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/deletehabitatitemfile');
}]);

project_module.factory('DeleteHabSubprojectFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/deletehabsubprojectfile');
}]);

project_module.factory('SaveSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/savecrppsubproject');
}]);

project_module.factory('SaveHabSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/savehabsubproject');
}]);

project_module.factory('GetSubprojects', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/getcrppsubprojects');
}]);

//NB: does this need an ID parameter? -- actually it isn't used anywhere...
project_module.factory('GetHabSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/gethabsubproject');
}]);

project_module.factory('GetHabSubprojects', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/gethabsubprojects');
}]);

project_module.factory('RemoveSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/removecrppsubproject');
}]);

project_module.factory('RemoveHabSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/removehabsubproject');
}]);

project_module.factory('RemoveCorrespondenceEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/removecorrespondenceevent');
}]);

project_module.factory('RemoveHabitatItem', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/removehabitatitem');
}]);

/*
* subprojects service (includes Project factory which is defined in projects-service.js)
*/
projects_module.service('SubProjectService', ['$q', 
    'MigrationYears',
    'RunYears',
    'ReportYears',
    'SpawningYears',
    'BroodYears',
    'OutmigrationYears',
    'ProjectSubprojects',
    'SubprojectFiles',
    'SaveCorrespondenceEvent',
    'SaveHabitatItem',
    'DeleteCorresEventFile',
    'DeleteHabitatItemFile',
    'DeleteHabSubprojectFile',
    'SaveSubproject',
    'SaveHabSubproject',
    'GetSubprojects',
    'GetHabSubproject',
    'GetHabSubprojects',
    'RemoveSubproject',
    'RemoveHabSubproject',
    'RemoveCorrespondenceEvent',
    'RemoveHabitatItem',
    'Project',                      //from projects-service factory definition

    function ($q,
        MigrationYears,
        RunYears,
        ReportYears,
        SpawningYears,
        BroodYears,
        OutmigrationYears,
        ProjectSubprojects,
        SubprojectFiles,
        SaveCorrespondenceEvent,
        SaveHabitatItem,
        DeleteCorresEventFile,
        DeleteHabitatItemFile,
        DeleteHabSubprojectFile,
        SaveSubproject,
        SaveHabSubproject,
        GetSubprojects,
        GetHabSubproject,
        GetHabSubprojects,
        RemoveSubproject,
        RemoveHabSubproject,
        RemoveCorrespondenceEvent,
        RemoveHabitatItem,
        Project) {

        var service = {
            project: null,

            //we'd like to move this subproject stuff all out soon
            subproject: null,
            subprojects: null,
            subprojectType: null,

            clearProject: function () {
                service.project = null;
            },

            clearSubproject: function () {
                service.subproject = null;
            },

            clearSubprojects: function () {
                service.subprojects = null;
            },

            getSubproject: function (id) {
                console.log("Inside services.js, getSubproject...");
                if (service.subproject && service.subproject.Id == id)
                    return service.subproject;
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
            
            setServiceSubprojectType: function (spType) {
                console.log("Inside setServiceSubprojectType, spType = " + spType);
                service.subprojectType = spType;
                console.log("service.subprojectType = " + service.subprojectType);
            },

            getSubprojects: function () {
                return GetSubprojects.query();
            },

            getHabSubprojects: function ()
            //getHabSubprojects: function(id)
            {
                console.log("Inside services, getHabSubprojects");
                //console.log("id = " + id);
                return GetHabSubprojects.query();
                //return GetHabSubprojects.query({id: id});
            },

            saveSubproject: function (projectId, subproject, saveResults) {
                console.log("Inside saveSubproject...");
                saveResults.saving = true;
                console.log("saveResults.saving = " + saveResults.saving);

                return SaveSubproject.save({ ProjectId: projectId, Subproject: subproject });
            },
            saveHabSubproject: function (projectId, subproject, saveResults) {
                console.log("Inside services.js, saveHabSubproject...");
                saveResults.saving = true;
                console.log("saveResults.saving = " + saveResults.saving);

                return SaveHabSubproject.save({ ProjectId: projectId, Subproject: subproject });
            },
            removeSubproject: function (projectId, subprojectId) {
                return RemoveSubproject.save({ ProjectId: projectId, SubprojectId: subprojectId });
            },
            //removeHabSubproject: function(projectId, subprojectId){
            removeHabSubproject: function (projectId, subprojectId, locationId) {
                //return RemoveHabSubproject.save({ProjectId: projectId, SubprojectId: subprojectId});
                return RemoveHabSubproject.save({ ProjectId: projectId, SubprojectId: subprojectId, LocationId: locationId });
            },
            //removeCorrespondenceEvent: function(projectId, subprojectId, correspondenceEventId){
            removeCorrespondenceEvent: function (projectId, subprojectId, correspondenceEventId, datastoreTablePrefix) {
                console.log("Inside removeCorrespondenceEvent...");
                console.log("projectId = " + projectId + ", subprojectId = " + subprojectId + ", correspondenceEventId = " + correspondenceEventId + ", datastoreTablePrefix = " + datastoreTablePrefix);
                //return RemoveCorrespondenceEvent.save({ProjectId: projectId, SubprojectId: subprojectId, CorrespondenceEventId: correspondenceEventId});
                return RemoveCorrespondenceEvent.save({ ProjectId: projectId, SubprojectId: subprojectId, CorrespondenceEventId: correspondenceEventId, DatastoreTablePrefix: datastoreTablePrefix });
            },
            removeHabitatItem: function (projectId, subprojectId, habitatItemId, datastoreTablePrefix) {
                console.log("Inside removeHabitatItem...");
                console.log("projectId = " + projectId + ", subprojectId = " + subprojectId + ", habitatItemId = " + habitatItemId + ", datastoreTablePrefix = " + datastoreTablePrefix);
                return RemoveHabitatItem.save({ ProjectId: projectId, SubprojectId: subprojectId, HabitatItemId: habitatItemId, DatastoreTablePrefix: datastoreTablePrefix });
            },
            saveCorrespondenceEvent: function (projectId, subprojectId, ce) {
                console.log("Inside saveCorrespondenceEvent...")
                console.log("projectId = " + projectId);
                console.log("subprojectId = " + subprojectId);
                console.log("ce is next...");
                console.dir(ce);
                return SaveCorrespondenceEvent.save({ ProjectId: projectId, SubprojectId: subprojectId, CorrespondenceEvent: ce });
            },
            saveHabitatItem: function (projectId, subprojectId, hi) {
                console.log("Inside saveHabitatItem...")
                console.log("projectId = " + projectId);
                console.log("subprojectId = " + subprojectId);
                console.log("hi is next...");
                console.dir(hi);
                return SaveHabitatItem.save({ ProjectId: projectId, SubprojectId: subprojectId, HabitatItem: hi });
            },
            deleteCorresEventFile: function (projectId, subprojectId, ceId, file) {
                console.log("Inside DatastoreService, deleteCorresEventFile");
                console.log("SubprojectId = " + subprojectId + ", ceId = " + ceId + " attempting to delete file...");
                console.dir(file);
                //return DeleteFile.save({ProjectId: projectId, File: file});
                return DeleteCorresEventFile.save({ ProjectId: projectId, SubprojectId: subprojectId, CeId: ceId, File: file });
            },
            deleteHabitatItemFile: function (projectId, subprojectId, hiId, file) {
                console.log("Inside DatastoreService, deleteHabitatItemFile");
                console.log("ProjectId = " + projectId + ", SubprojectId = " + subprojectId + ", hiId = " + hiId + " attempting to delete file...");
                console.dir(file);
                //return DeleteFile.save({ProjectId: projectId, File: file});
                return DeleteHabitatItemFile.save({ ProjectId: projectId, SubprojectId: subprojectId, HiId: hiId, File: file });
            },
            deleteHabSubprojectFile: function (projectId, subprojectId, file) {
                console.log("Inside DatastoreService, deleteHabSubprojectFile");
                console.log("SubprojectId = " + subprojectId + ", attempting to delete file...");
                console.dir(file);
                return DeleteHabSubprojectFile.save({ ProjectId: projectId, SubprojectId: subprojectId, File: file });
            },
            getMigrationYears: function (datasetId) {
                console.log("Inside services, getMigrationYears");
                return MigrationYears.query({ id: datasetId });
            },

            getRunYears: function (datasetId) {
                console.log("Inside services, getRunYears");
                return RunYears.query({ id: datasetId });
            },

            getReportYears: function (datasetId) {
                console.log("Inside services, getReportYears");
                return ReportYears.query({ id: datasetId });
            },

            getSpawningYears: function (datasetId) {
                console.log("Inside services, getSpawningYears");
                return SpawningYears.query({ id: datasetId });
            },

            getBroodYears: function (datasetId) {
                console.log("Inside services, getBroodYears");
                return BroodYears.query({ id: datasetId });
            },

            getOutmigrationYears: function (datasetId) {
                console.log("Inside services, getOutmigrationYears");
                return OutmigrationYears.query({ id: datasetId });
            },


            getSubprojectFiles: function (projectId) {
                console.log("Inside getSubprojectFiles...");
                console.log("projectId = " + projectId);
                this.getProject(projectId); //set our local project to the one selected
                return SubprojectFiles.query({ id: projectId });
            },


            //NB: why is this .save()? -- to get a POST instead of a GET?
            getProjectSubprojects: function (projectId) {
                console.log("Inside getProjectSubprojects, projectId = " + projectId);
                //this.getProject(projectId); //set our local project to the one selected
                return ProjectSubprojects.save({ ProjectId: projectId });
            },


        };

        return service;
    }
]);


