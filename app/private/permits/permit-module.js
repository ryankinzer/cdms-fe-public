// defines the permit module

require([
    //controllers
    'private/permits/components/list/list-permits',
    'private/permits/components/taskboard/routes',

    //modals
    'private/permits/components/list/add-activity-modal',
    'private/permits/components/list/add-contact-modal',
    'private/permits/components/list/add-parcel-modal',
    'private/permits/components/list/add-file-modal',
    'private/permits/components/list/add-person-modal',

    //service
    'private/permits/permit-service',


], function () {
    permit_module.controller('PermitListController', list_permits);
    permit_module.controller('ActivityModalController', modal_edit_permitevent);
    permit_module.controller('ContactModalController', modal_edit_permitcontact);
    permit_module.controller('ParcelModalController', modal_edit_permitparcel);
    permit_module.controller('FileModalController', modal_edit_permitfile);
    permit_module.controller('AddPermitPersonModalController', modal_add_permitperson);
    permit_module.controller('PermitRoutesController', permit_routes);

    permit_module.filter('personOrgName', function () {
        return function (person) {
            if (!person)
                return "";

            return (person.Organization) ? person.Organization : person.FullName; 
        }
    });

});



