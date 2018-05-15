/**
*  This is the main "view the activity" page with header and detail grid.
*  e.g.: http://localhost/cdms/index.html#/dataview/89433
*/

var dataset_view = ['$scope', '$routeParams', 'DatasetService', '$modal', '$location', 'DataSheet', '$route', '$rootScope', 'ChartService', 'ProjectService',
    function ($scope, $routeParams, DatasetService, $modal, $location, DataSheet, $route, $rootScope, ChartService, ProjectService) {
        console.log("Inside dataview-controller.js, controller DatasetViewCtrl...");
        console.log("$routeParams.Id = " + $routeParams.Id);
        $scope.grid = DatasetService.getActivityData($routeParams.Id); //activity data for a particular activityId

        $scope.fields = { header: [], detail: [], relation: [] };
        $scope.datasheetColDefs = [];
        $scope.dataSheetDataset = [];
        $scope.gridFields = [];

        //$scope.datasetId = null;

        console.log("Setting $scope.fieldsloaded to false...");
        $scope.fieldsloaded = false;

        $scope.fishermenList = null;

        $scope.$watch('QaSaveResults', function () {
            if ($scope.QaSaveResults && $scope.QaSaveResults.success) {
                $scope.grid = DatasetService.getActivityData($routeParams.Id); //activity data for a particular activityId
            }
        }, true);

        $scope.query = { loading: true };
        $scope.activities = $rootScope.GridActivities; //pull this in from the previous page, if they were set.  Used for navigating between activities.

        $scope.gridDatasheetOptions = {
            data: 'dataSheetDataset',
            columnDefs: 'datasheetColDefs',
            enableColumnResize: true,
            enableSorting: true,
            enableCellSelection: true,
            showFilter: true,
            showColumnMenu: true,
            enableRowSelection: true,
            multiSelect: false,
            //showFooter: true,
            //footerTemplate: '<div class="grid-footer-totals"><div class="colt0 sumField"></div><div class="colt1 sumField"></div><div class="colt2 sumField"></div><div class="colt3 sumField"></div><div class="colt4 sumField"></div><div class="colt5 sumField">s: 1433<br/>a: 477.67</div><div class="colt6 sumField"></div></div>',

        };

        DataSheet.initScope($scope);

        var fishermenWatcher =
            $scope.$watch('fishermenList.length', function () {
                //console.log("Inside fishermenList watch...");
                if ((typeof $scope.fishermenList !== 'undefined') && ($scope.fishermenList !== null)) {
                    console.log("Inside fishermenList watch...");
                    console.log("$scope.fishermenList.length = " + $scope.fishermenList.length)

                    if ($scope.fishermenList.length > 0) {
                        $scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects($scope.fishermenList, 'Id', 'FullName');
                        console.log("$scope.fishermenOptions is next...");
                        console.dir($scope.fishermenOptions);
                    }
                }

            });

        $scope.$watch('dataset.ProjectId', function () {
            if ($scope.dataset && $scope.dataset.ProjectId) {
                console.log("Inside watch dataset.ProjectId...");
                console.log("ProjectId = " + $scope.dataset.ProjectId);
                $rootScope.projectId = $scope.dataset.ProjectId;

                $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
                $scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id', 'Name');

                ChartService.buildChart($scope, $scope.grid.Details, $scope.dataset.Datastore.TablePrefix);

                // If the dataset WaterTemp, show the RowQAStatus field.
                if ($scope.DatastoreTablePrefix === "WaterTemp") {
                    if ($scope.dataset.RowQAStatuses.length > 1) {
                        $scope.datasheetColDefs.unshift( // Add the item to the beginning of the array.
                            {
                                field: "QAStatusId", //QARowStatus
                                displayName: "QA",
                                cellFilter: 'RowQAStatusFilter'
                            });
                    }
                }

                // If we are on the Creel Survey dataset, we need to take the total number of minutes,
                // and put it into HH:MM format, before putting the entry on the form.
                if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                    var detailsLength = $scope.dataSheetDataset.length;
                    var NumMinutes = -1;
                    var theHours = -1;
                    var theMinutes = -1;

                    var strHours = "";
                    var strMinutes = "";
                    for (var i = 0; i < detailsLength; i++) {
                        NumMinutes = parseInt($scope.dataSheetDataset[i].TotalTimeFished);
                        //console.log("NumMinutes = " + NumMinutes);
                        theHours = parseInt(NumMinutes / 60, 10);
                        //console.log("theHours = " + theHours);
                        theMinutes = NumMinutes - (theHours * 60);
                        //console.log("theMinutes = " + theMinutes);

                        if (theHours < 10)
                            strHours = "0" + theHours;
                        else
                            strHours = "" + theHours;

                        if (theMinutes < 10)
                            strMinutes = "0" + theMinutes;
                        else
                            strMinutes = "" + theMinutes;

                        $scope.dataSheetDataset[i].TotalTimeFished = strHours + ":" + strMinutes;
                        //console.log("TotalTimeFished is now = " + $scope.dataSheetDataset[i].TotalTimeFished);

                        NumMinutes = -1;
                        theHours = -1;
                        theMinutes = -1;
                        strHours = "";
                        strMinutes = "";
                    }
                }
                else if ($scope.DatastoreTablePrefix === "AdultWeir") {
                    var strTime = "";
                    var tmpTime = "";
                    var intTimeLoc = -1;
                    angular.forEach($scope.dataSheetDataset, function (item) {
                        //tmpTime = item.PassageTime;
                        console.log("item is next...");
                        console.dir(item);
                        if ((typeof item.PassageTime !== 'undefined') && (item.PassageTime !== null)) {
                            intTimeLoc = item.PassageTime.indexOf("T");
                            strTime = item.PassageTime.substr(intTimeLoc + 1, 5);
                            item.PassageTime = strTime;
                        }
                        //else
                        //    console.log("item.PassageTime is null or blank...");
                    });
                }
				
            }
            console.log("$scope at end of watch dataset.ProjectId is next...");
            //console.dir($scope);
        });
		
		$scope.$watch('projectLeadList.length', function(){
			
			if ((typeof $scope.projectLeadList !== 'undefined') && ($scope.projectLeadList !== null))
			{
				if ($scope.projectLeadList.length > 0)
				{
					$scope.projectLeadOptions = $rootScope.projectLeadOptions = makeObjects($scope.projectLeadList, 'Id','FullName');
					console.log("$scope.projectLeadOptions is next...");
					console.dir($scope.projectLeadOptions);

					console.log("We're on CrppContracts...");
					console.log("$scope.grid.Header is next...");
					console.dir($scope.grid.Header);
					if ($scope.grid.Header.ProjectLead)
					{
						
						var pLeadList = $scope.grid.Header.ProjectLead.split(";");
						console.log("pLeadList is next...");
						console.dir(pLeadList);
						
						// Next, get rid of that trailing semicolon.
						pLeadList.splice(-1, 1);
						console.log("pLeadList is next...");
						console.dir(pLeadList);
						
						var strProjectLead = "";
						
						// Locate the ProjectLead Id and get the Fullname
						angular.forEach($scope.projectLeadList, function(staffMember){
							
							angular.forEach(pLeadList, function(pLead){
								//console.log("pLead = " + pLead + ", staffMember = " + staffMember.Id);
								if (parseInt(pLead) === parseInt(staffMember.Id))
								{
									//console.log("Matched...");
									strProjectLead += staffMember.Fullname + ";\n";
									$scope.showProjectLeads = true;
								}
							});
						});
						$scope.grid.Header.strProjectLead = strProjectLead;
						$scope.grid.Header.ProjectLead = undefined;
					}						
				}
			}
		});

        //setup a listener to populate column headers on the grid
        $scope.$watch('grid.Dataset', function () {
            if (!$scope.grid.Dataset) return; //not done cooking yet.

            console.log("Inside watch grid.Dataset...");
            console.log("$scope.grid is next...");
            console.dir($scope.grid);

            $scope.dataset = $scope.grid.Dataset;//DatasetService.getDataset($scope.grid.Dataset.Id);
            console.log("Dataset ID = " + $scope.grid.Dataset.Id);
            $rootScope.datasetId = $scope.datasetId = $scope.grid.Dataset.Id
            console.log("$rootScope.datasetId = " + $rootScope.datasetId);

            $rootScope.DatastoreTablePrefix = $scope.DatastoreTablePrefix = $scope.grid.Dataset.Datastore.TablePrefix;
            console.log("$scope.DatastoreTablePrefix = " + $scope.DatastoreTablePrefix);
            $scope.datasheetColDefs = DataSheet.getColDefs($scope.DatastoreTablePrefix, "form");  // Pass the TablePrefix (name of the dataset), because it will never change.									

            DatasetService.configureDataset($scope.dataset);

            if ($scope.DatastoreTablePrefix === "CreelSurvey") {
                $scope.fishermenList = ProjectService.getFishermen();

                console.log("Extracting times from strings...");
                var strTimeStart = $scope.grid.Header.TimeStart;
                var strTimeEnd = $scope.grid.Header.TimeEnd;
                var intTLoc = strTimeStart.indexOf("T");
                // Start just past the "T" in the string, and get the time portion (the next 5 characters).
                strTimeStart = strTimeStart.substr(intTLoc + 1, 5);
                $scope.grid.Header.TimeStart = strTimeStart;

                strTimeEnd = strTimeEnd.substr(intTLoc + 1, 5);
                $scope.grid.Header.TimeEnd = strTimeEnd;

                for (var i = 0; i < $scope.grid.Details.length; i++) {
                    console.log("$scope.grid.Details[i] is next...");
                    console.dir($scope.grid.Details[i]);
                    var strInterviewTime = $scope.grid.Details[i].InterviewTime;
                    console.log("strInterviewTime = " + strInterviewTime);
                    intTLoc = strInterviewTime.indexOf("T");
                    console.log("intLoc = " + intTLoc);
                    strInterviewTime = strInterviewTime.substr(intTLoc + 1, 5);
                    console.log("strInterviewTime = " + strInterviewTime);
                    $scope.grid.Details[i].InterviewTime = strInterviewTime
                }
            }
			else if ($scope.DatastoreTablePrefix === "CrppContracts")
			{
				$scope.projectLeadList = ProjectService.getCrppStaff(); // Get all CRPP staff.
			}

            console.log("$scope.fieldsloaded = " + $scope.fieldsloaded);
            $scope.fields.header = [];
            if (!$scope.fieldsloaded) {
                angular.forEach($scope.grid.Dataset.Fields.sort(orderByIndex), function (field) {

                    parseField(field, $scope);

                    if (field.FieldRoleId == FIELD_ROLE_HEADER) {
                        //$scope.fields.header.push(field); //Original line.
						console.log("field.DbColumnName = " + field.DbColumnName);
						if (($scope.DatastoreTablePrefix === "CrppContracts") && (field.DbColumnName === "ProjectLead"))
						{
							// Skip it.
							console.log("Found ProjectLead...");
						}
						else
							$scope.fields.header.push(field);
                    }
                    else if (field.FieldRoleId == FIELD_ROLE_DETAIL) {
                        $scope.fields.detail.push(field);
                        $scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
                    }

                    //keep a list of grid fields (relations) for later loading
                    if (field.ControlType == "grid")
                        $scope.gridFields.push(field);
                });
                console.log("Setting $scope.fieldsloaded to true...");
                $scope.fieldsloaded = true;

                $scope.dataSheetDataset = $scope.grid.Details;
                $scope.recalculateGridWidth($scope.datasheetColDefs.length);
            }
            $scope.query.loading = false;

            $scope.RowQAStatuses = $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

            $scope.grid.Header.Activity.Timezone = angular.fromJson($scope.grid.Header.Activity.Timezone);


        });


        $scope.$watch('dataSheetDataset', function () {
            if (!$scope.dataSheetDataset)
                return;

            console.log("Inside watch dataSheetDataset...");
            console.log("$scope.dataSheetDataset is next...");
            console.dir($scope.dataSheetDataset);
            console.log("$scope.gridFields is next...");
            console.dir($scope.gridFields);
            console.log("*****")

            //kick off the loading of relation data (we do this for UI performance rather than returning with the data...)
            angular.forEach($scope.dataSheetDataset, function (datarow) {
                angular.forEach($scope.gridFields, function (gridfield) {
                    datarow[gridfield.DbColumnName] = DatasetService.getRelationData(gridfield.FieldId, datarow.ActivityId, datarow.RowId);
                    console.log("kicking off loading of " + datarow.ActivityId + ' ' + datarow.RowId);
                })
            })

        });

        $scope.reloadProject = function () {
            //reload project instruments -- this will reload the instruments, too
            console.log("Inside reloadProject... we will fetch ProjectId: " + $scope.dataset.ProjectId);
            ProjectService.clearProject();
            $scope.fieldsloaded = false; //triggers reload of grid and form after project reloads
            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);
            var watcher = $scope.$watch('project.Id', function () {
                //$scope.selectInstrument();
                console.log("We're back with: " + $scope.project.Id);
                $rootScope.projectId = $scope.project.Id;
                watcher();
            });

        };

        $scope.getDataGrade = function (check) { return getDataGrade(check) }; //alias from service

        $scope.changeQa = function () {
            $scope.QaSaveResults = {};
            $scope.row = { ActivityQAStatus: {} }; //modal selections

            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-view/templates/changeqa-modal.html',
                controller: 'ModalQaUpdateCtrl',
                scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
                //resolve: { files: function() { return $scope.files; } }
            });
        };

        $scope.openEdit = function () {
            $location.path("/edit/" + $scope.grid.Header.ActivityId);
        }

        $scope.openExportView = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-exportfile.html',
                controller: 'ModalDataEntryCtrl',
                scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
                //resolve: { files: function() { return $scope.files; } }
            });
        }


        //copy and paste alert -- this should be in a common thing!
        $scope.openDataEntryModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-view/templates/dataentry-modal.html',
                controller: 'ModalDataEntryCtrl',
                scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
                //resolve: { files: function() { return $scope.files; } }
            });
        };

        $scope.openRelationGridModal = function (row, field) {
            $scope.relationgrid_row = row;
            $scope.relationgrid_field = field;
            $scope.isEditable = false;

            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-relationgrid/templates/relationgrid-modal.html',
                controller: 'RelationGridModalCtrl',
                scope: $scope,
            });

        };

        $scope.viewRelation = function (row, field_name) {
            //console.dir(row.entity);
            var field = $scope.FieldLookup[field_name];
            //console.dir(field);

            $scope.openRelationGridModal(row.entity, field);
        }

        //defined in services
        $scope.previousActivity = function () {
            previousActivity($scope.activities, $routeParams.Id, $location);
        }

        $scope.nextActivity = function () {
            nextActivity($scope.activities, $routeParams.Id, $location);
        }

        $scope.fromJson = function (field) {
            return angular.fromJson($scope.grid.Header[field]);
        }


    }];

