// defines the permit module

require([
    //controllers
    'private/permits/components/list/list-permits',
    'private/permits/components/taskboard/routes',
    'private/permits/components/dashboard/dashboard',
    'private/permits/components/notifications/notifications',
    'private/permits/components/map/permit-map',
    'private/permits/components/contacts/manage-contacts',

    //modals
    'private/permits/components/list/add-activity-modal',
    'private/permits/components/list/add-contact-modal',
    'private/permits/components/list/add-parcel-modal',
    'private/permits/components/list/modal-new-file',
    'private/permits/components/list/modal-edit-file',
    'private/permits/components/contacts/add-person-modal',
    'private/permits/components/taskboard/add-fee-modal',
    'private/permits/components/list/request-inspection',

    //service
    'private/permits/permit-service',

    //map directive
    'private/permits/permit-map-directive',


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
    permit_module.controller('RequestInspectionController', request_inspection);
    permit_module.controller('PermitNotificationsController', permit_notifications);
    permit_module.controller('PermitMapController', permit_map);
    permit_module.controller('PermitManageContactsController', permit_contacts);
    permit_module.controller('EditFileTypeModalController', modal_edit_filetype);

    permit_module.filter('personOrgName', function () {
        return function (person) {
            if (!person)
                return "";

            return (person.Organization) ? person.Organization : person.FullName; 
        }
    });

    permit_module.filter('sce', ['$sce', function ($sce) {
        return function (html) {
            return $sce.trustAsHtml(html);
        };
    }]);

});



