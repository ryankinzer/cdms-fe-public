var modal_create_instrument = ['$scope', '$modalInstance', 'DatasetService', 'ProjectService', 'CommonService',
    function ($scope, $modalInstance, DatasetService, ProjectService, CommonService){

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


    $scope.InstrumentTypes = ProjectService.getInstrumentTypes();
    $scope.Departments = CommonService.getDepartments();
    $scope.RawProjects = ProjectService.getProjects();


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
        var promise = ProjectService.saveInstrument($scope.project.Id, saveRow);
        promise.$promise.then(function(){
            $scope.reloadProject();
            $modalInstance.dismiss();
        });
    };

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];

