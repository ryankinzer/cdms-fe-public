
modal_new_file = ['$scope','$modalInstance', 'DataService','DatastoreService', '$upload',
	function($scope,  $modalInstance, DataService, DatastoreService, $upload){
		// This controller is for the Project File (Documents tab) modal.
		// note: file selected for upload in this controller are managed by onFileSelect in this controller (see below).

		$scope.header_message = "Add file(s) to "+$scope.project.Name;

		$scope.onFileSelect = function($files)
		{
			console.log("Inside ModalNewFileCtrl, file selected! " + $files);
			$scope.uploadFiles = $files;
			//console.dir($scope.uploadFiles);
		};

		$scope.save = function(){
			console.log("Inside controllers.js, ModalNewFileCtrl, save...");
			console.log("$scope is next...");
			console.dir($scope);
			// Just in case they clicked the Upload button, without selecting a file first.
			if (!$scope.uploadFiles)
			{
				console.log("No file selected; do nothing...");
				return;
			}

			$scope.foundDuplicate = false;		
			$scope.uploadErrorMessage = undefined;
			var errors = [];

			for(var i = 0; i < $scope.uploadFiles.length; i++)
			{
				var file = $scope.uploadFiles[i];
				console.log("file is next...");
				console.dir(file);
				
				var newFileNameLength = file.name.length;
				console.log("file name length = " + newFileNameLength);

				// $scope.uploadFileType gets set when the user clicks on the new button, 
				// and it determined whether they are in the Project gallery, or Project Documents.
				console.log("$scope.uploadFileType = " + $scope.uploadFileType);
				if ($scope.uploadFileType === "image")
				{
					console.log("We have an image...");
					for(var n = 0; n < $scope.project.Images.length; n++)
					{
						var existingFileName = $scope.project.Images[n].Name;
						console.log("existingFileName = " + existingFileName);
						var existingFileNameLength = existingFileName.length;
						if ((newFileNameLength >= existingFileNameLength) && (file.name.indexOf(existingFileName) > -1))
						{
								$scope.foundDuplicate = true;
								console.log(file.name + " already exists in the project file list.");
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
				
				console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);
				// Inform the user immediately, if there are duplicate files.
				if ($scope.foundDuplicate)
					alert(errors);
				else
				{
					console.log("file is next...");
					console.dir(file);
					//if(file.success != "Success")
					if(!file.success)
					{
						console.log("file.success does not exist yet...");
						$scope.upload = $upload.upload({
							url: serviceUrl + '/data/UploadProjectFile',
							method: "POST",
							// headers: {'headerKey': 'headerValue'},
							// withCredential: true,
							data: {ProjectId: $scope.project.Id, Description: file.Info.Description, Title: file.Info.Title},
							file: file,

							}).progress(function(evt) {
								console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
							}).success(function(data, status, headers, config) {
								config.file.success = "Success";
							})
							.error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
								//console.log(file.name + " was error.");
								config.file.success = "Failed";
							});
					}
				}
			}

		};

		$scope.cancel = function(){
			if($scope.uploadFiles)
				$scope.reloadProject();

			$scope.foundDuplicate = undefined;

			$modalInstance.dismiss();
		};
	}
];