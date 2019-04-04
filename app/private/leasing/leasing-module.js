// defines the leasing module

require([
    //controllers
    'private/leasing/components/manage/manage-leases',
    'private/leasing/components/manage/active-leases',
    'private/leasing/components/manage/pending-leases',
    'private/leasing/components/manage/view-lease',
    'private/leasing/components/manage/available-land',
    'private/leasing/components/manage/inspection-violations',
    'private/leasing/components/manage/manage-operators',
    'private/leasing/components/manage/lookups',

    //map directive
    'private/leasing/leasing-map-directive',

    //modals
    'private/leasing/components/manage/lease-modal',
    'private/leasing/components/manage/add-fall-inspection-modal',
    'private/leasing/components/manage/add-spring-inspection-modal',
    'private/leasing/components/manage/add-grazing-inspection-modal',
    'private/leasing/components/manage/add-production-modal',
    'private/leasing/components/manage/modify-crop-plan-modal',
    'private/leasing/components/manage/inspection-violation-modal',
    'private/leasing/components/manage/add-operator-modal',

    //service
    'private/leasing/leasing-service',


], function () {
    leasing_module.controller('LeasingHomeController', leasing_home);
    leasing_module.controller('ActiveLeasesController', active_leases);
    leasing_module.controller('PendingLeasesController', pending_leases);
    leasing_module.controller('ViewLeaseController', view_lease);
    leasing_module.controller('AvailableLandController', available_land);
    leasing_module.controller('LeaseModalController', modal_lease);
    leasing_module.controller('SpringInspectionModalController', modal_add_spring_inspection);
    leasing_module.controller('ProductionModalController', modal_add_production);
    leasing_module.controller('FallInspectionModalController', modal_add_fall_inspection);
    leasing_module.controller('GrazingInspectionModalController', modal_add_grazing_inspection);
    leasing_module.controller('ModifyCropPlanController', modal_modify_crop_plan);
    leasing_module.controller('ViolationsController', inspection_violations);
    leasing_module.controller('InspectionViolationModalController', inspection_violation_modal);
    leasing_module.controller('ManageOperatorsController', manage_operators);
    leasing_module.controller('AddOperatorModalController', modal_add_operator);
    leasing_module.controller('LookupListsController', lookup_lists);

    //Lease Statuses: these must correspond to Lease.cs in BE
    leasing_module.LeaseStatus = [];
    leasing_module.LeaseStatus[1] = "Active";
    leasing_module.LeaseStatus[2] = "Inactive";
    leasing_module.LeaseStatus[3] = "Pending";
    leasing_module.LeaseStatus[4] = "Withdrawn";
    leasing_module.LeaseStatus[5] = "Expired";
    leasing_module.LeaseStatus[6] = "Cancelled";

    leasing_module.LeaseLevels = [];
    leasing_module.LeaseLevels[1] = "Level 1";
    leasing_module.LeaseLevels[2] = "Level 2";
    leasing_module.LeaseLevels[3] = "Level 3";
    leasing_module.LeaseLevels[4] = "Level 4";

    //maps lease types to the first number of the leasenumber (when generating lease numbers)
    leasing_module.LeaseTypeLeaseNumber = {
        "Farming" : "1",
        "Grazing" : "4",
        "Residential" : "2",
        "Storage" : "TL-",
    };

    //leasing_module.InspectionViolationResolutions = ["Dismissed","Fee Paid","No Resolution","Other"];

    //leasing_module.ProductionDeliveryUnit = ["ACRE", "AUM", "BU", "LB", "TON"];

    // -- filter for lease status
    leasing_module.filter('leaseStatus', function () {
        return function (input) {
            return leasing_module.LeaseStatus[input];
        }
    });

    leasing_module.filter('operOrgName', function () {
        return function (oper) {
            if (!oper)
                return "";

            return (oper.Organization) ? oper.Organization : oper.FirstName + " " + oper.LastName;
        }
    });

    //filter for Yes No fields
    leasing_module.filter('boolYesNo', function () {
        return function (in_val) {
            return (in_val) ? "Yes" : "No";
        }
    });

    leasing_module.filter('arrayList', function () {
        return function (array_values) {
            var result = '';
            if (array_values) {

                try {
                    for (var i = 0, len = array_values.length; i < len; i++) {
                        result += array_values[i] + "\n";
                    }
                }
                catch (e) {
                    result = array_values;
                }
            }

            return result;
        }
    });


    //can call to prepare a scope to use the leasemodal
    // mainly loads the various lists for the dropdowns
    leasing_module.prepareLeaseModalScope = function ($scope, LeasingService) {

        $scope.leaseLevels = leasing_module.LeaseLevels;
        $scope.leaseStatuses = leasing_module.LeaseStatus;

        $scope.operators = LeasingService.getOperators();

        $scope.operators.$promise.then(function () { 
            $scope.operators.forEach(function (oper) { 
                oper.SortName = (oper.Organization) ? oper.Organization : oper.FirstName + " " + oper.LastName;
            });            
        });

        $scope.leaseTypes = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_LEASETYPES);
        $scope.productionDeliveryUnits = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_PRODUCTIONDELIVERY);
        $scope.cropOptions = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_CROPOPTIONS);
        $scope.weeds = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_WEEDS);
        $scope.residueTypes = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_RESIDUETYPES);
        $scope.animalTypes = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_ANIMALTYPES);
        $scope.subPractices = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_SUBPRACTICES);
        $scope.productionTypes = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_PRODUCTIONTYPES);
        $scope.operatorStates = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_OPSTATES);
        $scope.operatorCities = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_OPCITIES);
        $scope.complianceInspectionTypes = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_COMPLIANCE_INSP_TYPES);
        $scope.operatorViolationTypes = LeasingService.getLookupValues(METADATA_PROPERTY_LEASING_VIOLATION_TYPES);

    };
    
});


