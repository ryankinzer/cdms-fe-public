'use strict';

var mod = angular.module('DatasetServices', ['ngResource']);

//Note: typically you won't want to use these factories directly in your
// controllers, but rather use the DataService below.
mod.factory('Projects',['$resource', function(resource){
        return resource(serviceUrl+'/api/projects',{}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('Users',['$resource', function($resource){
        return $resource(serviceUrl+'/api/users', {}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('Project',['$resource', function($resource){
        return $resource(serviceUrl+'/api/projects', {}, {
            query: {method: 'GET', params: {id:'id'}, isArray: false}
        });
}]);

mod.factory('ProjectDatasets',['$resource', function($resource){
        return $resource(serviceUrl+'/action/ProjectDatasets', {}, {
            query: {method: 'GET', params: {id:'projectId'}, isArray: true}
        });
}]);

mod.factory('MigrationYears',['$resource', function($resource){
        return $resource(serviceUrl+'/action/MigrationYears', {}, {
            query: {method: 'GET', params: {id: 'datasetId'}, isArray: true}
        });
}]);

mod.factory('RunYears',['$resource', function($resource){
        return $resource(serviceUrl+'/action/RunYears', {}, {
            query: {method: 'GET', params: {id: 'datasetId'}, isArray: true}
        });
}]);

mod.factory('ReportYears',['$resource', function($resource){
        return $resource(serviceUrl+'/action/ReportYears', {}, {
            query: {method: 'GET', params: {id: 'datasetId'}, isArray: true}
        });
}]);

mod.factory('SpawningYears',['$resource', function($resource){
        return $resource(serviceUrl+'/action/SpawningYears', {}, {
            query: {method: 'GET', params: {id: 'datasetId'}, isArray: true}
        });
}]);

mod.factory('BroodYears',['$resource', function($resource){
        return $resource(serviceUrl+'/action/BroodYears', {}, {
            query: {method: 'GET', params: {id: 'datasetId'}, isArray: true}
        });
}]);

mod.factory('OutmigrationYears',['$resource', function($resource){
        return $resource(serviceUrl+'/action/OutmigrationYears', {}, {
            query: {method: 'GET', params: {id: 'datasetId'}, isArray: true}
        });
}]);

/*mod.factory('ProjectSubprojects',['$resource', function($resource){
        return $resource(serviceUrl+'/action/ProjectSubprojects', {}, {
            query: {method: 'GET', params: {id:'projectId'}, isArray: true}
        });
}]);*/
mod.factory('ProjectSubprojects',['$resource', function($resource){
        return $resource(serviceUrl+'/data/ProjectSubprojects', {}, {
           save: {method: 'POST', isArray: true}
        });
}]);

mod.factory('ProjectFunders',['$resource', function($resource){
        return $resource(serviceUrl+'/action/ProjectFunders', {}, {
            query: {method: 'GET', params: {id:'projectId'}, isArray: true}
        });
}]);

mod.factory('ProjectCollaborators',['$resource', function($resource){
        return $resource(serviceUrl+'/action/ProjectCollaborators', {}, {
            query: {method: 'GET', params: {id:'projectId'}, isArray: true}
        });
}]);

mod.factory('ProjectFiles',['$resource', function($resource){
        return $resource(serviceUrl+'/action/ProjectFiles', {}, {
            query: {method: 'GET', params: {id:'projectId'}, isArray: true}
        });
}]);

mod.factory('DatasetFiles',['$resource', function($resource){
        return $resource(serviceUrl+'/action/DatasetFiles', {}, {
            query: {method: 'GET', params: {id:'datasetId'}, isArray: true}
        });
}]);

mod.factory('SubprojectFiles',['$resource', function($resource){
        return $resource(serviceUrl+'/action/SubprojectFiles', {}, {
            query: {method: 'GET', params: {id:'projectId'}, isArray: true}
        });
}]);

mod.factory('Activities',['$resource', function($resource){
        return $resource(serviceUrl+'/action/DatasetActivities', {}, {
            query: {method: 'GET', params: {id:'datasetId'}, isArray: true}
        });
}]);

mod.factory('ActivitiesForView',['$resource', function($resource){
        return $resource(serviceUrl+'/action/DatasetActivitiesView', {}, {
            query: {method: 'GET', params: {id:'datasetId'}, isArray: true}
        });
}]);

mod.factory('Datasets',['$resource', function($resource){
        return $resource(serviceUrl+'/api/datasets', {}, {
            query: {method: 'GET', params: {id:'datasetId'}, isArray: false}
        });
}]);

mod.factory('Data',['$resource', function($resource){
        return $resource(serviceUrl+'/action/DatasetData', {}, {
            query: {method: 'GET', params: {id:'activityId'}, isArray: false}
        });
}]);

mod.factory('SaveActivitiesAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveDatasetActivities');
}]);

mod.factory('UpdateActivitiesAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/UpdateDatasetActivities');
}]);

mod.factory('QueryActivitiesAction',  ['$resource', function($resource){
        return $resource(serviceUrl+'/data/QueryDatasetActivities', {}, {
           save: {method: 'POST', isArray: true}
        });
}]);

mod.factory('ExportActivitiesAction',  ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DownloadDatasetActivities', {}, {
           save: {method: 'POST', isArray: false}
        });
}]);

mod.factory('SetProjectEditors', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SetProjectEditors');
}]);

mod.factory('DeleteActivitiesAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteDatasetActivities');
}]);

mod.factory('DeleteLocationAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteLocation');
}]);


mod.factory('SetQaStatusAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SetQaStatus');
}]);

mod.factory('GetMyDatasetsAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetMyDatasets', {}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('GetMyProjectsAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetMyProjects', {}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);


mod.factory('SaveUserPreferenceAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/action/SaveUserPreference');
}]);

mod.factory('GetMetadataProperties', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/MetadataProperties');
}]);

mod.factory('GetAllPossibleDatastoreLocations', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllPossibleDatastoreLocations');
}]);

mod.factory('GetAllDatastoreFields', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllDatastoreFields');
}]);

mod.factory('GetDatastore', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetDatastore', {}, { query: {method: 'GET', params: {}, isArray: false}});
}]);

mod.factory('GetDatastoreProjects', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetDatastoreProjects');
}]);

mod.factory('GetAllDatastores', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllDatastores');
}]);

mod.factory('GetDatastoreDatasets', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetDatastoreDatasets');
}]);


mod.factory('SaveDatasetMetadata', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SetDatasetMetadata');
}]);

mod.factory('GetSources', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetSources');
}]);

mod.factory('GetInstruments', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetInstruments');
}]);

mod.factory('SaveDatasetField', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveDatasetField');
}]);

mod.factory('SaveMasterField', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveMasterField');
}]);

mod.factory('DeleteDatasetField', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteDatasetField');
}]);

mod.factory('GetAllFields', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllFields');
}]);

mod.factory('GetLocationTypes', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetLocationTypes');
}]);

mod.factory('AddMasterFieldToDataset', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/AddMasterFieldToDataset');
}]);

mod.factory('SaveProjectLocation', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveProjectLocation');
}]);

mod.factory('GetAllInstruments', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllInstruments');
}]);

mod.factory('SaveProjectInstrument', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveProjectInstrument');
}]);

mod.factory('SaveProjectFisherman', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveProjectFisherman');
}]);

mod.factory('SaveInstrument', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveInstrument');
}]);

mod.factory('SaveInstrumentAccuracyCheck', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveInstrumentAccuracyCheck');
}]);

mod.factory('SaveCorrespondenceEvent', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveCorrespondenceEvent');
}]);

mod.factory('SaveHabitatItem', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveHabitatItem');
}]);

mod.factory('GetInstrumentTypes', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetInstrumentTypes');
}]);

mod.factory('RemoveProjectInstrument', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/RemoveProjectInstrument');
}]);

mod.factory('GetMetadataFor',['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetMetadataFor', {}, {
           save: {method: 'POST', isArray: true}
        });
}]);

mod.factory('GetWaterBodies', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetWaterBodies');
}]);

mod.factory('SaveProject', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveProject');
}]);


mod.factory('GetHeadersDataForDataset', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetHeadersDataForDataset');
}]);

mod.factory('UpdateFile', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/UpdateFile');
}]);

mod.factory('DeleteFile', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteFile');
}]);

mod.factory('DeleteDatasetFile', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteDatasetFile');
}]);

mod.factory('DeleteCorresEventFile', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteCorresEventFile');
}]);

mod.factory('DeleteHabitatItemFile', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteHabitatItemFile');
}]);

mod.factory('DeleteHabSubprojectFile', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteHabSubprojectFile');
}]);

mod.factory('GetTimeZones', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetTimeZones');
}]);

mod.factory('GetDepartments', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/Department');
}]);

mod.factory('SaveFisherman', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveFisherman');
}]);

mod.factory('SaveSubproject', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveSubproject');
}]);

mod.factory('SaveHabSubproject', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveHabSubproject');
}]);

mod.factory('GetFishermen', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetFishermen');
}]);

mod.factory('GetSubprojects', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetSubprojects');
}]);

mod.factory('GetHabSubproject', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetHabSubproject');
}]);

mod.factory('GetHabSubprojects', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetHabSubprojects');
        //return $resource(serviceUrl+'/data/GetHabSubprojects', {}, { query: {method: 'GET', params: {}, isArray: false}});
}]);

mod.factory('GetProjectFishermen', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetProjectFishermen');
}]);

mod.factory('RemoveProjectFisherman', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/RemoveProjectFisherman');
}]);

mod.factory('RemoveSubproject', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/RemoveSubproject');
}]);

mod.factory('RemoveHabSubproject', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/RemoveHabSubproject');
}]);

mod.factory('RemoveCorrespondenceEvent', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/RemoveCorrespondenceEvent');
}]);

mod.factory('RemoveHabitatItem', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/RemoveHabitatItem');
}]);

mod.factory('GetRelationData', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetRelationData',{},{
                       save: {method: 'POST', isArray: true}
        });
}]);

mod.factory('SaveUserInfo', ['$resource', function($resource){
        return $resource(serviceUrl+'/account/SaveUserInfo');
}]);

mod.service('DatastoreService', ['$q','GetAllPossibleDatastoreLocations','GetAllDatastoreFields','GetDatastore','GetDatastoreProjects','GetAllDatastores',
		'GetDatastoreDatasets','GetSources','GetInstruments','SaveDatasetField','SaveMasterField','DeleteDatasetField','GetAllFields',
		'AddMasterFieldToDataset','GetLocationTypes','SaveProjectLocation','GetAllInstruments','SaveProjectInstrument','SaveInstrument','SaveInstrumentAccuracyCheck',
		'GetInstrumentTypes','RemoveProjectInstrument', 'GetWaterBodies','UpdateFile','DeleteFile','GetTimeZones','DeleteLocationAction','SaveFisherman','GetFishermen',
		'SaveProjectFisherman','GetProjectFishermen','RemoveProjectFisherman','SaveSubproject','GetSubprojects','RemoveSubproject','SaveCorrespondenceEvent',
		'RemoveCorrespondenceEvent','DeleteCorresEventFile','SaveHabSubproject','RemoveHabSubproject','SaveHabitatItem','RemoveHabitatItem','DeleteHabitatItemFile',
		'DeleteHabSubprojectFile','DeleteDatasetFile','GetHabSubproject',
    function($q, GetAllPossibleDatastoreLocations, GetAllDatastoreFields, GetDatastore, GetDatastoreProjects, GetAllDatastores, GetDatastoreDatasets, GetSources,
		GetInstruments, SaveDatasetField, SaveMasterField, DeleteDatasetField, GetAllFields, AddMasterFieldToDataset, GetLocationTypes, SaveProjectLocation,
		GetAllInstruments, SaveProjectInstrument, SaveInstrument, SaveInstrumentAccuracyCheck, GetInstrumentTypes, RemoveProjectInstrument, GetWaterBodies, UpdateFile,
		DeleteFile, GetTimeZones, DeleteLocationAction, SaveFisherman, GetFishermen, SaveProjectFisherman, GetProjectFishermen, RemoveProjectFisherman, SaveSubproject,
		GetSubprojects, RemoveSubproject, SaveCorrespondenceEvent, RemoveCorrespondenceEvent, DeleteCorresEventFile, SaveHabSubproject, RemoveHabSubproject,
		SaveHabitatItem, RemoveHabitatItem, DeleteHabitatItemFile, DeleteHabSubprojectFile, DeleteDatasetFile, GetHabSubproject){

        var service = {

            datastoreId: null,

            getLocations: function(id)
            {
                service.datastoreId = id;
                return GetAllPossibleDatastoreLocations.query({id: id});
            },

            getFields: function(id)
            {
                return GetAllDatastoreFields.query({id: id});
            },
            getMasterFields: function(categoryId){
                return GetAllFields.query({id: categoryId});
            },
            getDatastore: function(id)
            {
                return GetDatastore.query({id: id});
            },

            getProjects: function(id)
            {
                return GetDatastoreProjects.query({id: id});
            },

            getDatastores: function()
            {
                return GetAllDatastores.query();
            },

            getWaterBodies: function()
            {
                return GetWaterBodies.query();
            },

            getDatasets: function(id)
            {
                return GetDatastoreDatasets.query({id: id});
            },
            getSources: function()
            {
                return GetSources.query();
            },
            getInstruments: function()
            {
                return GetInstruments.query();
            },
            getInstrumentTypes: function()
            {
                return GetInstrumentTypes.query();
            },
			getFishermen: function()
            {
				console.log("Inside getFishermen...");
                return GetFishermen.query();
            },
			getSubprojects: function()
            {
				console.log("Inside getSubprojects...");
                return GetSubprojects.query();
            },
			getHabSubproject: function(id)
            {
				console.log("Inside getHabSubproject...");
                return GetHabSubproject.query({id: id});
            },
            getLocationTypes: function()
            {
                return GetLocationTypes.query();
            },
			// We don't really like to set things this way...  Is there a better way?
			getDatasetLocationType: function(aDatastoreName)
			{
				//console.log("Inside services.js, getDatasetLocationType...");
				//console.log("aDatastoreName = " + aDatastoreName);
				// The settings for these are in the config.js file.
				var theLocationType = 0;
				if (aDatastoreName === "AdultWeir")
				{
					console.log("This dataset is for Adult Weir...");
					theLocationType = LOCATION_TYPE_AdultWeir;
				}
				else if (aDatastoreName === "BSample")
				{
					console.log("This dataset is for Water Temperature...");
					theLocationType = LOCATION_TYPE_BSample;
				}
				else if (aDatastoreName === "WaterTemp")
				{
					console.log("This dataset is for Water Temperature...");
					theLocationType = LOCATION_TYPE_WaterTemp;
				}
                else if (aDatastoreName === "SpawningGroundSurvey")
				{
					console.log("This dataset is for Spawning Ground Survey...");
					theLocationType = LOCATION_TYPE_SpawningGroundSurvey;
				}
				else if (aDatastoreName === "CreelSurvey")
				{
					console.log("This dataset is for Creel Survey...");
					theLocationType = LOCATION_TYPE_CreelSurvey;
				}
                else if (aDatastoreName === "Electrofishing")
                {
                    console.log("This dataset is for Electrofishing...");
                    theLocationType = LOCATION_TYPE_Electrofishing;
                }
                else if (aDatastoreName === "SnorkelFish")
                {
                    console.log("This dataset is for Snorkel Fish...");
                    theLocationType = LOCATION_TYPE_SnorkelFish;
                }
                else if (aDatastoreName === "ScrewTrap")
                {
                    console.log("This dataset is for Screw Trap...");
                    theLocationType = LOCATION_TYPE_ScrewTrap;
                }
                else if (aDatastoreName === "FishScales")
                {
                    console.log("This dataset is for Fish Scales...");
                    theLocationType = LOCATION_TYPE_FishScales;
                }
                else if (aDatastoreName === "WaterQuality")
                {
                    console.log("This dataset is for Water Quality with Labs...");
                    theLocationType = LOCATION_TYPE_WaterQuality;
                }
                else if (aDatastoreName === "StreamNet_RperS")
                {
                    console.log("This dataset is for StreamNet_RperS...");
                    theLocationType = LOCATION_TYPE_StreamNet_NOSA;
                }
                else if (aDatastoreName === "StreamNet_NOSA")
                {
                    console.log("This dataset is for StreamNet_NOSA...");
                    theLocationType = LOCATION_TYPE_StreamNet_NOSA;
                }
                else if (aDatastoreName === "StreamNet_SAR")
                {
                    console.log("This dataset is for StreamNet_SAR...");
                    theLocationType = LOCATION_TYPE_StreamNet_SAR;
                }
                else if (aDatastoreName === "ArtificialProduction")
                {
                    console.log("This dataset is for ArtificialProduction...");
                    theLocationType = LOCATION_TYPE_ArtificialProduction;
                }
                else if (aDatastoreName === "Metrics")
                {
                    console.log("This dataset is for Metrics...");
                    theLocationType = LOCATION_TYPE_Metrics;
                }
                else if (aDatastoreName === "JvRearing")
                {
                    console.log("This dataset is for JvRearing...");
                    theLocationType = LOCATION_TYPE_JvRearing;
                }
                else if (aDatastoreName === "Genetic")
                {
                    console.log("This dataset is for Genetic...");
                    theLocationType = LOCATION_TYPE_Genetic;
                }
                else if (aDatastoreName === "Benthic")
                {
                    console.log("This dataset is for Benthic...");
                    theLocationType = LOCATION_TYPE_Benthic;
                }
                else if (aDatastoreName === "Drift")
                {
                    console.log("This dataset is for Drift...");
                    theLocationType = LOCATION_TYPE_Drift;
                }

				return theLocationType;
			},
			// We don't really like to set things this way...  Is there a better way?
			//getSubprojectType: function(aProjectId)
			getProjectType: function(aProjectId)
			{
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
					)
				{
					theType = "Habitat";
				}
				else if (aProjectId === 1217)
					theType = "Harvest";
				else if (aProjectId === 2246)
					theType = "DECD";

				return theType;
			},
            saveDatasetField: function(field, saveResults)
            {
                saveResults.saving = true;

                SaveDatasetField.save(field, function(data){
                    saveResults.saving = false;
                    saveResults.success = true;
                }, function(data){
                    saveResults.saving = false;
                    saveResults.failure = true;
                });

            },
            saveMasterField: function(field, saveResults)
            {
                saveResults.saving = true;

                SaveMasterField.save(field, function(data){
                    saveResults.saving = false;
                    saveResults.success = true;
                }, function(data){
                    saveResults.saving = false;
                    saveResults.failure = true;
                });

            },
            saveNewProjectLocation: function(projectId, location)
            {
                return SaveProjectLocation.save({ProjectId: projectId, Location: location});
            },
            addMasterFieldToDataset: function(datasetId, fieldId)
            {
                return AddMasterFieldToDataset.save({DatasetId: datasetId, FieldId: fieldId});
            },
            removeField: function(datasetId, fieldId)
            {
				console.log("Trying to delete... datasetId = " + datasetId + ", fieldId = " + fieldId);
                return DeleteDatasetField.save({DatasetId: datasetId, FieldId: fieldId});
            },
            getAllInstruments: function()
            {
                return GetAllInstruments.query();
            },
            saveInstrument: function(projectId, instrument){
                return SaveInstrument.save({ProjectId: projectId, Instrument: instrument}); //will connect to this project if creating instrument
            },
            saveFisherman: function(projectId, fisherman, saveResults){
				console.log("Inside saveFisherman...");
				saveResults.saving = true;
				console.log("saveResults.saving = " + saveResults.saving);

				return SaveFisherman.save({ProjectId: projectId, Fisherman:  fisherman});
            },
            saveSubproject: function(projectId, subproject, saveResults){
				console.log("Inside saveSubproject...");
				saveResults.saving = true;
				console.log("saveResults.saving = " + saveResults.saving);

				return SaveSubproject.save({ProjectId: projectId, Subproject:  subproject});
            },
            saveHabSubproject: function(projectId, subproject, saveResults){
				console.log("Inside services.js, saveHabSubproject...");
				saveResults.saving = true;
				console.log("saveResults.saving = " + saveResults.saving);

				return SaveHabSubproject.save({ProjectId: projectId, Subproject:  subproject});
            },
            saveProjectInstrument: function(projectId, instrument){
                return SaveProjectInstrument.save({ProjectId: projectId, Instrument: instrument});
            },
            saveProjectFisherman: function(projectId, fisherman){
                return SaveProjectFisherman.save({ProjectId: projectId, Fisherman: fisherman});
            },
		    removeProjectFisherman: function(projectId, fishermanId){
                return RemoveProjectFisherman.save({ProjectId: projectId, FishermanId: fishermanId});
            },
		    removeProjectInstrument: function(projectId, instrumentId){
                return RemoveProjectInstrument.save({ProjectId: projectId, InstrumentId: instrumentId});
            },
		    removeSubproject: function(projectId, subprojectId){
                return RemoveSubproject.save({ProjectId: projectId, SubprojectId: subprojectId});
            },
		    //removeHabSubproject: function(projectId, subprojectId){
		    removeHabSubproject: function(projectId, subprojectId, locationId){
                //return RemoveHabSubproject.save({ProjectId: projectId, SubprojectId: subprojectId});
                return RemoveHabSubproject.save({ProjectId: projectId, SubprojectId: subprojectId, LocationId: locationId});
            },
		    //removeCorrespondenceEvent: function(projectId, subprojectId, correspondenceEventId){
		    removeCorrespondenceEvent: function(projectId, subprojectId, correspondenceEventId, datastoreTablePrefix){
				console.log("Inside removeCorrespondenceEvent...");
				console.log("projectId = " + projectId + ", subprojectId = " + subprojectId + ", correspondenceEventId = " + correspondenceEventId + ", datastoreTablePrefix = " + datastoreTablePrefix);
                //return RemoveCorrespondenceEvent.save({ProjectId: projectId, SubprojectId: subprojectId, CorrespondenceEventId: correspondenceEventId});
                return RemoveCorrespondenceEvent.save({ProjectId: projectId, SubprojectId: subprojectId, CorrespondenceEventId: correspondenceEventId, DatastoreTablePrefix: datastoreTablePrefix});
            },
		    removeHabitatItem: function(projectId, subprojectId, habitatItemId, datastoreTablePrefix){
				console.log("Inside removeHabitatItem...");
				console.log("projectId = " + projectId + ", subprojectId = " + subprojectId + ", habitatItemId = " + habitatItemId + ", datastoreTablePrefix = " + datastoreTablePrefix);
                return RemoveHabitatItem.save({ProjectId: projectId, SubprojectId: subprojectId, HabitatItemId: habitatItemId, DatastoreTablePrefix: datastoreTablePrefix});
            },
            getProjectFishermen: function(projectId)
			{
				console.log("Inside getProjectFishermen, projectId = " + projectId);
                return GetProjectFishermen.query({id: projectId});
            },
            saveCorrespondenceEvent: function(projectId, subprojectId, ce)
            {
				console.log("Inside saveCorrespondenceEvent...")
				console.log("projectId = " + projectId);
				console.log("subprojectId = " + subprojectId);
				console.log("ce is next...");
				console.dir(ce);
                return SaveCorrespondenceEvent.save({ProjectId: projectId, SubprojectId: subprojectId, CorrespondenceEvent: ce});
            },
            saveHabitatItem: function(projectId, subprojectId, hi)
            {
				console.log("Inside saveHabitatItem...")
				console.log("projectId = " + projectId);
				console.log("subprojectId = " + subprojectId);
				console.log("hi is next...");
				console.dir(hi);
                return SaveHabitatItem.save({ProjectId: projectId, SubprojectId: subprojectId, HabitatItem: hi});
            },
            saveInstrumentAccuracyCheck: function(instrumentId, ac)
            {
                return SaveInstrumentAccuracyCheck.save({InstrumentId: instrumentId, AccuracyCheck: ac});
            },
            updateFile: function(projectId, file)
            {
                return UpdateFile.save({ProjectId: projectId, File: file});
            },
            deleteFile: function(projectId, file)
            {
				console.log("Inside DatastoreService, deleteFile");
				console.log("ProjectId = " + projectId + ", attempting to delete file...");
				console.dir(file);
                return DeleteFile.save({ProjectId: projectId, File: file});
            },
            deleteDatasetFile: function(projectId, datasetId, file)
            {
				console.log("Inside DatastoreService, deleteDatasetFile");
				console.log("ProjectId = " + projectId + ", DatasetId = " + datasetId + ", attempting to delete file...");
				console.dir(file);
                return DeleteDatasetFile.save({ProjectId: projectId, DatasetId: datasetId, File: file});
            },
            deleteCorresEventFile: function(projectId, subprojectId, ceId, file)
            {
				console.log("Inside DatastoreService, deleteCorresEventFile");
				console.log("SubprojectId = " + subprojectId + ", ceId = " + ceId + " attempting to delete file...");
				console.dir(file);
                //return DeleteFile.save({ProjectId: projectId, File: file});
                return DeleteCorresEventFile.save({ProjectId: projectId, SubprojectId: subprojectId, CeId: ceId, File: file});
            },
            deleteHabitatItemFile: function(projectId, subprojectId, hiId, file)
            {
				console.log("Inside DatastoreService, deleteHabitatItemFile");
				console.log("ProjectId = " + projectId + ", SubprojectId = " + subprojectId + ", hiId = " + hiId + " attempting to delete file...");
				console.dir(file);
                //return DeleteFile.save({ProjectId: projectId, File: file});
                return DeleteHabitatItemFile.save({ProjectId: projectId, SubprojectId: subprojectId, HiId: hiId, File: file});
            },
            deleteHabSubprojectFile: function(projectId, subprojectId, file)
            {
				console.log("Inside DatastoreService, deleteHabSubprojectFile");
				console.log("SubprojectId = " + subprojectId + ", attempting to delete file...");
				console.dir(file);
                return DeleteHabSubprojectFile.save({ProjectId: projectId, SubprojectId: subprojectId, File: file});
            },
            deleteLocation: function(locationId)
            {
                return DeleteLocationAction.save({LocationId: locationId});
            },
            getTimeZones: function()
            {
                return GetTimeZones.query();
            }
        };

        return service;
    }
]);

