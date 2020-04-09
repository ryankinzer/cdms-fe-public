//modal to add/edit permit parcel
var modal_edit_permitparcel = ['$scope', '$uibModal','$uibModalInstance','Upload','PermitService','ViolationService',

    function ($scope, $modal, $modalInstance, $upload, PermitService, ViolationService) {

        $scope.mode = "edit";

        if (!$scope.parcel_modal.Id) {
            $scope.mode = "new";
        }

        $scope.parcelEntry = "";
        $scope.parcelMatches = [];

        $scope.Selected = {Parcel : []};

        $scope.parcelEntryUpdate = function () { 
            $scope.parcelEntry = $scope.parcelEntry.toUpperCase();
            $scope.parcelMatches = [];
            $scope.Selected.Parcel.length = 0;
            $scope.parcel_modal = {};


            var entryLength = $scope.parcelEntry.length;

            $scope.CadasterParcels.forEach(function (parcel) { 

                if (parcel.ParcelId == null || parcel.ParcelId == "")
                    return;

                if (entryLength > 0){

                    if(parcel.ParcelId.substring(0, entryLength) == $scope.parcelEntry || 
                        (parcel.Address && parcel.Address.toUpperCase().substring(0, entryLength) == $scope.parcelEntry ) ) {

                        if (parcel.ParcelId == $scope.parcelEntry || (parcel.Address && parcel.Address.toUpperCase() == $scope.parcelEntry)) {
                            $scope.parcel_modal = parcel;
                            $scope.Selected.Parcel.push(angular.toJson($scope.parcel_modal)); //this is the trick
                        }

                        $scope.parcelMatches.push(parcel);
                    }
                }
            });
        };

        $scope.selectParcel = function(){
            $scope.parcel_modal = angular.fromJson($scope.Selected.Parcel[0]); //this is the trick
        }

        if($scope.row.SiteAddress) {
            $scope.parcelEntry = $scope.row.SiteAddress;
            $scope.parcelEntryUpdate();
        }

        $scope.save = function () {

            var new_parcel = "";
            
            if($scope.violations != null){
                $scope.parcel_modal.EHSViolationId = $scope.row.Id;
                new_parcel = ViolationService.saveViolationParcel($scope.parcel_modal);
            }
            else
            {
                $scope.parcel_modal.PermitId = $scope.row.Id;
                new_parcel = PermitService.savePermitParcel($scope.parcel_modal);
            }
            
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
