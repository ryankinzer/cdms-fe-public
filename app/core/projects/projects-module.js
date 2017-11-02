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

    'app/core/projects/components/project-list/project-list',
    'app/core/projects/components/project-list/modal-add-accuracy-check',

    //load project service
    'app/core/projects/services/project-service',
    'app/core/projects/services/subproject-service',

], function () {
    //add the controllers and services to the module once the files are loaded!
    
    projects_module.controller('project-detail-ctrl', project_detail);
    projects_module.controller('ModalEditFileCtrl', modal_edit_file);
    projects_module.controller('ModalNewFileCtrl', modal_new_file);
    projects_module.controller('ModalProjectEditorCtrl', modal_edit_project);
    projects_module.controller('ModalDeleteFileCtrl', modal_delete_file);
    projects_module.controller('ModalChooseSummaryImagesCtrl', modal_choose_summary_images);
    projects_module.controller('ModalChooseMapCtrl', modal_choose_map);

    projects_module.controller('project-list-ctrl', project_list);
    projects_module.controller('ModalAddAccuracyCheckCtrl', module_add_accuracy_check);

    
});





