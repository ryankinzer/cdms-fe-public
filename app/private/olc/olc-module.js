﻿// defines the crpp module

require([
    //controllers
    'private/olc/components/events/modal-add-olc-event',
    'private/olc/components/events/modal-create-olc-subproject',
    'private/olc/components/events/events',
    'private/olc/components/events/modal-migrate-olc-event',
    'private/olc/components/events/events-search',

], function () {
    olc_module.controller('ModalAddOlcEventCtrl', modal_add_olc_event);
    olc_module.controller('ModalCreateOlcSubprojectCtrl', modal_create_olc_subproject);
    olc_module.controller('OlcEventsCtrl', page_events);
    olc_module.controller('OlcMigrateEventCtrl', modal_migrate_olc_event);
    olc_module.controller('OlcEventsSearchCtrl', events_search);
});



