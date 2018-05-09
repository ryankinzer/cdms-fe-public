/*
*   These are functions used in services or controllers across modules
*/

//there are quite a lot of functions in here related to Date handling -- it would be
// a very good idea to not maintain our own date code since there is an excellent
// date package called "Moment" that we should use instead of rolling our own. It is
// well-maintained and tested.


//anything we might need to do in initializing edit/entry pages.
function initEdit() {
    
    $(document).unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;

        //backspace key intercepted to prevent navigating back a page
        //http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back/1495435#1495435
        if (event.keyCode === 8) {
            var d = event.srcElement || event.target;
            if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))
                || d.tagName.toUpperCase() === 'TEXTAREA') {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }

        //enter key intercepted in order to prevent the form submit
        if (event.keyCode == 13) {
            var d = event.srcElement || event.target;
            console.log(d);
            if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))) {
                doPrevent = true;
            }
        }

        //console.log("do prevent = " + doPrevent);

        if (doPrevent) {
            //console.log("-- prevented that key from doing anything --");
            event.preventDefault();
        }
    });
}


//in any array with an "Id" attribute, get the matching item
function getById(list, search_name) {
    return getByField(list, search_name, 'Id');
}



//in any array with a "Name" attribute, get the matching item
function getByName(list, search_name) {
    return getByField(list, search_name, 'Name');
}

//returns single match in any fieldname
function getByField(list, search, field) {
    
	// This loop iterates through the list sequentially.
	for (var i = 0; i < list.length; i++) {
        var pref = list[i];
        if (pref[field] == search)
            return pref;
    };

    return null;
}

function binIdSearch(list, search, field){

	var listLength = list.length;
	if (binIdSearch())
	
	return -1;
}

//returns array with matching field value
function getMatchingByField(data, search, field) {
	//console.log("data is next...");
	//console.dir(data);
	//console.log("search is next...");
	//console.dir(search);
	
    var newlist = [];

    for (var key in data) {
		//console.log("key = " + key + ", field = " + field);
		//console.dir(key);
        if (data[key][field] == search)
		{
			//console.log("Found it...");
            newlist.push(data[key]);
		}
    }

    //console.log("did a search on " + search + " for " + field);
    //console.dir(newlist);

    return newlist;
}

//returns array with matching field value
function getMatchingByFieldArray(data, search, field) {
    var newlist = [];
    var theSearch = "";

    for (var key2 in search) {
        //console.log("key2 " + key2);
        for (var key in data) {
            //console.log("key " + key);
            //console.log("Field = " + data[key][field] + "  " + "Search = " + search[key2]);
            if ((data[key][field] !== "undefined") && (data[key][field] !== null)) {
                if (data[key][field] === search[key2]) {
                    newlist.push(data[key]);
                    var theSearch = theSearch + search[key2] + ",";
                    console.log("Searched and found " + search[key2] + " for " + field);
                }
            }
        }
    }

    //console.log("did a search on " + search + " for " + field);
    console.log("newlist display is next...");
    console.dir(newlist);   // the result is an array.
    //newList = sortLocations(sortLocations);
    //console.dir(newlist);   // the result is an array.

    return newlist;
}

//takes an array and iterates into key/value object array
//also needs keyProperty and valueProperty strings; property names of individual items in the list.
//use like:  makeObjects(project.Locations, 'Id','Label')
//returns "{keyProperty: valueProperty, ...}
function makeObjects(optionList, keyProperty, valueProperty) {
    //console.log("Inside services.js, makeObjects...");
    //console.log("optionList is next...  keyProperty = " + keyProperty + ", valueProperty = " + valueProperty);
    //console.dir(optionList);
    var objects = {};

    angular.forEach(optionList, function (item) {
        //console.log("item is next...");
        //console.dir(item);
        //console.log("item[keyProperty] = " + item[keyProperty] + ", item[valueProperty] = " + item[valueProperty]);
        objects[item[keyProperty]] = item[valueProperty];
    });

    return objects;
}

//specific for instruments because we need the serial number too
function makeInstrumentObjects(optionList) {
    console.log("Inside services.js, makeInstrumentObjects...");
    var objects = {};

    angular.forEach(optionList, function (item) {
        //console.dir(item);
        //objects[item['Id']] = item['Name'] + '(' + item['SerialNumber'] + ')';
        objects[item['Id']] = item['Name'] + '(' + item['SerialNumber'] + ')';
    });

    return objects;
}

