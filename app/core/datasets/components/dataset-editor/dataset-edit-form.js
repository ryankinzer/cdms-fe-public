/**
*  Data entry, date edit, import all use this controller
*/


var dataset_edit_form = ['$scope', '$q', '$timeout', '$sce', '$routeParams', 'DatasetService', 'SubprojectService', 'ProjectService', 'CommonService', '$uibModal', '$location', '$rootScope',
    'ActivityParser', 'GridService',
    function ($scope, $q, $timeout, $sce, $routeParams, DatasetService, SubprojectService, ProjectService, CommonService, $modal, $location, $rootScope,
        ActivityParser, GridService) {
        
        initEdit(); // stop backspace while editing from sending us back to the browser's previous page.

        $scope.saveResult = { saving: false, error: null, success: null, saveMessage: "Saving..."};
        
        $scope.fields = { header: [], detail: [] };
        $scope.headerFieldErrors = [];
        $scope.hasDuplicateError = false;

        $scope.userId = $rootScope.Profile.Id;
        
        $scope.PageErrorCount = 0;

        //returns the number of errors on the page, headers + details
        //TODO this is probably expensive for big grids, maybe not...
        $scope.getPageErrorCount = function () { 
            if (!$scope.dataAgGridOptions.hasOwnProperty('api'))
                return 0; //not loaded yet.

            var count = Object.keys($scope.headerFieldErrors).length; //start with number of header errors
            $scope.dataAgGridOptions.api.forEachNode(function (node) { 
                if (node.data.rowHasError)
                    count ++;
            });

            return count;
        };

        //fields to support uploads // *** but is this the old or the new?
/*
        $scope.filesToUpload = {}; 
        $scope.file_row = {};
        $scope.file_field = {};
*/
        console.dir($location.path());

        $scope.pagemode = $location.path().match(/\/(.*)\//)[1]; //edit, dataentryform, dataview - our 3 options from our route... nothing else is possible.

        // Are we editing or not?
        if ($scope.pagemode.indexOf('dataentryform') !== -1) {
            $scope.dataset_activities = { Header: [], Details: [] };

            //are we importing?
            if($rootScope.hasOwnProperty('imported_rows'))
                $scope.dataset_activities = { Header: [], Details: $rootScope.imported_rows };

            $scope.dataset = DatasetService.getDataset($routeParams.Id);
            $scope.dataset.$promise.then(function () {
                //$scope.row is the Header fields data row
                $scope.row = { 'Activity': { 'ActivityDate': moment().format(), 'ActivityQAStatus': {'QAStatusId': $scope.dataset.DefaultActivityQAStatusId} } }; //empty row
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
            rowData: null,
            //filterParams: { apply: true }, //enable option: doesn't do the filter unless you click apply
            dataChanged: false, //updated to true if ever any data is changed
            rowSelection: 'multiple',
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
                console.log("GRID IS READY. ------------------------------------------>>>");
                GridService.validateGrid(params);
                console.dir($scope.row);
            },

            defaultColDef: {
                editable: ($scope.pagemode!=='dataview'),
            },

            //getRowHeight: function (params) {
                /*
                var rowIsDetailRow = params.node.level === 1;
                // return dynamic height when detail row, otherwise return 25
                if (rowIsDetailRow) {
                    return 300;
                } else {
                    var comment_length = (params.data.Comments === null) ? 1 : params.data.Comments.length;
                    return 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
                }
                //return rowIsDetailRow ? 200 : 25;
                */
            //},
            /*
            onRowDoubleClicked: function (row) {

                scope.corrAgGridOptions.api.collapseAll();
                row.node.setSelected(true);
                row.node.setExpanded(true);
            },
            onRowClicked: function (row) {
                row.node.setSelected(true);
            },
            */
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
            if($scope.dataset.Config.DuplicateCheckFields.contains(field.DbColumnName))
                $scope.checkForDuplicates();

            //console.dir($scope.row);
        };

        //add a row
        $scope.addNewRow = function () {
            var new_row = GridService.getNewRow($scope.dataAgColumnDefs.DetailFields);
            new_row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
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


                var ag_grid_div = document.querySelector('#data-edit-grid');    //get the container id...
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.dataAgGridOptions); //bind the grid to it.
                $scope.dataAgGridOptions.api.showLoadingOverlay(); //show loading...

                //set the detail values into the grid
                $scope.dataAgGridOptions.api.setRowData($scope.dataset_activities.Details);
                
                
                //convert timezone to object if it exists
                if($scope.row.Activity)
                    $scope.row.Activity.Timezone = angular.fromJson($scope.row.Activity.Timezone);
                
                GridService.autosizeColumns($scope.dataAgGridOptions);

            }, 0);

            

        };

        //called after the dataset is loaded
        $scope.afterDatasetLoadedEvent = function () { 
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


            //TODO -(((

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

            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);

            //once the project is loaded...
            $scope.project.$promise.then(function () {

                //check authorization -- need to have project loaded before we can check project-level auth
                if (!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project)) {
                    $location.path("/unauthorized");
                }


                //TODO - needed?
                //$rootScope.projectId = $scope.projectId = $scope.project.Id;

                //I think these come back already with getProject? TODO
                //$scope.project.Files = null;
                //$scope.project.Files = ProjectService.getProjectFiles($scope.project.Id);

                
    /*
                if ($scope.project.Locations) {
                    for (var i = 0; i < $scope.project.Locations.length; i++) {
                        //console.log("projectLocations Index = " + $scope.project.Locations[i].Label);
                        //console.log($scope.project.Locations[i].LocationTypeId + "  " + $scope.datasetLocationType); //$scope.project.Locations[i]);
                        if (($scope.DatastoreTablePrefix === "Metrics") ||
                            ($scope.DatastoreTablePrefix === "Benthic") ||
                            ($scope.DatastoreTablePrefix === "Drift")
                        ) {
                            if (($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType) || ($scope.project.Locations[i].LocationTypeId === LOCATION_TYPE_Hab)) {
                                //console.log("Found Habitat-related location");
                                $scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
                            }
                        }
                        else {
                            if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType) {
                                //console.log("Found non-Habitat-related location");
                                $scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
                            }

                            if ($scope.DatastoreTablePrefix === "FishScales") {
                                //console.log("Setting $scope.primaryDatasetLocation...");
                                $scope.primaryDatasetLocation = $scope.project.Locations[i].Id;
                            }
                        }

                   
                    }
                    //console.log("datasetLocations is next...");
                    //console.dir($scope.datasetLocations);
                    $scope.finishLocationProcessing();
                }
    */



            });
            
        };


       

        $scope.setSelectedBulkQAStatus = function (rowQAId) {
            angular.forEach($scope.dataAgGridOptions.selectedItems, function (item, key) {
                console.log("bulk changing: ");
                console.dir(item);
                item.QAStatusId = rowQAId;
                GridService.refreshGrid($scope.dataAgGridOptions);
                //mark the row as updated so it will get saved.
                if (item.Id && $scope.dataAgGridOptions.editedItems.indexOf(item.Id) == -1) {
                    $scope.dataAgGridOptions.editedRowIds.push(item.Id);
                }
            });

            $scope.dataAgGridOptions.api.deselectAll();
        };

        $scope.openBulkQAChange = function () {

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-rowqaupdate.html',
                controller: 'ModalBulkRowQAChangeCtrl',
                scope: $scope, //very important to pass the scope along...

            });

        };     

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

            $location.path("#!/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        };


        //click "save" on dataset edit form
        $scope.saveData = function () {

            if (!$scope.dataAgGridOptions.dataChanged && !$scope.row.dataChanged) {
                if (confirm("Nothing to save. Return to Activities?")) {
                    $location.path("#!/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
                }
                else {
                    return;
                }
            }

            var dupe_check = $scope.checkForDuplicates();

            console.log(" -- save -- ");

            dupe_check.$promise.then(function () { 
                //TODO: IF we have errors don't save unless config.savewitherrors = true
                if (!$scope.hasDuplicateError)
                    $scope.modalFile_saveParentItem(); //saverow - this is just for temporary TODO......
                else
                    console.log("Aborting saving because we have a duplicate error");
            });


            //console.dir($scope.row);


            
/*
            $scope.errors.heading = []; //reset errors if there are any.

            if ($scope.gridHasErrors) {
                if (!confirm("There are validation errors.  Are you sure you want to save anyway?"))
                    return;
            }

            //handle saving the files.
            var data = {
                ProjectId: $scope.project.Id,
                DatasetId: $scope.dataset.Id,
            };

            var target = '/api/v1/file/uploaddatasetfile';

			console.log("$scope.row is next...");
			console.dir($scope.row);
            var saveRow = $scope.row;

            $scope.handleFilesToUploadRemove(saveRow, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
  */          
        };

/*

        // For Creel Survey only. 
        $scope.addSection = function () {
            $scope.invalidOperationTitle = "Add Section is an Invalid Operation";
            $scope.invalidOperationMessage = "The Add Section button can only be used on a Data Entry page.";
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-invalid-operation.html',
                controller: 'ModalInvalidOperation',
                scope: $scope, //very important to pass the scope along...
            });
        }

        // For Creel Survey only. 
        $scope.addNewInterview = function () {
            var row = makeNewRow($scope.datasheetColDefs);
            row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataSheetDataset.push(row);
            $scope.onRow = row;

            for (var i = 0; i < $scope.datasheetColDefs.length; i++) {
                if (($scope.datasheetColDefs[i].field === "InterviewTime") ||
                    ($scope.datasheetColDefs[i].field === "GPSEasting") ||
                    ($scope.datasheetColDefs[i].field === "GPSNorthing") ||
                    ($scope.datasheetColDefs[i].field === "CarcassComments") ||
                    ($scope.datasheetColDefs[i].field === "TotalTimeFished")
                ) {
                    $scope.datasheetColDefs[i].enableCellEdit = true;
                    //$scope.datasheetColDefs[i].cellEditableCondition = true;
                    //$scope.disabledFont();
                }

            }
        };

        

*/
        //remove file from dataset.
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            return DatasetService.deleteDatasetFile($scope.projectId, $scope.datasetId, file_to_remove);
        };



        //Duplicate checking rules:
        // If checkforduplicates is enabled in the dataset config: 
//TODO:            //   If we are editing grid key fields has changed then check for duplicates on save -- otherwise, editing that doesn't change a key field is not checked
        $scope.checkForDuplicates = function () {
            
            if ($scope.dataset.Config.EnableDuplicateChecking) {

                $scope.saveResult.saving = true;
                $scope.saveResult.saveMessage = "Checking for duplicates...";

                console.log("we are dupe checking!");

                //special case for water temp - update the Activity.Description field with the range... we'll use this to duplicate check
                if ($scope.dataset.Datastore.TablePrefix == "WaterTemp") {
                    //sort, then get the first and last dates

                    //are there rows? if so then use the readingdatetimes to build our range we use for duplicate checking
                    if ($scope.dataAgGridOptions.api.getDisplayedRowCount() > 0) {

                        $scope.dataAgGridOptions.api.setSortModel({ colId: 'ReadingDateTime', sort: 'asc' });
                        var oldest = $scope.dataAgGridOptions.api.getDisplayedRowAtIndex(0);
                        var newest = $scope.dataAgGridOptions.api.getDisplayedRowAtIndex($scope.dataAgGridOptions.api.getDisplayedRowCount() - 1);

                        var oldest_date = moment(oldest.data.ReadingDateTime).format('YYYY/MM/DD');
                        var newest_date = moment(newest.data.ReadingDateTime).format('YYYY/MM/DD');
                        var watertemp_range = oldest_date + " - " + newest_date;
                        console.log("water temp date range is: " + watertemp_range);
                        $scope.row.Activity.Description = watertemp_range;
                    }
                    else {
                        console.log("There are no rows for this water temp, the Description (Date Range) will be empty.");
                    }
                }

                //build up our duplicate checker query
                var query = {
                    'DatasetId': $scope.dataset.Id,
                    'Fields': [],
                    'Locations': "["+ $scope.row.Activity.LocationId +"]",
                    'QAStatusId' : 'all',
                };

                var AbortNoFullKey = false;

                //add in the duplicate checker key fields configured for this dataset 
                $scope.dataset.Config.DuplicateCheckFields.forEach(function (dc_field) {

                    //if any of the key field values is empty, bail out -- only check if we have a full composite key.
                    if ($scope.row.Activity[dc_field] == null)
                        AbortNoFullKey = true;

                    query.Fields.push({ 'DbColumnName': dc_field, 'Value': $scope.row.Activity[dc_field] });
                });

                if (AbortNoFullKey) {
                    console.warn("Aborting duplicate check because not all key fields have values");
                    return null; //early return -- we are bailing out because our key isn't full.
                }

                var dupe_check = DatasetService.checkForDuplicateActivity(query); // will return { DuplicateActivityId: null (if none), ActivityId (if match exists)

                dupe_check.$promise.then(function () {
                    //console.log("Dupecheck back with id: " + dupe_check.DuplicateActivityId + " and our activity id is " + $scope.row.Activity.Id);

                    //if the dupe_check.DuplicateActivityId is null or equals our own activityid, it is not a duplicate.
                    if (dupe_check.DuplicateActivityId === null || dupe_check.DuplicateActivityId === $scope.row.Activity.Id) { 
                        $scope.hasDuplicateError = false;
                        $scope.saveResult.error = null;
                    } else { //otherwise it is.
                        $scope.hasDuplicateError = true;
                        $scope.saveResult.error = "Duplicate record exists with these values: " + 
                        $scope.dataset.Config.DuplicateCheckFields.toString().replace("Description","ReadingDateTimeRange").replace(/,/g,", ");
                    }

                    $scope.saveResult.saving = false;
                    $scope.saveResult.saveMessage = "Saving..."; //back to default

                }, function (data) { 
                    console.dir(data);
                });

                return dupe_check; //promise... can add more then's 
            }
        };


        $scope.modalFile_saveParentItem = function (saveRow) {
            
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
                payload.details.push(node.data); 
            });

			// If the user removed a row, the grid no longer contains that row.
			// However, when we remove a row, it is not deleted from the database; it is marked as deleted in the backend (ROWSTATUS_DELETED).
			// Therefore, we need to add the removed row back into the list that we send to the database, but we DO NOT want to add it back 
			// into the grid. 
			// 2) add the deleted record to the detail payload, mark it as deleted
			$scope.dataAgGridOptions.deletedItems.forEach(function(deletedItem){
                if (deletedItem.Id) { //only push ones that were existing already (new rows that are deleted are ignored)
                    deletedItem.RowStatusId = ROWSTATUS_DELETED; 
                    payload.details.push(deletedItem);
                    payload.deletedRowIds.push(deletedItem.Id);
                }
			});

            // 3) note which are edited
            payload.editedRowIds = $scope.dataAgGridOptions.editedRowIds; 

            console.dir(payload);
            //return;

            var save_promise = null;

            if ($scope.pagemode == 'edit')
                save_promise = DatasetService.updateActivities(payload);
            else if ($scope.pagemode = 'dataentryform')
                save_promise = DatasetService.saveActivities(payload);
            else
                return;

            save_promise.$promise.then(
                function () {
                    $scope.saveResult.success = "Save successful.";
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

                });
			
        };
		
        $scope.doneButton = function () {
            $scope.activities = undefined;
            $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        };

    }


];
