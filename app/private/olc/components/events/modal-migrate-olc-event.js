
var modal_migrate_olc_event = ['$scope', '$rootScope', '$uibModalInstance', 'DatasetService', 'SubprojectService', 'ServiceUtilities',
    '$timeout', '$location', '$anchorScroll', '$document',
    function ($scope, $rootScope, $modalInstance, DatasetService, SubprojectService, ServiceUtilities,
        $timeout, $location, $anchorScroll, $document) {
        console.log("Inside modal_migrate_olc_event...");

        $showCloseButton = false;

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
        //console.dir($scope);

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
                //console.dir($scope.event_row);

				//throw "Stopping right here...";
				
                $scope.saveResults = {};
                //console.log("$scope is next...");
                //console.dir($scope);

                //console.dir(JSON.parse($scope.event_row.FileAttach));
                var strFileLinks = "";
                if ((typeof $scope.event_row.FileAttach !== 'undefined') && ($scope.event_row.FileAttach !== null)) {
                    var jParsedFiles = JSON.parse($scope.event_row.FileAttach);

                    strFileLinks = "";
                    var intCount = 0;
                    jParsedFiles.forEach(function (aFile) {

                        if (intCount === 0)
                            strFileLinks += aFile.Name;
                        else
                            strFileLinks += "," + aFile.Name;

                        intCount++;
                    });
                    console.log("aFile.Name string:  " + strFileLinks);
                }
                //throw "Stopping right here...";

                var promise = SubprojectService.migrateOlcEvent($scope.project.Id, $scope.subproject_row.Id, $scope.event_row, strFileLinks ,$scope.saveResults);

				if (typeof promise !== 'undefined') {
					promise.$promise.then(function () {
						//window.location.reload();
						console.log("promise is next...");
						console.dir(promise);
						//$scope.subprojectId = $rootScope.subprojectId = promise.Id;
						//console.log("$scope.subprojectId = " + $scope.subprojectId);

                        //if ($scope.event_row.Id === 0) //we saved a new one!
                        //    $scope.postAddOlcEventUpdateGrid(promise.OlcEvent);
                        //else //we edited one!
                        //    $scope.postEditOlcEventUpdateGrid(promise.OlcEvent);

                        $scope.subprojectList = SubprojectService.getOlcSubprojects();
                        $scope.subprojectList.$promise.then(function () {
                            $scope.olcAgGridOptions.api.setRowData($scope.subprojectList);
                            $scope.refreshSubprojectLists();
                        });

                        $scope.postEditOlcEventUpdateGrid(promise.OlcEvent);
                        
                        $scope.showCloseButton = true;

					});
				}
			}
        };

        $scope.cancel = function () {

            $scope.subproject_row = 'undefined';

            $modalInstance.dismiss();
        };

        $scope.close = function () {
            console.log("Inside $scope.close...");
            $modalInstance.dismiss();

            $scope.modalFile_closeParentItem();
        };
        
    }
];
