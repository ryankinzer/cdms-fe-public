
var modal_create_crpp_subproject = ['$scope', '$rootScope', '$modalInstance', 'DatasetService', 'SubprojectService', 'ServiceUtilities',
    '$timeout', '$location', '$anchorScroll', '$document',
    function ($scope, $rootScope, $modalInstance, DatasetService, SubprojectService, ServiceUtilities,
        $timeout, $location, $anchorScroll, $document) {
        console.log("Inside ModalCreateSubprojectCtrl...");

        //$scope.agencyInfo = [[]];

        $document.on('keydown', function (e) {
            //console.log("Inside document.on keydown...");
            //console.log("e is next...");
            //console.dir(e);
            //console.log("e.target.nodeName = " + e.target.nodeName);

            // Note:  keyCode 8 = Backspace; the nodeName value is in uppercase, so we must check for that here.
            if ((e.keyCode === 8) && (e.target.nodeName === "TEXTAREA")) {
                //console.log("  Backspace pressed...and we are in a TEXTAREA");
                //e.preventDefault();

                var keyboardEvent = $document[0].createEvent("KeyboardEvent");
                var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

                keyboardEvent[initMethod](
                    "keydown", // event type : keydown, keyup, keypress
                    true, // bubbles
                    true, // cancelable
                    window, // viewArg: should be window
                    false, // ctrlKeyArg
                    false, // altKeyArg
                    false, // shiftKeyArg
                    false, // metaKeyArg
                    37, // keyCodeArg : unsigned long the virtual key code, else 0.  37 = Left Arrow key
                    0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0				
                );
                //console.log("Just did left arrow...");

                document.dispatchEvent(keyboardEvent);

                keyboardEvent[initMethod](
                    "keydown", // event type : keydown, keyup, keypress
                    true, // bubbles
                    true, // cancelable
                    window, // viewArg: should be window
                    false, // ctrlKeyArg
                    false, // altKeyArg
                    false, // shiftKeyArg
                    false, // metaKeyArg
                    46, // keyCodeArg : unsigned long the virtual key code, else 0.  46 = Delete key
                    0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0				
                );

                //console.log("Doing delete...");			
                return document.dispatchEvent(keyboardEvent);
            }
        });

        $scope.header_message = "Create new CRPP project";
        $rootScope.crppProjectName = $scope.crppProjectName = "";
        $rootScope.projectId = $scope.project.Id;

        $scope.subproject_row = {
            StatusId: 0,
            //OwningDepartmentId: 1,
        };

        $scope.agencyList = [];
        $scope.agencyList.push({ Id: 0, Label: "ACHP" });
        $scope.agencyList.push({ Id: 1, Label: "Anderson Perry" });
        $scope.agencyList.push({ Id: 2, Label: "Army" });
        $scope.agencyList.push({ Id: 3, Label: "Baker County" });
        $scope.agencyList.push({ Id: 4, Label: "Benton County" });
        $scope.agencyList.push({ Id: 5, Label: "BIA" });
        $scope.agencyList.push({ Id: 6, Label: "BLM" });
        $scope.agencyList.push({ Id: 7, Label: "Blue Mountain Ranger District" });
        $scope.agencyList.push({ Id: 8, Label: "BNSF" });
        $scope.agencyList.push({ Id: 9, Label: "BOR" });
        $scope.agencyList.push({ Id: 10, Label: "BPA" });
        $scope.agencyList.push({ Id: 11, Label: "Camas" });
        $scope.agencyList.push({ Id: 12, Label: "CenturyLink" });
        $scope.agencyList.push({ Id: 13, Label: "Clark County" });
        $scope.agencyList.push({ Id: 14, Label: "College Place" });
        $scope.agencyList.push({ Id: 15, Label: "Columbia County" });
        $scope.agencyList.push({ Id: 16, Label: "Corps Portland District" });
        $scope.agencyList.push({ Id: 17, Label: "Corps Regulatory" });
        $scope.agencyList.push({ Id: 18, Label: "Corps Walla Walla District" });
        $scope.agencyList.push({ Id: 19, Label: "CRGNSA" });
        $scope.agencyList.push({ Id: 20, Label: "CTUIR" });
        $scope.agencyList.push({ Id: 21, Label: "DAHP" });
        $scope.agencyList.push({ Id: 22, Label: "DECD" });
        $scope.agencyList.push({ Id: 23, Label: "Department of Ecology" });
        $scope.agencyList.push({ Id: 24, Label: "DEQ" });
        $scope.agencyList.push({ Id: 25, Label: "DOE" });
        $scope.agencyList.push({ Id: 26, Label: "DOGAMI" });
        $scope.agencyList.push({ Id: 27, Label: "DSL" });
        $scope.agencyList.push({ Id: 28, Label: "EPA" });
        $scope.agencyList.push({ Id: 29, Label: "FAA" });
        $scope.agencyList.push({ Id: 30, Label: "FCC" });
        $scope.agencyList.push({ Id: 31, Label: "Federal Transit Authority" });
        $scope.agencyList.push({ Id: 32, Label: "FEMA" });
        $scope.agencyList.push({ Id: 33, Label: "FERC" });
        $scope.agencyList.push({ Id: 34, Label: "FHWA" });
        $scope.agencyList.push({ Id: 35, Label: "Fisheries" });
        $scope.agencyList.push({ Id: 36, Label: "Fort Vancouver (NPS)" });
        $scope.agencyList.push({ Id: 37, Label: "Franklin County" });
        $scope.agencyList.push({ Id: 38, Label: "FSA" });
        $scope.agencyList.push({ Id: 39, Label: "Hells Canyon NRA" });
        $scope.agencyList.push({ Id: 40, Label: "Heppner Ranger District" });
        $scope.agencyList.push({ Id: 41, Label: "Hermiston" });
        $scope.agencyList.push({ Id: 42, Label: "Hood River County" });
        $scope.agencyList.push({ Id: 43, Label: "HUD" });
        $scope.agencyList.push({ Id: 44, Label: "Idaho Power" });
        $scope.agencyList.push({ Id: 45, Label: "Irrigon" });
        $scope.agencyList.push({ Id: 46, Label: "John Day Fossil Beds (NPS)" });
        $scope.agencyList.push({ Id: 47, Label: "Kennewick" });
        $scope.agencyList.push({ Id: 48, Label: "Klickitat County" });
        $scope.agencyList.push({ Id: 49, Label: "La Grande Ranger District" });
        $scope.agencyList.push({ Id: 50, Label: "Landowner" });
        $scope.agencyList.push({ Id: 51, Label: "Malheur National Forest" });
        $scope.agencyList.push({ Id: 52, Label: "Morrow County" });
        $scope.agencyList.push({ Id: 53, Label: "Navy" });
        $scope.agencyList.push({ Id: 54, Label: "Nez Perce National Historical Park (NPS)" });
        $scope.agencyList.push({ Id: 55, Label: "North Fork John Day Ranger District" });
        $scope.agencyList.push({ Id: 56, Label: "Northwest Pipeline" });
        $scope.agencyList.push({ Id: 57, Label: "NPS" });
        $scope.agencyList.push({ Id: 58, Label: "NRCS" });
        $scope.agencyList.push({ Id: 59, Label: "ODEQ" });
        $scope.agencyList.push({ Id: 60, Label: "ODOE" });
        $scope.agencyList.push({ Id: 61, Label: "ODOT" });
        $scope.agencyList.push({ Id: 62, Label: "OPRD" });
        $scope.agencyList.push({ Id: 63, Label: "Oregon City" });
        $scope.agencyList.push({ Id: 64, Label: "Oregon Military Department/Oregon Army National Guard" });
        $scope.agencyList.push({ Id: 65, Label: "Other" });
        $scope.agencyList.push({ Id: 66, Label: "OWRD" });
        $scope.agencyList.push({ Id: 67, Label: "PacifiCorp" });
        $scope.agencyList.push({ Id: 68, Label: "Pasco" });
        $scope.agencyList.push({ Id: 69, Label: "PGE" });
        $scope.agencyList.push({ Id: 70, Label: "Planning Dept" });
        $scope.agencyList.push({ Id: 71, Label: "Pomeroy Ranger District" });
        $scope.agencyList.push({ Id: 72, Label: "Port of Benton" });
        $scope.agencyList.push({ Id: 73, Label: "Port of Clarkston" });
        $scope.agencyList.push({ Id: 74, Label: "Port of Columbia" });
        $scope.agencyList.push({ Id: 75, Label: "Port of Kennewick" });
        $scope.agencyList.push({ Id: 76, Label: "Port of Morrow" });
        $scope.agencyList.push({ Id: 77, Label: "Port of Umatilla" });
        $scope.agencyList.push({ Id: 78, Label: "Port of Walla Walla" });
        $scope.agencyList.push({ Id: 79, Label: "Public Works" });
        $scope.agencyList.push({ Id: 80, Label: "RAF" });
        $scope.agencyList.push({ Id: 81, Label: "Recreation and Conservation Office" });
        $scope.agencyList.push({ Id: 82, Label: "Richland" });
        $scope.agencyList.push({ Id: 83, Label: "Rural Development" });
        $scope.agencyList.push({ Id: 84, Label: "RUS" });
        $scope.agencyList.push({ Id: 85, Label: "SHPO Oregon" });
        $scope.agencyList.push({ Id: 86, Label: "Skamania County" });
        $scope.agencyList.push({ Id: 87, Label: "Skamania County PUD" });
        $scope.agencyList.push({ Id: 88, Label: "Umatilla County" });
        $scope.agencyList.push({ Id: 89, Label: "Umatilla National Forest" });
        $scope.agencyList.push({ Id: 90, Label: "UPRR" });
        $scope.agencyList.push({ Id: 91, Label: "USACE" });
        $scope.agencyList.push({ Id: 92, Label: "USFWS" });
        $scope.agencyList.push({ Id: 93, Label: "VA" });
        $scope.agencyList.push({ Id: 94, Label: "Vancouver" });
        $scope.agencyList.push({ Id: 95, Label: "Walla Walla City" });
        $scope.agencyList.push({ Id: 96, Label: "Walla Walla County" });
        $scope.agencyList.push({ Id: 97, Label: "Walla Walla Ranger District" });
        $scope.agencyList.push({ Id: 98, Label: "Wallowa County" });
        $scope.agencyList.push({ Id: 99, Label: "Wallowa Valley Ranger District" });
        $scope.agencyList.push({ Id: 100, Label: "Wallowa-Whitman National Forest" });
        $scope.agencyList.push({ Id: 101, Label: "Wasco County" });
        $scope.agencyList.push({ Id: 102, Label: "Washington Department of Commerce" });
        $scope.agencyList.push({ Id: 103, Label: "Washington Department of Health" });
        $scope.agencyList.push({ Id: 104, Label: "Washington Department of Natural Resources" });
        $scope.agencyList.push({ Id: 105, Label: "Washington State Parks" });
        $scope.agencyList.push({ Id: 106, Label: "Water Resources" });
        $scope.agencyList.push({ Id: 107, Label: "WDFW" });
        $scope.agencyList.push({ Id: 108, Label: "Western Federal Lands Highway Division" });
        $scope.agencyList.push({ Id: 109, Label: "Whitman Mission (NPS)" });
        $scope.agencyList.push({ Id: 110, Label: "Whitman Unit" });
        $scope.agencyList.push({ Id: 111, Label: "Wildlife" });
        $scope.agencyList.push({ Id: 112, Label: "WSDOT" });
        $scope.agencyList.push({ Id: 113, Label: "Yellowstone National Park" });

        console.log("$scope.agencyList is next...");
        console.dir($scope.agencyList);

        //$scope.agencyOptions = $rootScope.responseTypeOptions = makeObjects($scope.agencyList, 'Id','Label') ;
        //console.log("$scope.agencyOptions is next...");
        //console.dir($scope.agencyOptions);

        $scope.counties = [];

        $scope.countyList = [];
        $scope.countyList.push({ Id: 0, Label: "Asotin" });
        $scope.countyList.push({ Id: 1, Label: "Baker" });
        $scope.countyList.push({ Id: 2, Label: "Benton" });
        $scope.countyList.push({ Id: 3, Label: "Clark" });
        $scope.countyList.push({ Id: 4, Label: "Columbia" });
        $scope.countyList.push({ Id: 5, Label: "Franklin" });
        $scope.countyList.push({ Id: 7, Label: "Garfield" });
        $scope.countyList.push({ Id: 8, Label: "Gilliam" });
        $scope.countyList.push({ Id: 9, Label: "Garfield" });
        $scope.countyList.push({ Id: 10, Label: "Grant, WA" });
        $scope.countyList.push({ Id: 11, Label: "Grant, OR" });
        $scope.countyList.push({ Id: 12, Label: "Hood River" });
        $scope.countyList.push({ Id: 13, Label: "Klickitat" });
        $scope.countyList.push({ Id: 14, Label: "Malheur" });
        $scope.countyList.push({ Id: 15, Label: "Morrow" });
        $scope.countyList.push({ Id: 16, Label: "Multnomah" });
        $scope.countyList.push({ Id: 17, Label: "Other" });
        $scope.countyList.push({ Id: 18, Label: "Sherman" });
        $scope.countyList.push({ Id: 19, Label: "Skamania" });
        $scope.countyList.push({ Id: 20, Label: "Umatilla" });
        $scope.countyList.push({ Id: 21, Label: "Union" });
        $scope.countyList.push({ Id: 22, Label: "Walla Walla" });
        $scope.countyList.push({ Id: 23, Label: "Wallowa" });
        $scope.countyList.push({ Id: 24, Label: "Wasco" });
        $scope.countyList.push({ Id: 25, Label: "Wheeler" });
        $scope.countyList.push({ Id: 26, Label: "Whitman" });

        console.log("$scope.countyList is next...");
        console.dir($scope.countyList);
        //$scope.countyOptions = $rootScope.countyOptions = makeObjects($scope.countyList, 'Id','Label') ;

        $scope.showOtherAgency = false;
        $scope.showOtherProjectProponent = false;
        $scope.showOtherCounty = false;
        $scope.showCountyOptions = false;
        $scope.showAddDocument = true;

        $scope.example1model = [];
        $scope.example1data = [{ id: 1, label: "David" }, { id: 2, label: "Jhon" }, { id: 3, label: "Danny" }];

        if ($scope.viewSubproject) {
            $scope.header_message = "Edit CRPP project: " + $scope.viewSubproject.ProjectName;
            $scope.subproject_row = angular.copy($scope.viewSubproject);
            console.log("$scope.subproject_row is next...");
            console.dir($scope.subproject_row);

            $scope.showAddDocument = false;

            console.log("$scope.subproject_row.Agency = " + $scope.subproject_row.Agency);
            var keepGoing = true;
            var foundIt = false;
            //var responseTypeIndex = 0;

            /*
            *	Need to redo the Agency, Project Proponent, and County
            *
            */
            // Check the Agency
            /*angular.forEach($scope.agencyList, function(option){
            //console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.Agency = x" + $scope.subproject_row.Agency + "x.");
                if ((keepGoing) && (option.Label === $scope.subproject_row.Agency))
                {
                    //console.log("option.Label = " + option.Label);
                    //console.log("Found the Agency...");
                    foundIt = true;
                    keepGoing = false;
                }
                //responseTypeIndex++;
            });
        	
            if (!foundIt)
            {
                console.log("Value of Agency is not in the list...");
                $scope.subproject_row.OtherAgency = $scope.subproject_row.Agency;
                $scope.subproject_row.Agency = "Other";
                $scope.showOtherAgency = true;		
            }
            */
            if ((typeof $scope.subproject_row.OtherAgency !== 'undefined') && ($scope.subproject_row.OtherAgency !== null))
                $scope.showOtherAgency = true;

            /*
            keepGoing = true;
            foundIt = false;
            // Check the Project Proponent  Note:  We use the same list as for the Agency.
            console.log("$scope.subproject_row.ProjectProponent = " + $scope.subproject_row.ProjectProponent);
            angular.forEach($scope.agencyList, function(option){
            //console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.ProjectProponent = x" + $scope.subproject_row.ProjectProponent + "x.");
                if ((keepGoing) && (option.Label === $scope.subproject_row.ProjectProponent))
                {
                    //console.log("option.Label = " + option.Label);
                    //console.log("Found the ProjectProponent...");
                    foundIt = true;
                    keepGoing = false;
                }
                //responseTypeIndex++;
            });
        	
            if (!foundIt)
            {
                console.log("Value of ProjectProponent is not in the list...");
                $scope.subproject_row.OtherProjectProponent = $scope.subproject_row.ProjectProponent;
                $scope.subproject_row.ProjectProponent = "Other";
                $scope.showOtherProjectProponent = true;		
            }
            */
            if ((typeof $scope.subproject_row.OtherProjectProponent !== 'undefined') && ($scope.subproject_row.OtherProjectProponent !== null))
                $scope.showOtherProjectProponent = true;

            /*
            keepGoing = true;
            foundIt = false;
            // Check the County
            console.log("$scope.subproject_row.County = " + $scope.subproject_row.County);
        	
            // Copy the array into a string.
            var strCounty = "";
            angular.forEach($scope.subproject_row.County, function(item){
                strCounty += item + ",";
            });
            console.log("strCounty = " + strCounty);
        	
            // Remove the trailing comma.
            strCounty = strCounty.substring(0, strCounty.length - 1);
            console.log("strCounty = " + strCounty);
            */

            // Now, strip off the "[]".
            if ((typeof $scope.subproject_row.County !== 'undefined') && ($scope.subproject_row.County !== null)) {
                var strCounty = $scope.subproject_row.County;
                strCounty = strCounty.replace(/["\[\]]+/g, '');
                console.log("strCounty = " + strCounty);
                $scope.subproject_row.County = strCounty;
                console.log("$scope.subproject_row.County = " + $scope.subproject_row.County);

                $scope.subproject_row.txtCounty = strCounty;
            }

            if ((typeof $scope.subproject_row.OtherCounty !== 'undefined') && ($scope.subproject_row.OtherCounty !== null))
                $scope.showOtherCounty = true;


            // Now convert our string to an array, to compare with the countyList.
            /*var aryCounties = $scope.subproject_row.County.split(",");
            console.log("aryCounties is next...");
            console.dir(aryCounties);
    
            angular.forEach(aryCounties, function(county){		
            //console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.County = x" + $scope.subproject_row.County + "x.");
                angular.forEach($scope.countyList, function(option){
                    if ((keepGoing) && (option.Label === county))
                    {
                        //console.log("option.Label = " + option.Label);
                        console.log("Found county:  " + county);
                        foundIt = true;
                        keepGoing = false;
                    }
                });
                if (!foundIt)
                {
                	
                }
            });		
            */

            /*angular.forEach($scope.countyList, function(option){
            //console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.County = x" + $scope.subproject_row.County + "x.");
                if ((keepGoing) && (option.Label === $scope.subproject_row.County))
                {
                    //console.log("option.Label = " + option.Label);
                    //console.log("Found the County...");
                    foundIt = true;
                    keepGoing = false;
                }
            });
    
        	
            if (!foundIt)
            {
                console.log("Value of County is not in the list...");
                $scope.subproject_row.OtherCounty = $scope.subproject_row.County;
                $scope.subproject_row.County = "Other";
                $scope.showOtherCounty = true;		
            }
            */



            // First convert our county string into an array.
            /*var strCounty = $scope.subproject_row.County;
            console.log("strCounty = " + strCounty);
        	
            strCounty = strCounty.substring(1, strCounty.length -1);
            console.log("strCounty = " + strCounty);
        	
            strCounty = strCounty.replace(/["]+/g, '');
            console.log("strCounty = " + strCounty);		
        	
            var aryCounty = strCounty.split(",");
            console.log("aryCounty is next...");
            console.dir(aryCounty);
        	
            //var result = document.getElementsByTagName("select");
            //var result = document.getElementById("County");
            //console.dir(result);
            var c = 0;
            angular.forEach(result, function(item){
                console.log(item[c].innerHTML);
                c++;
            });
        	
            var wrappedResult = angular.element(result);
            console.dir(wrappedResult);
            angular.forEach(element.find('select'), function(node)
            {
                if (node.Id === 'County')
                    console.log("Found County select...");
            	
            });
        	
            var counties = angular.element("County").options;
            console.log("counties is next...");
            console.dir(counties);
            angular.forEach(aryCounty, function (county){
                for (var i = 0, max = counties.length; i < max; i++)
                {
                    if (counties[i].innerHTML === county)
                        counties[i].selected = true;
                }
            	
            });		
            $scope.subproject_row.County = aryCounty;
            */
            /*scope.subproject_row.County = 'undefined';
            $scope.subproject_row.County = [];
            angular.forEach(aryCounty, function(county){
                $scope.subproject_row.County.push(county);
            });
            */
            console.log("$scope.subproject_row.County is next...");
            console.dir($scope.subproject_row.County);

            angular.forEach($scope.countyList, function (option) {
                //console.log("option.Label = x" + option.Label + "x, $scope.subproject_row.County = x" + $scope.subproject_row.County + "x.");
                if ((keepGoing) && (option.Label === $scope.subproject_row.County)) {
                    //console.log("option.Label = " + option.Label);
                    //console.log("Found the County...");
                    foundIt = true;
                    keepGoing = false;
                }
            });
            angular.forEach($scope.subproject_row.County, function (county) {
                if (county === "Other")
                    foundIt = true;

            });

            if (!foundIt) {
                console.log("Value of County is not in the list...");
                $scope.subproject_row.OtherCounty = $scope.subproject_row.County;
                $scope.subproject_row.County = "Other";
                $scope.showOtherCounty = true;
            }
        }

        console.log("$scope inside ModalCreateSubprojectCtrl, after initializing, is next...");
        //console.dir($scope);

        $scope.selectAgency = function () {
            console.log("Inside selectAgency...");
            //console.dir($scope);
            console.log("$scope.subproject_row is next...");
            console.dir($scope.subproject_row);

            $scope.showCountyOptions = false;

            if ($scope.subproject_row.Agency === "Other") {
                $scope.showOtherAgency = true;
                $scope.subproject_row.OtherAgency = "";
            }
            else {
                $scope.showOtherAgency = false;
                $scope.subproject_row.OtherAgency = 'undefined';
            }

            console.log("$scope.showOtherAgency = " + $scope.showOtherAgency);
        };

        /*$scope.agencyChanged = function () {
            console.log("Inside agencyChanged...");
            console.log("$scope.subproject_row is next...");
            console.dir($scope.subproject_row);
            if ($scope.subproject_row.Agency === "Other")
            {
                $scope.showOtherAgency = true;
                $scope.subproject_row.OtherAgency = "";
            }
            else
                $scope.showOtherAgency = false;
                $scope.subproject_row.OtherAgency = 'undefined';
        	
            console.log("$scope.showOtherAgency = " + $scope.showOtherAgency);
        };
        */

        $scope.selectProjectProponent = function () {
            console.log("Inside selectProjectProponent...");
            console.log("$scope.subproject_row is next...");
            console.dir($scope.subproject_row);

            $scope.showCountyOptions = false;

            if ($scope.subproject_row.ProjectProponent === "Other") {
                $scope.showOtherProjectProponent = true;
                $scope.subproject_row.OtherProjectProponent = "";
            }
            else {
                $scope.showOtherProjectProponent = false;
                $scope.subproject_row.OtherProjectProponent = 'undefined';
            }

            console.log("$scope.showOtherProjectProponent = " + $scope.showOtherProjectProponent);
        };

        /*$scope.selectCounty = function () {
            console.log("Inside selectCounty...");
            console.log("$scope.subproject_row is next...");
            console.dir($scope.subproject_row);
        	
            var strCounty = $scope.subproject_row.County.toString();
            if (strCounty.indexOf("Other") > -1)
            {
                $scope.showOtherCounty = true;
            }
            else
            {
                $scope.showOtherCounty = false;
            }
            */
		/*if ($scope.subproject_row.County === "Other")
		{
			$scope.showOtherCounty = true;
			$scope.subproject_row.OtherCounty = "";
		}
		else
		{
			$scope.showOtherCounty = false;
			$scope.subproject_row.OtherCounty = 'undefined';
		}
		*/
		/*
		console.log("$scope.showOtherCounty = " + $scope.showOtherCounty);
	};
	*/

        /*$scope.projectProponentChanged = function () {
            console.log("Inside projectProponentChanged...");
            console.log("$scope.viewSubproject is next...");
            console.dir($scope.subproject_row);
            if ($scope.subproject_row.ProjectProponent === "Other")
                $scope.showOtherProjectProponent = true;
            else
                $scope.showOtherProjectProponent = false;
        	
            console.log("$scope.showOtherProjectProponent = " + $scope.showOtherProjectProponent);
        };
        */

        $scope.enteredSelectedCounties = function () {
            $scope.showCountyOptions = true;
        };

        $scope.enteredSomethingElse = function () {
            $scope.showCountyOptions = false;
        };

        $scope.countyChanged = function () {
            console.log("Inside countyChanged...");
            console.log("$scope.subproject_row is next...");
            console.dir($scope.subproject_row);

            $scope.subproject_row.txtCounty = $scope.subproject_row.County.toString();
            if ($scope.subproject_row.txtCounty.indexOf("Other") > -1) {
                $scope.showOtherCounty = true;
            }
            else {
                $scope.showOtherCounty = false;
                $scope.subproject_row.OtherCounty = null;
            }

            /*if ($scope.subproject_row.County === "Other")
                $scope.showOtherCounty = true;
            else
                $scope.showOtherCounty = false;
            */

            //$scope.showOtherCounty = false;
            //var foundOther = false;
            //angular.forEach($scope.subproject_row.County, function(county){
            // There is only one entry for "Other"
			/*if(county === "Other")
			{
				foundOther = true;
				$scope.showOtherCounty = true
				$scope.subproject_row.OtherCounty = [];
			}
			*/
            //});

            //if (!foundOther)
            //	$scope.subproject_row.OtherCounty = 'undefined';


            console.log("$scope.showOtherCounty = " + $scope.showOtherCounty);
        };

        /*$scope.checkKeyPress = function(event){
            if (event.keyCode === 8) {
                console.log("Backspace pressed...");
            }
        };
        */

        $scope.save = function () {
            console.log("Inside ModalCreateSubprojectCtrl, save...");
			//console.log("$scope.subproject_row is next...");
			//console.dir($scope.subproject_row);
			
            $scope.subprojectSave = undefined;
            $scope.subprojectSave = [];
            $scope.createNewSubproject = false;
			$scope.errorMessage = "";
			
            if ((typeof $scope.subproject_row.ProjectName === 'undefined') || 
				($scope.subproject_row.ProjectName === null) ||
				($scope.subproject_row.ProjectName.length < 1)
				)
				{
					console.log("Project name is empty...");
					$scope.errorMessage += "Project Name cannot be blank!  ";
					$scope.subprojectSave.error = true;
				}
            }
			
			
			if ((typeof $scope.subproject_row.ProjectLead === 'undefined') || ($scope.subproject_row.ProjectLead === null)) 
			{
				console.log("Project Lead is empty...");
				$scope.errorMessage += "Project Lead cannot be blank!  "; 
				$scope.subprojectSave.error = true;
			}
			
            //console.dir($scope);

            if (!$scope.subprojectSave.error) {
                // Capture the AddDocument flag, before discarding it.
                console.log("$scope.subproject_row, full is next...");
                console.dir($scope.subproject_row);

                var addDocument = $scope.subproject_row.AddDocument;
                $scope.subproject_row.AddDocument = null;
                console.log("addDocument = " + addDocument);
                console.log("$scope.subproject_row, after del is next...");
                console.dir($scope.subproject_row);

                var saveRow = angular.copy($scope.subproject_row);
                console.log("saveRow is next..");
                console.dir(saveRow);
                /* On the form, $scope.subproject_row.Agency is an object, like this: (Id: theId Name: theName)
                * The technique used to grab the Agency works on the first click (an improvement).
                * Therefore, I (gc) kept the technique, and chose to extract/reset $scope.subproject_row.Agency here in the controller, as just the name.
                */
                //console.log("typeof saveRow.Agency = " + saveRow.Agency);
                //saveRow.Agency = 'undefined';
                //saveRow.Agency = $scope.subproject_row.Agency.Name;
                //console.log("saveRow.Agency = " + saveRow.Agency);

                // Agency Name:  If the user selected Other, we must use the name they supplied in OtherAgency.
                // 20160721:  Colette said that we need the OtherAgency, OtherProjectProponent, and OtherCounty to have their own columns in the database,
                // so that she can easily filter out and determine what "other" agencies, Project Proponents, or Counties that CRPP has interacted with.
                /*if ((typeof saveRow.OtherAgency !== 'undefined') && (saveRow.OtherAgency !== null) && (saveRow.OtherAgency !== 'undefined'))
                {
                    saveRow.Agency = saveRow.OtherAgency;
                    saveRow.OtherAgency = null; // Throw this away, because we do not want to save it; no database field or it.
                }
                */

                // Project Proponent Name:  If the user selected Other, we must use the name they supplied in OtherProjectProponent.
                /*if ((typeof saveRow.OtherProjectProponent !== 'undefined') && (saveRow.OtherProjectProponent !== null) && (saveRow.OtherProjectProponent !== 'undefined'))
                {
                    saveRow.ProjectProponent = saveRow.OtherProjectProponent;
                    saveRow.OtherProjectProponent = null; // Throw this away, because we do not want to save it; no database field or it.
                }
                */

                // County Name:  If the user selected Other, we must use the name they supplied in OtherCounty.
                //if (saveRow.OtherCounty)
                /*if ((typeof saveRow.OtherCounty !== 'undefined') && (saveRow.OtherCounty !== null) && (saveRow.OtherCounty !== 'undefined'))
                {
                    console.log("OtherCounty has a value...");
                    saveRow.County = saveRow.OtherCounty; // For single select
                    //saveRow.County.push(saveRow.OtherCounty); // For multiSelect
                	
                    saveRow.OtherCounty = null; // Throw this away, because we do not want to save it; no database field or it.
                }*/

                // Convert the multiselect (array) values into a json array string.
                //saveRow.County = angular.toJson(saveRow.County).toString();
                //var strCounty = "[";
                saveRow.County = saveRow.txtCounty;
                //angular.forEach(saveRow.County, function(county){
                //	strCounty += '"' + county + '",'; // Use single-quotes and double-quotes, so that JavaScript does not get confused.
                //});

                //console.log("strCounty = " + strCounty);
                // Trim the trailing ","
                //if (strCounty.length > 1)
                //	strCounty = strCounty.substring(0, strCounty.length -1);

                //strCounty += "]";
                //saveRow.County = strCounty;


                saveRow.YearDate = ServiceUtilities.dateTimeNowToStrYYYYMMDD_HHmmSS();
                console.log("saveRow.TrackingNumber = " + saveRow.TrackingNumber);
                if (saveRow.TrackingNumber) {
                    // The tracking number exists, but let's verify that is it not just spaces.
                    var tmpTrackingNumber = saveRow.TrackingNumber;
                    if ((tmpTrackingNumber !== null) && (tmpTrackingNumber.length > 0)) {
                        // The tracking number contains something.  Replace all the spaces and see what is left.
                        tmpTrackingNumber = tmpTrackingNumber.replace(" ", "");
                    }

                    if (tmpTrackingNumber.length === 0) {
                        saveRow.TrackingNumber = saveRow.YearDate
                    }
                }
                else {
                    // The user does not want the TrackingNumber to be set, if they leave it blank.
                    //saveRow.TrackingNumber = saveRow.YearDate
                }
                console.log("saveRow.TrackingNumber = " + saveRow.TrackingNumber);

                //if(!saveRow.CompleteDate)
                //	saveRow.CompleteDate = null;
                saveRow.CorrespondenceEvents = undefined;
                console.log("saveRow is next...");
                console.dir(saveRow);

                $scope.saveResults = {};
                //console.log("$scope is next...");
                //console.dir($scope);
                //var promise = SubprojectService.saveSubproject($scope.project.Id, saveRow, $scope.saveResults);
                var promise = SubprojectService.saveCrppSubproject($scope.project.Id, saveRow, $scope.saveResults);
                if (typeof promise !== 'undefined') {
                    promise.$promise.then(function () {
                        //window.location.reload();
                        console.log("promise is next...");
                        console.dir(promise);
                        $scope.subprojectId = $rootScope.subprojectId = promise.Id;
                        console.log("$scope.subprojectId = " + $scope.subprojectId);

                        $scope.subproject_row = 'undefined';
                        $scope.crppProjectName = saveRow.ProjectName;

                        $scope.reloadSubprojects();

                        if (addDocument === "Yes") {
                            console.log("addDocument = Yes...");

                            // If the user wishes to add a Correspondence Event right away, we must wait to get the ID of the new subproject, before we can continue.
                            //$scope.reloadSubproject(promise.Id);
                            //var promise2 = $scope.reloadSubproject(promise.Id);
                            //console.log("Inside reloadSubproject...");
                            SubprojectService.clearSubproject();
                            $scope.reloadSubproject($scope.subprojectId);
                            $modalInstance.dismiss();
                            $scope.openCorrespondenceEventForm();
                            //$scope.subproject = SubprojectService.getSubproject(id);
                        }
                        else {
                            console.log("addDocument != Yes");

                            // If the user just wants to create the Subproject, we can continue without waiting.
                            $scope.reloadSubproject($scope.subprojectId);
                            $modalInstance.dismiss();
                        }
                    });
                }
            }
        };

        $scope.cancel = function () {
            // If the user clicks on Cancel, we need to grab the contents of the Other... boxes and put it back into the main box.

            // Agency Name:  If the user selected Other, we must use the name they supplied in OtherAgency.
            if ($scope.subproject_row.OtherAgency) {
                $scope.subproject_row.Agency = $scope.subproject_row.OtherAgency;
                $scope.subproject_row.OtherAgency = null; // Throw this away, because we do not want to save it; no database field or it.
            }

            // Project Proponent Name:  If the user selected Other, we must use the name they supplied in OtherProjectProponent.
            if ($scope.subproject_row.OtherProjectProponent) {
                $scope.subproject_row.ProjectProponent = $scope.subproject_row.OtherProjectProponent;
                $scope.subproject_row.OtherProjectProponent = null; // Throw this away, because we do not want to save it; no database field or it.
            }

            // County Name:  If the user selected Other, we must use the name they supplied in OtherCounty.
            if ($scope.subproject_row.OtherCounty) {
                $scope.subproject_row.County = $scope.subproject_row.OtherCounty;
                $scope.subproject_row.OtherCounty = null; // Throw this away, because we do not want to save it; no database field or it.
            }
            $scope.subproject_row = 'undefined';
            $scope.reloadSubprojects();
            $modalInstance.dismiss();
        };
        /*
        $scope.gotoBottom = function (){
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('bottom');
        	
            // call $anchorScroll()
            $anchorScroll();
        };
          
        $scope.gotoSubprojectsTop = function (){
            // set the location.hash to the id of
            // the element you wish to scroll to.
            console.log("Inside gotoSubprojectsTop...");
            //$location.hash('top');
            $location.hash('spTop');
        	
            // call $anchorScroll()
            $anchorScroll();
        };
          
        $scope.gotoCategory = function (category) {
            $location.hash(category);
            $anchorScroll();
        };
        */
    }
];
