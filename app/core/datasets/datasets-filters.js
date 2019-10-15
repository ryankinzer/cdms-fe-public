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
.filter('arrayDisplayValue', function(){
        return function(input,field) {
            //console.log(" ----- Field: " + field.DbColumnName);
            //console.dir(input);
            //console.dir(field.PossibleValues);

            var result = '';
            var the_val = '';

            if(input)
            {

                try{
                    the_val = angular.fromJson(input).toString();
                    //console.dir(the_val);
                    //console.dir(field.PossibleValues);
                    
                }
                catch(e){
                    //console.dir(e);
                    the_val = input;
                }
            }

            //if multiselect and we have more than one value, compose them
            if (Array.isArray(the_val)) {
                var arr_result = [];
                the_val.forEach(function (val) {
                    arr_result.push(field.PossibleValues[val]);
                });
                result = arr_result.join(",");
            } else {
                //otherwise single select, return the matched value
                result = field.PossibleValues[the_val];
            }

            if (!result)
                result = the_val;

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
    .filter('fileNamesFromString', function($sce){ // to use this filter you need to pass in the scope in the filter call: "| fileNamesFromString:this"
        return function(input, $scope) 
        {
            //console.log($scope.project.Id);
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
				
                angular.forEach(files, function(file, value){
					
					var theTarget = "_blank";
					
					if (!$scope.viewSubproject) // We are working with a project, dataset, or new subproject file.
					{
						if ($scope.dataset && $scope.dataset.Id) // It's a dataset
						{
							//console.log("This is a dataset file.");
							if (fileIsString)
							{
                                //retval.push("<a href='" + cdmsShareUrl + "P/" + $scope.dataset.ProjectId + "/D/" + $scope.dataset.Id + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
                                retval.push("<a href='" + cdmsShareUrl + "/" + $scope.dataset.ProjectId + "/D/" + $scope.dataset.Id + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
							}
							else
                                //retval.push("<a href='" + cdmsShareUrl + "P/" + $scope.dataset.ProjectId + "/D/" + $scope.dataset.Id + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
                                retval.push("<a href='" + cdmsShareUrl + "/" + $scope.dataset.ProjectId + "/D/" + $scope.dataset.Id + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");	
						}
						else if ($scope.newSubproject) // New subproject, with no viewSubproject yet.
						{
							//console.log("This is a subproject file.");
							if (fileIsString)
							{
								retval.push("<a href='" + cdmsShareUrl + "P/" + $scope.project.Id + "/S/[TBD]" + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
							}
							else
								retval.push("<a href='" + cdmsShareUrl + "P/" + $scope.project.Id + "/S/[TBD]" + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
						}
						else // It's a project
						{
							console.log("This is a project file.");
							if (fileIsString)
							{
								retval.push("<a href='" + cdmsShareUrl + "P/" + $scope.project.Id + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
							}
							else
								retval.push("<a href='" + cdmsShareUrl + "P/" + $scope.project.Id + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
						}
					}
					else if ($scope.viewSubproject) // We are working with a subproject file.
					{
						//console.log("This is a subproject file.");
						//console.log("$rootScope.projectId = " + $rootScope.projectId);
						if (fileIsString)
						{
							retval.push("<a href='" + cdmsShareUrl + "P/" + $scope.project.Id + "/S/" + $scope.subprojectId + "/" + file + "' target=\"_blank\">" + file.Name + "</a>");
						}
						else
							retval.push("<a href='" + cdmsShareUrl + "P/" + $scope.project.Id + "/S/" + $scope.subprojectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");

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
    }).filter('orderByObjectValue', function () {
          
          return function (obj) {
            var array = [];

            Object.keys(obj).forEach(function (key) {
                array.push({ Id: key, Label: obj[key] });
            });

            // apply a custom sorting function
            array.sort(orderByAlpha);

            //console.dir(array);
            return array;
          };
    }).filter('orderAlpha',function(){
        return function(items) {
            var filtered = [];
            
            Object.keys(items).forEach(function (key) {
                filtered.push({ key: items[key] });
            });

            filtered.sort(function(a,b){
                var aVal = "";
                var bVal = "";
                for(let [akey,avalue] of Object.entries(a)){
                    aVal = avalue;
                    for( let [bkey,bvalue] of Object.entries(b)){
                        bVal = bvalue;
                    }
                } 
                return aVal > bVal ? 1 : -1;
            });
            //console.dir(filtered);
            return filtered;
          };
    })
    

;
