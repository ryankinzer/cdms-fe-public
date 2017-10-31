// defines the appraisals module

var appraisals_module = angular.module('AppraisalsModule', ['ui.bootstrap', 'ngResource']);

require([
    //controllers
    'app/private/appraisals/components/appraisal-activities/appraisal-activities',

    //directives
    'app/private/appraisals/appraisal-map-directive',

], function () {
    appraisals_module.controller('AppraisalCtrl', appraisal_activities);    

});



