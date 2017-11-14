
common_module.service('ServiceUtilities', ['Logger', '$window', '$route',
    //mod.service('ServiceUtilities',[ 'Logger', '$window', '$route', $q, // Note:  If you had the $q on this line, it causes an error.
    function (Logger, $window, $route, $q) {

        var service = {

            // ***** Date and Time functions start *****
            checkDateTimeFormat1: function (strDateTime) {
                var DateTime_REGEXP = /^\d{4}(-)\d{2}(-)\d{2}( )\d{2}(:)\d{2}$/;

                if (DateTime_REGEXP.test(strDateTime)) {
                    return true;
                }
                else {
                    return undefined;
                }
            },

            dateTimeNowToStrYYYYMMDD_HHmmSS: function () {
                // This function gets a date/time hack (now), and returns it in the format of YYYYMMDD_HHmmSS
                var dtNow = new Date();
                var intYear = dtNow.getFullYear();
                var intMonth = dtNow.getMonth();
                var strMonth = this.padNumber(intMonth);
                var intDate = dtNow.getDate();
                var strDate = this.padNumber(intDate);
                var intHours = dtNow.getHours();
                var strHours = this.padNumber(intHours);
                var intMinutes = dtNow.getMinutes();
                var strMinutes = this.padNumber(intMinutes);
                var intSeconds = dtNow.getSeconds();
                var strSeconds = this.padNumber(intSeconds);
                var strNow = intYear + strMonth + strDate + "_" + strHours + strMinutes + strSeconds;
                return strNow;
            },

            dateTimeNowToStrYYYYMMDD_HHmmSS2: function () {
                // This function takes a date/time hack (now), and returns it in the format of YYYY-MM-DD HH:mm:SS.nnn
                var dtNow = new Date();
                var intYear = dtNow.getFullYear();
                var intMonth = dtNow.getMonth();
                var strMonth = this.padNumber(intMonth);
                var intDate = dtNow.getDate();
                var strDate = this.padNumber(intDate);
                var intHours = dtNow.getHours();
                var strHours = this.padNumber(intHours);
                var intMinutes = dtNow.getMinutes();
                var strMinutes = this.padNumber(intMinutes);
                var intSeconds = dtNow.getSeconds();
                var strSeconds = this.padNumber(intSeconds);
                var intMilliseconds = dtNow.getMilliseconds();
                var strMilliseconds = this.padNumber(intMilliseconds);
                var strNow = intYear + "-" + strMonth + "-" + strDate + " " + strHours + ":" + strMinutes + ":" + strSeconds + "." + strMilliseconds;
                return strNow;
            },

            removeTSfromDateTimeString: function (strDate) {
                // This function takes a date/time string like this:  2015-08-14T00:00:00
                // and make it look like this:  2015-08-14 00:00
                console.log("strDate = " + strDate);
                strDate = strDate.replace("T", " ");
                strDate = strDate.substring(0, (strDate.length - 3));
                return strDate;
            },

            extractDateFromString: function (strDate) {
                // This function takes an incoming date in this format:  2015-08-14T00:00:00
                // and extracts/converts it to this format:  2015-08-14
                console.log("Inside extractDateFromString...");
                console.log("strDate = " + strDate);

                var newDate = strDate.substring(0, 10);
                console.log("newDate = " + newDate);

                return newDate;
            },

            extractTimeFromString: function (strDateTime) {
                // This function takes an incoming date in this format:  2015-08-14T08:00:00
                // and extracts/converts it to this format:  08:00
                console.log("Inside extractTimeFromString...");
                console.log("strDateTime = " + strDateTime);

                var newTime = strDateTime.substring(11, 16);
                console.log("newTime = " + newTime);

                return newTime;
            },

            extractTimeFromString2: function (strDateTime) {
                // This function takes an incoming date as string, in one of these formats,
				/*	(HH:MM),
				*	(HH:MM:SS),
				*	(YYYY-MM-DDTHH:mm:SS format)
				*/
                // and extracts the time (HH:MM) from the string.

                //console.log("strDateTime = " + strDateTime);
                var theString = strDateTime;
                //var theLength = theString.length;
                var colonLocation = theString.indexOf(":");

                // Some fields may have double quotes on the time fields.
                // To determine if they do, we remove (via replace) the double quotes.
                // Then we compare the string length from before and after the replace action.
                var stringLength = theString.length;
                var tmpString = theString.replace("\"", "");
                var tmpStringLength = tmpString.length;
                //console.log("colonLocation = " + colonLocation + ", stringLength = " + stringLength);

                if (stringLength !== tmpStringLength) {
                    //console.log("The string includes double quotes..");
                    // The string includes "" (coming from a CSV file) so we must allow for them.
                    if (stringLength > 5)	// "HH:MM:SS"  Note the "", or YYYY-MM-DDTHH:mm:SS
                        theString = theString.substring(colonLocation - 2, stringLength - 4);
                }
                else {
                    //console.log("The string DOES NOT have double quotes...");
                    if (stringLength > 5)	// "HH:MM:SS"  Note the "", or YYYY-MM-DDTHH:mm:SS
                        theString = theString.substring(colonLocation - 2, stringLength - 3);
                }
                return theString;
            },

            extractYearFromString: function (strDateTime) {
                // This function takes an incomving date as string (YYYY-MM-DDTHH:mm:SS format), and extracts the year (YYYY) from it.
                var theString = strDateTime;
                var hyphenLocation = theString.indexOf("-");
                if (hyphenLocation < 0)
                    return hyphenLocation;

                theString = theString.substr(0, hyphenLocation); //(start where, how many)

                // Some fields may have double quotes on the time fields.
                // To determine if they do, we remove (via replace) the double quotes.
                // Then we compare the string length from before and after the replace action.
                var stringLength = theString.length;
                var tmpString = theString.replace("\"", "");
                var tmpStringLength = tmpString.length;
                //console.log("hyphenLocation = " + hyphenLocation + ", stringLength = " + stringLength);

                if (stringLength !== tmpStringLength) {
                    //console.log("The string includes double quotes..");
                    // The string includes "" (coming from a CSV file) so we must allow for them.
                    theString = theString.substr(1, 4);
                }
                else {
                    //console.log("The string DOES NOT have double quotes...");
                    theString = theString.substr(0, 4);
                }
                return theString;
            },

            padNumber: function (number) {
                // This function takes a number (< 10) as string, and adds a leading zero to it.
                // Changes this:  "2"
                // To this:  "02"
                console.log("Inside padNumber...");

                if (number < 10) {
                    return '0' + number;
                }
                return number;
            },


            toExactISOString: function (a_date) {
                // This function takes a date as DateTime, and converts is to a string
                // that looks like this:  2017-02-04T08:05:04.123Z
                console.log("Inside toExactISOString...");
                console.log("a_date is next...");
                console.dir(a_date);

                if (a_date.getFullYear() < 1950)
                    a_date.setFullYear(a_date.getFullYear() + 100);

                var s_utc = a_date.getFullYear() +
                    '-' + this.padNumber(a_date.getMonth() + 1) +
                    '-' + this.padNumber(a_date.getDate()) +
                    'T' + this.padNumber(a_date.getHours()) +
                    ':' + this.padNumber(a_date.getMinutes()) +
                    ':' + this.padNumber(a_date.getSeconds()) +
                    // '.' + (a_date.getMilliseconds() / 1000).toFixed(3).slice(2, 5); // original line
                    '.' + (a_date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
                    'Z';

                return s_utc;
            },

            formatDate: function (d) {
                //date to friendly format: "3/05/2014 04:35:44"

                var d_str =
                    [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/') + " " +
                    [("00" + d.getHours()).slice(-2), ("00" + d.getMinutes()).slice(-2), ("00" + d.getSeconds()).slice(-2)].join(':');

                return d_str;
            },

            formatDate2: function (d) {
                //date to friendly format: "03/05/2014 04:35:44"  Note the 2-digit month.

                var d_str =
                    [this.padNumber(d.getMonth() + 1), this.padNumber(d.getDate()), d.getFullYear()].join('/') + " " +
                    [("00" + d.getHours()).slice(-2), ("00" + d.getMinutes()).slice(-2), ("00" + d.getSeconds()).slice(-2)].join(':');

                return d_str;
            },

            convertHhMmToMinutes: function (aTime) {
                // This function expects a time duration like this:  01:15 (an hour and 15 minutes), and converts it to minutes.
                console.log("typeof aTime = " + typeof aTime);


                var numberMinutes = 0;

                var theHours = parseInt(aTime.substr(0, 2)); // (start at, get this many)
                //console.log("theHours = " + theHours);
                var theMinutes = parseInt(aTime.substr(3, 2));
                //console.log("theMinutes = " + theMinutes);
                numberMinutes = theHours * 60 + theMinutes;
                //console.log("TotalTimeFished (in min) = " + TotalTimeFished);
                return numberMinutes;
            },

            convertMinutesToHhMm: function (numberMinutes) {
                // This function expects a number of minutes, and converts it to a time duration (as a string) formatted like this:  hh:mm

                var NumMinutes = numberMinutes;
                //console.log("NumMinutes = " + NumMinutes);
                var theHours = parseInt(NumMinutes / 60, 10);
                //console.log("theHours = " + theHours);
                var theMinutes = NumMinutes - (theHours * 60);
                //console.log("theMinutes = " + theMinutes);
                var strTime = "";

                if (theHours < 10)
                    var strHours = "0" + theHours;
                else
                    var strHours = "" + theHours;

                if (theMinutes < 10)
                    var strMinutes = "0" + theMinutes;
                else
                    var strMinutes = "" + theMinutes;

                strTime = strHours + ":" + strMinutes;

                return strTime;
            },
            // ***** Date and Time functions end *****

            // ***** Number-related (how many digits, etc.) functions start *****
            // Given a float type number, this function verifies that it has six digits before the decimal.
            checkSixFloat: function (aNumber) {
                // Regular Expression explanation.  Also see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
                // Enclosing characters:  / ... /
                // At the beginning:  ^
                // Escape character for special characters:  \  , in this case the - has special meaning
                // Match the preceding character 0 or 1 time; in other words, like -123.  The - sign in front may or may not be present:  ?
                // A sequence of 6 digits:  \d{6}
                // Start a section to be remembered:  (       and another section   (
                // Look for a decimal, but the decimal needs escaping, because the . is special:  \.
                // Close the decimal section:  )
                // Look for a digit:  \d
                // Match the preceding character 1 or more times:  +
                // Closed this section for the fractional value:  )
                // The decimal followed by 1 or more numbers may or may not be present (the whole .123 section):  ?
                // The fractional part (.123) is treated as the end of the number, and we want to see if the number has a fractional part:  $
                // Basically, the $ matches the whole () section before the ?, so the decimal section must be at the end of the number.
                // Example:  For example, /t$/ does not match the 't' in "eater", but does match it in "eat".
                var FLOAT_REGEXP6 = /^\-?\d{6}((\.)\d+)?$/;
                var n = "" + aNumber;
                n = n.replace(',', '.');

                if (FLOAT_REGEXP6.test(n)) {
                    return parseFloat(n.replace(',', '.'));
                }
                else {
                    return undefined;
                }
            },
            // Given text that could be an integer, this function verifies that it is an integer.
            checkInteger: function (aNumber) {
                var INTEGER_REGEXP = /^\-?\d+$/;
                var n = "" + aNumber;
                n = n.replace(',', '.');

                if (INTEGER_REGEXP.test(n)) {
                    return parseFloat(n.replace(',', '.'));
                }
                else {
                    return undefined;
                }
            },

            check4Digits: function (aNumber) {
                console.log("Inside check4Digits...")
                var INTEGER_REGEXP = /^\d{4}$/;
                var n = "" + aNumber;
                n = n.replace(',', '.');

                if (INTEGER_REGEXP.test(n)) {
                    return parseFloat(n.replace(',', '.'));
                }
                else {
                    return undefined;
                }
            },


            // ***** Number-related (how many digits, etc.) functions end *****

            setFileName: function (aFileName, scope) {
                scope.FieldSheetFile = aFileName;
            }
        }

        return service;

    }]);
