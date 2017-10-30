// defines the appraisals module

var appraisals_module = angular.module('AppraisalsModule', ['ui.bootstrap', 'ngResource']);

require([
    //controllers
    'app/ctuir/appraisals/components/appraisal-activities/appraisal-activities',

    //directives
    'app/ctuir/appraisals/appraisal-map-directive',

], function () {
    appraisals_module.controller('AppraisalCtrl', appraisal_activities);    

});



