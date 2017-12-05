// defines the project module and all project controllers.

//project module and its dependencies
var projects_module = angular.module('ProjectModule', ['ui.bootstrap', 'angularFileUpload', 'ui.select2', 'ngResource']);

//load the components for this module
require([
    'app/core/projects/components/project-detail/project-detail',
    'app/core/projects/components/project-detail/modal-new-file',
    'app/core/projects/components/project-detail/modal-edit-file',
    'app/core/projects/components/project-detail/modal-edit-project',
    'app/core/projects/components/project-detail/modal-delete-file',
    'app/core/projects/components/project-detail/modal-choose-summary-images',
    'app/core/projects/components/project-detail/modal-choose-map',
    'app/core/projects/components/project-detail/modal-add-accuracy-check',
    //tabs for the project detail page
    'app/core/projects/components/project-detail/project-detail-tab-instruments',
    'app/core/projects/components/project-detail/project-detail-tab-fishermen',
    'app/core/projects/components/project-detail/project-detail-tab-data',
    'app/core/projects/components/project-detail/project-detail-tab-documents',
    'app/core/projects/components/project-detail/project-detail-tab-gallery',

    'app/core/projects/components/project-list/project-list',

    //load project service
    'app/core/projects/services/project-service',
    'app/core/projects/services/subproject-service',

    

], function () {
    //add the controllers and services to the module once the files are loaded!
    
    projects_module.controller('project-detail-ctrl', project_detail);
    projects_module.controller('TabInstrumentsCtrl', tab_instruments);
    projects_module.controller('TabFishermenCtrl', tab_fishermen);
    projects_module.controller('TabGalleryCtrl', tab_gallery);

    projects_module.controller('TabDataCtrl', tab_data);
    projects_module.controller('TabDocumentsCtrl', tab_docs);
    
    projects_module.controller('ModalEditFileCtrl', modal_edit_file);
    projects_module.controller('ModalNewFileCtrl', modal_new_file);
    projects_module.controller('ModalProjectEditorCtrl', modal_edit_project);
    projects_module.controller('ModalDeleteFileCtrl', modal_delete_file);
    projects_module.controller('ModalChooseSummaryImagesCtrl', modal_choose_summary_images);
    projects_module.controller('ModalChooseMapCtrl', modal_choose_map);

    projects_module.controller('project-list-ctrl', project_list);
    projects_module.controller('ModalAddAccuracyCheckCtrl', module_add_accuracy_check);

    
});