mod.service('DataService', ['$q','$resource', 'Projects', 'Users','Project','ProjectDatasets', 'Activities', 'ActivitiesForView', 'Datasets', 'Data', 'SaveActivitiesAction',
		'UpdateActivitiesAction','QueryActivitiesAction','SetProjectEditors', 'DeleteActivitiesAction', 'SetQaStatusAction', 'GetMyDatasetsAction',
		'GetMyProjectsAction','SaveUserPreferenceAction','ExportActivitiesAction','GetMetadataProperties','SaveDatasetMetadata','GetMetadataFor',
		'SaveProject','GetHeadersDataForDataset','GetDepartments','GetRelationData','SaveUserInfo', 'GetSubprojects','GetHabSubprojects','ProjectSubprojects',
		'ProjectFunders','SubprojectFiles','ProjectCollaborators','DatasetFiles','ProjectFiles','MigrationYears','RunYears','ReportYears','SpawningYears','BroodYears',
		'OutmigrationYears',
    function($q, resource, Projects, Users, Project, ProjectDatasets, Activities, ActivitiesForView, Datasets, Data, SaveActivitiesAction, UpdateActivitiesAction, QueryActivitiesAction,
		SetProjectEditors, DeleteActivitiesAction, SetQaStatusAction, GetMyDatasetsAction, GetMyProjectsAction, SaveUserPreferenceAction, ExportActivitiesAction,
		GetMetadataProperties, SaveDatasetMetadata, GetMetadataFor, SaveProject,GetHeadersDataForDataset, GetDepartments, GetRelationData, SaveUserInfo,
		GetSubprojects, GetHabSubprojects, ProjectSubprojects, ProjectFunders, SubprojectFiles, ProjectCollaborators, DatasetFiles, ProjectFiles, MigrationYears,
		RunYears, ReportYears, SpawningYears, BroodYears, OutmigrationYears){
    var service = {

        //our "singleton cache" kinda thing
        project: null,
        dataset: null,
        metadataProperties: null,
		subproject:  null,
		subprojects: null,
		subprojectType: null,

        setServiceSubprojectType: function(spType)
		{
			console.log("Inside setServiceSubprojectType, spType = " + spType);
			service.subprojectType = spType;
			console.log("service.subprojectType = " + service.subprojectType);
		},

        clearDataset: function()
        {
            service.dataset = null;
        },

        clearProject: function()
        {
            service.project = null;
        },

		clearSubproject: function()
		{
			service.subproject = null;
		},

		clearSubprojects: function()
		{
			service.subprojects = null;
		},

		getSubproject: function(id)
		{
			console.log("Inside services.js, getSubproject...");
			if (service.subproject && service.subproject.Id == id)
				return service.subproject;
		},

        getProject: function(id) {
			console.log("Inside services.js, getProject; id = " + id);
			console.log("service is next...");
			console.dir(service);
            //if(service.project && service.project.Id == id)
            if(service.project && service.project.Id == id && service.subprojectType !== "Habitat") // Not Habitat
			{
				console.log("service.project.Id = " + service.project.Id);
                return service.project;
			}

            service.project = Project.query({id: id});

            service.project.$promise.then(function(){
                //console.log("after-project-load!");
                //do some sorting after we load for instruments
                if(service.project.Instruments && service.project.Instruments.length > 0)
                    service.project.Instruments = service.project.Instruments.sort(orderByAlphaName);

                //and also for locations
                //service.project.Locations = service.project.Locations.sort(orderByAlpha);
            });

            return service.project;
        },

        getMyDatasets: function() {
            return GetMyDatasetsAction.query();
        },

        getMyProjects: function() {
            return GetMyProjectsAction.query();
        },

        getDataset: function(datasetId) {
            if(service.dataset && service.dataset.Id == datasetId)
                return service.dataset;

			console.log("Inside services.js, getDataset...");

            service.dataset = Datasets.query({id: datasetId});

            //load our configuration if there is one
            service.dataset.$promise.then(function(){
                service.configureDataset(service.dataset);
            });

            return service.dataset;
        },

        getRelationData: function(relationFieldId, activityId, rowId){
            return GetRelationData.save({FieldId: relationFieldId, ActivityId: activityId, ParentRowId: rowId});
        },

        //configureDataset: function(dataset)
        configureDataset: function(dataset, scope)
        {
            console.log("configuring dataset!" + dataset.Id);
			console.log("dataset.Name = " + dataset.Name);
            //default page routes
            dataset.activitiesRoute = "activities"; //default route -- when they click to go to "activities" this is the route they should use.

            //objectify our dataset config for later use
			console.log("dataset.Config is next...");
			console.dir(dataset.Config);
            //if(dataset.Config) // Original line.
			// If we are verifying the variable is defined, this works the best.  Lastly, the database column config may either be null, or contain the text "NULL", so we must check for that too.
			if ((typeof dataset.Config !== 'undefined') && (dataset.Config !== null) && (dataset.Config !== "NULL"))
            {
                dataset.Config = angular.fromJson(dataset.Config);

                //if there are page routes in configuration, set them in our dataset
                if(dataset.Config.ActivitiesPage)
                    dataset.activitiesRoute = dataset.Config.ActivitiesPage.Route;

                //part of configuration is authorization.  If the user isn't authorized
                //  for this dataset, bump them to error
                if(dataset.Config.RestrictRoles)
                {
                    var authorized = false;
                    for (var i = dataset.Config.RestrictRoles.length - 1; i >= 0; i--) {
                        if(angular.rootScope.Profile.hasRole(dataset.Config.RestrictRoles[i]))
                            authorized = true;
                    };

                    if(!authorized)
					{
						//angular.rootScope.go('/unauthorized');
						scope.AuthorizedToViewProject = false;
					}

                    //console.dir(angular.rootScope.Profile);
                    //console.dir(dataset.Config.RestrictRoles);
                }

            }
        },

        getHeadersDataForDataset: function(datasetId) {
            return GetHeadersDataForDataset.query({id: datasetId});
        },

        getActivityData: function(id) {
            return Data.query({id: id});
        },

        getActivities: function(id) {
            return Activities.query({id: id});
        },

        getActivitiesForView: function(id) {
            return ActivitiesForView.query({id: id});
        },

        getProjects: function() {
            return Projects.query();
        },

		getSubprojects: function()
		{
			return GetSubprojects.query();
		},

		getHabSubprojects: function()
		//getHabSubprojects: function(id)
		{
			console.log("Inside services, getHabSubprojects");
			//console.log("id = " + id);
			return GetHabSubprojects.query();
			//return GetHabSubprojects.query({id: id});
		},

		getMigrationYears: function(datasetId)
		{
			console.log("Inside services, getMigrationYears");
			return MigrationYears.query({id: datasetId});
		},

		getRunYears: function(datasetId)
		{
			console.log("Inside services, getRunYears");
			return RunYears.query({id: datasetId});
		},

		getReportYears: function(datasetId)
		{
			console.log("Inside services, getReportYears");
			return ReportYears.query({id: datasetId});
		},

		getSpawningYears: function(datasetId)
		{
			console.log("Inside services, getSpawningYears");
			return SpawningYears.query({id: datasetId});
		},

		getBroodYears: function(datasetId)
		{
			console.log("Inside services, getBroodYears");
			return BroodYears.query({id: datasetId});
		},

		getOutmigrationYears: function(datasetId)
		{
			console.log("Inside services, getOutmigrationYears");
			return OutmigrationYears.query({id: datasetId});
		},

        getUsers: function() {
            return Users.query();
        },

        getDepartments: function(){
            return GetDepartments.query();
        },

        getProjectDatasets: function(projectId){
            this.getProject(projectId); //set our local project to the one selected
            return ProjectDatasets.query({id: projectId});
        },

        /*getProjectSubprojects: function(projectId){
			console.log("Inside getProjectSubprojects...");
            //this.getProject(projectId); //set our local project to the one selected
            return ProjectSubprojects.query({id: projectId});
        },*/
        getProjectSubprojects: function(projectId){
			console.log("Inside getProjectSubprojects, projectId = " + projectId);
            //this.getProject(projectId); //set our local project to the one selected
            return ProjectSubprojects.save({ProjectId: projectId});
        },

        getProjectFunders: function(projectId){
			console.log("Inside getProjectFunders, projectId = " + projectId);
            this.getProject(projectId); //set our local project to the one selected
            return ProjectFunders.query({id: projectId});
        },

        getProjectCollaborators: function(projectId){
			console.log("Inside getProjectCollaborators...");
            this.getProject(projectId); //set our local project to the one selected
            return ProjectCollaborators.query({id: projectId});
        },

        getProjectFiles: function(projectId){
			console.log("Inside getProjectFiles...");
			console.log("projectId = " + projectId);
            return ProjectFiles.query({id: projectId});
        },

        getDatasetFiles: function(datasetId){
			console.log("Inside getDatasetFiles...");
			console.log("datasetId = " + datasetId);
            //this.getProject(projectId); //set our local project to the one selected
            return DatasetFiles.query({id: datasetId});
        },

        getSubprojectFiles: function(projectId){
			console.log("Inside getSubprojectFiles...");
			console.log("projectId = " + projectId);
            this.getProject(projectId); //set our local project to the one selected
            return SubprojectFiles.query({id: projectId});
        },

        getMetadataProperty: function(propertyId){

            if(!service.metadataProperties)
            {
                this._loadMetadataProperties().$promise.then(function(){
                   return service.metadataProperties["ID_"+propertyId];
               });
            }
            else
            {
                return service.metadataProperties["ID_"+propertyId];
            }
        },

        getMetadataProperties: function(propertyTypeId) {

            var properties = $q.defer();

            if(!service.metadataProperties)
            {
                this._loadMetadataProperties().$promise.then(function(){
                    properties.resolve(getMatchingByField(service.metadataProperties, propertyTypeId, 'MetadataEntityId'));
                });
            }else{
                properties.resolve(getMatchingByField(service.metadataProperties, propertyTypeId, 'MetadataEntityId'));
            }

            return properties;

        },

        getMetadataFor: function(projectId, typeId)
        {
            return GetMetadataFor.save({ProjectId: projectId, EntityTypeId: typeId});
        },

        //returns promise so you can carry on once it loads.
        _loadMetadataProperties: function()
        {
            return GetMetadataProperties.query(function(data){
                service.metadataProperties = {};
                angular.forEach(data, function(value, key){
                    service.metadataProperties["ID_"+value.Id] = value;
                });
            });

        },

        saveDatasetMetadata: function(datasetId, metadata, saveResults)
        {
            var payload = {
                DatasetId: datasetId,
                Metadata: metadata
            };

            return SaveDatasetMetadata.save(payload);

        },

        saveProject: function(project)
        {
            return SaveProject.save({Project: project});
        },

        //this should give you the possible QA Statuses for this dataset's rows
        getPossibleRowQAStatuses: function(id){
            //for now we fake it:
            return
            [{
                id: 1,
                name: "ok",
            },
            {   id: 2,
                name: "error",
            }
            ]

        },

        queryActivities: function(query)
        {
            //using "save" here because we need to POST our query criteria object
            QueryActivitiesAction.save(query.criteria, function(data){
                query.results = data;
                query.errors = undefined;
                console.log("success!");
                query.loading = false;
            }, function(data){
                query.results = undefined;
                query.errors = ["There was a problem running your querying.  Please try again or contact support."];
                console.log("Failure!");
                console.dir(data);
                query.loading = false;
            });

        },

        exportActivities: function(query)
        {
            ExportActivitiesAction.save(query.criteria, function(data){
                console.log("success!");
                query.loading = false;
                query.exportedFile = data;
                console.dir(data);
                //console.dir(angular.fromJson(data));
            }, function(data){
                console.log("Failure!");
                query.failed = true;
                query.loading = false;
            });
        },

        //updateActivities: function(userId, datasetId, activities)
        updateActivities: function(userId, datasetId, activities, datastoreTablePrefix)
        {
            activities.saving = true; //tell everyone we are saving
            activities.UserId = userId;
            activities.DatasetId = datasetId;
			activities.DatastoreTablePrefix = datastoreTablePrefix;
            UpdateActivitiesAction.save(activities, function(data){
                activities.success = "Update successful.";
                activities.errors = false;
                console.log("Success!");
                activities.saving = false; //and... we're done.
            }, function(data){
                activities.success = false;
                activities.errors = {saveError: "There was a problem saving your data.  Please try again or contact support."};
                console.log("Failure!");
                console.dir(data);
                activities.saving = false; //and... we're done.
            });

        },

        saveEditors: function(userId, projectId, editors, saveResults)
        {
            saveResults.saving = true;
            var payload = {
                ProjectId: projectId,
                Editors: editors,
            };

            SetProjectEditors.save(payload, function(data){
                saveResults.saving = false;
                saveResults.success = true;
            }, function(data){
                saveResults.saving = false;
                saveResults.failure = true;
            });

        },

        saveUserPreference: function(name, value, results)
        {
            var payload = {UserPreference: {Name: name, Value: value}};

            SaveUserPreferenceAction.save(payload, function(data){
                results.done = true;
                results.success = true;
            }, function(data){
                results.done = true;
                results.failure = true;
            });

        },

        saveUserInfo: function(user, scope)
        {
			console.log("Inside services, Dataservice.saveUserInfo...");
            var payload = {User: user};

            SaveUserInfo.save(payload, function(data){
                //scope.savePreferencesResults.done = true;
                scope.savePreferencesResults.success = true;
				console.log("scope.savePreferencesResults.success = " + scope.savePreferencesResults.success);
            }, function(data){
                //scope.savePreferencesResults.done = true;
                scope.savePreferencesResults.failure = true;
				console.log("scope.savePreferencesResults.failure = " + scope.savePreferencesResults.failure);
            });

        },

        saveActivities: function(userId, datasetId, activities)
        {
			console.log("Inside saveActivities...starting save...");
			console.log("activities is next...");
			console.dir(activities);

			var theDate = new Date();
			console.log(formatDate(theDate));

            activities.saving = true; //tell everyone we are saving
            activities.UserId = userId;
            activities.DatasetId = datasetId;
            return SaveActivitiesAction.save(activities, function(data){
                //activities.success = "Save successful.";
                activities.errors = false;
				console.log("Set activities.errors...");
                activities.new_records = data;
                console.log("Success!");
				// Situation 1:  The user has NOT clicked Add Section yet, but has clicked Save and close.
				if (typeof activities.addNewSection === 'undefined')
				{
					console.log("Save and close save successful..., Add Section not clicked.");
					activities.success = "Save successful."; // This line closes the page after a successful save; this is for Save and close.
				}
				// Situation 2:  The user has clicked Add Section on that page, before clicking Save and close on the last record entered.
				else if (activities.addNewSection === false)
				{
					console.log("Save and close save successful..., Add Section previously clicked.");
					activities.success = "Save successful."; // This line closes the page after a successful save; this is for Save and close.
				}
				// Situation 3:  The user has only clicked Add Section.
				else if (activities.addNewSection === true)
				{
					console.log("Add Section save successful..., Add Section only clicked.");
					activities.addNewSection = false; // This flag indicates to the Data Entry form that we are adding a new section, not save and close.
				}

                activities.saving = false; //and... we're done.
            }, function(data){
                activities.success = false;
                // activities.errors = {saveError: "There was a problem saving your data.  Please try again or contact support."}; // Original line.
				// Let's provide a little more information that will help us figure out what happened.
				var theErrorText = "";
				if (typeof data.message !== 'undefined')
					theErrorText = data.message;
				else if (typeof data.data !== 'undefined')
				{
					if (typeof data.data.ExceptionMessage !== 'undefined')
					{
						theErrorText = data.data.ExceptionMessage;
						console.log("Save error:  theErrorText = " + theErrorText);
					}
					else
					{
						theErrorText =  data.data;
						var titleStartLoc = theErrorText.indexOf("<title>") + 7;
						console.log("titleStartLoc = " + titleStartLoc);
						var titleEndLoc = theErrorText.indexOf("</title>");
						console.log("titleEndLoc = " + titleEndLoc);
						theErrorText = theErrorText.substr(titleStartLoc, titleEndLoc - titleStartLoc);
					}
				}
				var theErrorMessage = "There was a problem saving your data (" + theErrorText + ").  Please try again or contact support.";
                activities.errors = {saveError: theErrorMessage};
                console.log("Failure!");
				console.log(theErrorText);
				console.log(theErrorMessage);
                console.dir(data);
                activities.saving = false; //and... we're done.
            });
        },

        //delete selectedItems activities
        deleteActivities: function(userId, datasetId, grid, saveResults) {

            if(!grid.selectedItems)
            {
                saveResults.success = true;
                saveResults.message = "Nothing to do.";
                return;
            }

            var payload = {
                UserId: userId,
                DatasetId: datasetId,
                Activities: grid.selectedItems,
            }

            DeleteActivitiesAction.save(payload, function(data){
                saveResults.success = true;
                saveResults.message = "Activities Deleted.";
            }, function(data){
                saveResults.failure = true;
                saveResults.message = "There was a problem deleting the records.  Please try again or contact support.";
            });

        },

        updateQaStatus: function(ActivityId, QAStatusId, Comments, saveResults){
            saveResults.saving = true;
            var payload = {
                QAStatusId: QAStatusId,
                ActivityId: ActivityId,
                Comments: Comments,
            };

            console.dir(payload);

            SetQaStatusAction.save(payload, function(data){
                saveResults.saving = false;
                saveResults.success = true;
            },
            function(data){
                saveResults.saving = false;
                saveResults.failure = true;
            });
        },



    };

    service.getMetadataProperty(1); //cause our metadata properties to be loaded early.

    return service;

}]);


