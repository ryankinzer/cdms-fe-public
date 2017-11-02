//Global / full query across all projects with this dataset.
var big_bucket_query = ['$scope','$routeParams','CommonService','AdminService','DatasetService','$location', '$modal','DataSheet', '$rootScope',
    	function($scope, $routeParams, CommonService, AdminService, DatasetService, $location, $modal, DataSheet, $rootScope) {

    		$scope.datastoreLocations = CommonService.getLocations($routeParams.Id);
    		$scope.dataFields = AdminService.getFields($routeParams.Id);
    		$scope.datastore = DatasetService.getDatastore($routeParams.Id);

			$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.datasheetColDefs = [];
    		$scope.query = {results: []};
    		$scope.dataSheetDataset = [];

			$scope.chartData = {"series": [], "data":[{ "x": "Loading...", "y": [0],"tooltip": ""}]}; //default

    		$scope.gridDatasheetOptions = { 
    			data: 'dataSheetDataset', 
		        columnDefs: 'datasheetColDefs',
    			enableColumnResize: true, 
	        	enableRowSelection: true,
	        	enableCellEdit: false,
	        	enableSorting: true, 
    			enableCellSelection: true,
    			showFilter: false,
    			showColumnMenu: true,
    			multiSelect: false,
    		};

			DataSheet.initScope($scope);

			$scope.datasheetColDefs = [{   
										field: 'LocationId', 
                                        displayName: 'Location', 
                                        cellFilter: 'locationNameFilter'
                                    },
                                    {
                                        field: 'ActivityDate', 
                                        displayName: 'Activity Date',
                                        cellFilter: 'date: \'MM/dd/yyyy\'',
                                    },
                                    {
                                        field: 'ActivityQAStatusId',
                                        displayName: 'QA Status',
                                        cellFilter: 'QAStatusFilter'
                                    }];


    		$scope.$watch('datastoreLocations', function(){
    			if(!$scope.datastoreLocations)
    				return;
    			
    			$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.datastoreLocations, 'Id','Label') ;
    			$scope.locationOptions["all"] = "- All -";
    			$scope.Criteria.LocationIds = ["all"]; //set the default	
    		},true);


    		$scope.$watch('dataFields', function(){
    			if(!$scope.dataFields)
    				return;
    			
    			var fieldIndex = 0;

    			$scope.dataFields = $scope.dataFields.sort(orderByAlpha);
    			console.log("ordered!");
    			console.dir($scope.dataFields);

				angular.forEach($scope.dataFields, function(field){
					parseField(field, $scope);
					
					//create a javascript list from our possible values (if any)
					if(field.PossibleValues)
					{
						
		                field.PossibleValuesList = makeObjectsFromValues(field.DbColumnName, field.PossibleValues); //set this into our object
	
						fieldIndex ++;

					}

					$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));


	    		});

				$scope.recalculateGridWidth($scope.datasheetColDefs.length);
    			
    		},true);


			$scope.criteriaList = [];

	    	$scope.queryToolVisible = true;
			$scope.Criteria = {};
			$scope.Criteria.paramActivityDateType = "all"; //default
			
		//$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');  //TODO
			$scope.QAStatusOptions = {};
			$scope.RowQAStatuses = {};
	        
	        $scope.QAStatusOptions["all"] = "- All -";
	        $scope.RowQAStatusOptions["all"] = "- All -";
	        
	        $scope.Criteria.ParamQAStatusId = "all";
	        $scope.Criteria.ParamRowQAStatusId = "all";
	        
	        $scope.RowQAStatuses["all"] = "- All -";


    		$scope.AutoExecuteQuery = true;

    		$scope.removeCriteria = function(idx) {
    			$scope.criteriaList.splice(idx,1);
    			if($scope.AutoExecuteQuery)
					$scope.executeQuery();
    		};

    		$scope.addCriteria = function(){
				$scope.criteriaList.push({
					//commenting these out because they will be read at EXECUTE time, not saved per query.
					//qastatus:   $scope.Criteria.ParamQAStatusId,
					//locations:  $scope.Criteria.LocationIds,
					//activities: $scope.Criteria.paramActivityDateType, 
					DbColumnName: 		$scope.Criteria.ParamFieldSelect[0].DbColumnName,
					Id: 				$scope.Criteria.ParamFieldSelect[0].Id,
					Value: 				$scope.Criteria.Value,
				});

				//console.dir($scope.criteriaList);

				$scope.Criteria.Value = null;

				if($scope.AutoExecuteQuery)
					$scope.executeQuery();
    		};

    		$scope.buildQuery = function(){
				console.log("Inside DatastoreQueryCtrl.buildQuery...");
				
				var query = 
    			{
					criteria: {
						DatastoreId: 	  $routeParams.Id,
						QAStatusId:   $scope.Criteria.ParamQAStatusId,
						Locations:    angular.toJson($scope.Criteria.LocationIds).toString(),
						FromDate:     $scope.Criteria.BetweenFromActivityDate,
						ToDate:       $scope.Criteria.BetweenToActivityDate,
						DateSearchType: $scope.Criteria.paramActivityDateType, 
						Fields: 	  $scope.criteriaList,

					},
					loading: true,
    			};
				
				console.log("query is next...");
				console.dir(query);

    			return query;
    		};

    		$scope.executeQuery = function(){
				console.log("Inside DatastoreQueryCtrl.executeQuery...");
    			$scope.query = $scope.buildQuery();
				console.log("$scope.query is next...");
				console.dir($scope.query);

    			DatasetService.queryActivities($scope.query);
    			//service will run query and then update:
	    			//query.results
	    			//query.errors
	    	};

	    	$scope.$watch('query.loading', function(){
	    		console.log("--- gathering graph data");
	    		$scope.chartData = getAdultWeirChartData($scope.query.results);	
	    		$scope.dataSheetDataset = $scope.query.results;
	    	});
	    	


		}			
];