// defines the appraisals module

require([
    //controllers
    'private/appraisals/components/appraisal-activities/appraisal-activities',

    //directives
    'private/appraisals/appraisal-map-directive',

], function () {
    appraisals_module.controller('AppraisalCtrl', appraisal_activities);    

});



