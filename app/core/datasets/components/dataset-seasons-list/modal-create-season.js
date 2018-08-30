/// <reference path="../../../all-modules.js" />
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

        // Initialization done.

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

            $scope.seasonSave = undefined;
            $scope.seasonSave = [];
            $scope.seasonSave.error = false;
            $scope.seasonSave.errorMessage = "";

            console.log("$scope is next...");
            console.dir($scope);

            $scope.seasonSave.errorMessage = "";
            if ((typeof $scope.season_row.Species === 'undefined') || ($scope.season_row.Species === null)) {
                console.log("Species is empty...");
                $scope.seasonSave.error = true;
                $scope.seasonSave.errorMessage += "Species cannot be blank!  ";
            }

            if ((typeof $scope.season_row.Season === 'undefined') || ($scope.season_row.Species === null)) {
                console.log("Season is empty...");
                $scope.seasonSave.error = true;
                $scope.seasonSave.errorMessage += "Season cannot be blank!  ";
            }

            if ((typeof $scope.season_row.OpenDate === 'undefined') || (typeof $scope.season_row.CloseDate === 'undefined')) {
                console.log("Open or Close Date is blank...");
                $scope.seasonSave.error = true;
                $scope.seasonSave.errorMessage += "Open and Close Dates cannot be blank!  ";
            }

            if ($scope.seasonSave.error)
                return;

            // Keep this down here, after the initial error checking; otherwise, it will blank the
            // Species box, after we do the following conversion.
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

            console.log("$scope.season_row, full is next...");
            console.dir($scope.season_row);


            /********* A note about OpenDate ***********/
		    /* 	When we save the season, when the backend converts the OpenDate and Close to UTC (adds 8 hours).
			    So, with an initial saved time of 0000, the backend converts it to 0800.
			    Each time we save then, the time will have 8 hours added to it.  On the 4th save, it will go into the next day.
			    To avoid this, we take the saved date (now 0800), and set it back to 0000.
			    This will keep the time in the same spot (keep it from changing).
			    There may be a better way to handle this issue, but this technique works too...
		    */

            if ((typeof $scope.season_row.Id === 'undefined') || ($scope.season_row.Id === null)) {
                $scope.season_row.Id = 0;
            }

            if (typeof $scope.season_row.OpenDate !== 'string') {
                $scope.season_row.OpenDate = setDateTo0000($scope.season_row.OpenDate);
                $scope.season_row.OpenDate = toExactISOString($scope.season_row.OpenDate);
            }

            if (typeof $scope.season_row.CloseDate !== 'string') {
                $scope.season_row.CloseDate = setDateTo0000($scope.season_row.CloseDate);
                $scope.season_row.CloseDate = toExactISOString($scope.season_row.CloseDate);
            }

            var promise = DatasetService.saveSeason($scope.dataset.ProjectId, parseInt($scope.dataset.Id), $scope.Profile.Username, $scope.season_row, $scope.saveResults);
            if (typeof promise !== 'undefined') {
                console.log("promise is next...");
                console.dir(promise);
                promise.$promise.then(function () {
                    $scope.postSaveSeasonUpdateGrid(promise);
                    $modalInstance.dismiss();
                });
            }
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

        $scope.calculateTotalDays = function () {
            if ((typeof $scope.season_row.OpenDate !== 'undefined') && ($scope.season_row.OpenDate !== null) &&
                (typeof $scope.season_row.CloseDate !== 'undefined') && ($scope.season_row.CloseDate !== null)
            ) {
                var soDate = null;
                if ($scope.season_row.OpenDate) {
                    soDate = new Date(Date.parse($scope.season_row.OpenDate));
                    $scope.season_row.OpenDate = setDateTo0000(soDate);
                }

                var scDate = null;
                if ($scope.season_row.CloseDate) {
                    scDate = new Date(Date.parse($scope.season_row.CloseDate));
                    $scope.season_row.CloseDate = setDateTo0000(scDate);
                }

                var intTotalDaysInMilliseconds = Math.abs(scDate - soDate);

                // The calculation:  Number millis / 1000 (to seconds) / 60 (to minutes) / 60 (to hours) / 24 (to days)
                var intTotalDaysInDays = intTotalDaysInMilliseconds / 1000 / 60 / 60 / 24;
                $scope.season_row.TotalDays = intTotalDaysInDays;
            }
        };
    }
];
