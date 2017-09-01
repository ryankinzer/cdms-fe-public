//file modal controller
var mod_fmc = angular.module('ModalsController', ['ui.bootstrap']);



mod_fmc.controller('ModalCreateInstrumentCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.header_message = "Create new instrument";

    $scope.instrument_row = {
        StatusId: 0,
        OwningDepartmentId: 1,
    };

    if($scope.viewInstrument)
    {
        $scope.header_message = "Edit instrument: " + $scope.viewInstrument.Name;
        $scope.instrument_row = $scope.viewInstrument;
    }


    $scope.InstrumentTypes = DatastoreService.getInstrumentTypes();
    $scope.Departments = DataService.getDepartments();
    $scope.RawProjects = DataService.getProjects();


    $scope.save = function(){
		console.log("Inside ModalCreateInstrumentCtrl, save...");
		if (!$scope.instrument_row.InstrumentTypeId)
		{
			alert("You must select an Instrument Type!");
			return;
		}
		
        var saveRow = angular.copy($scope.instrument_row);
		console.log("saveRow is next...");
		console.dir(saveRow);
		
        saveRow.AccuracyChecks = undefined;
        //saveRow.InstrumentType = undefined; // We have an InstrumentTypeId, but no InstrumentType.  Why is this here?
        saveRow.OwningDepartment = undefined;
        var promise = DatastoreService.saveInstrument($scope.project.Id, saveRow);
        promise.$promise.then(function(){
            $scope.reloadProject();
            $modalInstance.dismiss();
        });
    };

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
]);

//when you click the "View" button on a relation table field, it opens this modal
mod_fmc.controller('RelationGridModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
    function($scope,  $modalInstance, DataService, DatastoreService){

        //incoming scope variable
        // $scope.relationgrid_row, $scope.relationgrid_field
        if($scope.relationgrid_field.Field == null || $scope.relationgrid_field.Field.DataSource == null)
        {
            $scope.alerts = [{type: "error", msg: "There is a misconfiguration in the relationship. "}];
            return;
        }
        else
        {
            $scope.relation_dataset = DataService.getDataset($scope.relationgrid_field.Field.DataSource);
        }

        //get the relationdata out of the row -- use it if it exists, otherwise fetch it from the db.
        if($scope.relationgrid_row[$scope.relationgrid_field.DbColumnName])
            $scope.relationgrid_data = $scope.relationgrid_row[$scope.relationgrid_field.DbColumnName];
        else
        {
            $scope.relationgrid_data = DataService.getRelationData($scope.relationgrid_field.FieldId, $scope.relationgrid_row.ActivityId, $scope.relationgrid_row.RowId);
            $scope.relationgrid_row[$scope.relationgrid_field.DbColumnName] = $scope.relationgrid_data;
        }

        $scope.relationColDefs = [];
        $scope.relationGrid = {
            data: 'relationgrid_data',
            columnDefs: 'relationColDefs',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEdit: $scope.isEditable,
            enableColumnResize: true,
        };

        $scope.$watch('relation_dataset.Id', function(){
            if(!$scope.relation_dataset.Id)
                return;

            var grid_fields = [];

            //iterate the fields of our relation dataset and populate our grid columns
            angular.forEach($scope.relation_dataset.Fields.sort(orderByIndex), function(field){
                parseField(field, $scope);
                grid_fields.push(field);
                $scope.relationColDefs.push(makeFieldColDef(field, $scope));
            });

            //add our list of fields to a relationFields collection -- we will use this later when saving...
            $scope.fields.relation[$scope.relationgrid_field.Field.DbColumnName] = grid_fields;
            
        });

        $scope.save = function(){

            //copy back to the actual row field
            //$scope.link_row[$scope.link_field.DbColumnName] = angular.toJson($scope.currentLinks);
            //console.dir($scope.relationgrid_row);
            $scope.updatedRows.push($scope.relationgrid_row.Id);
            $modalInstance.dismiss();
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

        $scope.addRow = function()
        {
            $scope.relationgrid_data.push(makeNewRow($scope.relationColDefs));
        }

    }
]);

mod_fmc.controller('ModalCreateFishermanCtrl', ['$scope','$modalInstance','DataService','DatastoreService','ServiceUtilities','ConvertStatus',
  function($scope, $modalInstance, DataService, DatastoreService, ServiceUtilities, ConvertStatus){

    $scope.header_message = "Create new fisherman";
	$scope.saveResults = null;

    $scope.fisherman_row = {
        StatusId: 0,
    };
	
	console.log("$scope in ModalCreateFishermanCtrl is next...");
	console.dir($scope);	

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
    }
	else
	{
		$scope.fisherman_row['DateAdded'] = new Date();			
	}	
	
	
    $scope.saveFisherman = function(){
        console.log("$scope in saveFisherman is next...");
		console.dir($scope);
		
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
			
			var promise = DatastoreService.saveFisherman($scope.project.Id, saveRow, $scope.saveResults);
			if (typeof promise !== 'undefined')
			{
				console.log("promise is next...");
				console.dir(promise);
				promise.$promise.then(function(){
					$scope.reloadProject();
					//location.reload(true);
					$modalInstance.dismiss();
				});	
			}
		}
    };

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
]);

mod_fmc.controller('ModalVerifyActionCtrl', ['$scope', '$rootScope','$modalInstance', 'DataService','DatastoreService', 'ServiceUtilities',
  function($scope, $rootScope, $modalInstance, DataService, DatastoreService, ServiceUtilities){
	console.log("Inside ModalVerifyActionCtrl...");
	console.log("$scope is next...");
	console.dir($scope);
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
		//console.dir(scope);
		//subprojectListwatcher(); // Turn off this watcher.
		//$modalInstance.dismiss();
	});
	
    $scope.cancel = function(){
        $modalInstance.dismiss();
		$scope.verifyAction = 'undefined';
    };
	
	$scope.continueAction = function(){
		console.log("Inside continueAction...");
		console.log("$scope is next...");
		console.dir($scope);
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
}]);

