var modal_add_permitperson = ['$scope', '$uibModalInstance', 'PermitService', 'GridService',
    function ($scope, $modalInstance, PermitService, GridService) {

        $scope.header_message = "Edit Contact Person";

        $scope.row = $scope.person_modal;

        //if we're not editing then we are creating a new one
        if (!$scope.row) {
            $scope.header_message = "Add Contact Person";
            $scope.row = { Id: 0, IsMailingDifferent: false };
        }

        //console.dir($scope.row);

        $scope.row.LastUpdated = moment().format('L');
        $scope.row.UpdatedBy = $scope.Profile.Fullname;

        $scope.updateFullname = function () { 
            $scope.row.FullName = ($scope.row.Prefix) ? $scope.row.Prefix + " " : "";
            $scope.row.FullName += ($scope.row.FirstName) ? $scope.row.FirstName + " " : "";
            $scope.row.FullName += ($scope.row.LastName) ? $scope.row.LastName : "";
            $scope.row.FullName += ($scope.row.Suffix) ? ", " + $scope.row.Suffix : "";
        };

        $scope.save = function () {

            var save_result = PermitService.savePermitPerson($scope.row);

            save_result.$promise.then(function () {
                $modalInstance.close(save_result);
            });
        };

        $scope.onHeaderEditingStopped = function (field, logerrors) { 
            //build event to send for validation
            console.log("onHeaderEditingStopped: " + field.DbColumnName);
            var event = {
                colDef: field,
                node: { data: $scope.row },
                scope: $scope,
                value: $scope.row[field.DbColumnName],
                type: 'onHeaderEditingStopped'
            };

            GridService.validateCell(event);
            GridService.fireRule("OnChange", event); 
        }

        $scope.toggleMailingAddress = function(){
            if($scope.row.IsMailingDifferent){
                console.log("showing mailing fields")
                jQuery("[id^='field-Mailing']").show();
            }
            else {
                console.log("hiding mailing fields")
                jQuery("[id^='field-Mailing']").hide();
            }
                
        }

        $modalInstance.opened.then(function(){
            setTimeout(function(){
                $scope.toggleMailingAddress();
            },500)
            
        });
        

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
