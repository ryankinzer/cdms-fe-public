//ag-grid field renderer service



datasets_module.service('GridService', ['$window', '$route',
    function ($window, $route, $q) {

        var service = {

            //sets the control type object (defines renderers, editors, formatters, etc.)
            //  for this field based on the cdms_field.ControlType
            setRendererForField: function (cdms_field, col_def)
            {
                //is it in our field library (Instrument, Fishermen, Location, etc.)
                //TODO

                //is it a list? (to be implemented feature)
                //TODO
                
                //ControlType RENDERERS: get the field's definition by controltype
                var control_type_renderer = ControlTypeDefinitions[cdms_field.ControlType];
                //console.log(cdms_field.DbColumnName + " ----------------------------------------------------------");

                if (control_type_renderer && typeof control_type_renderer === "function") {
                    var new_col_def = control_type_renderer(cdms_field, col_def);
                  //  console.dir(new_col_def);
                    return new_col_def;
                }

                //console.dir(cdms_field);

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