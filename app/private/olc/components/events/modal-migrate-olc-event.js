
var modal_migrate_olc_event = ['$scope', '$rootScope', '$uibModalInstance', 'DatasetService', 'SubprojectService', 'ServiceUtilities',
    '$timeout', '$location', '$anchorScroll', '$document',
    function ($scope, $rootScope, $modalInstance, DatasetService, SubprojectService, ServiceUtilities,
        $timeout, $location, $anchorScroll, $document) {
        console.log("Inside modal_migrate_olc_event...");

        initEdit();

        $scope.header_message = "Migrate Event";
        //$rootScope.olcCatalogNumber = $scope.olcCatalogNumber = "";
        $rootScope.projectId = $scope.project.Id;

        $scope.subproject_row = {
            StatusId: 0,
            //OwningDepartmentId: 1,
        };
		

        //$scope.showAddDocument = true;
        //$scope.showOtherFacilityHoused = false;

		console.log("$scope is next...");
		console.dir($scope);
		
        if ($scope.viewSubproject) {
            $scope.header_message = "Migrate Source Item";

			console.log("$scope.viewSubproject is next...");
			console.dir($scope.viewSubproject);
			
            $scope.subproject_row = angular.copy($scope.viewSubproject);

            console.log("$scope.subproject_row is next...");
            console.dir($scope.subproject_row);

            var keepGoing = true;
            var foundIt = false;
			
        }

        console.log("$scope inside modal_migrate_olc_event, after initializing, is next...");
        console.dir($scope);

        $scope.save = function () {
            console.log("Inside modal_migrate_olc_event, save...");
			//console.log("$scope.subproject_row is next...");
			//console.dir($scope.subproject_row);
			
            $scope.subprojectSave = undefined;
            $scope.subprojectSave = [];
            $scope.createNewSubproject = false;
			$scope.errorMessage = "";
            
            //console.dir($scope);

            if (!$scope.subprojectSave.error) {
                console.log("$scope.subproject_row, full is next...");
                console.dir($scope.subproject_row);
                console.dir($scope.event_row);

				//throw "Stopping right here...";
				
                $scope.saveResults = {};
                //console.log("$scope is next...");
                //console.dir($scope);
                var promise = SubprojectService.migrateOlcEvent($scope.project.Id, $scope.subproject_row.Id, $scope.event_row, $scope.saveResults);

				if (typeof promise !== 'undefined') {
					promise.$promise.then(function () {
						//window.location.reload();
						console.log("promise is next...");
						console.dir(promise);
						//$scope.subprojectId = $rootScope.subprojectId = promise.Id;
						//console.log("$scope.subprojectId = " + $scope.subprojectId);

						//$scope.reloadSubprojects();
						$scope.postSaveSubprojectUpdateGrid(promise);
                        
                        $modalInstance.dismiss();
					});
				}
			}
        };

        $scope.cancel = function () {

            $scope.subproject_row = 'undefined';

            $modalInstance.dismiss();
        };
        
    }
];