mod_fmc.controller('ModalCreateSubprojectCtrl', ['$scope', '$rootScope','$modalInstance', 'DataService','DatastoreService', 'ServiceUtilities', 
	'$timeout', '$location', '$anchorScroll', '$document',
  function($scope, $rootScope, $modalInstance, DataService, DatastoreService, ServiceUtilities, 
	$timeout, $location, $anchorScroll, $document){
	console.log("Inside ModalCreateSubprojectCtrl...");

	//$scope.agencyInfo = [[]];
	
    $document.on('keydown', function(e) {
		//console.log("Inside document.on keydown...");
		//console.log("e is next...");
		//console.dir(e);
		//console.log("e.target.nodeName = " + e.target.nodeName);
		
		// Note:  keyCode 8 = Backspace; the nodeName value is in uppercase, so we must check for that here.
		if ((e.keyCode === 8) && (e.target.nodeName === "TEXTAREA"))
		{
			//console.log("  Backspace pressed...and we are in a TEXTAREA");
			//e.preventDefault();
			
			var keyboardEvent = $document[0].createEvent("KeyboardEvent");
			var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
			
			keyboardEvent[initMethod](
				"keydown", // event type : keydown, keyup, keypress
                true, // bubbles
                true, // cancelable
                window, // viewArg: should be window
                false, // ctrlKeyArg
                false, // altKeyArg
                false, // shiftKeyArg
                false, // metaKeyArg
                37, // keyCodeArg : unsigned long the virtual key code, else 0.  37 = Left Arrow key
                0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0				
			);
			//console.log("Just did left arrow...");
			
			document.dispatchEvent(keyboardEvent);
			
			keyboardEvent[initMethod](
				"keydown", // event type : keydown, keyup, keypress
                true, // bubbles
                true, // cancelable
                window, // viewArg: should be window
                false, // ctrlKeyArg
                false, // altKeyArg
                false, // shiftKeyArg
                false, // metaKeyArg
                46, // keyCodeArg : unsigned long the virtual key code, else 0.  46 = Delete key
                0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0				
			);

			//console.log("Doing delete...");			
			return document.dispatchEvent(keyboardEvent);
		}
    });
	
    $scope.header_message = "Create new CRPP project";
	$rootScope.crppProjectName = $scope.crppProjectName = "";
	$rootScope.projectId = $scope.project.Id;
	
    $scope.subproject_row = {
        StatusId: 0,
        //OwningDepartmentId: 1,
    };
	
	$scope.agencyList = [];
		$scope.agencyList.push({Id: 0, Label: "ACHP"});
		$scope.agencyList.push({Id: 1, Label: "Anderson Perry"});
		$scope.agencyList.push({Id: 2, Label: "Army"});
		$scope.agencyList.push({Id: 3, Label: "Baker County"});
		$scope.agencyList.push({Id: 4, Label: "Benton County"});
		$scope.agencyList.push({Id: 5, Label: "BIA"});
		$scope.agencyList.push({Id: 6, Label: "BLM"});
		$scope.agencyList.push({Id: 7, Label: "Blue Mountain Ranger District"});
		$scope.agencyList.push({Id: 8, Label: "BNSF"});
		$scope.agencyList.push({Id: 9, Label: "BOR"});
		$scope.agencyList.push({Id: 10, Label: "BPA"});
		$scope.agencyList.push({Id: 11, Label: "Camas"});
		$scope.agencyList.push({Id: 12, Label: "CenturyLink"});
		$scope.agencyList.push({Id: 13, Label: "Clark County"});
		$scope.agencyList.push({Id: 14, Label: "College Place"});
		$scope.agencyList.push({Id: 15, Label: "Columbia County"});
		$scope.agencyList.push({Id: 16, Label: "Corps Portland District"});
		$scope.agencyList.push({Id: 17, Label: "Corps Regulatory"});
		$scope.agencyList.push({Id: 18, Label: "Corps Walla Walla District"});
		$scope.agencyList.push({Id: 19, Label: "CRGNSA"});
		$scope.agencyList.push({Id: 20, Label: "CTUIR"});
		$scope.agencyList.push({Id: 21, Label: "DAHP"});
		$scope.agencyList.push({Id: 22, Label: "DECD"});
		$scope.agencyList.push({Id: 23, Label: "Department of Ecology"});
		$scope.agencyList.push({Id: 24, Label: "DEQ"});
		$scope.agencyList.push({Id: 25, Label: "DOE"});
		$scope.agencyList.push({Id: 26, Label: "DOGAMI"});
		$scope.agencyList.push({Id: 27, Label: "DSL"});
		$scope.agencyList.push({Id: 28, Label: "EPA"});
		$scope.agencyList.push({Id: 29, Label: "FAA"});
		$scope.agencyList.push({Id: 30, Label: "FCC"});
		$scope.agencyList.push({Id: 31, Label: "Federal Transit Authority"});
		$scope.agencyList.push({Id: 32, Label: "FEMA"});
		$scope.agencyList.push({Id: 33, Label: "FERC"});
		$scope.agencyList.push({Id: 34, Label: "FHWA"});
		$scope.agencyList.push({Id: 35, Label: "Fisheries"});
		$scope.agencyList.push({Id: 36, Label: "Fort Vancouver (NPS)"});
		$scope.agencyList.push({Id: 37, Label: "Franklin County"});
		$scope.agencyList.push({Id: 38, Label: "FSA"});
		$scope.agencyList.push({Id: 39, Label: "Hells Canyon NRA"});
		$scope.agencyList.push({Id: 40, Label: "Heppner Ranger District"});
		$scope.agencyList.push({Id: 41, Label: "Hermiston"});
		$scope.agencyList.push({Id: 42, Label: "Hood River County"});
		$scope.agencyList.push({Id: 43, Label: "HUD"});
		$scope.agencyList.push({Id: 44, Label: "Idaho Power"});
		$scope.agencyList.push({Id: 45, Label: "Irrigon"});
		$scope.agencyList.push({Id: 46, Label: "John Day Fossil Beds (NPS)"});
		$scope.agencyList.push({Id: 47, Label: "Kennewick"});
		$scope.agencyList.push({Id: 48, Label: "Klickitat County"});
		$scope.agencyList.push({Id: 49, Label: "La Grande Ranger District"});
		$scope.agencyList.push({Id: 50, Label: "Landowner"});
		$scope.agencyList.push({Id: 51, Label: "Malheur National Forest"});
		$scope.agencyList.push({Id: 52, Label: "Morrow County"});
		$scope.agencyList.push({Id: 53, Label: "Navy"});
		$scope.agencyList.push({Id: 54, Label: "Nez Perce National Historical Park (NPS)"});
		$scope.agencyList.push({Id: 55, Label: "North Fork John Day Ranger District"});
		$scope.agencyList.push({Id: 56, Label: "Northwest Pipeline"});
		$scope.agencyList.push({Id: 57, Label: "NPS"});
		$scope.agencyList.push({Id: 58, Label: "NRCS"});
		$scope.agencyList.push({Id: 59, Label: "ODEQ"});
		$scope.agencyList.push({Id: 60, Label: "ODOE"});
		$scope.agencyList.push({Id: 61, Label: "ODOT"});
		$scope.agencyList.push({Id: 62, Label: "OPRD"});
		$scope.agencyList.push({Id: 63, Label: "Oregon City"});
		$scope.agencyList.push({Id: 64, Label: "Oregon Military Department/Oregon Army National Guard"});
		$scope.agencyList.push({Id: 65, Label: "Other"});
		$scope.agencyList.push({Id: 66, Label: "OWRD"});
		$scope.agencyList.push({Id: 67, Label: "PacifiCorp"});
		$scope.agencyList.push({Id: 68, Label: "Pasco"});
		$scope.agencyList.push({Id: 69, Label: "PGE"});
		$scope.agencyList.push({Id: 70, Label: "Planning Dept"});
		$scope.agencyList.push({Id: 71, Label: "Pomeroy Ranger District"});
		$scope.agencyList.push({Id: 72, Label: "Port of Benton"});
		$scope.agencyList.push({Id: 73, Label: "Port of Clarkston"});
		$scope.agencyList.push({Id: 74, Label: "Port of Columbia"});
		$scope.agencyList.push({Id: 75, Label: "Port of Kennewick"});
		$scope.agencyList.push({Id: 76, Label: "Port of Morrow"});
		$scope.agencyList.push({Id: 77, Label: "Port of Umatilla"});
		$scope.agencyList.push({Id: 78, Label: "Port of Walla Walla"});
		$scope.agencyList.push({Id: 79, Label: "Public Works"});
		$scope.agencyList.push({Id: 80, Label: "RAF"});
		$scope.agencyList.push({Id: 81, Label: "Recreation and Conservation Office"});
		$scope.agencyList.push({Id: 82, Label: "Richland"});
		$scope.agencyList.push({Id: 83, Label: "Rural Development"});
		$scope.agencyList.push({Id: 84, Label: "RUS"});
		$scope.agencyList.push({Id: 85, Label: "SHPO Oregon"});
		$scope.agencyList.push({Id: 86, Label: "Skamania County"});
		$scope.agencyList.push({Id: 87, Label: "Skamania County PUD"});
		$scope.agencyList.push({Id: 88, Label: "Umatilla County"});
		$scope.agencyList.push({Id: 89, Label: "Umatilla National Forest"});
		$scope.agencyList.push({Id: 90, Label: "UPRR"});
		$scope.agencyList.push({Id: 91, Label: "USACE"});
		$scope.agencyList.push({Id: 92, Label: "USFWS"});
		$scope.agencyList.push({Id: 93, Label: "VA"});
		$scope.agencyList.push({Id: 94, Label: "Vancouver"});
		$scope.agencyList.push({Id: 95, Label: "Walla Walla City"});
		$scope.agencyList.push({Id: 96, Label: "Walla Walla County"});
		$scope.agencyList.push({Id: 97, Label: "Walla Walla Ranger District"});
		$scope.agencyList.push({Id: 98, Label: "Wallowa County"});
		$scope.agencyList.push({Id: 99, Label: "Wallowa Valley Ranger District"});
		$scope.agencyList.push({Id: 100, Label: "Wallowa-Whitman National Forest"});
		$scope.agencyList.push({Id: 101, Label: "Wasco County"});
		$scope.agencyList.push({Id: 102, Label: "Washington Department of Commerce"});
		$scope.agencyList.push({Id: 103, Label: "Washington Department of Health"});
		$scope.agencyList.push({Id: 104, Label: "Washington Department of Natural Resources"});
		$scope.agencyList.push({Id: 105, Label: "Washington State Parks"});
		$scope.agencyList.push({Id: 106, Label: "Water Resources"});
		$scope.agencyList.push({Id: 107, Label: "WDFW"});
		$scope.agencyList.push({Id: 108, Label: "Western Federal Lands Highway Division"});
		$scope.agencyList.push({Id: 109, Label: "Whitman Mission (NPS)"});
		$scope.agencyList.push({Id: 110, Label: "Whitman Unit"});
		$scope.agencyList.push({Id: 111, Label: "Wildlife"});
		$scope.agencyList.push({Id: 112, Label: "WSDOT"});
		$scope.agencyList.push({Id: 113, Label: "Yellowstone National Park"});
		
	console.log("$scope.agencyList is next...");
	console.dir($scope.agencyList);
	
	//$scope.agencyOptions = $rootScope.responseTypeOptions = makeObjects($scope.agencyList, 'Id','Label') ;
	//console.log("$scope.agencyOptions is next...");
	//console.dir($scope.agencyOptions);
	
	$scope.counties = [];
	
	$scope.countyList = [];
		$scope.countyList.push({Id: 0, Label: "Asotin"});
		$scope.countyList.push({Id: 1, Label: "Baker"});
		$scope.countyList.push({Id: 2, Label: "Benton"});
		$scope.countyList.push({Id: 3, Label: "Clark"});
		$scope.countyList.push({Id: 4, Label: "Columbia"});
		$scope.countyList.push({Id: 5, Label: "Franklin"});
		$scope.countyList.push({Id: 7, Label: "Garfield"});
		$scope.countyList.push({Id: 8, Label: "Gilliam"});
		$scope.countyList.push({Id: 9, Label: "Garfield"});
		$scope.countyList.push({Id: 10, Label: "Grant, WA"});
		$scope.countyList.push({Id: 11, Label: "Grant, OR"});
		$scope.countyList.push({Id: 12, Label: "Hood River"});
		$scope.countyList.push({Id: 13, Label: "Klickitat"});
		$scope.countyList.push({Id: 14, Label: "Malheur"});
		$scope.countyList.push({Id: 15, Label: "Morrow"});
		$scope.countyList.push({Id: 16, Label: "Multnomah"});
		$scope.countyList.push({Id: 17, Label: "Other"});
		$scope.countyList.push({Id: 18, Label: "Sherman"});
		$scope.countyList.push({Id: 19, Label: "Skamania"});
		$scope.countyList.push({Id: 20, Label: "Umatilla"});
		$scope.countyList.push({Id: 21, Label: "Union"});
		$scope.countyList.push({Id: 22, Label: "Walla Walla"});
		$scope.countyList.push({Id: 23, Label: "Wallowa"});
		$scope.countyList.push({Id: 24, Label: "Wasco"});
		$scope.countyList.push({Id: 25, Label: "Wheeler"});
		$scope.countyList.push({Id: 26, Label: "Whitman"});
	
	console.log("$scope.countyList is next...");
	console.dir($scope.countyList);
	//$scope.countyOptions = $rootScope.countyOptions = makeObjects($scope.countyList, 'Id','Label') ;
	
	$scope.showOtherAgency = false;
	$scope.showOtherProjectProponent = false;
	$scope.showOtherCounty = false;
	$scope.showCountyOptions = false;
	$scope.showAddDocument = true;
	
	$scope.example1model = []; 
	$scope.example1data = [ {id: 1, label: "David"}, {id: 2, label: "Jhon"}, {id: 3, label: "Danny"}];

    if($scope.viewSubproject)
    {
        $scope.header_message = "Edit CRPP project: " + $scope.viewSubproject.ProjectName;
        $scope.subproject_row = angular.copy($scope.viewSubproject);
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
		
		$scope.showAddDocument = false;
		
		console.log("$scope.subproject_row.Agency = " + $scope.subproject_row.Agency);
		var keepGoing = true;
		var foundIt = false;
		//var responseTypeIndex = 0;
		
		/*
		*	Need to redo the Agency, Project Proponent, and County
		*
		*/
		// Check the Agency
		/*angular.forEach($scope.agencyList, function(option){
		//console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.Agency = x" + $scope.subproject_row.Agency + "x.");
			if ((keepGoing) && (option.Label === $scope.subproject_row.Agency))
			{
				//console.log("option.Label = " + option.Label);
				//console.log("Found the Agency...");
				foundIt = true;
				keepGoing = false;
			}
			//responseTypeIndex++;
		});
		
		if (!foundIt)
		{
			console.log("Value of Agency is not in the list...");
			$scope.subproject_row.OtherAgency = $scope.subproject_row.Agency;
			$scope.subproject_row.Agency = "Other";
			$scope.showOtherAgency = true;		
		}
		*/
		if ((typeof $scope.subproject_row.OtherAgency !== 'undefined') && ($scope.subproject_row.OtherAgency !== null))
			$scope.showOtherAgency = true;
		
		/*
		keepGoing = true;
		foundIt = false;
		// Check the Project Proponent  Note:  We use the same list as for the Agency.
		console.log("$scope.subproject_row.ProjectProponent = " + $scope.subproject_row.ProjectProponent);
		angular.forEach($scope.agencyList, function(option){
		//console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.ProjectProponent = x" + $scope.subproject_row.ProjectProponent + "x.");
			if ((keepGoing) && (option.Label === $scope.subproject_row.ProjectProponent))
			{
				//console.log("option.Label = " + option.Label);
				//console.log("Found the ProjectProponent...");
				foundIt = true;
				keepGoing = false;
			}
			//responseTypeIndex++;
		});
		
		if (!foundIt)
		{
			console.log("Value of ProjectProponent is not in the list...");
			$scope.subproject_row.OtherProjectProponent = $scope.subproject_row.ProjectProponent;
			$scope.subproject_row.ProjectProponent = "Other";
			$scope.showOtherProjectProponent = true;		
		}
		*/
		if ((typeof $scope.subproject_row.OtherProjectProponent !== 'undefined') && ($scope.subproject_row.OtherProjectProponent !== null))
			$scope.showOtherProjectProponent = true;
		
		/*
		keepGoing = true;
		foundIt = false;
		// Check the County
		console.log("$scope.subproject_row.County = " + $scope.subproject_row.County);
		
		// Copy the array into a string.
		var strCounty = "";
		angular.forEach($scope.subproject_row.County, function(item){
			strCounty += item + ",";
		});
		console.log("strCounty = " + strCounty);
		
		// Remove the trailing comma.
		strCounty = strCounty.substring(0, strCounty.length - 1);
		console.log("strCounty = " + strCounty);
		*/
		
		// Now, strip off the "[]".
		if ((typeof $scope.subproject_row.County !== 'undefined') && ($scope.subproject_row.County !== null))
		{
			var strCounty = $scope.subproject_row.County;
			strCounty = strCounty.replace(/["\[\]]+/g, '');
			console.log("strCounty = " + strCounty);
			$scope.subproject_row.County = strCounty;
			console.log("$scope.subproject_row.County = " + $scope.subproject_row.County);
			
			$scope.subproject_row.txtCounty = strCounty;
		}
		
		if ((typeof $scope.subproject_row.OtherCounty !== 'undefined') && ($scope.subproject_row.OtherCounty !== null))
			$scope.showOtherCounty = true;
		
		
		// Now convert our string to an array, to compare with the countyList.
		/*var aryCounties = $scope.subproject_row.County.split(",");
		console.log("aryCounties is next...");
		console.dir(aryCounties);

		angular.forEach(aryCounties, function(county){		
		//console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.County = x" + $scope.subproject_row.County + "x.");
			angular.forEach($scope.countyList, function(option){
				if ((keepGoing) && (option.Label === county))
				{
					//console.log("option.Label = " + option.Label);
					console.log("Found county:  " + county);
					foundIt = true;
					keepGoing = false;
				}
			});
			if (!foundIt)
			{
				
			}
		});		
		*/
		
		/*angular.forEach($scope.countyList, function(option){
		//console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.County = x" + $scope.subproject_row.County + "x.");
			if ((keepGoing) && (option.Label === $scope.subproject_row.County))
			{
				//console.log("option.Label = " + option.Label);
				//console.log("Found the County...");
				foundIt = true;
				keepGoing = false;
			}
		});

		
		if (!foundIt)
		{
			console.log("Value of County is not in the list...");
			$scope.subproject_row.OtherCounty = $scope.subproject_row.County;
			$scope.subproject_row.County = "Other";
			$scope.showOtherCounty = true;		
		}
		*/		

		
		
		// First convert our county string into an array.
		/*var strCounty = $scope.subproject_row.County;
		console.log("strCounty = " + strCounty);
		
		strCounty = strCounty.substring(1, strCounty.length -1);
		console.log("strCounty = " + strCounty);
		
		strCounty = strCounty.replace(/["]+/g, '');
		console.log("strCounty = " + strCounty);		
		
		var aryCounty = strCounty.split(",");
		console.log("aryCounty is next...");
		console.dir(aryCounty);
		
		//var result = document.getElementsByTagName("select");
		//var result = document.getElementById("County");
		//console.dir(result);
		var c = 0;
		angular.forEach(result, function(item){
			console.log(item[c].innerHTML);
			c++;
		});
		
		var wrappedResult = angular.element(result);
		console.dir(wrappedResult);
		angular.forEach(element.find('select'), function(node)
		{
			if (node.Id === 'County')
				console.log("Found County select...");
			
		});
		
		var counties = angular.element("County").options;
		console.log("counties is next...");
		console.dir(counties);
		angular.forEach(aryCounty, function (county){
			for (var i = 0, max = counties.length; i < max; i++)
			{
				if (counties[i].innerHTML === county)
					counties[i].selected = true;
			}
			
		});		
		$scope.subproject_row.County = aryCounty;
		*/		
		/*scope.subproject_row.County = 'undefined';
		$scope.subproject_row.County = [];
		angular.forEach(aryCounty, function(county){
			$scope.subproject_row.County.push(county);
		});
		*/
		console.log("$scope.subproject_row.County is next...");
		console.dir($scope.subproject_row.County);
		
		angular.forEach($scope.countyList, function(option){
		//console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.County = x" + $scope.subproject_row.County + "x.");
			if ((keepGoing) && (option.Label === $scope.subproject_row.County))
			{
				//console.log("option.Label = " + option.Label);
				//console.log("Found the County...");
				foundIt = true;
				keepGoing = false;
			}
		});
		angular.forEach($scope.subproject_row.County, function(county){
			if (county === "Other")
				foundIt = true;
			
		});
		
		if (!foundIt)
		{
			console.log("Value of County is not in the list...");
			$scope.subproject_row.OtherCounty = $scope.subproject_row.County;
			$scope.subproject_row.County = "Other";
			$scope.showOtherCounty = true;		
		}
    }

	console.log("$scope inside ModalCreateSubprojectCtrl, after initializing, is next...");
	console.dir($scope);
	
	$scope.selectAgency = function () {
		console.log("Inside selectAgency...");
		console.dir($scope);
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
		
		$scope.showCountyOptions = false;
		
		if ($scope.subproject_row.Agency === "Other")
		{
			$scope.showOtherAgency = true;
			$scope.subproject_row.OtherAgency = "";
		}
		else
		{
			$scope.showOtherAgency = false;
			$scope.subproject_row.OtherAgency = 'undefined';
		}
		
		console.log("$scope.showOtherAgency = " + $scope.showOtherAgency);
	};
	
	/*$scope.agencyChanged = function () {
		console.log("Inside agencyChanged...");
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
		if ($scope.subproject_row.Agency === "Other")
		{
			$scope.showOtherAgency = true;
			$scope.subproject_row.OtherAgency = "";
		}
		else
			$scope.showOtherAgency = false;
			$scope.subproject_row.OtherAgency = 'undefined';
		
		console.log("$scope.showOtherAgency = " + $scope.showOtherAgency);
	};
	*/

	$scope.selectProjectProponent = function () {
		console.log("Inside selectProjectProponent...");
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
		
		$scope.showCountyOptions = false;
		
		if ($scope.subproject_row.ProjectProponent === "Other")
		{
			$scope.showOtherProjectProponent = true;
			$scope.subproject_row.OtherProjectProponent = "";
		}
		else
		{
			$scope.showOtherProjectProponent = false;
			$scope.subproject_row.OtherProjectProponent = 'undefined';
		}
		
		console.log("$scope.showOtherProjectProponent = " + $scope.showOtherProjectProponent);
	};
	
	/*$scope.selectCounty = function () {
		console.log("Inside selectCounty...");
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
		
		var strCounty = $scope.subproject_row.County.toString();
		if (strCounty.indexOf("Other") > -1)
		{
			$scope.showOtherCounty = true;
		}
		else
		{
			$scope.showOtherCounty = false;
		}
		*/
		/*if ($scope.subproject_row.County === "Other")
		{
			$scope.showOtherCounty = true;
			$scope.subproject_row.OtherCounty = "";
		}
		else
		{
			$scope.showOtherCounty = false;
			$scope.subproject_row.OtherCounty = 'undefined';
		}
		*/
		/*
		console.log("$scope.showOtherCounty = " + $scope.showOtherCounty);
	};
	*/
	
	/*$scope.projectProponentChanged = function () {
		console.log("Inside projectProponentChanged...");
		console.log("$scope.viewSubproject is next...");
		console.dir($scope.subproject_row);
		if ($scope.subproject_row.ProjectProponent === "Other")
			$scope.showOtherProjectProponent = true;
		else
			$scope.showOtherProjectProponent = false;
		
		console.log("$scope.showOtherProjectProponent = " + $scope.showOtherProjectProponent);
	};
	*/
	
	$scope.enteredSelectedCounties = function () {
		$scope.showCountyOptions = true;
	};
	
	$scope.enteredSomethingElse = function () {
		$scope.showCountyOptions = false;
	};
	
	$scope.countyChanged = function () {
		console.log("Inside countyChanged...");
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
		
		$scope.subproject_row.txtCounty = $scope.subproject_row.County.toString();
		if ($scope.subproject_row.txtCounty.indexOf("Other") > -1)
		{
			$scope.showOtherCounty = true;
		}
		else
		{
			$scope.showOtherCounty = false;
			$scope.subproject_row.OtherCounty = null;
		}
		
		/*if ($scope.subproject_row.County === "Other")
			$scope.showOtherCounty = true;
		else
			$scope.showOtherCounty = false;
		*/
		
		//$scope.showOtherCounty = false;
		//var foundOther = false;
		//angular.forEach($scope.subproject_row.County, function(county){
			// There is only one entry for "Other"
			/*if(county === "Other")
			{
				foundOther = true;
				$scope.showOtherCounty = true
				$scope.subproject_row.OtherCounty = [];
			}
			*/
		//});
		
		//if (!foundOther)
		//	$scope.subproject_row.OtherCounty = 'undefined';

		
		console.log("$scope.showOtherCounty = " + $scope.showOtherCounty);
	};
	
	/*$scope.checkKeyPress = function(event){
		if (event.keyCode === 8) {
			console.log("Backspace pressed...");
		}
	};
	*/
	
    $scope.save = function(){
		console.log("Inside ModalCreateSubprojectCtrl, save...");
		$scope.subprojectSave = undefined;
		$scope.subprojectSave = [];
		$scope.createNewSubproject = false;
		if ((typeof $scope.subproject_row.ProjectName === 'undefined') || ($scope.subproject_row.ProjectName === null))
		{
			console.log("Project name is empty...");
			$scope.subprojectSave.error = true;
		}
		console.dir($scope);
		
		if (!$scope.subprojectSave.error)
		{
			// Capture the AddDocument flag, before discarding it.
			console.log("$scope.subproject_row, full is next...");
			console.dir($scope.subproject_row);
			
			var addDocument = $scope.subproject_row.AddDocument;
			$scope.subproject_row.AddDocument = null;
			console.log("addDocument = " + addDocument);
			console.log("$scope.subproject_row, after del is next...");
			console.dir($scope.subproject_row);			
			
			var saveRow = angular.copy($scope.subproject_row);
			console.log("saveRow is next..");
			console.dir(saveRow);
			/* On the form, $scope.subproject_row.Agency is an object, like this: (Id: theId Name: theName)
			* The technique used to grab the Agency works on the first click (an improvement).
			* Therefore, I (gc) kept the technique, and chose to extract/reset $scope.subproject_row.Agency here in the controller, as just the name.
			*/
			//console.log("typeof saveRow.Agency = " + saveRow.Agency);
			//saveRow.Agency = 'undefined';
			//saveRow.Agency = $scope.subproject_row.Agency.Name;
			//console.log("saveRow.Agency = " + saveRow.Agency);
			
			// Agency Name:  If the user selected Other, we must use the name they supplied in OtherAgency.
			// 20160721:  Colette said that we need the OtherAgency, OtherProjectProponent, and OtherCounty to have their own columns in the database,
			// so that she can easily filter out and determine what "other" agencies, Project Proponents, or Counties that CRPP has interacted with.
			/*if ((typeof saveRow.OtherAgency !== 'undefined') && (saveRow.OtherAgency !== null) && (saveRow.OtherAgency !== 'undefined'))
			{
				saveRow.Agency = saveRow.OtherAgency;
				saveRow.OtherAgency = null; // Throw this away, because we do not want to save it; no database field or it.
			}
			*/
			
			// Project Proponent Name:  If the user selected Other, we must use the name they supplied in OtherProjectProponent.
			/*if ((typeof saveRow.OtherProjectProponent !== 'undefined') && (saveRow.OtherProjectProponent !== null) && (saveRow.OtherProjectProponent !== 'undefined'))
			{
				saveRow.ProjectProponent = saveRow.OtherProjectProponent;
				saveRow.OtherProjectProponent = null; // Throw this away, because we do not want to save it; no database field or it.
			}
			*/
			
			// County Name:  If the user selected Other, we must use the name they supplied in OtherCounty.
			//if (saveRow.OtherCounty)
			/*if ((typeof saveRow.OtherCounty !== 'undefined') && (saveRow.OtherCounty !== null) && (saveRow.OtherCounty !== 'undefined'))
			{
				console.log("OtherCounty has a value...");
				saveRow.County = saveRow.OtherCounty; // For single select
				//saveRow.County.push(saveRow.OtherCounty); // For multiSelect
				
				saveRow.OtherCounty = null; // Throw this away, because we do not want to save it; no database field or it.
			}*/
			
			// Convert the multiselect (array) values into a json array string.
			//saveRow.County = angular.toJson(saveRow.County).toString();
			//var strCounty = "[";
			saveRow.County = saveRow.txtCounty ;
			//angular.forEach(saveRow.County, function(county){
			//	strCounty += '"' + county + '",'; // Use single-quotes and double-quotes, so that JavaScript does not get confused.
			//});
			
			//console.log("strCounty = " + strCounty);
			// Trim the trailing ","
			//if (strCounty.length > 1)
			//	strCounty = strCounty.substring(0, strCounty.length -1);
			
			//strCounty += "]";
			//saveRow.County = strCounty;
			
			
			saveRow.YearDate = ServiceUtilities.dateTimeNowToStrYYYYMMDD_HHmmSS();
			console.log("saveRow.TrackingNumber = " + saveRow.TrackingNumber);
			if(saveRow.TrackingNumber)
			{
				// The tracking number exists, but let's verify that is it not just spaces.
				var tmpTrackingNumber = saveRow.TrackingNumber;
				if ((tmpTrackingNumber !== null) && (tmpTrackingNumber.length > 0))
				{
					// The tracking number contains something.  Replace all the spaces and see what is left.
					tmpTrackingNumber = tmpTrackingNumber.replace(" ", "");
				}
				
				if (tmpTrackingNumber.length === 0)
				{
					saveRow.TrackingNumber = saveRow.YearDate
				}
			}
			else
			{
				// The user does not want the TrackingNumber to be set, if they leave it blank.
				//saveRow.TrackingNumber = saveRow.YearDate
			}
			console.log("saveRow.TrackingNumber = " + saveRow.TrackingNumber);
			
			//if(!saveRow.CompleteDate)
			//	saveRow.CompleteDate = null;
			saveRow.CorrespondenceEvents = undefined;
			console.log("saveRow is next...");
			console.dir(saveRow);
			
			$scope.saveResults = {};
			console.log("$scope is next...");
			console.dir($scope);
			//var promise = DatastoreService.saveCorrespondence($scope.project.Id, saveRow, $scope.saveResults);
			var promise = DatastoreService.saveSubproject($scope.project.Id, saveRow, $scope.saveResults);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					//window.location.reload();
					console.log("promise is next...");
					console.dir(promise);
					$scope.subprojectId = $rootScope.subprojectId = promise.Id;
					console.log("$scope.subprojectId = " + $scope.subprojectId);
					
					$scope.subproject_row = 'undefined';
					$scope.crppProjectName = saveRow.ProjectName;
					
					$scope.reloadSubprojects();
					
					if (addDocument === "Yes")
					{
						console.log("addDocument = Yes...");
						
						// If the user wishes to add a Correspondence Event right away, we must wait to get the ID of the new subproject, before we can continue.
						//$scope.reloadSubproject(promise.Id);
						//var promise2 = $scope.reloadSubproject(promise.Id);
						//console.log("Inside reloadSubproject...");
						DataService.clearSubproject();
						$scope.reloadSubproject($scope.subprojectId);
						$modalInstance.dismiss();	
						$scope.openCorrespondenceEventForm();
						//$scope.subproject = DataService.getSubproject(id);
					}
					else
					{
						console.log("addDocument != Yes");
						
						// If the user just wants to create the Subproject, we can continue without waiting.
						$scope.reloadSubproject($scope.subprojectId);
						$modalInstance.dismiss();
					}
				});
			}
		}
    };

    $scope.cancel = function(){
		// If the user clicks on Cancel, we need to grab the contents of the Other... boxes and put it back into the main box.
		
		// Agency Name:  If the user selected Other, we must use the name they supplied in OtherAgency.
		if ($scope.subproject_row.OtherAgency)
		{
			$scope.subproject_row.Agency = $scope.subproject_row.OtherAgency;
			$scope.subproject_row.OtherAgency = null; // Throw this away, because we do not want to save it; no database field or it.
		}
		
		// Project Proponent Name:  If the user selected Other, we must use the name they supplied in OtherProjectProponent.
		if ($scope.subproject_row.OtherProjectProponent)
		{
			$scope.subproject_row.ProjectProponent = $scope.subproject_row.OtherProjectProponent;
			$scope.subproject_row.OtherProjectProponent = null; // Throw this away, because we do not want to save it; no database field or it.
		}
		
		// County Name:  If the user selected Other, we must use the name they supplied in OtherCounty.
		if ($scope.subproject_row.OtherCounty)
		{
			$scope.subproject_row.County = $scope.subproject_row.OtherCounty;
			$scope.subproject_row.OtherCounty = null; // Throw this away, because we do not want to save it; no database field or it.
		}
		$scope.subproject_row = 'undefined';
		$scope.reloadSubprojects();
        $modalInstance.dismiss();
    };
	/*
	$scope.gotoBottom = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		$location.hash('bottom');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoSubprojectsTop = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		console.log("Inside gotoSubprojectsTop...");
		//$location.hash('top');
		$location.hash('spTop');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoCategory = function (category) {
		$location.hash(category);
		$anchorScroll();
	};
	*/
  }
]);

