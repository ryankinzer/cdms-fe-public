﻿//subproject (crpp + habitat) factories and service

//NB: this is not the final form - we want to create an actual
//    subproject feature in the system and refactor this

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

projects_module.factory('OlcSubprojectFiles', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/olcsubproject/getolcsubprojectfiles', {}, {
        query: { method: 'GET', params: { id: 'projectId' }, isArray: true }
    });
}]);

projects_module.factory('SaveCorrespondenceEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/savecorrespondenceevent');
}]);

projects_module.factory('SaveOlcEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/olcsubproject/saveolcevent');
}]);

projects_module.factory('SaveHabitatItem', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/savehabitatitem');
}]);

projects_module.factory('DeleteCorresEventFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/deletecorreseventfile');
}]);

projects_module.factory('DeleteOlcEventFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/olcsubproject/deleteolceventfile');
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

projects_module.factory('SaveOlcSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/olcsubproject/saveolcsubproject');
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
    return $resource(serviceUrl + '/api/v1/crppsubproject/removecrppsubproject', {}, {
        save: { method: 'POST', isArray: false }
    });
}]);

projects_module.factory('RemoveHabSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/removehabsubproject');
}]);

projects_module.factory('RemoveOlcSubproject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/olcsubproject/removeolcsubproject');
}]);

projects_module.factory('RemoveCorrespondenceEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/crppsubproject/removecorrespondenceevent');
}]);

projects_module.factory('RemoveOlcEvent', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/olcsubproject/removeolcevent');
}]);

projects_module.factory('RemoveHabitatItem', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/habsubproject/removehabitatitem');
}]);

projects_module.factory('GetOlcSubprojects', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/olcsubproject/getolcsubprojects');
}]);

