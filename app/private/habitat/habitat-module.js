// defines the habitat module

require([
    //controllers
    'private/habitat/components/habitat-sites/modal-add-habitat-item',
    'private/habitat/components/habitat-sites/modal-create-habitat-subproject',
    'private/habitat/components/habitat-sites/tab-sites',
   

], function () {
    habitat_module.controller('ModalAddHabitatItemCtrl', modal_add_habitat);
    habitat_module.controller('ModalCreateHabSubprojectCtrl', modal_create_habitat_subproject);
    habitat_module.controller('TabSitesController', tab_sites);

});



