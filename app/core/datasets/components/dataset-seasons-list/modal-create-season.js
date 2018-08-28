//controller for modal-create-season.html
// create/edit season

var modal_create_season = ['$scope', '$rootScope', '$modalInstance', '$modal', 'DatasetService','CommonService','SubprojectService', 'ServiceUtilities', 
	'$timeout', '$location', '$anchorScroll', '$document', '$upload', 
    function ($scope, $rootScope, $modalInstance, $modal, DatasetService, CommonService, SubprojectService, ServiceUtilities, 
        $timeout, $location, $anchorScroll, $document, $upload)
    {

	    console.log("Inside ModalCreateSeasonCtrl...");

        initEdit(); //prevent backspace

        $scope.header_message = "Create New Season";
        $rootScope.newSeason = $scope.newSeason = true;
        $scope.savingSeason = false;

        $scope.season_row = {
            StatusId: 0,
        };

        $scope.seasonId = 0;

        $scope.setSpecies = function () {
            console.log("Inside setSpecies...");

            console.log("$scope is next...");
            console.dir($scope);
            console.log("$scope.season_row.Species (before setting) is next...");
            console.dir($scope.season_row.Species);
            console.log("typeof $scope.season_row.Species = " + typeof $scope.season_row.Species)

            // When Species gets first set, from the options in dataset.Confg, the values are strings.
            // The select box gyrates on numbers, so we set the value to the proper index, and then
            // when modal appears, it has the correct value (string) showing in the Species box.
            for (var i = 0; i < $scope.speciesList.length; i++) {
                console.log("$scope.speciesList[" + i + "] = " + $scope.speciesList[i]);

                if ($scope.season_row.Species === $scope.speciesList[i]) {
                    $scope.season_row.Species = "" + i; // Note the string conversion ""
                }
            }
            console.log("$scope.season_row.Species (after setting) is next...");
            console.dir($scope.season_row.Species);
            console.log("typeof $scope.season_row.Species = " + typeof $scope.season_row.Species)

        };

	    //if we are editing, viewSubproject will be set. -- prepare scope for editing...
        if ($scope.viewSeason) {
            console.log("We are editing an existing season...");
            console.log("$scope.viewSeason is next...");
            console.dir($scope.viewSeason);

            $scope.header_message = "Edit Season: " + $scope.viewSeason.Species + " " + $scope.viewSeason.Season;
            $rootScope.newSeason = $scope.newSeason = false;
            $scope.seasonsList = $rootScope.seasonsList;

            $scope.season_row = angular.copy($scope.viewSeason);
            //$scope.seasonId = $scope.season_row.Id;
            $scope.seasonId = $scope.viewSeason.Id;

            $scope.setSpecies();
        }
        else {
            //$scope.viewSeason either does not exist or is null, so we are creating a new season.
            console.log("We are creating a new season...");
        }
	
        console.log("Inside ModalCreateSeasonCtrl, after initializing");
        console.log("$scope is next...");
        console.dir($scope);
        console.log("$scope.season_row (after initialization) is next...");
        console.dir($scope.season_row);


        $scope.saveFilesAndParent = function () {

            var saveRow = angular.copy($scope.season_row);
            console.log("saveRow is next..");
            console.dir(saveRow);

            //if we are saving a new project...
            if ($scope.seasonId === 0) {
                console.log("saveFielsAndParent -- we are creating a new one before we save so that we have the seasonId...");

                var save_season_promise = SeasonService.saveSeason(parseInt($scope.dataset.Id), saveRow, $scope.saveResults);
                save_season_promise.$promise.then(function () {
                    console.log("Back from save_season_promise!");
                    console.log(save_season_promise);

                    $scope.seasonId = save_season_promise.Id;
                    $scope.season_row.Id = save_season_promise.Id;
                    //$scope.saveFilesAndParent(); //call ourselves again now that our ID is set.
                    $scope.finishAndClose(); //call ourselves again now that our ID is set.
                }, function (error) {
                    console.error("something went wrong: ", error);
                });
                return;
            }
            else {
                console.log("We are working with an existing season...");
                promise = SeasonService.saveSeason(parseInt($scope.dataset.Id), saveRow, $scope.saveResults);
                $scope.finishAndClose(promise, saveRow);
            }

            //if we are editing a season, we carry on from here...
            var data = {
                DatasetId: $scope.dataset.Id
            };

        }

        $scope.finishAndClose = function (promise, saveRow) {
            if (typeof promise !== 'undefined') {
                promise.$promise.then(function () {

                    console.log("and here is our final new edited season_edited:");
                    $scope.season_edited = promise;
                    console.dir($scope.season_edited);


                    console.log("and if we do the extends thing:")
                    var extended = angular.extend({}, saveRow, promise); //empty + saveRow + promise -- in that order
                    console.dir(extended);

                    $scope.postSaveSeasonUpdateGrid($scope.season_edited);

                }, function (error) {
                    console.error("something went wrong: ", error);
                }); //promise/then - after saving season
            } else {
                console.log("finish and close called without a promise. :( -----------------");
            }
        };
	

        //kick off saving the project.
        //  if there is a location, saves it
        //  then hands off to saveFilesAndParent
        $scope.save = function(){
            console.log("Inside ModalCreateSeasonCtrl, save...");
		    $scope.seasonSave = undefined;
            $scope.seasonSave = [];
            $scope.seasonSave.error = false;
            $scope.seasonSave.errorMessage = "";
		    $scope.savingSeason = false;
            $scope.createNewSeason = false;

            console.log("$scope is next...");
            console.dir($scope);

            $scope.seasonSave.errorMessage = "";
            if ((typeof $scope.season_row.Species === 'undefined') || ($scope.subproject_row.Species === null))
		    {
			    console.log("Species is empty...");
			    $scope.seasonSave.error = true;
                $scope.seasonSave.errorMessage += "Species cannot be blank!  ";
            }

            if ((typeof $scope.season_row.Season === 'undefined') || ($scope.subproject_row.Season === null)) {
                console.log("Season is empty...");
                $scope.seasonSave.error = true;
                $scope.seasonSave.errorMessage += "Season cannot be blank!  ";
            }
		
            if ((typeof $scope.season_row.OpenDate === 'undefined') || (typeof $scope.season_row.CloseDate === 'undefined'))
		    {
			    console.log("Open or Close Date is blank...");
			    $scope.seasonSave.error = true;
                $scope.seasonSave.errorMessage += "Open and Close Dates cannot be blank!  ";
		    }
		
            if ($scope.seasonSave.error)
                return;


		    console.log("$scope.season_row, full is next...");
		    console.dir($scope.season_row);
			
			
		    /********* A note about time start ***********/
		    /* 	When we save the subproject, when the backend converts the ProjectStartDate and ProjectEndDate to UTC (adds 8 hours).
			    So, with an initial saved time of 0000, the backend converts it to 0800.
			    Each time we save then, the time will have 8 hours added to it.  On the 4th save, it will go into the next day.
			    To avoid this, we take the saved date (now 0800), and set it back to 0000.
			    This will keep the time in the same spot (keep it from changing).
			    There may be a better way to handle this issue, but this technique works too...
		    */
			
            if ($scope.season_row.OpenDate)
		    {
                var soDate = new Date(Date.parse($scope.season_row.OpenDate));
                $scope.season_row.OpenDate = setDateTo0000(soDate);
		    }
			
            if ($scope.season_row.EndDate)
		    {
                var scDate = new Date(Date.parse($scope.season_row.EndDate));
                $scope.season_row.EndDate = setDateTo0000(scDate);
		    }
		    /********* A note about time end ***********/		
			
		    $scope.saveResults = {};
		    //console.log("$scope is next...");
		    //console.dir($scope);
			
		    // First, a little cleanup.
		    $scope.seasonSave.error = false;
            $scope.seasonSave.errorMessage = "";
			
		    var seasonId = 0;
		    // Are we creating a new season, or editing an existing one?
		    if ($scope.viewSeason)
		    {
			    console.log("We are editing an existing season...");
			    seasonId = $scope.viewSeason.Id
				
			    //ok -- everything is set to save; we are editing a subproject don't have a new location to save; hand off to next step.
                $scope.saveFilesAndParent();
		    }
		    else
		    {
                seasonId = $scope.seasonId;
				
			    //$scope.viewSeason either does not exist or is null, so we are creating a new season.
			
		    }
		
        };

        $scope.modalFile_saveParentItem = function (saveRow) {

            var promise;

            //we are always here with a subproject id.

            //ok once this is done we can save our hab sub project
            promise = SeasonService.saveSeason(parseInt($scope.dataset.Id), saveRow, $scope.saveResults);

        };

        $scope.finishAndClose = function (promise, saveRow) {
            if (typeof promise !== 'undefined') {
                promise.$promise.then(function () {

                    //i guess we overwrite the json we get back with the objects from our saveRow...
                    promise.Collaborators = saveRow.Collaborators;
                    promise.Funding = saveRow.Funding;

                    console.log("and here is our final new edited subproject_edited:");
                    $scope.subproject_edited = promise;
                    console.dir($scope.subproject_edited);


                    console.log("and if we do the extends thing:")
                    var extended = angular.extend({}, saveRow, promise); //empty + saveRow + promise -- in that order
                    console.dir(extended);

                    $scope.postSaveHabitatSubprojectUpdateGrid($scope.subproject_edited);

                    console.log("1 typeof $scope.errors = " + typeof $scope.errors + ", $scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
                    if ($scope.fileCount === 0) {
                        $scope.loading = false; // Stop the fish spinner.
                        $scope.showCloseButton = true;
                        $scope.showCancelButton = false;
                        $scope.showFormItems = false;
                    }

                    if ($scope.filesWithErrors == 0)
                        $scope.UploadUserMessage = "All actions successful.";
                    else
                        $scope.UploadUserMessage = "There was a problem uploading a file.  Please try again or contact the Helpdesk if this issue continues.";

                }, function (error) {
                    console.error("something went wrong: ", error);
                }); //promise/then - after saving habitat subproject
            } else {
                console.log("finish and close called without a promise. :( -----------------");
            }
        };


        $scope.close = function () {
            console.log("Inside $scope.close...");
            $modalInstance.dismiss();
        };

        $scope.save = function () {
            console.log("Inside $scope.save...");

            console.log("$scope is next...");
            console.dir($scope);
            console.log("$scope.season_row.Species (before resetting) is next...");
            console.dir($scope.season_row.Species);
            console.log("typeof $scope.season_row.Species = " + typeof $scope.season_row.Species)

            // To display the existing value, we had to set Species to its index value first.
            // The select box gyrates on numbers, so we set the value to the proper index.
            // To save, we must switch the value back, from the index, to its proper string value.
            for (var i = 0; i < $scope.speciesList.length; i++) {
                console.log("$scope.speciesList[" + i + "] = " + $scope.speciesList[i]);

                if ($scope.season_row.Species === i.toString()) {
                    $scope.season_row.Species = $scope.speciesList[i];
                }
            }
            console.log("$scope.season_row.Species (after resetting) is next...");
            console.dir($scope.season_row.Species);
        };

        $scope.cancel = function () {
            console.log("Inside $scope.cancel...");
            $modalInstance.dismiss();
        };

        $scope.selectSpecies = function () {
            console.log("Inside selectSpecies...");

            console.log("$scope.season_row.Species is next...");
            console.dir($scope.season_row.Species);
        };
    }
];
