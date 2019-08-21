﻿
var dataset_seasons_list = ['$scope', '$routeParams',
    'DatasetService', 'SubprojectService', 'ProjectService', 'CommonService', 'UserService',
    '$uibModal', '$location', '$window', '$rootScope',
    function ($scope, $routeParams,
        DatasetService, SubprojectService, ProjectService, CommonService, UserService,
        $modal, $location, $window, $rootScope) {

        console.log("Inside dataset-seasons-list.js...");
        console.log("$routeParams.Id = " + $routeParams.Id);
        console.log("$scope is next...");
        console.dir($scope);

        console.log("Time Start Loading = " + moment(Date.now()).format('HH:mm:ss'));

        $scope.dataset = DatasetService.getDataset($routeParams.Id);

        //$scope.seasons = null;
        $scope.seasonsList = null;
        $scope.speciesList = [];

        $scope.viewSeason = null; //what they've clicked to view season
        //$scope.selectedSeason = null; //what they've selected in the dropdown to add to the project

        var EditMasterLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.editSeason(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.removeSeason(param.data);
            });
            div.appendChild(delBtn);
            //div.appendChild(document.createTextNode("|"));

            /*var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Season';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openSeasonForm(param.data, {});
                //$scope.addSeason(param.data, {});
            });
            div.appendChild(addBtn);
            */

            return div;
        };

        $scope.$watch('dataset.Fields', function () {
            if (!$scope.dataset.Fields) return;

            console.log("Inside watch dataset.Fields...");
            if ($scope.dataset.Datastore.TablePrefix === "CreelSurvey") {
                $scope.seasonsList = DatasetService.getSeasons($routeParams.Id);

                $scope.speciesList = angular.copy($scope.dataset.Config.SeasonsPage.Species);
            }
        });

        var seasons_watcher = $scope.$watch('seasonsList.length', function () {
            if (($scope.seasonsList) && ($scope.seasonsList !== null)) {
                console.log("Inside dataset-seasons-list.js, seasons_watcher...");
                console.log("$scope is next...");
                console.dir($scope);

                if ($scope.agGridOptions === undefined) {
                    console.log("Inside dataset-seasons-list.js...");
                    console.log(" ----------- ok we are defining our grid...");

                    //define the cell renderer (template) for our "Project Name" column.
                    /*var agCellRendererProjectName = function (params) {
                        console.log("params.node.data is next...");
                        console.dir(params.node.data);
                        return '<div>' +
                            '<a title="' + params.node.data.Description
                            + '" href="#!/projects/' + params.node.data.Id + '">'
                            + params.node.data.Name + '</a>' +
                            '</div>';
                    };
                    */

                    var agColumnDefs = [
                        { colId: 'EditLinksMaster', width: 20, cellRenderer: EditMasterLinksTemplate, menuTabs: ['filterMenuTab'], hide: false },
                        { field: 'Species', headerName: 'Species', width: 50, menuTabs: ['filterMenuTab'] },
                        { field: 'Season', headerName: 'Season', width: 50, menuTabs: ['filterMenuTab'] },
                        {
                            field: 'OpenDate', headerName: 'Open Date', width: 60,
                            valueFormatter: function (params) {
                                if (params.node.data.OpenDate !== undefined && params.node.data.OpenDate !== null)
                                    return moment(params.node.data.OpenDate).format('L');
                            },
                            valueGetter: function (params) {
                                return (params.node.data.OpenDate) ? moment(params.node.data.OpenDate) : null
                            },
                            filter: 'date',
                            menuTabs: ['filterMenuTab'],

                        },
                        {
                            field: 'CloseDate', headerName: 'Close Date', width: 60,
                            valueFormatter: function (params) {
                                if (params.node.data.CloseDate !== undefined && params.node.data.CloseDate !== null)
                                    return moment(params.node.data.CloseDate).format('L');
                            },
                            valueGetter: function (params) {
                                return (params.node.data.CloseDate) ? moment(params.node.data.CloseDate) : null
                            },
                            filter: 'date',
                            menuTabs: ['filterMenuTab'],

                        },
                        { field: 'TotalDays', headerName: 'Total Days', width: 30, menuTabs: ['filterMenuTab'] },

                    ];

                    $scope.agGridOptions = {
                        animateRows: true,
                        //enableSorting: true,
                        //enableFilter: true,
                        //enableColResize: true,
                        showToolPanel: false,
                        columnDefs: agColumnDefs,
                        rowData: $scope.seasonsList,
                        debug: false,
                        onGridReady: function (params) {
                            params.api.sizeColumnsToFit();
                        },
                        defaultColDef: {
                            sortable: true,
                            resizable: true,
                        },
                    };

                    console.log("Inside dataset-seasons-list.js, number of seasons: " + $scope.seasonsList.length);

                    console.log("Inside dataset-seasons-list.js, starting ag-grid");
                    var ag_grid_div = document.querySelector('#seasons-list-grid');    //get the container id...
                    $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.agGridOptions); //bind the grid to it.

                    $scope.agGridOptions.api.showLoadingOverlay(); //show loading...


                } else {
                    //we didn't need to redefine but do need to redraw
                    console.log("Inside dataset-seasons-list.js...")
                    console.log("----- ok we have seasons and are defined -- setting new rowdata  ----");

                    console.log("setting number of seasons: " + $scope.seasonsList.length);
                    $scope.agGridOptions.api.setRowData($scope.seasonsList);
                    //$scope.agGridOptions.api.autoSizeColumns()

                    console.log('done');

                }

                if ($scope.seasonsList.length > 0)
                    seasons_watcher();
            }
        }, true);



        $scope.addSeason = function () {
            console.log("Inside addSeason...");
            console.log("$scope is next...");
            console.dir($scope);
            console.log("$scope.selectedSeason is next...");
            console.dir($scope.selectedSeason);

            if (!$scope.selectedSeason || $scope.selectedSeason === null || getMatchingByField($scope.seasonsList, $scope.selectedSeason, 'Id').length > 0)
                return;

            var theSeason = getMatchingByField($scope.seasonsList, $scope.selectedSeason, 'Id');

            var promise = DatasetService.saveSeason($scope.dataset.Id, theSeason[0]);

            //promise.$promise.then(function () {
            //    $scope.reloadProject();
            //});
        };

        $scope.createSeason = function (season) {
            //createSeason
            console.log("Inside createSeason...");

            //$rootScope.season = $scope.season = season; //set this var for the modal controller and file filter
            //$rootScope.seasonId = 0; //also for file filter. :/

            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-seasons-list/templates/modal-create-season.html',
                controller: 'ModalCreateSeasonCtrl',
                scope: $scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            });
        };

        $scope.editSeason = function (season) {

            console.log("Inside editSeason...");

            $rootScope.viewSeason = $scope.viewSeason = season; //set this var for the modal controller and file filter
            $rootScope.seasonId = season.Id; //also for file filter. :/

            console.log("$scope.viewSeason is next...");
            console.dir($scope.viewSeason);

            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-seasons-list/templates/modal-create-season.html',
                controller: 'ModalCreateSeasonCtrl',
                scope: $scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            });
        };

        $scope.removeSeason = function (a_season) {
            console.log("alrighty, remove this season!");
            console.dir(a_season);
            if (!a_season)
                return;

            if (!confirm("Are you sure you want to remove this season?"))
                return;

            var removeSeasonPromise = DatasetService.removeSeason($scope.dataset.ProjectId, $scope.dataset.Id, a_season.Id);

            removeSeasonPromise.$promise.then(function () {
                $scope.seasonsList.forEach(function (item, index) {
                    if (item.Id === a_season.Id) {
                        $scope.seasonsList.splice(index, 1);
                        $scope.agGridOptions.api.setRowData($scope.seasonsList);
                    }
                });
            });
        };

        //fired after a user saves a new or edited project.
        // we update the item in the main subproject array and then refresh the grid.
        $scope.postSaveSeasonUpdateGrid = function (promise) {
            
            //console.log("ok - we saved so update the grid...");
            var total = $scope.seasonsList.length;
            var count = 0;
            var updated = false;
            $scope.seasonsList.forEach(function (item, index) {
                if (item.Id === promise.Id) {
                    updated = true;

                    //console.log("ok we found a match! -- updating! before:");
                    //console.dir($scope.seasonsList[index]);

                    angular.extend($scope.seasonsList[index], promise); //replace the data for that item
                    //console.log("ok we found a match! -- updating! after:");
                    //console.dir($scope.seasonsList[index]);
                    $scope.agGridOptions.api.redrawRows();
                    //console.log("done reloading grid.");
                }
                count++;
                if (count == total && updated == false) //if we get all done and we never found it, lets add it to the end.
                {
                    //console.log("ok we found never a match! -- adding!");
                    $scope.seasonsList.push(promise); //add that item
                    $scope.agGridOptions.api.setRowData([]);
                    $scope.agGridOptions.api.setRowData($scope.seasonsList);

                    console.log("done reloading grid, after adding a season.");
                }
            });

        };

        // Don't think we need this anymore.
        $scope.refreshSeasonsList = function () {
            // Call the functions that will build the list of seasons -- as the data comes in.
            $scope.seasonsList = DatasetService.getSeasons($scope.dataset.Id);

        };
    }
];
