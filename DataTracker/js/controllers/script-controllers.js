//Data Entry Controller
'use strict';

var mod_script = angular.module('ScriptControllers', ['ui.bootstrap']);

mod_script.controller('ScriptletController', ['$scope','$upload', 'DataService','DatastoreService','ActivityParser',
  function($scope, $upload,  DataService, DatastoreService,ActivityParser){

  		$scope.project = { Id: "2246" }; // default to the DECD project id 
  		$scope.dataset = DataService.getDataset(1193); 
  		$scope.startOnLine = 1;
  		$scope.uploadResults = {};
  		$scope.loading = false;
  		$scope.fields = {};

  		//setup a listener to populate datasetfields
		$scope.$watch('dataset.Fields', function() { 
			if(!$scope.dataset.Fields ) return;
			//load our project based on the projectid we get back from the dataset
        	$scope.project = DataService.getProject($scope.dataset.ProjectId);
			
        	$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

			//iterate the fields of our dataset and populate our grid columns
			angular.forEach($scope.dataset.Fields.sort(orderByIndex), function(field){
				parseField(field, $scope);
				
				if(field.FieldRoleId == FIELD_ROLE_HEADER)
				{
					$scope.fields.header.push(field);
					$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}
				else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
				{
					$scope.fields.detail.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}
				
    		});
		});


		$scope.uploadFile = function()
		{
			console.log("loading file.");	

			$scope.loading=true;
		      $scope.upload = $upload.upload({
		        url: serviceUrl + '/data/UploadImportFile', //upload.php script, node.js route, or servlet url
		        method: "POST",
		        // headers: {'headerKey': 'headerValue'},
		        // withCredential: true,
		        data: {ProjectId: $scope.project.Id, StartOnLine: $scope.startOnLine},
		        file: $scope.file,
		        // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
		        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
		        //fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
		        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
		        //formDataAppender: function(formData, key, val){}
		      }).progress(function(evt) {
		        //Logger.debug('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
		      }).success(function(data) {
		        // file is uploaded successfully
		        console.log("Success!");
		        $scope.uploadResults.Data = angular.fromJson(data);
		        $scope.fileFields = $scope.uploadResults.Data.columns;
		        $scope.loading=false;
		      })
		      .error(function(data)
		      	{
		      		$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
		      		$scope.loading=false;
		      	});
		      //.then(success, error, progress);
		};

		$scope.onFileSelect = function($files) {
			    //$files: an array of files selected, each file has name, size, and type.

			    $scope.files = $files;
			    $scope.file = $files[0];

			 };

		$scope.doDECDUpdate = function()
		{
			console.log("starting update");

			var updatedActivities = [];

			//query.results will be the .. uh results.
			$scope.query = { criteria: {DatasetId: $scope.dataset.Id, Fields: [], Locations: "[\"all\"]", QAStatusId: "all"} } ;

			//fetch current records via query
			DataService.queryActivities($scope.query);

			$scope.$watch('query.results', function(){
				if(!$scope.query.results)
					return;

				console.dir($scope.query.results);

				var datasheet = "";

				console.log("spinning through...");
				angular.forEach($scope.uploadResults.Data.rows, function(incoming){
					//spin through our upload data and match up with existing activity.  Use parcelId

					angular.forEach($scope.query.results, function(existing){

						
						if(existing.Allotment == incoming["Allotment:"] && existing.AppraisalValue != incoming["Value:"])
						{
							//console.log(existing.Allotment);
							//console.log(existing.AppraisalValue + " = " + incoming["Value:"]);

							datasheet += "INSERT INTO Appraisal_Detail (AppraisalYear, AppraisalFiles, AppraisalPhotos, AppraisalComments, AppraisalStatus, RowId, RowStatusId, ActivityId, ByUserId, QAStatusId, EffDt, AppraisalType, AppraisalLogNumber, AppraisalValue, AppraisalValuationDate, Appraiser, TypeOfTransaction, PartiesInvolved, AppraisalProjectType)";
							datasheet += "VALUES ("; 
							if(!existing.AppraisalYear)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalYear + "',";
							
							if(!existing.AppraisalFiles)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalFiles + "',";
							
							if(!existing.AppraisalPhotos)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalPhotos + "',";
							
							if(!existing.AppraisalComments)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalComments + "',";

							datasheet += "'Complete',";
							
							datasheet += existing.RowId + ",";
							datasheet += existing.RowStatusId + ",";
							datasheet += existing.ActivityId + ",";
							datasheet += "1,";
							datasheet += existing.QAStatusId + ",";
							datasheet += "'" + "2014-11-03 2:30 PM" + "',";
							
							if(!existing.AppraisalType)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalType + "',";
							
							if(!existing.AppraisalLogNumber)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalLogNumber + "',";
							
							datasheet += "'" + incoming["Value:"] + "',";
							datasheet += "'" + incoming["Date of Value:"] + "',";
							datasheet += "'" + existing.Appraiser + "',";
							
							if(!existing.TypeOfTransaction)
								datasheet += "null,";
							else
								datasheet += "'" + existing.TypeOfTransaction + "',";
							
							if(!existing.PartiesInvolved)
								datasheet += "null,";
							else
								datasheet += "'" + existing.PartiesInvolved + "',";
							
							datasheet += "'" + incoming["Appraisal Project:"] + "');\n\n";
							


						}
					});
				});	

	            //$scope.activities = ActivityParser.parseActivitySheet(datasheet, $scope.fields);
	            
	            /*
	            if(!$scope.activities.errors)
	            {
	                var promise = DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
	                promise.$promise.then(function(){
	                	$scope.new_activity = $scope.activities.new_records;
	                });
	            }
	            */
	            $scope.activities = datasheet;
	            console.log("done!");

			});
			
		};

		$scope.doDECDFileLinking = function(){

			$scope.query = { criteria: {DatasetId: $scope.dataset.Id, Fields: [], Locations: "[\"all\"]", QAStatusId: "all"} } ;

			//fetch current records via query
			DataService.queryActivities($scope.query);

			$scope.$watch('query.results', function(){
				if(!$scope.query.results)
					return;

				//console.dir($scope.query.results);

				var allotments = {};
				var allotmentstosave = [];
				
				console.log("spinning through and setting up allotment lookup");
				angular.forEach($scope.query.results, function(existing){
					allotments[existing.Allotment] = existing;
					existing.UpdatedTSRFile = [];
					existing.GrazingLeaseFiles = [];
				});

				angular.forEach(cdms_files, function(filename){
					//regex the allotment
					var re = /(^[^\s]+).*$/;
					var allotment = filename.match(re);
					allotment = allotment[1];
					
					//lookup in allotments
					var allotment_obj = allotments[allotment];

					if(!allotment_obj)
					{
						console.log("allotment object doesn't exist. " + allotment);
						console.dir(allotments);
						console.dir(allotment_obj);
					}else{

						allotmentstosave.push(allotment); //note the ones that we will update

						//if contains "TSR" - add to tsr files
						if(filename.indexOf("TSR")>0)
							allotment_obj.UpdatedTSRFile.push(make_link(filename));
						else
							allotment_obj.GrazingLeaseFiles.push(make_link(filename));

					}

					//otherwise - add to grazing files
					//add to allotmentstosave

				});

				//console.dir(tsr_files);
				//console.dir(grazing_files);

				$scope.activities = "";

				angular.forEach(allotmentstosave, function(tosave){
					var tsrfile = angular.toJson(allotments[tosave].UpdatedTSRFile).toString();
					var grazingfile = angular.toJson(allotments[tosave].GrazingLeaseFiles).toString();
					$scope.activities += "UPDATE Appraisal_Header SET UpdatedTSRFile = '" + tsrfile + "', GrazingLeaseFiles = '" + grazingfile + "' WHERE ActivityId = " + allotments[tosave].ActivityId + ";";
				});

		});

	};
			
  }]);
		