mod_fmc.controller('ModalCreateHabSubprojectCtrl', ['$scope', '$rootScope','$modalInstance','$modal','DataService','DatastoreService', 'ServiceUtilities', 
	'$timeout', '$location', '$anchorScroll', '$document', '$upload', 
  function($scope, $rootScope, $modalInstance, $modal, DataService, DatastoreService, ServiceUtilities, 
	$timeout, $location, $anchorScroll, $document, $upload){
	console.log("Inside ModalCreateHabSubprojectCtrl...");

    $document.on('keydown', function(e) {
		//console.log("Inside document.on keydown...");
		//console.log("e is next...");
		//console.dir(e);
		//console.log("e.target.nodeName = " + e.target.nodeName);
		
		// Note:  keyCode 8 = Backspace; the nodeName value is in uppercase, so we must check for that here.
		if ((e.keyCode === 8) && (e.target.nodeName === "TEXTAREA"))
		{
			//console.log("  Backspace pressed...and we are in a TEXTAREA");
			//e.preventDefault();
			
			var keyboardEvent = $document[0].createEvent("KeyboardEvent");
			var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
			
			keyboardEvent[initMethod](
				"keydown", // event type : keydown, keyup, keypress
                true, // bubbles
                true, // cancelable
                window, // viewArg: should be window
                false, // ctrlKeyArg
                false, // altKeyArg
                false, // shiftKeyArg
                false, // metaKeyArg
                37, // keyCodeArg : unsigned long the virtual key code, else 0.  37 = Left Arrow key
                0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0				
			);
			//console.log("Just did left arrow...");
			
			document.dispatchEvent(keyboardEvent);
			
			keyboardEvent[initMethod](
				"keydown", // event type : keydown, keyup, keypress
                true, // bubbles
                true, // cancelable
                window, // viewArg: should be window
                false, // ctrlKeyArg
                false, // altKeyArg
                false, // shiftKeyArg
                false, // metaKeyArg
                46, // keyCodeArg : unsigned long the virtual key code, else 0.  46 = Delete key
                0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0				
			);

			//console.log("Doing delete...");			
			return document.dispatchEvent(keyboardEvent);
		}
    });
	
    $scope.header_message = "Create new Habitat project";
	$rootScope.newSubproject = $scope.newSubproject = true;
    $scope.waterbodies = DatastoreService.getWaterBodies();
	$rootScope.habProjectName = $scope.habProjectName = "";
	$scope.showAddDocument = true;
	$scope.savingHabSubproject = false;
	$scope.showFundingBox = false;
	$rootScope.projectId = $scope.project.Id;
	$scope.SdeObjectId = angular.copy($scope.SdeObjectId);
	$scope.NewPoint = false;
	$scope.fundersPresent = false;
	$scope.collaboratorPresent = false;
	$scope.featureImagePresent = false;
	
    $scope.subproject_row = {
        StatusId: 0,
        //OwningDepartmentId: 1,
    };
	
	// This line pulls in the Projection and the UTMZone
	$scope.subproject_row = angular.copy(DEFAULT_LOCATION_PROJECTION_ZONE);
	
	$scope.subproject_row.strFunders = "";
	$scope.subproject_row.Funding = [];
	
	//var fundtionOptionCount = 0;
	/*angular.forEach($scope.metadataList['Funding'].options, function(value){
		console.log("value = " + value);

		var fundingOption = new Object();
		//fundingOption.Checked = false;
		fundingOption.Name = "";
		fundingOption.Amount = 0;
		
		fundingOption.Name = value;
		$scope.subproject_row.Funding.push(fundingOption);
	});
	console.dir($scope.subproject_row.Funding);
	*/
	
	/*$scope.collaboratorList = [];
		$scope.collaboratorList.push({Id: 0, Label: "Blue Mountain Habitat Restoration Council"});
		$scope.collaboratorList.push({Id: 1, Label: "Bureau of Reclamation"});
		$scope.collaboratorList.push({Id: 2, Label: "Bonneville Power Authority"});
		$scope.collaboratorList.push({Id: 3, Label: "Columbia Conservation District"});
		$scope.collaboratorList.push({Id: 4, Label: "CTUIR"});
		$scope.collaboratorList.push({Id: 5, Label: "Eco Trust"});
		$scope.collaboratorList.push({Id: 7, Label: "Grande Ronde Model Watershed"});
		$scope.collaboratorList.push({Id: 8, Label: "Landowners"});
		$scope.collaboratorList.push({Id: 9, Label: "Nez Perce Tribe"});
		$scope.collaboratorList.push({Id: 10, Label: "NF John Day Watershed Council"});
		$scope.collaboratorList.push({Id: 11, Label: "Natural Resource Conservation Service"});
		$scope.collaboratorList.push({Id: 12, Label: "Oregon Department of Fish and Wildlife"});
		$scope.collaboratorList.push({Id: 13, Label: "Oregon Department of Transportation"});
		$scope.collaboratorList.push({Id: 14, Label: "Oregon Watershed Enhancement Board"});
		$scope.collaboratorList.push({Id: 15, Label: "Other"});
		$scope.collaboratorList.push({Id: 16, Label: "Pacific Coastal Salmon Recovery Fund"});
		$scope.collaboratorList.push({Id: 17, Label: "Pomeroy Conservation District"});
		$scope.collaboratorList.push({Id: 18, Label: "Salmon Recovery Funding Board"});
		$scope.collaboratorList.push({Id: 19, Label: "Snake River Salmon Recovery Board"});
		$scope.collaboratorList.push({Id: 20, Label: "Umatilla County Soil and Water Conservation District"});
		$scope.collaboratorList.push({Id: 21, Label: "Umatilla National Forest"});
		$scope.collaboratorList.push({Id: 22, Label: "US Forest Service"});
		$scope.collaboratorList.push({Id: 23, Label: "Wallowa Whitman National Forest"});
		$scope.collaboratorList.push({Id: 24, Label: "Washington Department of Fish and Wildlife"});
		*/
		
	$scope.collaboratorList = [];
		$scope.collaboratorList.push("Blue Mountain Habitat Restoration Council");
		$scope.collaboratorList.push("Bureau of Reclamation");
		$scope.collaboratorList.push("Bonneville Power Authority");
		$scope.collaboratorList.push("Columbia Conservation District");
		$scope.collaboratorList.push("CTUIR");
		$scope.collaboratorList.push("Eco Trust");
		$scope.collaboratorList.push("Grande Ronde Model Watershed");
		$scope.collaboratorList.push("Landowners");
		$scope.collaboratorList.push("Nez Perce Tribe");
		$scope.collaboratorList.push("NF John Day Watershed Council");
		$scope.collaboratorList.push("Natural Resource Conservation Service");
		$scope.collaboratorList.push("Oregon Department of Fish and Wildlife");
		$scope.collaboratorList.push("Oregon Department of Transportation");
		$scope.collaboratorList.push("Oregon Watershed Enhancement Board");
		$scope.collaboratorList.push("Other");
		$scope.collaboratorList.push("Pacific Coastal Salmon Recovery Fund");
		$scope.collaboratorList.push("Pomeroy Conservation District");
		$scope.collaboratorList.push("Salmon Recovery Funding Board");
		$scope.collaboratorList.push("Snake River Salmon Recovery Board");
		$scope.collaboratorList.push("Umatilla County Soil and Water Conservation District");
		$scope.collaboratorList.push("Umatilla National Forest");
		$scope.collaboratorList.push("US Forest Service");
		$scope.collaboratorList.push("Wallowa Whitman National Forest");
		$scope.collaboratorList.push("Washington Department of Fish and Wildlife");
	
	console.log("$scope.collaboratorList is next...");
	console.dir($scope.collaboratorList);
	
	$scope.showCollaboratorOptions = false;
	$scope.showOtherCollaborators = false;
	$scope.showOtherFundingAgency = false;
	$scope.showFunders = false;
	$scope.showFundingOptions = false;
	$scope.subproject_row.strCollaborators = "";
	$scope.subproject_row.Collaborators = [];
	$scope.uploadComplete = false;
	var values = null;
	
	console.log("$scope.subproject_row (after initialization) is next...");
	console.dir($scope.subproject_row);
	
	// $scope.viewSubproject gets set when the user clicks on a subproject.
    if($scope.viewSubproject)
    {
        $scope.header_message = "Edit Habitat project: " + $scope.viewSubproject.ProjectName;
		$rootScope.newSubproject = $scope.newSubproject = false;
		$scope.subprojectFileList = $rootScope.subprojectFileList;
		
        $scope.subproject_row = angular.copy($scope.viewSubproject);
		
		console.log("$scope.subproject_row (in viewSubproject) is next...");
		console.dir($scope.subproject_row);
		
		$scope.showAddDocument = false;
		
		if ((typeof $scope.subproject_row.Collaborators !== 'undefined') && ($scope.subproject_row.Collaborators !== null))
		{
			console.log("$scope.subproject_row.Collaborators is next...");
			console.dir($scope.subproject_row.Collaborators);
			
			var strCollaborators = $scope.subproject_row.Collaborators;
			strCollaborators = strCollaborators.replace(/(\r\n|\r|\n)/gm, ""); // Remove any newlines
			strCollaborators = strCollaborators.replace(/["\[\]]+/g, ''); // Remove any brackets []
			strCollaborators = strCollaborators.trim();
			console.log("strCollaborators = " + strCollaborators);
			
			//$scope.subproject_row.strCollaborators = null; // dump the previous contents.
			$scope.subproject_row.strCollaborators = strCollaborators; // reset its value
			console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);
			if ($scope.subproject_row.strCollaborators.indexOf("Other") > -1)
				$scope.showOtherCollaborators = true;
			
			$scope.subproject_row.strCollaborators = strCollaborators;
			
		}
		
		//if ((typeof $scope.subproject_row.OtherCollaborators !== 'undefined') && ($scope.subproject_row.OtherCollaborators !== null))
		//	$scope.showOtherCollaborators = true;
		
		if ($scope.subproject_row.FeatureImage !== null)
		{
			$scope.subproject_row['ItemFiles'] = '[{"Name":"' + $scope.subproject_row.FeatureImage + '"}]';
		}
				
		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.FirstFoods);
			//console.log("First Foods was an object.");
			//console.log("First Foods = " + values);
			var strFirstFoods = values.toString();
			//console.log("strFirstFoods = " + strFirstFoods);
		}
		catch(e)
		{
			values = $scope.subproject_row.FirstFoods.split(",");
			//console.log("First Foods was a string.");
			var strFirstFoods = $scope.subproject_row.FirstFoods.toString();
			//console.log(strFirstFoods);
		}
		$scope.subproject_row.FirstFoods = values;
		
		values = null; // Set/reuse this variable.		
		try
		{
			values = angular.fromJson($scope.subproject_row.RiverVisionTouchstone);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.RiverVisionTouchstone.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.RiverVisionTouchstone = values;
		
		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.HabitatObjectives);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.HabitatObjectives.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.HabitatObjectives = values;
		
		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.NoaaEcologicalConcerns);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.NoaaEcologicalConcerns.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.NoaaEcologicalConcerns = values;
		
		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.NoaaEcologicalConcernsSubcategories);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.NoaaEcologicalConcernsSubcategories.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.NoaaEcologicalConcernsSubcategories = values;

		values = null; // Set/reuse this variable.
		try
		{
			values = angular.fromJson($scope.subproject_row.LimitingFactors);
			//console.log("It was an object.");
		}
		catch(e)
		{
			values = $scope.subproject_row.LimitingFactors.split(",");
			//console.log("It was a string.");
		}
		$scope.subproject_row.LimitingFactors = values;
		
    }
	
	console.log("$scope inside ModalCreateHabSubprojectCtrl, after initializing, is next...");
	console.dir($scope);

    //var uploadWatch = $scope.$watch('uploadComplete', function(){
    $scope.$watch('uploadComplete', function(){
		if (!$scope.uploadComplete)
			return;
		
		console.log("Inside watch uploadComplete...");
		angular.forEach($scope.filesToUpload, function(files, field){

			if(field == "null" || field == "")
				return;
			
			var local_files = [];

			for(var i = 0; i < files.length; i++)
			{
				console.log("$scope is next...")
				console.dir($scope);
			  
				var file = files[i];
				console.log("Reviewing results on file " + file.Name);
				console.dir(file);
			  
				console.log("$scope.errors is next...");
				console.dir($scope.errors);
				console.log("typeof $scope.errors = " + typeof $scope.errors);
				if(file.data && file.data.length == 1) //since we only upload one at a time...
				{
					//console.dir(file.data);
					local_files.push(file.data[0]); //only ever going to be one if there is any...
					//console.log("file id = "+file.data[0].Id);
				}
				else if (typeof $scope.errors === 'undefined')
				{
					console.log("No errors...");
				}
				else
				{
					//console.log("no file id.");
					$scope.foundDuplicate = true;
					$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
					console.log("$scope is next...");
					console.dir($scope);
					throw "Problem saving file: " + file.Name;
				}
			}

			console.log("$scope.subproject_row is next...");
			console.dir($scope.subproject_row);
			console.log("field = " + field);
			//if we already had actual files in this field, copy them in
			if($scope.subproject_row[field])
			{
				console.log("On Files field...");
				var current_files = angular.fromJson($scope.subproject_row[field]);
				angular.forEach(current_files, function(file){
					if(file.Id) //our incoming files don't have an id, just actual files.
						local_files.push(file);		
				});
			}

			$scope.subproject_row[field] = angular.toJson(local_files);
			//console.log("Ok our new list of files: "+$scope.row[field]);
			
			if ($scope.addDocument === "Yes")
			{
				console.log("$scope.addDocument = Yes...");
				
				// If the user wishes to add a Correspondence Event right away, we must wait to get the ID of the new subproject, before we can continue.
				//$scope.reloadSubproject(promise.Id);
				//var promise2 = $scope.reloadSubproject(promise.Id);
				//console.log("Inside reloadSubproject...");
				//DataService.clearSubproject();
				//DataService.clearHabSubproject(); // Commented out in services.js
				//$scope.reloadSubproject($scope.subprojectId);
				//$modalInstance.dismiss();	
				$scope.openHabitatItemForm();
				//$scope.subproject = DataService.getSubproject(id);
			}
			else
			{
				console.log("$scope.addDocument != Yes");
				
				// If the user just wants to create the Subproject, we can continue without waiting.
				//$scope.reloadSubproject($scope.subprojectId);
				//$modalInstance.dismiss();
			}
			
			DataService.clearSubproject();
			if (($scope.filesToUpload.ItemFiles) || ($scope.NewPoint)) // No new files to upload, and using an existing point.
			{
				console.log("Reloading the whole project, because we have a new location or file...");
				$scope.reloadThisProject();
			}
			else
			{
				console.log("Just reloading the subproject...");
				$scope.reloadSubproject($scope.subprojectId);
			}
		});
		
		//uploadWatch();
	});
	
    $scope.$watch('savingHabSubproject', function(){
		console.log("Inside ModalCreateHabSubprojectCtrl, watch savingHabSubproject...");
		console.log("$scope.savingHabSubproject = " + $scope.savingHabSubproject);

		// The save function saved the location associated to this subproject.
		// This watch saves the actual subproject, and any files associated to it.
		
		//if ((!$scope.subproject_row.LocationId) || ($scope.subproject_row.LocationId === null))
		if ($scope.savingHabSubproject === false)
			return;
		
		var fileAlreadySaved = false;
		// Now begin saving the subproject.
		console.log("$scope.subproject_row.LocationId (in watch) = " + $scope.subproject_row.LocationId);
		
		var saveRow = angular.copy($scope.subproject_row);
		console.log("saveRow (before wiping HabitatItems) is next..");
		console.dir(saveRow);

		saveRow.HabitatItems = undefined;
		console.log("saveRow (after wiping HabitatItems) is next...");
		console.dir(saveRow);
		
		var promise = null;		
		promise = DatastoreService.saveHabSubproject(parseInt($scope.projectId), saveRow, $scope.saveResults);
		
		if (typeof promise !== 'undefined')
		{
			promise.$promise.then(function(){
				//window.location.reload();
				
				// Are we working with a new point, or an existing one?
				if ($scope.NewPoint)
				{
					// Normally, scope.SdeObjectId is set to 0; if it is > 0, then we just saved a new location and need to handle it.
					console.log("promise in $scope.$watch('subproject_row.LocationId' is next...");
					console.dir(promise);
					console.dir($scope);
					$scope.subprojectId = $rootScope.subprojectId = promise.Id;
					console.log("$scope.subprojectId = " + $scope.subprojectId);
					$scope.locationId = promise.LocationId;
					console.log("$scope.locationId = " + $scope.locationId);			
					
					// Note:  In the Save function, we created a location object, but we had no SubprojectId.
					// Now we have subprojects, so let's go back right away and update that Location object, providing the new SubprojectId.
					var newLocation = angular.copy(DEFAULT_LOCATION_PROJECTION_ZONE);
					newLocation.Id = $scope.locationId;
					newLocation.Label = saveRow.ProjectName;
					newLocation.Description = saveRow.ProjectDescription;
					newLocation.GPSEasting = saveRow.GPSEasting;
					newLocation.GPSNorthing = saveRow.GPSNorthing;
					newLocation.ProjectId = parseInt($scope.projectId);
					newLocation.SubprojectId = $scope.subprojectId;
					newLocation.SdeObjectId = $scope.SdeObjectId; // We set this in the $scope.save function.
					newLocation.LocationTypeId = LOCATION_TYPE_Hab;
					newLocation.WaterBodyId = saveRow.WaterBodyId;
					
					console.log("newLocation is next...");
					console.dir(newLocation);
					
					promise = DatastoreService.saveNewProjectLocation($scope.project.Id, newLocation);
					promise.$promise.then(function(){
						//$scope.subproject_row = 'undefined';
						$scope.habProjectName = saveRow.ProjectName;
					});
				}
				else
				{
					console.log("We are working with an existing location...");
				}
				
				var i = 0;  // Number of files.
				var fileSize = 1;
				// Check if we updated the file list.
				if ($scope.filesToUpload.ItemFiles)
				{
					console.log("$scope.filesToUpload.ItemFiles is next...");
					console.dir($scope.filesToUpload.ItemFiles);
					$rootScope.featureImagePresent = $scope.featureImagePresent = true;
					//var i = 0;
					for(i = 0; i < $scope.filesToUpload.ItemFiles.length; i++)
					{
						var file = $scope.filesToUpload.ItemFiles[i];
						console.log("file is next...");
						console.dir(file);
						
						var newFileNameLength = file.name.length;
						console.log("file name length = " + newFileNameLength);

						// Inform the user immediately, if there are duplicate files.
						if ($scope.foundDuplicate)
							alert(errors);
						else
						{
							console.log("file is next again...");
							console.dir(file);
							console.log("file.success = " + file.success);
							if(file.success != "Success")
							{
								console.log("No file.success means we have not saved the file yet, so let's save it...");
								// *** Note:  Timing issue.  After the upload kicks off, JavaScript goes on, running the stuff that follows, and then this completes. ***
								$scope.upload = $upload.upload({
									url: serviceUrl + '/data/UploadHabitatFile',
									method: "POST",
									// headers: {'headerKey': 'headerValue'},
									// withCredential: true,
									//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name},
									//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, DatastoreTablePrefix: $scope.DatastoreTablePrefix},
									//data: {ProjectId: $scope.project.Id, SubprojectId: $scope.subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, SubprojectType: "Hab"},
									
									// FeatureImage of 1 = Yes
									// FeatureImage of 0 = No, HabitatItem file
									data: {ProjectId: $scope.project.Id, SubprojectId: $scope.subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, SubprojectType: "Hab", FeatureImage: 1},
									file: file,

									}).progress(function(evt) {
										console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
									}).success(function(data, status, headers, config) {
										//console.log("The following are next:  data, status, headers, config, file");
										console.log("file is next...");
										//console.dir(data);
										//console.dir(status);
										//console.dir(headers);
										//console.dir(config);
										console.dir(file);
										config.file.success = "Success";
										
										console.log("file is next...");
										console.dir(file);
										//var promise = DatastoreService.saveSubprojectFile($scope.project.Id, "Hab", $scope.subprojectId, file);
										//promise.$promise.then(function(){
											console.log("done and success!");
											//reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
											$scope.refreshProjectLocations();
											//$modalInstance.dismiss();
										//});
										
										//$scope.uploadComplete = true;
										
									}).error(function(data, status, headers, config) {
										$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
										//console.log(file.name + " was error.");
										config.file.success = "Failed";
										
									});
									
								//console.log("$scope.upload is next...");
								//console.dir($scope.upload);

							}
							else
							{
								console.log("We have already saved this file...");
								fileAlreadySaved = true;
							}
							
						}
					}
					if (i === 0)
						$rootScope.featureImagePresent = $scope.featureImagePresent = false;
					
					if (!fileAlreadySaved)
						setTimeout($scope.fileUploadResultsReviewer, (i*1000));
					
					/*angular.forEach($scope.filesToUpload, function(files, field){

						if(field == "null" || field == "")
							return;
						
						var local_files = [];

						for(var i = 0; i < files.length; i++)
						{
							console.log("$scope is next...")
							console.dir($scope);
						  
							var file = files[i];
							console.log("Reviewing results on file " + file.Name);
							console.dir(file);
						  
							console.log("$scope.errors is next...");
							console.dir($scope.errors);
							console.log("typeof $scope.errors = " + typeof $scope.errors);
							if(file.data && file.data.length == 1) //since we only upload one at a time...
							{
								//console.dir(file.data);
								local_files.push(file.data[0]); //only ever going to be one if there is any...
								//console.log("file id = "+file.data[0].Id);
							}
							else if (typeof $scope.errors === 'undefined')
							{
								console.log("No errors...");
							}
							else
							{
								//console.log("no file id.");
								$scope.foundDuplicate = true;
								$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
								console.log("$scope is next...");
								console.dir($scope);
								throw "Problem saving file: " + file.Name;
							}
						}

						console.log("$scope.subproject_row is next...");
						console.dir($scope.subproject_row);
						console.log("field = " + field);
						//if we already had actual files in this field, copy them in
						if($scope.subproject_row[field])
						{
							console.log("On Files field...");
							var current_files = angular.fromJson($scope.subproject_row[field]);
							angular.forEach(current_files, function(file){
								if(file.Id) //our incoming files don't have an id, just actual files.
									local_files.push(file);		
							});
						}

						$scope.subproject_row[field] = angular.toJson(local_files);
						//console.log("Ok our new list of files: "+$scope.row[field]);
					});
					*/
				}
				else
				{
					console.log("Not uploading any new files...");
				}
				
				setTimeout($scope.finalPart, ((i+1)*1000));
				
				//$scope.reloadThisProject(); // Reload the project, to reload the project locations (what shows on the map); this will also reload the subprojects.
				//$scope.reloadSubprojects(); // Reload the subprojects, 
				
				
				/*if ($scope.addDocument === "Yes")
				{
					console.log("$scope.addDocument = Yes...");
					
					// If the user wishes to add a Correspondence Event right away, we must wait to get the ID of the new subproject, before we can continue.
					//$scope.reloadSubproject(promise.Id);
					//var promise2 = $scope.reloadSubproject(promise.Id);
					//console.log("Inside reloadSubproject...");
					//DataService.clearSubproject();
					//DataService.clearHabSubproject(); // Commented out in services.js
					//$scope.reloadSubproject($scope.subprojectId);
					$modalInstance.dismiss();	
					$scope.openHabitatItemForm();
					//$scope.subproject = DataService.getSubproject(id);
				}
				else
				{
					console.log("$scope.addDocument != Yes");
					
					// If the user just wants to create the Subproject, we can continue without waiting.
					//$scope.reloadSubproject($scope.subprojectId);
					$modalInstance.dismiss();
				}
				
				DataService.clearSubproject();
				if (($scope.filesToUpload.ItemFiles) || ($scope.NewPoint)) // No new files to upload, and using an existing point.
				{
					console.log("Reloading the whole project, because we have a new location or file...");
					$scope.reloadThisProject();
				}
				else
				{
					console.log("Just reloading the subproject...");
					$scope.reloadSubproject($scope.subprojectId);
				}*/
			});
		}		
	});

	$scope.fileUploadResultsReviewer = function(){
		console.log("Inside $scope.fileUploadResultsReviewer...");
		//angular.forEach($scope.filesToUpload, function(files, field){
		angular.forEach($scope.filesToUpload, function(files, field){

			if(field == "null" || field == "")
				return;
			
			var local_files = [];
			console.log("$scope is next...")
			console.dir($scope);
			
			for(var i = 0; i < files.length; i++)
			{ 
				var file = files[i];
				console.log("Reviewing results on file " + file.Name);
				console.dir(file);
			  
				console.log("$scope.errors is next...");
				console.dir($scope.errors);
				console.log("typeof $scope.errors = " + typeof $scope.errors);
				if(file.data && file.data.length == 1) //since we only upload one at a time...
				{
					//console.dir(file.data);
					local_files.push(file.data[0]); //only ever going to be one if there is any...
					//console.log("file id = "+file.data[0].Id);
				}
				else if (typeof $scope.errors === 'undefined')
				{
					console.log("No errors...");
				}
				else
				{
					//console.log("no file id.");
					$scope.foundDuplicate = true;
					$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
					console.log("$scope is next...");
					console.dir($scope);
					throw "Problem saving file: " + file.Name;
				}
			}

			console.log("$scope.subproject_row is next...");
			console.dir($scope.subproject_row);
			console.log("field = " + field);
			//if we already had actual files in this field, copy them in
			if($scope.subproject_row[field])
			{
				console.log("On Files field...");
				var current_files = angular.fromJson($scope.subproject_row[field]);
				console.log("var current_files is next...");
				console.dir(current_files);
				angular.forEach(current_files, function(file){
					if(file.Id) //our incoming files don't have an id, just actual files.
						local_files.push(file);		
				});
			}

			$scope.subproject_row[field] = angular.toJson(local_files);
			//console.log("Ok our new list of files: "+$scope.row[field]);
		});
	};
	
	$scope.finalPart = function(){
		console.log("Inside $scope.finalPart...");
		if ($scope.addDocument === "Yes")
		{
			console.log("$scope.addDocument = Yes...");
			
			// If the user wishes to add a Habitat Item right away, we must wait to get the ID of the new subproject, before we can continue.
			//$scope.reloadSubproject(promise.Id);
			//var promise2 = $scope.reloadSubproject(promise.Id);
			//console.log("Inside reloadSubproject...");
			//DataService.clearSubproject();
			//DataService.clearHabSubproject(); // Commented out in services.js
			//$scope.reloadSubproject($scope.subprojectId);
			$modalInstance.dismiss();	
			$scope.openHabitatItemForm();
			//$scope.subproject = DataService.getSubproject(id);
		}
		else
		{
			console.log("$scope.addDocument != Yes");
			
			// If the user just wants to create the Subproject, we can continue without waiting.
			//$scope.reloadSubproject($scope.subprojectId);
			
			$scope.subprojects = null;
			$scope.reloadSubprojects();
			$scope.reloadSubprojectLocations();
			
			$modalInstance.dismiss();
		}
		
		DataService.clearSubproject();

		console.log("Reload the whole project; this is the easiest way to capture the updates.");
		// If we use services.js, service.getSubproject, it only reloads what we already had, before the changes.
		// The save action puts the updates in the database, so we must pull the updates (and update our variables in the process) from the database.
		$scope.reloadThisProject();
	};
	
	//$scope.showStartDate = function(){
	//	console.log("$scope.subproject_row.ProjectStartDate (before conversion) = " + $scope.subproject_row.ProjectStartDate);		
		//$scope.subproject_row.ProjectStartDate = setDateTo0000($scope.subproject_row.ProjectStartDate);
	//	console.log("$scope.subproject_row.ProjectStartDate (after conversion) = " + $scope.subproject_row.ProjectStartDate);
	//};
	
	//$scope.showEndDate = function(){
	//	console.log("$scope.subproject_row.ProjectEndDate (before conversion) = " + $scope.subproject_row.ProjectEndDate);		
		//$scope.subproject_row.ProjectEndDate = setDateTo0000($scope.subproject_row.ProjectEndDate);
	//	console.log("$scope.subproject_row.ProjectEndDate (after conversion) = " + $scope.subproject_row.ProjectEndDate);
	//};

	$scope.selectFunder = function () {
		console.log("Inside selectFunder...");
		console.dir($scope);
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
				
		if ($scope.subproject_row.fundingName === "Other")
		{
			$scope.showOtherFunder = true;
			$scope.subproject_row.OtherFundingAgency = "";
		}
		else
		{
			$scope.showOtherFunder = false;
			$scope.subproject_row.OtherFundingAgency = 'undefined';
		}
		
		console.log("$scope.showOtherAgency = " + $scope.showOtherAgency);
	};

	$scope.selectCollaborator = function () {
		console.log("Inside selectCollaborator...");
		console.dir($scope);
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
						
		if ($scope.subproject_row.Collaborators === "Other")
		{
			$scope.showOtherCollaborators = true;
			$scope.subproject_row.OtherCollaborators = "";
		}
		else
		{
			$scope.showOtherCollaborators = false;
			$scope.subproject_row.OtherCollaborators = 'undefined';
		}
		
		console.log("$scope.OtherCollaborators = " + $scope.OtherCollaborators);
	};
	
	$scope.enteredSelectedCollaborators = function () {
		$scope.showCollaboratorOptions = true;
	};
	
	$scope.enteredSomethingElse = function () {
		$scope.showCollaboratorOptions = false;
	};
	
	$scope.collaboratorChanged = function() {
		console.log("Inside collaboratorChanged...");
		console.log("$scope.subproject_row is next...");
		console.dir($scope.subproject_row);
		
		$scope.subproject_row.strCollaborators = $scope.subproject_row.Collaborators.toString();
		if ($scope.subproject_row.strCollaborators.indexOf("Other") > -1)
		{
			$scope.showOtherCollaborators = true;
		}
		else
		{
			$scope.showOtherCollaborators = false;
			$scope.subproject_row.OtherCollaborators = null;
		}
		
		console.log("$scope.showOtherCollaborators = " + $scope.showOtherCollaborators);
	};
	
	$scope.addCollaborator = function() {
		console.log("+C clicked...");
		console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);	
		
		if (typeof $scope.subproject_row.strCollaborators === 'undefined')
			$scope.subproject_row.strCollaborators = "";

		// We will add a new line at the end, so that the string presents well on the page.
		if ($scope.subproject_row.Collaborators === "Other")
		{
			$scope.subproject_row.strCollaborators += $scope.subproject_row.OtherCollaborators + ";\n";			
		}
		else
		{
			$scope.subproject_row.strCollaborators += $scope.subproject_row.Collaborators + ";\n";
		}
		
		console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);		
	};
	
	$scope.removeCollaborator = function() {
		console.log("-C clicked...");
		console.log("$scope.subproject_row.strCollaborators before stripping = " + $scope.subproject_row.strCollaborators);
		
		// First, strip out the new line characters.
		$scope.subproject_row.strCollaborators = $scope.subproject_row.strCollaborators.replace(/(\r\n|\r|\n)/gm, "");
		console.log("$scope.subproject_row.strCollaborators after stripping = " + $scope.subproject_row.strCollaborators);
		
		// Note, we still have the trailing semicolon.
		// Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
		var aryCollaborators = $scope.subproject_row.strCollaborators.split(";");
		
		// Next, get rid of that trailing semicolon.
		aryCollaborators.splice(-1, 1);
		console.dir(aryCollaborators);
		
		// Now we can continue with the delete action.
		var aryCollaboratorsLength = aryCollaborators.length;
		
		// First check if the user entered an "other" funder.
		if (($scope.subproject_row.Collaborators === "Other") && ($scope.subproject_row.OtherCollaborators))
		{	
			for (var i = 0; i < aryCollaboratorsLength; i++)
			{
				console.log("aryCollaborators[i] = " + aryCollaborators[i]);
				if (aryCollaborators[i].indexOf($scope.subproject_row.OtherCollaborators) > -1)
				{
					console.log("Found the item...");
					aryCollaborators.splice(i,1);
					console.log("Removed the item.");
					
					$scope.subproject_row.strCollaborators = "";
					console.log("Wiped $scope.subproject_row.strCollaborators...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryCollaborators, function(item){
						$scope.subproject_row.strCollaborators += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryCollaboratorsLength;
				}
			}
		}
		else
		{
			for (var i = 0; i < aryCollaboratorsLength; i++)
			{
				console.log("aryCollaborators[i] = " + aryCollaborators[i]);
				if (aryCollaborators[i].indexOf($scope.subproject_row.Collaborators) > -1)
				{
					console.log("Found the item...");
					aryCollaborators.splice(i,1);
					console.log("Removed the item.");
					
					$scope.subproject_row.strCollaborators = "";
					console.log("Wiped $scope.subproject_row.strCollaborators...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryCollaborators, function(item){
						$scope.subproject_row.strCollaborators += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryCollaboratorsLength;
				}
			}
		}
		console.log("Finished.");
	};
	
	/*$scope.fundingItemClicked = function(itemChecked) {
		console.log("itemChecked = " + itemChecked);
		console.log("$scope.subproject_row.Funding is next...");
		console.dir($scope.subproject_row.Funding);
		if ($scope.subproject_row.Funding.Checked)
			$scope.showFundingBox = false;
		else
			$scope.showFundingBox = true;
		
		console.log("$scope.showFundingBox = " + $scope.showFundingBox);
	};*/
	
	$scope.addFundingAgency = function() {
		console.log("+FA clicked...");
		console.log("$scope.subproject_row.strFunders = " + $scope.subproject_row.strFunders);
		//console.log("$scope.subproject_row.Funding.Amount = " + $scope.subproject_row.Funding.Amount + ", typeof $scope.subproject_row.Funding.Amount = " + typeof $scope.subproject_row.Funding.Amount);
		console.log("$scope.subproject_row.fundingAmount = " + $scope.subproject_row.fundingAmount + ", typeof $scope.subproject_row.fundingAmount = " + typeof $scope.subproject_row.fundingAmount);
		
		//if (!$scope.subproject_row.Funding.Amount) //|| (!$scope.subproject_row.Funding.Amount.trim()))
		if (!$scope.subproject_row.fundingAmount) //|| (!$scope.subproject_row.Funding.Amount.trim()))
		{
			alert("If you add a Funding Agency, you MUST enter a funding amount.");
			return;
		}
		
		// First, capture what we really need for a number ($ and commas are OK, but we strip them out).
		//var amt1 = $scope.subproject_row.Funding.Amount.replace(/(,|\$)/gm, "");  // Remove the $ and commas.
		
		// Next, locate the decimal; there should only be one.
		//var decimalLoc1 = $scope.subproject_row.Funding.Amount.indexOf(".");  // Find the decimal.
		//var decimalLoc2 = $scope.subproject_row.Funding.Amount.lastIndexOf(".");  // Find the last decimal; the number can have only one decimal.
		
		// Remove the decimals.
		//var noDecimal = amt1.replace(/./gm, "");  // Remove the decimals now.
		
		// Remove the digits.
		//var noDigits = noDecimal.replace(/\d/gm, "");  // Now remove the digits.
		
		// If anything remains now, the value is not a number.
		//console.log("decimalLoc1 = " + decimalLoc1 + ", decimalLoc2 = " + decimalLoc2);
		//if (decimalLoc1 !== decimalLoc2)
		//{
		//	alert("Only one decimal (.) is allowed.");
		//	return;
		//}
		//$scope.subproject_row.Funding.Amount = $scope.subproject_row.Funding.Amount.replace(/(,|\$)/gm, "");
		
		//console.log("$scope.subproject_row.Funding.Name = " + $scope.subproject_row.Funding.Name);
		console.log("$scope.subproject_row.fundingName = " + $scope.subproject_row.fundingName);
		//console.log("$scope.subproject_row.Funding.Amount = " + $scope.subproject_row.Funding.Amount);
		console.log("$scope.subproject_row.fundingAmount = " + $scope.subproject_row.fundingAmount);

		if (typeof $scope.subproject_row.strFunders === 'undefined')
			$scope.subproject_row.strFunders = "";
		
		// We will add a new line at the end, so that the string presents well on the page.
		if ($scope.subproject_row.fundingName === "Other")
		{
			$scope.subproject_row.strFunders += $scope.subproject_row.OtherFundingAgency + ", " + $scope.subproject_row.fundingAmount + ";\n";			
		}
		else
		{
			//$scope.subproject_row.strFunders += $scope.subproject_row.Funding.Name + ", " + $scope.subproject_row.Funding.Amount + ";\n";
			$scope.subproject_row.strFunders += $scope.subproject_row.fundingName + ", " + $scope.subproject_row.fundingAmount + ";\n";
		}
		
		console.log("$scope.subproject_row.strFunders = " + $scope.subproject_row.strFunders);
	};
	
	$scope.removeFundingAgency = function() {
		console.log("- clicked...");
		console.log("$scope.subproject_row.strFunders before stripping = " + $scope.subproject_row.strFunders);
		
		// First, strip out the new line characters.
		//$scope.subproject_row.strFunders = $scope.subproject_row.strFunders.replace(/[^\x00-\x1F]/gmi, "");
		$scope.subproject_row.strFunders = $scope.subproject_row.strFunders.replace(/(\r\n|\r|\n)/gm, "");
		console.log("$scope.subproject_row.strFunders after stripping = " + $scope.subproject_row.strFunders);
		
		// Note, we still have the trailing semicolon.
		// Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
		var aryFunders = $scope.subproject_row.strFunders.split(";");
		
		// Next, get rid of that trailing semicolon.
		aryFunders.splice(-1, 1);
		console.dir(aryFunders);
		
		// Now we can continue with the delete action.
		var aryFundersLength = aryFunders.length;
		
		// First check if the user entered an "other" funder.
		if (($scope.subproject_row.fundingName === "Other") && ($scope.subproject_row.OtherFundingAgency))
		{	
			for (var i = 0; i < aryFundersLength; i++)
			{
				console.log("aryFunders[i] = " + aryFunders[i]);
				if (aryFunders[i].indexOf($scope.subproject_row.OtherFundingAgency) > -1)
				{
					console.log("Found the item...");
					aryFunders.splice(i,1);
					console.log("Removed the item.");
					
					$scope.subproject_row.strFunders = "";
					console.log("Wiped $scope.subproject_row.strFunders...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryFunders, function(item){
						$scope.subproject_row.strFunders += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryFundersLength;
				}
			}
		}
		else
		{
			for (var i = 0; i < aryFundersLength; i++)
			{
				console.log("aryFunders[i] = " + aryFunders[i]);
				if (aryFunders[i].indexOf($scope.subproject_row.fundingName) > -1)
				{
					console.log("Found the item...");
					aryFunders.splice(i,1);
					console.log("Removed the item.");
					
					$scope.subproject_row.strFunders = "";
					console.log("Wiped $scope.subproject_row.strFunders...");
					
					// Rebuild the string now, adding the semicolon and newline after every line.
					angular.forEach(aryFunders, function(item){
						$scope.subproject_row.strFunders += item + ";\n";
						console.log("Added item...");
					});
					
					// Since we found the item, skip to then end to exit.
					i = aryFundersLength;
				}
			}
		}
		console.log("Finished.");
	};
	
	$scope.openFileModal = function(row, field)
	{
		console.log("Inside ModalCreateHabSubprojectCtrl, openFileModal...");
		console.log("row is next...");
		console.dir(row);
		console.log("field is next...");
		console.dir(field);
		$scope.file_row = row;
		//$scope.file_field = field;
		$scope.file_field = {
			DbColumnName: "ItemFiles"
		};
		
		var modalInstance = $modal.open({
			templateUrl: 'partials/modals/file-modal.html',
			controller: 'FileModalCtrl',
			scope: $scope, //scope to make a child of
		});
	};
	
	$scope.onFileSelect = function(field, files)
	{
		console.log("Inside ModalCreateHabSubprojectCtrl, onFileSelect");
		console.log("file selected! " + field);
		$scope.filesToUpload[field] = files;
	};
	
	/*$scope.$watch('fileProgress', function(){
		console.log("Inside watch fileProgress...");
		console.log("$scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
		if($scope.fileProgress < $scope.fileCount)
			return;
		
		if ($scope.saving)
		{
			$scope.loading = false; // Stop the fish spinner.
			$scope.showCloseButton = true;
			$scope.showCancelButton = false;
			$scope.showFormItems = false;
		}
	});
	*/
	
    $scope.save = function(){
		console.log("Inside ModalCreateHabSubprojectCtrl, save...");
		$scope.subprojectSave = undefined;
		$scope.subprojectSave = [];
		$scope.subprojectSave.error = false;
		$scope.subprojectSave.errorMessage = "";
		$scope.savingHabSubproject = false;
		$scope.subproject_row.Funding = []; // Declare this again.
		$scope.subproject_row.Collaborators = []; // Declare this again.
		$scope.createNewSubproject = false;
		//$scope.featureImage = null;
		$scope.locationId = 0;
		$scope.NewPoint = false;
		//$scope.subproject_row.LocationTypeId = 112; // Metrics
		
		// Note:  The main thing that we do in this function is save the new location for the Subproject.
		// After we save the location, the watch for $scope.savingHabSubproject run, and it saves the subproject.
		
		if ((typeof $scope.subproject_row.ProjectName === 'undefined') || ($scope.subproject_row.ProjectName === null))
		{
			console.log("Project name is empty...");
			$scope.subprojectSave.error = true;
			$scope.subprojectSave.errorMessage = "Project Name cannot be blank!  ";
		}
		
		if ((typeof $scope.subproject_row.GPSEasting === 'undefined') || (typeof $scope.subproject_row.GPSNorthing === 'undefined'))
		{
			console.log("Easting or Northing is blank...");
			$scope.subprojectSave.error = true;
			$scope.subprojectSave.errorMessage += "Easting and Northing cannot be blank!  ";
		}
		
		console.log("$scope is next...");
		console.dir($scope);
		
		if (!$scope.subprojectSave.error)
		{
			console.log("$scope.subproject_row, full is next...");
			console.dir($scope.subproject_row);

			// Capture the AddDocument flag, before discarding it.			
			$scope.addDocument = $scope.subproject_row.AddDocument;
			$scope.subproject_row.AddDocument = null;
			
			if (!$scope.subproject_row.LocationId)
				$scope.subproject_row.LocationId = 0;
			
			/********* A note about time start ***********/
			/* 	When we save the subproject, when the backend converts the ProjectStartDate and ProjectEndDate to UTC (adds 8 hours).
				So, with an initial saved time of 0000, the backend converts it to 0800.
				Each time we save then, the time will have 8 hours added to it.  On the 4th save, it will go into the next day.
				To avoid this, we take the saved date (now 0800), and set it back to 0000.
				This will keep the time in the same spot (keep it from changing).
				There may be a better way to handle this issue, but this technique works too...
			*/
			
			if ($scope.subproject_row.ProjectStartDate)
			{
				var psDate = new Date(Date.parse($scope.subproject_row.ProjectStartDate));
				$scope.subproject_row.ProjectStartDate = setDateTo0000(psDate);
			}
			
			if ($scope.subproject_row.ProjectEndDate)
			{
				var peDate = new Date(Date.parse($scope.subproject_row.ProjectEndDate));
				$scope.subproject_row.ProjectEndDate = setDateTo0000(peDate);
			}
			/********* A note about time end ***********/

			console.log("$scope.addDocument = " + $scope.addDocument);
			console.log("$scope.subproject_row, after del is next...");
			console.dir($scope.subproject_row);			
			
			$scope.saveResults = {};
			console.log("$scope is next...");
			console.dir($scope);
			
			// First, a little cleanup.
			$scope.subprojectSave.error = false;
			$scope.subprojectSave.errorMessage = "";
			
			// Check the Feature Image box.
			/*if ((typeof $scope.subproject_row['ItemFiles'] !== 'undefined') && (typeof $scope.subproject_row['ItemFiles'] !== 'undefined'))
			{
				$scope.subproject_row.featureImage = 1;
			}
			else
			{
				$scope.subproject_row.featureImage = null;
			}
			*/
			
			// First Foods
			console.log("First Foods = " + $scope.subproject_row.FirstFoods);
			
			// Funding
			console.log("$scope.subproject_row.Funding is next...");
			console.dir($scope.subproject_row.Funding);
			console.log("type of $scope.subproject_row.Funding = " + typeof $scope.subproject_row.Funding);
			
			//if ($scope.subproject_row.Funding.length > 0)
			if ((typeof $scope.subproject_row.strFunders !== 'undefined') && ($scope.subproject_row.strFunders !== null) && ($scope.subproject_row.strFunders.length > 0))
			{
				if ($scope.subproject_row.strFunders.length > 0)
				{
					$rootScope.fundersPresent = $scope.fundersPresent = true;
					var strFunders = $scope.subproject_row.strFunders.replace(/(\r\n|\r|\n)/gm, "");  // Remove all newlines (used for presentation).
					var aryFunders = $scope.subproject_row.strFunders.split(";");  // 
					aryFunders.splice(-1, 1);
					
					angular.forEach(aryFunders, function(item) {
						console.log("item = " + item);
						var funderRecord = item.split(",");
						
						var fundingOption = new Object();
						//fundingOption.Checked = false;
						fundingOption.Id = 0;
						fundingOption.Name = "";
						fundingOption.Amount = 0;
						
						fundingOption.Name = funderRecord[0].trim();
						console.log("fundingOption.Name = " + fundingOption.Name);
						
						// Get the Id for the funder from funderList.
						//angular.forEach($scope.funderList, function(funder) {
						//	if (funder.Name = fundingOption.Name)
						//		fundingOption.Id = funder.Id;
						//});
						
						fundingOption.Amount = parseFloat(funderRecord[1]);
						console.log("fundingOption.Amount = " + fundingOption.Amount);
						
						$scope.subproject_row.Funding.push(fundingOption);		
					});
					$scope.subproject_row.strFunders = undefined;
				}
			}
			
			// Collaborators
			console.log("$scope.subproject_row.strCollaborators = " + $scope.subproject_row.strCollaborators);
			console.log("type of $scope.subproject_row.strCollaborators = " + typeof $scope.subproject_row.strCollaborators);
	
			if ((typeof $scope.subproject_row.strCollaborators !== 'undefined') && ($scope.subproject_row.strCollaborators !== null) && ($scope.subproject_row.strCollaborators.length > 0))
			{
				$rootScope.collaboratorPresent = $scope.collaboratorPresent = true;
				var strCollaborators = $scope.subproject_row.strCollaborators.replace(/(\r\n|\r|\n)/gm, "");  // Remove all newlines (used for presentation).
				console.log("strCollaborators = " + strCollaborators);
				var aryCollaborators = $scope.subproject_row.strCollaborators.split(";");  // 
				//aryCollaborators.splice(-1, 1);
				
				angular.forEach(aryCollaborators, function(item) {
					//After the split on ";", one of the lines is a newline.  We need to watch for and omit that line.
					//console.log("item = X" + item + "X");
					//item = item.replace(/(\r\n|\r|\n)/gm, "");
					item = item.replace(/\n/g, "");
					//console.log("item = X" + item + "X");
					
					if (item.length > 0)
					{
						var collaboratorOption = new Object();
						collaboratorOption.Id = 0;
						collaboratorOption.Name = "";
						
						collaboratorOption.Name = item.trim();
						//console.log("collaboratorOption.Name = " + collaboratorOption.Name);
						
						$scope.subproject_row.Collaborators.push(collaboratorOption);
					}
				});
				$scope.subproject_row.strCollaborators = undefined;
			}
			//$scope.savingHabSubproject = true;
			
			var subprojectId = 0;
			// Are we creating a new Subproject, or editing an existing one?
			if ($scope.viewSubproject)
			{
				console.log("We are editing an existing subproject; no new location needed...");
				subprojectId = $scope.viewSubproject.Id
				
				// We put this inside both branches of the if, because we need the branch to complete, before the watch triggers.
				$scope.savingHabSubproject = true;
			}
			else
			{
				subprojectId = $scope.subprojectId;
				
				//$scope.viewSubproject either does not exist or is null, so we are creating a new Subproject.
				// Next, we add/save the location.
				console.log("This is a new subproject; creating a new location...");
				var newLocation = angular.copy(DEFAULT_LOCATION_PROJECTION_ZONE);
				newLocation.Label = $scope.subproject_row.ProjectName;
				newLocation.Description = $scope.subproject_row.ProjectDescription;
				newLocation.GPSEasting = $scope.subproject_row.GPSEasting;
				newLocation.GPSNorthing = $scope.subproject_row.GPSNorthing;
				newLocation.ProjectId = parseInt($scope.projectId);
				newLocation.LocationTypeId = LOCATION_TYPE_Hab;
				newLocation.WaterBodyId = $scope.subproject_row.WaterBodyId;
				//newLocation.SubprojectId = $scope.subprojectId; // When we are creating a new subproject, we do not have the subprojectId yet; this is from the old one.
				console.log("newLocation is next...");
				console.dir(newLocation);
				
				//nad83 zone 11...  might have to have this as a list somehwere...
				var inSR = new esri.SpatialReference({ wkt: NAD83_SPATIAL_REFERENCE });
				var outSR = new esri.SpatialReference({wkid: 102100});
				var geometryService = new esri.tasks.GeometryService(GEOMETRY_SERVICE_URL);
				$scope.newPoint = new esri.geometry.Point(newLocation.GPSEasting, newLocation.GPSNorthing, inSR);			

				//convert spatial reference
				var PrjParams = new esri.tasks.ProjectParameters();

				PrjParams.geometries = [ $scope.newPoint ];
				// PrjParams.outSR is not set yet, so we must set it also.
				PrjParams.outSR = outSR;

				//do the projection (conversion)
				geometryService.project(PrjParams, function(outputpoint) {

					$scope.newPoint = new esri.geometry.Point(outputpoint[0], outSR);
					$scope.newGraphic = new esri.Graphic($scope.newPoint, new esri.symbol.SimpleMarkerSymbol());
					$scope.map.graphics.add($scope.newGraphic);

					//add the graphic to the map and get SDE_ObjectId
					$scope.map.locationLayer.applyEdits([$scope.newGraphic],null,null).then(function(results){

						if(results[0].success)
						{
							newLocation.SdeObjectId = $scope.SdeObjectId = results[0].objectId;
							$scope.setSdeObjectId($scope.SdeObjectId);
							console.log("Created a new point! "+ newLocation.SdeObjectId);
							$scope.NewPoint = true;

							var promise = DatastoreService.saveNewProjectLocation($scope.project.Id, newLocation);
							promise.$promise.then(function(result){
								console.log("done and success!");
								console.log("result is next...");
								console.dir(result);
								angular.forEach(result, function(item, key){
									//console.log("key = " + key + ", item is next...");
									//console.dir(item);
									if (key === "Id")
									{
										//$scope.locationId = promise.LocationId;
										$scope.subproject_row.LocationId = item;
										console.log("$scope.subproject_row.LocationId = " + $scope.subproject_row.LocationId);
										
										// We put this inside both branches of the if ($scope.viewSubproject), because we need the branch to complete, before the watch triggers. ...Obsolete?
										$scope.savingHabSubproject = true;
									}
								});
						
								//reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
								//$scope.refreshProjectLocations();
								//$modalInstance.dismiss();  // This is from the ActivitiesConroller, ModalAddLocationCtrl.  We have this down below, so we do not need it here; it causes an error.
							});

						}
						else
						{
							$scope.subprojectSave.errorMessage = "There was a problem saving that location.";
						}

					});
				});
			}
			
			// If we had a problem saving the location, stop here and do not save the subproject.
			if ($scope.subprojectSave.errorMessage.length > 0)
			{
				console.log("Had a problem saving the location.  Stopping the save...");
				return;
			}
		}
    };

    $scope.cancel = function(){	
		$scope.subproject_row = 'undefined';
        $modalInstance.dismiss();
		$scope.reloadSubprojects();

    };
  }
]);

