
// admin factories and service


mod.factory('SaveDatasetField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/savedatasetfield');
}]);

mod.factory('SaveMasterField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/savemasterfield');
}]);

mod.factory('DeleteDatasetField', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/dataset/deletedatasetfield');
}]);

mod.factory('GetAllFields', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/getfieldcategoryfields');
}]);


mod.factory('AddMasterFieldToDataset', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/datastore/addmasterfieldtodataset');
}]);

/*
* define the service that can be used by any module in our application to work with projects.
*/
projects_module.service('PreferencesService', ['$q', 'GetInstruments',

    function ($q, GetInstruments, ) {

        var service = {

           addMasterFieldToDataset: function(datasetId, fieldId)
            {
                return AddMasterFieldToDataset.save({DatasetId: datasetId, FieldId: fieldId});
            },
            removeField: function(datasetId, fieldId)
            {
				console.log("Trying to delete... datasetId = " + datasetId + ", fieldId = " + fieldId);
                return DeleteDatasetField.save({DatasetId: datasetId, FieldId: fieldId});
           },


        };

        return service;
    }
]);


