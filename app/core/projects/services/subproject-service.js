//subproject (crpp + habitat) factories and service

//NB: this is not the final form - we want to create an actual
//    subproject feature in the system and refactor this

projects_module.factory('MigrationYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getmigrationyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

projects_module.factory('RunYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getrunyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

projects_module.factory('ReportYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getreportyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

projects_module.factory('SpawningYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getspawningyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

projects_module.factory('BroodYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getbroodyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

projects_module.factory('OutmigrationYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getoutmigrationyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

projects_module.factory('ProjectSubprojects', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/gethabsubprojects', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

projects_module.factory('SubprojectFiles', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/getcrppsubprojectfiles', {}, {
        query: { method: 'GET', params: { id: 'projectId' }, isArray: true }
    });
}]);

projects_module.factory('SaveCorrespondenceEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/savecorrespondenceevent');
}]);

projects_module.factory('SaveHabitatItem', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/savehabitatitem');
}]);

projects_module.factory('DeleteCorresEventFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/deletecorreseventfile');
}]);

projects_module.factory('DeleteHabitatItemFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/deletehabitatitemfile');
}]);

projects_module.factory('DeleteHabSubprojectFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/deletehabsubprojectfile');
}]);

projects_module.factory('SaveSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/savecrppsubproject');
}]);

projects_module.factory('SaveCrppSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/savecrppsubproject');
}]);

projects_module.factory('SaveHabSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/savehabsubproject');
}]);

projects_module.factory('GetSubprojects', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/getcrppsubprojects');
}]);

//NB: does this need an ID parameter? -- actually it isn't used anywhere...
projects_module.factory('GetHabSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/gethabsubproject');
}]);

projects_module.factory('GetHabSubprojects', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/gethabsubprojects');
}]);

projects_module.factory('RemoveSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/removecrppsubproject');
}]);

projects_module.factory('RemoveHabSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/removehabsubproject');
}]);

projects_module.factory('RemoveCorrespondenceEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/removecorrespondenceevent');
}]);

projects_module.factory('RemoveHabitatItem', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/removehabitatitem');
}]);

/*
* subprojects service (includes Project factory which is defined in projects-service.js)
*/
projects_module.service('SubprojectService', ['$q', 
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
    'SaveCrppSubproject',
    'SaveHabSubproject',
    'GetSubprojects',
    'GetHabSubproject',
    'GetHabSubprojects',
    'RemoveSubproject',
    'RemoveHabSubproject',
    'RemoveCorrespondenceEvent',
    'RemoveHabitatItem',

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
        SaveCrppSubproject,
        SaveHabSubproject,
        GetSubprojects,
        GetHabSubproject,
        GetHabSubprojects,
        RemoveSubproject,
        RemoveHabSubproject,
        RemoveCorrespondenceEvent,
        RemoveHabitatItem) {

        var service = {

            //we'd like to move this subproject stuff all out soon
            subproject: null,
            subprojects: null,
            subprojectType: null,

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
            setServiceSubprojectType: function (spType) {
                console.log("Inside setServiceSubprojectType, spType = " + spType);
                service.subprojectType = spType;
                console.log("service.subprojectType = " + service.subprojectType);
            },
            getSubprojects: function () {
                return GetSubprojects.query();
            },
            getHabSubproject: function (id) {
                console.log("Inside getHabSubproject...");
                return GetHabSubproject.query({ id: id });
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
                console.log("Inside deleteCorresEventFile");
                console.log("SubprojectId = " + subprojectId + ", ceId = " + ceId + " attempting to delete file...");
                console.dir(file);
                //return DeleteFile.save({ProjectId: projectId, File: file});
                return DeleteCorresEventFile.save({ ProjectId: projectId, SubprojectId: subprojectId, CeId: ceId, File: file });
            },
            deleteHabitatItemFile: function (projectId, subprojectId, hiId, file) {
                console.log("Inside deleteHabitatItemFile");
                console.log("ProjectId = " + projectId + ", SubprojectId = " + subprojectId + ", hiId = " + hiId + " attempting to delete file...");
                console.dir(file);
                //return DeleteFile.save({ProjectId: projectId, File: file});
                return DeleteHabitatItemFile.save({ ProjectId: projectId, SubprojectId: subprojectId, HiId: hiId, File: file });
            },
            deleteHabSubprojectFile: function (projectId, subprojectId, file) {
                console.log("Inside deleteHabSubprojectFile");
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


