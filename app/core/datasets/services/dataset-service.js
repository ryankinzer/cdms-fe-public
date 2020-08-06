﻿// all dataset (activities, datastore) related factories and DatasetService.

datasets_module.factory('DatasetFiles', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/file/getdatasetfiles', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('Activities', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/getdatasetactivities', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('GetSeasons', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/season/getseasons', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('SaveSeason', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/season/saveseason');
}]);

datasets_module.factory('RemoveSeason', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/season/removeseason');
}]);

datasets_module.factory('ActivitiesForView', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/getdatasetactivitiesview', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('CreelSurveyActivitiesForView', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/getcreelsurveydatasetactivitiesview', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('Dataset', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/getdataset', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: false }
    });
}]);

datasets_module.factory('Datasets', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/getdatasets', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

datasets_module.factory('GetDatasetsList', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/getdatasetslist', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);

datasets_module.factory('GetTableData', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/table/gettabledata', {}, {
        query: { method: 'GET', params: {id: 'id'}, isArray: true }
    });
}]);

datasets_module.factory('SaveTableData', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/table/savetabledata', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

datasets_module.factory('DeleteTableData', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/table/deletetabledata', {}, {
        save: { method: 'POST', isArray: false }
    });
}]);



datasets_module.factory('Data', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/getdatasetactivitydata', {}, {
        query: { method: 'GET', params: { id: 'activityId' }, isArray: false }
    });
}]);

datasets_module.factory('SaveActivitiesAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/savedatasetactivities');
}]);

datasets_module.factory('UpdateActivitiesAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/updatedatasetactivities');
}]);

datasets_module.factory('QueryActivitiesAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/query/querydatasetactivities', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

datasets_module.factory('ExportActivitiesAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/export/exportdatasetactivities', {}, {
        save: { method: 'POST', isArray: false }
    });
}]);

datasets_module.factory('DeleteActivitiesAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/deletedatasetactivities', {}, {
        save: { method: 'POST', isArray: false }
    });
}]);

datasets_module.factory('SetQaStatusAction', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/setqastatus');
}]);

//shouldn't this have an ID parameter? my guess is we don't actually use this anywhere...
datasets_module.factory('GetDatastore', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getdatastore', {}, { query: { method: 'GET', params: {}, isArray: false } });
}]);

datasets_module.factory('GetAllDatastores', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getdatastores');
}]);

datasets_module.factory('GetDatastoreDatasets', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getdatastoredatasets');
}]);

datasets_module.factory('GetHeadersDataForDataset', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/getheadersdatafordataset');
}]);

datasets_module.factory('DeleteDatasetFile', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/file/deletedatasetfile');
}]);

datasets_module.factory('GetRelationData', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/getrelationdata', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

datasets_module.factory('AddDatasetToProject', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/adddatasettoproject')
}]);

datasets_module.factory('UpdateDataset', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/updatedataset');
}]);


datasets_module.factory('MigrationYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getmigrationyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('RunYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getrunyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('ReportYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getreportyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('BenthicSampleYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getbenthicsampleyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('DriftSampleYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getdriftsampleyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('SpawningYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getspawningyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('BroodYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getbroodyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('OutmigrationYears', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/list/getoutmigrationyears', {}, {
        query: { method: 'GET', params: { id: 'datasetId' }, isArray: true }
    });
}]);

datasets_module.factory('SpecificActivities', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/queryspecificactivities', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

datasets_module.factory('SpecificActivitiesWithBounds', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/queryspecificactivitieswithbounds', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

datasets_module.factory('SpecificWaterTempActivities', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/queryspecificwatertempactivities', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

datasets_module.factory('SpecificCreelSurveyActivities', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/queryspecificcreelsurveyactivities', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);

datasets_module.factory('SpecificScrewTrapActivities', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/queryspecificscrewtrapactivities', {}, {
        save: { method: 'POST', isArray: true }
    });
}]);


datasets_module.factory('HasExistingActivity', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/activity/HasExistingActivity', {}, {
        save: { method: 'POST', isArray: false }
    });
}]);