//ActivityParser
// Works with a wide datasheet that includes both headers and details that might represent multiple locations/days of activity
//  This full sheet idea makes it easier for data entry and importing, but we need to use this function to break
//  them out into individual activities.
/* when we're done our data will look like this:

{ "activities":{"76_10/1/2013":{"LocationId":"76","ActivityDate":"2013-10-01T07:00:00.000Z","Header":{"WaterTemperature":4,"TimeStart":"","TimeEnd":"","WaterFlow":"","AirTemperature":""},"Details":[{"locationId":"76","activityDate":"10/1/2013","WaterTemperature":4,"Species":"CHS","Sex":"M","Origin":"HAT","Mark":"[\"None\"]","Disposition":"PA","ForkLength":488,"Weight":"","TotalLength":"","GeneticSampleId":"","RadioTagId":"","FishComments":"","TimeStart":"","TimeEnd":"","WaterFlow":"","AirTemperature":"","Solution":"","SolutionDosage":""}]}},
  "errors":false,
  "UserId":1,
  "DatasetId":5
}

*/


mod.service('ActivityParser',[ 'Logger',
    function(Logger){
        var service = {

            parseMetricsActivity: function(heading, fields, qaStatuses) {
				console.log("Inside service, ActivityParser, parseMetricsActivity...");
				console.log("heading is next...");
				console.dir(heading);
				console.log("qaStatuses is next");
				console.dir(qaStatuses);
                var activities = {activities: {}, errors: false};

                //var tmpdata = data.slice(0); // create a copy.

                var key = service.makeKey(heading, null);

                if(key)
				{
                    /*if(tmpdata.length > 0) {
                        angular.forEach(tmpdata, function(data_row, index){
                            //note we mash the heading fields into our row -- addActivity splits them out appropriately.
                            //service.addActivity(activities, key, angular.extend(data_row, heading), fields);
                            service.addActivity(activities, key, angular.extend(data_row, heading), fields, qaStatuses);
                        });
                    }
                    else
					{*/
                        //at least do a single.
                        console.log("trying a single with no rows!");
                        //service.addActivity(activities, key, heading, fields);
                        service.addActivity(activities, key, heading, fields, qaStatuses);
                    //}
                }
                else
				{
                    service.addError(activities, 0, "Both a Location and ActivityDate are required to save a new Activity.");
                }


                return activities;

            },

			//parseSingleActivity: function(heading, data, fields) {
            parseSingleActivity: function(heading, data, fields, qaStatuses) {
				console.log("Inside service, ActivityParser, parseSingleActivity...");
				console.log("heading is next...");
				console.dir(heading);
				console.log("qaStatuses is next");
				console.dir(qaStatuses);
                var activities = {activities: {}, errors: false};

                var tmpdata = data.slice(0); // create a copy.

                var key = service.makeKey(heading, null);

                if(key)
				{
                    if(tmpdata.length > 0) {
                        angular.forEach(tmpdata, function(data_row, index){
                            //note we mash the heading fields into our row -- addActivity splits them out appropriately.
                            //service.addActivity(activities, key, angular.extend(data_row, heading), fields);
                            service.addActivity(activities, key, angular.extend(data_row, heading), fields, qaStatuses);
                        });
                    }
                    else
					{
                        //at least do a single.
                        console.log("trying a single with no rows!");
                        //service.addActivity(activities, key, heading, fields);
                        service.addActivity(activities, key, heading, fields, qaStatuses);
                    }
                }
                else
				{
                    service.addError(activities, 0, "Both a Location and ActivityDate are required to save a new Activity.");
                }


                return activities;

            },

            //parses an array of header+detail fields into discrete activities
            //parseActivitySheet: function(data, fields){
            //parseActivitySheet: function(data, fields, datastoreTablePrefix, callingPage){
            parseActivitySheet: function(data, fields, datastoreTablePrefix, callingPage, qaStatuses){
				console.log("Inside services, parseActivitySheet...called by " + callingPage);
				console.log("data is next...");
				console.dir(data);
				console.log("qaStatuses is next...");
				console.dir(qaStatuses);
                var activities = {activities: {}, errors: false};

                var tmpdata = data.slice(0); //create a copy

				var activityDateToday = new Date(); //need an activity date to use for the whole sheet, if we need to provide one.

				/* If we are adding data from a temperature logger, we will have lots of data with the same FieldActivityType (Data File Upload).
				*  In this case, the FieldActivityType will be the same, but the ReadingDateTime will change for each record.
				*  However, if the user adds several different other activities using the Data Entry Sheet, the FieldActivityType could be the same,
				*  but the ReadingDateTime will change. Therefore, we must check the FieldActivityType AND the ReadingDateTime of each non-Data File Upload
				*  record we are saving.  If either value is different from the last record, the activity has changed and we must get/create a new key,
				*  so that the record is stored as a new activity.
				*/
				var holdRow = tmpdata[0];
				var rowCount = 0;
                angular.forEach(tmpdata, function(row, index){
					if ((typeof datastoreTablePrefix !== 'undefined') && (datastoreTablePrefix === "WaterTemp") &&
						(typeof callingPage !== 'undefined') && (callingPage === "DataEntrySheet"))
					{

						console.log("holdRow is next...");
						console.dir(holdRow);

						console.log("holdRow.FieldActivityType.toString() = " + holdRow.FieldActivityType.toString());
						console.log("row.FieldActivityType.toString() = " + row.FieldActivityType.toString());
						console.log("holdRow.ReadingDateTime.toString() = " + holdRow.ReadingDateTime.toString());
						console.log("row.ReadingDateTime.toString() = " + row.ReadingDateTime.toString());

						if (rowCount > 0)
						{
							//var tmpReadingDateTime = formatDateFromFriendlyToUtc(row.ReadingDateTime.toString());
						}

						// If the FieldActivityType IS NOT "Data File Upload", we need to check two more things.
						if (row.FieldActivityType.toString().indexOf("Data File Upload") === -1)
						{
							console.log("We are working with something other than Data File Upload.");
							// If rowCount = 0, we are on the first record, with nothing to compare with but itself.
							if (rowCount > 0)
							{
								// If either the FieldActivityType or the ReadingDateTime are different, the record is a new activity,
								// so we need a new date for the key.
								if ((row.FieldActivityType.toString().indexOf(holdRow.FieldActivityType.toString()) === -1) ||
									(row.ReadingDateTime.toString().indexOf(holdRow.ReadingDateTime.toString()) === -1))
								{
									console.log("Something changed...");
									activityDateToday = new Date();
								}
							}
						}


						var key = service.makeKey(row, activityDateToday);
						console.log("row...index");
						console.dir(row);
						console.dir(index);
						console.log("key...");
						console.dir(key);

						if(key)
						{
							//service.addActivity(activities, key, row, fields);
                            service.addActivity(activities, key, row, fields, qaStatuses);
						}
						else
							service.addError(activities, index, "Please check for errors, something required is missing to save a new Activity.");

						rowCount++;
						holdRow = row;

						console.log("holdRow.ReadingDateTime = " + holdRow.ReadingDateTime);
						var utcFormatSeparatorLoc = holdRow.ReadingDateTime.toString().indexOf("-");
						console.log("utcFormatSeparatorLoc = " + utcFormatSeparatorLoc);
						if (utcFormatSeparatorLoc > -1)
						{
							console.log("Reformatting holdRow.ReadingDateTime to friendly date format...");
							holdRow.ReadingDateTime = formatDateFromUtcToFriendly(holdRow.ReadingDateTime);
							console.log("Reformatted holdRow.ReadingDateTime = " + holdRow.ReadingDateTime);
						}
					}
					else
					{
						var key = service.makeKey(row, activityDateToday);

						if(key)
						{
							//service.addActivity(activities, key, row, fields);
                            service.addActivity(activities, key, row, fields, qaStatuses);
						}
						else
							service.addError(activities, index, "Please check for errors, something required is missing to save a new Activity.");
					}

					//console.log("At the end of the angular.forEach, going back to the top...");
				});

                return activities;
            },

            addError: function(activities, index, message){
				console.log("Inside services.js, parseActivitySheet, addError...");
                if(!activities.errors)
                {
                    activities.errors = {};
                }
                activities.errors.saveError = message;
            },


            makeKey: function(row, activityDateToday) {

                // Some codepaths pass null for activityDateToday
                if(activityDateToday == null)
                    activityDateToday = new Date();

                if(!row.activityDate)
                    row.activityDate = toExactISOString(activityDateToday);

                if(row.locationId && row.activityDate)
                    return location + '_' + row.activityDate;

                return undefined;
            },

            //addActivity: function(activities, key, row, fields){
            addActivity: function(activities, key, row, fields, qaStatuses){
				//console.log("Inside services, addActivity...");
				//console.log("qaStatuses is next...");
				//console.dir(qaStatuses);
                if(row.Timezone)
                    var currentTimezone = row.Timezone;

                if(!activities.activities[key])
                {

                    var a_date = row.activityDate;

                    if(row.activityDate instanceof Date)
                    {
                        //console.log("is a Date");

                        a_date = toExactISOString(row.activityDate); //
                        console.log(a_date);
                    }
                    else
                    {
                        //console.log("Is a string.");
                        a_date = row.activityDate;
                    }
                    //console.log("finally: " + a_date);

                    //console.log(a_date);

                    //setup the new activity object structure
                    activities.activities[key] = {
                        LocationId: row.locationId,
                        ActivityDate: a_date,
                        InstrumentId: row.InstrumentId,
                        Header: {},
                        Details: [],
                    };

                    if(row.AccuracyCheckId)
                        activities.activities[key].AccuracyCheckId = row.AccuracyCheckId;

                    if(row.PostAccuracyCheckId)
                        activities.activities[key].PostAccuracyCheckId = row.PostAccuracyCheckId;

                    if(row.Timezone)
                    {
                        activities.activities[key].Timezone = angular.toJson(row.Timezone).toString();
                        row.Timezone = undefined;
                    }

                    //add in activityqa if there isn't one (now required)
                    if(!row.ActivityQAStatus)
                    {
                        //datasheet case
                        row.ActivityQAStatus =
                            {
                                QAStatusId: row.QAStatusId,
                                Comments: ''
                            };
                        row.QAStatusId = row.RowQAStatusId; // and then set QA status for this row...
                    }
					else
					{
						//console.log("row.ActivityQAStatus already exists...");
						//console.dir(row.ActivityQAStatus);
					}

					if ((typeof qaStatuses !== 'undefined') && (qaStatuses !== null))
					{
						for (var i = 0; i < qaStatuses.length; i++)
						{
							//console.log("Checking QId:  " +qaStatuses[i].Id + ", Name:  " + qaStatuses[i].Name);
							//console.log("row.ActivityQAStatus.QAStatusId = " + row.ActivityQAStatus.QAStatusId);
							//if (row.ActivityQAStatus.QAStatusId.indexOf(qaStatuses[i].Id) > -1)
							if (row.ActivityQAStatus.QAStatusId === qaStatuses[i].Id)
							{
								//console.log("This is the match...");
								row.QAStatusName = qaStatuses[i].Name;
								row.QAStatusDescription = qaStatuses[i].Description;
							}
							else
							{
								//console.log("Did not match...");
							}
						}
					}
					else
					{
						throw qaStatusError ("Services-addActivity, check1 has a problem with QAStatus...");
					}

					//console.log("row is next...");
					//console.dir(row);
                    activities.activities[key].ActivityQAStatus =
                    {
                        QAStatusID: row.ActivityQAStatus.QAStatusId,
                        Comments: row.ActivityQAStatus.Comments,
						Name: row.QAStatusName,
						Description:  row.QAStatusDescription
                    };
					//console.log("ActivityQAStatus is next...");
					//console.dir(activities.activities[key].ActivityQAStatus);



                    //true if we are editing...
                    if(row.ActivityId)
                        activities['ActivityId'] = row.ActivityId;

                    //copy the other header fields from this first row.
                    angular.forEach(fields.header, function(field){

                        //flatten multiselect values into an json array string
                        if(field.ControlType == "multiselect" && row[field.DbColumnName])
                        {
                            row[field.DbColumnName] = angular.toJson(row[field.DbColumnName]).toString(); //wow, definitely need tostring here!
                        }

                        activities.activities[key].Header[field.DbColumnName] = row[field.DbColumnName];
                    });

                }

                //add in activityqa if there isn't one (now required) -- for every row
                if(!row.ActivityQAStatus)
                {
                    //datasheet case
                    row.ActivityQAStatus =
                        {
                            QAStatusId: row.QAStatusId,
                            Comments: ''
                        };
                    row.QAStatusId = row.RowQAStatusId; // and then set QA status for this row...

					for (var i = 0; i < qaStatuses.length; i++)
					{
						//console.log("Checking QId:  " +qaStatuses[i].Id + ", Name:  " + qaStatuses[i].Name);
						//console.log("row.ActivityQAStatus.QAStatusId = " + row.ActivityQAStatus.QAStatusId);
						//if (row.ActivityQAStatus.QAStatusId.indexOf(qaStatuses[i].Id) > -1)
						if (row.ActivityQAStatus.QAStatusId === qaStatuses[i].Id)
						{
							//console.log("This is the match...");
							row.QAStatusName = qaStatuses[i].Name;
							row.QAStatusDescription = qaStatuses[i].Description;
						}
						else
						{
							//console.log("Did not match...");
						}
					}
                }
				else
				{
					//console.log("row.ActivityQAStatus already exists...");
					//console.dir(row);
				}

				if ((typeof qaStatuses !== 'undefined') && (qaStatuses !== null))
				{
					for (var i = 0; i < qaStatuses.length; i++)
					{
						//console.log("Checking QId:  " +qaStatuses[i].Id + ", Name:  " + qaStatuses[i].Name);
						//console.log("row.ActivityQAStatus.QAStatusId = " + row.ActivityQAStatus.QAStatusId);
						//if (row.ActivityQAStatus.QAStatusId.indexOf(qaStatuses[i].Id) > -1)
						if (row.ActivityQAStatus.QAStatusId === qaStatuses[i].Id)
						{
							//console.log("This is the match...");
							row.QAStatusName = qaStatuses[i].Name;
							row.QAStatusDescription = qaStatuses[i].Description;
						}
						else
						{
							//console.log("Did not match...");
						}
					}
				}
				else
				{
					throw qaStatusError ("Services-addActivity, check2 has a problem with QAStatus...");
				}

                //iterate through each field and do any necessary processing to field values
                var rowHasValue = prepFieldsToSave(row, fields.detail, currentTimezone);

                //console.dir(fields);

                //iterate through fields now and also prep any grid fields
                angular.forEach(Object.keys(fields.relation), function(relation_field){
                    //console.dir(relation_field);
                    //console.log("we ahve a grid cell to save!: " + relation_field);
                    var rel_grid = row[relation_field];
                    //console.dir(rel_grid);
                    angular.forEach(rel_grid, function(grid_row)
                    {
                        //console.dir(grid_row);
                        var gridHasValue = prepFieldsToSave(grid_row, fields.relation[relation_field], currentTimezone);
                        rowHasValue = (rowHasValue) ? rowHasValue : gridHasValue; //bubble up the true!
                    });
                });

                //only save the detail row if we have a value in at least one of the fields.
                if(rowHasValue)
                    activities.activities[key].Details.push(row);

            },

        };

        return service;
    }]);

