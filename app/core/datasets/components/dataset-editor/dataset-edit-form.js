/**
*  This component provides the data edit page (form + grid).
*  /index.html#/edit/1004
*/


var dataset_edit_form = ['$scope', '$q', '$timeout', '$sce', '$routeParams', 'DatasetService', 'SubprojectService', 'ProjectService', 'CommonService', '$modal', '$location', '$rootScope',
    'ActivityParser', 'GridService', '$upload',
    function ($scope, $q, $timeout, $sce, $routeParams, DatasetService, SubprojectService, ProjectService, CommonService, $modal, $location, $rootScope,
        ActivityParser, GridService, $upload) {

        initEdit(); // stop backspace while editing from sending us back to the browser's previous page.
        
        $scope.fields = { header: [], detail: [] };

        //$scope.validationErrors = [];

        $scope.userId = $rootScope.Profile.Id;
        
        //fields to support uploads // *** but is this the old or the new?
/*
        $scope.filesToUpload = {}; 
        $scope.file_row = {};
        $scope.file_field = {};
*/

        //page-level errors
        $scope.errors = { heading: [] };

//        $scope.datasetId = null;

  //      $scope.option = { enableMultiselect: false };


        // Are we editing or not?
        if ($routeParams.Id !== null)
            $scope.dataset_activities = DatasetService.getActivityData($routeParams.Id);
        else
            $scope.dataset_activities = {}; //TODO: needs to have Header and Details I think
        
        //we bind directly to the Header that comes back from activity details now -- BUT might need do make a new one if we are creating a NEW one!
        //$scope.row is the Header fields data row
        $scope.row = { ActivityQAStatus: {} }; //header field values get attached here by DbColumnName : value

/*
        $scope.sortedLocations = [];
        $scope.datasetLocationType = 0;
        $scope.datasetLocations = [[]];
        $scope.primaryDatasetLocation = 0;

        $scope.foundDuplicate = false;
*/



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
            debug: false,
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
            editedItems: [],
            selectedItems: [],
            //isFullWidthCell: function (rowNode) {
            //    return rowNode.level === 1;
            //},
            onGridReady: function (params) {
                //console.log("GRID IS READY. ------------------------------------------>>>");
                $scope.agValidateGrid(params);
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
            defaultColDef: {
                editable: true
            },
            onCellEditingStarted: function (event) {
                //console.log('cellEditingStarted');
            },
            onCellEditingStopped: function (event) {
                //perform cell validation if a validator exists for this field
                if (event.colDef.hasOwnProperty('validator')) {
                    $scope.agValidateCell(event);
                };
            },
        };

        //adds row to grid
        $scope.addNewRow = function () {
            var new_row = makeNewRow($scope.dataAgColumnDefs.DetailFields);
            new_row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataAgGridOptions.api.updateRowData({add: [new_row]});
//TODO: note in editedItems? or newItems?
        };


//move to GridService?
        $scope.agValidateGrid = function (params) {
            //console.log(" -- validating grid --");

/*
            //get all of the columns for the grid
            var gridColumns = params.columnApi.getAllColumns();

            //iterate each node, columns and validate the cell
            params.api.forEachNode(function (node, index) {
                gridColumns.forEach(function (column) {
                    $scope.agValidateCell({
                        node: node,
                        colDef: column.colDef,
                        value: node.data[column.colDef.field],
                        api: params.api,
                    })
                });

            });
*/
        };


        // Called to validate a cell value (like after editing or first time display). 
        //  once a cell is validated, if there are errors, here is the situation:
        //  (data represents the row)
        //  data.validationErrors is an array of errors from this cell + previously set errors from other cells in this row
        //  data.rowHasError = true (or false if no error)
        //  data.rowErrorTooltip = "error messages" from all validation errors for this cell for display as a tooltip (displayed on hover)
//move to GridService?
        $scope.agValidateCell = function (event) {
            if (!event.colDef.hasOwnProperty('validator'))
                return;

            var validator = event.colDef.validator;

            console.log(" -- running cell validator: ");
            console.dir(validator);
            //remove this field's validation errors from our row's validation errors (returns [] if none)
            event.node.data.validationErrors = validator.removeFieldValidationErrors(event.node.data.validationErrors, event.colDef);

            //validate this cell's value and merge in any errors with this row's errors.
            var fieldValidationErrors = validator.validate(event);
            event.node.data.validationErrors = event.node.data.validationErrors.concat(fieldValidationErrors);

            console.dir(fieldValidationErrors);

            //set validation status
            event.node.data.rowHasError = ((Array.isArray(event.node.data.validationErrors) && event.node.data.validationErrors.length > 0));

            //collect error messages into a tooltip for the cells with error/s
            if (event.node.data.rowHasError) {
                event.node.data.validationErrors.forEach(function (error, index) {
                    event.node.data.rowErrorTooltip = (index === 0) ? "" : event.node.data.rowErrorTooltip + "\n"; //either initialize to "" or add a newline

                    //flatten the error messages for this cell
                    event.node.data.rowErrorTooltip = event.node.data.rowErrorTooltip +
                        "[" + error.field.DbColumnName + "] " + error.message;

                    //console.log("validation errors for [" + error.field.DbColumnName + "] " + event.node.data.rowErrorTooltip);
                    //console.dir(event.node.data);

                });
            }
            else {
                event.node.data.rowErrorTooltip = ""; //clear the tooltip if there are no errors.
            }

            event.api.redrawRows({ columns: event.column });

        };

        

        //TODO: load special fields for dataset

        //once dataset loaded
        $scope.dataset_activities.$promise.then(function () {
            
            //console.log("$scope.dataset_activities finished loading!");
            //console.dir($scope.dataset_activities);

            //setup the scope dataset    
            $scope.dataset = $scope.dataset_activities.Dataset;

            //setup grid and coldefs and then go!
            $timeout(function () {

                $scope.dataAgColumnDefs = GridService.getAgColumnDefs($scope.dataset, 'DataEntryPage');
                $scope.dataAgGridOptions.columnDefs = $scope.dataAgColumnDefs.DetailFields;
                
                $scope.fields = { header: $scope.dataAgColumnDefs.HeaderFields, detail: $scope.dataAgColumnDefs.DetailFields };

                //console.log("our fields are setup: ");
                //console.dir($scope.fields);
                //console.log("and this will be our data");
                //console.dir($scope.dataset_activities.Details);

                //spin through and set any sytem field detail possible values TODO - refactor into list manager
                angular.forEach($scope.fields.detail, function (fieldDef) {
                	//console.dir("--> property == " + fieldDef.field);
                    if (fieldDef.field == "QAStatusId") { //RowQAStatusId
                        fieldDef.setPossibleValues(makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name'));
                        //console.log("field after setting QAStatus: ");
                        //console.dir(fieldDef);
                    }
                });


                

                var ag_grid_div = document.querySelector('#data-edit-grid');    //get the container id...
                //console.dir(ag_grid_div);
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.dataAgGridOptions); //bind the grid to it.
                $scope.dataAgGridOptions.api.showLoadingOverlay(); //show loading...



                //set the detail values into the grid
                $scope.dataAgGridOptions.api.setRowData($scope.dataset_activities.Details);
                
                //set the header values into the form/row
                $scope.row = $scope.dataset_activities.Header;
                
                //convert timezone to object if it exists
                $scope.row.Activity.Timezone = angular.fromJson($scope.row.Activity.Timezone);
                
                //console.dir($scope.dataAgGridOptions.columnApi.getAllColumns());


/* - shouldn't need to do this as it is already defined in cell-control-types.js
                //spin through and convert any multiselect values from JSON to actual object

                angular.forEach($scope.fields.header, function (fieldDef) {
                	//console.dir("--> property == " + fieldDef.field);
                    if (fieldDef.ControlType == "multiselect" || fieldDef.ControlType == "select") {
                        //console.dir("--> property is a multiselect, converting JSON to object : == " + fieldDef.field);
                        $scope.row[fieldDef.field] = angular.fromJson($scope.dataset_activities.Header[fieldDef.field]);
                        //console.dir($scope.row[fieldDef.field]);
                    }
                });
*/


                //console.log("$scope.row (header fields/data) is done... what do we have in the end?");
                //console.dir($scope.row);


            }, 0);

            //load the files related to this dataset
            $scope.dataset.Files = DatasetService.getDatasetFiles($scope.dataset.Id);

            //once the dataset files load, setup our file handler
            $scope.dataset.Files.$promise.then(function () {
                //mixin the properties and functions to enable the modal file chooser for this controller...
                //console.log("---------------- setting up dataset file chooser ----------------");
                modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.dataset.Files);
            });

            //todo: combine this together with file loading -- or just do it in DataService.getDatasets or whatever?
            DatasetService.configureDataset($scope.dataset); //bump to load config since we are pulling it directly out of the activities


            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);

            //once the project is loaded...
            $scope.project.$promise.then(function () {

                //console.log("Project is done loading!");
                //console.dir($scope.project);

                //check authorization -- need to have project loaded before we can check project-level auth
                if (!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project)) {
                    $location.path("/unauthorized");
                }

                $rootScope.projectId = $scope.projectId = $scope.project.Id;

                //I think these come back already with getProject? TODO
                $scope.project.Files = null;
                $scope.project.Files = ProjectService.getProjectFiles($scope.project.Id);

                
                //$scope.datasetLocationType = getDatasetLocationType($scope.DatastoreTablePrefix);
                //console.log("LocationType = " + $scope.datasetLocationType);

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


      //          $scope.selectInstrument();
                //$scope.selectLocation();

                //console.log("$scope at end of watch project.Name is next...");
                //console.dir($scope);
            });

            //set the header field data values
//NOTE: can we do this automagically?
            //console.log("Setting header field values ...");

//************************* TODO!
            $scope.row['ActivityId'] = $scope.dataset_activities.Header.ActivityId;
            //$scope.row['activityDate'] = $scope.dataset_activities.Header.Activity.ActivityDate;
            //$scope.row['locationId'] = "" + $scope.dataset_activities.Header.Activity.LocationId; //note the conversion of this to a string!
            $scope.row['InstrumentId'] = $scope.dataset_activities.Header.Activity.InstrumentId;
            $scope.row['AccuracyCheckId'] = $scope.dataset_activities.Header.Activity.AccuracyCheckId;
            $scope.row['PostAccuracyCheckId'] = $scope.dataset_activities.Header.Activity.PostAccuracyCheckId;

            //if the activity qa status is already set in the header, copy it in to this row's activityqastatus (this should really always be the case)
            if ($scope.dataset_activities.Header.Activity.ActivityQAStatus) {
                $scope.row.ActivityQAStatus = {
                    QAStatusId: "" + $scope.dataset_activities.Header.Activity.ActivityQAStatus.QAStatusId,
                    Comments: $scope.dataset_activities.Header.Activity.ActivityQAStatus.Comments,
                }
            }
            //otherwise, set it to the default.
            else {
                //console.warn("The ActivityQAStatus for this activity is not set, setting to default.");
                $scope.row.ActivityQAStatus = {
                    QAStatusId: "" + $scope.dataset.DefaultRowQAStatusId,
                    Comments: ""
                }
            }

            if ($scope.dataset_activities.Header.Activity.Timezone)
                $scope.row.Timezone = getByField($scope.SystemTimezones, angular.fromJson($scope.dataset_activities.Header.Activity.Timezone).Name, "Name"); //set default timezone

            //$scope.RowQAStatuses = $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

            

        });

        $scope.setSelectedBulkQAStatus = function (rowQAId) {
            angular.forEach($scope.dataAgGridOptions.selectedItems, function (item, key) {
                console.log("bulk changing: ");
                console.dir(item);
                item.QAStatusId = rowQAId;
//TODO: refreshthegrid!!
                //mark the row as updated so it will get saved.
                if ($scope.dataAgGridOptions.editedItems.indexOf(item.Id) == -1) {
                    $scope.dataAgGridOptions.editedItems.push(item.Id);
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
       /*



        $scope.setLocation = function () {
            //$scope.row.Location = getByField($scope.project.Locations, $scope.row.LocationId, "Id");
            //$scope.viewLocation = getByField($scope.project.Locations, $scope.row.LocationId, "Id");
        };



        $scope.createInstrument = function () {
            $scope.viewInstrument = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
                controller: 'ModalCreateInstrumentCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };

        $scope.reloadProject = function () {
            //reload project instruments -- this will reload the instruments, too
            ProjectService.clearProject();
            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
            var watcher = $scope.$watch('project.Id', function () {
                if (!$scope.project.Id) return;

                $scope.selectInstrument();
                watcher();
            });

        };

        $scope.openAccuracyCheckModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-new-accuracycheck.html',
                controller: 'ModalQuickAddAccuracyCheckCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };


        $scope.selectLocation = function () {
            //$scope.viewLocation = getByField($scope.project.Locations, $scope.row.locationId, "Id");
        };

        $scope.selectInstrument = function () {
            //console.log("Inside $scope.selectInstrument...");

            if ((typeof $scope.row.InstrumentId === 'undefined') || ($scope.row.InstrumentId === null)) {
                $scope.row.InstrumentId = $rootScope.InstrumentId;
                $rootScope.InstrumentId = undefined;
            }

            $scope.viewInstrument = getByField($scope.project.Instruments, $scope.row.InstrumentId, "Id");

            //get latest accuracy check
            $scope.row.LastAccuracyCheck = $scope.viewInstrument.AccuracyChecks[$scope.viewInstrument.AccuracyChecks.length - 1];
            $scope.row.DataGradeText = getDataGrade($scope.row.LastAccuracyCheck);

            if ($scope.row.LastAccuracyCheck)
                $scope.row.AccuracyCheckId = $scope.row.LastAccuracyCheck.Id;
        };

        $scope.selectAccuracyCheck = function () {
            //console.log("Inside $scope.selectAccuracyCheck...");
            if ($scope.row.AccuracyCheckId)
                $scope.row.AccuracyCheck = getByField($scope.viewInstrument.AccuracyChecks, $scope.row.AccuracyCheckId, "Id");

            //console.log("$scope at end of $scope.selectAccuracyCheck is next...");
            //console.dir($scope);
        };

        $scope.cancel = function () {
            if ($scope.dataChanged) {
                if (!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
                    return;
            }

            $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        };

        //adds row to grid
        $scope.addNewRow = function () {
            var row = makeNewRow($scope.datasheetColDefs);
            row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataGridOptions.api.updateRowData({add: [row]});
        };

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

        
        //click "save" on dataset edit form
        $scope.saveData = function () {
            //console.log("Saving edited data!");

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
            
        };

        //remove file from dataset.
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            return DatasetService.deleteDatasetFile($scope.projectId, $scope.datasetId, file_to_remove);
        };

        $scope.modalFile_saveParentItem = function (saveRow) {
            //console.log("Inside modalFile_saveParentItem, $scope is next...");
            //console.dir($scope);

            var strYear = null;
            var strMonth = null;
            var intMonth = -1;
            var strDay = null;

			// Notes...
			// If the user removed a row, $scope.dataSheetDataset (what the user sees) no longer contains that row.
			// However, when we remove a row, it is not deleted from the database; it is marked as deleted in the backend (ROWSTATUS_DELETED).
			// Therefore, we need to add the removed row back into the list that we send to the database, but we DO NOT want to add it back 
			// into $scope.dataSheetDataset.  
			// So, we ...
			// 1) make a copy of $scope.dataSheetDataset and send the copy to the backend.
            var sheetCopy = angular.copy($scope.dataSheetDataset);
			//console.log("sheetCopy is next...");
			//console.dir(sheetCopy);
			
			// 2) add the deleted record to the copy
			$scope.deletedRows.forEach(function(deletedItem){
				sheetCopy.push(deletedItem);
			});
			
			// 3) For TotalTimeFished, convert from HH:MM to numberMinutes
			//    This must be done to the deleted row(s) also, thus we do it here/now.
			// 4) is down below...
			sheetCopy.forEach(function(item){
				if ((typeof item.TotalTimeFished !== 'undefined') && (item.TotalTimeFished !== null)) {
					console.log("TotalTimeFished for item = " + item.TotalTimeFished);
					var theHours = parseInt(item.TotalTimeFished.substring(0, 2));
					console.log("theHours = " + theHours);
					var theMinutes = parseInt(item.TotalTimeFished.substring(3, 5));
					console.log("theMinutes = " + theMinutes);
					var TotalTimeFished = theHours * 60 + theMinutes;
					console.log("TotalTimeFished (in min) = " + TotalTimeFished);
					item.TotalTimeFished = TotalTimeFished;
					console.log("item.TotalTimeFished = " + item.TotalTimeFished);
				}

				if ((typeof item.InterviewTime !== 'undefined') && (item.InterviewTime != null)) {
					var tmpTime = item.InterviewTime;
					//console.log("tmpTime (TimeEnd) = " + tmpTime);
					item.InterviewTime = "";
					item.InterviewTime = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
				}
			});

			// 4) Continue processing and send the full list (with the deleted items added back in).
            $scope.activities = ActivityParser.parseSingleActivity($scope.row, sheetCopy, $scope.fields, $scope.dataset.QAStatuses);

            if (!$scope.activities.errors) {
                if ($scope.addNewSection) {
                    //console.log("$scope.addNewSection is true, so setting $scope.activities.addNewSection to true also.");
                    $scope.activities.addNewSection = true;
                }

                $scope.activities.deletedRowIds = $scope.getDeletedRowIds($scope.deletedRows);
                $scope.activities.updatedRowIds = $scope.updatedRows;

                //console.log("$scope.activities in saveData, just before calling DatasetService.saveActivities is next...");
                //console.dir($scope.activities);
                DatasetService.updateActivities($scope.userId, $scope.dataset.Id, $scope.activities, $scope.DatastoreTablePrefix);
            }
            else {
                //console.log("We have errors...");
                //console.dir($scope.activities.errors);
            }
			
        };
		
        $scope.doneButton = function () {
            $scope.activities = undefined;
            $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        };

        $scope.getDeletedRowIds = function (rows) {
            var results = [];
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.Id) // true of deleted existing records; new rows added won't have an id.
                {
                    results.push(row.Id);
                }
            };

            return results;
        }
*/
    }


];
