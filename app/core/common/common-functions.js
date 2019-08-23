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
            //console.log(d);
            if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))) {
                doPrevent = true;
            }
        }
/*
        //prevent arrow keys from scrolling
        if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
            doPrevent = true;
        }
 */       
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

//filters an array, returning only those objects where field matches search
function getAllMatchingFromArray(data, search, field) { 

    if (!Array.isArray(data))
        return null;

    var retval = [];
    data.forEach(function (row) { 
        if (row[field] == search)
            retval.push(row);
    });

    return retval;

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
        //console.log("(objects[item[keyProperty]] is next...");
        //console.dir(objects[item[keyProperty]]);
        //console.log("string = " + item[keyProperty].toString());
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

//takes project.Instruments and returns them as works for possiblevalues
function instrumentsToPossibleValues(instruments) {

    var result = [];

    instruments.forEach(function (item) {
        result.push({ Id: item.Id, Label: item.Name + ' (' + item.SerialNumber + ')'})
    });

    return result;
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
    //console.log(" -- make objects from values key : " + key);
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
                if (typeof item == 'object' && item.hasOwnProperty('Id')) {
                    objects[item.Id] = item;
                }
                else {
                    objects[item] = item;
                }
            });
        }
        else {
            for (var idx in selectOptions) {
                objects[idx] = selectOptions[idx];
            }

        }
        angular.rootScope.Cache[key] = objects; //save into our cache
    }
    //console.log("returning " + objects.length);
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

//takes in an "ObjectList" like {1: "Sam", 3: "Bubba"} 
//  and returns an array of item objects sorted by the value like [{Id: '3', Label: 'Bubba'}, {Id: '1', Label: 'Sam'}]
function getOrderedObjectList(list) {
    var sorted_obj_list = [];

    //convert to array of objects for sorting
    for (var key in list) {
        sorted_obj_list.push({ Id: key, Label: list[key] });
    }

    return sorted_obj_list.sort(orderByAlpha);

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

function orderByOrderIndex(a, b) {
    if (!a || !b || !a.OrderIndex || !b.OrderIndex)
        return 0;

    var nameA = parseInt(a.OrderIndex), nameB = parseInt(b.OrderIndex)
    if (nameA < nameB) //sort ascending
        return -1
    if (nameA > nameB)
        return 1
    return 0 //default return value (no sorting)
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

function isPercent(n) { 
    return (isNumber(n) && n >= 0 && n <= 100); 
}

function isInteger (value) {
    return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
};

function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
};

//TODO note: this is moved into a filter in datasets_module. delete me when convenient.
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
    else
        strDateTime = strDateTime.slice(2);

    //console.log("strDateTime = " + strDateTime);

    //if (strDateTime.charAt(0) !== ' ')
    if ((strDateTime.charAt(0) !== ' ') && (strDateTime.charAt(0) !== 'T'))
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

    var intColonLoc = strDateTime.indexOf(":");
    var strMinutes = strDateTime.substr(0, 2);
    //console.log("strMinutes = " + strMinutes);
    var intMinutes = parseInt(strMinutes);

    if (typeof intMinutes !== 'number')
        return false;
    else if (intMinutes > 59)
        return false;
    else
        strDateTime = strDateTime.slice(2);

    //console.log("strDateTime = " + strDateTime);

    if (strDateTime.charAt(0) !== ':')
        return false;
    else
        strDateTime = strDateTime.slice(1);

    //console.log("strDateTime = " + strDateTime);

    var intColonLoc = strDateTime.indexOf(".");
    var strSeconds = strDateTime.substr(0, 2);
    var intSeconds = parseInt(strSeconds);

    if (typeof intSeconds !== 'number')
        return false;
    else if (intSeconds > 59)
        return false;
    else
        strDateTime = strDateTime.slice(2);

    //console.log("strDateTime = " + strDateTime);

    if (strDateTime.charAt(0) !== '.')
        return false;
    else
        strDateTime = strDateTime.slice(1);

    //console.log("strDateTime = " + strDateTime);

    var strMilli = strDateTime.substr(0);
    var intMilli = parseInt(strMilli);

    if (strDateTime.length === 3)
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

// Expects a UTC Date/Time string like this:  2018-07-18T09:00:00.000
// And returns an hours/min time like this:  09:00
function getTimeFromUtcString(strDate) {
    console.log("Inside common-functions.js, getTimeFromUtcString...");
    // Start just past the "T" in the string, and get the time portion (the next 5 characters).
    var intTLoc = strDate.indexOf("T");
    var strTime = strDate.substr(intTLoc + 1, 5);

    return strTime;
}

// Expects a friendly Date/Time string like this:  07/18/2018 09:00:00
// And returns an hours/min time like this:  09:00
function getTimeFromFriendlyString(strDate) {
    console.log("Inside common-functions.js, getTimeFromFriendlyString...");
    // Start just past the " " in the string, and get the time portion (the next 5 characters).
    var intSpaceLoc = strDate.indexOf(" ");
    var strTime = strDate.substr(intSpaceLoc + 1, 5);

    return strTime;
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
	//console.log("Inside formatDateFromFriendlyToUtc; d = " + d);
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
//function convertDateFromUnknownStringToUTC(strD, strTimeFormat) {
    //console.log("Inside common-functions.js, convertDateFromUnknownStringToUTC...");
    //console.log("strD = " + strD + ", strTimeFormat = " + strTimeFormat);
	
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

        //if ((typeof strTimeFormat !== 'undefined') && (strTimeFormat !== null)) {
        //    if (strTimeFormat === "HH:MM") {
        //        var intColonLoc = strIsoDateTime.indexOf(":"); // The location of the colon after the hour.

        //        strIsoDateTime = strIsoDateTime.substr(0, intColonLoc + 3);
        //    }
        //}
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

        if (typeof searchElement === 'string') {
            searchElement = searchElement.toLowerCase();    
        }

        if (this == null)
            throw new TypeError('Array.contains: "this" is null or not defined');

        if (this.length == 0)
            return false;

        for (var i = this.length - 1; i >= 0; i--) {
            if (typeof this[i] !== 'string')
                continue;

            if (this[i].toLowerCase() == searchElement)
                return true;
        };

        return false;
    }
}