mod_fmc.controller('ModalAddCorrespondenceEventCtrl', ['$scope', '$rootScope','$modalInstance', '$modal', 'DataService','DatastoreService','ServiceUtilities',
	'$filter', 'FileUploadService','$upload','$location', '$anchorScroll',
  function($scope, $rootScope, $modalInstance, $modal, DataService, DatastoreService, ServiceUtilities, 
	$filter, FileUploadService, $upload, $location, $anchorScroll){
	console.log("Inside ModalAddCorrespondenceEventCtrl...");
	
	if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
		$rootScope.subprojectId = $scope.viewSubproject.Id;
	
	$scope.filesToUpload = {};
	$scope.verifyActionFormOpen = "No";
	$scope.showOtherResponseType = false;
	$scope.showOtherCorrespondenceType = false;
	$scope.ReadyToClose = ""; // Set to "", so that "False" does not show on the form.
	$scope.showCloseButton = false;
	$scope.showCancelButton = true;
	$scope.showFormItems = true;
	$scope.fileCount = 0;
	$scope.fileProgress = 0;

    $scope.ce_row = angular.copy($scope.ce_row);
	
	console.log("$scope.ce_row is next...");
	console.dir($scope.ce_row);
	
	$scope.ceCorrespondenceType = [];
		$scope.ceCorrespondenceType.push({Id: 0, Label: "Project Notification"});
		$scope.ceCorrespondenceType.push({Id: 1, Label: "Notice of Application"});
		$scope.ceCorrespondenceType.push({Id: 2, Label: "Seeking Concurrence"});
		$scope.ceCorrespondenceType.push({Id: 3, Label: "Document Review"});
		$scope.ceCorrespondenceType.push({Id: 4, Label: "Permit Review"});
		$scope.ceCorrespondenceType.push({Id: 5, Label: "Sending materials for our records"});
		$scope.ceCorrespondenceType.push({Id: 6, Label: "Other"});		
	
	/*$scope.ceResponseType = [];
		$scope.ceResponseType.push("APE letter");
		$scope.ceResponseType.push("Asked to be consulting party");
		$scope.ceResponseType.push("Defer to other tribe(s)");
		$scope.ceResponseType.push("Determination of Eligibility");
		$scope.ceResponseType.push("Did not review");
		$scope.ceResponseType.push("Emailed Comments");
		$scope.ceResponseType.push("Finding of Effect");
		$scope.ceResponseType.push("Issued survey/excavation permit");
		$scope.ceResponseType.push("Let it go");
		$scope.ceResponseType.push("Missed opportunity to review");
		$scope.ceResponseType.push("NAGPRA FR Notice");
		$scope.ceResponseType.push("NAGPRA inventory/summary");
		$scope.ceResponseType.push("none--ok");
		$scope.ceResponseType.push("Other");
		$scope.ceResponseType.push("Out of area");
		$scope.ceResponseType.push("Permit Application");
		$scope.ceResponseType.push("Report for Review");
		$scope.ceResponseType.push("Requested a monitor");
		$scope.ceResponseType.push("Requested a survey");
		$scope.ceResponseType.push("Requested additional information");
		$scope.ceResponseType.push("Requested report");
		$scope.ceResponseType.push("Requested testing");
		$scope.ceResponseType.push("Response to comments");
		$scope.ceResponseType.push("Reviewed report");
		$scope.ceResponseType.push("Same as previously reviewed project");
		$scope.ceResponseType.push("Sent letter");
		$scope.ceResponseType.push("Signed off on");
		$scope.ceResponseType.push("Simple Notification");
	*/
	$scope.ceResponseType = [];
		$scope.ceResponseType.push({Id: 0, Label: "APE letter"});
		$scope.ceResponseType.push({Id: 1, Label: "Asked to be consulting party"});
		$scope.ceResponseType.push({Id: 2, Label: "Defer to other tribe(s)"});
		$scope.ceResponseType.push({Id: 3, Label: "Determination of Eligibility"});
		$scope.ceResponseType.push({Id: 4, Label: "Did not review"});
		$scope.ceResponseType.push({Id: 5, Label: "Emailed Comments"});
		$scope.ceResponseType.push({Id: 6, Label: "Finding of Effect"});
		$scope.ceResponseType.push({Id: 7, Label: "Issued survey/excavation permit"});
		$scope.ceResponseType.push({Id: 8, Label: "Let it go"});
		$scope.ceResponseType.push({Id: 9, Label: "Missed opportunity to review"});
		$scope.ceResponseType.push({Id: 10, Label: "NAGPRA FR Notice"});
		$scope.ceResponseType.push({Id: 11, Label: "NAGPRA inventory/summary"});
		$scope.ceResponseType.push({Id: 12, Label: "none--ok"});
		$scope.ceResponseType.push({Id: 13, Label: "Notice of Application"});
		$scope.ceResponseType.push({Id: 14, Label: "Other"});
		$scope.ceResponseType.push({Id: 15, Label: "Out of area"});
		$scope.ceResponseType.push({Id: 16, Label: "Permit Application"});
		$scope.ceResponseType.push({Id: 17, Label: "Report for Review"});
		$scope.ceResponseType.push({Id: 18, Label: "Requested a monitor"});
		$scope.ceResponseType.push({Id: 19, Label: "Requested a survey"});
		$scope.ceResponseType.push({Id: 20, Label: "Requested additional information"});
		$scope.ceResponseType.push({Id: 21, Label: "Requested report"});
		$scope.ceResponseType.push({Id: 22, Label: "Requested testing"});
		$scope.ceResponseType.push({Id: 23, Label: "Response to comments"});
		$scope.ceResponseType.push({Id: 24, Label: "Reviewed report"});
		$scope.ceResponseType.push({Id: 25, Label: "Same as previously reviewed project"});
		$scope.ceResponseType.push({Id: 26, Label: "Sent letter"});
		$scope.ceResponseType.push({Id: 27, Label: "Signed off on"});
		$scope.ceResponseType.push({Id: 28, Label: "Simple Notification"});
	
	/*$scope.ceResponseType = [];
		$scope.ceResponseType.push("APE letter");
		$scope.ceResponseType.push("Asked to be consulting party");
		$scope.ceResponseType.push("Defer to other tribe(s)");
		$scope.ceResponseType.push("Determination of Eligibility");
		$scope.ceResponseType.push("Did not review");
		$scope.ceResponseType.push("Emailed Comments");
		$scope.ceResponseType.push("Finding of Effect");
		$scope.ceResponseType.push("Issued survey/excavation permit");
		$scope.ceResponseType.push("Let it go");
		$scope.ceResponseType.push("Missed opportunity to review");
		$scope.ceResponseType.push("NAGPRA FR Notice");
		$scope.ceResponseType.push("NAGPRA inventory/summary");
		$scope.ceResponseType.push("none--ok");
		$scope.ceResponseType.push("Other");
		$scope.ceResponseType.push("Out of area");
		$scope.ceResponseType.push("Permit Application");
		$scope.ceResponseType.push("Report for Review");
		$scope.ceResponseType.push("Requested a monitor");
		$scope.ceResponseType.push("Requested a survey");
		$scope.ceResponseType.push("Requested additional information");
		$scope.ceResponseType.push("Requested report");
		$scope.ceResponseType.push("Requested testing");
		$scope.ceResponseType.push("Response to comments");
		$scope.ceResponseType.push("Reviewed report");
		$scope.ceResponseType.push("Same as previously reviewed project");
		$scope.ceResponseType.push("Sent letter");
		$scope.ceResponseType.push("Signed off on");
		$scope.ceResponseType.push("Simple Notification");
	*/	
	console.log("$scope.ceResponseType is next...");
	console.dir($scope.ceResponseType);
	
	/*$scope.responseTypeOptions = $rootScope.responseTypeOptions = makeObjects($scope.ceResponseType, 'Id','Label') ;
	console.log("$scope.responseTypeOptions is next...");
	console.dir($scope.responseTypeOptions);
	*/

	var keepGoing = true;
	var foundIt = false;
	//var responseTypeIndex = 0;
	//var responseTypeMarker = "";
	/*angular.forEach($scope.responseTypeOptions, function(option){
		console.log("option = x" + option + "x, $scope.ce_row.ResponseType = x" + $scope.ce_row.ResponseType + "x.");
		if ((keepGoing) && (option.indexOf($scope.ce_row.ResponseType) >= 0))
		{
			console.log("option = " + option);
			console.log("Found the ResponseType...");
			responseTypeMarker = responseTypeIndex;
			$scope.ce_row.ResponseType = "" + responseTypeMarker;
			foundIt = true;
			keepGoing = false;
		}
		responseTypeIndex++;
	});
	*/
	
	// If ce_row.CorrespondenceDate exists, then we are editing.
	if ($scope.ce_row.CorrespondenceDate)
	{
		angular.forEach($scope.ceResponseType, function(option){
		//console.log("option.Label = x" + option.Label + "x, $scope.ce_row.ResponseType = x" + $scope.ce_row.ResponseType + "x.");
			if ((keepGoing) && (option.Label === $scope.ce_row.ResponseType))
			{
				//console.log("option.Label = " + option.Label);
				//console.log("Found the ResponseType...");
				foundIt = true;
				keepGoing = false;
			}
			//responseTypeIndex++;
		});
	
		if (!foundIt)
		{
			console.log("Value of ResponseType is not in the list...");
			$scope.ce_row.OtherResponseType = $scope.ce_row.ResponseType;
			$scope.ce_row.ResponseType = "Other";
			$scope.showOtherResponseType = true;		
		}
		
		foundIt = false;
		keepGoing = true;
		//console.log("$scope.ce_row.CorrespondenceType is next...");
		//console.dir($scope.ce_row.CorrespondenceType);
		angular.forEach($scope.ceCorrespondenceType, function(option){
			//console.log("option is next...");
			//console.dir(option);
			//console.log("option.Label = x" + option.Label + "x, $scope.ce_row.CorrespondenceType = x" + $scope.ce_row.CorrespondenceType + "x.");
			if ((keepGoing) && (option.Label === $scope.ce_row.CorrespondenceType))
			{
				//console.log("option.Label = " + option.Label);
				//console.log("Found the CorrespondenceType...");
				foundIt = true;
				keepGoing = false;
			}
		});
		
	
		if (!foundIt)
		{
			console.log("Value of CorrespondenceType is not in the list...");
			$scope.ce_row.OtherCorrespondenceType = $scope.ce_row.CorrespondenceType;
			$scope.ce_row.CorrespondenceType = "Other";
			$scope.showOtherCorrespondenceType = true;		
		}
	}
	/*console.log("Location of ResponseType = " + $scope.ceResponseType.indexOf($scope.ce_row.ResponseType));
	if ($scope.ceResponseType.indexOf($scope.ce_row.ResponseType) < 0)
	{
		// The value of ResponseType IS NOT in our array of possible values, which means we have an odd item,
		// so we must do some jiggling...
		console.log("Value of ResponseType is not in the list...");
		$scope.ce_row.OtherResponseType = $scope.ce_row.ResponseType;
		$scope.ce_row.ResponseType = "Other";
		$scope.showOtherResponseType = true;
	}
	*/
    if($scope.ce_row.Id > 0)
    {
        $scope.header_message = "Edit Event for Project " + $scope.viewSubproject.ProjectName;
    }
	else
	{
		if ((typeof $scope.viewSubproject !== 'undefined' ) && ($scope.viewSubproject !== null))
			$scope.header_message = "Add Event to Project " + $scope.viewSubproject.ProjectName;
		else if ((typeof $scope.crppProjectName !== 'undefined' ) && ($scope.crppProjectName !== null))
			$scope.header_message = "Add Event to Project " + $scope.crppProjectName;
	}
	
	if (!$scope.ce_row.NumberOfDays)
		$scope.ce_row.NumberOfDays = "Other";
	
	//console.log("$scope.ce_row is next...");
	//console.dir($scope.ce_row);
	
	$scope.field = {
		DbColumnName: "EventFiles"
	};
	
	console.log("$scope is next...");
	console.dir($scope);
	
	/*$scope.ceEvents = function(items, key) {
		element.all(by.repeater(key + ' in $scope.viewSubproject.CorrespondenceEvents').column(key + '.EventComments')).then(function(arr) {
			arr.forEach(function(wd, i) {
			  expect(wd.getText()).toMatch(items[i]);
			});
		});
	};
	
	$scope.ceFilterEventComments = function()
	{
		var searchEventComments = element(by.model('correspondenceEventsFilter.EventComments'));
		var strict = element(by.model('strict'));
		searchEventComments.clear();
		searchEventComments.sendKeys('i');
		$scope.ceEvents($scope.viewSubproject.CorrespondenceEvents, event);
		//strict.click();
	}
	*/
	
	$scope.openFileModal = function(row, field)
	{
		console.log("Inside ModalAddCorrespondenceEventCtrl, openFileModal...");
		console.log("row is next...");
		console.dir(row);
		console.log("field is next...");
		console.dir(field);
		$scope.file_row = row;
		$scope.file_field = field;
		
		var modalInstance = $modal.open({
			templateUrl: 'partials/modals/file-modal.html',
			controller: 'FileModalCtrl',
			scope: $scope, //scope to make a child of
		});
	};
	
	$scope.selectCorrespondenceType = function () {
		console.log("Inside selectCorrespondenceType...");
		console.log("$scope.ce_row at top of selectCorrespondenceType is next...");
		console.dir($scope.ce_row);
		if ($scope.ce_row.CorrespondenceType === "Other")
			$scope.showOtherCorrespondenceType = true;
		else
		{
			$scope.showOtherCorrespondenceType = false;
			$scope.ce_row.OtherCorrespondenceType = null;
		}
		
		console.log("$scope.showOtherCorrespondenceType = " + $scope.showOtherCorrespondenceType);
		console.log("$scope.ce_row at end of selectCorrespondenceType is next...");
		console.dir($scope.ce_row);
	};
	
	/*$scope.responseTypeChanged = function () {
		console.log("Inside responseTypeChanged...");
		console.log("$scope.ce_row is next...");
		console.dir($scope.ce_row);
		if ($scope.ce_row.ResponseType === "Other")
			$scope.showOtherResponseType = true;
		else
		{
			$scope.showOtherResponseType = false;
			$scope.ce_row.OtherResponseType = 'undefined';
		}
		
		console.log("$scope.showOtherResponseType = " + $scope.showOtherResponseType);
	};
	*/
	
	$scope.selectResponseType = function () {
		console.log("Inside selectResponseType...");
		console.log("$scope.ce_row at top of selectResponseType is next...");
		console.dir($scope.ce_row);
		if ($scope.ce_row.ResponseType === "Other")
			$scope.showOtherResponseType = true;
		else
		{
			$scope.showOtherResponseType = false;
			$scope.ce_row.OtherResponseType = null;
		}
		
		console.log("$scope.showOtherResponseType = " + $scope.showOtherResponseType);
		console.log("$scope.ce_row at end of selectResponseType is next...");
		console.dir($scope.ce_row);
	};

	$scope.GetTypeOfResponse = function(){
		var theName = [];
		theName.push($filter('ResponseTypeFilter')($scope.ResponseTypeList, $scope.ce_row.ResponseType.Id))[0];
		console.log("theName is next...");
		console.dir(theName);
		
	};


	
	//field = DbColumnName
	$scope.onFileSelect = function(field, files)
	{
		console.log("Inside ModalAddCorrespondenceEventCtrl, onFileSelect");
		console.log("file selected! " + field);
		$scope.filesToUpload[field] = files;
	};
	
	/*$scope.$watch("CorrespondenceDate", function(newValue, oldValue){
		console.log("CorrespondenceDate changed...");
	});
	*/
	
	$scope.calculateDateOfResponse = function(){
		console.log("Inside calculateDateOfResponse...");
		console.log("$scope.ShowDateOfResponsePopup = " + $scope.ShowDateOfResponsePopup);
		console.log("$scope.ce_row is next...");
		console.dir($scope.ce_row);
		//console.log("$scope.ce_row.NumberOfDays.length = " + $scope.ce_row.NumberOfDays.length);
		
		var	dtDateOfResponse = 'undefined';
		var	strDateOfResponse = 'undefined';
		
		/* 	Initially, we set NumberOfDays to Other, with the placeholder in the box on the form.
		*	When the user chooses a number, we change the NumberOfDays to a DatePicker.
		*	If the user chooses Other again, we switch back to the placeholder.
		*/
		if ($scope.ce_row.NumberOfDays.length < 3)
		{
			//if ($scope.ce_row.CorrespondenceDate)
			//console.log("$scope.ce_row.CorrespondenceDate text:  " + $scope.ce_row.CorrespondenceDate.toString());

			// If the user left the Date of Correspondence blank, get today's date.
			// Otherwise, use the date they picked.
			if ((!$scope.ce_row.CorrespondenceDate) || ($scope.ce_row.CorrespondenceDate === null))
			{
				console.log("Date of Correspondence left blank; using today's date...");
				dtDateOfResponse = new Date();
			}
			else
			{
				console.log("User picked this date...");
				console.dir($scope.ce_row.CorrespondenceDate);

				// If we just copy $scope.ce_row.CorrespondenceDate into dtDateOfResponse,
				// all that really gets copied is the reference.  As we do calculations
				// and change dtDateOfResponse, the same changes happen to $scope.ce_row.CorrespondenceDate.
				// To avoid this, we clone the object in the next line, in order to break that link.
				var strTmpDate = JSON.parse(JSON.stringify($scope.ce_row.CorrespondenceDate));
				//console.log("strTmpDate = " + strTmpDate);

				var dtTempDate = new Date(strTmpDate);
				//var dtTempDate = Date.parse(strTmpDate);
				console.log("dtTempDate " + dtTempDate);
				dtDateOfResponse = dtTempDate;
			}
			
			console.log("dtDateOfResponse initial setting is next...");
			console.dir(dtDateOfResponse);
			
			dtDateOfResponse.setDate(dtDateOfResponse.getDate() + parseInt($scope.ce_row.NumberOfDays));
			//console.log("dtDateOfResponse after adding days = " + dtDateOfResponse);

			var strDateOfResponse = ServiceUtilities.formatDate2(dtDateOfResponse);
			//console.log("strDateOfResponse after formatting = " + strDateOfResponse);

			// Extract the date info from the date/time string.
			var intSpaceLocation = strDateOfResponse.indexOf(" ");
			strDateOfResponse = strDateOfResponse.substring(0, intSpaceLocation);
			console.log("strDateOfResponse (text version) = " + strDateOfResponse);


			$scope.ce_row.ResponseDate = strDateOfResponse;
			console.log("$scope.ce_row.ResponseDate = " + $scope.ce_row.ResponseDate);
			
			console.log("$scope.ce_row is next...");
			console.dir($scope.ce_row);
			//$scope.ShowDateOfResponsePopup  = true;
		}
		else
		{
			$scope.ShowDateOfResponsePopup  = false;
			//$scope.ce_row.ResponseDate = null;
		}
	};
	
	$scope.remove = function(){
		console.log("Inside ModalAddCorrespondenceEventCtrl, remove...");
		console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
		console.log("$scope.ce_row is next...");
		console.dir($scope.ce_row);
		$scope.ce_rowId = $scope.ce_row.Id;
		
		$scope.verifyAction = "Delete";
		$scope.verifyingCaller = "CorrespondenceEvent";
		//console.log("scope.verifyAction = " + scope.verifyAction);
			
		$scope.verifyActionFormOpen = "Yes";
		
		if (confirm('Are you sure that you want to delete this Correspondence Event?'))
		{
			//DatastoreService.removeSubproject($scope.project.Id, $scope.viewSubproject.Id);
			
			//var promise = DatastoreService.removeCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, $scope.ce_rowId);
			var promise = DatastoreService.removeCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, $scope.ce_rowId, $scope.DatastoreTablePrefix);
			
			promise.$promise.then(function(){
				$scope.subprojects = null;
				$scope.reloadSubprojects();
				//$scope.viewSelectedSubproject();
				$scope.viewSelectedSubproject($scope.viewSubproject);
				//$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
				$("#correspondenceEvents").load("partials/subproject/correspondenceEvents.html #correspondenceEvents");
				$modalInstance.dismiss();

			});
		}
	};
	
	$scope.$watch('fileProgress', function(){
		console.log("Inside watch fileProgress...");
		console.log("$scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
		if($scope.fileProgress < $scope.fileCount)
			return;
		
		if ($scope.saving)
		{
			$scope.loading = false; // Stop the fish spinner.
			$scope.showCloseButton = true;
			$scope.showCancelButton = false;
			$scope.showFormItems = false;
		}
	});
	
    $scope.save = function(){
		console.log("Inside ModalAddCorrespondenceEventCtrl, save...");
		console.log("$scope is next...");
		console.dir($scope);
		
		$scope.saving = true; // Used in $scope.$watch('fileProgress'
		$scope.loading = true; // Start the fish spinner.
		
		//console.log("$scope.ce_row.ResponseType.Id = " + $scope.ce_row.ResponseType.Id);
		//console.log("$scope.ce_row.ResponseType.Name = " + $scope.ce_row.ResponseType.Name);
		console.log("$scope.ce_row.ResponseType = " + $scope.ce_row.ResponseType);
		var saveRow = angular.copy($scope.ce_row);
		console.log("saveRow is next, before checking the Id...");
		console.dir(saveRow);
		if (!saveRow.Id)
			saveRow.Id = 0;
		//$scope.foundDuplicate = false;
		
		console.log("saveRow is next, after checking/setting the Id...");
		console.dir(saveRow);

		if ($scope.foundDuplicate)
		{
			alert("One or more of the files to upload is a duplicate!");
			return;
		}
		
		var subprojectId = 0;
		if ($scope.viewSubproject)
			subprojectId = $scope.viewSubproject.Id
		else
			subprojectId = $scope.subprojectId;
		
		// First let's handle the files.
		if ($scope.filesToUpload.EventFiles)
		{
			// Count how many files we have.
			$scope.fileCount = 0;
			angular.forEach($scope.filesToUpload.EventFiles, function(aFile){
				$scope.fileCount++;
			});
			console.log("$scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
			
			console.log("$scope.filesToUpload.EventFiles is next...");
			console.dir($scope.filesToUpload.EventFiles);
			for(var i = 0; i < $scope.filesToUpload.EventFiles.length; i++)
			{
				var file = $scope.filesToUpload.EventFiles[i];
				console.log("file is next...");
				console.dir(file);
				
				var newFileNameLength = file.name.length;
				console.log("file name length = " + newFileNameLength);

				// Inform the user immediately, if there are duplicate files.
				if ($scope.foundDuplicate)
					alert(errors);
				else
				{
					console.log("file.success = " + file.success);
					if(file.success != "Success")
					{
						console.log("No file.success, so let's save the file...");
						$scope.upload = $upload.upload({
							url: serviceUrl + '/data/UploadSubprojectFile',
							method: "POST",
							// headers: {'headerKey': 'headerValue'},
							// withCredential: true,
							//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name},
							data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, DatastoreTablePrefix: $scope.DatastoreTablePrefix},
							file: file,

							}).progress(function(evt) {
								console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
							}).success(function(data, status, headers, config) {
								console.dir(data);
								console.dir(status);
								console.dir(headers);
								console.dir(config);
								console.dir(file);
								config.file.success = "Success";
								console.log("done and success!");
								$scope.fileProgress++;
								console.log("$scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
							})
							.error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
								//console.log(file.name + " was error.");
								config.file.success = "Failed";
							});
						console.log("$scope.upload is next...");
						console.dir($scope.upload);
					}
				}
			}
			
			angular.forEach($scope.filesToUpload, function(files, field){

				if(field == "null" || field == "")
					return;
				
				var local_files = [];

				for(var i = 0; i < files.length; i++)
				{
					console.log("$scope is next...")
					console.dir($scope);
				  
					var file = files[i];
					console.log("Reviewing results on file " + file.Name);
					console.dir(file);
				  
					console.log("$scope.errors is next...");
					console.dir($scope.errors);
					console.log("typeof $scope.errors = " + typeof $scope.errors);
					if(file.data && file.data.length == 1) //since we only upload one at a time...
					{
						//console.dir(file.data);
						local_files.push(file.data[0]); //only ever going to be one if there is any...
						//console.log("file id = "+file.data[0].Id);
					}
					else if (typeof $scope.errors === 'undefined')
					{
						console.log("No errors...");
					}
					else
					{
						//console.log("no file id.");
						$scope.foundDuplicate = true;
						$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
						console.log("$scope is next...");
						console.dir($scope);
						throw "Problem saving file: " + file.Name;
					}
				}

				console.log("$scope is next...");
				console.dir($scope);
				console.log("$scope.file_row is next...");
				console.dir($scope.file_row);
				console.log("field = " + field);
				//if we already had actual files in this field, copy them in
				if($scope.file_row[field])
				{
					console.log("On Files field...");
					var current_files = angular.fromJson($scope.file_row[field]);
					angular.forEach(current_files, function(file){
						if(file.Id) //our incoming files don't have an id, just actual files.
							local_files.push(file);		
					});
				}

				$scope.file_row[field] = angular.toJson(local_files);
				//console.log("Ok our new list of files: "+$scope.row[field]);
			});
		}
		
		// Now let's handle the other fields on the form.
		console.log("typeof saveRow.CorrespondenceDate = " + typeof saveRow.CorrespondenceDate);
		if (typeof saveRow.CorrespondenceDate !== "string")
		{
			var strCorrespondenceDate = ServiceUtilities.toExactISOString(saveRow.CorrespondenceDate);
			console.log("strCorrespondenceDate = " + strCorrespondenceDate);
			saveRow.CorrespondenceDate = ServiceUtilities.extractDateFromString(strCorrespondenceDate);
			console.log("saveRow.CorrespondenceDate = " + saveRow.CorrespondenceDate);
		}
		
		//saveRow.CorrespondenceDate = ServiceUtilities.formatDate2(saveRow.CorrespondenceDate);
		//console.log("saveRow.CorrespondenceDate = " + saveRow.CorrespondenceDate);
		
		if (saveRow.ResponseDate)
		{
			console.log("saveRow.ResponseDate initially = " + saveRow.ResponseDate);
			console.log("typeof saveRow.ResponseDate = " + typeof saveRow.ResponseDate);
			if (typeof saveRow.ResponseDate !== "string")
			{
				var strResponseDate = ServiceUtilities.toExactISOString(saveRow.ResponseDate);
				console.log("strResponseDate = " + strResponseDate);
			}
			else
			{
				var dtDateOfResponse = new Date(saveRow.ResponseDate);
				console.log("dtDateOfResponse = " + dtDateOfResponse);
				var strResponseDate = ServiceUtilities.toExactISOString(dtDateOfResponse);
				console.log("strResponseDate = " + strResponseDate);
			}
			saveRow.ResponseDate = ServiceUtilities.extractDateFromString(strResponseDate);
			console.log("saveRow.ResponseDate after conversion = " + saveRow.ResponseDate);
			
		}
		
		console.log("saveRow is next, after processing dates...");
		console.dir(saveRow);
		
		if (saveRow.NumberOfDays === "Other")
			saveRow.NumberOfDays = null;
		
		if (saveRow.CorrespondenceType === "Other")
		{
			saveRow.CorrespondenceType = saveRow.OtherCorrespondenceType;
			saveRow.OtherCorrespondenceType = 'undefined';  // Throw this away, because we do not want to save it; no database field or it.
		}
		
		// Note:  I could not get the following working; while it pulled the ResponseType name OK for the select, when you clicked save, 
		// the ResponseTypeName was always 'undefined'.
		/* On the form, $scope.subproject_row.ResponseType is an object, like this: (Id: theId Name: theName)
		* The technique used to grab the ResponseType works on the first click (an improvement).  
		* Note:  The improvement only occurred on the subproject page; the select box for ResponseType did not behave the same way.
		* Therefore, I (gc) kept the technique, and chose to extract/reset $scope.subproject_row.Agency here in the controller, as just the name.
		*/
		//console.log("typeof saveRow.ResponseType = " + typeof saveRow.ResponseType);
		//saveRow.ResponseType = 'undefined';
		//saveRow.ResponseType = $scope.ce_row.ResponseType.Name;
		//console.log("saveRow.ResponseType = " + saveRow.ResponseType);
		
		// Response Type:  If the user selected Other, we must use the name they supplied in OtherResponseType.
		//if ((saveRow.OtherResponseType) && (typeof saveRow.OtherResponseType !== 'undefined'))
		if (saveRow.ResponseType === "Other")
		{
			saveRow.ResponseType = saveRow.OtherResponseType;
			saveRow.OtherResponseType = 'undefined'; // Throw this away, because we do not want to save it; no database field or it.
		}

		/*var promise = DatastoreService.saveCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, saveRow);
		if (typeof promise !== 'undefined')
		{
			promise.$promise.then(function(){
				$scope.reloadSubprojects();
				$scope.viewSelectedSubproject();
				$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
				$modalInstance.dismiss();
				})
		}
		*/
		
		console.log("$scope is next...");
		console.dir($scope);
		
		/*	If the user chooses to create a Correspondence Event (CE), at the same time that they are creating a new Subproject,
		*   $scope.viewSubproject is not available yet, so we cannot pass the Id from there.  When we create the new Subproject,
		*   we capture the Id from the Subproject, which is the same thing, so we pass that instead, to create the CE.
		*/
		if ($rootScope.crppProjectName)
			$scope.crppProjectName = $rootScope.crppProjectName;
		
		if ($scope.viewSubproject !== null)
		{
			console.log("$scope.viewSubproject is present, using that...");
			console.log("$scope.viewSubproject.Id = " + $scope.viewSubproject.Id);
			var promise = DatastoreService.saveCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, saveRow);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					$scope.reloadSubprojects();
					$scope.viewSelectedSubproject();
					$scope.viewSelectedSubproject($scope.viewSubproject);
					//$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
					$("#correspondenceEvents").load("partials/subproject/correspondenceEvents.html #correspondenceEvents");
					//$modalInstance.dismiss();
					})
					
				console.log("1 typeof $scope.errors = " + typeof $scope.errors + ", $scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
				if ($scope.fileCount === 0)
				{
					$scope.loading = false; // Stop the fish spinner.
					$scope.showCloseButton = true;
					$scope.showCancelButton = false;
					$scope.showFormItems = false;
				}
			}	
		}
		else if ((typeof $scope.crppProjectName !== 'undefined' ) && ($scope.crppProjectName !== null))
		{
			console.log("$scope.viewSubproject missing, using $scope.subprojectId:  " + $scope.subprojectId);
			var promise = DatastoreService.saveCorrespondenceEvent($scope.project.Id, $scope.subprojectId, saveRow);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					$scope.reloadSubprojects();
					$scope.viewSelectedSubproject();
					//$("#correspondenceEvents").load("correspondenceEvents.html #correspondenceEvents");
					$("#correspondenceEvents").load("partials/subproject/correspondenceEvents.html #correspondenceEvents");
					//$modalInstance.dismiss();
					})
					
				if ($scope.fileCount === 0)
				{
					$scope.loading = false; // Stop the fish spinner.
					$scope.showCloseButton = true;
					$scope.showCancelButton = false;
					$scope.showFormItems = false;					
				}
			}
		}
    };
	
	$scope.close = function(){
		console.log("Inside $scope.close...");
		$modalInstance.dismiss();	
	};

    $scope.cancel = function(){
		$modalInstance.dismiss();
    };
	
	$scope.gotoBottom = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		$location.hash('bottom');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoTopCorrespondenceEventsTop = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		console.log("Inside gotoTopCorrespondenceEventsTop...");
		//$location.hash('top');
		$location.hash('ceTop');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoCategory = function (category) {
		$location.hash(category);
		$anchorScroll();
	};

  }
]);