//TODO: this will be handy in the future when we refactor the way lookupOptions works to use
// an array of objects instead of properties of a single object.
function sortObjectsByValue(list) {
    var sorted = [];

    Object.keys(list)
        .map(function (k) { return [k, list[k]]; })
        .sort(function (a, b) {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
        })
        .forEach(function (d) {
            var nextObj = {};
            nextObj[d[0]] = d[1];
            sorted.push(nextObj);
        });

    return sorted;

}
//takes a possiblevalues field list and turns it into a list we can use in a select
//give us a unique key to reference it by for caching.
function makeObjectsFromValues(key, valuesList) {
    var objects = angular.rootScope.Cache[key]; //see if we have it squirreled away in our cache

    if (!objects) {
        objects = {};

        if (!valuesList) {
            //throw new Exception("No values provided.");
            throw ("No values provided.");
        }

        var selectOptions = "";

        try {
            selectOptions = angular.fromJson(valuesList);
        } catch (e) {
            console.log("problem parsing: " + valuesList + " for field: " + key);
        }

        //make array elements have same key/value
        if (angular.isArray(selectOptions)) {
            selectOptions.forEach(function (item) {
                objects[item] = item;
            });
        }
        else {
            for (var idx in selectOptions) {
                objects[idx] = selectOptions[idx];
            }

        }
        angular.rootScope.Cache[key] = objects; //save into our cache
    }

    return objects;
}

function order2dArrayByAlpha(a, b) {
    if (!a || !b)
        return 0;

    //console.log(a[1] + ", " + b[1]);
    var a = a[1].toLowerCase();
    var b = b[1].toLowerCase();
    //console.log(a + ", " + b);

    if (a < b)
        return -1;
    else if (a > b)
        return 1;
    else
        return 0;
}

function orderByAlpha(a, b) {
    if (!a || !b || !a.Label || !b.Label)
        return 0;

    var nameA = a.Label.toLowerCase(), nameB = b.Label.toLowerCase()
    if (nameA < nameB) //sort string ascending
        return -1
    if (nameA > nameB)
        return 1
    return 0 //default return value (no sorting)
}

function orderByAlphaName(a, b) {
    if (!a || !b || !a.Label || !b.Label)
        return 0;

    var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase()
    if (nameA < nameB) //sort string ascending
        return -1
    if (nameA > nameB)
        return 1
    return 0 //default return value (no sorting)
}

function orderUserByAlpha(a, b) {
    var nameA = a.Fullname.toLowerCase(), nameB = b.Fullname.toLowerCase()
    if (nameA < nameB) //sort string ascending
        return -1
    if (nameA > nameB)
        return 1
    return 0 //default return value (no sorting)
}

function orderByIndex(a, b) {
    if (!a || !b || !a.OrderIndex || !b.OrderIndex || !a.FieldRoleId || !b.FieldRoleId)
        return 0;

    if (a.OrderIndex && b.OrderIndex)
        return (a.OrderIndex - b.OrderIndex);
    else
        return (a.FieldRoleId - b.FieldRoleId);
}

//works for either regular arrays or associative arrays
function array_count(the_array) {
    var count = 0;
    var keys = (Array.isArray(the_array)) ? the_array : Object.keys(the_array);
    for (var i = 0; i < keys.length; i++) {
        count++;
    };

    return count;
}


function arrayRemoveElement(theArray, theElement){
	const index = theArray.indexOf(element);
	
	if (index !== -1)
	{
		theArray.splice(index, 1);
	}
}


function stringIsNumber(s) {
    return !isNaN(parseFloat(s)) && isFinite(s);
}


function stringIsTime(s) {
    if (s == null)
        return false;

    if (typeof s != 'string')
        return false;

    s = s.trim();

    //return s.match(/^\s*([01]?\d|2[0-3]):([0-5]\d)\s*$/);
    return s.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
}


function is_empty(obj) {

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0) return false;
    if (obj.length === 0) return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    // Doesn't handle toString and toValue enumeration bugs in IE < 9

    return true;
}




function capitalizeFirstLetter(someText) {
    var firstLetter = someText.toUpperCase(someText.charAt(0));
    var remainingLetters = someText.toLowerCase(someText.substring(1));
    var newNext = firstLetter + remainingLetters;

    return newText;
}




function sortLocations(a, b) {
    //if ((a !== 'undefined') && (a !== null) && (b !== 'undefined') && (b !== null))
    if ((b !== 'undefined') && (b !== null)) {
        var l1 = a[8];
        var l2 = b[8];

        if ((l1 !== "undefined") && (l1 !== null))
            l1.toLowerCase();
        if ((l2 !== "undefined") && (l2 !== null))
            l2.toLowerCase();



        if (l1 < l2) return -1;
        if (l1 > l2) return 1;
        return 0;
    }
}

//returns array with UN-matching field value
function getUnMatchingByField(data, search, field) {
    var newlist = [];

    for (var key in data) {
        if (data[key][field] != search)
            newlist.push(data[key]);
    }

    //console.log("did a search on " + search + " for " + field);
    //console.dir(newlist);

    return newlist;
}



function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


//give me an instrument's accuracy check and I'll give you the datagrade to display
function getDataGrade(check) {
    if (!check)
        return;

    var grade = "N/A";
    if (check.CheckMethod == 1)
        grade = check.Bath1Grade + "-" + check.Bath2Grade;
    else if (check.CheckMethod == 2)
        grade = check.Bath1Grade;

    return grade;
};

