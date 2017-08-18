'use strict';

/* Directives */
//NOTE: all of our directives should be prefixed with "cd-" for "CTUIR Dev".

var mod = angular.module('DatasetDirectives',[]);
mod.directive('showtab',
        function () {
            return {
                link: function (scope, element, attrs) {
                    element.click(function (e) {
                        e.preventDefault();
                        $(element).tab('show');
                    });
                }
            };
        });


mod.directive('ngBlur', function () {
        return function( scope, elem, attrs ) {
            elem.bind('blur', function() {
                scope.$apply(attrs.ngBlur);
            });
        };
    });

// Regular Expression explanation.  Also see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
// Enclosing characters:  / ... /
// At the beginning:  ^
// Escape character for special characters:  \  , in this case the - has special meaning
// Match the preceding character 0 or 1 time; in other words, like -123.  The - sign in front may or may not be present:  ?
// A sequence of 6 digits:  \d{6}
// Start a section to be remembered:  (       and another section   (
// Look for a decimal, but the decimal needs escaping, because the . is special:  \.
// Close the decimal section:  )
// Look for a digit:  \d
// Match the preceding character 1 or more times:  +
// Closed this section for the fractional value:  )
// The decimal followed by 1 or more numbers may or may not be present (the whole .123 section):  ?
// The fractional part (.123) is treated as the end of the number, and we want to see if the number has a fractional part:  $
// Basically, the $ matches the whole () section before the ?, so the decimal section must be at the end of the number.
// Example:  For example, /t$/ does not match the 't' in "eater", but does match it in "eat".
var INTEGER_REGEXP = /^\-?\d+$/;
mod.directive('integer', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if(viewValue == "")
        {
            ctrl.$setValidity('integer', true);
            return true;
        }

        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          ctrl.$setValidity('integer', true);
          return parseInt(viewValue);
        } else {
          // it is invalid, return undefined (no model update)
          ctrl.$setValidity('integer', false);
          return undefined;
        }
      });
    }
  };
});

var INTEGER_REGEXP = /^\d{4}$/;
mod.directive('integerfour', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if(viewValue == "")
        {
            ctrl.$setValidity('integer', true);
            return true;
        }

        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          ctrl.$setValidity('integer', true);
          return parseInt(viewValue);
        } else {
          // it is invalid, return undefined (no model update)
          ctrl.$setValidity('integer', false);
          return undefined;
        }
      });
    }
  };
});

var FLOAT_REGEXP = /^\-?\d+((\.)\d+)?$/;
//mod.directive('smartFloat', function() { // Note:  with the one uppercase letter, the caller cannot find this directive.
mod.directive('smartfloat', function() { // With all lowercase like this, the caller CAN find this directive.
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if(viewValue == "")
        {
            ctrl.$setValidity('float', true);
            return true;
        }

        if (FLOAT_REGEXP.test(viewValue)) {
          ctrl.$setValidity('float', true);
          return parseFloat(viewValue.replace(',', '.'));
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
      });
    }
  };
});

var FLOAT_REGEXP6 = /^\-?\d{6}((\.)\d+)?$/;
mod.directive('sixfloat', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if(viewValue == "")
        {
            ctrl.$setValidity('float', true);
            return true;
        }
	
		if (FLOAT_REGEXP6.test(viewValue)) {
          ctrl.$setValidity('float', true);
          return parseFloat(viewValue.replace(',', '.'));
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
				
      });
    }
  };
});

var FLOAT_REGEXP7 = /^\-?\d{7}((\.)\d+)?$/;
mod.directive('sevenfloat', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if(viewValue == "")
        {
            ctrl.$setValidity('float', true);
            return true;
        }
	
		if (FLOAT_REGEXP7.test(viewValue)) {
          ctrl.$setValidity('float', true);
          return parseFloat(viewValue.replace(',', '.'));
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
				
      });
    }
  };
});

mod.directive('textrequired', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if(viewValue == "")
        {
			ctrl.$setValidity('text', false);
			return undefined;
        }
		else 
		{
			ctrl.$setValidity('text', true);
            return true;
        }
				
      });
    }
  };
});

