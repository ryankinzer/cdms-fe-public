var list_permits = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "All";
        $scope.row = null;

        $scope.PermitContacts = [];
        $scope.PermitParcels = [];
        $scope.PermitEvents = [];
        $scope.PermitFiles = [];
        $scope.ParcelHistory = [];

        $scope.dataset = DatasetService.getDataset(PERMIT_DATASETID);
        $scope.eventsdataset = DatasetService.getDataset(PERMITEVENTS_DATASETID);
        $scope.PermitPersons = PermitService.getAllPersons();
        $scope.CadasterParcels = PermitService.getAllParcels();

        $scope.PermitPersons.$promise.then(function () { 
            $scope.PermitPersons.forEach(function (person) { 
                person.SortName = (person.Organization) ? person.Organization : person.FirstName + " " + person.LastName;
            });   
        });

        $scope.dataset.$promise.then(function () { 
        
            $scope.AllColumnDefs = GridService.getAgColumnDefs($scope.dataset);
            $scope.permitsGrid.columnDefs = $scope.AllColumnDefs.HeaderFields;
            
            //activate the grid with the permits data
            $scope.permitsGridDiv = document.querySelector('#active-permits-grid');
            new agGrid.Grid($scope.permitsGridDiv, $scope.permitsGrid);

            $scope.permits = PermitService.getAllPermits();

            $scope.permits.$promise.then(function () {
            
                $scope.permitsGrid.api.setRowData($scope.permits);

            });
        });

        $scope.eventsdataset.$promise.then(function () {
            var EventColumnDefs = GridService.getAgColumnDefs($scope.eventsdataset);
            $scope.permitEventsGrid.columnDefs = angular.merge(
                //[{ colId: 'EditLinks', cellRenderer: EditEventLinksTemplate, width: 60, menuTabs: [], hide: true }], 
                EventColumnDefs.HeaderFields
            );

            //activate the permit events grid
            if (!$scope.permitEventsGridDiv) {
                $scope.permitEventsGridDiv = document.querySelector('#permit-events-grid');
                new agGrid.Grid($scope.permitEventsGridDiv, $scope.permitEventsGrid);
//TODO: if permission to edit:
                //$scope.permitEventsGrid.columnApi.setColumnVisible("EditLinks", true);
            }

            $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);

        });

        $scope.showIssued = function () { 
            var filter_component = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_component.selectNothing();
            filter_component.selectValue('Approved');
            filter_component.selectValue('Conditionally Approved');
            $scope.permitsGrid.api.onFilterChanged();
            if($scope.currentPage !== "Issued")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "Issued";
        };

        $scope.showApplications = function () { 
            var filter_component = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_component.selectNothing();
            filter_component.selectValue('');
            filter_component.selectValue('Under Review');
            $scope.permitsGrid.api.onFilterChanged();
            if($scope.currentPage !== "Applications")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "Applications";
        };

        $scope.showArchived = function () { 
            var filter_component = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_component.selectNothing();
            filter_component.selectValue('Archived');
            $scope.permitsGrid.api.onFilterChanged();
            if($scope.currentPage !== "Archived")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "Archived";
        };
        
        $scope.showAll = function () { 
            var filter_component = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_component.selectEverything();
            $scope.permitsGrid.api.onFilterChanged();
            if($scope.currentPage !== "All")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "All";
        };

        //requirement: can navigate permits by up and down arrow keys
        $scope.keyboardNavigation = function (params) { 
            console.log("my navigation");
               var previousCell = params.previousCellDef;
               var suggestedNextCell = params.nextCellDef;

               var KEY_UP = 38;
               var KEY_DOWN = 40;
               var KEY_LEFT = 37;
               var KEY_RIGHT = 39;

               switch (params.key) {
                   case KEY_DOWN:
                       console.log("down");
                       previousCell = params.previousCellDef;
                       // set selected cell on current cell + 1
                       $scope.permitsGrid.api.forEachNode( (node) => {
                           if (previousCell.rowIndex + 1 === node.rowIndex) {
                               node.setSelected(true);
                           }
                       });
                       return suggestedNextCell;
                   case KEY_UP:
                       previousCell = params.previousCellDef;
                       // set selected cell on current cell - 1
                       $scope.permitsGrid.api.forEachNode( (node) => {
                           if (previousCell.rowIndex - 1 === node.rowIndex) {
                               node.setSelected(true);
                           }
                       });
                       return suggestedNextCell;
                   case KEY_LEFT:
                   case KEY_RIGHT:
                       return suggestedNextCell;
                   default:
                       throw "this will never happen, navigation is always one of the 4 keys above";
               }
        };


        $scope.permitsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                if ($scope.row && $scope.row.dataChanged) {
                    alert("It looks like you've changed this permit. Please click 'Save' or 'Cancel' before navigating to another permit.");
                    return false;
                }
                $scope.permitsGrid.selectedItem = $scope.row = angular.copy($scope.permitsGrid.api.getSelectedRows()[0]);
                $('#tab-basicinfo').tab('show'); //default to the "Permit Details" tab when select a different permit
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                //console.dir($scope.row);
                if($scope.row)
                    $scope.selectPermit($scope.row.Id);
            },
            selectedItem: null ,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            navigateToNextCell: $scope.keyboardNavigation
        }


        $scope.openPermitPersonModal = function(person_id){

            $scope.person_modal = getById($scope.PermitPersons, person_id);
            console.dir($scope.person_modal.Id);
            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-person-modal.html',
                controller: 'AddPermitPersonModalController',
                scope: $scope,
            }).result.then(function (saved_person) { 
                $scope.PermitPersons = PermitService.getAllPersons();
            });
        }

        $scope.permitContactsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null ,
            components: {
                booleanEditor: BooleanEditor,
                booleanCellRenderer: BooleanCellRenderer,
            },
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onRowDoubleClicked: function (params) { 
                $scope.openPermitPersonModal($scope.permitContactsGrid.selectedItem.PermitPersonId);
            },
            onSelectionChanged: function (params) {
                $scope.permitContactsGrid.selectedItem = $scope.permitContactsGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
        }

        $scope.permitParcelsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null ,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onSelectionChanged: function (params) {
                $scope.permitParcelsGrid.selectedItem = $scope.permitParcelsGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
        }


        $scope.parcelHistoryGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null ,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }

        $scope.permitEventsGrid = {
            columnDefs: null,
            rowData: null,
            selectedItem: null ,
            rowSelection: 'single',
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onRowDoubleClicked: function (params) { 
                $scope.openActivityModal($scope.permitEventsGrid.selectedItem);
            },
            onSelectionChanged: function (params) {
                $scope.permitEventsGrid.selectedItem = $scope.permitEventsGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
        }

        $scope.permitFilesGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
           selectedItem: null ,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onSelectionChanged: function (params) {
                $scope.permitFilesGrid.selectedItem = $scope.permitFilesGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
        }


        var UploadedByTemplate = function (param) {
            return moment(param.node.data.UploadDate).format('L') + " by " + param.node.data.User.Fullname;
        };

        var EditFileLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openFileModal(param.data);
            });
            div.appendChild(editBtn);
            
            return div;
        };
    
        var EditContactLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openContactModal(param.data);
            });
            div.appendChild(editBtn);
            
            return div;
        };
        
        var EditEventLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openActivityModal(param.data);
            });
            div.appendChild(editBtn);
            
            return div;
        };


        var LinkTemplate = function (param) {

            var div = document.createElement('div');

            var linkBtn = document.createElement('a');
            linkBtn.href = param.data.Link;
            linkBtn.innerHTML = param.data.Title;
            linkBtn.target = "_blank";
            div.appendChild(linkBtn);
            return div;
        };


        $scope.permitContactsGrid.columnDefs = [
            { colId: 'EditLinks', cellRenderer: EditContactLinksTemplate, width: 60, menuTabs: [], hide: true },
            {
                headerName: "Primary", field: "IsPrimary", width: 110,
                cellRenderer: 'booleanCellRenderer',
                sort: 'desc'
            },
            {
                headerName: "Contact", width: 200,
                cellRenderer: function (params) {
                    if(params.node.data.PermitPerson.Organization) 
                        return params.node.data.PermitPerson.Organization

                    return (params.node.data.PermitPerson.FullName) ? params.node.data.PermitPerson.FullName : params.node.data.PermitPerson.FirstName + " " + params.node.data.PermitPerson.LastName;
                },
                filter: 'text',
                menuTabs: ['filterMenuTab'],
            },
            { headerName: "Type", field: "ContactType", width: 160, menuTabs: ['filterMenuTab'], filter: true },
            {
                headerName: "Info", width: 120,
                cellRenderer: function (params) {
                    if (params.node.data.PermitPerson.CellPhone)
                        return formatUsPhone(params.node.data.PermitPerson.CellPhone);

                    if (params.node.data.PermitPerson.WorkPhone)
                        return formatUsPhone(params.node.data.PermitPerson.WorkPhone);

                    if (params.node.data.PermitPerson.HomePhone)
                        return formatUsPhone(params.node.data.PermitPerson.HomePhone);

                    return (params.node.data.PermitPerson.Email) ? params.node.data.PermitPerson.Email : "None provided";

                },
                filter: 'text',
                menuTabs: ['filterMenuTab'],
            },

        ];

        $scope.permitParcelsGrid.columnDefs = [
            { headerName: "Parcel Id", field: "ParcelId", width: 250, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "PLSS", field: "Object.PLSS_Label", width: 250, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Acres", field: "Object.Acres_Cty", width: 150, menuTabs: ['filterMenuTab'] },
        ];

        $scope.parcelHistoryGrid.columnDefs = [
            { headerName: "Permit Number", field: "PermitNumber", width: 250, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Project Name", field: "ProjectName", width: 250, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Permit Status", field: "PermitStatus", width: 150, menuTabs: ['filterMenuTab'], filter: true  },
        ];

        $scope.permitFilesGrid.columnDefs = [
            { colId: 'EditLinks', cellRenderer: EditFileLinksTemplate, width: 60, menuTabs: [], hide: true },
            { headerName: 'File', cellRenderer: LinkTemplate, width: 190, menuTabs: [] },
            //{ field: 'Title', headerName: 'Title', width: 250, sort: 'asc', menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'Description', headerName: 'Description', cellStyle: { 'white-space': 'normal' }, width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
            {
                headerName: 'Sharing Level', field: 'SharingLevel', width: 150,
                cellRenderer: function (params) {
                    if (params.node.data.SharingLevel == SHARINGLEVEL_PRIVATE)
                        return SharingLevel['SHARINGLEVEL_PRIVATE'];
                    else if (params.node.data.SharingLevel == SHARINGLEVEL_PUBLICREAD)
                        return SharingLevel['SHARINGLEVEL_PUBLICREAD'];
                    else return 'Unknown';
                }, menuTabs: [],
            },
            { field: 'Uploaded', headerName: "Uploaded", width: 200, valueGetter: UploadedByTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
        ];

        $scope.openActivityModal = function (params, intent) {

            delete $scope.activity_modal;
            $scope.intent = intent;

            //if editing, we'll have incoming params
            if (params) {
                $scope.activity_modal = params;
            } else {
                $scope.activity_modal = { PermitId: $scope.row.Id };
                if (intent == 'new_route')
                    $scope.activity_modal.EventType = 'Review';
                if (intent == 'new_inspection')
                    $scope.activity_modal.EventType = 'Inspection';
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-activity-modal.html',
                controller: 'ActivityModalController',
                scope: $scope,
            }).result.then(function (saved_activity) { 
                $scope.PermitEvents = PermitService.getPermitEvents($scope.row.Id);
                $scope.PermitEvents.$promise.then(function () {
                    $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);
                });
            });
        }

        $scope.openContactModal = function (params) {

            //if editing, we'll have incoming params
            if (params) {
                $scope.contact_modal = params;
            } else {
                $scope.contact_modal = { PermitId: $scope.row.Id };
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-contact-modal.html',
                controller: 'ContactModalController',
                scope: $scope,
            }).result.then(function (saved_contact) {
                    $scope.PermitContacts = PermitService.getPermitContacts(saved_contact.PermitId);
                    $scope.PermitContacts.$promise.then(function () { 
                        $scope.permitContactsGrid.api.setRowData($scope.PermitContacts);
                    });
            });
        }

        $scope.openParcelModal = function (params) {

            //if editing, we'll have incoming params
            if (params) {
                $scope.parcel_modal = params;
            } else {
                $scope.parcel_modal = {};
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-parcel-modal.html',
                controller: 'ParcelModalController',
                scope: $scope,
            }).result.then(function (saved_parcel) {
                    $scope.PermitParcels = PermitService.getPermitParcels(saved_parcel.PermitId);
                    $scope.PermitParcels.$promise.then(function () { 
                        $scope.permitParcelsGrid.api.setRowData($scope.PermitParcels);
                    });
            });
        }

        $scope.openFileModal = function (params) {

            //if editing, we'll have incoming params
            if (params) {
                $scope.file_modal = params;
            } else {
                $scope.file_modal = {};
            }

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-file-modal.html',
                controller: 'FileModalController',
                scope: $scope,
            });
        }


        $scope.createNewPermit = function () {

            if ($scope.row && $scope.row.dataChanged && !confirm("It looks like you've made edits on this page. Are you sure you want to clear everything and start a new permit?")) {
                return;
            }

            $scope.row = $scope.permitsGrid.selectedItem = GridService.getNewRow($scope.permitsGrid.columnDefs); //{ PermitStatus: "New Application" };
            $scope.resetGrids();
            
        };

        $scope.removeSelectedContact = function () { 
            if ($scope.permitContactsGrid.selectedItem && confirm("Are you sure you want to remove this Contact?")) {
                var removed = PermitService.removeContact($scope.permitContactsGrid.selectedItem);
                removed.$promise.then(function () { 
                    $scope.PermitContacts.forEach(function (contact, index) { 
                        if (contact.PermitPersonId == $scope.permitContactsGrid.selectedItem.PermitPersonId) {
                            $scope.PermitContacts.splice(index);
                            $scope.permitContactsGrid.api.setRowData($scope.PermitContacts);
                        }
                    });
                });
            }
        };

        $scope.removeSelectedParcel = function () { 
            if ($scope.permitParcelsGrid.selectedItem && confirm("Are you sure you want to remove this Parcel?")) {
                var removed = PermitService.removePermitParcel($scope.permitParcelsGrid.selectedItem);
                removed.$promise.then(function () { 
                    $scope.PermitParcels = PermitService.getPermitParcels($scope.row.Id);
                    $scope.PermitParcels.$promise.then(function () { 
                        $scope.permitParcelsGrid.api.setRowData($scope.PermitParcels);
                    });
                });
            }
        };

        $scope.resetGrids = function () {
            
            
            //activate the permit contacts grid
            if (!$scope.permitContactsGridDiv) {
                $scope.permitContactsGridDiv = document.querySelector('#permit-contacts-grid');
                new agGrid.Grid($scope.permitContactsGridDiv, $scope.permitContactsGrid);
            }

            //activate the permit parcels grid
            if (!$scope.permitParcelsGridDiv) {
                $scope.permitParcelsGridDiv = document.querySelector('#permit-parcels-grid');
                new agGrid.Grid($scope.permitParcelsGridDiv, $scope.permitParcelsGrid);
            }

            //activate the parcel history grid
            if (!$scope.parcelHistoryGridDiv) {
                $scope.parcelHistoryGridDiv = document.querySelector('#parcel-history-grid');
                new agGrid.Grid($scope.parcelHistoryGridDiv, $scope.parcelHistoryGrid);
            }

            //activate the permit files grid
            if (!$scope.permitFilesGridDiv) {
                $scope.permitFilesGridDiv = document.querySelector('#permit-files-grid');
                new agGrid.Grid($scope.permitFilesGridDiv, $scope.permitFilesGrid);
            }

            $scope.permitContactsGrid.api.setRowData($scope.PermitContacts);
            $scope.permitParcelsGrid.api.setRowData($scope.PermitParcels);
            $scope.permitFilesGrid.api.setRowData($scope.PermitFiles);
            $scope.parcelHistoryGrid.api.setRowData($scope.ParcelHistory);

            if ($scope.Profile.hasRole("Permits")) { //TODO: EditPermits?
                $scope.permitContactsGrid.columnApi.setColumnVisible("EditLinks", true);
                $scope.permitParcelsGrid.columnApi.setColumnVisible("EditLinks", true);
                $scope.permitFilesGrid.columnApi.setColumnVisible("EditLinks", true);
            }

        };

        $scope.selectPermit = function (Id) { 

            $scope.PermitContacts = PermitService.getPermitContacts(Id);
            $scope.PermitParcels = PermitService.getPermitParcels(Id);
            $scope.PermitEvents = PermitService.getPermitEvents(Id);
            $scope.PermitFiles = PermitService.getPermitFiles(Id);

            $scope.PermitContacts.$promise.then(function () { 
                $scope.permitContactsGrid.api.setRowData($scope.PermitContacts);
            });

            $scope.PermitParcels.$promise.then(function () {
                $scope.permitParcelsGrid.api.setRowData($scope.PermitParcels);
            });

            $scope.PermitEvents.$promise.then(function () {
                $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);
            });

            $scope.PermitFiles.$promise.then(function () {
                $scope.permitFilesGrid.api.setRowData($scope.PermitFiles);
            });

            $scope.row.ReviewsRequired = ($scope.row.ReviewsRequired) ? angular.fromJson($scope.row.ReviewsRequired) : [];

        };
        
        $scope.resetGrids();

        $scope.onHeaderEditingStopped = function (field) { //fired onChange for header fields (common/templates/form-fields)
            //build event to send for validation
            console.log("onHeaderEditingStopped: " + field.DbColumnName);
            $scope.row.dataChanged = true;

            var event = {
                colDef: field,
                node: { data: $scope.row },
                value: $scope.row[field.DbColumnName],
                type: 'onHeaderEditingStopped',
                scope: $scope
            };

            if (GridService.validateCell(event)) {
                    GridService.fireRule("OnChange", event); //only fires when valid change is made
            }

            //update our collection of header errors if any were returned
            $scope.headerFieldErrors = [];
            if ($scope.row.rowHasError) {
                $scope.row.validationErrors.forEach(function (error) { 
                    if (Array.isArray($scope.headerFieldErrors[error.field.DbColumnName])) {
                        $scope.headerFieldErrors[error.field.DbColumnName].push(error.message);
                    } else {
                        $scope.headerFieldErrors[error.field.DbColumnName] = [error.message];
                    }
                });
            }

            //update the error count -- determine if this bogs down on big datasets                 TODO
            //$scope.PageErrorCount = $scope.getPageErrorCount();

            $scope.row.dataChanged = true;

            //console.dir($scope.row);
            if (field.DbColumnName == "PermitStatus") {

            }
        };

        $scope.calculatePermitNumber = function () { 
            
        };

        $scope.cancel = function () { 
            $scope.permitsGrid.selectedItem = $scope.row = angular.copy($scope.permitsGrid.api.getSelectedRows()[0]);
            $scope.selectPermit($scope.row.Id);
            console.log("cancelled...");
            console.dir($scope.row);
        };

        $scope.save = function () {
            
            var to_save = angular.copy($scope.row);
            to_save.ReviewsRequired = angular.toJson(to_save.ReviewsRequired);
            console.dir(to_save);

            var saved_permit = PermitService.savePermit(to_save);

            saved_permit.$promise.then(function () { 
                console.log("permit saved: ");
                console.dir(saved_permit);

                //requirement: if we saved a new status, add a record to the permitsevents
                if ($scope.row.PermitStatus !== $scope.permitsGrid.api.getSelectedRows()[0].PermitStatus) {
                    var new_event = {
                        PermitId: $scope.row.Id,
                        ByUser: $scope.Profile.Id,
                        EventDate: moment().format('L'),
                        EventType: "Record",
                        ItemType: "TPO",
                        Reviewer: $scope.Profile.Fullname,
                        Comments: "Update Status from " + $scope.permitsGrid.api.getSelectedRows()[0].PermitStatus + " to " + $scope.row.PermitStatus
                    };
                    console.log("saving a permitevent since we updated the status"); console.dir(new_event);
                    var save_event = PermitService.savePermitEvent(new_event);
                    save_event.$promise.then(function () { 
                        //refresh the activities now that we've saved a new one.
                        $scope.PermitEvents = PermitService.getPermitEvents($scope.row.Id);
                        $scope.PermitEvents.$promise.then(function () {
                            $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);
                        });
                    });
                }
    
                if (!$scope.row.Id) {
                    $scope.permits.push(saved_permit);
                    $scope.permitsGrid.api.setRowData($scope.permits);
                    $scope.row.dataChanged = false;
                    $scope.showAll();
                }
                else {
                    $scope.permits.forEach(function (existing_permit) { 
                        if (existing_permit.Id == $scope.row.Id) {
                            console.log(" found it -- ");
                            angular.extend(existing_permit, saved_permit);
                        }
                    });

                    //var selectedNode = $scope.permitsGrid.api.getSelectedRows()[0];

                    $scope.permitsGrid.api.setRowData($scope.permits);
                    
                    if ($scope.currentPage == "Applications") $scope.showApplications();
                    if ($scope.currentPage == "Issued") $scope.showIssued();
                    if ($scope.currentPage == "Archived") $scope.showArchived();
                    if ($scope.currentPage == "All") $scope.showAll();
                    //console.dir(selectedNode);
                    //selectedNode.node.setSelected(true);
                    
                    $scope.row.dataChanged = false;
                }

            });
        };


}];