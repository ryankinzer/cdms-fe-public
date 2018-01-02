/*
   CellValidator is the parent class for all cell validators.

   Most of the control type definitions also include a cellValidator based on the control type.
   For example, a field of "Text" type has a "CDMSTextCellValidator" that is a subclass of CellValidator
   to handle validating that cell's value according.

// There are three types of validations that need to be run in order to fully validate a field:
//  1) field-level (set in the dataset/master "Validation" column value)
//  2) field-control-type (based on the type of control the field is + any applicable control-dependent field-level validations (like range for a number))
//  3) field-rules (any rule set in the field's "Rule" column value that is of "OnValidate" type);

    First the CellValidator parent class is defined, then all of the children CDMS cell validators

*/

//validation error object. give the field object and the message.
function ValidationError(field, message) {
    this.message = message || '<not provided>';
    this.field = field || null;
};

//Parent class of all cell validators (see below)
function CellValidator() {};

CellValidator.prototype.init = function(cdms_field) {
    this.cdms_field = cdms_field;

    //cache our validations as an array for convenience and performance.
    if (!this.validation)
        this.validation = this.getValidationsArray(this.cdms_field);

    console.log("cdms_field validation initialized for ---------> " + cdms_field.DbColumnName);
    console.dir(this.validation);

    this.errors = [];
};

/*
* Field Control-type validation --
* this should be overridden by subclasses of this object in datasheet-controltype-validation.js
*/
CellValidator.prototype.validateFieldControlTypeValidation = function (data) { };

/*
* to be implemented
* 
*/
CellValidator.prototype.validateFieldOnValidateRule = function (data) { };


/*
* Field-level validation
* This function validates the field value according to the validation rules specified in the dataset field's "Validation" column.
*  It only validates those that are NOT dependent upon the field type (like "required").

* NOTE: validation that is specific to a type of field (number, multiselect) should NOT go here.

* returns an array of ValidationError objects (or [] if no error)

*/
CellValidator.prototype.validateFieldLevelValidation = function (data) {

    //validation: is the field required?
    if (this.validation.contains('required') && (data.value === null || data.value === '')) //this is probably not sufficient.
        this.errors.push(new ValidationError(this.cdms_field, "Field is required."));

    //other types of field-level validation?

    return this.errors;
};


//parses the cdms_field validations and returns an array of validation definitions or [] if none.
// for example a string of: "Required; [1000-2000]" will return: ['required','[1000-2000]']
CellValidator.prototype.getValidationsArray = function (cdms_field) {

    var empty = [];

    if (!cdms_field) {
        console.log("empty cdms_field -- no validations array for you.");
        return empty;
    }

    //get validation from dataset field Validation column - otherwise from master's.
    var validation = cdms_field.Validation || cdms_field.Field.Validation; //prefer dataset over master.

    if (!validation)
        return empty;

    //parse the cdms_field Validation into validation array.
    if (typeof validation !== 'string') //if we aren't a string then it is invalid validation
    {
        console.error(cdms_field.DbColumnName + " - Validation is invalid (not a string)");
        console.dir(validation)
        return empty;
    }

    try {
        validation = validation.toLowerCase();       //ignore case
        validation = validation.replace(/\s/g, '');  //ignore spaces
        validation = validation.split(';');          //split on semicolon: our validation string can be "Required" or "Required; int(3)";
    } catch (e) {
        console.error(cdms_field.DbColumnName + " - Validation is invalid (could not parse). Exception follows:");
        console.dir(e);
        return empty;
    }

    console.log("Found some validation for that field: " + cdms_field.DbColumnName + " -- now parsing... ");
    console.dir(validation);
    console.log("  -- now parsing... ");

    validation = this.getParsedValidationArray(validation); //add the .parsed property to each validation that tokenizes the validation string
    console.dir(validation);

    return validation;


};

