//CDMSSelectCellValidator - extends CellValidator

// validates dropdown list cells against the possible values. 

function CDMSSelectCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSSelectCellValidator.prototype = new CellValidator;

CDMSSelectCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    //validate: does the value exist in the PossibleValues?

    //first, make sure our PossibleValues is properly defined for this field...
    if (typeof data.colDef.cellEditorParams === 'undefined' ||
        typeof data.colDef.cellEditorParams.values === 'undefined' || 
        !Array.isArray(data.colDef.cellEditorParams.values)) {

        console.error("Configuration error: [" + data.colDef.cdmsField.DbColumnName + "] is a SELECT but PossibleValues is undefined.");
        console.dir(data);
        this.errors.push(new ValidationError(this.cdms_field, "System error: no PossibleValues defined for this field."));
    }
    else //Possible Values exist and we can use them as an array
    {
        if (!data.colDef.cellEditorParams.values.contains(data.value))
            this.errors.push(new ValidationError(this.cdms_field, "Invalid selection (" + data.value + " not in PossibleValues)."));
    }

    return this.errors;
};