//case sensitive contains
if (!Array.prototype.containsExactly) {
    Array.prototype.containsExactly = function (searchElement) {

        if (this == null)
            throw new TypeError('Array.contains: "this" is null or not defined');

        if (this.length == 0)
            return false;

        for (var i = this.length - 1; i >= 0; i--) {
            if (this[i] == searchElement)
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
            if (this[i] == searchElement)
                return true;
        };

        return false;
    }
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

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

function convertStringArrayToNormalString(aArray) {
    // The join make the list a comma-separated string; we need a semi-colon-separated string.
    //var strA = aArray.join();
    //Add the trailing ;
    //strA += ";";

    var strA = "";

    aArray.forEach(function (item) {
        strA += item + ";";
    });

    return strA;
}

// This function expects a string looking like this:  "a;\nb;\nc;\nd;"
// and converts the string into a string looking like this:  "a;b;c;d;"
// Handles strings like Collaborators; this function for saving.
function convertStringWithSeparatorsAndReturnsToNormalString(aString) {
    var strA = aString.replace(/(\r\n|\r|\n)/gm, "");

    return strA;
}

// This function expects a string looking like this: "a;b;c;d;"
// and converts the string into a string looking like this: "a;\nb;\nc;\nd;"
// Handles strings like Collaborators; this function for displaying.
function convertStringWithSeparatorsToStringWithSeparatorsAndReturns(aString) {
    var strA = aString.replace(/(\r\n|\r|\n)/gm, "");
    var aryA = strA.split(';');

    // Next, get rid of that trailing semicolon record.
    aryA.splice(-1, 1);

    strA = "";

    //var intCount = 0;
    aryA.forEach(function (item) {
        //if (intCount === 0) {
            //strA += item;
            //strA += item + ";";
            strA += item + ";\n";
        //}
        //else {
            //strA += "\n" + item + ";";
        //    strA += item + ";\n";
        //}
        //intCount++;
    });

    return strA;
}

// This function expects a string looking like this:
// str1;
// str2;
// str3;
// Assuming str2 is passed in, the function removes str2 from the string:  str1;str3;
function removeStringItemFromList(strItem, in_list) {
    /*in_list.forEach(function (list_item, index) {
        if (list_item === strText) {
            in_list.splice(index, 1);
            console.log(" -- removing " + list_item);
        } else {
            console.log(" -- keeping " + list_item);
        }
    });
    */

    var strNew = "";
    var aryA = in_list.split(";");

    // Next, get rid of that trailing blank record.
    aryA.splice(-1, 1);
    console.dir(aryA);

    var aryLength = aryA.length;

    for (var i = 0; i < aryLength; i++) {
        console.log("aryA[i] = " + aryA[i]);
        if (aryA[i].indexOf(strItem) > -1) {
            console.log("Found the item...");
            aryA.splice(i, 1);
            console.log("Removed the item.");

            // Rebuild the string now, adding the semicolon and newline after every line.
            angular.forEach(aryA, function (item) {
                strNew += item + ";\n";
                console.log("Added item...");
            });

            // Since we found the item, skip to then end to exit.
            i = aryLength;
        }
    }

    return strNew;
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

//helper function that unJSON's the vals if a string or else returns the vals if already an object
function getJsonObjects(vals) { 

    objvals = vals;

    try {
        if (typeof vals === 'string' && vals !== null && vals !== "") {
            objvals = angular.fromJson(vals);
            if (Array.isArray(objvals) && objvals.length > 0) {
                //console.dir(objvals);
                if (objvals[0].hasOwnProperty('ID')) {
                    objvals = makeObjects(objvals, 'ID', 'LABEL'); //if our possible values are objectified (fisherman, etc. from LookupHelper)
                }
                else if (typeof objvals[0] == 'object' && 'POSSIBLEVALUES' in objvals[0]) {  //true when a datasource is a metafield (select PossibleValues from metadataproperties where name = 'ProjectLead')
                    //console.log("have possible values");
                    //console.dir(objvals[0]);
                    objvals = angular.fromJson(objvals[0].POSSIBLEVALUES);
                    if (Array.isArray(objvals))
                        objvals = objvals.sort();
                    //console.dir(objvals);
                }
            }
        }
    } catch (e) {
        console.log("Failed converting to json most likely:" + vals);
        console.dir(e);
    }
    
    //console.warn("possiblevalues");
    //console.dir(objvals);
    return objvals;
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
            //console.log("typeof file_json = " + typeof file_json);
            //console.log("file_json is next...");
            //console.dir(file_json);
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

//format a value to currency
function valueFormatterCurrency(in_value) {
    return filterToCurrency(in_value);
}

//format a numeric value to include commas
function valueFormatterNumericCommas(x) {
    if (!x)
        return x;

    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Takes a string or number, however formatted, and turns it into a javascript number.
function parseToFloat(value, decimal) {

    if (!decimal)
        decimal = 2; //2 decimal places by default

    var regex = new RegExp("[^0-9-" + '.' + "]", ["g"]);
    var output = parseFloat(
        ("" + value)
            .replace(/\((?=\d+)(.*)\)/, "-$1") // replace bracketed values with negatives
            .replace(regex, '')         // strip out any cruft
    );

    output.toFixed(decimal); 

    return output;
}

//Takes a string or number, however formatted, and returns it filtered for USD currency.
function filterToCurrency(value) {
    var p_val = parseToFloat(value);

    if (isNaN(p_val))
        return value;

    return (parseToFloat(value)).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}



//return an array from the eventfiles.
function getFilesArrayAsList (theFiles) {

    if (theFiles === undefined || theFiles === null)
        return [];

    var files = null;

    try {
        files = angular.fromJson(theFiles);
    }
    catch (e) { 
        console.error("could not parse files: " + theFiles);
    }

    return (files === null || !Array.isArray(files)) ? [] : files; //if it isn't an array, make an empty array

};

//return an array from the items.
// Receives:  a;b;c;
// Returns:  [a,b,c]
function getTextArrayAsList(theItems) {

    if (theItems === undefined || theItems === null)
        return [];

    var items = null;
    var newItemList = [];
    try {
        //items = angular.fromJson(theItems);
        items = theItems.split(";");
        items.forEach(function (item) {
            newItemList.push(item);
        });

        newItemList.splice(-1, 1);
    }
    catch (e) {
        console.error("could not parse items: " + theItems);
    }

    return newItemList; //if it isn't an array, make an empty array

};

//return an array of file links to cdmsShareUrl (defined in config) for subproject
function getSubprojectFilesArrayAsLinks (a_projectId, a_subprojectId, a_files)
{
    var files = getFilesArrayAsList(a_files);
    var retval = [];

    files.forEach(function (file) {
        retval.push("<a href='" + cdmsShareUrl + "P/" + a_projectId + "/S/" + a_subprojectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
    });

    return retval;
}

//return an array of file links to cdmsShareUrl (defined in config) for project
function getProjectFilesArrayAsLinks (a_projectId, a_datasetId, a_files)
{
    var files = getFilesArrayAsList(a_files);
    var retval = [];

    files.forEach(function (file) {
        //console.dir(file);
        if(file.Link)
            retval.push("<a href='" + file.Link + "' target=\"_blank\">" + file.Name + "</a>");
        else
            retval.push("<a href='" + cdmsShareUrl + "P/" + a_projectId + "/D/" + a_datasetId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
    });

    return retval;
}

//Receive a text array, and convert it into a list with \n after each item.
function getProjectItemsArrayAsTextList(a_itemList) {
    var itemList = getTextArrayAsList(a_itemList);
    var retval = [];

    itemList.forEach(function (item) {
        //console.dir(file);
        retval.push(item + "\n");
    });

    return retval;
}

//Receive an array like this: [a,b,c]
//Return:
//-a
//-b
//-c
function buildBulletedItemList(a_itemList) {
    var list = '<div class="event-item-list"><ul>';
    //var itemList = getTextArrayAsList(a_itemList);

    a_itemList.forEach(function (item) {
        list += '<li>' + item + '</li>';
    });

    list += '</ul></div>';

    //console.dir(list);
    return list;
}


function getParsedMetadataValues(raw_values) { 
    //get the value no matter what if we have it.

    var values = raw_values;

    if (raw_values) {

        try {
            values = angular.fromJson(raw_values);
        }
        catch (e)  //if we can't then it wasn't an object... use split instead.
        {
            if (typeof values === 'string')
                values = raw_values.split(",");
        }
    }

    return values;

}


function valueFormatterBoolean(in_bool) {
    return (in_bool) ? "Yes" : "No";
}

//takes a json string of an array '["a","b","c"]' and returns a,b,c
// if it isn't an array, it returns what we got.
function valueFormatterArrayToList(the_array) {

    if (!Array.isArray(the_array) || is_empty(the_array))
        return "";

    var list = the_array;

    var selectOptions = [];

    try {
        selectOptions = angular.fromJson(the_array);

        //make array elements have same key/value
        if (Array.isArray(selectOptions)) {
            list = selectOptions.join();
        }

    } catch (e) {
        console.log("problem parsing: " + the_array );
    }

    console.dir(list);

    return list;

}

function getNameFromUserId(theId, userList) {
    var strUser = "";
    var blnKeepGoing = true;

    userList.forEach(function (user) {
        if (blnKeepGoing) {
            if (user.Id === theId) {
                // Table Users has a column Fullname
                // Table Fishermen has a column FullName
                // This function will work for both cases, with the following if block...
                if (user.Fullname)
                    strUser = user.Fullname;
                else if (user.FullName)
                    strUser = user.FullName;

                blnKeepGoing = false;
            }
        }
    });

    return strUser;
}


function getAgGridFilterByType(type) { 

    if(type == 'textarea' || type == 'easting'|| type == 'northing'|| type == 'time' || type == 'activity-text')
        return 'agTextColumnFilter';
    
    if (type == 'number')
        return "agNumberColumnFilter";

    if (type == "date" || type == 'datetime' || type == 'activity-date')
        return "agDateColumnFilter";

    return true; //default to the checkboxy filter
}

function getAgGridFilterParamsByType(type) { 
    if (type == "date" || type == 'datetime' || type == 'activity-date')
        return { comparator: momentComparator, apply: true };

    return null; //default to nothing
}


//compare two dates just using the day (ignoring the time)
function momentComparator(moment1, moment2) {

    if (moment(moment1).isSame(moment2, 'day'))
        return 0;
    
    if (moment(moment1).isBefore(moment2, 'day'))
        return 1;

    if (moment(moment1).isAfter(moment2, 'day'))
        return -1;

}

//takes an array and returns a string list
function parseArrayToStringValues (array_in) {
    var result = '';
    array_in.forEach(function (item) {
        result += item + "\n";
    })
                
    return result;
}

//takes a string list (like a textarea) and returns an array
function parseStringValuesToArray (string_values) { 
    //do some cleanup of the incoming data
    string_values = string_values.replace(/,|"/g, "");

    var ListValues = string_values.trim().split('\n');
    
    for (i = 0; i < ListValues.length; i++) {
        ListValues[i] = ListValues[i].trim();
    }

    return ListValues;

};

//polyfill for @%#@ IE
if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}


/// validation functions
function validateOriginFinClip(row, row_errors) {
    //console.dir(row);
    if (row['Origin'] == 'NAT') {
        //then we shouldn't have a tag or fin clip
        if (row['Tag'] && (row['Tag'].indexOf('WIRE')>-1 || row['Tag'].indexOf('VIE')>-1))
            row_errors.push('NAT is incompatible with Tag WIRE or VIE');

        //if there is a finclip give an error
        if (row['FinClip'] && !(row['FinClip'].indexOf('NONE') > -1 || row['FinClip'].indexOf('NA') > -1 )) {
            row_errors.push(row['Origin'] + ' should not have a FinClip');
        }

    }
    else if (row['Origin'] == 'HAT') {
        //then if a tag is set it should be wire or vie
        if (row['Tag'] && (row['Tag'].indexOf('WIRE')==-1 && row['Tag'].indexOf('VIE')==-1))
            row_errors.push('HAT expects Tag to be WIRE or VIE (not '+row['Tag']+')');

        //and if there is no finclip we expect one 
        if (!row['FinClip'] || row['FinClip'].indexOf('NONE') > -1) {
            row_errors.push(row['Origin'] + ' expects a FinClip');
        }

        //if finclip is NA and tag is not wire/vie, we expect a different finclip
        if(row['FinClip'] == 'NA' && (['Tag'].indexOf('WIRE')==-1 || row['Tag'].indexOf('VIE')==-1))
            row_errors.push(row['Origin'] + ' expects a FinClip or a Tag of WIRE or VIE');

    }

}

function getProjectPrimaryLocation(projectLocations, projectId) {
    var intLocationId = 0;
    var keepGoing = true;

    projectLocations.forEach(function (loc) {
        if (keepGoing) {
            if (loc.ProjectId === projectId && loc.LocationTypeId === PRIMARY_PROJECT_LOCATION_TYPEID) // Primary project location
            {
                intLocationId = loc.Id;
                keepGoing = false; // Stop checking the LocationTypeId now.
            }
        }
    });

    return intLocationId;
}

/* Boolean Cell Renderer - gives you a checkbox for a boolean cell in ag-grid */
function BooleanEditor() { };
function BooleanCellRenderer() { };

BooleanCellRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('span');
    if (params.value !== "" || params.value !== undefined || params.value !== null) {
        var checkedStatus = params.value ? "checked" : "";
        var input = document.createElement('input');
        input.type = "checkbox";
        input.checked = params.value;
        input.addEventListener('click', function (event) {

            if (!params.colDef.editable) {
                console.log("ignoring click - colDef.editable = false");
                event.preventDefault();
                return;
            }

            params.value = !params.value;
            params.data[params.colDef.field] = params.value;
            //console.log(params.colDef.field + " changed to : " + params.value);
            if( params.api.gridOptionsWrapper.gridOptions.hasOwnProperty('onCellValueChanged')){
                params.api.gridOptionsWrapper.gridOptions.onCellValueChanged(params); //call our cell changed
                console.log("changed a boolean!");
            }
            //console.dir(params);
        });
        this.eGui.innerHTML = '';
        this.eGui.appendChild(input);
    }
};

BooleanCellRenderer.prototype.getGui = function () {
    return this.eGui;
};

BooleanEditor.prototype.init = function (params) {
    this.container = document.createElement('div');
    this.value = params.value;
    params.stopEditing();
};
BooleanEditor.prototype.getGui = function () {
    return this.container;
};

BooleanEditor.prototype.afterGuiAttached = function () {
};

BooleanEditor.prototype.getValue = function () {
    return this.value;
};

BooleanEditor.prototype.destroy = function () {
};

BooleanEditor.prototype.isPopup = function () {
    return true;
};


function formatUsPhone(phone) {

    var phoneTest = new RegExp(/^((\+1)|1)? ?\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})( ?(ext\.? ?|x)(\d*))?$/);

    phone = phone.trim();
    var results = phoneTest.exec(phone);
    if (results !== null && results.length > 8) {

        return "(" + results[3] + ") " + results[4] + "-" + results[5] + (typeof results[8] !== "undefined" ? " x" + results[8] : "");

    }
    else {
         return phone;
    }
}

//polyfill for includes in IE
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

//returns the next business day with the given format (default to 'L')
function getNextBusinessDay(dateFormat){
    if(!dateFormat)
    dateFormat = 'L';

    let dayIncrement = 1;

    if (moment().day() === 5) {
        // set to monday
        dayIncrement = 3;
    } else if (moment().day() === 6) {
        // set to monday
        dayIncrement = 2;
    }

return moment().add(dayIncrement,'d').format(dateFormat);

}