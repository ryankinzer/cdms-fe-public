//multiple activities grid
var modal_activities_grid = ['$scope', '$uibModal','$uibModalInstance','GridService','$timeout','$rootScope','DatasetService',

    function ($scope, $modal, $modalInstance, GridService, $timeout, $rootScope, DatasetService) {

        $modalInstance.rendered.then(function() {
            console.log("Rendered, so now we will activate.");
            $scope.activateGrid();
        });

        $scope.system = { 
            loading: true, 
            messages: [ "Processing data and preparing the grid..."]
        };

        $scope.hasDuplicateError = false;
		$scope.ActivityDuplicates = [];
		$scope.ActivitiesToSave = [];
		

        $scope.calculateStatistics = function () { 
            
            $scope.ActivityDates = [];
            $scope.PageErrorCount = 0;

            if (!$scope.dataAgGridOptions.hasOwnProperty('api'))
                return; //not loaded yet.


        };


        //ag-grid - header + details --- all in one grid for multiple activities
        $scope.dataAgGridOptions = {
            animateRows: true,
            //enableSorting: true,
            //enableFilter: true, 
            //enableColResize: true,
            showToolPanel: false,
            columnDefs: null,
            rowData: null,
            dataChanged: false, //updated to true if ever any data is changed
            rowSelection: 'multiple',
            onSelectionChanged: function (params) {
                
                var rows = params.api.getSelectedRows();
                $scope.dataAgGridOptions.selectedItems.length = 0; //truncate, don't replace with [] -- otherwise it is a shadow copy
                rows.forEach(function (row) {
                    $scope.dataAgGridOptions.selectedItems.push(row);
                });
                    
                $scope.$apply(); //bump angular (won't work otherwise!)
            },
            selectedItems: [],
            onGridReady: function (params) {
                console.log("GRID READY fired. ------------------------------------------>>>");
                $scope.system.loading = false;
                $scope.$apply();
                GridService.autosizeColumns($scope.dataAgGridOptions);
            },

            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
            },
            rowClassRules: {
                'row-validation-error': function(params) { return params.node.data.rowHasError; }
            },
            onCellEditingStarted: function (event) {
                //console.log('cellEditingStarted');
            },
            onCellEditingStopped: function (event) {
                //save the row we just edited
                //console.log("finished editing.");
                //console.dir(event);

                if (GridService.validateCell(event)) {
                    GridService.fireRule("OnChange", event); //only fires when valid change is made
                }

                //this might be too slow, but it is nice to have...
                $scope.calculateStatistics();
                GridService.refreshRow(event);
                $scope.$apply();

                if ($scope.dataset.Config.DuplicateCheckFields && $scope.dataset.Config.DuplicateCheckFields.contains(event.colDef.DbColumnName)) {
                    $scope.checkRowForDuplicates(event.node);
                }
            
                //console.log("all done edit validation");

            },
        };


        //call to fire up the grid after the $scope.dataset is ready
        $scope.activateGrid = function () {
            console.log("activating grid!");
            $scope.system.messages.push("Preparing data for grid...");
            //setup grid and coldefs and then go!

                $scope.dataAgColumnDefs = GridService.getAgColumnDefs($scope.dataset);
                
                //setup any possible values that are needed - detail
                $scope.dataAgColumnDefs.DetailFields.forEach(function (fieldDef) {
                    if (fieldDef.field == "QAStatusId") { //RowQAStatusId because we're in the details
                        fieldDef.setPossibleValues(makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name'));
                    }

                    if (fieldDef.ControlType == 'file' || fieldDef.ControlType == 'hidden')
                        fieldDef.hide = true;

                });

                //setup activity fields to point to the right place
                $scope.dataAgColumnDefs.HeaderFields.forEach(function (fieldDef) {
                    if (fieldDef.field == "LocationId") { 
                        if (fieldDef.setPossibleValues) {
                            fieldDef.setPossibleValues(makeObjects($scope.project.Locations, 'Id', 'Label'));
                            fieldDef.field = "Activity." + fieldDef.DbColumnName;
                        }
                    }

                    if (fieldDef.field == "QAStatusId") { //ActivityQAStatusId 
                        fieldDef.setPossibleValues(makeObjects($scope.dataset.QAStatuses, 'Id', 'Name'));
                        fieldDef.field = "Activity." + fieldDef.DbColumnName;
                    }

                    if (fieldDef.field == "QAComments") { 
                        fieldDef.field = "Activity." + fieldDef.DbColumnName;
                    }

                    if (fieldDef.field == "ActivityDate") { 
                        fieldDef.field = "Activity." + fieldDef.DbColumnName;
                    }

                    if (fieldDef.ControlType == 'file' || fieldDef.ControlType == 'hidden')
                        fieldDef.hide = true;

                });
                $scope.system.messages.push("Preparing grid...");

                $scope.dataAgGridOptions.columnDefs = $scope.dataAgColumnDefs.HeaderFields.concat($scope.dataAgColumnDefs.DetailFields);
                //$scope.fields = { header: $scope.dataAgColumnDefs.HeaderFields, detail: $scope.dataAgColumnDefs.DetailFields };

                console.log("Ready to go!");
                //console.dir($scope.dataAgGridOptions.columnDefs);
                //console.dir($scope.imported_rows);


                var ag_grid_div = document.querySelector('#data-import-grid');    //get the container id...
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.dataAgGridOptions); //bind the grid to it.
                //$scope.dataAgGridOptions.api.showLoadingOverlay(); //show loading...

                //set the detail values into the grid
                //console.log("setting grid data");
                $scope.dataAgGridOptions.api.setRowData($scope.imported_rows);

                //console.log("GRID Validate. ------------------------------------------>>>");
                GridService.validateGrid($scope.dataAgGridOptions);
                //console.log("GRID Validate IS DONE ------------------------------------------>>>");

                $scope.system.messages.push("Checking for duplicates...");
                //console.log("GRID Dupe check ------------------------------------------>>>");
                $scope.checkAllRowsForDuplicates();
                //console.log("GRID Dupe check IS DONE ------------------------------------------>>>");

                $scope.dataAgGridOptions.api.redrawRows();  
                
                $scope.system.messages.push("Calculating statistics...");
                $scope.calculateStatistics();
                GridService.bubbleErrors($scope.dataAgGridOptions);

                $scope.system.messages.push("Done...");


            //}, 0);
        };

 
		//JN: TRIBAL CDMS Revision. 
		$scope.checkAllRowsForDuplicates = function () {
			console.log('<<<---checkAllRowsForDuplicates--->>>');

			$scope.DuplicateCheckFields = [];

			if (!$scope.dataset.Config.EnableDuplicateChecking || !$scope.dataset.Config.DuplicateCheckFields.contains('ActivityDate')) {
				return; //early return, bail out since we aren't configured to duplicate check or don't have ActivityDate as a key
			}
			else {
				//JN: but if this dataset has been configured for dup check, we need to get those special fields, yo! 
				//console.log('<<<---finding dup check fields--->>>');
				$scope.dataset.Config.DuplicateCheckFields.forEach(function (field) {
					if (field != 'ActivityDate' && field != 'LocationId') {
						//console.log('Add to DuplicatedCheckFields: ' + field);
						$scope.DuplicateCheckFields.push(field);
					} 
				})

			}
			console.dir($scope.DuplicateCheckFields);

            $scope.ActivitiesChecked = [];
            $scope.num_checked = 0;

            //check for duplicate using each unique ActivityDate (if there is one defined (water temp doesn't have one))
			$scope.dataAgGridOptions.api.forEachNode(function (node) { 

				var the_key = GetActivityKey(node);
				//console.log("<<<--- THE KEY --->>>");
				//console.log(the_key);
				//var the_location = + node.data.Activity.LocationId;
				//var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');
				//var the_key = the_date + '_' + the_location;

				////Append any user-defined duplicate check fieds to the key
				//$scope.DuplicateCheckFields.forEach(function (field) {
				//	the_key = the_key + "_" + node.data[field];

				//});

				//console.log('For each node in the grid, log the_key: ' + the_key);

				if (!$scope.ActivitiesChecked.contains(the_key)) {
                    //ok, let's check this one...
					//console.log('Okay--we need to test this key for dups:  ' + the_key);
					//console.dir(node);
					$scope.ActivitiesChecked.push(the_key);
                    $scope.checkRowForDuplicates(node, the_date, the_key); 
                }
            });
        };

	

		//JN: TRIBAL CDMS Edit
		//checks a row(node) for duplicate record. if so, pushes to ActivityDuplicates
		$scope.checkRowForDuplicates = function (node, the_date, the_key) {
			
			var row = {
				'Activity': {
					'ActivityDate': node.data.Activity.ActivityDate,
					'LocationId': node.data.Activity.LocationId,
					'Id': 0,
				}
			};

			//JN: add our dup check fields to this row to grid-service can run correctly
			$scope.DuplicateCheckFields.forEach(function (field) {
				//console.log('<<<---node.data.field value: ' + node.data[field] + '--->>>');
				//console.dir(node);
				row.Activity[field] = node.data[field];
			})

			console.log('<<<---checkRowForDuplicates--->>>');
			console.dir(row);

			//if this is already marked as a duplicate, don't bother sending off another request...

			var saveResult = {};
			var dupe_promise = GridService.checkForDuplicates($scope.dataset, $scope.dataAgGridOptions, row, saveResult);

			if (dupe_promise !== null) {
				dupe_promise.$promise.then(function () {
					$scope.num_checked++;
					console.log('<<<---Activity #' + $scope.num_checked + ' --->>>');
					if (saveResult.hasError) { //is a duplicate!
						//just add it to the duplicates array 
						console.log('Add ' + the_key + ' to the duplicates array!');
						$scope.ActivityDuplicates.push({'ActivityKey': the_key, 'ActivityDate': the_date, 'LocationId': node.data.Activity.LocationId, 'marked': false, 'message': saveResult.error, 'row': row }); //will be marked by a watcher
					}
					if ($scope.num_checked == $scope.ActivitiesChecked.length) {
						console.log(" >>>>>>>>> ok all done with all rows! --------------------");
						
						if ($scope.ActivityDuplicates ===undefined || $scope.ActivityDuplicates.length == 0) {
							console.log("No duplicates!");
						}
						else {
							console.log("Found some duplicates! No worries. Save function can handle it.");
							console.dir($scope.ActivityDuplicates);
						}
						
						//ok, duplicate checking promises are all back -- let's mark any in our grid that are duplicates and then bubble them up.
						var hadAnyError = false;

						$scope.ActivityDuplicates.forEach(function (dupe) {
							if (!dupe.marked && $scope.dataAgGridOptions.api) {
								dupe.marked = true;
								$scope.dataAgGridOptions.api.forEachNode(function (node) {
									var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');
									var the_location = + node.data.Activity.LocationId;

									if (the_date == dupe.ActivityDate && the_location == dupe.LocationId) {
										hadAnyError = true;
										GridService.addErrorToNode(node, dupe.message, null);
									}
								});
							}
						});

						if (hadAnyError) {
							$scope.hasDuplicateError = hadAnyError;
							$scope.dataAgGridOptions.api.redrawRows();
							$scope.calculateStatistics();
							GridService.bubbleErrors($scope.dataAgGridOptions);
						}
					}
				});
			}
		};


		//JN: TRIBAL CDMS Edit
		//Group data into activities with user-defined duplicate check fields when available
		$scope.save = function () {

			$scope.system.messages.length = 0;
			$scope.system.loading = true;

			var unique_activities = [];
			var missing_fields = false;

			$scope.dataAgGridOptions.api.forEachNode(function (node) {

				//Check activity key fields for values
				if (!IsValidRow(node)) {
					missing_fields = true;
					console.log("uhoh - missing stuff from activity:");
				}

				////Create unique key for each activity
				var the_key = GetActivityKey(node);
		
				//Add key to the unique activities array if it's not identified as a duplicate
				if (!unique_activities.contains(the_key) && !IsDuplicateRow(the_key)) {

					unique_activities.push(the_key);
					var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');
					var activity = { 'ActivityDate': the_date, 'Key': the_key, 'LocationId': node.data.Activity.LocationId };
				
					//Add duplicate check fields to activity
					$scope.DuplicateCheckFields.forEach(function (field) {
						activity[field] = node.data[field];
					});
					console.log("Add this Activity to Save List");
					console.dir(activity);
					$scope.ActivitiesToSave.push(activity);

				}
			});

		

			if ($scope.ActivitiesToSave.length == 0) {
				alert("CDMS has checked the import file for duplicates and found 0 new Activies to import. Please check your data and try again.");
				$modalInstance.close();
				return;

			}
			else
			{
				if (missing_fields) {

					alert("CDMS has detected a data quality issue in the import file\n\nAll rows require an ActivityDate and Location. Values are also required for any user-defined duplicate check fields. Please check your data and try again.\n\nNo records have been imported.");
					$scope.ActivitiesToSave.length = 0;
					$modalInstance.close();
					return;
				}
				else {

					if (!confirm("A total of " + $scope.ActivitiesToSave.length + " activities will be saved.")) {
						$scope.system.loading = false;
						$scope.ActivitiesToSave.length = 0;
						return;
					}
				}
			}
	
         

			$scope.ActivitiesToSave.forEach(function (activity) { 

                var payload = {
                    'Activity': null,
                    'DatasetId': $scope.dataset.Id,
                    'ProjectId': $scope.project.Id,
                    'UserId': $rootScope.Profile.Id,
                    'deletedRowIds': [],
                    'editedRowIds': [],
                    'header': null,
                    'details': [],
			};

		
				$scope.dataAgGridOptions.api.forEachNode(function (node, index) { 

					//var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');

					//Test row 
					if (IsValidActivityRow(activity, node)) {
						if (payload.header == null) {
							payload.Activity = node.data.Activity;
							payload.header = {};

							$scope.dataAgColumnDefs.HeaderFields.forEach(function (header_field) {
								payload.header[header_field.DbColumnName] = node.data[header_field.DbColumnName];
							})
							//add the ActivityQAStatus back in with values from the activity
							payload.Activity.ActivityQAStatus = {
								'Comments': node.data.Activity.QAComments,
								'QAStatusId': node.data.Activity.QAStatusId,
							};
							delete payload.header['QAStatusId'];
							delete payload.header['QAComments'];
							delete payload.header['LocationId'];
							delete payload.header['ActivityDate'];

						}
						if (node.data.data_row_hasdata) {

							var the_detail = { 'QAStatusId': node.data['QAStatusId'] };

							$scope.dataAgColumnDefs.DetailFields.forEach(function (detail_field) {
								if (detail_field.ControlType == "multiselect" && Array.isArray(node.data[detail_field.DbColumnName]))
									the_detail[detail_field.DbColumnName] = angular.toJson(node.data[detail_field.DbColumnName]);
								else
									the_detail[detail_field.DbColumnName] = node.data[detail_field.DbColumnName];
							});
							payload.details.push(the_detail);
							//console.dir(the_detail);
						} else {
							console.log("skipping data for this row because it was empty!");
						}
					}
				

                });

                activity.numRecords = payload.details.length;

                //console.dir(payload); 
                activity.result = DatasetService.saveActivities(payload);

                activity.result.$promise.then(
                function () {
                    activity.result.success = "Save successful.";
                    console.log("Success!");
                    $scope.system.loading = false;
                }, 
                function (data) { 
                    console.log("Failure!");
                    $scope.system.loading = false;
                    //console.dir(data);

                    if (typeof data.data !== 'undefined') {
                        if (typeof data.data.ExceptionMessage !== 'undefined') {
                            theErrorText = data.data.ExceptionMessage;
                            console.log("Save error:  theErrorText = " + theErrorText);
                        }

                    }
                    activity.result.error = "Error: " + theErrorText ;

                });

            });

		};


		//JN TRIBAL CDMS EDIT
		//Check if row belongs to activity
		IsValidActivityRow = function (activity, node) {

			var result = true;
			var the_date = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');

			if (activity.ActivityDate == the_date && node.data.Activity.LocationId == activity.LocationId) {
				
				$scope.DuplicateCheckFields.forEach(function (field) {

					if (activity[field] != node.data[field]) {
						result = false;
					}
				});
			}
			else
			{
				result = false;
			}
		
			return result;
		}

		//JN TRIBAL CDMS EDIT
		//Check if row has values for each activity field
		IsValidRow = function (node) {

			var result = true;
			if (node.data.Activity.ActivityDate && node.data.Activity.LocationId) {

				$scope.DuplicateCheckFields.forEach(function (field) {

					if (!node.data[field]) {
						result = false;
					}
				});

			}
			else {

				result = false;
			}

			return result;
		}

		//JN TRIBAL CDMS EDIT
		//Check if row key is a duplicate key
		IsDuplicateRow = function (the_key) {

			var result = false;

			$scope.ActivityDuplicates.forEach(function (dup) {

				if (dup.ActivityKey == the_key) {
					result = true;
				}
				
				return result;
			});
			

			return result;
		}

		//JN TRIBAL CDMS EDIT
		//Create the_key here instead of in multiple places
		GetActivityKey = function (node) {
			console.log("<<<---Key Getter--->>>");
			//Create unique key for each activity
			var activityDate = moment(node.data.Activity.ActivityDate).format('YYYY-MM-DDTHH:mm');
			var activityKey = activityDate + "_" + node.data.Activity.LocationId;

			//Append any user-defined duplicate check fieds to the key
			$scope.DuplicateCheckFields.forEach(function (field) {
				activityKey = activityKey + "_" + node.data[field];
			});

			console.log(activityKey);
			return activityKey;
		}

		



        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.close = function () { 
            $modalInstance.close();
        }
    }
];
