// defines cross-module components that we can use in anywhere (like modals)

//dataset module and its dependencies
var common_module = angular.module('CommonModule', ['ui.bootstrap', 'ngResource']);

//load the components for this module
require([
    'app/core/common/components/modals/modal-quick-add-accuracycheck',
    'app/core/common/components/modals/modal-quick-add-characteristic',
    'app/core/common/components/modals/modal-add-location',
    'app/core/common/components/modals/modal-bulk-rowqa-change',
    'app/core/common/components/modals/modal-save-success',
    'app/core/common/components/modals/modal-create-fisherman',
    'app/core/common/components/modals/modal-exportfile',
    'app/core/common/components/modals/modal-link-field',


], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    common_module.controller('ModalQuickAddAccuracyCheckCtrl', modal_quick_add_accuracycheck);
    common_module.controller('ModalQuickAddCharacteristicCtrl', modal_quick_add_characteristic);
    common_module.controller('ModalAddLocationCtrl', modal_add_location);
    common_module.controller('ModalBulkRowQAChangeCtrl', modal_bulk_rowqa_change);
    common_module.controller('ModalSaveSuccess', modal_save_success);
    common_module.controller('ModalCreateFishermanCtrl', modal_create_fisherman);
    common_module.controller('ModalExportController', modal_exportfile);
    common_module.controller('LinkModalCtrl', modal_link_field);

    //load services

    //define routes
});

