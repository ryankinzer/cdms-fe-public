/*
   CellValidator is the parent class for all cell validators.

   Most of the control type definitions also include a cellValidator based on the control type.
   For example, a field of "Text" type has a "CDMSTextCellValidator" that is a subclass of CellValidator
   to handle validating that cell's value.

// There are three types of validations that need to be run in order to fully validate a field:
//  1) field-level (set in the dataset/master "Validation" column value)
//  2) field-control-type (based on the type of control the field is + any applicable control-dependent field-level validations)
//  3) field-rules (any rule set in the field's "Rule" column value that is of "OnValidate" type);

    Every field will get a CellValidator attached, even if it is just the basic CellValidator. The specialized subclasses
    (CDMSNumberCellValidator, for example) handles the field-control-type validation in its own special way.

*/

//define our cell validators. they will be loaded at the end of this file via requireJS.
var cellValidators = [
    'core/common/components/grid/validators/CDMSTextCellValidator',
    'core/common/components/grid/validators/CDMSNumberCellValidator',
    'core/common/components/grid/validators/CDMSDateCellValidator',
    'core/common/components/grid/validators/CDMSDateTimeCellValidator',
    'core/common/components/grid/validators/CDMSTimeCellValidator',
    'core/common/components/grid/validators/CDMSMultiselectCellValidator',
    'core/common/components/grid/validators/CDMSSelectCellValidator',
];


//validation error object. give the field object and the message.
function ValidationError(field, message) {
    this.message = message || '<error message not provided>';
    this.field = field || null;
};

//Parent class of all cell validators (see below)
function CellValidator(cdms_field) {
    if (cdms_field)
    {
        this.cdms_field = cdms_field;

        //cache our validations as an array for convenience and performance.
        if (!this.validation)
            this.validation = this.getValidationsArray(this.cdms_field);

        //console.log("cdms_field validation initialized for ---------> " + cdms_field.DbColumnName);
        //console.dir(this.validation);

        this.errors = [];
    }
};


/*
* Field Control-type validation --
* this will be overridden by subclasses of this object to provide validation for that type.
*/
CellValidator.prototype.validateFieldControlTypeValidation = function (data) { };

/*
* to be implemented - runs on each field to fire any "OnValidate" rule that may be configured
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
    //console.log("Running validateFieldLevelValidation");
    //console.dir(data);
    //console.dir(this.validation);
    //validation: is the field required? "required" or "nb" (for "not blank")
    if (  (this.validation.contains('required') || this.validation.contains("nb")) ) {

        console.log("Checking required field: ")
        console.dir(this.cdms_field);

        if((data.value == undefined || data.value === null || data.value === '')) //this is probably not sufficient.
            this.errors.push(new ValidationError(this.cdms_field, "Field is required."));

    }
    //other types of field-level validation?
    //console.dir(this.errors);
    return this.errors;
};


//parses the cdms_field validations and returns an array of validation definitions or [] if none.
// for example a string of: "Required; [1000-2000]" will return: ['required','[1000-2000]']
// see tests/validations.js for an example of the array that gets returned.

CellValidator.prototype.getValidationsArray = function (cdms_field) {

    var empty = [];

    if (!cdms_field) {
        console.log("empty cdms_field -- no validations array for you.");
        return empty;
    }

    //get validation from dataset field Validation column - otherwise from master's.
    var validation = (cdms_field.Field) ? cdms_field.Validation || cdms_field.Field.Validation : cdms_field.Validation ; //prefer dataset over master.

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

//    console.log("Found some validation for that field: " + cdms_field.DbColumnName + " -- now parsing... ");
//    console.dir(validation);
//    console.log("  -- now parsing... ");

    validation = this.getParsedValidationArray(validation); //add the .parsed property to each validation that tokenizes the validation string

//    console.log("completed validation parsing: ");
//    console.dir(validation);

    return validation;


};

//parses number validations by tokens into a validation definition object
// adds a "parsed" property to the validations object if it can parse the validation.
CellValidator.prototype.getParsedValidationArray = function (validations) {
    //btw: handy tool for testing regex: https://www.debuggex.com

    var parsed_validations = [];

    //the regex that matches our "range" validations (ex: "[100,500]" or )
    var rangeRegex = new RegExp(/\[-?\d*\,-?\d*\]$/);

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
                        'num_length': +obj[2],  //+
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
*  this function is what should be called after a cell is edited.
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
                if (error.field && error.field.DbColumnName !== colDef.DbColumnName)
                    otherValidationErrors.push(error);
            });
        }

        return otherValidationErrors;
};


require(cellValidators, function () { });