function prepFieldsToSave(row, fields, currentTimezone)
{
    var rowHasValue = false;

    //handle field level validation or processing
    angular.forEach(fields, function(field){
        if(row[field.DbColumnName])
        {
            //flatten multiselect values into an json array string
            if(field.ControlType == "multiselect")
                row[field.DbColumnName] = angular.toJson(row[field.DbColumnName]).toString(); //wow, definitely need tostring here!

            //convert to a date string on client side for datetimes
            if(field.ControlType == "datetime" && row[field.DbColumnName])
            {
                if(row[field.DbColumnName] instanceof Date)
                {
                    row[field.DbColumnName] = toExactISOString(row[field.DbColumnName]);
                }
                else
                {
                    try{
                        row[field.DbColumnName] = toExactISOString(new Date(row[field.DbColumnName]));
                    }catch(e){
                        console.log("Error converting date: "+row[field.DbColumnName]);
                    }
                }
            }

            rowHasValue = true;
        }
    });

    return rowHasValue;

}

mod.service('FileUploadService',['$q','$upload',function($q, $upload){
	var service = {
		uploadFiles: function(filesToUpload, $scope){
			console.log("Inside FileUploadService, uploadFiles...");
			console.log("$scope is next...");
			console.dir($scope);

			$scope.uploadErrorMessage = undefined;

			var promises = [];

			angular.forEach(filesToUpload, function(files, field){

				if(field == "null" || field == "")
					return;

				console.log("handling files for: " + field);
				console.log("files is next...");
				console.dir(files);

				// If the user selected a file, but it was already in the file list (project, or dataset, or subproject),
				// and then DID NOT select another file for that field, the field will be detectable, but its value will be undefined.
				// Example:  They after picking a duplicate, they omitted that entry, made a different update, and then saved.
				// Therefore, verify that the field's value IS NOT undefined, before proceding.
				if (typeof files !== 'undefined')
				{
					for(var i = 0; i < files.length; i++)
					{
						var file = files[i];

						if ($scope.dataset.Id)
						{
							console.log("Checking if file " + file.Name + " already exists in the dataset files...");
							for (var p = 0; p < $scope.dataset.Files.length; p++)
							{
								if (file.Name.length <= $scope.dataset.Files[p].Name.length)
								{
									if ($scope.dataset.Files[p].Name.indexOf(file.Name) > -1)
									{
										$scope.foundDuplicate = true;
										console.log("...Yes, it does.");
									}
								}
							}
						}
						else
						{
							console.log("Checking if file " + file.Name + " already exists in the project files...");
							for (var p = 0; p < $scope.project.Files.length; p++)
							{
								if (file.Name.length <= $scope.project.Files[p].Name.length)
								{
									if ($scope.project.Files[p].Name.indexOf(file.Name) > -1)
									{
										$scope.foundDuplicate = true;
										console.log("...Yes, it does.");
									}
								}
							}
						}
						console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);
						if ($scope.foundDuplicate === false)
							console.log("...No, it does not.  The file name is good.")

						//if(file.success != "Success")
						if (($scope.foundDuplicate === false) && (file.success != "Success"))
						{

							var deferred = $q.defer();

							if ($scope.DatastoreTablePrefix === "CrppContracts")
							{
								$upload.upload({
									url: serviceUrl + '/data/UploadSubProjectFile',
									method: "POST",
									// headers: {'headerKey': 'headerValue'},
									// withCredential: true,
									data: {ProjectId: $scope.project.Id, SubprojectId: $scope.viewSubproject.Id, Description: "Uploaded file for: "+file.Name, Title: file.Name},
									file: file,

								}).progress(function(evt) {
									console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

								}).success(function(data, status, headers, config) {
									//console.dir(data);
									config.file.success = "Success";
									config.file.data = data;
									deferred.resolve(data);

								})
								.error(function(data, status, headers, config) {
									$scope.uploadErrorMessage = "There was a problem uploading your file for the subproject.  Please try again or contact the Helpdesk if this issue continues.";
									console.log(" error.");
									config.file.success = "Failed";
									deferred.reject();

								});

								promises.push(deferred.promise);
							}
							else
							{
								$upload.upload({
									//url: serviceUrl + '/data/UploadProjectFile',
									url: serviceUrl + '/data/UploadDatasetFile',
									method: "POST",
									// headers: {'headerKey': 'headerValue'},
									// withCredential: true,
									//data: {ProjectId: $scope.project.Id, Description: "Uploaded file for: "+file.Name, Title: file.Name},
									data: {ProjectId: $scope.project.Id, DatasetId: $scope.dataset.Id, Description: "Uploaded file for: " + file.Name, Title: file.Name},
									file: file,

								}).progress(function(evt) {
									console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

								}).success(function(data, status, headers, config) {
									//console.dir(data);
									config.file.success = "Success";
									config.file.data = data;
									deferred.resolve(data);

								})
								.error(function(data, status, headers, config) {
									$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
									console.log(" error.");
									config.file.success = "Failed";
									deferred.reject();

								});

								promises.push(deferred.promise);
							}
						}
						else
						{
							console.log("$scope.foundDuplicate is true OR file.success == Success");
							if ($scope.DatastoreTablePrefix === "CrppContracts")
							{
								$scope.uploadErrorMessage = "The file is already in the subproject files.  Please choose another file name, try again, or contact the Helpdesk if this issue continues.";
								console.log(" error.");
								var errors = [];
								errors.push("File " + file.Name + " already exists in the subproject files.");
								$scope.onRow.errors = errors;
								//config.file.success = "Failed";
								//deferred.reject();
								//promises.push(deferred.promise);
							}
							else
							{
								$scope.uploadErrorMessage = "The file is already in the project files.  Please choose another file name, try again, or contact the Helpdesk if this issue continues.";
								console.log(" error.");
								var errors = [];
								errors.push("File " + file.Name + " already exists in the project files.");
								$scope.onRow.errors = errors;
								//config.file.success = "Failed";
								//deferred.reject();
								//promises.push(deferred.promise);
							}
						}

					}
				}
			});

			return $q.all(promises);
		},

		uploadSubprojectFiles: function(filesToUpload, $scope){
			console.log("Inside FileUploadService, uploadSubprojectFiles...");
			console.log("$scope is next...");
			console.dir($scope);

			$scope.uploadErrorMessage = undefined;

			var promises = [];

			angular.forEach(filesToUpload, function(files, field){

				if(field == "null" || field == "")
					return;

				console.log("handling files for: " + field)

				for(var i = 0; i < files.length; i++)
				{
					var file = files[i];
					console.log("Checking if file " + file.Name + " already exists in the subproject files...");

					for (var p = 0; p < $scope.viewSubproject.Files.length; p++)
					{
						if (file.Name.length <= $scope.viewSubproject.Files[p].Name.length)
						{
							if ($scope.viewSubproject.Files[p].Name.indexOf(file.Name) > -1)
							{
								$scope.foundDuplicate = true;
								console.log("...Yes, it does.");
							}
						}
					}
					console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);
					if ($scope.foundDuplicate === false)
						console.log("...No, it does not.  The file name is good.")

					//if(file.success != "Success")
					console.log("file is next...");
					console.dir(file);
					if (($scope.foundDuplicate === false) && (file.success != "Success"))
					{
						var deferred = $q.defer();

						if ($scope.DatastoreTablePrefix === "CrppContracts")
						{
							$upload.upload({
								url: serviceUrl + '/data/UploadSubprojectFile',
								method: "POST",
								// headers: {'headerKey': 'headerValue'},
								// withCredential: true,
								data: {ProjectId: $scope.project.Id, SubprojectId: $scope.viewSubproject.Id, Description: "Uploaded file for: "+file.Name, Title: file.Name},
								file: file,

							}).progress(function(evt) {
								console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

							}).success(function(data, status, headers, config) {
								//console.dir(data);
								config.file.success = "Success";
								config.file.data = data;
								deferred.resolve(data);

							}).error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file for the subproject.  Please try again or contact the Helpdesk if this issue continues.";
								console.log(" error.");
								config.file.success = "Failed";
								deferred.reject();

							});

							promises.push(deferred.promise);
						}
						else
						{
							$upload.upload({
								url: serviceUrl + '/data/UploadProjectFile',
								method: "POST",
								// headers: {'headerKey': 'headerValue'},
								// withCredential: true,
								data: {ProjectId: $scope.project.Id, Description: "Uploaded file for: "+file.Name, Title: file.Name},
								file: file,

							}).progress(function(evt) {
								console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

							}).success(function(data, status, headers, config) {
								//console.dir(data);
								config.file.success = "Success";
								config.file.data = data;
								deferred.resolve(data);

							})
							.error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
								console.log(" error.");
								config.file.success = "Failed";
								deferred.reject();

							});

							promises.push(deferred.promise);
						}
					}
					else
					{
						if ($scope.DatastoreTablePrefix === "CrppContracts")
						{
							$scope.uploadErrorMessage = "The file is already in the subproject files.  Please choose another file name, try again, or contact the Helpdesk if this issue continues.";
							console.log(" error.");
							var errors = [];
							errors.push("File " + file.Name + " already exists in the subproject files.");
							$scope.onRow.errors = errors;
							//config.file.success = "Failed";
							//deferred.reject();
							//promises.push(deferred.promise);
						}
						else
						{
							$scope.uploadErrorMessage = "The file is already in the project files.  Please choose another file name, try again, or contact the Helpdesk if this issue continues.";
							console.log(" error.");
							var errors = [];
							errors.push("File " + file.Name + " already exists in the project files.");
							$scope.onRow.errors = errors;
							//config.file.success = "Failed";
							//deferred.reject();
							//promises.push(deferred.promise);
						}
					}

				}
			});

			return $q.all(promises);
		},
	};
	return service;
}]);

