var leasing_home = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope','LeasingService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, LeasingService) {
        console.log("Inside leasing controller...");

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        $scope.leases = LeasingService.getAllLeases();

        $scope.searchResults = [];
        $scope.searchComplete = false;
        $scope.clickselect = "allotments" ;
               
        $scope.leases.$promise.then(function () {
            //show all the leased properties on the map.

            if ($routeParams.allotment != null) {
                $scope.searchTerm = $routeParams.allotment;
                $scope.searchButton();
                //$scope.findOnMap($routeParams.allotment);
            }

            console.dir("leases loaded " + $scope.leases.length);

        });

        $scope.searchButton = function () {
            $scope.searchByString($scope.searchTerm);
        }


        $scope.searchByString = function (in_string) {
            console.log("search " + in_string);
            $scope.searchResults.length = 0;

            in_string = in_string.toUpperCase();

            $scope.leases.forEach( function (lease) {

                if (lease.AllotmentName && lease.AllotmentName.indexOf(in_string) !== -1 ||
                    lease.LeaseNumber && lease.LeaseNumber.indexOf(in_string) !== -1) {
                    //console.log("found one : "+lease.LeaseNumber);
                    $scope.searchResults.push(lease);
                }
                
            });

            $scope.searchComplete = true;
        }

        $scope.searchByFieldId = function (field_id) { 
            console.log("search for field: " + field_id);
            $scope.searchResults.length = 0;

            var matching_lease = LeasingService.getLeaseByField(field_id);
            matching_lease.$promise.then(function () { 
                 $scope.searchResults.push(matching_lease);       
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

                //console.dir($scope.map.selectedFeature);

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