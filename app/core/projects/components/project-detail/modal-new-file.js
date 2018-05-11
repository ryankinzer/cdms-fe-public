
modal_new_file = ['$scope','$modalInstance', '$upload',
	function($scope,  $modalInstance, $upload){
		// This controller is for the Project File (Documents tab) modal.
		// note: file selected for upload in this controller are managed by onFileSelect in this controller (see below).

        $scope.header_message = "Add file(s) to " + $scope.project.Name;
        $scope.doneUploading = false;

		$scope.onFileSelect = function(files)
		{
            console.log("Inside modal_new_file, onFileSelect!  Files is next...");
            //console.dir(files);

            //check for duplicates
            if (files) {
                files.forEach(function (file) {
                    if (isDuplicateUploadFile(file, $scope.project.Files))
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
            $scope.doneUploading = true;
            
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
                // The Title (file.Info.Title) is a required item.
                else if (!file.Info) {
                    console.log("Title missing -- ignoring: ", file.Name);
                    file.success = "Need Title";
                    continue;
                }
                else if (!file.Info.Title) {
                    console.log("Title missing -- ignoring: ", file.Name);
                    file.success = "Need Title";
                    continue;
                }
                else if ((file.Info.Title) && (!file.Info.Description)) {
                    // Set Description to blank, but it cannot be undefined, or null, because
                    // "undefined" or "null" will show.
                    file.Info.Description = "";
                }

                /*
				// $scope.uploadFileType gets set when the user clicks on the new button, 
				// and it determines whether they are in the Project gallery, or Project Documents.
				//console.log("$scope.uploadFileType = " + $scope.uploadFileType);
				if ($scope.uploadFileType === "image")
				{
					console.log("We have an image...");
					for(var n = 0; n < $scope.project.Images.length; n++)
					{
						var existingFileName = $scope.project.Images[n].Name;
						//console.log("existingFileName = " + existingFileName);
						var existingFileNameLength = existingFileName.length;
						if ((newFileNameLength >= existingFileNameLength) && (file.name.indexOf(existingFileName) > -1))
						{
								$scope.foundDuplicate = true;
								console.log(file.name + " already exists in the project images list.");
								errors.push(file.name + " already exists in the list of project images.");						
						}
					}
				}
				else
				{
					console.log("We have something other than an image...");
					for(var n = 0; n < $scope.project.Files.length; n++)
					{
						var existingFileName = $scope.project.Files[n].Name;
						console.log("existingFileName = " + existingFileName);
						var existingFileNameLength = existingFileName.length;
						if ((newFileNameLength >= existingFileNameLength) && (file.name.indexOf(existingFileName) > -1))
						{
								$scope.foundDuplicate = true;
								console.log(file.name + " already exists in the project file list.");
								errors.push(file.name + " already exists in the list of project Files.");						
						}
					}
				}
                */
				
				//console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);
				// Inform the user immediately, if there are duplicate files.
				//if ($scope.foundDuplicate)
				//	alert(errors);
				//else
				//{
					//console.log("file is next...");
					//console.dir(file);
					//if(file.success != "Success")
					if(!file.success)
					{
						console.log("file.success does not exist yet...");
						$scope.upload = $upload.upload({
							url: serviceUrl + '/api/v1/file/UploadProjectFile',
							method: "POST",
							// headers: {'headerKey': 'headerValue'},
							// withCredential: true,
							data: {ProjectId: $scope.project.Id, Description: file.Info.Description, Title: file.Info.Title},
							file: file,

                            }).progress(function (evt) {
                                if (typeof config !== 'undefined')
                                    config.file.success = "Working: " + parseInt(100.0 * evt.loaded / evt.total) + "%";
                            }).success(function (data, status, headers, config) {
                                if (typeof config !== 'undefined')
                                {
                                    config.file.success = "Success";
                                    $scope.callback(data);
                                }
							}).error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
								//console.log(file.name + " was error.");
                                if (typeof config !== 'undefined')
								    config.file.success = "Failed";
							});
					}
				//}
            }//loop

		};

		$scope.cancel = function(){
			//if($scope.uploadFiles)
			//	$scope.reloadProject();

			$scope.foundDuplicate = undefined;

			$modalInstance.dismiss();
		};
	}
];