/*
* subprojects service (includes Project factory which is defined in projects-service.js)
*/
projects_module.service('SubprojectService', ['$q', 
    'ProjectSubprojects',
    'SubprojectFiles',
    'OlcSubprojectFiles',
    'SaveCorrespondenceEvent',
    'SaveOlcEvent',
    'SaveHabitatItem',
    'DeleteCorresEventFile',
    'DeleteHabitatItemFile',
    'DeleteHabSubprojectFile',
    'SaveSubproject',
    'SaveCrppSubproject',
    'SaveHabSubproject',
    'SaveOlcSubproject',
    'GetSubprojects',
    'GetHabSubproject',
    'GetHabSubprojects',
    'GetOlcSubprojects',
    'RemoveSubproject',
    'RemoveHabSubproject',
    'RemoveOlcSubproject',
    'RemoveCorrespondenceEvent',
    'RemoveHabitatItem',

    function ($q,
        ProjectSubprojects,
        SubprojectFiles,
        OlcSubprojectFiles,
        SaveCorrespondenceEvent,
        SaveOlcEvent,
        SaveHabitatItem,
        DeleteCorresEventFile,
        DeleteHabitatItemFile,
        DeleteHabSubprojectFile,
        SaveSubproject,
        SaveCrppSubproject,
        SaveHabSubproject,
        SaveOlcSubproject,
        GetSubprojects,
        GetHabSubproject,
        GetHabSubprojects,
        GetOlcSubprojects,
        RemoveSubproject,
        RemoveHabSubproject,
        RemoveOlcSubproject,
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
                console.log("Inside subproject-service, getSubproject...");
                if (service.subproject && service.subproject.Id === id)
                    return service.subproject;
            },
            setServiceSubprojectType: function (spType) {
                console.log("Inside subproject-service, setServiceSubprojectType, spType = " + spType);
                service.subprojectType = spType;
                console.log("service.subprojectType = " + service.subprojectType);
            },
            getSubprojects: function () {
                return GetSubprojects.query();
            },
            getHabSubproject: function (id) {
                console.log("Inside subproject-service, getHabSubproject...");
                return GetHabSubproject.query({ id: id });
            },
            getHabSubprojects: function ()
            //getHabSubprojects: function(id)
            {
                console.log("Inside subproject-service, getHabSubprojects");
                //console.log("id = " + id);
                return GetHabSubprojects.query();
                //return GetHabSubprojects.query({id: id});
            },
            getOlcSubprojects: function ()
            {
                console.log("Inside subproject-service, getOlcSubprojects");
                //console.log("id = " + id);
                return GetOlcSubprojects.query();
            },
            saveSubproject: function (projectId, subproject, saveResults) {
                console.log("Inside subproject-service, saveSubproject...");
                saveResults.saving = true;
                console.log("saveResults.saving = " + saveResults.saving);

                return SaveSubproject.save({ ProjectId: projectId, Subproject: subproject });
            },
            saveCrppSubproject: function (projectId, subproject, saveResults) {
                console.log("Inside subproject-service, saveCrppSubproject...");
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
            saveOlcSubproject: function (projectId, subproject, saveResults) {
                console.log("Inside services.js, saveOlcSubproject...");
                saveResults.saving = true;
                console.log("saveResults.saving = " + saveResults.saving);

                return SaveOlcSubproject.save({ ProjectId: projectId, Subproject: subproject });
            },
            removeSubproject: function (projectId, subprojectId) {
                return RemoveSubproject.save({ ProjectId: projectId, SubprojectId: subprojectId });
            },
            //removeHabSubproject: function(projectId, subprojectId){
            removeHabSubproject: function (projectId, subprojectId, locationId) {
                //return RemoveHabSubproject.save({ProjectId: projectId, SubprojectId: subprojectId});
                return RemoveHabSubproject.save({ ProjectId: projectId, SubprojectId: subprojectId, LocationId: locationId });
            },
            removeOlcSubproject: function (projectId, subprojectId) {
                return RemoveOlcSubproject.save({ ProjectId: projectId, SubprojectId: subprojectId});
            },
            //removeCorrespondenceEvent: function(projectId, subprojectId, correspondenceEventId){
            removeCorrespondenceEvent: function (projectId, subprojectId, correspondenceEventId, datastoreTablePrefix) {
                console.log("Inside removeCorrespondenceEvent...");
                console.log("projectId = " + projectId + ", subprojectId = " + subprojectId + ", correspondenceEventId = " + correspondenceEventId + ", datastoreTablePrefix = " + datastoreTablePrefix);
                //return RemoveCorrespondenceEvent.save({ProjectId: projectId, SubprojectId: subprojectId, CorrespondenceEventId: correspondenceEventId});
                return RemoveCorrespondenceEvent.save({ ProjectId: projectId, SubprojectId: subprojectId, CorrespondenceEventId: correspondenceEventId, DatastoreTablePrefix: datastoreTablePrefix });
            },
            removeOlcEvent: function (projectId, subprojectId, olcEventId, datastoreTablePrefix) {
                console.log("Inside removeOlcEvent...");
                console.log("projectId = " + projectId + ", subprojectId = " + subprojectId + ", olcEventId = " + olcEventId + ", datastoreTablePrefix = " + datastoreTablePrefix);
                return RemoveOlcEvent.save({ ProjectId: projectId, SubprojectId: subprojectId, olcEventId: olcEventId, DatastoreTablePrefix: datastoreTablePrefix });
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
            saveOlcEvent: function (projectId, subprojectId, olcEvent) {
                console.log("Inside saveOlcEvent...")
                console.log("projectId = " + projectId);
                console.log("subprojectId = " + subprojectId);
                console.log("olcEvent is next...");
                console.dir(olcEvent);
                return SaveOlcEvent.save({ ProjectId: projectId, SubprojectId: subprojectId, OlcEvent: olcEvent });
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
            getSubprojectFiles: function (projectId) {
                console.log("Inside getSubprojectFiles...");
                console.log("projectId = " + projectId);
                return SubprojectFiles.query({ id: projectId });
            },
            getOlcSubprojectFiles: function (projectId) {
                console.log("Inside getOlcSubprojectFiles...");
                console.log("projectId = " + projectId);
                return OlcSubprojectFiles.query({ id: projectId });
            },
            //NB: why is this .save()? -- to get a POST instead of a GET?
            getProjectSubprojects: function (projectId) {
                console.log("Inside getProjectSubprojects, projectId = " + projectId);
                //this.getProject(projectId); //set our local project to the one selected
                return ProjectSubprojects.save({ ProjectId: projectId });
            }

        };

        return service;
    }
]);


