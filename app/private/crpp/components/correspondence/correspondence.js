//page for CRPP Correspondence.

var page_correspondence = ['$scope', '$timeout', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$uibModal', 'ServiceUtilities', 'ConvertStatus', '$rootScope', '$routeParams',
    function (scope, $timeout, SubprojectService, ProjectService, DatasetService, CommonService, UserService, $modal,
        ServiceUtilities, ConvertStatus, $rootScope, $routeParams) {
        //console.log("Inside tab correspondence controller...");

        scope.dataset = DatasetService.getDataset($routeParams.Id);

        scope.metafields = CommonService.getMetadataProperties(METADATA_ENTITY_CORRESPONDENCE);
        scope.metafields.$promise.then(function () { 
            //console.dir(scope.metafields);
            scope.metafields.forEach(function (field) { 
                field.PossibleValues = getParsedMetadataValues(field.PossibleValues);
            });
            
        });

        scope.getMetafield = function (in_name) { 
            if (!in_name)
                return null;

            var field = getByName(scope.metafields, in_name);
            if (!field)
                return null;

            return field.PossibleValues;
        };

        scope.dataset.$promise.then(function () {
            scope.project = ProjectService.getProject(scope.dataset.ProjectId);

            scope.project.$promise.then(function () {

                var ag_grid_div = document.querySelector('#crpp-correspondence-grid');    //get the container id...
                //console.dir(ag_grid_div);
                scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.corrAgGridOptions); //bind the grid to it.
                scope.corrAgGridOptions.api.showLoadingOverlay(); //show loading...

                scope.subprojectList = SubprojectService.getSubprojects();

                //if user can edit, unhide the edit links
                if ($rootScope.Profile.canEdit(scope.project)) {
                    scope.corrAgGridOptions.columnApi.setColumnVisible("EditLinksMaster", true);
                    scope.corrDetailGridOptions.columnDefs.unshift({ colId: 'EditLinksDetail', cellRenderer: EditDetailLinksTemplate, width: 110, menuTabs: [] }); //add this column to the front of the detail grid cols
                }

                scope.subprojectList.$promise.then( function () {
                    scope.corrAgGridOptions.api.setRowData(scope.subprojectList);
                    scope.refreshSubprojectLists();
                });
            });
        });

       
        //this is for the crpp/subproject correspondence tab below - might can move this all out sometime...
        var otherAgencyTemplate = function (params) {
            if (params.node.data.Agency !== null || params.node.data.OtherAgency !== null) {
                return '<span>' + params.node.data.Agency + '</span>'
                    + ((params.node.data.OtherAgency !== null) ? ('<span> (' + params.node.data.OtherAgency + ')</span>') : ''); //ternery: if otheragency then show it
            }
        };

        var EventCount = function (params) {
            if (params.node.data.CorrespondenceEvents === undefined || params.node.data.CorrespondenceEvents === null)
                return '0';

            return '' + params.node.data.CorrespondenceEvents.length;
        };

        var EditMasterLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.editCrppSubproject(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeCrppSubproject(param.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode("|"));

            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Event';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openCorrespondenceEventForm(param.data, {});
            });
            div.appendChild(addBtn);

            return div;
            
        };


        var FileListCellTemplate = function (params) {
            var list = '<div class="event-file-list"><ul>';

            var file_links = getSubprojectFilesArrayAsLinks(scope.project.Id, params.node.data.SubprojectId, params.node.data.EventFiles);

            file_links.forEach(function (link) {
                list += '<li>' + link + '</li>';
            });

            list += '</ul></div>';

            return list;
        };


        //this template gives the Edit|Delete|Add for the detail.
        var EditDetailLinksTemplate = function (detailparam) {
            var subproject = getById(scope.subprojectList, detailparam.data.SubprojectId);

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
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
            
        };


        //grid columns for crpp correspondence tab (master/subprojects)
        scope.corrAgColumnDefs = [  //in order the columns will display, by the way...
            { colId: 'EditLinksMaster', width: 150, cellRenderer: EditMasterLinksTemplate, menuTabs: [], hide: true },
            {
                headerName: 'ID',
                field: 'Id',
                width: 80,
                cellRenderer: 'agGroupCellRenderer',
                cellRendererParams: { suppressCount: true },
                menuTabs: ['filterMenuTab'],
                filter: 'number'
            },
            {
                field: 'EffDt',
                headerName: 'Updated',
                width: 120,
                valueGetter: function (params) { return moment(params.node.data.EffDt) }, //date filter needs js date object			
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.EffDt);
                },
                sort: 'desc',
                filter: 'date',
                menuTabs: ['filterMenuTab'],
            },
            {
                headerName: 'Events', width: 60,
                cellRenderer: EventCount,
                valueGetter: function (params) {
                    return (params.data.CorrespondenceEvents !== undefined && params.data.CorrespondenceEvents.length > 0) ? params.data.CorrespondenceEvents.length : 0;
                },
                menuTabs: [],
            },
            { field: 'ProjectName', headerName: 'Name', width: 275, menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'ProjectLead', headerName: 'Project Lead', width: 150, menuTabs: ['filterMenuTab'], },
            { field: 'Closed', headerName: 'Additional Action?', width: 80, menuTabs: ['filterMenuTab'], },
            {
                //note: white-space here causes word-wrap
                field: 'Comments', headerName: 'Comments', width: 300, cellStyle: { 'white-space': 'normal' }, menuTabs: ['filterMenuTab'], filter: 'text'
            },
            { field: 'TrackingNumber', headerName: 'Tracking #', width: 100, menuTabs: ['filterMenuTab'], },
            { field: 'Agency', headerName: 'Agency', cellRenderer: otherAgencyTemplate, width: 150, menuTabs: ['filterMenuTab'], },
            //{ field: 'County', headerName: 'County', width: 150, menuTabs: ['filterMenuTab'], },
            { field: 'strCounties', headerName: 'County', width: 150, menuTabs: ['filterMenuTab'], },
            { field: 'ProjectProponent', headerName: 'Project Proponent', width: 150, menuTabs: ['filterMenuTab'], },

        ];

        //details for the correspondence
        var detailColumnDefs = [
            //{ colId: 'EditLinksDetail', headerName: '', width: 100, cellRenderer: EditDetailLinksTemplate, menuTabs: [], },
            {
                headerName: 'Notice Date',
                field: 'CorrespondenceDate',
                width: 120,
                cellClass: 'event-record-cell',
                valueGetter: function (params) { return moment(params.node.data.CorrespondenceDate) }, //date filter needs js date object			
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.CorrespondenceDate);
                },
                sort: 'desc',
                filter: 'date',
                menuTabs: ['filterMenuTab'],
            },
            { headerName: 'Notice Type', field: 'CorrespondenceType', cellClass: 'event-record-cell', width: 150, menuTabs: ['filterMenuTab'], },
            { headerName: 'Type of Response', field: 'ResponseType', cellClass: 'event-record-cell', width: 150, menuTabs: ['filterMenuTab'], },
            { headerName: 'Days to Respond', field: 'NumberOfDays', cellClass: 'event-record-cell', width: 100, menuTabs: [], },

            {
                field: 'ResponseDate',
                headerName: 'Date of Response',
                valueGetter: function (params) { return moment(params.node.data.ResponseDate) }, //date filter needs js date object			
                width: 120,
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.ResponseDate);
                },
                filter: 'date',
                menuTabs: ['filterMenuTab'],
            },
            { headerName: 'Technician', field: 'StaffMember', cellClass: 'event-record-cell', width: 150, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'Comments', field: 'EventComments', cellClass: 'event-record-cell', width: 300, cellStyle: {
                    'white-space': 'normal'
                },
                menuTabs: ['filterMenuTab'], filter: 'text'
            },
            { headerName: 'Documents', field: 'EventFiles', width: 300, cellRenderer: FileListCellTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },

            //{ headerName: 'EventFiles', field: 'EventFiles', cellClass: 'event-record-cell', cellRenderer: FileListCellTemplate },
        ];

        //detail grid options correspondence events
        scope.corrDetailGridOptions = {
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            //rowSelection: 'single',
            //onSelectionChanged: function (params) {
            //    console.log("selection changed!");
            //scope.corrAgGridOptions.selectedItems = scope.corrAgGridOptions.api.getSelectedRows();
            //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            //},
            //onFilterModified: function () {
            //    scope.corrAgGridOptions.api.deselectAll();
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
                var file_height = 25 * (getFilesArrayAsList(params.data.EventFiles).length); //count up the number of file lines we will have.
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
            defaultColDef: {
                sortable: true,
                resizable: true,
            },
        };



        scope.corrAgGridOptions = {

            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: scope.corrDetailGridOptions,
                getDetailRowData: function (params) {
                    params.successCallback(params.data.CorrespondenceEvents);
                },
            },

            animateRows: true,
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            showToolPanel: false,
            columnDefs: scope.corrAgColumnDefs,
            rowData: null,
            //filterParams: { apply: true }, //enable option: doesn't do the filter unless you click apply
            //debug: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed fired!");
                /*
                var rows = scope.corrAgGridOptions.api.getSelectedRows();
                if (Array.isArray(rows) && rows[0] != null)
                {
                    console.log("rows:");
                    console.dir(rows);
                    if (!Array.isArray(rows[0]) && !rows[0].hasOwnProperty('SubprojectId')) //only change the selection if they clicked a header row.
                    {
                        scope.corrAgGridOptions.selectedItems = scope.corrAgGridOptions.api.getSelectedRows();
                        //scope.corrAgGridOptions.api.redrawRows();
                        //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                        console.log("selected a header row so selection actually changed");
                        scope.viewSubproject = rows[0];
                        console.dir(scope.viewSubproject);
                    }
                }
                */
            },
            //onFilterModified: function () {
            //    scope.corrAgGridOptions.api.deselectAll();
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
                scope.corrAgGridOptions.api.collapseAll();
                row.node.setSelected(true);
                row.node.setExpanded(true);
            },
            onRowClicked: function (row) {
                row.node.setSelected(true);
            },
            defaultColDef: {
                sortable: true,
                resizable: true,
            },
        };



        //if you are creating a new one for the project, the ce_row should be empty {}
        // if you are editing an existing one, send in the project and the ce_row.
        scope.openCorrespondenceEventForm = function (subproject, ce_row) {
            //console.log("Inside openCorrespondenceEventForm...")

            $rootScope.viewSubproject = scope.viewSubproject = subproject;
            //console.log("ok subproject set: ");
            //console.dir(scope.viewSubproject);

            scope.ce_row = ce_row;

            var modalInstance = $modal.open({
                templateUrl: 'app/private/crpp/components/correspondence/templates/modal-new-correspondenceEvent.html',
                controller: 'ModalAddCorrespondenceEventCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        scope.removeCrppSubproject = function (subproject) {
            //console.log("Inside removeViewSubproject, scope is next...");

            if (!subproject)
                return;

            scope.viewSubproject = subproject;

            if (scope.viewSubproject.CorrespondenceEvents.length > 0) {
                alert("This project has associated correspondence events.  Those must be deleted first.");
            } else {
                scope.verifyAction = "Delete";
                scope.verifyingCaller = "CrppSubproject";
                //console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " + scope.viewSubproject.Id);
                var modalInstance = $modal.open({
                    templateUrl: 'app/core/common/components/modals/templates/modal-verifyAction.html',
                    controller: 'ModalVerifyActionCtrl',
                    scope: scope, //very important to pass the scope along...
                });
            }
        };

        scope.postRemoveSubprojectUpdateGrid = function () {
            //the scope.subproject is the one we removed.
            console.log("ok - we removed one so update the grid...");

            scope.subprojectList.forEach(function (item, index) {
                if (item.Id === scope.viewSubproject.Id) {
                    scope.subprojectList.splice(index, 1);
                    //console.log("ok we removed :" + index);
                    //console.dir(scope.subprojectList[index]);
                    scope.corrAgGridOptions.api.setRowData(scope.subprojectList);
                    //scope.corrAgGridOptions.api.redrawRows();
                    //console.log("done reloading grid.");
                }
            });
        };

        //called by the modal once the correspondence event is successfully saved.
        scope.postEditCorrespondenceEventUpdateGrid = function (edited_event) {
            console.log("editCrppCorrespondenceEvent..." + edited_event.Id + " for subproject " + edited_event.SubprojectId);

            //edit our correspondence item and then reload the grid.
            scope.subprojectList.forEach(function (item, index) {
                if (item.Id === edited_event.SubprojectId) {
                    item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort. - this was already updated in the be
                    item.CorrespondenceEvents.forEach(function (event_item, event_item_index) {
                        if (event_item.Id === edited_event.Id) {
                            angular.extend(event_item, edited_event); //replace the data for that item
                            //console.log("OK!! we edited that correspondence event");
                        }
                    });
                }
            });

            scope.corrAgGridOptions.api.setRowData(scope.subprojectList);

            //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
            var the_node = scope.expandSubProjectById(edited_event.SubprojectId);
            if (the_node != null)
                scope.corrAgGridOptions.api.ensureNodeVisible(the_node);

            console.log("done reloading grid after removing item.");

        };

        //called by the modal once a correspondence event (edit) is saved
        scope.postAddCorrespondenceEventUpdateGrid = function (new_event) {
            //console.dir(new_event);
            console.log("saving correspondence event for " + new_event.SubprojectId);

            var subproject = getById(scope.subprojectList, new_event.SubprojectId);

            if (subproject === undefined || subproject == null) { //TODO: the case where they create items before the proejct is saved?
                console.log("no subproject...");
            } else {
                scope.subprojectList.forEach(function (item, index) {
                    if (item.Id === subproject.Id) {
                        item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort - this was already updated in the be
                        item.CorrespondenceEvents.push(new_event);
                        //console.log("Added event " + new_event.Id + " to " + subproject.Id);
                    }
                });
                scope.corrAgGridOptions.api.setRowData(scope.subprojectList);

                //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                var the_node = scope.expandSubProjectById(subproject.Id);
                if (the_node != null)
                    scope.corrAgGridOptions.api.ensureNodeVisible(the_node);

                console.log("done reloading grid after removing item.");
            }
        };

        //returns the (last) node or null if none found.
        scope.expandSubProjectById = function (id_in) {
            var the_node = null;
            scope.corrAgGridOptions.api.forEachNode(function (node) {
                if (node.data.Id === id_in) {
                    //console.log("Expanding! " + id_in);
                    node.setExpanded(true);
                    the_node = node;
                }
            });
            return the_node;
        };

        //removes the correspondence event and then updates the grid
        scope.removeCrppCorrespondenceEvent = function (subproject, event) {
            console.log("removeCrppCorrespondenceEvent..." + event.Id + " for subproject " + subproject.Id);

            if (confirm('Are you sure that you want to delete this Correspondence Event?')) {
                var promise = SubprojectService.removeCorrespondenceEvent(scope.project.Id, subproject.Id, event.Id, scope.DatastoreTablePrefix);

                promise.$promise.then(function () {
                    //remove from our subprojectList and then reload the grid.
                    scope.subprojectList.forEach(function (item, index) {
                        if (item.Id === subproject.Id) {
                            item.CorrespondenceEvents.forEach(function (event_item, event_item_index) {
                                if (event_item.Id === event.Id) {
                                    item.CorrespondenceEvents.splice(event_item_index, 1);
                                    //console.log("OK!! we removed that correspondence event");
                                }
                            });
                        }
                    });
                    scope.corrAgGridOptions.api.setRowData(scope.subprojectList);

                    //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                    var the_node = scope.expandSubProjectById(subproject.Id);
                    if (the_node != null)
                        scope.corrAgGridOptions.api.ensureNodeVisible(the_node);

                    console.log("done reloading grid after removing item.");
                });
            }
        };

        //fired after a user saves a new or edited project.
        // we update the item in the main subproject array and then refresh the grid.
        scope.postSaveSubprojectUpdateGrid = function (the_promise) {
            //console.log("ok - we saved so update the grid...");
            var total = scope.subprojectList.length;
            var count = 0;
            var updated = false;
            scope.subprojectList.forEach(function (item, index) {
                if (item.Id === the_promise.Id) {
                    updated = true;
                    //console.log("ok we found a match! -- updating! before:");
                    //console.dir(scope.subprojectList[index]);

                    if (the_promise.CorrespondenceEvents !== undefined)
                        delete the_promise.CorrespondenceEvents; //remove this before the copy.

                    angular.extend(scope.subprojectList[index], the_promise); //replace the data for that item
                    //console.log("ok we found a match! -- updating! after:");
                    //console.dir(scope.subprojectList[index]);
                    scope.corrAgGridOptions.api.redrawRows();
                    //console.log("done reloading grid.");
                }
                count++;
                if (count == total && updated == false) //if we get all done and we never found it, lets add it to the end.
                {
                    //console.log("ok we found never a match! -- adding!");
                    the_promise.CorrespondenceEvents = [];
                    the_promise.Files = [];
                    scope.subprojectList.push(the_promise); //add that item
                    scope.corrAgGridOptions.api.setRowData([]);
                    scope.corrAgGridOptions.api.setRowData(scope.subprojectList);

                    //console.log("done reloading grid.");
                }
            });
			
            console.log("updated the list and the grid... now refreshing the CRPP lists");
            scope.refreshSubprojectLists(); //counties, etc.
        };

        //opens create crpp subproject modal
        scope.createCrppSubproject = function () {
            scope.viewSubproject = null;
            scope.createNewSubproject = true;
            //scope.subprojectList = null;
            scope.subprojectOptions = null;
            //console.log("scope.createNewSubproject = " + scope.createNewSubproject);
            var modalInstance = $modal.open({
                templateUrl: 'app/private/crpp/components/correspondence/templates/modal-create-subproject.html',
                controller: 'ModalCreateSubprojectCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };
		
        //refresh all of the project match lists
        scope.refreshSubprojectLists = function () {
			console.log("Inside tab-correspondence.js, scope.refreshSubprojectList...");
			
            // Call the functions that will build the list of funders, and list of files related to the project.
            // We add the items from these lists to the subproject -- as the data comes in.
            //scope.project.SubprojectFileList = SubprojectService.getSubprojectFiles(scope.projectId); //TODO: we already have this as scope.project.SubprojectFiles once the files load in project-detail.js
            scope.project.CountyList = ProjectService.getProjectCounties(scope.project.Id);

            //this one we can start right away since project locations are loaded with the project.
            //scope.matchLocationsToSubprojects();

            //do each match as the list finishes loading...
            //scope.project.SubprojectFileList.$promise.then(function () {
                //console.log(" -- ok done loading now matching SubprojectFileList for " + scope.project.SubprojectFileList.length);
                //scope.matchFilesToSubproject();
            //});

            scope.project.CountyList.$promise.then(function () {
                //console.log(" -- ok done loading now matching CollaboratorList for " + scope.project.CollaboratorList.length);
                scope.matchCountyToSubproject();
            });
        };

        scope.editCrppSubproject = function (subproject) {
            //console.log("editCrppSubproject...");

            $rootScope.viewSubproject = scope.viewSubproject = subproject;

            var modalInstance = $modal.open({
                    templateUrl: 'app/private/crpp/components/correspondence/templates/modal-create-subproject.html',
                    controller: 'ModalCreateSubprojectCtrl',
                    scope: scope, //very important to pass the scope along...
            });
        };
		
        scope.matchCountyToSubproject = function () {
            //console.log("Inside controllers.js, scope.matchCountyToSubproject...");
            //console.dir(scope.project.CountyList);

            var strCounties = "";
            angular.forEach(scope.subprojectList, function (subproject) {
                strCounties = "";
                angular.forEach(scope.project.CountyList, function (county) {
                    if (county.SubprojectId === subproject.Id) {
                        strCounties += county.Name + ";\n";
                    }
                });
                subproject.strCounties = strCounties;
            });
			//console.log("scope.subprojectList is next...");
			//console.dir(scope.subprojectList);
        };

        scope.redrawRows = function () {
            scope.corrAgGridOptions.api.setRowData([]);
            setTimeout(function () { scope.corrAgGridOptions.api.setRowData(scope.subprojectList); }, 4000);
        };

        scope.refreshCells = function () {
            scope.corrAgGridOptions.api.refreshCells();
        };

        scope.refreshMemory = function () {
            scope.corrAgGridOptions.api.refreshInMemoryRowModel('group');
        };
    }
];
