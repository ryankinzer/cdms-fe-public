// defines the habitat module

var habitat_module = angular.module('HabitatModule', ['ui.bootstrap', 'ngResource']);

require([
    //controllers
    'app/ctuir/habitat/components/habitat-sites/habitat-sites',
   

], function () {
    habitat_module.controller('ModalAddHabitatItemCtrl', modal_add_habitat);
    habitat_module.controller('ModalCreateHabSubprojectCtrl', modal_create_habitat_subproject);

});



