//controller for the waypoints loading process.

var modal_waypoint_files = ['$scope', '$uibModalInstance', 'DatasetService', '$rootScope',
    function ($scope, $modalInstance, DatasetService, $rootScope) {

        $scope.uploadWaypoints = function () {
            var formData = new FormData();

            angular.forEach($scope.filesToUpload[$scope.file_field], function (incoming_file, key) {
                formData.append('file', incoming_file);
            });

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

                    $scope.$parent.waypoints = waypoints; 

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
            $modalInstance.dismiss();
        };

        //after user selects files to upload from the file chooser
        $scope.onWaypointFileSelect = function (field, files) {
            console.log("Inside onFileSelect for field: ", field);

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