//this is a nested controller used on the project-details page to load
// the fishermen tab if it is a harvest/creel project. 

var tab_fishermen = ['$scope', '$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {

        console.log("Inside tab fishermen controller...");
        
        scope.fishermanList = null;
        scope.theFishermen = null;

        //watch the datasets on the parent-detail page to load... once they do, check to see if we should show our tab
        var f_ds_watcher = scope.$parent.$watch('datasets', function () {
            console.log("Inside TAB FISHERMEN watch datasets... --------------------------");

            //console.log("parent datasets");
            //console.dir(scope.$parent.datasets);
            //console.log("our datasets");
            //console.dir(scope.datasets);

            if (scope.datasets === undefined || scope.datasets.length === 0)
                return;

            console.log("OK TAB FISHERMEN .  The datasets are loaded...");

            //scope.datasets = scope.$parent.datasets; //but i dont' want to do this.
            f_ds_watcher(); //turn off watcher

            for (var i = 0; i < scope.datasets.length; i++) { //look through the datasets for one of ours.

                console.log("Woohoo! are we creel?");
                console.dir(scope.project);

                if (scope.datasets[i].Datastore.TablePrefix === "CreelSurvey") {
                    console.log("Adding Fishermen to tab bar...");
                    scope.ShowFishermen = true;
                    scope.fishermenList = ProjectService.getFishermen(); // All fishermen, but only CreelSurvey has fishermen.//
                    scope.theFishermen = ProjectService.getProjectFishermen(scope.datasets[i].ProjectId);

                    // Note:  If we are on Harvest, it has only one dataset.
                    //scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;
                }
            }
        }, true);



        scope.$watch('fishermenList', function () {
            console.log("Inside watch, fishermenList");
            //if (typeof scope.fishermenList.$resolved === 'undefined')
            if (!scope.fishermenList) {
                console.log("scope.fishermenList has not loaded.");
                return;
            }
            else if (scope.fishermenList.length === 0) {
                console.log("No fishermen found yet...");
                return;
            }

            console.log("scope.fishermenList is next..");
            console.dir(scope.fishermenList);

            // If we switch the parameters for the makeObjects, like this makeObjects(scope.fishermenList, 'FullName', 'Id'), it will put them in alpha order by name.
            // However, we must test this first, to verify that it does not mess anything up. ~GC tested the idea; it needed more work.  It does not work in it simplicity here.
            scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects(scope.fishermenList, 'Id', 'FullName');

            // Debug output ... wanted to verify the contents of scope.fishermenOptions
            //angular.forEach(scope.fishermenOptions, function(fisherman){
            //	console.dir(fisherman);
            //});

            console.log("scope.fishermenOptions is next...");
            console.dir(scope.fishermenOptions);
        });	


        //when the parent project is loaded...
        scope.$parent.$watch('project.Id', function () {

            console.log("Parent project is loaded! watching from fishermen tab ---------------- >>>>>>>>>>>>>>");
            
            if ((typeof scope.viewFisherman !== 'undefined') && (scope.viewFisherman !== null)) {
                scope.viewFisherman = getMatchingByField(scope.project.Fishermen, scope.viewFisherman.Id, 'Id')[0];
                // The DateAdded is in UTC format and we need to display only YYYY-MM-DD format.
                // The value is a string, and JavaScript Date
                console.log("scope.viewFisherman is next...");
                console.dir(scope.viewFisherman);

                // If we just deleted a fisherman from the project, scope.viewFisherman will be null or undefined now, after the getMatchingByField function call above.
                // So we don't want to try accessing scope.viewFisherman.DateAdded at this time.
                if ((typeof scope.viewFisherman !== 'undefined') && (scope.viewFisherman !== null)) {
                    var strDate = scope.viewFisherman.DateAdded;
                    scope.viewFisherman.DateAdded = ServiceUtilities.extractDateFromString(strDate);

                    scope.viewFisherman.Status = ConvertStatus.convertStatus(scope.viewFisherman.StatusId);
                    console.log("scope.viewFisherman.Status = " + scope.viewFisherman.Status);

                    scope.viewFisherman.OkToCall = ConvertStatus.convertOkToCall(scope.viewFisherman.OkToCallId);
                    console.log("scope.viewFisherman.OkToCall = " + scope.viewFisherman.OkToCall);
                }
            }

        });


        scope.viewSelectedFisherman = function (fisherman) {
            console.log("Inside controllers.js, scope.viewSelectedFisherman");
            if (scope.viewFisherman)
                delete scope.viewFisherman;

            scope.viewFisherman = fisherman;
            //console.log("scope is next...");
            //console.dir(scope);			
            console.log("scope.viewFisherman is next...");
            console.dir(scope.viewFisherman);
            console.log("scope.viewFisherman.DateAdded = " + scope.viewFisherman.DateAdded);

            //var strInDate = scope.viewFisherman.DateAdded;
            //console.log("strInDate = " + strInDate);
            //scope.viewFisherman.DateAdded = ServiceUtilities.extractDateFromString(strInDate);
            //console.log("scope.viewFisherman.DateAdded = " + scope.viewFisherman.DateAdded);

            scope.viewFisherman.Status = ConvertStatus.convertStatus(scope.viewFisherman.StatusId);
            console.log("scope.viewFisherman.Status = " + scope.viewFisherman.Status)

            scope.viewFisherman.OkToCall = ConvertStatus.convertOkToCall(scope.viewFisherman.OkToCallId);
            console.log("scope.viewFisherman.OkToCall = " + scope.viewFisherman.OkToCall);
        };



        scope.removeViewFisherman = function () {
            //console.log("scope is next...");
            //console.dir(scope);
            if (!scope.viewFisherman)
                return;

            var promise = ProjectService.removeProjectFisherman(scope.project.Id, scope.viewFisherman.Id);

            promise.$promise.then(function () {
                scope.reloadProject();
            });
        };


        scope.addFisherman = function () {
            console.log("Inside controllers.addFisherman.");
            //console.log("scope is next...");
            //console.dir(scope);
            console.log("scope.selectedFisherman is next...");
            console.dir(scope.selectedFisherman);

            if (!scope.selectedFisherman || scope.selectedFisherman === null || getMatchingByField(scope.project.Fishermen, scope.selectedFisherman, 'Id').length > 0)
                return;

            var theFishermen = getMatchingByField(scope.fishermenList, scope.selectedFisherman, 'Id');

            var promise = ProjectService.saveProjectFisherman(scope.project.Id, theFishermen[0]);

            promise.$promise.then(function () {
                scope.reloadProject();
            });
        };


        scope.createFisherman = function () {
            scope.viewFisherman = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
                controller: 'ModalCreateFishermanCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };



        scope.editViewFisherman = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
                controller: 'ModalCreateFishermanCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };


}];