//parses number validations by tokens into a validation definition object
// adds a "parsed" property to the validations object if it can parse the validation.
CellValidator.prototype.getParsedValidationArray = function (validations) {
    //btw: handy tool for testing regex: https://www.debuggex.com

    var parsed_validations = [];

    //the regex that matches our "range" validations (ex: "[100,500]")
    var rangeRegex = new RegExp(/\[\d*\,\d*\]$/);

    //the regexs that match the int/float format validations
    var validationMatchers =
        [
            new RegExp(/^(int)\((\d)\)$/), //int(4)
            new RegExp(/^(int)$/),         //int
            new RegExp(/^(float)$/),         //float
            new RegExp(/^(float)\(()(\d)\)$/), //float(4)
            new RegExp(/^(float)\((\d)\,(\d)\)$/),    //float(5,2)
        ];

    //for each validation rule, try to match it with
    //  one of our regex patterns and produce an array
    //  we can use to validate values later. see /tests/validations.js for example output
    validations.forEach(function (val) {
        var matched = false;

        //range
        if (rangeRegex.test(val)) {
            var obj = rangeRegex.exec(val);
            parsed_validations.push({
                number: {
                    'num_type': 'range',
                    'num_range': val,
                }
            });
            matched = true;
        }

        //floats and ints
        validationMatchers.forEach(function (regex) {
            if (regex.test(val)) {
                var obj = regex.exec(val);
                parsed_validations.push({
                    number: {
                        'num_type': obj[1],
                        'num_length': (obj[2] === '') ? undefined : +obj[2], //return undefined, not ''
                        'num_decimal': +obj[3], //+ coerces to number
                        'original': obj.input,
                    }
                });
                //console.log(" -- match --");
                //console.dir(obj);
                //console.dir(val);
                matched = true;
            }
        });

        if (!matched) {
            parsed_validations.push(val);
        }

    });

    return parsed_validations;
};

/**
* Validate our field value and return an array of ValidationErrors if any.
*/
CellValidator.prototype.validate = function (data) {
    this.errors = []; //start fresh!

    this.validateFieldLevelValidation(data);
    this.validateFieldControlTypeValidation(data);
    this.validateFieldOnValidateRule(data);

    return this.errors;
};

/**
* utility function to remove the given column's validation errors from this array
*/
CellValidator.prototype.removeFieldValidationErrors = function (validationErrors, colDef) {
        
    var otherValidationErrors = [];

        if (typeof validationErrors !== 'undefined') {
            //if this error matches the field then skip, otherwise add to our otherValidationErrors array.
            validationErrors.forEach(function (error, index) {
                if (error.field.DbColumnName !== colDef.field)
                    otherValidationErrors.push(error);
            });
        }

        return otherValidationErrors;
};


/*
 * All CDMS cell validators are defined below ---------------------------------------------------------------------------------------- ///////
 */

//see the structure of this.validation (array of parsed field-level validations) in the "output" section of: tests/validations.js

// to write a new validator, follow the pattern: subclass the CellValidator, implement the validateFieldControlTypeValidation function.

//CDMSTextCellValidator --------------------------------------
function CDMSTextCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSTextCellValidator.prototype = new CellValidator;

CDMSTextCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    //the ken error
    if (data.value != "ken")
        this.errors.push(new ValidationError(this.cdms_field, "Your name must be KEN"));

    return this.errors;
};


/*

[ 'required',
  { number:
     { num_type: 'int',
       num_length: '4',
       num_decimal: undefined,
       original: 'int(4)' } },
  { number:
     { num_type: 'int',
       num_length: undefined,
       num_decimal: undefined,
       original: 'int' } },
  { number:
     { num_type: 'float',
       num_length: undefined,
       num_decimal: undefined,
       original: 'float' } },
  { number:
     { num_type: 'float',
       num_length: undefined,
       num_decimal: '3',
       original: 'float(3)' } },
  { number:
     { num_type: 'float',
       num_length: '5',
       num_decimal: '2',
       original: 'float(5,2)' } },
  'year',
  { number: { num_type: 'range', num_range: '[200,500]' } } ]

*/

//CDMSNumberCellValidator ----------------------------------
function CDMSNumberCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSNumberCellValidator.prototype = new CellValidator;

