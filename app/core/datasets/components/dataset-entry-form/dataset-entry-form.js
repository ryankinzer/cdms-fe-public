﻿// was DataEntryFormCtrl from DataEntryControllers
//Fieldsheet / form version of the dataentry page
var dataset_entry_form = ['$scope', '$routeParams',
    'DatasetService', 'SubprojectService', 'ProjectService', 'CommonService', '$modal', '$location', '$rootScope',
    'ActivityParser', 'DataSheet', '$route', 'FileUploadService', '$upload',
    function ($scope, $routeParams,
        DatasetService, SubprojectService, ProjectService, CommonService, $modal, $location, $rootScope,
        ActivityParser, DataSheet, $route, UploadService, $upload) {

        initEdit(); // stop backspace from ditching in the wrong place.

        $scope.userId = $rootScope.Profile.Id;
        $scope.fields = { header: [], detail: [], relation: [] };
        $scope.datasheetColDefs = [];

        $scope.filesToUpload = {};

        $scope.dataSheetDataset = [];
        // $scope.row = {ActivityQAStatus: {}, activityDate: new Date()}; //header field values get attached here by dbcolumnname

        $scope.datastoreLocations = CommonService.getLocations($routeParams.Id);
        //$scope.fishermenList = ProjectService.getFishermen();
        $scope.fishermenList = null;  // Set this to null first, so that we can monitor it later.
        $scope.subprojectList = null;  // Set this to null first, so that we can monitor it later.
        $scope.datasetLocations = [[]];
        $scope.datasetLocationType = 0;
        $scope.primaryDatasetLocation = 0;
        $scope.sortedLocations = [];
        $scope.errors = { heading: [] };
		$scope.activities = {};

        $scope.addNewSection = false; // This is a flag.  On Creel Survey, a user may add a new section, which saves the section, but the page remains on the activity.
        $scope.dataEntryPage = true;  // This is s flag, telling the app that we are on the Data Entry Page, to make the Add Section button show only on the Data Entry page.	

        $scope.foundDuplicate = false;
        $scope.showDetails = true;
        $scope.ShowFishermen = false;
        $scope.showDoneButton = true;

        //datasheet grid
        $scope.gridDatasheetOptions = {
            data: 'dataSheetDataset',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEdit: true,
            columnDefs: 'datasheetColDefs',
            enableColumnResize: true,

        };

        //config the fields for the datasheet - include mandatory location and activityDate fields
        //$scope.datasheetColDefs = DataSheet.getColDefs();
        DataSheet.initScope($scope);

        //fire up our dataset
        console.log("routeParams.Id = " + $routeParams.Id);
        $scope.dataset = DatasetService.getDataset($routeParams.Id);

        // Note:  Need to watch for the length below, because fishermanList itself does not change, even if it is updated.
        $scope.$watch('fishermenList.length', function () {

            //if (typeof $scope.fishermenList.$resolved === 'undefined')
            if (!$scope.fishermenList) {
                console.log("$scope.fishermenList has not loaded.");
                return;
            }
            else if ($scope.fishermenList.length === 0) {
                console.log("No fishermen found yet...");
                return;
            }
            console.log("Inside watch, fishermenList");

            console.log("$scope.fishermenList is next..");
            console.dir($scope.fishermenList);

            // If we switch the parameters for the makeObjects, like this makeObjects(scope.fishermenList, 'FullName', 'Id'), it will put them in alpha order by name.
            // However, we must test this first, to verify that it does not mess anything up.
            $scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.fishermenList, 'Id', 'FullName');

            // Debug output ... wanted to verify the contents of scope.fishermenOptions
            //angular.forEach($scope.fishermenOptions, function(fisherman){
            //	console.dir(fisherman);
            //});

            console.log("$scope.fishermenOptions is next...");
            console.dir($scope.fishermenOptions);
        });

        //setup a listener to populate column headers on the grid
        $scope.$watch('dataset.Fields', function () {

            if (!$scope.dataset.Fields) return;

            console.log("Inside watcher for dataset.Fields.");

            //$rootScope.datasetId = $scope.dataset.Id;
            $rootScope.datasetId = $scope.datasetId = $scope.dataset.Id;
            console.log("$rootScope.datasetId = " + $rootScope.datasetId);
            $scope.dataset.Files = DatasetService.getDatasetFiles($scope.dataset.Id); // This will be used for checking for duplicate files, in the dataset files.

            $scope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            $scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix, "form");  // Pass the TablePrefix (name of the dataset), because it will never change.

            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                console.log("Loading Harvest...");
                $scope.ShowFishermen = true;
                $scope.fishermenList = ProjectService.getFishermen(); // Get all fishermen.
                $scope.theFishermen = ProjectService.getProjectFishermen($scope.dataset.ProjectId); // Get just the fishermen for this project.
            }
            else if ($scope.DatastoreTablePrefix === "CrppContracts") {
                console.log("Loading CRPP subprojects...");
                $scope.ShowSubproject = true;
                $scope.subprojectList = SubprojectService.getSubprojects();
            }
            else if ($scope.DatastoreTablePrefix === "Appraisal") {
                console.log("Loading DECD ...");
                $scope.showDoneButton = false;
            }

            //load our project based on the projectid we get back from the dataset
            $scope.project = ProjectService.getProject($scope.dataset.ProjectId); // We will wait until this loads, before doing anything more with it.  See $scope.$watch('project.Name...

            if ($scope.DatastoreTablePrefix === "CreelSurvey" ||
                $scope.DatastoreTablePrefix === "SpawningGroundSurvey"
            )
                $scope.row = { ActivityQAStatus: {} }; //header field values get attached here by dbcolumnname; leave activityDate blank for CreelSurvey.								
            else
                $scope.row = { ActivityQAStatus: {}, activityDate: new Date() }; //header field values get attached here by dbcolumnname

            console.log("($scope.dataset.QAStatuses is next...");
            console.dir($scope.dataset.QAStatuses);
            $scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');

            //iterate the fields of our dataset and populate our grid columns
            // Note:  If the OrderBy column of EITHER records that are being compared DOES NOT have a "real" value (not NULL or blank, etc.),
            // the sort process in services.js will use the FieldRoleId column instead.
            // This may be an all or none situation (all must have an OrderBy value), because if only some have the value set,
            // then the order is jumbled on the web page.  When the OrderBy is set for all, they all show in the proper order on the page.
            angular.forEach($scope.dataset.Fields.sort(orderByIndex), function (field) {

                parseField(field, $scope);

                if (field.FieldRoleId == FIELD_ROLE_HEADER) {
                    $scope.fields.header.push(field);
                }
                else if (field.FieldRoleId == FIELD_ROLE_DETAIL) {
                    //console.log("Adding to details:  " + field.DbColumnName + ", " + field.Label);
                    $scope.fields.detail.push(field);
                    $scope.datasheetColDefs.push(makeFieldColDef(field, $scope));

                    //a convention:  if your dataset has a ReadingDateTime field then we enable timezones for an activity.
                    if (field.DbColumnName == "ReadingDateTime") {
						/* Note:  The first line below allows the system to automatically determine what timezone we are in, based upon the current date.
							Initially this seemed like a good idea.  However, while the WaterTemp folks collect their data during the Daylight Savings
							timezone, they upload their data during the Standard timezone.  When the system requires them to remember to change the timezone,
							for all their imports from Standard to Daylight Savings, it can cause a headache, if they forget to make the change.
							Therefore, we decided instead to default the timezone to Daylight Savings, and have them change it to Standard if they must.
							Changing to Standard is a less occurring event than changing from Standard to Daylight Savings.
						*/
                        //$scope.row.Timezone = getByField($scope.SystemTimezones, new Date().getTimezoneOffset() * -60000, "TimezoneOffset"); //set default timezone
                        $scope.row.Timezone = getByField($scope.SystemTimezones, 420 * -60000, "TimezoneOffset"); //set default timezone to Daylight Savings
                    }
                }
            });

            //now everything is populated and we can do any post-processing.
            if ($scope.datasheetColDefs.length > 2) {
                $scope.addNewRow();
            }

            //set defaults for header fields
            angular.forEach($scope.fields.header, function (field) {
                $scope.row[field.DbColumnName] = (field.DefaultValue) ? field.DefaultValue : null;

                //FEATURE: any incoming parameter value that matches a header will get copied into that header value.
                if ($routeParams[field.DbColumnName]) {
                    $scope.row[field.DbColumnName] = $routeParams[field.DbColumnName];
                }

            });

            $scope.row.ActivityQAStatus.QAStatusId = "" + $scope.dataset.DefaultActivityQAStatusId;

            $scope.recalculateGridWidth($scope.fields.detail.length);

            $scope.validateGrid($scope);

            console.log("headerFieldErrors is next...");
            console.dir($scope.headerFieldErrors);
            console.log("headerFieldErrors.length = " + $scope.headerFieldErrors.length);

            console.log("$scope at end of dataset.Fields watcher...");
            //console.dir($scope);
        });

        //update our location options as soon as our project is loaded.
        // The project gets called/loaded in $scope.$watch('dataset.Fields' (above), so $scope.DatastoreTablePrefix was set there.
        $scope.$watch('project.Name', function () {
			// Note:  If we check for the project name without typeof, it throws an error in the debugger, stating that Name is undefined. 
			// Yes, it does stop the code in its tracks (like the return), but the typeof handles the issue gracefully.
			//if(!$scope.project.Name) return;
			if ((typeof $scope.project === 'undefined') || ($scope.project === null))
				return;
			else if ((typeof $scope.project.Name === 'undefined') || ($scope.project.Name === null))
				return;

            console.log("Inside watch project.Name...");
            //console.log("$scope.project is next...");
            //console.dir($scope.project);

            $rootScope.projectId = $scope.project.Id;
            $scope.project.Files = null;
            $scope.project.Files = ProjectService.getProjectFiles($scope.project.Id); // This is used to check for a duplicate file.

            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            $scope.datasetLocationType = CommonService.getDatasetLocationType($scope.DatastoreTablePrefix);
            console.log("LocationType = " + $scope.datasetLocationType);

            $scope.subprojectType = ProjectService.getProjectType($scope.project.Id);
            console.log("$scope.subprojectType = " + $scope.subprojectType);
            SubprojectService.setServiceSubprojectType($scope.subprojectType);

            //if ($scope.subprojectType === "Harvest")
            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                console.log("Loading Harvest...");
                $scope.ShowFishermen = true;
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

                    //if ($scope.DatastoreTablePrefix === "Metrics")
                    if (($scope.DatastoreTablePrefix === "Metrics") ||
                        ($scope.DatastoreTablePrefix === "Benthic") ||
                        ($scope.DatastoreTablePrefix === "Drift")
                    ) {
                        console.log("$scope.subprojectList is next...");
                        console.dir($scope.subprojectList);
                        console.log("$scope.project.Locations is next...");
                        console.dir($scope.project.Locations);

                        $scope.datasetLocations = [[]]; // Dump the locations, before refilling them.
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

                    console.log("$scope.subprojectList.length = " + $scope.subprojectList.length);
                    console.dir($scope.subprojectList);

                    $scope.selectProjectLocationsByLocationType();

                    watcher();
                });
            }
            //else if ($scope.subprojectType === "DECD")
            else if ($scope.DatastoreTablePrefix === "Appraisal") {
                $scope.showDoneButton = false;
            }

            if (($scope.DatastoreTablePrefix !== "Metrics") &&
                ($scope.DatastoreTablePrefix !== "Benthic") &&
                ($scope.DatastoreTablePrefix !== "Drift")
            ) {
                $scope.selectProjectLocationsByLocationType();
            }

            //check authorization -- need to have project loaded before we can check project-level auth
            if (!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project)) {
                $location.path("/unauthorized");
            }

            //if ?LocationId=123 is passed in then lets set it to the given LocationId
            if ($routeParams.LocationId) {
                $scope.row['locationId'] = "" + $routeParams.LocationId;
            }

            console.log("$scope at end of watch project.Name is next...");
            //console.dir($scope);
        });
		
		$scope.$watch('duplicateEntry', function(){
			console.log("Inside watch duplicateEntry...");
			//console.log("typeof $scope.duplicateEntry = " + $scope.duplicateEntry);
			console.log("$scope.duplicateEntry = " + $scope.duplicateEntry);
			console.log("$scope.saving = " + $scope.saving);
			if ((typeof $scope.duplicateEntry === 'undefined') || ($scope.duplicateEntry === null))
				return;
			else if ($scope.duplicateEntry)
				return;
			else if ($scope.saving)
				$scope.continueSaving();
			else
			{
				// Do nothing.
			}
		});

        $scope.selectProjectLocationsByLocationType = function () {
            console.log("Inside selectProjectLocationsByLocationType...");

            if ($scope.project.Locations) {
                console.log("ProjectLocations is next...");
                console.dir($scope.project.Locations);

                for (var i = 0; i < $scope.project.Locations.length; i++) {
                    //console.log("i = " + i);
                    //console.log($scope.project.Locations[i].Id + "  " + $scope.project.Locations[i].Label);
                    //console.log("$scope.project.Locations[i].LocationTypeId = " + $scope.project.Locations[i].LocationTypeId + ", $scope.datasetLocationType = " + $scope.datasetLocationType);
                    //if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType)
                    //if (parseInt($scope.project.Locations[i].LocationTypeId) === parseInt($scope.datasetLocationType))
                    //{
                    //console.log("Found one");
                    // If the label is blank, this item is the Primary Project Location, and the label is null.
                    //	if ((typeof $scope.project.Locations[i].Label !== 'undefined') && ($scope.project.Locations[i].Label != null))
                    //	{
                    //		console.log("$scope.project.Locations[i].Id = " + $scope.project.Locations[i].Id + ", $scope.project.Locations[i].Label = " + $scope.project.Locations[i].Label);

                    // Note:  We are pushing an ARRAY into $scope.datasetLocations, NOT separate items.
                    //		$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]); 									

                    //		console.log("$scope.datasetLocations (inside the loop) is next");
                    //		console.dir($scope.datasetLocations);

                    //		if ($scope.DatastoreTablePrefix === "FishScales")
                    //		{
                    //			console.log("Setting $scope.primaryDatasetLocation...");
                    //			$scope.primaryDatasetLocation = $scope.project.Locations[i].Id;
                    //		}
                    //	}
                    //}

                    console.log("$scope.project.Locations[i].LocationTypeId = " + $scope.project.Locations[i].LocationTypeId + ", $scope.datasetLocationType = " + $scope.datasetLocationType);
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
                }
                console.log("datasetLocations (only project/dataset) is next...");
                console.dir($scope.datasetLocations);

                $scope.finishLocationProcessing();
            }
        };

        $scope.finishLocationProcessing = function () {
            console.log("Inside $scope.finishLocationProcessing...");
            // When we built the array, it started adding at location 1 for some reason, skipping 0.
            // Therefore, row 0 is blank.  The simple solution is to just delete row 0.
            //$scope.datasetLocations.shift();

            // During the original development, the blank row was always at row 0.  Months later, I noticed that 
            // the blank row was not at row 0.  Therefore, it needed a different solution.
            var index = 0;
            //console.log("$scope.datasetLocations (before splice) is next...");
            //console.dir($scope.datasetLocations);
            angular.forEach($scope.datasetLocations, function (dsLoc) {
                //if (dsLoc.length === 0)
                //{
                //	$scope.datasetLocations.splice(index, 1);
                //}
                if (typeof dsLoc[0] === 'undefined')
                    $scope.datasetLocations.splice(index, 1);

                index++;
            });

            console.log("datasetLocations after splice is next...");
            console.dir($scope.datasetLocations);

            // When we feed these locations to makeObjects, Angular sorts them in Id order.  Therefore, this is currently wasted activity.
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

        $scope.createInstrument = function () {
            $scope.viewInstrument = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
                controller: 'ModalCreateInstrumentCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };

        $scope.getDataGrade = function (check) { return getDataGrade(check) }; //alias from service

        $scope.selectInstrument = function () {
            if (!$scope.row.InstrumentId)
                return;

            //get latest accuracy check
            $scope.viewInstrument = getByField($scope.project.Instruments, $scope.row.InstrumentId, "Id");
            $scope.row.LastAccuracyCheck = $scope.viewInstrument.AccuracyChecks[$scope.viewInstrument.AccuracyChecks.length - 1];
            $scope.row.DataGradeText = getDataGrade($scope.row.LastAccuracyCheck);

            if ($scope.row.LastAccuracyCheck)
                $scope.row.AccuracyCheckId = $scope.row.LastAccuracyCheck.Id;
			
			$scope.activities.errors = undefined;
			$scope.removeRowErrorsBeforeRecheck();
			$scope.checkForDuplicates();
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
            $scope.onRow = row;
        };

        // For Creel Survey only. 
        $scope.addSection = function () {
            console.log("Inside addSection...");
            console.log("$scope in addSection is next...");
            //console.dir($scope);

            $scope.addNewSection = true;
            console.log("$scope.addNewSection = " + $scope.addNewSection);
            $scope.saveData();  // Save what we have, before blanking fields.

            $scope.addNewSectionWatcherCount = 0;
            var addNewSectionWatcher = $scope.$watch('activities.addNewSection', function () {
                console.log("Inside watcher addNewSection...");
                console.log("$scope.activities.addNewSection = " + $scope.activities.addNewSection);
                if ((typeof $scope.activities.addNewSection !== 'undefined') && ($scope.activities.addNewSection === false)) {
                    if ($scope.addNewSectionWatcherCount === 0) {
                        console.log("Resetting the page.")
                        // Reset the content of specific fields, to blank, null, or 0.
                        $scope.row.locationId = 59; // Blank
                        $scope.row.TimeStart = null;
                        $scope.row.TimeEnd = null;
                        $scope.row.NumberAnglersObserved = 0;
                        $scope.row.NumberAnglersInterviewed = 0;
                        $scope.row.SurveyComments = null;
                        $scope.row.FieldSheetFile = null;

                        // Dump the contents of the datasheet and add the new row.
                        $scope.dataSheetDataset = [];
                        $scope.addNewRow();
                        $scope.addNewSection = false;

                        // This pops the Save Success modal after Add Section.
                        var modalInstance = $modal.open({
                            templateUrl: 'app/core/common/components/modals/templates/modal-save-success.html',
                            controller: 'ModalSaveSuccess',
                            scope: $scope, //very important to pass the scope along...
                        });
                        $scope.addNewSectionWatcherCount++;
                    }
                }
            });

            console.log("At end of addNewSection; $scope is next...");
            //console.dir($scope);
        };

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
            var interviewComments = $scope.dataSheetDataset[listLength - 1].InterviewComments;
            var totalTimeFished = $scope.dataSheetDataset[listLength - 1].TotalTimeFished;
            var numberFishCaught = $scope.dataSheetDataset[listLength - 1].NumberFishCaught;
            //var qaStatusId = $scope.dataSheetDataset[listLength-1].QAStatusId;

            //var x = 0;
            //if (x !== 0)
            //{
            var row = makeNewRow($scope.datasheetColDefs);
            row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
            //row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataSheetDataset.push(row);
            $scope.onRow = row;

            listLength = $scope.dataSheetDataset.length;
            $scope.dataSheetDataset[listLength - 1].FishermanId = theFisherman;
            $scope.dataSheetDataset[listLength - 1].InterviewTime = interviewTime;
            $scope.dataSheetDataset[listLength - 1].GPSEasting = gpsEasting;
            $scope.dataSheetDataset[listLength - 1].GPSNorthing = gpsNorthing;
            $scope.dataSheetDataset[listLength - 1].InterviewComments = interviewComments;
            $scope.dataSheetDataset[listLength - 1].TotalTimeFished = totalTimeFished;
            $scope.dataSheetDataset[listLength - 1].NumberFishCaught = numberFishCaught;
            //$scope.dataSheetDataset[listLength-1].QAStatusId = qaStatusId;

            for (var i = 0; i < $scope.datasheetColDefs.length; i++) {
                if (($scope.datasheetColDefs[i].field === "InterviewTime") ||
                    ($scope.datasheetColDefs[i].field === "GPSEasting") ||
                    ($scope.datasheetColDefs[i].field === "GPSNorthing") ||
                    ($scope.datasheetColDefs[i].field === "InterviewComments") ||
                    ($scope.datasheetColDefs[i].field === "TotalTimeFished")
                ) {
                    $scope.datasheetColDefs[i].enableCellEdit = false;
                    //$scope.datasheetColDefs[i].cellEditableCondition = false;
                    //$scope.disabledFont();
                }

            }

            console.log("$scope after copy is next...");
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

        //overriding the one in our service because we don't want to allow removing of a blank row.
        $scope.removeRow = function () {
            if ($scope.dataSheetDataset.length > 1)
                DataSheet.removeOnRow($scope);
        };


        $scope.doneButton = function () {
            $scope.activities = undefined;
            $route.reload();
            $scope.reloadProject();
            //DataSheet.initScope($scope);  // Is this needed at all?
        }

        $scope.viewButton = function () {
            $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        }

        $scope.viewRelation = function (row, field_name) {
            console.dir(row.entity);
            var field = $scope.FieldLookup[field_name];
            console.dir(field);

            $scope.openRelationEditGridModal(row.entity, field);
        }


        $scope.openRelationEditGridModal = function (row, field) {
            $scope.relationgrid_row = row;
            $scope.relationgrid_field = field;
            $scope.isEditable = true;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-relationgrid/templates/relationgrid-edit-modal.html',
                controller: 'RelationGridModalCtrl',
                scope: $scope,
            });
        };

        /* -- these functions are for uploading - */
        $scope.openFileModal = function (row, field) {
            console.log("Inside DataEntryFormCtrl, openFileModal");
            //console.dir(row);
            //console.dir(field);
            $scope.file_row = row;
            $scope.file_field = field;
            $rootScope.FieldSheetFile = "";

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/file/templates/modal-file.html',
                controller: 'FileModalCtrl',
                scope: $scope, //scope to make a child of
            });
        };

        $scope.openFileAddModal = function (row, field) {
            console.log("Inside DataEditCtrl, openFileAddModal...");
            console.log("row is next...");
            console.dir(row);
            console.log("field is next...");
            console.dir(field);
            $scope.file_row = row;
            $scope.file_field = field;

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/file/templates/modal-file-add.html',
                controller: 'FileAddModalCtrl',
                scope: $scope, //scope to make a child of
            });
        };

        $scope.openFileDeleteModal = function (row, field) {
            console.log("Inside DataEditCtrl, openFileDeleteModal...");
            console.log("row is next...");
            console.dir(row);
            console.log("field is next...");
            console.dir(field);
            $scope.file_row = row;
            $scope.file_field = field;

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/file/templates/modal-file-delete.html',
                controller: 'FileDeleteModalCtrl',
                scope: $scope, //scope to make a child of
            });
        };

        $scope.openWaypointFileModal = function (row, field) {
            $scope.file_row = row;
            $scope.file_field = field;

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/file/templates/modal-waypoint-file.html',
                controller: 'FileModalCtrl',
                scope: $scope, //scope to make a child of
            });
        };

        //field = DbColumnName
        $scope.onFileSelect = function (field, files) {
            console.log("Inside DataEntryFormCtrl, onFileSelect");
            console.log("file selected! " + field);
            $scope.filesToUpload[field] = files;
        };

        //this function gets called when a user clicks the "Add" button in a GRID file cell
        $scope.addFiles = function (row, field_name) {
            var field = $scope.FieldLookup[field_name];

            //console.dir(row);
            //console.dir(field);
            $scope.openFileModal(row.entity, field);

            //go ahead and mark this row as being updated.
            if ($scope.updatedRows)
                $scope.updatedRows.push(row.entity.Id);

        };

        $scope.saveData = function () {
            console.log("Inside saveData, $scope is next...");
            console.dir($scope);
            console.log("$rootScope is next...");
            console.dir($rootScope);
			$scope.duplicateEntry = undefined;
			$scope.saving = true;
			
			$scope.checkForDuplicates();
        };
		
		$scope.continueSaving = function(){
			//console.log("Inside $scope.continueSaving...");
			
            /**** CreeSurvey Header Time Time calculations Start ****/
            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                // Headers = row
                // Details = onRow

                // Notes relating to date/time...
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
                console.log("$scope.row.activityDate before adjustment = " + $scope.row.activityDate);
                console.log("Offset = " + $scope.row.activityDate.getTimezoneOffset());

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

                var strYear = $scope.row.activityDate.getFullYear().toString();
                console.log("strYear = " + strYear);

                var intMonth = $scope.row.activityDate.getMonth() + 1;
                console.log("intMonth = " + intMonth);
                var strMonth = "" + intMonth;
                console.log("strMonth = " + strMonth);
                if (strMonth.length < 2)
                    strMonth = "0" + strMonth;

                var strDay = $scope.row.activityDate.getDate().toString();
                console.log("strDay = " + strDay);
                if (strDay.length < 2)
                    strDay = "0" + strDay;

                var tmpTime = $scope.row.TimeStart;
                console.log("tmpTime (TimeStart) = " + tmpTime);
                if (tmpTime !== null) {
                    $scope.row.TimeStart = "";
                    $scope.row.TimeStart = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
                    console.log("$scope.row.TimeStart = " + $scope.row.TimeStart);
                }

                tmpTime = $scope.row.TimeEnd;
                console.log("tmpTime (TimeEnd) = " + tmpTime);
                if (tmpTime !== null) {
                    $scope.row.TimeEnd = "";
                    $scope.row.TimeEnd = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
                    console.log("$scope.row.TimeEnd = " + $scope.row.TimeEnd);
                }
            }
            /**** CreeSurvey Header Time Time calculations End ****/

            // Orignal line.  
            //var promise = UploadService.uploadFiles($scope.filesToUpload, $scope);
			/* Notes:  In the line above, the returned promise is an array.  IE does not handle a promise like that.
			*  According to online documentation, IE does not handle promise at all.  However, my experience has shown the following.
			*  IE cannot handle a promise array (as noted).
			*  IE cannot handle nested promises either.
			*  IE CAN handle a single promise.
			*  So, we have to check for duplicate file names in a different way.
			*  In this method (not necessarily the best way), we do the checking here, rather than calling FileUploadService.uploadFiles in services.js.
			*/

            // Firstly, if the user does not attach a file (such was with WaterTemp), we can skip checking for a duplicate file name.
            // WaterTemp is more concerned about imputting duplicate data.  The user may often use the same file, but a different tab.
            // For other datasets (Creel), they do have the concern about uploading a duplicate file.


            // We need to check for duplicate file names first.
            if ($scope.foundDuplicate) {
                alert("One or more of the files to upload is a duplicate!");
                return;
            }

            // In modals-controller, FileModalCtrl, the file gets stored in $rootScope.FieldSheetFile.
            // The bucket for the file can change names, depending upon the dataset.
            console.log("$rootScope.FieldSheetFile is next...");
            console.dir($rootScope.FieldSheetFile);
            $scope.filesToUpload.FieldSheetFile = $rootScope.FieldSheetFile;

			console.log("$scope.activities.errors is next...");
			console.dir($scope.activities.errors);
			//if ($scope.activities.errors === {})
			//	console.log("Empty object...");
			//else
			//	console.log("Something else...");
			
			//console.log("$scope.activities.errors.saveError.length = " + $scope.activities.errors.saveError.length);
			if (!$scope.activities.errors)
			//if ($scope.isObjectEmpty($scope.activities.errors))
			//if (isObjectEmpty($scope.activities.errors))
			{
				console.log("No errors yet...");
				if ($scope.filesToUpload.FieldSheetFile) {
					//for(var i = 0; i < $scope.filesToUpload.FieldSheetFile.length; i++)
					//for(var i = 0; i < $scope.filesToUpload.length; i++)
					for (var i = 0; i < $rootScope.currentFiles.length; i++) {
						//var file = $scope.filesToUpload.FieldSheetFile[i];
						var file = $scope.currentFiles[i];
						console.log("file is next...");
						console.dir(file);

						var newFileNameLength = file.name.length;
						console.log("file name length = " + newFileNameLength);

						console.log("file.type = " + file.type);
						if ($scope.uploadFileType === "image") {
							console.log("We have an image...");
							for (var n = 0; n < $scope.project.Images.length; n++) {
								var existingFileName = $scope.project.Images[n].Name;
								console.log("existingFileName = " + existingFileName);
								var existingFileNameLength = existingFileName.length;
								if ((newFileNameLength >= existingFileNameLength) && (file.name.indexOf(existingFileName) > -1)) {
									$scope.foundDuplicate = true;
									console.log(file.name + " already exists in the project file list.");
									errors.push(file.name + " already exists in the list of project images.");
								}
							}
						}
						else {
							console.log("We have something other than an image...");
							for (var n = 0; n < $scope.project.Files.length; n++) {
								var existingFileName = $scope.project.Files[n].Name;
								console.log("existingFileName = " + existingFileName);
								var existingFileNameLength = existingFileName.length;
								if ((newFileNameLength >= existingFileNameLength) && (file.name.indexOf(existingFileName) > -1)) {
									$scope.foundDuplicate = true;
									console.log(file.name + " already exists in the project file list.");
									errors.push(file.name + " already exists in the list of project Files.");
								}
							}
						}

						console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);

						if ($scope.foundDuplicate)
							alert(errors);
						else {
							console.log("Not a duplicate.  Uploading the file...");
							if (file.success != "Success") {
								$scope.upload = $upload.upload({
									//url: serviceUrl + '/data/UploadProjectFile',
									url: serviceUrl + '/api/v1/file/uploaddatasetfile',
									method: "POST",
									// headers: {'headerKey': 'headerValue'},
									// withCredential: true,
									//data: {ProjectId: $scope.project.Id, Description: "Uploaded file " + file.Name, Title: file.Name},
									data: { ProjectId: $scope.project.Id, DatasetId: $scope.dataset.Id, Description: "Uploaded file " + file.Name, Title: file.Name },
									file: file,

								}).progress(function (evt) {
									console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
								}).success(function (data, status, headers, config) {
									config.file.success = "Success";
								}).error(function (data, status, headers, config) {
									$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
									//console.log(file.name + " was error.");
									config.file.success = "Failed";
								});
							}
						}
					}

					//spin through the files that we uploaded
					//angular.forEach($scope.filesToUpload, function(files, field){
					angular.forEach($scope.currentFiles, function (files, field) {

						if (field == "null" || field == "")
							return;

						var local_files = [];

						//if we already had actual files in this field, copy them in
						if ($scope.file_row[field]) {
							var current_files = angular.fromJson($scope.file_row[field]);
							angular.forEach(current_files, function (file) {
								if (file.Id) //our incoming files don't have an id, just actual files.
									local_files.push(file);
							});
						}

						$scope.file_row[field] = angular.toJson(local_files);
						//console.log("Ok our new list of files: "+$scope.row[field]);
					});

					$scope.saveDatasheetData();
				}
				else {
					$scope.saveDatasheetData();
				}
			}
		};

        $scope.saveDatasheetData = function () {
            console.log("Inside saveDatasheetData, $scope is next...");
            //console.dir($scope);

            var strYear = null;
            var strMonth = null;
            var strDay = null;
            var tmpTime = null;

            /**** CreeSurvey Detail Time Time calculations Start ****/
            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                strYear = $scope.row.activityDate.getFullYear().toString();
                console.log("strYear = " + strYear);

                strMonth = $scope.row.activityDate.getMonth().toString();
                console.log("strMonth = " + strMonth);
                if (strMonth.length < 2)
                    strMonth = "0" + strMonth;

                strDay = $scope.row.activityDate.getDate().toString();
                console.log("strDay = " + strDay);
                if (strDay.length < 2)
                    strDay = "0" + strDay;


                for (var i = 0; i < $scope.dataSheetDataset.length; i++) {
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

                    if ((typeof $scope.dataSheetDataset[i].InterviewTime !== 'undefined') && ($scope.dataSheetDataset[i].InterviewTime !== null)) {
                        tmpTime = $scope.dataSheetDataset[i].InterviewTime;
                        //console.log("tmpTime (TimeEnd) = " + tmpTime);
                        $scope.dataSheetDataset[i].InterviewTime = "";
                        $scope.dataSheetDataset[i].InterviewTime = strYear + "-" + strMonth + "-" + strDay + "T" + tmpTime + ":00.000";
                    }
                }
            }
            /**** CreeSurvey Detail Time Time calculations End ****/



            var sheetCopy = angular.copy($scope.dataSheetDataset);
            console.log("The following items are next: $scope.row, sheetCopy, $scope.fields");
            console.dir($scope.row);
            console.dir(sheetCopy);
            console.dir($scope.fields);
            //throw "Stopping right here...";

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

            //$scope.activities = ActivityParser.parseSingleActivity($scope.row, sheetCopy, $scope.fields);
            $scope.activities = ActivityParser.parseSingleActivity($scope.row, sheetCopy, $scope.fields, $scope.dataset.QAStatuses);
            if (!$scope.activities.errors) {
                if ($scope.addNewSection) {
                    console.log("$scope.addNewSection is true, so setting $scope.activities.addNewSection to true also.");
                    $scope.activities.addNewSection = true;
                }
                console.log("$scope.activities in saveData, just before calling DatasetService.saveActivities is next...");
                console.dir($scope.activities);
                DatasetService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
				$scope.saving = false;
            }
            else {
                console.log("We have errors...");
                console.dir($scope.activities.errors);
            }
        };
		
		$scope.checkForDuplicates = function(){
			console.log("Inside $scope.checkForDuplicates...");
			console.log("$scope is next...");
			console.dir($scope);
			
			var dtIsoFormat = "";
			var strActivityLocationList = "";
			var strInstrumentIdList = "";
			var count = 0;
			
			if ($scope.DatastoreTablePrefix === "WaterTemp")
			{	
				var strReadingDateTimeList = "";
				strActivityLocationList = $scope.row.locationId;
				console.log("typeof strActivityLocationList = " + typeof strActivityLocationList + ", strActivityLocationList = " + strActivityLocationList);
				strInstrumentIdList = $scope.row.InstrumentId;
				console.log("typeof strInstrumentIdList = " + typeof strInstrumentIdList + ", strInstrumentIdList = " + strInstrumentIdList);
				
				// As users work their way down the form, changing the location, or the instrument will
				// trigger this function, even if they have NOT entered a ReadingDateTime yet.
				// We must wait until we have the location, instrument, and ReadingDateTime, before we proceed.
				if ((typeof strActivityLocationList === 'undefined') || (strInstrumentIdList === null)) return;
				
				count = 0;
				var keepGoing = true;
				angular.forEach($scope.dataSheetDataset, function(item){
					console.log("item is next...");
					console.dir(item);
					
					// If the user has not entered a ReadingDateTime yet, then we DO NOT have the necessary data to continue yet.
					if ((typeof item.ReadingDateTime !== 'undefined') && (item.ReadingDateTime !== null))
					{
						//var strIsoDateTime = null;
						//var strIsoTime = moment(item.ReadingDateTime).format("YYYY-MM-DD").toString();
						var strIsoDateTime = strIsoDateTime = formatDateFromFriendlyToUtc(item.ReadingDateTime);
						
						console.log("strIsoDateTime = " + strIsoDateTime);
						
						if (count === 0)
						{
							strReadingDateTimeList = strIsoDateTime;
						}
						else
						{
							strReadingDateTimeList += "," + strIsoDateTime; // Note the leading comma.
						}
						count++;
					}
					else
						keepGoing = false;
				});
				if (!keepGoing)
					return;
				
				console.log("strReadingDateTimeList (with dupes) = " + strReadingDateTimeList);
				console.log("typeof strReadingDateTimeList = " + typeof strReadingDateTimeList);
				
				var aryReadingDateTimeList = strReadingDateTimeList.split(",");
				strReadingDateTimeList = uniq_fast(aryReadingDateTimeList);
				console.log("strReadingDateTimeList (without dupes) = " + strReadingDateTimeList);
				
				console.log("strActivityLocationList (with dupes) = " + strActivityLocationList);
				console.log("typeof strActivityLocationList = " + typeof strActivityLocationList);				
				var aryActivityLocationList = strActivityLocationList.split(",");
				strActivityLocationList = uniq_fast(aryActivityLocationList);
				console.log("strActivityLocationList = " + strActivityLocationList);
				
				console.log("strInstrumentIdList (with dupes) = " + strInstrumentIdList);
				console.log("typeof strInstrumentIdList = " + typeof strInstrumentIdList);
				var aryInstrumentIdList = strInstrumentIdList.split(",");
				strInstrumentIdList = uniq_fast(aryInstrumentIdList);
				console.log("strInstrumentIdList = " + strInstrumentIdList);
				
				var promise = null;
				promise = DatasetService.getSpecificWaterTempActivities($scope.datasetId, strActivityLocationList, strInstrumentIdList, strReadingDateTimeList);
					
					
				//console.log("typeof $promise = " + typeof promise);
				if (typeof promise !== 'undefined') 
				{
					promise.$promise.then(function(list){
						console.log("promise is next...");
						console.dir(promise);
						if (promise.length > 0)
						{
							$scope.duplicateEntry = true;
							var duplicateItems = angular.copy(promise);
							//console.log("duplicateItems is next...");
							//console.dir(duplicateItems);
							
							angular.forEach(duplicateItems, function(item){
								// The datetime coming back from the backend has a "T" in it; we must remove it.
								item.ReadingDateTime = item.ReadingDateTime.replace("T", " ");
								//console.log("item.ReadingDateTime = " + item.ReadingDateTime);
								
								angular.forEach($scope.dataSheetDataset, function(detailRecord){
									// In order tom compare the "friendly" date format to the UTC coming from the backend, we must convert it UTC.
									strIsoDateTime = formatDateFromFriendlyToUtc(detailRecord.ReadingDateTime);
									
									// The datetime coming from the backend DOES NOT have milliseconds, so strip them off here.
									strIsoDateTime = strIsoDateTime.substr(0, 19); // Start here, take this many.
									//console.log("strIsoDateTime = " + strIsoDateTime);
									if (item.ReadingDateTime === strIsoDateTime)
									{
										//console.log("Found dupe...");
										if (!detailRecord.errors)
											detailRecord.errors = [];
										
										// All three of these are required to turn the lines with errors red.
										detailRecord.isValid = false;
										detailRecord.errors.push("Duplicate:  a record with this Location, Instrument, and ReadingDateTime already exists.");
										
										// During the (angular?) cycle, checkForDuplicates ends of running twice, so we get duplicate error entries.
										// Therefore, clean out the duplicate entries from the error array.
										detailRecord.errors = uniq_fast(detailRecord.errors);
										$scope.gridHasErrors = true;
										$scope.saving = false;
									}
								});
								
							});
							//console.log("$scope.dataSheetDataset is next...");
							//console.dir($scope.dataSheetDataset);
						}
						else
						{
							$scope.duplicateEntry = false;
						}
					});
				}
			}
			else
			{
				// Get the ActivityDate
				var strActivityDate = toExactISOString($scope.row.activityDate);
				console.log("strActivityDate = " + strActivityDate);
				
				strActivityDate = strActivityDate.replace("T", " ");
				console.log("strActivityDate (without T) = " + strActivityDate);
				
				// Convert the single date item to a one element array, because the back end expects an array.
				var aryActivityDateList = strActivityDate.split(",");
				console.log("aryActivityDateList is next...");
				console.dir(aryActivityDateList);
				
				var strActivityDateList = uniq_fast(aryActivityDateList); // Removes dupes and converts to a string.
				console.log("strActivityDateList = " + strActivityDateList);
				
				// Get the Locations
				var intLocationId = $scope.row.locationId;
				var aryActivityLocationList = intLocationId.split(",");
				strActivityLocationList = uniq_fast(aryActivityLocationList);
				console.log("strActivityLocationList = " + strActivityLocationList);
				
				//console.log("$scope.datasetId = " + $scope.datasetId + ", $scope.row.locationId = " + $scope.row.locationId + ", $scope.row.activityDate = " + $scope.row.activityDate);
				console.log("$scope.datasetId = " + $scope.datasetId + ", strActivityLocationList = " + strActivityLocationList + ", strActivityDateList = " + strActivityDateList);
				//$scope.SpecificActivitiesResults = null;
				
				var promise = DatasetService.getSpecificActivities($scope.datasetId, strActivityLocationList,strActivityDateList);
				
				//console.log("typeof $promise = " + typeof promise);
				if (typeof promise !== 'undefined') 
				{
					promise.$promise.then(function(list){
						console.log("promise is next...");
						console.dir(promise);
						if (promise.length > 0)
						{
							$scope.duplicateEntry = true;
							if (!$scope.activities.errors)
								$scope.activities.errors = {};
							
							$scope.activities.errors.saveError = "Duplicate:  For this Dataset, Location, and Activity Date, a record already exists.";
							$scope.saving = false;
						}
						else
						{
							$scope.duplicateEntry = false;
							$scope.activities.errors = undefined;
						}
					});
				}
			}
		};
		
		$scope.onLocationChange = function()
		{
			console.log("Inside $scope.onLocationChange...");

			console.log("New location selected = " + $scope.locationOptions[$scope.row.locationId]);
			
			//$scope.activities.errors = {};
			$scope.activities.errors = undefined;
			//$scope.errors = { heading: [] };
			$scope.removeRowErrorsBeforeRecheck();
			$scope.checkForDuplicates();
		};
		
		$scope.onActivityDateChange = function()
		{
			console.log("Inside $scope.onActivityDateChange...");
			//$scope.activities.errors = {};
			$scope.activities.errors = undefined;
			$scope.duplicateEntry = undefined;
			$scope.checkForDuplicates();
		};
		
		$scope.removeRowErrorsBeforeRecheck = function()
		{
			console.log("Inside $scope.removeRowErrorsBeforeRecheck...");
			
			// In order to turn the rows red, we need the following set.
			//detailRecord.isValid = false;
			//detailRecord.errors.push("Duplicate:  a record with this Location, Instrument, and ReadingDateTime already exists.");
			//$scope.gridHasErrors = true;
			
			// Therefore, we reverse the process, to reset the grid, prior to rescanning for duplicates.
			
			angular.forEach($scope.dataSheetDataset, function(detailRecord){

				if (detailRecord.errors)
					detailRecord.errors = undefined;
				
				// All three of these are required to turn the lines with errors red.
				detailRecord.isValid = true;
			});
			
			$scope.gridHasErrors = false;
		};
		
		/* Moved this function to app/core/common/common-functions.js
		$scope.isObjectEmpty = function(obj){
			for(var prop in obj){
				if (obj.hasOwnProperty(prop))
					return false;
			}
			return true;
		};
		*/
    }
];