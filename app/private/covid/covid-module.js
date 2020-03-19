// defines the covid module

require([
    //controllers
    'private/covid/components/employees/list',
    
    //modals
    
    //service
    'private/covid/covid-service',

    

], function () {
    covid_module.controller('CovidListController', covid_list);
    
});



