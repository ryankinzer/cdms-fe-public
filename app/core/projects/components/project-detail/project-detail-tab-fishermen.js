//this is a nested controller used on the project-details page to load
// the fishermen tab if it is a harvest/creel project. 

var tab_fishermen = ['$scope', '$timeout', '$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, $timeout, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {

        //console.log("Inside tab fishermen controller...");
        
        scope.fishermanList = null;
        scope.theFishermen = null;

        //fisherman-tab-grid

        var FirstNameRenderer = function (param)
        {
            return (param.data.Aka) ? param.data.FirstName + ' (' + param.data.Aka + ')' : param.data.FirstName;
        }

        var DateAddedRenderer = function (param) {
            return moment(param.data.DateAdded).format('L');
        };

        var StatusIdRenderer = function (param) {
            var str_status = ConvertStatus.convertStatus(param.data.StatusId);
            //return (param.data.StatusId === 1) ? str_status + '(' + param.data.DateInactive + ')' : str_status; //include the dateinactive if inactive
            // well, it looks like the dateinactive isn't being set so it is null... guess we can use that later; now we'll just return the status
            return str_status;
        };

        var OkToCallRenderer = function (param) {
            return ConvertStatus.convertOkToCall(param.data.OkToCallId);
        };

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.editFisherman(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeFisherman(param.data);
            });
            div.appendChild(delBtn);

            return div;
        };

        ///////////////fishermen grid
        scope.fishGridOptions = {

            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed!");
                scope.fishGridOptions.selectedItems = scope.fishGridOptions.api.getSelectedRows();
                //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            onFilterModified: function () {
                scope.fishGridOptions.api.deselectAll();
            },
            selectedItems: [],
            columnDefs:
            [
                { colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 80, menuTabs: [], hide: true },
                { field: 'FirstName', cellRenderer: FirstNameRenderer, headerName: 'First Name', width: 100, sort: 'asc', menuTabs: ['filterMenuTab'], filter: 'text' },
                //{ field: 'Aka', headerName: 'Aka', width: 120, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'LastName', headerName: 'Last Name', width: 120, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'FullName', headerName: 'Full Name', width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'PhoneNumber', headerName: 'Phone', width: 100, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'OkToCallId', headerName: 'Ok To Call', width: 80, menuTabs: ['filterMenuTab'], valueGetter: OkToCallRenderer },
                { field: 'FishermanComments', headerName: 'Comments', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'DateAdded', headerName: 'Date Added', width: 100, cellRenderer: DateAddedRenderer, menuTabs: [], },
                { field: 'StatusId', headerName: 'Status', width: 100, menuTabs: ['filterMenuTab'], valueGetter: StatusIdRenderer},
                //{ field: 'DateInactive', headerName: 'Date Inactive', menuTabs: [], },
                //{ field: 'OwningDepartment.Name', headerName: 'Owner', width: 250, menuTabs: ['filterMenuTab'], },


            ]
        };


        //watch the datasets on the parent-detail page to load... once they do, check to see if we should show our tab
        var f_ds_watcher = scope.$parent.$watch('project', function () {

            if (typeof scope.project === 'undefined' || typeof scope.project.Id === 'undefined')
                return;

            f_ds_watcher(); //turn off the watcher.

            if (scope.isHarvestProject(scope.project)) {
                console.log("Adding Fishermen to tab bar because we are a Harvest project...");
                scope.ShowFishermen = true;
                //scope.fishermenList = ProjectService.getFishermen(); // All fishermen, but only CreelSurvey has fishermen.//
                //scope.theFishermen = ProjectService.getProjectFishermen(scope.project.Id);
                

                $timeout(function () {

                    var ag_grid_div = document.querySelector('#fisherman-tab-grid');    //get the container id...
                    scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.fishGridOptions); //bind the grid to it.
                    scope.fishGridOptions.api.showLoadingOverlay(); //show loading...

                    //build the grid based on our subprojects
                    scope.fishGridOptions.api.setRowData(scope.project.Fishermen);

                    //if user can edit, unhide the edit links
                    if (scope.canEdit(scope.project))
                        scope.fishGridOptions.columnApi.setColumnVisible("EditLinks", true);

                }, 0);

            }
        }, true);


        scope.removeFisherman = function (a_fisherman) {
            console.log("alrighty, remove this fisherman!");
            console.dir(a_fisherman);
            if (!a_fisherman)
                return;

            if (!confirm("Are you sure you want to remove this fisherman from this project?"))
                return;

            var promise = ProjectService.removeProjectFisherman(scope.project.Id, a_fisherman.Id);

            promise.$promise.then(function () {
                scope.project.Fishermen.forEach(function (item, index) {
                    if (item.Id === a_fisherman.Id) {
                        scope.project.Fishermen.splice(index, 1);
                        scope.fishGridOptions.api.setRowData(scope.project.Fishermen);
                    }
                });
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

        scope.editFisherman = function (a_fisherman) {
            scope.viewFisherman = a_fisherman;

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
                controller: 'ModalCreateFishermanCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        scope.postSaveFishermanUpdateGrid = function (the_promise) {
            var updated = false;
            scope.project.Fishermen.forEach(function (item, index) {
                if (item.Id === the_promise.Id) {
                    updated = true;

                    //console.log("ok we found a match! -- updating! before:");
                    //console.dir(scope.subprojectList[index]);

                    angular.extend(scope.project.Fishermen[index], the_promise); //replace the data for that item
                    //console.log("ok we found a match! -- updating! after:");
                    scope.fishGridOptions.api.redrawRows();
                    console.log("done reloading grid after editing a fisherman.");
                }
            });
            if (updated === false) //if we get all done and we never found it, lets add it to the end.
            {
                //console.log("ok we found never a match! -- adding!");
                scope.project.Fishermen.push(the_promise); //add that item
                scope.fishGridOptions.api.setRowData([]);
                scope.fishGridOptions.api.setRowData(scope.project.Fishermen);

                console.log("done reloading grid after adding a fisherman.");
            }

            console.log("updated the list and the grid... now refreshing ");

        };

        //looks at the metadata setting to see if it is a harvest project
        scope.isHarvestProject = function (a_project) {
            return (a_project.MetadataValue[METADATA_PROPERTY_SUBPROGRAM]) === "Harvest";
        }


}];

