// was DataEntryDatasheetCtrl from DataEntryControllers
//datasheet version of the data entrypage
var dataset_entry_sheet = ['$scope', '$routeParams', 'DatasetService', '$modal', '$location', '$rootScope', 'ActivityParser', 'DataSheet', '$route', 'DatastoreService',
    function ($scope, $routeParams, DatasetService, $modal, $location, $rootScope, ActivityParser, DataSheet, $route, DatastoreService) {

        initEdit(); // stop backspace from ditching in the wrong place.

        $scope.userId = $rootScope.Profile.Id;
        $scope.fields = { header: [], detail: [], relation: {} };
        $scope.colDefs = [];

        //setup the data array that will be bound to the grid and filled with the json data objects
        $scope.dataSheetDataset = [];

        $scope.datasetLocationType = 0;
        $scope.datasetLocations = [[]];
        $scope.primaryDatasetLocation = 0;
        $scope.sortedLocations = [];
        $scope.errors = { heading: [] };

        $scope.fishermenList = ProjectService.getFishermen();
        $scope.dataEntryPage = true;  // This is s flag, telling the app that we are on the Data Entry Page, to make the Add Section button show only on the Data Entry page.

        //datasheet grid definition
        $scope.gridDatasheetOptions = {
            data: 'dataSheetDataset',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEdit: true,
            columnDefs: 'datasheetColDefs',
            enableColumnResize: true,

        };

        //config the fields for the datasheet - include mandatory location and activityDate fields
        //$scope.datasheetColDefs = DataSheet.getColDefs();  // This runs in the dataset.Fields watcher now.
        DataSheet.initScope($scope);

        //fire up our dataset
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

        //update our location options as soon as our project is loaded.
        $scope.$watch('project.Name', function () {
            if (!$scope.project.Name) return;

            console.log("Inside watch project.Name...");
            //console.log("$scope.project is next...");
            //console.dir($scope.project);

            $rootScope.projectId = $scope.project.Id;
            $scope.project.Files = null;
            $scope.project.Files = ProjectService.getProjectFiles($scope.project.Id);

            if ($scope.subprojectType === "Harvest") {
                console.log("Loading Harvest...");
                $scope.ShowFishermen = true;
                //$scope.theFishermen = ProjectService.getProjectFishermen($scope.project.Id);
                $scope.fishermenList = ProjectService.getFishermen();
            }

            //$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ; // Original line

            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            $scope.datasetLocationType = CommonService.getDatasetLocationType($scope.DatastoreTablePrefix);
            console.log("LocationType = " + $scope.datasetLocationType);

            console.log("ProjectLocations is next...");
            console.dir($scope.project.Locations);
            //var locInd = 0;
            for (var i = 0; i < $scope.project.Locations.length; i++) {
                //console.log("projectLocations Index = " + $scope.project.Locations[i].Label);
                //console.log($scope.project.Locations[i].Id + "  " + $scope.project.Locations[i].Id);
                if ($scope.project.Locations[i].LocationTypeId === $scope.datasetLocationType) {
                    //console.log("Found one");
                    $scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);
                    //console.log("datasetLocations length = " + $scope.datasetLocations.length);
                    //locInd++;

                    if ($scope.DatastoreTablePrefix === "FishScales") {
                        console.log("Setting $scope.primaryDatasetLocation...");
                        $scope.primaryDatasetLocation = $scope.project.Locations[i].Id;
                    }
                }
				/*else if ($scope.project.Locations[i].LocationTypeId === 3)
				{
					//$scope.datasetLocations.push([$scope.project.Locations[i].Id, $scope.project.Locations[i].Label]);  // The label is NULL, so do not add it.
					$scope.primaryProjectLocation = $scope.project.Locations[i].Id;
					console.log("Found a primary location.  LocId = " + $scope.primaryProjectLocation);
				}*/
            }
            console.log("datasetLocations is next...");
            console.dir($scope.datasetLocations);

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

            $scope.datasetLocations.sort(order2dArrayByAlpha);
            console.log("datasetLocations sorted...");
            console.dir($scope.datasetLocations);

            // Convert our 2D array into an array of objects.
            for (var i = 0; i < $scope.datasetLocations.length; i++) {
                $scope.sortedLocations.push({ Id: $scope.datasetLocations[i][0], Label: $scope.datasetLocations[i][1] });
            }
            $scope.datasetLocations = [[]]; // Clean up


            // Convert our array of objects into a list of objects, and put it in the select box.
            $scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.sortedLocations, 'Id', 'Label');

            console.log("locationOptions is next...");
            console.dir($scope.locationOptions);

            console.log("$scope.project.Instruments is next...");
            console.dir($scope.project.Instruments);
            if ($scope.project.Instruments.length > 0) {
                $scope.instrumentOptions = $rootScope.instrumentOptions = makeInstrumentObjects($scope.project.Instruments);
                //getByField($scope.datasheetColDefs, 'Instrument','Label').visible=true;
            }

            //check authorization -- need to have project loaded before we can check project-level auth
            if (!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project)) {
                $location.path("/unauthorized");
            }

            console.log("$scope at end of Project watch is next...");
            //console.dir($scope);
        });

        //setup a listener to populate column headers on the grid
        $scope.$watch('dataset.Fields', function () {
            if (!$scope.dataset.Fields) return;

            console.log("Inside watch dataset.Fields...");

            $rootScope.datasetId = $scope.datasetId = $scope.dataset.Id;
            console.log("$rootScope.datasetId = " + $rootScope.datasetId);
            $scope.dataset.Files = DatasetService.getDatasetFiles($scope.dataset.Id);

            $scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            $scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix);  // Pass the TablePrefix (name of the dataset), because it will never change.			

            //load our project based on the projectid we get back from the dataset
            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);

            $scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');

            $scope.timezoneOptions = $rootScope.timezoneOptions = makeObjects($scope.SystemTimezones, 'Name', 'Name');  // Items sorted by Id
            //$scope.timezoneOptions = $rootScope.timezoneOptions = makeObjects($scope.SystemTimezones,'Name','Description');  // Items sorted by Name

            //iterate the fields of our dataset and populate our grid columns
            // Note:  If the OrderBy column of EITHER records that are being compared DOES NOT have a "real" value (not NULL or blank, etc.),
            // the sort process in services.js will use the FieldRoleId column instead.
            // This may be an all or none situation (all must have an OrderBy value), because if only some have the value set,
            // then the order is jumbled on the web page.  When the OrderBy is set for all, they all show in the proper order on the page.
            angular.forEach($scope.dataset.Fields.sort(orderByIndex), function (field) {

                parseField(field, $scope);

                if (field.FieldRoleId == FIELD_ROLE_HEADER) {
                    $scope.fields.header.push(field);
                    $scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
                }
                else if (field.FieldRoleId == FIELD_ROLE_DETAIL) {
                    $scope.fields.detail.push(field);
                    $scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
                }
            });

            //now everything is populated and we can do any post-processing.
            if ($scope.datasheetColDefs.length > 2) {
                $scope.addNewRow();
            }

            if ($scope.dataset.Config) {
                var filteredColDefs = [];

                angular.forEach($scope.datasheetColDefs, function (coldef) {
                    if ($scope.dataset.Config.DataEntryPage &&
                        !$scope.dataset.Config.DataEntryPage.HiddenFields.contains(coldef.field)) {
                        filteredColDefs.push(coldef);
                    }
                });

                $scope.datasheetColDefs = $scope.colDefs = filteredColDefs;
            }

            $scope.recalculateGridWidth($scope.datasheetColDefs.length);
            $scope.validateGrid($scope);

        });

        $scope.doneButton = function () {
            $scope.activities = undefined;
            $scope.dataset = undefined;
            $scope.foundDuplicate = false;
            $route.reload();
            $scope.reloadProject();
            //DataSheet.initScope($scope); //needed?
        }

        $scope.viewButton = function () {
            $location.path("/" + $scope.dataset.activitiesRoute + "/" + $scope.dataset.Id);
        }

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
            row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
            row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataSheetDataset.push(row);
            $scope.onRow = row;

        };

        $scope.saveData = function () {

            angular.forEach($scope.dataSheetDataset, function (dataRow) {
                angular.forEach(dataRow, function (key, value) {
                    console.log("key = " + key);
                    if ($scope.DatastoreTablePrefix === "JvRearing") {
                        if (key === "Result") {
                            value = parsefloat(value);
                        }
                    }
                });
            });

            var sheetCopy = angular.copy($scope.dataSheetDataset);

            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            if ($scope.DatastoreTablePrefix == "FishScales") {
                console.log("$scope.primaryDatasetLocation = " + $scope.primaryDatasetLocation);
                $scope.row.locationId = $scope.primaryDatasetLocation;
            }
            else
                console.log("Not working with FishScales...");

            //$scope.activities = ActivityParser.parseActivitySheet(sheetCopy, $scope.fields);
            //$scope.activities = ActivityParser.parseActivitySheet(sheetCopy, $scope.fields, $scope.dataset.QAStatuses);
            $scope.activities = ActivityParser.parseActivitySheet(sheetCopy, $scope.fields, $scope.DatastoreTablePrefix, "DataEntrySheet", $scope.dataset.QAStatuses);

            if (!$scope.activities.errors) {
                var promise = DatasetService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
                promise.$promise.then(function () {
                    $scope.new_activity = $scope.activities.new_records;
                });
            }

        };

        // For Creel Survey only. 
        // Open form to add a fisherman to the database
        $scope.addFisherman = function () {
            $scope.viewFisherman = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
                controller: 'ModalCreateFishermanCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };

        // For Creel Survey only. 
        $scope.addNewInterview = function () {
            var row = makeNewRow($scope.datasheetColDefs);
            row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataSheetDataset.push(row);
            $scope.onRow = row;

            for (var i = 0; i < $scope.datasheetColDefs.length; i++) {
                if ( // Headers
                    ($scope.datasheetColDefs[i].field === "activityDate") ||
                    ($scope.datasheetColDefs[i].field === "locationId") ||
                    ($scope.datasheetColDefs[i].field === "QAStatusId") ||
                    ($scope.datasheetColDefs[i].field === "Direction") ||
                    ($scope.datasheetColDefs[i].field === "Shift") ||
                    ($scope.datasheetColDefs[i].field === "SurveySpecies") ||
                    ($scope.datasheetColDefs[i].field === "Comments") ||
                    ($scope.datasheetColDefs[i].field === "FieldSheetFile") ||
                    // Details
                    ($scope.datasheetColDefs[i].field === "InterviewTime") ||
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
        // Adds another row to datasheet grid and copies common items (surveyor, date, etc.)
        $scope.addAnotherFish = function () {
            console.log("Inside addAnotherFish...");
            console.log("$scope before copy is next...");
            //console.dir($scope);

            var listLength = $scope.dataSheetDataset.length;
            // Header items:  Needed in datasheet form
            var theActivityDate = $scope.dataSheetDataset[listLength - 1].activityDate;
            var theLocationId = $scope.dataSheetDataset[listLength - 1].locationId;
            var theDirection = $scope.dataSheetDataset[listLength - 1].Direction;
            var theShift = $scope.dataSheetDataset[listLength - 1].Shift;
            var theSurveySpecies = $scope.dataSheetDataset[listLength - 1].SurveySpecies;
            var surveyComments = $scope.dataSheetDataset[listLength - 1].SurveyComments;
            var theFieldSheetLink = $scope.dataSheetDataset[listLength - 1].FieldSheetFile;
            // Detail items
            var interviewTime = $scope.dataSheetDataset[listLength - 1].InterviewTime;
            var gpsEasting = $scope.dataSheetDataset[listLength - 1].GPSEasting;
            var gpsNorthing = $scope.dataSheetDataset[listLength - 1].GPSNorthing;
            var interviewComments = $scope.dataSheetDataset[listLength - 1].InterviewComments;
            var totalTimeFished = $scope.dataSheetDataset[listLength - 1].TotalTimeFished;
            var numberFishCaught = $scope.dataSheetDataset[listLength - 1].NumberFishCaught;
            var qaStatusId = $scope.dataSheetDataset[listLength - 1].QAStatusId;

            var row = makeNewRow($scope.datasheetColDefs);
            row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
            //row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
            $scope.dataSheetDataset.push(row);
            $scope.onRow = row;

            listLength = $scope.dataSheetDataset.length;
            // Headers:  Needed for datasheet form
            $scope.dataSheetDataset[listLength - 1].activityDate = theActivityDate;
            $scope.dataSheetDataset[listLength - 1].locationId = theLocationId;
            $scope.dataSheetDataset[listLength - 1].Direction = theDirection;
            $scope.dataSheetDataset[listLength - 1].Shift = theShift;
            $scope.dataSheetDataset[listLength - 1].SurveySpecies = theSurveySpecies;
            $scope.dataSheetDataset[listLength - 1].SurveyComments = surveyComments;
            $scope.dataSheetDataset[listLength - 1].FieldSheetFile = theFieldSheetLink;
            // Details
            $scope.dataSheetDataset[listLength - 1].InterviewTime = interviewTime;
            $scope.dataSheetDataset[listLength - 1].GPSEasting = gpsEasting;
            $scope.dataSheetDataset[listLength - 1].GPSNorthing = gpsNorthing;
            $scope.dataSheetDataset[listLength - 1].InterviewComments = interviewComments;
            $scope.dataSheetDataset[listLength - 1].TotalTimeFished = totalTimeFished;
            $scope.dataSheetDataset[listLength - 1].NumberFishCaught = numberFishCaught;
            $scope.dataSheetDataset[listLength - 1].QAStatusId = qaStatusId;

            for (var i = 0; i < $scope.datasheetColDefs.length; i++) {
                if (($scope.datasheetColDefs[i].field === "InterviewTime") ||
                    ($scope.datasheetColDefs[i].field === "GPSEasting") ||
                    ($scope.datasheetColDefs[i].field === "GPSNorthing") ||
                    ($scope.datasheetColDefs[i].field === "InterviewComments") ||
                    ($scope.datasheetColDefs[i].field === "TotalTimeFished") ||
                    // Header fields
                    ($scope.datasheetColDefs[i].field === "activityDate") ||
                    ($scope.datasheetColDefs[i].field === "locationId") ||
                    ($scope.datasheetColDefs[i].field === "QAStatusId") ||
                    ($scope.datasheetColDefs[i].field === "Direction") ||
                    ($scope.datasheetColDefs[i].field === "Shift") ||
                    ($scope.datasheetColDefs[i].field === "SurveySpecies") ||
                    ($scope.datasheetColDefs[i].field === "SurveyComments") ||
                    ($scope.datasheetColDefs[i].field === "FieldSheetFile")
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
        };

    }
];