//modal to edit location
var modal_edit_location = ['$scope', '$uibModal','$uibModalInstance','GridService','CommonService','Upload','ProjectService',

    function ($scope, $modal, $modalInstance, GridService, CommonService, $upload, ProjectService) {

        $scope.mode = "edit";

        if (!$scope.row.Id) {
            $scope.mode = "new";
        }

        modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.project.Files); 

        $scope.save = function () {

            require([
                'esri/symbols/SimpleMarkerSymbol',
                'esri/graphic',
                'esri/SpatialReference',
                'esri/tasks/GeometryService',
                'esri/geometry/Point',
                'esri/tasks/ProjectParameters',

                ], function (SimpleMarkerSymbol, Graphic, SpatialReference, GeometryService, Point, ProjectParameters) {

                if ($scope.row.LocationTypeId === LOCATION_TYPE_Hab){
                    alert("You cannot save a Habitat location here; this must be done via the Project->Data->Dataset Name Sites page.");
                    return;
                }

                var payload = {
                    'ProjectId': $scope.project.Id,
                    'Location': $scope.row,
                };

                //OK -- if we are saving a NEW location then start off by adding the point to the featurelayer
                if ($scope.map && !$scope.row.Id) {
                    console.log("Adding a NEW location...");

                    $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

                    //nad83 zone 11...  might have to have this as alist somehwere...
                    var inSR = new SpatialReference({ wkt: NAD83_SPATIAL_REFERENCE });
                    var outSR = new SpatialReference({ wkid: 102100 })
                    var geometryService = new GeometryService(GEOMETRY_SERVICE_URL);
                    $scope.newPoint = new Point($scope.row.GPSEasting, $scope.row.GPSNorthing, inSR);

                    //convert spatial reference
                    var PrjParams = new ProjectParameters();

                    PrjParams.geometries = [$scope.newPoint];
                    // PrjParams.outSR is not set yet, so we must set it also.
                    PrjParams.outSR = outSR;

                    //throw "Stopping right here...";

                    //do the projection (conversion)
                    geometryService.project(PrjParams, function (outputpoint) {

                        $scope.newPoint = new Point(outputpoint[0], outSR);
                        $scope.newGraphic = new Graphic($scope.newPoint, new SimpleMarkerSymbol());
                        $scope.map.graphics.add($scope.newGraphic);

                        //add the graphic to the map and get SDE_ObjectId
                        $scope.map.locationLayer.applyEdits([$scope.newGraphic], null, null).then(function (results) {
                            if (results[0].success) {
                                $scope.row.SdeObjectId = results[0].objectId;
                                console.log("Created a new point! " + $scope.row.SdeObjectId);

                                var data = {
                                    ProjectId: $scope.project.Id,
                                };

                                var target = '/api/v1/file/UploadProjectFile';

                                $scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.

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
                    var data = {
                        ProjectId: $scope.project.Id,
                    };

                    // Capture the old SdeObjectId, so we can delete it later.
                    $scope.OldSdeObjectId = $scope.row.SdeObjectId;

                    var inSR = new SpatialReference({ wkt: NAD83_SPATIAL_REFERENCE });
                    var outSR = new SpatialReference({ wkid: 102100, latestWkid:3857 })
                    var geometryService = new GeometryService(GEOMETRY_SERVICE_URL);
                    $scope.newPoint = new Point($scope.row.GPSEasting, $scope.row.GPSNorthing, inSR);

                    //convert spatial reference
                    var PrjParams = new ProjectParameters();

                    PrjParams.geometries = [$scope.newPoint];
                    // PrjParams.outSR is not set yet, so we must set it also.
                    PrjParams.outSR = outSR;

                    //throw "Stopping right here...";

                    //do the projection (conversion)
                    geometryService.project(PrjParams, function (outputpoint) {

                        $scope.newPoint = new Point(outputpoint[0], outSR);
                        $scope.newGraphic = new Graphic($scope.newPoint, new SimpleMarkerSymbol());
                        $scope.map.graphics.add($scope.newGraphic);
                        
                        var attributes = {OBJECTID: $scope.row.SdeObjectId};

                        $scope.map.locationLayer.applyEdits([$scope.newGraphic], null, null).then(function (addResults) {
                            if (addResults[0].success) {
                                $scope.row.SdeObjectId = addResults[0].objectId;
                                console.log("Added new point! " + $scope.row.SdeObjectId);

                                //throw "Stopping right here...";

                                var attributes = {
                                    OBJECTID: $scope.OldSdeObjectId
                                }
                                var deleteGraphic = new Graphic($scope.newPoint, null, attributes);

                                // Note:  You cannot just pass the point to delete; they must be in a graphic object,
                                //        or the code dies in dojo-land, which is different than what is shown in 
                                //        ArcGIS documenation on the service interface.
                                //$scope.map.locationLayer.applyEdits(null, null, pointsToDelete).then(function (deleteResults) {
                                //$scope.map.locationLayer.applyEdits(null, null, $scope.aryDeletes).then(function (deleteResults) {
                                $scope.map.locationLayer.applyEdits(null, null, [deleteGraphic], function (addResults, updateResults, deleteResults) {

                                    //var query = new Query();
                                    //query.objectIds = [deletes[0].objectId];
                                    //$scope.map.locationLayer.selectFeatures(query, )
                                    console.log("deleteResults is next...");
                                    console.dir(deleteResults[0]);

                                    //.then(function (deleteResults) {
                                    if (deleteResults[0].length === 0)
                                    {
                                        $scope.SaveMessage = "The location did not exist in SDE.";
                                        console.dir(deleteResults);
                                    }
                                    else if (deleteResults[0].success) {                                       
                                        console.log("Deleted old point in sdevector! " + $scope.row.SdeObjectId);

                                        //CommonService.UpdateLocationAction($scope.project.Id, $scope.row.Id, $scope.row.SdeObjectId, $scope.OldSdeObjectId);
                                        CommonService.updateLocationAction($scope.project.Id, $scope.row.Id, $scope.row.SdeObjectId);
                                    }
                                    else {
                                        $scope.SaveMessage = "There was a problem deleting that location.";
                                        console.dir(deleteResults);
                                    }
                                }, function (err) {
                                    console.log("Apply Edits - Delete - failed:  " + err.message);
                                });
                                
                                //throw "Stopping right here...";

                                var data = {
                                    ProjectId: $scope.project.Id,
                                };

                                var target = '/api/v1/file/UploadProjectFile';
                                $scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
                            }
                            else {
                                $scope.SaveMessage = "There was a problem adding the new location.";
                                console.dir(addResults);
                            }
                            

                        });
                    });

                    var target = '/api/v1/file/UploadProjectFile';

                    $scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.

                }
            }); //require
          
        };

        //call back from save above once the files are done processing and we're ready to save the item
        $scope.modalFile_saveParentItem = function (saveRow) {

            saveRow.LocationType = undefined;
            saveRow.WaterBody = undefined;

            var new_location = CommonService.saveNewProjectLocation($scope.project.Id, saveRow);
            new_location.$promise.then(function () {
                console.log("done and success!");
                $modalInstance.close(new_location);
            });
        };

        //callback that is called from modalFile to do the actual file removal (varies by module)
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            console.dir(file_to_remove);
            return ProjectService.deleteFile($scope.project.Id, file_to_remove);
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
            console.log("Location Id = " + $scope.$parent.row.Id);

            $scope.dataGridOptions.columnDefs.forEach(function (field) {
                $scope.onHeaderEditingStopped(field);
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
