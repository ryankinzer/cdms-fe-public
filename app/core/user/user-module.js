// defines the preferences module 

require([
    //load components
    'core/user/components/dataset-preferences/dataset-preferences',
    'core/user/components/my-preferences/my-preferences',
    'core/user/components/project-preferences/project-preferences',

    //load preference service
    'core/user/user-service',

], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    user_module.controller('MyPreferencesCtrl', my_preferences);
    user_module.controller('MyDatasetsCtrl', dataset_preferences);
    user_module.controller('MyProjectsCtrl', project_preferences);

    
});



