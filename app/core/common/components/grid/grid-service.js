//ag-grid service

datasets_module.service('GridService', ['$window', '$route',
    function ($window, $route, $q) {

        var service = {

            //sets the control for the field(defines renderers, editors, validators, formatters, etc.)
            //  based on the cdms_field.ControlType
            
            setupColDefForField: function (cdms_field, col_def)
            {
                //gets the control type definition function
                var col_builder = getControlDefinition(cdms_field.ControlType);

                if (col_builder !== null) {

                    //build this field's column definition (adds to the col_def)
                    col_builder(cdms_field, col_def); 

                    //setup this field's validator (if it has one defined)
                    if (col_def.hasOwnProperty('cellValidator')) {
                        var validatorFunction = col_def.cellValidator;
                        col_def.validator = new validatorFunction(cdms_field);
                    }

                    //add a function to the column to populate PossibleValues
                    if (col_def.hasOwnProperty('cellEditorParams')) {
                        col_def.setPossibleValues = function (in_values) {
                            if (this.hasOwnProperty('cellEditorParams'))
                                this.cellEditorParams.values = in_values;
                        };
                    }
                }
                else {
                    console.warn("Notice: There isn't a ControlTypeDefinition for " + cdms_field.DbColumnName + " with ControlType = " + cdms_field.ControlType);
                }  
            },

            convertStatus: function (aStatus) {
                //console.log("Inside convertStatus...");
                //console.log("aStatus = " + aStatus);

                var strStatus = null;

                if (aStatus === 0) {
                    strStatus = "Active";
                }
                else {
                    strStatus = "Inactive";
                }
                //console.log("strStatus = " + strStatus);

                return strStatus;
            },
            convertOkToCall: function (aStatus) {
                //console.log("Inside convertOkToCall...");
                //console.log("aStatus = " + aStatus);

                var strStatus = null;

                if (aStatus === 0) {
                    strStatus = "Yes";
                }
                else {
                    strStatus = "No";
                }
                //console.log("strStatus = " + strStatus);

                return strStatus;
            },
        }
        return service;
    }]);