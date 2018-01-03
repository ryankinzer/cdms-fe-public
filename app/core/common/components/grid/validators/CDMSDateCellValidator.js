//CDMSDateCellValidator - extends CellValidator

// validates date cells. 


function CDMSDateCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSDateCellValidator.prototype = new CellValidator;

CDMSDateCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    //i wonder if it wouldn't be better to use moment.js?: 
    //  var dateFormat = "YYYY-MM-DD hh:mm"; moment(the_date, dateFormat, true).isValid()
    if (isNaN(Date.parse(data.value)))
        this.errors.push(new ValidationError(this.cdms_field, "Value is not a date (mm/dd/yyyy)."));
    
    return this.errors;
};