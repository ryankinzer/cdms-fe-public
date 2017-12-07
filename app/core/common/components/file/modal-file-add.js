//handles managing file controltypes
var modal_file_add = ['$scope','$modalInstance', 'DatasetService','ServiceUtilities','$rootScope',
    function($scope, $modalInstance, DatasetService, ServiceUtilities, $rootScope){
		// This controller is for the Dataset Activity / Subproject File modal.
		console.log("Inside modals-controller.js, FileAddModalCtrl");
		//console.log("$scope is next...");
		//console.dir($scope);
		
		if (typeof $scope.onRow !== 'undefined')
			$scope.onRow.errors = [];
		
		$scope.foundDuplicate = false;
    	//note: files selected for upload are managed by onFileSelect from parent scope, in one of the following places: 
		// ModalAddCorrespondenceEventCtrl, ModalAddHabitatItemCtrl

    	//file_field and file_row
    	//console.dir($scope.file_row);
    	//console.dir($scope.file_field);
    	//console.log("Files!");
    	//console.dir($scope.filesToUpload);		
		console.log("$scope.dataset.Files is next...");
		console.dir($scope.dataset.Files);

		console.log("$scope.file_field.DbColumnName = " + $scope.file_field.DbColumnName);
    	$scope.currentFiles = $scope.file_row[$scope.file_field.DbColumnName];
    	if($scope.currentFiles)
    		$scope.currentFiles = angular.fromJson($scope.currentFiles);
    	else
    		$scope.currentFiles = [];

		console.log("$scope.currentFiles (after check) is next...");
    	console.dir($scope.currentFiles);
		
		$rootScope.currentFiles = angular.copy($scope.currentFiles);
		console.log("$rootScope.currentFiles is next...");
		console.dir($rootScope.currentFiles);

        $scope.save = function(){
			console.log("Inside modal-file-add.js, FileAddModalCtrl, save...");
			console.log("Adding file name(s) to the list.");
			console.log("$scope is next...");
			console.dir($scope);
			$rootScope.viewSubproject = $scope.viewSubproject; // Add this to the $rootScope, so that the filters can see it.
			var errors = [];
			
			console.log("$scope.filesToUpload is next...");
			console.dir($scope.filesToUpload);
			//add any newly scheduled to upload files to the list for display
        	angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(incoming_file, key){
        		incoming_file.Name = incoming_file.name; //copy this value!
				console.log("incoming_file.Name = " + incoming_file.Name);
				
        		$scope.currentFiles.push(incoming_file);
				
				$scope.foundDuplicate = false;
				console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
				console.log("$scope.viewSubproject is next...");
				console.dir($scope.viewSubproject);
				//if (($scope.DatastoreTablePrefix === "CrppContracts") && ($scope.viewSubproject))
				if (($scope.viewSubproject) && ( ($scope.DatastoreTablePrefix === "CrppContracts") || ($scope.DatastoreTablePrefix === "Metrics")) )
				{
					console.log("Need to check subprojects for duplicate document...");
					for (var p = 0; p < $scope.viewSubproject.Files.length; p++)
					{
						if (incoming_file.Name.length <= $scope.viewSubproject.Files[p].Name.length)
						{
							if ($scope.viewSubproject.Files[p].Name.indexOf(incoming_file.Name) > -1)
							{
								$scope.foundDuplicate = true;
								console.log(incoming_file.Name + " already exists in the subproject file list.");
								errors.push(incoming_file.Name + " already exists in list of subproject documents.");
							}
						}
					}
				}
				else if ($scope.dataset)
				{
					console.log("Need to check dataset-level files for duplicate document...");
					for (var p = 0; p < $scope.dataset.Files.length; p++)
					{
						if (incoming_file.Name.length <= $scope.dataset.Files[p].Name.length)
						{
							if ($scope.dataset.Files[p].Name.indexOf(incoming_file.Name) > -1)
							{
								$scope.foundDuplicate = true;
								console.log(incoming_file.Name + " already exists in the dataset file list.");
								errors.push(incoming_file.Name + " already exists in list of dataset documents.\n");
							}
						}
					}
				}
				else
				{
					console.log("Need to check project-level files for duplicate document...");
					for (var p = 0; p < $scope.project.Files.length; p++)
					{
						if (incoming_file.Name.length <= $scope.project.Files[p].Name.length)
						{
							if ($scope.project.Files[p].Name.indexOf(incoming_file.Name) > -1)
							{
								$scope.foundDuplicate = true;
								console.log(incoming_file.Name + " already exists in the project file list.");
								errors.push(incoming_file.Name + " already exists in list of project documents.\n");
							}
						}
					}
				}
        	});
			
			console.log("$scope.foundDuplicate = " + $scope.foundDuplicate);
			if (!$scope.foundDuplicate)
			{
				//copy back to the actual row field
				console.log("$scope.file_field.DbColumnName = " + $scope.file_field.DbColumnName);
				$scope.file_row[$scope.file_field.DbColumnName] = angular.toJson($scope.currentFiles);
				console.log("$scope.file_row is next...");
				console.dir($scope.file_row);
				
				// Notes are in order...
				// When first building this, I was working with Harvest, and it had files in "FieldSheetFile".
				// Later, when working with ScrewTrap, I discovered that it had files in FileTitle.
				// So, we put whatever the flavor into FieldSheetFile.
				if ($scope.DatastoreTablePrefix === "Harvest")
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FieldSheetFile;
				else if ($scope.DatastoreTablePrefix === "ScrewTrap")
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FileTitle;
				else if ($scope.DatastoreTablePrefix === "CrppContracts")
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.DocumentLink;
				else
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FieldSheetFile;	
				
				$rootScope.currentFiles = $scope.currentFiles;
			}
			else
			{
				$scope.filesToUpload[$scope.file_field.DbColumnName] = undefined;
			}
			
			//console.log("$scope is next...");
			//console.dir($scope);
			console.log("$rootScope is next...");
			console.dir($rootScope);
            $modalInstance.dismiss();
			
			// Inform the user immediately, if there are duplicate files.
			if ($scope.foundDuplicate)
				alert(errors);
			
			//ServiceUtilities.setFileName($scope.file_row.FieldSheetFile, $scope)
        };


        $scope.uploadWaypoints = function(){
            var formData = new FormData();

            angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(incoming_file, key){
                formData.append('file', incoming_file);
            });

            //TODO: we probably want to refactor this into our usual pattern (factory + service)
            $.ajax({
                url: serviceUrl + '/api/v1/file/handlewaypoints',
                type : 'POST',
                data : formData,
                processData: false,  // tell jQuery not to process the data
                contentType: false,  // tell jQuery not to set contentType
                success : function(data) {
                    
                    var waypoints = eval("(" + data + ")");
                    var size = 0, key;

                    for (key in waypoints)
                        size++;

                    alert(size + " waypoints loaded");

                    $scope.__proto__.waypoints = waypoints;     // This is probably not right, but not sure how else to get the outer scope object
                },
                error: function(jqXHR, error, errorThrown) {
                    if(jqXHR.status&&jqXHR.status == 400) {
                        alert(jqXHR.responseText + "\n\n" + "Waypoints not loaded!");
                    } else{
                        alert("Error uploading file!");
                    }
                }
            });

            $modalInstance.dismiss();
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
];