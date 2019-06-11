//modal to add/edit permit parcel
var modal_edit_permitparcel = ['$scope', '$uibModal','$uibModalInstance','Upload','PermitService',

    function ($scope, $modal, $modalInstance, $upload, PermitService) {

        $scope.mode = "edit";

        if (!$scope.parcel_modal.Id) {
            $scope.mode = "new";
        }

        $scope.save = function () {

            var new_parcel = PermitService.savePermitParcel($scope.parcel_modal);

            $scope.parcel_modal.PermitId = $scope.row.Id;
            var the_new_parcel = getByField($scope.CadasterParcels, $scope.parcel_modal.ParcelId, 'ParcelId');
            console.dir(the_new_parcel);
            $scope.parcel_modal.ObjectId = the_new_parcel.ObjectId;

            new_parcel.$promise.then(function () {
                console.log("done and success!");
                $modalInstance.close(new_parcel);
            });

        };

  
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
