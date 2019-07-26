//modal to add/edit permit parcel
var modal_edit_permitparcel = ['$scope', '$uibModal','$uibModalInstance','Upload','PermitService',

    function ($scope, $modal, $modalInstance, $upload, PermitService) {

        $scope.mode = "edit";

        if (!$scope.parcel_modal.Id) {
            $scope.mode = "new";
        }

        $scope.parcelEntry = "";
        $scope.parcelMatches = "";

        $scope.parcelEntryUpdate = function () { 
            $scope.parcelEntry = $scope.parcelEntry.toUpperCase();
            $scope.parcelMatches = "";
            $scope.parcel_modal = {};

            var entryLength = $scope.parcelEntry.length;

            $scope.CadasterParcels.forEach(function (parcel) { 

                if (parcel.ParcelId == null || parcel.ParcelId == "")
                    return;

                if (parcel.ParcelId == $scope.parcelEntry) {
                    $scope.parcel_modal = parcel;
                    console.dir(parcel);
                }
                else 
                { 
                    if (entryLength > 2 && parcel.ParcelId.substring(0, entryLength) == $scope.parcelEntry) {
                        $scope.parcelMatches += parcel.ParcelId + "\n";
                    }
                }
            });
        };

        $scope.save = function () {

            var new_parcel = PermitService.savePermitParcel($scope.parcel_modal);

            $scope.parcel_modal.PermitId = $scope.row.Id;
            var the_new_parcel = getByField($scope.CadasterParcels, $scope.parcel_modal.ParcelId, 'ParcelId');
            $scope.parcel_modal.ObjectId = the_new_parcel.ObjectId;

            new_parcel.$promise.then(function () {
                $modalInstance.close(new_parcel);
            });

        };

  
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        
    }
];
