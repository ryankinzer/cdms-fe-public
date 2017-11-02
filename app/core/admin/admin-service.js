// AdminService 
//  factories and service to manage dataset master and dataset fields...
//  

admin_module.factory('SaveDatasetField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/savedatasetfield');
}]);

admin_module.factory('SaveMasterField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/savemasterfield');
}]);

admin_module.factory('DeleteDatasetField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/deletedatasetfield');
}]);

admin_module.factory('GetAllFields', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getfieldcategoryfields');
}]);

admin_module.factory('AddMasterFieldToDataset', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/addmasterfieldtodataset');
}]);

admin_module.factory('GetAllDatastoreFields', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getdatastorefields');
}]);


admin_module.service('AdminService', ['$q', 
    'SaveDatasetField',
    'SaveMasterField',
    'DeleteDatasetField',
    'GetAllFields',
    'AddMasterFieldToDataset',
    'GetAllDatastoreFields',
    function ($q,
        SaveDatasetField,
        SaveMasterField,
        DeleteDatasetField,
        GetAllFields,
        AddMasterFieldToDataset,
        GetAllDatastoreFields) {

        var service = {

           addMasterFieldToDataset: function(datasetId, fieldId, saveResults)
            {
               AddMasterFieldToDataset.save({ DatasetId: datasetId, FieldId: fieldId },
                   function (data) {
                       saveResults.success = true;
                   },
                   function (data) {
                       saveResults.success = false;
                   });
            },

            removeField: function(datasetId, fieldId, saveResults)
            {
				console.log("Trying to remove a field... datasetId = " + datasetId + ", fieldId = " + fieldId);
                DeleteDatasetField.save({ DatasetId: datasetId, FieldId: fieldId }, function(data){
                    saveResults.success = true;
                }, function (data) {
                    saveResults.success = false;
                });
            },

            getFields: function (id) {
                return GetAllDatastoreFields.query({ id: id });
            },

            getMasterFields: function (categoryId) {
                return GetAllFields.query({ id: categoryId });
            },

            saveDatasetField: function (field, saveResults) {
                saveResults.saving = true;

                SaveDatasetField.save(field, function (data) {
                    saveResults.saving = false;
                    saveResults.success = true;
                }, function (data) {
                    saveResults.saving = false;
                    saveResults.failure = true;
                });

            },
            saveMasterField: function (field, saveResults) {
                saveResults.saving = true;

                SaveMasterField.save(field, function (data) {
                    saveResults.saving = false;
                    saveResults.success = true;
                }, function (data) {
                    saveResults.saving = false;
                    saveResults.failure = true;
                });

            },

        };

        return service;
    }
]);


