var permit_routes = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'PermitService', 'GridService', 'DatasetService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, PermitService, GridService, DatasetService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.permits = PermitService.getRoutingPermits();
        $scope.eventsdataset = DatasetService.getDataset(PERMITEVENTS_DATASETID);

        $scope.permits.$promise.then(function () {
            $scope.refreshPermits();
        });

        //setup our columns for the events modal
        $scope.eventsdataset.$promise.then(function () {
            var EventColumnDefs = GridService.getAgColumnDefs($scope.eventsdataset);
            $scope.permitEventsGrid = {};
            $scope.permitEventsGrid.columnDefs = EventColumnDefs.HeaderFields;
        });


        //our cell renderer for the route cells
        function RouteCellRenderer() { }
        RouteCellRenderer.prototype.init = function (params) {
            this.eGui = document.createElement('span');
            var code = $scope.getRouteDisplay(params);
            this.eGui.innerHTML = code;
        };

        RouteCellRenderer.prototype.getGui = function () {
            return this.eGui;
        };

        //our cell value getter used by the cell renderer
        $scope.getRouteDisplay = function (params) {

            var col = params.colDef.field.substring(6); //"Route_Plan" --> "Plan"

            var retval = "";

            //does the selected "required routes" include this column? if not return "N/A"
            if (!params.node.data.ReviewsRequired.contains(col))
                retval = "N/A";

            var value = params.node.data[params.colDef.field];

            if (value == "*")
                retval = "&#9899";

            if (value == "+")
                retval = "&#9898";

            return retval;
        };

        $scope.permitRoutesColDefs = [
            { headerName: "Main Reviewer", field: "ReviewedBy", width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: "Permit #", field: "PermitNumber", menuTabs: ['filterMenuTab'], width: 150, filter: 'text' },
            { headerName: "Status", field: "PermitStatus", menuTabs: ['filterMenuTab'], width: 150, filter: 'text' },
            //{ headerName: "Routes", field: "ReviewsRequired", menuTabs: ['filterMenuTab'], width: 150 , filter: 'text'}, 
            { headerName: "Project Name", field: "ProjectName", menuTabs: ['filterMenuTab'], width: 280, filter: 'text' },
            { headerName: "TPO", field: "Route_TPO", menuTabs: ['filterMenuTab'], width: 100, cellRenderer: 'routeCellRenderer' },
            { headerName: "Plan", field: "Route_Plan", menuTabs: ['filterMenuTab'], width: 100, cellRenderer: 'routeCellRenderer' },
            { headerName: "WRP", field: "Route_WRP", menuTabs: ['filterMenuTab'], width: 100, cellRenderer: 'routeCellRenderer' },
            { headerName: "Env", field: "Route_Env", menuTabs: ['filterMenuTab'], width: 100, cellRenderer: 'routeCellRenderer' },
            { headerName: "PubWrks", field: "Route_PubWrks", menuTabs: ['filterMenuTab'], width: 100, cellRenderer: 'routeCellRenderer' },
            { headerName: "TERO", field: "Route_TERO", menuTabs: ['filterMenuTab'], width: 100, cellRenderer: 'routeCellRenderer' },
            { headerName: "CRPP", field: "Route_CRPP", menuTabs: ['filterMenuTab'], width: 100, cellRenderer: 'routeCellRenderer' },
            { headerName: "Roads", field: "Route_Roads", menuTabs: ['filterMenuTab'], width: 100, cellRenderer: 'routeCellRenderer' },
            { headerName: "Fee Paid", field: "FeePaymentAmount", menuTabs: ['filterMenuTab'], width: 100 },
            { headerName: "Issued By", field: "IssuedBy", menuTabs: ['filterMenuTab'], width: 160, filter: true },
            { headerName: "Comments", field: "Comments", menuTabs: ['filterMenuTab'], width: 460 }
        ];


        $scope.permitRoutesGrid = {
            columnDefs: $scope.permitRoutesColDefs,
            rowData: null,
            rowSelection: 'single',
            selectedItem: null,
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
                $scope.handleDoubleClick(params);
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

            //activate the grid with the permits data
            $scope.permitRoutesGridDiv = document.querySelector('#permit-routes-grid');
            new agGrid.Grid($scope.permitRoutesGridDiv, $scope.permitRoutesGrid);
            $scope.permitRoutesGrid.api.setRowData($scope.permits);

        });

        $scope.handleDoubleClick = function (params) {
            var col = params.colDef.field.substring(6); //"Route_Plan" --> "Plan"

            //we only deal with the cells that are for required routes
            if (!params.node.data.ReviewsRequired.contains(col))
                return;

            var value = params.node.data[params.colDef.field];

            console.log(" Route = " + col + " for " + value);

            //fetch the permit events for this permit
            $scope.PermitEvents = PermitService.getPermitEvents($scope.permitRoutesGrid.selectedItem.Id);

            $scope.PermitEvents.$promise.then(function () {

                var new_activity = {
                    PermitId: $scope.permitRoutesGrid.selectedItem.Id,
                    EventType: 'Approval',
                    ItemType: col, //Plan, WRP, Env, PubWrks, TERO, CRPP, etc.
                };

                // required but not yet routed, open a new event of this type
                if (!value) {
                    $scope.openActivityModal(new_activity, "new_route");
                }

                // routed but not finished OR finished - open the route for edit
                if (value == "+" || value == "*") {
                    //first find our activity
                    var existing_activity = null;
                    $scope.PermitEvents.forEach(function (activity) {
                        if (activity.EventType == 'Approval' && activity.ItemType == col)
                            existing_activity = activity;
                    });

                    if (existing_activity)
                        $scope.openActivityModal(existing_activity, "edit_route");
                    else
                        $scope.openActivityModal(new_activity, "new_route"); //this is for convenience in populating the new db... there should always be an existing_activity once the legacy data is populated...

                }

            });



        };


        $scope.openActivityModal = function (params, intent) {

            $scope.activity_modal = params;
            $scope.intent = intent;

            var modalInstance = $modal.open({
                templateUrl: 'app/private/permits/components/list/templates/add-activity-modal.html',
                controller: 'ActivityModalController',
                scope: $scope,
            }).result.then(function (saved_activity) {

                //save the permit with the route updated
                var save_permit = angular.copy($scope.permitRoutesGrid.selectedItem);
                console.log("updating permit route for: " + saved_activity.ItemType);
                save_permit["Route_" + saved_activity.ItemType] = ($scope.intent == 'new_route') ? "+" : "*";
                save_permit.ReviewsRequired.remove("TPO");

                save_permit.ReviewsRequired = angular.toJson(save_permit.ReviewsRequired);

                var permit_promise = PermitService.savePermit(save_permit);

                permit_promise.$promise.then(function () {

                    $scope.setupPermit(save_permit);

                    $scope.permits.forEach(function (permit) {
                        if (permit.Id == save_permit.Id) {
                            angular.extend(permit, save_permit);
                            //console.log(" found permit after save -- updated ");
                        }
                    });

                    $scope.permitRoutesGrid.api.setRowData($scope.permits);

                });

            });
        };

        $scope.refreshPermits = function () {
            $scope.permits.forEach(function (permit) {
                $scope.setupPermit(permit);
            });
        };

        $scope.setupPermit = function (permit) { 
            if (permit.ReviewsRequired)
                permit.ReviewsRequired = angular.fromJson(permit.ReviewsRequired);
            else
                permit.ReviewsRequired = [];

            permit.ReviewsRequired.push("TPO"); //this route is always required. :)

            permit.Route_TPO = (permit.PermitStatus == 'New Application') ? '+' : '*'; // our internal "TPO" status isn't stored in the db, just a grid field.
        };



        
}];