var permit_map = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.permits = PermitService.getAllPermits();

        $scope.searchResults = [];
        $scope.searchComplete = false;

        $scope.permits.$promise.then(function () {

            if (!$scope.searchGridDiv) {
                $scope.searchGridDiv = document.querySelector("#search-permits-grid");
                new agGrid.Grid($scope.searchGridDiv, $scope.searchGrid);
            }

            if ($routeParams.allotment != null) {
                $scope.searchTerm = $routeParams.allotment;
                $scope.searchButton();
                //$scope.findOnMap($routeParams.allotment);
            }


        });

        var SearchLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Open';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.viewPermit(param.data.Id);
            });
            div.appendChild(editBtn);

            return div;
        };

        var searchColumnDefs = [
            { colId: 'ViewLink', width: 60, cellRenderer: SearchLinksTemplate, menuTabs: [] },
            { headerName: "Permit", field: "PermitNumber", width: 130, filter: 'text', sort: 'asc' },            
            {
                headerName: "Status", field: "PermitStatus", width: 200, filter: true
            },           
            
        ];

        $scope.searchGrid = {
            columnDefs: searchColumnDefs,
            rowData: [],
            rowSelection: 'single',
            defaultColDef: {
                sortable: true,
                resizable: true,
                menuTabs: ['filterMenuTab']
            },
            onRowClicked: function (params) {
                $scope.selectedPermit = params.data;
                $scope.showRelatedParcels(params.data.Id);
            }
        }

        $scope.searchButton = function () {
            $scope.searchByString($scope.searchTerm);
        }


        $scope.searchByString = function (in_string) {
            console.log("search " + in_string);
            $scope.searchResults.length = 0;

            in_string = $scope.searchTerm = in_string.toUpperCase();

            $scope.permits.forEach( function (permit) {

                if (permit.PermitNumber && permit.PermitNumber.indexOf(in_string) !== -1) {
                    $scope.searchResults.push(permit);
                }
                
            });
            $scope.searchDescription = "Permits matching " + in_string;
            $scope.searchGrid.api.setRowData($scope.searchResults);

            $scope.findOnMap($scope.searchTerm);

            $scope.searchComplete = true;
        }

        $scope.showRelatedParcels = function (id) { 
            $scope.PermitParcels = PermitService.getPermitParcels(id);
        };
        
        $scope.viewPermit = function (Id) {
            window.open("index.html#!/permits/list?Id=" + Id, "_blank");
        };


        $scope.findOnMap = function (in_allotment) {
            console.log("finding on map " + in_allotment);

            $scope.map.queryMatchParcel(in_allotment, function (features) {
                if (features.length == 0) {
                    console.log("parcel not found: " + in_allotment);
                }
                else {
                    //found the parcel but it doesn't include geometry so we need to get it
                    $scope.map.querySelectParcel(null, features[0].attributes.OBJECTID, function (geo_features) {
                        $scope.map.addParcelToMap(geo_features[0]);
                        $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic, 2);
                        $scope.findRelatedPermits(features[0].attributes.PARCELID);
                    });
                    
                }
            });

        }

        // expose a method for handling clicks ON THE MAP
        $scope.click = function (e) {

            console.log("Click!");

            $scope.isPermitSelected = true;
            $scope.hasResults = true;

            $scope.map.loading = true;
            //$scope.clearAll();
            $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

            var selector = 'querySelectParcel';

            $scope.map[selector](e.mapPoint, null, function (features) {
                if (features.length == 0) {
                    alert('No parcel found at that location.');
                    $scope.map.loading = false;
                    $scope.$apply(); //bump angular
                    return;
                };

                $scope.map.addParcelToMap(features[0]);

                console.dir($scope.map.selectedFeature.attributes);

                var objectid = $scope.map.selectedFeature.attributes.OBJECTID; 
                var allotment = $scope.map.selectedFeature.attributes.PARCELID; 

                $scope.findRelatedPermits(allotment);
                
                $scope.map.loading = false;
                $scope.$apply(); //bump angular

            });
        };


        $scope.findRelatedPermits = function (parcel) {

                $scope.searchTerm = parcel;
                $scope.searchDescription = "Related Permits to "+parcel;
                $scope.PermitParcels = [];

                var related_permits = PermitService.getPermitsByRelatedParcels(parcel);
                console.log("searching for permits related to " + parcel);
                related_permits.$promise.then(function () { 
                    console.log("found some! " + related_permits.length);
                    $scope.searchResults.length = 0;
                    related_permits.forEach( function (permit) {
                        $scope.searchResults.push(permit);
                    });

                    $scope.searchGrid.api.setRowData($scope.searchResults);
                });
        }

    }];