// defines the appraisals module

require([
    //controllers
    'private/appraisals/components/appraisal-activities/appraisal-map',

    //directives
    'private/appraisals/appraisal-map-directive',

], function () {
    appraisals_module.controller('AppraisalMapCtrl', appraisal_map);    

});



