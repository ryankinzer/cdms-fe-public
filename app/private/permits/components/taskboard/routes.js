var permit_routes = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.permits = PermitService.getRoutingPermits();

        $scope.permitRoutesColDefs = [
            { headerName: "Main Reviewer", field: "ReviewedBy", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Permit #", field: "PermitNumber", menuTabs: ['filterMenuTab'], width: 150 , filter: 'text'},
{ headerName: "(Status)", field: "PermitStatus", menuTabs: ['filterMenuTab'], width: 150 , filter: 'text'}, //TODO: this is temporary, I think
            { headerName: "Project Name", field: "ProjectName",menuTabs: ['filterMenuTab'], width: 280, filter: 'text' },
            { headerName: "Planning", field: "RoutePlanning",menuTabs: ['filterMenuTab'], width: 100 },
            { headerName: "Plan", field: "RoutePlanReview", menuTabs: ['filterMenuTab'],width: 100 },
            { headerName: "WRP", field: "RouteWaterResources", menuTabs: ['filterMenuTab'],width: 100 },
            { headerName: "Env", field: "RouteEnvironmental", menuTabs: ['filterMenuTab'],width: 100 },
            { headerName: "PubWrks", field: "RoutePublicWorks", menuTabs: ['filterMenuTab'],width: 100 },
            { headerName: "TERO", field: "RouteTERO", menuTabs: ['filterMenuTab'],width: 100 },
            { headerName: "CRPP", field: "RouteCulturalResources", menuTabs: ['filterMenuTab'],width: 100 },
            { headerName: "Roads", field: "RouteRoadAccess", menuTabs: ['filterMenuTab'],width: 100 },
            { headerName: "Fee", field: "RouteFee", menuTabs: ['filterMenuTab'],width: 100 },
            { headerName: "Issued?", field: "IssuedBy", menuTabs: ['filterMenuTab'],width: 160, filter: true },
            { headerName: "Comments", field: "Comments", menuTabs: ['filterMenuTab'],width: 360 }
        ];


        $scope.permitRoutesGrid = {
            columnDefs: $scope.permitRoutesColDefs,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null ,
            components: {
                booleanEditor: BooleanEditor,
                booleanCellRenderer: BooleanCellRenderer,
            },
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
            onRowDoubleClicked: function (params) { 
                //$scope.openPermitPersonModal($scope.permitRoutesGrid.selectedItem.PermitPersonId);
            },
            onSelectionChanged: function (params) {
                $scope.permitRoutesGrid.selectedItem = $scope.permitRoutesGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
        }

        $scope.permits.$promise.then(function () {

            $scope.processRoutes();

            //activate the grid with the permits data
            $scope.permitRoutesGridDiv = document.querySelector('#permit-routes-grid');
            new agGrid.Grid($scope.permitRoutesGridDiv, $scope.permitRoutesGrid);
            $scope.permitRoutesGrid.api.setRowData($scope.permits);

        });

        $scope.processRoutes = function () { 
            $scope.permits.forEach(function (permit) { 

                if (permit.PermitStatus == 'Under Review')
                    permit.RoutePlanning = '*';

                

            });
        };

}];