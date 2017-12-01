//this is a nested controller used on the project-details page to load
// the correspondence tab grid. It only appears for projects that are CRPP Correspondence.

//var METADATA_PROPERTY_PROGRAM = 23; //add this to your config.js


var tab_correspondence = ['$scope', '$timeout','$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, $timeout, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
        console.log("Inside tab correspondence controller...");

       
        //this is for the crpp/subproject correspondence tab below - might can move this all out sometime...
        var otherAgencyTemplate = function (params) {
            return '<span>' + params.node.data.Agency + '</span>'
                + ((params.node.data.OtherAgency) ? ('<span> (' + params.node.data.OtherAgency + ')</span>') : ''); //ternery: if otheragency then show it
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
            /* can't do angular stuff in here unless we enable it as an angular grid... let's see if we can do without...
            return '<div project-role="editor">' +
                        '<a ng-click="editViewSubproject();">Edit</a>|' +
                        '<a ng-click="removeViewSubproject();">Delete</div>|' + 
                        '<a ng-click="openCorrespondenceEventForm();">Add</div>' +
                '</div>';
                */
        };


        var FileListCellTemplate = function (params) {
            var list = '<div class="event-file-list"><ul>';

            var file_links = scope.getSubprojectFilesArrayAsLinks(scope.project.Id, params.node.data.SubprojectId, params.node.data.EventFiles);

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
        scope.corrAgColumnDefs = [  //in order the columns will display, by the way...
            {
                width: 140, cellRenderer: EditMasterLinksTemplate
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
                width: 120,
                valueFormatter: function (params) {
                    if (params.node.data.EffDt !== undefined && params.node.data.EffDt !== null)
                        return moment(params.node.data.EffDt).format('L');
                },
                sort: 'desc',
            },
            {
                headerName: 'Events', width: 60,
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
        scope.corrDetailGridOptions = {
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
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
                var file_height = 25 * (scope.getFilesArrayAsList(params.data.EventFiles).length); //count up the number of file lines we will have.
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



        scope.corrAgGridOptions = {

            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: scope.corrDetailGridOptions,
                getDetailRowData: function (params) {
                    params.successCallback(params.data.CorrespondenceEvents);
                },
            },

            animateRows: true,
            enableSorting: true,
            enableFilter: true, //turning it off because: https://github.com/ag-grid/ag-grid/issues/1324
            enableColResize: true,
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
        };

        //watch the project on the parent-detail page to load... once it does, check to see if we should show our tab
        var crpp_ds_watcher = scope.$parent.$watch('project', function () {
            console.log("Inside TAB CORRESPONDENCE watch project... --------------------------");

            if (typeof scope.project === 'undefined' || typeof scope.project.Id === 'undefined')
                return;

            console.log("OK TAB CORRESPONDNEC .  The project is loaded...");

            crpp_ds_watcher(); //turn off watcher

            if (scope.isCRPPProject(scope.project)) {

                console.log("Adding Correspondence to tab bar...");
                scope.ShowSubproject = true;

                $timeout(function () {

                    var ag_grid_div = document.querySelector('#crpp-correspondence-grid');    //get the container id...
                    //console.dir(ag_grid_div);
                    scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.corrAgGridOptions); //bind the grid to it.
                    scope.corrAgGridOptions.api.showLoadingOverlay(); //show loading...

                    scope.subprojectList = SubprojectService.getSubprojects();
                    console.log("Fetching CRPP subprojects...");

                    var watcher = scope.$watch('subprojectList.length', function () {
                        if (scope.subprojectList === undefined || scope.subprojectList == null || scope.subprojectList.length === 0)
                            return;

                        console.log("our crpp subproject list is back -- build the grid. we have " + scope.subprojectList.length + " of them.");
                        scope.corrAgGridOptions.api.setRowData(scope.subprojectList);

                        watcher();
                    });
                }, 0);

            } else {
                console.log(" we are NOT a crpp project so no Correspondence tab.");
            }

        },true);



        //if you are creating a new one for the project, the ce_row should be empty {}
        // if you are editing an existing one, send in the project and the ce_row.
        scope.openCorrespondenceEventForm = function (subproject, ce_row) {
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

        scope.removeCrppSubproject = function (subproject) {
            console.log("Inside removeViewSubproject, scope is next...");

            if (!subproject)
                return;

            scope.viewSubproject = subproject;

            if (scope.viewSubproject.CorrespondenceEvents.length > 0) {
                alert("This project has associated correspondence events.  Those must be deleted first.");
            } else {
                scope.verifyAction = "Delete";
                scope.verifyingCaller = "CrppSubproject";
                console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " + scope.viewSubproject.Id);
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
                    console.log("ok we removed :" + index);
                    console.dir(scope.subprojectList[index]);
                    scope.corrAgGridOptions.api.setRowData(scope.subprojectList);
                    //scope.corrAgGridOptions.api.redrawRows();
                    console.log("done reloading grid.");
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
                            console.log("OK!! we edited that correspondence event");
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
                console.log("no subproject... hmm ... i guess we should reload everything...");
            } else {
                scope.subprojectList.forEach(function (item, index) {
                    if (item.Id === subproject.Id) {
                        item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort - this was already updated in the be
                        item.CorrespondenceEvents.push(new_event);
                        console.log("Added event " + new_event.Id + " to " + subproject.Id);
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
                    console.log("Expanding! " + id_in);
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
                                    console.log("OK!! we removed that correspondence event");
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


        //opens create crpp subproject modal
        scope.createCrppSubproject = function () {
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


        //fired after a user saves a new or edited project.
        // we update the item in the main subproject array and then refresh the grid.
        scope.postSaveSubprojectUpdateGrid = function (the_promise) {
            console.log("ok - we saved so update the grid...");
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
                    console.log("ok we found a match! -- updating! after:");
                    console.dir(scope.subprojectList[index]);
                    scope.corrAgGridOptions.api.redrawRows();
                    console.log("done reloading grid.");
                }
                count++;
                if (count == total && updated == false) //if we get all done and we never found it, lets add it to the end.
                {
                    console.log("ok we found never a match! -- adding!");
                    the_promise.CorrespondenceEvents = [];
                    the_promise.Files = [];
                    scope.subprojectList.push(the_promise); //add that item
                    scope.corrAgGridOptions.api.setRowData([]);
                    scope.corrAgGridOptions.api.setRowData(scope.subprojectList);

                    console.log("done reloading grid.");
                }
            });
        };

        scope.editCrppSubproject = function (subproject) {
            console.log("editCrppSubproject...");

            scope.viewSubproject = subproject;

            var modalInstance = $modal.open({
                    templateUrl: 'app/private/crpp/components/crpp-contracts/templates/modal-create-subproject.html',
                    controller: 'ModalCreateSubprojectCtrl',
                    scope: scope, //very important to pass the scope along...
            });
        };

        scope.redrawRows = function () {
            scope.corrAgGridOptions.api.setRowData([]);
            setTimeout(function () { scope.corrAgGridOptions.api.setRowData(scope.subprojectList); }, 4000);


            console.log("redrawrows!");
        };

        scope.refreshCells = function () {
            scope.corrAgGridOptions.api.refreshCells();
            console.log("refreshcells!");
        };

        scope.refreshMemory = function () {
            scope.corrAgGridOptions.api.refreshInMemoryRowModel('group');
            console.log("redrawgroupmodel!");
        };

        //looks at the metadata setting to see if it is a crpp project
        scope.isCRPPProject = function(a_project)
        {
            return (a_project.MetadataValue[METADATA_PROPERTY_PROGRAM]) === "CRPP";
        }

    }
];
