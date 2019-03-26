var leasing_home = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'LeasingService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, LeasingService) {
        console.log("Inside leasing controller...");

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        $scope.leases = LeasingService.getAllLeases();

        $scope.searchResults = [];
        $scope.searchComplete = false;
        $scope.clickselect = "allotments";

        $scope.leases.$promise.then(function () {
            //show all the leased properties on the map.

            if ($routeParams.allotment != null) {
                $scope.searchTerm = $routeParams.allotment;
                $scope.searchButton();
                //$scope.findOnMap($routeParams.allotment);
            }

            console.dir("leases loaded " + $scope.leases.length);


            if (!$scope.searchGridDiv) {
                $scope.searchGridDiv = document.querySelector("#search-leases-grid");
                new agGrid.Grid($scope.searchGridDiv, $scope.searchGrid);
            }
            
        });

        var SearchLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'View';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.viewLease(param.data.Id);
            });
            div.appendChild(editBtn);

            return div;
        };

        var searchColumnDefs = [
            { colId: 'ViewLink', width: 80, cellRenderer: SearchLinksTemplate, menuTabs: [] },
            { headerName: "Lease Id", field: "LeaseNumber", width: 150, filter: 'text' },            
            { headerName: "Allotment", field: "AllotmentName", width: 150, filter: 'text' },
            { headerName: "Type", field: "LeaseType", width: 150, filter: true },
            { headerName: "FSA Tract #", field: "FSATractNumber", width: 150, filter: 'text' },
            { headerName: "FSA Farm #", field: "FarmNumber", width: 150, filter: 'text' },
/*
            { headerName: "Field Layer Id", field: "LeaseFields", width: 150,
                valueGetter: function (params) {
                    console.dir(params.node.data);
                    return 8442;
                }
            },
*/
            
            {
                headerName: "Expires", field: "LeaseEnd", width: 150,
                valueGetter: function (params) { return moment(params.node.data.LeaseEnd) },
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.LeaseEnd);
                },
                filter: 'date'
            },
            
        ];

        $scope.searchGrid = {
            columnDefs: searchColumnDefs,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            rowSelection: 'single'
        }

        $scope.searchButton = function () {
            $scope.searchByString($scope.searchTerm);
        }


        $scope.searchByString = function (in_string) {
            console.log("search " + in_string);
            $scope.searchResults.length = 0;

            in_string = $scope.searchTerm = in_string.toUpperCase();

            $scope.leases.forEach( function (lease) {

                if (lease.AllotmentName && lease.AllotmentName.indexOf(in_string) !== -1 ||
                    lease.LeaseNumber && lease.LeaseNumber.indexOf(in_string) !== -1) {
                    //console.log("found one : "+lease.LeaseNumber);
                    $scope.searchResults.push(lease);
                }
                
            });

            $scope.searchGrid.api.setRowData($scope.searchResults);

            $scope.findOnMap($scope.searchTerm);

            $scope.searchComplete = true;
        }

        $scope.searchByFieldId = function (field_id) {  //TODO: not working
            console.log("search for field: " + field_id);
            $scope.searchResults.length = 0;
            $scope.searchTerm = "";

            var matching_leases = LeasingService.getLeasesByField(field_id);
            matching_leases.$promise.then(function () { 
                matching_leases.forEach(function (lease) { 
                    $scope.searchResults.push(lease);       
                });
                
            });
        };


        $scope.viewLease = function (id) {
            window.location = "index.html#!view-lease/" + id;
        };


        $scope.findOnMap = function (in_allotment) {
            console.log("finding on map " + in_allotment);

            $scope.map.queryMatchParcel(in_allotment, function (features) {
                if (features.length == 0) {
                    console.log("allotment not found: " + in_allotment);
                }
                else {
                    //that doesn't include geometry so we need to get it
                    $scope.map.querySelectParcel(null, features[0].attributes.OBJECTID, function (geo_features) {
                        $scope.map.addParcelToMap(geo_features[0]);
                        $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic, 2);
                    });
                    
                }
            });

        }

        // expose a method for handling clicks ON THE MAP - this is linked to from the Map.js directive
        $scope.click = function (e) {

            //alert("map is currently disabled");
            //return;

            console.log("Click!");

            $scope.isLeaseSelected = true;
            $scope.hasResults = true;

            $scope.map.loading = true;
            //$scope.clearAll();
            $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

            var selector = 'querySelectParcel';
            if ($scope.clickselect == 'fields')
                selector = 'querySelectField';

            $scope.map[selector](e.mapPoint, null, function (features) {
                if (features.length == 0) {
                    alert('No '+$scope.clickselect+' found at that location.');
                    $scope.map.loading = false;
                    $scope.$apply(); //bump angular
                    return;
                };

                $scope.map.addParcelToMap(features[0]);

                console.dir($scope.map.selectedFeature.attributes);

                var objectid = $scope.map.selectedFeature.attributes.OBJECTID; //fieldid or cadasterobjectid
                var allotment = ($scope.map.selectedFeature.attributes.Allotment) ? $scope.map.selectedFeature.attributes.Allotment : $scope.map.selectedFeature.attributes.PARCELID; //parcel = allotment / allotment = field

                $scope.searchTerm = allotment;

                if ($scope.clickselect == 'fields') {
                    $scope.searchByFieldId(objectid); 
                } else { 
                    $scope.searchByString(allotment);
                }
               
                $scope.map.loading = false;
                $scope.$apply(); //bump angular

            });
        };


    }];