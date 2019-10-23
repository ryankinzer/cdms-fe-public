//controller for the waypoints loading process.

var modal_waypoint_files = ['$scope', '$uibModalInstance', 'DatasetService', '$rootScope',
    function ($scope, $modalInstance, DatasetService, $rootScope) {

        $scope.getWaypointHeaders = function () {
            $scope.system.loading = true;
            var formData = new FormData();

            var hasFilesToUpload = true;

            if (!Array.isArray($scope.filesToUpload[$scope.file_field]) || $scope.filesToUpload[$scope.file_field].length == 0)
            {
                hasFilesToUpload = false;
                $scope.filesToUpload[$scope.file_field] = [];
            }

            var errors = [];

            console.log("$scope.filesToUpload is next...");
            console.dir($scope.filesToUpload);
            console.dir($scope.currentFiles);
            console.dir($scope.removedFiles);
            //console.dir(formdata);

            angular.forEach($scope.filesToUpload[$scope.file_field], function (incoming_file, key) {
                formData.append('file', incoming_file);
            });

            if (hasFilesToUpload) {
                console.log(" --> we have files to upload <--");
                var filesReadyToUpload = [];

                //remove any duplicates
                $scope.filesToUpload[$scope.file_field].forEach(function (incoming_file, key) {
                    if (isDuplicateUploadFile(incoming_file, $scope.modalFiles_filesToCheckForDuplicates)) {
                        $scope.foundDuplicate = true;
                        errors.push("Ignoring: " + incoming_file.Name + " - file already exists." + "\n");
                    } else {

                        filesReadyToUpload.push(incoming_file);

                        //add to the currentfiles ONLY if the file is one coming from this field in the row...
                        //if (isFileInList(incoming_file, $scope.file_row.fieldFilesToUpload[$scope.file_field])) {
                        //    //add to our current files for display once they close this modal
                        //    $scope.currentFiles.push(incoming_file);
                        //}
                    }
                });

                //set our uploads to only files that are ready.
                $scope.filesToUpload[$scope.file_field] = filesReadyToUpload;

                // Inform the user we've removed their duplicate files.
                if ($scope.foundDuplicate) {
                    console.warn(errors);
                    alert(errors);
                }
            }

            //throw "Stopping right here...";

            $.ajax({
                url: serviceUrl + '/api/v1/file/getwaypointscolheaders',
                type: 'POST',
                data: formData,
                processData: false,  // tell jQuery not to process the data
                contentType: false,  // tell jQuery not to set contentType
                success: function (data) {

                    //var waypoints = eval("(" + data + ")");
                    var headerFields = eval("(" + data + ")");
                    //$scope.headerFields = eval("(" + data + ")");

                    //console.log(waypoints);

                    var size = 0, key;

                    //for (key in waypoints)
                    for (key in headerFields)
                    {
                    //for (key in $scope.headerFields)
                        size++;
                    }

                    alert(size + " headerFields loaded");

                    //if ($scope.headerFields !== null)
                    //if (headerFields !== null)
                    //{
                        //var theHeaderFields = makeObjects($scope.headerFields, 'Id', 'Name');
                        //var theHeaderFields = makeObjects(headerFields, 'Id', 'Name');

                        //headerFields = makeObjects(headerFields, 'Id', 'Name');
                        //$scope.headerFields = angular.copy(theHeaderFields);
                    //}

                    //$rootScope.waypoints = $scope.waypoints = waypoints;
                    $rootScope.headerFields = $scope.headerFields = headerFields;
                    $scope.system.loading = false;
                    $scope.$apply();
                },
                error: function (jqXHR, error, errorThrown) {
                    if (jqXHR.status && jqXHR.status == 400) {
                        alert(jqXHR.responseText + "\n\n" + "header row not loaded!");
                    } else {
                        alert("Error uploading file!");
                    }
                }
            });

            //$scope.system.loading = false;
            //$modalInstance.dismiss();
        };

        $scope.uploadWaypoints = function () {
            var formData = new FormData();

            var hasFilesToUpload = true;

            if (!Array.isArray($scope.filesToUpload[$scope.file_field]) || $scope.filesToUpload[$scope.file_field].length == 0)
            {
                hasFilesToUpload = false;
                $scope.filesToUpload[$scope.file_field] = [];
            }

            var errors = [];

            console.log("$scope.filesToUpload is next...");
            console.dir($scope.filesToUpload);
            console.dir($scope.currentFiles);
            console.dir($scope.removedFiles);
            //console.dir(formdata);

            angular.forEach($scope.filesToUpload[$scope.file_field], function (incoming_file, key) {
                formData.append('file', incoming_file);
            });

            if (hasFilesToUpload) {
                console.log(" --> we have files to upload <--");
                var filesReadyToUpload = [];

                //remove any duplicates
                $scope.filesToUpload[$scope.file_field].forEach(function (incoming_file, key) {
                    if (isDuplicateUploadFile(incoming_file, $scope.modalFiles_filesToCheckForDuplicates)) {
                        $scope.foundDuplicate = true;
                        errors.push("Ignoring: " + incoming_file.Name + " - file already exists." + "\n");
                    } else {

                        filesReadyToUpload.push(incoming_file);

                        //add to the currentfiles ONLY if the file is one coming from this field in the row...
                        //if (isFileInList(incoming_file, $scope.file_row.fieldFilesToUpload[$scope.file_field])) {
                        //    //add to our current files for display once they close this modal
                        //    $scope.currentFiles.push(incoming_file);
                        //}
                    }
                });

                //set our uploads to only files that are ready.
                $scope.filesToUpload[$scope.file_field] = filesReadyToUpload;

                // Inform the user we've removed their duplicate files.
                if ($scope.foundDuplicate) {
                    console.warn(errors);
                    alert(errors);
                }
            }

            //throw "Stopping right here...";

            $.ajax({
                url: serviceUrl + '/api/v1/file/handlewaypoints',
                type: 'POST',
                data: formData,
                processData: false,  // tell jQuery not to process the data
                contentType: false,  // tell jQuery not to set contentType
                success: function (data) {

                    var waypoints = eval("(" + data + ")");

                    //console.log(waypoints);

                    var size = 0, key;

                    for (key in waypoints)
                        size++;

                    alert(size + " waypoints loaded");

                    $rootScope.waypoints = $scope.waypoints = waypoints;

                },
                error: function (jqXHR, error, errorThrown) {
                    if (jqXHR.status && jqXHR.status == 400) {
                        alert(jqXHR.responseText + "\n\n" + "Waypoints not loaded!");
                    } else {
                        alert("Error uploading file!");
                    }
                }
            });

            $modalInstance.dismiss();
        };
        


        $scope.cancel = function () {
            console.log("Inside $scope.cancel...");
            //console.dir($scope);
            $modalInstance.dismiss();
        };

        //after user selects files to upload from the file chooser
        $scope.onWaypointFileSelect = function (field, files) {
            console.log("Inside onFileSelect for field: " + field);

            $scope.filesToUpload[field] = [];

            if (files) {
                files.forEach(function (file) {
                    //add to the scope and to our own list
                    $scope.filesToUpload[field].push(file);
                });
            } else
                console.log("there were no files on WaypointFileSelect")

            console.log("WaypointFileSelect - filesToUpload", $scope.filesToUpload);
        };


    }
];