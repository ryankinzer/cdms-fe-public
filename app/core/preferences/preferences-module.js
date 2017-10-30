// defines the preferences module 

var preferences_module = angular.module('PreferencesModule', ['ui.bootstrap', 'ngResource']);

//load the components for this module
require([
    'app/core/preferences/components/dataset-preferences/dataset-preferences',
    'app/core/preferences/components/my-preferences/my-preferences',
    'app/core/preferences/components/project-preferences/project-preferences',

], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    preferences_module.controller('MyPreferencesCtrl', my_preferences);
    preferences_module.controller('MyDatasetsCtrl', dataset_preferences);
    preferences_module.controller('MyProjectsCtrl', project_preferences);

    //load services

    //define routes
});



