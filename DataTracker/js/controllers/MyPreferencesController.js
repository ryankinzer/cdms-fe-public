//my datasets + projects

'use strict';

var mod_mydata = angular.module('MyPreferencesControllers', ['ui.bootstrap']);

mod_mydata.controller('MyPreferencesCtrl', ['$scope', 'DataService','DatastoreService','ServiceUtilities','ConvertStatus',
	function($scope, DataService, DatastoreService, ServiceUtilities, ConvertStatus){
		console.log("Inside MyPreferencesCtrl...");
		//console.log("$scope is next");
		//console.dir($scope);

		$scope.savePreferences = function()
		{
			console.log("Inside savePreferences...");
			
			$scope.User = {
				Id: $scope.Profile.Id,
				Username: $scope.Profile.Username,
				Description: $scope.Profile.Description,
				DepartmentId: $scope.Profile.DepartmentId,
				Fullname: $scope.Profile.Fullname
			}
			console.log("$scope.preferencesUpdate is next...");
			console.dir($scope.preferencesUpdate);
			
			$scope.savePreferencesResults = [];
			console.log ("$scope.savePreferencesResults = " + $scope.savePreferencesResults);
			
			DataService.saveUserInfo($scope.User, $scope);
		};		
		
		$scope.cancel = function(){
			window.location = "index.html";
		};
		
		$scope.$watch('savePreferencesResults.success', function(){
			/* We will check if savePreferencesResults.success exists.  
			If it does, it will always = true.
			If the save failed, then savePreferencesResults.failed gets set.
			savePreferencesResults does not exist after the page loads; it gets declared/set after the user clicks the Save button.
			*/
    		if ((typeof $scope.savePreferencesResults !== 'undefined') && ($scope.savePreferencesResults !== null)) {	
				console.log("Inside MyPreferencesControllers, savePreferencesResults.success watcher...");
				
				// OK.  We were successful, now we can go back to the index page.  Comment this line out, if we must keep the page for troubleshooting.
				window.location = "index.html";
			}
		});
	}
]);

mod_mydata.controller('MyDatasetsCtrl', ['$scope','$rootScope','$location','DataService','$window',
	function($scope, $rootScope,$location, DataService, $window){

		//var mydatasets = getByName($rootScope.Profile.UserPreferences, 'Datasets');
		$scope.mydatasets = DataService.getMyDatasets();
		$scope.favoriteDatasetStores = {};

		$scope.$watch('mydatasets',function(){
			if($scope.mydatasets.$resolved)
			{
				angular.forEach($scope.mydatasets, function(dataset, key){

		            //need to bump this since we are looking at a LIST of datasets...
	                DataService.configureDataset(dataset);    

					if(!$scope.favoriteDatasetStores[dataset.Datastore.Name])
						$scope.favoriteDatasetStores[dataset.Datastore.Name] = { Datastore: dataset.Datastore, favoriteDatasets: []};

					$scope.favoriteDatasetStores[dataset.Datastore.Name].favoriteDatasets.push(dataset);					


				});
			}
		},true);



		
		$scope.openReportWindow = function( target ){
			$window.open( REPORTSERVER_URL + target,'_blank');
		};

}]);


mod_mydata.controller('MyProjectsCtrl', ['$scope','$rootScope','$location','DataService','$window',
	function($scope, $rootScope,$location, DataService, $window){
		$scope.myprojects = DataService.getMyProjects();
}]);


