// defines the permit module

require([
    //controllers
    'private/permits/components/list/list-permits',

    //map directive
    //'private/permits/permit-map-directive',

    //modals
    'private/permits/components/list/add-activity-modal',

    //service
    'private/permits/permit-service',


], function () {
    permit_module.controller('PermitListController', list_permits);
    permit_module.controller('ActivityModalController', modal_edit_permitevent);

    



    
});


