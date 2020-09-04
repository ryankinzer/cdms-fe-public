
//ActivityParser
// Works with a wide datasheet that includes both headers and details that might represent multiple locations/days of activity
//  This full sheet idea makes it easier for data entry and importing, but we need to use this function to break
//  them out into individual activities.
/* when we're done our data will look like this:

{ "activities":{"76_10/1/2013":{"LocationId":"76","ActivityDate":"2013-10-01T07:00:00.000Z","Header":{"WaterTemperature":4,"TimeStart":"","TimeEnd":"","WaterFlow":"","AirTemperature":""},"Details":[{"locationId":"76","activityDate":"10/1/2013","WaterTemperature":4,"Species":"CHS","Sex":"M","Origin":"HAT","Mark":"[\"None\"]","Disposition":"PA","ForkLength":488,"Weight":"","TotalLength":"","GeneticSampleId":"","RadioTagId":"","FishComments":"","TimeStart":"","TimeEnd":"","WaterFlow":"","AirTemperature":"","Solution":"","SolutionDosage":""}]}},
  "errors":false,
  "UserId":1,
  "DatasetId":5
}

*/

datasets_module.service('ActivityParser', ['Logger',
    function (Logger) {
        var service = {

            parseMetricsActivity: function (heading, fields, qaStatuses) {
                console.log("Inside service, ActivityParser, parseMetricsActivity...");
                console.log("heading is next...");
                console.dir(heading);
                console.log("qaStatuses is next");
                console.dir(qaStatuses);
                var activities = { activities: {}, errors: false };

                //var tmpdata = data.slice(0); // create a copy.

                var key = service.makeKey(heading, null);

                if (key) {
                    /*if(tmpdata.length > 0) {
                        angular.forEach(tmpdata, function(data_row, index){
                            //note we mash the heading fields into our row -- addActivity splits them out appropriately.
                            //service.addActivity(activities, key, angular.extend(data_row, heading), fields);
                            service.addActivity(activities, key, angular.extend(data_row, heading), fields, qaStatuses);
                        });
                    }
                    else
					{*/
                    //at least do a single.
                    console.log("trying a single with no rows!");
                    //service.addActivity(activities, key, heading, fields);
                    service.addActivity(activities, key, heading, fields, qaStatuses);
                    //}
                }
                else {
                    service.addError(activities, 0, "Both a Location and ActivityDate are required to save a new Activity.");
                }


                return activities;

            },

            //parseSingleActivity: function(heading, data, fields) {
            parseSingleActivity: function (heading, data, fields, qaStatuses) {
                console.log("Inside activity-parser.js, ActivityParser, parseSingleActivity...");
                //console.log("heading is next...");
                //console.dir(heading);
				//console.log("data is next..."); // TotalTimeFished was 0, and is now 00:00 again... here
				//console.dir(data);
                //console.log("qaStatuses is next");
                //console.dir(qaStatuses);
                var activities = { activities: {}, errors: false };

                var tmpdata = data.slice(0); // create a copy.

                var key = service.makeKey(heading, null);

                if (key) {
                    if (tmpdata.length > 0) {
                        angular.forEach(tmpdata, function (data_row, index) {
                            //note we mash the heading fields into our row -- addActivity splits them out appropriately.
                            //service.addActivity(activities, key, angular.extend(data_row, heading), fields);
                            service.addActivity(activities, key, angular.extend(data_row, heading), fields, qaStatuses);
                        });
                    }
                    else {
                        //at least do a single.
                        console.log("trying a single with no rows!");
                        //service.addActivity(activities, key, heading, fields);
                        service.addActivity(activities, key, heading, fields, qaStatuses);
                    }
                }
                else {
                    service.addError(activities, 0, "Both a Location and ActivityDate are required to save a new Activity.");
                    activities.errors = true;
                }


                return activities;

            },

            //parses an array of header+detail fields into discrete activities
            //parseActivitySheet: function(data, fields){
            //parseActivitySheet: function(data, fields, datastoreTablePrefix, callingPage){
            parseActivitySheet: function (data, fields, datastoreTablePrefix, callingPage, qaStatuses) {
                console.log("Inside services, parseActivitySheet...called by " + callingPage);
                console.log("data is next...");
                console.dir(data);
                console.log("qaStatuses is next...");
                console.dir(qaStatuses);
                var activities = { activities: {}, errors: false };

                var tmpdata = data.slice(0); //create a copy

                var activityDateToday = new Date(); //need an activity date to use for the whole sheet, if we need to provide one.

				/* If we are adding data from a temperature logger, we will have lots of data with the same FieldActivityType (Data File Upload).
				*  In this case, the FieldActivityType will be the same, but the ReadingDateTime will change for each record.
				*  However, if the user adds several different other activities using the Data Entry Sheet, the FieldActivityType could be the same,
				*  but the ReadingDateTime will change. Therefore, we must check the FieldActivityType AND the ReadingDateTime of each non-Data File Upload
				*  record we are saving.  If either value is different from the last record, the activity has changed and we must get/create a new key,
				*  so that the record is stored as a new activity.
				*/
                var holdRow = tmpdata[0];
                var rowCount = 0;
                angular.forEach(tmpdata, function (row, index) {
                    if ((typeof datastoreTablePrefix !== 'undefined') && (datastoreTablePrefix === "WaterTemp") &&
                        (typeof callingPage !== 'undefined') && (callingPage === "DataEntrySheet")) {

                        console.log("holdRow is next...");
                        console.dir(holdRow);

                        console.log("holdRow.FieldActivityType.toString() = " + holdRow.FieldActivityType.toString());
                        console.log("row.FieldActivityType.toString() = " + row.FieldActivityType.toString());
                        console.log("holdRow.ReadingDateTime.toString() = " + holdRow.ReadingDateTime.toString());
                        console.log("row.ReadingDateTime.toString() = " + row.ReadingDateTime.toString());

                        if (rowCount > 0) {
                            //var tmpReadingDateTime = formatDateFromFriendlyToUtc(row.ReadingDateTime.toString());
                        }

                        // If the FieldActivityType IS NOT "Data File Upload", we need to check two more things.
                        if (row.FieldActivityType.toString().indexOf("Data File Upload") === -1) {
                            console.log("We are working with something other than Data File Upload.");
                            // If rowCount = 0, we are on the first record, with nothing to compare with but itself.
                            if (rowCount > 0) {
                                // If either the FieldActivityType or the ReadingDateTime are different, the record is a new activity,
                                // so we need a new date for the key.
                                if ((row.FieldActivityType.toString().indexOf(holdRow.FieldActivityType.toString()) === -1) ||
                                    (row.ReadingDateTime.toString().indexOf(holdRow.ReadingDateTime.toString()) === -1)) {
                                    console.log("Something changed...");
                                    activityDateToday = new Date();
                                }
                            }
                        }


                        var key = service.makeKey(row, activityDateToday);
                        console.log("row...index");
                        console.dir(row);
                        console.dir(index);
                        console.log("key...");
                        console.dir(key);

                        if (key) {
                            //service.addActivity(activities, key, row, fields);
                            service.addActivity(activities, key, row, fields, qaStatuses);
                        }
                        else
                            service.addError(activities, index, "Please check for errors, something required is missing to save a new Activity.");

                        rowCount++;
                        holdRow = row;

                        console.log("holdRow.ReadingDateTime = " + holdRow.ReadingDateTime);
                        var utcFormatSeparatorLoc = holdRow.ReadingDateTime.toString().indexOf("-");
                        console.log("utcFormatSeparatorLoc = " + utcFormatSeparatorLoc);
                        if (utcFormatSeparatorLoc > -1) {
                            console.log("Reformatting holdRow.ReadingDateTime to friendly date format...");
                            holdRow.ReadingDateTime = formatDateFromUtcToFriendly(holdRow.ReadingDateTime);
                            console.log("Reformatted holdRow.ReadingDateTime = " + holdRow.ReadingDateTime);
                        }
                    }
                    else {
                        var key = service.makeKey(row, activityDateToday);

                        if (key) {
                            //service.addActivity(activities, key, row, fields);
                            service.addActivity(activities, key, row, fields, qaStatuses);
                        }
                        else
                            service.addError(activities, index, "Please check for errors, something required is missing to save a new Activity.");
                    }

                    //console.log("At the end of the angular.forEach, going back to the top...");
                });

                return activities;
            },

            addError: function (activities, index, message) {
                console.log("Inside services.js, parseActivitySheet, addError...");
                if (!activities.errors) {
                    activities.errors = {};
                }
                activities.errors.saveError = message;
            },


            makeKey: function (row, activityDateToday) {

                // Some codepaths pass null for activityDateToday
                if (activityDateToday == null)
                    activityDateToday = new Date();

                if (!row.activityDate)
                    row.activityDate = toExactISOString(activityDateToday);

                if (row.locationId && row.activityDate)
                    return location + '_' + row.activityDate;

                return undefined;
            },

            //addActivity: function(activities, key, row, fields){
            addActivity: function (activities, key, row, fields, qaStatuses) {
                //console.log("Inside services, addActivity...");
				//console.log("activities is next...");
				//console.dir(activities);
				//console.log("key is next...");
				//console.dir(key);
				//console.log("row is next...");
				//console.dir(row);
                //console.log("qaStatuses is next...");
                //console.dir(qaStatuses);
                if (row.Timezone)
                    var currentTimezone = row.Timezone;

                if (!activities.activities[key]) {

                    var a_date = row.activityDate;

                    if (row.activityDate instanceof Date) {
                        //console.log("is a Date");

                        a_date = toExactISOString(row.activityDate); //
                        console.log(a_date);
                    }
                    else {
                        //console.log("Is a string.");
                        a_date = row.activityDate;
                    }
                    //console.log("finally: " + a_date);

                    //console.log(a_date);

                    //setup the new activity object structure
                    activities.activities[key] = {
                        LocationId: row.locationId,
                        ActivityDate: a_date,
                        InstrumentId: row.InstrumentId,
                        Header: {},
                        Details: [],
                    };

                    if (row.AccuracyCheckId)
                        activities.activities[key].AccuracyCheckId = row.AccuracyCheckId;

                    if (row.PostAccuracyCheckId)
                        activities.activities[key].PostAccuracyCheckId = row.PostAccuracyCheckId;

                    if (row.Timezone) {
                        activities.activities[key].Timezone = angular.toJson(row.Timezone).toString();
                        row.Timezone = undefined;
                    }

                    //add in activityqa if there isn't one (now required)
                    if (!row.ActivityQAStatus) {
                        //datasheet case
                        row.ActivityQAStatus =
                            {
                                QAStatusId: row.QAStatusId,
                                QAComments: ''
                            };
                        row.QAStatusId = row.RowQAStatusId; // and then set QA status for this row...
                    }
                    else {
                        //console.log("row.ActivityQAStatus already exists...");
                        //console.dir(row.ActivityQAStatus);
                    }

                    if ((typeof qaStatuses !== 'undefined') && (qaStatuses !== null)) {
                        for (var i = 0; i < qaStatuses.length; i++) {
                            //console.log("Checking QId:  " +qaStatuses[i].Id + ", Name:  " + qaStatuses[i].Name);
                            //console.log("row.ActivityQAStatus.QAStatusId = " + row.ActivityQAStatus.QAStatusId);
                            //if (row.ActivityQAStatus.QAStatusId.indexOf(qaStatuses[i].Id) > -1)
                            if (row.ActivityQAStatus.QAStatusId === qaStatuses[i].Id) {
                                //console.log("This is the match...");
                                row.QAStatusName = qaStatuses[i].Name;
                                row.QAStatusDescription = qaStatuses[i].Description;
                            }
                            else {
                                //console.log("Did not match...");
                            }
                        }
                    }
                    else {
                        throw qaStatusError("Services-addActivity, check1 has a problem with QAStatus...");
                    }

                    //console.log("row is next...");
                    //console.dir(row);
                    activities.activities[key].ActivityQAStatus =
                        {
                            QAStatusID: row.ActivityQAStatus.QAStatusId,
                            QAComments: row.ActivityQAStatus.QAComments,
                            Name: row.QAStatusName,
                            Description: row.QAStatusDescription
                        };
                    //console.log("ActivityQAStatus is next...");
                    //console.dir(activities.activities[key].ActivityQAStatus);



                    //true if we are editing...
                    if (row.ActivityId)
                        activities['ActivityId'] = row.ActivityId;

                    //copy the other header fields from this first row.
                    angular.forEach(fields.header, function (field) {

                        //flatten multiselect values into an json array string
                        if (field.ControlType == "multiselect" && row[field.DbColumnName]) {
                            row[field.DbColumnName] = angular.toJson(row[field.DbColumnName]).toString(); //wow, definitely need tostring here!
                        }

                        activities.activities[key].Header[field.DbColumnName] = row[field.DbColumnName];
                    });
					// For CRPP, ProjectLead is not in the list of dataset fields, so we must add it.
					if (row.ProjectLead)
						activities.activities[key].Header["ProjectLead"] = row.ProjectLead;

                }

                //add in activityqa if there isn't one (now required) -- for every row
                if (!row.ActivityQAStatus) {
                    //datasheet case
                    row.ActivityQAStatus =
                        {
                            QAStatusId: row.QAStatusId,
                            QAComments: ''
                        };
                    row.QAStatusId = row.RowQAStatusId; // and then set QA status for this row...

                    for (var i = 0; i < qaStatuses.length; i++) {
                        //console.log("Checking QId:  " +qaStatuses[i].Id + ", Name:  " + qaStatuses[i].Name);
                        //console.log("row.ActivityQAStatus.QAStatusId = " + row.ActivityQAStatus.QAStatusId);
                        //if (row.ActivityQAStatus.QAStatusId.indexOf(qaStatuses[i].Id) > -1)
                        if (row.ActivityQAStatus.QAStatusId === qaStatuses[i].Id) {
                            //console.log("This is the match...");
                            row.QAStatusName = qaStatuses[i].Name;
                            row.QAStatusDescription = qaStatuses[i].Description;
                        }
                        else {
                            //console.log("Did not match...");
                        }
                    }
                }
                else {
                    //console.log("row.ActivityQAStatus already exists...");
                    //console.dir(row);
                }

                if ((typeof qaStatuses !== 'undefined') && (qaStatuses !== null)) {
                    for (var i = 0; i < qaStatuses.length; i++) {
                        //console.log("Checking QId:  " +qaStatuses[i].Id + ", Name:  " + qaStatuses[i].Name);
                        //console.log("row.ActivityQAStatus.QAStatusId = " + row.ActivityQAStatus.QAStatusId);
                        //if (row.ActivityQAStatus.QAStatusId.indexOf(qaStatuses[i].Id) > -1)
                        if (row.ActivityQAStatus.QAStatusId === qaStatuses[i].Id) {
                            //console.log("This is the match...");
                            row.QAStatusName = qaStatuses[i].Name;
                            row.QAStatusDescription = qaStatuses[i].Description;
                        }
                        else {
                            //console.log("Did not match...");
                        }
                    }
                }
                else {
                    throw qaStatusError("Services-addActivity, check2 has a problem with QAStatus...");
                }

                //iterate through each field and do any necessary processing to field values
                var rowHasValue = prepFieldsToSave(row, fields.detail, currentTimezone);

                //console.dir(fields);

                //iterate through fields now and also prep any grid fields
                angular.forEach(Object.keys(fields.relation), function (relation_field) {
                    //console.dir(relation_field);
                    //console.log("we ahve a grid cell to save!: " + relation_field);
                    var rel_grid = row[relation_field];
                    //console.dir(rel_grid);
                    angular.forEach(rel_grid, function (grid_row) {
                        //console.dir(grid_row);
                        var gridHasValue = prepFieldsToSave(grid_row, fields.relation[relation_field], currentTimezone);
                        rowHasValue = (rowHasValue) ? rowHasValue : gridHasValue; //bubble up the true!
                    });
                });

                //only save the detail row if we have a value in at least one of the fields.
                if (rowHasValue)
                    activities.activities[key].Details.push(row);

            },

        };

        return service;
    }]);


// this function is used to parse the field to prepare it to save, used by ActivityParser service.
function prepFieldsToSave(row, fields, currentTimezone) {
    var rowHasValue = false;

    //handle field level validation or processing
    angular.forEach(fields, function (field) {
        if (row[field.DbColumnName]) {
            //flatten multiselect values into an json array string
            if (field.ControlType == "multiselect")
                row[field.DbColumnName] = angular.toJson(row[field.DbColumnName]).toString(); //wow, definitely need tostring here!

            //convert to a date string on client side for datetimes
            if (field.ControlType == "datetime" && row[field.DbColumnName]) {
                if (row[field.DbColumnName] instanceof Date) {
                    row[field.DbColumnName] = toExactISOString(row[field.DbColumnName]);
                }
                else {
                    try {
                        row[field.DbColumnName] = toExactISOString(new Date(row[field.DbColumnName]));
                    } catch (e) {
                        console.log("Error converting date: " + row[field.DbColumnName]);
                    }
                }
            }

            rowHasValue = true;
        }
    });

    return rowHasValue;

}