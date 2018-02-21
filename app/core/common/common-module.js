// defines cross-module functions, components and services that we can use in anywhere

//I wish you could just specify a directory and it would find the files and load them, but
// requirejs doesn't work that way so we have to reference each one by hand. -kb
require([

    //loads a variety of common functions
    'core/common/common-functions',

    //loads services used by other modules
    'core/common/services/common-service',
    'core/common/services/logger',
    'core/common/services/service-utilities',
    'core/common/services/wish',

    //loads the common controllers
    'core/common/components/modals/modal-quick-add-accuracycheck',
    'core/common/components/modals/modal-quick-add-characteristic',
    'core/common/components/modals/modal-add-location',
    'core/common/components/modals/modal-create-instrument',
    'core/common/components/modals/modal-bulk-rowqa-change',
    'core/common/components/modals/modal-save-success',
    'core/common/components/modals/modal-create-fisherman',
    'core/common/components/modals/modal-link-field',
    'core/common/components/modals/modal-verify-action',
    'core/common/components/modals/modal-invalid-operation',

    //'core/common/components/file/modal-file-add',
    //'core/common/components/file/modal-file-delete',
    'core/common/components/file/modal-files',
    'core/common/components/file/modal-exportfile',
    'core/common/components/file/modal-waypoint-file',
    
    //load other common directives
    'core/common/directives/checklists',
    'core/common/directives/feature-layer',
    'core/common/directives/map',
    'core/common/directives/field-definitions',
    'core/common/directives/roles',
    'core/common/directives/validation',



], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    common_module.controller('ModalQuickAddAccuracyCheckCtrl', modal_quick_add_accuracycheck);
    //common_module.controller('ModalQuickAddCharacteristicCtrl', modal_quick_add_characteristic); //kb 11/1 - this is not used anywhere...
    common_module.controller('ModalAddLocationCtrl', modal_add_location);
    common_module.controller('ModalCreateInstrumentCtrl', modal_create_instrument);
    common_module.controller('ModalBulkRowQAChangeCtrl', modal_bulk_rowqa_change);
    common_module.controller('ModalSaveSuccess', modal_save_success);
    common_module.controller('ModalCreateFishermanCtrl', modal_create_fisherman);
    common_module.controller('ModalExportController', modal_exportfile);
    common_module.controller('LinkModalCtrl', modal_link_field);
    common_module.controller('ModalVerifyActionCtrl', modal_verify_action);
    common_module.controller('ModalInvalidOperation', modal_invalid_operation);

    //common_module.controller('FileAddModalCtrl', modal_file_add);
    //common_module.controller('FileDeleteModalCtrl', modal_file_delete);
    common_module.controller('FileModalCtrl', modal_files); 
    common_module.controller('WaypointFileModalCtrl', modal_waypoint_files);
    
});


//We load these asych with the others
require([
    //loads chart services
    'core/common/components/chart/adultweir-chartservice',
    'core/common/components/chart/artificialproduction-chartservice',
    'core/common/components/chart/bsample-chartservice',
    'core/common/components/chart/creelsurvey-chartservice',
    'core/common/components/chart/electrofishing-chartservice',
    'core/common/components/chart/snorkelfish-chartservice',
    'core/common/components/chart/waterquality-chartservice',
    'core/common/components/chart/watertemp-chartservice',

], function () {

    //there is a chartservice for each dataset.
    // NOTE: If you are creating a new dataset, you'll want to make a chartservice for it.
    common_module.service('AdultWeir_ChartService', adultweir_chartservice);
    common_module.service('ArtificialProduction_ChartService', artificialproduction_chartservice);
    common_module.service('BSample_ChartService', bsample_chartservice);
    common_module.service('CreelSurvey_ChartService', creelsurvey_chartservice);
    common_module.service('ElectroFishing_ChartService', electrofishing_chartservice);
    common_module.service('SnorkelFish_ChartService', snorkelfish_chartservice);
    common_module.service('WaterQuality_ChartService', waterquality_chartservice);
    common_module.service('WaterTemp_ChartService', watertemp_chartservice);

    //and then we only load this one after the others are done...
    require([
        'core/common/components/chart/chart-services',                    //the wrapper for them all...
    ], function () {
        //the master chartservice that exposes all of the other dataset-specific chart services
        common_module.service('ChartService', chart_services);
        
    });
});