﻿// defines the habitat module

require([
    //controllers
    'private/habitat/components/habitat-sites/modal-add-habitat-item',
    'private/habitat/components/habitat-sites/modal-create-habitat-subproject',
    'private/habitat/components/habitat-sites/page-sites',
    'private/habitat/components/habitat-sites/modal-choose-showdatasets',
   

], function () {
    habitat_module.controller('ModalAddHabitatItemCtrl', modal_add_habitat);
    habitat_module.controller('ModalCreateHabSubprojectCtrl', modal_create_habitat_subproject);
    habitat_module.controller('HabitatSitesCtrl', page_sites);
    habitat_module.controller('ModalChooseShowDatasetsCtrl', modal_hab_choose_showdatasets);

});



