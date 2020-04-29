
modal_violation_new_file = ['$scope','$uibModalInstance', 'Upload',
	function($scope,  $modalInstance, $upload){
		// note: file selected for upload in this controller are managed by onFileSelect in this controller (see below).

        $scope.header_message = "Add file(s) to: " + $scope.row.Name;
        $scope.doneUploading = false;
        $scope.isUploading = false;
        $scope.readyToUpload = false;

        //options from config.js
        $scope.SHARINGLEVEL_PRIVATE = SHARINGLEVEL_PRIVATE;
        $scope.SHARINGLEVEL_PUBLICREAD = SHARINGLEVEL_PUBLICREAD;
        $scope.SharingLevel = SharingLevel;

        $scope.all_saved_files = [];

		$scope.onFileSelect = function(files)
		{
            console.log("Inside modal_new_file, onFileSelect!  Files is next...");
            //console.dir(files);

            //check for duplicates
            if (files) {
                files.forEach(function (file) {
                    if (isDuplicateUploadFile(file, $scope.ViolationFiles))
                        file.success = "DUPLICATE";
                });
            }
            else
                console.log("there were no files on FileSelect")

            $scope.uploadFiles = files;
            
            console.dir($scope.uploadFiles);

            if ($scope.uploadFiles.length > 0)
                $scope.readyToUpload = true;
            else
                $scope.readyToUpload = false;

		};

		$scope.save = function(){
            console.log("Inside modal_new_file.js, save...");
			//console.log("$scope is next...");
            //console.dir($scope);

			// Just in case they clicked the Upload button, without selecting a file first.
			if (!$scope.uploadFiles)
			{
				console.log("No file selected; do nothing...");
				return;
            }

            $scope.readyToUpload = false;
            $scope.doneUploading = false;
            $scope.isUploading = true;
            
			$scope.foundDuplicate = false;		
			$scope.uploadErrorMessage = undefined;
			var errors = [];

			for(var i = 0; i < $scope.uploadFiles.length; i++)
			{
				var file = $scope.uploadFiles[i];
				//console.log("file is next...");
				//console.dir(file);
				
				var newFileNameLength = file.name.length;
				console.log("file name length = " + newFileNameLength);

                if (file.success == "DUPLICATE") {
                    console.log("Duplicate -- ignoring: ", file.Name);
                    continue;
                }

				if(!file.success)
				{
					console.log("file.success does not exist yet...");
					$scope.upload = $upload.upload({
						url: serviceUrl + '/api/v1/violation/UploadFile',
						method: "POST",
						// headers: {'headerKey': 'headerValue'},
						// withCredential: true,
						data: {ProjectId: EHS_PROJECTID, Description: file.Description, SubprojectId: $scope.row.Id},
						file: file

					}).progress(function (evt) {
					        console.dir(evt);
                            if (typeof config !== 'undefined')
                                config.file.success = "Working: " + parseInt(100.0 * evt.loaded / evt.total) + "%";
					}).success(function (data, status, headers, config) {
                            if (typeof config !== 'undefined')
                            {
                                config.file.success = "Success";
                                //console.dir(data);
                                $scope.all_saved_files.push(data[0]);
                                $scope.doneUploading = true;
                                $scope.isUploading = false;
                                console.log("--- done and success");
                            }
						}).error(function(data, status, headers, config) {
							$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
							//console.log(file.name + " was error.");
                            if (typeof config !== 'undefined')
                                config.file.success = "Failed";

                            $scope.readyToUpload = true;
                            $scope.doneUploading = true;
                            $scope.isUploading = false;
                            console.log("done and error...");

						});
				}
            }//loop

		};

		$scope.cancel = function(){

			$scope.foundDuplicate = undefined;

            if ($scope.all_saved_files.length > 0) {
                console.warn("---- returning the files ----");
                console.dir($scope.all_saved_files);
                $modalInstance.close($scope.all_saved_files);
            }

			$modalInstance.dismiss();
		};
	}
];