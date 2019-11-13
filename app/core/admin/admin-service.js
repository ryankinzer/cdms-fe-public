// AdminService 
//  factories and service to manage dataset master and dataset fields...
//  

admin_module.factory('SaveDatasetField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/savedatasetfield');
}]);

admin_module.factory('SaveDataset', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/dataset', {}, {
        save: { method: 'PUT' }
    });
}]);

admin_module.factory('SaveMasterField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/savemasterfield');
}]);

admin_module.factory('DeleteDatasetField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/deletedatasetfield');
}]);

admin_module.factory('GetAllFields', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/GetDatastoreFields');
}]);

admin_module.factory('AddMasterFieldToDataset', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/addmasterfieldtodataset');
}]);

admin_module.factory('GetAllDatastoreFields', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getdatastorefields');
}]);

admin_module.factory('SaveNewDatastore', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/saveNewDatastore');
}]);




admin_module.service('AdminService', ['$q', 
    'SaveDatasetField',
    'SaveMasterField',
    'DeleteDatasetField',
    'GetAllFields',
    'AddMasterFieldToDataset',
    'GetAllDatastoreFields',
    'SaveDataset',
    'SaveNewDatastore',
    function ($q,
        SaveDatasetField,
        SaveMasterField,
        DeleteDatasetField,
        GetAllFields,
        AddMasterFieldToDataset,
        GetAllDatastoreFields,
        SaveDataset, 
        SaveNewDatastore) {

        var service = {

           addMasterFieldToDataset: function(datasetId, fieldId)
            {
               return AddMasterFieldToDataset.save({ DatasetId: datasetId, FieldId: fieldId });
            },

            saveNewDatastore: function(datastore){
                return SaveNewDatastore.save({ Datastore: datastore });
            },

            removeField: function(datasetId, fieldId)
            {
				console.log("Trying to remove a field... datasetId = " + datasetId + ", fieldId = " + fieldId);
                return DeleteDatasetField.save({ DatasetId: datasetId, FieldId: fieldId });
            },

            getFields: function (id) {
                return GetAllDatastoreFields.query({ id: id });
            },

            getMasterFields: function (datastoreId) {
                return GetAllFields.query({ id: datastoreId });
            },

            saveDataset: function (dataset, saveResults) {
                saveResults.saving = true;

                SaveDataset.save({id: dataset.id, dataset: dataset}, function (data) {
                    saveResults.saving = false;
                    saveResults.success = true;
                }, function (data) {
                    saveResults.saving = false;
                    saveResults.failure = true;
                });
            },

            saveDatasetField: function (field) {

                return SaveDatasetField.save(field);

            },
            saveMasterField: function (field) {
                return SaveMasterField.save(field);
            },

        };

        return service;
    }
]);


