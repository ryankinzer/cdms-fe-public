//CDMSTextCellValidator - extends CellValidator (use this one as a template for other validators)

// validates text cells. this is just an example as there isn't any validation for text fields.

//see the structure of this.validation (array of parsed field-level validations) in the "output" section of: tests/validations.js

// to write a new validator, follow the pattern: subclass the CellValidator, implement the validateFieldControlTypeValidation function.


function CDMSTextCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSTextCellValidator.prototype = new CellValidator;

CDMSTextCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    //you can validate text cells and push any errors that arise.

    //for example: the ken error
    //if (data.value != "ken")
    //    this.errors.push(new ValidationError(this.cdms_field, "Your name must be KEN"));

    return this.errors;
};