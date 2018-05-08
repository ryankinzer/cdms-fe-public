
//modal that handles both saving and editing locations on a project
var modal_add_location = ['$scope', '$modalInstance', 'DatasetService', 'ProjectService', 'CommonService',
    function ($scope, $modalInstance, DatasetService, ProjectService, CommonService) {

        //if $scope.selectedLocation is set then we are EDITING, otherwise CREATING
        if ($scope.selectedLocation) {
            $scope.headingMessage = "Editing existing location";
            $scope.row = $scope.selectedLocation;
        }
        else {
            $scope.headingMessage = "Create new location for a project"; //default mode =
            $scope.row = angular.copy(DEFAULT_LOCATION_PROJECTION_ZONE);
        }


        $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
        $scope.locationTypes = CommonService.getLocationTypes();
        $scope.waterbodies = CommonService.getWaterBodies();

        $scope.save = function () {
            console.log("Inside ModalAddLocationCtrl, save...");

            //tribal CDMS just needs to create a location and be done (no arcgis point)
            if (typeof TRIBALCDMS_TEMPLATE !== 'undefined') {
                var promise = CommonService.saveNewProjectLocation($scope.project.Id, $scope.row);
                promise.$promise.then(function () {
                    console.log("done and success!");
                    $scope.refreshProjectLocations();
                    $modalInstance.dismiss();
                });
                return;
            }


            //otherwise we are using ARCGIS Server and Easting/Northings (CTUIR) and need to create a point in the layer


            if (!$scope.row.GPSEasting || !$scope.row.GPSNorthing) {
                $scope.locationErrorMessage = "Please enter an Easting and a Northing for this point.";
                return;
            }

            // Clean-up, just in case we had an error and then the user supplied the necessary info.
            $scope.locationErrorMessage = undefined;

            //OK -- if we are saving a NEW location then start off by adding the point to the featurelayer
            if (!$scope.row.Id) {
                console.log("$scope.row.Id = " + $scope.row.Id);
                //OK so lets move their point to the Easting/Northing they entered.

                //if they had already clicked somewhere, remove that point.
                if ($scope.newGraphic)
                    $scope.map.graphics.remove($scope.newGraphic);

                $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

                //nad83 zone 11...  might have to have this as alist somehwere...
                var inSR = new esri.SpatialReference({ wkt: NAD83_SPATIAL_REFERENCE });
                var outSR = new esri.SpatialReference({ wkid: 102100 })
                var geometryService = new esri.tasks.GeometryService(GEOMETRY_SERVICE_URL);
                $scope.newPoint = new esri.geometry.Point($scope.row.GPSEasting, $scope.row.GPSNorthing, inSR);

                //convert spatial reference
                var PrjParams = new esri.tasks.ProjectParameters();

                PrjParams.geometries = [$scope.newPoint];
                // PrjParams.outSR is not set yet, so we must set it also.
                PrjParams.outSR = outSR;

                //do the projection (conversion)
                geometryService.project(PrjParams, function (outputpoint) {

                    $scope.newPoint = new esri.geometry.Point(outputpoint[0], outSR);
                    $scope.newGraphic = new esri.Graphic($scope.newPoint, new esri.symbol.SimpleMarkerSymbol());
                    $scope.map.graphics.add($scope.newGraphic);

                    //add the graphic to the map and get SDE_ObjectId
                    $scope.map.locationLayer.applyEdits([$scope.newGraphic], null, null).then(function (results) {
                        if (results[0].success) {
                            $scope.row.SdeObjectId = results[0].objectId;
                            console.log("Created a new point! " + $scope.row.SdeObjectId);

                            var promise = CommonService.saveNewProjectLocation($scope.project.Id, $scope.row);
                            promise.$promise.then(function () {
                                console.log("done and success!");
                                $scope.refreshProjectLocations();
                                $modalInstance.dismiss();
                            });

                        }
                        else {
                            $scope.locationErrorMessage = "There was a problem saving that location.";
                        }

                    });
                });
            }
            else //updating an existing...
            {
                //need to remove these info objects for saving
                var save_row = angular.copy($scope.row);
                save_row.LocationType = undefined;
                save_row.WaterBody = undefined;

                var promise = CommonService.saveNewProjectLocation($scope.project.Id, save_row);
                promise.$promise.then(function () {
                    //success
                    $scope.reloadActivities();
                    $modalInstance.dismiss();
                },
                    function () {
                        //failed
                        $scope.locationErrorMessage = "There was a problem saving that location.";
                    });
            }

            $scope.map.infoWindow.hide();
            if ($scope.newGraphic)
                $scope.map.graphics.remove($scope.newGraphic);


        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];

