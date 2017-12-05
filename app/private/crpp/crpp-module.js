// defines the crpp module

var crpp_module = angular.module('CrppModule', ['ui.bootstrap', 'ngResource']);

require([
    //controllers
    //'private/crpp/components/crpp-contracts/crpp-contracts',
    'private/crpp/components/crpp-contracts/modal-add-correspondence-event',
    'private/crpp/components/crpp-contracts/modal-create-crpp-subproject',
    'private/crpp/components/crpp-contracts/tab-correspondence',

    //directives
    'private/crpp/contracts-map-directive',

    //renderer for master/detail in grid - used on project-details page (until it gets consolidated to this module)
    //'private/crpp/components/crpp-contracts/renderer-correspondence-detail',

], function () {
    //crpp_module.controller('CrppContractsCtrl', crpp_contracts);
    crpp_module.controller('ModalAddCorrespondenceEventCtrl', modal_add_correspondence_event);
    crpp_module.controller('ModalCreateSubprojectCtrl', modal_create_crpp_subproject);
    crpp_module.controller('TabCorrespondenceController', tab_correspondence);
});



