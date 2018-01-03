//CDMSTextCellValidator - extends CellValidator (use this one as a template for other validators)

// validates text cells. this is just an example as there isn't any validation for text fields.

//this.validation is an array of validations parsed from the cdms_field.Validation column.
//see the structure of this.validation array in the "output" section of: tests/validations.js

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


    //"t" - this is for backwards compatibility support for text fields that actually hold time.
    //     in the future we want to always store time as datetime (best practice) so that we can do datemath without converting, etc. 
    //     but for now we will allow "t" in the cdms_field.Validation column on a "text" cdms_field.ControlType to validate here.
    if (this.validation[0] == "t")
    {
        var time_validator = new CDMSTimeCellValidator(data.colDef.cdmsField); //there should only be ONE place that time validation happens, the CDMSTimeCellValidator...
        this.errors = time_validator.validateFieldControlTypeValidation(data); 
    }

    //"nb" - not blank - same as required, so is handled at field-level

    return this.errors;
};