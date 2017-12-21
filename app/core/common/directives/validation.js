
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
common_module.directive('integer', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (viewValue == "") {
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
common_module.directive('integerfour', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (viewValue == "") {
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
//common_module.directive('smartFloat', function() { // Note:  with the one uppercase letter, the caller cannot find this directive.
common_module.directive('smartfloat', function () { // With all lowercase like this, the caller CAN find this directive.
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (viewValue == "") {
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
common_module.directive('sixfloat', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (viewValue == "") {
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
common_module.directive('sevenfloat', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (viewValue == "") {
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

common_module.directive('textrequired', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (viewValue == "") {
                    ctrl.$setValidity('text', false);
                    return undefined;
                }
                else {
                    ctrl.$setValidity('text', true);
                    return true;
                }

            });
        }
    };
});