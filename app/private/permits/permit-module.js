// defines the permit module

require([
    //controllers
    'private/permits/components/list/list-permits',
    'private/permits/components/taskboard/routes',
    'private/permits/components/dashboard/dashboard',

    //modals
    'private/permits/components/list/add-activity-modal',
    'private/permits/components/list/add-contact-modal',
    'private/permits/components/list/add-parcel-modal',
    'private/permits/components/list/modal-new-file',
    'private/permits/components/list/add-person-modal',
    'private/permits/components/taskboard/add-fee-modal',

    //service
    'private/permits/permit-service',


], function () {
    permit_module.controller('PermitListController', list_permits);
    permit_module.controller('ActivityModalController', modal_edit_permitevent);
    permit_module.controller('ContactModalController', modal_edit_permitcontact);
    permit_module.controller('ParcelModalController', modal_edit_permitparcel);
    permit_module.controller('PermitFileModalController', modal_new_file);
    permit_module.controller('AddPermitPersonModalController', modal_add_permitperson);
    permit_module.controller('PermitRoutesController', permit_routes);
    permit_module.controller('AddFeeModalController', modal_add_fee);
    permit_module.controller('PermitDashboardController', permit_dashboard);

    permit_module.filter('personOrgName', function () {
        return function (person) {
            if (!person)
                return "";

            return (person.Organization) ? person.Organization : person.FullName; 
        }
    });

});



