//modal to edit location
var modal_edit_location = ['$scope', '$uibModal','$uibModalInstance','GridService','CommonService',

    function ($scope, $modal, $modalInstance, GridService, CommonService) {

        $scope.mode = "edit";

        if (!$scope.row.Id) {
            $scope.mode = "new";
        }

        $scope.save = function () {

            var payload = {
                'ProjectId' : $scope.project.Id,
                'Location' : $scope.row,
            };

            //OK -- if we are saving a NEW location then start off by adding the point to the featurelayer
            if (!$scope.row.Id) {
                console.log("Adding a NEW location -- $scope.row.Id = " + $scope.row.Id);

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

                            var new_location = CommonService.saveNewProjectLocation($scope.project.Id, $scope.row);
                            new_location.$promise.then(function () {
                                console.log("done and success!");
                                //$scope.refreshProjectLocations();
                                $modalInstance.close(new_location);
                            });

                        }
                        else {
                            $scope.SaveMessage = "There was a problem saving that location.";
                            console.dir(results);
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

                var new_location = CommonService.saveNewProjectLocation($scope.project.Id, save_row);
                new_location.$promise.then(function () {
                    //success
                    $modalInstance.close(new_location);
                },
                    function (data) {
                        //failed
                        $scope.SaveMessage = "There was a problem saving that location.";
                        console.dir(data);
                    });
            }
          
        };

        //used as a filter to exclude the edit link - only show bonafide fields
        $scope.hasDbColumnName = function (field) {
            return field.hasOwnProperty('DbColumnName');
        }

        $scope.onHeaderEditingStopped = function (field) { 
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

        };

        //fire validation for all columns when we load (if we are editing)
        if ($scope.mode === 'edit') {
            $scope.dataGridOptions.columnDefs.forEach(function (field) {
                $scope.onHeaderEditingStopped(field);
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
