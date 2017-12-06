// defines the preferences module 

require([
    //load components
    'core/preferences/components/dataset-preferences/dataset-preferences',
    'core/preferences/components/my-preferences/my-preferences',
    'core/preferences/components/project-preferences/project-preferences',

    //load preference service
    'core/preferences/preferences-service',

], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    preferences_module.controller('MyPreferencesCtrl', my_preferences);
    preferences_module.controller('MyDatasetsCtrl', dataset_preferences);
    preferences_module.controller('MyProjectsCtrl', project_preferences);

    
});



