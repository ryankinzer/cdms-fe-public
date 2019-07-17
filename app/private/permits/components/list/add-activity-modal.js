//modal to add/edit permit event 
var modal_edit_permitevent = ['$rootScope','$scope', '$uibModal','$uibModalInstance','GridService','Upload','PermitService',

    function ($rootScope, $scope, $modal, $modalInstance, GridService, $upload, PermitService) {

        $scope.permit = $scope.row;
        $scope.row = $scope.activity_modal; //note: this creates a LOCAL scope variable of ROW that will go away when this scope goes away...

        $scope.Results = {
            SuccessMessage: null,
            FailureMessage: null,
            DoneSaving: false,
        };

        //intent can be set from the caller... otherwise the mode is based on the incoming activity_modal id
        if ($scope.intent) {
            $scope.mode = $scope.intent;
        } else {
            $scope.mode = ($scope.row.Id) ? "edit" : "new";
        }

        if (!$scope.row.Id) {
            $scope.row.EventDate = moment().format('L');
            $scope.row.RequestDate = moment().format('L');    
        }
        else {
            if(!$scope.row.ResponseDate)
                $scope.row.ResponseDate = moment().format('L');    

            if(!$scope.row.Reviewer)
                $scope.row.Reviewer = $scope.Profile.Fullname;
        }
       
        //this is ugly but required - change labels for the forms
        if ($scope.mode == 'new_inspection') {
            $scope.permitEventsGrid.columnDefs.forEach(function (coldef) {
                if (coldef.DbColumnName == 'Reference')
                    coldef.Label = "Inspection Type";

                if (coldef.DbColumnName == 'RequestDate')
                    coldef.Label = "Date Inspection Desired";
            });
        } else {
            $scope.permitEventsGrid.columnDefs.forEach(function (coldef) { 
                if (coldef.DbColumnName == 'Reference')
                    coldef.Label = "Reference";

                if (coldef.DbColumnName == 'RequestDate')
                    coldef.Label = "Date Requested";
            });

        }


        if (!$scope.row.Files)
            $scope.row.Files = [];

        //set up for attaching files
        modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.PermitFiles); 

        $scope.save = function () {

            $scope.row.ByUser = $scope.Profile.Id;

            var target = '/api/v1/permit/uploadfile';

            var data = {
                ProjectId: PERMIT_PROJECTID,
                SubprojectId: $scope.permit.Id,
                ItemId: $scope.row.Id
            };

            if (Array.isArray($scope.row.Files)) {
                if ($scope.row.Files.length == 0)
                    delete $scope.row.Files;
                else
                    $scope.row.Files = angular.toJson($scope.row.Files);
            }

            //if this is a new event, save it first to get the ID
            if (!$scope.row.Id) {

                var new_event = PermitService.savePermitEvent($scope.row);

                new_event.$promise.then(function () {
                    console.log("done and success saving event!");
                    $scope.row.Id = data.ItemId = new_event.Id;

                    $scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
                });

            } else {
                $scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
            }

        };

        //callback that is called from modalFile to do the actual file removal (varies by module)
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            //console.dir(file_to_remove);
            return PermitService.deleteFile(PERMIT_PROJECTID, $scope.permit.Id, saveRow.Id, file_to_remove);
        };

        //call back from save above once the files are done processing and we're ready to save the item
        $scope.modalFile_saveParentItem = function (saveRow) {

            $scope.Results.DoneSaving = true;

            //save again to update with the files we uploaded
            $scope.saved_event = PermitService.savePermitEvent(saveRow);

            $scope.saved_event.$promise.then(function () {
                console.log("done and success updating the files");
                $scope.Results.SuccessMessage = "Saved and notifications sent.";
                
            }, function (data) {
                console.error("failure!");
                console.dir(data);
                $scope.Results.FailureMessage = "There was a problem saving or sending notifications.";
                $scope.Results.DoneSaving = false;
            });

        };

        $scope.close = function () { 
            $modalInstance.close($scope.saved_event);
        };


        var NEW_REVIEW_FIELDS = ["EventDate", "EventType", "ItemType", "Comments"];
        var EDIT_REVIEW_FIELDS = ["EventDate", "EventType", "ItemType", "ResponseDate","Result","Reference","Files","Comments"];
        var NEW_INSPECTION_FIELDS = ["Reference","ItemType","RequestDate","Comments"];

        //a filter to determine which fields to show
        $scope.doShowField = function (field) {
            
            if ($scope.mode == "new_route" && NEW_REVIEW_FIELDS.contains(field.DbColumnName))
                return true;

            if ($scope.mode == "edit_route" && EDIT_REVIEW_FIELDS.contains(field.DbColumnName))
                return true

            if ($scope.mode == "edit_route" || $scope.mode == "new_route")
                return false;

            if ($scope.mode == "new_inspection" && NEW_INSPECTION_FIELDS.contains(field.DbColumnName))
                return true;

            if ($scope.mode == "new_inspection")
                return false;

            return field.hasOwnProperty('DbColumnName');
        }

        //fire validation for all columns when we load (if we are editing)
        if ($scope.mode === 'edit') {
            $scope.permitEventsGrid.columnDefs.forEach(function (field) {
                $scope.onHeaderEditingStopped(field);
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.loadRecipientsFromRoute = function () { 
            
            if ($scope.activity_modal.EventType == 'Review' && ($scope.mode == 'new' || $scope.mode == 'new_route')) {
                $scope.row.ReviewersContact = {};

                //console.log("getting routes for: " + $scope.activity_modal.ItemType);

                $scope.PermitRoutes = PermitService.getPermitRoutes($scope.activity_modal.ItemType);
                $scope.PermitRoutes.$promise.then(function () {

                    //select the first one
                    $scope.PermitRoutes.forEach(function (route) {
                        if (route.Rank == 0)
                            $scope.row.ReviewersContact[route.Email] = true;
                    });
                });
            }
        }
        
        if (typeof $scope.row.ItemType === 'string') {
            $scope.loadRecipientsFromRoute();
        }

        //setup an event listener that fires from list-permits.js every time a header field is changed. we listen for ItemType changing.
        $rootScope.$on('headerEditingStopped', function (event, field) {
            if (field.DbColumnName == 'ItemType') {
                $scope.loadRecipientsFromRoute();
            }
        });
        
}];