//gridDatasheetOptions needs to be set to your datasheet grid
mod.service('DataSheet',[ 'Logger', '$window', '$route',
    function(Logger,$window, $route, $q){
        //var LocationCellTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateEntity(row)" />';

        var LocationCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'locationId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in locationOptions"/>';

        var QACellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'QAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in QAStatusOptions"/>';

		var InstrumentCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'InstrumentId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in instrumentOptions"/>';

		var FishermanCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'FishermanId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in fishermenOptions"/>';  // GC

		var TimezoneCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'timezone\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in timezoneOptions"/>';

        var service = {

            initScope: function(scope){

                //setup variable in the scope
                scope.CellOptions = {}; //dropdown list options
                scope.FieldLookup = {}; //convenience lookup dbcolname->fieldobj (populated by dataentry-controller.makecoldef)
                scope.onRow = undefined;
                scope.onField = undefined;
                scope.autoUpdateUndone = [];
                scope.deletedRows = [];
                scope.updatedRows = [];
                scope.autoUpdateFeatureDisabled = true;
                scope.headerFieldErrors= {};
                scope.dataChanged = false; //any changes to the grid yet?
                scope.gridWidth = { width: '2000' }; //will set below based on number of fields

                //scope wrapper functions
                scope.undoAutoUpdate = function() { service.undoAutoUpdate(scope)};
                scope.updateCell = function(row, field) { service.updateCell(row,field,scope)};
                //scope.updateHeaderField = function(field) { service.updateHeaderField(field, scope)};
				scope.updateHeaderField = function(row, field) { service.updateHeaderField(row,field,scope)};
                scope.validateGrid = function() { service.validateGrid(scope)};
                scope.validate = function(row) { service.validate(row, scope)};
                scope.removeRow = function() { service.removeOnRow(scope)};
                scope.undoRemoveRow = function() {service.undoRemoveOnRow(scope)};
                scope.getFieldStats = function() {return service.getFieldStats(scope)};

                scope.onNumberField = function() {
                    if(!scope.onField)
                        return false;

                    return(scope.onField.ControlType == "number");
                };

                scope.recalculateGridWidth = function(length)
                {
                    console.log("recalculateGridWidth with length: " + length);

                    var minwidth = (980 < $window.innerWidth) ? $window.innerWidth - 50 : 980;
                    //console.log("minwidth: " + minwidth);

                    var width = 150 * length; //multiply number of columns by 100px
                    //console.log("or multiplied: " + width);

                    //if(width < minwidth) width=minwidth; //min-width
                    if(width < minwidth) width=minwidth; //min-width

                    //console.log("Decided: " + width);

                    scope.gridWidth = { width: width };
                    //refresh the grid
                    setTimeout(function() {
                        scope.gridDatasheetOptions.$gridServices.DomUtilityService.RebuildGrid(scope.gridDatasheetOptions.$gridScope, scope.gridDatasheetOptions.ngGrid); //refresh
                        console.log("Width now: " + width);
                    }, 400);
                };

                scope.selectCell = function(field) {
                    //console.log("select cell!");
                    scope.onField = scope.FieldLookup[field];
                };

                //dynamically set the width of the grids.
                /*
                var grid_width_watcher = scope.$watch('FieldLookup', function(){
                    var length = array_count(getMatchingByField(scope.FieldLookup,"2","FieldRoleId"));

                    console.log("Found number of detail fields: "+length);

                    //however -- if we are in full-grid mode, we need space calculated on adding in the header fields.
                    //  currently that is only for import, full datasheet and query.
                    if($route.current.controller == 'DatasetImportCtrl' || $route.current.controller == 'DataQueryCtrl' || $route.current.controller == 'DataEntryDatasheetCtrl')
                        length = array_count(scope.FieldLookup);

                    console.log("calling with length: "+ length);

                    scope.recalculateGridWidth(length);
                    grid_width_watcher(); //remove watcher.

                },true);
                */

                //only do this for pages that have editing enabled
                if(scope.gridDatasheetOptions.enableCellEdit)
                {
                    //setup editing rowtemplate
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="{\'has-validation-error\': !row.getProperty(\'isValid\')}" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';
                }
                else
                {
                    //for viewing
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';

                }

                //this is pure awesomeness: setup a watcher so that when we navigate the grid we update our current row and validate it.
                scope.$watch('gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow', function(){
                    //Logger.debug(scope.gridDatasheetOptions.$gridScope);
                    scope.onRow = scope.gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow;
                    //console.dir(scope.gridDatasheetOptions.$gridScope.selectionProvider);
                });

            },

            getColDefs: function(DatastoreTablePrefix, theMode){
				console.log("Inside services, getColDefs...");
				console.log("theMode = " + theMode);
				console.log("DatastoreTablePrefix = " + DatastoreTablePrefix);

				if (DatastoreTablePrefix === "WaterTemp")   // Water Temp related
				{
					if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
					{
						var coldefs = [
							{
								field: 'InstrumentId',
								Label: 'Instrument',
								displayName: 'Instrument',
								cellFilter: 'instrumentFilter', //'','instrumentFilter',
								//editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
								//Field: { Description: "ID number of the instrument"}
								editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
								visible:  false,
								Field: { Description: "Instrument the detected this value."}
							},
						];
						console.log("Water Temp-related form...");
					}
					else
					{
						var coldefs = [
							{
								field: 'locationId',
								Label: 'Location',
								displayName: 'Location',
								cellFilter: 'locationNameFilter', //'locationNameFilter','',
								editableCellTemplate: LocationCellEditTemplate,
								Field: { Description: "What location is this record related to?"}
							},
							{
								field: 'InstrumentId',
								Label: 'Instrument',
								displayName: 'Instrument',
								cellFilter: 'instrumentFilter', //'','instrumentFilter',
								//editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
								//Field: { Description: "ID number of the instrument"}
								editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
								visible:  true,
								Field: { Description: "Instrument the detected this value."}
							},
							{
								field: 'QAStatusId',
								Label: 'QA Status',
								displayName: 'QA Status',
								cellFilter: 'QAStatusFilter',
								editableCellTemplate: QACellEditTemplate,
								Field: { Description: "Quality Assurance workflow status"}

							},
							{
								field: 'Timezone',
								Label: 'Reading Timezone',
								displayName: 'Reading Timezone',
								editableCellTemplate: TimezoneCellEditTemplate,
								cellFilter: 'timezoneFilter',
								Field: { Description: "The timezone the reading took place in."}
							}
						];
					}
				}
				else if (DatastoreTablePrefix === "WaterQuality")  // Water Quality related
				{
					if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
					{
						var coldefs = [
							{
								field: 'InstrumentId',
								Label: 'Instrument',
								displayName: 'Instrument',
								cellFilter: 'instrumentFilter', //'','instrumentFilter',
								//editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
								//Field: { Description: "ID number of the instrument"}
								editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
								visible:  false,
								Field: { Description: "Instrument the detected this value."}
							},
						];
						console.log("Water Quality-related form...");
					}
					else
					{
						var coldefs = [
							{
								field: 'locationId',
								Label: 'Location',
								displayName: 'Location',
								cellFilter: 'locationNameFilter', //'locationNameFilter','',
								editableCellTemplate: LocationCellEditTemplate,
								Field: { Description: "What location is this record related to?"}
							},
							{
								field: 'InstrumentId',
								Label: 'Instrument',
								displayName: 'Instrument',
								cellFilter: 'instrumentFilter', //'','instrumentFilter',
								//editableCellTemplate: '<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />', //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   InstrumentCellEditTemplate,
								//Field: { Description: "ID number of the instrument"}
								editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
								visible:  true,
								Field: { Description: "Instrument the detected this value."}
							},
							{
								field: 'QAStatusId',
								Label: 'QA Status',
								displayName: 'QA Status',
								cellFilter: 'QAStatusFilter',
								editableCellTemplate: QACellEditTemplate,
								Field: { Description: "Quality Assurance workflow status"}

							}
						];
					}
				}
				//else if (theDatasetId == 1206) // This changes the order of the fields, to what makes for sense for the users of this dataset.
				else if (DatastoreTablePrefix === "CreelSurvey") // Creel Survey related
				{
					if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
					{
						var coldefs = [
							{
								field: 'FishermanId',
								Label: 'Fisherman',
								displayName: 'Fisherman',
								cellFilter: 'fishermanFilter',
								editableCellTemplate: FishermanCellEditTemplate,
								//visible:  false,
								Field: { Description: "Fisherman that was interviewed."}
							}
						];
					}
					else
					{
						var coldefs = [
							{
								field: 'activityDate',
								Label: 'Activity Date',
								displayName: 'Activity Date (MM/DD/YYYY)',
								cellFilter: 'date: \'MM/dd/yyyy\'',
								editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
								Field: { Description: "Date of activity in format: '10/22/2014'"}
							},
							{
								field: 'locationId',
								Label: 'Location',
								displayName: 'Location',
								cellFilter: 'locationNameFilter',
								editableCellTemplate: LocationCellEditTemplate,
								Field: { Description: "What location is this record related to?"}
							},
							/*{
								field: 'QAStatusId',
								Label: 'QA Status',
								displayName: 'QA Status',
								cellFilter: 'QAStatusFilter',
								editableCellTemplate: QACellEditTemplate,
								Field: { Description: "Quality Assurance workflow status"}

							},*/
							{
								field: 'FishermanId',
								Label: 'Fisherman',
								displayName: 'Fisherman',
								cellFilter: 'fishermanFilter',
								editableCellTemplate: FishermanCellEditTemplate,
								//visible:  false,
								Field: { Description: "Fisherman that was interviewed."}
							}
						];
					}
				}
				else if ((DatastoreTablePrefix === "SpawningGroundSurvey") || //Spawning Ground related
					(DatastoreTablePrefix === "SnorkelFish") || //Snorkel Fish related
					(DatastoreTablePrefix === "FishTransport") || //Fish Transport related
					(DatastoreTablePrefix === "Electrofishing") || //Electrofishing related
					(DatastoreTablePrefix === "ScrewTrap") || //Screw Trap related
					(DatastoreTablePrefix === "ArtificialProduction") || //ArtificialProduction related
					(DatastoreTablePrefix === "BSample") || //BSample related
					(DatastoreTablePrefix === "JvRearing") || //JvRearing related
					(DatastoreTablePrefix === "Genetic") || //Genetic related
					(DatastoreTablePrefix === "Benthic") || //Benthic related
					(DatastoreTablePrefix === "Drift") || //Drift related
					(DatastoreTablePrefix === "AdultWeir") //Adult Weir related
					)
				{
					if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
					{
						var coldefs = [];
					}
					else
					{
						var coldefs = [
							{
								field: 'locationId',
								Label: 'Location',
								displayName: 'Location',
								cellFilter: 'locationNameFilter',
								editableCellTemplate: LocationCellEditTemplate,
								Field: { Description: "What location is this record related to?"}
							},
							{
								field: 'activityDate',
								Label: 'Activity Date',
								displayName: 'Activity Date (MM/DD/YYYY)',
								cellFilter: 'date: \'MM/dd/yyyy\'',
								editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
								Field: { Description: "Date of activity in format: '10/22/2014'"}
							},
							{
								field: 'QAStatusId',
								Label: 'QA Status',
								displayName: 'QA Status',
								cellFilter: 'QAStatusFilter',
								editableCellTemplate: QACellEditTemplate,
								Field: { Description: "Quality Assurance workflow status"}
							}
						];
					}
				}
                else if ((DatastoreTablePrefix === "StreamNet_RperS") ||
						(DatastoreTablePrefix === "StreamNet_NOSA") ||
						(DatastoreTablePrefix === "StreamNet_SAR")
					)
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
                    {
                        var coldefs = [];
                    }
                    else
                    {
                        var coldefs = [
                            {
                                field: 'locationId',
                                Label: 'Location',
                                displayName: 'Location',
                                cellFilter: 'locationNameFilter',
                                editableCellTemplate: LocationCellEditTemplate,
                                Field: { Description: "What location is this record related to?"}
                            },
                            {
                                field: 'activityDate',
                                Label: 'Activity Date',
                                displayName: 'Activity Date (MM/DD/YYYY)',
                                cellFilter: 'date: \'MM/dd/yyyy\'',
                                editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                                Field: { Description: "Date of activity in format: '10/22/2014'"}
                            },
                            {
                                field: 'QAStatusId',
                                Label: 'QA Status',
                                displayName: 'QA Status',
                                cellFilter: 'QAStatusFilter',
                                editableCellTemplate: QACellEditTemplate,
                                Field: { Description: "Quality Assurance workflow status"}
                            }
                        ];
                    }
                }
                else if (DatastoreTablePrefix === "FishScales") //Fish Scales related
                {
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
                    {
                        var coldefs = [];
                    }
                    else
                    {
                        var coldefs = [{
                            field: 'QAStatusId',
                            Label: 'QA Status',
                            displayName: 'QA Status',
                            cellFilter: 'QAStatusFilter',
                            editableCellTemplate: QACellEditTemplate,
                            Field: { Description: "Quality Assurance workflow status"}
                        }];
                    }
                }

				else if (DatastoreTablePrefix === "Metrics")
				{
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
                    {
                        var coldefs = [];
                    }
                    else
                    {
                        var coldefs = [{
                            field: 'QAStatusId',
                            Label: 'QA Status',
                            displayName: 'QA Status',
                            cellFilter: 'QAStatusFilter',
                            editableCellTemplate: QACellEditTemplate,
                            Field: { Description: "Quality Assurance workflow status"}
                        }];
                    }
				}

                else if (DatastoreTablePrefix === "Appraisal") // Appraisal-related (Tax Parcels)
                {
					console.log("Configuring for Appraisal...");
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
                    {
                        var coldefs = [];
                    }
                    else
                    {
                        var coldefs = [];
                    }
                }

                else if (DatastoreTablePrefix === "CrppContracts") // CRPP Contracts-related
                {
					console.log("Configuring for CrppContracts...");
                    if ((typeof theMode !== 'undefined') && (theMode.indexOf("form") > -1))
                    {
                        var coldefs = [];
                    }
                    else
                    {
                        var coldefs = [];
                    }
                }

				else
				{
					var coldefs = [
						{
							field: 'locationId',
							Label: 'Location',
							displayName: 'Location',
							cellFilter: 'locationNameFilter',
							editableCellTemplate: LocationCellEditTemplate,
							Field: { Description: "What location is this record related to?"}
						},
						{
							field: 'activityDate',
							Label: 'Activity Date',
							displayName: 'Activity Date (MM/DD/YYYY)',
							cellFilter: 'date: \'MM/dd/yyyy\'',
							editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
							Field: { Description: "Date of activity in format: '10/22/2014'"}
						},
						{
							field: 'QAStatusId',
							Label: 'QA Status',
							displayName: 'QA Status',
							cellFilter: 'QAStatusFilter',
							editableCellTemplate: QACellEditTemplate,
							Field: { Description: "Quality Assurance workflow status"}
						}
					];
				}

                return coldefs;
            },

            //in order to call validate, you'll need to have your FieldLookup and CellOptions set
            //  on the controller (and obviously previously populated by the DataSheet service.)
            validate: function(row, scope)
            {
                if(row)
                {
                    //spin through our fields and validate our value according to validation rules
                    var row_errors = [];

                    //console.log("Validating a row with " + array_count(scope.FieldLookup) + " rows.");
                    var row_num = 0;

                    angular.forEach(scope.FieldLookup, function(field, key){
                         //TODO: first check if there is no value but one is required.

                        //if not value, ditch.
                        if(!row[key])
                            return;


                        validateField(field, row, key, scope, row_errors);
                        //row_num++;
                        //console.log("  >>incrementing!");

                    });
                    //console.log(row_num + " --------------- is our rownum");
                    if(row_errors.length > 0)
                    {
                        row.isValid = false;
                        row.errors = row_errors;
                        scope.gridHasErrors = true;
                    }
                    else
                    {
                        row.isValid = true;
                        row.errors = undefined;
                    }

                }
            },

            //updateHeaderField: function(field_name, scope)
            updateHeaderField: function(row, field_name, scope)
            {
                scope.dataChanged = true;

                //var value = scope.row[field_name];
				if (typeof field_name === 'undefined')
				{
					// We are probably checking a header field on the form.
					field_name = row;
					console.log("field_name updated = " + field_name);
					var value = scope.row[row];
				}
				else
				{
					var value = scope.row[field_name];
				}
				console.log("value = " + value);

                var field = scope.FieldLookup[field_name];
                var errors = [];
                var row = scope.row;
                var headers = []; //there are none; our row is the headers.

                validateField(field, scope.row, field_name, scope, errors);

                if(errors.length > 0)
                {
                    scope.headerFieldErrors[field_name] = errors;
					row.isValid = false;
					scope.onRow.errors = errors;
                    scope.gridHasErrors = true;
                }
                else
                {
                    delete scope.headerFieldErrors[field_name];
					row.isValid = true;
					//row.errors = undefined;
					if (typeof scope.onRow !== 'undefined')
						scope.onRow.errors = undefined;
                }


                //fire rules - OnChange

                fireRules("OnChange", row, field, value, headers, errors, scope);

                scope.headerHasErrors = (array_count(scope.headerFieldErrors) > 0);

            },

            undoAutoUpdate: function(scope){
                for (var i = 0; i < scope.autoUpdate.updated.length; i++) {

                    //TODO -- eww don't do it this way! don't need rendered rows
                    var entityFieldValue = scope.gridDatasheetOptions.$gridScope.renderedRows[i].entity[scope.autoUpdate.field];

                    //Logger.debug("Unsetting "+scope.autoUpdate.field+": " + entityFieldValue + " back to " + scope.autoUpdate.from);

                    scope.gridDatasheetOptions.$gridScope.renderedRows[i].entity[scope.autoUpdate.field] = scope.autoUpdate.from;
                }

                //set the originally changed one to still be TO
                scope.gridDatasheetOptions.$gridScope.renderedRows[scope.autoUpdate.origRowIndex].entity[scope.autoUpdate.field] = scope.autoUpdate.to;

                scope.autoUpdateUndone.push(scope.autoUpdate.field); // mark this so we don't do it again.
                scope.autoUpdate = undefined;

                service.validateGrid(scope);

            },

            //fired whenever a cell value changes.
            updateCell: function(row, field_name, scope)
            {
                //console.log("Field changed: " + field_name);

                scope.dataChanged = true;

                if(scope.onRow.entity)
                {
                    var fromValue = scope.onRow.entity[field_name];
                    var toValue = row.entity[field_name];

                    console.log("Changed "+field+" from: " + fromValue + " to: "+ toValue);
                }
                //console.log("has an id? " + row.entity.Id);

                //make note of this update so we can save it later. (relevant only for editing)
                if(row.entity.Id)
                {

                    if(scope.updatedRows.indexOf(row.entity.Id) == -1)
                    {
                        //console.log("added an update: " + row.entity.Id);
                        scope.updatedRows.push(row.entity.Id);
                    }
                    //else
                    //    console.log("Not updating a record.");
                }
                //else
                    //console.log("not row.entity.id");


                //set value of multiselect back to an array


                //row.entity[field] = angular.toJson(toValue).toString();


                /*

                // bail out if it would be a duplicate update
                if(fromValue == toValue)
                {
                    scope.validateGrid(scope);
                    return;
                }

                //bail out if they've already undone this cascade once before
                if(scope.autoUpdateUndone.indexOf(field) > -1 || scope.autoUpdateFeatureDisabled)
                {
                    scope.validateGrid(scope); // before we bail out.
                    return;
                }
                */

                /*
                //go ahead and change all the others (this will expose an option to undo if they want)
                scope.autoUpdate = {
                    field: field,
                    from: fromValue,
                    to: toValue,
                    origRowIndex: row.rowIndex,
                    updated: [],
                };

                angular.forEach(scope.gridDatasheetOptions.$gridScope.renderedRows, function(data_row, key){
                    //if the value of this row is the same as what they just changed FROM
                    //  AND if the rowindex is higher than the current rowindex (cascade down only)
                    if(data_row.entity[field] == fromValue && key > row.rowIndex )
                    {
                        data_row.entity[field] = toValue;
                        scope.autoUpdate.updated.push(key);
                        //Logger.debug("Autoupdated: " + key);
                    }
                });
                */

                var value = row.entity[field_name];
                var field = scope.FieldLookup[field_name];

                //console.dir(scope.FieldLookup);
                //console.log("field name = " + field_name);

                row = row.entity; //get the right reference for our rules

                //fire OnChange rule

// -------------------------------------------
//I like to write my test rules here and move into rule and delete when i'm done  ---------------------------
//eg:
/*

                if(field_name == "Disposition")
                {
                    console.log("Disposition value: " + value);
                    var testRule =
                    {
                        "OnChange":
                        ""
                    };

                    field.Field.Rule = angular.fromJson(testRule);

                }
*/
// ------------------------------------------
                var headers = scope.row;
				console.log("headers is next...");
				console.dir(headers);

				if (typeof scope.onRow.entity.errors === 'undefined')
					scope.onRow.entity.errors = [];

                if ((typeof field !== 'undefined') && (field.FieldRoleId !== null) && (field.FieldRoleId == 1))
				{
					scope.onRow.errors = [];
					fireRules("OnValidate",row, field, value, headers, scope.onRow.errors, scope);
				}
				else
				{
					fireRules("OnValidate",row, field, value, headers, scope.onRow.entity.errors, scope);
				}

                if(field && value)
                {
                    fireRules("OnChange",row, field, value, headers, [], scope);
                }

                //this is expensive in that it runs every time a value is changed in the grid.
                scope.validateGrid(scope); //so that number of errors gets calculated properly.


            },


            undoRemoveOnRow: function(scope)
            {
                var entity = scope.deletedRows.pop();
                scope.dataSheetDataset.push(entity);
                scope.validateGrid(scope);
            },


            removeOnRow: function(scope){
                scope.dataChanged = true;
                scope.deletedRows.push(scope.onRow.entity);
                var index = scope.dataSheetDataset.indexOf(scope.onRow.entity);
                scope.dataSheetDataset.splice(index,1);
                scope.onRow = undefined;
                scope.validateGrid(scope);
            },



            //spin through all of the rows and re-validate.
            validateGrid: function(scope){

                if(!scope.gridDatasheetOptions.enableCellEdit)
                    return;

                Logger.debug(">>>>>>> validating the whole grid baby");
                scope.validation_error_count = 0;

                angular.forEach(scope.dataSheetDataset, function(data_row, key){
                    service.validate(data_row, scope);
                    if(!data_row.isValid)
                        scope.validation_error_count++;
                });

                scope.gridHasErrors = (scope.validation_error_count == 0) ? false : true;

            },

            getFieldStats: function(scope){

                if(!scope.onField || scope.onField.ControlType != "number")
                    return "";

                //first get the mean (average)
                var total = 0;
                var num_recs = 0;
                var max = undefined;
                var min = undefined;

                //calculate total (for mean), max, min
                angular.forEach(scope.dataSheetDataset, function(item, key){

                    try{
                        var num = new Number(item[scope.onField.DbColumnName]);

                        if(!isNaN(num)) //just skip if it is not a number (NaN)
                        {
                            total += num;

                            if(typeof min == "undefined")
                                min = num;

                            if(typeof max == "undefined")
                                max = num;

                            if(num > max)
                                max = num;

                            if(num < min)
                                min = num;

                            num_recs ++;
                        }
                    }
                    catch(e)
                    {
                        //ran across something that wasn't a number (usurally a blank...)
                        console.log("couldn't convert this to a number: " + item[scope.onField.DbColumnName] + " on " + scope.onField.DbColumnName);
                    }

                });

                var mean = total / num_recs;

                var std_total = 0;

                //now do standard deviation
                angular.forEach(scope.dataSheetDataset, function(item, key){
                    if(!isNaN(item[scope.onField.DbColumnName]))
                        std_total += Math.pow( (item[scope.onField.DbColumnName] - mean), 2); //difference of each item, squared
                });

                var std_dev = Math.sqrt(std_total/ (num_recs - 1) );//square root of sum of squared differences

                var stats = "Mean: " + mean.toFixed(2);
                stats += " / Max: " + max;
                stats += " / Min: " + min;
                stats += " / Std Dev: " + std_dev.toFixed(2);
                stats += " / Total: " + total;

              return stats;
            },

        } //end service

        return service;

    }]);


