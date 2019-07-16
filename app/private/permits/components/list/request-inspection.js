var request_inspection = ['$scope', '$rootScope','$uibModal','PermitService', 'DatasetService', 'GridService',
    function ($scope, $rootScope, $modal, PermitService, DatasetService, GridService) {

        $rootScope.inModule = "permits";

        if (!$scope.Profile.hasRole("Permits"))
            angular.rootScope.go("/unauthorized");

        $scope.mode = 'new_inspection';
        $scope.permit = {};

        $scope.eventsdataset = DatasetService.getDataset(PERMITEVENTS_DATASETID);

        $scope.permitEventsGrid = {};

        $scope.eventsdataset.$promise.then(function () {
            console.log(" -- events dataset back -- ");
            var EventColumnDefs = GridService.getAgColumnDefs($scope.eventsdataset);
            $scope.permitEventsGrid.columnDefs = angular.merge(
                EventColumnDefs.HeaderFields
            );

            $scope.permitEventsGrid.columnDefs.forEach(function (coldef) {
                if (coldef.DbColumnName == 'Reference')
                    coldef.Label = "Inspection Type";

                if (coldef.DbColumnName == 'RequestDate')
                    coldef.Label = "Date Inspection Desired";
            });
        
        });


        $scope.permitLookup = function () { 
            $scope.ResultMessage = "Searching...";
            var search_permit = PermitService.getPermitByPermitNumber($scope.permit.PermitNumber);
            search_permit.$promise.then(function () { 
                console.dir(search_permit);
                if (search_permit.hasOwnProperty('Id')) {

                    $scope.permit = search_permit;

                    $scope.row = {
                        PermitId: $scope.permit.Id,
                        EventType: 'Inspection',
                        EventDate: moment().format('L'),
                        RequestDate: moment().format('L')
                    };

                    $scope.ResultMessage = "Permit found.";
                }
                else {
                    $scope.ResultMessage = $scope.permit.PermitNumber + " not found.";
                }
            });
        };


        var NEW_INSPECTION_FIELDS = ["Reference","ItemType","RequestDate","Comments"];

        //a filter to determine which fields to show
        $scope.doShowField = function (field) {

            if ($scope.mode == "new_inspection" && NEW_INSPECTION_FIELDS.contains(field.DbColumnName))
                return true;

            if ($scope.mode == "new_inspection")
                return false;

            return field.hasOwnProperty('DbColumnName');
        };

        

    }
];