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

        $scope.refreshingZones = false;

        $scope.dataset = DatasetService.getDataset(PERMIT_DATASETID);
        $scope.eventsdataset = DatasetService.getDataset(PERMITEVENTS_DATASETID);
        
        $scope.dataset.$promise.then(function () { 
            console.log(" -- dataset back -- ");
            $scope.AllColumnDefs = GridService.getAgColumnDefs($scope.dataset);
            $scope.permitsGrid.columnDefs = $scope.AllColumnDefs.HeaderFields;
            
            //activate the grid with the permits data
            $scope.permitsGridDiv = document.querySelector('#active-permits-grid');
            new agGrid.Grid($scope.permitsGridDiv, $scope.permitsGrid);

            $scope.permits = PermitService.getAllPermits();

            $scope.permits.$promise.then(function () {
                console.log(" -- permits back -- ");
                $scope.permitsGrid.api.setRowData($scope.permits);
            });

            //now do some caching...
            $scope.PermitPersons = PermitService.getAllPersons();
            $scope.CadasterParcels = PermitService.getAllParcels();

            $scope.PermitPersons.$promise.then(function () { 
                $scope.PermitPersons.forEach(function (person) { 
                    person.Label = (person.Organization) ? person.Organization : person.FullName; 
                    if(person.Label == "")
                        person.FirstName + " " + person.LastName;
                });   

                $scope.PermitPersons = $scope.PermitPersons.sort(orderByAlpha);
            });


        });

        $scope.eventsdataset.$promise.then(function () {
            console.log(" -- events dataset back -- ");
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
            filter_component.selectValue('New Application');
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
                       $scope.permitsGrid.api.forEachNode( function(node) {
                           if (previousCell.rowIndex + 1 === node.rowIndex) {
                               node.setSelected(true);
                           }
                       });
                       return suggestedNextCell;
                   case KEY_UP:
                       previousCell = params.previousCellDef;
                       // set selected cell on current cell - 1
                       $scope.permitsGrid.api.forEachNode( function(node) {
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
                    //warn if they're trying to change the selection when data is changed
                    if ($scope.row.Id != $scope.permitsGrid.api.getSelectedRows()[0].Id) {
                        alert("It looks like you've changed this permit. Please click 'Save' or 'Cancel' before navigating to another permit.");
                        $scope.permitsGrid.selectedNode.setSelected(true);
                    }

                    //in any case, don't change.
                    return false;
                }

                $scope.permitsGrid.selectedItem = $scope.row = angular.copy($scope.permitsGrid.api.getSelectedRows()[0]);
                $scope.permitsGrid.selectedNode = $scope.permitsGrid.api.getSelectedNodes()[0];
                $('#tab-basicinfo').tab('show'); //default to the "Permit Details" tab when select a different permit
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                //console.dir($scope.row);
                if($scope.row)
                    $scope.selectPermit($scope.row.Id);
            },
            selectedItem: null,
            selectedNode: null,
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
            getRowHeight: function (params) {
                var comment_length = (params.data.Comments === null) ? 1 : params.data.Comments.length;
                var comment_height = 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
                var file_height = 25 * (getFilesArrayAsList(params.data.Files).length); //count up the number of file lines we will have.
                return (comment_height > file_height) ? comment_height : file_height;
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
            linkBtn.innerHTML = param.data.Name;
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
            { headerName: "Permit Number", field: "PermitNumber", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Project Name", field: "ProjectName", width: 220, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Parcel Id", field: "MatchingParcelId", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Permit Status", field: "PermitStatus", width: 150, menuTabs: ['filterMenuTab'], filter: true  },
        ];

        $scope.permitFilesGrid.columnDefs = [
            //{ colId: 'EditLinks', cellRenderer: EditFileLinksTemplate, width: 60, menuTabs: [], hide: true },
            { headerName: 'File', cellRenderer: LinkTemplate, width: 220, menuTabs: [] },
            //{ field: 'Title', headerName: 'Title', width: 250, sort: 'asc', menuTabs: ['filterMenuTab'], filter: 'text' },
            //{ field: 'Description', headerName: 'Description', cellStyle: { 'white-space': 'normal' }, width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
            //{
            //    headerName: 'Sharing Level', field: 'SharingLevel', width: 150,
            //    cellRenderer: function (params) {
            //        if (params.node.data.SharingLevel == SHARINGLEVEL_PRIVATE)
            //            return SharingLevel['SHARINGLEVEL_PRIVATE'];
            //        else if (params.node.data.SharingLevel == SHARINGLEVEL_PUBLICREAD)
            //            return SharingLevel['SHARINGLEVEL_PUBLICREAD'];
            //        else return 'Unknown';
             //   }, menuTabs: [],
            //},
            { field: 'Uploaded', headerName: "Uploaded", width: 240, valueGetter: UploadedByTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
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
                        $scope.refreshZones();
                        $scope.refreshParcelHistory();
                    });
            });
        }

        $scope.openFileModal = function (params) {

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/modal-new-file.html',
                controller: 'PermitFileModalController',
                backdrop: 'static',
                keyboard: false,
                scope: $scope,
            }).result.then(function (saved_files) {
                if (Array.isArray(saved_files)) {

                    saved_files.forEach(function (new_file) {
                        $scope.PermitFiles.push(new_file);
                    });

                    $scope.permitFilesGrid.api.setRowData($scope.PermitFiles);
                }
                else
                    console.warn("looks like no files were saved?");
            });
        }

        $scope.removeSelectedFile = function () {

            if (!confirm("Are you sure you want to delete this file?")) {
                return;
            }

            var file_to_remove = $scope.permitFilesGrid.selectedItem;
            var deleted = PermitService.deleteFile(PERMIT_PROJECTID, $scope.row.Id, 0, file_to_remove);

            deleted.$promise.then(function () { 
                $scope.PermitFiles.forEach(function (file, index) { 
                    if (file.Id == file_to_remove.Id) {
                        $scope.PermitFiles.splice(index, 1);
                        $scope.permitFilesGrid.api.setRowData($scope.PermitFiles);
                    }

                });
            });
            
        }

        $scope.createNewPermit = function () {

            if ($scope.row && $scope.row.dataChanged && !confirm("It looks like you've made edits on this page. Are you sure you want to clear everything and start a new permit?")) {
                return;
            }

            $scope.row = GridService.getNewRow($scope.permitsGrid.columnDefs); ;

            $scope.PermitContacts = [];
            $scope.PermitParcels = [];
            $scope.PermitEvents = [];
            $scope.PermitFiles = [];
            $scope.ParcelHistory = []; 

            $scope.resetGrids();

            $('#tab-basicinfo').tab('show'); //default to the "Permit Details" tab when select a different permit
            
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
                        $scope.refreshZones();
                        $scope.refreshParcelHistory();
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

            if ($scope.permitEventsGrid && $scope.permitEventsGrid.api)
                $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);

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
                $scope.permitContactsGrid.selectedItem = null;
            });

            $scope.PermitParcels.$promise.then(function () {
                $scope.permitParcelsGrid.api.setRowData($scope.PermitParcels);
                $scope.permitParcelsGrid.selectedItem = null;
                $scope.refreshParcelHistory(); 
                $scope.refreshZones();
            });

            $scope.PermitEvents.$promise.then(function () {
                $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);
                $scope.permitEventsGrid.selectedItem = null;
            });

            $scope.PermitFiles.$promise.then(function () {
                $scope.permitFilesGrid.api.setRowData($scope.PermitFiles);
                $scope.permitFilesGrid.selectedItem = null;
            });

            $scope.row.ReviewsRequired = ($scope.row.ReviewsRequired) ? angular.fromJson($scope.row.ReviewsRequired) : [];
        
            $scope.row.Zones = [];

            if ($scope.row.Zoning) {
                $scope.row.Zoning = getJsonObjects($scope.row.Zoning);
                console.warn(" -- Zoning -- ");
                console.dir($scope.row.Zoning);

            } else {
                $scope.row.Zoning = [];
            }

        };
        
        $scope.resetGrids();

        $scope.refreshParcelHistory = function () { 
            $scope.ParcelHistory = [];
            $scope.parcelHistoryGrid.api.setRowData($scope.ParcelHistory);

            //iterate parcels to find any related permits
            $scope.PermitParcels.forEach(function (parcel) { 
                var related_permits = PermitService.getPermitsByRelatedParcels(parcel.ParcelId);
                related_permits.$promise.then(function () { 
                    related_permits.forEach(function (permit) { 
                        if (permit.Id !== $scope.row.Id) {
                            permit.MatchingParcelId = parcel.ParcelId;
                            $scope.ParcelHistory.push(permit);
                        }
                    });
                    $scope.parcelHistoryGrid.api.setRowData($scope.ParcelHistory);
                });
            });
        };

        $scope.refreshZones = function () {
            $scope.refreshingZones = true;
            $scope.row.Zones.length = 0;
            require([
                'esri/config',
                'esri/tasks/query',
                'esri/tasks/QueryTask'], function (esriConfig, Query, QueryTask) {
                    esriConfig.defaults.io.proxyUrl = proxyUrl; // From the config.js file.
                    esriConfig.defaults.io.alwaysUseProxy = true;

                    //get the geometries of our related parcels
                    var parcelids = [];
                    $scope.PermitParcels.forEach(function (parcel) { 
                        parcelids.push(parcel.ParcelId);
                    });
                    //2N30900000105

                    if (parcelids.length == 0) {
                        console.warn("no parcelids to search for");
                        $scope.refreshingZones = false;
                        return;
                    }

                    parcelids = parcelids.join("','");

                    var queryTask = new QueryTask(PARCEL_LAYER);
                    var query = new Query();

                    query.where = "PARCELID in ('" + parcelids + "')";

                    console.log("looking for parcels: " + query.where);

                    query.outSpatialReference = { wkid: 102100 };
                    query.returnGeometry = true;
                    query.outFields = ["*"];

                    queryTask.execute(query, function (result) {
                        console.dir(result);

                        result.features.forEach(function (feature) {
                            console.log("Ok - trying to find the zones for: ");
                            console.dir(feature);

                            var zoneQueryTask = new QueryTask(ZONING_LAYER);
                            var zoneQuery = new Query();

                            zoneQuery.outSpatialReference = { wkid: 102100 };
                            zoneQuery.returnGeometry = true;
                            zoneQuery.outFields = ["*"];
                            zoneQuery.geometry = feature.geometry;
                            zoneQuery.spatialRelationship = Query.SPATIAL_REL_INTERSECTS; //Query.SPATIAL_REL_INTERSECTS; //SPATIAL_REL_OVERLAPS?
                            zoneQuery.where = "1=1";
                            zoneQuery.maxAllowableOffset = 0;
                            zoneQuery.distance = 0;

                            zoneQueryTask.execute(zoneQuery, function (zqresult) {
                                console.log("back from zone query with a result: ");
                                console.dir(zqresult);
                                zqresult.features.forEach(function (zfeature) {
                                    if(!$scope.row.Zones.contains(zfeature.attributes.ZONECODE))
                                        $scope.row.Zones.push(zfeature.attributes.ZONECODE);
                                    console.dir($scope.row.Zones);
                                });
                                
                                //refresh our view
                                setTimeout(function () { 
                                    $scope.$apply(function () {
                                        //$scope.row.Zoning = zones; //zones.join(",");
                                        $scope.refreshingZones = false;
                                    });
                                }, 500);
                                
                            }, function (err) {
                                console.log("Failure executing query!");
                                console.dir(err);
                                console.dir(zoneQuery);
                                $scope.refreshingZones = false;
                            });

                        });

                        if(result.features.length == 0)
                            $scope.refreshingZones = false;

                    }, function (err) {
                            console.log("Failure executing query!");
                            console.dir(err);
                            console.dir(zoneQuery);
                            $scope.refreshingZones = false;
                    });

            });

            
        };


        $scope.onHeaderEditingStopped = function (field) { //fired onChange for header fields (common/templates/form-fields)
            
            console.log("onHeaderEditingStopped: " + field.DbColumnName);

            //build event to send for validation
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

            if ($scope.row.hasOwnProperty(field.DbColumnName)) { //make sure it is a header field from the permit

                //did the data actually change?

                //the selected original permit
                var selected = $scope.permitsGrid.api.getSelectedRows()[0];

                //if we've lost our original selection, find it in the permits
                if (!selected || selected.Id != $scope.row.Id) {
                    $scope.permits.forEach(function (itr_permit) { 
                        if (itr_permit.Id == $scope.row.Id)
                            selected = itr_permit;
                    });
                }

                if (selected[field.DbColumnName] != $scope.row[field.DbColumnName]) {
                    $scope.row.dataChanged = true;
                }

            }

            $rootScope.$emit('headerEditingStopped', field); //offer child scopes a chance to do something, i.e. add activity modal...

        };


        $scope.cancel = function () { 
            $scope.row = angular.copy($scope.permitsGrid.api.getSelectedRows()[0]);

            if($scope.row)
                $scope.selectPermit($scope.row.Id);

            //console.log("cancelled...");
            //console.dir($scope.row);
        };

        $scope.save = function () {
            
            var to_save = angular.copy($scope.row);
            to_save.ReviewsRequired = angular.toJson(to_save.ReviewsRequired);
            to_save.Zoning = angular.toJson(to_save.Zoning);
            console.dir(to_save);

            var saved_permit = PermitService.savePermit(to_save);

            saved_permit.$promise.then(function () { 
                console.log("permit saved: ");
                console.dir(saved_permit);

                //requirement: if we saved a new status, add a record to the permitsevents
                if ($scope.row.Id && $scope.row.PermitStatus !== $scope.permitsGrid.api.getSelectedRows()[0].PermitStatus) {
                    var new_event = {
                        PermitId: $scope.row.Id,
                        ByUser: $scope.Profile.Id,
                        EventDate: moment().format('L'),
                        RequestDate: moment().format('L'),
                        ResponseDate: moment().format('L'),
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
                    $scope.row = saved_permit;
                    //$scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
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
                    
                    $scope.row.dataChanged = false;

                }

            });
        };


}];