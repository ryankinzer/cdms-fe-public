// defines the crpp module

require([
    //controllers
    'private/crpp/components/correspondence/modal-add-correspondence-event',
    'private/crpp/components/correspondence/modal-create-crpp-subproject',
    'private/crpp/components/correspondence/correspondence',

], function () {
    //crpp_module.controller('CrppContractsCtrl', crpp_contracts);
    crpp_module.controller('ModalAddCorrespondenceEventCtrl', modal_add_correspondence_event);
    crpp_module.controller('ModalCreateSubprojectCtrl', modal_create_crpp_subproject);
    crpp_module.controller('CRPPCorrespondenceCtrl', page_correspondence);
});