function populateMetadataDropdowns(scope, property) {
    if (property.ControlType == "select" || property.ControlType == "multiselect") {
        scope.CellOptions[property.Id + '_Options'] = makeObjectsFromValues(property.Id + "_Options", property.PossibleValues);
    }
};

function getLocationObjectIdsByType(type, locations) {
    console.log("Inisde services, getLocationObjectIdsByType...");
    //var locationsArray = getUnMatchingByField(locations,type,"LocationTypeId");
    var locationsArray = getMatchingByField(locations, type, "LocationTypeId");
    var locationObjectIdArray = [];

    angular.forEach(locationsArray, function (item, key) {
        locationObjectIdArray.push(item.SdeObjectId);
    });

    var locationObjectIds = locationObjectIdArray.join();
    console.log("found project locations (locationObjectIds): " + locationObjectIds);

    return locationObjectIds;
}

function getLocationObjectIdsByInverseType(type, locations) {
    //console.log("reloading project locations");
    //var locationsArray = getUnMatchingByField(locations,type,"LocationTypeId");
    var locationsArray = getMatchingByField(locations, type, "LocationTypeId");
    var locationObjectIdArray = [];

    angular.forEach(locationsArray, function (item, key) {
        if (item.SdeObjectId)
            locationObjectIdArray.push(item.SdeObjectId);
    });

    var locationObjectIds = locationObjectIdArray.join();
    //console.log("In services, getLocationObjectIdsByInverseType, found project locations: " + locationObjectIds);

    return locationObjectIds;
}

function getLocationObjectIdsFromLocationsWithSubprojects(locations) {
    //console.log("reloading project locations");
    //var locationsArray = getUnMatchingByField(locations,type,"LocationTypeId");
    //var locationsArray = getMatchingByField(locations,type,"LocationTypeId");
    var locationObjectIdArray = [];

    angular.forEach(locations, function (item, key) {
        if (item.SdeObjectId)
            locationObjectIdArray.push(item.SdeObjectId);
    });

    var locationObjectIds = locationObjectIdArray.join();
    console.log("In services, getLocationObjectIdsFromLocationsWithSubprojects, found project locations: " + locationObjectIds);

    return locationObjectIds;
}


function extractYearFromString(strDateTime) {
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
}


/* Regarding the following functions (checkInteger, checkSixFloat, checkSevenFloat),
the ..._REGEXP is also found in the directives.js file.  According to my research,
we cannot call a directive from a service.  Therefore, we had to copy the content
of the directives having ..._REGEXP and implement it/them here.
*/
// Given text that could be an integer, this function verifies that it is an integer.
function checkInteger(aNumber) {
    var INTEGER_REGEXP = /^\-?\d+$/;
    var n = "" + aNumber;
    n = n.replace(',', '.');

    if (INTEGER_REGEXP.test(n)) {
        return parseFloat(n.replace(',', '.'));
    }
    else {
        return undefined;
    }
}

function check4Digits(aNumber) {
    var INTEGER_REGEXP = /^\d{4}$/;
    var n = "" + aNumber;
    n = n.replace(',', '.');

    if (INTEGER_REGEXP.test(n)) {
        return n; //parseFloat(n.replace(',', '.'));
    }
    else {
        return undefined;
    }
}

function check2Digits(aNumber) {
    var INTEGER_REGEXP = /^\d{2}$/;
    var n = "" + aNumber;
    //n = n.replace(',', '.');

    if (INTEGER_REGEXP.test(n)) {
        return n; //parseFloat(n.replace(',', '.'));
    }
    else {
        return undefined;
    }
}

// Given a float type number, this function verifies that it has six digits before the decimal.
function checkSixFloat(aNumber) {
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
}

// Given a float type number, this function verifies that it has seven digits before the decimal.
function checkSevenFloat(aNumber) {
    var FLOAT_REGEXP7 = /^\-?\d{7}((\.)\d+)?$/;
    var n = "" + aNumber;
    n = n.replace(',', '.');

    if (FLOAT_REGEXP7.test(n)) {
        return parseFloat(n.replace(',', '.'));
    }
    else {
        return undefined;
    }
}

function checkTime(aTime) {
    var FLOAT_REGEXPTIME = /^\d{2}((\:)\d{2})$/;
    var t = "" + aTime;
    //t = t.replace(',', '.');

    if (FLOAT_REGEXPTIME.test(t)) {
        //return parseFloat(t.replace(/\D+/,""));
        return t;
    }
    else {
        return undefined;
    }
}

