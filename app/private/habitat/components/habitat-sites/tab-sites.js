//this is a nested controller used on the project-details page to load
// the sites tab grid. It only appears for projects that are Habitat type projects.

//hab-sites-grid

var tab_sites = ['$scope', '$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
        console.log("Inside tab sites controller...");

//        console.log("I wonder what I have access to here?!");
//        console.dir(scope);


        scope.subprojectFileList = null;
        scope.funderList = null;
        scope.collaboratorList = null;

        var ItemCount = function (params) {
            if (params.node.data.HabitatItems === undefined || params.node.data.HabitatItems === null)
                return '0';

            return '' + params.node.data.HabitatItems.length;
        };

        var EditMasterLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.editHabitatSubproject(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeHabitatSubproject(param.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode("|"));

            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openHabitatItemForm(param.data, {});
            });
            div.appendChild(addBtn);

            return div;
        };


        var FileListCellTemplate = function (params) {
            var files = scope.getFilesArrayAsList(params.node.data.ItemFiles); //notsure
            var list = '<div class="event-file-list"><ul>';

            files.forEach(function (file) {
                list += '<li>' + file.Name + '</li>';
            });

            list += '</ul></div>';

            return list;
        };


        //this template gives the Edit|Delete|Add for the detail.
        var EditDetailLinksTemplate = function (detailparam) {
            var subproject = scope.getSubprojectById(scope.subprojectList, detailparam.data.SubprojectId);

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                console.log("detail param: ");
                console.dir(detailparam);
                scope.openHabitatItemForm(subproject, detailparam.data); //parent subproject, detail line.
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeHabitatFileItem(subproject, detailparam.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode("|"));

            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openHabitatItemForm(subproject, {});
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


        //grid columns for sites tab (master/subprojects)
        scope.agColumnDefs = [  //in order the columns will display, by the way...
            {
                headerName: '', width: 100, cellRenderer: EditMasterLinksTemplate
            },
            {
                field: 'ProjectName', headerName: 'Name', width: 325, cellRenderer: 'group',
                cellRendererParams: { suppressCount: true } },
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
                headerName: 'Items', width: 80,
                cellRenderer: ItemCount,
                valueGetter: function (params) {
                    return (params.data.HabitatItems !== undefined && params.data.HabitatItems.length > 0) ? params.data.HabitatItems.length : 0;
                },
            },
            {
                field: 'ProjectStartDate', headerName: 'Start Date', width: 150,
                valueFormatter: function (params) {
                    if (params.node.data.ProjectStartDate !== undefined && params.node.data.ProjectStartDate !== null)
                        return moment(params.node.data.ProjectStartDate).format('L');
                },
            },
            {
                field: 'ProjectEndDate', headerName: 'End Date', width: 150,
                valueFormatter: function (params) {
                    if (params.node.data.ProjectEndDate !== undefined && params.node.data.ProjectEndDate !== null)
                        return moment(params.node.data.ProjectEndDate).format('L');
                },
            },
        ];

        //details for the correspondence
        var detailColumnDefs = [
            {
                headerName: '', width: 100, cellRenderer: EditDetailLinksTemplate
            },
            
            { headerName: 'Item Type', field: 'ItemType', cellClass: 'item-record-cell', width: 100 },
            { headerName: 'Item Name', field: 'ItemName', cellClass: 'item-record-cell', width: 150 },
            { headerName: 'Documents', field: 'ItemFiles', width: 300, cellRenderer: FileListCellTemplate },
            { headerName: 'External Links', field: 'ExternalLinks', cellClass: 'item-record-cell', width: 250 },
            {
                field: 'EffDt',
                headerName: 'Updated',
                width: 150,
                valueFormatter: function (params) {
                    if (params.node.data.EffDt !== undefined && params.node.data.EffDt !== null)
                        return moment(params.node.data.EffDt).format('L');
                },
            },
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
            //onGridReady: function (params) {
                //setTimeout(function () { params.api.sizeColumnsToFit(); }, 0);
            //},
            /*
            getRowHeight: function (params) {
                var comment_length = (params.data.EventComments === null) ? 1 : params.data.EventComments.length;
                var comment_height = 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
                var file_height = 25 * (getEventFilesArray(params.data.EventFiles).length); //count up the number of file lines we will have.
                return (comment_height > file_height) ? comment_height : file_height;
            },
            */
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
                    params.successCallback(params.data.HabitatItems);
                },
            },

            animateRows: true,
            enableSorting: true,
            enableFilter: true, //turning it off because: https://github.com/ag-grid/ag-grid/issues/1324
            enableColResize: true,
            showToolPanel: false,
            columnDefs: scope.agColumnDefs,
            rowData: null,
            //filterParams: { apply: true }, //enable option: doesn't do the filter unless you click apply
            //debug: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed fired!");
                
                var rows = scope.agGridOptions.api.getSelectedRows();

                if (Array.isArray(rows) && rows[0] != null)
                {
                    console.log("rows:");
                    console.dir(rows);

                    /*
                    if (!Array.isArray(rows[0]) && !rows[0].hasOwnProperty('SubprojectId')) //only change the selection if they clicked a header row.
                    {
                        scope.agGridOptions.selectedItems = scope.agGridOptions.api.getSelectedRows();
                        //scope.agGridOptions.api.redrawRows();
                        //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
                        console.log("selected a header row so selection actually changed");
                        scope.viewSubproject = rows[0];
                        console.dir(scope.viewSubproject);
                    }*/
                }
                
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
            /*
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
            */
            /*
            getNodeChildDetails: function (record) {
                //console.dir(record);
                if (record.HabitatItems) {
                    //console.log("yep we have events!");
                    return {
                        group: true,
                        // the key is used by the default group cellRenderer
                        key: record.CorrespondenceDate,
                        // provide ag-Grid with the children of this group
                        parentData: record,
                        children: [record.HabitatItems],
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


        scope.$parent.$watch('datasets', function () {
            console.log("Inside TAB SITES watch datasets... --------------------------");

            console.log("parent datasets");
            console.dir(scope.$parent.datasets);
            console.log("our datasets");
            console.dir(scope.datasets);

            if (scope.datasets === undefined || scope.datasets.length === 0)
                return;

            console.log("OK TAB SITES .  The datasets are loaded...");

            scope.datasets = scope.$parent.datasets; //but i dont' want to do this.'

            //load ag-grid but only once.
            if (typeof scope.ag_grid === 'undefined') {
                var ag_grid_div = document.querySelector('#hab-sites-grid');    //get the container id...
                //console.dir(ag_grid_div);
                scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.agGridOptions); //bind the grid to it.
                scope.agGridOptions.api.showLoadingOverlay(); //show loading...
            }

            for (var i = 0; i < scope.datasets.length; i++) { //look through the datasets for one of ours.

                //TODO: check to see if we are a habitat type project ---------------------------<<<<<<<<<<<<<<<<<<<<<< TODO
                console.log("Woohoo! are we habitat project?");
                console.dir(scope.project);

                if ((scope.datasets[i].Datastore.TablePrefix === "Metrics") ||
                    (scope.datasets[i].Datastore.TablePrefix === "Benthic") ||
                    (scope.datasets[i].Datastore.TablePrefix === "Drift")
                ) {
                    console.log("Adding Sites to tab bar...");
                    scope.$parent.ShowHabitat = true; //need to update parent scope for the map to show.
                    
                    scope.subprojectList = SubprojectService.getProjectSubprojects(scope.datasets[i].ProjectId); //the habitat subprojects
                    console.log("Fetching Habitat subproject...");

                    //kick off loading of other habitat file things
                    // We call the functions that will build the list of funders, and list of files related to the project.
                    // We add the items from these lists to the project later, after we have the data.
                    scope.subprojectFileList = SubprojectService.getSubprojectFiles(scope.datasets[i].ProjectId);
                    scope.funderList = ProjectService.getProjectFunders(scope.datasets[i].ProjectId);
                    scope.collaboratorList = ProjectService.getProjectCollaborators(scope.datasets[i].ProjectId);

                    scope.DatastoreTablePrefix = $rootScope.DatastoreTablePrefix = scope.datasets[i].Datastore.TablePrefix;

                    /* not sure if we need this. was condition of "if scope.subprojectList.length === 0"

                                    if (scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById')) {
                                        //scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
                                        // Note:  If we sent an empty list, it pulls all the locations.
                                        // If we supply an Id that we know does not exist (0), we get no locations, which is what we expect.
                                        scope.map.locationLayer.showLocationsById(0); //bump and reload the locations.
                                    }
                    */


                    var watcher = scope.$watch('subprojectList.length', function () {
                        if (scope.subprojectList === undefined || scope.subprojectList == null || scope.subprojectList.length === 0)
                            return;

                        console.log("our subproject list is back -- build the grid. we have " + scope.subprojectList.length + " of them.");
                        scope.agGridOptions.api.setRowData(scope.subprojectList);

                        //maybe we can clean these up?
                        scope.cleanGateKeeper("Sdone");
                        scope.FileLocationSubprojectFundersWatchVariable += "Sdone";

                        watcher();
                    });

                }
            }

        }, true);



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

            if (scope.viewSubproject.HabitatItems.length > 0) {
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
            scope.subprojectList.forEach(function (item, index) {
                if (item.Id === edited_event.SubprojectId) {
                    item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort. - this was already updated in the be
                    item.HabitatItems.forEach(function (event_item, event_item_index) {
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

        //called by the modal once a correspondence event is saved
        scope.postAddCorrespondenceEventUpdateGrid = function (new_event) {
            //console.dir(new_event);
            console.log("saving correspondence event for " + new_event.SubprojectId);

            var subproject = scope.getSubprojectById(scope.subprojectList, new_event.SubprojectId);

            if (subproject === undefined || subproject == null) { //TODO: the case where they create items before the proejct is saved?
                console.log("no subproject... hmm ... i guess we should reload everything...");
            } else {
                scope.subprojectList.forEach(function (item, index) {
                    if (item.Id === subproject.Id) {
                        item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort - this was already updated in the be
                        item.HabitatItems.push(new_event);
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
            console.log("removeCrppCorrespondenceEvent..." + event.Id + " for subproject " + subproject.Id);

            if (confirm('Are you sure that you want to delete this Correspondence Event?')) {
                var promise = SubprojectService.removeCorrespondenceEvent(scope.project.Id, subproject.Id, event.Id, scope.DatastoreTablePrefix);

                promise.$promise.then(function () {
                    //remove from our subprojectList and then reload the grid.
                    scope.subprojectList.forEach(function (item, index) {
                        if (item.Id === subproject.Id) {
                            item.HabitatItems.forEach(function (event_item, event_item_index) {
                                if (event_item.Id === event.Id) {
                                    item.HabitatItems.splice(event_item_index, 1);
                                    console.log("OK!! we removed that correspondence event");
                                }
                            });
                        }
                    });
                    scope.agGridOptions.api.setRowData(scope.subprojectList);

                    //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                    var the_node = scope.expandSubProjectById(subproject.Id);
                    if (the_node != null)
                        scope.agGridOptions.api.ensureNodeVisible(the_node);

                    console.log("done reloading grid after removing item.");
                });
            }
        };



        scope.removeHabitatSubproject = function (subproject) {
            console.log("Inside removeHabitatSubproject, scope is next...");

            if (!subproject)
                return;

            scope.viewSubproject = subproject;

            console.log("scope.projectId = " + scope.projectId);
            if (scope.subprojectType === "Habitat") {
                console.log("Habitate-related...")
                if (scope.viewSubproject.HabitatItems.length > 0) {
                    alert("This project has associated Habitat items.  Those must be deleted first.");
                }
                else {
                    scope.verifyAction = "Delete";
                    scope.verifyingCaller = "HabSubproject";
                    console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " + scope.viewSubproject.Id);
                    var modalInstance = $modal.open({
                        templateUrl: 'app/core/common/components/modals/templates/modal-verifyAction.html',
                        controller: 'ModalVerifyActionCtrl',
                        scope: scope, //very important to pass the scope along...
                    });
                }
            }
        };

        scope.createHabSubproject = function () {
            scope.viewSubproject = null;
            scope.createNewSubproject = true;
            //scope.subprojectList = null;
            scope.subprojectOptions = null;
            console.log("scope.createNewSubproject = " + scope.createNewSubproject);
            var modalInstance = $modal.open({
                templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-create-habSubproject.html',
                controller: 'ModalCreateHabSubprojectCtrl',
                scope: scope, //very important to pass the scope along...
            });
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

                    if (the_promise.HabitatItems !== undefined)
                        delete the_promise.HabitatItems; //remove this before the copy.

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
                    the_promise.HabitatItems = [];
                    the_promise.Files = [];
                    scope.subprojectList.push(the_promise); //add that item
                    scope.agGridOptions.api.setRowData([]);
                    scope.agGridOptions.api.setRowData(scope.subprojectList);

                    console.log("done reloading grid.");
                }
            });
        };


        scope.viewSelectedSubproject = function (subproject) {
            console.log("Inside controllers.js, scope.viewSelectedSubproject");

            //console.log("subproject is next...");
            //console.dir(subproject);

            ////console.log("scope is next...");
            ////console.dir(scope);
            if (scope.viewSubproject) {
                console.log("scope.viewSubproject exists...");
                delete scope.viewSubproject;
            }

            //console.log("subproject is next...");
            //console.dir(subproject);
            if ((typeof subproject !== 'undefined') && (subproject !== null)) {
                // Need to verify that these two $rootScope variables are set.
                //$rootScope.DatastoreTablePrefix = scope.DatastoreTablePrefix;
                $rootScope.viewSubproject = scope.viewSubproject = angular.copy(subproject);

                //console.log("scope (in scope.viewSelectedSubproject) is next...");
                //console.dir(scope);			
                console.log("scope.viewSubproject (in scope.viewSelectedSubproject) is next...");
                //console.dir(scope.viewSubproject);
                console.log("scope.viewSubproject.ProjectName (in scope.viewSelectedSubproject) = " + scope.viewSubproject.ProjectName);
                $rootScope.subprojectId = scope.viewSubproject.Id;
            }
        };


        scope.addSubproject = function () {
            console.log("Inside controllers.addSubproject.");
            //console.log("scope is next...");
            //console.dir(scope);
            console.log("scope.selectedSubproject is next...");
            console.dir(scope.selectedSubproject);

            if (!scope.selectedSubproject || scope.selectedSubproject === null || getMatchingByField(scope.project.CrppSubProjects, scope.selectedSubproject, 'Id').length > 0)
                return;

            var theSubproject = getMatchingByField(scope.correspondenceProjectList, scope.selectedSubproject, 'Id');

            var promise = SubprojectService.saveSubproject(scope.project.Id, theSubproject[0]);

            promise.$promise.then(function () {
                scope.reloadProject();
            });
        };


        scope.openProjectEditor = function () {
            scope.row = scope.project; //
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-project.html',
                controller: 'ModalProjectEditorCtrl',
                scope: scope, //very important to pass the scope along...

            });
        };

        scope.editHabitatSubproject = function (subproject) {

            console.log("Inside editHabitatSubproject...");

            scope.viewSubproject = subproject; //set this var for the modal controller.

            var modalInstance = $modal.open({
                templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-create-habSubproject.html',
                controller: 'ModalCreateHabSubprojectCtrl',
                scope: scope, //very important to pass the scope along...
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


    }
];
