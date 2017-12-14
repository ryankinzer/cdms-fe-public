//ag-grid field renderer service

//common renderers are defined in this section. 
// functions create dynamic ones (lists, or service based)
 

datasets_module.service('FieldRendererService', ['$window', '$route',
    function ($window, $route, $q) {

        var service = {

            setRendererForField: function (cdms_field, col_def, grid_options)
            {
                if (col_def.field === "Species")
                {
                    var SpeciesCellRenderer = function (params) {
                        console.log("In renderer!");
                        console.dir(params);
                        return params.value;
                    };

                    grid_options.components.speciesCellRenderer = SpeciesCellRenderer;

                    col_def.cellRenderer = 'speciesCellRenderer';
                    col_def.cellEditor = 'agSelectCellEditor';
                    col_def.cellEditorParams = {
                        cellRenderer: 'speciesCellRenderer',
                        values: ['CHR','ABC','BUT'],
                    };
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