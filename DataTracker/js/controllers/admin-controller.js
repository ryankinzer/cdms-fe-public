//admin controller

'use strict';
var mod_ac = angular.module('AdminController', ['ui.bootstrap']);

mod_dv.controller('ModalAddProjectDatasetCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
	function($scope,  $modalInstance, DataService, DatastoreService){

		$scope.row = {};

		$scope.projects = DataService.getProjects(); //.sort(orderByAlpha);
		

		$scope.save = function(){
			
			$modalInstance.dismiss();

		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};

	}
]);



mod_ac.controller('AdminCtrl', ['$scope','DatastoreService','$modal','DataService',
	function($scope, DatastoreService, $modal, DataService){

		//TODO: a nicer global route authorization scheme...
		if(!$scope.Profile.isAdmin())
			angular.rootScope.go("/unauthorized");

		$scope.datastores = DatastoreService.getDatastores();
		$scope.projects = DataService.getProjects();

		var watcher = $scope.$watch('datastores',function(){

			if($scope.datastores.length > 0)
			{
				watcher();	//removes watch since we're about to do some updates that would cause multiple firings...!

				angular.forEach($scope.datastores, function(datastore, key){
					//datastore.Projects = DatastoreService.getProjects(datastore.Id);
					datastore.Datasets = DatastoreService.getDatasets(datastore.Id);
				});

			}


		}, true);


		$scope.addNewProjectDataset = function(datastore){
			$scope.datastore = datastore;
			var modalInstance = $modal.open({
				templateUrl: 'partials/admin/addNewProjectDataset.html',
				controller: 'ModalAddProjectDatasetCtrl',
				scope: $scope, //very important to pass the scope along... 
	
			});
		};

		$scope.getProjectName = function(id)
		{

			//console.log(">>" + id);
			var ret = "";
			var project = getMatchingByField($scope.projects,id,'Id');
			if(project)
				ret = " - " + project.Name;

		}


	}

]);