//Hides or shows any element with: project-role="owner"
//  if the project is owned by the current user
//  available project roles = owner, editor
//NOTE: to use this directive, your controller must have the $rootScope defined.
mod.directive('projectRole', function($rootScope){
    return {
        link: function(scope,element, attrs)
        {
            if(!attrs.projectRole)
            {
                throw new Exception("Configuration error: project-role attribute must specify a target role name, 'owner' or 'editor'.");
            }

            var role = attrs.projectRole.trim();

            if(role != 'owner' && role != 'editor')
                throw new Exception("Configuration error: project-role attribute must be 'owner' or 'editor'.");

            var show = false; //default to NOT show.

            function applyRoleToElement()
            {                

                if(role == 'owner' && $rootScope.Profile.isProjectOwner(scope.project))
                {
                    //console.log("Showing role 'owner' because user is owner.");
                    show = true;
                }

                if(role == 'editor' && ($rootScope.Profile.isProjectOwner(scope.project) || $rootScope.Profile.isProjectEditor(scope.project)))
                {
                    //console.log("Showing role 'editor' because user is owner or editor.");
                    show = true;
                }

                if(show)
                    element.show();
                else
                    element.hide();
            }

            if(!scope.project || !scope.project.$resolved)
            {
//                console.log("setting watch");
                var projectWatch = scope.$watch('project',function(){
                    if(scope.project != null)
                    {
  //                      console.log("got a new project hit");
                        projectWatch();
                        scope.project.$promise.then(function(){
    //                        console.log("Promise completed.");
                            applyRoleToElement();
                        });
                    }
                });
            }

            applyRoleToElement();
        }
    };
});

//Hides or Shows any element with: has-role="someRole"
//  where "someRole" is in the current user's roles list
mod.directive('hasRole', function($rootScope){
    return{
        link: function(scope, element, attrs) {
            //console.log("checking permission");

            if(!attrs.hasRole)
                return;

            var value = attrs.hasRole.trim();
            
            var notPermissionFlag = value[0] === '!';
            
            if(notPermissionFlag)
                value.slice(1).trim();

            //console.dir($rootScope.Profile.Roles);
            //console.dir($rootScope.Profile.Fullname);

            if(!$rootScope.Profile.Roles)
                $rootScope.Profile.Roles = [];
            //else
                //if(!Array.isArray($rootScope.Profile.Roles))
                //    $rootScope.Profile.Roles = angular.fromJson($rootScope.Profile.Roles);

            //console.dir($rootScope.Profile.Roles);

            var hasPermission = $rootScope.Profile.Roles[value] ? true : false;

            //console.log(value + " ? " + hasPermission);

            if(hasPermission || (notPermissionFlag && !hasPermission) )
            {
                console.log("hasPermission("+value+") = true");
                element.show();
            }
            else
            {
                console.log("hasPermission("+value+") = false");
                element.hide();
            }
        }
    };
});

mod.directive('ctuirTextField',
    function(){
        var result = {
            templateUrl: 'partials/dataentry/field-text.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirTextareaField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-textarea.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirDateField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-date.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirTimeField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-time.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirEastingField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-easting.html',
            restrict: 'E',
        };

        return result;
    });

mod.directive('ctuirNorthingField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-northing.html',
            restrict: 'E',
        };

        return result;
    });

mod.directive('ctuirNumberField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-number.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirSelectField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-select.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
                $scope.selectOptions = makeObjectsFromValues($scope.dataset.DatastoreId+$scope.field.DbColumnName, $scope.field.Field.PossibleValues);
            }
        };

        return result;

    });

mod.directive('ctuirMultiselectField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-multiselect.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
               $scope.selectOptions = makeObjectsFromValues($scope.dataset.DatastoreId+$scope.field.DbColumnName, $scope.field.Field.PossibleValues);
            }
        };
        
        return result;

    });

mod.directive('ctuirMultilookupField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-multilookup.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
               $scope.selectOptions = makeObjectsFromValues($scope.dataset.DatastoreId+$scope.field.DbColumnName, $scope.field.Field.PossibleValues);
            }
        };
        
        return result;

    });

mod.directive('ctuirLookupField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-lookup.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
                $scope.selectOptions = makeObjectsFromValues($scope.dataset.DatastoreId+$scope.field.DbColumnName, $scope.field.Field.PossibleValues);
            }
        };

        return result;

    });

mod.directive('ctuirFileField',
    function($modal){
        var result = {
            templateUrl: 'partials/dataentry/field-file.html',
            restrict: 'E',
        };

        return result;
    });

mod.directive('ctuirTempWaypointFileField',
    function($modal){
        var result = {
            templateUrl: 'partials/dataentry/field-waypoint-file.html',
            restrict: 'E',
        };

        return result;
    });

mod.directive('ctuirLinkField',
    function($modal){
        var result = {
            templateUrl: 'partials/dataentry/field-link.html',
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
                    
                    var modalInstance = $modal.open({
                        templateUrl: 'partials/modals/link-modal.html',
                        controller: 'LinkModalCtrl',
                        scope: $scope, //scope to make a child of
                    });
                };
            }
        };

        return result;
    });

mod.directive('ctuirRadioField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-radio.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirCheckboxField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-checkbox.html',
            restrict: 'E',
        };

        return result;

    });
	
mod.directive('uiSelectWrapper',
    function(){

		return {
			link: function(scope, element, attrs) {
				var uiSelectController = element.children().controller('uiSelect');
				console.log("uiSelectController is next...");
				console.dir(uiSelectController);
			}
		}

    });

mod.directive('multiselect', function () {
 
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