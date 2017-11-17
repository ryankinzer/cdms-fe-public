

var project_detail = ['$scope', '$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		console.log("Inside controllers.js, projectDatasetsController...");
		console.log("routeParams.Id = " + routeParams.Id);
		
		scope.activities = null;
		
		scope.datasets = ProjectService.getProjectDatasets(routeParams.Id);
		scope.project = ProjectService.getProject(routeParams.Id);
		scope.currentUserId = $rootScope.Profile.Id;
		scope.filteredUsers = false;
		scope.allInstruments = ProjectService.getAllInstruments();
	
		scope.fishermanList = null;
		//scope.fishermenList = ProjectService.getFishermen();
		scope.subprojectList = null;  // Set this to null first, so that we can monitor it later.
		//scope.subprojectList = SubprojectService.getSubprojects();
		scope.uploadFileType = "";
		scope.projectName = "";
		scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = "";
		scope.filesToUpload = {};
		scope.AuthorizedToViewProject = true;

		scope.subprojectType = "";
		scope.ShowInstruments = false;
		scope.ShowFishermen = false;
		scope.ShowSubproject = false;
		scope.ShowHabitat = false;
		scope.viewSubproject = null;
		scope.SdeObjectId = 0;
		scope.FileLocationSubprojectFundersWatchVariable = "";

        //angular.rootScope.scope = scope; //our render templates need to use this to get the scope.

        //return an array from the eventfiles.
        function getEventFilesArray(EventFiles) {
            if (EventFiles === undefined || EventFiles === null)
                return [];

            var files = angular.fromJson(EventFiles);
            return (files === null || !Array.isArray(files)) ? [] : files; //if it isn't an array, make an empty array

        }

        //this is for the crpp/subproject correspondence tab below - might can move this all out sometime...
        var otherAgencyTemplate = function (params) {
            return '<span>' + params.node.data.Agency + '</span>'
                + ((params.node.data.OtherAgency) ? ('<span> (' + params.node.data.OtherAgency + ')</span>') : ''); //ternery: if otheragency then show it
        };

        var EventCount = function (params) {
            if (params.node.data.CorrespondenceEvents === undefined || params.node.data.CorrespondenceEvents === null)
                return '0';

            return ''+ params.node.data.CorrespondenceEvents.length;
        };

        var EditMasterLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.editViewSubproject(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeViewSubproject(param.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode("|"));

            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openCorrespondenceEventForm(param.data, {});
            });
            div.appendChild(addBtn);

            return div;
            /* can't do angular stuff in here unless we enable it as an angular grid... let's see if we can do without...
            return '<div project-role="editor">' +
                        '<a ng-click="editViewSubproject();">Edit</a>|' +
                        '<a ng-click="removeViewSubproject();">Delete</div>|' + 
                        '<a ng-click="openCorrespondenceEventForm();">Add</div>' +
                '</div>';
                */
        };


        var FileListCellTemplate = function (params) {
            var files = getEventFilesArray(params.node.data.EventFiles);
            var list = '<div class="event-file-list"><ul>';

            files.forEach(function (file) {
                list += '<li>' + file.Name + '</li>';
            });

            list += '</ul></div>';

            return list;
        };


        //this template gives the Edit|Delete|Add for the detail.
        var EditDetailLinksTemplate = function (detailparam) {
            var subproject = scope.getSubprojectById(detailparam.data.SubprojectId);

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                console.log("detail param: ");
                console.dir(detailparam);
                scope.openCorrespondenceEventForm(subproject, detailparam.data); //parent subproject, detail line.
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeCrppCorrespondenceEvent(subproject, detailparam.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode("|"));

            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openCorrespondenceEventForm(subproject, {});
            });
            div.appendChild(addBtn);

            return div;
            /* can't do angular stuff in here unless we enable it as an angular grid... let's see if we can do without...
            return '<div project-role="editor">' +
                        '<a ng-click="editViewSubproject();">Edit</a>|' +
                        '<a ng-click="removeViewSubproject();">Delete</div>|' + 
                        '<a ng-click="openCorrespondenceEventForm();">Add</div>' +
                '</div>';
                */
        };


        //grid columns for crpp correspondence tab (master/subprojects)
        scope.agColumnDefs = [  //in order the columns will display, by the way...
            {
                headerName: '', width: 100, cellRenderer: EditMasterLinksTemplate
            },
            {
                headerName: 'ID',
                field: 'Id',
                width: 80,
                cellRenderer: 'group',
                cellRendererParams: { suppressCount: true }
            },
            {
                field: 'EffDt',
                headerName: 'Updated',
                width: 150,
                valueFormatter: function (params) {
                    if (params.node.data.EffDt !== undefined && params.node.data.EffDt !== null)
                        return moment(params.node.data.EffDt).format('L');
                },
                sort: 'desc',
            },
            {
                headerName: 'Events', width: 80,
                cellRenderer: EventCount,
                valueGetter: function (params) {
                    return (params.data.CorrespondenceEvents !== undefined && params.data.CorrespondenceEvents.length > 0) ? params.data.CorrespondenceEvents.length : 0;
                },
            },
            { field: 'ProjectName', headerName: 'Name', width: 275 },
            { field: 'ProjectLead', headerName: 'Project Lead', width: 150 },
            { field: 'Closed', headerName: 'Closed?', width: 80 },
            {
                field: 'Comments', headerName: 'Comments', width: 300, cellStyle: {
                    'white-space': 'normal'
                }
            },
            { field: 'Agency', headerName: 'Agency', cellRenderer: otherAgencyTemplate, width: 150 },
            { field: 'County', headerName: 'County', width: 150 },
            { field: 'ProjectProponent', headerName: 'Project Proponent', width: 150 },
            

        ];

        //details for the correspondence
        var detailColumnDefs = [
            {
                headerName: '', width: 100, cellRenderer: EditDetailLinksTemplate
            },
            {
                headerName: 'Notice Date', field: 'CorrespondenceDate', width: 120, cellClass: 'event-record-cell',
                valueFormatter: function (params) {
                    if (params.node.data.CorrespondenceDate !== undefined && params.data.CorrespondenceDate !== null)
                        return moment(params.node.data.CorrespondenceDate).format('L');
                },
                sort: 'desc'
            },
            { headerName: 'Notice Type', field: 'CorrespondenceType', cellClass: 'event-record-cell', width: 150 },
            { headerName: 'Type of Response', field: 'ResponseType', cellClass: 'event-record-cell', width: 150 },
            { headerName: 'Days to Respond', field: 'NumberOfDays', cellClass: 'event-record-cell', width: 100 },

            {
                field: 'ResponseDate',
                headerName: 'Date of Response',
                width: 120,
                valueFormatter: function (params) {
                    if (params.data.ResponseDate !== undefined && params.data.ResponseDate !== null)
                        return moment(params.node.data.ResponseDate).format('L');
                }
            },
            { headerName: 'Technician', field: 'StaffMember', cellClass: 'event-record-cell', width: 150 },
            {
                headerName: 'Comments', field: 'EventComments', cellClass: 'event-record-cell', width: 300, cellStyle: {
                    'white-space': 'normal'
                }
            },
            { headerName: 'Documents', field: 'EventFiles', width: 300, cellRenderer: FileListCellTemplate },

            //{ headerName: 'EventFiles', field: 'EventFiles', cellClass: 'event-record-cell', cellRenderer: FileListCellTemplate },
        ];

        //detail grid options correspondence events
        scope.detailGridOptions = {
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            //rowSelection: 'single',
            //onSelectionChanged: function (params) {
            //    console.log("selection changed!");
            //scope.agGridOptions.selectedItems = scope.agGridOptions.api.getSelectedRows();
            //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            //},
            //onFilterModified: function () {
            //    scope.agGridOptions.api.deselectAll();
            //},
            //selectedItems: [],
            //rowData: eventRecords,
            columnDefs: detailColumnDefs,
            onGridReady: function (params) {
                //setTimeout(function () { params.api.sizeColumnsToFit(); }, 0);
            },
            getRowHeight: function (params) {
                var comment_length = (params.data.EventComments === null) ? 1 : params.data.EventComments.length;
                var comment_height = 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
                var file_height = 25 * (getEventFilesArray(params.data.EventFiles).length); //count up the number of file lines we will have.
                return (comment_height > file_height) ? comment_height : file_height;
            },
            //onRowClicked: function (row) {
            //console.dir(row);

            //    row.node.setSelected(true);
            //    console.log("detail selected!");
            //},
            //defaultColDef: {
            //    editable: true
            //},
            //enableRangeSelection: true
        };

        
        
        scope.agGridOptions = {

            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: scope.detailGridOptions,
                getDetailRowData: function (params) {
                    params.successCallback(params.data.CorrespondenceEvents);
                },
            },

            animateRows: true,
            enableSorting: true,
            enableFilter: false, //turning it off because: https://github.com/ag-grid/ag-grid/issues/1324
            enableColResize: true,
            showToolPanel: false,
            columnDefs: scope.agColumnDefs,
            rowData: null,
            //filterParams: { apply: true }, //enable option: doesn't do the filter unless you click apply
            //debug: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed fired!");
                /*
                var rows = scope.agGridOptions.api.getSelectedRows();
                if (Array.isArray(rows) && rows[0] != null)
                {
                    console.log("rows:");
                    console.dir(rows);
                    if (!Array.isArray(rows[0]) && !rows[0].hasOwnProperty('SubprojectId')) //only change the selection if they clicked a header row.
                    {
                        scope.agGridOptions.selectedItems = scope.agGridOptions.api.getSelectedRows();
                        //scope.agGridOptions.api.redrawRows();
                        //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                        console.log("selected a header row so selection actually changed");
                        scope.viewSubproject = rows[0];
                        console.dir(scope.viewSubproject);
                    }
                }
                */
            },
            //onFilterModified: function () {
            //    scope.agGridOptions.api.deselectAll();
            //},
            selectedItems: [],
            //isFullWidthCell: function (rowNode) {
            //    return rowNode.level === 1;
            //},
            onGridReady: function (params) {
                //params.api.sizeColumnsToFit();
            },
            //fullWidthCellRenderer: CorrespondenceDetailCellRenderer,
            getRowHeight: function (params) {
                var rowIsDetailRow = params.node.level === 1;
                // return dynamic height when detail row, otherwise return 25
                if (rowIsDetailRow) {
                    return 300;
                } else {
                    var comment_length = (params.data.Comments === null) ? 1 : params.data.Comments.length;
                    return 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
                }
                //return rowIsDetailRow ? 200 : 25;
            },
            /*
            getNodeChildDetails: function (record) {
                //console.dir(record);
                if (record.CorrespondenceEvents) {
                    //console.log("yep we have events!");
                    return {
                        group: true,
                        // the key is used by the default group cellRenderer
                        key: record.CorrespondenceDate,
                        // provide ag-Grid with the children of this group
                        parentData: record,
                        children: [record.CorrespondenceEvents],
                    };
                } else {
                    //console.log("didn't find any correspondence events for that record.");
                    return null;
                }
            },*/
            onRowDoubleClicked: function (row) {
                scope.agGridOptions.api.collapseAll();
                row.node.setSelected(true);
                row.node.setExpanded(true);
            },
            onRowClicked: function (row) {
                row.node.setSelected(true);
            },
        };

       
		// Get the project ID from the url.
		var theUrl = window.location.href;
		console.log("theUrl = " + theUrl);
		var theLastSlashLoc = theUrl.lastIndexOf("/");
		scope.projectId = theUrl.substring(theLastSlashLoc + 1);
		console.log("scope.projectId = " + scope.projectId);
		
		// On the CorrespondenceEvents html page, the app was getting confused with serviceUrl somehow (only gave the domain name...).
		// When I manually set here like this, and use theServiceUrl instead, the links worked properly.
		console.log("serviceUrl = " + serviceUrl);
		scope.theServiceUrl = serviceUrl;
		
		// Get the fishermen associated to the project.
		//scope.theFishermen = ProjectService.getProjectFishermen(scope.projectId);
		scope.theFishermen = null;
	
		scope.CellOptions = {}; //for metadata dropdown options
		scope.isFavorite = $rootScope.Profile.isProjectFavorite(routeParams.Id);

		scope.metadataList = {};
		scope.metadataPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID);
		scope.habitatPropertiesPromise = CommonService.getMetadataProperties(METADATA_ENTITY_HABITATTYPEID);

		var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
            				   '<a href="#/{{row.getProperty(\'activitiesRoute\')}}/{{row.getProperty(\'Id\')}}">{{row.getProperty("Name")}}</a>' +
            				   '</div>';

		var activityTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
								   'PLACEHOLDER' +
								   '</div>';

		scope.gridOptions = {
            	data: 'datasets',
            	columnDefs:
            		[
            			{field:'Name', displayName:'Dataset Name', cellTemplate: linkTemplate},
            			{field:'Description',displayName: 'Description'},
            			//{field:'CreateDate',displayName: 'Last Activity', cellTemplate: activityTemplate}
            		]
            };

        var fileLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img src="assets/images/file_image.png" width="100px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';

        var uploadedBy = '<div class="ngCellText" ng-class="col.colIndex()">' +
                               '{{row.getProperty("UploadDate")|date}} by {{row.getProperty("User.Fullname")}}' +
                               '</div>';

        scope.fileSelection = [];
        scope.FileFilterOptions = {};
        scope.gridFiles = {
            data: 'project.Docs',
            columnDefs:
            [
                {field:'Name',displayName: 'File Name', cellTemplate: fileLinkTemplate, width: "18%"},
                {field: 'Title'},
                {field: 'Description'},
                {field: 'Uploaded', displayName: "Uploaded", cellTemplate: uploadedBy, width: "15%"},
                //{field: 'Size'},
            ],
            filterOptions: scope.FileFilterOptions,
            multiSelect: false,
            selectedItems: scope.fileSelection
        };

        scope.users = [];
		scope.thisProjectsLocationObjects = [];

        var galleryLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';
        scope.galleryFileSelection = [];
        scope.GalleryFilterOptions = {};
        scope.gridGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File', cellTemplate: galleryLinkTemplate, width: "18%"},
                {field: 'Title'},
                {field: 'Description'},
                {field: 'Uploaded', displayName: "Uploaded", cellTemplate: uploadedBy, width: "15%"},
                //{field: 'Size'},
            ],
            filterOptions: scope.GalleryFilterOptions,
            multiSelect: false,
            selectedItems: scope.galleryFileSelection

        };
			
		scope.$watch('fishermenList', function(){
			console.log("Inside watch, fishermenList");
			//if (typeof scope.fishermenList.$resolved === 'undefined')
			if (!scope.fishermenList)
			{
				console.log("scope.fishermenList has not loaded.");
				return;
			}
			else if (scope.fishermenList.length === 0)
			{
				console.log("No fishermen found yet...");
				return;
			}
			
			console.log("scope.fishermenList is next..");
			console.dir(scope.fishermenList);		
		
			// If we switch the parameters for the makeObjects, like this makeObjects(scope.fishermenList, 'FullName', 'Id'), it will put them in alpha order by name.
			// However, we must test this first, to verify that it does not mess anything up. ~GC tested the idea; it needed more work.  It does not work in it simplicity here.
			scope.fishermenOptions = $rootScope.fishermenOptions = makeObjects(scope.fishermenList, 'Id','FullName');
			
			// Debug output ... wanted to verify the contents of scope.fishermenOptions
			angular.forEach(scope.fishermenOptions, function(fisherman){
				console.dir(fisherman);
			});
			
			console.log("scope.fishermenOptions is next...");
			console.dir(scope.fishermenOptions);
		});	
		
        scope.$watch('datasets', function(){
			//console.log("scope.datasets in datasets watch is next...");
            ////console.dir(scope);

            if(!scope.datasets.$resolved)
              return;
			
			console.log("Inside watch datasets...");
            console.log("OK.  The datasets are loaded...");

            //load ag-grid but only once.
            if (typeof scope.ag_grid === 'undefined') {
                var ag_grid_div = document.querySelector('#crpp-correspondence-grid');    //get the container id...
                scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.agGridOptions); //bind the grid to it.
                scope.agGridOptions.api.showLoadingOverlay(); //show loading...
            }


            //need to bump this since we are looking at a LIST of datasets...
            //angular.forEach(scope.datasets, function(dataset){
			//});
			if ((scope.datasets) && (scope.datasets.length > 0))
			{
				// Notes are in order...
				// controllers.js works mostly at the Project-level.  One project can have mulitiple key datasets (Habitat, WaterTemp, etc.).
				// The only things that would be uploading/editing/deleting from this level, though, would be project-level, or subproject-level (Habitat or CRPP).
				// Project-level documents/images do not require scope.DatastoreTablePrefix; only subproject-level do.
				// Therefore, we only need to check the datasets for those (Habitat or CRPP), and it would be one or the other, but never both.
				// If the user picks a WaterTemp dataset, under a Habitat project, the dataset-level controllers will set the DatastoreTablePrefix accordingly.
				//scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[0].Datastore.TablePrefix;
				//console.log("scope.DatastoreTablePrefix (in datasets watcher) = " + scope.DatastoreTablePrefix);
				
				for (var i = 0; i < scope.datasets.length; i++)
				{
					//DatasetService.configureDataset(dataset);
					//DatasetService.configureDataset(dataset, scope);  // We must pass the scope along on this call.
					DatasetService.configureDataset(scope.datasets[i], scope);  // We must pass the scope along on this call.
					console.log("Found dataset for..." + scope.datasets[i].Datastore.TablePrefix);
					
					if (scope.datasets[i].Datastore.TablePrefix === "WaterTemp")
					{
						console.log("Adding instruments to tab bar...");
						scope.ShowInstruments = true;
						// scope.project.Instruments gets pulled in automatically with the project.
					}
					else if (scope.datasets[i].Datastore.TablePrefix === "CreelSurvey")
					{
						console.log("Adding Fishermen to tab bar...");
						scope.ShowFishermen = true;
						// Note:  Fishermen follows the logic/flow of instruments.
						// Example:  There are more instruments than what are assigned to just one project.
						// Therefore, we allowed that more fishermen could exist, besides what is in only the Harvest project -- just following the logic.
						scope.fishermenList = ProjectService.getFishermen(); // All fishermen, but only CreelSurvey has fishermen.//
						scope.theFishermen = ProjectService.getProjectFishermen(scope.datasets[i].ProjectId);
						// Note:  If we are on Harvest, it has only one dataset.
						scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;
					}
					else if (scope.datasets[i].Datastore.TablePrefix === "CrppContracts")
					{
						console.log("Adding Correspondence to tab bar...");
						scope.ShowSubproject = true;
						scope.subprojectList = SubprojectService.getSubprojects();
						console.log("Fetching CRPP subproject...");
						// Note:  If we are on CRPP, it has only one dataset.
						// We must set the scope.DatastoreTablePrefix, in order for the Edit Subproject to work.
						// The Correspondence Event also needs scope.DatastoreTablePrefix, in order to save documents properly.
                        scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;

                        //since there is a watch defined below for habitat subprojects and we need our own for crpp:
                        // TODO: but in the future we'd like to break all of this up somehow into:
                        //  - an all-standard-datasets
                        //  - crpp
                        //  - habitat
                        //  so as to not have special flags and difficult to maintain if/else/else, etc.
                        var watcher = scope.$watch('subprojectList.length', function () {
                            if (scope.subprojectList === undefined || scope.subprojectList == null || scope.subprojectList.length === 0)
                                return;

                            console.log("our crpp subproject list is back -- build the grid. we have " + scope.subprojectList.length + " of them.");
                            scope.agGridOptions.api.setRowData(scope.subprojectList);

                            watcher();
                        });

					}
					//else if (scope.datasets[i].Datastore.TablePrefix === "Metrics")
					else if ((scope.datasets[i].Datastore.TablePrefix === "Metrics") || 
						(scope.datasets[i].Datastore.TablePrefix === "Benthic") ||
						(scope.datasets[i].Datastore.TablePrefix === "Drift")
						)
					{
						console.log("Adding Sites to tab bar...");
						scope.ShowHabitat = true;
						//scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;
						
						// We call the functions that will build the list of funders, and list of files related to the project.
						// We add the items from these lists to the project later, after we have the data.
						scope.subprojectFileList = null;
                        scope.subprojectFileList = SubprojectService.getSubprojectFiles(scope.datasets[i].ProjectId);
                        //KB - call reloadproject if we need to (it doesn't happen in the service anymore)
						scope.funderList = null;
						scope.funderList = ProjectService.getProjectFunders(scope.datasets[i].ProjectId);
						scope.collaboratorList = null;
						scope.collaboratorList = ProjectService.getProjectCollaborators(scope.datasets[i].ProjectId);
						
						scope.subprojectList = SubprojectService.getProjectSubprojects(scope.datasets[i].ProjectId);
						var watcher = scope.$watch('subprojectList.length', function(){
							console.log("Inside watcher for subprojectList.length... NOTE: this only happens for habitat...");
							// We wait until subprojects gets loaded and then turn this watch off.
							if (scope.subprojectList === null)
							{
								console.log("scope.subprojectList is null");
								return;
							}
							else if (typeof scope.subprojectList.length === 'undefined')
							{
								console.log("scope.subprojectList.length is undefined.");
								return;
							}
							else if (scope.subprojectList.length === 0)
							{
								console.log("scope.subprojectList.length is 0");
								if(scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
								{
									//scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
									// Note:  If we sent an empty list, it pulls all the locations.
									// If we supply an Id that we know does not exist (0), we get no locations, which is what we expect.
									scope.map.locationLayer.showLocationsById(0); //bump and reload the locations.
								}
								return;
							}
							console.log("scope.subprojectList.length = " + scope.subprojectList.length);
							console.log("subprojects is loaded...");
							//console.dir(scope.subprojectList);
							
							scope.cleanGateKeeper("Sdone");
                            scope.FileLocationSubprojectFundersWatchVariable += "Sdone";

                            //scope.agGridOptions.api.setRowData(scope.subprojectList); //update the habitat grid with the loaded items.

							watcher();
						});
					}
				}
				//console.log("scope.DatastoreTablePrefix = " + scope.DatastoreTablePrefix);
			}
			else
			{
				console.log("This project has no datasets yet.");
			}
        },true);

		//********** These 4 watches work together Start ******		
		/*scope.$watch('subprojectList.length', function(){
			// We wait until subprojects gets loaded and then turn this watch off.
			if (scope.subprojectList.length === 0)
				return;
			
			console.log("Inside subprojectList.length' watch...");
			
			angular.forEach(scope.subprojectList, function(subproject){
				subproject.searchField = "";
				subproject.searchField = subproject.searchField.concat(subproject.ProjectName);
				subproject.searchField = subproject.searchField.concat(" ");
				subproject.searchField = subproject.searchField.concat(subproject.Agency);
				subproject.searchField = subproject.searchField.concat(" ");
				subproject.searchField = subproject.searchField.concat(subproject.ProjectProponent);
				subproject.searchField = subproject.searchField.concat(" ");
				subproject.searchField = subproject.searchField.concat(subproject.Closed);
				subproject.searchField = subproject.searchField.concat(" ");
				subproject.searchField = subproject.searchField.concat(subproject.ProjectLead);
			});
			
			console.log("subprojects is loaded...");
			console.dir(scope.subprojectList);
			//watcher();
		});
		*/

		scope.$watch('subprojectFileList.length', function(){
			if ($rootScope.featureImagePresent)
			{
				if ((typeof scope.subprojectFileList === 'undefined') || (typeof scope.subprojectFileList.length === 'undefined') || (scope.subprojectFileList.length === null))
					return;
				else if (scope.subprojectFileList.length < 0)
					return;
				else
				{
					console.log("scope.subprojectFileList is next...");
					console.dir(scope.subprojectFileList);
					
					// Check if this watch has completed already.  If so, clean out the text File before appending; otherwise, the string gets really long.
					//if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("File") > -1)
					//{
						//scope.FileLocationSubprojectFundersWatchVariable.replace(/File/g, '');
					//}
					scope.cleanGateKeeper("File");
					scope.FileLocationSubprojectFundersWatchVariable += "File";
				}
			}
			else
			{
				scope.cleanGateKeeper("File");
				scope.FileLocationSubprojectFundersWatchVariable += "File";
			}
		});
		
		scope.$watch('project.Locations.length', function(){
			//if ((typeof scope.project.Locations === 'undefined') || (typeof scope.project.Locations.length === 'undefined') || (scope.project.Locations.length === null))
			if (scope.project && ((typeof scope.project.Locations === 'undefined') || (typeof scope.project.Locations.length === 'undefined') || (scope.project.Locations.length === null)))
				return;
			else if (scope.project.Locations.length < 0)
				return;
			else
			{
				//console.log("scope.project.Locations is next...");
				//console.dir(scope.project.Locations);
				
				// Check if this watch has completed already.  If so, clean out the text Loc before appending; otherwise, the string gets really long.
				//if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Loc") > -1)
				//{
					//scope.FileLocationSubprojectFundersWatchVariable.replace(/Loc/g, '');
				//}
				scope.cleanGateKeeper("Loc");
				scope.FileLocationSubprojectFundersWatchVariable += "Loc";
			}
			
		});
		
		scope.$watch('funderList.length', function(){
			if ($rootScope.fundersPresent)
			{
				if ((typeof scope.funderList === 'undefined') || (typeof scope.funderList.length === 'undefined') || (scope.funderList.length === null))
					return;
				else if (scope.funderList.length < 0)
					return;
				else
				{
					//console.log("scope.funderList is next...");
					//console.dir(scope.funderList);
					
					// Check if this watch has completed already.  If so, clean out the text Fund before appending; otherwise, the string gets really long.
					//if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Fund") > -1)
					//{
						//scope.FileLocationSubprojectFundersWatchVariable.replace(/Fund/g, '');
					//}
					scope.cleanGateKeeper("Fund");
					scope.FileLocationSubprojectFundersWatchVariable += "Fund";
				}
			}
			else
			{
				scope.cleanGateKeeper("Fund");
				scope.FileLocationSubprojectFundersWatchVariable += "Fund";
			}
		});
		
		scope.$watch('collaboratorList.length', function(){
			if ($rootScope.collaboratorPresent)
			{
				if ((typeof scope.collaboratorList === 'undefined') || (typeof scope.collaboratorList.length === 'undefined') || (scope.collaboratorList.length === null))
					return;
				else if (scope.collaboratorList.length < 0)
					return;
				else
				{
					//console.log("scope.collaboratorList is next...");
					//console.dir(scope.collaboratorList);
					
					// Check if this watch has completed already.  If so, clean out the text Coll before appending; otherwise, the string gets really long.
					//if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Coll") > -1)
					//{
						//scope.FileLocationSubprojectFundersWatchVariable.replace(/Coll/g, '');
					//}
					scope.cleanGateKeeper("Coll");
					scope.FileLocationSubprojectFundersWatchVariable += "Coll";
				}
			}
			else
			{
				scope.cleanGateKeeper("Coll");
				scope.FileLocationSubprojectFundersWatchVariable += "Coll";
			}
		});
		
		scope.$watch('FileLocationSubprojectFundersWatchVariable', function(){
			console.log("Inside watch FileLocationSubprojectFundersWatchVariable, scope.FileLocationSubprojectFundersWatchVariable = " + scope.FileLocationSubprojectFundersWatchVariable);
			//console.dir(scope);

			if ((scope.FileLocationSubprojectFundersWatchVariable.indexOf("Sdone") > -1) &&
				(scope.FileLocationSubprojectFundersWatchVariable.indexOf("Loc") > -1))
			{
				scope.matchLocationsToSubprojects();

				//if ((scope.featureImagePresent) && (scope.FileLocationSubprojectFundersWatchVariable.indexOf("File") > -1))
				if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("File") > -1)
				{
					scope.matchFilesToSubproject();
				}

				//if ((scope.fundersPresent) && (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Fund") > -1))
				if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Fund") > -1)
				{
					scope.matchFundersToSubproject();
				}
				
				//if ((scope.collaboratorPresent) && (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Coll") > -1))
				if (scope.FileLocationSubprojectFundersWatchVariable.indexOf("Coll") > -1)
				{
					scope.matchCollaboratorToSubproject();
				}
			}
			else
				return;
		});
		//********** These 4 watches work together End ******
		
		scope.$watch('project.Files.length', function(){
			
			console.log("Inside watch project.Files.length...");
			//console.log("project.Files is next...");
			//console.dir(scope.project.Files);
			
			//if ((typeof scope.project.Files === 'undefined') || (scope.project.Files === null))
			//{
			//	scope.project.Files = [];
			//}
			//else
			//{
				//if (scope.project.Files.length > 0)
				//{
					scope.project.Images = [];
					scope.project.Docs = [];
					
					var docIndex = 0;
					angular.forEach(scope.project.Files, function(file, key){
						//console.log("file.FileType.Name = " + file.FileType.Name + ", file.Subproject_CrppId = " + file.Subproject_CrppId);
						//if ((file.FileType.Name === "Image") && ((file.Subproject_CrppId === null) || (file.Subproject_CrppId === 1)))
						//if ((file.FileType.Name === "Image") && (file.Subproject_CrppId === null))
						if ((file.FileType.Name === "Image") && (file.DatasetId === null) && (file.Subproject_CrppId === null))
							scope.project.Images.push(file);
						else
						{
							//if ((file.Subproject_CrppId === null) || (file.Subproject_CrppId === 1))
							//if (file.Subproject_CrppId === null)
							if ((file.DatasetId === null) && (file.Subproject_CrppId === null))
							{
								scope.project.Docs.push(file);

								// If the user created a document and left the Title or Description blank, those fields were saved as "undefined" in the database.
								// When we read the list of files back in, the "undefined" shows on the page, and the user would rather have a blank show instead.
								if(!scope.project.Docs[docIndex].Title)
									scope.project.Docs[docIndex].Title = "";

								if(!scope.project.Docs[docIndex].Description)
									scope.project.Docs[docIndex].Description = "";

								docIndex++;
							}	     
						}
					});
				//}
				//else
				//{
				//	console.log("scope.project.Files empty; nothing to load...");
				//}
			//}
		});
		
        scope.$watch('project.Id', function(){
            if(scope.project && scope.project.Id)
            {
				console.log("Inside controllers, watch project.Id...");
				//**************************************************//
				// This is the better way to determine what to show; however, it wasn't getting set in time.  Need a better way to do this, rather than using scope.project.Id below.
				/*if (scope.DatastoreTablePrefix === "CreelSurvey")
					scope.ShowFishermen = true;
				else if (scope.DatastoreTablePrefix === "CrppDocuments")
					scope.ShowCorrespondence = true;
				*/
				console.log("scope.project.Id = " + scope.project.Id);
				$rootScope.projectId = scope.project.Id;
				
				scope.project.Files = null;
				scope.project.Files = ProjectService.getProjectFiles(scope.project.Id);
				
				/*************************************************************/				
				// Need this section for the subprojects in Habitat and CRPP to work properly.
				scope.subprojectType = ProjectService.getProjectType(scope.project.Id);
				$rootScope.subprojectType = scope.subprojectType = ProjectService.getProjectType(scope.project.Id);
				console.log("scope.subprojectType = " + scope.subprojectType);
				SubprojectService.setServiceSubprojectType(scope.subprojectType);
				/*************************************************************/
				
                scope.editors = scope.project.Editors;
                scope.users = CommonService.getUsers();
				
				//var theFishermen = ProjectService.getProjectFishermen(scope.project.Id);

                //split out the images and other files.
                scope.project.MetadataValue = {};
                scope.project.Images = [];
                scope.project.Docs = [];

                var docIndex = 0;
                angular.forEach(scope.project.Files, function(file, key){
					//console.log("file.FileType.Name = " + file.FileType.Name + ", file.Subproject_CrppId = " + file.Subproject_CrppId);
                    //if ((file.FileType.Name === "Image") && ((file.Subproject_CrppId === null) || (file.Subproject_CrppId === 1)))
                    //if ((file.FileType.Name === "Image") && (file.Subproject_CrppId === null))
                    if (file.FileType.Name === "Image")
                        scope.project.Images.push(file);
                    else
                    {
						//if ((file.Subproject_CrppId === null) || (file.Subproject_CrppId === 1))
						//if (file.Subproject_CrppId === null)
						if ((file.DatasetId === null) && (file.Subproject_CrppId === null))
						{
							scope.project.Docs.push(file);

							// If the user created a document and left the Title or Description blank, those fields were saved as "undefined" in the database.
							// When we read the list of files back in, the "undefined" shows on the page, and the user would rather have a blank show instead.
							if(!scope.project.Docs[docIndex].Title)
								scope.project.Docs[docIndex].Title = "";

							if(!scope.project.Docs[docIndex].Description)
								scope.project.Docs[docIndex].Description = "";

							docIndex++;
						}	     
                    }
                });

                //reload if it is already selected -- this is what allows you to see the new accuracycheck/characteristic immediately after it is added
                if(scope.viewInstrument)
                    scope.viewInstrument = getMatchingByField(scope.project.Instruments, scope.viewInstrument.Id, 'Id')[0];

                if ((typeof scope.viewFisherman !== 'undefined') && (scope.viewFisherman !== null))
                {
                    scope.viewFisherman = getMatchingByField(scope.project.Fishermen, scope.viewFisherman.Id, 'Id')[0];
					// The DateAdded is in UTC format and we need to display only YYYY-MM-DD format.
					// The value is a string, and JavaScript Date
					console.log("scope.viewFisherman is next...");
					console.dir(scope.viewFisherman);
					
					// If we just deleted a fisherman from the project, scope.viewFisherman will be null or undefined now, after the getMatchingByField function call above.
					// So we don't want to try accessing scope.viewFisherman.DateAdded at this time.
					if ((typeof scope.viewFisherman !== 'undefined') && (scope.viewFisherman !== null))
					{
						var strDate = scope.viewFisherman.DateAdded;
						scope.viewFisherman.DateAdded = ServiceUtilities.extractDateFromString(strDate);
						
						scope.viewFisherman.Status = ConvertStatus.convertStatus(scope.viewFisherman.StatusId);
						console.log("scope.viewFisherman.Status = " + scope.viewFisherman.Status);
						
						scope.viewFisherman.OkToCall = ConvertStatus.convertOkToCall(scope.viewFisherman.OkToCallId);
						console.log("scope.viewFisherman.OkToCall = " + scope.viewFisherman.OkToCall);						
					}
                }
				
                //add in the metadata to our metadataList that came with this dataset
                addMetadataProperties(scope.project.Metadata, scope.metadataList, scope, CommonService);

                scope.mapHtml = $sce.trustAsHtml(scope.project.MetadataValue[25]);
                scope.imagesHtml = $sce.trustAsHtml(scope.project.MetadataValue[13]);


                //get habitat (and possibly other?) metadata values for this project.  they don't come with project metadata as they are their own category.
                var habitatProjectMetadataPromise = CommonService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITATTYPEID);
                habitatProjectMetadataPromise.$promise.then(function(list){
                    addMetadataProperties(list, scope.metadataList, scope, CommonService);
                });

                scope.project.Instruments = scope.project.Instruments.sort(orderByAlphaName);
				
				console.log("scope at end of controllers.js, project watch is next...");
				//console.dir(scope);
            }

        });
		
		scope.$watch('subproject.Id', function(){
			if ((typeof scope.subproject === 'undefined') || (scope.subproject === null))
			{
				console.log("watching...");
				return;
			}
			
			console.log("Inside controllers.js, watch subproject.Id...");
			console.log("scope.subproject.Id = " + scope.subproject.Id);
		});
		
		scope.cleanGateKeeper = function(theText)
		{
			console.log("Inside scope.cleanGateKeeper...theText = " + theText);
			
			var intStringLocation = -1;
			
			// Check if the watch has completed already.  If so, clean out the text before appending; otherwise, the string gets really long.
			if (scope.FileLocationSubprojectFundersWatchVariable.indexOf(theText) > -1)
			{
				//scope.FileLocationSubprojectFundersWatchVariable.replace(/File/g, '');
				intStringLocation = scope.FileLocationSubprojectFundersWatchVariable.indexOf(theText);
				while (intStringLocation > -1)
				{
					//console.log("scope.FileLocationSubprojectFundersWatchVariable (during cleaning) = " + scope.FileLocationSubprojectFundersWatchVariable);
					scope.FileLocationSubprojectFundersWatchVariable = scope.FileLocationSubprojectFundersWatchVariable.replace(theText, "");
					intStringLocation = scope.FileLocationSubprojectFundersWatchVariable.indexOf(theText);
				}
			}
			//console.log("scope.FileLocationSubprojectFundersWatchVariable (after cleaning) = " + scope.FileLocationSubprojectFundersWatchVariable);
		};
		
		scope.ShowMap = {
			Display: false,
			Message: "Show Map",
			MessageToOpen: "Show Map",
			MessageToClose: "Hide Map",
		};
		
        scope.deleteGalleryFile = function()
        {
            scope.openDeleteFileModal(scope.galleryFileSelection[0]);
        };
		
        scope.editGalleryFile = function()
        {
            scope.openEditFileModal(scope.galleryFileSelection[0]);
        };

        scope.newGalleryFile = function()
        {
			scope.uploadFileType = "image";
            scope.openNewFileModal();
        };

        scope.deleteFile = function()
        {
            scope.openDeleteFileModal(scope.fileSelection[0]);
        };	
		
        scope.editFile = function()
        {
            scope.openEditFileModal(scope.fileSelection[0]);
        };

        scope.newFile = function()
        {
			scope.uploadFileType = "document";
            scope.openNewFileModal();
        };
		
        scope.toggleFavorite = function(){
            scope.isFavorite = !scope.isFavorite; //make the visible change instantly.

            scope.results = {};

            $rootScope.Profile.toggleProjectFavorite(scope.project);

            PreferencesService.saveUserPreference("Projects", $rootScope.Profile.favoriteProjects.join(), scope.results);

            var watcher = scope.$watch('results', function(){
                if(scope.results.done)
                {
                    //if something goes wrong, roll it back.
                    if(scope.results.failure)
                    {
                        scope.isFavorite = !scope.isFavorite;
                        $rootScope.Profile.toggleProjectFavorite(scope.project);
                    }
                    watcher();
                }
            },true);
        }
		
		scope.toggleMap = function(){
			if(scope.ShowMap.Display)
			{
				scope.removeFilter(); //also clears location
				scope.ShowMap.Display = false;
				scope.ShowMap.Message = scope.ShowMap.MessageToOpen;
			}
			else
			{
				scope.ShowMap.Display = true;
				scope.ShowMap.Message = scope.ShowMap.MessageToClose;

				setTimeout(function(){
					scope.map.reposition();
					console.log("repositioned");
				}, 400);

			}
		};
		
		scope.removeFilter = function()
		{
			//scope.activities = scope.allActivities;
			scope.clearLocation();
		};
		
		scope.clearLocation = function(){
			scope.map.infoWindow.hide();
			scope.selectedLocation = null;

			if(scope.newGraphic)
			{
				scope.map.graphics.remove(scope.newGraphic);
				scope.newGraphic = null;
			}

		};
		
		scope.matchLocationsToSubprojects = function()
		{
			console.log("Inside controllers.js, scope.matchLocationsToSubprojects...");	

			//console.log("scope is next...");
			//console.dir(scope);
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
			//console.log("scope.project.Locations is next...");
			//console.dir(scope.project.Locations);

			scope.thisProjectsLocationObjects = []; // Dump this list, before refilling it.
			angular.forEach(scope.subprojectList, function(subproject){
				
				angular.forEach(scope.project.Locations, function(location, key){
					//console.log("location key = " + key);
					//console.log("location is next...");
					//console.dir(location);

					// We will show the Primary Project Location, and the locations of the subprojects.
					//if ((location.LocationTypeId === 3) || (subproject.Id === location.SubprojectId))
					//console.log("location.LocationTypeId = " +  location.LocationTypeId + ", subproject.LocationId = " + subproject.LocationId + ", location.Id = " + location.Id);
					if (subproject.LocationId === location.Id)
					{
						console.log("Found a subproject location")
						//console.dir(location);
						scope.thisProjectsLocationObjects.push(location.SdeObjectId);
						subproject.GPSEasting = location.GPSEasting;
						subproject.GPSNorthing = location.GPSNorthing;
						subproject.UTMZone = location.UTMZone;
						subproject.Projection = location.Projection;
						subproject.WaterBodyId = location.WaterBodyId;
					}
				});
			});
			scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
		};
		
		scope.matchFilesToSubproject = function()
		{
			console.log("Inside controllers.js, scope.matchFilesToSubproject...");	

			//console.log("scope is next...");
			//console.dir(scope);
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
			//console.log("scope.subprojectFileList is next...");
			//console.dir(scope.subprojectFileList);
			//console.log("scope.project.Files is next...");
			//console.dir(scope.project.Files);			
			
			angular.forEach(scope.subprojectList, function(subproject){

				angular.forEach(scope.subprojectFileList, function(spFile){
					//if (subproject.Id === spFile.SubprojectId)
					//if (subproject.Id === spFile.Subproject_CrppId)
					if ((subproject.Id === spFile.Subproject_CrppId) && (spFile.FeatureImage === 1))
					{
						//angular.forEach(scope.project.Files, function(pFile){
						//	if (pFile.Id === spFile.FileId)
						//		subproject.ItemFiles = angular.copy(pFile);
						//});
						if (!subproject.ItemFiles)
						{
							subproject.ItemFiles = [];
							subproject.ItemFiles.push(spFile);
						}
						else
							subproject.ItemFiles = angular.copy(spFile);
						
						//scope.viewSubproject.ItemFiles = subproject.ItemFiles;
						console.log("Matched subproject file...");
					}
				});
			});	

			$rootScope.subprojectFileList = scope.subprojectFileList;			
		};
		
		scope.matchFundersToSubproject = function()
		{
			console.log("Inside controllers.js, scope.matchFundersToSubproject...");
			
			//console.log("scope is next...");
			//console.dir(scope);
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
			//console.log("scope.funderList is next...");
			//console.dir(scope.funderList);	

			var strFunders = "";
			angular.forEach(scope.subprojectList, function(subproject){
				strFunders = "";			
				angular.forEach(scope.funderList, function(funder){
					if (funder.SubprojectId === subproject.Id)
					{
						strFunders += funder.Name + ", " + funder.Amount + ";\n";
					}
				});
				subproject.strFunders = strFunders;	
			});
		};
		
		scope.matchCollaboratorToSubproject = function()
		{
			console.log("Inside controllers.js, scope.matchCollaboratorToSubproject...");
			
			//console.log("scope is next...");
			//console.dir(scope);
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
			//console.log("scope.collaboratorList is next...");
			//console.dir(scope.collaboratorList);
			
			var strCollaborators = "";
			angular.forEach(scope.subprojectList, function(subproject){
				strCollaborators = "";
				angular.forEach(scope.collaboratorList, function(collaborator){
					if (collaborator.SubprojectId === subproject.Id)
					{
						strCollaborators += collaborator.Name + ";\n";
					}
				});
				subproject.strCollaborators = strCollaborators;
			});
		};
		


        //metadata -- we have a list of metadata properties that are configured for "project" entities.
        //  any metadata already associated with a project come in teh project's Metadata array, but ones that haven't
        //  been given a value yet on a specific project won't appear and need to be added in separately.


        scope.metadataPropertiesPromise.promise.then(function(list){
            addMetadataProperties(list, scope.metadataList, scope, CommonService);
        });

        scope.habitatPropertiesPromise.promise.then(function(list){
            addMetadataProperties(list, scope.metadataList, scope, CommonService);
        });


        scope.openChooseMapImage = function(){
            var modalInstance = $modal.open({
              templateUrl: 'app/core/projects/components/project-detail/templates/modal-choosemap.html',
              controller: 'ModalChooseMapCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

        scope.openChooseSummaryImages = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-choosesummaryimages.html',
              controller: 'ModalChooseSummaryImagesCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

        scope.createInstrument = function(){
            scope.viewInstrument = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

		scope.createFisherman = function(){
            scope.viewFisherman = null;
            var modalInstance = $modal.open({
              templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
              controller: 'ModalCreateFishermanCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        scope.createSubproject = function(){
            scope.viewSubproject = null;
			scope.createNewSubproject = true;
			//scope.subprojectList = null;
			scope.subprojectOptions = null;
			console.log("scope.createNewSubproject = " + scope.createNewSubproject);
            var modalInstance = $modal.open({
                templateUrl: 'app/private/crpp/components/crpp-contracts/templates/modal-create-subproject.html',
              controller: 'ModalCreateSubprojectCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.createHabSubproject = function(){
            scope.viewSubproject = null;
			scope.createNewSubproject = true;
			scope.subprojectList = null;
			scope.subprojectOptions = null;
			console.log("scope.createNewSubproject = " + scope.createNewSubproject);
            var modalInstance = $modal.open({
                templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-create-habSubproject.html',
              controller: 'ModalCreateHabSubprojectCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        scope.editViewInstrument = function(){
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        scope.editViewFisherman = function(){
            var modalInstance = $modal.open({
              templateUrl: 'app/core/common/components/modals/templates/modal-create-fisherman.html',
              controller: 'ModalCreateFishermanCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		 
        //scope.editViewSubproject = function(){
        scope.editViewSubproject = function(subproject){
			console.log("Inside editViewSubproject...");
			
			/* Note:  Let's say we just added or edited a subproject, and then clicked on the Edit button to review it.
			* If you simply click on the edit, it will not contain the most recent info (that you just updated),
			* and that will leave you wondering what just happened.
			* However, if you click on the subproject first (runs viewSelectedSubproject, in this file), and then click the Edit button,
			* the form WILL have the most recent info (that you just updated).
			* So, what we must do is run viewSelectedSubproject first, and then open the form, which is what we do just below.
			*/
			scope.viewSelectedSubproject(subproject);
			
			console.log("scope.DatastoreTablePrefix = " + scope.DatastoreTablePrefix + ", scope.project.Id = " + scope.projectId);
			if (scope.DatastoreTablePrefix === "CrppContracts")
			{
				console.log("viewing a CRPP subproject");
				var modalInstance = $modal.open({
                    templateUrl: 'app/private/crpp/components/crpp-contracts/templates/modal-create-subproject.html',
				  controller: 'ModalCreateSubprojectCtrl',
				  scope: scope, //very important to pass the scope along...
				});
			}
			else if (scope.subprojectType === "Habitat")
			{
				console.log("viewing a Habitat subproject");
				//scope.subprojectFileList = SubprojectService.getSubprojectFiles(scope.projectId, subproject.Id);
				var modalInstance = $modal.open({
                    templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-create-habSubproject.html',
				  controller: 'ModalCreateHabSubprojectCtrl',
				  scope: scope, //very important to pass the scope along...
				});
			}
        };

        scope.postRemoveSubprojectUpdateGrid = function () {
            //the scope.subproject is the one we removed.
            console.log("ok - we removed one so update the grid...");
            
            Array.forEach(scope.subprojectList, function (item, index) {
                if (item.Id === scope.viewSubproject.Id) {
                    scope.subprojectList.splice(index, 1);
                    console.log("ok we removed :" + index);
                    console.dir(scope.subprojectList[index]);
                    scope.agGridOptions.api.setRowData(scope.subprojectList);
                    //scope.agGridOptions.api.redrawRows();
                    console.log("done reloading grid.");
                }
            });
        };

        //called by the modal once the correspondence event is successfully saved.
        scope.postEditCorrespondenceEventUpdateGrid = function (edited_event) {
            console.log("editCrppCorrespondenceEvent..." + edited_event.Id + " for subproject " + edited_event.SubprojectId);

            //edit our correspondence item and then reload the grid.
            Array.forEach(scope.subprojectList, function (item, index) {
                if (item.Id === edited_event.SubprojectId) {
                    item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort. - this was already updated in the be
                    Array.forEach(item.CorrespondenceEvents, function (event_item, event_item_index) {
                        if (event_item.Id === edited_event.Id) {
                            angular.extend(event_item, edited_event); //replace the data for that item
                            console.log("OK!! we edited that correspondence event");
                        }
                    });
                }
            });

            scope.agGridOptions.api.setRowData(scope.subprojectList);

            //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
            var the_node = scope.expandSubProjectById(edited_event.SubprojectId);
            if (the_node != null)
                scope.agGridOptions.api.ensureNodeVisible(the_node);

            console.log("done reloading grid after removing item.");

        };
           
        //called by the modal once a correspondence event (edit) is saved
        scope.postAddCorrespondenceEventUpdateGrid = function (new_event) {
            //console.dir(new_event);
            console.log("saving correspondence event for " + new_event.SubprojectId);

            var subproject = scope.getSubprojectById(new_event.SubprojectId);
            
            if (subproject === undefined || subproject == null) { //TODO: the case where they create items before the proejct is saved?
                console.log("no subproject... hmm ... i guess we should reload everything...");
            }else{
                Array.forEach(scope.subprojectList, function (item, index) {
                    if (item.Id === subproject.Id) {
                        item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort - this was already updated in the be
                        item.CorrespondenceEvents.push(new_event);
                        console.log("Added event " + new_event.Id + " to " + subproject.Id);
                    }
                });
                scope.agGridOptions.api.setRowData(scope.subprojectList);

                //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                var the_node = scope.expandSubProjectById(subproject.Id);
                if (the_node != null)
                    scope.agGridOptions.api.ensureNodeVisible(the_node);

                console.log("done reloading grid after removing item.");
            }
        };

        //fired after a user saves a new or edited project.
        // we update the item in the main subproject array and then refresh the grid.
        scope.postSaveSubprojectUpdateGrid = function (the_promise) {
            console.log("ok - we saved so update the grid...");
            var total = scope.subprojectList.length;
            var count = 0;
            var updated = false;
            Array.forEach(scope.subprojectList, function (item, index) {
                if (item.Id === the_promise.Id) {
                    updated = true;
                    //console.log("ok we found a match! -- updating! before:");
                    //console.dir(scope.subprojectList[index]);

                    if (the_promise.CorrespondenceEvents !== undefined)
                        delete the_promise.CorrespondenceEvents; //remove this before the copy.

                    angular.extend(scope.subprojectList[index], the_promise); //replace the data for that item
                    console.log("ok we found a match! -- updating! after:");
                    console.dir(scope.subprojectList[index]);
                    scope.agGridOptions.api.redrawRows();
                    console.log("done reloading grid.");
                }
                count++;
                if (count == total && updated == false) //if we get all done and we never found it, lets add it to the end.
                {
                    console.log("ok we found never a match! -- adding!");
                    the_promise.CorrespondenceEvents = [];
                    the_promise.Files = [];
                    scope.subprojectList.push(the_promise); //add that item
                    scope.agGridOptions.api.setRowData([]);
                    scope.agGridOptions.api.setRowData(scope.subprojectList);
                    
                    console.log("done reloading grid.");
                }
            });
        };



        scope.redrawRows = function () {
            scope.agGridOptions.api.setRowData([]);
            setTimeout(function () { scope.agGridOptions.api.setRowData(scope.subprojectList); }, 4000);

            
            console.log("redrawrows!");
        };

        scope.refreshCells = function () {
            scope.agGridOptions.api.refreshCells();
            console.log("refreshcells!");
        };

        scope.refreshMemory = function () {
            scope.agGridOptions.api.refreshInMemoryRowModel('group');
            console.log("redrawgroupmodel!");
        };

		
        scope.openAccuracyCheckForm = function(ac_row){
            if(ac_row)
              scope.ac_row = ac_row;
            else
              scope.ac_row = {};

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-new-accuracycheck.html',
              controller: 'ModalAddAccuracyCheckCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

        //if you are creating a new one for the project, the ce_row will be empty
        // if you are editing an existing one, send in the project and the ce_row.
        scope.openCorrespondenceEventForm = function (subproject, ce_row = {}){
			console.log("Inside openCorrespondenceEventForm...")

            scope.viewSubproject = subproject;
            console.log("ok subproject set: ");
            console.dir(scope.viewSubproject);
            scope.ce_row = ce_row;

            var modalInstance = $modal.open({
                templateUrl: 'app/private/crpp/components/crpp-contracts/templates/modal-new-correspondenceEvent.html',
              controller: 'ModalAddCorrespondenceEventCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };

        scope.openHabitatItemForm = function(hi_row){
			console.log("Inside openHabitatItemForm...")
			//console.dir(scope);
			
            if(hi_row)
              scope.hi_row = hi_row;
            else
              scope.hi_row = {};


            var modalInstance = $modal.open({
                templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-new-habitatItem.html',
              controller: 'ModalAddHabitatItemCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
		scope.openGeospatialDataPage = function(){
			console.log("Inside openGeospatialDataPage...");

			var strUrl = "http://ctuirgis.maps.arcgis.com/apps/webappviewer/index.html?id=1669df9b26874c9eb49cc41ec4d57ec5";
			//var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";			
			var strWindowFeatures = "location=yes,scrollbars=yes,status=yes";
			$window.open(strUrl, "_blank", strWindowFeatures);
		};
		
        scope.openDeleteFileModal = function(selection)
        {
            scope.row = selection;
            var modalInstance = $modal.open({
              templateUrl: 'app/core/projects/components/project-detail/templates/modal-delete-file.html',
              controller: 'ModalDeleteFileCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };	

        scope.openEditFileModal = function(selection)
        {
            scope.row = selection;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-file.html',
              controller: 'ModalEditFileCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.openNewFileModal = function(selection)
        {
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-upload-files.html',
              controller: 'ModalNewFileCtrl',
              scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.openProjectEditor = function(){
            scope.row = scope.project; //
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-project.html',
				controller: 'ModalProjectEditorCtrl',
				scope: scope, //very important to pass the scope along...

            });
        };
		 
        scope.syncToStreamnet = function(){
            $.ajax({
                url: serviceUrl + '/api/v1/streamnet/synctostreamnet',
                type : 'GET',
                // data : formData,
                // processData: false,  // tell jQuery not to process the data
                // contentType: false,  // tell jQuery not to set contentType
                success : function(data) {
                    // var output = eval("(" + data + ")");
                    alert(data.join('\n'));
                },
                error: function(jqXHR, error, errorThrown) {
                    if(jqXHR.status && jqXHR.status == 400) {
                        alert(jqXHR.responseText + "\n\n" + "Error running sync action!");
                    } else {
                        alert("Error running sync action!");
                    }
                }
            });

        };

        scope.openPrintWindow = function()
        {
			$window.open(PROJECT_REPORT_URL+scope.project.Id,'_blank');
        };

        scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

        scope.viewInstrument = null; //what they've clicked to view accuracy checks
        scope.selectedInstrument = null; //what they've selected in the dropdown to add to the project

        scope.reloadProject = function(){
            //reload project -- this will reload the instruments & laboratories
            ProjectService.clearProject();
            scope.project = ProjectService.getProject(routeParams.Id);
        };

        //returns null if none found...
        scope.getSubprojectById = function (id_in)
        {
            var result = null;
            Array.forEach(scope.subprojectList, function (item) {
                if (item.Id === id_in) {
                    result = item; //can't just return here -- see Array.foreach docs
                }
            });
            
            return result;
        };

		scope.reloadSubproject = function(id){
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubproject, id = " + id);
			SubprojectService.clearSubproject();
			//scope.subproject = SubprojectService.getSubproject(id);
			
			if (scope.DatastoreTablePrefix === "CrppContracts")
			{
				console.log("Reloading Crpp...");
				scope.subproject = SubprojectService.getSubproject(id);
			}
			else if (scope.subprojectType === "Habitat")
			{
				console.log("Reloading Habitat, Id = " + id);
				scope.subproject = null;
				scope.subproject = SubprojectService.getSubproject(id);
			}
			
			var watcher = scope.$watch('subproject.Id', function(){
				if ((typeof scope.subproject === 'undefined') || (scope.subproject === null))
				{
					console.log("watching...");
					return;
				}
				
				/*scope.subproject.searchField = "";
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.ProjectName);
				scope.subproject.searchField = scope.subproject.searchField.concat(" ");
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.Agency);
				scope.subproject.searchField = scope.subproject.searchField.concat(" ");
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.ProjectProponent);
				scope.subproject.searchField = scope.subproject.searchField.concat(" ");
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.Closed);
				scope.subproject.searchField = scope.subproject.searchField.concat(" ");
				scope.subproject.searchField = scope.subproject.searchField.concat(scope.subproject.ProjectLead);
				*/
				console.log("scope.subproject.Id = " + scope.subproject.Id);
				// We wait until subproject gets loaded and then turn this watch off.
				watcher();
			});
		};
		
		scope.reloadSubprojectLocations = function()
		{
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubprojectLocations...");
			
			scope.thisProjectsLocationObjects = []; // Dump this list, before refilling it.
			angular.forEach(scope.subprojectList, function(subproject){
				angular.forEach(scope.project.Locations, function(location, key){
					//console.log("location key = " + key);
					//console.log("location is next...");
					//console.dir(location);

					if (subproject.LocationId === location.Id)
						scope.thisProjectsLocationObjects.push(location.SdeObjectId);
					
				});
			});
			console.log("scope.thisProjectsLocationObjects is next...");
			console.dir(scope.thisProjectsLocationObjects);
			
			if (scope.thisProjectsLocationObjects.length > 0)
			{
				if(scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
					scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
			}
			//else
			//{
			//	scope.map.locationLayer.showLocationsById(0);
			//}
		};
		
        scope.reloadThisProject = function()
        {
			//scope.project = [];
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadThisProject...");
			console.log("scope.projectId = " + scope.projectId + ", scope.SdeObjectId = " + scope.SdeObjectId);
			
			scope.FileLocationSubprojectFundersWatchVariable = ""; // Clean GateKeeper variable.
			
			// Right now, we still now what the project and subproject type are, so reload the extra items for these specific projects.
			if (scope.subprojectType === "CRPP") // CRPP
				scope.subprojectList = SubprojectService.getSubprojects();
			else if (scope.subprojectType === "Habitat")
			{
				console.log("scope.projectId = " + scope.projectId);
				scope.project = ProjectService.getProject(scope.projectId);
				//scope.subprojectList = SubprojectService.getHabSubprojects();
				scope.subprojectList = SubprojectService.getProjectSubprojects(scope.projectId);
				scope.funderList = ProjectService.getProjectFunders(scope.projectId);
			}
			
			scope.project = ProjectService.getProject(parseInt(scope.projectId));
        };
		
        scope.reloadThisHabSubproject = function(subprojectId)
        {
			//scope.project = [];
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadThisHabSubproject...");
			console.log("scope.projectId = " + scope.projectId + ", scope.SdeObjectId = " + scope.SdeObjectId + ", subprojectId = " + subprojectId);
			scope.project = SubprojectService.getHabSubproject(parseInt(subprojectId));		
        };
		
		scope.setSdeObjectId = function(sdeObjectId)
		{
			console.log("Inside contollers.js, scope.setSdeObjectId...");
			console.log("sdeObjectId = " + sdeObjectId);
			scope.SdeObjectId = sdeObjectId;
			console.log("scope.SdeObjectId");
		};
		 
		scope.reloadSubprojects = function()
		{
			console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubprojects...");
			SubprojectService.clearSubprojects();

			if (scope.subprojectType === "CRPP") // CRPP
				scope.subprojectList = SubprojectService.getSubprojects();
			else if (scope.subprojectType === "Habitat")
			{
				console.log("scope.projectId = " + scope.projectId);
				scope.project = ProjectService.getProject(scope.projectId);
				//scope.subprojectList = SubprojectService.getHabSubprojects();
				scope.subprojectList = SubprojectService.getProjectSubprojects(scope.projectId);
				scope.funderList = ProjectService.getProjectFunders(scope.projectId);
			}
			
			var watcher = scope.$watch('subprojectList.length', function(){
				// We wait until subprojects gets loaded and then turn this watch off.
				if (scope.subprojectList === null)
					return;

                //else if (scope.subprojectList.length === 0) //watcher() below turns off the watch.
				//	return
				
				/*angular.forEach(scope.subprojectList, function(subproject){
					subproject.searchField = "";
					subproject.searchField = subproject.searchField.concat(subproject.ProjectName);
					subproject.searchField = subproject.searchField.concat(" ");
					subproject.searchField = subproject.searchField.concat(subproject.Agency);
					subproject.searchField = subproject.searchField.concat(" ");
					subproject.searchField = subproject.searchField.concat(subproject.ProjectProponent);
					subproject.searchField = subproject.searchField.concat(" ");
					subproject.searchField = subproject.searchField.concat(subproject.Closed);
					subproject.searchField = subproject.searchField.concat(" ");
					subproject.searchField = subproject.searchField.concat(subproject.ProjectLead);
				});
				*/
			
				scope.FileLocationSubprojectFundersWatchVariable += "Sdone";
				
				console.log("subprojects is loaded...");
                console.dir(scope.subprojectList);

				watcher();
			});
			
		};

        scope.addInstrument = function(){
			/* Verify that all three situations are true:
			*  scope.selectedInstrument exists				This is important because IE will not actually select something, when you select it the first time.
			*  scope.selectedInstrument is not null			Important for the same reason just mentioned.
			*  The selected instrument is not already associated to the project.
			*/
            //if(!scope.selectedInstrument || getMatchingByField(scope.project.Instruments, scope.selectedInstrument, 'Id').length > 0)
            if(!scope.selectedInstrument || scope.selectedInstrument === null || getMatchingByField(scope.project.Instruments, scope.selectedInstrument, 'Id').length > 0)	
                return;

            var Instruments = getMatchingByField(scope.allInstruments, scope.selectedInstrument, 'Id');

            var promise = ProjectService.saveProjectInstrument(scope.project.Id, Instruments[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };

        scope.addFisherman = function(){
			console.log("Inside controllers.addFisherman.");
			//console.log("scope is next...");
			//console.dir(scope);
			console.log("scope.selectedFisherman is next...");
			console.dir(scope.selectedFisherman);
			
            if(!scope.selectedFisherman || scope.selectedFisherman === null || getMatchingByField(scope.project.Fishermen, scope.selectedFisherman, 'Id').length > 0)
                return;
	
            var theFishermen = getMatchingByField(scope.fishermenList, scope.selectedFisherman, 'Id');

			var promise = ProjectService.saveProjectFisherman(scope.project.Id, theFishermen[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };
		 
        scope.addSubproject = function(){
			console.log("Inside controllers.addSubproject.");
			//console.log("scope is next...");
			//console.dir(scope);
			console.log("scope.selectedSubproject is next...");
			console.dir(scope.selectedSubproject);
			
            if(!scope.selectedSubproject || scope.selectedSubproject === null || getMatchingByField(scope.project.CrppSubProjects, scope.selectedSubproject, 'Id').length > 0)
                return;
	
            var theSubproject = getMatchingByField(scope.correspondenceProjectList, scope.selectedSubproject, 'Id');

			var promise = SubprojectService.saveSubproject(scope.project.Id, theSubproject[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };

        scope.removeViewInstrument = function(){
            if(!scope.viewInstrument)
                return;

            var promise = ProjectService.removeProjectInstrument(scope.project.Id, scope.viewInstrument.Id);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };
		 
        scope.removeViewFisherman = function(){
			//console.log("scope is next...");
			//console.dir(scope);
            if(!scope.viewFisherman)
                return;

            var promise = ProjectService.removeProjectFisherman(scope.project.Id, scope.viewFisherman.Id);

            promise.$promise.then(function(){
                scope.reloadProject();
            });
        };

        //returns the (last) node or null if none found.
        scope.expandSubProjectById = function (id_in) {
            var the_node = null;
            scope.agGridOptions.api.forEachNode(function (node) {
                if (node.data.Id === id_in) {
                    console.log("Expanding! " + id_in);
                    node.setExpanded(true);
                    the_node = node;
                }
            });
            return the_node;
        };

        //removes the correspondence event and then updates the grid
        scope.removeCrppCorrespondenceEvent = function (subproject, event) {
            console.log("removeCrppCorrespondenceEvent..."+ event.Id + " for subproject " + subproject.Id);

            if (confirm('Are you sure that you want to delete this Correspondence Event?')) {
                var promise = SubprojectService.removeCorrespondenceEvent(scope.project.Id, subproject.Id, event.Id, scope.DatastoreTablePrefix);
                
                promise.$promise.then(function () {
                    //remove from our subprojectList and then reload the grid.
                    Array.forEach(scope.subprojectList, function (item, index) {
                        if (item.Id === subproject.Id) {
                            Array.forEach(item.CorrespondenceEvents, function (event_item, event_item_index) {
                                if (event_item.Id === event.Id) {
                                    item.CorrespondenceEvents.splice(event_item_index, 1);
                                    console.log("OK!! we removed that correspondence event");
                                }
                            });
                        }
                    });
                    scope.agGridOptions.api.setRowData(scope.subprojectList);

                    //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                    var the_node = scope.expandSubProjectById(subproject.Id);
                    if(the_node != null)
                        scope.agGridOptions.api.ensureNodeVisible(the_node);

                    console.log("done reloading grid after removing item.");
                });
            }
        };
        
		 
        scope.removeViewSubproject = function(subproject){
			console.log("Inside removeViewSubproject, scope is next...");

            if (!subproject)
                return;

            scope.viewSubproject = subproject;
            
			console.log("scope.projectId = " + scope.projectId);
			if (scope.subprojectType === "CRPP")
			{
				console.log("CRPP-related...")
				if (scope.viewSubproject.CorrespondenceEvents.length > 0)
				{
					alert("This project has associated correspondence events.  Those must be deleted first.");
				}
				else
				{
					scope.verifyAction = "Delete";
					scope.verifyingCaller = "CrppSubproject";
					console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " +  scope.viewSubproject.Id);
					var modalInstance = $modal.open({
					  templateUrl: 'app/core/common/components/modals/templates/modal-verifyAction.html',
					  controller: 'ModalVerifyActionCtrl',
					  scope: scope, //very important to pass the scope along...
					});
				}
			}
			else if (scope.subprojectType === "Habitat")
			{
				console.log("Habitate-related...")
				if (scope.viewSubproject.HabitatItems.length > 0)
				{
					alert("This project has associated Habitat items.  Those must be deleted first.");
				}
				else
				{
					scope.verifyAction = "Delete";
					scope.verifyingCaller = "HabSubproject";
					console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " +  scope.viewSubproject.Id);
					var modalInstance = $modal.open({
					  templateUrl: 'app/core/common/components/modals/templates/modal-verifyAction.html',
					  controller: 'ModalVerifyActionCtrl',
					  scope: scope, //very important to pass the scope along...
					});
				}
			}
        };
		
		scope.refreshProjectLocations = function(){
			console.log("Inside controllers.js, refreshProjectLocations...");
			ProjectService.clearProject();
			scope.project = null;
			scope.project = ProjectService.getProject(parseInt(scope.projectId));
		};

        scope.clearUsersWatch = scope.$watch('users', function(){
                if(scope.users)
                {
                    if(scope.users.length > 0)
                    {
                        scope.clearUsersWatch();
                        scope.filterUsers();
                    }
                }
                else
                    console.log("not yet.");

        },true); //note this TRUE here... this is required when watching an array directly.

        scope.viewSelectedInstrument = function(instrument){
            scope.viewInstrument = instrument;
        };
		 
		scope.viewSelectedFisherman = function(fisherman){
			console.log("Inside controllers.js, scope.viewSelectedFisherman");
			if (scope.viewFisherman)
				delete scope.viewFisherman;
			
			scope.viewFisherman = fisherman;
			//console.log("scope is next...");
			//console.dir(scope);			
			console.log("scope.viewFisherman is next...");
			console.dir(scope.viewFisherman);
			console.log("scope.viewFisherman.DateAdded = " +  scope.viewFisherman.DateAdded);			

			//var strInDate = scope.viewFisherman.DateAdded;
			//console.log("strInDate = " + strInDate);
			//scope.viewFisherman.DateAdded = ServiceUtilities.extractDateFromString(strInDate);
			//console.log("scope.viewFisherman.DateAdded = " + scope.viewFisherman.DateAdded);

			scope.viewFisherman.Status = ConvertStatus.convertStatus(scope.viewFisherman.StatusId);
			console.log("scope.viewFisherman.Status = " + scope.viewFisherman.Status)

			scope.viewFisherman.OkToCall = ConvertStatus.convertOkToCall(scope.viewFisherman.OkToCallId);
			console.log("scope.viewFisherman.OkToCall = " + scope.viewFisherman.OkToCall);			
        };
		 
		scope.viewSelectedSubproject = function(subproject){
			console.log("Inside controllers.js, scope.viewSelectedSubproject");

            //console.log("subproject is next...");
			//console.dir(subproject);

            ////console.log("scope is next...");
			////console.dir(scope);
			if (scope.viewSubproject)
			{
				console.log("scope.viewSubproject exists...");
				delete scope.viewSubproject;
			}
			
			//console.log("subproject is next...");
			//console.dir(subproject);
			if ((typeof subproject !== 'undefined') && (subproject !== null))
			{
				// Need to verify that these two $rootScope variables are set.
				//$rootScope.DatastoreTablePrefix = scope.DatastoreTablePrefix;
				$rootScope.viewSubproject = scope.viewSubproject = angular.copy(subproject);
				
				//console.log("scope (in scope.viewSelectedSubproject) is next...");
				//console.dir(scope);			
				console.log("scope.viewSubproject (in scope.viewSelectedSubproject) is next...");
				//console.dir(scope.viewSubproject);
				console.log("scope.viewSubproject.ProjectName (in scope.viewSelectedSubproject) = " +  scope.viewSubproject.ProjectName);
				$rootScope.subprojectId = scope.viewSubproject.Id;
			}
        };

        //remove this editor from the users dropdown.
        scope.filterUsers = function()
        {
            console.log("filterusers starting with " + scope.users.length);

            var newusers = [];

            for (var a = 0; a < scope.users.length; a++) {
                var user = scope.users[a];
                var filterOut = false;

                for (var i = 0; i < scope.editors.length; i++) {
                    //is this user an editor already?  if so leave them off the list.
                    if(scope.editors[i].Id == user.Id)
                    {
                        filterOut = true;
                        break;
                    }
                }

                if(!filterOut)
                    newusers.push(user);


            };

            console.log("set a new group: " + newusers.length);
            scope.users = newusers.sort(orderUserByAlpha);

        }

        scope.select2Options = {
            allowClear:true
        };

        scope.selectedUser = null;

        scope.addEditor = function(){
            console.log("Add Editor.");
            for (var i = 0; i < scope.users.length; i++) {
                var user = scope.users[i];

                if(user.Id == scope.selectedUser)
                {
                    scope.editors.push(user);
                    scope.users.splice(i,1);
                    scope.selectedUser = null;
                    break;
                }
            };
        };

        scope.removeEditor = function(index)
        {
            scope.users.push(scope.editors.splice(index,1)[0]);
            scope.users.sort(orderUserByAlpha);
        };

        scope.saveEditors = function()
        {
            scope.saveResults = {};
            ProjectService.saveEditors(scope.currentUserId, scope.project.Id, scope.editors, scope.saveResults);
        };
		 	  
		scope.gotoSubprojectsTop = function (){
			// set the location.hash to the id of
			// the element you wish to scroll to.
			console.log("Inside projectDatasetsController, gotoSubprojectsTop...");
			
			// Have angular get the hash for this location (), and capture the result.
			var old = $location.hash();
			//console.log("Got old...");

			// Now have angular do the hash for the real location.
			if (scope.subprojectType === "CRPP")
			{
				$location.hash('spTop');
				console.log("Found spTop");
			}
			else if (scope.subprojectType === "Habitat")
			{
				$location.hash('spHTop');
				console.log("Found spHTop");
			}
			
			// call $anchorScroll() and go to that location.
			$anchorScroll();
			//console.log("Scrolled...");
			
			// Now set the location.hash back to the "old" location; this way, angular will not "notice" the routing change.
			$location.hash(old);
			//console.log("Set hash back to old...");
		};
		
		scope.gotoHabitatItemsTop = function (){
			// set the location.hash to the id of
			// the element you wish to scroll to.
			console.log("Inside projectDatasetsController, gotoHabitatItemsTop...");
			
			// Have angular get the hash for this location (), and capture the result.
			var old = $location.hash();
			
			// Now have angular do the hash for the real location.
			//$location.hash('top');
			$location.hash('hiTop');
			
			// call $anchorScroll() and go to that location.
			$anchorScroll();
			
			// Now set the location.hash back to the "old" location; this way, angular will not "notice" the routing change.
			$location.hash(old);
		};
		 
		scope.gotoCorrespondenceEventsTop = function (){
			// set the location.hash to the id of
			// the element you wish to scroll to.
			console.log("Inside projectDatasetsController, gotoCorrespondenceEventsTop...");
			
			// Have angular get the hash for this location (), and capture the result.
			var old = $location.hash();
			
			// Now have angular do the hash for the real location.
			//$location.hash('top');
			$location.hash('ceTop');
			
			// call $anchorScroll() and go to that location.
			$anchorScroll();
			
			// Now set the location.hash back to the "old" location; this way, angular will not "notice" the routing change.
			$location.hash(old);
		};
		
		/*scope.clearSubprojectFilters = function(){
			scope.gridOptionsFilter = null;
		};
		*/
        scope.cancel = function()
        {
           // scope.users =
        };

	}
];




