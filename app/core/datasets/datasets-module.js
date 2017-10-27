// defines the dataset module and all dataset controllers.

//dataset module and its dependencies
var datasets_module = angular.module('DatasetModule', ['ui.bootstrap','ngResource']);

//load the components for this module
require([
    'app/core/datasets/components/dataset-activities-list/dataset-activities-list',
    'app/core/datasets/components/dataset-detail/dataset-detail',
    'app/core/datasets/components/dataset-editor/dataset-editor',
    'app/core/datasets/components/dataset-entry-form/dataset-entry-form',
    'app/core/datasets/components/dataset-entry-sheet/dataset-entry-sheet',
    'app/core/datasets/components/dataset-view/dataset-view',
    'app/core/datasets/components/dataset-view/modal-qa-update',
    'app/core/datasets/components/dataset-view/modal-data-entry'
    
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



    //load services

    //define routes
});

