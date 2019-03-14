var lookup_lists = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'LeasingService',

    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, LeasingService) {

        $rootScope.inModule = "leasing";

        if (!$scope.Profile.hasRole("Leasing"))
            angular.rootScope.go("/unauthorized");

        $scope.lookup_lists = LeasingService.getLookupLists();

        $scope.selectLookupList = function (id) {
            $scope.lookup_lists.forEach(function (lookup_list) {
                if (lookup_list.Id == id) {
                    lookup_list.DisplayListValues = $scope.makeList(lookup_list.ListValues);
                    $scope.selectedLookup = lookup_list;
                }

            });
        }

        $scope.makeList = function (array_in) {
            var result = '';
            array_in.forEach(function (item) {
                result += item + "\n";
            })
                
            return result;
        }

        $scope.save = function () {

            //do some cleanup of the incoming data
            $scope.selectedLookup.DisplayListValues = $scope.selectedLookup.DisplayListValues.replace(/,|"/g, "");
            $scope.selectedLookup.ListValues = $scope.selectedLookup.DisplayListValues.trim().split('\n');
    
            for (i = 0; i < $scope.selectedLookup.ListValues.length; i++) {
                $scope.selectedLookup.ListValues[i] = $scope.selectedLookup.ListValues[i].trim();
            }

            $scope.selectedLookup.DisplayListValues = $scope.makeList($scope.selectedLookup.ListValues);
            $scope.selectedLookup.PossibleValues = JSON.stringify($scope.selectedLookup.ListValues);
            results = LeasingService.saveLookupList($scope.selectedLookup);
            
            /*
            results.$promise.then(function (the_result) {
                console.dir(the_result);
                console.dir(results);
            });
            */
        }



}];