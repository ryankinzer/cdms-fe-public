// defines the admin module and loads the components, controllers and services

var admin_module = angular.module('AdminModule', ['ui.bootstrap', 'ngResource']);

//load the components for this module
require([
    'app/core/admin/components/admin-page/admin-view',
    'app/core/admin/components/admin-page/admin-add-project-dataset',
    'app/core/admin/components/admin-page/admin-edit-dataset',
    'app/core/admin/components/admin-page/admin-edit-master',

    //service
    'app/core/admin/admin-service',

], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    admin_module.controller('AdminCtrl', admin_view);
    admin_module.controller('ModalAddProjectDatasetCtrl', add_project_dataset);
    admin_module.controller('AdminEditDatasetCtrl', admin_edit_dataset);
    admin_module.controller('AdminEditMasterCtrl', admin_edit_master);



    //load services

    //define routes
});






