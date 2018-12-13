// defines the appraisals module


//not used anymore!

require([
    //controllers
    'private/appraisals/components/appraisal-activities/appraisal-activities',

    //directives
    'private/appraisals/appraisal-map-directive',

], function () {
    appraisals_module.controller('AppraisalCtrl', appraisal_activities);    

});