CDMSNumberCellValidator.prototype.validateFieldControlTypeValidation = function (data) {
    //we are a number, so spin through and test any of our validations that are "number" types

    console.log("validateFieldControlTypeValidation ------------------------------------------------ ");
    console.dir(data);

    //if it is empty, don't bother (required is a different constraint that can be applied)
    if (data.value === null || data.value === "")
        return this.errors;

    //validation: is the field numeric?
    if (!isNumber(data.value)) {
        this.errors.push(new ValidationError(this.cdms_field, "Field must be numeric."));
        return this.errors; //early return -- if the value isn't numeric, our other validation will fail, so don't clutter things up.
    }

    var _this = this;

    //iterate each validation in "Validation" field and
    // validate any of the constraints that are "number" (float, int, # of digits, etc.)
    this.validation.forEach(function (val) {

        try {

            //if this validation is a "number" constraint
            if (typeof val === 'object' && val.hasOwnProperty('number')) 
            {

                //is it supposed to be an int? how many digits?
                if (val.number.num_type === "int") {
                    if (!isInteger(+data.value)) { //+ coerces to a number
                        _this.errors.push(new ValidationError(_this.cdms_field, "Field must be an integer."));
                    } else {
                        
                        console.log("is an integer we're checking... ");
                        console.dir(val);

                        //the number of digits specified for validation
                        if (typeof val.number.num_length !== 'undefined' && typeof val.number.num_length === 'number') {
                            var re_num_length = new RegExp("^\\d{" + val.number.num_length + "," + val.number.num_length + "}$"); // ^\d{2,2}$ ==> 2 digit int
                            if (!re_num_length.test(data.value))
                                _this.errors.push(new ValidationError(_this.cdms_field, "Field must be an integer with " + val.number.num_length + " digits."));
                        }
                    }
                }

                //is it supposed to be a float? how many digits? how many decimals?
                // this is specified with: "float(3,2)" where 3 = num_length and 2 = num_decimal; e.g. 351.33 would match
                // they can also specify: "float(3)" where 3 = num_decimal and num_length is undefined so it can be as long as they want; e.g. 4482.223 would match
                if (val.number.num_type === "float") {
                    //NOTE: since an integer is also a float, and we've already tested that it is a number, there isn't a test purely for float: if (!isFloat(data.value+0)) {
                    
                    //this case is when both num_length and num_decimal are specified: float(2,3).
                    if (typeof val.number.num_length !== 'undefined' && typeof (val.number.num_length === 'number')) {

                        //  if the num_length is specified then there MUST be a decimal specified.
                        if (typeof val.number.num_decimal === 'undefined' || typeof val.number.num_decimal !== 'number')
                        {
                            console.error("Validation constraint is invalid for " + _this.cdms_field.DbColumnName + ": decimal must be specified if length is specified");
                            return; //skip the rest, there is nothing we can do.
                        }

                        var re_num_length = new RegExp(
                            "^\\d{" + val.number.num_length + "," + val.number.num_length + "}\\.{" + val.number.num_decimal + "," + val.number.num_decimal + "}$"
                        ); // ^\d{2,2}\.{3,3}$ ==> 2 digit float with 3 decimal places e.g. 52.432

                        if (!re_num_length.test(data.value))
                            _this.errors.push(new ValidationError(_this.cdms_field, "Field must be decimal (float) with " + val.number.num_length + " digits and " + val.number.num_decimal + " decimal places."));

                    } else { 
                        //this case is when only num_decimal is specified: float(3) 
                        if (typeof val.number.num_decimal !== 'undefined' || typeof (val.number.num_decimal) === 'number') {

                            var re_num_dec = new RegExp(
                                "^\\d*\\.{" + val.number.num_decimal + "," + val.number.num_decimal + "}$"
                            ); // ^\d*\.{3,3}$ ==> any digit float with 3 decimal places e.g. 52.432

                            if (!re_num_dec.test(data.value))
                                _this.errors.push(new ValidationError(_this.cdms_field, "Field must be decimal (float) with " + val.number.num_decimal + " decimal places."));
                        }
                    }
                }

                //is it within the constrained range?
                if (val.number.num_type === "range") {
                    try {
                        var range_array = angular.fromJson(val.number.num_range);
                        if (Array.isArray(range_array)) {
                            var num_from = range_array[0];
                            var num_to = range_array[1];
                            
                            if (typeof num_from !== 'undefined' && typeof num_from === 'number' &&
                                typeof num_to !== 'undefined' && typeof num_to === 'number') {

                                if (data.value < num_from || data.value > num_to )
                                    _this.errors.push(new ValidationError(_this.cdms_field, "Field value is out of range: " + num_from + " - " + num_to ));
                            }
                        }
                        
                    }
                    catch (e) {
                        console.error("Validation for range could not be converted to array (or something similar)");
                        console.dir(e);
                    }
                }

                //any other numeric types? they'd go here

            }

        } catch (e) {
            console.error("Problem with Validation constraint on field : " + _this.cdms_field.DbColumnName);
            console.log(e);
        }

        
    }); //end for each validation

    return this.errors;
};





//NEXT! ---------------------------------------------

/*
Rules are callback functions that fire after cell editing finishes
rules look like this where 'params' is the ag-grid params

function(params) {
    //params.ruleType
    //params.data
    //params.cdmsField
    //params.
};

*/

function fireRules(type, row, field, value, headers, errors, scope) {
    var row_errors = errors; //older rules use "row_errors"
    try {
        //fire Field rule if it exists -- OnChange
        if (field.Field && field.Field.Rule && field.Field.Rule[type]) {
            //console.log("Dataset field rule: " + field.Field.Rule[type]);
            if (type == "DefaultValue")
                field.DefaultValue = field.Field.Rule[type];
            else
                eval(field.Field.Rule[type]);
        }

        //fire Datafield rule if it exists -- OnChange
        if (field.Rule && field.Rule[type]) {
            console.log("Master field rule: " + field.Rule[type]);
            if (type == "DefaultValue")
                field.DefaultValue = field.Rule[type];
            else
                eval(field.Rule[type]);
        }
    } catch (e) {
        //so we don't die if the rule fails....
        console.dir(e);
    }

}