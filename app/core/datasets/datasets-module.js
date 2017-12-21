// defines the dataset module and all dataset controllers.

//load the components for this module
require([

    //loads the dataset functions
    'core/datasets/datasets-functions',

    //loads the dataset filters
    'core/datasets/datasets-filters',

    //load all components for the dataset module
    'core/datasets/components/dataset-activities-list/dataset-activities-list',
    'core/datasets/components/dataset-detail/dataset-detail',
    'core/datasets/components/dataset-editor/dataset-edit-form',
    'core/datasets/components/dataset-entry-form/dataset-entry-form',
    'core/datasets/components/dataset-entry-sheet/dataset-entry-sheet',
    'core/datasets/components/dataset-view/dataset-view',
    'core/datasets/components/dataset-view/modal-qa-update',
    'core/datasets/components/dataset-view/modal-data-entry',
    'core/datasets/components/dataset-import/dataset-import',
    'core/datasets/components/dataset-import/modal-dataset-duplicates',
    'core/datasets/components/dataset-query/dataset-query',
    'core/datasets/components/dataset-query/big-bucket-query',
    //'core/datasets/components/dataset-relationgrid/modal-relationgrid',

    //load the various dataset services
    'core/datasets/services/dataset-service',
    'core/datasets/services/activity-parser',
    'core/datasets/services/convert-status',
    'core/datasets/services/datasheet',
    'core/datasets/services/file-upload',

], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    datasets_module.controller('DatasetActivitiesCtrl', dataset_activities_list);
    datasets_module.controller('DatasetDetailsCtrl', dataset_detail);
    datasets_module.controller('DataEditCtrl', dataset_edit_form);
    datasets_module.controller('DataEntryFormCtrl', dataset_entry_form);
    datasets_module.controller('DataEntryDatasheetCtrl', dataset_entry_sheet);
    datasets_module.controller('DatasetViewCtrl', dataset_view);
    datasets_module.controller('ModalQaUpdateCtrl', modal_qa_update);
    datasets_module.controller('ModalDataEntryCtrl', modal_data_entry);
    datasets_module.controller("DatasetImportCtrl", dataset_import);
    datasets_module.controller('ModalDuplicatesViewCtrl', modal_dataset_duplicates);
    datasets_module.controller('DataQueryCtrl', dataset_query);
    datasets_module.controller('DatastoreQueryCtrl', big_bucket_query);
    //datasets.controller('RelationGridModalCtrl', modal_relationgrid); <--not used just yet...
});

