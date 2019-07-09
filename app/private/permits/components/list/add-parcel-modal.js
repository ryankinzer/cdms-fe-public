//modal to add/edit permit parcel
var modal_edit_permitparcel = ['$scope', '$uibModal','$uibModalInstance','Upload','PermitService',

    function ($scope, $modal, $modalInstance, $upload, PermitService) {

        $scope.mode = "edit";

        if (!$scope.parcel_modal.Id) {
            $scope.mode = "new";
        }

        $scope.parcelEntry = "";
        $scope.parcelDisplay = "Enter a parcel number above to search.";
        $scope.parcelMatches = "";

        $scope.parcelEntryUpdate = function () { 
            $scope.parcelEntry = $scope.parcelEntry.toUpperCase();
            $scope.parcelDisplay = "No match.";
            $scope.parcelMatches = "";

            var entryLength = $scope.parcelEntry.length;
            console.log("length = " + entryLength);

            $scope.CadasterParcels.forEach(function (parcel) { 

                if (parcel.ParcelId == null || parcel.ParcelId == "")
                    return;

                if (parcel.ParcelId == $scope.parcelEntry) {
                    $scope.parcelDisplay = parcel.PLSS_Label;
                    $scope.parcel_modal = parcel;
                }
                else 
                { 
                    if (entryLength > 2 && parcel.ParcelId.substring(0, entryLength) == $scope.parcelEntry) {
                        console.log("adding -- " + parcel.ParcelId);
                        $scope.parcelMatches += parcel.ParcelId + "\n";
                    }
                }
            });
        };

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