mod_fmc.controller('ModalAddHabitatItemCtrl', ['$scope', '$rootScope','$modalInstance', '$modal', 'DataService','DatastoreService','ServiceUtilities',
	'$filter', 'FileUploadService','$upload','$location', '$anchorScroll',
  function($scope, $rootScope, $modalInstance, $modal, DataService, DatastoreService, ServiceUtilities, 
	$filter, FileUploadService, $upload, $location, $anchorScroll){
	console.log("Inside ModalAddHabitatItemCtrl...");
	
	if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
		$rootScope.subprojectId = $scope.viewSubproject.Id;
	
	$scope.filesToUpload = {};
	$scope.verifyActionFormOpen = "No";
	$scope.showOtherResponseType = false;
	$scope.ReadyToClose = "";
	$scope.showCloseButton = false;
	$scope.showCancelButton = true;
	$scope.showFormItems = true;
	$scope.fileCount = 0;
	$scope.fileProgress = 0;
	
	console.log("$scope.projectId = " + $scope.projectId);
	
	if ($scope.hi_row)
	{
		$scope.hi_row = angular.copy($scope.hi_row);

	}
	else
		$scope.hi_row = {};

	var keepGoing = true;
	var foundIt = false;

    if($scope.hi_row.Id > 0)
    {
        $scope.header_message = "Edit Item for Project " + $scope.viewSubproject.ProjectName;
    }
	else
	{
		if ((typeof $scope.viewSubproject !== 'undefined' ) && ($scope.viewSubproject !== null))
			$scope.header_message = "Add Item to Project " + $scope.viewSubproject.ProjectName;
		else if ((typeof $scope.habProjectName !== 'undefined' ) && ($scope.habProjectName !== null))
			$scope.header_message = "Add Item to Project " + $scope.habProjectName;
	}
	
	console.log("$scope.hi_row is next...");
	console.dir($scope.hi_row);
	
	console.log("$scope (after initialization) is next...");
	console.dir($scope);
		
	$scope.openFileModal = function(row, field)
	{
		console.log("Inside ModalAddHabitatItemCtrl, openFileModal...");
		console.log("row is next...");
		console.dir(row);
		console.log("field is next...");
		console.dir(field);
		$scope.file_row = row;
		//$scope.file_field = field;
		$scope.file_field = {
			DbColumnName: "ItemFiles"
		};
		
		var modalInstance = $modal.open({
			templateUrl: 'partials/modals/file-modal.html',
			controller: 'FileModalCtrl',
			scope: $scope, //scope to make a child of
		});
	};
	
	$scope.openLinkModal = function(row, field)
	{
		console.log("Inside ModalAddHabitatItemCtrl, openLinkModal...");
		console.log("row is next...");
		console.dir(row);
		console.log("field is next...");
		console.dir(field);
		$scope.link_row = row;
		//$scope.link_field = field;
		$scope.link_field = {
			DbColumnName: "ExternalLinks"
		};
		
		var modalInstance = $modal.open({
			templateUrl: 'partials/modals/link-modal.html',
			controller: 'LinkModalCtrl',
			scope: $scope, //scope to make a child of
		});
	};
	
	//field = DbColumnName
	$scope.onFileSelect = function(field, files)
	{
		console.log("Inside ModalAddHabitatItemCtrl, onFileSelect");
		console.log("file selected! " + field);
		$scope.filesToUpload[field] = files;
	};
	
	$scope.remove = function(){
		console.log("Inside ModalAddHabitatItemCtrl, remove...");
		//console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
		console.log("$scope.hi_row is next...");
		console.dir($scope.hi_row);
		$scope.hi_rowId = $scope.hi_row.Id;
		
		$scope.verifyAction = "Delete";
		$scope.verifyingCaller = "HabitatItem";
		//console.log("scope.verifyAction = " + scope.verifyAction);
			
		$scope.verifyActionFormOpen = "Yes";
		
		if (confirm('Are you sure that you want to delete this Habitat Item?'))
		{
			//DatastoreService.removeSubproject($scope.project.Id, $scope.viewSubproject.Id);
			
			//var promise = DatastoreService.removeCorrespondenceEvent($scope.project.Id, $scope.viewSubproject.Id, $scope.ce_rowId);
			//var promise = DatastoreService.removeHabitatItem($scope.project.Id, $scope.viewSubproject.Id, $scope.hi_rowId, $scope.DatastoreTablePrefix);
			var promise = DatastoreService.removeHabitatItem($scope.project.Id, $scope.viewSubproject.Id, $scope.hi_rowId);
			
			promise.$promise.then(function(){
				$scope.subprojects = null;
				$scope.reloadSubprojects();
				//$scope.viewSelectedSubproject();
				$scope.viewSelectedSubproject($scope.viewSubproject);
				$("#habitatItems").load("habitatItems.html #habitatItems");
				$modalInstance.dismiss();
			});
		}
	};
	
	$scope.$watch('fileProgress', function(){
		if($scope.fileProgress < $scope.fileCount)
			return;
		
		if ($scope.saving)
		{
			$scope.loading = false; // Stop the fish spinner.
			$scope.showCloseButton = true;
			$scope.showCancelButton = false;
			$scope.showFormItems = false;
		}
	});
	
    $scope.save = function(){
		console.log("Inside ModalAddHabitatItemCtrl, save...");
		console.log("$scope is next...");
		console.dir($scope);
		
		$scope.saving = true; // Used in $scope.$watch('fileProgress'
		$scope.loading = true; // Start the fish spinner.
		
		var saveRow = angular.copy($scope.hi_row);
		//console.log("saveRow is next, before checking the Id...");
		//console.dir(saveRow);
		if (!saveRow.Id)
			saveRow.Id = 0;
		//$scope.foundDuplicate = false;
		
		console.log("saveRow is next, after checking/setting the Id...");
		console.dir(saveRow);

		if ($scope.foundDuplicate)
		{
			alert("One or more of the files to upload is a duplicate!");
			return;
		}
		
		var subprojectId = 0;
		if ($scope.viewSubproject)
			subprojectId = $scope.viewSubproject.Id
		else
			subprojectId = $scope.subprojectId;
		
		// First let's handle the files.
		if ($scope.filesToUpload.ItemFiles)
		{
			// Count how many files we have.
			$scope.fileCount = 0;
			angular.forEach($scope.filesToUpload.ItemFiles, function(aFile){
				$scope.fileCount++;
			});
			console.log("$scope.fileCount = " + $scope.fileCount);
			
			console.log("$scope.filesToUpload.ItemFiles is next...");
			console.dir($scope.filesToUpload.ItemFiles);
			for(var i = 0; i < $scope.filesToUpload.ItemFiles.length; i++)
			{
				var file = $scope.filesToUpload.ItemFiles[i];
				console.log("file is next...");
				console.dir(file);
				
				var newFileNameLength = file.name.length;
				console.log("file name length = " + newFileNameLength);

				// Inform the user immediately, if there are duplicate files.
				if ($scope.foundDuplicate)
					alert(errors);
				else
				{
					console.log("file is next again...");
					console.dir(file);
					console.log("file.success = " + file.success);
					if(file.success != "Success")
					{
						console.log("No file.success, so let's save the file...");
						$scope.upload = $upload.upload({
							url: serviceUrl + '/data/UploadHabitatFile',
							method: "POST",
							// headers: {'headerKey': 'headerValue'},
							// withCredential: true,
							//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name},
							//data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, DatastoreTablePrefix: $scope.DatastoreTablePrefix},
							data: {ProjectId: $scope.projectId, SubprojectId: subprojectId, Description: "Uploaded file " + file.Name, Title: file.Name, SubprojectType: "Hab"},
							file: file,

							}).progress(function(evt) {
								console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
							}).success(function(data, status, headers, config) {
								console.log("The following are next:  data, status, headers, config, file");
								//console.log("file is next...");
								console.dir(data);
								console.dir(status);
								console.dir(headers);
								console.dir(config);
								console.dir(file);
								config.file.success = "Success";
								
								//console.log("file is next...");
								//console.dir(file);
								//var promise = DatastoreService.saveSubprojectFile($scope.project.Id, "Hab", $scope.subprojectId, file);
								//promise.$promise.then(function(){
									console.log("done and success!");
									//reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
									//$scope.refreshProjectLocations();
									//$modalInstance.dismiss();
								//});
								
								$scope.fileProgress++;
							}).error(function(data, status, headers, config) {
								$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
								//console.log(file.name + " was error.");
								config.file.success = "Failed";
							});
							
						console.log("$scope.upload is next...");
						console.dir($scope.upload);

					}
					
					if (file.success)
					{
						
					}
				}
			}
			
			angular.forEach($scope.filesToUpload, function(files, field){

				if(field == "null" || field == "")
					return;
				
				var local_files = [];

				for(var i = 0; i < files.length; i++)
				{
					console.log("$scope is next...")
					console.dir($scope);
				  
					var file = files[i];
					console.log("Reviewing results on file " + file.Name);
					console.dir(file);
				  
					console.log("$scope.errors is next...");
					console.dir($scope.errors);
					console.log("typeof $scope.errors = " + typeof $scope.errors);
					if(file.data && file.data.length == 1) //since we only upload one at a time...
					{
						//console.dir(file.data);
						local_files.push(file.data[0]); //only ever going to be one if there is any...
						//console.log("file id = "+file.data[0].Id);
					}
					else if (typeof $scope.errors === 'undefined')
					{
						console.log("No errors...");
					}
					else
					{
						//console.log("no file id.");
						$scope.foundDuplicate = true;
						$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
						console.log("$scope is next...");
						console.dir($scope);
						throw "Problem saving file: " + file.Name;
					}
				}

				console.log("$scope.file_row is next...");
				console.dir($scope.file_row);
				console.log("field = " + field);
				//if we already had actual files in this field, copy them in
				if($scope.file_row[field])
				{
					console.log("On Files field...");
					var current_files = angular.fromJson($scope.file_row[field]);
					angular.forEach(current_files, function(file){
						if(file.Id) //our incoming files don't have an id, just actual files.
							local_files.push(file);		
					});
				}

				$scope.file_row[field] = angular.toJson(local_files);
				//console.log("Ok our new list of files: "+$scope.row[field]);
			});
		}
		
		/*
		// Now let's handle the links.
		console.log("$scope.link_row.ExternalLinks is next...");
		console.dir($scope.link_row.ExternalLinks);
		if ($scope.link_row.ExternalLinks)
		{
			console.log("")
			$scope.saveLink = $upload.upload({
				url: serviceUrl + '/data/UploadHabitatFile',
				method: "POST",
				data: {ProjectId: $scope.project.Id, SubprojectId: subprojectId, Description: "Uploaded link " + link.Name, Title: link.Name, SubprojectType: "Hab"},

				}).progress(function(evt) {
					console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
				}).success(function(data, status, headers, config) {
					console.log("The following are next:  data, status, headers, config, file");
					console.dir(data);
					console.dir(status);
					console.dir(headers);
					console.dir(config);
					console.dir(file);
					config.file.success = "Success";
					
					console.log("file is next...");
					console.dir(file);
					//var promise = DatastoreService.saveSubprojectFile($scope.project.Id, "Hab", $scope.subprojectId, file);
					//promise.$promise.then(function(){
						console.log("done and success!");
						//reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
						//$scope.refreshProjectLocations();
						//$modalInstance.dismiss();
					//});
				}).error(function(data, status, headers, config) {
					$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
					//console.log(file.name + " was error.");
					config.file.success = "Failed";
			});
		}
		*/
		
		// Now let's handle the other fields on the form.		
		console.log("$scope is next...");
		console.dir($scope);
		
		/*	If the user chooses to create a Habitat Item (HI), at the same time that they are creating a new Subproject,
		*   $scope.viewSubproject is not available yet, so we cannot pass the Id from there.  When we create the new Subproject,
		*   we capture the Id from the Subproject, which is the same thing, so we pass that instead, to create the HI.
		*/
		if ($rootScope.habProjectName)
			$scope.habProjectName = $rootScope.habProjectName;
		
		if ($scope.viewSubproject !== null)
		{
			console.log("$scope.viewSubproject is present, using that...");
			console.log("$scope.viewSubproject.Id = " + $scope.viewSubproject.Id);
			var promise = DatastoreService.saveHabitatItem($scope.projectId, $scope.viewSubproject.Id, saveRow);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					$scope.reloadSubprojects();
					$scope.viewSelectedSubproject();
					$("#habitatItems").load("habitatItems.html #habitatItems");
					//$modalInstance.dismiss();
					})
					
				console.log("1 typeof $scope.errors = " + typeof $scope.errors + ", $scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
				if ($scope.fileCount === 0)
				{
					$scope.loading = false; // Stop the fish spinner.
					$scope.showCloseButton = true;
					$scope.showCancelButton = false;
					$scope.showFormItems = false;
				}
			}	
		}
		else if ((typeof $scope.habProjectName !== 'undefined' ) && ($scope.habProjectName !== null))
		{
			console.log("$scope.viewSubproject missing, using $scope.subprojectId:  " + $scope.subprojectId);
			var promise = DatastoreService.saveHabitatItem($scope.projectId, $scope.subprojectId, saveRow);
			if (typeof promise !== 'undefined')
			{
				promise.$promise.then(function(){
					$scope.reloadSubprojects();
					$scope.viewSelectedSubproject();
					$("#habitatItems").load("habitatItems.html #habitatItems");
					//$modalInstance.dismiss();
					})
					
				if ($scope.fileCount === 0)
				{
					$scope.loading = false; // Stop the fish spinner.
					$scope.showCloseButton = true;
					$scope.showCancelButton = false;
					$scope.showFormItems = false;					
				}
			}
		}
    };
	
	$scope.close = function(){
		console.log("Inside $scope.close...");
		$modalInstance.dismiss();	
	};

    $scope.cancel = function(){
		$modalInstance.dismiss();
    };
	
	$scope.gotoBottom = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		$location.hash('bottom');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoTopHabitatItemsTop = function (){
		// set the location.hash to the id of
		// the element you wish to scroll to.
		console.log("Inside gotoTopHabitatItemsTop...");
		//$location.hash('top');
		$location.hash('hiTop');
		
		// call $anchorScroll()
		$anchorScroll();
	};
	  
	$scope.gotoCategory = function (category) {
		$location.hash(category);
		$anchorScroll();
	};

  }
]);

