//CDMSDateCellValidator - extends CellValidator

// validates date cells. 


function CDMSDateCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSDateCellValidator.prototype = new CellValidator;

CDMSDateCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    if (data.value == null || data.value == "")
        return;

    console.log("validating: " + data.value + " as a date.");

    the_date = moment(data.value, ["MM/DD/YYYY", "YYYY-MM-DD"], false); //will try both formats, strict=true

    console.dir(the_date);

    if (!the_date.isValid())
        this.errors.push(new ValidationError(this.cdms_field, "Value is not a date (mm/dd/yyyy)."));
    
    console.log("Result is: " + the_date.isValid());
    console.dir(this.errors);

    return this.errors;
};