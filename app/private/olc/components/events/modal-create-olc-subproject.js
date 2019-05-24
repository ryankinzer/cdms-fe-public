
var modal_create_olc_subproject = ['$scope', '$rootScope', '$uibModalInstance', 'DatasetService', 'SubprojectService', 'ServiceUtilities',
    '$timeout', '$location', '$anchorScroll', '$document',
    function ($scope, $rootScope, $modalInstance, DatasetService, SubprojectService, ServiceUtilities,
        $timeout, $location, $anchorScroll, $document) {
        console.log("Inside ModalCreateOlcSubprojectCtrl...");

        initEdit();

        $scope.header_message = "Create new OLC project";
        $rootScope.olcCatalogNumber = $scope.olcCatalogNumber = "";
        $rootScope.projectId = $scope.project.Id;

        $scope.subproject_row = {
            StatusId: 0,
            //OwningDepartmentId: 1,
        };
		

        $scope.showAddDocument = true;

		console.log("$scope is next...");
		console.dir($scope);
		
        if ($scope.viewSubproject) {
            $scope.header_message = "Edit OLC project: " + $scope.viewSubproject.ProjectName;
			
			console.log("$scope.viewSubproject is next...");
			console.dir($scope.viewSubproject);
			
            $scope.subproject_row = angular.copy($scope.viewSubproject);
            console.log("$scope.subproject_row is next...");
            console.dir($scope.subproject_row);

            $scope.showAddDocument = false;

            var keepGoing = true;
            var foundIt = false;
			
        }

        console.log("$scope inside ModalCreateOlcSubprojectCtrl, after initializing, is next...");
        //console.dir($scope);

        $scope.save = function () {
            console.log("Inside ModalCreateOlcSubprojectCtrl, save...");
			//console.log("$scope.subproject_row is next...");
			//console.dir($scope.subproject_row);
			
            $scope.subprojectSave = undefined;
            $scope.subprojectSave = [];
            $scope.createNewSubproject = false;
			$scope.errorMessage = "";
            
            //console.dir($scope);

            if (!$scope.subprojectSave.error) {
                // Capture the AddDocument flag, before discarding it.
                console.log("$scope.subproject_row, full is next...");
                console.dir($scope.subproject_row);

                //var addDocument = $scope.subproject_row.AddDocument;
                //$scope.subproject_row.AddDocument = null;
                //console.log("addDocument = " + addDocument);
                //console.log("$scope.subproject_row, after del is next...");
                //console.dir($scope.subproject_row);

                var saveRow = angular.copy($scope.subproject_row);
                console.log("saveRow (after its creation) is next..");
                console.dir(saveRow);

                saveRow.olcEvents = undefined;
                console.log("saveRow (after deleting olcEvents) is next...");
                console.dir(saveRow);
				//throw "Stopping right here...";
				
                $scope.saveResults = {};
                //console.log("$scope is next...");
                //console.dir($scope);
                var promise = SubprojectService.saveOlcSubproject($scope.project.Id, saveRow, $scope.saveResults);

				if (typeof promise !== 'undefined') {
					promise.$promise.then(function () {
						//window.location.reload();
						console.log("promise is next...");
						console.dir(promise);
						$scope.subprojectId = $rootScope.subprojectId = promise.Id;
						console.log("$scope.subprojectId = " + $scope.subprojectId);
						
						$scope.subproject_row = 'undefined';
						$scope.olcCatalogNumber = saveRow.CatalogNumber;

						//$scope.reloadSubprojects();
						$scope.postSaveSubprojectUpdateGrid(promise);

                        /*
						if (addDocument === "Yes") {
							console.log("addDocument = Yes...");

							// If the user wishes to add a Correspondence Event right away, we must wait to get the ID of the new subproject, before we can continue.
							//$scope.reloadSubproject(promise.Id);
							//var promise2 = $scope.reloadSubproject(promise.Id);
							//console.log("Inside reloadSubproject...");
							//SubprojectService.clearSubproject();
							//$scope.reloadSubproject($scope.subprojectId);
							$modalInstance.dismiss();
							$scope.openCorrespondenceEventForm(promise, {});
							//$scope.subproject = SubprojectService.getSubproject(id);
						}
						else {
							console.log("addDocument != Yes");

							// If the user just wants to create the Subproject, we can continue without waiting.
							//$scope.reloadSubproject($scope.subprojectId);
							$modalInstance.dismiss();
                        }
                        */
                        $modalInstance.dismiss();
					});
				}
			}
        };

        $scope.cancel = function () {
            // If the user clicks on Cancel, we need to grab the contents of the Other... boxes and put it back into the main box.

            // County Name:  If the user selected Other, we must use the name they supplied in OtherCounty.
            //if ($scope.subproject_row.OtherCounty) {
            //    $scope.subproject_row.County = $scope.subproject_row.OtherCounty;
            //    $scope.subproject_row.OtherCounty = null; // Throw this away, because we do not want to save it; no database field or it.
            //}
            $scope.subproject_row = 'undefined';

            $modalInstance.dismiss();
        };
    }
];
