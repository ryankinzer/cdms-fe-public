// defines the admin module and loads the components, controllers and services

//load the components for this module
require([
    'core/admin/components/admin-page/admin-view',
    'core/admin/components/admin-page/admin-add-project-dataset',
    'core/admin/components/admin-page/admin-edit-dataset-fields',
    'core/admin/components/admin-page/admin-edit-dataset-config',
    'core/admin/components/admin-page/admin-edit-master',
    'core/admin/components/admin-page/admin-new-dataset',
    'core/admin/components/admin-page/admin-metafields',
    'core/admin/components/admin-page/modal-edit-dataset-field',
    'core/admin/components/admin-page/modal-edit-master-field',
    'core/admin/components/admin-page/modal-choose-duplicate-fields',
    'core/admin/components/admin-page/modal-choose-activitylist-fields',
    'core/admin/components/admin-page/modal-edit-metadataproperty',
    'core/admin/components/admin-page/admin-users',
    'core/admin/components/admin-page/admin-manage-users-modal',
    'core/admin/components/admin-page/modal-datastore',

    //service
    'core/admin/admin-service',

], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    admin_module.controller('AdminCtrl', admin_view);
    admin_module.controller('ModalAddProjectDatasetCtrl', add_project_dataset);
    admin_module.controller('AdminEditDatasetFieldsCtrl', admin_edit_dataset_fields);
    admin_module.controller('AdminEditDatasetConfigCtrl', admin_edit_dataset_config);
    admin_module.controller('AdminEditMasterCtrl', admin_edit_master);
    admin_module.controller('AdminNewDatasetCtrl', admin_new_dataset);
    admin_module.controller('AdminMetafieldsCtrl', admin_metafields);
    admin_module.controller('ModalEditDatasetFieldCtrl', modal_admin_edit_dataset_field);
    admin_module.controller('ModalEditMasterFieldCtrl', modal_admin_edit_master_field);
    admin_module.controller('ModalChooseDuplicateFieldsCtrl', modal_admin_choose_duplicate_fields);
    admin_module.controller('ModalChooseActivityListFieldsCtrl', modal_admin_choose_activitylist_fields);
    admin_module.controller('ModalEditMetadataPropertyCtrl', modal_admin_edit_metadataproperty);
    admin_module.controller('AdminUsersCtrl', admin_users);
    admin_module.controller('ModalManageUserCtrl', modal_manage_user);
    admin_module.controller('ModalDatastore',modal_admin_new_datastore);

    //load services

    //define routes
});