function checkDateTimeFormat1(strDateTime) {
    //var DateTime_REGEXP = /^\d{4}(\-)\d{2}(\-)\d{2}(\ )\d{2}(\:)\d{2}$/;
    //var dt = strDateTime

    //if (DateTime_REGEXP.test(dt))
    //{
    //	return dt;
    //}
    //else
    //{
    //	return undefined;
    //}

    var strYear = strDateTime.substr(0, 4);
    //console.log("strYear = " + strYear);
    var intYear = parseInt(strYear);
    //console.log("intYear = " + intYear);
    //console.log("typeof intYear = " + typeof intYear);

    if (typeof intYear !== 'number')
        return false;
    else
        strDateTime = strDateTime.slice(4);

    //console.log("strDateTime = " + strDateTime);

    var isLeapYear = (intYear % 100 === 0) ? (intYear % 400 === 0) : (intYear % 4 === 0);
    //console.log("isLeapYear = " + isLeapYear);

    if (strDateTime.charAt(0) !== '-')
        return false;
    else
        strDateTime = strDateTime.slice(1);

    //console.log("strDateTime = " + strDateTime);

    var strMonth = strDateTime.substr(0, 2);
    //console.log("strMonth = " + strMonth);
    var intMonth = parseInt(strMonth);

    if (typeof intMonth !== 'number')
        return false;
    else if (intMonth > 12)
        return false;
    else
        strDateTime = strDateTime.slice(2);

    //console.log("strDateTime = " + strDateTime);

    if (strDateTime.charAt(0) !== '-')
        return false;
    else
        strDateTime = strDateTime.slice(1);

    //console.log("strDateTime = " + strDateTime);

    var strDay = strDateTime.substr(0, 2);
    //console.log("strDay = " + strDay);
    var intDay = parseInt(strDay);

    if (typeof intDay !== 'number')
        return false;

    switch (intMonth) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            if (intDay > 31) {
                return false;
            }
            break;
        case 4:
        case 6:
        case 9:
        case 11:
            if (intDay > 30) {
                return false;
            }
            break;
        case 2:
            if ((isLeapYear) && (intDay > 29)) {
                return false;
            }
            else if (intDay > 28) {
                return false;
            }
            break;
    }
    strDateTime = strDateTime.slice(2);
    //console.log("strDateTime = " + strDateTime);

    if (strDateTime.charAt(0) !== ' ')
        return false;
    else
        strDateTime = strDateTime.slice(1);

    //console.log("strDateTime = " + strDateTime);

    var strHours = strDateTime.substr(0, 2);
    //console.log("strHours = " + strHours);
    var intHours = parseInt(strHours);

    if (typeof intHours !== 'number')
        return false;
    else if (intHours > 23)
        return false;
    else
        strDateTime = strDateTime.slice(2);

    //console.log("strDateTime = " + strDateTime);

    if (strDateTime.charAt(0) !== ':')
        return false;
    else
        strDateTime = strDateTime.slice(1);

    //console.log("strDateTime = " + strDateTime);

    var strMinutes = strDateTime.substr(0, 2);
    //console.log("strMinutes = " + strMinutes);
    var intMinutes = parseInt(strMinutes);

    if (typeof intMinutes !== 'number')
        return false;
    else if (intMinutes > 59)
        return false;

    //console.log("strDateTime = " + strDateTime);

    if (strDateTime.length === 2)
        return true;
    else
        return false;
}

//give me a date and I will convert it to a UTC date.
//  used in rules.
function dateToUTC(a_date) {
    var utc = new Date(Date.UTC(
        a_date.getFullYear(),
        a_date.getMonth(),
        a_date.getDate(),
        a_date.getHours(),
        a_date.getMinutes(),
        a_date.getSeconds()
    ));

    return utc;
}

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}


function toExactISOString(a_date) {
    // If an 2-digit year comes in, let's say 17 for 2017, the system will default 17 to 1917 instead.
    // Therefore, the idea was to just add 100 years to the number, to put it into the correct century.
    // TODO: better way to fix this?
    //if(a_date.getFullYear() < 1950)
    //    a_date.setFullYear(a_date.getFullYear() + 100);

    // We decided to put the onus on the user to enter the correct data.
    var s_utc = a_date.getFullYear() +
        '-' + pad(a_date.getMonth() + 1) +
        '-' + pad(a_date.getDate()) +
        'T' + pad(a_date.getHours()) +
        ':' + pad(a_date.getMinutes()) +
        ':' + pad(a_date.getSeconds()) +
        '.' + (a_date.getMilliseconds() / 1000).toFixed(3).slice(2, 5);

    return s_utc;
}

function setDateTo0000(a_date) {
    console.log("a_date = " + a_date);
    console.log("type of a_date = " + typeof a_date);
    var inDate = a_date;

    var theYear = inDate.getFullYear();
    console.log("theYear = " + theYear);
    var theMonth = inDate.getMonth();
    console.log("theMonth = " + theMonth);
    var theDay = inDate.getDate();
    console.log("theDay = " + theDay);
    var theHour = 0;
    var theMinutes = 0;
    var theSeconds = 0;
    var theMilliseconds = 0;

    var newDate = new Date(theYear, theMonth, theDay, theHour, theMinutes, theSeconds, theMilliseconds);
    console.log("newDate = " + newDate);

    return newDate;
}