mod_fmc.controller('ModalSaveSuccess', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.header_message = "Save Successful!";

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
]);

mod_fmc.controller('ModalInvalidOperation', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.header_title = $scope.invalidOperationTitle;
    $scope.header_message = $scope.invalidOperationMessage;

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
]);

//handles managing file controltypes
mod_fmc.controller('FileModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService','ServiceUtilities','$rootScope',
    function($scope, $modalInstance, DataService, DatastoreService, ServiceUtilities, $rootScope){
		// This controller is for the Dataset Activity / Subproject File modal.
		console.log("Inside modals-controller.js, FileModalCtrl");
		console.log("$scope is next...");
		console.dir($scope);
		
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

    	$scope.removeFile = function(file)
    	{
			console.log("Inside FileModalCtrl, removeFile...");
			console.log("file is next...");
			console.dir(file);
			console.log($scope);
			
			console.log("$rootScope.currentFiles is next...");
			console.dir($rootScope.currentFiles);
			
			angular.forEach($rootScope.currentFiles, function(existing_file, key){
				console.log("existing_file.Name = " + existing_file.Name + ", file.Name = " + file.Name);
				var existing_fileLength = existing_file.Name.length;
				var fileNameLength = file.Name.length;
				console.log("existing_fileLength = " + existing_fileLength + ", fileNameLength = " + fileNameLength);
				
				console.log("Check: " + existing_file.Name.indexOf(file.Name));
				//if(existing_file.Name == file.Name)
				if (existing_fileLength === fileNameLength)
				{
					console.log("Lengths match...");
					if (existing_file.Name.indexOf(file.Name) !== -1)
					{
						console.log("Name matches...");
						if ($scope.DatastoreTablePrefix === "CrppContracts")
						{
							console.log("CRPP file...");
							DatastoreService.deleteCorresEventFile($scope.projectId, $scope.subprojectId, $scope.ce_row.Id, file);
						}
						//else if ($scope.project.Id === 1223)
						//else if ($scope.project.Id === HAB_PROJECTID)
						//else if (DatastoreService.getProjectType($scope.project.Id) === "Habitat")
						else if ($scope.DatastoreTablePrefix === "Metrics")
						{
							console.log("Habitat file...");
							// Subproject or Habitat Item-related?
							if ((typeof $scope.hi_row !== 'undefined') && ($scope.hi_row.Id !== null))
							{
								console.log("We want to delete a Habitat Item file...");
								DatastoreService.deleteHabitatItemFile($scope.projectId, $scope.subprojectId, $scope.hi_row.Id, file);
							}
							else
							{
								console.log("We want to delete a Subproject file...");
								DatastoreService.deleteHabSubprojectFile($scope.projectId, $scope.subprojectId, file);								
							}							
						}
						else if ($scope.datasetId)
						{
							console.log("Dataset file...");
							DatastoreService.deleteDatasetFile($scope.projectId, $scope.datasetId, file);
						}

						$rootScope.currentFiles.splice(key,1);
						console.log("Deleted file from currentFiles");
						$scope.currentFiles = $rootScope.currentFiles;
						console.dir($rootScope.currentFiles);
						
						var foundFile = false;
						while (!foundFile)
						{
							if ($scope.datasetId)
							{
								angular.forEach($scope.dataset.Files, function(dFile){
									//console.log("dFile.Id = " + dFile.Id + ", file.Id = " + file.Id);
									if (!foundFile)
									{
										//console.log("We have not found the file yet...");
										//console.log("typeof file.Id = " + typeof file.Id);
										if ((typeof file.Id === 'undefined') || (file.Id === null))
										{
											//console.log("Either file file.Id is undefined, or the file.Id is null.");
											//console.log("dFile.Name = " + dFile.Name + ", file.Name = " + file.Name);
											if (dFile.Name === file.Name)
											{
												//console.log("Found file in $scope.dataset.Files...");
												foundFile = true;
												$scope.dataset.Files.splice(dFile.Id, 1);
												console.log("Removed file from $scope.dataset.Files...");
												
												angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
													//console.dir(to_upload_file);
													//console.dir(file);
													//console.dir(key);

													if(to_upload_file.Name === dFile.Name){
														$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
														console.log("Removed file from $scope.filesToUpload...");
													}
												});
											}
										}
										else if (dFile.Id === file.Id)
										{
											//console.log("Found file in $scope.project.Files...");
											foundFile = true;
											$scope.dataset.Files.splice(dFile.Id, 1);
											console.log("Removed file from $scope.dataset.Files...");
											
											angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
												//console.dir(to_upload_file);
												//console.dir(file);
												//console.dir(key);

												if(to_upload_file.Name === dFile.Name){
													$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
													console.log("Removed file from $scope.filesToUpload...");
												}
											});
										}
									}
								});
								if (foundFile)
									console.log("Found file in $scope.dataset.Files and removed it.");
								else
								{
									console.log("Did not find file in $scope.dataset.Files...");
									foundFile = true; // Set to true, to exit the loop.
								}
							}
							else
							{
								angular.forEach($scope.project.Files, function(pFile){
									//console.log("pFile.Id = " + pFile.Id + ", file.Id = " + file.Id);
									if (!foundFile)
									{
										//console.log("We have not found the file yet...");
										//console.log("typeof file.Id = " + typeof file.Id);
										if ((typeof file.Id === 'undefined') || (file.Id === null))
										{
											//console.log("Either file file.Id is undefined, or the file.Id is null.");
											//console.log("pFile.Name = " + pFile.Name + ", file.Name = " + file.Name);
											if (pFile.Name === file.Name)
											{
												//console.log("Found file in $scope.project.Files...");
												foundFile = true;
												$scope.project.Files.splice(pFile.Id, 1);
												console.log("Removed file from $scope.project.Files...");
												
												angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
													//console.dir(to_upload_file);
													//console.dir(file);
													//console.dir(key);

													if(to_upload_file.Name === pFile.Name){
														$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
														console.log("Removed file from $scope.filesToUpload...");
													}
												});
											}
										}
										else if (pFile.Id === file.Id)
										{
											//console.log("Found file in $scope.project.Files...");
											foundFile = true;
											$scope.project.Files.splice(pFile.Id, 1);
											console.log("Removed file from $scope.project.Files...");
											
											angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
												//console.dir(to_upload_file);
												//console.dir(file);
												//console.dir(key);

												if(to_upload_file.Name === pFile.Name){
													$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
													console.log("Removed file from $scope.filesToUpload...");
												}
											});
										}
									}
								});
								if (foundFile)
									console.log("Found file in $scope.project.Files and removed it.");
								else
								{
									console.log("Did not find file in $scope.project.Files...");
									foundFile = true; // Set to true, to exit the loop.
								}
							}
						}
					}
				}
			});
	    	
	    	if(!file.Id) //removing a not-yet-saved file, so remove it from the tobeuploaded list
	    	{
	    		//also look in the previously scheduled for upload files...
	    		try{
	    		angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
	    			//console.dir(to_upload_file);
	    			//console.dir(file);
	    			//console.dir(key);

	    			if(to_upload_file.Name == file.Name){
	    				$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
	    			}
	    		});
	    		}
	    		catch(e)
	    		{
	    			console.dir(e);
	    		}
	    	}