mod.service('ConvertStatus',[ 'Logger', '$window', '$route',
    function(Logger,$window, $route, $q){

        var service = {

			convertStatus: function(aStatus){
				console.log("Inside convertStatus...");
				console.log("aStatus = " + aStatus);

				var strStatus = null;

				if (aStatus === 0)
				{
					strStatus = "Active";
				}
				else
				{
					strStatus = "Inactive";
				}
				console.log("strStatus = " + strStatus);

				return strStatus;
			},
			convertOkToCall: function(aStatus){
				console.log("Inside convertOkToCall...");
				console.log("aStatus = " + aStatus);

				var strStatus = null;

				if (aStatus === 0)
				{
					strStatus = "Yes";
				}
				else
				{
					strStatus = "No";
				}
				console.log("strStatus = " + strStatus);

				return strStatus;
			},
		}
		return service;
    }]);

mod.service('ServiceUtilities',[ 'Logger', '$window', '$route',
    function(Logger,$window, $route, $q){

        var service = {

			dateTimeNowToStrYYYYMMDD_HHmmSS:  function(){
				// This function gets a date/time hack (now), and returns it in the format of YYYYMMDD_HHmmSS
				var dtNow = new Date();
				var intYear = dtNow.getFullYear();
				var intMonth = dtNow.getMonth();
				var	strMonth = this.padNumber(intMonth);
				var intDate = dtNow.getDate();
				var	strDate = this.padNumber(intDate);
				var intHours = dtNow.getHours();
				var	strHours = this.padNumber(intHours);
				var intMinutes = dtNow.getMinutes();
				var	strMinutes = this.padNumber(intMinutes);
				var intSeconds = dtNow.getSeconds();
				var	strSeconds = this.padNumber(intSeconds);
				var strNow = intYear + strMonth + strDate + "_" + strHours + strMinutes + strSeconds;
				return strNow;
			},

			dateTimeNowToStrYYYYMMDD_HHmmSS2:  function(){
				// This function gets a date/time hack (now), and returns it in the format of YYYY-MM-DD HH:mm:SS.nnn
				var dtNow = new Date();
				var intYear = dtNow.getFullYear();
				var intMonth = dtNow.getMonth();
				var	strMonth = this.padNumber(intMonth);
				var intDate = dtNow.getDate();
				var	strDate = this.padNumber(intDate);
				var intHours = dtNow.getHours();
				var	strHours = this.padNumber(intHours);
				var intMinutes = dtNow.getMinutes();
				var	strMinutes = this.padNumber(intMinutes);
				var intSeconds = dtNow.getSeconds();
				var	strSeconds = this.padNumber(intSeconds);
				var intMilliseconds = dtNow.getMilliseconds();
				var strMilliseconds = this.padNumber(intMilliseconds);
				var strNow = intYear + "-" + strMonth + "-" + strDate + " " + strHours + ":" + strMinutes + ":" + strSeconds + "." + strMilliseconds;
				return strNow;
			},

			extractDateFromString:  function(strDate){
				// This function takes an incoming date in this format:  2015-08-14T00:00:00
				// and extracts/converts it to this format:  2015-08-14
				console.log("Inside extractDateFromString...");
				console.log("strDate = " + strDate);

				var newDate = strDate.substring(0,10);
				console.log("newDate = " + newDate);

				return newDate;
			},

			extractTimeFromString:  function(strDateTime){
				// This function takes an incoming date in this format:  2015-08-14T08:00:00
				// and extracts/converts it to this format:  08:00
				console.log("Inside extractTimeFromString...");
				console.log("strDateTime = " + strDateTime);

				var newTime = strDateTime.substring(11,16);
				console.log("newTime = " + newTime);

				return newTime;
			},

            padNumber: function(number){
				console.log("Inside padNumber...");

				if (number < 10) {
					return '0' + number;
				}
				return number;
            },

			toExactISOString: function(a_date){
				console.log("Inside toExactISOString...");
				console.log("a_date is next...");
				console.dir(a_date);

				if(a_date.getFullYear() < 1950)
					a_date.setFullYear(a_date.getFullYear() + 100);

				var s_utc = a_date.getFullYear() +
					'-' + this.padNumber(a_date.getMonth() + 1) +
					'-' + this.padNumber(a_date.getDate()) +
					'T' + this.padNumber(a_date.getHours()) +
					':' + this.padNumber(a_date.getMinutes()) +
					':' + this.padNumber(a_date.getSeconds()) +
					// '.' + (a_date.getMilliseconds() / 1000).toFixed(3).slice(2, 5); // original line
					'.' + (a_date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
					'Z';

				return s_utc;
			},

			//date to friendly format: "3/05/2014 04:35:44"
			formatDate: function(d){

				var d_str =
					[d.getMonth()+1,d.getDate(), d.getFullYear()].join('/') + " " +
					[("00" + d.getHours()).slice(-2), ("00" + d.getMinutes()).slice(-2), ("00" + d.getSeconds()).slice(-2)].join(':');

				return d_str;
			},

			//date to friendly format: "03/05/2014 04:35:44"  Note the 2-digit month.
			formatDate2: function(d){

				var d_str =
					[this.padNumber(d.getMonth()+1),this.padNumber(d.getDate()), d.getFullYear()].join('/') + " " +
					[("00" + d.getHours()).slice(-2), ("00" + d.getMinutes()).slice(-2), ("00" + d.getSeconds()).slice(-2)].join(':');

				return d_str;
			},

			// Given a float type number, this function verifies that it has six digits before the decimal.
			checkSixFloat: function(aNumber)
			{
				// Regular Expression explanation.  Also see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
				// Enclosing characters:  / ... /
				// At the beginning:  ^
				// Escape character for special characters:  \  , in this case the - has special meaning
				// Match the preceding character 0 or 1 time; in other words, like -123.  The - sign in front may or may not be present:  ?
				// A sequence of 6 digits:  \d{6}
				// Start a section to be remembered:  (       and another section   (
				// Look for a decimal, but the decimal needs escaping, because the . is special:  \.
				// Close the decimal section:  )
				// Look for a digit:  \d
				// Match the preceding character 1 or more times:  +
				// Closed this section for the fractional value:  )
				// The decimal followed by 1 or more numbers may or may not be present (the whole .123 section):  ?
				// The fractional part (.123) is treated as the end of the number, and we want to see if the number has a fractional part:  $
				// Basically, the $ matches the whole () section before the ?, so the decimal section must be at the end of the number.
				// Example:  For example, /t$/ does not match the 't' in "eater", but does match it in "eat".
				var FLOAT_REGEXP6 = /^\-?\d{6}((\.)\d+)?$/;
				var n = "" + aNumber;
				n = n.replace(',', '.');

				if (FLOAT_REGEXP6.test(n))
				{
					return parseFloat(n.replace(',', '.'));
				}
				else
				{
					return undefined;
				}
			},
			// Given text that could be an integer, this function verifies that it is an integer.
			checkInteger: function(aNumber)
			{
				var INTEGER_REGEXP = /^\-?\d+$/;
				var n = "" + aNumber;
				n = n.replace(',', '.');

				if (INTEGER_REGEXP.test(n))
				{
					return parseFloat(n.replace(',', '.'));
				}
				else
				{
					return undefined;
				}
			},

			check4Digits: function(aNumber)
			{
				console.log("Inside check4Digits...")
				var INTEGER_REGEXP = /^\d{4}$/;
				var n = "" + aNumber;
				n = n.replace(',', '.');

				if (INTEGER_REGEXP.test(n))
				{
					return parseFloat(n.replace(',', '.'));
				}
				else
				{
					return undefined;
				}
			},

			setFileName: function(aFileName, scope)
			{
				scope.FieldSheetFile = aFileName;
			}
		}
		return service;

    }]);
//common utility functions -- should this be broken out elsewhere?

//refactore me even more
// makes a field column definition
function makeField(colName, placeholder) {
    return '<input type="text" placeholder="' + placeholder + '" ng-blur="updateCell(row,\'' + colName + '\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
}


function makeFieldColDef(field, scope) {
	//console.log("Inside makeFieldColDef...");
	//console.log("field is next...");
	//console.dir(field);

    var coldef =
    {
        field: field.DbColumnName,
        displayName: field.Label,
        minWidth: 70,
        defaultValue: field.DefaultValue
    };

	//if (scope.dataset.Id === 1206) // Creel Survey
	if (scope.DatastoreTablePrefix == "CreelSurvey")
	{
		scope.disableFields = true;
	}
	else
	{
		scope.datasheetColDefs.cellEditableCondition = true;
	}

    //only setup edit templates for fields in grids with cell editing enabled.
    if(scope.gridDatasheetOptions.enableCellEdit)
    {
        //first of all!
        coldef.enableCellEdit = true;
		//if (scope.dataset.Id === 1206)
		if (scope.DatastoreTablePrefix == "CreelSurvey")
		{
			scope.datasheetColDefs.cellEditableCondition = false;
		}
		else
		{
			scope.datasheetColDefs.cellEditableCondition = true;
		}

        //setup column according to what type it is
        //  the "coldef" options available here are "ColumnDefs Options" http://angular-ui.github.io/ng-grid/

        switch(field.ControlType)
        {
            case 'select':
            case 'lookup':
                // Check for common misconfiguration error
                if(field.Field.PossibleValues == null)
                    console.log("Missing list of possible values from select/lookup field " + field.Field.Name);

                coldef.editableCellTemplate = '<select ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"><option value="" selected="selected"></option></select>';
                scope.CellOptions[field.DbColumnName+'Options'] = makeObjectsFromValues(scope.dataset.DatastoreId+field.DbColumnName, field.Field.PossibleValues);
//                console.log("and we used: " + scope.dataset.DatastoreId+field.DbColumnName + " as the key");
                break;
            case 'multiselect':
            case 'multilookup':
                //coldef.editableCellTemplate = '<select class="field-multiselect" multiple="true" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"/>';
                //coldef.cellTemplate = '<div class="ngCellText cell-multiselect" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field)}}</span></div>';
                coldef.editableCellTemplate = '<select class="field-multiselect" multiple="true" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"/>';
                scope.CellOptions[field.DbColumnName+'Options'] = makeObjectsFromValues(scope.dataset.DatastoreId+field.DbColumnName, field.Field.PossibleValues);
//                console.log("and we used: " + scope.dataset.DatastoreId+field.DbColumnName + " as the key");
                break;

            case 'easting':
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 541324');
                break;
            case 'northing':
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 7896254');
                break;

            case 'date':
                //coldef.editableCellTemplate = '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 07/23/2014');
                break;
            case 'time':
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 16:20');
                break;
            case 'datetime':
                coldef.editableCellTemplate = makeField(field.DbColumnName, 'ex. 07/23/2014 16:20');
                break;

            case 'textarea':
            case 'text':
                coldef.editableCellTemplate = '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                break;
            case 'number':
                //var maxmin = field.Field.Validation ? 'max="'+field.Field.Validation[1]+'" min="'+field.Field.Validation[0]+'"' : ''; //either returns our min/max setup for a numeric field or empty string.
                coldef.editableCellTemplate = '<input type="text" ng-model="COL_FIELD" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-input="COL_FIELD" />';
                //coldef.cellTemplate = '<div class="ngCellText colt{{$index}}">{{row.getProperty(col.field)}}</div>';
                break;
            case 'checkbox':
                coldef.showSelectionCheckbox = true;
                coldef.editableCellTemplate = '<input type="checkbox" ng-checked="row.entity.'+field.DbColumnName+'==true" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                coldef.cellTemplate = coldef.editableCellTemplate; //checkbox for display and edit.
                break;
            case 'file':
                coldef.cellTemplate = '<button class="right btn btn-xs" ng-click="addFiles(row, col.field)">Add</button> <span ng-cell-text ng-bind-html="row.getProperty(col.field) | fileNamesFromString"></span>';
                //<span ng-bind-html="fileNamesFromRow(row,\''+ field.DbColumnName + '\')"></span>';
                break;
            //case 'grid':
            //    coldef.cellTemplate = '<button class="rigt btn btn-xs" ng-click="viewRelation(row, col.field)">View</button> <span ng-cell-text ng-bind-html="row.getProperty(col.field)"></span>';
            //    break;
            default:
                console.log("Unknown control type: " + field.ControlType);
        }
    }

    //setup cellfilters
    switch(field.ControlType)
    {
        case 'multiselect':
        case 'multilookup':
            coldef.cellFilter = 'arrayValues';
            break;

        case 'date':
            coldef.cellFilter = 'date: \'MM/dd/yyyy\'';
            break;

        case 'currency':
            coldef.cellFilter = 'currency';
            break;

        case 'datetime':
            coldef.cellFilter = 'date: \'MM/dd/yyyy HH:mm:ss\'';
            break;

        case 'link':
        case 'file':
            //override the defaul width for files...
            coldef.minWidth = '200';
            coldef.maxWidth = '400';
            coldef.width = '200';
            if(!coldef.enableCellEdit)
                coldef.cellTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text ng-bind-html="row.getProperty(col.field) | fileNamesFromString"></span></div>';//<span ng-bind-html="fileNamesFromRow(row,\''+ field.DbColumnName + '\')"></span>';
            break;
        case 'grid':
            coldef.minWidth = '150';
            coldef.maxWidth = '150';
            coldef.width = '150';
            coldef.cellTemplate = '<button class="right btn btn-xs" ng-click="viewRelation(row, col.field)">View</button> <div class="ngCellText" ng-bind-html="row.getProperty(col.field) | countItems"></div>';
            //coldef.cellTemplate = '<span ng-cell-text ng-bind-html="row.getProperty(col.field) | countItems"></span>';
            break;
    }

    return coldef;
}

/*
* Handles preparing a field to be used by the system...
*/
function parseField(field, scope)
{
	//console.log("Inside services, parseField...");
	//console.log("field is next...");
	//console.dir(field);

    //do this no matter what.
    scope.FieldLookup[field.DbColumnName] = field; //setup our little convenience lookup associative array - used for validation

    //are we already parsed?
    if(field.parsed === true)
        return;

    var displayName = "";

    //if we are a DatasetField
    if(field.Label)
        displayName = field.Label;

    //if we are a Field
    if(field.Name)
        displayName = field.Name;

    //include units in the label if we are a DatasetField
    if(field.Field && field.Field.Units)
		if (field.Field.Units !== "NULL") // DO NOT include units, if it = "NULL"
			displayName += " (" + field.Field.Units+")";

    //or if we are a Field
    if(field.Units)
        displayName += " (" + field.Units+")";

    field.Label = displayName;

    //configure field validation for DatasetFields (will be skipped for global Fields (in the case of global query))
    if(field.Field && field.Field.Validation)
    {
        try{
            console.log("configuring validation for " + field.DbColumnName);
            field.Field.Validation = angular.fromJson(field.Field.Validation);
        }
        catch(e)
        {
			// Original code
			//console.log("*** There is an error parsing the validation for: "+ field.Field.Name + " ***");
      //console.dir(e);
      //console.log("Validation == " + field.Field.Validation);

      //TODO: we need to talk about this whole validation approach... no reason to "angular.fromJson" above
      //      when we are going to fail a bunch of times on purpose because we're doing something different
      //      with the whole switch thing below...

      console.log("e string = " + e.message.toString());
			var errorDescription = e.message.valueOf();
			if ( (field.Field.Validation === "t") ||
				(field.Field.Validation === "i") ||
				(field.Field.Validation === "y") ||
				(field.Field.Validation === "NULL") )
			{
				// This could probably be handled a better way...
				// Do nothing.  The "t" means we are checking a time.
				// Ken previously used the field validation for checking upper/lower limits on numbers.
				// GC added these letters...
				// t :  to indicate a time value
				// i :  to indicate an integer
				// y :  to indicate a 4-digit year
				if (field.Field.Validation === "y")
				{
					// We are looking for a year.
					check4Digits()
				}
			}
			else if (errorDescription == "Invalid character")
			{
				// Do nothing.  We handle checking the value in the ValidateField function.
			}
			else
			{
				console.log("** There is an error parsing the validation for: "+ field.Field.Name + " **");
				console.dir(e);
				console.log("Validation == " + field.Field.Validation);
			}
        }
    }

    //setup and parse the rule if there is one.
    try{
        field.Rule = (field.Rule) ? angular.fromJson(field.Rule) : {};

        if(field.Field)
            field.Field.Rule = (field.Field.Rule) ? angular.fromJson(field.Field.Rule) : {};
    }
    catch(e)
    {
		// Original code
        //console.log("*** there is a rule parsing error for " + field.Field.Name + " *** ");
        //console.dir(e);

		//console.log("e string = " + e.description.toString());
		var errorDescription = e.description.valueOf();
		if ( (field.Field.Validation === "t") ||
			(field.Field.Validation === "i") ||
			(field.Field.Validation === "NULL") )
		{
			// This could probably be handled a better way...
			// Do nothing.  The "t" means we are checking a time.
			// Ken previously used the field validation for checking upper/lower limits on numbers.
			// GC added these letters...
			// t :  to indicate a time value
			// i :  to indicate an integer
		}
		else if (errorDescription == "Invalid character")
		{
			// Do nothing.  We handle checking the value in the ValidateField function.
		}
		else
		{
			console.log("** There is an error parsing the validation for: "+ field.Field.Name + " **");
			console.dir(e);
			console.log("Validation == " + field.Field.Validation);
		}
    }

    fireRules("DefaultValue", null, field, null, null, null, null);
    fireRules("Default", null, field, null, null, null, null);

    field.parsed = true;

}

//creates an empty row for arbitrary datasets
function makeNewRow(coldefs)
{
    var obj = {};

    //sets to default value of this field if one is specified as a "DefaultValue" rule; otherwise null
    angular.forEach(coldefs, function(col){
        obj[col.field] = (col.defaultValue) ?  col.defaultValue : null;
    });

    obj.isValid=true;

    return obj;
}

//takes an array and iterates into key/value object array
//also needs keyProperty and valueProperty strings; property names of individual items in the list.
//use like:  makeObjects(project.Locations, 'Id','Label')
//returns "{keyProperty: valueProperty, ...}
function makeObjects(optionList, keyProperty, valueProperty)
{
	console.log("Inside services.js, makeObjects...");
    var objects = {};

    angular.forEach(optionList, function(item){
		//console.log("item is next...");
		//console.dir(item);
		//console.log("keyProperty = " + keyProperty + ", valueProperty = " + valueProperty);
        objects[item[keyProperty]] = item[valueProperty];
    });

    return objects;
}

//specific for instruments because we need the serial number too
function makeInstrumentObjects(optionList)
{
    var objects = {};

    angular.forEach(optionList, function(item){
        objects[item['Id']] = item['Name'] + '(' + item['SerialNumber'] + ')';
    });

    return objects;
}

//TODO: this will be handy in the future when we refactor the way lookupOptions works to use
// an array of objects instead of properties of a single object.
function sortObjectsByValue(list)
{
    var sorted = [];

    Object.keys(list)
        .map(function(k) { return [k, list[k]]; })
        .sort(function(a,b){
            if (a[1] < b[1]) return -1;
             if (a[1] > b[1]) return 1;
             return 0;
          })
          .forEach(function (d) {
              var nextObj = {};
              nextObj[d[0]] = d[1];
              sorted.push(nextObj);
          });

    return sorted;

}
//takes a possiblevalues field list and turns it into a list we can use in a select
//give us a unique key to reference it by for caching.
function makeObjectsFromValues(key, valuesList)
{
    var objects = angular.rootScope.Cache[key]; //see if we have it squirreled away in our cache

    if(!objects)
    {
        objects = {};

        if(!valuesList)
		{
            //throw new Exception("No values provided.");
			throw ("No values provided.");
		}

        var selectOptions = "";

        try{
            selectOptions = angular.fromJson(valuesList);
        }catch(e){
            console.log("problem parsing: " + valuesList + " for field: "+ key);
        }

        //make array elements have same key/value
        if(angular.isArray(selectOptions))
        {
            selectOptions.forEach(function(item){
                objects[item] = item;
            });
        }
        else
        {
            for(var idx in selectOptions)
            {
                objects[idx] = selectOptions[idx];
            }

        }
        angular.rootScope.Cache[key] = objects; //save into our cache
    }

    return objects;
}

function order2dArrayByAlpha(a, b)
{
    if(!a || !b)
        return 0;

	//console.log(a[1] + ", " + b[1]);
	var a = a[1].toLowerCase();
	var b = b[1].toLowerCase();
	//console.log(a + ", " + b);

	if (a < b)
		return -1;
	else if (a > b)
		return 1;
	else
		return 0;
}

function orderByAlpha(a,b)
{
     if(!a || !b || !a.Label || !b.Label)
        return 0;

     var nameA=a.Label.toLowerCase(), nameB=b.Label.toLowerCase()
     if (nameA < nameB) //sort string ascending
      return -1
     if (nameA > nameB)
      return 1
     return 0 //default return value (no sorting)
}

function orderByAlphaName(a,b)
{
     if(!a || !b || !a.Label || !b.Label)
        return 0;

     var nameA=a.Name.toLowerCase(), nameB=b.Name.toLowerCase()
     if (nameA < nameB) //sort string ascending
      return -1
     if (nameA > nameB)
      return 1
     return 0 //default return value (no sorting)
}

function orderUserByAlpha(a,b)
{
     var nameA=a.Fullname.toLowerCase(), nameB=b.Fullname.toLowerCase()
     if (nameA < nameB) //sort string ascending
      return -1
     if (nameA > nameB)
      return 1
     return 0 //default return value (no sorting)
}

function orderByIndex(a,b) {
	if(!a || !b || !a.OrderIndex || !b.OrderIndex || !a.FieldRoleId || !b.FieldRoleId)
        return 0;

    if(a.OrderIndex && b.OrderIndex)
        return (a.OrderIndex - b.OrderIndex);
    else
        return (a.FieldRoleId - b.FieldRoleId);
}

//works for either regular arrays or associative arrays
function array_count(the_array)
{
    var count = 0;
    var keys = (Array.isArray(the_array)) ? the_array : Object.keys(the_array);
    for (var i = 0; i < keys.length; i++) {
        count ++;
    };

    return count;
}

function isInvalidOption(scope, field, value)
{
    return Object.keys(scope.CellOptions[field.DbColumnName+'Options']).indexOf(value.toString()) == -1;
}


function checkNumber(row, field, value, range, row_errors) {
	//console.log("Inside checkNumber...");
	//console.dir(row);
	//console.dir(field);
	//console.log("value = " + value);
	//console.dir(range);
	//console.dir(row_errors);

    if(is_empty(value))
        return true;

    // Check if input is a number even if we haven't specified a numeric range
    if(!stringIsNumber(value))
    {
        row_errors.push("["+field.DbColumnName+"] Value is not a number.");
        return false;
    }
	// The range (Validation field) could be an alphanumeric string (4d for 4 decimal places), not just [min, max], and we must allow for the possibility.
    //else if(range && range.length == 2)     // Expecting a 2-element array [min,max]
    else if (range && (range.indexOf("[") > -1) && range.length === 2)     // Expecting a 2-element array [min,max]
    {
        var min = range[0];
        var max = range[1];

        if(min && value < min) {
            row_errors.push("["+field.DbColumnName+"] Value is too low.");
            return false;
        }

        if(max && value > max) {
            row_errors.push("["+field.DbColumnName+"] Value is too high.");
            return false;
        }
    }

    return true;
}


function validateField(field, row, key, scope, row_errors)
{
	//console.log("Inside services, validateField...");
	//console.log("field is next...");
	//console.dir(field);

    var value = row[key];

	//if (typeof field.DbColumnName !== 'undefined')
	//	console.log("Validating: (" + value + ") on field: " + field.DbColumnName);
    //console.dir(field);

    switch(field.ControlType)
    {
        case 'select':
            //is the value in our list of options?
            //console.log(scope.CellOptions[field.DbColumnName+'Options']);
            if(scope.CellOptions[field.DbColumnName+'Options'])
            {
                if(isInvalidOption(scope, field, value)) // Is value in the option list?
                    row_errors.push("["+field.DbColumnName+"] Invalid selection");
            }
            else
            {
                console.log("Error: no cellOptions for " + field.DbColumnName+'Options' );
                console.dir(scope.CellOptions);
                console.log("This might be because you're calling a rule wrong?");
            }
            break;

        case 'multiselect':
            //is each value in our list of options?
            var values = angular.fromJson(value);
            row[key] = values;
            //console.log("doing a comparison: " + values + " for value: "+ value);
            for(var a = 0; a < values.length; a++ )
            {
                var a_value = values[a];
                if(isInvalidOption(scope, field, a_value)) // Is value in the option list?
                    row_errors.push("["+field.DbColumnName+"] Invalid selection ("+a_value+")");
            }
            break;
        case 'date':
            if(isNaN(Date.parse(value)))
                row_errors.push("["+field.DbColumnName+"] Value is not a date (mm/dd/yyyy).");
            break;
        case 'datetime':
            if(isNaN(Date.parse(value)))
                row_errors.push("["+field.DbColumnName+"] Value is not a date-time (mm/dd/yyyy hh:mm).");
            break;

        case 'time':
			var timeContentValid = true;
            if(!stringIsTime(value) && !is_empty(value))
				timeContentValid = false;
			else if (value.indexOf(".") > -1)
				timeContentValid = false;
			else if (value.indexOf(":") === -1)
				timeContentValid = false;

			if (!timeContentValid)
                row_errors.push("["+field.DbColumnName+"] Value is not a time (hh:mm).");
            break;
        case 'text':
			if(field.Field.Validation && (field.Field.Validation !== 'null'))
			{
				if (field.Field.Validation === "t")  // For a time
				{
					console.log("Text time field name = " + field.DbColumnName);
					//if ((field.DbColumnName === "InterviewTime") || (field.DbColumnName === "TimeStart") || (field.DbColumnName === "TimeEnd")) // This looks for specific field names.
					if ((field.Field.Units === "00:00") || (field.Field.Units === "HH:MM")) // This looks for time fields (better).
					{
						console.log("In services, validateField, found time field...");
						//if(!stringIsNumber(value) && !is_empty(value))

						// value may contain a time (HH:MM) or the time may be in a datetime string (YYYY-MM-DDTHH:mm:SS format).
						console.log("value = " + value);
						var colonLocation = value.indexOf(":");
						value = value.substr(colonLocation - 2);
						if (value.length > 5)
							value = value.substr(0,6);

						console.log("value = " + value);
						var validTime = checkTime(value);
						console.log("validTime = " + validTime)
						if ((typeof validTime === 'undefined') || (value.length < 5))
						{
							console.log("Error: Invalid time entry in " + field.DbColumnName + "." );
							row_errors.push("["+field.DbColumnName+"] Invalid entry.  The entry must use the 24-hr military time format.  Example:  8:00 a.m. = 08:00 and 5:15 p.m. = 17:15");
						}

						/* Before import change
						console.log("Found time field...");
						//if(!stringIsNumber(value) && !is_empty(value))
						console.log("Value = " + value);
						var validTime = checkTime(value);
						console.log("validTime = " + validTime)
						if ((typeof validTime === 'undefined') || (value.length < 5))
						{
							console.log("Error: Invalid time entry in " + field.DbColumnName + "." );
							row_errors.push("["+field.DbColumnName+"] Invalid entry.  The entry must use the 24-hr military time format.  Example:  8:00 a.m. = 08:00 and 5:15 p.m. = 17:15");
						}
						*/
					}
				}
				else if (field.Field.Validation === "nb")  // For a name, nb = not blank
				{
					console.log("Field name = " + field.DbColumnName);
					if (field.DbColumnName === "Surveyor")
					{
						console.log("Found surveyor field...");
						//if(!stringIsNumber(value) && !is_empty(value))
						console.log("Value = " + value);
						if (value.length > 0)
							var validName = value;
						else
							console.log("validName = " + validName);

						if (typeof validName === 'undefined')
						{
							console.log("Error: Invalid time entry in " + field.DbColumnName + "." );
							row_errors.push("["+field.DbColumnName+"] Invalid entry.  [Surveyor] cannot be blank.");
						}
					}
				}
			}
            break;
        case 'easting':
            return checkNumber(row, field, value, [100000, 999999], row_errors);
        case 'northing':
            return checkNumber(row, field, value, [1000000, 9999999], row_errors);

        case 'number':
			//return checkNumber(row, field, value, field.Field.Validation, row_errors); // Chris' code.

			//console.log("Inside validateField, case number...");
			//console.log("field.Field.Validation = " + field.Field.Validation);
			//console.log("field.Field.DataType = " + field.Field.DataType);
			//if (field.Field.DataType === 'float')
			//{
			//	return checkNumber(row, field, value, field.Field.Validation, row_errors);
			//}

			if ((field.Field.Validation !== null) && (field.Field.Validation.indexOf("null") < 0))
			{
				//console.log("Validation exists and is not null...");
				if (field.Field.Validation === "i")  // For an Integer
				//if (field.Field.Validation.indexOf("i") > -1)  // For an Integer
				{
					//console.log("Must be an integer...");
					//console.log("Field name = " + field.DbColumnName);
					//console.log("value = " + value);
					if ((typeof value !== 'undefined') && (value !== null))
					{
						var validNumber = checkInteger(value);
						console.log("validNumber = " + validNumber)
						if (typeof validNumber === 'undefined')
						{
							console.log("Error: Invalid entry in " + field.DbColumnName + "." );
							if ((field.DbColumnName === "NumberAnglersObserved") || (field.DbColumnName === "NumberAnglersInterviewed"))
							{
								row_errors.push("["+field.DbColumnName+"] Invalid entry in header.  The entry must be a whole number.  Example:  3");
							}
							else
							{
								row_errors.push("["+field.DbColumnName+"] Invalid entry.  The entry must be a whole number.  Example:  3");
							}
						}

						//console.log("NumberAnglersInterviewed = " + value);
						if (field.DbColumnName === "NumberAnglersInterviewed")
						{
							//console.log("Found NumberAnglersInterviewed...");
							//console.log("scope is next...");
							console.dir(scope);
							if (row.NumberAnglersInterviewed > row.NumberAnglersObserved)
							{
								row_errors.push("["+field.DbColumnName+"] cannot be more than [NumberAnglersObserved]");
							}

						}

					}
				}
				else if (field.Field.Validation === "i4") // 4-digit integer
				{
					//console.log("Must be a 4-digit integer...");
					//console.log("Field name = " + field.DbColumnName);
					//console.log("value = " + value);
					if(is_empty(value))
					{
						// Empty is OK.  Do nothing.
					}
					else if ((typeof value !== 'undefined') && (value !== null))
					{
						var strErrorMessage = "["+field.DbColumnName+"] Invalid entry.  The entry must be a 4-digit whole number.  Example:  1234";

						var strValue = value.toString();
						var validNumber = checkInteger(value);
						//console.log("validNumber = " + validNumber)
						if (typeof validNumber === 'undefined')
						{
							row_errors.push(strErrorMessage);
						}
						else if ((strValue.length < 4) || (strValue.length > 4))
						{
							row_errors.push(strErrorMessage);
						}
					}
				}
				else if (field.Field.Validation === "y") // We are looking for a year (4-digit number)
				{
					//console.log("Field name = " + field.DbColumnName);
					//console.log("value = " + value);
					//console.log("typeof value = " + typeof value);

					// The value can be blank.  If present, value must be a 4-digit year.
					if ((typeof value !== 'undefined') && (value !== null) && (value.length > 0))
					{
						validNumber = check4Digits(value);
						if (typeof validNumber === 'undefined')
						{
							console.log("Error: Invalid entry in " + field.DbColumnName + "." );
							if (field.DbColumnName === "YearReported")
							{
								row_errors.push("["+field.DbColumnName+"] Invalid value for year.  The entry must be a 4-digit year.  Example:  2017");
							}
							else
							{
								row_errors.push("["+field.DbColumnName+"] Invalid entry.  The entry must be a whole number.  Example:  3");
							}
						}
					}
				}
				else if (field.Field.Validation.indexOf("4d") > -1) // No more than 4 decimal places
				{
					//console.log("Inside check for 4d...");
					if ((typeof value !== 'undefined') && (value !== null))
					{
						var strValue = value.toString();
						var strDecimalPart = "";
						var intDecimalLoc = strValue.indexOf(".");

						if (intDecimalLoc > -1)
						{
							strDecimalPart = strValue.substring(intDecimalLoc + 1);
							if (strDecimalPart.length > 4)
								row_errors.push("["+field.DbColumnName+"] Invalid entry.  The entry can only have 4 decimal places.")
						}
					}
				}
				else
				{
					return checkNumber(row, field, value, field.Field.Validation, row_errors);
				}
			}
			else if (field.Field.DataType === 'float')
			{
				return checkNumber(row, field, value, field.Field.Validation, row_errors);
			}
            break;
        case 'checkbox':
            //anything here?
            break;

    }


// You can test validation rules here
//------------------------------------
/*
if(field.DbColumnName == "Disposition")
{
    console.log("Disposition value: " + value);
    var testRule =
    {
        "OnValidate":
        "if((value == 'O' || value == 'T') && (scope.FieldLookup['ReleaseSite'] && !row['ReleaseSite'])) row_errors.push('[ReleaseSite] Disposition choice requires ReleaseSite');"
    };

    field.Field.Rule = angular.fromJson(testRule);
}
*/
/*
console.log(field.DbColumnName);
if(field.DbColumnName == "FinClip")
{
    console.log("Origin value: " + value);
    var testRule =
    {
        "OnValidate":
        "row['Origin'] = 'NAT';if(!(!row['FinClip'] || (row['FinClip'] == 'NONE' || row['FinClip'] == 'NA')) || ( row['Tag'] == 'WIRE')) row['Origin'] = 'HAT';"
    };

    field.Field.Rule = angular.fromJson(testRule);
}
*/

    fireRules("OnValidate",row,field,value,scope.row,row_errors, scope);


}

function stringIsNumber(s) {
    return !isNaN(parseFloat(s)) && isFinite(s);
}


function stringIsTime(s) {
    if(s == null)
        return false;

    if(typeof s != 'string')
        return false;

	s = s.trim();

    //return s.match(/^\s*([01]?\d|2[0-3]):([0-5]\d)\s*$/);
    return s.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
}


function is_empty(obj) {

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0) return false;
    if (obj.length === 0) return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    // Doesn't handle toString and toValue enumeration bugs in IE < 9

    return true;
}