function toTimeString(a_date) {
    var t = 'T' + pad(a_date.getHours()) +
        ':' + pad(a_date.getMinutes()) +
        ':' + pad(a_date.getSeconds());

    return t;

}

function getDateFromDate(a_date)
{
    // This function receives a date object, converts it to a string, and returns only the date info.
    // Example return:  2018-01-02
    var strYear = "";
    var strMonth = "";
    var strDay = "";

	console.log("a_date = " + a_date);
	console.log("typeof a_date = " + typeof a_date);
	
	// When the date comes in from the Data Entry page, a_date is a date object.
	// When the date comes in from the Date Edit page, a_date is a string.
	if (typeof a_date !== 'string')
	{
		strYear = a_date.getFullYear().toString();

		// Note:  getMonth gives a zero-based month; January is 0.
		strMonth = (a_date.getMonth() + 1).toString();
		if (strMonth.length < 2)
			strMonth = "0" + strMonth;

		strDay = a_date.getDate().toString();
		if (strDay.length < 2)
			strDay = "0" + strDay;
	}
	else
	{
		strYear = a_date.substr(0, 4);
		strMonth = a_date.substr(5, 2);
		strDay = a_date.substr(8, 2);
	}

    console.log("The date = " + strYear + "-" + strMonth + "-" + strDay);
	//throw "Stopping right here";
	
    return strYear + "-" + strMonth + "-" + strDay;
}

function getTimeFromDate(a_date) {
    var d = a_date.toString();
    //console.log("d = " + d);
    var theYear = d.substring(0, 4);
    //console.log("theYear = " + theYear);

    var separatorLocation = d.indexOf("-");
    d = d.substring(separatorLocation + 1);
    //console.log("d = " + d);
    var theMonth = d.substring(0, 2);
    //console.log("theMonth = " + theMonth);

    separatorLocation = d.indexOf("-");
    d = d.substring(separatorLocation + 1);
    //console.log("d = " + d);
    var theDay = d.substring(0, 2);
    //console.log("theDay = " + theDay);

    d = d.substring(3);
    //console.log("d = " + d);
    var theHour = d.substring(0, 2);
    //console.log("theHour = " + theHour);

    separatorLocation = d.indexOf(":");
    d = d.substring(separatorLocation + 1);
    //console.log("d = " + d);
    var theMinutes = d.substring(0, 2);
    //console.log("theMinutes = " + theMinutes);

    return theHour + ":" + theMinutes;
}

//give me a date string and offset (in ms) and I'll give you back a Date
//  with the offset applied.
//  used in rules.
function toDateOffset(str_date, int_offset) {
    //console.log(int_offset);
    //console.log(str_date);
    var orig_date = new Date(str_date);
    //console.log(orig_date.toISOString());
    var d = new Date(orig_date.getTime() + int_offset);
    //console.log(d.toISOString());

    return d;
}

