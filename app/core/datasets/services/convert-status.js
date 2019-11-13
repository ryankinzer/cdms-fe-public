
datasets_module.service('ConvertStatus', ['Logger', '$window', '$route',
    function (Logger, $window, $route, $q) {

        var service = {

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
            convertStatusToInt: function (aStatus) {
                //console.log("Inside convertStatus...");
                //console.log("aStatus = " + aStatus);

                var intStatus = 1;

                if (aStatus === "Active") {
                    intStatus = 0;
                }

                //console.log("intStatus = " + intStatus);

                return intStatus;
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