//	    	console.dir($scope.filesToUpload);
    	}

        $scope.save = function(){
			console.log("Inside modals-controller, FileModalCtrl, save...");
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
				console.log("$scope.dataset is next..");
				console.dir($scope.dataset);
				console.log("$scope.viewSubproject is next...");
				console.dir($scope.viewSubproject);
				//if (($scope.DatastoreTablePrefix === "CrppContracts") && ($scope.viewSubproject))
				if (($scope.viewSubproject) && ( ($scope.DatastoreTablePrefix === "CrppContracts") || ($scope.DatastoreTablePrefix === "Metrics")) )
				{
					console.log("Need to check subprojects for duplicate document...");
					// If a subproject is has no files yet, Files will not be defined.
					if ($scope.viewSubproject.Files)
					{
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
				}
				else if ($scope.dataset)
				{
					console.log("Need to check dataset-level files for duplicate document...");
					if ($scope.dataset.Files)
					{
						console.log("$scope.dataset.Files is next...");
						console.dir($scope.dataset.Files);
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
				}
				else
				{
					console.log("Need to check project-level files for duplicate document...");
					if ($scope.project.Files)
					{
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
				else
				{
					console.log("Neither Harvest nor ScrewTrap");
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FieldSheetFile;
				}
				
				$rootScope.currentFiles = $scope.currentFiles;
			}
			else
			{
				$scope.filesToUpload[$scope.file_field.DbColumnName] = undefined;
			}
			
			console.dir($scope);
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

            $.ajax({
                url: serviceUrl + '/data/HandleWaypoints',
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
]);

//handles managing file controltypes
mod_fmc.controller('FileAddModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService','ServiceUtilities','$rootScope',
    function($scope, $modalInstance, DataService, DatastoreService, ServiceUtilities, $rootScope){
		// This controller is for the Dataset Activity / Subproject File modal.
		console.log("Inside modals-controller.js, FileAddModalCtrl");
		console.log("$scope is next...");
		console.dir($scope);
		
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
			console.log("Inside modals-controller, FileAddModalCtrl, save...");
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
				else
					$rootScope.FieldSheetFile = $scope.FieldSheetFile = $scope.file_row.FieldSheetFile;	
				
				$rootScope.currentFiles = $scope.currentFiles;
			}
			else
			{
				$scope.filesToUpload[$scope.file_field.DbColumnName] = undefined;
			}
			
			console.dir($scope);
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

            $.ajax({
                url: serviceUrl + '/data/HandleWaypoints',
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
]);

//handles managing file controltypes
mod_fmc.controller('FileDeleteModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService','ServiceUtilities','$rootScope',
    function($scope, $modalInstance, DataService, DatastoreService, ServiceUtilities, $rootScope){
		// This controller is for the Dataset Activity / Subproject File modal.
		console.log("Inside modals-controller.js, FileDeleteModalCtrl");
		console.log("$scope is next...");
		console.dir($scope);
		
		$scope.verifyBeforeDelete = false;
		$scope.readyToClose = false;
		
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
	
		$scope.verifyDelete = function()
		{
			console.log("Inside FileDeleteModalCtrl, verifyDelete...");
			$scope.verifyBeforeDelete = true;
			console.dir($scope.currentFiles);
			$rootScope.currentFiles = $scope.currentFiles;
			console.dir($scope);
		}
	
    	$scope.removeFiles = function()
    	{
			console.log("Inside FileDeleteModalCtrl, removeFiles...");
			console.log("$scope is next...");
			console.log($scope);
			
			var tmpFiles = [];
			
			console.log("$rootScope.currentFiles is next...");
			console.dir($rootScope.currentFiles);
			
			angular.forEach($rootScope.currentFiles, function(existing_file, key){
				if (existing_file.DeleteThisFile)
				{
					// We will need the file name later, so make a note of it.
					tmpFiles.push(existing_file);
					
					// First, we delete the file from the backend (server drive and database)
					// *** Backend start
					console.log("existing_file.Name = " + existing_file.Name);

					if ($scope.DatastoreTablePrefix === "CrppContracts")
					{
						console.log("CRPP file...");
						DatastoreService.deleteCorresEventFile($scope.projectId, $scope.subprojectId, $scope.ce_row.Id, file);
					}
					//else if ($scope.project.Id === 1223)
					//else if ($scope.project.Id === HAB_PROJECTID)
					//else if (DatastoreService.getProjectType($scope.project.Id) === "Habitat")
					else if ($scope.DatastoreTablePrefix === "Metrics")
					{
						console.log("Habitat file...");
						// Subproject or Habitat Item-related?
						if ((typeof $scope.hi_row !== 'undefined') && ($scope.hi_row.Id !== null))
						{
							console.log("We want to delete a Habitat Item file...");
							DatastoreService.deleteHabitatItemFile($scope.projectId, $scope.subprojectId, $scope.hi_row.Id, file);
						}
						else
						{
							console.log("We want to delete a Subproject file...");
							DatastoreService.deleteHabSubprojectFile($scope.projectId, $scope.subprojectId, file);								
						}
					}
					//else if ($scope.subprojectId)
					//{
						
					//}
					else if ($scope.datasetId)
					{
						console.log("Dataset file...");
						DatastoreService.deleteDatasetFile($scope.projectId, $scope.datasetId, existing_file);
					}
					// *** Backend end					

					//$rootScope.currentFiles.splice(key,1);
					//console.log("Deleted file from currentFiles");
					//$scope.currentFiles = $rootScope.currentFiles;
					//console.dir($rootScope.currentFiles);
					// *** Now let's delete it from the front end.
					var foundFile = false;
					while (!foundFile)
					{
						// First check the dataset and project files.
						if ($scope.datasetId)
						{
							console.log("We have a dataset file...");
							angular.forEach($scope.dataset.Files, function(dFile){
								//console.log("dFile.Id = " + dFile.Id + ", file.Id = " + file.Id);
								if (!foundFile)
								{
									//console.log("We have not found the file yet...");
									//console.log("typeof file.Id = " + typeof file.Id);
									if ((typeof existing_file.Id === 'undefined') || (existing_file.Id === null))
									{
										//console.log("Either file file.Id is undefined, or the file.Id is null.");
										console.log("dFile.Name = " + dFile.Name + ", existing_file.Name = " + existing_file.Name);
										if (dFile.Name === existing_file.Name)
										{
											//console.log("Found file in $scope.dataset.Files...");
											foundFile = true;
											$scope.dataset.Files.splice(dFile.Id, 1);
											console.log("Removed file from $scope.dataset.Files...");
											
											angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
												//console.dir(to_upload_file);
												//console.dir(file);
												//console.dir(key);

												if(to_upload_file.Name === dFile.Name){
													$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
													console.log("Removed file from $scope.filesToUpload...");
												}
											});
										}
									}
									else if (dFile.Id === existing_file.Id)
									{
										//console.log("Found file in $scope.project.Files...");
										foundFile = true;
										$scope.dataset.Files.splice(dFile.Id, 1);
										console.log("Removed file from $scope.dataset.Files...");
										
										angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
											//console.dir(to_upload_file);
											//console.dir(file);
											//console.dir(key);

											if(to_upload_file.Name === dFile.Name){
												$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
												console.log("Removed file from $scope.filesToUpload...");
											}
										});
									}
								}
							});
							if (foundFile)
							{
								console.log("Found file in $scope.dataset.Files and removed it...");
							}
							else
							{
								console.log("Did not find file in $scope.dataset.Files...");
								foundFile = true; // Set to true, to exit the loop.
							}
						}
						else
						{
							console.log("We have a project file...");
							angular.forEach($scope.project.Files, function(pFile){
								//console.log("pFile.Id = " + pFile.Id + ", file.Id = " + file.Id);
								if (!foundFile)
								{
									//console.log("We have not found the file yet...");
									//console.log("typeof file.Id = " + typeof file.Id);
									if ((typeof existing_file.Id === 'undefined') || (existing_file.Id === null))
									{
										//console.log("Either file file.Id is undefined, or the file.Id is null.");
										//console.log("pFile.Name = " + pFile.Name + ", file.Name = " + file.Name);
										if (pFile.Name === existing_file.Name)
										{
											//console.log("Found file in $scope.project.Files...");
											foundFile = true;
											$scope.project.Files.splice(pFile.Id, 1);
											console.log("Removed file from $scope.project.Files...");
											
											angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
												//console.dir(to_upload_file);
												//console.dir(file);
												//console.dir(key);

												if(to_upload_file.Name === pFile.Name){
													$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
													console.log("Removed file from $scope.filesToUpload...");
												}
											});
										}
									}
									else if (pFile.Id === existing_file.Id)
									{
										//console.log("Found file in $scope.project.Files...");
										foundFile = true;
										$scope.project.Files.splice(pFile.Id, 1);
										console.log("Removed file from $scope.project.Files...");
										
										angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
											//console.dir(to_upload_file);
											//console.dir(file);
											//console.dir(key);

											if(to_upload_file.Name === pFile.Name){
												$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
												console.log("Removed file from $scope.filesToUpload...");
											}
										});
									}
								}
							});
							if (foundFile)
								console.log("Found file in $scope.project.Files and removed it.");
							else
							{
								console.log("Did not find file in $scope.project.Files...");
								foundFile = true; // Set to true, to exit the loop.
							}
						}
					}
					
					// Now adjust the items that keep track of files.
					// currentFiles
					$rootScope.currentFiles.splice(key,1);
					console.log("Deleted file from currentFiles");
					$scope.currentFiles = $rootScope.currentFiles;
					console.dir($rootScope.currentFiles);
					
					// Remove the file name from the actual field.
					angular.forEach($scope.file_row, function(field, key){
						console.log("field = " + field + ", key = " + key);
						if (key === $scope.file_field.DbColumnName)
						{
							console.log("Found the field...");
							
							// The field is a JSON option, so extract the files into an array.
							var theFiles = JSON.parse(field);
							console.dir(theFiles);
							angular.forEach(theFiles, function(item, key){
								console.log("item = " + item + ", key = " + key);
								console.dir(item);
								if (item.Name === existing_file.Name)
								{
									console.log("Names match...");
									theFiles.splice(key, 1);
								}
							});
							$scope.file_row[$scope.file_field.DbColumnName] = JSON.stringify(theFiles);//theFiles.toString();
							console.log("$scope.file_row[$scope.file_field.DbColumnName] = " + $scope.file_row[$scope.file_field.DbColumnName]);
						}

					});
					console.log("$scope.file_row is next...");
					console.dir($scope.file_row);
				}
			});
	    	

			angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
				//console.dir(to_upload_file);
				//console.dir(key);
				angular.forEach(tmpFiles, function(tmpFile){
					if(to_upload_file.Name == tmpFile.Name)
					{
						$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
					}
				});

			});
