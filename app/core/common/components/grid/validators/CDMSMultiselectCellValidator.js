//CDMSMultiselectCellValidator - extends CellValidator

// validates dropdown list selections against the possible values. 

function CDMSMultiselectCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSMultiselectCellValidator.prototype = new CellValidator;

CDMSMultiselectCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    if (!data.value)
        return this.errors; //early return -- don't bother if we don't have a value

    //validate: do the values exist in the PossibleValues?

    //first, make sure our PossibleValues is properly defined for this field...
    if (typeof data.colDef.cellEditorParams === 'undefined' ||
        typeof data.colDef.cellEditorParams.values === 'undefined' ||
        !Array.isArray(data.colDef.cellEditorParams.values)) {

        console.error("Configuration error: [" + data.colDef.cdmsField.DbColumnName + "] is a MULTISELECT but PossibleValues is undefined.");
        console.dir(data);
        this.errors.push(new ValidationError(this.cdms_field, "System error: no PossibleValues defined for this field."));
    }
    else //Possible Values exist and we can use them as an array
    {
        //iterate the values in the multiselect and make sure they are in the PossibleValues list.
        if (Array.isArray(data.value)) {
            _this = this;
            data.value.forEach(function (value) {
                if (!data.colDef.cellEditorParams.values.contains(value))
                    _this.errors.push(new ValidationError(_this.cdms_field, "Invalid selection (" + value + " not in PossibleValues)."));
            });
        }
    }

    return this.errors;
};