datasets_module.service('DatasetService', ['$q',
    'DatasetFiles',
    'Activities',
    'GetSeasons',
    'SaveSeason',
    'RemoveSeason',
    'ActivitiesForView',
	'CreelSurveyActivitiesForView',
    'Dataset',
    'Datasets',
    'Data',
    'SaveActivitiesAction',
    'UpdateActivitiesAction',
    'QueryActivitiesAction',
    'ExportActivitiesAction',
    'DeleteActivitiesAction',
    'SetQaStatusAction',
    'GetDatastore',
    'GetAllDatastores',
    'GetDatastoreDatasets',
    'GetHeadersDataForDataset',
    'DeleteDatasetFile',
    'GetRelationData',
	'MigrationYears',
	'RunYears',
	'ReportYears',
	'BenthicSampleYears',
	'DriftSampleYears',
	'SpawningYears',
	'BroodYears',
	'OutmigrationYears',
	'SpecificActivities',
	'SpecificActivitiesWithBounds',
    'SpecificWaterTempActivities',
    'SpecificCreelSurveyActivities',
    'SpecificScrewTrapActivities',
    'AddDatasetToProject',
    'UpdateDataset',
    'HasExistingActivity',
    'GetDatasetsList',
    'GetTableData',
    'SaveTableData',
    'DeleteTableData',
    function ($q,
        DatasetFiles,
        Activities,
        GetSeasons,
        SaveSeason,
        RemoveSeason,
        ActivitiesForView,
		CreelSurveyActivitiesForView,
        Dataset,
        Datasets,
        Data,
        SaveActivitiesAction,
        UpdateActivitiesAction,
        QueryActivitiesAction,
        ExportActivitiesAction,
        DeleteActivitiesAction,
        SetQaStatusAction,
        GetDatastore,
        GetAllDatastores,
        GetDatastoreDatasets,
        GetHeadersDataForDataset,
        DeleteDatasetFile,
        GetRelationData,
        MigrationYears,
        RunYears,
        ReportYears,
		BenthicSampleYears,
		DriftSampleYears,
        SpawningYears,
        BroodYears,
        OutmigrationYears,
		SpecificActivities,
		SpecificActivitiesWithBounds,
        SpecificWaterTempActivities,
        SpecificCreelSurveyActivities,
        SpecificScrewTrapActivities,
        AddDatasetToProject,
        UpdateDataset,
        HasExistingActivity,
        GetDatasetsList,
        GetTableData,
        SaveTableData,
        DeleteTableData)
    {

        var service = {
			
            datastoreId: null,
            dataset: null,
			
            clearDataset: function () {
                service.dataset = null;
            },
			
            getDatastore: function (id) {
                return GetDatastore.query({ id: id });
            },
			
            getDatastores: function () {
                return GetAllDatastores.query();
            },
			
            getDatastoreDatasets: function (id) {
                return GetDatastoreDatasets.query({ id: id });
            },
			
            getDataset: function (datasetId) {
                //if (service.dataset && service.dataset.Id == datasetId)
                //    return service.dataset;

                console.log("Inside dataset-service.js, getDataset...");

                service.dataset = Dataset.query({ id: datasetId });

                //load our configuration if there is one
                service.dataset.$promise.then(function () {
                    service.configureDataset(service.dataset);
                });

                return service.dataset;
            },
			
            getDatasets: function () {
                return Datasets.query();
            },
			
            getDatasetsList: function () {
                return GetDatasetsList.query();
            },

            getTableData: function(datasetId){
                return GetTableData.query({id: datasetId})
            },

            saveTableData: function(dataset, data){
                return SaveTableData.save({DatasetId: dataset.Id, TableData: data});
            },

            deleteDataTableRow: function(dataset, data){
                return DeleteTableData.save({DatasetId: dataset.Id, TableData: data});
            },

            //configureDataset: function(dataset)
            configureDataset: function (dataset, scope) {
                //console.log("configuring dataset.Name = " + dataset.Name);
                //default page routes
                dataset.activitiesRoute = "activities"; //default route -- when they click to go to "activities" this is the route they should use.

                if (typeof dataset.Config == 'undefined' || dataset.Config == null || dataset.Config == "NULL" || dataset.Config == "null") {
                    dataset.Config = {};
                    return;
                }

                try{
                    dataset.Config = angular.fromJson(dataset.Config);
                }catch(e){
                    console.error("Could not parse Config for this dataset:");
                    console.dir(dataset);
                }

                //if there are page routes in configuration, set them in our dataset
                if (dataset.Config.ActivitiesPage && dataset.Config.ActivitiesPage.Route)
                    dataset.activitiesRoute = dataset.Config.ActivitiesPage.Route;

                //part of configuration is authorization.  If the user isn't authorized
                //  for this dataset, bump them to error
                if (typeof dataset.Config.RestrictRoles !== 'undefined') {
                    var authorized = false;
                    for (var i = dataset.Config.RestrictRoles.length - 1; i >= 0; i--) {
                        if (angular.rootScope.Profile.hasRole(dataset.Config.RestrictRoles[i]))
                            authorized = true;
                    };

                    if (!authorized) {
                            
                        if (typeof scope !== 'undefined') {
                            scope.AuthorizedToViewProject = false;
                        }
                        else {
                            angular.rootScope.go('/unauthorized');
                        }
                    }

                    //console.dir(angular.rootScope.Profile);
                    //console.dir(dataset.Config.RestrictRoles);
                }
                    
            },
			
            getHeadersDataForDataset: function (datasetId) {
                return GetHeadersDataForDataset.query({ id: datasetId });
            },
			
            getActivityData: function (id) {
                return Data.query({ id: id });
            },
			
            getActivities: function (id) {
                return Activities.query({ id: id });
            },

            getSeasons: function (id) {
                console.log("Inside dataset-service.js, getSeasons...");
                return GetSeasons.query({ id: id });
            },

            checkForDuplicateActivity: function (query) {
                return HasExistingActivity.save(query);
            },

            saveSeason: function (projectId, datasetId, userId, season, saveResults) {
                console.log("Inside saveSeason...starting save...");
                console.log("season is next...");
                console.dir(season);

                season.saving = true; //tell everyone we are saving
                season.UserId = userId;
                season.DatasetId = datasetId;
                season.ProjectId = projectId;
                return SaveSeason.save(season, function (data) {
                    season.success = "Save successful.";
                    season.errors = false;
                    console.log("Initialized season.errors...");
                    season.new_record = data;
                    console.log("Success!");

                    season.saving = false; //and... we're done.
                }, function (data) {
                    season.success = false;
                    // activities.errors = {saveError: "There was a problem saving your data.  Please try again or contact support."}; // Original line.
                    // Let's provide a little more information that will help us figure out what happened.
                    var theErrorText = "";
                    if (typeof data.message !== 'undefined')
                        theErrorText = data.message;
                    else if (typeof data.data !== 'undefined') {
                        if (typeof data.data.ExceptionMessage !== 'undefined') {
                            theErrorText = data.data.ExceptionMessage;
                            console.log("Save error:  theErrorText = " + theErrorText);
                        }
                        else {
                            theErrorText = data.data;
                            var titleStartLoc = theErrorText.indexOf("<title>") + 7;
                            console.log("titleStartLoc = " + titleStartLoc);
                            var titleEndLoc = theErrorText.indexOf("</title>");
                            console.log("titleEndLoc = " + titleEndLoc);
                            theErrorText = theErrorText.substr(titleStartLoc, titleEndLoc - titleStartLoc);
                        }
                    }
                    var theErrorMessage = "There was a problem saving your data (" + theErrorText + ").  Please try again or contact support.";
                    season.errors = { saveError: theErrorMessage };
                    console.log("Failure!");
                    console.log(theErrorText);
                    console.log(theErrorMessage);
                    console.dir(data);
                    season.saving = false; //and... we're done.
                });
            },

            removeSeason: function (projectId, datasetId, seasonId) {
                return RemoveSeason.save({ ProjectId: projectId, DatasetId: datasetId, SeasonId: seasonId });
            },
			
            getActivitiesForView: function (id) {
                return ActivitiesForView.query({ id: id });
            },
			
            getCreelSurveyActivitiesForView: function (id) {
                return CreelSurveyActivitiesForView.query({ id: id });
            },

            saveDataset: function (a_dataset) {
                return UpdateDataset.save({ id: a_dataset.Id, dataset: a_dataset });
            },
            getDatasetFiles: function (datasetId) {
                console.log("Inside getDatasetFiles...");
                console.log("datasetId = " + datasetId);
                //this.getProject(projectId); //set our local project to the one selected
                return DatasetFiles.query({ id: datasetId });
            },
			
            deleteDatasetFile: function (projectId, datasetId, file) {
                console.log("Inside deleteDatasetFile");
                console.log("ProjectId = " + projectId + ", DatasetId = " + datasetId + ", attempting to delete file...");
                console.dir(file);
                return DeleteDatasetFile.save({ ProjectId: projectId, DatasetId: datasetId, File: file });
            },
			
            //NB: looks like this isn't used.
            //this should give you the possible QA Statuses for this dataset's rows
            getPossibleRowQAStatuses: function (id) {
                //for now we fake it:
                return [{
                    id: 1,
                    name: "ok",
                },
                {
                    id: 2,
                    name: "error",
                }
                ];

            },
			
            queryActivities: function (query) {
                //using "save" here because we need to POST our query criteria object
                return QueryActivitiesAction.save(query.criteria);

            },
			
            exportActivities: function (query) {
                ExportActivitiesAction.save(query.criteria, function (data) {
                    console.log("success!");
                    query.loading = false;
                    query.exportedFile = data;
                    console.dir(data);
                    //console.dir(angular.fromJson(data));
                }, function (data) {
                    console.log("Failure!");
                    query.failed = true;
                    query.loading = false;
                });
            },
			
            //updateActivities: function(userId, datasetId, activities)
            updateActivities: function (payload) {
                return UpdateActivitiesAction.save(payload); 
                    /*
                    , function (data) {
                    saveResult.success = "Update successful.";
                    saveResult.error = false;
                    console.log("Success!");
                    saveResult.saving = false; //and... we're done.
                }, function (data) {
                    saveResult.success = false;
                    saveResult.error = "There was a problem saving your data.  Please try again or contact support." ;
                    console.log("Failure!");
                    console.dir(data);
                    saveResult.saving = false; //and... we're done.
                });*/

            },

            addDatasetToProject: function (a_datastoreId, a_projectId, a_fields) {
                return AddDatasetToProject.save({ DatastoreId: a_datastoreId, ProjectId: a_projectId, DatasetFields: a_fields });
            },
            
            saveActivities: function (payload) {
               
                return SaveActivitiesAction.save(payload);
                    /*
                    , function (data) {
                    //activities.success = "Save successful.";
                    activities.errors = false;
                    console.log("Set activities.errors...");
                    activities.new_records = data;
                    console.log("Success!");
                    // Situation 1:  The user has NOT clicked Add Section yet, but has clicked Save and close.
                    if (typeof activities.addNewSection === 'undefined') {
                        console.log("Save and close save successful..., Add Section not clicked.");
                        activities.success = "Save successful."; // This line closes the page after a successful save; this is for Save and close.
                    }
                    // Situation 2:  The user has clicked Add Section on that page, before clicking Save and close on the last record entered.
                    else if (activities.addNewSection === false) {
                        console.log("Save and close save successful..., Add Section previously clicked.");
                        activities.success = "Save successful."; // This line closes the page after a successful save; this is for Save and close.
                    }
                    // Situation 3:  The user has only clicked Add Section.
                    else if (activities.addNewSection === true) {
                        console.log("Add Section save successful..., Add Section only clicked.");
                        activities.addNewSection = false; // This flag indicates to the Data Entry form that we are adding a new section, not save and close.
                    }

                    activities.saving = false; //and... we're done.
                }, function (data) {
                    activities.success = false;
                    // activities.errors = {saveError: "There was a problem saving your data.  Please try again or contact support."}; // Original line.
                    // Let's provide a little more information that will help us figure out what happened.
                    var theErrorText = "";
                    if (typeof data.message !== 'undefined')
                        theErrorText = data.message;
                    else if (typeof data.data !== 'undefined') {
                        if (typeof data.data.ExceptionMessage !== 'undefined') {
                            theErrorText = data.data.ExceptionMessage;
                            console.log("Save error:  theErrorText = " + theErrorText);
                        }
                        else {
                            theErrorText = data.data;
                            var titleStartLoc = theErrorText.indexOf("<title>") + 7;
                            console.log("titleStartLoc = " + titleStartLoc);
                            var titleEndLoc = theErrorText.indexOf("</title>");
                            console.log("titleEndLoc = " + titleEndLoc);
                            theErrorText = theErrorText.substr(titleStartLoc, titleEndLoc - titleStartLoc);
                        }
                    }
                    var theErrorMessage = "There was a problem saving your data (" + theErrorText + ").  Please try again or contact support.";
                    activities.errors = { saveError: theErrorMessage };
                    console.log("Failure!");
                    console.log(theErrorText);
                    console.log(theErrorMessage);
                    console.dir(data);
                    activities.saving = false; //and... we're done.
                });*/
            },
			
            //delete selectedItems activities
            deleteActivities: function (userId, datasetId, activityids) {

                var payload = {
                    UserId: userId,
                    DatasetId: datasetId,
                    ActivityIds: activityids,
                }

                return DeleteActivitiesAction.save(payload);

            },
			
            updateQaStatus: function (ActivityId, QAStatusId, Comments) {
                
                var payload = {
                    QAStatusId: QAStatusId,
                    ActivityId: ActivityId,
                    Comments: Comments,
                };

                console.dir(payload);

                return SetQaStatusAction.save(payload);
            },
			
            getRelationData: function (relationFieldId, activityId, rowId) {
                return GetRelationData.save({ FieldId: relationFieldId, ActivityId: activityId, ParentRowId: rowId });
            },
			
            getMigrationYears: function (datasetId) {
                console.log("Inside dataset-service, getMigrationYears");
                return MigrationYears.query({ id: datasetId });
            },
			
            getRunYears: function (datasetId) {
                console.log("Inside dataset-service, getRunYears");
                return RunYears.query({ id: datasetId });
            },
			
            getReportYears: function (datasetId) {
                console.log("Inside dataset-service, getReportYears");
                return ReportYears.query({ id: datasetId });
            },

            getBenthicSampleYears: function (datasetId) {
                console.log("Inside dataset-service, getBenthicSampleYears");
                return BenthicSampleYears.query({ id: datasetId });
            },
			
            getDriftSampleYears: function (datasetId) {
                console.log("Inside dataset-service, getDriftSampleYears");
                return DriftSampleYears.query({ id: datasetId });
            },
			
            getSpawningYears: function (datasetId) {
                console.log("Inside dataset-service, getSpawningYears");
                return SpawningYears.query({ id: datasetId });
            },
			
            getBroodYears: function (datasetId) {
                console.log("Inside dataset-service, getBroodYears");
                return BroodYears.query({ id: datasetId });
            },
			
            getOutmigrationYears: function (datasetId) {
                console.log("Inside dataset-service, getOutmigrationYears");
                return OutmigrationYears.query({ id: datasetId });
            },
			
            getSpecificActivities: function (datasetId, locationIdList, activityDateList) {
				console.log("Inside dataset-service.js, getSpecificActivities...");
				var searchCriteria = {
					DatasetId: datasetId,
					LocationId: locationIdList,
					ActivityDate: activityDateList
				}
				
                return SpecificActivitiesWithBounds.save(searchCriteria);
            },
			
            getSpecificWaterTempActivities: function (datasetId, locationIdList, instrumentIdList,dateTimeList) {
				console.log("Inside dataset-service.js, getSpecificWaterTempActivities...");
				var searchCriteria = {
					DatasetId: datasetId,
					LocationId: locationIdList,
					InstrumentId: instrumentIdList,
					DateTimeList: dateTimeList
				}
				
                return SpecificWaterTempActivities.save(searchCriteria);
            },

            getSpecificCreelSurveyActivities: function (datasetId, locationIdList, acvtivityDateList, timeStartList) {
                console.log("Inside dataset-service.js, getSpecificCreelSurveyActivities...");
                var searchCriteria = {
                    DatasetId: datasetId,
                    LocationId: locationIdList,
                    ActivityDate: acvtivityDateList,
                    TimeStart: timeStartList
                }

                return SpecificCreelSurveyActivities.save(searchCriteria);
            },

            getSpecificScrewTrapActivities: function (datasetId, locationIdList, acvtivityDateList, arrivalTimeList) {
                console.log("Inside dataset-service.js, getSpecificScrewTrapActivities...");
                var searchCriteria = {
                    DatasetId: datasetId,
                    LocationId: locationIdList,
                    ActivityDate: acvtivityDateList,
                    ArrivalTime: arrivalTimeList
                }

                return SpecificScrewTrapActivities.save(searchCriteria);
            }
        };

        return service;
    }
]);
