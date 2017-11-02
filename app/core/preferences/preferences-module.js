// defines the preferences module 

var preferences_module = angular.module('PreferencesModule', ['ui.bootstrap', 'ngResource']);

require([
    //load components
    'app/core/preferences/components/dataset-preferences/dataset-preferences',
    'app/core/preferences/components/my-preferences/my-preferences',
    'app/core/preferences/components/project-preferences/project-preferences',

    //load preference service
    'app/core/preferences/preferences-service',

], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    preferences_module.controller('MyPreferencesCtrl', my_preferences);
    preferences_module.controller('MyDatasetsCtrl', dataset_preferences);
    preferences_module.controller('MyProjectsCtrl', project_preferences);

    
});



