var permit_routes = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.permits = PermitService.getRoutingPermits();

        $scope.permits.$promise.then(function () {
            $scope.permits.forEach(function(permit){ 
                if (permit.ReviewsRequired)
                    permit.ReviewsRequired = angular.fromJson(permit.ReviewsRequired);
                else
                    permit.ReviewsRequired = [];
            });
        });

        function RouteCellRenderer() {
        }

        RouteCellRenderer.prototype.init = function (params) {
            this.eGui = document.createElement('span');
            var code = $scope.getRouteDisplay(params);
            this.eGui.innerHTML = code;
        };

        RouteCellRenderer.prototype.getGui = function () {
            return this.eGui;
        };

        $scope.getRouteDisplay = function (params) { 

            var col = params.colDef.field.substring(6); //"Route_Plan" --> "Plan"

            //does the selected "required routes" include this column? if not return "N/A"
            if (params.node.data.ReviewsRequired && !params.node.data.ReviewsRequired.contains(col))
                return "N/A";
            
            var value = params.node.data[params.colDef.field];
            
            if (value == "*")
                return "&#9899";

            if (value == "+")
                return "&#9898";

            return "";
        };

        $scope.permitRoutesColDefs = [
            { headerName: "Main Reviewer", field: "ReviewedBy", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Permit #", field: "PermitNumber", menuTabs: ['filterMenuTab'], width: 150 , filter: 'text'},
            { headerName: "Status", field: "PermitStatus", menuTabs: ['filterMenuTab'], width: 150 , filter: 'text'}, 
            { headerName: "Routes", field: "ReviewsRequired", menuTabs: ['filterMenuTab'], width: 150 , filter: 'text'}, 
            { headerName: "Project Name", field: "ProjectName",menuTabs: ['filterMenuTab'], width: 280, filter: 'text' },
            { headerName: "Planning", field: "RoutePlanning",menuTabs: ['filterMenuTab'], width: 100 },
            { headerName: "Plan", field: "Route_Plan", menuTabs: ['filterMenuTab'],width: 100, editable: true, cellRenderer: 'routeCellRenderer',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    values: ['*', '+'],
                    cellRenderer: 'routeCellRenderer'
                }
            },
            { headerName: "WRP", field: "Route_WRP", menuTabs: ['filterMenuTab'],width: 100, cellRenderer: 'routeCellRenderer',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    values: ['Routed', 'Complete'],
                    cellRenderer: 'routeCellRenderer'
                }
            },
            { headerName: "Env", field: "Route_ENV", menuTabs: ['filterMenuTab'],width: 100, cellRenderer: 'routeCellRenderer',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    values: ['Routed', 'Complete'],
                    cellRenderer: 'routeCellRenderer'
                }
            },
            { headerName: "PubWrks", field: "Route_PubWrks", menuTabs: ['filterMenuTab'],width: 100, cellRenderer: 'routeCellRenderer',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    values: ['Routed', 'Complete'],
                    cellRenderer: 'routeCellRenderer'
                }
            },
            { headerName: "TERO", field: "Route_TERO", menuTabs: ['filterMenuTab'],width: 100, cellRenderer: 'routeCellRenderer',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    values: ['Routed', 'Complete'],
                    cellRenderer: 'routeCellRenderer'
                }
            },
            { headerName: "CRPP", field: "Route_CRPP", menuTabs: ['filterMenuTab'],width: 100, cellRenderer: 'routeCellRenderer',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    values: ['Routed', 'Complete'],
                    cellRenderer: 'routeCellRenderer'
                }
            },
            { headerName: "Roads", field: "Route_Roads", menuTabs: ['filterMenuTab'],width: 100, cellRenderer: 'routeCellRenderer',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: {
                    values: ['Routed', 'Complete'],
                    cellRenderer: 'routeCellRenderer'
                }
            },
            { headerName: "Fee", field: "FeePaymentAmount", menuTabs: ['filterMenuTab'],width: 100 },
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
            onCellDoubleClicked: function (params) { 
                console.dir(params);
            },
            onRowDoubleClicked: function (params) { 
                //$scope.openPermitPersonModal($scope.permitRoutesGrid.selectedItem.PermitPersonId);
            },
            onSelectionChanged: function (params) {
                $scope.permitRoutesGrid.selectedItem = $scope.permitRoutesGrid.api.getSelectedRows()[0];
                $scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            components: {
                'routeCellRenderer': RouteCellRenderer
            }
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