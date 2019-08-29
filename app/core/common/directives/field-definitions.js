'use strict';

//defines field directives

common_module.directive('ctuirTextField',
    function(){
        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-text.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirCurrencyField',
    function(){
        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-currency.html',
            restrict: 'E',
        };

        return result;

    });


common_module.directive('ctuirHiddenField',
    function(){
        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-hidden.html',
            restrict: 'E',
        };

        return result;

    });


common_module.directive('ctuirTextareaField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-textarea.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirDateField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-date.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirActivityTextField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-activity-text.html',
            restrict: 'E',
        };

        return result;

    });


common_module.directive('ctuirActivityDateField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-activity-date.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirLocationSelectField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-location-select.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirTimezoneSelectField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-timezone-select.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirInstrumentSelectField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-instrument-select.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirFishermanSelectField',
    function () {

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-fisherman-select.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirAccuracyCheckSelectField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-accuracy-check-select.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirPostAccuracyCheckSelectField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-post-accuracy-check-select.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirQaStatusSelectField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-qa-status-select.html',
            restrict: 'E',
        };

        return result;

    });


common_module.directive('ctuirQaStatusCommentField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-qa-status-comment.html',
            restrict: 'E',
        };

        return result;

    });


common_module.directive('ctuirTimeField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-time.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
                //console.dir("have a time!");
                //console.dir($scope.field);
                //console.dir($scope.row);
                if (typeof $scope.row[$scope.field.DbColumnName] === 'string') {
                    try {
                        var time_only = moment($scope.row[$scope.field.DbColumnName]).format('HH:mm');
                        $scope.row[$scope.field.DbColumnName] = time_only;
                    }catch(e){
                        console.log(" Could not convert "+ $scope.field.DbColumnName + " values " + $scope.row[$scope.field.DbColumnName] + " to a date.");
                    }
                }
            }
        };

        return result;

    });

common_module.directive('ctuirEastingField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-easting.html',
            restrict: 'E',
        };

        return result;
    });

common_module.directive('ctuirNorthingField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-northing.html',
            restrict: 'E',
        };

        return result;
    });

common_module.directive('ctuirNumberField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-number.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirSelectField',
    function () {

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-select.html',
            restrict: 'E',
            controller: function ($scope, $element, $attrs) {
                $scope.selectOptions = makeObjectsFromValues($scope.field.DatastoreId+$scope.field.DbColumnName, $scope.field.PossibleValues);
            }
        };

        return result;

    });

common_module.directive('ctuirSelectGroupField',
    function () {

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-select-group.html',
            restrict: 'E',
            controller: function ($scope, $element, $attrs) {
                $scope.selectOptions = makeObjectsFromValues($scope.field.DatastoreId+$scope.field.DbColumnName, $scope.field.PossibleValues);
            }
        };

        return result;

    });



common_module.directive('ctuirSelectNumberField',
    function () {

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-select-number.html',
            restrict: 'E',
            controller: function ($scope, $element, $attrs) {
                $scope.selectOptions = makeObjectsFromValues($scope.field.DatastoreId+$scope.field.DbColumnName, $scope.field.PossibleValues);
            }
        };

        return result;

    });


common_module.directive('ctuirMultiselectField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-multiselect.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
               $scope.selectOptions = makeObjectsFromValues($scope.field.DatastoreId+$scope.field.DbColumnName, $scope.field.PossibleValues);
            }
        };
        
        return result;

    });

common_module.directive('ctuirMultiselectCheckboxField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-multiselect-checkbox.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
               $scope.selectOptions = makeObjectsFromValues($scope.field.DatastoreId+$scope.field.DbColumnName, $scope.field.PossibleValues);
                /*
                console.dir("have a multiselect-checkbox!");
                console.dir($scope.selectOptions);
                console.dir($scope.field);
                console.dir($scope.row);
                if (typeof $scope.row[$scope.field.DbColumnName] === 'string') {
                    try {
                        $scope.row[$scope.field.DbColumnName] = angular.fromJson($scope.row[$scope.field.DbColumnName]);
                    }catch(e){
                        console.log(" Could not convert "+ $scope.field.DbColumnName + " values " + $scope.row[$scope.field.DbColumnName] + " to an array.");
                    }
                }*/
            }
        };
        
        return result;

    });


common_module.directive('ctuirFileField',
    function($uibModal){
        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-file.html',
            restrict: 'E',
        };

        return result;
    });

common_module.directive('ctuirTempWaypointFileField',
    function($uibModal){
        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-waypoint-file.html',
            restrict: 'E',
        };

        return result;
    });

common_module.directive('ctuirLinkField',
    function($uibModal){
        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-link.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs)
            {
                //add a function that will enable file modal capability for all fields with controlType = link
                $scope.openLinkModal = function(row, field)
                {
                    //console.dir(row);
                    //console.dir(field);
                    $scope.link_row = row;
                    $scope.link_field = field;
                    
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/core/common/components/modals/templates/modal-link-field.html',
                        controller: 'LinkModalCtrl',
                        scope: $scope, //scope to make a child of
                    });
                };
            }
        };

        return result;
    });

common_module.directive('ctuirRadioField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-radio.html',
            restrict: 'E',
        };

        return result;

    });

common_module.directive('ctuirCheckboxField',
    function(){

        var result = {
            templateUrl: 'app/core/common/templates/form-fields/field-checkbox.html',
            restrict: 'E',
        };

        return result;

    });
	
common_module.directive('uiSelectWrapper',
    function(){

		return {
			link: function(scope, element, attrs) {
				var uiSelectController = element.children().controller('uiSelect');
				console.log("uiSelectController is next...");
				console.dir(uiSelectController);
			}
		}

    });

common_module.directive('multiselect', function () {
 
        return {
 
            scope: true,
            link: function (scope, element, attrs) {
 
                element.multiselect({
 
                    // Replicate the native functionality on the elements so
                    // that angular can handle the changes for us.
                    onChange: function (optionElement, checked) {
 
                        optionElement.removeAttr('selected');
 
                        if (checked) {
                            optionElement.attr('selected', 'selected');
                        }
 
                        element.change();
                    }
                });
 
                // Watch for any changes to the length of our select element
                scope.$watch(function () {
                    return element[0].length;
                }, function () {
                    element.multiselect('rebuild');
                });
 
                // Watch for any changes from outside the directive and refresh
                scope.$watch(attrs.ngModel, function () {
                    element.multiselect('refresh');
                });
 
            }
 
        };
});

common_module.directive('convertToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) {
                return parseInt(val, 10);
            });
            ngModel.$formatters.push(function (val) {
                return '' + val;
            });
        }
    };
});