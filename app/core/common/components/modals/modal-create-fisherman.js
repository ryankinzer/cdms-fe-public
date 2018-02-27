var modal_create_fisherman = ['$scope', '$modalInstance','ProjectService','ServiceUtilities','ConvertStatus',
    function ($scope, $modalInstance, ProjectService,  ServiceUtilities, ConvertStatus){

    $scope.header_message = "Create new fisherman";
	$scope.saveResults = null;

    $scope.fisherman_row = {
        StatusId: 0,
    };
	
	console.log("$scope in ModalCreateFishermanCtrl is next...");
	//console.dir($scope);	

    if($scope.viewFisherman)
    {
        $scope.header_message = "Edit fisherman: " + $scope.viewFisherman.FullName;
		console.log("viewfisherman...");
		console.dir($scope.viewFisherman);
        $scope.fisherman_row = $scope.viewFisherman;
		
		var strInDate = $scope.viewFisherman.DateAdded;
		console.log("strInDate = " + strInDate);
		$scope.viewFisherman.DateAdded = ServiceUtilities.extractDateFromString(strInDate);
		console.log("$scope.viewFisherman.DateAdded = " + $scope.viewFisherman.DateAdded);

		$scope.fisherman_row.DateAdded = $scope.viewFisherman.DateAdded;
		console.log($scope.fisherman_row.DateAdded);
		console.log("$scope.fisherman_row.DateAdded = " + $scope.fisherman_row.DateAdded);
		
		$scope.fisherman_row.StatusId = $scope.viewFisherman.StatusId;
		$scope.viewFisherman.Status = ConvertStatus.convertStatus($scope.viewFisherman.StatusId);
		console.log("$scope.viewFisherman.Status = " + $scope.viewFisherman.Status);

		$scope.fisherman_row.OkToCallId = $scope.viewFisherman.OkToCallId;
		$scope.viewFisherman.OkToCall = ConvertStatus.convertOkToCall($scope.viewFisherman.OkToCallId);
        console.log("$scope.viewFisherman.OkToCall = " + $scope.viewFisherman.OkToCall);

        if ((typeof $scope.fisherman_row.Aka !== 'undefined') && ($scope.fisherman_row.Aka !== null))
            $scope.fisherman_row.FullName = $scope.fisherman_row.FirstName + " (" + $scope.fisherman_row.Aka + ") " + $scope.fisherman_row.LastName;
        else
            $scope.fisherman_row.FullName = $scope.fisherman_row.FirstName + " " + $scope.fisherman_row.LastName;	
    }
	else
	{
		$scope.fisherman_row['DateAdded'] = new Date();			
	}	

    $scope.updateFullName = function () {
        if ((typeof $scope.fisherman_row.Aka !== 'undefined') && ($scope.fisherman_row.Aka !== null) && ($scope.fisherman_row.Aka !== ''))
            $scope.fisherman_row.FullName = $scope.fisherman_row.FirstName + " (" + $scope.fisherman_row.Aka + ") " + $scope.fisherman_row.LastName;
		else if ((typeof $scope.fisherman_row.LastName !== 'undefined') && ($scope.fisherman_row.LastName !== null) && ($scope.fisherman_row.LastName !== ''))
            $scope.fisherman_row.FullName = $scope.fisherman_row.FirstName + " " + $scope.fisherman_row.LastName;	
        else
		{
            //$scope.fisherman_row.FullName = $scope.fisherman_row.FirstName + " " + $scope.fisherman_row.LastName;	
            $scope.fisherman_row.FullName = $scope.fisherman_row.FirstName;
		}
    }
	
    $scope.saveFisherman = function(){
        console.log("$scope in saveFisherman is next...");
		//console.dir($scope);
		
		$scope.fishermanSave = [];		

		if ((!$scope.viewFisherman) || ($scope.viewFisherman === null))
		{
			// First check if the fisherman is already in the database -- no duplicates allowed.
			angular.forEach($scope.fishermenList, function(fishermanInfo, index){
				// Verify whether or not the Aka is present
				if (typeof $scope.fisherman_row.Aka !== 'undefined')
				{
					// AKA is present, so we need to check the First, AKA, and Last name.
					if (($scope.fisherman_row.FirstName === fishermanInfo.FirstName) && ($scope.fisherman_row.Aka === fishermanInfo.Aka) && ($scope.fisherman_row.LastName === fishermanInfo.LastName))
						$scope.fishermanSave.error = true;
				}
				else
				{	
					// AKA is missing, so we only check the First and Last names.
					if (($scope.fisherman_row.FirstName === fishermanInfo.FirstName) && ($scope.fisherman_row.LastName === fishermanInfo.LastName))
						$scope.fishermanSave.error = true;
				}
			});
			
			var strInDate = ServiceUtilities.toExactISOString($scope.fisherman_row.DateAdded);
			console.log("strInDate = " + strInDate);
			$scope.fisherman_row.DateAdded = ServiceUtilities.extractDateFromString(strInDate);
			console.log($scope.fisherman_row.DateAdded);			
		}
		
		if (!$scope.fishermanSave.error)
		{		
			if ((typeof $scope.fisherman_row.Aka !== 'undefined') && ($scope.fisherman_row.Aka !== null))
				$scope.fisherman_row.FullName = $scope.fisherman_row.FirstName + " (" + $scope.fisherman_row.Aka + ") " + $scope.fisherman_row.LastName;
			else
				$scope.fisherman_row.FullName = $scope.fisherman_row.FirstName + " " + $scope.fisherman_row.LastName;			

			//var strInDate = $scope.fisherman_row.DateAdded;
			//console.log("strInDate = " + strInDate);
			//$scope.fisherman_row.DateAdded = ServiceUtilities.extractDateFromString(strInDate);
			//console.log($scope.fisherman_row.DateAdded);
			
			$scope.fisherman_row.Status = ConvertStatus.convertStatus($scope.fisherman_row.StatusId);			
			console.log("$scope.fisherman_row.Status = " + $scope.fisherman_row.Status);			

			$scope.fisherman_row.OkToCall = ConvertStatus.convertOkToCall($scope.fisherman_row.OkToCallId);			
			console.log("$scope.fisherman_row.OkToCall = " + $scope.fisherman_row.OkToCall);
			
			//$scope.fisherman_row.Id = 0;
			console.log("$scope.fisherman_row is next...");
			console.dir($scope.fisherman_row);
			var saveRow = angular.copy($scope.fisherman_row);
			console.log("saveRow is next...");
			console.dir(saveRow);
			$scope.saveResults = {};
			console.log("$scope.saveResults is next...");
			console.dir($scope.saveResults);
			
			var promise = ProjectService.saveFisherman($scope.project.Id, saveRow, $scope.saveResults);
			if (typeof promise !== 'undefined')
			{
				console.log("promise is next...");
				console.dir(promise);
				promise.$promise.then(function(){
					//$scope.reloadProject();
					//location.reload(true);
                    $scope.postSaveFishermanUpdateGrid(promise);
					$modalInstance.dismiss();
				});	
			}
		}
    };

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];