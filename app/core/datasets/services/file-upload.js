

datasets_module.service('FileUploadService', ['$q', '$upload', function ($q, $upload) {
    var service = {
        uploadFiles: function (filesToUpload, $scope) {
            console.log("Inside FileUploadService, uploadFiles...");
            //console.log("$scope is next...");
            //console.dir($scope);

            $scope.uploadErrorMessage = undefined;

            var promises = [];

            angular.forEach(filesToUpload, function (files, field) {

                if (field == "null" || field == "")
                    return;

                console.log("handling files for: " + field);
                console.log("files is next...");
                console.dir(files);

                // If the user selected a file, but it was already in the file list (project, or dataset, or subproject),
                // and then DID NOT select another file for that field, the field will be detectable, but its value will be undefined.
                // Example:  They after picking a duplicate, they omitted that entry, made a different update, and then saved.
                // Therefore, verify that the field's value IS NOT undefined, before proceding.
                if (typeof files !== 'undefined') {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];

                        if ($scope.dataset.Id) {
                            console.log("Checking if file " + file.Name + " already exists in the dataset files...");
                            for (var p = 0; p < $scope.dataset.Files.length; p++) {
                                if (file.Name.length <= $scope.dataset.Files[p].Name.length) {
                                    if ($scope.dataset.Files[p].Name.indexOf(file.Name) > -1) {
                                        $scope.foundDuplicate = true;
                                        console.log("...Yes, it does.");
                                    }
                                }
                            }
                        }
                        else {
                            console.log("Checking if file " + file.Name + " already exists in the project files...");
                            for (var p = 0; p < $scope.project.Files.length; p++) {
                                if (file.Name.length <= $scope.project.Files[p].Name.length) {
                                    if ($scope.project.Files[p].Name.indexOf(file.Name) > -1) {
                                        $scope.foundDuplicate = true;
                                        console.log("...Yes, it does.");
                                    }
                                }
                            }
                        }
                        console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);
                        if ($scope.foundDuplicate === false)
                            console.log("...No, it does not.  The file name is good.")

                        //if(file.success != "Success")
                        if (($scope.foundDuplicate === false) && (file.success != "Success")) {

                            var deferred = $q.defer();
							
                            if ($scope.DatastoreTablePrefix === "CrppContracts") {
								if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
								{
									$upload.upload({
										url: serviceUrl + '/api/v1/crppsubproject/uploadcrppsubprojectfile',
										method: "POST",
										// headers: {'headerKey': 'headerValue'},
										// withCredential: true,
										data: { ProjectId: $scope.project.Id, SubprojectId: $scope.viewSubproject.Id, Description: "Uploaded file for: " + file.Name, Title: file.Name },
										file: file,

									}).progress(function (evt) {
										console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

									}).success(function (data, status, headers, config) {
										//console.dir(data);
										config.file.success = "Success";
										config.file.data = data;
										deferred.resolve(data);

									})
										.error(function (data, status, headers, config) {
											$scope.uploadErrorMessage = "There was a problem uploading your file for the subproject.  Please try again or contact the Helpdesk if this issue continues.";
											console.log(" error.");
											config.file.success = "Failed";
											deferred.reject();

										});
								}
								else
								{
									$upload.upload({
										url: serviceUrl + '/api/v1/crppsubproject/uploadcrppsubprojectfile',
										method: "POST",
										// headers: {'headerKey': 'headerValue'},
										// withCredential: true,
										data: { ProjectId: $scope.project.Id, SubprojectId: null, Description: "Uploaded file for: " + file.Name, Title: file.Name },
										file: file,

									}).progress(function (evt) {
										console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

									}).success(function (data, status, headers, config) {
										//console.dir(data);
										config.file.success = "Success";
										config.file.data = data;
										deferred.resolve(data);

									})
										.error(function (data, status, headers, config) {
											$scope.uploadErrorMessage = "There was a problem uploading your file for the subproject.  Please try again or contact the Helpdesk if this issue continues.";
											console.log(" error.");
											config.file.success = "Failed";
											deferred.reject();

										});
								}

                                promises.push(deferred.promise);
                            }
                            else {
                                $upload.upload({
                                    //url: serviceUrl + '/data/UploadProjectFile',
                                    url: serviceUrl + '/api/v1/file/uploaddatasetfile',
                                    method: "POST",
                                    // headers: {'headerKey': 'headerValue'},
                                    // withCredential: true,
                                    //data: {ProjectId: $scope.project.Id, Description: "Uploaded file for: "+file.Name, Title: file.Name},
                                    data: { ProjectId: $scope.project.Id, DatasetId: $scope.dataset.Id, Description: "Uploaded file for: " + file.Name, Title: file.Name },
                                    file: file,

                                }).progress(function (evt) {
                                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

                                }).success(function (data, status, headers, config) {
                                    //console.dir(data);
                                    config.file.success = "Success";
                                    config.file.data = data;
                                    deferred.resolve(data);

                                })
                                    .error(function (data, status, headers, config) {
                                        $scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
                                        console.log(" error.");
                                        config.file.success = "Failed";
                                        deferred.reject();

                                    });

                                promises.push(deferred.promise);
                            }
                        }
                        else {
                            console.log("$scope.foundDuplicate is true OR file.success == Success");
                            if ($scope.DatastoreTablePrefix === "CrppContracts") {
                                $scope.uploadErrorMessage = "The file is already in the subproject files.  Please choose another file name, try again, or contact the Helpdesk if this issue continues.";
                                console.log(" error.");
                                var errors = [];
                                errors.push("File " + file.Name + " already exists in the subproject files.");
                                $scope.onRow.errors = errors;
                                //config.file.success = "Failed";
                                //deferred.reject();
                                //promises.push(deferred.promise);
                            }
                            else {
                                $scope.uploadErrorMessage = "The file is already in the project files.  Please choose another file name, try again, or contact the Helpdesk if this issue continues.";
                                console.log(" error.");
                                var errors = [];
                                errors.push("File " + file.Name + " already exists in the project files.");
                                $scope.onRow.errors = errors;
                                //config.file.success = "Failed";
                                //deferred.reject();
                                //promises.push(deferred.promise);
                            }
                        }

                    }
                }
            });

            return $q.all(promises);
        },

        uploadSubprojectFiles: function (filesToUpload, $scope) {
            console.log("Inside FileUploadService, uploadSubprojectFiles...");
            //console.log("$scope is next...");
            //console.dir($scope);

            $scope.uploadErrorMessage = undefined;

            var promises = [];

            angular.forEach(filesToUpload, function (files, field) {

                if (field == "null" || field == "")
                    return;

                console.log("handling files for: " + field)

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    console.log("Checking if file " + file.Name + " already exists in the subproject files...");

                    for (var p = 0; p < $scope.viewSubproject.Files.length; p++) {
                        if (file.Name.length <= $scope.viewSubproject.Files[p].Name.length) {
                            if ($scope.viewSubproject.Files[p].Name.indexOf(file.Name) > -1) {
                                $scope.foundDuplicate = true;
                                console.log("...Yes, it does.");
                            }
                        }
                    }
                    console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);
                    if ($scope.foundDuplicate === false)
                        console.log("...No, it does not.  The file name is good.")

                    //if(file.success != "Success")
                    console.log("file is next...");
                    console.dir(file);
                    if (($scope.foundDuplicate === false) && (file.success != "Success")) {
                        var deferred = $q.defer();

                        if ($scope.DatastoreTablePrefix === "CrppContracts") {
                            $upload.upload({
                                url: serviceUrl + '/api/v1/crppsubproject/uploadcrppsubprojectfile',
                                method: "POST",
                                // headers: {'headerKey': 'headerValue'},
                                // withCredential: true,
                                data: { ProjectId: $scope.project.Id, SubprojectId: $scope.viewSubproject.Id, Description: "Uploaded file for: " + file.Name, Title: file.Name },
                                file: file,

                            }).progress(function (evt) {
                                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

                            }).success(function (data, status, headers, config) {
                                //console.dir(data);
                                config.file.success = "Success";
                                config.file.data = data;
                                deferred.resolve(data);

                            }).error(function (data, status, headers, config) {
                                $scope.uploadErrorMessage = "There was a problem uploading your file for the subproject.  Please try again or contact the Helpdesk if this issue continues.";
                                console.log(" error.");
                                config.file.success = "Failed";
                                deferred.reject();

                            });

                            promises.push(deferred.promise);
                        }
                        else //not a crpp... habitat then i guess (for now)
                        {
                            $upload.upload({
                                url: serviceUrl + '/api/v1/habsubproject/uploadhabitatfile',
                                method: "POST",
                                // headers: {'headerKey': 'headerValue'},
                                // withCredential: true,
                                data: { ProjectId: $scope.project.Id, Description: "Uploaded file for: " + file.Name, Title: file.Name },
                                file: file,

                            }).progress(function (evt) {
                                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

                            }).success(function (data, status, headers, config) {
                                //console.dir(data);
                                config.file.success = "Success";
                                config.file.data = data;
                                deferred.resolve(data);

                            })
                                .error(function (data, status, headers, config) {
                                    $scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
                                    console.log(" error.");
                                    config.file.success = "Failed";
                                    deferred.reject();

                                });

                            promises.push(deferred.promise);
                        }
                    }
                    else {
                        if ($scope.DatastoreTablePrefix === "CrppContracts") {
                            $scope.uploadErrorMessage = "The file is already in the subproject files.  Please choose another file name, try again, or contact the Helpdesk if this issue continues.";
                            console.log(" error.");
                            var errors = [];
                            errors.push("File " + file.Name + " already exists in the subproject files.");
                            $scope.onRow.errors = errors;
                            //config.file.success = "Failed";
                            //deferred.reject();
                            //promises.push(deferred.promise);
                        }
                        else {
                            $scope.uploadErrorMessage = "The file is already in the project files.  Please choose another file name, try again, or contact the Helpdesk if this issue continues.";
                            console.log(" error.");
                            var errors = [];
                            errors.push("File " + file.Name + " already exists in the project files.");
                            $scope.onRow.errors = errors;
                            //config.file.success = "Failed";
                            //deferred.reject();
                            //promises.push(deferred.promise);
                        }
                    }

                }
            });

            return $q.all(promises);
        },
    };
    return service;
}]);