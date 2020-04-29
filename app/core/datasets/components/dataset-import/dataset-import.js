var dataset_import = ['$scope', '$routeParams', 'ProjectService', 'CommonService', 'SubprojectService', 'DatasetService',
    '$location', '$rootScope',
    'Logger', '$route', '$uibModal', 'ChartService', 'ServiceUtilities','Upload',
    function ($scope, $routeParams, ProjectService, CommonService, SubprojectService, DatasetService, $location,
        $rootScope, Logger, $route, $modal, ChartService, ServiceUtilities, Upload) {

        //our upload tool is: https://github.com/danialfarid/ng-file-upload

        $scope.ActivityFields = {
            QAComments: DEFAULT_IMPORT_QACOMMENT,
            ActivityDate: new Date()
        };

        $scope.UploadResults = {};
        $scope.UploadResults.errors = [];
        $scope.file = $scope.files = null;
        $scope.mapping = [];
        delete $rootScope.imported_rows;

        $scope.dataset = DatasetService.getDataset($routeParams.Id);
        $scope.dataset.$promise.then(function () {

            $scope.mappableFields = $scope.getMappableFields();

            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
            $scope.project.$promise.then(function () {
                //if user can not edit this project, redirect to unauthorized.
                if (!$rootScope.Profile.canEdit($scope.project)) {
                    angular.rootScope.go("/unauthorized");
                }

                //load the config so that we can check if we are supposed to include the habitat sites in this project's locations                        
                try {
                    $scope.project.Config = ($scope.project.Config) ? angular.fromJson($scope.project.Config) : {};
                } catch (e) { 
                    console.error("config could not be parsed for project" + $scope.project.Config);
                    console.dir(e);
                }

                //do we need to pull in habitat site locations?
                if ($scope.project.Config && $scope.project.Config.ShowHabitatSitesForDatasets && $scope.project.Config.ShowHabitatSitesForDatasets.contains($scope.dataset.Name)) { 
                    $scope.project.Locations.forEach(function (loc) {
                        if (loc.LocationTypeId == LOCATION_TYPE_Hab) {
                            //switch the type to say "it is one of us" and add the label...
                            loc.LocationTypeId = $scope.dataset.Datastore.LocationTypeId;
                            loc.Label = loc.Label + " (Hab Site)";
                        }
                    });
                }


            });
        });

        //TODO: might not need this at all...
        $scope.onUploadFileSelect = function (selected_file) {
            //$files: an array of files selected, each file has name, size, and type.
            console.dir(selected_file);

            if (!selected_file)
                return

            if (selected_file.type !== "application/vnd.ms-excel" && selected_file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                console.warn("Not an excel file?");

        };

        $scope.cancel = function () {
            $location.path("/activities/" + $scope.dataset.Id);
        };

        $scope.uploadFile = function () {
            $scope.loading = true;
            console.log("serviceUrl = " + serviceUrl);
            if (typeof $scope.project.Id !== 'undefined')
                console.log("project.Id = " + $scope.project.Id);
            else
                console.log("project.Id is not set.  User should go to dataset activities page first.");

            console.log("startOnLine = " + $scope.startOnLine);
            console.log("file...");
            console.dir($scope.file);
            $scope.upload = Upload.upload({
                url: serviceUrl + '/api/v1/import/uploadimportfile',
                method: "POST",
                data: {
                    ProjectId: $scope.project.Id,
                    DatasetId: $scope.dataset.Id,
                    Title: $scope.file.name,
                    Description: "Uploaded file " + $scope.file.name,
                    StartOnLine: $scope.startOnLine
                },
                file: $scope.file,
            }).progress(function (evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function (data) {
                // file is uploaded successfully

                console.log("success!");
                //console.dir(data);

                var objdata = angular.fromJson(data);
                $scope.UploadResults.Fields = objdata.columns;
                $scope.UploadResults.Data = objdata.rows;
                //$scope.UploadResults.DataCleaned = [];
                //objdata.rows.forEach( function (row){
                //    console.dir(row);
                //    $scope.UploadResults.DataCleaned.push(row.ItemArray);
                //});

                $scope.loading = false;
                $scope.enablePreview = true;

                console.log("$scope.UploadResults is next...");
                //console.dir($scope.UploadResults);
                
                $scope.afterFileUploaded();

            }).error(function (data) {
                    //$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
                    var errorStem = "There was a problem uploading your file.\n";

                    var errorSpecificPart1 = "";
                    if ($scope.file.name.indexOf(".xls") < 0)
                        errorSpecificPart1 = "The form says the column headers start on line " + $scope.startOnLine + ".  Is this correct?  ";

                    var errorSpecificPart2 = "Also verify that the date/time entries are in 24-hour format.  ";
                    var errorSpecificPart3 = "Specific error from backend:  " + $scope.upload.$$state.value.data.InnerException.ExceptionMessage;
                    var intCutoffLocation = errorSpecificPart3.indexOf(" at"); // Note the space in front (" at")
                    // We want to strip off " at this file/method", but we want to keep "date".

                    errorSpecificPart3 = errorSpecificPart3.substr(0, intCutoffLocation);
                    //$scope.uploadErrorMessage = errorStem + errorSpecificPart1 + errorSpecificPart2;
                    $scope.uploadErrorMessage = errorStem + errorSpecificPart1 + errorSpecificPart2 + errorSpecificPart3;
                    console.log("$scope.upload next...");
                    console.dir($scope.upload);
                    $scope.loading = false;
                });
            //.then(success, error, progress);
        };

        $scope.afterFileUploaded = function(){

            if (Array.isArray($scope.UploadResults.Fields)) {
                if ($scope.UploadResults.Fields.length == 0) {
                    $scope.uploadErrorMessage = "No columns headers were found in the file. Please make sure the column headers are in the first row of your file and try again.";
                }

                $scope.UploadResults.Fields.forEach(function (field_in) {
                    var field_in_compare = field_in.trim().toUpperCase();
                    for (var i = $scope.mappableFields.length - 1; i >= 0; i--) {

                        //console.log("Comparing: " + $scope.mappableFields[i].Label.toUpperCase() + " and " + field_in_compare);

                        if ($scope.mappableFields[i].Label.toUpperCase() === field_in_compare) {
                            $scope.mapping[field_in] = $scope.mappableFields[i];
                            return;
                        }
                    };

                    //only reaches here if we didn't find a label match
                    $scope.mapping[field_in] = $scope.mappableFields[0];

                });
            }
        }

        //return the mappable fields (header + details)
        $scope.getMappableFields = function()
		{	
			var mappableFields = [];
			mappableFields.push({ Label: MAP_DO_NOT_MAP_VALUE });
            mappableFields.push({ Label: MAP_ACTIVITY_DATE });
            mappableFields.push({ Label: MAP_LOCATION });   

            $scope.dataset.Fields.sort(orderByAlpha).forEach(function (field, index) { 

                //skip Location and ActivityDate because these are special mapped fields above..
                if (field.DbColumnName != 'ActivityDate' && field.DbColumnName != 'LocationId') {
                    field.Label = (field.Field.Units) ? field.Label + " (" + field.Field.Units + ")" : field.Label;
                    if (field.Field.PossibleValues) { 
                        field.PossibleValues = getJsonObjects(field.Field.PossibleValues);
                    }
                    mappableFields.push(field);
                }

            });
			
			return mappableFields;
		};

        $scope.selectMapColumn = function(column_name) { 
            console.log("selected: " + column_name);
            console.dir($scope.mapping[column_name]);
            console.dir($scope.UploadResults);
            console.dir($scope.mapping);
        };


        //convert the incoming data rows to a format we can pass on to dataentry
        $scope.previewUpload = function () {
            $scope.enablePreview = false;
            $scope.importing = true;

            //console.dir($scope.mapping);

            //gets all rows with mapped data, ready for the grid
            $scope.imported_rows = $scope.getRowsToImport();

            //if we are importing a single activity, we hand off to the edit page, 
            //  otherwise, map the locations and show the multiple-activity grid

            //are we mapping an activitydate+location? If so, then are handling multiple activities
            if ($scope.hasFieldMapped(MAP_LOCATION) || $scope.hasFieldMapped(MAP_ACTIVITY_DATE)) {

                $scope.importing = false; //turn off the fishies, they are distracting

                //if ($scope.hasFieldMapped(MAP_LOCATION)) {
                    $scope.openLocationMappingModal();
                //} else {
                //    $scope.openActivityGridModal();
                //}

            } else {
                //set rootscope and hand-off to dataset entry form
                $rootScope.imported_rows = $scope.imported_rows;
                $rootScope.imported_header = $scope.imported_header;
                angular.rootScope.go("/dataentryform/" + $scope.dataset.Id);
            }
        }

        $scope.hasFieldMapped = function (field_mapped) {
            var hasFieldMapped = false;
            Object.keys($scope.mapping).forEach(function (col) {
                var field = $scope.mapping[col];
                if (field.Label === field_mapped)
                    hasFieldMapped = true;
            });
            return hasFieldMapped;
        }

        //returns imported_rows
        // with each row as an object, mapped to cdms fields, ready to use as a grid datasource.
        $scope.getRowsToImport = function () { 

            var imported_rows = [];
            $scope.imported_header = {};
            var default_activitydate = moment().format('YYYY-MM-DDTHH:mm:ss');

            $scope.UploadResults.Data.forEach( function(data_row){
                //console.log("data_row is next...");
				//console.dir(data_row);
                
				//set default Row QA StatusId
				var new_row = {
                    Activity: { 'ActivityDate' : default_activitydate },
                    data_row_hasdata: false,
                    QAStatusId: ($scope.dataset.DefaultRowQAStatusId) ? $scope.dataset.DefaultRowQAStatusId : 1  //default to OK
				};

				// On each row of imported data (data_row), we only want to pull in the fields we have mapped.
				// Therefore, we loop through $scope.mapping, which contains those fields.
                Object.keys($scope.mapping).forEach(function (col) {
                    var field = $scope.mapping[col];

                    //console.dir(field);
                    //console.dir(col);
                    if (field.Label !== MAP_DO_NOT_MAP_VALUE) {

                        //just ditch if it is an empty value
                        if (data_row[col] === null || data_row[col] === "") {
                            return;
                        } else if (field.FieldRoleId == FIELD_ROLE_DETAIL) { //if we have data and we are a detail field then note that we have data. later, if there are no detail data we won't include a detail row.
                            new_row.data_row_hasdata = true;
                        }

                        // Handle control types*******************************************************
                        if (field.ControlType == "number") {
                            //if (!isNumber(data_row[col])) {
                            //    console.warn("ignoring: " + field.DbColumnName + " is a number field but value is not a number: " + data_row[col]);
                            //    return; //don't set this as a value
                            //}
                            new_row[field.DbColumnName] = data_row[col]; 
                        }
                        else if (field.ControlType == "multiselect") {
                            new_row[field.DbColumnName] = [];

                            //split on commas -- if any
                            //console.log("typeof data_row[col] = " + typeof data_row[col]);
                            if (typeof data_row[col] === 'string') {
                                var row_items = data_row[col].trim().split(",");

                                for (var a = 0; a < row_items.length; a++) {
                                    var row_item = row_items[a].trim();
                                    new_row[field.DbColumnName].push(row_item);
                                }
                            } else { 
                                console.warn("multiselect field with a value that isn't a string: " + field.DbColumnName);
                            }

                        }
                        //else if (field.ControlType === "select" && data_row[col] && typeof data_row[col] === "string") {
                        else if ((field.ControlType === "select" || field.ControlType === "select-number" || field.ControlType === "fisherman-select")
                            && data_row[col] && typeof data_row[col] === "string") {
                            //map select value - 
                            
                            //IF the value actually matches VALUE in PV then map the ID of the PV...
                            if (field.PossibleValues && !Array.isArray(field.PossibleValues) && typeof field.PossibleValues === 'object') {
                                if (!field.PossibleValues[data_row[col]]) {  //if this fails, the value isn't a key in the PV, so try the value
                                    Object.keys(field.PossibleValues).forEach(function (key) { 
                                        if (field.PossibleValues[key] == data_row[col]) {
                                            //console.log(" found that " + key + " is the key for " + data_row[col]);
                                            data_row[col] = key; //actually CHANGE the incoming value to the KEY value. (fisherman id in place of fisherman name, etc.)
                                        }
                                    });
                                }
                            }

                            new_row[field.DbColumnName] = data_row[col];
                        }
                        else if (field.ControlType == "datetime" || field.ControlType == "time") {
                            try {
                                if (data_row[col]) {
                                    var d = moment(data_row[col]);
                                    new_row[field.DbColumnName] = d.format('YYYY-MM-DDTHH:mm:ss');
                                    //console.log(" --- here we are comparing our datetimes... ---");
                                    //console.log(field.ControlType + " - " + field.DbColumnName + " = " + data_row[col]);
                                    //console.dir(d.format('YYYY-MM-DDTHH:MM'));
                                }
                            }
                            catch (e) {
                                console.log("problem converting datetime: " + data_row[col]);
                                console.dir(e);
                            }

                        }
                        else //just add the value to the cell
                        {
                            if (field.Label == MAP_LOCATION) {
                                new_row['Activity']['Location'] = data_row[col];
                                new_row['Activity']['QAStatusId'] = $scope.dataset.DefaultActivityQAStatusId;
                            } else if (field.Label == MAP_ACTIVITY_DATE) {
                                new_row['Activity']['ActivityDate'] = data_row[col];
                                new_row['Activity']['QAStatusId'] = $scope.dataset.DefaultActivityQAStatusId;
                            } else {
                                new_row[field.DbColumnName] = data_row[col]; //default mapping
                            }

                        }

                        //map to header if its the first one
                        if (field.FieldRoleId == FIELD_ROLE_HEADER && !$scope.imported_header.hasOwnProperty(field.DbColumnName)) {
                            $scope.imported_header[field.DbColumnName] = new_row[field.DbColumnName];
                            //console.log("Adding a field to import header: " + field.DbColumnName);
                        }

                        //console.dir(new_row);

                    }//if is mapped

                }); //iterate mappings
			
                imported_rows.push(new_row);

			}); //foreach data row
            //console.dir(imported_rows);
            return imported_rows;

        };


        $scope.openLocationMappingModal = function () { 
            
            $scope.locationsToMap = $scope.getLocationsToMap();
            //console.dir($scope.locationsToMap);
            $scope.mappedLocations = {}; //the locations will be mapped into here { "datalocation" : project.Location object }

            //pre-populate our matches if we can find them...
            $scope.locationsToMap.forEach(function (data_location) {
                $scope.project.Locations.forEach(function (location) { 
                    if (location.Label == data_location) {
                        //console.log("found one!: " + location.Label + " - " + data_location.Id);
                        $scope.mappedLocations[data_location] = location.Id;
                    }
                });
            });

            //console.dir($scope.mappedLocations);
            

            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-import/templates/modal-map-locations.html',
                controller: 'ModalMapLocationsCtrl',
                scope: $scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved) { 

                //console.dir($scope.mappedLocations);
                $scope.imported_rows.forEach(function (data_row) {

                    var the_loc = $scope.mappedLocations[data_row['Activity']['Location']];

                    if ($scope.mappedLocations.hasOwnProperty("Map all rows to:")) {    //this is the case when a location column is not specified but activity date is.
                        the_loc = $scope.mappedLocations["Map all rows to:"];
                    }

                    data_row['Activity']['LocationId'] = the_loc; //map the location of the incoming data to the one they've mapped
                    //console.log(" Mapped location - " + the_loc);
                    //console.dir(data_row);
                });  

                $scope.openActivityGridModal();
                
            },
            function (dismissed) { 
                $scope.enablePreview = true;
                $scope.importing = false;
            });

        };


        $scope.openActivityGridModal = function () { 

            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-import/templates/modal-activities-grid.html',
                controller: 'ModalActivitiesGridCtrl',
                scope: $scope, //very important to pass the scope along...
                windowClass: 'modal-large',
                backdrop  : 'static',
                keyboard  : false
            }).result.then(function (saved) { 
                $location.path("/activities/" + $scope.dataset.Id);
            },
            function (dismissed) { 
                $scope.enablePreview = true;
                $scope.importing = false;
            });

        };



        //iterate all incoming data and make a list of the unique locations
        $scope.getLocationsToMap = function () { 

            var locations = [];

            //get the mapped field column name
            Object.keys($scope.mapping).forEach(function (col) {
                var field = $scope.mapping[col];
                if (field.Label === MAP_LOCATION) {
                    //got the field that was mapped to location. now look for unique values in that column:
                    $scope.UploadResults.Data.forEach(function (data_row) {
                        var in_location = ""+data_row[col];
                        if (in_location != "" && !locations.contains(in_location))
                            locations.push(in_location);
                    });
                }
            });
    
            //if we have no locations, add a blank one we'll use to map all the activities to
            if (locations.length == 0) {
                locations.push("Map all rows to:");
            }

            //console.dir(locations);
            return locations;

        };

	}
];