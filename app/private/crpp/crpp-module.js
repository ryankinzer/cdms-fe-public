// defines the crpp module

var crpp_module = angular.module('CrppModule', ['ui.bootstrap', 'ngResource']);

require([
    //controllers
    //'app/private/crpp/components/crpp-contracts/crpp-contracts',
    'app/private/crpp/components/crpp-contracts/modal-add-correspondence-event',
    'app/private/crpp/components/crpp-contracts/modal-create-crpp-subproject',

    //directives
    'app/private/crpp/contracts-map-directive',

], function () {
    //crpp_module.controller('CrppContractsCtrl', crpp_contracts);
    crpp_module.controller('ModalAddCorrespondenceEventCtrl', modal_add_correspondence_event);
    crpp_module.controller('ModalCreateSubprojectCtrl', modal_create_crpp_subproject);

});



