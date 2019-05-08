// defines the permit module

require([
    //controllers
    'private/permits/components/list/list-permits',

    //map directive
    //'private/permits/permit-map-directive',

    //modals
    //'private/permits/components/manage/permit-modal',

    //service
    'private/permits/permit-service',


], function () {
    permit_module.controller('PermitListController', list_permits);

    



    
});


