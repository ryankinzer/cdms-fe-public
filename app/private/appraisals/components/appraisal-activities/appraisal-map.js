var appraisal_map = ['$scope', '$route', '$routeParams', 'DatasetService', '$uibModal', '$location', '$window', '$rootScope', 'ProjectService',
    'CommonService','UserService',
    	function ($scope, $route, $routeParams, DatasetService, $modal, $location, $window, $rootScope, ProjectService,CommonService, UserService) {
			console.log("Inside appraisalMapController...");
			console.log("$routeParams.Id = " + $routeParams.Id);

            //TODO: a nicer global route authorization scheme...
            if (!$scope.Profile.hasRole("DECD"))
                angular.rootScope.go("/unauthorized");

            $scope.parcelShowing = false;
            $scope.MapSearchResults = { 'Message': "" };

            // expose a method for handling clicks ON THE MAP - this is linked to from the Map.js directive
            $scope.click = function(e){
                $scope.map.loading = true;
                $scope.clearAll();
                $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

                $scope.map.querySelectParcel(e.mapPoint, null, function(features){

                    $scope.parcelShowing = false;
                    $scope.MapSearchResults.Message = "";

                    if (features.length == 0) { 
                      alert('No parcel found at that location.');
                      $scope.map.loading = false;
                      $scope.MapSearchResults.Message = "Not found.";
                      $scope.$apply(); //bump angular
                      return;
                    };

                    $scope.map.addParcelToMap(features[0]);

                    //show the infowindow
                    $scope.map.infoWindow.resize(250, 300);
                    $scope.map.infoWindow.setContent($scope.getInfoWindowContent(features[0]));
                    $scope.map.infoWindow.show($scope.map.selectedGraphic.geometry.getExtent().getCenter());

                    var objectid = $scope.map.selectedFeature.attributes.OBJECTID;
                    console.log("Found objectid: " + objectid);	

                    $scope.filterGridForParcel(features[0].attributes.PARCELID);

                    $scope.parcelShowing = features[0].attributes.OBJECTID;

                    $scope.$apply(); //bump angular



                });
            };

            $scope.searchParcel = function () { 
                console.log("searching for : " + $scope.SearchParcelId);

                if (!$scope.SearchParcelId)
                    return;

                $scope.SearchParcelId = $scope.SearchParcelId.toUpperCase();

                //clear
                $scope.map.clearGraphics();
                $scope.map.infoWindow.hide();
                $scope.agGridOptions.api.setFilterModel(null)
                $scope.agGridOptions.api.onFilterChanged();
                $scope.agGridOptions.api.deselectAll();
                $scope.MapSearchResults.Message = "";

                $scope.findOnMap($scope.SearchParcelId);
                $scope.filterGridForParcel($scope.SearchParcelId);
            }

            $scope.findOnMap = function (in_allotment) {
                console.log("finding on map " + in_allotment);
                $scope.parcelShowing = false;
                $scope.MapSearchResults.Message = "";

                $scope.map.queryMatchParcel(in_allotment, function (features) {
                    if (features.length == 0) {
                        console.log("allotment not found: " + in_allotment);
                        $scope.MapSearchResults.Message = "Not found on map.";
                    }
                    else {
                        //that doesn't include geometry so we need to get it
                        $scope.map.querySelectParcel(null, features[0].attributes.OBJECTID, function (geo_features) {
                            $scope.map.addParcelToMap(geo_features[0]);
                            $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic, 2);

                            //show the infowindow
                            $scope.map.infoWindow.resize(250, 300);
                            $scope.map.infoWindow.setContent($scope.getInfoWindowContent(features[0]));
                            $scope.map.infoWindow.show($scope.map.selectedGraphic.geometry.getExtent().getCenter());
                        });

                        $scope.parcelShowing = features[0].attributes.OBJECTID;
                    }
                    $scope.$apply(); //bump angular
                });

            }


            $scope.findSelection = function () { 
                console.dir($scope.agGridOptions.selectedItems[0]);
                $scope.findOnMap($scope.agGridOptions.selectedItems[0].Allotment);
            }

            $scope.clearAll = function()
            {
                //$scope.activities = $scope.allActivities;
                //$scope.filteredActivities = undefined;
                $scope.map.clearGraphics();
                $scope.map.infoWindow.hide();
                $scope.agGridOptions.api.setFilterModel(null)
                $scope.agGridOptions.api.onFilterChanged();
                $scope.agGridOptions.api.deselectAll();
                $scope.SearchParcelId = "";
                $scope.parcelShowing = false;
                $scope.MapSearchResults.Message = "";
				
            };

            $scope.getInfoWindowContent = function(feature)
            {
                var attributes = feature.attributes;
                //var location = getByField($scope.locationsArray,feature.attributes.OBJECTID,"SdeObjectId"); //is there already a location for this OBJECTID?

                //if(location)
                //    var allotment = getByField($scope.activities,location.Id,"LocationId"); //is there already an allotment associated with this location?

                $scope.map.infoWindow.setTitle(feature.attributes.PARCELID);

                var html = "";
                
                if(attributes.Address && attributes.Address.trim() != "")
                    html += "<b>Address: </b>" + attributes.Address + "<br/>";
                if(attributes.OWNERSHIPS)
                    html += "<b>Ownership: </b>" + attributes.OWNERSHIPS + "<br/>";
                if(attributes.ACRES_GIS)
                    html += "<b>Acres (GIS): </b>" + attributes.ACRES_GIS;
                
                //if(allotment && allotment.Id)
                //    html += "<br/><div class='right'><a href='#dataview/"+allotment.Id+"'>View</a></div>";
                
                return html;

            };

            $scope.filterGridForParcel = function (parcel_id) { 
                console.log(" filtering for " + parcel_id);
                var filter_component = $scope.agGridOptions.api.getFilterInstance('Allotment');
                filter_component.selectNothing();
                filter_component.selectValue(parcel_id);
                $scope.agGridOptions.api.onFilterChanged();
                //scope.dataGridOptions.api.deselectAll();

            };

            //to start an appraisal, we'll create a location for the selected parcel (with the OBJECTID from arcgis)
            // then hand off to data entry (edit) just like import.
            $scope.startAppraisal = function () {
                console.log("Find or create a location for : " + $scope.parcelShowing);

                var acres = $scope.map.selectedFeature.attributes.ACRES_GIS;

                //check to see if this location already exists in our project, if not create it.
                var project_location = getByField($scope.project.Locations, $scope.parcelShowing, "SdeObjectId");

                if (!project_location) {
                    //create a new location from the map feature selected
                    console.log("create a new location from the map feature selected");
                    var new_location = {
                        LocationTypeId: LOCATION_TYPE_APPRAISAL,
                        SdeFeatureClassId: SDE_FEATURECLASS_TAXLOTQUERY,
                        SdeObjectId: $scope.map.selectedFeature.attributes.OBJECTID,
                        Label: $scope.map.selectedFeature.attributes.PARCELID,
                    };

                    var location = CommonService.saveNewProjectLocation($scope.project.Id, new_location);

                    location.$promise.then(function () {

                        console.log("done saving project location and success!");
                        console.dir(location);


                        //bounce the user to the data entry form with that location selected.
                        $rootScope.imported_header = {
                            'Activity': { 'ActivityDate': moment().format('YYYY-MM-DD'), 'LocationId': location.Id },
                            'Acres': acres, 
                            'Allotment': location.Label,
                        };

                        $rootScope.imported_rows = {};

                        $location.path("/dataentryform/" + $scope.dataset.Id);
                    });

                } else { 
                    console.log("found a location, so handing off to edit");

                    //bounce the user to the data entry form with that location selected.
                    $rootScope.imported_header = {
                        'Activity': { 'ActivityDate': moment().format('YYYY-MM-DD'), 'LocationId': project_location.Id },
                        'Acres': acres, 
                        'Allotment': project_location.Label 
                    };

                    $rootScope.imported_rows = [];

                    $location.path("/dataentryform/"+$scope.dataset.Id);
                }

            }



/*
            
			
			// Someone clicks on an item in the grid.
            // When someone clicks an item in the grid, angular will add it to the selectedItems array, so we watch that.
            $scope.$watch('gridOptions.selectedItems', function(){

                if(!$scope.gridOptions.selectedItems || $scope.gridOptions.selectedItems.length == 0 )
                    return;

                //if clicked on the already selected one, do nothing.
                if($scope.map.selectedFeature && 
                    $scope.map.selectedFeature.attributes.OBJECTID == $scope.gridOptions.selectedItems[0].Location.SdeObjectId)
                {
                    return;
                }

                $scope.map.selectedFeature = undefined;
                $scope.map.loading = true;
				$scope.startAppraisalDisabled = true; // Disable the Start Appraisal button

  //              console.log("clicked a grid item.  querying for: ");
//                console.dir($scope.gridOptions.selectedItems[0].Location.SdeObjectId);
                var selectedAppraisal = $scope.gridOptions.selectedItems[0];
                $scope.clearAll();
                $scope.map.querySelectParcel(null,selectedAppraisal.Location.SdeObjectId, function(features){
                    $scope.map.loading = false;
                    if (features.length == 0) { 
                          //alert('No parcel polygon found that matches that appraisal.');
                          return;
                    };

                    $scope.map.addParcelToMap(features[0]);
                    $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic).then(function(){
                        //show the infowindow
                        $scope.map.infoWindow.resize(250, 300);
                        $scope.map.infoWindow.setContent($scope.getInfoWindowContent(features[0]));
                        $scope.map.infoWindow.show($scope.map.selectedGraphic.geometry.getExtent().getCenter());    
                    });

                    $scope.$apply();
                });

            },true);

            //someone clicks search on the Search button
            $scope.parcelSearch = function()
            {
                if(!$scope.parcelSearchText)
                    return;

                $scope.hasResults = true;
                $scope.map.searchResults = [];
                $scope.map.searchMessage = "Searching...";

                $scope.map.querySearchParcel($scope.parcelSearchText, function(features){
                    if(features.length == 0)
                    {
                        $scope.map.searchMessage = "No results found.";
                    }
                    else
                    {
                        angular.forEach(features, function(feature){
                            $scope.map.searchResults.push(feature.attributes);
                        });
                    }
                    $scope.$apply();
                    
                });
				$scope.startAppraisalDisabled = true; // Disable the Start Appraisal button
            }

            //when someone clicks an item in the returned list of parcels
            $scope.selectParcel = function(parcelObjectId)
            {
                $scope.map.loading = true;
                $scope.clearAll();
                $scope.map.querySelectParcel(null,parcelObjectId, function(features){
                    $scope.map.loading = false;
                    if (features.length == 0) { 
                          alert('No parcel polygon found that matches that allotment.');
                          return;
                    };

                    $scope.map.addParcelToMap(features[0]);
                    $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic).then(function(){
                        //show the infowindow
                        $scope.map.infoWindow.resize(250, 300);
                        $scope.map.infoWindow.setContent($scope.getInfoWindowContent(features[0]));
                        $scope.map.infoWindow.show($scope.map.selectedGraphic.geometry.getExtent().getCenter());    
                    });

					$scope.startAppraisalDisabled = true; // Disable the Start Appraisal button
                    $scope.$apply();
                    
                });
            };

            $scope.clearAll = function()
            {
                $scope.activities = $scope.allActivities;
                $scope.filteredActivities = undefined;
                $scope.map.clearGraphics();
                $scope.map.infoWindow.hide();
                $scope.map.selectedFeature = undefined;
                $scope.filteringActivities = false;
				$scope.startAppraisalDisabled = true;
            };
            
            
          
            //start a new appraisal record (really just an activity data entry for appraisal dataset)
            $scope.newRecord = function()
            {
                //create a new location from the map feature selected
                var new_location = {
                    LocationTypeId: LOCATION_TYPE_APPRAISAL,
                    SdeFeatureClassId: SDE_FEATURECLASS_TAXLOTQUERY,
                    SdeObjectId: $scope.map.selectedFeature.attributes.OBJECTID,
                    Label: $scope.map.selectedFeature.attributes.PARCELID,

                };
                

                var promise = CommonService.saveNewProjectLocation($scope.project.Id, new_location);
                promise.$promise.then(function(){ 
                   console.log("done and success!");

                   //reload the project locations and spin through to grab our new locationId for the one we just created.
                   $scope.refreshProjectLocations();
                   $scope.project.$promise.then(function(){
                        //grab our new locationId
                        var location = getByField($scope.project.Locations, $scope.map.selectedFeature.attributes.OBJECTID,"SdeObjectId");
                        var acres = $scope.map.selectedFeature.attributes.ACRES_GIS;
                        
                        //bounce the user to the data entry form with that location selected.
                        $location.path("/dataentryform/"+$scope.dataset.Id).search({LocationId: location.Id, Allotment: location.Label, Acres: acres});
                   });
                    
                   
                });

            };

            $scope.toggleFavorite = function(){
                $scope.isFavorite = !$scope.isFavorite; //make the visible change instantly.
                
                $scope.results = {};

                $rootScope.Profile.toggleDatasetFavorite($scope.dataset);
                
                UserService.saveUserPreference("Datasets", $rootScope.Profile.favoriteDatasets.join(), $scope.results);

                var watcher = $scope.$watch('results', function(){
                    if($scope.results.done)
                    {
                        //if something goes wrong, roll it back.
                        if($scope.results.failure)
                        {
                            $scope.isFavorite = !$scope.isFavorite; 
                            $rootScope.Profile.toggleDatasetFavorite($scope.dataset);
                        }
                        watcher();
                    }
                },true);
                

            };    

            $scope.refreshProjectLocations = function(){
                ProjectService.clearProject();
                $scope.project = null;
                $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
            };

            $scope.reloadProjectLocations = function(){
				console.log("Inside Appraisal-controller.js, $scope.reloadProjectLocations...");

                $scope.locationsArray = getMatchingByField($scope.project.Locations,LOCATION_TYPE_APPRAISAL,"LocationTypeId");

                $scope.locationObjectIds = getLocationObjectIdsByType(LOCATION_TYPE_APPRAISAL,$scope.project.Locations);
				console.log("$scope.locationObjectIds is next...");
				console.dir($scope.locationObjectIds);

				//console.log("$scope.map is next...");
				//console.dir($scope.map);
				//console.log("$scope.map.locationLayer is next...");
				//console.dir($scope.map.locationLayer);
                if($scope.map && $scope.map.locationLayer && $scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                    $scope.map.locationLayer.showLocationsById($scope.locationObjectIds); //bump and reload the locations.

                //console.log("Project locations loaded!");

            };      

            $scope.reloadActivities = function(){
                $scope.activities = DatasetService.getActivities($routeParams.Id);
            };

            $scope.openQueryWindow = function(p) {
            	$location.path("/datasetquery/"+$scope.dataset.Id);
            };

            $scope.openDetailsWindow = function(p) {
            	$location.path("/dataset-details/"+$scope.dataset.Id);
            };
            
            $scope.deleteActivities = function() {
                $scope.saveResults = {};
                if(!confirm("Are you sure you want to delete this allotment (and all associated files)?  There is no undo for this operation."))
                    return;

                //ok, well lets give them a list of all files that will be deleted along with this activity... just to make sure!
                var activities_to_delete = [];
                var num_activities = $scope.gridOptions.selectedItems.length;
                $scope.loading_progress = 0;

                angular.forEach($scope.gridOptions.selectedItems, function (activity) {
                    //console.log("loading activity : " + activity.Id);
                    DatasetService.getActivityData(activity.Id).$promise.then(function (in_activity) {
                        //console.log(" loaded! adding: ", in_activity);
                        activities_to_delete.push(in_activity);
                        $scope.loading_progress++;
                    });
                });

                var progress_watcher = $scope.$watch('loading_progress', function () {

                    //console.log("Progress watcher: " + num_activities + " + " + $scope.loading_progress);

                    if ($scope.loading_progress < num_activities)
                        return;

                    progress_watcher();

                    var files_to_delete = getFilenamesForTheseActivities($scope.dataset, activities_to_delete);
                    //console.log("ok! files we got back: " + files_to_delete);

                    //if there are no files to delete, just go ahead, otherwise confirm
                    if (files_to_delete != null)
                        if (!confirm("Last chance! - Deleting this allotment will also permanently delete the following files: " + files_to_delete))
                            return;

                    DatasetService.deleteActivities($rootScope.Profile.Id, $scope.dataset.Id, $scope.gridOptions, $scope.saveResults);

                });

                
                var deleteWatcher = $scope.$watch('saveResults', function(){
                    if($scope.saveResults.success)
                    {
                        $scope.activities = undefined;
                        $route.reload();
                    }
                    else if($scope.saveResults.failure)
                    {
                        deleteWatcher();
                        console.log("failure! there was a problem deleting a record...");
                    }
                },true);
            };


            $scope.openDataEntry = function (p) {
                $location.path("/dataentry/" + $scope.dataset.Id);
            };

            

            //This is very specific to this appraisal page... might be nice to make this pluggable or something. --even just use a partial?
            $scope.getInfoWindowContent = function(feature)
            {
                var attributes = feature.attributes;
                var location = getByField($scope.locationsArray,feature.attributes.OBJECTID,"SdeObjectId"); //is there already a location for this OBJECTID?

                if(location)
                    var allotment = getByField($scope.activities,location.Id,"LocationId"); //is there already an allotment associated with this location?

                $scope.map.infoWindow.setTitle(feature.attributes.PARCELID);

                var html = "";
                
                if(allotment && allotment.headerdata.CobellAppraisalWave)
                    html += "<b>Wave: </b>" + allotment.headerdata.CobellAppraisalWave + "<br/>";
                if(allotment && allotment.headerdata.AllotmentStatus)
                    html += "<b>Appraisal Status: </b>" + allotment.headerdata.AllotmentStatus + "<hr/>";

                if(attributes.Address && attributes.Address.trim() != "")
                    html += "<b>Address: </b>" + attributes.Address + "<br/>";
                if(attributes.OWNERSHIPS)
                    html += "<b>Ownership: </b>" + attributes.OWNERSHIPS + "<br/>";
                if(attributes.ACRES_GIS)
                    html += "<b>Acres (GIS): </b>" + attributes.ACRES_GIS;
                
                if(allotment && allotment.Id)
                    html += "<br/><div class='right'><a href='#dataview/"+allotment.Id+"'>View</a></div>";
                
                return html;

            };


*/

		}


];

