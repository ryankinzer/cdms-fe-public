
var admin_edit_dataset = ['$scope', '$modal', '$timeout', '$routeParams', 'DatasetService', 'CommonService','ProjectService','AdminService',
    function ($scope, $modal, $timeout, $routeParams, DatasetService, CommonService, ProjectService, AdminService ){

		$scope.dataset = DatasetService.getDataset($routeParams.Id);
		$scope.FieldLookup = {};
        $scope.SelectedField = null;
        $scope.saveResults = {};
		
		$scope.Sources = CommonService.getSources();
		$scope.Instruments = ProjectService.getInstruments();


        $timeout(function () {
            //stickyfill - this is so that IE (dumb thing) can have sticky div.
            //https://www.npmjs.com/package/stickyfill2
            var stickybox = document.getElementById('sticky-box');
            if (stickybox) {
                Stickyfill.add(stickybox);
                //console.log("stickyfill is a go!!! - !!!!!!!!!!!!!!!!!!!!!!");
            }
        }, 0);
        
		$scope.$watch('dataset.Id', function(){
			
			if(!$scope.dataset.Id)
				return;
			
			console.log("Inside dataset.Id watcher...");
			console.dir($scope.dataset);
		
            if (!$scope.MasterFields)
            {
                var promise = AdminService.getMasterFields($scope.dataset.Datastore.FieldCategoryId);

                promise.$promise.then(function (data) {
                    $scope.allFields = promise;
                    $scope.populateAddFieldDropdown();
                });
            }
            else
                $scope.populateAddFieldDropdown();

			angular.forEach($scope.dataset.Fields.sort(orderByAlpha), function(field){
				//parseField(field, $scope);
				console.log("field.Field.DbColumnName = " + field.Field.DbColumnName);
				if(field.Field.PossibleValues)
					field.Values = makeObjectsFromValues($scope.dataset.DatastoreId+field.DbColumnName, field.Field.PossibleValues);

				field.SourceId = ""+field.SourceId; //so we can find it in the dropdown!
				field.InstrumentId = ""+field.InstrumentId;
			});

			$scope.dataFields = $scope.dataset.Fields;

            if ($scope.dataset.Config !== undefined && $scope.dataset.Config != null) {
                $scope.dataset.ConfigString = angular.toJson($scope.dataset.Config, true);
                $scope.parseConfigString();
            }

            $scope.dataset.DefaultActivityQAStatusId = "" + $scope.dataset.DefaultActivityQAStatusId;
            $scope.dataset.DefaultRowQAStatusId = "" + $scope.dataset.DefaultRowQAStatusId;

            $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');
            $scope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  

            console.log('-----------------');
            console.dir($scope.QAStatusList);
            console.dir($scope.dataset.DefaultActivityQAStatusId);
            console.dir($scope.dataset);



            //$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');



		});

        $scope.logStatus = function () {
            console.log('-----------------');
            console.dir($scope.QAStatusList);
            console.dir($scope.dataset.DefaultActivityQAStatusId);
            console.log(typeof $scope.dataset.DefaultActivityQAStatusId);
            console.dir($scope.dataset);
        };

		$scope.$watch('Sources',function(){
			if($scope.Sources.length > 0)
			$scope.SourcesLookup = makeObjects($scope.Sources, 'Id','Name');
		},true);

		$scope.$watch('Instruments',function(){
			if($scope.Instruments.length > 0)
			$scope.InstrumentsLookup = makeObjects($scope.Instruments, 'Id','Name');
		},true);

		$scope.$watch('saveResults.success', function(){
			if (!$scope.saveResults.success)
				return;

            console.log("The result of saveResults: " + $scope.saveResults.success);
            console.log(" - so now we'll reload the dataset: " + $routeParams.Id);
			
			DatasetService.clearDataset();
			$scope.dataset = DatasetService.getDataset($routeParams.Id); //reload
			$scope.SelectedField = null;

		},true);

		$scope.removeField = function()
		{
			if(!confirm("Are you sure you want to remove '" + $scope.SelectedField.Label + "' from this dataset?"))
                return;

			$scope.saveResults = {};
            AdminService.removeField($scope.dataset.Id, $scope.SelectedField.FieldId, $scope.saveResults);
		}

		$scope.addMasterField = function()
		{
			console.log("Inside admin-controller.js, addMasterField...");
			$scope.saveResults = {};
			
			// Note:  Given a list with zero-based index (0, 1, 2, 3, etc.), like we have here.
			// With angular, when you select the first item in a list, it often (always?) shows blank (null).
			// The problem does not present itself for items 1 and following.
			// This problem is a known issue (see this article:  http://stackoverflow.com/questions/12654631/why-does-angularjs-include-an-empty-option-in-select).
			// To avoid this problem, we access the first item (0), using index 0.
			if ($scope.newField === null)
				$scope.newField = $scope.MasterFields[0].Id;
			
			console.log("$scope.newField (after checking) = " + $scope.newField);
			AdminService.addMasterFieldToDataset($scope.dataset.Id, $scope.newField, $scope.saveResults);
		};

		$scope.saveField = function()
		{
			console.log("Inside admin_edit_dataset, saveField...");
			
			$scope.saveResults = {};
			AdminService.saveDatasetField($scope.SelectedField, $scope.saveResults);
        };

        $scope.saveConfig = function () {
            $scope.dataset.Config = $scope.dataset.ConfigString;
            var promise = DatasetService.saveDataset($scope.dataset );

            promise.$promise.then(function () {
                console.dir(promise);
                $scope.dataset = DatasetService.getDataset(promise.Id);
                $scope.success_message = "Save successful.";
            });
        };

		$scope.selectField = function(field){
			$scope.SelectedField = field;
        };

        $scope.parseConfigString = function () {
            try {
                var ConfigObject = angular.fromJson($scope.dataset.ConfigString);
                if (ConfigObject)
                    $scope.ConfigParse = "Parse successful.";
            } catch (exception) {
                console.dir(exception);
                $scope.ConfigParse = exception.message;
            }
        }

        $scope.populateAddFieldDropdown = function () {
            var master_fields = [];

            //make sure incoming master fields aren't already in the dataset fields
            $scope.allFields.forEach(function (field, index) {
                if (!getByField($scope.dataset.Fields, field.Id, 'FieldId')) {
                    master_fields.push(field);
                }
            });
            $scope.MasterFields = master_fields;
        };
	}
];