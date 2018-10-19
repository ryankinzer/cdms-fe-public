//CDMSNumberCellValidator - extends CellValidator

// validates numeric type fields according to the constraints specified in the cdms_field "Validation" field.

/* this is the format of the cdms field validation array after parsing the "Validation" column.

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

function CDMSNumberCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSNumberCellValidator.prototype = new CellValidator;

CDMSNumberCellValidator.prototype.validateFieldControlTypeValidation = function (data) {
    //we are a number, so spin through and test any of our validations that are "number" types

    //console.log("Number Validation ------------------------------------------------ ");
    //console.dir(data);
    //console.dir(this.validation);

    //if it is empty, don't bother (required is a different constraint that can be applied and is run earlier)
    if (data.value === null || data.value === "")
        return this.errors;

    //validation: is the field numeric?
    if (!isNumber(data.value)) {
        this.errors.push(new ValidationError(this.cdms_field, "Value must be a number."));
        return this.errors; //early return -- if the value isn't numeric, our other validation will fail, so bail out.
    }

    var _this = this;

    //iterate each validation in "Validation" field (we can have more than one separated by semicolons) 
    // validate any of the constraints that are "number" (float, int, # of digits, etc.)
    this.validation.forEach(function (val) {
        //console.dir(val);
        try {

            //if this validation is a "number" constraint
            if (typeof val === 'object' && val.hasOwnProperty('number')) {

                //is it supposed to be an int? how many digits?
                if (val.number.num_type === "int") {
                    if (!isInteger(+data.value)) { //+ coerces to a number
                        _this.errors.push(new ValidationError(_this.cdms_field, "Value must be an integer."));
                    } else {

                        console.log("is an integer we're checking... ");
                        console.dir(val);

                        //the number of digits specified for validation
                        if (typeof val.number.num_length === 'number' && !Number.isNaN(val.number.num_length)) {
                            var re_num_length = new RegExp("^\\d{" + val.number.num_length + "," + val.number.num_length + "}$"); // ^\d{2,2}$ ==> 2 digit int
                            if (!re_num_length.test(data.value))
                                _this.errors.push(new ValidationError(_this.cdms_field, "Value must be an integer with " + val.number.num_length + " digits."));
                        }
                    }
                }

                //is it supposed to be a float? how many digits? how many decimals?
                // this is specified with: "float(3,2)" where 3 = num_length and 2 = num_decimal; e.g. 351.33 would match
                // they can also specify: "float(3)" where 3 = num_decimal and num_length is undefined so it can be as long as they want; e.g. 4482.223 would match
                if (val.number.num_type === "float") {
                    //NOTE: since an integer is also a float, and we've already tested that it is a number, there isn't a test purely for float: if (!isFloat(data.value+0)) {

                    //this case is when both num_length and num_decimal are specified: float(2,3).
                    if (!Number.isNaN(val.number.num_length)) {

                        //  if the num_length is specified then there MUST be a decimal specified.
                        if (Number.isNaN(val.number.num_decimal)) {
                            console.error("Validation constraint is invalid for " + _this.cdms_field.DbColumnName + ": decimal must be specified if length is specified");
                            return; //skip the rest, there is nothing we can do.
                        }

                        var re_num_length = new RegExp(
                            "^\\d{" + val.number.num_length + "," + val.number.num_length + "}\\.\\d{" + val.number.num_decimal + "," + val.number.num_decimal + "}$"
                        ); // ^\d{2,2}\.\d{3,3}$ ==> 2 digit float with 3 decimal places e.g. 52.432

                        if (!re_num_length.test(data.value))
                            _this.errors.push(new ValidationError(_this.cdms_field, "Value must be decimal (float) with " + val.number.num_length + " digits and " + val.number.num_decimal + " decimal places."));

                    } else {
                        //this case is when only num_decimal is specified: float(3) 
                        if (!Number.isNaN(val.number.num_decimal)) {

                            var re_num_dec = new RegExp(
                                "^\\d*\\.{" + val.number.num_decimal + "," + val.number.num_decimal + "}$"
                            ); // ^\d*\.{3,3}$ ==> any digit float with 3 decimal places e.g. 52.432

                            if (!re_num_dec.test(data.value))
                                _this.errors.push(new ValidationError(_this.cdms_field, "Value must be decimal (float) with " + val.number.num_decimal + " decimal places."));
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

                            if (!Number.isNaN(num_from) && !Number.isNaN(num_to)) {

                                if (data.value < num_from || data.value > num_to)
                                    _this.errors.push(new ValidationError(_this.cdms_field, "Value is out of range: " + num_from + ":" + num_to));
                            }
                        }

                    }
                    catch (e) {
                        console.error("Validation for range could not be converted to array (or something similar)");
                        console.dir(e);
                    }
                }

                //any other numeric types? they'd go here

            } else {
                console.warn("Validation could not be parsed for this column: " + _this.cdms_field.DbColumnName);
                console.dir(val);
            }

        } catch (e) {
            console.error("Problem with Validation constraint on field : " + _this.cdms_field.DbColumnName);
            console.log(e);
        }


    }); //end for each validation

    return this.errors;
};