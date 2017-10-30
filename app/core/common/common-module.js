// defines cross-module components that we can use in anywhere (like modals) - controllers and services

var common_module = angular.module('CommonModule', ['ui.bootstrap', 'ngResource']);

require([
    //just for now: TODO: we want to break this services file up
    'app/core/common/common-services',

    //loads the common controllers
    'app/core/common/components/modals/modal-quick-add-accuracycheck',
    'app/core/common/components/modals/modal-quick-add-characteristic',
    'app/core/common/components/modals/modal-add-location',
    'app/core/common/components/modals/modal-create-instrument',
    'app/core/common/components/modals/modal-bulk-rowqa-change',
    'app/core/common/components/modals/modal-save-success',
    'app/core/common/components/modals/modal-create-fisherman',
    'app/core/common/components/modals/modal-link-field',
    'app/core/common/components/modals/modal-verify-action',
    'app/core/common/components/modals/modal-invalid-operation',

    'app/core/common/components/file/modal-file-add',
    'app/core/common/components/file/modal-file-delete',
    'app/core/common/components/file/modal-files',
    'app/core/common/components/file/modal-exportfile',

    //loads common services
    'app/core/common/components/chart/adultweir-chartservice',
    'app/core/common/components/chart/artificialproduction-chartservice',
    'app/core/common/components/chart/bsample-chartservice',
    'app/core/common/components/chart/creelsurvey-chartservice',
    'app/core/common/components/chart/electrofishing-chartservice',
    'app/core/common/components/chart/snorkelfish-chartservice',
    'app/core/common/components/chart/waterquality-chartservice',
    'app/core/common/components/chart/watertemp-chartservice',
    'app/core/common/components/chart/chart-services',                    //the wrapper for them all...

    //load other common directives
    'app/core/common/directives/checklists',
    'app/core/common/directives/feature-layer',
    'app/core/common/directives/map',
    'app/core/common/directives/field-definitions',
    'app/core/common/directives/roles',
    'app/core/common/directives/validation',



], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    common_module.controller('ModalQuickAddAccuracyCheckCtrl', modal_quick_add_accuracycheck);
    common_module.controller('ModalQuickAddCharacteristicCtrl', modal_quick_add_characteristic);
    common_module.controller('ModalAddLocationCtrl', modal_add_location);
    common_module.controller('ModalCreateInstrumentCtrl', modal_create_instrument);
    common_module.controller('ModalBulkRowQAChangeCtrl', modal_bulk_rowqa_change);
    common_module.controller('ModalSaveSuccess', modal_save_success);
    common_module.controller('ModalCreateFishermanCtrl', modal_create_fisherman);
    common_module.controller('ModalExportController', modal_exportfile);
    common_module.controller('LinkModalCtrl', modal_link_field);
    common_module.controller('ModalVerifyActionCtrl', modal_verify_action);
    common_module.controller('ModalInvalidOperation', modal_invalid_operation);

    common_module.controller('FileAddModalCtrl', modal_file_add);
    common_module.controller('FileDeleteModalCtrl', modal_file_delete);
    common_module.controller('FileModalCtrl', modal_files); 

    
    //load services

    //there is a chartservice for each dataset.
    // NOTE: If you are creating a new dataset, you'll want to make a chartservice for it.
    // TODO: it would be great to move this into a configuration or something of datasets...
    common_module.service('AdultWeir_ChartService', adultweir_chartservice);
    common_module.service('ArtificialProduction_ChartService', artificialproduction_chartservice);
    common_module.service('BSample_ChartService', bsample_chartservice);
    common_module.service('CreelSurvey_ChartService', creelsurvey_chartservice);
    common_module.service('ElectroFishing_ChartService', electrofishing_chartservice);
    common_module.service('SnorkelFish_ChartService', snorkelfish_chartservice);
    common_module.service('WaterQuality_ChartService', water_quality);
    common_module.service('WaterTemp_ChartService', watertemp_chartservice);

    //the master chartservice that exposes all of the other dataset-specific chart services
    common_module.service('ChartService', chart_services);

    //define routes
});

