var list_violations = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService','CommonService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService, CommonService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.currentPage = "All";
        $scope.row = null;

        /*
        $scope.PermitParcels = [];
        $scope.PermitEvents = [];
        $scope.PermitFiles = [];
        $scope.ParcelHistory = [];
        $scope.PermitFileTypes = [];
        */

        $scope.dataset = DatasetService.getDataset(EHS_DATASETID);
        //$scope.eventsdataset = DatasetService.getDataset(PERMITEVENTS_DATASETID);
        //$scope.PermitFileTypes = CommonService.getMetadataProperty(METADATA_PROPERTY_PERMIT_FILETYPES);
        //$scope.contactsdataset = DatasetService.getDataset(PERMITCONTACTS_DATASETID);

        /*
        $scope.contactsdataset.$promise.then(function () {
            $scope.ContactsDatasetColumnDefs = GridService.getAgColumnDefs($scope.contactsdataset);
        });

        $scope.PermitFileTypes.$promise.then(function () {
            $scope.PermitFileTypes = angular.fromJson($scope.PermitFileTypes.PossibleValues);
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

            $scope.violations = PermitService.getAllViolations();

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

            /*
            //now do some caching...
            $scope.PermitPersons = PermitService.getAllPersons();
            $scope.CadasterParcels = PermitService.getAllParcels();

            $scope.PermitPersons.$promise.then(function () {
                $scope.PermitPersons.forEach(function (person) {
                    person.Label = $scope.getPersonLabel(person);
                });

                $scope.PermitPersons = $scope.PermitPersons.sort(orderByAlpha);
            });
            */
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

        $scope.createNew = function () {

            if ($scope.row && $scope.row.dataChanged && !confirm("It looks like you've made edits on this page. Are you sure you want to clear everything and start a new record?")) {
                return;
            }

            //$scope.PermitTypes = PermitService.getPermitTypes(); //load the permit types fresh -- these have our permitnumber to increment...

            $scope.row = $scope.ehsGrid.selectedItem = GridService.getNewRow($scope.ehsGrid.columnDefs);

            $scope.generateFileNumber();

            /*
            $scope.PermitContacts = [];
            $scope.PermitParcels = [];
            $scope.PermitEvents = [];
            $scope.PermitFiles = [];
            $scope.ParcelHistory = [];
*/
  //          $scope.resetGrids();

            $('#tab-basicinfo').tab('show'); //default to the "Permit Details" tab when select a different permit

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

        $scope.save = function () {
            
            var to_save = angular.copy($scope.row);
            $scope.row.isSaving = true;
            to_save.NotifyRoutes = angular.toJson(to_save.NotifyRoutes);
            to_save.ViolationOffenses = angular.toJson(to_save.ViolationOffenses);
            //to_save.Zoning = angular.toJson(to_save.Zoning);
            // console.dir(to_save);

            var saved_violation = PermitService.saveViolation(to_save);

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
                        $scope.PermitEvents = PermitService.getPermitEvents($scope.row.Id);
                        $scope.PermitEvents.$promise.then(function () {
                            $scope.permitEventsGrid.api.setRowData($scope.PermitEvents);
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


        $scope.selectViolation = function (Id) {
/*
            $scope.PermitContacts = PermitService.getPermitContacts(Id);
            $scope.PermitParcels = PermitService.getPermitParcels(Id);
            $scope.PermitEvents = PermitService.getPermitEvents(Id);
            $scope.PermitFiles = PermitService.getPermitFiles(Id);
  */          
            $scope.row.NotifyRoutes = ($scope.row.NotifyRoutes) ? angular.fromJson($scope.row.NotifyRoutes) : [];
            $scope.row.ViolationOffenses = ($scope.row.ViolationOffenses) ? angular.fromJson($scope.row.ViolationOffenses) : [];
            
            if (!Array.isArray($scope.row.NotifyRoutes))
                $scope.row.NotifyRoutes = [];

            if (!Array.isArray($scope.row.ViolationOffenses))
                $scope.row.ViolationOffenses = [];

/*
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
                $scope.row.NotifyRoutes.forEach(function (review) { 

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
            $scope.PermitFiles.$promise.then(function () {
                $scope.permitFilesGrid.api.setRowData($scope.PermitFiles);
                $scope.permitFilesGrid.selectedItem = null;
            });

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