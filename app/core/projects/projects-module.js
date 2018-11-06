// defines the project module and all project controllers.

//load the components for this module
require([
    //'core/projects/components/project-detail/project-detail',
    'core/projects/components/project-detail/project-landing',
    'core/projects/components/project-detail/modal-new-file',
    'core/projects/components/project-detail/modal-edit-file',
    'core/projects/components/project-detail/modal-edit-project',
    'core/projects/components/project-detail/modal-delete-file',
    'core/projects/components/project-detail/modal-choose-summary-images',
    'core/projects/components/project-detail/modal-choose-map',
    'core/projects/components/project-detail/modal-add-accuracy-check',
    'core/projects/components/project-detail/modal-edit-location',
    'core/projects/components/project-detail/modal-edit-lookup-item',

    //tabs for the project detail page
    'core/projects/components/project-detail/project-detail-tab-instruments',
    'core/projects/components/project-detail/project-detail-tab-fishermen',
    //'core/projects/components/project-detail/project-detail-tab-data',
    //'core/projects/components/project-detail/project-detail-tab-documents',
    //'core/projects/components/project-detail/project-detail-tab-gallery',
    'core/projects/components/project-detail/project-files',
    'core/projects/components/project-detail/project-data',
    'core/projects/components/project-detail/project-editors',
    'core/projects/components/project-detail/project-lookups',
    'core/projects/components/project-detail/project-locations',
    
    'core/projects/components/project-list/project-list',
    
    

    //load project service
    'core/projects/services/project-service',
    'core/projects/services/subproject-service',

    

], function () {
    //add the controllers and services to the module once the files are loaded!
    
    //projects_module.controller('project-detail-ctrl', project_detail);
    projects_module.controller('ProjectLandingCtrl', project_landing);
    projects_module.controller('ProjectFilesCtrl', project_files);
    projects_module.controller('ProjectDataCtrl', project_data);
    projects_module.controller('ProjectEditorsCtrl', project_editors);
    projects_module.controller('ProjectLocationsCtrl', project_locations);
    projects_module.controller('ProjectLookupsCtrl', project_lookups);
    
    projects_module.controller('TabInstrumentsCtrl', tab_instruments);
    projects_module.controller('TabFishermenCtrl', tab_fishermen);
    //projects_module.controller('TabGalleryCtrl', tab_gallery);

    //projects_module.controller('TabDataCtrl', tab_data);
    //projects_module.controller('TabDocumentsCtrl', tab_docs);
    
    projects_module.controller('ModalEditFileCtrl', modal_edit_file);
    projects_module.controller('ModalNewFileCtrl', modal_new_file);
    projects_module.controller('ModalProjectEditorCtrl', modal_edit_project);
    projects_module.controller('ModalDeleteFileCtrl', modal_delete_file);
    projects_module.controller('ModalChooseSummaryImagesCtrl', modal_choose_summary_images);
    projects_module.controller('ModalChooseMapCtrl', modal_choose_map);
    projects_module.controller('ModalEditLocationCtrl', modal_edit_location);
    projects_module.controller('ModalEditLookupItemCtrl', modal_edit_lookup_item);

    projects_module.controller('ProjectListCtrl', project_list);
    projects_module.controller('ModalAddAccuracyCheckCtrl', module_add_accuracy_check);

    
});





