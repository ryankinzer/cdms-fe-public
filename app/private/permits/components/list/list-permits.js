var list_permits = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        //$scope.currentPage = "Active";

        $scope.permits = PermitService.getAllPermits();

        $scope.permits.$promise.then(function () {
            $scope.permitsGridDiv = document.querySelector('#active-permits-grid');
            new agGrid.Grid($scope.permitsGridDiv, $scope.permitsGrid);
        });

        


        $scope.permitsGrid = {
            columnDefs: get,
            rowData: $scope.permits,
            rowSelection: 'multiple',
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }



}];