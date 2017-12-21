// defines the admin module and loads the components, controllers and services

//load the components for this module
require([
    'core/admin/components/admin-page/admin-view',
    'core/admin/components/admin-page/admin-add-project-dataset',
    'core/admin/components/admin-page/admin-edit-dataset',
    'core/admin/components/admin-page/admin-edit-master',
    'core/admin/components/admin-page/admin-new-dataset',

    //service
    'core/admin/admin-service',

], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    admin_module.controller('AdminCtrl', admin_view);
    admin_module.controller('ModalAddProjectDatasetCtrl', add_project_dataset);
    admin_module.controller('AdminEditDatasetCtrl', admin_edit_dataset);
    admin_module.controller('AdminEditMasterCtrl', admin_edit_master);
    admin_module.controller('AdminNewDatasetCtrl', admin_new_dataset);


    //load services

    //define routes
});