mod.service('eventTimer',[
	function(){
			var d = new Date();
			console.log(d.toLocaleTimeString() );
}]);

mod.service('Logger',[
    function(){

        var service = {
            log: function () {
                for (var i = 0; i < arguments.length; i++) {

                    //output the argument
					//console.log("arguments is next...");
                    //console.dir(arguments[i]);

                    //traverse recursively if it is an array
                    if (arguments[i] instanceof Array) {
                        var arrayArg = arguments[i];
                        this.log.apply(this, arrayArg);
                    }

                }
            },

            debug: function () {
                this.log.apply(this, arguments);
            },

            error: function () {
                this.log.apply(this, arguments);
                var message = {Message: arguments[0], Type: "ERROR"};
            },

            audit: function(){
                var message = { Message: arguments[0], Type: "AUDIT" };
                log.debug("AUDIT Message POSTED to server: " + arguments[0]);
            },
        };

        return service;

    }]);

//from : http://stackoverflow.com/questions/17547399/angularjs-arcgis
mod.service('wish', function () {

        // it's not require... it's a wish?
        var wish = {};

        function _loadDependencies(deps, next) {
            var reqArr = {}; var keysArr = {};

            angular.forEach(Array.keys, function(key, val){
                keysArr.push(key);
                reqArr.push(val);
            });

            // use the dojo require (required by arcgis + dojo) && save refs
            // to required obs
            try{
                require(reqArr, function () {
                    var args = arguments;

                    angular.forEach(keysArr, function (name, idx) {
                        wish[name] = args[idx];
                    });

                    next();
                });

            }catch(e){
                console.dir(e);

            }
        }

        return {
            loadDependencies: function (deps, next) {
                _loadDependencies(deps, next);
            },

            get: function () {
                return wish;
            }
        };
    });

function capitalizeFirstLetter (someText)
{
	var firstLetter = someText.toUpperCase(someText.charAt(0));
	var remainingLetters = someText.toLowerCase(someText.substring(1));
	var newNext = firstLetter + remainingLetters;

	return newText;
}

//convert a F to C
function convertFtoC(fahr){
    if(fahr != null)
        return ((parseFloat(fahr) - 32) * (5/9)).toFixed(NUM_FLOAT_DIGITS);

    return fahr;
}

