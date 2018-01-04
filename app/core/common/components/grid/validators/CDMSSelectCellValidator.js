//CDMSSelectCellValidator - extends CellValidator

// validates dropdown list cells against the possible values. 

function CDMSSelectCellValidator(cdms_field) {
    this.base = CellValidator;
    this.base(cdms_field);
};
CDMSSelectCellValidator.prototype = new CellValidator;

CDMSSelectCellValidator.prototype.validateFieldControlTypeValidation = function (data) {

    if (!data.value)
        return this.errors; //early return -- don't bother if we don't have a value

    //validate: does the value exist in the PossibleValues?
    
    //first, make sure our PossibleValues is properly defined for this field...
    if (typeof data.colDef.cellEditorParams === 'undefined' ||
        typeof data.colDef.cellEditorParams.values === 'undefined') {

        console.error("Configuration error: [" + data.colDef.cdmsField.DbColumnName + "] is a SELECT but PossibleValues is undefined.");
        console.dir(data);
        this.errors.push(new ValidationError(this.cdms_field, "System error: no PossibleValues defined for this field."));
    }
    else //Possible Values exist and we can use them
    {
        //is the multiselect possiblevalues an array? if not, we need to compare the keys not the values because possible values is using aliases
        if (Array.isArray(data.colDef.cellEditorParams.values)) {
            if (!data.colDef.cellEditorParams.values.contains(data.value))
                this.errors.push(new ValidationError(this.cdms_field, "Invalid selection (" + data.value + " not in PossibleValues)."));
        }
        else
        {
            if (!Object.keys(data.colDef.cellEditorParams.values).contains(data.value))
                this.errors.push(new ValidationError(this.cdms_field, "Invalid selection (" + data.value + " not in PossibleValues)."));
        }
    }

    return this.errors;
};