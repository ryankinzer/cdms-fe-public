
var modal_verify_action = ['$scope', '$rootScope','$modalInstance', 'DataService','DatastoreService', 'ServiceUtilities',
  function($scope, $rootScope, $modalInstance, DataService, DatastoreService, ServiceUtilities){
	console.log("Inside ModalVerifyActionCtrl...");
	//console.log("$scope is next...");
	//console.dir($scope);
	console.log("$scope.verifyAction = " + $scope.verifyAction);
	console.log("$scope.verifyingCaller = " + $scope.verifyingCaller);
	
	console.log("Calling program = " + $scope.verifyingCaller);
	if ($scope.verifyingCaller === "CrppSubproject")
	{
		console.log("CrppSubproject is calling...");
		$scope.header_title = $scope.verifyAction + " this CRPP project: " + $scope.viewSubproject.ProjectName;
		$scope.header_message = $scope.verifyAction.toLowerCase() + " this CRPP project: " + $scope.viewSubproject.ProjectName;
	}
	else if ($scope.verifyingCaller === "CorrespondenceEvent")
	{
		console.log("CorrespondenceEvent is calling...");
		var intTLocation = $scope.ce_row.CorrespondenceDate.indexOf("T");
		var strCeDate = $scope.ce_row.CorrespondenceDate.substring(0, intTLocation);
		$scope.header_title = $scope.verifyAction + " this Correspondence Event: " + strCeDate;
		//$scope.header_message = $scope.verifyAction + " this Correspondence Event: " + $scope.ce_row.CorrespondenceDate + ", by this Staff member: " + $scope.ce_row.StaffMember;
		$scope.header_message = $scope.verifyAction + " this Correspondence Event: " + strCeDate + ", by this Staff member: " + $scope.ce_row.StaffMember;
	}
	else if ($scope.verifyingCaller === "HabSubproject")
	{
		console.log("HabSubproject is calling...");
		$scope.header_title = $scope.verifyAction + " this Habitat project: " + $scope.viewSubproject.ProjectName;
		$scope.header_message = $scope.verifyAction.toLowerCase() + " this Habitat project: " + $scope.viewSubproject.ProjectName;
	}

    //$scope.header_message = $scope.verifyAction.toLowerCase() + " this CRPP project";
	
	var subprojectListwatcher = $scope.$watch('subprojectList.length', function(){
		console.log("Inside ModalVerifyActionCtrl watch, subprojectList");

		if ($scope.subprojectList.length === 0)
		{
			console.log("No subprojects found yet...");
			return;
		}
		
		console.log("$scope.subprojectList is next..");
		console.dir($scope.subprojectList);		
	
		$scope.subprojectOptions = $rootScope.subprojectOptions = makeObjects($scope.subprojectList, 'Id','ProjectName');
		
		// Debug output ... wanted to verify the contents of scope.subprojectOptions
		angular.forEach($scope.subprojectOptions, function(subproject){
			console.dir(subproject);
		});
		
		console.log("$scope.subprojectOptions is next...");
		console.dir($scope.subprojectOptions);
		////console.dir(scope);
		//subprojectListwatcher(); // Turn off this watcher.
		//$modalInstance.dismiss();
	});
	
    $scope.cancel = function(){
        $modalInstance.dismiss();
		$scope.verifyAction = 'undefined';
    };
	
	$scope.continueAction = function(){
		console.log("Inside continueAction...");
		//console.log("$scope is next...");
		//console.dir($scope);
		//$scope.continueAction = true;
		//$scope.verifyAction = 'undefined';
		
		console.log("$scope.verifyAction = " + $scope.verifyAction);
		
		var promise = null;
		if (($scope.verifyAction === "Delete") && ($scope.verifyingCaller === "CrppSubproject"))
		{
			console.log("$scope.project.Id = " + $scope.project.Id + ", $scope.viewSubproject.Id = " + $scope.viewSubproject.Id);
			promise = DatastoreService.removeSubproject($scope.project.Id, $scope.viewSubproject.Id);
		}
		else if (($scope.verifyAction === "Delete") && ($scope.verifyingCaller === "CorrespondenceEvent"))
		{
			console.log("$scope.project.Id = " + $scope.project.Id + ", $scope.viewSubproject.Id = " + $scope.viewSubproject.Id + ", $scope.ce_RowId = " + $scope.ce_rowId);
			//var promise = DatastoreService.removeCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, $scope.ce_rowId);
			promise = DatastoreService.removeCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, $scope.ce_rowId);
		}
		else if (($scope.verifyAction === "Delete") && ($scope.verifyingCaller === "HabSubproject"))
		{
			console.log("$scope.projectId = " + $scope.project.Id + ", $scope.viewSubproject.Id = " + $scope.viewSubproject.Id);
			var theSdeObjectId = 0;
			var keepGoing = true;
			
			// We will handle deleting the point from SDE at a later time.  For now, just delete the location from CDMS.
			// First, get the SdeObjectId from the location associated to this subproject.
			/*angular.forEach($scope.project.Locations, function(aLocation){
				if ((keepGoing) && (aLocation.Id === $scope.viewSubproject.LocationId))
				{
					console.log("Found the location...");
					theSdeObjectId = aLocation.SdeObjectId;
					keepGoing = false;
				}
			});
			
			// Next, call the service and delete the point from the SDE.
			var applyEditsParams = {
				"id": 0,
				"adds":[{}],
				"updates":[{}],
				"deletes":[{theSdeObjectId}],
			};
			/*var applyEditsParams = {
				"id": 0,
				"adds": null,
				"updates": null,
				"deletes": theSdeObjectId
			};
			var applyEditsParams = theSdeObjectId;
			
			
			$scope.map.locationLayer.applyEdits(null,null,applyEditsParams).then(function(results){
				console.log("Inside $scope.map.locationLayer.applyEdits");
				console.log("results is next...");
				console.dir(results);
				if(results[0].success)
				{
					console.log("Deleted point! "+ theSdeObjectId);
				}
			});
			*/
			
			//promise = DatastoreService.removeHabSubproject(parseInt($scope.projectId), $scope.viewSubproject.Id);
			//promise = DatastoreService.removeHabSubproject(parseInt($scope.projectId), $scope.viewSubproject.Id, theSdeObjectId);
			promise = DatastoreService.removeHabSubproject(parseInt($scope.projectId), $scope.viewSubproject.Id, $scope.viewSubproject.LocationId);
		}
		
		// This works fine for removing subprojects.
		// For removing Correspondence events, it has problems.
		promise.$promise.then(function(){
			$scope.subprojects = null;
			$scope.reloadSubprojects();
			$scope.reloadSubprojectLocations();
			$modalInstance.dismiss();
			});
			
			/*.then(function(){
				$scope.viewSelectedSubproject();
			})
			*/
			/*.then(function(){
				$modalInstance.dismiss();
			});
			*/
	}
}];