//	    	console.dir($scope.filesToUpload);

			console.dir($scope);
            //$modalInstance.dismiss();
			$scope.readyToClose = true;
    	}

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
]);

//handles modifying link control types

mod_fmc.controller('LinkModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService','$rootScope',
    function($scope,  $modalInstance, DataService, DatastoreService, $rootScope){
		console.log("Inside modals-controller.js, LinkModalCtrl...");
		console.log("$scope is next...");
		console.dir($scope);
		
		if (typeof $scope.onRow !== 'undefined')
			$scope.onRow.errors = [];
		
		$scope.foundDuplicate = false;
        //note: link selected for upload are managed by onLinkSelect from parent scope, in the following place:
		// ModalAddHabitatItemCtrl
		
        $scope.makeNewLink = function(){$scope.newLink = {Name: "", Link: ""}}; 
        $scope.makeNewLink();

		console.log("$scope.link_field.DbColumnName = " + $scope.link_field.DbColumnName);
        //$scope.currentLinks = $scope.link_field[$scope.link_field.DbColumnName];
        $scope.currentLinks = $scope.link_row[$scope.link_field.DbColumnName];
		console.log("$scope.currentLinks (before check) is next...");
    	console.dir($scope.currentLinks);
        if($scope.currentLinks)
            $scope.currentLinks = angular.fromJson($scope.currentLinks);
        else
            $scope.currentLinks = [];

		console.log("$scope.currentLinks (after check) is next...");
    	console.dir($scope.currentLinks);
		
		$rootScope.currentLinks = angular.copy($scope.currentLinks);
		console.log("$rootScope.currentLinks is next...");
		console.dir($rootScope.currentLinks);

        $scope.removeLink = function(link)
        {
			console.log("Inside FileModalCtrl, removeLink...");
			console.log("link is next...");
			console.dir(link);
			
			console.log("$rootScope.currentLinks is next...");
			console.dir($rootScope.currentLinks);
            angular.forEach($scope.currentLinks, function(existing_link, key){
                if(existing_link.Link == link.Link)
                    $scope.currentLinks.splice(key,1);
            });
			angular.forEach($rootScope.currentLinks, function(existing_link, key){
				console.log("existing_link.Link = " + existing_link.Link + ", link.Link = " + link.Link);
				var existing_linkLength = existing_link.Link.length;
				var linkLength = link.Link.length;
				console.log("existing_linkLength = " + existing_linkLength + ", linkLength = " + linkLength);
				
				console.log("Check: " + existing_link.Name.indexOf(link.Link));
				//if(existing_link.Name == link.Link)
				if (existing_linkLength === linkLength)
				{
					console.log("Lengths match...");
					if (existing_link.Link.indexOf(link.Link) !== -1)
					{
						console.log("Link matches...");
						if ($scope.subprojectType === "Habitat")
						{
							console.log("Habitat file...");
							DatastoreService.deleteHabitatItemLink($scope.projectId, $scope.subprojectId, $scope.hi_row.Id, file);
						}

						$scope.currentLinks.splice(key,1);
					}
				}
			});
        }

        $scope.addLink = function()
        {
            $scope.currentLinks.push($scope.newLink);   
			console.log("$scope.currentLinks is next...");
			console.dir($scope.currentLinks);
            $scope.makeNewLink();
        }

        $scope.save = function(){
			console.log("Inside modals-controller, LinkModalCtrl, save...");
			console.log("Adding link name(s) to the list.");
			console.log("$scope is next...");
			console.dir($scope);
			$rootScope.viewSubproject = $scope.viewSubproject; // Add this to the $rootScope, so that the filters can see it.
			//var errors = [];
			
            //copy back to the actual row field
            $scope.link_row[$scope.link_field.DbColumnName] = angular.toJson($scope.currentLinks);
			console.log("$scope.link_row is next...");
			console.dir($scope.link_row);
            $modalInstance.dismiss();
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
]);


mod_fmc.controller('ModalChooseMapCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

     var galleryLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';
        $scope.chooseMapSelection = [];
        
        $scope.chooseMapGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File', cellTemplate: galleryLinkTemplate},
                {field: 'Title'},
                {field: 'Description'},
                //{field: 'Size'},
            ],
            multiSelect: false,
            selectedItems: $scope.chooseMapSelection

        };
    

    $scope.save = function(){

        if($scope.chooseMapSelection.length == 0)
        {
            alert("Please choose an image to save by clicking on it and try again.");
            return;
        }

        //is there already a mapselection?
        var mapmd = getByField($scope.project.Metadata, METADATA_PROPERTY_MAPIMAGE, "MetadataPropertyId");
        var mapmd_html = getByField($scope.project.Metadata, METADATA_PROPERTY_MAPIMAGE_HTML, "MetadataPropertyId");

        if(!mapmd)
        {
            mapmd = {   MetadataPropertyId: METADATA_PROPERTY_MAPIMAGE, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(mapmd);
        }

        if(!mapmd_html)
        {
            mapmd_html = {  MetadataPropertyId: METADATA_PROPERTY_MAPIMAGE_HTML, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(mapmd_html);
        }        

        mapmd.Values = $scope.chooseMapSelection[0].Id; //fileid of the chosen image file

        //whip up the html .. might be good to have this in a pattern somewhere external!
        var the_html = "<div class='selected-image-div'>";
            the_html += "<img src='" + $scope.chooseMapSelection[0].Link + "' class='selected-image'>";
            if ($scope.chooseMapSelection[0].Description)
                the_html += "<p>" + $scope.chooseMapSelection[0].Description + "</p>";
            the_html += "</div>";

        mapmd_html.Values = the_html;

        //console.dir($scope.project.Metadata);

        var promise = DataService.saveProject($scope.project);
            promise.$promise.then(function(){
                $scope.reloadProject();
                $modalInstance.dismiss();
        });

    };


    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
]);

mod_fmc.controller('ModalChooseSummaryImagesCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

     var galleryLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';
        $scope.chooseSummaryImagesSelection = [];
        
        $scope.chooseSummaryImagesGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File', cellTemplate: galleryLinkTemplate},
                {field: 'Title'},
                {field: 'Description'},
                //{field: 'Size'},
            ],
            multiSelect: true,
            selectedItems: $scope.chooseSummaryImagesSelection

        };
    

    $scope.save = function(){

        if($scope.chooseSummaryImagesSelection.length == 0)
        {
            alert("Please choose at least one image to save by clicking on it and try again.");
            return;
        }

        //is there already a metadata record?
        var imgmd = getByField($scope.project.Metadata, METADATA_PROPERTY_SUMMARYIMAGE, "MetadataPropertyId");
        var imgmd_html = getByField($scope.project.Metadata, METADATA_PROPERTY_SUMMARYIMAGE_HTML, "MetadataPropertyId");

        if(!imgmd)
        {
            imgmd = {   MetadataPropertyId: METADATA_PROPERTY_SUMMARYIMAGE, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(imgmd);
        }

        if(!imgmd_html)
        {
            imgmd_html = {  MetadataPropertyId: METADATA_PROPERTY_SUMMARYIMAGE_HTML, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(imgmd_html);
        }        

        var selections = [];
        var the_html = "";

        for (var i = $scope.chooseSummaryImagesSelection.length - 1; i >= 0; i--) {
            var selection = $scope.chooseSummaryImagesSelection[i];

            //whip up the html .. might be good to have this in a pattern somewhere external!
            the_html += "<div class='selected-image-div'>";
                the_html += "<img src='" + selection.Link + "' class='selected-image'>";
                if (selection.Description)
                    the_html += "<p>" + selection.Description + "</p>";
                the_html += "</div>";

            selections.push(selection.Id);

        }

        imgmd_html.Values = the_html;
        imgmd.Values = selections.toString();

        //console.dir($scope.project.Metadata);

        var promise = DataService.saveProject($scope.project);
            promise.$promise.then(function(){
                $scope.reloadProject();
                $modalInstance.dismiss();
        });

    };


    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
]);



