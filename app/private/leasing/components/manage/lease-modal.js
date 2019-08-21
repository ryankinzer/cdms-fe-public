
var modal_lease = ['$scope', '$rootScope', '$uibModal','$uibModalInstance', 'LeasingService',
    function ($scope, $rootScope, $modal, $modalInstance, LeasingService) {

        //utility functions

        /* pattern = 
            1056889599

            1-Farming (other numbers for other types of leases 4, 7)
            0-Place holder (they are about to reach the threshold of 10,000 leases) with soon be 1
            5688-Old lease number (TL-5688) currently at 9600 something I think
            95-last two digits of the lease start year
            99-Last two digits of the lease end year
        */
        $scope.generateLeaseNumber = function (lease) {
            //console.log("generateleasenumber");
            if (lease.lastleasenumber)
                return $scope.constructLeaseNumber(lease);

            var systemvals = LeasingService.getLeasingSystemValues();

            systemvals.$promise.then(function () {
                systemvals.forEach(function (val) {
                    if (val.Id == METADATA_PROPERTY_LEASING_SYSTEM_LASTLEASENUMBER) {
                        lease.lastleasenumberproperty = val;
                        lease.lastleasenumberproperty.PossibleValues = parseInt(val.PossibleValues);
                        $scope.constructLeaseNumber(lease);
                    }
                });
            });

        };

        //needs the lease.lastleasenumber already set
        $scope.constructLeaseNumber = function (lease) { 

            var nextlease = lease.lastleasenumberproperty.PossibleValues+1;

            if (leasing_module.LeaseTypeLeaseNumber.hasOwnProperty(lease.LeaseType))
                lease.LeaseNumber = leasing_module.LeaseTypeLeaseNumber[lease.LeaseType] + "0" + nextlease;
            else
                lease.LeaseNumber = "0" + nextlease;

            var begin = moment(lease.LeaseStart);
            if (begin.isValid() && lease.LeaseStart)
                lease.LeaseNumber += begin.format("YY");

            var end = moment(lease.LeaseEnd);
            if (end.isValid() && lease.LeaseEnd)
                lease.LeaseNumber += end.format("YY");

        }


        //now with the modal


        //set if the user clicks "new lease on this parcel" button on view lease
        if ($scope.pagemode == "new_lease_on_this_parcel") {
            $scope.pagemode = "new";
            $scope.headerMessage = "Create New Lease on this Parcel";

            $scope.lease_modal = {
                AllotmentName: $scope.lease.AllotmentName,
                Status: LEASE_STATUS_PENDING, //pending
                Level: 1,
                LeaseFields: $scope.lease.LeaseFields,
                FieldsToLink: [],
                LeaseType: $scope.lease.LeaseType,
                LeaseAcres: $scope.lease.LeaseAcres,
                ProductiveAcres: $scope.lease.ProductiveAcres,
            };
            //console.dir($scope.lease_modal);
            if ($scope.lease_modal.LeaseFields && Array.isArray($scope.lease_modal.LeaseFields)) {
                $scope.lease_modal.LeaseFields.forEach(function (field) { 
                    $scope.lease_modal.FieldsToLink.push(field.FieldId);
                });
            }
        }
        else {
            $scope.lease_modal = angular.copy($scope.lease);
            $scope.pagemode = "new";
            $scope.headerMessage = "Create New Lease";
        }

        if (!$scope.lease_modal.LeaseCropShares)
            $scope.lease_modal.LeaseCropShares = [];

        //leasenumber is automatically updated when creating for the first time - changing LeaseType, LeaseStart, LeaseEnd trigger update UNLESS user has manually changed the leasenumber
        $scope.canUpdateLeaseNumber = true;

        $scope.updateLeaseNumber = function () { 
            //console.log("updateLeaseNumber running - " +$scope.pagemode);
            if ($scope.canUpdateLeaseNumber && $scope.pagemode == "new") { 
                $scope.generateLeaseNumber($scope.lease_modal);
            }
        };

        $scope.manuallyUpdatedLeaseNumber = function () {
            //console.log("settingupdateleasenumber to false");
            $scope.canUpdateLeaseNumber = false;
        }

        $scope.canViewCropFields = $rootScope.Profile.hasRole("LeaseCropAdmin");

        if ($scope.lease_modal.Id) {
            $scope.headerMessage = "Edit Lease: " + $scope.lease_modal.LeaseNumber;
            $scope.pagemode = "edit";
            try {
                $scope.lease_modal.GrazeAnimal = angular.fromJson($scope.lease_modal.GrazeAnimal);
            } catch (e) {
                $scope.lease_modal.GrazeAnimal = new Array($scope.lease_modal.GrazeAnimal);
                //console.log("grazeanimal not json... now it is:");
                //console.dir($scope.lease_modal.GrazeAnimal);
            }
        } else {
            $scope.lease_modal.TransactionDate = moment().format(); //defaults to today
        }

        $scope.updateLeaseNumber(); //run the first time we open

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.editCropShare(param.data);
            });
            div.appendChild(editBtn);
            
            return div;
        };


        var leaseCropShareColumnDefs = [
            { headerName: "Crop Share Type", field: "CropShareType", width: 160, menuTabs: ['filterMenuTab'], 
                cellEditor: "select",
                cellEditorParams: { values: ["Primary","Alternative"] },
            },
            { headerName: "Crop", field: "Crop", width: 160, menuTabs: ['filterMenuTab'], 
                cellEditor: "select",
                cellEditorParams: { values: $scope.cropOptions.ListValues } 
            },
            { headerName: "Crop Share %", field: "CropSharePercent", width: 180, menuTabs: ['filterMenuTab'], filter: "text",
                valueParser: function (params) { 
                    if (params.newValue && !isPercent(params.newValue)) { alert("Value must be a percent (0-100)."); return;  } 
                    return (params.newValue) ? Number(params.newValue) : "";
                },
            }, 
            { headerName: "Cost Share %", field: "CostSharePercent", width: 160, menuTabs: ['filterMenuTab'], filter: "text",
                valueParser: function (params) { 
                    if (params.newValue && !isPercent(params.newValue)) { alert("Value must be a percent (0-100)."); return; } 
                    return (params.newValue) ? Number(params.newValue) : "";
                },
            },
            { headerName: "Comments", field: "Comment", width: 180, menuTabs: ['filterMenuTab'], filter: "text" },
        ];

        $scope.leaseCropShareGrid = {
            columnDefs: leaseCropShareColumnDefs,
            rowData: $scope.lease_modal.LeaseCropShares,
            removedCropShares: [], 
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
            },

            rowSelection: 'single',
        }

        
        $modalInstance.opened.then(function () {
            setTimeout(function () {
                $scope.cropsShareGridModalDiv = document.querySelector('#cropshare-grid-modal');
                new agGrid.Grid($scope.cropsShareGridModalDiv, $scope.leaseCropShareGrid);
            }, 500);
        })

        $scope.addRow = function () {
            //set the default cropsharetype: Primary, unless one already exists.
            var cropShareType = "Primary";
            $scope.leaseCropShareGrid.api.forEachNode(function (node) { 
                if (node.data.CropShareType == "Primary")
                    cropShareType = "Alternative";
            });

            $scope.leaseCropShareGrid.api.updateRowData({ add: [{ "CropShareType": cropShareType}] });
        };

        $scope.removeRow = function () {
            var selected = $scope.leaseCropShareGrid.api.getSelectedRows();
            $scope.leaseCropShareGrid.api.updateRowData({ remove: selected });

            //console.dir($scope.lease_modal);

            //fix: find it and delete it from our lease object's cropshare list
            selected.forEach(function (remove_cropshare) { 

                if(remove_cropshare.Id !== 0)
                    $scope.leaseCropShareGrid.removedCropShares.push(remove_cropshare.Id);
/*
                if (remove_cropshare.Id && Array.isArray($scope.lease_modal.LeaseCropShares)) {
                    $scope.lease_modal.LeaseCropShares.forEach(function (existing_cropshare, index) { 
                        if (existing_cropshare.Id === remove_cropshare.Id) {
                            $scope.lease_modal.LeaseCropShares.splice(index, 1);
                            $scope.leaseCropShareGrid.removedCropShares.push(remove_cropshare.Id);
                        }
                    });
                }
*/
            });

        };

