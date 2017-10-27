
var dataset_activities_list = ['$scope', '$routeParams', 'DataService', 'DatastoreService', '$modal', '$location', '$window', '$rootScope',
    function ($scope, $routeParams, DataService, DatastoreService, $modal, $location, $window, $rootScope) {
        console.log("Inside datasetActivitiesController...");
        $scope.dataset = DataService.getDataset($routeParams.Id);

        if ((typeof $scope.activities !== 'undefined') && ($scope.activites !== null)) {
            $scope.activities = null;
            console.log("Set $scope.activities to null for project page...");
        }
        $scope.activities = DataService.getActivitiesForView($routeParams.Id);
        $scope.loading = true;
        $scope.project = null;
        $scope.saveResults = null;
        $scope.isFavorite = $rootScope.Profile.isDatasetFavorite($routeParams.Id);
        $scope.allActivities = null;
        $scope.headerdata = DataService.getHeadersDataForDataset($routeParams.Id);
        $scope.thisDatasetLocationObjects = [];

        //console.log("Profile = ");
        //console.dir($rootScope.Profile);

        var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
            '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("ActivityDate") | date:\'MM/dd/yyyy\'}}</a>' +
            '</div>';

        var yearReportedTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
            '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("headerdata.YearReported") }}</a>' +
            '</div>';

        var desclinkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
            '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("Description") }}</a>' +
            '</div>';

        var allotmentTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
            '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("headerdata.Allotment") }}</a>' +
            '</div>';

        var locationLabelTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
            '<span>{{row.getProperty("Location.Label") }}</span>' +
            '<span ng-if="row.getProperty(\'Location.OtherAgencyId\')"> ({{row.getProperty(\'Location.OtherAgencyId\')}})</span>' +
            '</div>';

        var QATemplate = '<div class="ngCellText" ng-class="col.colIndex()">{{QAStatusList[row.getProperty("ActivityQAStatus.QAStatusId")]}}</div>';

        //performance idea: if project-role evaluation ends up being slow, you can conditionally include here...
        var editButtonTemplate = '<div project-role="editor" class="ngCellText" ng-class="col.colIndex()">' +
            '<a href="#/edit/{{row.getProperty(\'Id\')}}">Edit</a>' +
            '</div>';

        $scope.columnDefs = [
            { field: 'ActivityDate', displayName: 'Activity Date', cellTemplate: linkTemplate, width: '100px' },
            //{field:'YearReported', displayName:'Year Reported', cellTemplate: linkTemplate, width:'120px'},
            { field: 'headerdata.YearReported', displayName: 'Year Reported', cellTemplate: yearReportedTemplate, width: '120px' },

            { field: 'headerdata.TimeStart', displayName: 'Time Start', visible: false, width: '80px' },

            //for demo
            { field: 'headerdata.Allotment', displayName: 'Allotment', cellTemplate: allotmentTemplate, visible: false, width: '100px' },
            { field: 'headerdata.AllotmentStatus', displayName: 'Status', visible: false, width: '120px' },

            // {field:'Location.Id',displayName: 'LocId', visible: false, width: '55px'}, // We do not want to show this column.
            { field: 'Location.Label', displayName: 'Location', cellTemplate: locationLabelTemplate },
            { field: 'Location.WaterBody.Name', displayName: 'Waterbody', visible: false },
            { field: 'headerdata.FieldActivityType', displayName: 'Field Activity Type', visible: false, width: '120px' },
            { field: 'headerdata.DataType', displayName: 'Data Type', visible: false, width: '120px' },
            { field: 'Description', displayName: 'Date Range', cellTemplate: desclinkTemplate, visible: false },


            { field: 'User.Fullname', displayName: 'By User', width: '120px' },
            { field: 'QAStatus', displayName: 'QA Status', cellTemplate: QATemplate, width: '100px' },
            { field: 'Actions', displayName: '', cellTemplate: editButtonTemplate, width: '40px' },

        ];

        $scope.showFilter = false;
        $scope.selectedLocation = null;
        $scope.newPoint = null;
        $scope.newGraphic = null;
        $scope.showDataEntrySheetButton = true;

        $scope.gridOptionsFilter = {};
        $scope.gridOptions = {
            data: 'activities',
            selectedItems: [],
            showColumnMenu: true,
            sortInfo: { fields: ['ActivityDate'], directions: ['desc'] },
            columnDefs: 'columnDefs',
            filterOptions: $scope.gridOptionsFilter,


        };

        //Maybe there is a better way?!
        $scope.activities.$promise.then(function () {
            console.log("Inside activities-controller.js, $scope.activities.$promise, loading header data...");
            $scope.headerdata.$promise.then(function () {
                angular.forEach($scope.activities, function (activity, key) {
                    activity.headerdata = getByField($scope.headerdata, activity.Id, "ActivityId");
                });
            });
            console.log("$scope at end of $scope.activities.$promise is next...");
            console.dir($scope);
        });

        $scope.$watch('dataset.Fields', function () {
            if (!$scope.dataset.Fields) return;

            console.log("Inside dataset.Fields watcher...");
            console.log("$scope is next...");
            console.dir($scope);

            $rootScope.datasetId = $scope.dataset.Id;
            //load our project based on the projectid we get back from the dataset
            $scope.project = DataService.getProject($scope.dataset.ProjectId);
            $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');

            $scope.DatastoreTablePrefix = $scope.dataset.Datastore.TablePrefix;
            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            //console.log("$scope.columnDefs is next...");
            //console.dir($scope.columnDefs);

            //hide irrelevant fields TODO -- code smell pretty ripe here...  genericize
            // $scope.columnDefs[0] = ActivityDate
            // $scope.columnDefs[1] = YearReported
            // $scope.columnDefs[2] = TimeStart
            // $scope.columnDefs[3] = Allotment
            // $scope.columnDefs[4] = AllotmentStatus
            // $scope.columnDefs[5] = Location
            // $scope.columnDefs[6] = Waterbody
            // $scope.columnDefs[7] = FieldActivityType
            // $scope.columnDefs[8] = DataType
            // $scope.columnDefs[9] = Date Range
            // $scope.columnDefs[10] = By User
            // $scope.columnDefs[11] = QAStatus

            $scope.showDataEntrySheetButton = true;
            if ($scope.DatastoreTablePrefix === "WaterTemp") {
                console.log("showing fields for " + $scope.DatastoreTablePrefix);
                $scope.columnDefs[0].visible = false; // ActivityDate
                $scope.columnDefs[1].visible = false; // YearReported
                $scope.columnDefs[5].visible = true;  // Location
                $scope.columnDefs[7].visible = true;  // FieldActivityType
                $scope.columnDefs[9].visible = true;  // Date Range
                $scope.columnDefs[10].visible = true; // By User

                $scope.reloadDatasetLocations("WaterTemp", LOCATION_TYPE_WaterTemp);
            }
            else if ($scope.DatastoreTablePrefix === "WaterQuality") {
                console.log("showing fields for " + $scope.DatastoreTablePrefix);
                $scope.columnDefs[0].visible = false; // ActivityDate
                $scope.columnDefs[1].visible = false; // YearReported
                $scope.columnDefs[5].visible = true;  // Location
                $scope.columnDefs[8].visible = true;  // DataType
                $scope.columnDefs[9].visible = true;  // Date Range
                $scope.columnDefs[10].visible = true; // By User
            }
            else if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                console.log("showing fields for " + $scope.DatastoreTablePrefix);
                $scope.columnDefs[0].visible = true; // ActivityDate
                $scope.columnDefs[1].visible = false; // YearReported
                $scope.columnDefs[2].visible = true;  // TimeStart
                $scope.columnDefs[3].visible = false; // Allotment
                $scope.columnDefs[5].visible = true;  // Location
                $scope.columnDefs[8].visible = false; // DataType
                $scope.columnDefs[9].visible = false; // Date Range
                $scope.columnDefs[10].visible = true; // By User
                $scope.columnDefs[11].visible = true; // QAStatus
            }
            else if ($scope.DatastoreTablePrefix === "Appraisal") {
                console.log("showing fields for " + $scope.DatastoreTablePrefix);
                $scope.columnDefs[0].visible = false; // ActivityDate
                $scope.columnDefs[1].visible = false; // YearReported
                $scope.columnDefs[3].visible = true;  // Allotment
                $scope.columnDefs[4].visible = true;  // AllotmentStatus
            }
            else if ($scope.DatastoreTablePrefix === "CrppContracts") {
                console.log("showing fields for " + $scope.DatastoreTablePrefix);
                $scope.columnDefs[0].visible = false; // ActivityDate
                $scope.columnDefs[1].visible = false; // YearReported
                $scope.columnDefs[3].visible = true;  // Allotment
                $scope.columnDefs[4].visible = true;  // AllotmentStatus
            }
            else if ($scope.DatastoreTablePrefix === "FishScales") {
                console.log("showing fields for " + $scope.DatastoreTablePrefix);
                $scope.columnDefs[0].visible = true;  // ActivityDate
                $scope.columnDefs[1].visible = false; // YearReported
                $scope.columnDefs[5].visible = false; // Location
                $scope.columnDefs[10].visible = true; // By User
                $scope.columnDefs[11].visible = true; // QAStatus
            }
            else if ($scope.DatastoreTablePrefix === "Metrics") {
                console.log("showing fields for " + $scope.DatastoreTablePrefix);
                $scope.columnDefs[0].visible = false; // ActivityDate
                $scope.columnDefs[1].visible = true;  // YearReported
                $scope.columnDefs[5].visible = true;  // Location
                $scope.columnDefs[10].visible = true; // By User
                $scope.columnDefs[11].visible = true; // QAStatus

                $scope.showDataEntrySheetButton = false;

                $scope.gridOptions = {};
                $scope.gridOptions = {
                    data: 'activities',
                    selectedItems: [],
                    showColumnMenu: true,
                    //sortInfo: {fields:['ActivityDate'], directions: ['desc']},
                    sortInfo: { fields: ['headerdata.YearReported'], directions: ['desc'] },
                    columnDefs: 'columnDefs',
                    filterOptions: $scope.gridOptionsFilter,
                };

                $scope.reloadDatasetLocations("Metrics", LOCATION_TYPE_Hab);
            }
            else {
                $scope.columnDefs[0].visible = true;  // ActivityDate
                $scope.columnDefs[1].visible = false; // YearReported
                $scope.columnDefs[5].visible = true;  // Location
                $scope.columnDefs[7].visible = false; // FieldActivityType
                $scope.columnDefs[9].visible = false; // Date Range
                $scope.columnDefs[10].visible = true; // By User
                $scope.columnDefs[11].visible = true; // QAStatus
            }

            console.log("$scope at end of watch, dataset.Fields is next...");
            console.dir($scope);
        });

        $scope.$watch('project.Name', function () {
            if ($scope.project && $scope.project.$resolved) {
                console.log("Inside watch project.Name...");

                console.log("$scope.project.Id = " + $scope.project.Id);
                //$scope.subprojectType = DatastoreService.getSubprojectType($scope.project.Id);
                //$scope.subprojectType = DatastoreService.getProjectType($scope.project.Id);
                console.log("$scope.subprojectType = " + $scope.subprojectType);
                DataService.setServiceSubprojectType($scope.subprojectType);

                //if ($scope.subprojectType === "Habitat")
                if ($scope.DatastoreTablePrefix === "Metrics") {
                    console.log("x")
                    $scope.subprojectList = DataService.getProjectSubprojects($scope.project.Id);
                    var watcher = $scope.$watch('subprojectList.length', function () {
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

                        $scope.reloadProjectLocations();

                        if ($scope.map && $scope.map.locationLayer && $scope.map.locationLayer.hasOwnProperty('showLocationsById')) {
                            //$scope.map.locationLayer.showLocationsById($scope.thisProjectsLocationObjects); //bump and reload the locations.
                            // Note:  If we sent an empty list, it pulls all the locations.
                            // If we supply an Id that we know does not exist (0), we get no locations, which is what we expect.
                            $scope.map.locationLayer.showLocationsById(0); //bump and reload the locations.
                        }

                        watcher();
                    });
                }
                else {
                    $scope.reloadProjectLocations();
                }
            }
        });

        $scope.$watch('activities.$resolved', function () {
            $scope.loading = true;
            if ($scope.activities && $scope.activities.$resolved) {
                console.log("Inside watch activities.$resolved...");
                console.log("$scope is next...");
                console.log($scope);

                if (!$scope.allActivities)
                    $scope.allActivities = $scope.activities;

                $scope.loading = false;

                if ($scope.activities.length > 0) {
                    $scope.gridOptions.ngGrid.data.$promise.then(function () {
                        if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                            var intLocT = -1;
                            var strTheTime = "";
                            console.log("Starting to extract TimeStart...");
                            angular.forEach($scope.gridOptions.ngGrid.data, function (row) {
                                // Verify that we have a StartTime, before we try to extract the time from it.
                                if ((typeof row.headerdata.TimeStart !== 'undefined') && (row.headerdata.TimeStart !== null)) {
                                    intLocT = row.headerdata.TimeStart.indexOf("T");
                                    strTheTime = row.headerdata.TimeStart.substr(intLocT + 1, 5);
                                    row.headerdata.TimeStart = strTheTime;

                                    intLocT = -1;
                                    strTheTime = "";
                                }
                                else
                                    console.log("$scope.row.headerdata.TimeStart exists and has data...");
                            });
                            console.log("Done extracting TimeStart...");

                            // This makes a copy of ALL the activities.  When the dataset has lots of activities, it causes problems.
                            //$rootScope.GridActivities = $scope.gridOptions.ngGrid.data;
                        }
                    });
                }

            }

            //turn off the wheel of fishies
            if (($scope.activities) && (typeof $scope.activities.$resolved == "undefined"))
                $scope.loading = false;

        });

        $scope.reloadDatasetLocations = function (datasetName, locationType) {
            console.log("Inside activities-controllers.js, scope.reloadDatasetLocations...");

            console.log("$scope is next...");
            console.dir($scope);
            //console.log("$scope.project.Locations is next...");
            //console.dir($scope.project.Locations);

            $scope.thisDatasetLocationObjects = []; // Dump this list, before refilling it.

            if (datasetName === "WaterTemp") {
                console.log("We have a WaterTemp dataset...");

                angular.forEach($scope.project.Locations, function (location, key) {
                    if (location.LocationType.Id === LOCATION_TYPE_WaterTemp)
                        $scope.thisDatasetLocationObjects.push(location.SdeObjectId);
                });
            }
            else if (datasetName === "Metrics") {
                console.log("We have a Metrics dataset...");
                console.log("$scope.subprojectList is next...");
                console.dir($scope.subprojectList);

                angular.forEach($scope.subprojectList, function (subproject) {

                    angular.forEach($scope.project.Locations, function (location, key) {
                        //console.log("location key = " + key);
                        //console.log("location is next...");
                        //console.dir(location);

                        // We will show the locations of the subprojects.
                        //console.log("location.LocationTypeId = " +  location.LocationTypeId + ", subproject.LocationId = " + subproject.LocationId + ", location.Id = " + location.Id);
                        if ((locationType === LOCATION_TYPE_Hab) && (subproject.LocationId === location.Id)) {
                            console.log("Found a subproject location")
                            console.dir(location);
                            $scope.thisDatasetLocationObjects.push(location.SdeObjectId);
                            subproject.GPSEasting = location.GPSEasting;
                            subproject.GPSNorthing = location.GPSNorthing;
                            subproject.UTMZone = location.UTMZone;
                            subproject.Projection = location.Projection;
                            subproject.WaterBodyId = location.WaterBodyId;
                        }
                    });
                });
            }
            $scope.map.locationLayer.showLocationsById($scope.thisDatasetLocationObjects); //bump and reload the locations.
        };

        $scope.ShowMap = {
            Display: false,
            Message: "Show Map",
            MessageToOpen: "Show Map",
            MessageToClose: "Hide Map",
        };

        $scope.addLocation = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/modals/components/templates/modal-addlocation.html',
                controller: 'ModalAddLocationCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };

        $scope.removeFilter = function () {
            $scope.activities = $scope.allActivities;
            $scope.clearLocation();
        }

        $scope.clearLocation = function () {
            $scope.map.infoWindow.hide();
            $scope.selectedLocation = null;

            if ($scope.newGraphic) {
                $scope.map.graphics.remove($scope.newGraphic);
                $scope.newGraphic = null;
            }

        };

        $scope.removeLocation = function () {
            if (confirm("Are you sure you want to delete this location?")) {
                var deleting = DatastoreService.deleteLocation($scope.selectedLocation.Id);
                $scope.removeFilter();

                deleting.$promise.then(function () {
                    $scope.refreshProjectLocations();
                    $scope.reloadProjectLocations();
                });
            }

        };

        $scope.editLocation = function () {
            $scope.row = $scope.selectedLocation;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/modals/components/templates/modal-addlocation.html',
                controller: 'ModalAddLocationCtrl',
                scope: $scope, //very important to pass the scope along...
            });
        };

        $scope.getFormContent = function () {
            return "Click button above to create a new location here.";
        };


        // expose a method for handling clicks ON THE MAP - this is linked to from the Map.js directive
        $scope.click = function (e) {

            try {

                if (!$scope.map.graphics.infoTemplate) {
                    $scope.map.graphics.infoTemplate = $scope.template;
                    console.log("graphics layer infotemplate defined.");
                }


                $scope.map.infoWindow.resize(250, 300);

                //show the infowindow
                if (e.graphic) {
                    console.log("e.graphic is next...");
                    console.dir(e.graphic);
                    $scope.map.infoWindow.setContent($scope.getInfoContent(e.graphic));
                }
                else {
                    $scope.map.infoWindow.setTitle("New Location");
                    $scope.map.infoWindow.setContent($scope.getFormContent());
                }

                $scope.map.infoWindow.show(e.mapPoint);



                //now... did they click an existing map point?
                if (e.graphic) {
                    //filter activities based on the location they clicked.
                    var filterActivities = [];
                    var location = getByField($scope.locationsArray, e.graphic.attributes.OBJECTID, "SdeObjectId");

                    angular.forEach($scope.allActivities, function (item, key) {
                        if (item.LocationId == location.Id)
                            filterActivities.push(item);
                    });

                    $scope.activities = filterActivities;
                    console.log("$scope.activities is next...");
                    console.dir($scope.activities);

                    $scope.selectedLocation = location;
                    if ($scope.newGraphic) {
                        $scope.map.graphics.remove($scope.newGraphic);
                        $scope.newGraphic = null; // just to clear the buttons on the UI.
                    }

                    //$scope.center = [e.mapPoint.x,e.mapPoint.y];
                }
                else // no -- maybe they are making a new point?
                {
                    $scope.selectedLocation = null; //since we didn't select an existing one.

                    $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

                    $scope.newPoint = e.mapPoint;

                    //if they had already clicked somewhere, remove that point.
                    if ($scope.newGraphic)
                        $scope.map.graphics.remove($scope.newGraphic);

                    $scope.newGraphic = new esri.Graphic(
                        e.mapPoint,
                        new esri.symbol.SimpleMarkerSymbol()
                    );

                    $scope.map.graphics.add($scope.newGraphic);

                }

            } catch (e) {
                console.dir(e);
            }

        };

        // listen for click broadcasts
        /* $scope.$on("map.click", function(event, e){
          console.log("broadcast", event, e);
          console.log("Map -- ");
          console.dir($scope.map.locationLayer);
        });
        */


        $scope.toggleMap = function () {
            if ($scope.ShowMap.Display) {
                $scope.removeFilter(); //also clears location
                $scope.ShowMap.Display = false;
                $scope.ShowMap.Message = $scope.ShowMap.MessageToOpen;
            }
            else {
                $scope.ShowMap.Display = true;
                $scope.ShowMap.Message = $scope.ShowMap.MessageToClose;

                setTimeout(function () {
                    $scope.map.reposition();
                    console.log("repositioned");
                }, 400);

            }
        };

        $scope.toggleFavorite = function () {
            $scope.isFavorite = !$scope.isFavorite; //make the visible change instantly.

            $scope.results = {};

            $rootScope.Profile.toggleDatasetFavorite($scope.dataset);

            DataService.saveUserPreference("Datasets", $rootScope.Profile.favoriteDatasets.join(), $scope.results);

            var watcher = $scope.$watch('results', function () {
                if ($scope.results.done) {
                    //if something goes wrong, roll it back.
                    if ($scope.results.failure) {
                        $scope.isFavorite = !$scope.isFavorite;
                        $rootScope.Profile.toggleDatasetFavorite($scope.dataset);
                    }
                    watcher();
                }
            }, true);


        }

        $scope.refreshProjectLocations = function () {
            DataService.clearProject();
            $scope.project = null;
            $scope.project = DataService.getProject($scope.dataset.ProjectId);
        };

        $scope.reloadProjectLocations = function () {
            console.log("Inside $scope.reloadProjectLocations...");
            //console.log("$scope is next...")
            //console.dir($scope);
            //console.log("$scope.project.Locations is next...");
            //console.dir($scope.project.Locations);
            $scope.subprojectList = angular.copy($scope.subprojectList);
            //console.log("$scope.subprojectList is next...");
            //console.dir($scope.subprojectList);

            $scope.datasetLocationType = DatastoreService.getDatasetLocationType($scope.DatastoreTablePrefix);
            console.log("LocationType = " + $scope.datasetLocationType);

            //$scope.locationsArray = getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId");
            $scope.locationsArray = getMatchingByField($scope.project.Locations, $scope.datasetLocationType, "LocationTypeId");
            //console.log("$scope.locationsArray (after adding Locations based upon location type) is next...");
            //console.dir($scope.locationsArray);

            if ($scope.subprojectType === "Habitat") {
                console.log("Checking for subproject locations now...");
                angular.forEach($scope.project.Locations, function (location) {
                    ;
                    angular.forEach($scope.subprojectList, function (subproject) {
                        //console.log("subproject.ProjectId = " + subproject.ProjectId + ", $scope.project.Id = " + $scope.project.Id + ", location.ProjectId = " + location.ProjectId);
                        if ((subproject.ProjectId === $scope.project.Id) && (subproject.ProjectId === location.ProjectId) && (subproject.Id === location.SubprojectId)) {
                            console.log("Found subproject location...");
                            $scope.locationsArray.push(location);
                        }
                    });
                });

                console.log("$scope.locationsArray (after adding subproject locs) is next...");
                console.dir($scope.locationsArray);

                $scope.locationObjectIds = getLocationObjectIdsFromLocationsWithSubprojects($scope.locationsArray);
            }
            else {
                //$scope.locationObjectIds = getLocationObjectIdsByInverseType(PRIMARY_PROJECT_LOCATION_TYPEID,$scope.project.Locations);
                $scope.locationObjectIds = getLocationObjectIdsByInverseType($scope.datasetLocationType, $scope.project.Locations);
            }
            //console.log("$scope.locationObjectIds is next...");
            //console.dir($scope.locationObjectIds);

            if ($scope.map && $scope.map.locationLayer && $scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                $scope.map.locationLayer.showLocationsById($scope.locationObjectIds); //bump and reload the locations.

            //console.log("Project locations loaded!");
            //console.dir($scope.locationsArray);

        };

        $scope.reloadActivities = function () {
            $scope.activities = DataService.getActivities($routeParams.Id);
        }

        $scope.openQueryWindow = function (p) {
            $location.path("/datasetquery/" + $scope.dataset.Id);
        };

        $scope.openDetailsWindow = function (p) {
            $location.path("/dataset-details/" + $scope.dataset.Id);
        };

        $scope.openImportWindow = function () {
            $scope.activities = null; // Dump the activities to free up memory.
            $location.path("/datasetimport/" + $scope.dataset.Id);
        };

        $scope.deleteActivities = function () {
            $scope.saveResults = {};
            if (!confirm("Are you sure you want to delete " + $scope.gridOptions.selectedItems.length + " activities?  There is no undo for this operation."))
                return;

            DataService.deleteActivities($rootScope.Profile.Id, $scope.dataset.Id, $scope.gridOptions, $scope.saveResults);
            var deleteWatcher = $scope.$watch('saveResults', function () {
                if ($scope.saveResults.success) {
                    //clear selection
                    $scope.gridOptions.selectAll(false);
                    $scope.activities = DataService.getActivities($routeParams.Id); //reload from the db.
                    deleteWatcher();
                    console.log("success!");
                }
                else if ($scope.saveResults.failure) {
                    deleteWatcher();
                    console.log("failure!");
                }
            }, true);
        };

        $scope.openDataEntry = function (p) { $location.path("/dataentry/" + $scope.dataset.Id); };

        //Ok -- this is pretty ugly and non-angular-ish.  This is because in the context of a dijit I'm not sure
        //  how to get angular to process any content here... so we'll have to compose the content " by hand "
        $scope.getInfoContent = function (graphic) {
            var location = getByField($scope.locationsArray, graphic.attributes.OBJECTID, "SdeObjectId");
            $scope.map.infoWindow.setTitle(location.Label);

            var html = "";

            if (location.Description)
                html += "<i>" + location.Description + "</i><br/><br/>";

            html += "<b>Type: </b>" + location.LocationType.Name;

            if (location.Elevation)
                html += "<br/><b>Elevation: </b>" + location.Elevation;
            if (location.GPSEasting)
                html += "<br/><b>Easting: </b>" + location.GPSEasting;
            if (location.GPSNorthing)
                html += "<br/><b>Northing: </b>" + location.GPSNorthing;
            if (location.Latitude)
                html += "<br/><b>Latitude: </b>" + location.Latitude;
            if (location.Longitude)
                html += "<br/><b>Longitude: </b>" + location.Longitude;
            if (location.OtherAgencyId)
                html += "<br/><b>Other Agency Id: </b>" + location.OtherAgencyId;
            if (location.WettedWidth)
                html += "<br/><b>Wetted Width: </b>" + location.WettedWidth;
            if (location.WettedDepth)
                html += "<br/><b>Wetted Depth: </b>" + location.WettedDepth;
            if (location.RiverMile)
                html += "<br/><b>River Mile: </b>" + location.RiverMile;
            if (location.ImageLink)
                html += "<br/><br/><a href='" + location.ImageLink + "' target='_blank'><img width='200px' src='" + location.ImageLink + "'/></a>"

            if ($scope.Profile.isProjectOwner($scope.project) || $scope.Profile.isProjectEditor($scope.project))
                html += "<br/><div class='right'><a href='#/datasetimport/" + $scope.dataset.Id + "?LocationId=" + location.Id + "'>Import data</a></div>";

            return html;

        };

    }


];