function convertCtoF(cels){
    if(cels != null)
        return (parseFloat(cels)*9/5 +32).toFixed(NUM_FLOAT_DIGITS);

    return cels;
}


function previousActivity(activities, routeId, $location){
    var previousId;

    //spin through the activities - when we get to the one we're on, send the one before
    //  (unless we are on the first one, then do nothing)

    for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];

        if(activity.Id == routeId)
        {
            if(previousId)
                break; // meaning the previousId is set already; we are good to go.
            else
            {
                previousId = activity.Id; //meaning we are on the first one.
                break;
            }
        }
        previousId = activity.Id;
    };

    $location.path("/dataview/"+previousId);
};

function nextActivity(activities, routeId, $location){
    var nextId;
    var found = false;

    for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];

        if(found)
        {
            nextId = activity.Id;
            break;
        }

        if(activity.Id == routeId)
        {
            found = true;
            nextId = activity.Id; // in case we don't get another one.
        }

    };

    $location.path("/dataview/"+nextId);
}

//anything we might need to do in initializing edit/entry pages.
function initEdit(){
    // Prevent the backspace key from navigating back.
    //http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back/1495435#1495435
    $(document).unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === 8) {
            var d = event.srcElement || event.target;
            if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))
                 || d.tagName.toUpperCase() === 'TEXTAREA') {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }

        if (doPrevent) {
            event.preventDefault();
        }
    });
}

//in any array with a "Name" attribute, get the matching item
function getByName(list, search_name)
{
    return getByField(list, search_name, 'Name');

    /*
    for (var i = 0; i < list.length; i++) {
        var pref = list[i];
        if(pref.Name == search_name)
            return pref;
    };

    return null;
    */
}

//returns single match in any fieldname
function getByField(list, search, field)
{
    for (var i = 0; i < list.length; i++) {
        var pref = list[i];
        if(pref[field] == search)
            return pref;
    };

    return null;
}

//returns array with matching field value
function getMatchingByField(data, search, field)
{
    var newlist = [];

    for(var key in data)
    {
        if(data[key][field] == search)
            newlist.push(data[key]);
    }

    //console.log("did a search on " + search + " for " + field);
    //console.dir(newlist);

    return newlist;
}

//returns array with matching field value
function getMatchingByFieldArray(data, search, field)
{
    var newlist = [];
	var theSearch = "";

	for (var key2 in search)
	{
		//console.log("key2 " + key2);
		for(var key in data)
		{
			//console.log("key " + key);
			//console.log("Field = " + data[key][field] + "  " + "Search = " + search[key2]);
			if ((data[key][field] !== "undefined") && (data[key][field] !== null))
			{
				if(data[key][field] === search[key2])
				{
					newlist.push(data[key]);
					var theSearch = theSearch + search[key2] + ",";
					console.log("Searched and found " + search[key2] + " for " + field);
				}
			}
		}
	}

    //console.log("did a search on " + search + " for " + field);
    console.log("newlist display is next...");
	console.dir(newlist);   // the result is an array.
	//newList = sortLocations(sortLocations);
    //console.dir(newlist);   // the result is an array.

    return newlist;
}

function sortLocations(a,b)
{
	//if ((a !== 'undefined') && (a !== null) && (b !== 'undefined') && (b !== null))
	if ((b !== 'undefined') && (b !== null))
	{
		var l1 = a[8];
		var l2 = b[8];

		if ((l1 !== "undefined") && (l1 !== null))
			l1.toLowerCase();
		if ((l2 !== "undefined") && (l2 !== null))
			l2.toLowerCase();



		if (l1 < l2) return -1;
		if (l1 > l2) return 1;
		return 0;
	}
}

//returns array with UN-matching field value
function getUnMatchingByField(data, search, field)
{
    var newlist = [];

    for(var key in data)
    {
        if(data[key][field] != search)
            newlist.push(data[key]);
    }

    //console.log("did a search on " + search + " for " + field);
    //console.dir(newlist);

    return newlist;
}



function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


//give me an instrument's accuracy check and I'll give you the datagrade to display
function getDataGrade(check)
{
    if(!check)
        return;

    var grade = "N/A";
    if(check.CheckMethod == 1)
        grade = check.Bath1Grade + "-" + check.Bath2Grade;
    else if (check.CheckMethod == 2)
        grade = check.Bath1Grade;

    return grade;
};

function populateMetadataDropdowns(scope, property)
{
    if(property.ControlType == "select" || property.ControlType == "multiselect")
    {
        scope.CellOptions[property.Id+'_Options'] = makeObjectsFromValues(property.Id+"_Options", property.PossibleValues);
    }
};

function getLocationObjectIdsByType(type, locations)
{
    console.log("Inisde services, getLocationObjectIdsByType...");
    //var locationsArray = getUnMatchingByField(locations,type,"LocationTypeId");
    var locationsArray = getMatchingByField(locations,type,"LocationTypeId");
    var locationObjectIdArray = [];

    angular.forEach(locationsArray, function(item, key){
        locationObjectIdArray.push(item.SdeObjectId);
    });

    var locationObjectIds = locationObjectIdArray.join();
    console.log("found project locations (locationObjectIds): " + locationObjectIds);

    return locationObjectIds;
}

function getLocationObjectIdsByInverseType(type, locations)
{
    //console.log("reloading project locations");
    //var locationsArray = getUnMatchingByField(locations,type,"LocationTypeId");
	var locationsArray = getMatchingByField(locations,type,"LocationTypeId");
    var locationObjectIdArray = [];

    angular.forEach(locationsArray, function(item, key){
        if(item.SdeObjectId)
            locationObjectIdArray.push(item.SdeObjectId);
    });

    var locationObjectIds = locationObjectIdArray.join();
    //console.log("In services, getLocationObjectIdsByInverseType, found project locations: " + locationObjectIds);

    return locationObjectIds;
}

function getLocationObjectIdsFromLocationsWithSubprojects(locations)
{
    //console.log("reloading project locations");
    //var locationsArray = getUnMatchingByField(locations,type,"LocationTypeId");
	//var locationsArray = getMatchingByField(locations,type,"LocationTypeId");
    var locationObjectIdArray = [];

    angular.forEach(locations, function(item, key){
        if(item.SdeObjectId)
            locationObjectIdArray.push(item.SdeObjectId);
    });

    var locationObjectIds = locationObjectIdArray.join();
    console.log("In services, getLocationObjectIdsFromLocationsWithSubprojects, found project locations: " + locationObjectIds);

    return locationObjectIds;
}

function fireRules(type, row, field, value, headers, errors, scope)
{
    var row_errors = errors; //older rules use "row_errors"
    try{
        //fire Field rule if it exists -- OnChange
        if(field.Field && field.Field.Rule && field.Field.Rule[type]){
            console.log("Dataset field rule: " + field.Field.Rule[type]);
            if(type == "DefaultValue")
                field.DefaultValue = field.Field.Rule[type];
            else
                eval(field.Field.Rule[type]);
        }

        //fire Datafield rule if it exists -- OnChange
        if(field.Rule && field.Rule[type]){
            console.log("Master field rule: " + field.Rule[type]);
            if(type=="DefaultValue")
                field.DefaultValue = field.Rule[type];
            else
                eval(field.Rule[type]);
        }
    }catch(e){
        //so we don't die if the rule fails....
        console.dir(e);
    }

}

/* Regarding the following functions (checkInteger, checkSixFloat, checkSevenFloat),
the ..._REGEXP is also found in the directives.js file.  According to my research,
we cannot call a directive from a service.  Therefore, we had to copy the content
of the directives having ..._REGEXP and implement it/them here.
*/
// Given text that could be an integer, this function verifies that it is an integer.
function checkInteger(aNumber)
{
	var INTEGER_REGEXP = /^\-?\d+$/;
	var n = "" + aNumber;
	n = n.replace(',', '.');

	if (INTEGER_REGEXP.test(n))
	{
		return parseFloat(n.replace(',', '.'));
	}
	else
	{
		return undefined;
	}
}

function check4Digits(aNumber)
{
	var INTEGER_REGEXP = /^\d{4}$/;
	var n = "" + aNumber;
	n = n.replace(',', '.');

	if (INTEGER_REGEXP.test(n))
	{
		return n; //parseFloat(n.replace(',', '.'));
	}
	else
	{
		return undefined;
	}
}

// Given a float type number, this function verifies that it has six digits before the decimal.
function checkSixFloat(aNumber)
{
	// Regular Expression explanation.  Also see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
	// Enclosing characters:  / ... /
	// At the beginning:  ^
	// Escape character for special characters:  \  , in this case the - has special meaning
	// Match the preceding character 0 or 1 time; in other words, like -123.  The - sign in front may or may not be present:  ?
	// A sequence of 6 digits:  \d{6}
	// Start a section to be remembered:  (       and another section   (
	// Look for a decimal, but the decimal needs escaping, because the . is special:  \.
	// Close the decimal section:  )
	// Look for a digit:  \d
	// Match the preceding character 1 or more times:  +
	// Closed this section for the fractional value:  )
	// The decimal followed by 1 or more numbers may or may not be present (the whole .123 section):  ?
	// The fractional part (.123) is treated as the end of the number, and we want to see if the number has a fractional part:  $
	// Basically, the $ matches the whole () section before the ?, so the decimal section must be at the end of the number.
	// Example:  For example, /t$/ does not match the 't' in "eater", but does match it in "eat".
	var FLOAT_REGEXP6 = /^\-?\d{6}((\.)\d+)?$/;
	var n = "" + aNumber;
	n = n.replace(',', '.');

	if (FLOAT_REGEXP6.test(n))
	{
		return parseFloat(n.replace(',', '.'));
	}
	else
	{
		return undefined;
	}
}

// Given a float type number, this function verifies that it has seven digits before the decimal.
function checkSevenFloat(aNumber)
{
	var FLOAT_REGEXP7 = /^\-?\d{7}((\.)\d+)?$/;
	var n = "" + aNumber;
	n = n.replace(',', '.');

	if (FLOAT_REGEXP7.test(n))
	{
		return parseFloat(n.replace(',', '.'));
	}
	else
	{
		return undefined;
	}
}

function checkTime(aTime)
{
	var FLOAT_REGEXPTIME = /^\d{2}((\:)\d{2})$/;
	var t = "" + aTime;
	//t = t.replace(',', '.');

	if (FLOAT_REGEXPTIME.test(t))
	{
		//return parseFloat(t.replace(/\D+/,""));
		return t;
	}
	else
	{
		return undefined;
	}
}

//give me a date and I will convert it to a UTC date.
//  used in rules.
function dateToUTC(a_date)
{
    var utc = new Date(Date.UTC(
        a_date.getFullYear(),
        a_date.getMonth(),
        a_date.getDate(),
        a_date.getHours(),
        a_date.getMinutes(),
        a_date.getSeconds()
    ));

    return utc;
}

function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
}


function toExactISOString(a_date)
{
    //TODO: better way to fix this?
    if(a_date.getFullYear() < 1950)
        a_date.setFullYear(a_date.getFullYear() + 100);

    var s_utc = a_date.getFullYear() +
        '-' + pad(a_date.getMonth() + 1) +
        '-' + pad(a_date.getDate()) +
        'T' + pad(a_date.getHours()) +
        ':' + pad(a_date.getMinutes()) +
        ':' + pad(a_date.getSeconds()) +
        '.' + (a_date.getMilliseconds() / 1000).toFixed(3).slice(2, 5);

    return s_utc;
}

function setDateTo0000(a_date)
{
	console.log("a_date = " + a_date);
	console.log("type of a_date = " + typeof a_date);
	var inDate = a_date;

	var theYear = inDate.getFullYear();
	console.log("theYear = " + theYear);
	var theMonth = inDate.getMonth();
	console.log("theMonth = " + theMonth);
	var theDay = inDate.getDate();
	console.log("theDay = " + theDay);
	var theHour = 0;
	var theMinutes = 0;
	var theSeconds = 0;
	var theMilliseconds = 0;

	var newDate = new Date(theYear, theMonth, theDay, theHour, theMinutes, theSeconds, theMilliseconds);
	console.log("newDate = " + newDate);

	return newDate;
}

function toTimeString(a_date)
{
    var t = 'T' + pad(a_date.getHours()) +
            ':' + pad(a_date.getMinutes()) +
            ':' + pad(a_date.getSeconds());

    return t;

}

function getTimeFromDate(a_date)
{
	var d = a_date.toString();
	//console.log("d = " + d);
	var theYear = d.substring(0,4);
	//console.log("theYear = " + theYear);

	var separatorLocation = d.indexOf("-");
	d = d.substring(separatorLocation + 1);
	//console.log("d = " + d);
	var theMonth = d.substring(0,2);
	//console.log("theMonth = " + theMonth);

	separatorLocation = d.indexOf("-");
	d = d.substring(separatorLocation + 1);
	//console.log("d = " + d);
	var theDay = d.substring(0,2);
	//console.log("theDay = " + theDay);

	d = d.substring(3);
	//console.log("d = " + d);
	var theHour = d.substring(0,2);
	//console.log("theHour = " + theHour);

	separatorLocation = d.indexOf(":");
	d = d.substring(separatorLocation + 1);
	//console.log("d = " + d);
	var theMinutes = d.substring(0,2);
	//console.log("theMinutes = " + theMinutes);

	return theHour + ":" + theMinutes;
}

//give me a date string and offset (in ms) and I'll give you back a Date
//  with the offset applied.
//  used in rules.
function toDateOffset(str_date, int_offset)
{
    //console.log(int_offset);
    //console.log(str_date);
    var orig_date = new Date(str_date);
    //console.log(orig_date.toISOString());
    var d = new Date(orig_date.getTime() + int_offset);
    //console.log(d.toISOString());

    return d;
}

//date to friendly format: "12/05/2014 04:35:44"
function formatDate(d)
{
    var d_str =
        [d.getMonth()+1,d.getDate(), d.getFullYear()].join('/') + " " +
        [("00" + d.getHours()).slice(-2), ("00" + d.getMinutes()).slice(-2), ("00" + d.getSeconds()).slice(-2)].join(':');

    return d_str;
}

// Date from 2010-08-11T12:25:00.000
// To 08/11/2010 12:25
function formatDateFromUtcToFriendly(d)
{
	console.log("d = " + d);
	var theYear = d.substring(0,4);
	console.log("theYear = " + theYear);

	var separatorLocation = d.indexOf("-");
	d = d.substring(separatorLocation + 1);
	console.log("d = " + d);
	var theMonth = d.substring(0,2);
	console.log("theMonth = " + theMonth);

	separatorLocation = d.indexOf("-");
	d = d.substring(separatorLocation + 1);
	console.log("d = " + d);
	var theDay = d.substring(0,2);
	console.log("theDay = " + theDay);

	d = d.substring(3);
	console.log("d = " + d);
	var theHour = d.substring(0,2);
	console.log("theHour = " + theHour);

	separatorLocation = d.indexOf(":");
	d = d.substring(separatorLocation + 1);
	console.log("d = " + d);
	var theMinutes = d.substring(0,2);
	console.log("theMinutes = " + theMinutes);

	separatorLocation = d.indexOf(":");
	d = d.substring(separatorLocation + 1);
	console.log("d = " + d);
	var theSeconds = d.substring(0,2);
	console.log("theSeconds = " + theSeconds);

	separatorLocation = d.indexOf(".");
	d = d.substring(separatorLocation + 1);
	console.log("d = " + d);
	var theMilli = d.substring(0);
	console.log("theMilli = " + theMilli);

	var friendlyDate = theMonth + "/" + theDay + "/" + theYear + " " + theHour + ":" + theMinutes;

	return friendlyDate
}

// The date may come in different formats:
//		1/1/2015 8:00:00 or
//		01/01/2015 08:00:00
// Therefore, we must allow for either format and convert.
function formatDateFromFriendlyToUtc(d)
{
	console.log("d = " + d);
	var separatorLocation = d.indexOf("/");
	console.log ("slashLocation = " + separatorLocation);
	if (separatorLocation < 2)
	{
		var theMonth = d.substring(0,1);
		console.log("theMonth = " + theMonth);
		theMonth = pad(theMonth);
		console.log("theMonth = " + theMonth);
		d = d.substring(2);
	}
	else
	{
		var theMonth = d.substring(0,2);
		console.log("theMonth = " + theMonth);
		d = d.substring(3);
	}

	console.log("d = " + d);

	separatorLocation = d.indexOf("/");
	if (separatorLocation < 2)
	{
		var theDay = d.substring(0,1);
		console.log("theDay = " + theDay);
		theDay = pad(theDay);
		console.log("theDay = " + theDay);
		d = d.substring(2);
	}
	else
	{
		var theDay = d.substring(0,2);
		console.log("theDay = " + theDay);
		d = d.substring(3);
	}

	console.log("d = " + d);

	var theYear = d.substring(0,4);
	//console.log("theYear = " + theYear);
	d = d.substring(5);
	console.log("d = " + d);

	separatorLocation = d.indexOf(":");
	if (separatorLocation < 2)
	{
		var theHour = d.substring(0,1);
		console.log("theHour = " + theHour);
		theHour = pad(theHour);
		console.log("theHour = " + theHour);
		d = d.substring(2);
	}
	else
	{
		var theHour = d.substring(0,2);
		console.log("theHour = " + theHour);
		d = d.substring(3);
	}

	console.log("d = " + d);

	var theMinutes = d.substring(0,2);
	//console.log("theMinutes = " + theMinutes);
	d = d.substring(3);
	//console.log("d = " + d);
	d = "" + d;
	console.log("d = " + d);
	if ((d.length > 0) && (d.length < 2))
		var theSeconds = pad(d);
	else
		var theSeconds = "00";

	//console.log("theSeconds = " + theSeconds);

	var utc = theYear +
		"-" + theMonth +
		"-" + theDay +
		" " + theHour +
		":" + theMinutes +
		":" + theSeconds +
		"." + "000";

	console.log("utc = " + utc);
	return utc;
}

//if(somearray.contains("a"))... (case insensitive)
if(!Array.prototype.contains)
{
    Array.prototype.contains = function(searchElement)
    {
        searchElement = searchElement.toLowerCase();

        if (this==null)
            throw new TypeError('Array.contains: "this" is null or not defined');

        if(this.length == 0)
            return false;

        // This was probably a good idea, but it caused problems, so I commented it out.  ~GC
		//if(this.indexOf(searchElement) == -1)
        //    return false;

        for (var i = this.length - 1; i >= 0; i--) {
            if(this[i].toLowerCase() == searchElement)
                return true;
        };

        return false;
    }
}