//        console.dir($scope.lease_modal);
        //if this is a new lease, make sure the fields are all from the same allotment.
        if ($scope.lease_modal.LeaseNumber == null && $scope.lease_modal.LeaseFields.length > 1) { 
            var target_allotment = "";
            var isValid = true;

            $scope.lease_modal.LeaseFields.forEach(function (field) { 
                if (target_allotment == "") {
                    target_allotment = field.AllotmentName;
                    console.log(field.AllotmentName + "<--set");
                    return;
                }

                console.log("-->checking::: " + field.AllotmentName);
                if (field.AllotmentName != target_allotment) {
                    console.log("No good!");
                    isValid = false;
                }
            });

            console.log("isvalid: " + isValid);

            if (!isValid) {
                alert("Only fields from the same allotment can be added to a lease. Please change your selection.");
                $modalInstance.dismiss();
            }
        }

        $scope.save = function () {

            var lease_save = angular.copy($scope.lease_modal);

            //check for required fields
            if (!$scope.verifyRequiredFields()) {
                alert("Error: missing required fields. Please check the fields with asterisks and make sure all fields have a valid value.");
                return;
            }

            delete lease_save.LeaseComplianceActions;
            delete lease_save.LeaseCropPlans;
            delete lease_save.LeaseFields;
            delete lease_save.LeaseInspections;
            delete lease_save.LeaseOperator;
            delete lease_save.LeaseProductions;
            delete lease_save.lastleasenumberproperty;

            /* --- validation and such --- */

            lease_save.GrazeAnimal = JSON.stringify(lease_save.GrazeAnimal);

            //set the status if it changed
            if ($scope.lease.Status != lease_save.Status || $scope.lease.Level != lease_save.Level) {

                lease_save.StatusDate = $scope.currentDay;
                lease_save.StatusBy = $scope.currentUser;

                if ((lease_save.Level == 4 && lease_save.Status == LEASE_STATUS_PENDING) || (lease_save.Status == LEASE_STATUS_ACTIVE && lease_save.Level != 4)) {
                    if (confirm("This change will automatically set the Level to 4 and Status to Active. Are you sure?")) {
                        lease_save.Level = 4;
                        lease_save.Status = LEASE_STATUS_ACTIVE;
                    } else {
                        return;
                    }
                }
            }
            
            lease_save.LeaseCropShares.length = 0; //reset and copy in the changed (or new) rows.
            $scope.leaseCropShareGrid.api.forEachNode(function (node) {
                node.data.LeaseId = lease_save.Id;
                lease_save.LeaseCropShares.push(node.data);
            });

            console.log(" leasecropshares -- ");
            console.dir(lease_save.LeaseCropShares);
            console.dir($scope.leaseCropShareGrid.removedCropShares);

            //check if they changed the Operator - if so, we need to close this lease with today as the expiration and open a new one.
            if ($scope.pagemode == 'edit' && $scope.lease.Status == LEASE_STATUS_ACTIVE && $scope.lease.LeaseOperatorId != $scope.lease_modal.LeaseOperatorId) {
                if (confirm("Notice: Changing the Operator will CANCEL the existing lease and create a new one with the new Opeator. Are you sure?")) {
                    $scope.cancelExistingAndSaveNewLease(lease_save);
                    return;
                } else {
                    $scope.lease_modal.LeaseOperatorId = $scope.lease.LeaseOperatorId; //reset the operator and keep saving...
                }
            }

            var saveResult = LeasingService.saveLease(lease_save, $scope.leaseCropShareGrid.removedCropShares );

            saveResult.$promise.then(function (result) {

                //save our next lease number into the system property.
                if($scope.lease_modal.lastleasenumberproperty)
                {
                    $scope.lease_modal.lastleasenumberproperty.PossibleValues++; //increment now that we did the save...
                    LeasingService.saveLookupList($scope.lease_modal.lastleasenumberproperty);
                }

                $modalInstance.dismiss();
                $scope.saveLeaseCallback(saveResult); 
            });

        };

        //cancel the existing lease and save the new one with the new operator
        // cancel = set status to cancelled, expiration date to today, with old operator
        // new = clear the LeaseId, start date to today, expiration as before, with new operator
        $scope.cancelExistingAndSaveNewLease = function (lease_save) { 
            lease_save.LeaseOperatorId = $scope.lease.LeaseOperatorId; //operator id as before
            lease_save.Status = LEASE_STATUS_CANCELLED;
            lease_save.LeaseEnd = moment().format();
            lease_save.StatusDate = $scope.currentDay;
            lease_save.StatusBy = $scope.currentUser;
            lease_save.LeaseNumber = $scope.lease.LeaseNumber; // make sure it is the original
            lease_save.TAAMSNumber = $scope.lease.TAAMSNumber; // original

            var saveResult = LeasingService.saveLease(lease_save);

            saveResult.$promise.then(function (result) { 
                lease_save.Id = 0; //we want a new lease created, so remove our lease id
                lease_save.LeaseOperatorId = $scope.lease_modal.LeaseOperatorId; //the operator we changed to
                lease_save.Status = $scope.lease_modal.Status; //existing status (probably active)
                
                lease_save.LeaseEnd = $scope.lease_modal.LeaseEnd; //restore the original lease end date
                lease_save.LeaseStart = moment().format(); //start the lease today

                lease_save.LeaseNumber = $scope.lease_modal.LeaseNumber; //new - this is whatever they set.
                lease_save.TAAMSNumber = $scope.lease_modal.TAAMSNumber; //new - this is whatever they set.

                var newSaveResult = LeasingService.saveLease(lease_save); 

                newSaveResult.$promise.then(function (result) {

                    delete newSaveResult.LeaseCropPlans;

                    //also save the crop plan from the old to the new lease (not inspections or production)
                    var saved_cropplan = LeasingService.saveCropPlan(newSaveResult, $scope.lease.LeaseCropPlans);
                    saved_cropplan.$promise.then(function(result){
                        $modalInstance.dismiss();
                        $scope.saveLeaseCallback(newSaveResult);   
                    }, function (result) { 
                        console.log("Something went wrong saving the crop plan.");
                    });

                    
                }, function (result) { 
                    console.log("Something went wrong saving the new lease.");
                });
                 

            }, function (result) { 

                console.log("Something went wrong saving the old lease.");

            });

        };


        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };

        $scope.addOperatorPopup = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/private/leasing/components/manage/templates/add-operator-modal.html',
                controller: 'AddOperatorModalController',
                scope: $scope,
                backdrop: "static",
                keyboard: false
            });
        }

        $scope.saveOperatorCallback = function () {
            $scope.operators = LeasingService.getOperators();

            $scope.operators.$promise.then(function () {
                $scope.lease_modal.LeaseOperator = $scope.operators[$scope.operators.length - 1];
                $scope.lease_modal.LeaseOperatorId = $scope.lease_modal.LeaseOperator.Id;

                $scope.operators.forEach(function (oper) { 
                    oper.SortName = (oper.Organization) ? oper.Organization : oper.FirstName + " " + oper.LastName;
                });            

            });
        }

        //checks all the fields. returns "true" if verified, false if any missing
        $scope.verifyRequiredFields = function () { 
            var requiredFields = ["AllotmentName", "LeaseNumber", "LeaseOperatorId", "Status", "Level", "LeaseType", "LeaseStart"]; //TODO: refactor all of this into a forms feature!
            
            console.dir($scope.lease_modal);

            var verified = true;

            requiredFields.forEach(function (field) {
                if (!$scope.lease_modal.hasOwnProperty([field]) || $scope.lease_modal[field] == null ) {
                    console.log("missing field: " + field);
                    verified = false;
                }
            });

            return verified;

        };

        

    }
];

