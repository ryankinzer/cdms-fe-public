'use strict';


/* Controllers */

var mod = angular.module('DatasetControllers', ['ui.bootstrap', 'angularFileUpload']);

	mod.controller('DatasetListCtrl', ['$scope', 'Datasets', 
    	function ($scope, Datasets) {
        	$scope.datasets = Datasets.query();
    }]);

    mod.controller('DatasetDetailCtrl',['$scope','$routeParams', 'Activities', 'Dataset', '$modal', '$location', 
    	function ($scope, $routeParams, Activities, Dataset, $modal, $location) {
            $scope.Id = $routeParams.Id;
            $scope.dataset = Dataset.get({ id: $routeParams.Id });
            $scope.activities = Activities.query({ id: $routeParams.Id });
            $scope.fieldsCollapsed = true;

            var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
            				   '<a href="#/datagrid/{{row.getProperty(\'Id\')}}">{{row.getProperty("CreateDate")}}</a>' +
            				   '</div>';

            $scope.gridOptions = {
            	data: 'activities',
            	columnDefs: 
            		[
            			{field:'CreateDate', displayName:'Created', cellTemplate: linkTemplate},
            			{field:'Location.Label',displayName: 'Location'},
            			{field:'User.Fullname',displayName: 'By User'}
            		]	
            };

            $scope.openImportWindow = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/upload-modal.html',
					controller: 'ModalCtrl'
					//resolve: { files: function() { return $scope.files; } }
				});

			};

			$scope.openDataEntry = function (p) { $location.path("/dataentry/"+$scope.dataset.Id);	};
			
    }]);




	mod.controller('DataEntryCtrl', ['$scope','$routeParams','Dataset','$modal',
		function($scope, $routeParams, Dataset, $modal){
			$scope.Id = $routeParams.Id;
            $scope.dataset = Dataset.get({ id: $routeParams.Id });
            $scope.templateUrl = function(name){
            	name="Dynamic"; //this we need to work on -------------------------------- TODO
            	return 'partials/dataentry/'+name.replace(/\s/g,"")+'.html';
            };

			$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.colDefs = [];
            $scope.gridrows = [];
            $scope.row = {}; //header fields are bound to here.

            //setup a listener to populate column headers on the grid
			$scope.$watch('dataset.Fields', function() { 
				angular.forEach($scope.dataset.Fields, function(field){
					if(field.FieldRoleId == 1)
					{
						$scope.headerFields.push(field);
					}
					else
					{
						$scope.detailFields.push(field);
						var displayName = field.Label;

						//include units in the label
						if(field.Field.Units)
							displayName += " (" + field.Field.Units+")";
	    				$scope.colDefs.push({ field: field.DbColumnName, displayName: displayName, minWidth: 50, maxWidth: 180  });
					}
	    		});

	    	});

    		$scope.gridOptions = { 
    			data: 'gridrows', 
    			columnDefs: 'colDefs',
    			enableColumnResize: true, 
    		};

    		$scope.addGridRow = function(row)
    		{
    			$scope.gridrows.push(row);
    		},

    		$scope.openDataEntryModal = function() {
    			var modalInstance = $modal.open({
					templateUrl: 'partials/dataentry-modal.html',
					controller: 'ModalDataEntryCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});

			};

		}
	]);

	
	mod.controller('ModalDataEntryCtrl', ['$scope', '$modalInstance', 
		function($scope, $modalInstance){
			//DRY alert -- this was copy and pasted... how can we fixy?
			$scope.alerts = [];

			$scope.ok = function(){
				try{
					$scope.addGridRow($scope.row);
					$scope.row = {};
					$scope.alerts.push({type: 'success',msg: 'Added.'});
				}catch(e){
					console.dir(e);
				}
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};

			$scope.closeAlert = function(index) {
			    $scope.alerts.splice(index, 1);
			};

			$scope.row = {}; //modal fields are bound here

			$scope.dateOptions = {
			    'year-format': "'yy'",
			    'starting-day': 1
			};


		}
		]);

	mod.controller('ModalCtrl', ['$scope','$modalInstance',
		function($scope, $modalInstance){
			//TODO: abstract this into a class we can extend/service we can call?
			$scope.alerts = [];

			$scope.ok = function(){
				//$modalInstance.close('close');
				$scope.alerts.push({type: 'success',msg: 'Uploaded '+ $scope.file.name +'...'});
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};

			$scope.closeAlert = function(index) {
			    $scope.alerts.splice(index, 1);
			};

			$scope.file = {name: ""};

			$scope.onFileSelect = function($files) {
			    //$files: an array of files selected, each file has name, size, and type.
			    for (var i = 0; i < $files.length; i++) {
			      var file = $files[i];
			      if(file && file.type != 'csv')
			      {
			      	$scope.alerts.push({type: 'error', msg: 'Snap! Only CSV files can be accepted for upload.  You tried a "' 
			      		+ file.type + '" file.  Please try again or contact support.'});
			      }

			      $scope.file = file;
			      console.dir(file);
			  	}
			};

		}
	]);

mod.controller('ImportModalCtrl', ['$scope','$upload', 
    	function($scope, $upload){
	    	$scope.onFileSelect = function($files) {
			    //$files: an array of files selected, each file has name, size, and type.
			    for (var i = 0; i < $files.length; i++) {
			      var file = $files[i];
			      
			      $scope.upload = $upload.upload({
			        url: 'server/upload/url', //upload.php script, node.js route, or servlet url
			        // method: POST or PUT,
			        // headers: {'headerKey': 'headerValue'}, withCredential: true,
			        data: {myObj: $scope.myModelObj},
			        file: file,
			        // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
			        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
			        //fileFormDataName: myFile,
			        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
			        //formDataAppender: function(formData, key, val){} 
			      }).progress(function(evt) {
			        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
			      }).success(function(data, status, headers, config) {
			        // file is uploaded successfully
			        console.log(data);
			      });
			      //.error(...)
			      //.then(success, error, progress); 
			    }
			};
		}

    ]);


 mod.controller('DatasetGridCtrl', ['$scope','$routeParams','Data',
    	function($scope, $routeParams, Data) {
    		$scope.Id = $routeParams.Id;
    		$scope.grid = Data.query({id: $routeParams.Id });
    		$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.colDefs = [];

    		//setup a listener to populate column headers on the grid
			$scope.$watch('grid.Dataset', function() { 
				angular.forEach($scope.grid.Dataset.Fields, function(field){
					if(field.FieldRoleId == FIELD_ROLE_HEADER)
					{
						$scope.headerFields.push(field);
					}
					else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
					{
						$scope.detailFields.push(field);
						var displayName = field.Label;

						//include units in the label
						if(field.Field.Units)
							displayName += " (" + field.Field.Units+")";
	    				$scope.colDefs.push({ field: field.DbColumnName, displayName: displayName, minWidth: 50, maxWidth: 180  });
					}
	    		});

	    	});

    		$scope.gridOptions = { 
    			data: 'grid.Details', 
    			columnDefs: 'colDefs',
    			enableColumnResize: true, 
    			enableSorting: true, 
    			enableCellSelection: false,
    			showFilter: true,
    			showColumnMenu: true
    		};
    }]);