//date to friendly format: "12/05/2014 04:35:44"
function formatDate(d) {
    var d_str =
        [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/') + " " +
        [("00" + d.getHours()).slice(-2), ("00" + d.getMinutes()).slice(-2), ("00" + d.getSeconds()).slice(-2)].join(':');

    return d_str;
}

// Date from 2010-08-11T12:25:00.000
// To 08/11/2010 12:25
function formatDateFromUtcToFriendly(d) {
    console.log("d = " + d);
    var theYear = d.substring(0, 4);
    console.log("theYear = " + theYear);

    var separatorLocation = d.indexOf("-");
    d = d.substring(separatorLocation + 1);
    console.log("d = " + d);
    var theMonth = d.substring(0, 2);
    console.log("theMonth = " + theMonth);

    separatorLocation = d.indexOf("-");
    d = d.substring(separatorLocation + 1);
    console.log("d = " + d);
    var theDay = d.substring(0, 2);
    console.log("theDay = " + theDay);

    d = d.substring(3);
    console.log("d = " + d);
    var theHour = d.substring(0, 2);
    console.log("theHour = " + theHour);

    separatorLocation = d.indexOf(":");
    d = d.substring(separatorLocation + 1);
    console.log("d = " + d);
    var theMinutes = d.substring(0, 2);
    console.log("theMinutes = " + theMinutes);

    separatorLocation = d.indexOf(":");
    d = d.substring(separatorLocation + 1);
    console.log("d = " + d);
    var theSeconds = d.substring(0, 2);
    console.log("theSeconds = " + theSeconds);

    separatorLocation = d.indexOf(".");
    d = d.substring(separatorLocation + 1);
    console.log("d = " + d);
    var theMilli = d.substring(0);
    console.log("theMilli = " + theMilli);

    var friendlyDate = theMonth + "/" + theDay + "/" + theYear + " " + theHour + ":" + theMinutes;

    return friendlyDate
}

// The date may come in different string formats:
//		1/1/2015 8:00:00 or
//		01/01/2015 08:00:00
// Therefore, we must allow for either format and convert.
function formatDateFromFriendlyToUtc(d) {
	console.log("Inside formatDateFromFriendlyToUtc; d = " + d);
    //console.log("d = " + d);
    var separatorLocation = d.indexOf("/");
    //console.log("slashLocation = " + separatorLocation);
    if (separatorLocation < 2) {
        var theMonth = d.substring(0, 1);
        //console.log("theMonth = " + theMonth);
        theMonth = pad(theMonth);
        //console.log("theMonth = " + theMonth);
        d = d.substring(2);
    }
    else {
        var theMonth = d.substring(0, 2);
        //console.log("theMonth = " + theMonth);
        d = d.substring(3);
    }

    //console.log("d = " + d);

    separatorLocation = d.indexOf("/");
    if (separatorLocation < 2) {
        var theDay = d.substring(0, 1);
        //console.log("theDay = " + theDay);
        theDay = pad(theDay);
        //console.log("theDay = " + theDay);
        d = d.substring(2);
    }
    else {
        var theDay = d.substring(0, 2);
        //console.log("theDay = " + theDay);
        d = d.substring(3);
    }

    //console.log("d = " + d);

    var theYear = d.substring(0, 4);
    //console.log("theYear = " + theYear);
    d = d.substring(5);
    //console.log("d = " + d);

	var theHour = "00";
	var theMinutes = "00";
	var theSeconds = "00";
    separatorLocation = d.indexOf(":");
	if (separatorLocation < 0) // The string has only date, no time.
	{
		// Do nothing; the hour/minutes/seconds are already set.
	}
    else if (separatorLocation < 2) {
        theHour = d.substring(0, 1);
        //console.log("theHour = " + theHour);
        theHour = pad(theHour);
        //console.log("theHour = " + theHour);
        d = d.substring(2);
    }
    else {
        theHour = d.substring(0, 2);
        //console.log("theHour = " + theHour);
        d = d.substring(3);
    }

    //console.log("d = " + d);
	if (separatorLocation < 0)
	{
		// Do nothing; the hour/minutes/seconds are already set.
	}
	else
	{
		theMinutes = d.substring(0, 2);
		//console.log("theMinutes = " + theMinutes);
		d = d.substring(3);
		//console.log("d = " + d);
		d = "" + d;
		//console.log("d = " + d);
		if ((d.length > 0) && (d.length < 2))
			theSeconds = pad(d);
		else
			theSeconds = "00";
	}
    //console.log("theSeconds = " + theSeconds);

    var utc = theYear +
        "-" + theMonth +
        "-" + theDay +
        " " + theHour +
        ":" + theMinutes +
        ":" + theSeconds +
        "." + "000";

    //console.log("utc = " + utc);
    return utc;
}

// This function takes a date string in the following formats...
// YYYY-MM-DDTHH:MM:SS.mmm
// MM/DD/YYYY HH:MM:SS
// and converts it into this format:  YYYY-MM-DD HH:MM:SSS.mmm
function convertDateFromUnknownStringToUTC(strD) {
	//console.log("Inside common-functions.js, convertDateFromUnknownStringToUTC...");
	
	var strIsoDateTime = "";
	var strType = "";
	strType = typeof strD;
	//console.log("strType = " + strType);
	if (strType === "string")
	{
		if (strD.indexOf("T") > -1) // UTC (YYYY-MM-DDTHH:MM:SS.mmm)
		{
			strIsoDateTime = strD.replace("T", " ");
		}
		else if (strD.indexOf("/") > -1) // Friendly (MM/DD/YYYY HH:MM)
		{
			strIsoDateTime = formatDateFromFriendlyToUtc(strD); 
		}
	}
	else
	{
		
	}
	//console.log("strIsoDateTime = " + strIsoDateTime);
	return strIsoDateTime;
	
}

//if(somearray.contains("a"))... (case insensitive) -- can't be used with ints
if (!Array.prototype.contains) {
    Array.prototype.contains = function (searchElement) {
        searchElement = searchElement.toLowerCase();

        if (this == null)
            throw new TypeError('Array.contains: "this" is null or not defined');

        if (this.length == 0)
            return false;

        for (var i = this.length - 1; i >= 0; i--) {
            if (this[i].toLowerCase() == searchElement)
                return true;
        };

        return false;
    }
}

//if(somearray.contains(17))...  -- use with ints
if (!Array.prototype.containsInt) {
    Array.prototype.containsInt = function (searchElement) {
        if (this == null)
            throw new TypeError('Array.contains: "this" is null or not defined');

        if (this.length == 0)
            return false;

        for (let i = 0; i < this.length; i++) {
            if (this[i] === searchElement)
                return true;
        };

        return false;
    }
}

//might be a list of metadata values from project.Metadata or a list of actual properties.
function addMetadataProperties(metadata_list, ignored, scope, CommonService) {

    //console.log("--- running addMetadataProperties --- ");
    //console.log("metadata_list : " + metadata_list.length, metadata_list);
    //console.log("scope.metadataList : " + angular.toJson(scope.metadataList), scope.metadataList);

    metadata_list.forEach( function (i_property, key) {

        var property = i_property;
        if (i_property.MetadataPropertyId) //is it a value from project.Metadata? if so then grab the property.
            property = CommonService.getMetadataProperty(i_property.MetadataPropertyId);

        //property var is a "metadataProperty" (not a metadata value)

        //console.log("typeof property.Name = " + property.Name);
        //if (typeof property.Name !== 'undefined')
        //	console.log("property.Name = " + property.Name);
        //else
        //	console.log("property.Name = " + "'undefined'");

        //if it isn't already there, add it as an available option
        //if(!(property.Name in scope.metadataList))
        if ((typeof property.Name !== 'undefined') && (property.Name !== null) && !(property.Name in scope.metadataList)) {
            //scope.metadataList[property.Name] =
            scope.metadataList[property.Name] =
                {
                    field: property.Name,
                    MetadataPropertyId: property.Id,
                    controlType: property.ControlType,
                };
        }

        //set the value no matter what if we have it.
        if (i_property.Values) {
            if (property.ControlType == "multiselect") {
                //need to see if we are dealing with old style (just a list) or if it is a bonafide object.
                var values;
                try {
                    values = angular.fromJson(i_property.Values);
                }
                catch (e)  //if we can't then it wasn't an object... use split instead.
                {
                    values = i_property.Values.split(",")
                }

                scope.metadataList[property.Name].Values = values;
            }
            else {
                scope.metadataList[property.Name].Values = i_property.Values;
            }

            if (scope.project)
                scope.project.MetadataValue[property.Id] = scope.metadataList[property.Name].Values; //make it easy to get values by metadata id.
        }
        else {
            scope.metadataList[property.Name].Values = "";
            //console.log(" --->>> setting property VALUES to empty: ", property.Name);
        }

        //console.log(" and in the end: " + property.Name + ".Values is ", scope.metadataList[property.Name].Values);
            
        if (property.PossibleValues) {
            populateMetadataDropdowns(scope, property); //setup the dropdown
            scope.metadataList[property.Name].options = scope.CellOptions[property.Id + "_Options"];
        }



    });//foreach

    //console.error("  >>>>>>>>>>>>>>>>>>>>>>>>>>>>   at the end of adding: scope.metadataList ");
    //console.dir(scope.metadataList);


};

// This function takes an array that may have duplicate entries, and removes the duplicates.
// [a, a, b, c, c, c] -> [a, b, c] 
function uniq_fast(a) {
	//console.log("Inside uniq_fast...");
	//console.dir(a);
	var seen = {};
	var out = [];
	var len = a.length;
	var j = 0;
	
	//console.log("len = " + len);
	for (var i = 0; i < len; i++)
	{
		var item = a[i];
		//console.log("item = " + item);
		//console.log("seen[" + item + "] = " + seen[item]);
		if ((seen[item] === undefined) || (seen[item] !== 1))
		{
			//console.log("New item...");
			seen[item] = 1;
			out[j++] = item;
		}
	}
	//console.log("out is next...");
	//console.dir(out);
	
	return out;
};

// Is an object empty ({}) or not?
// This function takes an object and checks to see if it has any properties inside.
// Reference:  https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
function isObjectEmpty(obj) {
	console.log("Inside common-functions.js, isObjectEmpty...");
	for(var prop in obj){
		if (obj.hasOwnProperty(prop))
			return false;
	}
	return true;
};

// This function expects a string looking like this:  "a;b;c;d;"
// and converts the string into an array looking like this:  [a,b,c,d].
function convertStringToArray(aString){
	console.log("Inside common-functions.js, convertStringToArray...");
	//console.log("aString = " + aString);
		
	var aryItems = aString.split(";");
	//console.log("aryItems is next...");
	//console.dir(aryItems);
	
	// Next, get rid of that trailing semicolon record.
	aryItems.splice(-1, 1);
	//console.dir(aryItems);
	
	return aryItems;
}

//looks at the metadata setting to see if it is a habitat project
function isHabitatProject (a_project) {
    return (a_project.MetadataValue[METADATA_PROPERTY_SUBPROGRAM]) === "Habitat";
};

//looks at the metadata setting to see if it is a crpp project
function isCRPPProject (a_project) {
    return (a_project.MetadataValue[METADATA_PROPERTY_PROGRAM]) === "CRPP";
}


//checks to see if the uploading file already exists
//takes the incoming file to check and a reference to the files
//returns boolean
function isDuplicateUploadFile(incoming_file, files_to_check) {
    var foundDuplicate = false;

    incoming_file.Name = incoming_file.name; //copy this value into "Name" property to avoid confusion!

    console.log("checking for duplicates: incoming_file.Name = " + incoming_file.Name);

    if (files_to_check && Array.isArray(files_to_check)) {

        console.log(" -- checking in " + files_to_check.length + " files... ");
        //console.dir(files_to_check);

        files_to_check.forEach(function (existing_file) {
            if (existing_file.Name === incoming_file.Name) {
                console.log(" -- found a duplicate: " + incoming_file.Name + " already exists in the incoming files_to_check.");
                foundDuplicate = true;
            }
        });
    }
    else
        console.log(" -- no  files given... i guess there can't be any duplicates!");

    return foundDuplicate;
}




//helper function that aggregates the filenames for a list of activities
// returns null if there are none.

//the activities are an array of 
// results that come from http://localhost/services/api/v1/activity/getdatasetactivitydata?id=18887 (for example)
//so the structure is var activity = {Dataset: obj, Header: obj, Details: [obj,...]}
function getFilenamesForTheseActivities(dataset, activities) {

    console.log(" compiling filenames for " + activities.length + " activities.");

    //early return if incoming variables aren't setup for us.
    if (!activities || !dataset || !Array.isArray(activities))
        return null;

    var files = [];
    var file_names = [];

    var file_fields = getFileFields(dataset);

    //get the files out of each file field for each activity
    activities.forEach(function (activity) {

        //for each header file field
        file_fields.Header.forEach(function (header_file_field) {
            var file_json = activity.Header[header_file_field.DbColumnName]; //like "FarmingLeaseFiles"
            if (file_json) {
                var file_obj = angular.fromJson(file_json); //the files turned into the array in the file field, e.g. "FarmingLeaseFiles"
                if (Array.isArray(file_obj)) {
                    file_obj.forEach(function (file_to_add) {
                        files.push(file_to_add);
                        file_names.push(file_to_add.Name);
                    });
                }
            }
        });

        //for each detail row, do the same thing
        activity.Details.forEach(function (detail) {
            file_fields.Details.forEach(function (detail_file_field) {
                var file_json = detail[detail_file_field.DbColumnName]; //like "AppraisalFiles"
                if (file_json) {
                    var file_obj = angular.fromJson(file_json); //the files turned into the array in the file field, e.g. "AppraisalFiles"
                    if (Array.isArray(file_obj)) {
                        file_obj.forEach(function (file_to_add) {
                            files.push(file_to_add);
                            file_names.push(file_to_add.Name);
                        });
                    }
                }
            });
        });
    });

    //so when we're done we should have a list of all the files and the filenames.
    var result = (file_names.length > 0) ? file_names.join(", ") : null;
    console.log("done! we found " + files.length + " files: ", result);

    return result;


}


//compiles all of the file fields for header/detail and 
//returns an object with {Header: [header_file_filds,...], Details: [detail_file_fields,...]}
function getFileFields(dataset) {

    var file_fields = {
        Header: [],
        Details: []
    };

    //gather our fields that are files and separate into header/detail
    dataset.Fields.forEach(function (field) {
        if (field.ControlType == "file") {
            if (field.FieldRoleId == 1)
                file_fields["Header"].push(field);
            else
                file_fields["Details"].push(field);
        }
    });

    return file_fields;

}

//remove file from the list (otherwise our duplicate checking will have false positives.)
function removeFileFromList(in_file, in_list) {
    in_list.forEach(function (list_file, index) {
        if (list_file.Name === in_file.Name) {
            in_list.splice(index, 1);
            console.log(" -- removing " + list_file.Name);
        } else {
            console.log(" -- keeping " + list_file.Name);
        }
    });
};


//return whether or not the file given is in the list given (checks by the Name matching)
function isFileInList(in_file, in_list) {
    var isInList = false;

    in_list.forEach(function (list_file, index) {
        if (list_file.Name === in_file.Name)
            isInList = true;
    });

    return isInList;
}


function buildDatasetLocationObjectsList(projectLocations, locationType)
{
    console.log("Inside buildDatasetLocationObjectsList...");
    var thisDatasetLocationObjects = [];

    angular.forEach(projectLocations, function (location, key) {
        //console.log("location.LocationType.Id = " + location.LocationType.Id + ", locationType = " + locationType);
        if (location.LocationType.Id === locationType)
            thisDatasetLocationObjects.push(location.SdeObjectId);
    });

    return thisDatasetLocationObjects;
}

//can be used by any valueFormatter to format a date. returns empty string if invalid date
// @param in_date the date you want to format
// @param in_format the format you want to use (moment's formatter types) - defaults to M/d/Y
function valueFormatterDate(in_date, in_format) {
    the_format = typeof in_format !== 'undefined' ? in_format : 'L'; //default to L type (M/d/Y)

    retval = "";

    if (in_date) {
        the_date = moment(in_date);

        if (the_date.isValid())
            retval = the_date.format(the_format);
    }
    
    return retval;
}