//this is a nested controller used on the project-details page to load
// the instruments tab if it is a water temperature project. 

var tab_instruments = ['$scope', '$timeout','$routeParams', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$modal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, $timeout, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
        //console.log("Inside tab instruments controller...");

        scope.allInstruments = null;
        scope.getDataGrade = function (check) { return getDataGrade(check) }; //alias from service ?? TODO: check this kb/11/21
        scope.viewInstrument = null; //what they've clicked to view accuracy checks
        scope.selectedInstrument = null; //what they've selected in the dropdown to add to the project


        var CheckMethodRenderer = function (param) {
            return DataGradeMethods[param.data.CheckMethod]; //DataGradeMethods defined in config.js
        };

        var CheckDateRenderer = function (param) {
            return moment(param.data.CheckDate).format('L');
        };

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.editInstrument(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeInstrument(param.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode("|"));

            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add AC';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openAccuracyCheckForm(param.data, {});
            });
            div.appendChild(addBtn);

            return div;
        };

        var EditDetailLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openAccuracyCheckForm(getById(scope.project.Instruments, param.data.InstrumentId), param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeAccuracyCheck(param.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode("|"));

            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openAccuracyCheckForm(getById(scope.project.Instruments, param.data.InstrumentId), {});
            });
            div.appendChild(addBtn);

            return div;
        };

        //Instrument Accuracy Checks
        var instrDetailColDefs = [
            //{ colId: 'EditLinksDetail', cellRenderer: EditDetailLinksTemplate, width: 100, menuTabs: [], hide: true },
            { field: 'CheckDate', headerName: 'Check Date', width: 100, sort: 'desc', cellRenderer: CheckDateRenderer, menuTabs: []},
            { field: 'CheckMethod', headerName: 'Check Method', cellRenderer: CheckMethodRenderer, width: 230, menuTabs: ['filterMenuTab'] },
            { field: 'Bath1Grade', headerName: 'Bath 1 Grade', width: 100, menuTabs: ['filterMenuTab'] },
            { field: 'Bath2Grade', headerName: 'Bath 2 Grade', width: 100, menuTabs: ['filterMenuTab'] },
            { field: 'Comments', headerName: 'Comments', width: 275, menuTabs: [] },
        ];

        scope.instrDetailGridOptions = {
                enableSorting: true,
                enableFilter: true,
                enableColResize: true,
                columnDefs: instrDetailColDefs,
        };

        ///////////////instruments grid
        scope.instrGridOptions = {
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: scope.instrDetailGridOptions,
                getDetailRowData: function (params) {
                    params.successCallback(params.data.AccuracyChecks);
                },
            },
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed!");
                scope.instrGridOptions.selectedItems = scope.instrGridOptions.api.getSelectedRows();
                //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            onFilterModified: function () {
                scope.instrGridOptions.api.deselectAll();
            },
            selectedItems: [],
            columnDefs:
            [
                { colId: 'EditLinksMaster', cellRenderer: EditLinksTemplate, width: 120, menuTabs: [], hide: true },
                { field: 'Name', headerName: 'Name', width: 250, sort: 'asc', menuTabs: ['filterMenuTab'], filter: 'text', cellRenderer: 'group' },
                { field: 'SerialNumber', headerName: 'SerialNumber', width: 120, menuTabs: ['filterMenuTab'], filter: 'text'},
                { field: 'Manufacturer', headerName: 'Manufacturer', width: 150, menuTabs: ['filterMenuTab'], },
                { field: 'Model', headerName: 'Model', width: 150, menuTabs: ['filterMenuTab'], },
                { field: 'InstrumentType.Name', headerName: 'Type', menuTabs: ['filterMenuTab'], },
                //{ field: 'OwningDepartment.Name', headerName: 'Owner', width: 250, menuTabs: ['filterMenuTab'], },
                
                
            ]
        };

        

        
        //watch the datasets on the parent-detail page to load... once they do, check to see if we should show our tab
        var inst_ds_watcher = scope.$parent.$watch('datasets', function () {
            //console.log("Inside TAB INSTRUMENTS watch datasets... --------------------------");

            //console.log("parent datasets");
            //console.dir(scope.$parent.datasets);
            //console.log("our datasets");
            //console.dir(scope.datasets);

            if (scope.datasets === undefined || scope.datasets.length === 0)
                return;

            //console.log("OK TAB INSTRUMENTS .  The datasets are loaded...");

            //scope.datasets = scope.$parent.datasets; //but i dont' want to do this.

            inst_ds_watcher(); //turn off watcher

            // Moved this block over to project-detail.js, in the users watch.
            // This part was running before user results were back yet.
            /*for (var i = 0; i < scope.datasets.length; i++) { //look through the datasets for one of ours.

                //console.log("Woohoo! are we water tempproject?"); //TODO!! don't look at the dataset, look at the project type
                //console.dir(scope.project);

                if (scope.datasets[i].Datastore.TablePrefix === "WaterTemp") {
                    console.log("Adding instruments to tab bar...");
                    console.log("scope is next...");
                    console.dir(scope);
                    //scope.ShowInstruments = true;

                    if ((scope.currentUserId === scope.project.OwnerId) || scope.UserIsEditor || scope.UserIsAdmin)
                        scope.ShowInstruments = true;
                }
            }
            */
        }, true);

        //when the parent project is loaded...
        scope.$parent.$watch('project.Id', function () {

            if (typeof scope.project === 'undefined' || typeof scope.project.Id === 'undefined')
                return;

            console.log("project done loading: your project instruments:-------------------- *************************");
            console.dir(scope.project.Instruments);

            $timeout(function () {

                var ag_grid_div = document.querySelector('#instruments-tab-grid');    //get the container id...
                scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.instrGridOptions); //bind the grid to it.
                scope.instrGridOptions.api.showLoadingOverlay(); //show loading...

                //build the grid based on our subprojects
                scope.instrGridOptions.api.setRowData(scope.project.Instruments);

                //if user can edit, unhide the edit links
                if (scope.canEdit(scope.project)) {
                    scope.instrGridOptions.columnApi.setColumnVisible("EditLinksMaster", true);
                    scope.instrDetailGridOptions.columnDefs.unshift({ colId: 'EditLinksDetail', cellRenderer: EditDetailLinksTemplate, width: 100, menuTabs: [] }); //add this column to the front of the detail grid cols
                }
                
            }, 0);

            //these are the ones that show up in the dropdown list to select from -- ALL the instruments in the world.
            scope.allInstruments = ProjectService.getAllInstruments();

            //filter and only show instruments not already in our project.
            scope.allInstruments.$promise.then(function () {    
                scope.filterAllInstruments();
            });


            //console.log("Parent project is loaded! watching from instruments tab ---------------- >>>>>>>>>>>>>>");

            //reload if it is already selected -- this is what allows you to see the new accuracycheck/characteristic immediately after it is added
            //if (scope.viewInstrument)
            //{
            //    scope.viewInstrument = getMatchingByField(scope.project.Instruments, scope.viewInstrument.Id, 'Id')[0];
            //}
        });

        scope.createInstrument = function () {
            scope.viewInstrument = null;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
                controller: 'ModalCreateInstrumentCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };


        scope.viewSelectedInstrument = function (instrument) {
            scope.viewInstrument = instrument;
        };

        scope.addInstrument = function () {
			/* Verify that situations are true:
			*  scope.selectedInstrument exists				This is important because IE will not actually select something, when you select it the first time.
			*  scope.selectedInstrument is not null			Important for the same reason just mentioned.
			*/
            if (!scope.selectedInstrument || scope.selectedInstrument === null )
            {
                alert("Please select an Instrument from the dropdown to add to this project."); 
                return;
            }

            var instrument_to_add = getById(scope.allInstruments, scope.selectedInstrument)
            var promise = ProjectService.saveProjectInstrument(scope.project.Id, instrument_to_add);

            promise.$promise.then(function () {
                //done, add it to the list.
                scope.project.Instruments.push(instrument_to_add);
                scope.filterAllInstruments();
                scope.instrGridOptions.api.setRowData(scope.project.Instruments);
            });
        };

        scope.removeInstrument = function (instrument) {
            scope.viewInstrument = instrument;
            if (!scope.viewInstrument)
                return;

            if (confirm("Are you sure you want to remove this Instrument from this Project?")) {
                var promise = ProjectService.removeProjectInstrument(scope.project.Id, scope.viewInstrument.Id);

                promise.$promise.then(function () {
                    scope.project.Instruments.forEach(function (item, index) {
                        if (item.Id === scope.viewInstrument.Id) {
                            scope.project.Instruments.splice(index, 1);
                            scope.instrGridOptions.api.setRowData(scope.project.Instruments);
                            scope.allInstruments.push(instrument);
                            scope.filterAllInstruments();
                        }
                    });
                });
            }
        };

        scope.removeAccuracyCheck = function (ac) {

            var instrument = getById(scope.project.Instruments, ac.InstrumentId);
            if (typeof instrument === 'undefined') {
                alert("Cannot remove that Accuracy Check. Can't find related instrument. Please share this error with your administrator.");
                return;
            }

            if (confirm("Are you sure you want to remove this Accuracy Check from this Instrument?")) {
                
                var promise = ProjectService.removeInstrumentAccuracyCheck(ac.InstrumentId, ac);

                promise.$promise.then(function () {
                    instrument.AccuracyChecks.forEach(function (item, index) {
                        if (item.Id === ac.Id) {
                            instrument.AccuracyChecks.splice(index, 1);
                            scope.instrGridOptions.api.setRowData(scope.project.Instruments);
                            var the_node = scope.expandById(ac.InstrumentId);
                            if (the_node != null)
                                scope.instrGridOptions.api.ensureNodeVisible(the_node);
                        }
                    });
                });
            }
        };

        scope.editInstrument = function (instrument) {

            scope.viewInstrument = instrument;

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-create-instrument.html',
                controller: 'ModalCreateInstrumentCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        //fired after a user saves a new or edited instrument
        // we update the item in project's instruments then refresh the grid.
        scope.postSaveInstrumentUpdateGrid = function (the_promise) {
            //console.log("ok - we saved so update the grid...");
            var total = scope.project.Instruments.length;
            var count = 0;
            var updated = false;
            scope.project.Instruments.forEach(function (item, index) {
                if (item.Id === the_promise.Id) {
                    updated = true;

                    //console.log("ok we found a match! -- updating! before:");
                    //console.dir(scope.subprojectList[index]);

                    if (the_promise.AccuracyChecks !== undefined)
                        delete the_promise.AccuracyChecks; //remove this before the copy.

                    angular.extend(scope.project.Instruments[index], the_promise); //replace the data for that item
                    //console.log("ok we found a match! -- updating! after:");
                    scope.instrGridOptions.api.redrawRows();
                    console.log("done reloading grid after editing an instrument.");
                }
                count++;
                if (count == total && updated == false) //if we get all done and we never found it, lets add it to the end.
                {
                    //console.log("ok we found never a match! -- adding!");
                    the_promise.AccuracyChecks = [];
                    scope.project.Instruments.push(the_promise); //add that item
                    scope.instrGridOptions.api.setRowData([]);
                    scope.instrGridOptions.api.setRowData(scope.project.Instruments);

                    console.log("done reloading grid after adding an instrument.");
                }
            });

            console.log("updated the list and the grid... now refreshing the instrument lists");
            //scope.refreshSubprojectLists(); //funders, collaborators, etc.

        };


        //returns the (last) node or null if none found.
        scope.expandById = function (id_in) {
            var the_node = null;
            scope.instrGridOptions.api.forEachNode(function (node) {
                if (node.data.Id === id_in) {
                    //console.log("Expanding! " + id_in);
                    node.setExpanded(true);
                    the_node = node;
                }
            });
            return the_node;
        };




        //called by the modal once the instrument accuracy check is successfully saved.
        scope.postInstrumentAccuracyCheckUpdateGrid = function (edited_item) {
            //edit our instrument's accuracy check and then reload the grid.
            var edited = false;
            scope.project.Instruments.forEach(function (item, index) {
                if (item.Id === edited_item.InstrumentId) {
                    item.AccuracyChecks.forEach(function (instr_item, instr_item_index) {
                        if (instr_item.Id === edited_item.Id) {
                            angular.extend(instr_item, edited_item); //replace the data for that item
                            console.log("OK!! we edited that accuracy check item");
                            edited = true;
                        }
                    });
                    if (!edited) {
                        item.AccuracyChecks.push(edited_item);
                        console.log("OK we added that accuracy check item!");
                    }
                }
            });
            

            scope.instrGridOptions.api.setRowData(scope.project.Instruments);

            //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
            var the_node = scope.expandById(edited_item.InstrumentId);
            if (the_node != null)
                scope.instrGridOptions.api.ensureNodeVisible(the_node);

            console.log("done reloading grid after editing accuracy check item.");

        };

        scope.openAccuracyCheckForm = function (a_instrument, ac_row) {

            scope.viewInstrument = a_instrument;
            console.dir(a_instrument);

            if (ac_row)
                scope.ac_row = ac_row;
            else
                scope.ac_row = {};

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-new-accuracycheck.html',
                controller: 'ModalAddAccuracyCheckCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        scope.filterAllInstruments = function () {
            var filteredInstruments = [];
            scope.allInstruments.forEach(function (item, index) {
                var have_instrument = getById(scope.project.Instruments, item.Id);
                if (typeof have_instrument === 'undefined' || have_instrument == null) {
                    filteredInstruments.push(item);
                }
            });
            scope.allInstruments = filteredInstruments.sort(orderByAlphaName);
        };

}];
