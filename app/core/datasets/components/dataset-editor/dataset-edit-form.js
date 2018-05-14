/**
*  This component provides the data edit page (form + grid).
*  http://localhost/cdms/index.html#/edit/1004
*/


//Fieldsheet / form version of the dataentry page
//was "DataEditCtrl" from DataEditControllers
var dataset_edit_form = ['$scope', '$q', '$sce', '$routeParams', 'DatasetService', 'SubprojectService', 'ProjectService', 'CommonService', '$modal', '$location', '$rootScope',
    'ActivityParser', 'DataSheet', '$upload',
    function ($scope, $q, $sce, $routeParams, DatasetService, SubprojectService, ProjectService, CommonService, $modal, $location, $rootScope,
        ActivityParser, DataSheet, $upload) {

        initEdit(); // stop backspace from ditching in the wrong place.

        $scope.userId = $rootScope.Profile.Id;
        $scope.fields = { header: [], detail: [], relation: [] };

        //fields to support uploads
        $scope.filesToUpload = {};
        $scope.file_row = {};
        $scope.file_field = {};

        $scope.errors = { heading: [] };

        $scope.cellInputEditableTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" />';
        $scope.cellSelectEditableTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'QAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in RowQAStatuses"/>';

        $scope.datasheetColDefs = [];

        $scope.datasetId = null;

        $scope.option = { enableMultiselect: false };

        $scope.dataset_activities = DatasetService.getActivityData($routeParams.Id);

        $scope.dataSheetDataset = [];
        $scope.row = { ActivityQAStatus: {} }; //header field values get attached here by dbcolumnname

        $scope.fishermenList = null;
        //$scope.fishermenList = ProjectService.getFishermen();

        $scope.subprojectList = null;

        $scope.sortedLocations = [];
        $scope.datasetLocationType = 0;
        $scope.datasetLocations = [[]];
        $scope.primaryDatasetLocation = 0;
        $scope.selectedItems = [];

        $scope.gridOptionsFilter = {};

        $scope.dataEntryPage = false;
        $scope.showDetails = true;

        $scope.foundDuplicate = false;

        //datasheet grid
        $scope.gridDatasheetOptions = {
            data: 'dataSheetDataset',
            enableCellSelection: true,
            enableRowSelection: true,
            multiSelect: true,
            enableCellEdit: true,
            columnDefs: 'datasheetColDefs',
            enableColumnResize: true,
            selectedItems: $scope.selectedItems,
            filterOptions: $scope.gridOptionsFilter,

        };

        console.log("In dataedit-controllers...");

        //config the fields for the datasheet - include mandatory location and activityDate fields
        DataSheet.initScope($scope);
        console.log("Completed scope init...");

        var fishermenWatcher =
            $scope.$watch('fishermenList.length', function () {
                if ((typeof $scope.fishermenList !== 'undefined') && ($scope.fishermenList !== null)) {
                    console.log("Inside fishermenList watch...");
                    console.log("$scope.fishermenList.length = " + $scope.fishermenList.length)

                    if ($scope.fishermenList.length > 0) {
                        $scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.fishermenList, 'Id', 'FullName');
                        console.log("$scope.fishermenOptions is next...");
                        console.dir($scope.fishermenOptions);
                    }
                }

            });

        $scope.$watch('subprojectList.length', function () {
            if ($scope.subprojectList === null)
                return;
            else if ($scope.subprojectList.length === 0)
                return;

            console.log("Inside watch subprojectList.length...");

            if ($scope.subprojectType === "Habitat") {
                console.log("$scope.subprojectList is next...");
                console.dir($scope.subprojectList);
                console.log("$scope.project.Locations is next...");
                console.dir($scope.project.Locations);

                angular.forEach($scope.subprojectList, function (subproject) {
                    angular.forEach($scope.project.Locations, function (location) {
                        //console.log("location.LocationTypeId = " +  location.LocationTypeId + ", subproject.LocationId = " + subproject.LocationId + ", location.Id = " + location.Id);
                        if (subproject.LocationId === location.Id) {
                            console.log("Found a subproject location")
                            console.dir(location);
                            $scope.datasetLocations.push([location.Id, location.Label]);
                        }
                    });
                });
            }

            console.log("datasetLocations (with subprojects) is next...");
            console.dir($scope.datasetLocations);

            $scope.finishLocationProcessing();
        });
		
		$scope.$watch('projectLeadList.length', function(){

			//if (typeof $scope.fishermenList.$resolved === 'undefined')
			if (!$scope.projectLeadList)
			{
				console.log("$scope.projectLeadList has not loaded.");
				return;
			}
			else if ($scope.projectLeadList.length === 0)
			{
				console.log("No CRPP staff found yet...");
				return;
			}
			console.log("Inside watch, projectLeadList");
			console.dir($scope);
			
			console.log("$scope.projectLeadList is next..");
			console.dir($scope.projectLeadList);		
		
			// If we switch the parameters for the makeObjects, like this makeObjects(scope.fishermenList, 'FullName', 'Id'), it will put them in alpha order by name.
			// However, we must test this first, to verify that it does not mess anything up.
			$scope.projectLeadOptions = $rootScope.projectLeadOptions = makeObjects($scope.projectLeadList, 'Id','Fullname');
			
			// Debug output ... wanted to verify the contents of scope.projectLeadOptions
			console.log("$scope.projectLeadOptions is next...");
			console.dir($scope.projectLeadOptions);
			
			console.log("We're on CrppContracts...");
			console.log("$scope.row is next...");
			console.dir($scope.row);
			if ($scope.row.ProjectLead)
			{
				var pLeadList = $scope.row.ProjectLead.split(";");
				console.log("pLeadList is next...");
				console.dir(pLeadList);
				
				// Next, get rid of that trailing semicolon.
				pLeadList.splice(-1, 1);
				console.log("pLeadList is next...");
				console.dir(pLeadList);
				
				var strProjectLead = "";
				
				// Locate the ProjectLead Id and get the Fullname
				angular.forEach($scope.projectLeadList, function(staffMember){
					
					angular.forEach(pLeadList, function(pLead){
						console.log("pLead = " + pLead + ", staffMember = " + staffMember.Id);
						if (parseInt(pLead) === parseInt(staffMember.Id))
						{
							console.log("Matched...");
							strProjectLead += staffMember.Fullname + ";\n";
							$scope.showProjectLeads = true;
						}
					});
				});
				$scope.row.strProjectLead = strProjectLead;
				$scope.row.ProjectLead = undefined;
			}
		});

        $scope.$watch('dataset_activities.Dataset.Id', function () {
            if (!$scope.dataset_activities.Dataset)
                return;

            console.log("Inside watcher dataset_activities.Dataset.Id...");
            console.log("$scope.dataset_activities is next...");
            console.dir($scope.dataset_activities);

            $scope.dataset = $scope.dataset_activities.Dataset;
            console.log("$scope.dataset is next...");
            console.dir($scope.dataset);

            $rootScope.datasetId = $scope.datasetId = $scope.dataset.Id;
            console.log("$rootScope.datasetId = " + $rootScope.datasetId);
            $scope.dataset.Files = DatasetService.getDatasetFiles($scope.dataset.Id);

            //once the dataset files load, setup our file handler
            $scope.dataset.Files.$promise.then(function () {
                //mixin the properties and functions to enable the modal file chooser for this controller...
                console.log("---------------- setting up dataset file chooser ----------------");
                modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.dataset.Files);
            });

            $scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            $scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix, "form");  // Pass the TablePrefix (name of the dataset), because it will never change.

            DatasetService.configureDataset($scope.dataset); //bump to load config since we are pulling it directly out of the activities

            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
            $scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');

            //set the header field values
            console.log("Setting header fields...");
            $scope.row['ActivityId'] = $scope.dataset_activities.Header.ActivityId;
            $scope.row['activityDate'] = $scope.dataset_activities.Header.Activity.ActivityDate;
            $scope.row['locationId'] = "" + $scope.dataset_activities.Header.Activity.LocationId; //note the conversion of this to a string!
            $scope.row['InstrumentId'] = $scope.dataset_activities.Header.Activity.InstrumentId;
            $scope.row['AccuracyCheckId'] = $scope.dataset_activities.Header.Activity.AccuracyCheckId;
            $scope.row['PostAccuracyCheckId'] = $scope.dataset_activities.Header.Activity.PostAccuracyCheckId;

            if (($scope.DatastoreTablePrefix === "CreelSurvey") && ($scope.dataset_activities.Header.FieldSheetFile))
                $scope.row['FieldSheetFile'] = $scope.dataset_activities.Header.FieldSheetFile;
            else if (($scope.DatastoreTablePrefix === "ScrewTrap") && ($scope.dataset_activities.Header.FileTitle))
                $scope.row['FieldSheetFile'] = $scope.dataset_activities.Header.FileTitle;
            else if ($scope.dataset_activities.Header.FieldSheetFile)
                $scope.row['FieldSheetFile'] = $scope.dataset_activities.Header.FieldSheetFile;

            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                console.log("Extracting times from strings...");
                var strTimeStart = $scope.dataset_activities.Header.TimeStart;
                var strTimeEnd = $scope.dataset_activities.Header.TimeEnd;
                var intTLoc = strTimeStart.indexOf("T");
                // Start just past the "T" in the string, and get the time portion (the next 5 characters).
                strTimeStart = strTimeStart.substr(intTLoc + 1, 5);
                $scope.dataset_activities.Header.TimeStart = strTimeStart;

                strTimeEnd = strTimeEnd.substr(intTLoc + 1, 5);
                $scope.dataset_activities.Header.TimeEnd = strTimeEnd;

				/*for (var i = 0; i < $scope.dataset_activities.Details.length; i++)
				{
					console.log("$scope.dataset_activities.Details[i] is next...");
					console.dir($scope.dataset_activities.Details[i]);
					var strInterviewTime = $scope.dataset_activities.Details[i].InterviewTime;
					console.log("strInterviewTime = " + strInterviewTime);
					intTLoc = strInterviewTime.indexOf("T");
					console.log("intLoc = " + intTLoc);
					strInterviewTime = strInterviewTime.substr(intTLoc + 1, 5);
					console.log("strInterviewTime = " + strInterviewTime);
					$scope.dataset_activities.Details[i].InterviewTime = strInterviewTime
				}
				*/
            }
			else if ($scope.DatastoreTablePrefix === "CrppContracts")
			{
				$scope.projectLeadList = ProjectService.getCrppStaff(); // Get all CRPP staff.
				
				if ($scope.row.ProjectLead)
					$scope.showProjectLeads = true;
			}
            console.log("$scope.row is next...");
            console.dir($scope.row);

            //if the activity qa status is already set in the header, copy it in to this row's activityqastatus (this should really always be the case)
            if ($scope.dataset_activities.Header.Activity.ActivityQAStatus) {
                $scope.row.ActivityQAStatus = {
                    QAStatusId: "" + $scope.dataset_activities.Header.Activity.ActivityQAStatus.QAStatusId,
                    Comments: $scope.dataset_activities.Header.Activity.ActivityQAStatus.Comments,
                }
            }
            //otherwise, set it to the default.
            else {
                console.warn("The ActivityQAStatus for this activity is not set, setting to default.");
                $scope.row.ActivityQAStatus = {
                    QAStatusId: "" + $scope.dataset.DefaultRowQAStatusId,
                    Comments: ""
                }
            }


            if ($scope.dataset_activities.Header.Activity.Timezone)
                $scope.row.Timezone = getByField($scope.SystemTimezones, angular.fromJson($scope.dataset_activities.Header.Activity.Timezone).Name, "Name"); //set default timezone

            $scope.RowQAStatuses = $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

            //if($scope.dataset.RowQAStatuses.length > 1)
            if (($scope.dataset.Datastore.TablePrefix === "WaterTemp") && ($scope.dataset.RowQAStatuses.length > 1)) {
                $scope.datasheetColDefs.push(
                    {
                        field: "QAStatusId", //QARowStatus
                        displayName: "QA",
                        minWidth: 50, maxWidth: 180,
                        enableCellEditOnFocus: true,
                        editableCellTemplate: $scope.cellSelectEditableTemplate,
                        cellFilter: 'RowQAStatusFilter'
                    });
            }

            if ($scope.dataset.Config) {
                var filteredColDefs = [];

                angular.forEach($scope.datasheetColDefs, function (coldef) {
                    console.log("coldef is next...");
                    console.dir(coldef);
                    if ($scope.dataset.Config.DataEntryPage &&
                        !$scope.dataset.Config.DataEntryPage.HiddenFields.contains(coldef.field)) {
                        filteredColDefs.push(coldef);
                    }
                });

                $scope.datasheetColDefs = $scope.colDefs = filteredColDefs;
            }

            //set the detail (grid) values.
            $scope.dataSheetDataset = $scope.dataset_activities.Details;
            $scope.gridFields = [];

            // If we are on the Creel Survey dataset, we need to take the total number of minutes,
            // and put it into HH:MM format, before putting the entry on the form.
            if ($scope.DatastoreTablePrefix === "CreelSurvey") // Creel Survey dataset				
            {
                var detailsLength = $scope.dataSheetDataset.length;
                for (var i = 0; i < detailsLength; i++) {
                    var NumMinutes = parseInt($scope.dataSheetDataset[i].TotalTimeFished);
                    var theHours = parseInt(NumMinutes / 60, 10);
                    var theMinutes = NumMinutes - (theHours * 60);

                    if (theHours < 10)
                        var strHours = "0" + theHours;
                    else
                        var strHours = "" + theHours;

                    if (theMinutes < 10)
                        var strMinutes = "0" + theMinutes;
                    else
                        var strMinutes = "" + theMinutes;

                    $scope.dataSheetDataset[i].TotalTimeFished = strHours + ":" + strMinutes;
                    //console.log("TotalTimeFished is now = " + $scope.dataSheetDataset[i].TotalTimeFished);

                    //console.log("$scope.dataSheetDataset[i] is next...");
                    //console.dir($scope.dataSheetDataset[i]);
                    var strInterviewTime = $scope.dataSheetDataset[i].InterviewTime;
                    //console.log("strInterviewTime (before extraction) = " + strInterviewTime);
                    intTLoc = strInterviewTime.indexOf("T");
                    //console.log("intLoc = " + intTLoc);
                    strInterviewTime = strInterviewTime.substr(intTLoc + 1, 5);
                    //console.log("strInterviewTime (after extraction) = " + strInterviewTime);
                    $scope.dataSheetDataset[i].InterviewTime = strInterviewTime
                }
            }
			else if ($scope.DatastoreTablePrefix === "AdultWeir") {
				var strTime = "";
				var tmpTime = "";
				var intTimeLoc = -1;
				angular.forEach($scope.dataSheetDataset, function (item) {
					//tmpTime = item.PassageTime;
					console.log("item is next...");
					console.dir(item);
                    if ((typeof item.PassageTime !== 'undefined') && (item.PassageTime !== null)) {
						intTimeLoc = item.PassageTime.indexOf("T");
						strTime = item.PassageTime.substr(intTimeLoc + 1, 5);
						item.PassageTime = strTime;
					}
					//else
					//    console.log("item.PassageTime is null or blank...");
				});
			}

            //setup our header/detail field structure
            angular.forEach($scope.dataset.Fields.sort(orderByIndex), function (field) {
                parseField(field, $scope);
                if (field.FieldRoleId == FIELD_ROLE_HEADER) {
                    //$scope.fields.header.push(field); // Original line.
					if (($scope.DatastoreTablePrefix === "CrppContracts") && (field.DbColumnName === "ProjectLead"))
					{
						// Skip it.
					}
					else
						$scope.fields.header.push(field);
					
                    //also copy the value to row
                    if (field.ControlType == "multiselect") {
                        //console.dir($scope.dataset_activities.Header[field.DbColumnName]);
                        $scope.row[field.DbColumnName] = angular.fromJson($scope.dataset_activities.Header[field.DbColumnName]);
                    }
                    else
                        $scope.row[field.DbColumnName] = $scope.dataset_activities.Header[field.DbColumnName];
                }
                else if (field.FieldRoleId == FIELD_ROLE_DETAIL) {
                    $scope.fields.detail.push(field);
                    $scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
                }

                //keep a list of grid fields (relations) for later loading
                if (field.ControlType == "grid")
                    $scope.gridFields.push(field);
            });

            $scope.recalculateGridWidth($scope.fields.detail.length);
            $scope.validateGrid($scope);

            console.log("$scope at end of watch dataset_activities is next...");
            console.dir($scope.dataset_activities);
        });

        //update our location options as soon as our project is loaded.
        $scope.$watch('project.Name', function () {
            //if (!$scope.project.Name) return;
			if ((typeof $scope.project === 'undefined') || ($scope.project === null))  
				return;
			else if ((typeof $scope.project.Name === 'undefined') || ($scope.project.Name === null))  
				return;  
			else if ((typeof $scope.project.Id === 'undefined') || ($scope.project.Id === null))  
				return; 

            console.log("Inside watcher, project.Name...");
            //console.log("$scope is next...");
            //console.dir($scope);
            console.log("$scope.project is next...");
            console.dir($scope.project);

            $rootScope.projectId = $scope.projectId = $scope.project.Id;
            $scope.project.Files = null;
            $scope.project.Files = ProjectService.getProjectFiles($scope.project.Id);

            $scope.project.Instruments = CommonService.filterListForOnlyActiveInstruments($scope.project.Instruments);

            //$scope.subprojectType = ProjectService.getProjectType($scope.project.Id);
            console.log("$scope.subprojectType = " + $scope.subprojectType);
            SubprojectService.setServiceSubprojectType($scope.subprojectType);

            //if ($scope.subprojectType === "Harvest")
            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                console.log("Loading Harvest...");
                $scope.ShowFishermen = true;
                $scope.theFishermen = ProjectService.getProjectFishermen($scope.project.Id);
                $scope.fishermenList = ProjectService.getFishermen();
            }
            //else if ($scope.subprojectType === "CRPP")
            else if ($scope.DatastoreTablePrefix === "CrppContracts") {
                console.log("Loading CRPP subprojects...");
                $scope.ShowSubproject = true;
                $scope.subprojectList = SubprojectService.getSubprojects();
            }
            //else if ($scope.subprojectType === "Habitat")
            //else if ($scope.DatastoreTablePrefix === "Metrics")
            else if (($scope.DatastoreTablePrefix === "Metrics") ||
                ($scope.DatastoreTablePrefix === "Benthic") ||
                ($scope.DatastoreTablePrefix === "Drift")
            ) {
                console.log("Loading Habitat subprojects...");

                $scope.subprojectList = SubprojectService.getProjectSubprojects($scope.project.Id);
                var watcher = $scope.$watch('subprojectList.length', function () {
                    console.log("Inside watcher for subprojectList.length...");
                    // We wait until subprojects gets loaded and then turn this watch off.
                    if ($scope.subprojectList === null) {
                        console.log("$scope.subprojectList is null");
                        return;
                    }
                    else if (typeof $scope.subprojectList.length === 'undefined') {
                        console.log("$scope.subprojectList.length is undefined.");
                        return;
                    }
                    else if ($scope.subprojectList.length === 0) {
                        console.log("$scope.subprojectList.length is 0");
                        return;
                    }
                    console.log("$scope.subprojectList.length = " + $scope.subprojectList.length);
                    console.log("subprojects is loaded...");
                    console.dir($scope.subprojectList);

                    watcher();
                });

            }

            //check authorization -- need to have project loaded before we can check project-level auth
            if (!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project)) {
                $location.path("/unauthorized");
            }

            $scope.datasetLocationType = CommonService.getDatasetLocationType($scope.DatastoreTablePrefix);
            console.log("LocationType = " + $scope.datasetLocationType);

            //for (var i = 0; i < $scope.project.Locations.length; i++ )
            //{
            //console.log($scope.project.Locations[i].Id + "  " + $scope.project.Locations[i].Label);
            //if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType)
            //	if (($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType) || ($scope.project.Locations[i].LocationTypeId === LOCATION_TYPE_Hab))
            //	{
            //console.log("Found one");
            //		$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
            //console.log("datasetLocations length = " + $scope.datasetLocations.length);
            //locInd++;

            //		if ($scope.DatastoreTablePrefix === "FishScales")
            //		{
            //			console.log("Setting $scope.primaryDatasetLocation...");
            //			$scope.primaryDatasetLocation = $scope.project.Locations[i].Id;
            //		}
            //	}
            //}
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
                            console.log("Setting $scope.primaryDatasetLocation...");
                            $scope.primaryDatasetLocation = $scope.project.Locations[i].Id;
                        }
                    }

                    //{
                    //	//console.log("Found one");
                    //	$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
                    //	//console.log("datasetLocations length = " + $scope.datasetLocations.length);
                    //	//locInd++;
                    //}
                }
                console.log("datasetLocations is next...");
                console.dir($scope.datasetLocations);
                $scope.finishLocationProcessing();
            }

			/*
			// When we built the array, it started adding at location 1 for some reason, skipping 0.
			// Therefore, row 0 is blank.  The simple solution is to just delete row 0.
			//$scope.datasetLocations.shift();
			
			// During the original development, the blank row was always at row 0.  Months later, I noticed that 
			// the blank row was not at row 0.  Therefore, it needed a different solution.
			var index = 0;
			angular.forEach($scope.datasetLocations, function(dsLoc)
			{
				if (dsLoc.length === 0)
				{
					$scope.datasetLocations.splice(index, 1);
				}
				
				index++;
			});

			console.log("datasetLocations after splice is next...");
			console.dir($scope.datasetLocations);

			$scope.datasetLocations.sort(order2dArrayByAlpha);
			console.log("datasetLocations sorted...");
			console.dir($scope.datasetLocations);

			// Convert our 2D array into an array of objects.
			for (var i = 0; i < $scope.datasetLocations.length; i++)
			{
				$scope.sortedLocations.push({Id: $scope.datasetLocations[i][0], Label: $scope.datasetLocations[i][1]});
			}
			$scope.datasetLocations = [[]]; // Clean up
			
			
			// Convert our array of objects into a list of objects, and put it in the select box.
			$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.sortedLocations, 'Id','Label') ;

			console.log("locationOptions is next...");
			console.dir($scope.locationOptions);			
			
			// Original code.
			//$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ;  // Original code
			$scope.selectInstrument();
			*/
            console.log("$scope at end of watch project.Name is next...");
            //console.dir($scope);
        });

        $scope.$watch('dataSheetDataset', function () {
            if (!$scope.dataSheetDataset)
                return;

            //kick off the loading of relation data (we do this for UI performance rather than returning with the data...)
            angular.forEach($scope.dataSheetDataset, function (datarow) {
                angular.forEach($scope.gridFields, function (gridfield) {
                    datarow[gridfield.DbColumnName] = DatasetService.getRelationData(gridfield.FieldId, datarow.ActivityId, datarow.RowId);
                    console.log("kicking off loading of " + datarow.ActivityId + ' ' + datarow.RowId);
                })
            })

        });

        $scope.finishLocationProcessing = function () {
            console.log("Inside $scope.finishLocationProcessing...");
            // When we built the array, it started adding at location 1 for some reason, skipping 0.
            // Therefore, row 0 is blank.  The simple solution is to just delete row 0.
            //$scope.datasetLocations.shift();

            // During the original development, the blank row was always at row 0.  Months later, I noticed that 
            // the blank row was not at row 0.  Therefore, it needed a different solution.
            var index = 0;
            angular.forEach($scope.datasetLocations, function (dsLoc) {
                if (dsLoc.length === 0) {
                    $scope.datasetLocations.splice(index, 1);
                }

                index++;
            });

            console.log("datasetLocations after splice is next...");
            console.dir($scope.datasetLocations);

            //$scope.datasetLocations.sort(order2dArrayByAlpha);
            //console.log("datasetLocations sorted...");
            //console.dir($scope.datasetLocations);

            // Convert our 2D array into an array of objects.
            for (var i = 0; i < $scope.datasetLocations.length; i++) {
                $scope.sortedLocations.push({ Id: $scope.datasetLocations[i][0], Label: $scope.datasetLocations[i][1] });
            }
            $scope.datasetLocations = [[]]; // Clean up


            // Convert our array of objects into a list of objects, and put it in the select box.
            $scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.sortedLocations, 'Id', 'Label');

            console.log("locationOptions is next...");
            console.dir($scope.locationOptions);

            //if there is only one location, just set it to that location
            if (array_count($scope.locationOptions) == 1) {
                //there will only be one.
                angular.forEach(Object.keys($scope.locationOptions), function (key) {
                    console.log(key);
                    $scope.row['locationId'] = key;
                });

            }
        };

        $scope.clearSelections = function () {
            $scope.gridDatasheetOptions.selectAll(false);
        };

        $scope.setSelectedBulkQAStatus = function (rowQAId) {
            angular.forEach($scope.gridDatasheetOptions.selectedItems, function (item, key) {
                //console.dir(item);
                item.QAStatusId = rowQAId;

                //mark the row as updated so it will get saved.
                if ($scope.updatedRows.indexOf(item.Id) == -1) {
                    $scope.updatedRows.push(item.Id);
                }
            });

            $scope.clearSelections();
        };

        $scope.openBulkQAChange = function () {

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-rowqaupdate.html',
                controller: 'ModalBulkRowQAChangeCtrl',
                scope: $scope, //very important to pass the scope along...

            });

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

        $scope.getDataGrade = function (check) { return getDataGrade(check) }; //alias from service

        $scope.selectInstrument = function () {
            $scope.viewInstrument = getByField($scope.project.Instruments, $scope.row.InstrumentId, "Id");
            $scope.selectAccuracyCheck();
        };

        $scope.selectAccuracyCheck = function () {
            if ($scope.row.AccuracyCheckId)
                $scope.row.AccuracyCheck = getByField($scope.viewInstrument.AccuracyChecks, $scope.row.AccuracyCheckId, "Id");
        };

        $scope.cancel = function () {
            if ($scope.dataChanged) {
                if (!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
                    return;
            }

            $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        };

        //adds row to datasheet grid
        $scope.addNewRow = function () {
            var row = makeNewRow($scope.datasheetColDefs);
            row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataSheetDataset.push(row);
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

        // For Creel Survey only. 
        //Open form to add a fisherman to the database
        $scope.addFisherman = function () {
            $scope.viewFisherman = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
                controller: 'ModalCreateFishermanCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };
		
        $scope.postSaveFishermanUpdateGrid = function (new_fisherman) {
            $scope.fishermenList.push(new_fisherman); //the watch will take care of the rest?
        };

        // For Creel Survey only.
        // Adds another row to datasheet grid and copies common items (surveyor, date, etc.)
        $scope.addAnotherFish = function () {
            console.log("Inside addAnotherFish...");
            console.log("$scope before copy is next...");
            //console.dir($scope);

            var listLength = $scope.dataSheetDataset.length;
            var theFisherman = $scope.dataSheetDataset[listLength - 1].FishermanId
            var interviewTime = $scope.dataSheetDataset[listLength - 1].InterviewTime;
            var gpsEasting = $scope.dataSheetDataset[listLength - 1].GPSEasting;
            var gpsNorthing = $scope.dataSheetDataset[listLength - 1].GPSNorthing;
            var carcassComments = $scope.dataSheetDataset[listLength - 1].CarcassComments;
            var totalTimeFished = $scope.dataSheetDataset[listLength - 1].TotalTimeFished;
            var numberFishCaught = $scope.dataSheetDataset[listLength - 1].NumberFishCaught;
            var qaStatusId = $scope.dataSheetDataset[listLength - 1].QAStatusId;

            //var x = 0;
            //if (x !== 0)
            //{
            var row = makeNewRow($scope.datasheetColDefs);
            //row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
            //row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataSheetDataset.push(row);
            $scope.onRow = row;

            listLength = $scope.dataSheetDataset.length;
            $scope.dataSheetDataset[listLength - 1].FishermanId = theFisherman;
            $scope.dataSheetDataset[listLength - 1].InterviewTime = interviewTime;
            $scope.dataSheetDataset[listLength - 1].GPSEasting = gpsEasting;
            $scope.dataSheetDataset[listLength - 1].GPSNorthing = gpsNorthing;
            $scope.dataSheetDataset[listLength - 1].CarcassComments = carcassComments;
            $scope.dataSheetDataset[listLength - 1].TotalTimeFished = totalTimeFished;
            $scope.dataSheetDataset[listLength - 1].NumberFishCaught = numberFishCaught;
            $scope.dataSheetDataset[listLength - 1].QAStatusId = qaStatusId;

            for (var i = 0; i < $scope.datasheetColDefs.length; i++) {
                if (($scope.datasheetColDefs[i].field === "InterviewTime") ||
                    ($scope.datasheetColDefs[i].field === "GPSEasting") ||
                    ($scope.datasheetColDefs[i].field === "GPSNorthing") ||
                    ($scope.datasheetColDefs[i].field === "CarcassComments") ||
                    ($scope.datasheetColDefs[i].field === "TotalTimeFished")
                ) {
                    $scope.datasheetColDefs[i].enableCellEdit = false;

                }

            }

            //console.log("$scope after copy is next...");
            //console.dir($scope);

            //$scope.reloadProject();

			/*
			$scope.onRow.entity.InterviewTime = interviewTime;
			$scope.onRow.entity.GPSEasting = gpsEasting;
			$scope.onRow.entity.GPSNorthing = gpsNorthing;
			$scope.onRow.entity.CarcassComments = carcassComments;
			$scope.onRow.entity.TotalTimeFished = totalTimeFished;
			$scope.onRow.entity.NumberFishCaught = numberFishCaught;
			*/
            //}
        };
		
		$scope.addProjectLead = function() {
			console.log("+C clicked...");
			console.dir($scope);
			console.log("$scope.row.strProjectLead (before adding) = " + $scope.row.strProjectLead);	
			
			if (!$scope.row.ProjectLead)
				return;
			
			if (typeof $scope.row.strProjectLead === 'undefined')
				$scope.row.strProjectLead = "";				

			// We will add a new line at the end, so that the string presents well on the page.
			angular.forEach($scope.projectLeadList, function(staffMember){
				if (staffMember.Id.toString() === $scope.row.ProjectLead)
				{
					$scope.row.strProjectLead += staffMember.Fullname + ";\n";
				}
			});
			
			$scope.showProjectLeads = true;
			
			console.log("$scope.row.strProjectLead (after adding) = " + $scope.row.strProjectLead);		
		};
		
		$scope.removeProjectLead = function() {
			console.log("-C clicked...");
			console.dir($scope);
			//console.log("$scope.row.strProjectLead before stripping = " + $scope.row.strProjectLead);
			
			if (!$scope.row.ProjectLead)
				return;
			
			// First, strip out the new line characters.
			$scope.row.strProjectLead = $scope.row.strProjectLead.replace(/(\r\n|\r|\n)/gm, "");
			console.log("$scope.row.strProjectLead after stripping = " + $scope.row.strProjectLead);
			
			// Note, we still have the trailing semicolon.
			// Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
			var aryProjectLeads = $scope.row.strProjectLead.split(";");
			
			// Next, get rid of that trailing semicolon.
			aryProjectLeads.splice(-1, 1);
			console.dir(aryProjectLeads);
			
			//var staffMemberId = -1;
			var staffMemberFullname = "";
			angular.forEach($scope.projectLeadList, function(staffMember){
				//console.log("staffMember.Id = " + staffMember.Id + ", $scope.row.ProjectLead = " + $scope.row.ProjectLead);
				if (staffMember.Id === parseInt($scope.row.ProjectLead))
				{
					//console.log("Matched...");
					staffMemberFullname = staffMember.Fullname;
				}
			});
			console.log("We want to remove " + staffMemberFullname + " from the list...");
			
			// Now we can continue with the delete action.
			var aryProjectLeadsLength = aryProjectLeads.length;
			console.log("aryProjectLeadsLength = " + aryProjectLeadsLength);

			for (var i = 0; i < aryProjectLeadsLength; i++)
			{
				console.log("aryProjectLeads[i] = " + aryProjectLeads[i]);
				
				if (aryProjectLeads[i].indexOf(staffMemberFullname) > -1)
				{
					console.log("Found the item...");
					aryProjectLeads.splice(i,1);
					console.log("Removed the item.");
					
					$scope.row.strProjectLead = "";
					console.log("Wiped $scope.row.strProjectLeads...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryProjectLeads, function(item){
						$scope.row.strProjectLead += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryProjectLeadsLength;
				}
			}
			
			if (aryProjectLeadsLength === 0)
				$scope.showProjectLeads = false;
			
			//console.log("Finished.");
		};
     
        $scope.openWaypointFileModal = function (row, field) {
            $scope.file_field = field;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/file/templates/modal-waypoint-file.html',
                controller: 'WaypointFileModalCtrl',
                scope: $scope, //scope to make a child of
            });
        };


        //this function gets called when a user clicks the "Add" button in a GRID file cell ------------------------------<<<<<<<<<<<<<<<<< TODO
        $scope.addFiles = function (row, field_name) {
            //var field = $scope.FieldLookup[field_name];

            //console.dir(row);
            //console.dir(field);
            $scope.openFileModal(row.entity, field_name);

            console.log("<--------------------------------------- addFiles called for GRID file item ----------------");
            //console.dir($scope.updatedRows);
            //console.dir(row);
            //go ahead and mark this row as being updated.
            if ($scope.updatedRows && row.entity && row.entity.Id) {
                console.log("ok we have an id so we're pushing -- you must be editing...");
                $scope.updatedRows.push(row.entity.Id);
            }

        };
        
        
        //click "save" on dataset edit form
        $scope.saveData = function () {
            console.log("Saving edited data!");

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

        //was saveDatasheetData
        $scope.modalFile_saveParentItem = function (saveRow) {
            console.log("Inside modalFile_saveParentItem, $scope is next...");
            console.dir($scope);

            var strYear = null;
            var strMonth = null;
            var intMonth = -1;
            var strDay = null;

            /**** CreeSurvey Detail Date Time calculations Start ****/
            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                // Headers = row
                // Details = onRow

                // Notes relating to date/time, on the DataEdit...

                // Regarding the ActivityDate:
                // When the data comes in from the database, and the user updates something other than the ActivityDate,
                // ActivityDate is a string.  However, if the user were to change the ActivityDate, it is then a DateTime object.

                // Regarding the month:
                // The getmonth() function is zero-based, so Jan = 0, Feb = 1, etc.
                // When we pull the month below, we are expecting Jan = 1, Feb = 2, etc.
                // To get the date format we need, we must add 1 to the month.

                // Regarding the time:
                // When we enter the date in m/d/yyyy (or mm/dd/yyyy) format, the datepicker will leave the time at 00:00.
                // However, when we enter the date in yyyy-mm-dd format, the datepicker applies our timezone offset.
                // PST = -8, PDT = -7
                // Also, the conversion is based upon the ActivityDate you enter, NOT the current time of year.
                // For example, if the user is entering information in June (Daylight time), and the actual date is Feb (Standard time),
                // JavaScript will apply the Standard-time offset.
                // For our purposes, users should be able to enter the date in either m/d/yyyy or yyyy-mm-dd format, and experience
                // the same system behavior.  Therefore, we must allow for those formats in the code.
                console.log("$scope.row.activityDate = " + $scope.row.activityDate);

                //console.log("typeof $scope.row.activityDate = " + typeof $scope.row.activityDate);
                if (typeof $scope.row.activityDate === "string") {
                    console.log("$scope.row.activityDate is a string...");
                    //strYear = $scope.row.activityDate.getFullYear().toString();
                    strYear = $scope.row.activityDate.substr(0, 4);
                    console.log("strYear = " + strYear);

                    strMonth = $scope.row.activityDate.substr(5, 2);
                    console.log("strMonth = " + strMonth);
                    if (strMonth.length < 2)
                        strMonth = "0" + strMonth;

                    strDay = $scope.row.activityDate.substr(8, 2);
                    console.log("strDay = " + strDay);
                    if (strDay.length < 2)
                        strDay = "0" + strDay;

                    tmpTime = $scope.row.TimeStart;
                    console.log("tmpTime (TimeStart) = " + tmpTime);
                    $scope.row.TimeStart = "";
                    $scope.row.TimeStart = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
                    console.log("$scope.row.TimeStart = " + $scope.row.TimeStart);

                    tmpTime = $scope.row.TimeEnd;
                    console.log("tmpTime (TimeEnd) = " + tmpTime);
                    $scope.row.TimeEnd = "";
                    $scope.row.TimeEnd = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
                    console.log("$scope.row.TimeEnd = " + $scope.row.TimeEnd);
                }
                else // $scope.row.activityDate is a DateTime Object
                {
                    console.log("$scope.row.activityDate is a DateTime...");
                    var intHours = $scope.row.activityDate.getHours();
                    console.log("Hours = " + intHours)

                    if (intHours > 0) {
                        console.log("The user entered the date in a format that caused the time zone offset to be applied.");
                        var newDate = $scope.row.activityDate;

                        // The returned offset for the time zone is in minutes, so convert to hours.
                        var intOffsetHours = $scope.row.activityDate.getTimezoneOffset() / 60;

                        newDate.setHours(newDate.getHours() + intOffsetHours);
                        $scope.row.activityDate = newDate;
                    }
                    console.log("$scope.row.activityDate after adjustment = " + $scope.row.activityDate);

                    strYear = $scope.row.activityDate.getFullYear().toString();
                    console.log("strYear = " + strYear);

                    intMonth = $scope.row.activityDate.getMonth() + 1;
                    console.log("intMonth = " + intMonth);
                    strMonth = "" + intMonth;
                    console.log("strMonth = " + strMonth);
                    if (strMonth.length < 2)
                        strMonth = "0" + strMonth;

                    strDay = $scope.row.activityDate.getDate().toString();
                    console.log("strDay = " + strDay);
                    if (strDay.length < 2)
                        strDay = "0" + strDay;

                    tmpTime = $scope.row.TimeStart;
                    console.log("tmpTime (TimeStart) = " + tmpTime);
                    $scope.row.TimeStart = "";
                    $scope.row.TimeStart = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime;
                    console.log("$scope.row.TimeStart = " + $scope.row.TimeStart);

                    tmpTime = $scope.row.TimeEnd;
                    console.log("tmpTime (TimeEnd) = " + tmpTime);
                    $scope.row.TimeEnd = "";
                    $scope.row.TimeEnd = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime;
                    console.log("$scope.row.TimeEnd = " + $scope.row.TimeEnd);
                }
            }
            /**** CreeSurvey Detail Date Time calculations End ****/
			else if ($scope.DatastoreTablePrefix === "CrppContracts")
			{
				// For CRPP, the location is NOT on the form, so we add it here.
				$scope.row.locationId = $scope.project.Locations[0].Id;
				
				// First, strip out the new line characters.
				$scope.row.strProjectLead = $scope.row.strProjectLead.replace(/(\r\n|\r|\n)/gm, "");
				console.log("$scope.row.strProjectLeads after stripping = " + $scope.row.strProjectLeads);
				
				// Note, we still have the trailing semicolon.
				// Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
				var aryProjectLeads = $scope.row.strProjectLead.split(";");
				
				// Next, get rid of that trailing semicolon.
				aryProjectLeads.splice(-1, 1);
				console.dir(aryProjectLeads);
				
				// Match the names in aryProjectLeads to the one in $scope.projectLeadList, and retrieve the Id.
				var pLeadIdList = [];
				angular.forEach($scope.projectLeadList, function(pLeader){
					
					angular.forEach(aryProjectLeads, function(aLead){
						if (pLeader.Fullname === aLead)
						{
							console.log("Matched...");
							pLeadIdList.push(pLeader.Id);
						}
					});
				});
				console.log("pLeadIdList is next...");
				console.dir(pLeadIdList);
				
				// Convert the list to a string, in the format we want.
				var strProjLeads = "";
				angular.forEach(pLeadIdList, function(Id){
					strProjLeads += Id + ";";
				});
				console.log("strProjLeads = " + strProjLeads);
				
				$scope.row.ProjectLead = strProjLeads;
			}
            else if ($scope.DatastoreTablePrefix === "AdultWeir")
            {
                console.log("Saving AdultWeir...");
                var strDate = getDateFromDate($scope.row.activityDate);
                var strTime = "";
                $scope.dataSheetDataset.forEach(function (item) {
                    console.log("item is next...");
                    console.dir(item);
                    if ((typeof item.PassageTime !== 'undefined') && (item.PassageTime !== null)) {
                        console.log("item.PassageTime = " + item.PassageTime);
                        strTime = item.PassageTime;
                        console.log("strTime = " + strTime);

                        item.PassageTime = strDate + " " + strTime + ":00.000";
                    }
                });
            }
			
            //if ((typeof $scope.dataSheetDataset !== 'undefined') && ($scope.dataSheetDataset !== null)) {
                /*for (var i = 0; i < $scope.dataSheetDataset.length; i++) {
                    if ((typeof $scope.dataSheetDataset[i].TotalTimeFished !== 'undefined') && ($scope.dataSheetDataset[i].TotalTimeFished != null)) {
                        console.log("TotalTimeFished for row " + i + " = " + $scope.dataSheetDataset[i].TotalTimeFished);
                        var theHours = parseInt($scope.dataSheetDataset[i].TotalTimeFished.substring(0, 2));
                        console.log("theHours = " + theHours);
                        var theMinutes = parseInt($scope.dataSheetDataset[i].TotalTimeFished.substring(3, 5));
                        console.log("theMinutes = " + theMinutes);
                        var TotalTimeFished = theHours * 60 + theMinutes;
                        console.log("TotalTimeFished (in min) = " + TotalTimeFished);
                        $scope.dataSheetDataset[i].TotalTimeFished = TotalTimeFished;
                    }

                    if ((typeof $scope.dataSheetDataset[i].InterviewTime !== 'undefined') && ($scope.dataSheetDataset[i].InterviewTime != null)) {
                        var tmpTime = $scope.dataSheetDataset[i].InterviewTime;
                        //console.log("tmpTime (TimeEnd) = " + tmpTime);
                        $scope.dataSheetDataset[i].InterviewTime = "";
                        $scope.dataSheetDataset[i].InterviewTime = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
                    }
                }
				*/
            //}
			//console.log("$scope.dataSheetDataset is next...");
			//console.dir($scope.dataSheetDataset);
            
            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            if ($scope.DatastoreTablePrefix == "FishScales") {
                console.log("$scope.primaryDatasetLocation = " + $scope.primaryDatasetLocation);
                $scope.row.locationId = $scope.primaryDatasetLocation;
            }
            else
                console.log("Not working with FishScales...");

            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                console.log("$scope.row.Dry = " + $scope.row.Dry);
                if ((typeof $scope.row.Dry === 'undefined') || ($scope.row.Dry === null))
                    $scope.row.Dry = "NO";


            }
            console.log("$scope.row.Dry = " + $scope.row.Dry);
			console.log("$scope.row is next...");
			console.dir($scope.row);
			console.dir($scope.dataSheetDataset);
			console.log("$scope.deletedRows is next...");
			console.dir($scope.deletedRows);
			//throw "Stopping right here.";
			
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

			// Per this reference:  http://davidcai.github.io/blog/posts/copy-vs-extend-vs-merge/
			// Perhaps angular.extend is not how we want to add the deleted records back in. -- GC (revised as shown above).
            //$scope.activities = ActivityParser.parseSingleActivity($scope.row, angular.extend($scope.dataSheetDataset, $scope.deletedRows), $scope.fields);
            //$scope.activities = ActivityParser.parseSingleActivity($scope.row, angular.extend($scope.dataSheetDataset, $scope.deletedRows), $scope.fields, $scope.dataset.QAStatuses);
            //$scope.activities = ActivityParser.parseSingleActivity($scope.row, angular.extend(sheetCopy, $scope.deletedRows), $scope.fields, $scope.dataset.QAStatuses);
			
			// 4) Continue processing and send the full list (with the deleted items added back in).
            $scope.activities = ActivityParser.parseSingleActivity($scope.row, sheetCopy, $scope.fields, $scope.dataset.QAStatuses);

            if (!$scope.activities.errors) {
                if ($scope.addNewSection) {
                    console.log("$scope.addNewSection is true, so setting $scope.activities.addNewSection to true also.");
                    $scope.activities.addNewSection = true;
                }

                $scope.activities.deletedRowIds = $scope.getDeletedRowIds($scope.deletedRows);
                $scope.activities.updatedRowIds = $scope.updatedRows;

                console.log("$scope.activities in saveData, just before calling DatasetService.saveActivities is next...");
                //console.dir($scope.activities);
                DatasetService.updateActivities($scope.userId, $scope.dataset.Id, $scope.activities, $scope.DatastoreTablePrefix);
            }
            else {
                console.log("We have errors...");
                console.dir($scope.activities.errors);
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
    }
];
