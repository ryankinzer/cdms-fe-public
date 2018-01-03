//CDMSDateTimeCellValidator - extends CellValidator

// validates datetime cells. 


function CDMSDateTimeCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSDateTimeCellValidator.prototype = new CellValidator;

CDMSDateTimeCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    //i wonder if it wouldn't be better to use moment.js?
    if (isNaN(Date.parse(data.value))) {
        this.errors.push(new ValidationError(this.cdms_field, "Value is not a date-time (mm/dd/yyyy hh:mm)."));
    }
    else // it IS a valid date value, make sure it isn't older than 1901!
    {
        var theDate = new Date(data.value);
        var theYear = theDate.getFullYear();
    
        if (theYear < 1901)
            this.errors.push(new ValidationError(this.cdms_field, "Year is before 1901 (set from Excel?); Please update year."));
    }

    return this.errors;
};