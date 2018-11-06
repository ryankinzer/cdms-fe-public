/*
*   This lets you edit possiblevalues for select/multiselct fields in your dataset... 
*/

var project_lookups = ['$scope', '$routeParams','GridService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, GridService, ProjectService, DatasetService, CommonService, UserService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		//console.log("Inside controllers.js, projectDatasetsController...");
		//console.log("routeParams.Id = " + routeParams.Id);

        scope.OnTab = "Lookups";
        scope.AuthorizedToViewProject = true;
		
		scope.lookupTables = CommonService.getProjectLookupTables(routeParams.Id);
        scope.project = ProjectService.getProject(routeParams.Id);

        scope.selectedDataset = null;
        scope.selectedLookup = null;

		

        

/*
		//once the datasets load, make sure each is configured with our scope.
        scope.datasets.$promise.then(function () {
         	if ((scope.datasets) && (scope.datasets.length > 0)) {
				for (var i = 0; i < scope.datasets.length; i++)	{
					DatasetService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
				}
			} else {
				console.warn("This project has no datasets.");
            }
        });
  */

        

    }

];






