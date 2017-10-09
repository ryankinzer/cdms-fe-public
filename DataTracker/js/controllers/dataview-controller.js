
//data view controllers 

'use strict';
var mod_dv = angular.module('DataViewControllers', ['ui.bootstrap']);

mod_dv.controller('ModalQaUpdateCtrl', ['$scope','DataService', '$modalInstance',
	function($scope, DataService, $modalInstance){
		$scope.save = function(){
			
			// Original code.
			DataService.updateQaStatus(
				$scope.grid.Header.ActivityId,
				$scope.row.ActivityQAStatus.QAStatusId, 
				$scope.row.ActivityQAStatus.Comments, 
				$scope.QaSaveResults);

			DataService.clearProject();
			
			$scope.fields = { header: [], detail: [], relation: []}; 
    		$scope.datasheetColDefs = [];
    		$scope.dataSheetDataset = [];
			$scope.fieldsloaded = false;
			
            $scope.reloadProject();
			$modalInstance.dismiss();
		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};

	}
]);




mod_dv.controller('DatasetViewCtrl', ['$scope','$routeParams','DataService','$modal','$location','DataSheet','$route','$rootScope','ChartService','DatastoreService',
    	function($scope, $routeParams, DataService, $modal, $location, DataSheet, $route, $rootScope, ChartService, DatastoreService) {
			console.log("Inside dataview-controller.js, controller DatasetViewCtrl...");
			console.log("$routeParams.Id = " + $routeParams.Id);
    		$scope.grid = DataService.getActivityData($routeParams.Id); //activity data for a particular activityId
    		
			$scope.fields = { header: [], detail: [], relation: []}; 
    		$scope.datasheetColDefs = [];
    		$scope.dataSheetDataset = [];
    		$scope.gridFields = [];
			
			//$scope.datasetId = null;
			
			console.log("Setting $scope.fieldsloaded to false...");
    		$scope.fieldsloaded = false;
			
			$scope.fishermenList = null;
			//$scope.fishermenList = DatastoreService.getFishermen();
			console.log("$scope is next...");
			console.dir($scope);
			//if ($scope.this.DatastoreTablePrefix === "CreelSurvey")
			//	$scope.fishermenList = DatastoreService.getFishermen();

			$scope.$watch('QaSaveResults', function(){
				if($scope.QaSaveResults && $scope.QaSaveResults.success)
				{
					$scope.grid = DataService.getActivityData($routeParams.Id); //activity data for a particular activityId
				}				
			},true);

    		$scope.query = { loading: true };
    		$scope.activities = $rootScope.GridActivities; //pull this in from the previous page, if they were set.  Used for navigating between activities.

			$scope.gridDatasheetOptions = { 
    			data: 'dataSheetDataset', 
		        columnDefs: 'datasheetColDefs',
    			enableColumnResize: true, 
    			enableSorting: true, 
    			enableCellSelection: true,
    			showFilter: true,
    			showColumnMenu: true,
    			enableRowSelection: true,
    			multiSelect: false,
	   			//showFooter: true,
    			//footerTemplate: '<div class="grid-footer-totals"><div class="colt0 sumField"></div><div class="colt1 sumField"></div><div class="colt2 sumField"></div><div class="colt3 sumField"></div><div class="colt4 sumField"></div><div class="colt5 sumField">s: 1433<br/>a: 477.67</div><div class="colt6 sumField"></div></div>',

    		};

    		DataSheet.initScope($scope);

			var fishermenWatcher = 
			$scope.$watch('fishermenList.length', function(){
				//console.log("Inside fishermenList watch...");
				if ((typeof $scope.fishermenList !== 'undefined') && ($scope.fishermenList !== null))
				{
					console.log("Inside fishermenList watch...");
					console.log("$scope.fishermenList.length = " + $scope.fishermenList.length)
					
					if ($scope.fishermenList.length > 0)
					{
						$scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.fishermenList, 'Id','FullName');
						console.log("$scope.fishermenOptions is next...");
						console.dir($scope.fishermenOptions);						
					}
				}
					
			});
			
    		$scope.$watch('dataset.ProjectId', function()
    		{
    			if($scope.dataset && $scope.dataset.ProjectId)
    			{
					console.log("Inside watch dataset.ProjectId...");
					console.log("ProjectId = " + $scope.dataset.ProjectId);
					$rootScope.projectId = $scope.dataset.ProjectId;
					
    				$scope.project = DataService.getProject($scope.dataset.ProjectId);
	    			$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

	    			ChartService.buildChart($scope, $scope.grid.Details, $scope.dataset.Datastore.TablePrefix);

					// If the dataset WaterTemp or WaterQuality, show the RowQAStatus field.
					if (($scope.DatastoreTablePrefix === "WaterTemp") || ($scope.DatastoreTablePrefix === "WaterQuality"))
					{
						if($scope.dataset.RowQAStatuses.length > 1)
						{
							$scope.datasheetColDefs.unshift( // Add the item to the beginning of the array.
							{
								field: "QAStatusId", //QARowStatus
								displayName: "QA",
								cellFilter: 'RowQAStatusFilter'
							});
						}
					}

					// If we are on the Creel Survey dataset, we need to take the total number of minutes,
					// and put it into HH:MM format, before putting the entry on the form.
					if ($scope.DatastoreTablePrefix === "CreelSurvey")
					{
						var detailsLength = $scope.dataSheetDataset.length;
						var NumMinutes = -1;
						var theHours = -1;
						var theMinutes = -1;
						
						var strHours = "";
						var strMinutes = "";
						for (var i = 0; i < detailsLength; i++)
						{
							NumMinutes = parseInt($scope.dataSheetDataset[i].TotalTimeFished);
							//console.log("NumMinutes = " + NumMinutes);
							theHours = parseInt(NumMinutes / 60, 10);
							//console.log("theHours = " + theHours);
							theMinutes = NumMinutes - (theHours * 60);
							//console.log("theMinutes = " + theMinutes);
							
							if (theHours < 10)
								strHours = "0" + theHours;
							else
								strHours = "" + theHours;
							
							if (theMinutes < 10)
								strMinutes = "0" + theMinutes;
							else
								strMinutes = "" + theMinutes;
												
							$scope.dataSheetDataset[i].TotalTimeFished = strHours + ":" + strMinutes;
							//console.log("TotalTimeFished is now = " + $scope.dataSheetDataset[i].TotalTimeFished);
							
							NumMinutes = -1;
							theHours = -1;
							theMinutes = -1;
							strHours = "";
							strMinutes = "";
						}				
					}
	    		}
				console.log("$scope at end of watch dataset.ProjectId is next...");
				console.dir($scope);
    		});

    		//setup a listener to populate column headers on the grid
			$scope.$watch('grid.Dataset', function() { 
				if(!$scope.grid.Dataset) return; //not done cooking yet.
				
				console.log("Inside watch grid.Dataset...");
				console.log("$scope.grid is next...");
				console.dir($scope.grid);
				
				$scope.dataset = $scope.grid.Dataset;//DataService.getDataset($scope.grid.Dataset.Id);
				console.log("Dataset ID = " + $scope.grid.Dataset.Id);
				$rootScope.datasetId = $scope.datasetId = $scope.grid.Dataset.Id
				console.log("$rootScope.datasetId = " + $rootScope.datasetId);
				
				$rootScope.DatastoreTablePrefix = $scope.DatastoreTablePrefix = $scope.grid.Dataset.Datastore.TablePrefix;
				console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
				$scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix, "form");  // Pass the TablePrefix (name of the dataset), because it will never change.									
				
				DataService.configureDataset($scope.dataset);
				
				if ($scope.DatastoreTablePrefix === "CreelSurvey")
				{
					$scope.fishermenList = DatastoreService.getFishermen();
					
					console.log("Extracting times from strings...");
					var strTimeStart = $scope.grid.Header.TimeStart;
					var strTimeEnd = $scope.grid.Header.TimeEnd;
					var intTLoc = strTimeStart.indexOf("T");
					// Start just past the "T" in the string, and get the time portion (the next 5 characters).
					strTimeStart = strTimeStart.substr(intTLoc + 1, 5);
					$scope.grid.Header.TimeStart = strTimeStart;
								
					strTimeEnd = strTimeEnd.substr(intTLoc + 1, 5);
					$scope.grid.Header.TimeEnd = strTimeEnd;
					
					for (var i = 0; i < $scope.grid.Details.length; i++)
					{
						console.log("$scope.grid.Details[i] is next...");
						console.dir($scope.grid.Details[i]);
						var strInterviewTime = $scope.grid.Details[i].InterviewTime;
						console.log("strInterviewTime = " + strInterviewTime);
						intTLoc = strInterviewTime.indexOf("T");
						console.log("intLoc = " + intTLoc);
						strInterviewTime = strInterviewTime.substr(intTLoc + 1, 5);
						console.log("strInterviewTime = " + strInterviewTime);
						$scope.grid.Details[i].InterviewTime = strInterviewTime
					}
				}

				console.log("$scope.fieldsloaded = " + $scope.fieldsloaded);
				$scope.fields.header = [];
				if(!$scope.fieldsloaded)
				{
					angular.forEach($scope.grid.Dataset.Fields.sort(orderByIndex), function(field){

						parseField(field, $scope);

						if(field.FieldRoleId == FIELD_ROLE_HEADER)
						{
							$scope.fields.header.push(field);
						}
						else if (field.FieldRoleId == FIELD_ROLE_DETAIL)
						{
							$scope.fields.detail.push(field);
							$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
						}

						//keep a list of grid fields (relations) for later loading
						if(field.ControlType == "grid")
							$scope.gridFields.push(field);
		    		});
					console.log("Setting $scope.fieldsloaded to true...");
		    		$scope.fieldsloaded = true;

		    		$scope.dataSheetDataset = $scope.grid.Details;
		    		$scope.recalculateGridWidth($scope.datasheetColDefs.length);
				}
				$scope.query.loading = false;

				$scope.RowQAStatuses =  $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

   				$scope.grid.Header.Activity.Timezone = angular.fromJson($scope.grid.Header.Activity.Timezone);


	    	});


			$scope.$watch('dataSheetDataset', function(){
				if(!$scope.dataSheetDataset)
					return;
				
				console.log("Inside watch dataSheetDataset...");
				console.log("$scope.dataSheetDataset is next...");
				console.dir($scope.dataSheetDataset);
				console.log("$scope.gridFields is next...");				
				console.dir($scope.gridFields);
				console.log("*****")

				//kick off the loading of relation data (we do this for UI performance rather than returning with the data...)
				angular.forEach($scope.dataSheetDataset, function(datarow){
					angular.forEach($scope.gridFields, function(gridfield){
						datarow[gridfield.DbColumnName] = DataService.getRelationData(gridfield.FieldId, datarow.ActivityId, datarow.RowId);
						console.log("kicking off loading of " + datarow.ActivityId + ' ' + datarow.RowId);
					})	
				})
				
			});
			
			$scope.reloadProject = function(){
					//reload project instruments -- this will reload the instruments, too
					console.log("Inside reloadProject...");
					DataService.clearProject();
					$scope.project = DataService.getProject($scope.dataset.ProjectId);
					var watcher = $scope.$watch('project.Id', function(){
						//$scope.selectInstrument();
						$rootScope.projectId = $scope.project.Id;						
						watcher();
					});
					
			 };

			$scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

	        $scope.changeQa = function(){
	        	$scope.QaSaveResults = {};
				$scope.row = {ActivityQAStatus: {}}; //modal selections

	        	var modalInstance = $modal.open({
						templateUrl: 'partials/modals/changeqa-modal.html',
						controller: 'ModalQaUpdateCtrl',
						scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
						//resolve: { files: function() { return $scope.files; } }
					});
	        };

	    	$scope.openEdit = function()
	    	{
	    		$location.path("/edit/"+$scope.grid.Header.ActivityId);
	    	}

			$scope.openExportView = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/modals/exportfile-modal.html',
					controller: 'ModalDataEntryCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
			}

    		
    		//copy and paste alert -- this should be in a common thing!
    		$scope.openDataEntryModal = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/modals/dataentry-modal.html',
					controller: 'ModalDataEntryCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
			};

			$scope.openRelationGridModal = function(row, field)
			{
				$scope.relationgrid_row = row;
				$scope.relationgrid_field = field;
				$scope.isEditable = false;
				
				var modalInstance = $modal.open({
					templateUrl: 'partials/modals/relationgrid-modal.html',
					controller: 'RelationGridModalCtrl',
					scope: $scope, 
				});
				
			};

	        $scope.viewRelation = function(row, field_name)
	        {
	        	//console.dir(row.entity);
	        	var field = $scope.FieldLookup[field_name];
	        	//console.dir(field);

	        	$scope.openRelationGridModal(row.entity, field);
	        }

			//defined in services
			$scope.previousActivity = function(){
				previousActivity($scope.activities, $routeParams.Id, $location);
			}

			$scope.nextActivity = function(){
				nextActivity($scope.activities, $routeParams.Id, $location);
			}

			$scope.fromJson = function(field)
			{
				return angular.fromJson($scope.grid.Header[field]);
			}


    }]);

		