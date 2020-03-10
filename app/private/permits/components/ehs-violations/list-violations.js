var list_violations = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'ViolationService', 'GridService', 'DatasetService','CommonService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, ViolationService, GridService, DatasetService, CommonService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "All";
        $scope.row = null;

        
        $scope.ViolationParcels = [];
        $scope.ViolationEvents = [];
        $scope.ViolationFiles = [];
        $scope.ParcelHistory = [];
        $scope.ViolationFileTypes = [];
        $scope.PermitFileTypes = [];

        $scope.PermitFileTypes = CommonService.getMetadataProperty(METADATA_PROPERTY_PERMIT_FILETYPES);

        $scope.PermitFileTypes.$promise.then(function () {
            $scope.PermitFileTypes = angular.fromJson($scope.PermitFileTypes.PossibleValues);
        });

        $scope.dataset = DatasetService.getDataset(EHS_DATASETID);
        //$scope.eventsdataset = DatasetService.getDataset(ViolationEvents_DATASETID);
        //$scope.contactsdataset = DatasetService.getDataset(VIOLATIONSCONTACTS_DATASETID);

        /*
        $scope.contactsdataset.$promise.then(function () {
            $scope.ContactsDatasetColumnDefs = GridService.getAgColumnDefs($scope.contactsdataset);
        });

        */

        $scope.dataset.$promise.then(function () {
            // console.log(" -- dataset back -- ");
            $scope.AllColumnDefs = GridService.getAgColumnDefs($scope.dataset);
            $scope.ehsGrid.columnDefs = $scope.AllColumnDefs.HeaderFields;

            //setup some custom "tweaks" to the column definition defaults TODO: might be a better way
            $scope.ehsGrid.columnDefs.forEach(function (coldef) {
                if (coldef.DbColumnName == 'FileNumber'){
                    coldef.Disabled = true;
                    coldef.filter='agTextColumnFilter'; //change from the default (checkboxes) to a "contains" filter
                }

                if(coldef.DbColumnName == 'Name' || coldef.DbColumnName == 'SiteAddress')
                    coldef.filter='agTextColumnFilter'; 

                if(coldef.DbColumnName == 'NotifyRoutes'){
                    coldef.valueFormatter = function (params) {
                        return valueFormatterArrayToList(params.node.data.NotifyRoutes);
                    }
                }
                
            });

            //activate the grid with the violations data
            $scope.ehsGridDiv = document.querySelector('#active-ehs-grid');
            new agGrid.Grid($scope.ehsGridDiv, $scope.ehsGrid);

            $scope.violations = ViolationService.getAllViolations();

            $scope.violations.$promise.then(function () {
                // console.log(" -- violations back -- ");
                $scope.ehsGrid.api.setRowData($scope.violations);

                //if there is an incoming Id, select it.
                if ($routeParams.Id) {
                    $scope.ehsGrid.api.forEachNode(function (node) {
                        if (node.data.Id == $routeParams.Id) {
                            node.setSelected(true);
                            $scope.ehsGrid.api.ensureIndexVisible(node.rowIndex, 'top');
                        }
                    });
                }

                /*
                //if there is an incoming filter, select it
                if($routeParams.filter) {
                    $scope['show'+$routeParams.filter]();
                }
                */

                GridService.autosizeColumns($scope.ehsGrid);

            });

            //now do some caching from permits persons and parcels...
            $scope.PermitPersons = PermitService.getAllPersons();
            $scope.CadasterParcels = PermitService.getAllParcels();

            $scope.PermitPersons.$promise.then(function () {
                $scope.PermitPersons.forEach(function (person) {
                    person.Label = $scope.getPersonLabel(person);
                });

                $scope.PermitPersons = $scope.PermitPersons.sort(orderByAlpha);
            });
        });
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
                    $scope.ehsGrid.api.forEachNode(function (node) {
                        if (previousCell.rowIndex + 1 === node.rowIndex) {
                            node.setSelected(true);
                        }
                    });
                    return suggestedNextCell;
                case KEY_UP:
                    previousCell = params.previousCellDef;
                    // set selected cell on current cell - 1
                    $scope.ehsGrid.api.forEachNode(function (node) {
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


        $scope.ehsGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            hasFilters: false,
            onSelectionChanged: function (params) {

                if ($scope.row && $scope.row.dataChanged) {
                    //warn if they're trying to change the selection when data is changed
                    if ($scope.row.Id != $scope.ehsGrid.api.getSelectedRows()[0].Id) {
                        alert("It looks like you've changed this record. Please click 'Save' or 'Cancel' before navigating to another record.");
                        $scope.ehsGrid.selectedNode.setSelected(true);
                    }

                    //in any case, don't change.
                    return false;
                }

                $scope.ehsGrid.selectedItem = $scope.row = angular.copy($scope.ehsGrid.api.getSelectedRows()[0]);
                $scope.ehsGrid.selectedNode = $scope.ehsGrid.api.getSelectedNodes()[0];
                $('#tab-basicinfo').tab('show'); //default to the "Permit Status" tab when select a different permit
                
                if ($scope.row)
                    $scope.selectViolation($scope.row.Id);

                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid

                //console.log(" -- selected item")
                //console.dir($scope.row);
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
                    $scope.ehsGrid.hasFilters = $scope.clearingFilters = false;
                else
                    $scope.ehsGrid.hasFilters = true;
                    
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            navigateToNextCell: $scope.keyboardNavigation
        }


        $scope.violationParcelsGrid = {
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
                $scope.violationParcelsGrid.selectedItem = $scope.violationParcelsGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            onRowDoubleClicked: function (params) {
                window.open("index.html#!/permits/map?ParcelId=" + params.data.ParcelId, "_blank");
            },
        }

        $scope.violationHistoryGrid = {
            columnDefs: null,
            rowData: null,
            rowSelection: 'single',
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onRowDoubleClicked: function (params) { 
                window.open("index.html#!/permits/ehsviolations?Id=" + params.data.Id, "_blank");
            },
        }


        $scope.violationFilesGrid = {
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
                $scope.violationFilesGrid.selectedItem = $scope.violationFilesGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            onRowDoubleClicked: function (params) {
                $scope.openEditFileTypeModal($scope.violationFilesGrid.selectedItem);
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
                window.open("index.html#!/permits/ehsviolations?Id=" + params.data.Id, "_blank");
            },
        }

        $scope.violationContactsGrid = {
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
                $scope.openPermitPersonModal($scope.violationContactsGrid.selectedItem.PermitPersonId);
            },
            onSelectionChanged: function (params) {
                $scope.violationContactsGrid.selectedItem = $scope.violationContactsGrid.api.getSelectedRows()[0];
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


        $scope.violationContactsGrid.columnDefs = [
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

        $scope.violationParcelsGrid.columnDefs = [
            { headerName: "Parcel Id", field: "ParcelId", width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "PLSS", field: "PLSS", width: 180, menuTabs: ['filterMenuTab'], filter: true },
            //{ headerName: "Acres", field: "Object.Acres_Cty", width: 150, menuTabs: ['filterMenuTab'] },
            { headerName: "GIS", width: 150, menuTabs: ['filterMenuTab'], 
                valueGetter: function(param){
                    if(param.data.Object) { //then we have joined cadaster on objectid for this parcel
                        return (param.data.Object.ParcelId == param.data.ParcelId) ? "Cadaster" : "Updated";
                    } else {
                        return "Historical"; // if no cadaster object 
                    }
                } 
            },
        ];

        $scope.parcelHistoryGrid.columnDefs = [
            { headerName: "File Number", field: "FileNumber", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Name", field: "Name", width: 220, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Parcel Id", field: "MatchingParcelId", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Status", field: "ViolationStatus", width: 150, menuTabs: ['filterMenuTab'], filter: true },
        ];

        $scope.violationFilesGrid.columnDefs = [
            { headerName: 'File', cellRenderer: LinkTemplate, width: 220, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'Description', headerName: 'File Type', width: 200, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'Uploaded', headerName: "Uploaded", width: 240, valueGetter: UploadedByTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
        ];
        
        

        $scope.createNew = function () {

            if ($scope.row && $scope.row.dataChanged && !confirm("It looks like you've made edits on this page. Are you sure you want to clear everything and start a new record?")) {
                return;
            }

            //$scope.PermitTypes = PermitService.getPermitTypes(); //load the permit types fresh -- these have our permitnumber to increment...

            $scope.row = $scope.ehsGrid.selectedItem = GridService.getNewRow($scope.ehsGrid.columnDefs);

            $scope.generateFileNumber();

            $scope.ViolationContacts = [];
            $scope.ViolationParcels = [];
            $scope.ViolationEvents = [];
            $scope.ViolationFiles = [];
            $scope.ParcelHistory = [];

            $scope.resetGrids();

            $('#tab-basicinfo').tab('show'); //default to the "Permit Details" tab when select a different permit

        };

        $scope.openContactModal = function (params) {

            //if editing, we'll have incoming params
            if (params) {
                $scope.contact_modal = params;
                $scope.contact_modal.PermitPerson.Label = $scope.getPersonLabel($scope.contact_modal.PermitPerson);
            } else {
                $scope.contact_modal = { PermitId: $scope.row.Id, EHSViolationId: $scope.row.Id };
            }

            console.dir($scope.contact_modal);

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-contact-modal.html',
                controller: 'ContactModalController',
                scope: $scope,
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_contact) {
                $scope.ViolationContacts = ViolationService.getViolationContacts(saved_contact.EHSViolationId);
                $scope.ViolationContacts.$promise.then(function () {
                    $scope.violationContactsGrid.api.setRowData($scope.ViolationContacts);
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
                $scope.ViolationParcels = ViolationService.getViolationParcels(saved_parcel.EHSViolationId);
                $scope.ViolationParcels.$promise.then(function () {
                    $scope.violationParcelsGrid.api.setRowData($scope.ViolationParcels);
                    //$scope.refreshZones();
                    $scope.refreshParcelHistory();
                });
            });
        }

        $scope.openFileModal = function (params) {

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/modal-new-file.html',
                controller: 'ViolationFileModalController',
                backdrop: 'static',
                keyboard: false,
                scope: $scope,
            }).result.then(function (saved_files) {
                if (Array.isArray(saved_files)) {

                    saved_files.forEach(function (new_file) {
                        $scope.ViolationFiles.push(new_file);
                    });

                    $scope.violationFilesGrid.api.setRowData($scope.ViolationFiles);
                }
                else
                    console.warn("looks like no files were saved?");
            });
        }

        //open a modal for editing only the filetype
        $scope.openEditFileTypeModal = function(params){
            $scope.file_modal = params;
            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/modal-edit-file.html',
                controller: 'EditViolationFileTypeModalController',
                scope: $scope,
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_file) {
                $scope.ViolationFiles.forEach(function (file, index) {
                    if (file.Id == saved_file.Id) {
                        file.Description = saved_file.Description;
                        $scope.violationFilesGrid.api.setRowData($scope.ViolationFiles);
                    }
                }); 
            });
        }


        $scope.removeSelectedFile = function () {

            if (!confirm("Are you sure you want to delete this file?")) {
                return;
            }

            var file_to_remove = $scope.violationFilesGrid.selectedItem;
            var deleted = ViolationService.deleteViolationFile(EHS_PROJECTID, $scope.row.Id, 0, file_to_remove);

            deleted.$promise.then(function () {
                $scope.ViolationFiles.forEach(function (file, index) {
                    if (file.Id == file_to_remove.Id) {
                        $scope.ViolationFiles.splice(index, 1);
                        $scope.violationFilesGrid.api.setRowData($scope.ViolationFiles);
                    }
                });
            });

        }

        //returns a composed label for a person
        $scope.getPersonLabel = function(person){
            var label = (person.Organization) ? person.Organization : person.FullName;
            if (label == "")
                person.FirstName + " " + person.LastName;

            return label;
        }

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
                var selected = $scope.ehsGrid.api.getSelectedRows()[0];

                //if we've lost our original selection, find it in the permits
                if (!selected || selected.Id != $scope.row.Id) {
                    $scope.violations.forEach(function (itr_permit) {
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
                
        };

        $scope.generateFileNumber = function () {
            $scope.row.FileNumber = "EHS-" + moment().format('YY') + "-XXX";
        };

        $scope.cancel = function () { 
            
            $scope.ehsGrid.selectedItem = $scope.row = null;
            $scope.ehsGrid.api.deselectAll();
            
        };

        $scope.resetGrids = function () {

            //activate the violation contacts grid
            if (!$scope.violationContactsGridDiv) {
                $scope.violationContactsGridDiv = document.querySelector('#violation-contacts-grid');
                new agGrid.Grid($scope.violationContactsGridDiv, $scope.violationContactsGrid);
            }

            //activate the violation parcels grid
            if (!$scope.violationParcelsGridDiv) {
                $scope.violationParcelsGridDiv = document.querySelector('#violation-parcels-grid');
                new agGrid.Grid($scope.violationParcelsGridDiv, $scope.violationParcelsGrid);
            }

            //activate the parcel history grid
            if (!$scope.parcelHistoryGridDiv) {
                $scope.parcelHistoryGridDiv = document.querySelector('#parcel-history-grid');
                new agGrid.Grid($scope.parcelHistoryGridDiv, $scope.parcelHistoryGrid);
            }

            //activate the violation files grid
            if (!$scope.violationFilesGridDiv) {
                $scope.violationFilesGridDiv = document.querySelector('#violation-files-grid');
                new agGrid.Grid($scope.violationFilesGridDiv, $scope.violationFilesGrid);
            }
            $scope.violationContactsGrid.api.setRowData($scope.ViolationContacts);
            $scope.violationParcelsGrid.api.setRowData($scope.ViolationParcels);
            $scope.violationFilesGrid.api.setRowData($scope.ViolationFiles);
            $scope.parcelHistoryGrid.api.setRowData($scope.ParcelHistory);

            if ($scope.violationEventsGrid && $scope.violationEventsGrid.api)
                $scope.violationEventsGrid.api.setRowData($scope.ViolationEvents);

            if ($scope.Profile.hasRole("Permits")) { //TODO: EditPermits?
                $scope.violationContactsGrid.columnApi.setColumnVisible("EditLinks", true);
                $scope.violationParcelsGrid.columnApi.setColumnVisible("EditLinks", true);
                $scope.violationFilesGrid.columnApi.setColumnVisible("EditLinks", true);
            }

        };        

        $scope.save = function () {
            
            var to_save = angular.copy($scope.row);
            $scope.row.isSaving = true;
            to_save.NotifyRoutes = angular.toJson(to_save.NotifyRoutes);
            to_save.ViolationOffenses = angular.toJson(to_save.ViolationOffenses);
            //to_save.Zoning = angular.toJson(to_save.Zoning);
            // console.dir(to_save);

            var saved_violation = ViolationService.saveViolation(to_save);

            saved_violation.$promise.then(function () { 
                $scope.row.isSaving = false;
                // console.log("permit saved: ");
                // console.dir(saved_permit);

/* -- comment for now...

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
                        $scope.ViolationEvents = PermitService.getViolationEvents($scope.row.Id);
                        $scope.ViolationEvents.$promise.then(function () {
                            $scope.ViolationEventsGrid.api.setRowData($scope.ViolationEvents);
                        });
                    });
                }
*/
                if (!$scope.row.Id) {
                    $scope.violations.push(saved_violation);
                    $scope.ehsGrid.api.setRowData($scope.violations);
                    $scope.row = saved_violation;
                    $scope.row.dataChanged = false;
                    $scope.showAll(); 
                }
                else {
                    $scope.violations.forEach(function (existing_violation) { 
                        if (existing_violation.Id == $scope.row.Id) {
                            angular.extend(existing_violation, saved_violation);
                        }
                    });

                    $scope.selectViolation($scope.row.Id); 
                    
                    $scope.ehsGrid.api.redrawRows();
                    //$scope.permitsGrid.api.setRowData($scope.permits); 

                    $scope.row.dataChanged = false;

                }

                //select the permit we just saved/updated
                $scope.ehsGrid.api.forEachNode(function(node){
                    if(node.data.FileNumber == $scope.row.FileNumber){
                        node.setSelected(true);
                        $scope.ehsGrid.api.ensureIndexVisible(node.childIndex, 'bottom'); //scroll to the selected row
                    }
                })

            },function(data){
                $scope.row.isSaving = false;
                $scope.row.hasError = true;
                $scope.row.errorMessage = "There was a problem saving."
            });
        };

        $scope.resetGrids();

        $scope.refreshParcelHistory = function () {
            $scope.ParcelHistory = [];
            $scope.parcelHistoryGrid.api.setRowData($scope.ParcelHistory);

            //iterate parcels to find any related violations
            $scope.ViolationParcels.forEach(function (parcel) {
                var related_violations = ViolationService.getViolationsByRelatedParcels(parcel.ParcelId);
                related_violations.$promise.then(function () {
                    related_violations.forEach(function (violation) {
                        if (violation.Id !== $scope.row.Id) {
                            violation.MatchingParcelId = parcel.ParcelId;
                            $scope.ParcelHistory.push(violation);
                        }
                    });
                    $scope.parcelHistoryGrid.api.setRowData($scope.ParcelHistory);
                });
            });
        };


        $scope.selectViolation = function (Id) {
            $scope.ViolationContacts = ViolationService.getViolationContacts(Id);
            $scope.ViolationParcels = ViolationService.getViolationParcels(Id);
            /*
            $scope.ViolationEvents = PermitService.getViolationEvents(Id);
            */          
            $scope.ViolationFiles = ViolationService.getViolationFiles(Id);
            $scope.row.NotifyRoutes = ($scope.row.NotifyRoutes) ? angular.fromJson($scope.row.NotifyRoutes) : [];
            $scope.row.ViolationOffenses = ($scope.row.ViolationOffenses) ? angular.fromJson($scope.row.ViolationOffenses) : [];
            
            if (!Array.isArray($scope.row.NotifyRoutes))
                $scope.row.NotifyRoutes = [];

            if (!Array.isArray($scope.row.ViolationOffenses))
                $scope.row.ViolationOffenses = [];

            $scope.ViolationContacts.$promise.then(function () {
                $scope.violationContactsGrid.api.setRowData($scope.ViolationContacts);
                $scope.violationContactsGrid.selectedItem = null;
            });
            
            $scope.ViolationParcels.$promise.then(function () {
                $scope.violationParcelsGrid.api.setRowData($scope.ViolationParcels);
                $scope.violationParcelsGrid.selectedItem = null;
                $scope.refreshParcelHistory();
                //$scope.refreshZones();
            });

            $scope.ViolationFiles.$promise.then(function () {
                $scope.violationFilesGrid.api.setRowData($scope.ViolationFiles);
                $scope.violationFilesGrid.selectedItem = null;
            });

            
            /*
            $scope.ViolationEvents.$promise.then(function () {
                $scope.ViolationEventsGrid.api.setRowData($scope.ViolationEvents);
                $scope.ViolationEventsGrid.selectedItem = null;

                $scope.PermitStatus = [];

                //setup our handy array for the Status tab
                $scope.row.NotifyRoutes.forEach(function (review) { 

                    var route = {
                        ItemType: review,
                        EventType: 'Review',
                    };

                    $scope.ViolationEvents.forEach(function (event) { 
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
                $scope.ViolationEvents.forEach(function (event) { 
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
*/
                //stretch the textareas to the height of the content
                $('textarea').each(function () {
                    this.setAttribute('style', 'min-height: 130px','height:auto; height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
                  }).on('input', function () {
                    this.style.height = 'auto';
                    this.style.minheight = '130px';
                    this.style.height = (this.scrollHeight) + 'px';
                    this.value = this.value.replace(/\n/g, ""); //do not allow hard-returns
                  });

            //});

            
            /*
            if(!Array.isArray($scope.row.Zones)){
                $scope.row.Zones = [];

                if ($scope.row.Zoning) {
                    $scope.row.Zoning = getJsonObjects($scope.row.Zoning);
                    //console.warn(" -- Zoning -- ");
                    //console.dir($scope.row.Zoning);

                } else {
                    $scope.row.Zoning = [];
                }
            }
*/
        };

        
    }];        