//this is a nested controller used on the project-details page to load
// the instruments tab if it is a water temperature project. 

var tab_instruments = ['$scope', '$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
        console.log("Inside tab instruments controller...");

        //        console.log("I wonder what I have access to here?!");
        //        console.dir(scope);


        scope.allInstruments = null;
        scope.getDataGrade = function (check) { return getDataGrade(check) }; //alias from service ?? TODO: check this kb/11/21
        scope.viewInstrument = null; //what they've clicked to view accuracy checks
        scope.selectedInstrument = null; //what they've selected in the dropdown to add to the project

        //watch the datasets on the parent-detail page to load... once they do, check to see if we should show our tab
        var inst_ds_watcher = scope.$parent.$watch('datasets', function () {
            console.log("Inside TAB INSTRUMENTS watch datasets... --------------------------");

            //console.log("parent datasets");
            //console.dir(scope.$parent.datasets);
            //console.log("our datasets");
            //console.dir(scope.datasets);

            if (scope.datasets === undefined || scope.datasets.length === 0)
                return;

            console.log("OK TAB INSTRUMENTS .  The datasets are loaded...");

            //scope.datasets = scope.$parent.datasets; //but i dont' want to do this.

            inst_ds_watcher(); //turn off watcher

            for (var i = 0; i < scope.datasets.length; i++) { //look through the datasets for one of ours.

                console.log("Woohoo! are we water tempproject?");
                console.dir(scope.project);

                if (scope.datasets[i].Datastore.TablePrefix === "WaterTemp") {
                    console.log("Adding instruments to tab bar...");
                    scope.ShowInstruments = true;
                    ProjectService.getAllInstruments();
                }
            }
        }, true);

        //when the parent project is loaded...
        scope.$parent.$watch('project.Id', function () {

            console.log("Parent project is loaded! watching from instruments tab ---------------- >>>>>>>>>>>>>>");

            //reload if it is already selected -- this is what allows you to see the new accuracycheck/characteristic immediately after it is added
            if (scope.viewInstrument)
                scope.viewInstrument = getMatchingByField(scope.project.Instruments, scope.viewInstrument.Id, 'Id')[0];

            scope.project.Instruments = scope.project.Instruments.sort(orderByAlphaName);

        });

        scope.createInstrument = function () {
            scope.viewInstrument = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
                controller: 'ModalCreateInstrumentCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };


        scope.viewSelectedInstrument = function (instrument) {
            scope.viewInstrument = instrument;
        };

        scope.addInstrument = function () {
			/* Verify that all three situations are true:
			*  scope.selectedInstrument exists				This is important because IE will not actually select something, when you select it the first time.
			*  scope.selectedInstrument is not null			Important for the same reason just mentioned.
			*  The selected instrument is not already associated to the project.
			*/
            //if(!scope.selectedInstrument || getMatchingByField(scope.project.Instruments, scope.selectedInstrument, 'Id').length > 0)
            if (!scope.selectedInstrument || scope.selectedInstrument === null || getMatchingByField(scope.project.Instruments, scope.selectedInstrument, 'Id').length > 0)
                return;

            var Instruments = getMatchingByField(scope.allInstruments, scope.selectedInstrument, 'Id');

            var promise = ProjectService.saveProjectInstrument(scope.project.Id, Instruments[0]);

            promise.$promise.then(function () {
                scope.reloadProject();
            });
        };


        scope.removeViewInstrument = function () {
            if (!scope.viewInstrument)
                return;

            var promise = ProjectService.removeProjectInstrument(scope.project.Id, scope.viewInstrument.Id);

            promise.$promise.then(function () {
                scope.reloadProject();
            });
        };


        scope.editViewInstrument = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
                controller: 'ModalCreateInstrumentCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };



        scope.openAccuracyCheckForm = function (ac_row) {
            if (ac_row)
                scope.ac_row = ac_row;
            else
                scope.ac_row = {};

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-new-accuracycheck.html',
                controller: 'ModalAddAccuracyCheckCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

}];
