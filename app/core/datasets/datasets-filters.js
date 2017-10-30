'use strict';

/* Defines filters used by the dataset module */

datasets_module
    .filter('checkmark', function () {
        return function (input) {
            return (input == null) ? '\u2713' : '\u2718';
        };
    })
    .filter('units', function () {
        return function (input) {
            return (input == null) ? '' : ' ('+input+')';
        };
    })
    .filter('locationNameFilter', function($rootScope){
        return function(input) {
            if($rootScope.locationOptions[input])
                return $rootScope.locationOptions[input];

            return input;
        };
    })
    .filter('instrumentFilter', function($rootScope){ 
        return function(input) {
            if($rootScope.instrumentOptions[input])
			{
                return $rootScope.instrumentOptions[input];
			}
            return input;
        };
    })
	.filter('timezoneFilter', function($rootScope){
        return function(input) {
            if($rootScope.timezoneOptions[input])
			{
                return $rootScope.timezoneOptions[input];
			}
            return input;
        };
	})	
    .filter('QAStatusFilter', function($rootScope){
        return function(input) {
            if($rootScope.QAStatusOptions[input])
                return $rootScope.QAStatusOptions[input];

            return input;
        };
    })
    .filter('fishermanFilter', function($rootScope){
        return function(input) {
			//console.log("input = " + input);
			if ((typeof input !== 'undefined') && (input !== null))
			{
				return $rootScope.fishermenOptions[input];
			}
			else
			{
				return null;
			}
			
            //if($rootScope.FishermanOptions[input])
            if($rootScope.fishermenOptions[input])
			{
                //return $rootScope.FishermanOptions[input];
                return $rootScope.fishermenOptions[input];
			}
            //return input;
        };
    })
    .filter('DataGradeMethod', function($rootScope){
        return function(input) {
            return $rootScope.DataGradeMethods[input];
        };
    })
    .filter('arrayValues', function(){
        return function(input) {
            var result = '';
            if(input)
            {

                try{
                    result = angular.fromJson(input).toString();
                }
                catch(e){
                    result = input;
                }
                /*
                var vals = angular.fromJson(input);
                angular.forEach(vals, function(item){
                    if(result != '')
                        result += ',';
                    result += item;
                });
                */
            }

            return result;
        };
    })
	.filter('RowQAStatusFilter', function( $rootScope ) {
		return function(input) {
            if ($rootScope.RowQAStatuses[input]) {
				return $rootScope.RowQAStatuses[input];
            }
			else {
				return 'unknown';
            }
          };
    })
	.filter('urlsFromString', function($sce, $rootScope){
		return function(input)
		{
			//console.log("Inside urlsFromString...");
			//console.log("input is next...");
			//console.dir(input);
			var retval = [];
			if(input)
			{
				var urls = angular.fromJson(input);
				angular.forEach(urls, function(aUrl){
					//console.log("aUrl is next...");
					//console.dir(aUrl);
					var theTarget = "_blank";
					retval.push("<a href='" + aUrl.Link + "' target=\"_blank\">" + aUrl.Name + "</a>");	
				});
			}
            if(retval.length==0)
                retval = "&nbsp;";
            else
                retval = retval.join(",");

            return $sce.trustAsHtml(retval);
		};
	})
    .filter('fileNamesFromString', function($sce, $rootScope){
        return function(input)
        {
			//console.log("Inside fileNamesFromString...");
			//console.log("input is next...");
			//console.dir(input);
            var retval = [];
			var fileIsString = false;
            if(input)
            {
                //var files = angular.fromJson(input); // Original line
				var files = null;
				try 
				{
					files = angular.fromJson(input);
				}
				catch (err)
				{
					files = [];
					files.push(input);
					fileIsString = true;
				}
				
                //angular.forEach(files, function(file){
                angular.forEach(files, function(file, value){
                    //retval.push("<a href='" + file.Link + "'>" + file.Name + "</a>"); // Original line
					
					var theTarget = "_blank";
					//console.log("$rootScope.DatastoreTablePrefix = " + $rootScope.DatastoreTablePrefix);
					//console.log("$rootScope.viewSubproject is next...");
					//console.dir($rootScope.viewSubproject);
					/*if (($rootScope.DatastoreTablePrefix === "CrppContracts") && ($rootScope.viewSubproject))
					{
						//retval.push("<a href='" + serviceUrl + "/uploads/subprojects/" + $rootScope.subprojectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
						//retval.push("<a href='" + crppUrl + "uploads/subprojects/" + $rootScope.subprojectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
						//retval.push("<a href='" + crppUrl + "\\uploads\\subprojects\\" + $rootScope.subprojectId + "\\" + file.Name + "' target=\\\"_blank\\\">" + file.Name + "</a>");
						retval.push("<a href='" + crppUrl + $rootScope.subprojectId + "\\" + file.Name + "' target=\\\"_blank\\\">" + file.Name + "</a>");
					}
					//else if ($rootScope.projectId === 1223) //&& ($rootScope.viewSubproject)) // Habitat
					else if ($rootScope.subprojectType === "Habitat") //&& ($rootScope.viewSubproject)) // Habitat
					{
						//console.log("file is next...");
						//console.dir(file);
						//console.log("value is next...");
						//console.dir(value);
						//retval.push("<a href='" + habUrl + "uploads\\subprojects\\" + $rootScope.subprojectId + "\\" + file.Name + "' target=\\\"_blank\\\">" + file.Name + "</a>");
						if (value === "Name")
							retval.push("<a href='" + habUrl + $rootScope.subprojectId + "\\" + file + "' target=\\\"_blank\\\">" + file + "</a>");
						else if (!isNaN(value))
							retval.push("<a href='" + habUrl + $rootScope.subprojectId + "\\" + file.Name + "' target=\\\"_blank\\\">" + file.Name + "</a>");
					}
					else if (fileIsString)
					{
						retval.push("<a href='" + serviceUrl + "/uploads/" + $rootScope.projectId + "/" + file + "' target=\"_blank\">" + file + "</a>");
					}
					else
						retval.push("<a href='" + serviceUrl + "/uploads/" + $rootScope.projectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
					*/
					
					if (!$rootScope.viewSubproject) // We are working with a project, dataset, or new subproject file.
					{
						if ($rootScope.datasetId) // It's a dataset
						{
							//console.log("This is a dataset file.");
							if (fileIsString)
							{
								retval.push("<a href='" + cdmsShareUrl + "P/" + $rootScope.projectId + "/D/" + $rootScope.datasetId + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
							}
							else
								retval.push("<a href='" + cdmsShareUrl + "P/" + $rootScope.projectId + "/D/" + $rootScope.datasetId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");	
						}
						else if ($rootScope.newSubproject) // New subproject, with no viewSubproject yet.
						{
							//console.log("This is a subproject file.");
							if (fileIsString)
							{
								retval.push("<a href='" + cdmsShareUrl + "P/" + $rootScope.projectId + "/S/[TBD]" + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
							}
							else
								retval.push("<a href='" + cdmsShareUrl + "P/" + $rootScope.projectId + "/S/[TBD]" + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
						}
						else // It's a project
						{
							//console.log("This is a project file.");
							if (fileIsString)
							{
								retval.push("<a href='" + cdmsShareUrl + "P/" + $rootScope.projectId + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
							}
							else
								retval.push("<a href='" + cdmsShareUrl + "P/" + $rootScope.projectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
						}
					}
					else if ($rootScope.viewSubproject) // We are working with a subproject file.
					{
						//console.log("This is a subproject file.");
						//console.log("$rootScope.projectId = " + $rootScope.projectId);
						if (fileIsString)
						{
							retval.push("<a href='" + cdmsShareUrl + "P/" + $rootScope.projectId + "/S/" + $rootScope.subprojectId + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
						}
						else
							retval.push("<a href='" + cdmsShareUrl + "P/" + $rootScope.projectId + "/S/" + $rootScope.subprojectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");

					}
                });
            }

            if(retval.length==0)
                retval = "&nbsp;";
            else
                retval = retval.join(",");

            return $sce.trustAsHtml(retval);
            
        };
    }).filter('countItems', function($sce){
        return function(input)
        {
            var retval = '-';
            if(input)
            {
                retval = array_count(input) + "";
            }
            return $sce.trustAsHtml(retval);
        }
    })
    

;
