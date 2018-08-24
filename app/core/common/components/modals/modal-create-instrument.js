var modal_create_instrument = ['$scope', '$modalInstance', 'DatasetService', 'ProjectService', 'CommonService', '$rootScope',
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
        //saveRow.InstrumentType = undefined; // We have an InstrumentTypeId, but no InstrumentType.  Why is this here?
        saveRow.OwningDepartment = undefined;
        var promise = ProjectService.saveInstrument($scope.project.Id, saveRow);
        promise.$promise.then(function () {
            console.log("saveInstrument promise is next...");
            console.dir(promise);

            // Capture the Id of the instrument we just created, so that after we save it, and the form closes,
            // we can "remember" what it was, so that we can set the instrument box to it, after the project reloads.
            $rootScope.InstrumentId = promise.Id;

            // If we are on the Project-Instruments tab, no datasets have been loaded.
            // If we are on Adding an instrument from a Dataset page (Data Entry, Data Edit, or Data Import),
            // there is a dataset.
            if ((typeof $scope.dataset === 'undefined') || ($scope.dataset === null)) {
                console.log("At project-level; reload Instruments tab...");
                $scope.postSaveInstrumentUpdateGrid(promise);
            }
            else {
                console.log("At dataset-level; reload project...");
                $scope.reloadProject(); // We need this line, so that the project reloads and picks up the new instrument.
            }

            $modalInstance.dismiss();
        });
    };

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];

