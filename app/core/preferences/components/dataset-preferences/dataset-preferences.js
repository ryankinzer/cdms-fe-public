
var dataset_preferences = ['$scope', '$rootScope', '$location', 'DatasetService','PreferencesService','$window',
    function ($scope, $rootScope, $location, DatasetService, PreferencesService, $window){

		//var mydatasets = getByName($rootScope.Profile.UserPreferences, 'Datasets');
		$scope.mydatasets = PreferencesService.getMyDatasets();
		$scope.favoriteDatasetStores = {};

		$scope.$watch('mydatasets',function(){
			if($scope.mydatasets.$resolved)
			{
				angular.forEach($scope.mydatasets, function(dataset, key){

		            //need to bump this since we are looking at a LIST of datasets...
	                DatasetService.configureDataset(dataset);    

					if(!$scope.favoriteDatasetStores[dataset.Datastore.Name])
						$scope.favoriteDatasetStores[dataset.Datastore.Name] = { Datastore: dataset.Datastore, favoriteDatasets: []};

					$scope.favoriteDatasetStores[dataset.Datastore.Name].favoriteDatasets.push(dataset);					
				});
			}
		},true);
		
		$scope.openReportWindow = function( target ){
			$window.open( REPORTSERVER_URL + target,'_blank');
		};

}];