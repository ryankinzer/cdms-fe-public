/**
*  Data entry, date edit, import (single activity) all use this controller
*/


var dataset_edit_form = ['$scope', '$q', '$timeout', '$sce', '$routeParams', 'DatasetService', 'SubprojectService', 'ProjectService', 'CommonService', '$uibModal', '$location', '$rootScope',
    'ActivityParser', 'GridService','Upload',
    function ($scope, $q, $timeout, $sce, $routeParams, DatasetService, SubprojectService, ProjectService, CommonService, $modal, $location, $rootScope,
        ActivityParser, GridService, Upload) {

        $scope.system = { loading: true, messages : [] };
        
        initEdit(); // stop backspace while editing from sending us back to the browser's previous page.

        $scope.saveResult = { saving: false, error: null, success: null, saveMessage: "Saving..."};
        $scope.background_save = false;
        
        $scope.fields = { header: [], detail: [] };
        $scope.headerFieldErrors = [];
        $scope.hasDuplicateError = false;

        $scope.userId = $rootScope.Profile.Id;
        $scope.IsFileCell = false;
        
        $scope.PageErrorCount = 0;

        //returns the number of errors on the page, headers + details
        //TODO this is probably expensive for big grids, maybe not...
        $scope.getPageErrorCount = function () { 
            if (!$scope.dataAgGridOptions.hasOwnProperty('api'))
                return 0; //not loaded yet.

            var count = Object.keys($scope.headerFieldErrors).length; //start with number of header errors
            $scope.dataAgGridOptions.api.forEachNode(function (node) { 
                if (node.data.rowHasError) {
                    count++;
                }
            });

            return count;
        };

        $scope.pagemode = $location.path().match(/\/(.*)\//)[1]; //edit, dataentryform, dataview - our 3 options from our route... nothing else is possible.

        // Are we editing or not?
        if ($scope.pagemode == 'dataentryform') {
            $scope.dataset_activities = { Header: {}, Details: [] };

            //are we importing?
            if ($rootScope.hasOwnProperty('imported_rows')) {
                $scope.dataset_activities = { Header: $rootScope.imported_header, Details: $rootScope.imported_rows };
                //console.dir($scope.dataset_activities);
            }

            $scope.dataset = DatasetService.getDataset($routeParams.Id);
            $scope.dataset.$promise.then(function () {
                //$scope.row is the Header fields data row
                $scope.row = Object.assign({ 'Activity': { 'ActivityDate': moment().format(), 'ActivityQAStatus': { 'QAStatusId': $scope.dataset.DefaultActivityQAStatusId } } }, $scope.dataset_activities.Header);
                //console.dir($scope.row);
                $scope.afterDatasetLoadedEvent();
            });
        }
        else {  //either edit or data view - both load a particular activity
            $scope.dataset_activities = DatasetService.getActivityData($routeParams.Id);
            $scope.dataset_activities.$promise.then(function () {
                $scope.dataset = $scope.dataset_activities.Dataset;
                //$scope.row is the Header fields data row
                $scope.row = $scope.dataset_activities.Header;

                $scope.afterDatasetLoadedEvent();
            });
        }
               

        //ag-grid - details
        $scope.dataAgGridOptions = {
            animateRows: true,
            enableSorting: true,
            enableFilter: true, 
            enableColResize: true,
            showToolPanel: false,
            columnDefs: null,
            rowData: [],
            //filterParams: { apply: true }, //enable option: doesn't do the filter unless you click apply
            dataChanged: false, //updated to true if ever any data is changed
            rowSelection: 'multiple',
            onCellFocused: function (params) {
                //console.dir(params.column.colDef.ControlType);
                if (!params.column)
                    return;

                $scope.IsFileCell = (params.column.colDef.ControlType == 'file');
                $scope.onField = (params.column.colDef.cdmsField);

                $scope.$apply();
                //var cell = $scope.dataAgGridOptions.api.getFocusedCell();
            },
            onSelectionChanged: function (params) {
                //console.log("selection changed fired!");
                //console.dir(params);
                
                var rows = params.api.getSelectedRows();
                //if (Array.isArray(rows) && rows[0] != null)
                //{
                    $scope.dataAgGridOptions.selectedItems.length = 0; //truncate, don't replace with [] -- otherwise it is a shadow copy
                    rows.forEach(function (row) {
                        $scope.dataAgGridOptions.selectedItems.push(row);
                    });
                    
                    $scope.$apply(); //bump angular (won't work otherwise!)
                //}
            },
            //onFilterModified: function () {
            //    scope.corrAgGridOptions.api.deselectAll();
            //},
            editedRowIds: [],
            deletedItems: [],
            selectedItems: [],
            //isFullWidthCell: function (rowNode) {
            //    return rowNode.level === 1;
            //},
            onGridReady: function (params) {
                console.log("GRID READY fired. ------------------------------------------>>>");
                //GridService.validateGrid(params);
                //console.log("GRID IS DONE ------------------------------------------>>>");
                //console.dir($scope.row);
                $scope.system.loading = false;
                $scope.$apply();
                GridService.autosizeColumns($scope.dataAgGridOptions);
            },

            defaultColDef: {
                editable: ($scope.pagemode!=='dataview'),
            },

            getRowHeight: function (params) {
                //console.log("get row height -------------------");
                //set the rowheight of this row to be the largest of the file count in this row...
                if (!params.node.file_height) {
                    var file_fields = getMatchingByField($scope.dataAgGridOptions.columnDefs, 'file','ControlType');
                    max_file_field = 1;
                    file_fields.forEach(function (file_field) { 
                        var curr_file_count = getFilesArrayAsList(params.node.data[file_field.DbColumnName]).length;
                        if (curr_file_count > max_file_field)
                            max_file_field = curr_file_count;
                    });
                    params.node.file_height = max_file_field;
                    //console.log(" -- MAX number of files in cell file field " + max_file_field);
                }
                var file_height = 25 * (params.node.file_height); 
                return (file_height > 25) ? file_height : 25;
            },

            rowClassRules: {
                'row-validation-error': function(params) { return params.node.data.rowHasError; }
            },
            onCellEditingStarted: function (event) {
                //console.log('cellEditingStarted');
            },
            onCellEditingStopped: function (event) {
                //save the row we just edited
                //console.dir(event);

                if (GridService.validateCell(event)) {
                    GridService.fireRule("OnChange", event); //only fires when valid change is made
                }

                $scope.PageErrorCount = $scope.getPageErrorCount();

                GridService.refreshRow(event);

                $scope.dataAgGridOptions.dataChanged = true;

                if (event.data.Id && (!$scope.dataAgGridOptions.editedRowIds.containsInt(event.data.Id))){ 
                    $scope.dataAgGridOptions.editedRowIds.push(event.data.Id);
                };
                $scope.$apply();

                //special case for water temp: fire dupecheck if readingdatetime changed
                if($scope.dataset.Datastore.TablePrefix == "WaterTemp" && event.colDef.DbColumnName == "ReadingDateTime")
                    $scope.checkForDuplicates();
            

            },
        };


        $scope.bubbleErrors = function () {
            GridService.bubbleErrors($scope.dataAgGridOptions);
            console.log("bubbling!");
        };

        $scope.onHeaderEditingStopped = function (field) { //fired onChange for header fields (common/templates/form-fields)
            //build event to send for validation
            console.log("onHeaderEditingStopped: " + field.DbColumnName);
            var event = {
                colDef: field,
                node: { data: $scope.row },
                value: $scope.row[field.DbColumnName],
                type: 'onHeaderEditingStopped'
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
            $scope.PageErrorCount = $scope.getPageErrorCount();

            $scope.row.dataChanged = true;

            //if one of the duplicatecheck fields change then check for duplicates.
            if($scope.dataset.Config.DuplicateCheckFields && $scope.dataset.Config.DuplicateCheckFields.contains(field.DbColumnName))
                $scope.checkForDuplicates();

            console.dir($scope.row);
        };

        //add a row
        $scope.addNewRow = function () {
            var new_row = GridService.getNewRow($scope.dataAgColumnDefs.DetailFields);
            new_row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;

            //set defaults for detail fields
            $scope.dataAgColumnDefs.DetailFields.forEach(function (detail) { 
                if (detail.DefaultValue) { 
                    new_row[detail.DbColumnName] = detail.DefaultValue;
                    console.log("Setting default value for " + detail.DbColumnName + " to " + detail.DefaultValue);
                }
            });

            var result = $scope.dataAgGridOptions.api.updateRowData({add: [new_row]});
            $scope.dataAgGridOptions.dataChanged = true;
        };

        //remove a row
        $scope.removeRow = function () { 
            var rows_to_delete = $scope.dataAgGridOptions.api.getSelectedRows();

            //add selected rows to deleted rows (might already be some in there, just add ours, too)
            rows_to_delete.forEach(function (item) { 
                $scope.dataAgGridOptions.deletedItems.push(item);
            });
            
            //note the currently deleted row(s) in case they want to undo
            $scope.deletedRows = rows_to_delete;

            //do the remove from the grid.
            $scope.dataAgGridOptions.api.updateRowData({ remove: rows_to_delete });

            $scope.dataAgGridOptions.dataChanged = true;
        };

        //undo remove row
        $scope.undoRemoveRow = function () { 
            $scope.dataAgGridOptions.api.updateRowData({ add: $scope.deletedRows });

            //remove these deleted rows from deleted items since we're undeleting
            var new_deleted = [];
            $scope.dataAgGridOptions.deletedItems.forEach(function (deleted) {
                var is_being_undeleted = false
                $scope.deletedRows.forEach(function (undelete) {
                    if (deleted.hasOwnProperty('Id') && undelete.hasOwnProperty('Id') && deleted.Id == undelete.Id)
                        is_being_undeleted = true;                   
                });
                if(!is_being_undeleted) 
                    new_deleted.push(deleted)
            });
            $scope.dataAgGridOptions.deletedItems = new_deleted;

            //clear our deleted rows buffer
            $scope.deletedRows = [];
            
        };


        //call to fire up the grid after the $scope.dataset is ready
        $scope.activateGrid = function () {
            
            //setup grid and coldefs and then go!
            $timeout(function () {

                $scope.dataAgColumnDefs = GridService.getAgColumnDefs($scope.dataset);
                $scope.dataAgGridOptions.columnDefs = $scope.dataAgColumnDefs.DetailFields;
                $scope.fields = { header: $scope.dataAgColumnDefs.HeaderFields, detail: $scope.dataAgColumnDefs.DetailFields };

                //spin through and set any sytem field detail possible values -----------------       //////TODO move the config.js fields into a systems dataset, then can use the Datasource technique to load these.
                angular.forEach($scope.fields.detail, function (fieldDef) {
                    if (fieldDef.field == "QAStatusId") { //RowQAStatusId
                        fieldDef.setPossibleValues(makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name'));
                    }
                });

                //multiselect header fields - convert from json
                var HeaderMultiselectFields = getAllMatchingFromArray($scope.dataAgColumnDefs.HeaderFields, 'multiselect', 'ControlType');

                HeaderMultiselectFields.forEach(function (multiselect_field) { 
                    if ($scope.row[multiselect_field.DbColumnName]) {
                        $scope.row[multiselect_field.DbColumnName] = getParsedMetadataValues($scope.row[multiselect_field.DbColumnName]);
                        if (!Array.isArray($scope.row[multiselect_field.DbColumnName])) {  //backwards compatible - some multiselects just have the value saved... turn it into an array
                            $scope.row[multiselect_field.DbColumnName] = [$scope.row[multiselect_field.DbColumnName]];
                        }
                    }
                    console.dir($scope.row[multiselect_field.DbColumnName]);
                });

                //if we are on data entry page (and not importing), set the header values to any defaults.
                if ($scope.pagemode == 'dataentryform' && !$rootScope.hasOwnProperty('imported_rows')) {
                    console.log("applying defaults to header fields");
                    $scope.dataAgColumnDefs.HeaderFields.forEach(function (header) {
                        //console.dir(header);
                        if (header.DefaultValue) {
                            $scope.row[header.DbColumnName] = header.DefaultValue;
                            console.log("Setting default value for " + header.DbColumnName + " to " + $scope.row[header.DbColumnName]);
                        }
                    });
                }

                var ag_grid_div = document.querySelector('#data-edit-grid');    //get the container id...
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.dataAgGridOptions); //bind the grid to it.
                $scope.dataAgGridOptions.api.showLoadingOverlay(); //show loading...

                //set the detail values into the grid
                $scope.dataAgGridOptions.api.setRowData($scope.dataset_activities.Details);
                
                
                //convert timezone to object if it exists
                if($scope.row.Activity)
                    $scope.row.Activity.Timezone = angular.fromJson($scope.row.Activity.Timezone);
                
                console.log("GRID Validate. ------------------------------------------>>>");
                GridService.validateGrid($scope.dataAgGridOptions);
                $scope.dataAgGridOptions.api.redrawRows();
                console.log("GRID Validate IS DONE ------------------------------------------>>>");

                $scope.PageErrorCount = $scope.getPageErrorCount();

                if ($rootScope.imported_rows)
                    $scope.bubbleErrors();

                $scope.dataAgGridOptions.api._headerrow = $scope.row;

            }, 0);

            

        };

        //called after the dataset is loaded
        $scope.afterDatasetLoadedEvent = function () { 
            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);

            DatasetService.configureDataset($scope.dataset); //bump to load config since we are pulling it directly out of the activities

            $scope.activateGrid();

            //load the files related to this dataset
            $scope.dataset.Files = DatasetService.getDatasetFiles($scope.dataset.Id);

            //once the dataset files load, setup our file handler
            $scope.dataset.Files.$promise.then(function () {
                //mixin the properties and functions to enable the modal file chooser for this controller...
                //console.log("---------------- setting up dataset file chooser ----------------");
                modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.dataset.Files);
            });

            //if the activity qa status is already set in the header (editing), copy it in to this row's activityqastatus 
            if ($scope.dataset_activities.Header.Activity && $scope.dataset_activities.Header.Activity.ActivityQAStatus) {
                $scope.row.ActivityQAStatus = {
                    QAStatusId: "" + $scope.dataset_activities.Header.Activity.ActivityQAStatus.QAStatusId,
                    Comments: $scope.dataset_activities.Header.Activity.ActivityQAStatus.Comments,
                }
            }
            //otherwise (new record), set it to the default. 
            else {
                //console.warn("The ActivityQAStatus for this activity is not set, setting to default.");
                $scope.row.ActivityQAStatus = {
                    QAStatusId: "" + $scope.dataset.DefaultRowQAStatusId,
                    Comments: ""
                }
            }

            

            //once the project is loaded...
            $scope.project.$promise.then(function () {

                //check authorization -- need to have project loaded before we can check project-level auth
                if (!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project)) {
                    $location.path("/unauthorized");
                }

                try {
                    $scope.project.Config = ($scope.project.Config) ? angular.fromJson($scope.project.Config) : {};
                } catch (e) { 
                    console.error("config could not be parsed for project" + $scope.project.Config);
                    console.dir(e);
                }

                //do we need to pull in habitat site locations?
                if ($scope.project.Config.ShowHabitatSitesForDatasets && $scope.project.Config.ShowHabitatSitesForDatasets.contains($scope.dataset.Name)) { 
                    $scope.project.Locations.forEach(function (loc) {
                        if (loc.LocationTypeId == LOCATION_TYPE_Hab) {
                            //switch the type to say "it is one of us" and add the label...
                            loc.LocationTypeId = $scope.dataset.Datastore.LocationTypeId;
                            loc.Label = loc.Label + " (Hab Site)";
                        }
                    });
                }
            });
        };


       

        $scope.setSelectedBulkQAStatus = function (rowQAId) {
            angular.forEach($scope.dataAgGridOptions.selectedItems, function (item, key) {
                //console.log("bulk changing: ");
                //console.dir(item);
                item.QAStatusId = rowQAId;
                GridService.refreshGrid($scope.dataAgGridOptions);
                //mark the row as updated so it will get saved.
                if (item.Id && $scope.dataAgGridOptions.editedRowIds.indexOf(item.Id) == -1) {
                    $scope.dataAgGridOptions.editedRowIds.push(item.Id);
                }
            });

            $scope.dataAgGridOptions.dataChanged = true;

            $scope.dataAgGridOptions.api.deselectAll();
        };

        $scope.editCellFiles = function () { 
            console.log("edit cell files:");
            var the_cell = $scope.dataAgGridOptions.api.getFocusedCell();
            var the_row = $scope.dataAgGridOptions.api.getDisplayedRowAtIndex(the_cell.rowIndex)
            //console.dir(the_cell);
            //console.dir(the_row);
            $scope.openFileModal(the_row.data, the_cell.column.colDef.DbColumnName, $scope.afterEditCellFiles);
        }

        $scope.afterEditCellFiles = function () { 
            console.log("after edit cell files!");
            var the_cell = $scope.dataAgGridOptions.api.getFocusedCell();
            var the_row = $scope.dataAgGridOptions.api.getDisplayedRowAtIndex(the_cell.rowIndex)
        //    console.dir(the_cell);
            console.dir(the_row);
            delete the_row.file_height;

            $scope.dataAgGridOptions.api.redrawRows();
            $scope.dataAgGridOptions.api.resetRowHeights(); //redraw so that the files in the cell are displayed properly.

            //mark the row as changed and edited.
            $scope.row.dataChanged = true;

            if (the_row.data.Id && $scope.dataAgGridOptions.editedRowIds.indexOf(the_row.data.Id) == -1) {
                $scope.dataAgGridOptions.editedRowIds.push(the_row.data.Id);
                console.log("edited row: " + the_row.data.Id);
            }

        };

        $scope.afterFileModal = function () { 
            $scope.row.dataChanged = true;
        }

        $scope.openBulkQAChange = function () {

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-rowqaupdate.html',
                controller: 'ModalBulkRowQAChangeCtrl',
                scope: $scope, //very important to pass the scope along...

            });

        };     

        $scope.openEdit = function () {
            $location.path("/edit/" + $scope.dataset_activities.Header.Activity.Id);
        }


        $scope.createInstrument = function () {
            //$scope.viewInstrument = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
                controller: 'ModalCreateInstrumentCtrl',
                scope: $scope, //very important to pass the scope along...
            }).result.then(function (saved_instrument) { 
                //add saved_instrument to our list.
                saved_instrument.AccuracyChecks = [];
                $scope.project.Instruments.push(saved_instrument);
                $scope.row.Activity.InstrumentId = saved_instrument.Id;
                $scope.selectInstrument();
                $scope.row.dataChanged = true; //we have changed!
                //aha! this is a trick to get the instruments select to rebuild after we change it programatically
                $(function () { $("#instruments-select").select2(); });
    
            });
        };
       
        $scope.openAccuracyCheckModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-new-accuracycheck.html',
                controller: 'ModalQuickAddAccuracyCheckCtrl',
                scope: $scope, //very important to pass the scope along...
            }).result.then(function (saved_AC) { 
                //add saved_AC to our list.
                $scope.project.Instruments.forEach(function (inst) { 
                    if (inst.Id == $scope.row.Activity.InstrumentId) {
                        console.log("found that instrument!"); console.dir(inst);
                        inst.AccuracyChecks.push(saved_AC);
                        $scope.row.Activity.Instrument = inst;
                    }
                });
                $scope.selectInstrument();
                $scope.row.dataChanged = true; //we have changed a header!
    
            });
        };

        $scope.getDataGrade = function (check) { return getDataGrade(check) }; //alias

        //when user selects an instrument, the directive model binding sets the row.Activity.InstrumentId. 
        // we need to set the row.Activity.Instrument to the matching one from project.Instruments
        // and then select the last AccuracyCheck and set it in row.Activity.AccuracyCheckId
        $scope.selectInstrument = function (field) {
            console.log("selectInstrument. InstrumentId is " + $scope.row.Activity.InstrumentId);
            if (isNaN($scope.row.Activity.InstrumentId)) {
                console.log("is nan");
                delete $scope.row.Activity.AccuracyCheck; delete $scope.row.Activity.AccuracyCheckId; delete $scope.row.Activity.PostAccuracyCheck; delete $scope.row.Activity.PostAccuracyCheck.Id;
                return;
            }
             

            $scope.project.Instruments.forEach(function (inst) { 
                if (inst.Id == $scope.row.Activity.InstrumentId) {
                    console.log("found that instrument!"); console.dir(inst);
                    $scope.row.Activity.Instrument = inst;
                }
            });

            //get latest accuracy check
            $scope.row.Activity.AccuracyCheck = $scope.row.Activity.Instrument.AccuracyChecks[$scope.row.Activity.Instrument.AccuracyChecks.length - 1];
            $scope.row.DataGradeText = getDataGrade($scope.row.Activity.AccuracyCheck);

            if ($scope.row.Activity.AccuracyCheck)
                $scope.row.Activity.AccuracyCheckId = $scope.row.Activity.AccuracyCheck.Id;

            if(field)
                $scope.onHeaderEditingStopped(field);

        };

        $scope.cancel = function () {
            if ($scope.dataAgGridOptions.dataChanged) {
                if (!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
                    return;
            }
            //console.dir($scope.dataset);
            //console.log("#!/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);

            $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        };


        //click "save" on dataset edit form
        $scope.saveData = function () {

            if (!$scope.dataAgGridOptions.dataChanged && !$scope.row.dataChanged) {
                if (confirm("Nothing to save. Return to Activities?")) {
                    $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
                }
                else {
                    return;
                }
            }

            
            var HeaderLocation = getAllMatchingFromArray($scope.dataAgColumnDefs.HeaderFields, 'LocationId', 'DbColumnName');
            if (Array.isArray(HeaderLocation) && HeaderLocation.length == 1 && !$scope.row.Activity.hasOwnProperty("LocationId")) { 
                alert("Location is required. Please choose a location and try again.");
            console.dir(HeaderLocation);
            console.dir($scope.row);
                return;
            }



            console.log(" -- save -- ");

            /* -- we dynamically duplicate check, so don't check AGAIN --
            var dupe_check = $scope.checkForDuplicates(); 
            if (dupe_check) {
                dupe_check.$promise.then(function () {
                    if (!$scope.hasDuplicateError)
                        $scope.modalFile_saveParentItem(); //saverow - this is just for temporary TODO......
                    else
                        console.log("Aborting saving because we have a duplicate error");
                });
            } else {
                $scope.modalFile_saveParentItem(); //saverow - this is just for temporary TODO......
            }
            */

            //console.dir($scope.row);


            //handle saving the files.
            var data = {
                ProjectId: $scope.project.Id,
                DatasetId: $scope.dataset.Id,
            };

            var target = '/api/v1/file/uploaddatasetfile';

			console.log("$scope.row is next...");
//			console.dir($scope.row);
            var saveRow = $scope.row;

            $scope.handleFilesToUploadRemove(saveRow, data, target, Upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
  
        };

        //** special buttons for creel data entry **
        $scope.addNewInterview = function () {
            $scope.addNewRow();
        };

        //this just duplicates the current row
        $scope.addAnotherFish = function () {
            var the_cell = $scope.dataAgGridOptions.api.getFocusedCell();

            if (!the_cell) {
                alert("Please select an Interview row that you want to copy");
                return;
            }

            var the_row = $scope.dataAgGridOptions.api.getDisplayedRowAtIndex(the_cell.rowIndex);
            var result = $scope.dataAgGridOptions.api.updateRowData({ add: [the_row.data] });
            $scope.dataAgGridOptions.dataChanged = true;
            //console.dir(the_row);
        };

        //open the add fisherman modal
        $scope.addFisherman = function () {
            $scope.viewFisherman = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
                controller: 'ModalCreateFishermanCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };
		
        //callback after adding a fisherman -- push it into the dropdown list.
        $scope.postSaveFishermanUpdateGrid = function (new_fisherman) {
            var col = $scope.dataAgGridOptions.columnApi.getColumn('FishermanId');
            col.colDef.PossibleValues[new_fisherman.Id] = new_fisherman.FullName;
            col.colDef.setPossibleValues(col.colDef.PossibleValues);
        };

        //save this record and reset a few fields.
        $scope.addSection = function () { 

            $scope.background_save = true;    
            $scope.saveData();

            $scope.row.locationId = null; //60; //59; // Blank
            $scope.row.TimeStart = null;
            $scope.row.TimeEnd = null;
            $scope.row.NumberAnglersObserved = 0;
            $scope.row.NumberAnglersInterviewed = 0;
            $scope.row.SurveyComments = null;
            $scope.row.FieldSheetFile = null;

            // Dump the contents of the datasheet and add the new row.
            $scope.dataAgGridOptions.api.setRowData([]);
            //$scope.addNewRow();

            // Set the file buckets for Creel to undefined or empty; otherwise, the last saved file will still be
            // dangling and interphere with the save operation (trying to resave the same file - a duplicate).
            if($scope.originalExistingFiles && $scope.row.originalExistingFiles)
                $scope.originalExistingFiles.FieldSheetFile = $scope.row.originalExistingFiles.FieldSheetFile = undefined;

            $scope.row.fieldFilesToUpload = [];

            // If this is not set to undefined, it will incorrectly register an empty FieldSheetFile as 1,
            // and cause problems during the save process.
            $scope.filesToUpload = undefined;

            // This pops the Save Success modal after Add Section.
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-save-success.html',
                controller: 'ModalSaveSuccess',
                scope: $scope, //very important to pass the scope along...
            });
            
        };

        //** end special creel buttons **

        //remove file from dataset.
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            return DatasetService.deleteDatasetFile($scope.project.Id, $scope.dataset.Id, file_to_remove);
        };


        //check for duplicates        
        $scope.checkForDuplicates = function () {
            var promise = GridService.checkForDuplicates($scope.dataset, $scope.dataAgGridOptions, $scope.row, $scope.saveResult);

            $scope.hasDuplicateError = $scope.saveResult.hasError;
            return promise;
        };

        //finish saving after file saving completes...
        $scope.modalFile_saveParentItem = function (saveRow) {
            
console.log("SaveParentItem!");

            //clean up some things from the copy of activity that we don't need to send to the backend.
            var new_activity = angular.copy($scope.row.Activity);
            delete new_activity.AccuracyCheck;
            delete new_activity.ActivityType;
            delete new_activity.Instrument;
            delete new_activity.Location;
            delete new_activity.Source;
            delete new_activity.User;
            delete new_activity.ActivityQAStatus;
            new_activity.Timezone = angular.toJson(new_activity.Timezone); //why don't we just save the id?

            //add the ActivityQAStatus back in with values from the activity
            new_activity.ActivityQAStatus = {
                'Comments': $scope.row.Activity.ActivityQAStatus.Comments,
                'QAStatusId': $scope.row.Activity.ActivityQAStatus.QAStatusId,
            };

            //clean up some things from the row (header fields)
            var new_row = angular.copy($scope.row);
            delete new_row.Activity;
            delete new_row.ActivityQAStatus;
            delete new_row.ByUser;
            delete dataChanged;

            //compose our payload 
            var payload = {
                'Activity': new_activity,
                'DatasetId': $scope.dataset.Id,
                'ProjectId': $scope.project.Id,
                'UserId': $rootScope.Profile.Id,
                'deletedRowIds': [],
                'editedRowIds': [],
                'header': new_row,
                'details': [],
            };

            // 1) all current detail records from the grid
            $scope.dataAgGridOptions.api.forEachNode(function (node) { 
                var data = angular.copy(node.data);
                payload.details.push(data); 
            });

			// If the user removed a row, the grid no longer contains that row.
			// However, when we remove a row, it is not deleted from the database; it is marked as deleted in the backend (ROWSTATUS_DELETED).
			// Therefore, we need to add the removed row back into the list that we send to the database, but we DO NOT want to add it back 
			// into the grid. 
			// 2) add the deleted record to the detail payload, mark it as deleted
			$scope.dataAgGridOptions.deletedItems.forEach(function(deletedItem){
                if (deletedItem.Id) { //only push ones that were existing already (new rows that are deleted are ignored)
                    var data = angular.copy(deletedItem);
                    data.RowStatusId = ROWSTATUS_DELETED; 
                    payload.details.push(data);
                    payload.deletedRowIds.push(data.Id);
                }
			});

            // 3) note which are edited
            payload.editedRowIds = $scope.dataAgGridOptions.editedRowIds; 

            // 4) convert multiselects from array to json
            //get all multiselect fields we need to convert
            var DetailMultiselectFields = getAllMatchingFromArray($scope.dataAgColumnDefs.DetailFields, 'multiselect', 'ControlType');
            var HeaderMultiselectFields = getAllMatchingFromArray($scope.dataAgColumnDefs.HeaderFields, 'multiselect', 'ControlType');

            payload.details.forEach(function (data) { 
                DetailMultiselectFields.forEach(function (multiselect_field) { 
                    if (Array.isArray(data[multiselect_field.DbColumnName]) && data[multiselect_field.DbColumnName].length > 0) {
                        data[multiselect_field.DbColumnName] = angular.toJson(data[multiselect_field.DbColumnName]);
                        //console.log(" -- multiselect " + multiselect_field.DbColumnName + " == " + data[multiselect_field.DbColumnName]);
                    }
                });
            });

            HeaderMultiselectFields.forEach(function (multiselect_field) { 
                if (Array.isArray(payload.header[multiselect_field.DbColumnName]) && payload.header[multiselect_field.DbColumnName].length > 0) {
                    payload.header[multiselect_field.DbColumnName] = angular.toJson(payload.header[multiselect_field.DbColumnName]);
                }
            });
            
            
            // 5) convert time fields in header to be based on activity date
            var HeaderTimeFields = getAllMatchingFromArray($scope.dataAgColumnDefs.HeaderFields, 'time', 'ControlType');
            HeaderTimeFields.forEach(function (time_field) {
                var activity_date = moment(payload['Activity']['ActivityDate']);
                //console.log(" our activity date: " + activity_date.format('L'));
                //console.dir(time_field);
                var the_date = moment(payload.header[time_field.DbColumnName], ["HH:mm"], true);

                var the_combined_date = the_date.set(
                    {
                        year: activity_date.year(),
                        month: activity_date.month(),
                        date: activity_date.date()
                    });

                payload.header[time_field.DbColumnName] = the_combined_date.format('YYYY-MM-DDTHH:mm');
                //console.log(" >> final date = " + payload.header[time_field.DbColumnName]);
            });

            console.dir(payload);
            //return;

            var save_promise = null;

            if ($scope.pagemode == 'edit')
                save_promise = DatasetService.updateActivities(payload);
            else if ($scope.pagemode == 'dataentryform')
                save_promise = DatasetService.saveActivities(payload);
            else
                console.log("this shouldn't be possible - pagemode is unexpected: "+ $scope.pagemode);

            save_promise.$promise.then(
                function () {
                    if(!$scope.background_save)
                        $scope.saveResult.success = "Save successful.";

                    $scope.background_save = false; //reset

                    $scope.saveResult.error = false;
                    console.log("Success!");
                    $scope.saveResult.saving = false;

                },
                function (data) {
                    $scope.saveResult.success = false;
                    console.log("Failure!");
                    console.dir(data);
                    $scope.saveResult.saving = false;

                    if (typeof data.data !== 'undefined') {
                        if (typeof data.data.ExceptionMessage !== 'undefined') {
                            theErrorText = data.data.ExceptionMessage;
                            console.log("Save error:  theErrorText = " + theErrorText);
                        }
                        else {
                            theErrorText = data.data;
                            var titleStartLoc = theErrorText.indexOf("<title>") + 7;
                            console.log("titleStartLoc = " + titleStartLoc);
                            var titleEndLoc = theErrorText.indexOf("</title>");
                            console.log("titleEndLoc = " + titleEndLoc);
                            theErrorText = theErrorText.substr(titleStartLoc, titleEndLoc - titleStartLoc);
                        }
                    }
                    $scope.saveResult.error = "There was a problem saving your data (" + theErrorText + ").  Please try again or contact support.";
                }
            );
        };
		
        $scope.doneButton = function () {
            $scope.activities = undefined;
            $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        };
    }
];




            

