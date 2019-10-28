var list_permits = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService','CommonService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService, CommonService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "All";
        $scope.row = null;
        $scope.clearingFilters = false;

        $scope.PermitContacts = [];
        $scope.PermitParcels = [];
        $scope.PermitEvents = [];
        $scope.PermitFiles = [];
        $scope.ParcelHistory = [];
        $scope.PermitTypes = [];
        $scope.PermitStatus = [];
        $scope.PermitFileTypes = [];
        $scope.ShowPermitListGrid = true;

        $scope.refreshingZones = false;

        $scope.dataset = DatasetService.getDataset(PERMIT_DATASETID);
        $scope.eventsdataset = DatasetService.getDataset(PERMITEVENTS_DATASETID);
        $scope.PermitFileTypes = CommonService.getMetadataProperty(METADATA_PROPERTY_PERMIT_FILETYPES);
        $scope.contactsdataset = DatasetService.getDataset(PERMITCONTACTS_DATASETID);

        $scope.contactsdataset.$promise.then(function () {
            $scope.ContactsDatasetColumnDefs = GridService.getAgColumnDefs($scope.contactsdataset);
        });

        $scope.PermitFileTypes.$promise.then(function () {
            $scope.PermitFileTypes = angular.fromJson($scope.PermitFileTypes.PossibleValues);
        });

        $scope.dataset.$promise.then(function () {
            // console.log(" -- dataset back -- ");
            $scope.AllColumnDefs = GridService.getAgColumnDefs($scope.dataset);
            $scope.permitsGrid.columnDefs = $scope.AllColumnDefs.HeaderFields;

            //setup some custom "tweaks" to the column definition defaults TODO: might be a better way
            $scope.permitsGrid.columnDefs.forEach(function (coldef) {
                if (coldef.DbColumnName == 'PermitNumber'){
                    coldef.Disabled = true;
                    coldef.filter='agTextColumnFilter'; //change from the default (checkboxes) to a "contains" filter
                }
                if(coldef.DbColumnName == 'ProjectName' || coldef.DbColumnName == 'SiteAddress')
                    coldef.filter='agTextColumnFilter'; 

                if(coldef.DbColumnName == 'ReviewsRequired'){
                    coldef.valueFormatter = function (params) {
                        return valueFormatterArrayToList(params.node.data.ReviewsRequired);
                    }
                }
                    
                
            });

            //activate the grid with the permits data
            $scope.permitsGridDiv = document.querySelector('#active-permits-grid');
            new agGrid.Grid($scope.permitsGridDiv, $scope.permitsGrid);

            $scope.permits = PermitService.getAllPermits();

            $scope.permits.$promise.then(function () {
                // console.log(" -- permits back -- ");
                $scope.permitsGrid.api.setRowData($scope.permits);

                //if there is an incoming Id, select it.
                if ($routeParams.Id) {
                    $scope.permitsGrid.api.forEachNode(function (node) {
                        if (node.data.Id == $routeParams.Id) {
                            node.setSelected(true);
                            $scope.permitsGrid.api.ensureIndexVisible(node.rowIndex, 'top');
                        }
                    });
                }

                //if there is an incoming filter, select it
                if($routeParams.filter) {
                    $scope['show'+$routeParams.filter]();
                }

            });

            //now do some caching...
            $scope.PermitPersons = PermitService.getAllPersons();
            $scope.CadasterParcels = PermitService.getAllParcels();

            $scope.PermitPersons.$promise.then(function () {
                $scope.PermitPersons.forEach(function (person) {
                    person.Label = $scope.getPersonLabel(person);
                });

                $scope.PermitPersons = $scope.PermitPersons.sort(orderByAlpha);
            });


        });

        //returns a composed label for a person
        $scope.getPersonLabel = function(person){
            var label = (person.Organization) ? person.Organization : person.FullName;
            if (label == "")
                person.FirstName + " " + person.LastName;

            return label;
        }

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
            }

            $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);

        });

        $scope.showIssued = function () {
            $scope.clearReviewedBy();
            var filter_component = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_component.selectNothing();
            filter_component.selectValue('Approved');
            filter_component.selectValue('Conditionally Approved');
            $scope.permitsGrid.api.onFilterChanged();
            if ($scope.currentPage !== "Issued")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "Issued";
            $scope.ShowPermitListGrid = true;
        };

        $scope.showApplications = function () {
            $scope.clearReviewedBy();
            var filter_component = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_component.selectNothing();
            filter_component.selectValue('New Application');
            filter_component.selectValue('Under Review');
            $scope.permitsGrid.api.onFilterChanged();
            if ($scope.currentPage !== "Applications")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "Applications";
            $scope.ShowPermitListGrid = true;
        };

        $scope.showArchived = function () {
            $scope.clearReviewedBy();
            var filter_component = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_component.selectNothing();
            filter_component.selectValue('Archived');
            $scope.permitsGrid.api.onFilterChanged();
            if ($scope.currentPage !== "Archived")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "Archived";
            $scope.ShowPermitListGrid = true;
        };

        $scope.showAll = function () {
            $scope.clearingFilters = true;
            $scope.clearReviewedBy();
            var filter_component = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_component.selectEverything();
            $scope.permitsGrid.api.onFilterChanged();
            if ($scope.currentPage !== "All")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "All";
            $scope.ShowPermitListGrid = true;
        };

        $scope.showAssignedToMe = function () {
            var filter_component = $scope.permitsGrid.api.getFilterInstance('ReviewedBy');
            filter_component.selectNothing();
            filter_component.selectValue($scope.Profile.Fullname);

            var filter_componentPS = $scope.permitsGrid.api.getFilterInstance('PermitStatus');
            filter_componentPS.selectEverything();
            filter_componentPS.unselectValue('Archived');

            $scope.permitsGrid.api.onFilterChanged();
            if ($scope.currentPage !== "My Permits")
                $scope.permitsGrid.api.deselectAll();
            $scope.currentPage = "My Permits";
            $scope.ShowPermitListGrid = true;
        };

        $scope.clearReviewedBy = function () {
            var filter_component = $scope.permitsGrid.api.getFilterInstance('ReviewedBy');
            filter_component.selectEverything();
        };

        $scope.clearFilters = function(){
            $scope.clearingFilters = true;
            $scope.permitsGrid.api.setFilterModel(null);
            $scope.currentPage = "All";
        }

        //requirement: can navigate permits by up and down arrow keys
        $scope.keyboardNavigation = function (params) {
            //console.log("my navigation");
            var previousCell = params.previousCellDef;
            var suggestedNextCell = params.nextCellDef;

            var KEY_UP = 38;
            var KEY_DOWN = 40;
            var KEY_LEFT = 37;
            var KEY_RIGHT = 39;

            switch (params.key) {
                case KEY_DOWN:
                    //console.log("down");
                    previousCell = params.previousCellDef;
                    // set selected cell on current cell + 1
                    $scope.permitsGrid.api.forEachNode(function (node) {
                        if (previousCell.rowIndex + 1 === node.rowIndex) {
                            node.setSelected(true);
                        }
                    });
                    return suggestedNextCell;
                case KEY_UP:
                    previousCell = params.previousCellDef;
                    // set selected cell on current cell - 1
                    $scope.permitsGrid.api.forEachNode(function (node) {
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
            hasFilters: false,
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
                $('#tab-status').tab('show'); //default to the "Permit Status" tab when select a different permit
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                //console.dir($scope.row);
                if ($scope.row)
                    $scope.selectPermit($scope.row.Id);
            },
            selectedItem: null,
            selectedNode: null,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onFilterChanged: function(params){
                if($scope.clearingFilters == true)
                    $scope.permitsGrid.hasFilters = $scope.clearingFilters = false;
                else
                    $scope.permitsGrid.hasFilters = true;
                    
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            navigateToNextCell: $scope.keyboardNavigation
        }


        $scope.openPermitPersonModal = function (person_id) {

            $scope.person_modal = getById($scope.PermitPersons, person_id);
            console.dir($scope.person_modal.Id);
            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/contacts/templates/add-person-modal.html',
                controller: 'AddPermitPersonModalController',
                scope: $scope,
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_person) {
                $scope.PermitPersons = PermitService.getAllPersons();
            });
        }

        $scope.permitContactsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null,
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
            selectedItem: null,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onSelectionChanged: function (params) {
                $scope.permitParcelsGrid.selectedItem = $scope.permitParcelsGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            onRowDoubleClicked: function (params) {
                window.open("index.html#!/permits/map?ParcelId=" + params.data.ParcelId, "_blank");
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
            onRowDoubleClicked: function (params) { 
                window.open("index.html#!/permits/list?Id=" + params.data.Id, "_blank");
            },
        }

        $scope.permitEventsGrid = {
            columnDefs: null,
            rowData: null,
            selectedItem: null,
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
            }
            // getRowHeight: function (params) {
            //     var comment_length = (params.data.Comments === null) ? 1 : params.data.Comments.length;
            //     var comment_height = 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
            //     var file_height = 25 * (getFilesArrayAsList(params.data.Files).length); //count up the number of file lines we will have.
            //     return (comment_height > file_height) ? comment_height : file_height;
            // },
        }

        $scope.permitFilesGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null,
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onSelectionChanged: function (params) {
                $scope.permitFilesGrid.selectedItem = $scope.permitFilesGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            onRowDoubleClicked: function (params) {
                $scope.openEditFileTypeModal($scope.permitFilesGrid.selectedItem);
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

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Modify';
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
                    return $scope.getPersonLabel(params.node.data.PermitPerson);
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
            { headerName: "Parcel Id", field: "ParcelId", width: 200, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "PLSS", field: "PLSS", width: 250, menuTabs: ['filterMenuTab'], filter: true },
            //{ headerName: "Acres", field: "Object.Acres_Cty", width: 150, menuTabs: ['filterMenuTab'] },
        ];

        $scope.parcelHistoryGrid.columnDefs = [
            { headerName: "Permit Number", field: "PermitNumber", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Project Name", field: "ProjectName", width: 220, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Parcel Id", field: "MatchingParcelId", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Permit Status", field: "PermitStatus", width: 150, menuTabs: ['filterMenuTab'], filter: true },
        ];

        $scope.permitFilesGrid.columnDefs = [
            { headerName: 'File', cellRenderer: LinkTemplate, width: 220, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'Description', headerName: 'File Type', width: 200, menuTabs: ['filterMenuTab'], filter: true },
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
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_activity) {
                $scope.selectPermit($scope.row.Id);
                // $scope.PermitEvents = PermitService.getPermitEvents($scope.row.Id);
                // $scope.PermitEvents.$promise.then(function () {
                //     $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);
                // });
            });
        }

        $scope.openContactModal = function (params) {

            //if editing, we'll have incoming params
            if (params) {
                $scope.contact_modal = params;
                $scope.contact_modal.PermitPerson.Label = $scope.getPersonLabel($scope.contact_modal.PermitPerson);
            } else {
                $scope.contact_modal = { PermitId: $scope.row.Id };
            }

            console.dir($scope.contact_modal);

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-contact-modal.html',
                controller: 'ContactModalController',
                scope: $scope,
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_contact) {
                $scope.PermitContacts = PermitService.getPermitContacts(saved_contact.PermitId);
                $scope.PermitContacts.$promise.then(function () {
                    $scope.permitContactsGrid.api.setRowData($scope.PermitContacts);
                });
            });
        }

        //open a modal for editing only the filetype
        $scope.openEditFileTypeModal = function(params){
            $scope.file_modal = params;
            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/modal-edit-file.html',
                controller: 'EditFileTypeModalController',
                scope: $scope,
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_file) {
                $scope.PermitFiles.forEach(function (file, index) {
                    if (file.Id == saved_file.Id) {
                        file.Description = saved_file.Description;
                        $scope.permitFilesGrid.api.setRowData($scope.PermitFiles);
                    }
                }); 
            });
        }

        $scope.openParcelModal = function (params) {

            if ($scope.row.dataChanged){
                alert("Please save or cancel your changes before adding a new parcel.");
                return;
            }

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
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_parcel) {
                $scope.PermitParcels = PermitService.getPermitParcels(saved_parcel.PermitId);
                $scope.PermitParcels.$promise.then(function () {
                    $scope.permitParcelsGrid.api.setRowData($scope.PermitParcels);
                    $scope.refreshZones();
                    $scope.refreshParcelHistory();

                    /* not maintaining this field any longer
                    $scope.row.LegalDescription = ($scope.row.LegalDescription) ? $scope.row.LegalDescription +","+saved_parcel.ParcelId : saved_parcel.ParcelId;
                    $scope.permits.forEach(function (existing_permit) { 
                        if (existing_permit.Id == $scope.row.Id) {
                            existing_permit.LegalDescription = $scope.row.LegalDescription;
                        }
                    });
                    */
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

            $scope.PermitTypes = PermitService.getPermitTypes(); //load the permit types fresh -- these have our permitnumber to increment...

            $scope.row = $scope.permitsGrid.selectedItem = GridService.getNewRow($scope.permitsGrid.columnDefs);

            $scope.PermitContacts = [];
            $scope.PermitParcels = [];
            $scope.PermitEvents = [];
            $scope.PermitFiles = [];
            $scope.ParcelHistory = [];

            $scope.resetGrids();
            $scope.togglePermitTypeField();

            $('#tab-basicinfo').tab('show'); //default to the "Permit Details" tab when select a different permit

        };

        $scope.removeSelectedContact = function () {
            if ($scope.permitContactsGrid.selectedItem && confirm("Are you sure you want to remove this Contact?")) {
                var removed = PermitService.removeContact($scope.permitContactsGrid.selectedItem);
                removed.$promise.then(function () {
                    $scope.PermitContacts.forEach(function (contact, index) {
                        if (contact.PermitPersonId == $scope.permitContactsGrid.selectedItem.PermitPersonId) {
                            $scope.PermitContacts.splice(index,1);
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

        $scope.hasPrimaryContact = function() {
            var hasPrimaryContact = false;

            $scope.PermitContacts.forEach(function (contact, index) {
                if(contact.IsPrimary)
                    hasPrimaryContact = true;
            });

            return hasPrimaryContact;
        }

        $scope.openPermitReport = function(){
            if(!$scope.hasPrimaryContact() && $scope.row.IssueDate == null){
                alert("You must specify a primary contact and IssueDate before you can generate a Permit report.")
                return;
            }
            if(!$scope.hasPrimaryContact()){
                alert("You must specify a primary contact before you can generate a Permit report.")
                return;
            }
            if($scope.row.IssueDate == null){
                alert("You must specify an IssueDate before you can generate a Permit report.")
                return;
            }

            window.open("https://paluutreports.ctuir.org/Reports/report/TPO/DevelopmentPermit?PermitNumber=" + $scope.row.PermitNumber, "_blank");
        }

        $scope.openParcelInMap = function(){
            window.open("index.html#!/permits/map?ParcelId="+ $scope.permitParcelsGrid.selectedItem.ParcelId, "_blank");
        }

        $scope.openCOReport = function(){
            if(!$scope.hasPrimaryContact()){
                alert("You must specify a primary contact before you can generate a Certificate of Occupancy report.")
                return;
            }
            window.open("https://paluutreports.ctuir.org/Reports/report/TPO/CertificateOfOccupancy?PermitNumber=" + $scope.row.PermitNumber, "_blank");
        }

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
            
            $scope.row.ReviewsRequired = ($scope.row.ReviewsRequired) ? angular.fromJson($scope.row.ReviewsRequired) : [];
            
            if (!Array.isArray($scope.row.ReviewsRequired))
                $scope.row.ReviewsRequired = [];

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

                $scope.PermitStatus = [];

                //setup our handy array for the Status tab
                $scope.row.ReviewsRequired.forEach(function (review) { 

                    var route = {
                        ItemType: review,
                        EventType: 'Review',
                    };

                    $scope.PermitEvents.forEach(function (event) { 
                        if (event.ItemType == review) //should only be one, really...
                        {
                            route.RequestDate = event.RequestDate;
                            route.ResponseDate = event.ResponseDate;
                            route.Comments = event.Comments;
                        }
                    });

                    $scope.PermitStatus.push(route);
                    
                });

                //and now once for inspections
                $scope.PermitEvents.forEach(function (event) { 
                    var route = {};
                    if (event.EventType == "Inspection") 
                    {
                        route.RequestDate = event.RequestDate;
                        route.ResponseDate = event.ResponseDate;
                        route.Comments = event.Comments;
                        route.EventType = event.EventType;
                        route.ItemType = event.ItemType;

                        $scope.PermitStatus.push(route);
                    }
                });

                $scope.togglePermitTypeField();

                //stretch the textareas to the height of the content
                $('textarea').each(function () {
                    this.setAttribute('style', 'min-height: 130px','height:auto; height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
                  }).on('input', function () {
                    this.style.height = 'auto';
                    this.style.minheight = '130px';
                    this.style.height = (this.scrollHeight) + 'px';
                    this.value = this.value.replace(/\n/g, ""); //do not allow hard-returns
                  });

            });

            $scope.PermitFiles.$promise.then(function () {
                $scope.permitFilesGrid.api.setRowData($scope.PermitFiles);
                $scope.permitFilesGrid.selectedItem = null;
            });

            $scope.row.Zones = [];

            if ($scope.row.Zoning) {
                $scope.row.Zoning = getJsonObjects($scope.row.Zoning);
                //console.warn(" -- Zoning -- ");
                //console.dir($scope.row.Zoning);

            } else {
                $scope.row.Zoning = [];
            }

        };

        $scope.resetGrids();

        //if the permit is already saved, PermitType should be disabled
        $scope.togglePermitTypeField = function(){
            if($scope.row.Id){
                jQuery("#field-PermitType select.form-control").attr("disabled","disabled");
            }
            else{
                jQuery("#field-PermitType select.form-control").removeAttr("disabled");
            }
        }

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
            $scope.row.Zones.length = 0;
            $scope.PermitParcels.forEach(function (parcel) {

                var the_zones = parcel.Object.ZoneCode.split(":");

                if (Array.isArray(the_zones)) {
                    the_zones.forEach(function (zone) {
                        if (!$scope.row.Zones.contains(zone))
                            $scope.row.Zones.push(zone);
                    });
                };
            });
        };


        //this function populates the zones using the live ArcGIS server layers but it is too slow, 
        //  so we'll use the above strategy instead and keep this around in case we change our mind.
        $scope.refreshZonesLive = function () {
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
                                    if (!$scope.row.Zones.contains(zfeature.attributes.ZONECODE))
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

                        if (result.features.length == 0)
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

            //console.log("onHeaderEditingStopped: " + field.DbColumnName);

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

                if (selected && selected[field.DbColumnName] != $scope.row[field.DbColumnName]) {
                    $scope.row.dataChanged = true;
                }

                if(!selected && !$scope.row.Id) //then it is a new record
                    $scope.row.dataChanged = true;
                    
            }

            $rootScope.$emit('headerEditingStopped', field); //offer child scopes a chance to do something, i.e. add activity modal...

            //if this is a new permit and they changed the Permit Type, then update the permit number
            //console.log(field.DbColumnName);
            //console.log($scope.row.Id);
            if (field.DbColumnName == 'PermitType' && !$scope.row.Id) {
                $scope.generatePermitNumber();
            }

        };

        $scope.generatePermitNumber = function () {
            var permitnumber = "XXX";
            $scope.PermitTypes.forEach(function (type) { 
                if (type.Id === $scope.row.PermitType) {
                    if (moment().year() > type.CurrentPermitYear)
                        type.CurrentPermitNumber = 1;

                    //permitnumber = (type.CurrentPermitNumber + 1+"").padStart(3, '0');
                    permitnumber = type.PermitNumberPrefix + "-" + moment().format('YY') + "-" + permitnumber;

                    $scope.row.PermitNumber = permitnumber;
                }
            });
        };

        $scope.cancel = function () { 
            
            $scope.permitsGrid.selectedItem = $scope.row = null;
            $scope.permitsGrid.api.deselectAll();
            
        };

        $scope.save = function () {
            
            var to_save = angular.copy($scope.row);
            $scope.row.isSaving = true;
            to_save.ReviewsRequired = angular.toJson(to_save.ReviewsRequired);
            to_save.Zoning = angular.toJson(to_save.Zoning);
            // console.dir(to_save);

            var saved_permit = PermitService.savePermit(to_save);

            saved_permit.$promise.then(function () { 
                $scope.row.isSaving = false;
                // console.log("permit saved: ");
                // console.dir(saved_permit);

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

                    $scope.selectPermit($scope.row.Id); //reload
                    $scope.ShowPermitListGrid = true;
                    
                    $scope.permitsGrid.api.setRowData($scope.permits);
                    
                    if ($scope.currentPage == "Applications") $scope.showApplications();
                    if ($scope.currentPage == "Issued") $scope.showIssued();
                    if ($scope.currentPage == "Archived") $scope.showArchived();
                    if ($scope.currentPage == "All") $scope.showAll();
                    
                    $scope.row.dataChanged = false;

                }

                //select the permit we just saved/updated
                $scope.permitsGrid.api.forEachNode(function(node){
                    if(node.data.PermitNumber == $scope.row.PermitNumber){
                        node.setSelected(true);                        
                        $scope.permitsGrid.api.ensureIndexVisible(node.index, 'bottom'); //scroll to the selected row
                    }
                })

            },function(data){
                $scope.row.isSaving = false;
                $scope.row.hasError = true;
                $scope.row.errorMessage = "There was a problem saving."
            });
        };

   
}];