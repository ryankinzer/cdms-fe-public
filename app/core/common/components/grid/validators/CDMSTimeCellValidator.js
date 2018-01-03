//CDMSTimeCellValidator - extends CellValidator

// validates time cells. 


function CDMSTimeCellValidator(cdms_field) {
    this.base = CellValidator;
    console.log("calling constructor?");
    this.base(cdms_field);
    //this.init(cdms_field);
};
CDMSTimeCellValidator.prototype = new CellValidator;

CDMSTimeCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    //george's time checking

    var value = data.value;

    var timeContentValid = true;

    if (!is_empty(value) && !stringIsTime(value))
        timeContentValid = false;
    else if (value.indexOf(".") > -1)
        timeContentValid = false;
    else if (value.indexOf(":") === -1)
        timeContentValid = false;

    if (!timeContentValid)
        this.errors.push(new ValidationError(this.cdms_field, "Value is not a valid time (hh:mm)."));


    return this.errors;
};