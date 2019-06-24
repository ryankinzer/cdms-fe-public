//modal to add/edit permit event 
var modal_edit_permitevent = ['$scope', '$uibModal','$uibModalInstance','GridService','Upload','PermitService',

    function ($scope, $modal, $modalInstance, GridService, $upload, PermitService) {

        $scope.permit = $scope.row;
       
        $scope.row = $scope.activity_modal; //note: this creates a LOCAL scope variable of ROW that will go away when this scope goes away...

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


        
        //console.log($scope.activity_modal);

        modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.activity_modal.Files); 

        $scope.save = function () {
            //$scope.handleFilesToUploadRemove($scope.row, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.
            $scope.modalFile_saveParentItem($scope.row);
        };

        //call back from save above once the files are done processing and we're ready to save the item
        $scope.modalFile_saveParentItem = function (saveRow) {
            
            saveRow.ByUser = $scope.Profile.Id;

            var new_event = PermitService.savePermitEvent(saveRow);

            new_event.$promise.then(function () {
                console.log("done and success!");
                $modalInstance.close(new_event);
            });

        };

        //callback that is called from modalFile to do the actual file removal (varies by module)
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            //console.dir(file_to_remove);
            //return ProjectService.deleteFile($scope.project.Id, file_to_remove);
        };

        var NEW_REVIEW_FIELDS = ["EventDate", "EventType", "ItemType", "Comments"];
        var EDIT_REVIEW_FIELDS = ["EventDate", "EventType", "ItemType", "ResponseDate","Result","Reference","Files","Comments"];
        var NEW_INSPECTION_FIELDS = ["Reference","RequestDate","Comments"];

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

        $scope.onHeaderEditingStopped = function (field) { 
            //build event to send for validation
            console.log("onHeaderEditingStopped: " + field.DbColumnName);

        };

        //fire validation for all columns when we load (if we are editing)
        if ($scope.mode === 'edit') {
            $scope.permitEventsGrid.columnDefs.forEach(function (field) {
                $scope.onHeaderEditingStopped(field);
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
