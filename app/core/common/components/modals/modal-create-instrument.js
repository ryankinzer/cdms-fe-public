var modal_create_instrument = ['$scope', '$uibModalInstance', 'DatasetService', 'ProjectService', 'CommonService', '$rootScope',
    function ($scope, $modalInstance, DatasetService, ProjectService, CommonService, $rootScope) {

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
    $scope.instrumentList = ProjectService.getInstruments();


    $scope.save = function(){
        console.log("Inside modal_create_instrument, save...");
        console.log("$scope.instrument_row is next...");
        console.dir($scope.instrument_row);
        console.dir($scope);

        if (!$scope.instrument_row.InstrumentTypeId) {
            alert("You must select an Instrument Type!");
            return;
        }
        else if (CommonService.checkForDuplicateInstrument($scope.instrumentList, $scope.instrument_row)) {
            alert("An instrument with this name and serial number has already been entered!");
            return;
        }
		
        var saveRow = angular.copy($scope.instrument_row);
		console.log("saveRow is next...");
		console.dir(saveRow);
		
        saveRow.AccuracyChecks = undefined;
        saveRow.OwningDepartment = undefined;
        var saved_instrument = ProjectService.saveInstrument($scope.project.Id, saveRow);
        saved_instrument.$promise.then(function () {
            $modalInstance.close(saved_instrument);
        }, function (error) {
                $scope.SaveMessage = "Error: " + error.data.ExceptionMessage;
        });
    };

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];