function make_link(filename)
{
	var new_filelink = {
		Name: filename,
		Link: "//gis.ctuir.org/DECD/Appraisals/files/" + filename.replace(new RegExp(" ","g"),"%20"),
	};

	return new_filelink;

	//[{"Name":"2097 - TSR.pdf","Link":"http://localhost:31772/services/uploads/2246/2097 - TSR.pdf"}]
}

var cdms_files = ["1000 - GRAZING PERMIT.pdf",
"1000 - TSR.pdf",
"1017 - REVOCABLE CSP PERMIT.pdf",
"1017 - TSR.pdf",
"1018 - REVOCABLE CSP PERMIT.pdf",
"1018 - TSR.pdf",
"1022 - Grazing Permit.pdf",
"1022 - TSR.pdf",
"1025 - GRAZING PERMIT.pdf",
"1025 - TSR.pdf",
"1034 - GRAZING PERMIT.pdf",
"1034 - TSR.pdf",
"1041 - GRAZING PERMIT.pdf",
"1041 - TSR.pdf",
"1043 - REVOCABLE CSP PERMIT.pdf",
"1043 - TSR.pdf",
"1044 - GRAZING PERMIT.pdf",
"1044 - TSR.pdf",
"1046 - CSP PERMIT.pdf",
"1046 - PASTURE LEASE.pdf",
"1046 - TSR.pdf",
"1059 - Grazing Permit.pdf",
"1059 - TSR.pdf",
"1060 - IMAGERY COPY AND QUAD MAP.pdf",
"1060 - TSR FOR IDLE TRACT.pdf",
"1067 - Grazing Permit.pdf",
"1067 - TSR.pdf",
"1087 - Grazing Permit.pdf",
"1087 - TSR.pdf",
"1088 - Grazing Permit.pdf",
"1088 - TSR.pdf",
"1089 - Grazing Permit.pdf",
"1089 - TSR.pdf",
"1091 - GRAZING PERMIT.pdf",
"1091 - TSR.pdf",
"1095 - REVOCABLE CSP PERMIT.pdf",
"1095 - TSR.pdf",
"1096 - REVOCABLE CSP PERMIT.pdf",
"1096 - TSR.pdf",
"1113 - REVOCABLE CSP PERMIT.pdf",
"1113 - TSR.pdf",
"1123 - PASTURE LEASE.pdf",
"1123 - TSR.pdf",
"1130 - Grazing Permit.pdf",
"1130 - TSR.pdf",
"1137 - Grazing Permit.pdf",
"1137 - TSR.pdf",
"1138 - Grazing Permit.pdf",
"1138 - TSR.pdf",
"1139 - REVOCABLE CSP PERMIT.pdf",
"1139 - TSR.pdf",
"1142 - Grazing Permit.pdf",
"1142 - TSR.pdf",
"1178 - REVOCABLE PERMIT.pdf",
"1178 - TSR.pdf",
"1183 - Grazing Permit.pdf",
"1183 - TSR.pdf",
"1184 - Grazing Permit.pdf",
"1184 - TSR.pdf",
"1187 - REVOCABLE PERMIT.pdf",
"1187 - TSR.pdf",
"1188-B - GRAZING PERMIT.pdf",
"1188-B - TSR.pdf",
"1219 - REVOCABLE PERMIT.pdf",
"1219 - TSR.pdf",
"1231 - IMAGERY COPY AND QUAD MAP.pdf",
"1231 - REVOCABLE PERMIT.pdf",
"1231 - TSR FOR IDLE TRACT.pdf",
"1231 - TSR.pdf",
"1232 - REVOCABLE PERMIT.pdf",
"1232 - TSR.pdf",
"1260 - Grazing Permit.pdf",
"1260 - TSR.pdf",
"1261 - GRAZING PERMIT.pdf",
"1261 - TSR.pdf",
"1280 - REVOCABLE PERMIT.pdf",
"1280 - TSR.pdf",
"1282 - GRAZING PERMIT.pdf",
"1282 - TSR.pdf",
"1283 - REVOCABLE PERMIT.pdf",
"1283 - TSR.pdf",
"1285-B - GRAZING PERMIT.pdf",
"1285-B - TSR.pdf",
"1291 - GRAZING PERMIT.pdf",
"1291 - TSR.pdf",
"1309 - GRAZING PERMIT.pdf",
"1309 - TSR.pdf",
"1313 - REVOCABLE PERMIT.pdf",
"1313 - TSR.pdf",
"1315 - REVOCABLE PERMIT.pdf",
"1315 - TSR.pdf",
"1326 - GRAZING PERMIT.pdf",
"1326 - TSR.pdf",
"1345 - GRAZING PERMIT.pdf",
"1345 - TSR.pdf",
"1346 - REVOCABLE PERMIT.pdf",
"1346 - TSR.pdf",
"1348 - REVOCABLE PERMIT.pdf",
"1348 - TSR.pdf",
"1350 - REVOCABLE PERMIT.pdf",
"1350 - TSR.pdf",
"1355 - REVOCABLE PERMIT.pdf",
"1355 - TSR.pdf",
"1367 - CSP Permit.pdf",
"1367 - TSR.pdf",
"1368 - CSP Permit.pdf",
"1368 - TSR.pdf",
"1369 - CSP Permit.pdf",
"1369 - TSR.pdf",
"1373 - CSP Permit.pdf",
"1373 - TSR.pdf",
"1375 - CSP Permit.pdf",
"1375 - TSR.pdf",
"1381 - CSP Permit.pdf",
"1381 - TSR.pdf",
"1385 - CSP Permit.pdf",
"1385 - TSR.pdf",
"1396 - CSP Permit.pdf",
"1396 - TSR.pdf",
"1399 - CSP Permit.pdf",
"1399 - TSR.pdf",
"1412 - CSP Permit.pdf",
"1412 - TSR.pdf",
"1414 - TSR.pdf",
"1417 - CSP Permit.pdf",
"1417 - TSR.pdf",
"1422 - GRAZING PERMIT.pdf",
"1422 - TSR.pdf",
"2001 - IMAGERY COPY MAP.pdf",
"2001 - TSR FOR IDLE TRACT.pdf",
"2006 - FARMING LEASE.pdf",
"2006 - TSR.pdf",
"2017 - TSR FOR IDLE TRACT.pdf",
"2097 - FARMING LEASE.pdf",
"2097 - TSR.pdf",
"505 - CSP PERMIT.pdf",
"505 - GRAZING PERMIT.pdf",
"505 - TSR.pdf",
"510 - GRAZING PERMIT.pdf",
"510 - TSR.pdf",
"514 - GRAZING PERMIT.pdf",
"514 - TSR.pdf",
"533 - GRAZING PERMIT.pdf",
"533 - TSR.pdf",
"534 - Grazing Permit.pdf",
"534 - TSR.pdf",
"535 - GRAZING PERMIT 6.2014.pdf",
"535 - TSR.pdf",
"552 - CSP PERMIT.pdf",
"552 - GRAZING PERMIT.pdf",
"552 - TSR.pdf",
"554 - CSP PERMIT.pdf",
"554 - GRAZING PERMIT.pdf",
"554 - TSR.pdf",
"561-B - REVOCABLE CSP PERMIT.pdf",
"561-B - TSR.pdf",
"564 - GRAZING PERMIT.pdf",
"564 - TSR.pdf",
"570 - GRAZING PERMIT.pdf",
"570 - TSR.pdf",
"573 - GRAZING PERMIT.pdf",
"573 - TSR.pdf",
"575 - CRP LEASE.pdf",
"575 - TSR.pdf",
"577 - REVOCABLE PERMIT.pdf",
"577 - TSR.pdf",
"586-A - GRAZING PERMIT.pdf",
"586-A - TSR.pdf",
"589 - GRAZING PERMIT.pdf",
"589 - TSR.pdf",
"592 - GRAZING PERMIT.pdf",
"592 - TSR.pdf",
"593 - GRAZING PERMIT.pdf",
"593 - TSR.pdf",
"596 - GRAZING PERMIT.pdf",
"596 - TSR.pdf",
"626 - GRAZING PERMIT.pdf",
"626 - TSR.pdf",
"631 - GRAZING PERMIT.pdf",
"631 - TSR.pdf",
"632 - Grazing Permit.pdf",
"632 - TSR.pdf",
"634 - GRAZING PERMIT.pdf",
"634 - TSR.pdf",
"643 - REVOCABLE PERMIT.pdf",
"643 - TSR.pdf",
"657-A - IMAGERY COPY AND QUAD MAP.pdf",
"657-A - MEETS AND BOUNDS SURVEY MAP.pdf",
"657-A - TSR.pdf",
"659 - IMAGERY COPY AND QUAD MAP.pdf",
"659 - TSR.pdf",
"661 - GRAZING PERMIT.pdf",
"661 - TSR.pdf",
"662 - CSP PERMIT.pdf",
"662 - PASTURE LEASE.pdf",
"662 - TSR.pdf",
"675 - PASTURE LEASE.pdf",
"675 - TSR.pdf",
"680 - GRAZING PERMIT.pdf",
"680 - TSR.pdf",
"688 - TSR FOR IDLE TRACT.pdf",
"701 - GRAZING PERMIT.pdf",
"701 - TSR.pdf",
"724 - REVOCABLE PERMIT.pdf",
"724 - TSR.pdf",
"748 - IMAGERY COPY AND QUAD MAP.pdf",
"748 - TSR FOR IDLE TRACT.pdf",
"762 - FARMING LEASE.pdf",
"762 - TSR.pdf",
"765 - GRAZING PERMIT.pdf",
"765 - TSR.pdf",
"768 - CRP CONTRACT.pdf",
"768 - GRAZING PERMIT.pdf",
"768 - TSR.pdf",
"772 - Grazing Permit.pdf",
"772 - TSR.pdf",
"788 - REVOCABLE CSP PERMIT.pdf",
"788 - TSR.pdf",
"810 - GRAZING PERMIT.pdf",
"810 - TSR.pdf",
"817 - REVOCABLE CSP PERMIT.pdf",
"817 - TSR.pdf",
"821 - REVOCABLE CSP PERMIT.pdf",
"821 - TSR.pdf",
"823 - GRAZING PERMIT.pdf",
"823 - TSR.pdf",
"825 - FARMING LEASE.pdf",
"825 - TSR.pdf",
"827 - Grazing Permit.pdf",
"827 - TSR.pdf",
"828 - GRAZING PERMIT.pdf",
"828 - TSR.pdf",
"829 - Grazing Permit.pdf",
"829 - TSR.pdf",
"841 - GRAZING PERMIT.pdf",
"841 - TSR.pdf",
"845 - GRAZING PERMIT.pdf",
"845 - TSR.pdf",
"868 - IMAGERY COPY AND QUAD MAP.pdf",
"868 - TSR FOR IDLE TRACT.pdf",
"871 - CSP PERMIT.pdf",
"871 - GRAZING PERMIT.pdf",
"871 - TSR.pdf",
"883-A - GRAZING PERMIT.pdf",
"883-A - TSR.pdf",
"892 - Grazing Permit.pdf",
"892 - TSR.pdf",
"893 - REVOCABLE CSP PERMIT.pdf",
"893 - TSR.pdf",
"899-B - GRAZING PERMIT.pdf",
"899-B - TSR.pdf",
"901 - GRAZING PERMIT.pdf",
"901 - TSR.pdf",
"907 - GRAZING PERMIT.pdf",
"907 - TSR.pdf",
"908 - CRP CONTRACT.pdf",
"908 - TSR.pdf",
"909 - Grazing Permit.pdf",
"909 - TSR.pdf",
"912 - Grazing Permit.pdf",
"912 - TSR.pdf",
"914 - GRAZING PERMIT.pdf",
"914 - TSR.pdf",
"916 - REVOCABLE CSP PERMIT.pdf",
"916 - TSR.pdf",
"943-A - IMAGERY COPY MAP.pdf",
"943-A - Taken 8.4.14",
"943-A - TSR.pdf",
"978 - Grazing Permit.pdf",
"978 - TSR.pdf",
"984-A - FARMING LEASE.pdf",
"984-A - TSR.pdf",
"985 - GRAZING PERMIT.pdf",
"985 - TSR.pdf",
"988 - Grazing Permit.pdf",
"988 - TSR.pdf",
"C101 - FARMING LEASE.pdf",
"C101 - TSR.pdf",
"C112 - FARMING LEASE.pdf",
"C112 - TSR.pdf",
"C116-A - IMAGERY COPY MAP.pdf",
"C116-A - Taken 8.4.14",
"C116-A - TSR.pdf",
"C134 - GRAZING PERMIT.pdf",
"C134 - TSR.pdf",
"C135 - CRP LEASE.pdf",
"C135 - TSR.pdf",
"C139-A - CRP LEASE.pdf",
"C139-A - TSR.pdf",
"C142-B - FARMING LEASE.pdf",
"C142-B - TSR.pdf",
"C144 - TSR FOR IDLE TRACT.pdf",
"C145 - FARMING LEASE.pdf",
"C145 - TSR.pdf",
"C147-E - FARMING LEASE.pdf",
"C147-E - TSR.pdf",
"C150-A - FARMING LEASE.pdf",
"C150-A - TSR.pdf",
"C150-B - FARMING LEASE.pdf",
"C150-B - TSR.pdf",
"C151-A - TSR FOR IDLE TRACT.pdf",
"C172 - FARMING LEASE.pdf",
"C172 - TSR.pdf",
"C173 - FARMING LEASE.pdf",
"C173 - TSR.pdf",
"C182 - CSP Permit.pdf",
"C182 - TSR.pdf",
"C187 - FARMING LEASE.pdf",
"C187 - TSR.pdf",
"C192-A - FARMING LEASE.pdf",
"C192-A - TSR.pdf",
"C197 - IMAGERY COPY AND QUAD MAP.pdf",
"C197 - TSR FOR IDLE TRACT.pdf",
"C199 - FARMING LEASE.pdf",
"C199 - TSR.pdf",
"C201 - FARMING LEASE.pdf",
"C201 - TSR.pdf",
"C204-C - FARMING LEASE.pdf",
"C204-C - TSR.pdf",
"C207 - FARMING LEASE.pdf",
"C207 - TSR.pdf",
"C208 - CRP LEASE.pdf",
"C210 - CRP LEASE.pdf",
"C210 - TSR.pdf",
"C211 - CRP LEASE.pdf",
"C211 - TSR.pdf",
"C230-E - FARMING LEASE.pdf",
"C230-E - TSR.pdf",
"C238 - CSP Permit.pdf",
"C238 - FARMING LEASE.pdf",
"C238 - TSR.pdf",
"C241 - TSR FOR IDLE TRACT.pdf",
"C242 - TSR FOR IDLE TRACT.pdf",
"C248-B - FARMING LEASE.pdf",
"C248-B - TSR.pdf",
"C256-A - IMAGERY COPY AND QUAD MAP.pdf",
"C256-A - TSR FOR IDLE TRACT.pdf",
"C289 - FARMING LEASE.pdf",
"C289 - TSR.pdf",
"C294 - CSP Permit.pdf",
"C294 - FARMING LEASE.pdf",
"C294 - PASTURE LEASE.pdf",
"C294 - TSR.pdf",
"C297 - FARMING LEASE.pdf",
"C297 - TSR.pdf",
"C305 - FARMING LEASE.pdf",
"C305 - TSR.pdf",
"C306 - FARMING LEASE.pdf",
"C306 - TSR.pdf",
"C308 - FARMING LEASE.pdf",
"C308 - TSR.pdf",
"C322-A - FARMING LEASE.pdf",
"C322-A - TSR.pdf",
"C322-B - FARMIG LEASE.pdf",
"C322-B - TSR.pdf",
"C323 - FARMING LEASE.pdf",
"C323 - TSR.pdf",
"C325 - FARMING LEASE.pdf",
"C325 - TSR.pdf",
"C328 - FARMING LEASE.pdf",
"C328 - TSR.pdf",
"C330 - FARMING LEASE.pdf",
"C330 - TSR.pdf",
"C331 - FARMING LEASE.pdf",
"C331 - TSR.pdf",
"C345-B - FARMING LEASE.pdf",
"C345-B - TSR.pdf",
"C378-C - IMAGERY COPY MAP.pdf",
"C378-C - TSR FOR IDLE TRACT.pdf",
"C379 - FARMING LEASE.pdf",
"C379 - TSR.pdf",
"C392 - CRP LEASE.pdf",
"C392 - TSR.pdf",
"C395 - FARMING LEASE.pdf",
"C395 - TSR.pdf",
"C396-A - IMAGERY COPY AND QUAD MAP.pdf",
"C396-A - TSR FOR IDLE TRACT.pdf",
"C396-C - IMAGERY COPY AND QUAD MAP.pdf",
"C396-C - TSR FOR IDLE TRACT.pdf",
"C405 - CRP LEASE.pdf",
"C405 - TSR.pdf",
"C408-A - CRP CONTRACT.pdf",
"C408-A - TSR.pdf",
"C412 - GRAZING PERMIT.pdf",
"C412 - TSR.pdf",
"C43 - CSP Permit.pdf",
"C43 - TSR.pdf",
"C46-A - FARMING LEASE.pdf",
"C46-A - TSR.pdf",
"C72-A - CRP CONTRACT.pdf",
"C72-A - TSR.pdf",
"C92 - CRP LEASE.pdf",
"C92 - TSR.pdf",
"dir.txt",
"UM100-A - IMAGERY COPY AND QUAD MAP.pdf",
"UM100-A - TSR FOR IDLE TRACT.pdf",
"UM104 - FARMING LEASE.pdf",
"UM104 - TSR.pdf",
"UM112 - FARMING LEASE.pdf",
"UM112 - TSR.pdf",
"UM158-A - IMAGERY COPY AND QUAD MAP.pdf",
"UM158-A - TSR.pdf",
"UM160 - IMAGERY COPY MAP.pdf",
"UM160 - TSR FOR IDLE TRACT.pdf",
"UM165 - CSP PERMIT.pdf",
"UM165 - PASTURE LEASE.pdf",
"UM165 - TSR.pdf",
"UM173 - FARMING LEASE.pdf",
"UM173 - TSR.pdf",
"UM174 - IMAGERY COPY MAP.pdf",
"UM174 - TSR FOR IDLE TRACT.pdf",
"UM18 - PASTURE LEASE.pdf",
"UM18 - TSR.pdf",
"UM212-A - FARMING LEASE.pdf",
"UM212-A - TSR.pdf",
"UM214 - PASTURE LEASE.pdf",
"UM214 - TSR.pdf",
"UM39 - FARMING LEASE.pdf",
"UM39 - TSR.pdf",
"UM4 - FARMING LEASE.pdf",
"UM4 - TSR.pdf",
"UM41 - FARMING LEASE.pdf",
"UM41 - TSR.pdf",
"UM50 - FARMING LEASE.pdf",
"UM50 - TSR.pdf",
"UM51-A - FARMING LEASE.pdf",
"UM51-A - TSR.pdf",
"UM53 - FARMING LEASE.pdf",
"UM53 - TSR.pdf",
"UM60-C - FARMING LEASE.pdf",
"UM60-C - TSR.pdf",
"UM61 - FARMING LEASE.pdf",
"UM61 - TSR.pdf",
"UM62 - FARMING LEASE.pdf",
"UM62 - TSR.pdf",
"UM76 - FARMING LEASE.pdf",
"UM76 - TSR.pdf",
"WW 11 - TSR FOR IDLE TRACT.pdf",
"WW 136 - TSR FOR IDLE TRACT.pdf",
"WW 14 - TSR FOR IDLE TRACT.pdf",
"WW1 - FARMING LEASE.pdf",
"WW1 - TSR.pdf",
"WW111 - FARMING LEASE.pdf",
"WW111 - TSR.pdf",
"WW113 - FARMING LEASE.pdf",
"WW113 - TSR.pdf",
"WW118 - FARMING LEASE.pdf",
"WW118 - TSR.pdf",
"WW120 - CRP LEASE.pdf",
"WW120 - TSR.pdf",
"WW133 - FARMING LEASE.pdf",
"WW133 - TSR.pdf",
"WW140 - PASTURE LEASE exp. 2015.pdf",
"WW140 - TSR.pdf",
"WW142-C - FARMING LEASE.pdf",
"WW142-C - TSR.pdf",
"WW146 - CRP CONTRACT.pdf",
"WW146 - TSR.pdf",
"WW150 - TSR FOR IDLE TRACT.pdf",
"WW160 - IMAGERY COPY MAP.pdf",
"WW160 -TSR FOR IDLE TRACT.pdf",
"WW161 - FARMING LEASE.pdf",
"WW161 - TSR.pdf",
"WW164 - IMAGERY COPY MAP.pdf",
"WW164 - TSR FOR IDLE TRACT.pdf",
"WW165 - FARMING LEASE.pdf",
"WW165 - TSR.pdf",
"WW17 - CRP LEASE.pdf",
"WW17 - TSR.pdf",
"WW177 - FARMING LEASE.pdf",
"WW177 - TSR.pdf",
"WW179 - CRP LEASE.pdf",
"WW179 - TSR.pdf",
"WW180-C - IMAGERY COPY MAP.pdf",
"WW180-C - Taken 8.4.14",
"WW180-C - TSR.pdf",
"WW23-C - CSP PERMIT.pdf",
"WW23-C - GRAZING PERMIT.pdf",
"WW23-C - TSR.pdf",
"WW252 - CSP Permit.pdf",
"WW252 - TSR.pdf",
"WW28 - FARMING LEASE.pdf",
"WW28 - TSR.pdf",
"WW29 - FARMING LEASE.pdf",
"WW29 - TSR.pdf",
"WW3-A - FARMING LEASE.pdf",
"WW3-A - TSR.pdf",
"WW44-C - FARMING LEASE.pdf",
"WW44-C - TSR.pdf",
"WW44-D - FARMING LEASE.pdf",
"WW44-D - TSR.pdf",
"WW458 - PASTURE LEASE.pdf",
"WW458 - TSR.pdf",
"WW461 - CRP LEASE.pdf",
"WW461 - TSR.pdf",
"WW474 - IMAGERY COPY MAP.pdf",
"WW474 - TSR FOR IDLE TRACT.pdf",
"WW479 - CRP LEASE.pdf",
"WW479 - TSR.pdf",
"WW479-B - FARMING LEASE.pdf",
"WW479-B - TSR.pdf",
"WW50 - FARMING LEASE.pdf",
"WW50 - TSR.pdf",
"WW55 - FARMING LEASE.pdf",
"WW55 - TSR.pdf",
"WW56-A - FARMING LEASE.pdf",
"WW56-A - TSR.pdf",
"WW56-C - FARMING LEASE.pdf",
"WW56-C - TSR.pdf",
"WW64 - CRP LEASE.pdf",
"WW64 - TSR.pdf",
"WW65 - FARMING LEASE.pdf",
"WW65 - TSR.pdf",
"WW66 - FARMING LEASE.pdf",
"WW66 - TSR.pdf",
"WW68 - FARMING LEASE.pdf",
"WW68 - TSR.pdf",
"WW70 - CRP LEASE.pdf",
"WW70 - TSR.pdf",
"WW71 - FARMING LEASE.pdf",
"WW71 - TSR.pdf",
"WW72 - CSP PERMIT.pdf",
"WW72 - GRAZING PERMIT.pdf",
"WW72 - TSR.pdf",
"WW73 - PASTURE LEASE.pdf",
"WW73 - TSR.pdf"];