mod_ac.controller('AdminEditDatasetCtrl', ['$scope','DatastoreService','$modal', 'DataService', '$routeParams',
	function($scope, DatastoreService, $modal, DataService, $routeParams){

		$scope.dataset = DataService.getDataset($routeParams.Id);
		$scope.FieldLookup = {};
		$scope.SelectedField = null;
		
		$scope.Sources = DatastoreService.getSources();
		$scope.Instruments = DatastoreService.getInstruments();
		//$scope.Laboratories = DatastoreService.getLaboratories();

		$scope.$watch('dataset.Id', function(){
			
			if(!$scope.dataset.Id)
				return;
			
			console.log("Inside dataset.Id watcher...");
			console.dir($scope.dataset);
		
			if(!$scope.MasterFields)
				$scope.MasterFields = DatastoreService.getMasterFields($scope.dataset.Datastore.FieldCategoryId);

			angular.forEach($scope.dataset.Fields.sort(orderByAlpha), function(field){
				//parseField(field, $scope);
				console.log("field.Field.DbColumnName = " + field.Field.DbColumnName);
				if(field.Field.PossibleValues)
					field.Values = makeObjectsFromValues($scope.dataset.DatastoreId+field.DbColumnName, field.Field.PossibleValues);

				field.SourceId = ""+field.SourceId; //so we can find it in the dropdown!
				field.InstrumentId = ""+field.InstrumentId;
			});

			$scope.dataFields = $scope.dataset.Fields;

		});
		
		$scope.$watch('Sources',function(){
			if($scope.Sources.length > 0)
			$scope.SourcesLookup = makeObjects($scope.Sources, 'Id','Name');
		},true);

		$scope.$watch('Instruments',function(){
			if($scope.Instruments.length > 0)
			$scope.InstrumentsLookup = makeObjects($scope.Instruments, 'Id','Name');
		},true);

		$scope.$watch('Laboratories',function(){
			if($scope.Laboratories.length > 0)
			$scope.LaboratoriesLookup = makeObjects($scope.Laboratories, 'Id','Name');
		},true);
		
		$scope.$watch('saveResults.DatasetId', function(){
			if (!$scope.saveResults.DatasetId)
				return;

			console.log("Inside watch saveResults.DatasetId...");
			console.log("$scope.saveResults.DatasetId is next...");
			console.dir($scope.saveResults.DatasetId);
			
			DataService.clearDataset();
			$scope.dataset = DataService.getDataset($routeParams.Id); //reload
			$scope.SelectedField = null;

		},true);

		$scope.removeField = function()
		{
			if(!confirm("Are you sure you want to remove '" + $scope.SelectedField.Label + "' from this dataset?"))
                return;

			$scope.saveResults = {};
			DatastoreService.removeField($scope.dataset.Id, $scope.SelectedField.FieldId, $scope.saveResults);
			//$scope.saveResults = DatastoreService.removeField($scope.dataset.Id, $scope.SelectedField.FieldId, $scope.saveResults);
            setTimeout(function(){
			// JavaScript might run the next lines too fast, so I (GC) put them into watch saveResults.DatasetId up above.
            //	DataService.clearDataset();
			//	console.log("Dumped dataset...");
            //	$scope.dataset = DataService.getDataset($routeParams.Id); //reload
			//	console.log("Reloading dataset...");
            //	$scope.SelectedField = null;
			//	console.log("Cleared selected field...");
            },400);
		}

		$scope.addMasterField = function()
		{
			console.log("Inside admin-controller.js, addMasterField...");
			console.log("$scope is next...");
			console.dir($scope);
			//console.log("$scope.newField (coming in) = " + $scope.newField);
			$scope.saveResults = {};
			
			// Note:  Given a list with zero-based index (0, 1, 2, 3, etc.), like we have here.
			// With angular, when you select the first item in a list, it often (always?) shows blank (null).
			// The problem does not present itself for items 1 and following.
			// This problem is a known issue (see this article:  http://stackoverflow.com/questions/12654631/why-does-angularjs-include-an-empty-option-in-select).
			// To avoid this problem, we access the first item (0), using index 0.
			if ($scope.newField === null)
				$scope.newField = $scope.MasterFields[0].Id;
			
			console.log("$scope.newField (after checking) = " + $scope.newField);
			DatastoreService.addMasterFieldToDataset($scope.dataset.Id, $scope.newField, $scope.saveResults);
			//$scope.saveResults = DatastoreService.addMasterFieldToDataset($scope.dataset.Id, $scope.newField, $scope.saveResults);
			// JavaScript might run the next lines too fast, so I (GC) put them into watch saveResults.DatasetId up above.
			//setTimeout(function(){
			//	DataService.clearDataset();
            //	$scope.dataset = DataService.getDataset($routeParams.Id); //reload
            //},400);
		};

		$scope.saveField = function()
		{
			$scope.saveResults = {};
			DatastoreService.saveDatasetField($scope.SelectedField, $scope.saveResults);
		};

		$scope.selectField = function(field){
			$scope.SelectedField = field;
		};
		

	}
]);

mod_ac.controller('AdminEditMasterCtrl', ['$scope','DatastoreService','$modal', 'DataService', '$routeParams',
	function($scope, DatastoreService, $modal, DataService, $routeParams){

		$scope.datastore = DatastoreService.getDatastore($routeParams.Id);
		
		$scope.SelectedField = null;

		$scope.$watch('datastore.Id', function(){
			if($scope.datastore.Id > 0)
				$scope.datastoreFields = DatastoreService.getMasterFields($scope.datastore.FieldCategoryId); //DatastoreService.getFields($routeParams.Id);
		});

		$scope.$watch('datastoreFields', function(){
			if(!$scope.datastoreFields)
				return;

				angular.forEach($scope.datastoreFields, function(field){
					//parseField(field, $scope);
					if(field.PossibleValues)
						field.Values = makeObjectsFromValues($scope.datastore.Id+field.DbColumnName, field.PossibleValues);

				});				
			

		},true);

		$scope.saveField = function()
		{
			$scope.saveResults = {};
			DatastoreService.saveMasterField($scope.SelectedField, $scope.saveResults);
		}
		
		$scope.selectField = function(field){
			$scope.SelectedField = field;
		};
		

	}
]);