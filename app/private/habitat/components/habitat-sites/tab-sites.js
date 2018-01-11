//this is a nested controller used on the project-details page to load
// the sites tab grid. It only appears for projects that are Habitat type projects.

//hab-sites-grid

var tab_sites = ['$scope', '$timeout','$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, $timeout, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
//        console.log("Inside tab sites controller...");

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

            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Item';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openHabitatItemForm(param.data, {});
            });
            div.appendChild(addBtn);

            return div;
        };


        var FileListCellTemplate = function (params) {
            var list = '<div class="event-file-list"><ul>';

            var file_links = scope.getSubprojectFilesArrayAsLinks(scope.project.Id, params.node.data.SubprojectId, params.node.data.ItemFiles);

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
                //console.log("detail param: ");
                //console.dir(detailparam);
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
        scope.sitesColumnDefs = [  //in order the columns will display, by the way...
            { colId: 'EditLinksMaster', width: 130, cellRenderer: EditMasterLinksTemplate, menuTabs: [], hide: true },
            {
                field: 'ProjectName', headerName: 'Name', width: 325, cellRenderer: 'group',
                cellRendererParams: { suppressCount: true },
                menuTabs: ['filterMenuTab'],
                filter: 'text'
            },
            {
                field: 'EffDt',
                headerName: 'Updated',
                width: 130,
                valueFormatter: function (params) {
                    if (params.node.data.EffDt !== undefined && params.node.data.EffDt !== null)
                        return moment(params.node.data.EffDt).format('L');
                },
                valueGetter: function (params) { return moment(params.node.data.EffDt) }, //date filter needs js date object			
                sort: 'desc',
                menuTabs: [],
            },
            {
                headerName: 'Items', width: 60,
                cellRenderer: ItemCount,
                valueGetter: function (params) {
                    return (params.data.HabitatItems !== undefined && params.data.HabitatItems.length > 0) ? params.data.HabitatItems.length : 0;
                },
                menuTabs: [],
            },
            {
                field: 'ProjectStartDate', headerName: 'Start Date', width: 150,
                valueFormatter: function (params) {
                    if (params.node.data.ProjectStartDate !== undefined && params.node.data.ProjectStartDate !== null)
                        return moment(params.node.data.ProjectStartDate).format('L');
                },
                valueGetter: function (params) { return moment(params.node.data.ProjectStartDate) }, //date filter needs js date object			
                filter: 'date',
                menuTabs: ['filterMenuTab'],

            },
            {
                field: 'ProjectEndDate', headerName: 'End Date', width: 150,
                valueFormatter: function (params) {
                    if (params.node.data.ProjectEndDate !== undefined && params.node.data.ProjectEndDate !== null)
                        return moment(params.node.data.ProjectEndDate).format('L');
                },
                valueGetter: function (params) { return (params.node.data.ProjectEndDate) ? moment(params.node.data.ProjectEndDate) : null }, //date filter needs js date object
                filter: 'date',
                menuTabs: ['filterMenuTab'],
            },
        ];

        //details for the correspondence
        var detailColumnDefs = [
            //{ headerName: '', width: 100, cellRenderer: EditDetailLinksTemplate, menuTabs: [], }, 
            { headerName: 'Item Type', field: 'ItemType', cellClass: 'item-record-cell', width: 100, menuTabs: ['filterMenuTab'], },
            { headerName: 'Item Name', field: 'ItemName', cellClass: 'item-record-cell', width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: 'Documents', field: 'ItemFiles', width: 300, cellRenderer: FileListCellTemplate, menuTabs: [], },
            { headerName: 'External Links', field: 'ExternalLinks', cellClass: 'item-record-cell', width: 250, menuTabs: [], },
            {
                field: 'EffDt',
                headerName: 'Updated',
                width: 150,
                valueFormatter: function (params) {
                    if (params.node.data.EffDt !== undefined && params.node.data.EffDt !== null)
                        return moment(params.node.data.EffDt).format('L');
                },
                menuTabs: [],
            },
        ];

        //detail grid options correspondence events
        scope.sitesDetailGridOptions = {
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            //rowSelection: 'single',
            //onSelectionChanged: function (params) {
            //    console.log("selection changed!");
            //scope.sitesGridOptions.selectedItems = scope.sitesGridOptions.api.getSelectedRows();
            //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            //},
            //onFilterModified: function () {
            //    scope.sitesGridOptions.api.deselectAll();
            //},
            //selectedItems: [],
            //rowData: eventRecords,
            columnDefs: detailColumnDefs,
            //onGridReady: function (params) {
                //setTimeout(function () { params.api.sizeColumnsToFit(); }, 0);
            //},
            
            getRowHeight: function (params) {
                var file_height = 25 * (scope.getFilesArrayAsList(params.node.data.ItemFiles).length); //count up the number of file lines we will have.
                return (file_height > 25) ? file_height : 25;
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



        scope.sitesGridOptions = {
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: scope.sitesDetailGridOptions,
                getDetailRowData: function (params) {
                    params.successCallback(params.data.HabitatItems);
                },
            },

            animateRows: true,
            enableSorting: true,
            enableFilter: true, 
            enableColResize: true,
            showToolPanel: false,
            columnDefs: scope.sitesColumnDefs,
            rowData: null,
            //filterParams: { apply: true }, //enable option: doesn't do the filter unless you click apply
            //debug: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed fired!");
                
                var rows = scope.sitesGridOptions.api.getSelectedRows();

                if (Array.isArray(rows) && rows[0] != null)
                {
                    console.log("rows:");
                    console.dir(rows);
                }
                
            },
            //onFilterModified: function () {
            //    scope.sitesGridOptions.api.deselectAll();
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
                scope.sitesGridOptions.api.collapseAll();
                row.node.setSelected(true);
                row.node.setExpanded(true);
            },
            onRowClicked: function (row) {
                row.node.setSelected(true);
            },
        };




        //do we need this? was set when the project was loaded
        /*************************************************************/
        // Need this section for the subprojects in Habitat and CRPP to work properly.
        //scope.subprojectType = $rootScope.subprojectType = ProjectService.getProjectType(scope.project.Id);
        //console.log("scope.subprojectType = " + scope.subprojectType);
        //SubprojectService.setServiceSubprojectType(scope.subprojectType);
		/*************************************************************/




        //watch the project on the parent-detail page to load... once it does, check to see if we should show our tab
        var sites_ds_watcher = scope.$parent.$watch('project', function () {
            //console.log("Inside TAB SITES watch project... --------------------------");

            if (typeof scope.project === 'undefined' || typeof scope.project.Id === 'undefined')
                return;

            sites_ds_watcher(); //turn off the watcher.

            //console.log("Woohoo! are we habitat project?");
            //console.dir(scope.project);
                
            if (isHabitatProject(scope.project)) {
                console.log("Turning on Sites tab because we are a habitat project...");
                scope.$parent.ShowHabitat = true; //need to update parent scope for the map to show.

                $timeout(function () {

                    var ag_grid_div = document.querySelector('#hab-sites-grid');    //get the container id...
                    //console.dir(ag_grid_div);
                    scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.sitesGridOptions); //bind the grid to it.
                    scope.sitesGridOptions.api.showLoadingOverlay(); //show loading...

                    scope.subprojectList = SubprojectService.getProjectSubprojects(scope.project.Id); //the habitat subprojects
                    //console.log("Fetching Habitat subprojects...");

                    //if user can edit, unhide the edit links
                    if (scope.canEdit(scope.project)) {
                        scope.sitesGridOptions.columnApi.setColumnVisible("EditLinksMaster", true);
                        scope.sitesDetailGridOptions.columnDefs.unshift({ colId: 'EditLinksDetail', cellRenderer: EditDetailLinksTemplate, width: 100, menuTabs: [] }); //add this column to the front of the detail grid cols
                    }

                    //ok let's watch for when the subprojects come back and we can load the other things we need.
                    var watcher = scope.$watch('subprojectList.length', function () {
                        if (scope.subprojectList === undefined || scope.subprojectList == null)
                            return;

                        //console.log("our subproject list is back! we have " + scope.subprojectList.length + " of them.");

                        //if there are no subprojects then don't show any points on the map.
                        if (scope.subprojectList.length === 0) {
                            if (scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById')) {
                                //scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
                                // Note:  If we sent an empty list, it pulls all the locations.
                                // If we supply an Id that we know does not exist (0), we get no locations, which is what we want.
                                scope.map.locationLayer.showLocationsById(0); //
                            }
                            return;
                        }

                        //build the grid based on our subprojects
                        scope.sitesGridOptions.api.setRowData(scope.subprojectList);

                        //console.log("ok now firing off the habitat subproject parts loading...");
                        scope.refreshSubprojectLists();

                        watcher();
                    });
                },0);

            } else {
                console.log(" we are NOT a habitat project so no Sites tab.");
            }

        }, true);


        scope.matchLocationsToSubprojects = function () {

            scope.thisProjectsLocationObjects = []; // Dump this list, before refilling it.
            angular.forEach(scope.subprojectList, function (subproject) {

                angular.forEach(scope.project.Locations, function (location, key) {
                    //console.log("location key = " + key);
                    //console.log("location is next...");
                    //console.dir(location);

                    // We will show the Primary Project Location, and the locations of the subprojects.
                    //if ((location.LocationTypeId === 3) || (subproject.Id === location.SubprojectId))
                    //console.log("location.LocationTypeId = " +  location.LocationTypeId + ", subproject.LocationId = " + subproject.LocationId + ", location.Id = " + location.Id);
                    if (subproject.LocationId === location.Id) {
                        //console.log("Found a subproject location")
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
            if(scope.map !== undefined)
                scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
        };

        //looks like we will need a version of this over on the crpp correspondence tab? TODO:kb 11/21/17
        //spin through all of the subprojects and add a ItemFiles object that contains its files.
        scope.matchFilesToSubproject = function () {

            //iterate all subprojects and find all the mathing files
            angular.forEach(scope.subprojectList, function (subproject) {

                if (!subproject.Files)
                    subproject.Files = [];

                angular.forEach(scope.project.SubprojectFileList, function (spFile) {

                    //is the file in this subproject?
                    if ((subproject.Id === spFile.Subproject_CrppId))
                    {
                        if (spFile.FeatureImage === 0)
                        {
                            subproject.Files.push(spFile);
                        }
                    }
                    /* delete me
                    if ((subproject.Id === spFile.Subproject_CrppId) && (spFile.FeatureImage === 1)) {
                        //angular.forEach(scope.project.Files, function(pFile){
                        //	if (pFile.Id === spFile.FileId)
                        //		subproject.ItemFiles = angular.copy(pFile);
                        //});
                        if (!subproject.Files) {
                            subproject.Files = [];
                            subproject.Files.push(spFile);
                        }
                        else
                            subproject.Files = angular.copy(spFile);

                        //scope.viewSubproject.Files = subproject.Files;
                        //console.log("Matched subproject file...");
                    }
                    */
                });
            });

            $rootScope.SubprojectFileList = scope.project.SubprojectFileList; //??
        };

        scope.matchFundersToSubproject = function () {
            //console.log("Inside controllers.js, scope.matchFundersToSubproject...");
            //console.dir(scope.project.FunderList);

            var strFunders = "";
            angular.forEach(scope.subprojectList, function (subproject) {
                strFunders = "";
                angular.forEach(scope.project.FunderList, function (funder) {
                    if (funder.SubprojectId === subproject.Id) {
                        strFunders += funder.Name + ", " + funder.Amount + ";\n";
                    }
                });
                subproject.strFunders = strFunders;
            });
        };

        scope.matchCollaboratorToSubproject = function () {
            //console.log("Inside controllers.js, scope.matchCollaboratorToSubproject...");
            //console.dir(scope.project.CollaboratorList);

            var strCollaborators = "";
            angular.forEach(scope.subprojectList, function (subproject) {
                strCollaborators = "";
                angular.forEach(scope.project.CollaboratorList, function (collaborator) {
                    if (collaborator.SubprojectId === subproject.Id) {
                        strCollaborators += collaborator.Name + ";\n";
                    }
                });
                subproject.strCollaborators = strCollaborators;
            });
        };


        //open the habitat item form for creating (if hi_row is {}) or editing (if hi_row is the habitat item)
        scope.openHabitatItemForm = function (subproject, hi_row) {
            //console.log("Inside openHabitatItemForm...")
            //console.dir(scope);

            scope.viewSubproject = subproject;
            scope.hi_row = hi_row;

            var modalInstance = $modal.open({
                templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-new-habitatItem.html',
                controller: 'ModalAddHabitatItemCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        scope.openGeospatialDataPage = function () {
            //console.log("Inside openGeospatialDataPage...");

            var strUrl = "http://ctuirgis.maps.arcgis.com/apps/webappviewer/index.html?id=1669df9b26874c9eb49cc41ec4d57ec5";
            //var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";			
            var strWindowFeatures = "location=yes,scrollbars=yes,status=yes";
            $window.open(strUrl, "_blank", strWindowFeatures);
        };


        //after we remove one in the modal, call here to update the grid.
        scope.postRemoveHabitatSubprojectUpdateGrid = function () {
            //the scope.viewSubproject is the one we removed.
            //console.log("ok - we removed one so update the grid...");

            scope.subprojectList.forEach(function (item, index) {
                if (item.Id === scope.viewSubproject.Id) {
                    scope.subprojectList.splice(index, 1);
                    //console.log("ok we removed :" + index);
                    //console.dir(scope.subprojectList[index]);
                    scope.sitesGridOptions.api.setRowData(scope.subprojectList);
                    //scope.sitesGridOptions.api.redrawRows();
                    //console.log("done reloading grid.");
                }
            });
        };

        //called by the modal once the habitat item is successfully saved.
        scope.postEditHabitatItemUpdateGrid = function (edited_item) {
            //console.log("postEditHabitatItemUpdateGrid..." + edited_item.Id + " for subproject " + edited_item.SubprojectId);

            //edit our correspondence item and then reload the grid.
            scope.subprojectList.forEach(function (item, index) {
                if (item.Id === edited_item.SubprojectId) {
                    item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort. - this was already updated in the be
                    item.HabitatItems.forEach(function (hab_item, hab_item_index) {
                        if (hab_item.Id === edited_item.Id) {
                            angular.extend(hab_item, edited_item); //replace the data for that item
                            //console.log("OK!! we edited that habitat item");
                        }
                    });
                }
            });

            scope.sitesGridOptions.api.setRowData(scope.subprojectList);

            //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
            var the_node = scope.expandSubProjectById(edited_item.SubprojectId);
            if (the_node != null)
                scope.sitesGridOptions.api.ensureNodeVisible(the_node);

            console.log("done reloading grid after removing item.");

        };

        //called by the modal once a habitat item is saved
        scope.postAddHabitatItemUpdateGrid = function (new_item) {
            //console.dir(new_item);
            //console.log("saving habitat item for " + new_item.SubprojectId);

            var subproject = getById(scope.subprojectList, new_item.SubprojectId);

            if (subproject === undefined || subproject == null) { //TODO: the case where they create items before the proejct is saved?
                console.log("no subproject...");
            } else {
                scope.subprojectList.forEach(function (item, index) {
                    if (item.Id === subproject.Id) {
                        item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort - this was already updated in the be
                        item.HabitatItems.push(new_item);
                        console.log("Added item " + new_item.Id + " to " + subproject.Id);
                    }
                });
                scope.sitesGridOptions.api.setRowData(scope.subprojectList);

                //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                var the_node = scope.expandSubProjectById(subproject.Id);
                if (the_node != null)
                    scope.sitesGridOptions.api.ensureNodeVisible(the_node);

                console.log("done reloading grid after removing item.");
            }
        };

        //returns the (last) node or null if none found.
        scope.expandSubProjectById = function (id_in) {
            var the_node = null;
            scope.sitesGridOptions.api.forEachNode(function (node) {
                if (node.data.Id === id_in) {
                    //console.log("Expanding! " + id_in);
                    node.setExpanded(true);
                    the_node = node;
                }
            });
            return the_node;
        };

        //removes the habitat item and then updates the grid
        scope.removeHabitatFileItem = function (subproject, in_item) {
            //console.log("removeHabitatFileItem..." + in_item.Id + " for subproject " + subproject.Id);

            if (confirm('Are you sure that you want to delete this Habitat Item?')) {
                var promise = SubprojectService.removeHabitatItem(scope.project.Id, subproject.Id, in_item.Id, scope.DatastoreTablePrefix);

                promise.$promise.then(function () {
                    //remove from our subprojectList and then reload the grid.
                    scope.subprojectList.forEach(function (item, index) {
                        if (item.Id === subproject.Id) {
                            item.HabitatItems.forEach(function (hab_item, hab_item_index) {
                                if (hab_item.Id === in_item.Id) {
                                    item.HabitatItems.splice(hab_item_index, 1);
                                    //console.log("OK!! we removed that habitat item");
                                }
                            });
                        }
                    });
                    scope.sitesGridOptions.api.setRowData(scope.subprojectList);

                    //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                    var the_node = scope.expandSubProjectById(subproject.Id);
                    if (the_node != null)
                        scope.sitesGridOptions.api.ensureNodeVisible(the_node);

                    console.log("done reloading grid after removing item.");
                });
            }
        };



        scope.removeHabitatSubproject = function (subproject) {
            //console.log("Inside removeHabitatSubproject, scope is next...");

            if (!subproject)
                return;

            scope.viewSubproject = subproject;

            //console.log("removing scope.projectId = " + scope.projectId);
            if (scope.viewSubproject.HabitatItems.length > 0) {
                alert("This project has associated Habitat items.  Those must be deleted first.");
            }
            else {
                scope.verifyAction = "Delete";
                scope.verifyingCaller = "HabSubproject";
                //console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " + scope.viewSubproject.Id);
                var modalInstance = $modal.open({
                    templateUrl: 'app/core/common/components/modals/templates/modal-verifyAction.html',
                    controller: 'ModalVerifyActionCtrl',
                    scope: scope, //very important to pass the scope along...
                });
            }
            
        };

        scope.createHabSubproject = function () {
            scope.viewSubproject = null;
            scope.createNewSubproject = true;
            //scope.subprojectList = null;
            scope.subprojectOptions = null;
            //console.log("scope.createNewSubproject = " + scope.createNewSubproject);
            var modalInstance = $modal.open({
                templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-create-habSubproject.html',
                controller: 'ModalCreateHabSubprojectCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        

        //refresh all of the project match lists
        scope.refreshSubprojectLists = function () {
            // Call the functions that will build the list of funders, and list of files related to the project.
            // We add the items from these lists to the subproject -- as the data comes in.
            scope.project.SubprojectFileList = SubprojectService.getSubprojectFiles(scope.projectId); //TODO: we already have this as scope.project.SubprojectFiles once the files load in project-detail.js
            scope.project.FunderList = ProjectService.getProjectFunders(scope.projectId);
            scope.project.CollaboratorList = ProjectService.getProjectCollaborators(scope.projectId);

            //this one we can start right away since project locations are loaded with the project.
            scope.matchLocationsToSubprojects();

            //do each match as the list finishes loading...
            scope.project.SubprojectFileList.$promise.then(function () {
                //console.log(" -- ok done loading now matching SubprojectFileList for " + scope.project.SubprojectFileList.length);
                scope.matchFilesToSubproject();
            });

            scope.project.FunderList.$promise.then(function () {
                //console.log(" -- ok done loading now matching FunderList for " + scope.project.FunderList.length);
                scope.matchFundersToSubproject();
            });

            scope.project.CollaboratorList.$promise.then(function () {
                //console.log(" -- ok done loading now matching CollaboratorList for " + scope.project.CollaboratorList.length);
                scope.matchCollaboratorToSubproject();
            });
        };

        //fired after a user saves a new or edited project.
        // we update the item in the main subproject array and then refresh the grid.
        scope.postSaveHabitatSubprojectUpdateGrid = function (the_promise) {
            //console.log("ok - we saved so update the grid...");
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
                    //console.log("ok we found a match! -- updating! after:");
                    //console.dir(scope.subprojectList[index]);
                    scope.sitesGridOptions.api.redrawRows();
                    //console.log("done reloading grid.");
                }
                count++;
                if (count == total && updated == false) //if we get all done and we never found it, lets add it to the end.
                {
                    //console.log("ok we found never a match! -- adding!");
                    the_promise.HabitatItems = [];
                    the_promise.Files = [];
                    scope.subprojectList.push(the_promise); //add that item
                    scope.sitesGridOptions.api.setRowData([]);
                    scope.sitesGridOptions.api.setRowData(scope.subprojectList);

                    //console.log("done reloading grid.");
                }
            });

            console.log("updated the list and the grid... now refreshing the habitat lists");
            scope.refreshSubprojectLists(); //funders, collaborators, etc.

        };
        
        scope.addSubproject = function () {
            console.log("Inside controllers.addSubproject.");
            //console.log("scope is next...");
            //console.dir(scope);
            //console.log("scope.selectedSubproject is next...");
            //console.dir(scope.selectedSubproject);

            if (!scope.selectedSubproject || scope.selectedSubproject === null || getMatchingByField(scope.project.CrppSubProjects, scope.selectedSubproject, 'Id').length > 0)
                return;

            var theSubproject = getMatchingByField(scope.correspondenceProjectList, scope.selectedSubproject, 'Id');

            var promise = SubprojectService.saveSubproject(scope.project.Id, theSubproject[0]);

            promise.$promise.then(function () {
                scope.reloadProject();
            });
        };


        scope.editHabitatSubproject = function (subproject) {

            //console.log("Inside editHabitatSubproject...");

            scope.viewSubproject = subproject; //set this var for the modal controller.

            var modalInstance = $modal.open({
                templateUrl: 'app/private/habitat/components/habitat-sites/templates/modal-create-habSubproject.html',
                controller: 'ModalCreateHabSubprojectCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        //spin through subprojects and make a list of the locations that belong to one
        // then refresh the map.
        scope.reloadSubprojectLocations = function () {
            console.log("maybe not used?");
            console.log("Inside controllers.js, projectDatasetsController, scope.reloadSubprojectLocations...");

            scope.thisProjectsLocationObjects = []; // Dump this list, before refilling it.
            angular.forEach(scope.subprojectList, function (subproject) {
                angular.forEach(scope.project.Locations, function (location, key) {
                    //console.log("location key = " + key);
                    //console.log("location is next...");
                    //console.dir(location);

                    if (subproject.LocationId === location.Id)
                        scope.thisProjectsLocationObjects.push(location.SdeObjectId);

                });
            });
            //console.log("scope.thisProjectsLocationObjects is next...");
            //console.dir(scope.thisProjectsLocationObjects);

            if (scope.thisProjectsLocationObjects.length > 0) {
                if (scope.map && scope.map.locationLayer && scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                    scope.map.locationLayer.showLocationsById(scope.thisProjectsLocationObjects); //bump and reload the locations.
            }
            //else
            //{
            //	scope.map.locationLayer.showLocationsById(0);
            //}
        };

        scope.redrawRows = function () {
            scope.sitesGridOptions.api.setRowData([]);
            setTimeout(function () { scope.sitesGridOptions.api.setRowData(scope.subprojectList); }, 4000);


            //console.log("redrawrows!");
        };

        scope.refreshCells = function () {
            scope.sitesGridOptions.api.refreshCells();
            //console.log("refreshcells!");
        };

        scope.refreshMemory = function () {
            scope.sitesGridOptions.api.refreshInMemoryRowModel('group');
            //console.log("redrawgroupmodel!");
        };
      
    }
];
